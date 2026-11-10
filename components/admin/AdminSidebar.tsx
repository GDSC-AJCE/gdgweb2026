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
  ChevronLeft,
  Command,
  BarChart3,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import StatusDot from "@/components/ui/StatusDot";
import Chip from "@/components/ui/Chip";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import { useAuth } from "@/context/AuthContext";

export type AdminTab =
  | "overview"
  | "analytics"
  | "execom"
  | "events"
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
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
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
      {
        id: "analytics",
        label: "Analytics & Telemetry",
        icon: BarChart3,
        description: "Charts, growth & demographics",
        badge: "Live",
        badgeColor: "blue",
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
        id: "mailer",
        label: "Mail Studio",
        icon: Send,
        description: "Apps Script & Templates",
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
  theme = "light",
  onToggleTheme,
}: AdminSidebarProps) {
  const { user, logOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={`shrink-0 flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-3.5 select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-full lg:w-20" : "w-full lg:w-72"
      }`}
    >
      <div className="space-y-3.5">
        {/* CHAPTER / WORKSPACE HEADER (BOARDUI STYLE) */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <GDGLogoMark className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-slate-900 truncate tracking-tight">
                    GDG on Campus
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold">
                    {isSuperAdmin ? "Admin" : "Lead"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate">AJCE Chapter</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex size-7 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 items-center justify-center transition cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* SEARCH / COMMAND FILTER INPUT */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter modules..."
              className="w-full h-8 pl-8 pr-8 rounded-xl bg-slate-100/70 border border-transparent focus:border-blue-400 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 transition outline-none"
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
        )}

        {/* NAVIGATION GROUPS */}
        <div className="space-y-4 pt-1">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    {section.title}
                  </span>
                </div>
              )}

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
                      title={isCollapsed ? item.label : undefined}
                      className={`group w-full flex items-center justify-between rounded-xl text-xs font-medium transition-all text-left relative cursor-pointer ${
                        isCollapsed ? "p-2 justify-center" : "px-2.5 py-2"
                      } ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs font-semibold"
                          : isLocked
                          ? "text-slate-400 hover:bg-slate-50/80"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && !isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r-full" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-white/10 text-blue-400"
                              : isLocked
                              ? "bg-slate-100 text-slate-400"
                              : "bg-slate-100 group-hover:bg-white text-slate-600 group-hover:text-blue-600 group-hover:shadow-2xs"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        {!isCollapsed && (
                          <div className="truncate">
                            <p className="truncate leading-tight">{item.label}</p>
                            {item.description && (
                              <p
                                className={`text-[10px] truncate leading-tight mt-0.5 ${
                                  isActive ? "text-slate-400" : "text-slate-400 group-hover:text-slate-500"
                                }`}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Badges / Counters */}
                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {isApplications && pendingApplicationsCount > 0 && (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full animate-pulse ${
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
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK FOOTER & PORTAL SHORTCUTS */}
      <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="space-y-1">
              <Link
                href="/about#execom"
                target="_blank"
                className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Live Execom Page
                </span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link
                href="/programs"
                target="_blank"
                className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  Events Portal
                </span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </Link>
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    {theme === "dark" ? (
                      <Sun className="size-3.5 text-amber-500" />
                    ) : (
                      <Moon className="size-3.5 text-slate-500" />
                    )}
                    <span>Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                    {theme}
                  </span>
                </button>
              )}
            </div>

            {/* Bottom User Profile Tile */}
            {user && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Admin"}
                      className="size-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="size-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(user.displayName || "A").charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user.displayName || "Chapter Lead"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => logOut()}
                  title="Sign Out"
                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Collapsed Mini Footer */
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              title="Return to site"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
            >
              <Globe className="w-4 h-4" />
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => logOut()}
                title="Sign out"
                className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
