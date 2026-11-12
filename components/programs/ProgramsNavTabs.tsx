"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Radio, CheckCircle2 } from "lucide-react";

export default function ProgramsNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: "All Events",
      href: "/programs",
      icon: Calendar,
      active: pathname === "/programs",
    },
    {
      label: "Live & Ongoing",
      href: "/programs/ongoing",
      icon: Radio,
      active: pathname === "/programs/ongoing",
      badge: "LIVE",
    },
    {
      label: "Conducted / Past",
      href: "/programs/past",
      icon: CheckCircle2,
      active: pathname === "/programs/past",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto py-2 select-none">
      <div className="inline-flex p-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-5 py-2 rounded-[50px] text-xs font-semibold transition-all whitespace-nowrap ${
                tab.active
                  ? "bg-[#2c2e2a] text-white shadow-xs"
                  : "text-[#80827f] hover:text-[#2c2e2a] hover:bg-[#f5f1e4]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.active ? "text-white" : "text-[#80827f]"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-[50px] text-[10px] font-bold ${
                  tab.active 
                    ? "bg-white/20 text-white" 
                    : "bg-[#8ed462] text-[#2c2e2a]"
                }`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
