"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, Sparkles, Check, Wallet, Code2, Tag, Terminal } from "lucide-react";

export type StickerType = "rocket" | "coin" | "check" | "wallet" | "code" | "tag" | "terminal";

interface StickerProps {
  type: StickerType;
  label?: string;
  rotation?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STICKER_CONFIG: Record<StickerType, { bg: string; text: string; icon: React.ElementType }> = {
  rocket: { bg: "#fb4903", text: "#ffffff", icon: Rocket },
  coin: { bg: "#ffd731", text: "#000000", icon: Sparkles },
  check: { bg: "#55db9c", text: "#000000", icon: Check },
  wallet: { bg: "#5c4ade", text: "#ffffff", icon: Wallet },
  code: { bg: "#4da2ff", text: "#000000", icon: Code2 },
  tag: { bg: "#e9ccff", text: "#000000", icon: Tag },
  terminal: { bg: "#5c4ade", text: "#ffffff", icon: Terminal },
};

export default function Sticker({
  type,
  label,
  rotation = 0,
  className = "",
  size = "md",
}: StickerProps) {
  const config = STICKER_CONFIG[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5 rounded-[16px]",
    md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2 rounded-[18px]",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5 rounded-[20px]",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, rotate: rotation + 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        transform: `rotate(${rotation}deg)`,
      }}
      className={`inline-flex items-center font-bold tracking-tight border border-[#000000] select-none cursor-default shadow-none ${sizeClasses[size]} ${className}`}
    >
      <Icon className={`${iconSizes[size]} stroke-[2.5]`} />
      {label && <span className="font-sans font-bold">{label}</span>}
    </motion.div>
  );
}
