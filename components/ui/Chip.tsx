import React from "react";

export type ChipColor = "blue" | "green" | "yellow" | "red" | "purple" | "slate";
export type ChipVariant = "subtle" | "bold" | "outline";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ChipColor;
  variant?: ChipVariant;
  children: React.ReactNode;
}

const COLOR_MAP: Record<ChipColor, Record<ChipVariant, string>> = {
  blue: {
    subtle: "bg-blue-50 text-blue-700 border-blue-200/60",
    bold: "bg-blue-600 text-white border-transparent",
    outline: "bg-transparent text-blue-600 border-blue-300",
  },
  green: {
    subtle: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    bold: "bg-emerald-600 text-white border-transparent",
    outline: "bg-transparent text-emerald-600 border-emerald-300",
  },
  yellow: {
    subtle: "bg-amber-50 text-amber-800 border-amber-200/60",
    bold: "bg-amber-500 text-white border-transparent",
    outline: "bg-transparent text-amber-700 border-amber-300",
  },
  red: {
    subtle: "bg-rose-50 text-rose-700 border-rose-200/60",
    bold: "bg-rose-600 text-white border-transparent",
    outline: "bg-transparent text-rose-600 border-rose-300",
  },
  purple: {
    subtle: "bg-purple-50 text-purple-700 border-purple-200/60",
    bold: "bg-purple-600 text-white border-transparent",
    outline: "bg-transparent text-purple-600 border-purple-300",
  },
  slate: {
    subtle: "bg-slate-100 text-slate-700 border-slate-200/80",
    bold: "bg-slate-800 text-white border-transparent",
    outline: "bg-transparent text-slate-700 border-slate-300",
  },
};

export default function Chip({
  color = "slate",
  variant = "subtle",
  children,
  className = "",
  ...props
}: ChipProps) {
  const styles = COLOR_MAP[color]?.[variant] || COLOR_MAP.slate.subtle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-tight select-none ${styles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
