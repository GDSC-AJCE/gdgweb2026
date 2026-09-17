"use client";

import React from "react";
import { motion } from "framer-motion";

// =============================================================================
// GOOGLE LABS EXACT ORGANIC GEOMETRIES (Matching Hero & Footer Physics Suite)
// =============================================================================

// 1. Blue Sinusoidal Wavy Rosette (14-wave scallop)
function RosettePath({ r = 40, amp = 6.5, numWaves = 14, cx = 50, cy = 50 }: { r?: number; amp?: number; numWaves?: number; cx?: number; cy?: number }) {
  const steps = 140;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const currentR = r + amp * Math.cos(numWaves * theta);
    const x = cx + Math.cos(theta) * currentR;
    const y = cy + Math.sin(theta) * currentR;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return <path d={d + " Z"} fill="currentColor" />;
}

// 2. Yellow Chamfered Hexagon (Exact SVG path from hero/physics playground)
function HexagonPath() {
  return (
    <path
      d="M 46 10.3 
         L 20.3 25.1 A 8 8 0 0 0 16.3 32.1 
         L 16.3 67.9 A 8 8 0 0 0 20.3 74.9 
         L 46 89.7 A 8 8 0 0 0 54 89.7 
         L 79.7 74.9 A 8 8 0 0 0 83.7 67.9 
         L 83.7 32.1 A 8 8 0 0 0 79.7 25.1 
         L 54 10.3 A 8 8 0 0 0 46 10.3 Z"
      fill="currentColor"
    />
  );
}

// 3. Orange 4-Lobed Organic Clover
function CloverPath() {
  return (
    <g fill="currentColor">
      <circle cx="50" cy="27" r="21" />
      <circle cx="73" cy="50" r="21" />
      <circle cx="50" cy="73" r="21" />
      <circle cx="27" cy="50" r="21" />
      <rect x="29" y="29" width="42" height="42" rx="12" />
    </g>
  );
}

// 4. Sunshine 8-Petal Daisy Starburst
function DaisyPath() {
  return (
    <g fill="currentColor" transform="translate(50, 50)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse key={deg} cx="0" cy="-28" rx="8" ry="15" transform={`rotate(${deg})`} />
      ))}
      <circle cx="0" cy="0" r="14" fill="#FCE72D" />
    </g>
  );
}

export type GoogleLabsLoaderVariant = "cluster" | "rosette" | "morph" | "daisy" | "code";
export type GoogleLabsLoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface GoogleLabsLoadingIconProps {
  variant?: GoogleLabsLoaderVariant;
  size?: GoogleLabsLoaderSize | number;
  className?: string;
  color?: string;
}

const SIZE_MAP: Record<GoogleLabsLoaderSize, number> = {
  xs: 18,
  sm: 26,
  md: 48,
  lg: 68,
  xl: 96,
};

