"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-11 h-11",
  }[size];

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-5.5 h-5.5",
  }[size];

  if (!mounted) {
    return (
      <div
        className={`${sizeClasses} rounded-[50px] bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 animate-pulse ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative ${sizeClasses} rounded-[50px] flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95 border ${
        isDark
          ? "bg-[#18181b] text-amber-300 border-zinc-700 hover:bg-zinc-800 hover:border-amber-400/40 hover:text-amber-200"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-[#0f172a]"
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className={`${iconSizes} stroke-[2.3]`} />
          ) : (
            <Moon className={`${iconSizes} stroke-[2.3]`} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
