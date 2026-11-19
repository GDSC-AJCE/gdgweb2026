"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps {
  title: string;
  description: string;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export default function Alert({
  title,
  description,
  variant = "info",
  className = "",
}: AlertProps) {
  const configs = {
    info: {
      icon: Info,
      border: "border-sky-pop/30",
      bg: "bg-sky-pop/10",
      text: "text-sky-pop",
    },
    success: {
      icon: CheckCircle2,
      border: "border-fresh-grass/30",
      bg: "bg-fresh-grass/10",
      text: "text-fresh-grass",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-sunshine-pop/40",
      bg: "bg-sunshine-pop/10",
      text: "text-sunshine-pop",
    },
    error: {
      icon: AlertCircle,
      border: "border-coral-pop/30",
      bg: "bg-coral-pop/10",
      text: "text-coral-pop",
    },
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-2xl border transition-colors",
        config.border,
        config.bg,
        className
      )}
    >
      <div className={cn("p-1 rounded-lg shrink-0", config.text)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
