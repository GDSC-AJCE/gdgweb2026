"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  ExternalLink,
  Shield,
  Command,
  Search,
  Bell,
  Home,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StatusDot from "@/components/ui/StatusDot";
import Chip from "@/components/ui/Chip";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";
import { RiShieldCheckLine } from "@remixicon/react";
import type { AdminTab } from "@/components/admin/AdminSidebar";
import {
  NotificationCenter,
  type NotificationCenterItem,
} from "@/components/application/notification-center/notification-center";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  activeTab?: string;
  onNavigateTab?: (tab: any) => void;
  onOpenSearch?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const TAB_CATEGORY_MAP: Record<string, { category: { label: string; tab?: AdminTab }; current: string }> = {
  overview: {
    category: { label: "Home", tab: "overview" },
    current: "Overview",
  },
  funds: {
    category: { label: "Home", tab: "overview" },
    current: "Finance & Treasury",
  },
  analytics: {
    category: { label: "Home", tab: "overview" },
    current: "Overview",
  },
  events: {
    category: { label: "Events", tab: "events" },
    current: "Manage Events",
  },
  "events-list": {
    category: { label: "Events", tab: "events" },
    current: "Events Data Table",
  },
  calendar: {
    category: { label: "Events", tab: "events" },
    current: "Calendar & Schedule",
  },
  certificates: {
    category: { label: "Events", tab: "events" },
    current: "Certificates & Credentials",
  },
  execom: {
    category: { label: "Leadership", tab: "execom" },
    current: "Execom Leads",
  },
  applications: {
    category: { label: "Leadership", tab: "execom" },
    current: "Recruitment Pipeline",
  },
  users: {
    category: { label: "Directory", tab: "users" },
    current: "Members & Permissions",
  },
  newsletter: {
    category: { label: "Communications", tab: "mailer" },
    current: "Tech Newsletter",
  },
  mailer: {
    category: { label: "Communications", tab: "mailer" },
    current: "Mail Studio",
  },
  website: {
    category: { label: "System", tab: "website" },
    current: "Website Configuration",
  },
  audit: {
    category: { label: "System", tab: "audit" },
    current: "Security Audit Trail",
  },
};

export default function AdminHeader({
  title,
  subtitle,
  activeTab,
  onNavigateTab,
  onOpenSearch,
  theme = "light",
  onToggleTheme,
}: AdminHeaderProps) {
  const { user, userData, isAdmin, logOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const isDark = theme === "dark";

  const userRoleLabel = isAdmin
    ? "Super Admin"
    : userData?.role === "core-manage"
    ? "Core Manager"
    : userData?.role === "core"
    ? "Core Lead"
    : "Administrator";

  const userName = user?.displayName || user?.email?.split("@")[0] || "Chapter Lead";

  // BoardUI Notification Center items
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>([
    {
      id: "notif-1",
      category: "mentions",
      group: "Recruitment",
      title: "New Execom Candidate",
      description: "Alen Philip submitted an application for Web Tech Lead.",
      timestamp: "10m ago",
      unread: true,
      avatar: {
        initials: "AP",
        alt: "Alen Philip",
      },
      actions: [
        { id: "review-app", label: "Review Candidate", variant: "primary" },
      ],
    },
    {
      id: "notif-2",
      category: "activity",
      group: "Events & RSVPs",
      title: "Workshop RSVP Limit Reached",
      description: "Gemini 2.5 Live Agent Lab reached 92% capacity (46/50 RSVPs).",
      timestamp: "1h ago",
      unread: true,
      status: "information",
      actions: [
        { id: "view-events", label: "View Rosters", variant: "secondary" },
      ],
    },
    {
      id: "notif-3",
      category: "system",
      group: "Credential Engine",
      title: "Certificate Verification",
      description: "Cloud Study Jam badge credentials batch generated & ready to issue.",
      timestamp: "3h ago",
      unread: false,
      status: "success",
      actions: [
        { id: "view-certs", label: "Issue Credentials", variant: "secondary" },
      ],
    },
    {
      id: "notif-4",
      category: "system",
      group: "System Health",
      title: "Firestore Telemetry Synced",
      description: "Automated integrity check passed for active event rosters and audit logs.",
      timestamp: "1d ago",
      unread: false,
      status: "neutral",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    if (actionId === "review-app") {
      onNavigateTab?.("applications");
      setShowNotifications(false);
    } else if (actionId === "view-events") {
      onNavigateTab?.("events");
      setShowNotifications(false);
    } else if (actionId === "view-certs") {
      onNavigateTab?.("certificates");
      setShowNotifications(false);
    }
  };

  const tabCategoryInfo = (activeTab && TAB_CATEGORY_MAP[activeTab]) || {
    category: { label: "Workspace", tab: "overview" as AdminTab },
    current: title || activeTab || "Dashboard",
  };

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 select-none pb-2 font-sans">
      {/* Title & BoardUI Breadcrumbs */}
      <div>
        <div className="mb-2">
          <Breadcrumb aria-label="Admin Navigation">
            <BreadcrumbItem
              icon={RiShieldCheckLine}
              onClick={() => onNavigateTab?.("overview")}
              className="text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              GDG Admin
            </BreadcrumbItem>
            {tabCategoryInfo.category && (
              <BreadcrumbItem
                onClick={
                  tabCategoryInfo.category.tab
                    ? () => onNavigateTab?.(tabCategoryInfo.category.tab)
                    : undefined
                }
                className="text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {tabCategoryInfo.category.label}
              </BreadcrumbItem>
            )}
            <BreadcrumbItem
              current
              className="text-blue-600 dark:text-blue-400 font-semibold"
            >
              {tabCategoryInfo.current}
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700/80 text-[11px] font-medium tracking-wide">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Super Admin</span>
            </span>
          ) : userData?.role === "core-manage" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700/80 text-[11px] font-medium tracking-wide">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Core Manager</span>
            </span>
          ) : userData?.role === "core" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700/80 text-[11px] font-medium tracking-wide">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Core Lead</span>
            </span>
          ) : null}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">{subtitle}</p>
      </div>

      {/* Right Action Controls */}
      <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
        {/* Notification Bell with Badge */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="size-9 rounded-xl bg-white dark:bg-[#141416] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-950">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Backdrop overlay to dismiss dropdown when clicked outside */}
              <div
                className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[1px]"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-[380px] sm:w-[430px] max-w-[92vw] shadow-2xl rounded-3xl animate-in fade-in-0 zoom-in-95 duration-150">
                <NotificationCenter
                  title="Notifications"
                  notifications={notifications}
                  onAction={handleNotificationAction}
                  className="w-full bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-zinc-800 shadow-2xl"
                />
              </div>
            </>
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
