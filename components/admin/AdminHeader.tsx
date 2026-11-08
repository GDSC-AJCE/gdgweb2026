"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, ExternalLink, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StatusDot from "@/components/ui/StatusDot";
import Chip from "@/components/ui/Chip";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  activeTab?: string;
}

export default function AdminHeader({ title, subtitle, activeTab }: AdminHeaderProps) {
  const { user, userData, isAdmin, logOut } = useAuth();

  const userRoleLabel = isAdmin
    ? "Super Admin"
    : userData?.role === "core-manage"
    ? "Core Manager"
    : userData?.role === "core"
    ? "Core Lead"
    : "Administrator";

  return (
    <header className="w-full pb-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 select-none">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
          <Link href="/admin" className="hover:text-slate-600 transition">
            Admin Console
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-semibold capitalize">
            {activeTab || "Cockpit"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">{subtitle}</p>
      </div>

      {/* Cloud Status, Exit & User Profile Pill */}
      <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
        {/* System Health Indicators */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs">
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
          className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Exit to Site</span>
        </Link>

        {/* User Card Pill */}
        {user && (
          <div className="h-9 flex items-center gap-2 pl-1.5 pr-2 rounded-full bg-white border border-slate-200 shadow-2xs">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="w-6.5 h-6.5 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-6.5 h-6.5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user.displayName || "A").charAt(0)}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-left">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                {user.displayName || "Organizer"}
              </span>
              <Chip
                color={isAdmin ? "blue" : "slate"}
                variant="subtle"
                className="text-[10px] py-0 px-1.5"
              >
                {userRoleLabel}
              </Chip>
            </div>
            <button
              onClick={() => logOut()}
              title="Sign Out"
              className="p-1 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
