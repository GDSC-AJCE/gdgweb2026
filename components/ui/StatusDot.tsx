import React from "react";
import { cn } from "@/lib/utils";

export type StatusDotColor =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "gray"
  | "grass"
  | "coral"
  | "sky";

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: StatusDotColor;
  ping?: boolean;
}

const COLOR_CLASSES: Record<StatusDotColor, { halo: string; dot: string; pingColor: string }> = {
  grass: {
    halo: "bg-fresh-grass/20",
    dot: "bg-fresh-grass",
    pingColor: "bg-fresh-grass",
  },
  coral: {
    halo: "bg-coral-pop/20",
    dot: "bg-coral-pop",
    pingColor: "bg-coral-pop",
  },
  sky: {
    halo: "bg-sky-pop/20",
    dot: "bg-sky-pop",
    pingColor: "bg-sky-pop",
  },
  green: {
    halo: "bg-fresh-grass/20",
    dot: "bg-fresh-grass",
    pingColor: "bg-fresh-grass",
  },
  yellow: {
    halo: "bg-sunshine-pop/20",
    dot: "bg-sunshine-pop",
    pingColor: "bg-sunshine-pop",
  },
  red: {
    halo: "bg-coral-pop/20",
    dot: "bg-coral-pop",
    pingColor: "bg-coral-pop",
  },
  blue: {
    halo: "bg-sky-pop/20",
    dot: "bg-sky-pop",
    pingColor: "bg-sky-pop",
  },
  gray: {
    halo: "bg-muted-foreground/15",
    dot: "bg-muted-foreground",
    pingColor: "bg-muted-foreground",
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
      className={cn(
        "relative inline-flex items-center justify-center size-2.5 shrink-0 rounded-full",
        c.halo,
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {ping && (
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-75 animate-ping",
            c.pingColor
          )}
        />
      )}
      <span className={cn("size-1.5 rounded-full", c.dot)} />
    </span>
  );
}

export { StatusDot };
