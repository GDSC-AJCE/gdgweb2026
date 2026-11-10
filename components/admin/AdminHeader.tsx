"use client";

import React from "react";
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

  const userRoleLabel = isAdmin
    ? "Super Admin"
    : userData?.role === "core-manage"
    ? "Core Manager"
    : userData?.role === "core"
    ? "Core Lead"
    : "Administrator";

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 select-none pb-2">
      {/* Title & Breadcrumbs */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <Link href="/" className="hover:text-slate-700 transition flex items-center gap-1 font-medium">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link href="/admin" className="hover:text-slate-700 transition font-medium">
            Admin Console
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-blue-600 font-semibold capitalize font-mono text-[11px]">
            {activeTab || "Overview"}
          </span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">{subtitle}</p>
      </div>

      {/* Cloud Status, Exit & User Profile Pill */}
      <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
        {/* System Health Indicators (BoardUI telemetry style) */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <StatusDot color="green" />
            <span className="text-[11px] font-mono text-slate-600 font-medium">Firestore</span>
          </div>
          <span className="text-slate-200">•</span>
          <div className="flex items-center gap-1.5">
            <StatusDot color="blue" />
            <span className="text-[11px] font-mono text-slate-600 font-medium">Mail Gateway</span>
          </div>
        </div>

        {/* Exit to Site Link */}
        <Link
          href="/"
          className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer active:scale-98"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Exit to Site</span>
        </Link>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
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
          <div className="h-9 flex items-center gap-2 pl-1.5 pr-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="size-6.5 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="size-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user.displayName || "A").charAt(0)}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-left">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {user.displayName || "Organizer"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                {userRoleLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logOut()}
              title="Sign Out"
              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
