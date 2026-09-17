"use client";

import React from "react";
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
} from "lucide-react";
import { AdminTab } from "../AdminSidebar";

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

// Helper to safely render log details without crashing when details is an object
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
  return (
    <div className="space-y-8 select-none">
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#80827f] uppercase">
              COMMUNITY BUILDERS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
          </div>
          <div className="pt-4 pb-1">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#2c2e2a]">
              {stats.totalUsers.toLocaleString()}
            </h3>
            <p className="text-xs text-[#80827f] mt-1">Registered Google developer profiles</p>
          </div>
          <button
            onClick={() => onNavigateTab("users")}
            className="pt-4 mt-2 border-t border-[#f5f1e4] flex items-center justify-between text-xs font-medium text-[#2ba0ff] hover:underline"
          >
            <span>{isSuperAdmin ? "Manage Member Directory" : "Directory (Admin Only)"}</span>
            {isSuperAdmin ? (
              <ArrowRight className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3 h-3 text-[#80827f]" />
            )}
          </button>
        </div>

        {/* Execom Leads */}
        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#80827f] uppercase">
              EXECOM ORGANIZERS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
          </div>
          <div className="pt-4 pb-1">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#2c2e2a]">
              {stats.coreUsers}
            </h3>
            <p className="text-xs text-[#80827f] mt-1">Track leads & chapter organizers</p>
          </div>
          <button
            onClick={() => onNavigateTab("execom")}
            className="pt-4 mt-2 border-t border-[#f5f1e4] flex items-center justify-between text-xs font-medium text-[#34A853] hover:underline"
          >
            <span>Organizers Showcase</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Events & Workshops */}
        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#80827f] uppercase">
              EVENTS & LABS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
          </div>
          <div className="pt-4 pb-1">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#2c2e2a]">
              {stats.totalEvents}
            </h3>
            <p className="text-xs text-[#80827f] mt-1">Conducted study jams & sprints</p>
          </div>
          <button
            onClick={() => onNavigateTab("events")}
            className="pt-4 mt-2 border-t border-[#f5f1e4] flex items-center justify-between text-xs font-medium text-[#2c2e2a] hover:underline"
          >
            <span>Events Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pending Recruitment Applications */}
        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#80827f] uppercase">
              APPLICATIONS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
          </div>
          <div className="pt-4 pb-1">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#2c2e2a]">
              {stats.pendingApplications}
            </h3>
            <p className="text-xs text-[#80827f] mt-1">Pending candidate reviews</p>
          </div>
          <button
            onClick={() => onNavigateTab("applications")}
            className="pt-4 mt-2 border-t border-[#f5f1e4] flex items-center justify-between text-xs font-medium text-[#EA4335] hover:underline"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. QUICK ACTIONS DOCK */}
      <div className="p-6 rounded-[36px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff705d]" />
            <h4 className="text-sm font-bold text-[#2c2e2a]">Quick Actions</h4>
          </div>
          <span className="text-xs text-[#80827f]">Execute common chapter operations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenCreateEvent}
            className="p-4 rounded-[24px] bg-white hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-white/10 flex items-center justify-center text-[#2c2e2a] group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Create Event</p>
              <p className="text-[10px] text-[#80827f] group-hover:text-white/70">Publish workshop</p>
            </div>
          </button>

          {isSuperAdmin ? (
            <button
              onClick={onOpenAddExecom}
              className="p-4 rounded-[24px] bg-white hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-white/10 flex items-center justify-center text-[#2c2e2a] group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Add Execom Lead</p>
                <p className="text-[10px] text-[#80827f] group-hover:text-white/70">Update chapter core</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab("execom")}
              className="p-4 rounded-[24px] bg-white hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-white/10 flex items-center justify-center text-[#2c2e2a] group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Execom Directory</p>
                <p className="text-[10px] text-[#80827f] group-hover:text-white/70">Team roster</p>
              </div>
            </button>
          )}

          <button
            onClick={() => onNavigateTab("applications")}
            className="p-4 rounded-[24px] bg-white hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-white/10 flex items-center justify-center text-[#2c2e2a] group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Review Candidates</p>
              <p className="text-[10px] text-[#80827f] group-hover:text-white/70">Recruitment pipeline</p>
            </div>
          </button>

          {isSuperAdmin ? (
            <button
              onClick={() => onNavigateTab("funds")}
              className="p-4 rounded-[24px] bg-white hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-white/10 flex items-center justify-center text-[#2c2e2a] group-hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Record Expense</p>
                <p className="text-[10px] text-[#80827f] group-hover:text-white/70">Treasury ledger</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab("events")}
              className="p-4 rounded-[24px] bg-white hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-white/10 flex items-center justify-center text-[#2c2e2a] group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Events Deck</p>
                <p className="text-[10px] text-[#80827f] group-hover:text-white/70">Manage sessions</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 3. RECENT ACTIVITY & AUDIT TRAIL STREAM */}
      <div className="p-6 sm:p-8 rounded-[36px] bg-white border border-[#d5d5d4] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#f5f1e4] pb-4">
          <div>
            <h4 className="text-lg font-bold text-[#2c2e2a]">Recent Chapter Operations</h4>
            <p className="text-xs text-[#80827f]">Real-time audit log of administrative actions</p>
          </div>
          <button
            onClick={() => onNavigateTab("audit")}
            className="text-xs font-semibold text-[#2ba0ff] hover:underline flex items-center gap-1.5"
          >
            <span>{isSuperAdmin ? "View Full Audit Log" : "Audit Trail (Admin Only)"}</span>
            {isSuperAdmin ? (
              <ArrowRight className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3 h-3 text-[#80827f]" />
            )}
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#80827f] font-mono">
            No administrative events recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.slice(0, 5).map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3.5 rounded-[20px] bg-[#f5f1e4] border border-[#e0dbce] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-[#d5d5d4] text-[#2c2e2a]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2c2e2a]">
                      {log.action?.replace(/_/g, " ") || "Operation"}
                    </p>
                    <p className="text-[11px] text-[#80827f]">
                      By <span className="font-semibold text-[#2c2e2a]">{typeof log.performedBy === "string" ? log.performedBy : "Admin"}</span> • {formatLogDetails(log.details, log.target)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#80827f]">
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString() : "Recent"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
