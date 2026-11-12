"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
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
  ChevronsUpDown,
  Command,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Megaphone,
  Headphones,
  Settings,
  PanelLeftClose,
  Kanban,
  Bot,
  Image as ImageIcon,
  User,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";
import StatusDot from "@/components/ui/StatusDot";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import { useAuth } from "@/context/AuthContext";

export type AdminTab =
  | "overview"
  | "analytics"
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
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeType?: "count" | "pulse";
  adminOnly?: boolean;
}

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

  const isDark = theme === "dark";

  // Navigation Items matching the BoardUI video & chapter capabilities
  const NAV_ITEMS: NavItem[] = useMemo(() => [
    {
      id: "overview",
      label: "Home",
      icon: LayoutDashboard,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "events",
      label: "Calendar",
      icon: Calendar,
    },
    {
      id: "funds",
      label: "Finance",
      icon: Wallet,
      adminOnly: true,
    },
    {
      id: "users",
      label: "Directory",
      icon: Users,
      adminOnly: true,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : undefined,
      badgeType: "pulse",
    },
    {
      id: "execom",
      label: "Execom Leads",
      icon: Shield,
    },
    {
      id: "mailer",
      label: "Mail Studio",
      icon: Send,
    },
    {
      id: "newsletter",
      label: "Newsletter",
      icon: Mail,
    },
    {
      id: "website",
      label: "Website",
      icon: Globe,
      adminOnly: true,
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: History,
      adminOnly: true,
    },
  ], [pendingApplicationsCount]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return NAV_ITEMS;
    const q = searchQuery.toLowerCase().trim();
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery, NAV_ITEMS]);

  const userName = user?.displayName || user?.email?.split("@")[0] || "Chapter Organizer";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`shrink-0 flex flex-col justify-between rounded-2xl transition-all duration-300 ease-in-out select-none border shadow-2xs lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] overflow-y-auto font-sans ${
        isDark
          ? "bg-[#121215] border-zinc-800/90 text-slate-100"
          : "bg-white border-slate-200/90 text-slate-900"
      } ${isCollapsed ? "w-full lg:w-20 p-2.5" : "w-full lg:w-64 p-3.5"}`}
    >
      <div className="space-y-3.5">
        {/* ================= 1. TOP USER CARD (MATCHING VIDEO) ================= */}
        <div
          className={`flex items-center justify-between rounded-xl p-2 transition ${
            isDark ? "hover:bg-zinc-800/50" : "hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* User Avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={userName}
                className="size-8 rounded-full object-cover border border-zinc-700/60 shrink-0"
              />
            ) : (
              <div
                className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isDark ? "bg-zinc-800 text-slate-200" : "bg-slate-200 text-slate-800"
                }`}
              >
                {userInitial}
              </div>
            )}

            {!isCollapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-semibold truncate tracking-tight">
                  {userName}
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            )}
          </div>

          {/* Sidebar Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden lg:flex size-7 rounded-lg items-center justify-center transition cursor-pointer ${
              isDark
                ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <PanelLeftClose
              className={`w-4 h-4 transition-transform duration-200 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* ================= 2. QUICK SEARCH BAR ================= */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick Search"
              className={`w-full h-8 pl-8 pr-8 rounded-xl text-xs outline-none transition ${
                isDark
                  ? "bg-[#1a1a1e] border border-zinc-800/80 text-white placeholder:text-zinc-500 focus:border-blue-500"
                  : "bg-slate-100 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500"
              }`}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-200"
              >
                ESC
              </button>
            ) : (
              <span
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono flex items-center gap-0.5 px-1 py-0.2 rounded ${
                  isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-200 text-slate-600"
                }`}
              >
                <Command className="w-2.5 h-2.5" />L
              </span>
            )}
          </div>
        )}

        {/* ================= 3. NAVIGATION LIST (MATCHING VIDEO PILL STYLE) ================= */}
        {filteredItems.length === 0 ? (
          <div className="py-6 text-center text-xs space-y-2">
            <p className={isDark ? "text-zinc-500" : "text-slate-400"}>No matching tabs found</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] text-blue-500 hover:underline font-medium cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <nav className="space-y-1 pt-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = item.adminOnly && !isSuperAdmin;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? (isLocked ? `${item.label} (Admin Only)` : item.label) : undefined}
                  className={`group w-full flex items-center justify-between rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isCollapsed ? "p-2.5 justify-center" : "px-3 py-2"
                  } ${
                    isActive
                      ? "bg-[#2563eb] text-white font-semibold shadow-xs"
                      : isLocked
                      ? isDark
                        ? "text-zinc-600 hover:bg-zinc-800/30"
                        : "text-slate-400 hover:bg-slate-50"
                      : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : isLocked
                          ? isDark
                            ? "text-zinc-600"
                            : "text-slate-400"
                          : isDark
                          ? "text-zinc-400 group-hover:text-white"
                          : "text-slate-500 group-hover:text-slate-900"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badges */}
                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge && item.badgeType === "count" && !isActive && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                            isDark ? "bg-zinc-800/90 text-zinc-400" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.badge && item.badgeType === "pulse" && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                          {item.badge}
                        </span>
                      )}

                      {isLocked && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800/70 text-zinc-400 border border-zinc-700/60">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Admin</span>
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ================= 4. BOTTOM SECTION: THEME TOGGLE, SUPPORT, SETTINGS & WORKSPACE ================= */}
      <div className="pt-4 border-t border-zinc-800/70 space-y-3">
        {/* THEME SWITCHER (SUN / MOON PILL) */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Appearance</span>
            <div
              className={`inline-flex items-center gap-1 p-0.5 rounded-full border transition ${
                isDark
                  ? "bg-[#18181b] border-zinc-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              {/* Sun (Light Mode) */}
              <button
                type="button"
                onClick={() => onToggleTheme && isDark && onToggleTheme()}
                title="Light mode"
                className={`size-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                  !isDark
                    ? "bg-white text-amber-500 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Moon (Dark Mode) */}
              <button
                type="button"
                onClick={() => onToggleTheme && !isDark && onToggleTheme()}
                title="Dark mode"
                className={`size-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isDark
                    ? "bg-zinc-800 text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className={`size-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                isDark
                  ? "bg-zinc-800 text-blue-400 hover:text-white"
                  : "bg-slate-100 text-amber-500 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* SUPPORT & SETTINGS ROWS */}
        {!isCollapsed && (
          <div className="space-y-0.5">
            <Link
              href="/contact"
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                isDark
                  ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Headphones className="size-4 shrink-0" />
              <span>Support</span>
            </Link>

            <button
              type="button"
              onClick={() => onSelectTab("website")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                isDark
                  ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Settings className="size-4 shrink-0" />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* CHAPTER WORKSPACE CARD */}
        <div
          className={`rounded-xl p-2 flex items-center justify-between gap-2 transition ${
            isDark
              ? "bg-[#18181b] border border-zinc-800/80 hover:border-zinc-700"
              : "bg-slate-50 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <GDGLogoMark className="w-4 h-4" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">
                  GDG AJCE
                </p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  dsc@amaljyothi.ac.in
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => logOut()}
              title="Sign out of console"
              className={`p-1 rounded-lg transition cursor-pointer ${
                isDark
                  ? "text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                  : "text-slate-400 hover:text-rose-600 hover:bg-slate-200"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
