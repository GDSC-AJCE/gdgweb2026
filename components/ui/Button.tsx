"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "coral" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  dotColor?: "blue" | "green" | "coral" | "none";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  dotColor = "blue",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // MindMarket 50px pill buttons with minimal borders, subtle float, and chromatic dot affordance
  const baseStyles = "group inline-flex items-center justify-center font-medium transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-[50px] select-none text-[15px] transition-mindmarket";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-2 rounded-[50px]",
    md: "px-5 py-2.5 text-[15px] gap-2.5 rounded-[50px]",
    lg: "px-7 py-3 text-[17px] gap-3 rounded-[50px]",
  };

  const variantStyles = {
    // Light/white ghost pill with hairline border and text in #2c2e2a
    primary: "bg-[#ffffff] text-[#2c2e2a] border border-[#d5d5d4] hover:bg-[#f5f1e4] hover:border-[#2c2e2a]/30",
    secondary: "bg-[#f5f1e4] text-[#2c2e2a] border border-[#e0dbce] hover:bg-[#e0dbce]",
    // Service-level action button: Coral Pop (#ff705d) fill with white text
    coral: "bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] border border-[#ff705d]",
    ghost: "bg-transparent text-[#2c2e2a] hover:bg-[#ffffff]/80",
    destructive: "bg-[#ff705d]/15 text-[#ff705d] border border-[#ff705d]/30 hover:bg-[#ff705d]/25",
    success: "bg-[#8ed462] text-[#2c2e2a] hover:bg-[#7ec452] border border-[#8ed462]",
  };

  const dotClasses = {
    blue: "w-2 h-2 rounded-full bg-[#2ba0ff] shrink-0 action-dot-expand",
    green: "w-2 h-2 rounded-full bg-[#8ed462] shrink-0 action-dot-expand",
    coral: "w-2 h-2 rounded-full bg-[#ff705d] shrink-0 action-dot-expand",
    none: "hidden",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {dotColor !== "none" && !isLoading && (
        <span className={dotClasses[dotColor]} />
      )}
    </button>
  );
}
