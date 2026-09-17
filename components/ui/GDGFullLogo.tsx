"use client";

import React from "react";

interface GDGFullLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCollege?: boolean;
  themeAdaptive?: boolean;
}

export default function GDGFullLogo({
  className = "",
  size = "md",
  showCollege = true,
  themeAdaptive = true,
}: GDGFullLogoProps) {
  // Preset scale dimensions based on Figma node 2059:110 (515 x 115)
  const scales = {
    sm: { height: 32, markScale: 0.28, textScale: 0.28 },
    md: { height: 42, markScale: 0.36, textScale: 0.36 },
    lg: { height: 56, markScale: 0.48, textScale: 0.48 },
    xl: { height: 72, markScale: 0.62, textScale: 0.62 },
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      aria-label="Google Developer Groups AJCE - Amal Jyothi College of Engineering"
    >
      {/* GDG Brackets Logo Mark */}
      <svg
        width={193 * scales[size].markScale}
        height={114 * scales[size].markScale}
        viewBox="0 0 193 114"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Left Bracket: Upper Red Pill */}
        <g transform="translate(48.25, 41.97) rotate(-35) translate(-45.16, -19.62)">
          <rect
            x="0"
            y="0"
            width="90.33"
            height="39.24"
            rx="19.62"
            fill="#EA4336"
            stroke={themeAdaptive ? "currentColor" : "#202125"}
            strokeWidth="7.22"
            strokeLinejoin="round"
            className="text-gray-900 dark:text-zinc-900"
          />
        </g>

        {/* Left Bracket: Lower Blue Pill */}
        <g transform="translate(48.25, 71.24) rotate(35) translate(-45.16, -19.62)">
          <rect
            x="0"
            y="0"
            width="90.33"
            height="39.24"
            rx="19.62"
            fill="#4285F4"
            stroke={themeAdaptive ? "currentColor" : "#202125"}
            strokeWidth="7.22"
            strokeLinejoin="round"
            className="text-gray-900 dark:text-zinc-900"
          />
        </g>

        {/* Right Bracket: Upper Green Pill */}
        <g transform="translate(144.75, 41.97) rotate(-145) translate(-45.16, -19.62)">
          <rect
            x="0"
            y="0"
            width="90.33"
            height="39.24"
            rx="19.62"
            fill="#34A853"
            stroke={themeAdaptive ? "currentColor" : "#202125"}
            strokeWidth="7.22"
            strokeLinejoin="round"
            className="text-gray-900 dark:text-zinc-900"
          />
        </g>

        {/* Right Bracket: Lower Yellow Pill */}
        <g transform="translate(144.75, 71.09) rotate(145) translate(-45.16, -19.62)">
          <rect
            x="0"
            y="0"
            width="90.33"
            height="39.24"
            rx="19.62"
            fill="#FAAB00"
            stroke={themeAdaptive ? "currentColor" : "#202125"}
            strokeWidth="7.22"
            strokeLinejoin="round"
            className="text-gray-900 dark:text-zinc-900"
          />
        </g>
      </svg>

      {/* Typography Block */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-bold tracking-tight ${
              size === "sm" ? "text-base" : size === "md" ? "text-lg sm:text-xl" : size === "lg" ? "text-2xl" : "text-3xl"
            } text-[#2c2e2a]`}
          >
            GDG AJCE
          </span>
        </div>
        <span
          className={`font-medium tracking-tight mt-0.5 ${
            size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : size === "lg" ? "text-sm" : "text-base"
          } text-[#80827f]`}
        >
          Google Developer Groups
        </span>
        {showCollege && (
          <span
            className={`font-normal tracking-wide text-[#4285F4] ${
              size === "sm" ? "text-[9px]" : size === "md" ? "text-[11px]" : size === "lg" ? "text-xs" : "text-sm"
            }`}
          >
            Amal Jyothi College of Engineering
          </span>
        )}
      </div>
    </div>
  );
}
