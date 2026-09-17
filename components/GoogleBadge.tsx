import React from "react";

interface GoogleBadgeProps {
  label: string;
  variant?: "blue" | "red" | "yellow" | "green" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export default function GoogleBadge({
  label,
  variant = "blue",
  size = "sm",
  dot = true,
  className = "",
}: GoogleBadgeProps) {
  const variantStyles = {
    blue: "bg-[#4285F4]/12 text-[#1967D2] border-[#4285F4]/30",
    red: "bg-[#EA4335]/12 text-[#B3261E] border-[#EA4335]/30",
    yellow: "bg-[#FBBC04]/20 text-[#8F6B00] border-[#FBBC04]/40",
    green: "bg-[#34A853]/15 text-[#137333] border-[#34A853]/30",
    neutral: "bg-[#FAF8F2] text-gray-800 border-[#DEDACB]",
  };

  const dotColors = {
    blue: "bg-[#4285F4]",
    red: "bg-[#EA4335]",
    yellow: "bg-[#FBBC04]",
    green: "bg-[#34A853]",
    neutral: "bg-gray-500",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-1 tracking-normal font-medium",
    md: "text-xs px-3 py-1.5 tracking-normal font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border transition-all backdrop-blur-sm select-none shadow-xs ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {label}
    </span>
  );
}