export default function GoogleLabsLoadingIcon({
  variant = "cluster",
  size = "md",
  className = "",
  color,
}: GoogleLabsLoadingIconProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 48;

  // ---------------------------------------------------------------------------
  // VARIANT 1: KINETIC 4-SHAPE ORBITAL CLUSTER (Hero & Footer physics match)
  // ---------------------------------------------------------------------------
  if (variant === "cluster") {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        role="status"
        aria-label="Loading"
      >
        {/* Revolving Orbit Container */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* 1. Top: Blue Sinusoidal Wavy Rosette (#5483F6) */}
          <motion.div
            animate={{ scale: [0.92, 1.1, 0.92], rotate: [0, -360] }}
            transition={{
              scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 9, repeat: Infinity, ease: "linear" },
            }}
            className="absolute -top-[5%] w-[46%] h-[46%] text-[#5483F6]"
            style={{ color: color || "#5483F6" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
              <RosettePath />
            </svg>
          </motion.div>

          {/* 2. Right: Orange 4-Lobed Organic Clover (#FF7B47) */}
          <motion.div
            animate={{ scale: [1.08, 0.9, 1.08], rotate: [0, 180] }}
            transition={{
              scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
              rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -right-[5%] w-[44%] h-[44%] text-[#FF7B47]"
            style={{ color: color || "#FF7B47" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
              <CloverPath />
            </svg>
          </motion.div>

          {/* 3. Bottom: Lime Green Clover (#C6EB3D) */}
          <motion.div
            animate={{ scale: [0.94, 1.12, 0.94], rotate: [0, -180] }}
            transition={{
              scale: { duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
              rotate: { duration: 8.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -bottom-[5%] w-[44%] h-[44%] text-[#C6EB3D]"
            style={{ color: color || "#C6EB3D" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
              <CloverPath />
            </svg>
          </motion.div>

          {/* 4. Left: Yellow Chamfered Hexagon (#FCE72D) */}
          <motion.div
            animate={{ scale: [1.05, 0.88, 1.05], rotate: [0, 360] }}
            transition={{
              scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 },
              rotate: { duration: 11, repeat: Infinity, ease: "linear" },
            }}
            className="absolute -left-[5%] w-[44%] h-[44%] text-[#FCE72D]"
            style={{ color: color || "#FCE72D" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
              <HexagonPath />
            </svg>
          </motion.div>
        </motion.div>

        {/* Central Core: GDG Kinetic Pulse Dot */}
        <motion.div
          animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[22%] h-[22%] rounded-full bg-[#2c2e2a] shadow-xs flex items-center justify-center pointer-events-none"
        >
          <div className="w-[45%] h-[45%] rounded-full bg-white" />
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VARIANT 2: THE ICONIC 14-WAVE SINUSOIDAL SCALLOP ROSETTE
  // ---------------------------------------------------------------------------
  if (variant === "rosette") {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        role="status"
        aria-label="Loading"
      >
        {/* Outer Rotating Rosette */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-full h-full text-[#5483F6]"
          style={{ color: color || "#5483F6" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
            <RosettePath r={38} amp={7.5} />
          </svg>
        </motion.div>

        {/* Inner Counter-Rotating Developer Code Brackets < > */}
        <motion.div
          animate={{ scale: [0.85, 1.05, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <svg
            viewBox="0 0 40 40"
            className="w-[48%] h-[48%]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M 16 13 L 9 20 L 16 27"
              stroke="#FFFFFF"
              strokeWidth="4"
              animate={{ x: [-1, 1, -1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 24 13 L 31 20 L 24 27"
              stroke="#FCE72D"
              strokeWidth="4"
              animate={{ x: [1, -1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VARIANT 3: MORPHING SHAPE CYCLER (Sequentially morphs through hero icons)
  // ---------------------------------------------------------------------------
  if (variant === "morph") {
    const shapes = [
      { id: "rosette", color: "#5483F6", Component: RosettePath },
      { id: "clover", color: "#FF7B47", Component: CloverPath },
      { id: "hex", color: "#FCE72D", Component: HexagonPath },
      { id: "lime", color: "#C6EB3D", Component: CloverPath },
    ];

    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        role="status"
        aria-label="Loading"
      >
        <motion.div
          animate={{
            scale: [1, 1.15, 0.9, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full flex items-center justify-center"
        >
          {shapes.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={false}
              animate={{
                opacity: [
                  idx === 0 ? 1 : 0,
                  idx === 1 ? 1 : 0,
                  idx === 2 ? 1 : 0,
                  idx === 3 ? 1 : 0,
                  idx === 0 ? 1 : 0,
                ],
                scale: [
                  idx === 0 ? 1 : 0.6,
                  idx === 1 ? 1 : 0.6,
                  idx === 2 ? 1 : 0.6,
                  idx === 3 ? 1 : 0.6,
                  idx === 0 ? 1 : 0.6,
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: s.color }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                <s.Component />
              </svg>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VARIANT 4: SUNSHINE 8-PETAL DAISY STARBURST (Hero section floral spinner)
  // ---------------------------------------------------------------------------
  if (variant === "daisy") {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        role="status"
        aria-label="Loading"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full text-[#FBBC04]"
          style={{ color: color || "#FBBC04" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
            <DaisyPath />
          </svg>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VARIANT 5: GDG DEVELOPER CODE BRACKETS (< >)
  // ---------------------------------------------------------------------------
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      role="status"
      aria-label="Loading"
    >
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full rounded-[30%] bg-white border border-[#d5d5d4] flex items-center justify-center shadow-xs p-[18%]"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <motion.path
            d="M 17 12 L 9 20 L 17 28"
            fill="none"
            stroke="#4285F4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ x: [-1.5, 0.5, -1.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 23 12 L 31 20 L 23 28"
            fill="none"
            stroke="#34A853"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ x: [1.5, -0.5, 1.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
