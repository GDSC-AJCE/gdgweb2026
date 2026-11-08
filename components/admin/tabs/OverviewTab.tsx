"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  FileText,
  Wallet,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Send,
  Globe,
  Activity,
  Layers,
  ChevronRight,
  Database,
  CloudCheck,
  Server,
} from "lucide-react";
import { AdminTab } from "../AdminSidebar";
import StatusDot from "@/components/ui/StatusDot";
import Chip from "@/components/ui/Chip";

interface OverviewTabProps {
  stats: {
    totalUsers: number;
    coreUsers: number;
    totalEvents: number;
    pendingApplications: number;
    totalFunds: number;
  };
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateEvent: () => void;
  onOpenAddExecom: () => void;
  recentLogs: any[];
  isSuperAdmin?: boolean;
}

function formatLogDetails(details: any, target?: any): string {
  if (details) {
    if (typeof details === "string") return details;
    if (typeof details === "object") {
      if (details.title) return String(details.title);
      if (details.name) return String(details.name);
      if (details.message) return String(details.message);
      if (details.description) return String(details.description);
      try {
        const entries = Object.entries(details).filter(
          ([k]) => !["eventId", "userId", "id"].includes(k)
        );
        if (entries.length > 0) {
          return entries
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
            .join(", ");
        }
        return JSON.stringify(details);
      } catch {
        return "";
      }
    }
    return String(details);
  }
  if (target) {
    if (typeof target === "string") return target;
    if (typeof target === "object") {
      return target.title || target.name || "";
    }
    return String(target);
  }
  return "";
}

