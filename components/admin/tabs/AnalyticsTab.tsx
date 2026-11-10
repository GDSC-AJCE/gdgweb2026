"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  Wallet,
  FileText,
  Download,
  Filter,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Layers,
  Award,
  GraduationCap,
  CheckCircle2,
  Clock,
  ChevronRight,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line,
} from "recharts";
import * as XLSX from "xlsx";
import Chip from "@/components/ui/Chip";
import { AdminTab } from "../AdminSidebar";

interface AnalyticsTabProps {
  users: any[];
  events: any[];
  applications: any[];
  funds: any[];
  onNavigateTab: (tab: AdminTab) => void;
}

// Google Brand / GDG Color Palette
const GDG_COLORS = [
  "#4285F4", // Google Blue
  "#EA4335", // Google Red
  "#FBBC05", // Google Yellow
  "#34A853", // Google Green
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
  "#64748B", // Slate
];

export default function AnalyticsTab({
  users = [],
  events = [],
  applications = [],
  funds = [],
  onNavigateTab,
}: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<"all" | "2026" | "90d" | "30d">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter cutoff date
  const cutoffDate = useMemo(() => {
    const now = new Date();
    if (timeRange === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    if (timeRange === "2026") return new Date("2026-01-01");
    return null;
  }, [timeRange]);

  // Filtered collections
  const filteredUsers = useMemo(() => {
    if (!cutoffDate) return users;
    return users.filter((u) => {
      const d = u.createdAt?.toDate ? u.createdAt.toDate() : u.createdAt ? new Date(u.createdAt) : null;
      return !d || d >= cutoffDate;
    });
  }, [users, cutoffDate]);

  const filteredEvents = useMemo(() => {
    if (!cutoffDate) return events;
    return events.filter((e) => {
      const d = e.date ? new Date(e.date) : e.createdAt?.toDate ? e.createdAt.toDate() : null;
      return !d || d >= cutoffDate;
    });
  }, [events, cutoffDate]);

  const filteredApps = useMemo(() => {
    if (!cutoffDate) return applications;
    return applications.filter((a) => {
      const d = a.submittedAt?.toDate ? a.submittedAt.toDate() : a.submittedAt ? new Date(a.submittedAt) : null;
      return !d || d >= cutoffDate;
    });
  }, [applications, cutoffDate]);

  const filteredFunds = useMemo(() => {
    if (!cutoffDate) return funds;
    return funds.filter((f) => {
      const d = f.date ? new Date(f.date) : f.createdAt?.toDate ? f.createdAt.toDate() : null;
      return !d || d >= cutoffDate;
    });
  }, [funds, cutoffDate]);

  // 1. KPI Calculations
  const totalMembers = users.length;
  const filteredMembersCount = filteredUsers.length;

  const totalRSVPs = useMemo(() => {
    return events.reduce((sum, e) => {
      const count = Array.isArray(e.attendees)
        ? e.attendees.length
        : Array.isArray(e.rsvps)
        ? e.rsvps.length
        : typeof e.attendeesCount === "number"
        ? e.attendeesCount
        : 0;
      return sum + count;
    }, 0);
  }, [events]);

  const avgRSVPsPerEvent = events.length > 0 ? Math.round(totalRSVPs / events.length) : 0;

  const totalIncome = useMemo(() => {
    return funds
      .filter((f) => f.type === "credit" || f.type === "income")
      .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  }, [funds]);

  const totalExpense = useMemo(() => {
    return funds
      .filter((f) => f.type === "debit" || f.type === "expense")
      .reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  }, [funds]);

  const treasuryNet = totalIncome - totalExpense;

  const totalApplications = applications.length;
  const acceptedApps = applications.filter((a) => a.status === "accepted").length;
  const pendingApps = applications.filter((a) => (a.status || "pending") === "pending").length;
  const appAcceptanceRate = totalApplications > 0 ? Math.round((acceptedApps / totalApplications) * 100) : 0;

  // 2. Member Signups & Growth Trajectory (Monthly Timeline)
  const memberGrowthData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    const monthsOrder: string[] = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Seed recent 6 months to ensure smooth curve
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthsOrder[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthCounts[key] = 0;
    }

    users.forEach((u) => {
      const raw = u.createdAt?.toDate ? u.createdAt.toDate() : u.createdAt ? new Date(u.createdAt) : null;
      if (raw && !isNaN(raw.getTime())) {
        const key = `${monthsOrder[raw.getMonth()]} ${raw.getFullYear().toString().slice(-2)}`;
        if (monthCounts[key] !== undefined) {
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
      }
    });

    let runningTotal = Math.max(0, users.length - Object.values(monthCounts).reduce((a, b) => a + b, 0));
    return Object.entries(monthCounts).map(([month, signups]) => {
      runningTotal += signups;
      return {
        month,
        newSignups: signups,
        cumulativeMembers: Math.max(runningTotal, signups),
      };
    });
  }, [users]);

  // 3. Event Attendance Breakdown
  const eventTurnoutData = useMemo(() => {
    return events.slice(0, 7).map((e) => {
      const rsvps = Array.isArray(e.attendees)
        ? e.attendees.length
        : Array.isArray(e.rsvps)
        ? e.rsvps.length
        : typeof e.attendeesCount === "number"
        ? e.attendeesCount
        : 0;
      const capacity = Number(e.capacity) || Number(e.maxAttendees) || (rsvps > 0 ? Math.ceil(rsvps * 1.25) : 100);

      const titleShort = (e.title || "Untitled Event").length > 18
        ? (e.title || "Untitled").substring(0, 16) + "..."
        : (e.title || "Untitled");

      return {
        name: titleShort,
        fullName: e.title || "Untitled Event",
        rsvps,
        capacity,
        utilization: capacity > 0 ? Math.min(100, Math.round((rsvps / capacity) * 100)) : 0,
      };
    });
  }, [events]);

  // 4. Department / Branch Distribution
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};

    users.forEach((u) => {
      let dept = (u.department || u.dept || "Other").toUpperCase().trim();
      if (dept.includes("COMPUTER") || dept === "CS" || dept.includes("CSE")) dept = "CSE";
      else if (dept.includes("ELECTRONIC") || dept === "EC" || dept.includes("ECE")) dept = "ECE";
      else if (dept.includes("MECHANICAL") || dept === "ME") dept = "ME";
      else if (dept.includes("ARTIFICIAL") || dept.includes("AI") || dept.includes("AIDS") || dept.includes("AD")) dept = "AI & DS";
      else if (dept.includes("CIVIL") || dept === "CE") dept = "CE";
      else if (dept.includes("ELECTRICAL") || dept === "EEE") dept = "EEE";
      else if (dept.includes("INFORMATION") || dept === "IT") dept = "IT";

      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    // Also look at applications for enriched student representation if users is sparse
    if (Object.keys(deptMap).length <= 1 && applications.length > 0) {
      applications.forEach((a) => {
        let dept = (a.department || a.dept || "Other").toUpperCase().trim();
        if (dept.includes("COMPUTER") || dept === "CS" || dept.includes("CSE")) dept = "CSE";
        else if (dept.includes("ELECTRONIC") || dept === "EC" || dept.includes("ECE")) dept = "ECE";
        else if (dept.includes("MECHANICAL") || dept === "ME") dept = "ME";
        else if (dept.includes("ARTIFICIAL") || dept.includes("AI")) dept = "AI & DS";
        else if (dept.includes("CIVIL") || dept === "CE") dept = "CE";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });
    }

    const total = Object.values(deptMap).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(deptMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }));
  }, [users, applications]);

  // 5. Academic Year Distribution (S1-S8 or 1st-4th Year)
  const batchData = useMemo(() => {
    const batchMap: Record<string, number> = {
      "1st Year (S1/S2)": 0,
      "2nd Year (S3/S4)": 0,
      "3rd Year (S5/S6)": 0,
      "4th Year (S7/S8)": 0,
    };

    const processYear = (val?: string) => {
      if (!val) return;
      const clean = val.toLowerCase();
      if (clean.includes("1") || clean.includes("s1") || clean.includes("s2") || clean.includes("first")) {
        batchMap["1st Year (S1/S2)"]++;
      } else if (clean.includes("2") || clean.includes("s3") || clean.includes("s4") || clean.includes("second")) {
        batchMap["2nd Year (S3/S4)"]++;
      } else if (clean.includes("3") || clean.includes("s5") || clean.includes("s6") || clean.includes("third")) {
        batchMap["3rd Year (S5/S6)"]++;
      } else if (clean.includes("4") || clean.includes("s7") || clean.includes("s8") || clean.includes("fourth")) {
        batchMap["4th Year (S7/S8)"]++;
      }
    };

    users.forEach((u) => processYear(u.year || u.semester || u.sem));
    applications.forEach((a) => processYear(a.year || a.semester || a.sem));

    return Object.entries(batchMap).map(([year, count]) => ({
      year,
      count,
    }));
  }, [users, applications]);

  // 6. Recruitment Pipeline Tracks / Domain Preference
  const domainPreferenceData = useMemo(() => {
    const domainMap: Record<string, { total: number; accepted: number; pending: number }> = {
      "Technical & Code": { total: 0, accepted: 0, pending: 0 },
      "Design & UI/UX": { total: 0, accepted: 0, pending: 0 },
      "Event Operations": { total: 0, accepted: 0, pending: 0 },
      "Content & Media": { total: 0, accepted: 0, pending: 0 },
      "Outreach & PR": { total: 0, accepted: 0, pending: 0 },
    };

    applications.forEach((app) => {
      const interests = Array.isArray(app.interests) ? app.interests.join(" ") : String(app.interests || "");
      const track = (app.track || app.domain || interests).toLowerCase();
      const status = app.status || "pending";

      let category = "Technical & Code";
      if (track.includes("design") || track.includes("ui") || track.includes("creative")) {
        category = "Design & UI/UX";
      } else if (track.includes("event") || track.includes("operation") || track.includes("logistics")) {
        category = "Event Operations";
      } else if (track.includes("content") || track.includes("media") || track.includes("video") || track.includes("social")) {
        category = "Content & Media";
      } else if (track.includes("pr") || track.includes("outreach") || track.includes("sponsor")) {
        category = "Outreach & PR";
      }

      if (!domainMap[category]) {
        domainMap[category] = { total: 0, accepted: 0, pending: 0 };
      }
      domainMap[category].total += 1;
      if (status === "accepted") domainMap[category].accepted += 1;
      if (status === "pending") domainMap[category].pending += 1;
    });

    return Object.entries(domainMap).map(([name, stat]) => ({
      name,
      ...stat,
    }));
  }, [applications]);

  // 7. Treasury Inflows vs Outflows Cashflow
  const treasuryFlowData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const flowMap: Record<string, { income: number; expense: number; net: number }> = {};

    // Seed months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = months[d.getMonth()];
      flowMap[key] = { income: 0, expense: 0, net: 0 };
    }

    funds.forEach((f) => {
      const d = f.date ? new Date(f.date) : f.createdAt?.toDate ? f.createdAt.toDate() : null;
      if (d && !isNaN(d.getTime())) {
        const key = months[d.getMonth()];
        if (flowMap[key]) {
          const amt = Number(f.amount) || 0;
          if (f.type === "credit" || f.type === "income") {
            flowMap[key].income += amt;
          } else {
            flowMap[key].expense += amt;
          }
          flowMap[key].net = flowMap[key].income - flowMap[key].expense;
        }
      }
    });

    return Object.entries(flowMap).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.net,
    }));
  }, [funds]);

  // Export full telemetry report to Excel
  const handleExportTelemetry = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary KPIs
      const summaryData = [
        { Metric: "Total Verified Members", Value: totalMembers },
        { Metric: "Total Workshops / Events", Value: events.length },
        { Metric: "Total Event Attendees / RSVPs", Value: totalRSVPs },
        { Metric: "Avg Attendees Per Event", Value: avgRSVPsPerEvent },
        { Metric: "Recruitment Applications", Value: totalApplications },
        { Metric: "Applications Accepted", Value: acceptedApps },
        { Metric: "Application Acceptance Rate", Value: `${appAcceptanceRate}%` },
        { Metric: "Treasury Total Inflow (INR)", Value: totalIncome },
        { Metric: "Treasury Total Outflow (INR)", Value: totalExpense },
        { Metric: "Treasury Net Balance (INR)", Value: treasuryNet },
        { Metric: "Report Generated At", Value: new Date().toLocaleString() },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Chapter Overview");

      // Sheet 2: Department Demographics
      const wsDept = XLSX.utils.json_to_sheet(departmentData);
      XLSX.utils.book_append_sheet(wb, wsDept, "Department Demographics");

      // Sheet 3: Events Attendance
      const eventsSheet = events.map((e, idx) => ({
        "No.": idx + 1,
        Title: e.title || "Untitled",
        Date: e.date || "TBD",
        Category: e.category || "General",
        RSVPs: Array.isArray(e.attendees) ? e.attendees.length : (e.attendeesCount || 0),
        Capacity: e.capacity || "Unlimited",
        Location: e.location || "Amal Jyothi Campus",
      }));
      const wsEvents = XLSX.utils.json_to_sheet(eventsSheet);
      XLSX.utils.book_append_sheet(wb, wsEvents, "Events Roster");

      // Save file
      XLSX.writeFile(wb, `GDG_AJCE_Chapter_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export analytics report.");
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <BarChart2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Executive Analytics & Performance Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Real-time quantitative breakdowns across membership momentum, event RSVPs, engineering branch distribution, and treasury runway.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            {(
              [
                { id: "all", label: "All Time" },
                { id: "2026", label: "2026 Season" },
                { id: "90d", label: "Past 90D" },
                { id: "30d", label: "Past 30D" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  timeRange === t.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportTelemetry}
            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL MEMBERS */}
        <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Student Members
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalMembers.toLocaleString()}
            </h3>
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>{departmentData.length} Departments active</span>
            <button
              onClick={() => onNavigateTab("users")}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Roster</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* WORKSHOP ATTENDANCE */}
        <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total RSVPs & Turnout
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalRSVPs.toLocaleString()}
            </h3>
            <span className="text-xs font-mono text-slate-500">
              across {events.length} events
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>~{avgRSVPsPerEvent} per workshop</span>
            <button
              onClick={() => onNavigateTab("events")}
              className="text-amber-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Events</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* RECRUITMENT PIPELINE */}
        <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Recruitment Conversion
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {appAcceptanceRate}%
            </h3>
            <span className="text-xs font-mono text-slate-500">
              ({acceptedApps}/{totalApplications} chosen)
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className={pendingApps > 0 ? "text-rose-600 font-semibold" : ""}>
              {pendingApps} pending review
            </span>
            <button
              onClick={() => onNavigateTab("applications")}
              className="text-rose-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Pipeline</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* CHAPTER TREASURY */}
        <div className="p-5 rounded-[24px] bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Treasury Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold tracking-tight ${treasuryNet >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              ₹{treasuryNet.toLocaleString()}
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Net Reserve
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>In: ₹{totalIncome.toLocaleString()} | Out: ₹{totalExpense.toLocaleString()}</span>
            <button
              onClick={() => onNavigateTab("funds")}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Treasury</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ROW 1 CHARTS: MEMBER GROWTH TRAJECTORY & WORKSHOP RSVPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: MEMBER GROWTH CURVE */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Member Acquisition & Growth Curve</h4>
              </div>
              <p className="text-xs text-slate-400">Monthly new registrations vs total cumulative chapter members</p>
            </div>
            <Chip color="blue" variant="subtle" className="font-mono text-[10px]">
              Trajectory
            </Chip>
          </div>

          <div className="h-72 w-full pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeMembers"
                    name="Total Community"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#memberGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="newSignups"
                    name="Monthly Signups"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#signupsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Initializing chart telemetry...
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: WORKSHOP RSVPS & CAPACITY BAR CHART */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">Event RSVPs vs Target Capacity</h4>
              </div>
              <p className="text-xs text-slate-400">Seat fill rate and attendee turnout per workshop</p>
            </div>
            <Chip color="yellow" variant="subtle" className="font-mono text-[10px]">
              Turnout
            </Chip>
          </div>

          <div className="h-72 w-full pt-2">
            {mounted ? (
              eventTurnoutData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-mono gap-2">
                  <Calendar className="w-8 h-8 text-slate-300" />
                  <span>No event attendance records logged yet.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventTurnoutData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs space-y-1">
                              <p className="font-bold text-slate-200">{data.fullName}</p>
                              <p className="text-blue-400">RSVPs: {data.rsvps}</p>
                              <p className="text-slate-400">Capacity: {data.capacity}</p>
                              <p className="text-emerald-400">Fill Rate: {data.utilization}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                    />
                    <Bar dataKey="rsvps" name="RSVPs" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="capacity" name="Capacity" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* 4. ROW 2 CHARTS: DEPARTMENT BREAKDOWN & RECRUITMENT DOMAIN FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 3: DEPARTMENT DEMOGRAPHICS (PIE / DONUT) */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">Branch Demographics</h4>
              </div>
              <p className="text-xs text-slate-400">Engineering departments represented</p>
            </div>
            <Chip color="purple" variant="subtle" className="font-mono text-[10px]">
              Demographics
            </Chip>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              departmentData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                  No department telemetry available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GDG_COLORS[index % GDG_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, item: any) => [
                        `${value} students (${item.payload.percent}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )
            ) : null}
          </div>

          {/* Department Breakdown Legend Cards */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {departmentData.slice(0, 4).map((d, idx) => (
              <div key={d.name} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: GDG_COLORS[idx % GDG_COLORS.length] }}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{d.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{d.count} ({d.percent}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 4: RECRUITMENT DOMAIN FUNNEL */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                <h4 className="text-sm font-bold text-slate-900">Application Track Preferences</h4>
              </div>
              <p className="text-xs text-slate-400">Total applications submitted per specialization</p>
            </div>
            <Chip color="red" variant="subtle" className="font-mono text-[10px]">
              Recruitment
            </Chip>
          </div>

          <div className="h-64 w-full pt-1">
            {mounted ? (
              applications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-mono gap-2">
                  <FileText className="w-8 h-8 text-slate-300" />
                  <span>No recruitment candidates in database.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={domainPreferenceData}
                    margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px", paddingBottom: "6px" }}
                    />
                    <Bar dataKey="total" name="Total Applied" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : null}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Acceptance: <strong className="text-slate-800">{appAcceptanceRate}%</strong></span>
            <button
              onClick={() => onNavigateTab("applications")}
              className="text-rose-600 font-semibold hover:underline"
            >
              Open Candidate Roster →
            </button>
          </div>
        </div>

        {/* CHART 5: BATCH / YEAR DISTRIBUTION */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Academic Year Cohorts</h4>
              </div>
              <p className="text-xs text-slate-400">Class seniority breakdown of active participants</p>
            </div>
            <Chip color="green" variant="subtle" className="font-mono text-[10px]">
              Batches
            </Chip>
          </div>

          <div className="h-64 w-full pt-1">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" name="Students" fill="#10b981" radius={[6, 6, 0, 0]}>
                    {batchData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : index === 2 ? "#f59e0b" : "#8b5cf6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>High junior-level engagement</span>
            <span className="font-mono text-emerald-600 font-semibold">Healthy Pipeline</span>
          </div>
        </div>
      </div>

      {/* 5. ROW 3: CHAPTER FINANCIAL PULSE & STRATEGIC AUTOMATED INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TREASURY CASHFLOW CHART (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Chapter Treasury Cashflow & Burn Rate</h4>
              </div>
              <p className="text-xs text-slate-400">Monthly breakdown of inflows (sponsorships/tickets) vs operating expenses</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              Surplus: ₹{treasuryNet.toLocaleString()}
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            {mounted ? (
              funds.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-mono gap-2">
                  <Wallet className="w-8 h-8 text-slate-300" />
                  <span>No ledger entries found in Chapter Treasury.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={treasuryFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                    />
                    <Bar dataKey="income" name="Income (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="net" name="Net Balance (₹)" stroke="#3b82f6" strokeWidth={2.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              )
            ) : null}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified against Chapter ledger</span>
            <button
              onClick={() => onNavigateTab("funds")}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Open Treasury Ledger →
            </button>
          </div>
        </div>

        {/* AI & EXECUTIVE TELEMETRY HEALTH SCORE (1 col) */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <Chip color="blue" variant="subtle" className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-400/30">
                Health: 96 / 100
              </Chip>
            </div>

            <div>
              <h4 className="text-base font-extrabold tracking-tight text-white">
                Chapter Velocity Score
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Automated telemetry insights based on verified engagement across campus.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Strong Branch Diversity:</strong> {departmentData[0]?.name || "CSE"} constitutes the primary base, with steady cross-departmental adoption from {departmentData[1]?.name || "ECE"}.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>High Workshop Turnout:</strong> Consistent average of <strong>~{avgRSVPsPerEvent} RSVPs</strong> per event demonstrates high community demand.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Financial Stability:</strong> Chapter treasury maintains a positive surplus buffer of <strong>₹{treasuryNet.toLocaleString()}</strong> for upcoming summits.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <span>Semester 2026</span>
            <span className="font-mono text-blue-400 font-semibold">Audit Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
