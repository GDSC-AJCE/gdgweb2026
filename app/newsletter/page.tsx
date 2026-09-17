"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Mail,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Send,
  BookOpen,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Copy,
  X,
  Zap
} from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  NewsletterIssue,
  DEFAULT_NEWSLETTERS,
  NEWSLETTER_TOPICS,
  NewsletterTopic
} from "@/lib/newsletter";
import {
  YellowHexagon,
  BlueWavyRosette,
  PeriwinkleDome,
  OrangeClover,
  LimeClover,
  DaisyStarburst
} from "@/components/newsletter/NewsletterShapes";
import NewsletterBackgroundElements from "@/components/newsletter/NewsletterBackgroundElements";

export default function NewsletterHubPage() {
  const [issues, setIssues] = useState<NewsletterIssue[]>(DEFAULT_NEWSLETTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subscription state
  const [email, setEmail] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "ai_ml",
    "cloud",
    "web_android",
    "open_source",
    "campus"
  ]);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedMessage, setSubscribedMessage] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublishedIssues = async () => {
      try {
        const q = query(
          collection(db, "newsletters"),
          where("status", "==", "sent"),
          orderBy("publishedAt", "desc")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const fetched = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          })) as NewsletterIssue[];

          const merged = [...fetched];
          DEFAULT_NEWSLETTERS.forEach((def) => {
            if (!merged.some((m) => m.slug === def.slug || m.issueNumber === def.issueNumber)) {
              merged.push(def);
            }
          });
          merged.sort((a, b) => b.issueNumber - a.issueNumber);
          setIssues(merged);
        } else {
          const sorted = [...DEFAULT_NEWSLETTERS].sort((a, b) => b.issueNumber - a.issueNumber);
          setIssues(sorted);
        }
      } catch (err) {
        console.warn("Using default curated newsletters archive:", err);
        const sorted = [...DEFAULT_NEWSLETTERS].sort((a, b) => b.issueNumber - a.issueNumber);
        setIssues(sorted);
      }
    };

    fetchPublishedIssues();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#8ed462"]
      });
    } catch {}
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubscriptionError("Please enter a valid email address.");
      return;
    }

    setSubscribing(true);
    setSubscriptionError(null);
    setSubscribedMessage(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          topics: selectedTopics,
          source: "newsletter_hub_minimal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSubscribedMessage("You're in! Check your inbox for your welcome issue.");
      setEmail("");
      triggerConfetti();
    } catch (err: any) {
      setSubscriptionError(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/newsletter/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === "all" ||
      issue.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  const featuredIssue = issues[0] || DEFAULT_NEWSLETTERS[0];

  const tagFilters = [
    { id: "all", label: "All" },
    { id: "ai", label: "AI & ML" },
    { id: "cloud", label: "Cloud" },
    { id: "android", label: "Android & Flutter" },
    { id: "firebase", label: "Firebase" },
  ];

  return (
    <div className="relative min-h-screen bg-[#f5f1e4] text-[#2c2e2a] pt-28 sm:pt-36 pb-24 px-4 sm:px-6 md:px-8 select-none overflow-x-hidden">
      
      {/* Background Lines, Curves & Ambient Shapes */}
      <NewsletterBackgroundElements />

      {/* Subtle Ambient Background Charm Shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-12 left-4 sm:left-12 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
          <YellowHexagon />
        </div>
        <div className="absolute top-16 right-4 sm:right-14 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
          <BlueWavyRosette />
        </div>
        <div className="absolute top-[480px] -left-6 sm:left-8 pointer-events-auto opacity-60 hover:opacity-100 transition-opacity">
          <PeriwinkleDome />
        </div>
        <div className="absolute top-[520px] -right-6 sm:right-8 pointer-events-auto opacity-60 hover:opacity-100 transition-opacity">
          <OrangeClover />
        </div>
      </div>

      <div className="relative z-10 max-w-[880px] mx-auto space-y-16 sm:space-y-20">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: MINIMAL & ALIVE */}
        {/* ========================================================================= */}
        <section className="text-center space-y-6 pt-2 max-w-2xl mx-auto">
          {/* Animated Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d5d5d4] text-[12px] font-medium text-[#2c2e2a] shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" />
            <span className="font-semibold text-[#4285F4]">GDG Tech Pulse</span>
            <span className="text-[#80827f]">• Issue #{featuredIssue.issueNumber} Out Now</span>
          </motion.div>

          {/* Core Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[40px] sm:text-[54px] md:text-[62px] font-bold text-[#2c2e2a] tracking-[-0.04em] leading-[1.05]"
          >
            The weekly briefing <br />
            <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
              for curious developers.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[15px] sm:text-[17px] text-[#80827f] leading-relaxed max-w-xl mx-auto"
          >
            4 minutes of pure developer signal every Monday at 9:00 AM. 
            Google AI, Cloud architectures, mobile tooling, and campus codelabs. Zero marketing fluff.
          </motion.p>

          {/* ========================================================================= */}
          {/* MINIMAL SUBSCRIPTION INPUT BAR */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-2"
          >
            <div className="bg-white border border-[#d5d5d4] rounded-[28px] sm:rounded-full p-2 sm:p-2.5 shadow-sm hover:border-[#2c2e2a]/40 transition duration-200">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2.5 px-3.5 py-2 w-full sm:flex-1">
                  <Mail className="w-4 h-4 text-[#80827f] shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. alex@amaljyothi.ac.in)"
                    required
                    className="w-full bg-transparent text-xs sm:text-[14px] text-[#2c2e2a] placeholder-[#80827f] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowPreferences(!showPreferences)}
                    title="Customize topics"
                    className={`p-2.5 rounded-full border transition cursor-pointer text-xs flex items-center justify-center ${
                      showPreferences
                        ? "bg-[#2c2e2a] text-white border-[#2c2e2a]"
                        : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a] border-[#d5d5d4]"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="submit"
                    disabled={subscribing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2c2e2a] hover:bg-[#1b1c19] text-white text-xs font-bold transition active:scale-98 cursor-pointer disabled:opacity-60 shadow-xs shrink-0"
                  >
                    {subscribing ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Get Free Updates</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8ed462]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Expandable Topic Preferences */}
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 bg-white/90 border border-[#d5d5d4] rounded-[24px] text-left space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#80827f]">
                      Choose your tracks:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {NEWSLETTER_TOPICS.map((topic) => {
                        const isSelected = selectedTopics.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => toggleTopic(topic.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? "bg-[#2c2e2a] text-white"
                                : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a] border border-[#d5d5d4]"
                            }`}
                          >
                            <span>{topic.icon}</span>
                            <span>{topic.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#8ed462]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success & Error Feedback */}
            <AnimatePresence>
              {subscribedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 bg-[#8ed462]/25 border border-[#8ed462] rounded-2xl text-[#2e7d32] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{subscribedMessage}</span>
                </motion.div>
              )}
              {subscriptionError && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 bg-[#EA4335]/15 border border-[#EA4335] rounded-2xl text-[#EA4335] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setSubscriptionError(null)} />
                  <span>{subscriptionError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[11px] text-[#80827f] mt-2.5">
              ⚡ Delivered every Monday • 180+ campus engineers • 1-click unsubscribe anytime
            </p>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURED CURRENT ISSUE CARD */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <span className="text-xs font-bold tracking-tight text-[#2c2e2a] uppercase">
                Latest Edition
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#80827f]">
              {new Date(featuredIssue.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-[#d5d5d4] rounded-[32px] p-6 sm:p-8 hover:border-[#2c2e2a]/40 transition duration-200 shadow-xs group relative overflow-hidden"
          >
            {/* Top Google 4-Color Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-50%-[#FBBC04] to-[#34A853]" />

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] text-[#4285F4] font-bold font-mono">
                  Issue #{featuredIssue.issueNumber}
                </span>
                <span className="text-[#80827f] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredIssue.readTime}
                </span>
                <span className="text-[#80827f]">
                  • {featuredIssue.author?.name || "GDG AJCE"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2c2e2a] tracking-tight group-hover:text-[#4285F4] transition leading-snug">
                <Link href={`/newsletter/${featuredIssue.slug}`}>
                  {featuredIssue.title}
                </Link>
              </h2>

              <p className="text-xs sm:text-sm text-[#80827f] leading-relaxed line-clamp-2">
                {featuredIssue.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {featuredIssue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-[#f5f1e4] text-[11px] font-medium text-[#2c2e2a]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(featuredIssue.slug, featuredIssue.id)}
                    title="Share issue"
                    className="p-2 rounded-full border border-[#d5d5d4] hover:border-[#2c2e2a] text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                  >
                    {copiedId === featuredIssue.id ? (
                      <Check className="w-3.5 h-3.5 text-[#34A853]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <Link
                    href={`/newsletter/${featuredIssue.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2c2e2a] hover:bg-[#1b1c19] text-white text-xs font-semibold transition"
                  >
                    <span>Read Issue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* ARCHIVE OF PREVIOUS EDITIONS */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5d5d4] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2c2e2a] tracking-tight">
                All Editions
              </h2>
              <p className="text-xs text-[#80827f]">
                Previous dispatches and weekly breakdowns
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#80827f] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter issues..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#d5d5d4] rounded-full text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none focus:border-[#2c2e2a] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#80827f] hover:text-[#2c2e2a]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Minimal Topic Tag Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {tagFilters.map((tab) => {
              const isSelected = selectedTag === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTag(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[#2c2e2a] text-white"
                      : "bg-white text-[#80827f] hover:text-[#2c2e2a] border border-[#d5d5d4]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Compact Clean List of Editions */}
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <motion.article
                key={issue.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="bg-white border border-[#d5d5d4] rounded-[24px] p-5 sm:p-6 hover:border-[#2c2e2a]/40 transition shadow-2xs group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <span className="font-mono font-bold text-[#4285F4]">
                      #{issue.issueNumber}
                    </span>
                    <span className="text-[#80827f]">
                      {new Date(issue.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <span className="text-[#80827f] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {issue.readTime}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#2c2e2a] group-hover:text-[#4285F4] transition leading-snug">
                    <Link href={`/newsletter/${issue.slug}`}>
                      {issue.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-[#80827f] line-clamp-1 leading-relaxed">
                    {issue.summary}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(issue.slug, issue.id)}
                    title="Copy Link"
                    className="p-2 rounded-full border border-[#d5d5d4] hover:border-[#2c2e2a] text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                  >
                    {copiedId === issue.id ? (
                      <Check className="w-3.5 h-3.5 text-[#34A853]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <Link
                    href={`/newsletter/${issue.slug}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#f5f1e4] hover:bg-[#2c2e2a] hover:text-white text-[#2c2e2a] text-xs font-semibold transition group/btn"
                  >
                    <span>Read</span>
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}

            {filteredIssues.length === 0 && (
              <div className="text-center py-12 bg-white border border-[#d5d5d4] rounded-[24px] p-6 space-y-2">
                <BookOpen className="w-7 h-7 text-[#80827f] mx-auto" />
                <p className="text-xs font-semibold text-[#2c2e2a]">No newsletter issues found</p>
                <p className="text-[11px] text-[#80827f]">Try clearing your search term</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
