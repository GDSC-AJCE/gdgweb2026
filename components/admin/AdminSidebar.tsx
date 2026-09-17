"use client";

import React from "react";
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
} from "lucide-react";
import Link from "next/link";

export type AdminTab =
  | "overview"
  | "execom"
  | "events"
  | "newsletter"
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

const OPERATIONS_NAV: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "events", label: "Events & Workshops", icon: Calendar },
  { id: "newsletter", label: "Weekly Newsletter", icon: Mail },
  { id: "website", label: "Website Settings", icon: Globe },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "execom", label: "Execom Directory", icon: Users },
];

const GOVERNANCE_NAV: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Members & Roles", icon: UserCheck },
  { id: "funds", label: "Chapter Treasury", icon: Wallet },
  { id: "audit", label: "Audit Logs", icon: History },
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingApplicationsCount = 0,
  isSuperAdmin = true,
}: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col justify-between">
      <div className="space-y-6">
        {/* PANEL BADGE */}
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isSuperAdmin ? "bg-[#2c2e2a] text-white" : "bg-[#2c2e2a] text-white"
            }`}>
              {isSuperAdmin ? (
                <Shield className="w-4 h-4 text-[#2ba0ff]" />
              ) : (
                <Users className="w-4 h-4 text-[#8ed462]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#2c2e2a] tracking-tight">
                  {isSuperAdmin ? "Admin Deck" : "Core Deck"}
                </h2>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                  isSuperAdmin
                    ? "bg-[#2ba0ff]/15 text-[#2ba0ff]"
                    : "bg-[#8ed462]/20 text-[#34A853]"
                }`}>
                  {isSuperAdmin ? "Admin" : "Core"}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#80827f]">GDG on Campus AJCE</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#8ed462] animate-pulse" title="System Live" />
        </div>

        {/* 1. OPERATIONS SECTION */}
        <div className="space-y-1.5">
          <p className="px-4 text-[10px] font-mono font-bold tracking-wider text-[#80827f] uppercase">
            Chapter Operations
          </p>
          <nav className="space-y-1">
            {OPERATIONS_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isApplications = item.id === "applications";

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[50px] text-[13px] font-medium transition-all duration-200 text-left ${
                    isActive
                      ? "bg-[#2c2e2a] text-white shadow-md font-semibold"
                      : "text-[#2c2e2a] hover:bg-[#ffffff] hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#2ba0ff]" : "text-[#80827f]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isApplications && pendingApplicationsCount > 0 && (
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#ff705d] text-white"
                          : "bg-[#ff705d]/15 text-[#ff705d]"
                      }`}
                    >
                      {pendingApplicationsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 2. GOVERNANCE SECTION (SUPER ADMIN ONLY) */}
        <div className="space-y-1.5 pt-2">
          <div className="px-4 flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold tracking-wider text-[#80827f] uppercase">
              Chapter Governance
            </p>
            {!isSuperAdmin && (
              <span className="text-[9px] font-mono text-[#ff705d] font-bold">LOCKED</span>
            )}
          </div>
          <nav className="space-y-1">
            {GOVERNANCE_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[50px] text-[13px] font-medium transition-all duration-200 text-left ${
                    isActive
                      ? "bg-[#2c2e2a] text-white shadow-md font-semibold"
                      : !isSuperAdmin
                      ? "text-[#80827f] hover:bg-white/60"
                      : "text-[#2c2e2a] hover:bg-[#ffffff] hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-[#2ba0ff]"
                          : !isSuperAdmin
                          ? "text-[#b0b2af]"
                          : "text-[#80827f]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {!isSuperAdmin && (
                    <span className="text-[10px] font-mono text-[#80827f] flex items-center gap-1 bg-[#eae6d8] px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5 text-[#80827f]" />
                      <span>Admin</span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* QUICK FOOTER LINKS */}
      <div className="pt-6 mt-6 border-t border-[#d5d5d4] px-2 space-y-2">
        <Link
          href="/about#execom"
          target="_blank"
          className="flex items-center justify-between text-xs font-medium text-[#80827f] hover:text-[#2c2e2a] transition px-2 py-1"
        >
          <span>Live Execom Showcase</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/programs"
          target="_blank"
          className="flex items-center justify-between text-xs font-medium text-[#80827f] hover:text-[#2c2e2a] transition px-2 py-1"
        >
          <span>Live Events Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
