"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

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
      border: "border-[#4285F4]/30",
      bg: "bg-[#4285F4]/10",
      text: "text-[#4285F4]",
    },
    success: {
      icon: CheckCircle2,
      border: "border-[#34A853]/30",
      bg: "bg-[#34A853]/10",
      text: "text-[#34A853]",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-[#FBBC04]/30",
      bg: "bg-[#FBBC04]/10",
      text: "text-[#FBBC04]",
    },
    error: {
      icon: AlertCircle,
      border: "border-[#EA4335]/30",
      bg: "bg-[#EA4335]/10",
      text: "text-[#EA4335]",
    },
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3.5 p-4 rounded-2xl border ${config.border} ${config.bg} ${className}`}
    >
      <div className={`p-1 rounded-lg ${config.text} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-[#2c2e2a] tracking-tight">{title}</h4>
        <p className="text-xs text-[#80827f] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
