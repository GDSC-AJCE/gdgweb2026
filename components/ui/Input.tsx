"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  helperText?: string;
  error?: string;
}

export default function Input({
  label,
  icon,
  helperText,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left font-sans">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-mono font-medium text-[#2c2e2a]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#80827f] pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full bg-[#f5f1e4] border ${
            error
              ? "border-[#EA4335] focus:border-[#EA4335]"
              : "border-[#d5d5d4] hover:border-[#80827f] focus:border-[#4285F4] focus:bg-[#ffffff]"
          } text-[#2c2e2a] text-sm rounded-xl py-2.5 ${
            icon ? "pl-10" : "pl-3.5"
          } pr-3.5 placeholder:text-[#80827f] focus:outline-none transition-colors duration-200 ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-[#EA4335] font-mono mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#80827f] font-mono mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
