"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  ExternalLink,
  Shield,
  Sparkles,
  Command,
  Search,
  Bell,
  Home,
  ChevronRight,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StatusDot from "@/components/ui/StatusDot";
import Chip from "@/components/ui/Chip";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  activeTab?: string;
  onOpenSearch?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  activeTab,
  onOpenSearch,
  theme = "light",
  onToggleTheme,
}: AdminHeaderProps) {
  const { user, userData, isAdmin, logOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const isDark = theme === "dark";

  const userRoleLabel = isAdmin
    ? "Super Admin"
    : userData?.role === "core-manage"
    ? "Core Manager"
    : userData?.role === "core"
    ? "Core Lead"
    : "Administrator";

  const userName = user?.displayName || user?.email?.split("@")[0] || "Chapter Lead";

  // Notifications state with dismiss capability
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Execom Candidate",
      description: "Candidate applied for Executive Committee",
      time: "10m ago",
      unread: true,
    },
    {
      id: "2",
      title: "Workshop RSVPs Active",
      description: "Upcoming lab session reached 92% capacity",
      time: "1h ago",
      unread: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 select-none pb-2 font-sans">
      {/* Title & BoardUI Breadcrumbs */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-400 mb-1 font-medium">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
            <span className="size-4.5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              G
            </span>
            <span>GDG AJCE</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
            <span className="size-4 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[9px] font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span>{userName}</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
          <span className="text-blue-500 font-semibold capitalize font-mono text-[11px]">
            {activeTab || "Overview"}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/20 text-[11px] font-mono font-bold">
              <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Super Admin</span>
            </span>
          ) : userData?.role === "core-manage" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20 text-[11px] font-mono font-bold">
              <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Core Manager</span>
            </span>
          ) : userData?.role === "core" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 text-[11px] font-mono font-bold">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Core Lead</span>
            </span>
          ) : null}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">{subtitle}</p>
      </div>

      {/* Right Action Controls (matching video header: Notification, Filters, Exit, Profile) */}
      <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
        {/* System Health Indicators */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white dark:bg-[#141416] border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <StatusDot color="green" />
            <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 font-medium">Firestore</span>
          </div>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <StatusDot color="blue" />
            <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 font-medium">Mail Gateway</span>
          </div>
        </div>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="size-9 rounded-xl bg-white dark:bg-[#141416] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/90 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 z-30 w-72 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 shadow-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                    className="text-[10px] font-mono text-blue-500 font-bold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">All read</span>
                )}
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-[11px] transition ${
                        n.unread
                          ? "bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20"
                          : "bg-slate-50 dark:bg-zinc-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">{n.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-slate-400 text-xs">No notifications</p>
              )}
            </div>
          )}
        </div>

        {/* Exit to Site Link */}
        <Link
          href="/"
          className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-white dark:bg-[#141416] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition shadow-2xs cursor-pointer active:scale-98"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Exit to Site</span>
        </Link>

        {/* Sun / Moon Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            className="h-9 px-3 rounded-xl bg-white dark:bg-[#141416] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        )}

        {/* User Card Pill */}
        {user && (
          <div className="h-9 flex items-center gap-2 pl-1.5 pr-2 rounded-xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-zinc-800 shadow-2xs">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="size-6.5 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
              />
            ) : (
              <div className="size-6.5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user.displayName || "A").charAt(0)}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[120px]">
                {user.displayName || "Organizer"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold">
                {userRoleLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logOut()}
              title="Sign Out"
              className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
