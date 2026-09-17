"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flame
} from "lucide-react";
import { FaWhatsapp, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NewsletterIssue, DEFAULT_NEWSLETTERS } from "@/lib/newsletter";
import {
  YellowHexagon,
  BlueWavyRosette,
  PeriwinkleDome,
  OrangeClover
} from "@/components/newsletter/NewsletterShapes";
import NewsletterBackgroundElements from "@/components/newsletter/NewsletterBackgroundElements";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NewsletterIssueReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [issue, setIssue] = useState<NewsletterIssue | null>(null);
  const [allIssues, setAllIssues] = useState<NewsletterIssue[]>(DEFAULT_NEWSLETTERS);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Bottom subscribe box
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true);

      const defaultMatch = DEFAULT_NEWSLETTERS.find(
        (i) => i.slug === slug || i.id === slug || `issue-${i.issueNumber}` === slug
      );

      try {
        const q = query(collection(db, "newsletters"), where("slug", "==", slug));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docData = snap.docs[0].data() as any;
          setIssue({ id: snap.docs[0].id, ...docData });
        } else if (defaultMatch) {
          setIssue(defaultMatch);
        } else {
          setIssue(null);
        }
      } catch (err) {
        console.warn("Firestore fetch error, using default fallback:", err);
        if (defaultMatch) setIssue(defaultMatch);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchIssue();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"]
        });
      } catch {}
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setSubscribing(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: `newsletter_reader_${slug}` }),
      });
      setSubscribed(true);
      setEmail("");
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"]
        });
      } catch {}
    } catch {
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e4] flex items-center justify-center p-6 text-[#2c2e2a]">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-full border border-[#d5d5d4] shadow-xs">
          <div className="w-4 h-4 border-2 border-[#2c2e2a]/30 border-t-[#2c2e2a] rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading newsletter edition...</span>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#f5f1e4] flex items-center justify-center p-6 text-[#2c2e2a]">
        <div className="bg-white border border-[#d5d5d4] p-8 rounded-[32px] max-w-md w-full text-center space-y-4 shadow-sm">
          <BookOpen className="w-10 h-10 text-[#80827f] mx-auto" />
          <h2 className="text-xl font-bold">Issue Not Found</h2>
          <p className="text-xs text-[#80827f]">
            The requested newsletter edition does not exist or may have been archived.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2c2e2a] text-white text-xs font-semibold rounded-full hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Newsletter Hub
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${issue.title} — via GDG AJCE Tech Pulse`);

  // Find next and previous issues
  const sorted = [...DEFAULT_NEWSLETTERS].sort((a, b) => a.issueNumber - b.issueNumber);
  const currentIndex = sorted.findIndex((i) => i.issueNumber === issue.issueNumber);
  const prevIssue = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextIssue = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  return (
    <div className="relative min-h-screen bg-[#f5f1e4] text-[#2c2e2a] pt-28 sm:pt-36 pb-28 px-4 sm:px-6 md:px-8 overflow-x-hidden select-none">
      {/* Reading Progress Top Bar */}
      <div
        className="fixed top-0 left-0 h-[4px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Background Lines, Curves & Ambient Elements */}
      <NewsletterBackgroundElements />

      {/* Floating Ambient Shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-24 -left-6 opacity-60">
          <YellowHexagon />
        </div>
        <div className="absolute top-48 -right-6 opacity-60">
          <BlueWavyRosette />
        </div>
        <div className="absolute top-[800px] -left-8 opacity-50">
          <PeriwinkleDome />
        </div>
        <div className="absolute top-[1200px] -right-8 opacity-50">
          <OrangeClover />
        </div>
      </div>

      <div className="relative z-10 max-w-[860px] mx-auto space-y-8">
        
        {/* TOP BAR / BACK LINK & SHARE ICONS */}
        <div className="flex items-center justify-between">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#80827f] hover:text-[#2c2e2a] transition px-3.5 py-2 rounded-full bg-white/70 border border-[#d5d5d4] hover:bg-white shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Newsletter Issues</span>
          </Link>

          {/* Social Share Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="w-9 h-9 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:border-[#2c2e2a] transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#34A853]" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on WhatsApp"
              className="w-9 h-9 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#25D366] hover:border-[#25D366] transition shadow-2xs"
            >
              <FaWhatsapp className="w-4 h-4" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X"
              className="w-9 h-9 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:border-[#2c2e2a] transition shadow-2xs"
            >
              <FaXTwitter className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on LinkedIn"
              className="w-9 h-9 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#0A66C2] hover:border-[#0A66C2] transition shadow-2xs"
            >
              <FaLinkedinIn className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* MAIN ARTICLE CANVAS */}
        <article className="bg-[#ffffff] border border-[#d5d5d4] rounded-[36px] sm:rounded-[44px] overflow-hidden shadow-xs relative">
          {/* Top Google 4-Color Accent Line */}
          <div className="h-[5px] w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-50%-[#FBBC04] to-[#34A853]" />

          {/* Article Header */}
          <header className="p-6 sm:p-12 pb-8 sm:pb-8 border-b border-[#f1efe8]">
            <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
              <span className="px-3 py-1 rounded-full bg-[#f5f1e4] text-[#4285F4] font-bold font-mono border border-[#e5e1d5]">
                Issue #{issue.issueNumber}
              </span>
              <span className="text-[#80827f] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(issue.publishedAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-[#80827f] flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {issue.readTime}
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[40px] md:text-[46px] font-bold text-[#2c2e2a] leading-[1.08] tracking-[-0.035em] mb-4">
              {issue.title}
            </h1>

            <p className="text-[16px] sm:text-[17px] text-[#80827f] leading-relaxed">
              {issue.summary}
            </p>

            {/* Author Attribution */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-[#f5f1e4]">
              <div className="w-10 h-10 rounded-full bg-[#2c2e2a] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
                GDG
              </div>
              <div>
                <p className="text-xs font-bold text-[#2c2e2a]">{issue.author?.name || "GDG AJCE Editorial Team"}</p>
                <p className="text-[11px] text-[#80827f]">{issue.author?.role || "Lead Tech Curators"}</p>
              </div>
            </div>
          </header>

          {/* Article Markdown Content */}
          <div className="p-6 sm:p-12 text-[#2c2e2a] text-[15px] sm:text-[16px] leading-[1.75] select-text">
            <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-h1:text-[26px] prose-h2:text-[20px] prose-h3:text-[17px] prose-a:text-[#4285F4] prose-pre:bg-[#1e201e] prose-pre:border prose-pre:border-[#383b38] prose-pre:text-gray-100 prose-pre:rounded-2xl prose-code:text-[#ea4335] prose-code:bg-[#f7f6f2] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-[#4285F4] prose-blockquote:bg-[#f7f9fe] prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {issue.markdownContent}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Footer & Tags */}
          <footer className="p-6 sm:p-12 pt-6 bg-[#fbfaf7] border-t border-[#f1efe8]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md bg-[#ffffff] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] hover:border-[#2c2e2a] transition cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#34A853]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Share Edition"}</span>
              </button>
            </div>
          </footer>
        </article>

        {/* ISSUE NAVIGATION (PREV / NEXT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevIssue ? (
            <Link
              href={`/newsletter/${prevIssue.slug}`}
              className="bg-white border border-[#d5d5d4] hover:border-[#2c2e2a] p-5 rounded-[24px] flex items-center gap-3 transition group shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5 text-[#80827f] group-hover:-translate-x-1 transition-transform" />
              <div>
                <span className="text-[11px] font-mono text-[#80827f] uppercase font-bold">Previous Issue</span>
                <p className="text-xs sm:text-sm font-bold text-[#2c2e2a] line-clamp-1">{prevIssue.title}</p>
              </div>
            </Link>
          ) : <div />}

          {nextIssue && (
            <Link
              href={`/newsletter/${nextIssue.slug}`}
              className="bg-white border border-[#d5d5d4] hover:border-[#2c2e2a] p-5 rounded-[24px] flex items-center justify-between gap-3 transition group shadow-2xs text-right sm:col-start-2"
            >
              <div>
                <span className="text-[11px] font-mono text-[#80827f] uppercase font-bold">Next Issue</span>
                <p className="text-xs sm:text-sm font-bold text-[#2c2e2a] line-clamp-1">{nextIssue.title}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#80827f] group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* BOTTOM INLINE SUBSCRIPTION CALLOUT */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[32px] p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#2c2e2a] tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <span>Enjoyed this briefing?</span>
                <Sparkles className="w-4 h-4 text-[#FBBC04]" />
              </h3>
              <p className="text-xs sm:text-sm text-[#80827f]">
                Get the next edition delivered straight to your email every Monday morning at 9:00 AM IST.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="px-4 py-3 bg-[#f5f1e4]/60 border border-[#d5d5d4] rounded-full text-xs text-[#2c2e2a] outline-none focus:border-[#2c2e2a] focus:bg-white w-full sm:w-64 transition"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 rounded-full bg-[#2c2e2a] hover:bg-[#1b1c19] text-white text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {subscribing ? "Subscribing..." : subscribed ? "Subscribed! 🎉" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
