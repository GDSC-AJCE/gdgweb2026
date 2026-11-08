import React from "react";

export type StatusDotColor = "green" | "yellow" | "red" | "blue" | "gray";

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: StatusDotColor;
  ping?: boolean;
}

const COLOR_CLASSES: Record<StatusDotColor, { halo: string; dot: string; pingColor: string }> = {
  green: {
    halo: "bg-emerald-500/15",
    dot: "bg-emerald-500",
    pingColor: "bg-emerald-400",
  },
  yellow: {
    halo: "bg-amber-500/15",
    dot: "bg-amber-500",
    pingColor: "bg-amber-400",
  },
  red: {
    halo: "bg-rose-500/15",
    dot: "bg-rose-500",
    pingColor: "bg-rose-400",
  },
  blue: {
    halo: "bg-blue-500/15",
    dot: "bg-blue-500",
    pingColor: "bg-blue-400",
  },
  gray: {
    halo: "bg-slate-500/15",
    dot: "bg-slate-400",
    pingColor: "bg-slate-400",
  },
};

export default function StatusDot({
  color = "green",
  ping = false,
  className = "",
  ...props
}: StatusDotProps) {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.green;

  return (
    <span
      className={`relative inline-flex items-center justify-center size-2.5 shrink-0 rounded-full ${c.halo} ${className}`}
      aria-hidden="true"
      {...props}
    >
      {ping && (
        <span
          className={`absolute inline-flex size-full rounded-full ${c.pingColor} opacity-75 animate-ping`}
        />
      )}
      <span className={`size-1.5 rounded-full ${c.dot}`} />
    </span>
  );
}
