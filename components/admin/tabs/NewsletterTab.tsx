"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Mail,
  Send,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Users,
  Download,
  Eye,
  FileText,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  NewsletterIssue,
  NewsletterSubscriber,
  DEFAULT_NEWSLETTERS,
  renderNewsletterEmailHtml
} from "@/lib/newsletter";

interface NewsletterTabProps {
  adminEmail?: string | null;
  adminName?: string;
}

export default function NewsletterTab({ adminEmail, adminName = "Core Admin" }: NewsletterTabProps) {
  const [activeSubView, setActiveSubView] = useState<"issues" | "subscribers">("issues");
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSubscribers, setSearchSubscribers] = useState("");

  // Modals & Composer
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Partial<NewsletterIssue> | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIssue, setPreviewIssue] = useState<NewsletterIssue | null>(null);

  // Broadcast & Test Email State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTargetIssue, setBroadcastTargetIssue] = useState<NewsletterIssue | null>(null);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(adminEmail || "");

  // Auto-generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      // 1. Fetch Newsletters
      const issuesQuery = query(collection(db, "newsletters"), orderBy("publishedAt", "desc"));
      const issuesSnap = await getDocs(issuesQuery);
      let fetchedIssues: NewsletterIssue[] = [];

      if (!issuesSnap.empty) {
        fetchedIssues = issuesSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
      }

      // Merge with default issues if not already present
      const allIssues = [...fetchedIssues];
      DEFAULT_NEWSLETTERS.forEach((def) => {
        if (!allIssues.some((i) => i.slug === def.slug || i.issueNumber === def.issueNumber)) {
          allIssues.push(def);
        }
      });
      allIssues.sort((a, b) => b.issueNumber - a.issueNumber);
      setIssues(allIssues);

      // 2. Fetch Subscribers
      const subsQuery = query(collection(db, "newsletter_subscribers"), orderBy("subscribedAt", "desc"));
      const subsSnap = await getDocs(subsQuery);
      if (!subsSnap.empty) {
        const fetchedSubs = subsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setSubscribers(fetchedSubs);
      } else {
        setSubscribers([]);
      }
    } catch (err: any) {
      console.error("Error fetching newsletter data:", err);
      setActionError("Could not fetch remote data. Loaded cached issues.");
      setIssues(DEFAULT_NEWSLETTERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculation
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.status === "active").length;
  const sentEditionsCount = issues.filter((i) => i.status === "sent").length;

  // Auto-Generate Weekly Draft
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate weekly update");

      setActionSuccess(data.message || "Fresh weekly tech update draft generated successfully!");
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || "Failed to auto-generate weekly update.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Composer for new issue
  const handleCreateNewIssue = () => {
    const nextNum = issues.length > 0 ? Math.max(...issues.map((i) => i.issueNumber)) + 1 : 1;
    const today = new Date().toISOString();
    setEditingIssue({
      issueNumber: nextNum,
      title: `GDG Tech Pulse #${nextNum}: `,
      slug: `issue-${nextNum}-tech-pulse`,
      summary: "Weekly developer update covering Google AI, Cloud infrastructure, and Mobile/Web frameworks.",
      publishedAt: today,
      status: "draft",
      readTime: "4 min read",
      tags: ["AI/ML", "Cloud", "Web/Android", "Google Tech"],
      author: {
        name: adminName || "GDG AJCE Editorial Team",
        role: "Lead Tech Curators",
      },
      markdownContent: `# GDG Tech Pulse #${nextNum}\n\nWelcome to this week's briefing!\n\n## ⚡ Executive TL;DR\n- Point 1\n- Point 2\n\n## 🤖 1. AI & Machine Learning\n\n## ☁️ 2. Cloud & Systems\n\n## 📱 3. Web & Mobile\n\n## 🚀 4. Campus Spotlight`,
    });
    setIsEditorOpen(true);
  };

  // Save Issue (Draft or Published)
  const handleSaveIssue = async (status: "draft" | "scheduled" | "sent") => {
    if (!editingIssue || !editingIssue.title?.trim() || !editingIssue.markdownContent?.trim()) {
      alert("Please enter a title and markdown content for this issue.");
      return;
    }

    try {
      const payload = {
        ...editingIssue,
        status,
        updatedAt: new Date().toISOString(),
      };

      if (editingIssue.id && !editingIssue.id.startsWith("pulse-issue-")) {
        // Update existing in Firestore
        await updateDoc(doc(db, "newsletters", editingIssue.id), payload);
      } else {
        // Create new
        await addDoc(collection(db, "newsletters"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }

      setIsEditorOpen(false);
      setEditingIssue(null);
      setActionSuccess(`Issue #${editingIssue.issueNumber} saved successfully as ${status}!`);
      await fetchData();
    } catch (err: any) {
      alert("Error saving issue: " + err.message);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async (issue: NewsletterIssue) => {
    if (!testEmailInput || !testEmailInput.includes("@")) {
      alert("Please enter a valid test recipient email address.");
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueData: issue,
          testEmail: testEmailInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email");

      alert(`Test email sent successfully to ${testEmailInput}! Check your inbox.`);
    } catch (err: any) {
      alert("Test email error: " + err.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Broadcast to all subscribers
  const handleBroadcastNewsletter = async () => {
    if (!broadcastTargetIssue) return;

    setIsBroadcasting(true);
    setBroadcastStatus("Initiating broadcast batch to active subscribers...");

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId: broadcastTargetIssue.id,
          issueData: broadcastTargetIssue,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast failed");

      setBroadcastStatus(
        `Success! Broadcast delivered to ${data.sentCount} out of ${data.totalSubscribers} subscribers.`
      );
      setActionSuccess(`Broadcast completed! Issue #${broadcastTargetIssue.issueNumber} dispatched.`);
      await fetchData();
      setTimeout(() => {
        setBroadcastTargetIssue(null);
        setBroadcastStatus(null);
      }, 3500);
    } catch (err: any) {
      setBroadcastStatus("Broadcast Error: " + err.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Export Subscribers to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export.");
      return;
    }

    const headers = ["Email", "Name", "Status", "SubscribedAt", "Topics", "Source"];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name || ""}"`,
      `"${s.status}"`,
      `"${s.subscribedAt}"`,
      `"${(s.topics || []).join(", ")}"`,
      `"${s.source || "website"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gdg_newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(searchSubscribers.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchSubscribers.toLowerCase()))
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & QUICK ACTIONS */}
      {/* ========================================================================= */}
      <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[32px] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f1e4] text-[11px] font-bold text-[#4285F4] uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse" />
              <span>Broadcast Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c2e2a] tracking-tight">
              Weekly Newsletter & Tech Pulse
            </h1>
            <p className="text-xs sm:text-sm text-[#80827f]">
              Curate, preview, and broadcast weekly developer updates to all active community members.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f5f1e4] hover:bg-[#eae6d8] border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
              <span>{isGenerating ? "Generating Draft..." : "Auto-Generate Weekly Draft"}</span>
            </button>

            <button
              onClick={handleCreateNewIssue}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2c2e2a] hover:bg-[#1b1c19] text-white text-xs font-semibold transition active:scale-98 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#8ed462]" />
              <span>Draft New Issue</span>
            </button>

            <button
              onClick={fetchData}
              title="Refresh Data"
              className="w-9 h-9 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:bg-[#eae6d8] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Global Action Notifications */}
        {actionSuccess && (
          <div className="mt-4 p-3 bg-[#8ed462]/20 border border-[#8ed462] rounded-xl text-[#2e7d32] text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mt-4 p-3 bg-[#EA4335]/15 border border-[#EA4335] rounded-xl text-[#EA4335] text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[24px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80827f] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Subscribers</span>
            <Users className="w-4 h-4 text-[#4285F4]" />
          </div>
          <div className="text-3xl font-bold text-[#2c2e2a]">{totalSubscribers}</div>
          <p className="text-[11px] text-[#80827f] mt-1">Across web forms & landing page</p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[24px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80827f] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Recipients</span>
            <CheckCircle className="w-4 h-4 text-[#34A853]" />
          </div>
          <div className="text-3xl font-bold text-[#34A853]">{activeSubscribers}</div>
          <p className="text-[11px] text-[#80827f] mt-1">Eligible for weekly dispatch</p>
        </div>

        {/* Sent Editions */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[24px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80827f] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Editions</span>
            <FileText className="w-4 h-4 text-[#FBBC04]" />
          </div>
          <div className="text-3xl font-bold text-[#2c2e2a]">{sentEditionsCount}</div>
          <p className="text-[11px] text-[#80827f] mt-1">Archived online & sent to email</p>
        </div>

        {/* Dispatch Health */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[24px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#80827f] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivery Engine</span>
            <ShieldCheck className="w-4 h-4 text-[#EA4335]" />
          </div>
          <div className="text-sm font-bold text-[#2c2e2a] mt-2">Nodemailer + SMTP</div>
          <p className="text-[11px] text-[#34A853] font-semibold mt-1">Ready for Weekly Broadcast</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW SELECTOR TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-3 border-b border-[#d5d5d4] pb-4">
        <button
          onClick={() => setActiveSubView("issues")}
          className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            activeSubView === "issues"
              ? "bg-[#2c2e2a] text-white shadow-xs"
              : "bg-white text-[#80827f] hover:text-[#2c2e2a] border border-[#d5d5d4]"
          }`}
        >
          Weekly Editions & Drafts ({issues.length})
        </button>

        <button
          onClick={() => setActiveSubView("subscribers")}
          className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
            activeSubView === "subscribers"
              ? "bg-[#2c2e2a] text-white shadow-xs"
              : "bg-white text-[#80827f] hover:text-[#2c2e2a] border border-[#d5d5d4]"
          }`}
        >
          Subscribers Directory ({subscribers.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. VIEW A: ISSUES & DRAFTS TABLE */}
      {/* ========================================================================= */}
      {activeSubView === "issues" && (
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[32px] overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#f1efe8] flex items-center justify-between">
            <h3 className="text-base font-bold text-[#2c2e2a]">Weekly Newsletter Editions</h3>
            <span className="text-xs text-[#80827f] font-mono">Dispatches every Monday</span>
          </div>

          <div className="divide-y divide-[#f1efe8]">
            {issues.map((issue) => {
              const isSent = issue.status === "sent";
              const isScheduled = issue.status === "scheduled";
              return (
                <div
                  key={issue.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#faf9f5] transition"
                >
                  {/* Left Column: Title & Metadata */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] text-[#4285F4] text-xs font-bold font-mono">
                        Issue #{issue.issueNumber}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSent
                            ? "bg-[#34A853]/15 text-[#2e7d32]"
                            : isScheduled
                            ? "bg-[#FBBC04]/20 text-[#b28000]"
                            : "bg-[#80827f]/15 text-[#5f6368]"
                        }`}
                      >
                        {issue.status}
                      </span>

                      <span className="text-xs text-[#80827f] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(issue.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-[#2c2e2a] hover:text-[#4285F4] transition">
                      {issue.title}
                    </h4>

                    <p className="text-xs text-[#80827f] line-clamp-2">
                      {issue.summary}
                    </p>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* View online */}
                    <a
                      href={`/newsletter/${issue.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f5f1e4] hover:bg-[#eae6d8] text-xs font-medium text-[#2c2e2a] transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#4285F4]" />
                      <span>Read Web</span>
                    </a>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingIssue(issue);
                        setIsEditorOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f5f1e4] hover:bg-[#eae6d8] text-xs font-medium text-[#2c2e2a] transition cursor-pointer"
                    >
                      <span>Edit</span>
                    </button>

                    {/* Test Email */}
                    <button
                      onClick={() => handleSendTestEmail(issue)}
                      disabled={isSendingTest}
                      title="Send preview to admin email"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f5f1e4] hover:bg-[#eae6d8] text-xs font-medium text-[#2c2e2a] transition cursor-pointer disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#80827f]" />
                      <span>Test Email</span>
                    </button>

                    {/* Broadcast Button */}
                    <button
                      onClick={() => setBroadcastTargetIssue(issue)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition active:scale-95 shadow-xs cursor-pointer ${
                        isSent ? "bg-[#34A853] hover:bg-[#2e7d32]" : "bg-[#2c2e2a] hover:bg-[#1b1c19]"
                      }`}
                    >
                      <Send className="w-3 h-3 text-[#8ed462]" />
                      <span>{isSent ? "Broadcast Again" : "Send to All"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW B: SUBSCRIBERS DIRECTORY TABLE */}
      {/* ========================================================================= */}
      {activeSubView === "subscribers" && (
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[32px] overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-[#f1efe8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#2c2e2a]">Registered Newsletter Subscribers</h3>
              <p className="text-xs text-[#80827f]">
                {activeSubscribers} active subscribers will receive the next weekly issue.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#80827f] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchSubscribers}
                  onChange={(e) => setSearchSubscribers(e.target.value)}
                  placeholder="Search subscriber email..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#f5f1e4]/50 border border-[#d5d5d4] rounded-full text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none"
                />
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f5f1e4] hover:bg-[#eae6d8] text-xs font-semibold text-[#2c2e2a] border border-[#d5d5d4] transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f1e4]/50 text-[#80827f] font-mono uppercase tracking-wider border-b border-[#f1efe8]">
                <tr>
                  <th className="px-6 py-3">Subscriber</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Subscribed Date</th>
                  <th className="px-6 py-3">Tracks</th>
                  <th className="px-6 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1efe8]">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#faf9f5] transition">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-[#2c2e2a]">{sub.email}</div>
                      {sub.name && <div className="text-[11px] text-[#80827f]">{sub.name}</div>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          sub.status === "active"
                            ? "bg-[#34A853]/15 text-[#2e7d32]"
                            : "bg-[#EA4335]/15 text-[#EA4335]"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#80827f] font-mono">
                      {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(sub.topics || ["all"]).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-[#f5f1e4] rounded text-[10px] text-[#2c2e2a]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[#80827f] font-mono">
                      {sub.source || "website"}
                    </td>
                  </tr>
                ))}

                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-xs text-[#80827f]">
                      No subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: ISSUE COMPOSER / EDITOR */}
      {/* ========================================================================= */}
      {isEditorOpen && editingIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#d5d5d4] rounded-[36px] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#f1efe8] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2c2e2a]">
                  {editingIssue.id ? `Edit Issue #${editingIssue.issueNumber}` : "Draft New Newsletter Issue"}
                </h3>
                <p className="text-xs text-[#80827f]">Write in Markdown. Changes update the web edition and email template.</p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f5f1e4] flex items-center justify-center text-[#2c2e2a] hover:bg-[#eae6d8] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#80827f] block mb-1">Issue Title</label>
                  <input
                    type="text"
                    value={editingIssue.title || ""}
                    onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f5f1e4]/50 border border-[#d5d5d4] rounded-xl text-xs text-[#2c2e2a] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#80827f] block mb-1">Issue Number</label>
                  <input
                    type="number"
                    value={editingIssue.issueNumber || 1}
                    onChange={(e) => setEditingIssue({ ...editingIssue, issueNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-[#f5f1e4]/50 border border-[#d5d5d4] rounded-xl text-xs text-[#2c2e2a] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#80827f] block mb-1">TL;DR Summary (Newsletter Preview)</label>
                <textarea
                  rows={2}
                  value={editingIssue.summary || ""}
                  onChange={(e) => setEditingIssue({ ...editingIssue, summary: e.target.value })}
                  className="w-full px-4 py-2 bg-[#f5f1e4]/50 border border-[#d5d5d4] rounded-xl text-xs text-[#2c2e2a] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#80827f]">Markdown Content</label>
                  <span className="text-[11px] text-[#4285F4] font-mono">GFM Markdown supported</span>
                </div>
                <textarea
                  rows={14}
                  value={editingIssue.markdownContent || ""}
                  onChange={(e) => setEditingIssue({ ...editingIssue, markdownContent: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f5f1e4]/50 border border-[#d5d5d4] rounded-xl text-xs text-[#2c2e2a] font-mono outline-none focus:border-[#2c2e2a] leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#f1efe8] bg-[#faf9f5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="test@example.com"
                  className="px-3 py-2 bg-white border border-[#d5d5d4] rounded-full text-xs text-[#2c2e2a] outline-none w-48"
                />
                <button
                  type="button"
                  onClick={() => handleSendTestEmail(editingIssue as NewsletterIssue)}
                  disabled={isSendingTest}
                  className="px-4 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] hover:bg-[#f5f1e4] transition cursor-pointer disabled:opacity-50"
                >
                  {isSendingTest ? "Sending..." : "Send Test"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveIssue("draft")}
                  className="px-5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] hover:bg-[#f5f1e4] transition cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveIssue("sent")}
                  className="px-6 py-2 rounded-full bg-[#2c2e2a] hover:bg-[#1b1c19] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Publish & Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: BROADCAST CONFIRMATION */}
      {/* ========================================================================= */}
      {broadcastTargetIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#d5d5d4] rounded-[32px] max-w-md w-full p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#4285F4]/15 text-[#4285F4] flex items-center justify-center mx-auto">
              <Send className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#2c2e2a]">
                Broadcast Issue #{broadcastTargetIssue.issueNumber}?
              </h3>
              <p className="text-xs text-[#80827f] leading-relaxed">
                This will personalize and send <strong>"{broadcastTargetIssue.title}"</strong> to all{" "}
                <span className="font-bold text-[#2c2e2a]">{activeSubscribers} active subscribers</span> via your configured SMTP server.
              </p>
            </div>

            {broadcastStatus && (
              <div className="p-3 bg-[#f5f1e4] rounded-xl text-xs font-mono text-[#2c2e2a] text-left">
                {broadcastStatus}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBroadcastTargetIssue(null)}
                disabled={isBroadcasting}
                className="w-1/2 py-2.5 rounded-full border border-[#d5d5d4] text-xs font-semibold text-[#80827f] hover:bg-[#f5f1e4] transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBroadcastNewsletter}
                disabled={isBroadcasting}
                className="w-1/2 py-2.5 rounded-full bg-[#2c2e2a] hover:bg-[#1b1c19] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isBroadcasting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 text-[#8ed462]" />
                    <span>Confirm Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
