"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  FileText,
  Wallet,
  History,
  Shield,
  ArrowUpRight,
  Lock,
  Mail,
  Globe,
  Send,
  Search,
  Sparkles,
  ChevronRight,
  Command,
} from "lucide-react";
import Link from "next/link";
import StatusDot from "@/components/ui/StatusDot";
import Chip from "@/components/ui/Chip";

export type AdminTab =
  | "overview"
  | "execom"
  | "events"
  | "newsletter"
  | "mailer"
  | "users"
  | "applications"
  | "funds"
  | "audit"
  | "website";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingApplicationsCount?: number;
  isSuperAdmin?: boolean;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  badgeColor?: "red" | "blue" | "green" | "yellow";
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Executive Deck",
    items: [
      {
        id: "overview",
        label: "Chapter Cockpit",
        icon: LayoutDashboard,
        description: "Velocity, metrics & triage",
      },
    ],
  },
  {
    title: "Operations & Broadcast",
    items: [
      {
        id: "events",
        label: "Events & Labs",
        icon: Calendar,
        description: "Workshops & RSVPs",
      },
      {
        id: "newsletter",
        label: "Weekly Newsletter",
        icon: Mail,
        description: "Drafts & subscribers",
      },
      {
        id: "mailer",
        label: "Mail Studio",
        icon: Send,
        description: "Apps Script & Unlayer",
        badge: "Live",
        badgeColor: "blue",
      },
      {
        id: "website",
        label: "Website Controls",
        icon: Globe,
        description: "Sections & toggles",
      },
    ],
  },
  {
    title: "Talent & Community",
    items: [
      {
        id: "applications",
        label: "Recruitment Pipeline",
        icon: FileText,
        description: "Candidate review queue",
      },
      {
        id: "execom",
        label: "Execom Directory",
        icon: Users,
        description: "Organizers & leads",
      },
    ],
  },
  {
    title: "Governance & Audit",
    items: [
      {
        id: "users",
        label: "Members & Roles",
        icon: UserCheck,
        description: "Access & permissions",
        adminOnly: true,
      },
      {
        id: "funds",
        label: "Chapter Treasury",
        icon: Wallet,
        description: "Budgets & sponsorships",
        adminOnly: true,
      },
      {
        id: "audit",
        label: "Security Audit Trail",
        icon: History,
        description: "Immutable event logs",
        adminOnly: true,
      },
    ],
  },
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingApplicationsCount = 0,
  isSuperAdmin = true,
}: AdminSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return NAV_SECTIONS;
    const q = searchQuery.toLowerCase().trim();

    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      ),
    })).filter((section) => section.items.length > 0);
  }, [searchQuery]);

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col justify-between rounded-[28px] bg-white border border-slate-200/90 shadow-sm p-4 select-none">
      <div className="space-y-4">
        {/* CHAPTER & ROLE HEADER */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-xs">
              {isSuperAdmin ? (
                <Shield className="w-4 h-4 text-blue-400" />
              ) : (
                <Users className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {isSuperAdmin ? "Admin Control" : "Core Console"}
                </h2>
                <Chip
                  color={isSuperAdmin ? "blue" : "green"}
                  variant="subtle"
                  className="text-[10px] py-0 px-2 font-mono uppercase"
                >
                  {isSuperAdmin ? "Super" : "Lead"}
                </Chip>
              </div>
              <p className="text-[11px] font-mono text-slate-500">GDG on Campus AJCE</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
            <StatusDot color="green" ping={true} />
            <span className="text-[10px] font-mono text-slate-600 font-semibold">Live</span>
          </div>
        </div>

        {/* SEARCH / COMMAND FILTER */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter modules..."
            className="w-full h-8.5 pl-8.5 pr-8 rounded-xl bg-slate-100/70 border border-transparent focus:border-blue-400 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 transition outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-700"
            >
              ESC
            </button>
          ) : (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />K
            </span>
          )}
        </div>

        {/* NAVIGATION GROUPS */}
        <div className="space-y-4 pt-1">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </span>
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isLocked = item.adminOnly && !isSuperAdmin;
                  const isApplications = item.id === "applications";

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left relative ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : isLocked
                          ? "text-slate-400 hover:bg-slate-50/80"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      {/* ACTIVE INDICATOR BAR */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4.5 bg-blue-500 rounded-r-full" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-white/10 text-blue-400"
                              : isLocked
                              ? "bg-slate-100 text-slate-400"
                              : "bg-slate-100 group-hover:bg-white text-slate-600 group-hover:text-blue-600 group-hover:shadow-2xs"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="truncate leading-tight">{item.label}</p>
                          {item.description && (
                            <p
                              className={`text-[10px] truncate leading-tight mt-0.5 ${
                                isActive
                                  ? "text-slate-400"
                                  : "text-slate-400 group-hover:text-slate-500"
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* BADGES & COUNTERS */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isApplications && pendingApplicationsCount > 0 && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse ${
                              isActive
                                ? "bg-rose-500 text-white"
                                : "bg-rose-100 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {pendingApplicationsCount}
                          </span>
                        )}

                        {item.badge && !isApplications && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              isActive
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {isLocked && (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK FOOTER & PORTAL SHORTCUTS */}
      <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
        <Link
          href="/about#execom"
          target="_blank"
          className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Execom Page
          </span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </Link>
        <Link
          href="/programs"
          target="_blank"
          className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Events Portal
          </span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </aside>
  );
}
