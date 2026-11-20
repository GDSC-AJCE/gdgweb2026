"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Globe,
  Send,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronsUpDown,
  Command,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Megaphone,
  Settings,
  PanelLeftClose,
  Kanban,
  Bot,
  Image as ImageIcon,
  User,
  Award,
  HeartPulse,
  List,
  Grid,
  Table as TableIcon,
} from "lucide-react";
import StatusDot from "@/components/ui/StatusDot";
import { useAuth } from "@/context/AuthContext";
import type { Key, Selection } from "react-aria-components";
import { TreeView, TreeViewItem } from "@/components/base/tree-view/tree-view";
import { cx } from "@/utils/cx";

export type AdminTab =
  | "overview"
  | "analytics"
  | "execom"
  | "events"
  | "events-list"
  | "calendar"
  | "certificates"
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

export interface SubtreeChild {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeType?: "count" | "pulse";
  keywords?: string[];
  description?: string;
  adminOnly?: boolean;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeType?: "count" | "pulse";
  adminOnly?: boolean;
  keywords?: string[];
  children?: SubtreeChild[];
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
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
    new Set(["branch-overview", "branch-events", "branch-execom"])
  );

  const isDark = theme === "dark";

  // Automatically ensure BoardUI tree branch is expanded if activeTab is parent or a child
  useEffect(() => {
    if (activeTab === "overview" || activeTab === "funds" || activeTab === "analytics") {
      setExpandedKeys((prev) => new Set([...prev, "branch-overview"]));
    }
    if (
      activeTab === "events" ||
      activeTab === "events-list" ||
      activeTab === "calendar" ||
      activeTab === "certificates"
    ) {
      setExpandedKeys((prev) => new Set([...prev, "branch-events"]));
    }
    if (activeTab === "execom" || activeTab === "applications") {
      setExpandedKeys((prev) => new Set([...prev, "branch-execom"]));
    }
  }, [activeTab]);

  // If search matches subtree child, auto-expand all branches
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedKeys(new Set(["branch-overview", "branch-events", "branch-execom"]));
    }
  }, [searchQuery]);

  // Navigation Items matching the BoardUI video & chapter capabilities
  const NAV_ITEMS: NavItem[] = useMemo(() => [
    {
      id: "overview",
      label: "Home",
      icon: LayoutDashboard,
      keywords: [
        "dashboard",
        "home",
        "stats",
        "overview",
        "finance",
        "funds",
        "money",
        "treasury",
        "budget",
        "analytics",
        "metrics",
        "telemetry",
      ],
      children: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
          description: "Chapter velocity, stats & analytics",
          keywords: ["dashboard", "home", "stats", "overview", "analytics", "metrics", "telemetry"],
        },
        {
          id: "funds",
          label: "Finance",
          icon: Wallet,
          adminOnly: true,
          description: "Chapter treasury & budget",
          keywords: ["funds", "money", "treasury", "budget", "finance"],
        },
      ],
    },
    {
      id: "events",
      label: "Manage Events",
      icon: Calendar,
      keywords: [
        "events",
        "manage events",
        "calendar",
        "workshops",
        "roster",
        "hackathon",
        "attendees",
        "certificates",
        "issue certificates",
        "credentials",
        "qr code",
        "badges",
      ],
      children: [
        {
          id: "events",
          label: "Manage Events",
          icon: Grid,
          description: "Visual posters & cards",
          keywords: ["manage", "events", "cards", "posters", "rosters", "details"],
        },
        {
          id: "events-list",
          label: "Events Data Table",
          icon: List,
          description: "BoardUI TanStack list view",
          keywords: ["table", "list", "data table", "events list", "sorting", "pagination", "rosters"],
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: Calendar,
          description: "Month calendar schedule",
          keywords: ["calendar", "schedule", "events", "workshops", "dates"],
        },
        {
          id: "certificates",
          label: "Issue Certificates",
          icon: Award,
          description: "QR badges & credentials",
          keywords: ["certificates", "issue certificates", "credentials", "qr code", "verify", "badges"],
        },
      ],
    },
    {
      id: "mailer",
      label: "Mail Studio",
      icon: Send,
      keywords: ["mail", "email", "broadcast", "newsletter", "dispatch"],
    },
    {
      id: "execom",
      label: "Execom",
      icon: Shield,
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : undefined,
      badgeType: "pulse",
      keywords: [
        "leads",
        "officers",
        "core",
        "team",
        "execom",
        "applications",
        "recruitment",
        "candidates",
        "interviews",
      ],
      children: [
        {
          id: "execom",
          label: "Execom Leads",
          icon: Shield,
          description: "Chapter organizing officers",
          keywords: ["leads", "officers", "core", "team", "execom"],
        },
        {
          id: "applications",
          label: "Applications",
          icon: FileText,
          badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : undefined,
          badgeType: "pulse",
          description: "Recruitment & candidates",
          keywords: ["recruitment", "execom application", "interview", "candidates"],
        },
      ],
    },
    {
      id: "users",
      label: "Directory",
      icon: Users,
      adminOnly: true,
      keywords: ["members", "students", "users", "directory"],
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: History,
      adminOnly: true,
      keywords: ["logs", "history", "security", "audit"],
    },
  ], [pendingApplicationsCount]);

  // Filter items based on search query (including child subtree keywords)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return NAV_ITEMS;
    const q = searchQuery.toLowerCase().trim();
    return NAV_ITEMS.filter((item) => {
      const matchParent =
        item.label.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)));
      const matchChild =
        item.children &&
        item.children.some(
          (c) =>
            c.label.toLowerCase().includes(q) ||
            (c.keywords && c.keywords.some((k) => k.toLowerCase().includes(q)))
        );
      return matchParent || matchChild;
    });
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
        {/* ================= 1. TOP QUICK SEARCH & COLLAPSE ================= */}
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
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

            {/* Sidebar Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              title="Collapse sidebar"
              className={`hidden lg:flex size-8 rounded-xl items-center justify-center transition cursor-pointer shrink-0 border ${
                isDark
                  ? "bg-[#1a1a1e] border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "bg-slate-100 border-slate-200/80 text-slate-400 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex justify-center pb-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              title="Expand sidebar"
              className={`size-8 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                isDark
                  ? "bg-[#1a1a1e] border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "bg-slate-100 border-slate-200/80 text-slate-400 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <PanelLeftClose className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* ================= 2. NAVIGATION: BOARDUI TREE VIEW ================= */}
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
        ) : isCollapsed ? (
          /* Collapsed Narrow Icon Rail */
          <nav className="space-y-1.5 pt-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isDirectActive = activeTab === item.id;
              const isChildActive = Boolean(item.children?.some((c) => c.id === activeTab));
              const isItemActive = isDirectActive || isChildActive;
              const isLocked = item.adminOnly && !isSuperAdmin;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isLocked && onSelectTab(item.id)}
                  title={isLocked ? `${item.label} (Admin Only)` : item.label}
                  className={`w-full flex items-center justify-center p-2.5 rounded-xl transition cursor-pointer ${
                    isItemActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                </button>
              );
            })}
          </nav>
        ) : (
          /* Expanded: BoardUI Tree View with animated branches & connected guide lines */
          <nav className="pt-1">
            <TreeView
              aria-label="Admin Navigation Tree"
              size="sm"
              showGuides={true}
              selectionMode="single"
              selectedKeys={new Set<Key>([activeTab === "analytics" ? "overview" : activeTab])}
              onSelectionChange={(keys) => {
                if (keys === "all") return;
                const selectedKey = Array.from(keys)[0] as string | undefined;
                if (!selectedKey) return;

                if (selectedKey === "branch-overview") {
                  onSelectTab("overview");
                } else if (selectedKey === "branch-events") {
                  onSelectTab("events");
                } else if (selectedKey === "branch-execom") {
                  onSelectTab("execom");
                } else if (selectedKey === "analytics") {
                  onSelectTab("overview");
                } else {
                  onSelectTab(selectedKey as AdminTab);
                }
              }}
              expandedKeys={expandedKeys}
              onExpandedChange={(keys) => setExpandedKeys(keys as Set<Key>)}
              className="w-full bg-transparent border-0 p-0 shadow-none gap-0.5"
            >
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isLocked = item.adminOnly && !isSuperAdmin;

                if (hasChildren) {
                  return (
                    <TreeViewItem
                      key={item.id}
                      id={`branch-${item.id}`}
                      label={item.label}
                      icon={Icon as any}
                      trailingContent={
                        item.badge ? (
                          <span
                            className={cx(
                              "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full",
                              item.badgeType === "pulse"
                                ? "bg-rose-500 text-white animate-pulse"
                                : isDark
                                ? "bg-zinc-800 text-zinc-400"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : isLocked ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Admin</span>
                          </span>
                        ) : null
                      }
                      className={(state) =>
                        cx(
                          "rounded-xl text-xs font-medium cursor-pointer transition select-none my-0.5",
                          isDark ? "hover:bg-zinc-800/60 text-zinc-300" : "hover:bg-slate-100/80 text-slate-700",
                          (state.isSelected || activeTab === item.id) &&
                            "!bg-blue-600 !text-white font-semibold shadow-xs [&_svg]:!text-white [&_bdi]:!text-white",
                        )
                      }
                    >
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildLocked = child.adminOnly && !isSuperAdmin;

                        return (
                          <TreeViewItem
                            key={child.id}
                            id={child.id}
                            label={child.label}
                            icon={ChildIcon as any}
                            isDisabled={isChildLocked}
                            trailingContent={
                              child.badge ? (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                                  {child.badge}
                                </span>
                              ) : isChildLocked ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Admin</span>
                                </span>
                              ) : null
                            }
                            className={(state) =>
                              cx(
                                "rounded-xl text-xs font-medium cursor-pointer transition select-none my-0.5",
                                isDark
                                  ? "hover:bg-zinc-800/60 text-zinc-400 hover:text-white"
                                  : "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900",
                                state.isSelected &&
                                  "!bg-blue-600 !text-white font-semibold shadow-xs [&_svg]:!text-white [&_bdi]:!text-white",
                              )
                            }
                          />
                        );
                      })}
                    </TreeViewItem>
                  );
                }

                return (
                  <TreeViewItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    icon={Icon as any}
                    isDisabled={isLocked}
                    trailingContent={
                      item.badge ? (
                        <span
                          className={cx(
                            "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full",
                            item.badgeType === "pulse"
                              ? "bg-rose-500 text-white animate-pulse"
                              : isDark
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Admin</span>
                        </span>
                      ) : null
                    }
                    className={(state) =>
                      cx(
                        "rounded-xl text-xs font-medium cursor-pointer transition select-none my-0.5",
                        isDark ? "hover:bg-zinc-800/60 text-zinc-400 hover:text-white" : "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900",
                        state.isSelected &&
                          "!bg-blue-600 !text-white font-semibold shadow-xs [&_svg]:!text-white [&_bdi]:!text-white",
                      )
                    }
                  />
                );
              })}
            </TreeView>
          </nav>
        )}
      </div>

      {/* ================= 4. BOTTOM SECTION: THEME TOGGLE, SETTINGS & WORKSPACE ================= */}
      <div className="mt-4 pt-4 border-t border-slate-200/90 dark:border-zinc-800/80 space-y-3">
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
              className={`size-8 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                isDark
                  ? "bg-[#1a1a1e] border-zinc-800/80 text-blue-400 hover:text-white hover:bg-zinc-800"
                  : "bg-slate-100 border-slate-200/80 text-amber-500 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* SETTINGS ROW (VISIBLE IN BOTH EXPANDED & COLLAPSED/TOGGLED STATES) */}
        {!isCollapsed ? (
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onSelectTab("website")}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                activeTab === "website"
                  ? isDark
                    ? "bg-zinc-800 text-white font-semibold"
                    : "bg-slate-100 text-slate-900 font-semibold"
                  : isDark
                  ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Settings className="size-4 shrink-0" />
              <span>Settings</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onSelectTab("website")}
              title="Settings"
              className={`size-8 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                activeTab === "website"
                  ? isDark
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "bg-slate-200 text-slate-900 border-slate-300"
                  : isDark
                  ? "bg-[#1a1a1e] border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  : "bg-slate-100 border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CURRENT USER ACCOUNT / LOGOUT CARD */}
        <div
          className={`rounded-xl flex items-center gap-2 transition ${
            isDark
              ? "bg-[#18181b] border border-zinc-800/80 hover:border-zinc-700"
              : "bg-slate-50 border border-slate-200 hover:border-slate-300"
          } ${isCollapsed ? "justify-center p-2" : "justify-between p-2"}`}
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
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight text-slate-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  {user?.email || "Chapter Admin"}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => logOut()}
              title="Sign out of console"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDark
                  ? "text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                  : "text-slate-400 hover:text-rose-600 hover:bg-slate-200"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => logOut()}
              title={`Sign out (${userName})`}
              className={`hidden ${
                isDark ? "text-zinc-400 hover:text-rose-400" : "text-slate-400 hover:text-rose-600"
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
