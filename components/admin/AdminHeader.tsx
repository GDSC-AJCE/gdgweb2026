"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user, userData, isAdmin, logOut } = useAuth();

  const userRoleLabel = isAdmin
    ? "Super Admin"
    : userData?.role === "core-manage"
    ? "Core Manager"
    : userData?.role === "core"
    ? "Core Lead"
    : "Administrator";

  return (
    <header className="w-full pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0f172a]">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* User Info & Quick Actions */}
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <Link
          href="/"
          className="h-10 inline-flex items-center gap-2 px-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-[#0f172a] transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Exit to Site</span>
        </Link>

        {user && (
          <div className="h-10 flex items-center gap-2.5 pl-1.5 pr-2 rounded-full bg-white border border-slate-200 shadow-2xs">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user.displayName || "A").charAt(0)}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 text-left">
              <span className="text-xs font-semibold text-[#0f172a] truncate max-w-[140px]">
                {user.displayName || "Organizer"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-mono font-bold text-[#2563EB]">
                {userRoleLabel}
              </span>
            </div>
            <button
              onClick={() => logOut()}
              title="Sign Out"
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#EF4444] transition cursor-pointer ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
