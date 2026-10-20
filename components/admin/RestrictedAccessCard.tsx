"use client";

import React from "react";
import { ShieldAlert, Lock, ArrowRight, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface RestrictedAccessCardProps {
  tab: AdminTab;
  onNavigateTab: (tab: AdminTab) => void;
}

const RESTRICTED_TAB_DETAILS: Record<
  string,
  { name: string; requiredRole: string; description: string; coreAlternative: string; alternativeTab: AdminTab }
> = {
  users: {
    name: "Members & Permissions",
    requiredRole: "Super Administrator",
    description:
      "Modifying user permissions and assigning administrative roles is restricted to Chapter Leads and Faculty Advisors.",
    coreAlternative: "As a Core Lead, you can manage chapter workshops and review incoming student applications.",
    alternativeTab: "applications",
  },
  funds: {
    name: "Chapter Treasury",
    requiredRole: "Super Administrator",
    description:
      "Viewing financial balances and recording sponsor fund disbursements requires Super Administrator access.",
    coreAlternative: "To request event logistics funding, submit a proposal during chapter executive meetings.",
    alternativeTab: "events",
  },
  audit: {
    name: "Security Audit Trail",
    requiredRole: "Super Administrator",
    description:
      "Administrative audit logs and system history are restricted to Super Administrators.",
    coreAlternative: "Review chapter event history and attendee numbers from the dashboard.",
    alternativeTab: "overview",
  },
};

export default function RestrictedAccessCard({
  tab,
  onNavigateTab,
}: RestrictedAccessCardProps) {
  const details = RESTRICTED_TAB_DETAILS[tab] || {
    name: "Governance",
    requiredRole: "Super Administrator",
    description: "This section requires Super Administrator privileges.",
    coreAlternative: "Return to chapter operations to manage events and candidate reviews.",
    alternativeTab: "overview",
  };

  return (
    <div className="p-8 sm:p-12 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-6 select-none max-w-2xl mx-auto my-6 text-center">
      {/* Icon Badge */}
      <div className="relative w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8 text-[#EF4444]" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center border-2 border-white">
          <Lock className="w-3 h-3 text-[#F59E0B]" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]">
          {details.name} Access Restricted
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          {details.description}
        </p>
      </div>

      {/* Role Comparison Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left p-4 rounded-[20px] bg-slate-50 border border-slate-200">
        <div className="space-y-1 p-3 rounded-[16px] bg-white border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-bold text-[#0f172a]">Your Role: Core Member</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Access to Events, Execom Directory, and Applications Pipeline.
          </p>
        </div>

        <div className="space-y-1 p-3 rounded-[16px] bg-white border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-xs font-bold text-[#0f172a]">Required: Super Admin</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            User permission delegation, Treasury ledger, and audit trail.
          </p>
        </div>
      </div>

      {/* Alternative suggestion */}
      <p className="text-xs text-[#80827f]">
        💡 <span className="font-semibold text-[#2c2e2a]">{details.coreAlternative}</span>
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigateTab("overview")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-white border border-[#d5d5d4] hover:border-[#2c2e2a] text-xs font-semibold text-[#2c2e2a] transition shadow-xs w-full sm:w-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Chapter Overview</span>
        </button>

        <button
          onClick={() => onNavigateTab(details.alternativeTab)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#141414] text-white text-xs font-semibold shadow-md transition active:scale-95 w-full sm:w-auto"
        >
          <span>Open {details.alternativeTab === "events" ? "Events & Workshops" : details.alternativeTab === "applications" ? "Applications" : "Dashboard"}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#2ba0ff]" />
        </button>
      </div>

      {/* Testing mode prompt */}
      <div className="pt-4 border-t border-[#f5f1e4] text-[11px] font-mono text-[#80827f] flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#2ba0ff]" />
        <span>Testing mode: Switch to <b>Chapter Admin</b> via the bottom-left dock to view this tab.</span>
      </div>
    </div>
  );
}