export default function OverviewTab({
  stats,
  onNavigateTab,
  onOpenCreateEvent,
  onOpenAddExecom,
  recentLogs,
  isSuperAdmin = true,
}: OverviewTabProps) {
  const [logFilter, setLogFilter] = useState<"all" | "events" | "execom" | "auth">("all");

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return recentLogs.slice(0, 6);
    return recentLogs
      .filter((l) => {
        const act = (l.action || "").toLowerCase();
        if (logFilter === "events") return act.includes("event");
        if (logFilter === "execom") return act.includes("execom") || act.includes("member");
        if (logFilter === "auth") return act.includes("role") || act.includes("auth") || act.includes("admin");
        return true;
      })
      .slice(0, 6);
  }, [recentLogs, logFilter]);

  return (
    <div className="space-y-6 select-none">
      {/* 1. COCKPIT HERO BANNER */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Chip color="blue" variant="subtle" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Executive Command Center</span>
              </Chip>
              <span className="text-xs font-mono text-slate-400">Semester 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              GDG on Campus AJCE Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Real-time chapter telemetry, member management, recruitment processing, and email dispatch services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateEvent}
              className="h-9.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>
            <button
              onClick={() => onNavigateTab("mailer")}
              className="h-9.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer backdrop-blur-sm"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Mail Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BENTO METRICS GRID (21st.dev + BoardUI style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL MEMBERS */}
        <div
          onClick={() => onNavigateTab("users")}
          className="group p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Community Members
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalUsers.toLocaleString()}
              </h3>
              <Chip color="blue" variant="subtle" className="text-[10px] py-0 px-1.5 font-mono">
                Active
              </Chip>
            </div>
            <p className="text-xs text-slate-500 mt-1">Verified student profiles</p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:underline">
            <span>{isSuperAdmin ? "View Directory" : "Directory (Admin)"}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* EXECOM LEADS */}
        <div
          onClick={() => onNavigateTab("execom")}
          className="group p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Execom Organizers
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.coreUsers}
              </h3>
              <Chip color="green" variant="subtle" className="text-[10px] py-0 px-1.5 font-mono">
                Leads
              </Chip>
            </div>
            <p className="text-xs text-slate-500 mt-1">Domain heads & team leads</p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:underline">
            <span>Manage Team</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* EVENTS & LABS */}
        <div
          onClick={() => onNavigateTab("events")}
          className="group p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Events & Labs
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalEvents}
              </h3>
              <Chip color="yellow" variant="subtle" className="text-[10px] py-0 px-1.5 font-mono">
                Conducted
              </Chip>
            </div>
            <p className="text-xs text-slate-500 mt-1">Workshops & tech sprints</p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:underline">
            <span>Events Center</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* APPLICATIONS PIPELINE */}
        <div
          onClick={() => onNavigateTab("applications")}
          className="group p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Recruitment Queue
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.pendingApplications}
              </h3>
              <Chip
                color={stats.pendingApplications > 0 ? "red" : "slate"}
                variant={stats.pendingApplications > 0 ? "bold" : "subtle"}
                className="text-[10px] py-0 px-1.5 font-mono"
              >
                {stats.pendingApplications > 0 ? "Needs Review" : "Trivial"}
              </Chip>
            </div>
            <p className="text-xs text-slate-500 mt-1">Pending candidate reviews</p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600 group-hover:underline">
            <span>Triage Applicants</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION COMMAND HUB */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Quick Operations</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Frequently executed actions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={onOpenCreateEvent}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
              <Plus className="w-4 h-4 text-blue-600 group-hover:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Create Event</p>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Publish workshop</p>
            </div>
          </button>

          {isSuperAdmin && (
            <button
              onClick={onOpenAddExecom}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
                <Users className="w-4 h-4 text-emerald-600 group-hover:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Add Execom Lead</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Roster update</p>
              </div>
            </button>
          )}

          <button
            onClick={() => onNavigateTab("applications")}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4 text-rose-600 group-hover:text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Recruitment</p>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Review candidates</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("mailer")}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
              <Send className="w-4 h-4 text-blue-600 group-hover:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Mail Studio</p>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Broadcast emails</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab("newsletter")}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-amber-600 group-hover:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Newsletter</p>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Draft broadcast</p>
            </div>
          </button>

          {isSuperAdmin ? (
            <button
              onClick={() => onNavigateTab("funds")}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
                <Wallet className="w-4 h-4 text-purple-600 group-hover:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Treasury</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Chapter ledger</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab("website")}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/10 border border-slate-200/60 group-hover:border-transparent flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
                <Globe className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Website</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Live controls</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 4. SPLIT TWO-COLUMN OPERATIONAL CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: AUDIT STREAM & ACTIVITY LOG (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activity & Audit Trail</h3>
              <p className="text-xs text-slate-400">Immutable ledger of administrative actions</p>
            </div>

            {/* SEGMENTED FILTER */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 self-start sm:self-auto">
              {(["all", "events", "execom", "auth"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                    logFilter === filter
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              No matching activity events recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {log.action?.replace(/_/g, " ") || "Chapter Operation"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        By <span className="font-semibold text-slate-700">{typeof log.performedBy === "string" ? log.performedBy : "Admin"}</span> • {formatLogDetails(log.details, log.target)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString() : "Recent"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateTab("audit")}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>{isSuperAdmin ? "View Full Security Audit Log" : "Full Audit (Admin Only)"}</span>
              {isSuperAdmin ? <ArrowRight className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* RIGHT: SYSTEM HEALTH & INTEGRATIONS (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Cloud Infrastructure</h3>
              </div>
              <StatusDot color="green" ping={true} />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Firebase Firestore</p>
                    <p className="text-[10px] font-mono text-slate-400">Database connected</p>
                  </div>
                </div>
                <Chip color="green" variant="subtle" className="text-[10px] py-0 px-2">
                  Online
                </Chip>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Apps Script Gateway</p>
                    <p className="text-[10px] font-mono text-slate-400">Quota: ~1,451 left</p>
                  </div>
                </div>
                <Chip color="blue" variant="subtle" className="text-[10px] py-0 px-2">
                  Active
                </Chip>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Vercel Edge Network</p>
                    <p className="text-[10px] font-mono text-slate-400">Next.js 16.1.6</p>
                  </div>
                </div>
                <Chip color="purple" variant="subtle" className="text-[10px] py-0 px-2">
                  Deployed
                </Chip>
              </div>
            </div>
          </div>

          {/* RECRUITMENT PROGRESS SNAPSHOT */}
          <div className="p-5 rounded-[28px] bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/70 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Recruitment Funnel</span>
              <span className="text-[10px] font-mono text-blue-600 font-bold">2026 Core Team</span>
            </div>
            <p className="text-xs text-slate-600">
              Candidate review pipeline status for technical, design, and management tracks.
            </p>
            <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, 100 - stats.pendingApplications * 5))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Applications: {stats.pendingApplications} Pending</span>
              <button
                onClick={() => onNavigateTab("applications")}
                className="text-blue-700 font-semibold hover:underline"
              >
                Triage →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
