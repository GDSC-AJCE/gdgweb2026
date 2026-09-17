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
      "Modifying student privilege levels, assigning executive roles, and revoking administrative clearance is restricted to Chapter Leads and Faculty Advisors.",
    coreAlternative: "As a Core Lead, you can manage chapter workshops and review incoming student applications.",
    alternativeTab: "applications",
  },
  funds: {
    name: "Chapter Treasury",
    requiredRole: "Super Administrator / Lead Organizer",
    description:
      "Viewing sensitive chapter financial balances, recording sponsor fund disbursements, and managing bank ledgers requires root administrative privileges.",
    coreAlternative: "To request event logistics funding, submit a proposal during chapter executive meetings.",
    alternativeTab: "events",
  },
  audit: {
    name: "Security Audit Trail",
    requiredRole: "Super Administrator / Security Officer",
    description:
      "Cryptographic administrative logs and immutable system action histories are restricted to chapter compliance officers and faculty advisors.",
    coreAlternative: "Review chapter event history and attendee velocity from the operational dashboard.",
    alternativeTab: "overview",
  },
};

export default function RestrictedAccessCard({
  tab,
  onNavigateTab,
}: RestrictedAccessCardProps) {
  const details = RESTRICTED_TAB_DETAILS[tab] || {
    name: "Governance Module",
    requiredRole: "Super Administrator",
    description: "This administrative section requires elevated security clearance.",
    coreAlternative: "Return to chapter operations to manage events and candidate reviews.",
    alternativeTab: "overview",
  };

  return (
    <div className="p-8 sm:p-12 rounded-[40px] bg-white border border-[#d5d5d4] shadow-sm space-y-8 select-none max-w-3xl mx-auto my-6 text-center">
      {/* Icon Badge */}
      <div className="relative w-20 h-20 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-9 h-9 text-[#ff705d]" />
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#2c2e2a] text-white flex items-center justify-center border-2 border-white">
          <Lock className="w-3.5 h-3.5 text-[#FBBC04]" />
        </div>
      </div>

      {/* Title & Badge */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff705d]/10 border border-[#ff705d]/20 text-[11px] font-mono font-semibold text-[#ff705d]">
          <KeyRound className="w-3 h-3" />
          <span>ROOT CLEARANCE REQUIRED</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2c2e2a]">
          {details.name} Access Restricted
        </h2>
        <p className="text-sm text-[#80827f] max-w-xl mx-auto leading-relaxed">
          {details.description}
        </p>
      </div>

      {/* Clearance Comparison Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-5 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4]">
        <div className="space-y-1.5 p-3 rounded-[20px] bg-white border border-[#d5d5d4]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8ed462]" />
            <span className="text-xs font-bold text-[#2c2e2a]">Your Clearance: Core Member</span>
          </div>
          <p className="text-[11px] text-[#80827f] leading-normal">
            Operational access to Events, Execom Directory, and Applications Pipeline.
          </p>
        </div>

        <div className="space-y-1.5 p-3 rounded-[20px] bg-white border border-[#d5d5d4]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff705d]" />
            <span className="text-xs font-bold text-[#2c2e2a]">Required: Super Admin</span>
          </div>
          <p className="text-[11px] text-[#80827f] leading-normal">
            Permission delegation, Chapter Treasury ledger, and security audit trail.
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
