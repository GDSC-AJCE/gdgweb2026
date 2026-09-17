"use client";

import React from "react";

export interface BadgeProps {
  label: string;
  variant?: "green" | "blue" | "coral" | "yellow" | "neutral";
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Badge({
  label,
  variant = "green",
  dot = true,
  icon,
  className = "",
}: BadgeProps) {
  // MindMarket 10px or 50px micro-label pills
  const variantStyles = {
    green: "bg-[#8ed462]/20 border-[#8ed462]/40 text-[#2c2e2a]",
    blue: "bg-[#2ba0ff]/15 border-[#2ba0ff]/35 text-[#2c2e2a]",
    coral: "bg-[#ff705d]/15 border-[#ff705d]/35 text-[#2c2e2a]",
    yellow: "bg-[#f5e211]/30 border-[#f5e211]/50 text-[#2c2e2a]",
    neutral: "bg-[#ffffff] border-[#d5d5d4] text-[#2c2e2a]",
  };

  const dotStyles = {
    green: "bg-[#8ed462]",
    blue: "bg-[#2ba0ff]",
    coral: "bg-[#ff705d]",
    yellow: "bg-[#f5e211]",
    neutral: "bg-[#80827f]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-[50px] text-xs font-medium border select-none ${variantStyles[variant]} ${className}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : dot ? (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      ) : null}
      <span>{label}</span>
    </span>
  );
}
