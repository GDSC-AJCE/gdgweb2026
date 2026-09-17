"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, ShieldCheck, Sparkles } from "lucide-react";
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
    <header className="w-full pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d5d5d4]">
      {/* Title & Subtitle */}
      <div>
        <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full border text-[11px] font-mono font-bold mb-2 shadow-2xs ${
          isAdmin
            ? "bg-[#2ba0ff]/10 border-[#2ba0ff]/30 text-[#2ba0ff]"
            : "bg-[#8ed462]/20 border-[#8ed462]/40 text-[#2c7a28]"
        }`}>
          {isAdmin ? (
            <>
              <ShieldCheck className="w-3 h-3 text-[#2ba0ff]" />
              <span>SUPER ADMIN ROOT CLEARANCE</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-[#34A853]" />
              <span>CORE OPERATIONS WORKSPACE</span>
            </>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2c2e2a]">
          {title}
        </h1>
        <p className="text-sm text-[#80827f] mt-1">{subtitle}</p>
      </div>

      {/* User Info & Quick Actions */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[50px] bg-white border border-[#d5d5d4] hover:border-[#2c2e2a]/40 text-xs font-medium text-[#2c2e2a] transition shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Site</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-white border border-[#d5d5d4] shadow-2xs">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="w-7 h-7 rounded-full object-cover border border-[#d5d5d4]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#4285F4] text-white font-bold text-xs flex items-center justify-center">
                {(user.displayName || "A").charAt(0)}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#2c2e2a] leading-tight truncate max-w-[120px]">
                {user.displayName || "Organizer"}
              </p>
              <span className={`text-[10px] font-mono font-bold ${
                isAdmin ? "text-[#2ba0ff]" : "text-[#34A853]"
              }`}>
                {userRoleLabel}
              </span>
            </div>
            <button
              onClick={() => logOut()}
              title="Sign Out"
              className="p-1.5 rounded-full hover:bg-[#f5f1e4] text-[#80827f] hover:text-[#ff705d] transition ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
