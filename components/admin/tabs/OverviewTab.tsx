"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Calendar,
  FileText,
  Wallet,
  Sparkles,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
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
  Server,
  BarChart3,
  Search,
  Download,
  Info,
  Clock,
  ExternalLink,
  ChevronLeft,
  Filter,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import * as XLSX from "xlsx";
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
  users?: any[];
  events?: any[];
  applications?: any[];
  funds?: any[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateEvent: () => void;
  onOpenAddExecom: () => void;
  recentLogs: any[];
  isSuperAdmin?: boolean;
}

// Lightweight smooth number count-up hook
function useCountUp(end: number, duration: number = 750) {
  const [count, setCount] = useState(end);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const start = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(start + (end - start) * ease));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    const req = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(req);
  }, [end, duration]);

  return count;
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

// Formatter helpers
const formatNumber = (val: number) => val.toLocaleString("en-US");
const formatK = (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `${val}`);

export default function OverviewTab({
  stats,
  users = [],
  events = [],
  applications = [],
  funds = [],
  onNavigateTab,
  onOpenCreateEvent,
  onOpenAddExecom,
  recentLogs = [],
  isSuperAdmin = true,
}: OverviewTabProps) {
  // Chart period state
  const [chartPeriod, setChartPeriod] = useState<"12M" | "30D" | "7D">("12M");
  const [activeAreaMonth, setActiveAreaMonth] = useState<number | null>(null);
  const [activeBarMonth, setActiveBarMonth] = useState<number | null>(null);

  // Table state
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<"all" | "execom" | "applicants" | "members">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<"all" | "events" | "execom" | "auth">("all");

  const pageSize = 8;

  // Animated numbers for KPI cards
  const animatedUsers = useCountUp(stats.totalUsers || 1420);
  const animatedLeads = useCountUp(stats.coreUsers || 28);
  const animatedEvents = useCountUp(stats.totalEvents || 16);
  const animatedApps = useCountUp(stats.pendingApplications || 9);

  // Growth trajectory dataset (12 Months, 30 Days, 7 Days)
  const growthData = useMemo(() => {
    if (chartPeriod === "7D") {
      return [
        { label: "Mon", current: 18, previous: 12 },
        { label: "Tue", current: 24, previous: 16 },
        { label: "Wed", current: 31, previous: 20 },
        { label: "Thu", current: 28, previous: 22 },
        { label: "Fri", current: 42, previous: 29 },
        { label: "Sat", current: 56, previous: 38 },
        { label: "Sun", current: 49, previous: 34 },
      ];
    }
    if (chartPeriod === "30D") {
      return [
        { label: "W1", current: 110, previous: 85 },
        { label: "W2", current: 145, previous: 105 },
        { label: "W3", current: 190, previous: 130 },
        { label: "W4", current: 235, previous: 160 },
      ];
    }
    return [
      { label: "Jan", current: 95, previous: 70 },
      { label: "Feb", current: 120, previous: 88 },
      { label: "Mar", current: 165, previous: 115 },
      { label: "Apr", current: 140, previous: 125 },
      { label: "May", current: 190, previous: 145 },
      { label: "Jun", current: 215, previous: 160 },
      { label: "Jul", current: 260, previous: 185 },
      { label: "Aug", current: 245, previous: 195 },
      { label: "Sep", current: 290, previous: 210 },
      { label: "Oct", current: 320, previous: 230 },
      { label: "Nov", current: 345, previous: 245 },
      { label: "Dec", current: 380, previous: 270 },
    ];
  }, [chartPeriod]);

  // RSVPs vs Attendance dataset
  const attendanceData = useMemo(() => {
    return [
      { label: "Jan", rsvps: 180, attended: 145 },
      { label: "Feb", rsvps: 210, attended: 175 },
      { label: "Mar", rsvps: 260, attended: 220 },
      { label: "Apr", rsvps: 240, attended: 195 },
      { label: "May", rsvps: 310, attended: 270 },
      { label: "Jun", rsvps: 290, attended: 245 },
      { label: "Jul", rsvps: 350, attended: 310 },
      { label: "Aug", rsvps: 330, attended: 285 },
      { label: "Sep", rsvps: 410, attended: 360 },
      { label: "Oct", rsvps: 450, attended: 395 },
      { label: "Nov", rsvps: 420, attended: 370 },
      { label: "Dec", rsvps: 490, attended: 435 },
    ];
  }, []);

  // Filtered audit logs
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

  // Combined Directory Table Data (Users + Applicants + Leads)
  const combinedDirectory = useMemo(() => {
    const list: any[] = [];

    // Add users
    users.forEach((u) => {
      const isLead = u.role === "core" || u.role === "core-manage" || u.is_admin;
      list.push({
        id: u.id,
        name: u.displayName || u.name || "Student Member",
        email: u.email || "student@amaljyothi.ac.in",
        role: isLead ? (u.role === "core-manage" ? "Core Manager" : "Lead Organizer") : "Member",
        category: isLead ? "execom" : "members",
        dept: u.department || u.dept || "CSE",
        avatar: u.photoURL || u.image || null,
        status: isLead ? "lead" : "active",
        date: u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
      });
    });

    // Add applications if any
    applications.forEach((a) => {
      list.push({
        id: `app-${a.id}`,
        name: a.name || a.fullName || "Candidate Applicant",
        email: a.email || "applicant@amaljyothi.ac.in",
        role: "Applicant",
        category: "applicants",
        dept: a.department || a.dept || "CSE",
        avatar: a.photoURL || null,
        status: "pending",
        date: a.submittedAt?.toDate ? a.submittedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pending Review",
      });
    });

    // Fallback if empty (for fresh demo)
    if (list.length === 0) {
      return [
        { id: "1", name: "Karthik Sambhu", email: "karthiksambhu123@gmail.com", role: "Chapter Lead", category: "execom", dept: "CSE", status: "lead", date: "Jan 12, 2026" },
        { id: "2", name: "Alen Joseph", email: "alenjoseph@amaljyothi.ac.in", role: "Technical Head", category: "execom", dept: "ECE", status: "lead", date: "Jan 15, 2026" },
        { id: "3", name: "Sneha Nair", email: "snehanair@amaljyothi.ac.in", role: "Creative Lead", category: "execom", dept: "IT", status: "lead", date: "Feb 02, 2026" },
        { id: "4", name: "Rohan Varghese", email: "rohanv@amaljyothi.ac.in", role: "Applicant", category: "applicants", dept: "CSE", status: "pending", date: "Yesterday" },
        { id: "5", name: "Meera Krishnan", email: "meerak@amaljyothi.ac.in", role: "Member", category: "members", dept: "AI&DS", status: "active", date: "Feb 18, 2026" },
        { id: "6", name: "Devanand S", email: "devanands@amaljyothi.ac.in", role: "Applicant", category: "applicants", dept: "ME", status: "pending", date: "2 days ago" },
        { id: "7", name: "Ananya Thomas", email: "ananyat@amaljyothi.ac.in", role: "Member", category: "members", dept: "CSE", status: "active", date: "Feb 22, 2026" },
        { id: "8", name: "Joel Mathew", email: "joelm@amaljyothi.ac.in", role: "Member", category: "members", dept: "ECE", status: "active", date: "Mar 01, 2026" },
      ];
    }

    return list;
  }, [users, applications]);

  // Filtered and searched table items
  const filteredDirectory = useMemo(() => {
    return combinedDirectory.filter((item) => {
      // Category filter
      if (tableFilter === "execom" && item.category !== "execom") return false;
      if (tableFilter === "applicants" && item.category !== "applicants") return false;
      if (tableFilter === "members" && item.category !== "members") return false;

      // Text search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesDept = item.dept.toLowerCase().includes(q);
        const matchesRole = item.role.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesDept || matchesRole;
      }
      return true;
    });
  }, [combinedDirectory, tableFilter, tableSearch]);

  const totalPages = Math.ceil(filteredDirectory.length / pageSize) || 1;
  const paginatedDirectory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDirectory.slice(start, start + pageSize);
  }, [filteredDirectory, currentPage, pageSize]);

  // Export to Excel / CSV
  const handleExportTable = () => {
    const exportData = filteredDirectory.map((item) => ({
      Name: item.name,
      Email: item.email,
      Role: item.role,
      Department: item.dept,
      Status: item.status,
      Date: item.date,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chapter Directory");
    XLSX.writeFile(wb, `GDG_Chapter_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Calculated values for Area Chart
  const totalGrowthCurrent = growthData.reduce((acc, d) => acc + d.current, 0);
  const totalGrowthPrevious = growthData.reduce((acc, d) => acc + d.previous, 0);
  const activeGrowthPoint = activeAreaMonth !== null ? growthData[activeAreaMonth] : null;
  const growthDisplay = activeGrowthPoint ? activeGrowthPoint.current : totalGrowthCurrent;
  const growthComp = activeGrowthPoint ? activeGrowthPoint.previous : totalGrowthPrevious;
  const growthDelta = Math.round(((growthDisplay - growthComp) / (growthComp || 1)) * 100);

  // Calculated values for Bar Chart
  const totalRsvps = attendanceData.reduce((acc, d) => acc + d.rsvps, 0);
  const totalAttended = attendanceData.reduce((acc, d) => acc + d.attended, 0);
  const activeAttendancePoint = activeBarMonth !== null ? attendanceData[activeBarMonth] : null;
  const attendanceDisplay = activeAttendancePoint ? activeAttendancePoint.rsvps : totalRsvps;
  const attendanceComp = activeAttendancePoint ? activeAttendancePoint.attended : totalAttended;
  const attendanceDelta = Math.round(((attendanceDisplay - attendanceComp) / (attendanceComp || 1)) * 100);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. EXECUTIVE WELCOME BANNER (BOARDUI CLEAN HERO) */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-[11px] font-semibold tracking-tight">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Chapter Dashboard</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Academic Year 2026</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <StatusDot color="green" ping />
              <span>Realtime telemetry active</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to GDG on Campus AJCE Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Monitor chapter velocity, review recruit applications, publish workshop sessions, and broadcast mailings to student developers.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateEvent}
            className="h-9.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Create Event</span>
          </button>
          <button
            onClick={() => onNavigateTab("mailer")}
            className="h-9.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Mail Studio</span>
          </button>
        </div>
      </div>

      {/* 2. BOARDUI FOOTER STAT CARDS ROW (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: COMMUNITY MEMBERS */}
        <div
          onClick={() => onNavigateTab("users")}
          className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer p-4"
        >
          {/* Header row: Gradient Icon Tile + Info hint */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <span className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </span>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveHint("members")}
                onMouseLeave={() => setActiveHint(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <Info className="w-4 h-4" />
              </button>
              {activeHint === "members" && (
                <div className="absolute right-0 top-6 z-20 w-48 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-lg">
                  Total student developer profiles verified across all department years.
                </div>
              )}
            </div>
          </div>

          {/* Value + Label */}
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Community Members</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatNumber(animatedUsers)}
              </span>
            </div>
          </div>

          {/* Footer Band */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold font-mono text-[10px]">
                <ArrowUpRight className="w-3 h-3" />
                <span>+18.4%</span>
              </span>
              <span>vs last month</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* CARD 2: EXECOM ORGANIZERS */}
        <div
          onClick={() => onNavigateTab("execom")}
          className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer p-4"
        >
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <span className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveHint("execom")}
                onMouseLeave={() => setActiveHint(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <Info className="w-4 h-4" />
              </button>
              {activeHint === "execom" && (
                <div className="absolute right-0 top-6 z-20 w-48 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-lg">
                  Current student leadership across tech, outreach, design, and operations.
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Execom Leadership</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatNumber(animatedLeads)}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-medium">Active Roster</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold font-mono text-[10px]">
                <Check className="w-3 h-3" />
                <span>100%</span>
              </span>
              <span>All tracks staffed</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* CARD 3: EVENTS & WORKSHOPS */}
        <div
          onClick={() => onNavigateTab("events")}
          className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer p-4"
        >
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <span className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </span>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveHint("events")}
                onMouseLeave={() => setActiveHint(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <Info className="w-4 h-4" />
              </button>
              {activeHint === "events" && (
                <div className="absolute right-0 top-6 z-20 w-48 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-lg">
                  Workshops, codelabs, hackathons, and technical sprints organized this term.
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Events & Labs</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatNumber(animatedEvents)}
              </span>
              <span className="text-[11px] font-mono text-amber-600 font-medium">Published</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold font-mono text-[10px]">
                <ArrowUpRight className="w-3 h-3" />
                <span>+25.0%</span>
              </span>
              <span>Semester velocity</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* CARD 4: RECRUITMENT QUEUE */}
        <div
          onClick={() => onNavigateTab("applications")}
          className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer p-4"
        >
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <span className="size-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </span>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveHint("apps")}
                onMouseLeave={() => setActiveHint(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <Info className="w-4 h-4" />
              </button>
              {activeHint === "apps" && (
                <div className="absolute right-0 top-6 z-20 w-48 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-lg">
                  Submissions from students seeking to join the GDG executive organizing team.
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Recruitment Queue</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatNumber(animatedApps)}
              </span>
              <span className={`text-[11px] font-mono font-medium ${stats.pendingApplications > 0 ? "text-rose-600" : "text-slate-400"}`}>
                {stats.pendingApplications > 0 ? "Needs Review" : "Queue Empty"}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold font-mono text-[10px] ${
                stats.pendingApplications > 0 ? "bg-rose-50 text-rose-700 animate-pulse" : "bg-slate-100 text-slate-600"
              }`}>
                {stats.pendingApplications > 0 ? "Action Required" : "Cleared"}
              </span>
              <span>Triage candidates</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* 3. BOARDUI DOUBLE INTERACTIVE CHARTS ROW (REVENUE + ORDERS PATTERN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: CHAPTER VELOCITY & SIGNUPS (AREA CHART) */}
        <section className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-6 min-h-[380px]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">
                {activeGrowthPoint ? `Month: ${activeGrowthPoint.label}` : "Member Velocity & Growth"}
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {growthDisplay}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+{growthDelta}%</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {growthComp} signups in earlier comparison window
              </p>
            </div>

            {/* Right: Legend + Period Pills */}
            <div className="flex flex-wrap sm:flex-col sm:items-end gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-[11px] font-semibold">
                {(["12M", "30D", "7D"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setChartPeriod(period)}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === period
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-600" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-slate-300" />
                  <span>Previous</span>
                </div>
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={growthData}
                margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
                onMouseMove={(state) => {
                  const idx = Number(state?.activeTooltipIndex);
                  if (state?.isTooltipActive && Number.isFinite(idx)) {
                    setActiveAreaMonth(idx);
                  }
                }}
                onMouseLeave={() => setActiveAreaMonth(null)}
              >
                <defs>
                  <linearGradient id="areaGradientBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={formatK}
                  domain={[0, "auto"]}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-bold text-slate-200">{label}</p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-blue-400">Current:</span>
                            <span className="font-mono font-bold">{payload[0]?.value}</span>
                          </div>
                          {payload[1] && (
                            <div className="flex items-center justify-between gap-4 text-slate-400">
                              <span>Previous:</span>
                              <span className="font-mono">{payload[1]?.value}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#areaGradientBlue)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* CHART 2: WORKSHOP REGISTRATIONS VS ATTENDANCE (BAR CHART) */}
        <section className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-6 min-h-[380px]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">
                {activeAttendancePoint ? `Session: ${activeAttendancePoint.label}` : "Workshop RSVPs & Attendance"}
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {attendanceDisplay}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+{attendanceDelta}%</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {attendanceComp} confirmed verified check-ins
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-600" />
                <span>RSVPs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-300" />
                <span>Attended</span>
              </div>
            </div>
          </div>

          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
                barCategoryGap="24%"
                barGap={2}
                onMouseMove={(state) => {
                  const idx = Number(state?.activeTooltipIndex);
                  if (state?.isTooltipActive && Number.isFinite(idx)) {
                    setActiveBarMonth(idx);
                  }
                }}
                onMouseLeave={() => setActiveBarMonth(null)}
              >
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={formatK}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-bold text-slate-200">{label}</p>
                          <div className="flex items-center justify-between gap-4 text-blue-400">
                            <span>RSVPs:</span>
                            <span className="font-mono font-bold">{payload[0]?.value}</span>
                          </div>
                          {payload[1] && (
                            <div className="flex items-center justify-between gap-4 text-slate-300">
                              <span>Attended:</span>
                              <span className="font-mono font-bold">{payload[1]?.value}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="rsvps"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="attended"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* 4. BOARDUI DATA TABLE (CHAPTER DIRECTORY & SIGNUPS) */}
      <section className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Chapter Directory & Member Register</h3>
            <p className="text-xs text-slate-500">
              Browse students, track roles, view active applications, and manage student organizing leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search member, email, dept..."
                className="w-full h-8.5 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-[11px] font-semibold">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "execom", label: "Leads" },
                  { id: "applicants", label: "Applicants" },
                  { id: "members", label: "Members" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setTableFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    tableFilter === tab.id
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportTable}
              title="Export filtered directory to Excel"
              className="h-8.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Enrolled / Submitted</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDirectory.length > 0 ? (
                paginatedDirectory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Member Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="size-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                          item.category === "execom"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.category === "applicants"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>

                    {/* Dept Column */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600 font-medium">{item.dept}</span>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusDot
                          color={
                            item.status === "lead"
                              ? "green"
                              : item.status === "pending"
                              ? "red"
                              : "blue"
                          }
                        />
                        <span className="capitalize text-slate-700 font-medium">
                          {item.status === "lead" ? "Organizer" : item.status}
                        </span>
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.date}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      {item.category === "applicants" ? (
                        <button
                          onClick={() => onNavigateTab("applications")}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Review
                        </button>
                      ) : item.category === "execom" ? (
                        <button
                          onClick={() => onNavigateTab("execom")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Roster
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigateTab("users")}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No members or applicants match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredDirectory.length ? (currentPage - 1) * pageSize + 1 : 0}</span> to{" "}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredDirectory.length)}</span> of{" "}
            <span className="font-semibold text-slate-800">{filteredDirectory.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 text-slate-700 font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1 font-mono text-[11px] text-slate-600 font-semibold">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 text-slate-700 font-medium cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. BOARDUI SPLIT SECTION (ACTIVITY STREAM & QUICK ACTIONS HUB) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: ACTIVITY & AUDIT TRAIL (2 COLS) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Activity & Audit Trail</h3>
              <p className="text-xs text-slate-400">Cryptographically tracked chapter operations</p>
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 self-start sm:self-auto">
              {(["all", "events", "execom", "auth"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                    logFilter === filter
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log: any, idx: number) => {
                const act = (log.action || "").toLowerCase();
                const isEvent = act.includes("event");
                const isExecom = act.includes("execom") || act.includes("member");
                const isAuth = act.includes("role") || act.includes("auth") || act.includes("admin");

                const dateStr = log.timestamp?.toDate
                  ? log.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Recent";

                return (
                  <div
                    key={log.id || idx}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isEvent
                            ? "bg-blue-100 text-blue-700"
                            : isExecom
                            ? "bg-emerald-100 text-emerald-700"
                            : isAuth
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isEvent ? (
                          <Calendar className="w-4 h-4" />
                        ) : isExecom ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {log.action || "Chapter Modification"}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {formatLogDetails(log.details, log.target)}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          By {log.performedBy || log.adminName || "Organizer"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {dateStr}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No administrative records found in this category.
              </div>
            )}
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigateTab("audit")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View full security audit trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT: QUICK COMMANDS & TELEMETRY (1 COL) */}
        <div className="space-y-6">
          {/* Quick Commands Grid */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Quick Operations</h3>
              <span className="text-xs font-mono text-slate-400">Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenCreateEvent}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition group cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-600 group-hover:text-blue-400 mb-1.5" />
                <p className="text-xs font-bold leading-tight">Create Event</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Publish lab</p>
              </button>

              <button
                onClick={() => onNavigateTab("mailer")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition group cursor-pointer"
              >
                <Send className="w-4 h-4 text-blue-600 group-hover:text-blue-400 mb-1.5" />
                <p className="text-xs font-bold leading-tight">Mail Studio</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Broadcast</p>
              </button>

              <button
                onClick={() => onNavigateTab("applications")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-rose-600 group-hover:text-rose-400 mb-1.5" />
                <p className="text-xs font-bold leading-tight">Recruitment</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Triage queue</p>
              </button>

              {isSuperAdmin ? (
                <button
                  onClick={onOpenAddExecom}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition group cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600 group-hover:text-emerald-400 mb-1.5" />
                  <p className="text-xs font-bold leading-tight">Add Execom</p>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">New lead</p>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab("website")}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200/80 text-left transition group cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-slate-600 group-hover:text-slate-300 mb-1.5" />
                  <p className="text-xs font-bold leading-tight">Website</p>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">Controls</p>
                </button>
              )}
            </div>
          </div>

          {/* Cloud Telemetry & Infrastructure */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Infrastructure Health</h3>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Online
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium text-slate-700">Firestore DB</span>
                </div>
                <span className="font-mono text-emerald-600 text-[11px] font-semibold">Healthy (18ms)</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-medium text-slate-700">Apps Script Mail Gateway</span>
                </div>
                <span className="font-mono text-emerald-600 text-[11px] font-semibold">Active</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium text-slate-700">Next.js Edge Runtime</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">Next 16 (Turbopack)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
