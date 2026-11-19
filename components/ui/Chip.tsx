import React from "react";
import { cn } from "@/lib/utils";

export type ChipColor =
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "purple"
  | "slate"
  | "grass"
  | "coral"
  | "sky"
  | "sunshine";
export type ChipVariant = "subtle" | "bold" | "outline";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ChipColor;
  variant?: ChipVariant;
  children: React.ReactNode;
}

const COLOR_MAP: Record<ChipColor, Record<ChipVariant, string>> = {
  grass: {
    subtle: "bg-fresh-grass/15 text-ink-black border-fresh-grass/30",
    bold: "bg-fresh-grass text-ink-black border-transparent",
    outline: "bg-transparent text-fresh-grass border-fresh-grass/40",
  },
  coral: {
    subtle: "bg-coral-pop/15 text-coral-pop border-coral-pop/30",
    bold: "bg-coral-pop text-white border-transparent",
    outline: "bg-transparent text-coral-pop border-coral-pop/40",
  },
  sky: {
    subtle: "bg-sky-pop/15 text-sky-pop border-sky-pop/30",
    bold: "bg-sky-pop text-white border-transparent",
    outline: "bg-transparent text-sky-pop border-sky-pop/40",
  },
  sunshine: {
    subtle: "bg-sunshine-pop/15 text-stone-gray border-sunshine-pop/40",
    bold: "bg-sunshine-pop text-ink-black border-transparent",
    outline: "bg-transparent text-sunshine-pop border-sunshine-pop/50",
  },
  blue: {
    subtle: "bg-sky-pop/15 text-sky-pop border-sky-pop/30",
    bold: "bg-sky-pop text-white border-transparent",
    outline: "bg-transparent text-sky-pop border-sky-pop/40",
  },
  green: {
    subtle: "bg-fresh-grass/15 text-ink-black border-fresh-grass/30",
    bold: "bg-fresh-grass text-ink-black border-transparent",
    outline: "bg-transparent text-fresh-grass border-fresh-grass/40",
  },
  yellow: {
    subtle: "bg-sunshine-pop/15 text-stone-gray border-sunshine-pop/40",
    bold: "bg-sunshine-pop text-ink-black border-transparent",
    outline: "bg-transparent text-sunshine-pop border-sunshine-pop/50",
  },
  red: {
    subtle: "bg-coral-pop/15 text-coral-pop border-coral-pop/30",
    bold: "bg-coral-pop text-white border-transparent",
    outline: "bg-transparent text-coral-pop border-coral-pop/40",
  },
  purple: {
    subtle: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300/40",
    bold: "bg-purple-600 text-white border-transparent",
    outline: "bg-transparent text-purple-600 border-purple-300",
  },
  slate: {
    subtle: "bg-muted text-muted-foreground border-border",
    bold: "bg-primary text-primary-foreground border-transparent",
    outline: "bg-transparent text-foreground border-border",
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
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-tight select-none transition-colors",
        styles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Chip };
