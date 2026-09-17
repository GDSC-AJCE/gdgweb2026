"use client";

import React from "react";

interface GDGLogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  width?: number;
  height?: number;
}

export default function GDGLogoMark({
  className = "",
  size = "md",
  width,
  height,
}: GDGLogoMarkProps) {
  const sizes = {
    sm: { w: 38, h: 22 },
    md: { w: 50, h: 29 },
    lg: { w: 68, h: 40 },
    xl: { w: 86, h: 51 },
  };

  const finalWidth = width || sizes[size].w;
  const finalHeight = height || sizes[size].h;

  return (
    <img
      src="/logo.png"
      alt="Google Developer Groups Logo"
      width={finalWidth}
      height={finalHeight}
      className={`shrink-0 object-contain select-none ${className}`}
    />
  );
}
