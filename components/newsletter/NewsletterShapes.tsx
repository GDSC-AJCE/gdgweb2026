"use client";

import React from "react";
import { motion } from "framer-motion";

// 1. Yellow Chamfered Hexagon (#FCE72D)
export function YellowHexagon({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.15, rotate: 16 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="Google Labs Yellow Hexagon"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20">
        <path
          d="M 46 10.3 
             L 20.3 25.1 A 8 8 0 0 0 16.3 32.1 
             L 16.3 67.9 A 8 8 0 0 0 20.3 74.9 
             L 46 89.7 A 8 8 0 0 0 54 89.7 
             L 79.7 74.9 A 8 8 0 0 0 83.7 67.9 
             L 83.7 32.1 A 8 8 0 0 0 79.7 25.1 
             L 54 10.3 A 8 8 0 0 0 46 10.3 Z"
          fill="#FCE72D"
        />
      </svg>
    </motion.div>
  );
}

// 2. Blue Sinusoidal Wavy Rosette (#5483F6)
export function BlueWavyRosette({ className = "" }: { className?: string }) {
  const numWaves = 14;
  const baseR = 40;
  const amp = 6.5;
  const steps = 140;
  let pathD = "";
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const r = baseR + amp * Math.cos(numWaves * theta);
    const x = 50 + Math.cos(theta) * r;
    const y = 50 + Math.sin(theta) * r;
    pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  pathD += " Z";

  return (
    <motion.div
      animate={{ y: [0, 11, 0], rotate: [0, -8, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      whileHover={{ scale: 1.15, rotate: -22 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="Blue Wavy Starburst"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20">
        <path d={pathD} fill="#5483F6" />
      </svg>
    </motion.div>
  );
}

// 3. Periwinkle Dome (#95A8FE)
export function PeriwinkleDome({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -9, 0], rotate: [0, 5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      whileHover={{ scale: 1.15, rotate: 10 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="Periwinkle Dome"
    >
      <svg viewBox="0 0 110 80" className="w-16 h-12 sm:w-20 sm:h-15 lg:w-24 lg:h-18">
        <path
          d="M 16 12
             L 94 12
             Q 104 12 104 22
             C 104 82 6 82 6 22
             Q 6 12 16 12 Z"
          fill="#95A8FE"
        />
      </svg>
    </motion.div>
  );
}

// 4. Orange Organic Clover (#FF7B47)
export function OrangeClover({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, 9, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      whileHover={{ scale: 1.15, rotate: 40 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="Orange Clover"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20">
        <g fill="#FF7B47">
          <circle cx="50" cy="27" r="21" />
          <circle cx="73" cy="50" r="21" />
          <circle cx="50" cy="73" r="21" />
          <circle cx="27" cy="50" r="21" />
          <rect x="29" y="29" width="42" height="42" rx="12" />
        </g>
      </svg>
    </motion.div>
  );
}

// 5. Lime Clover (#C6EB3D)
export function LimeClover({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, -7, 0] }}
      transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      whileHover={{ scale: 1.15, rotate: -30 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="Lime Green Clover"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20">
        <g fill="#C6EB3D">
          <circle cx="50" cy="27" r="21" />
          <circle cx="73" cy="50" r="21" />
          <circle cx="50" cy="73" r="21" />
          <circle cx="27" cy="50" r="21" />
          <rect x="29" y="29" width="42" height="42" rx="12" />
        </g>
      </svg>
    </motion.div>
  );
}

// 6. Daisy Starburst (#FBBC04 / #FCE72D)
export function DaisyStarburst({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -7, 0], rotate: [0, 360] }}
      transition={{
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 32, repeat: Infinity, ease: "linear" },
      }}
      whileHover={{ scale: 1.2 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="Sunshine Daisy"
    >
      <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18">
        <g fill="#FBBC04" transform="translate(50, 50)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse key={deg} cx="0" cy="-28" rx="8" ry="15" transform={`rotate(${deg})`} />
          ))}
          <circle cx="0" cy="0" r="14" fill="#FCE72D" />
        </g>
      </svg>
    </motion.div>
  );
}

// 7. GDG Code Token
export function GoogleCodeToken({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, 7, 0], rotate: [0, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
      whileHover={{ scale: 1.15, rotate: 0 }}
      className={`cursor-pointer select-none drop-shadow-xs ${className}`}
      title="GDG Code Token"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#d5d5d4] flex items-center justify-center shadow-xs">
        <svg viewBox="0 0 40 40" className="w-7 h-7">
          <path d="M 17 12 L 9 20 L 17 28" fill="none" stroke="#4285F4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 23 12 L 31 20 L 23 28" fill="none" stroke="#34A853" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

// 8. Storybook Cloud
export function StorybookCloud({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  return (
    <motion.div
      animate={{ x: [-8, 8, -8], y: [0, -4, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      className={`select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <svg width="180" height="90" viewBox="0 0 190 95" fill="none">
        <g fill="#FFFFFF" opacity="0.9">
          <rect x="25" y="42" width="140" height="36" rx="18" />
          <circle cx="56" cy="46" r="26" />
          <circle cx="95" cy="34" r="32" />
          <circle cx="136" cy="44" r="26" />
        </g>
      </svg>
    </motion.div>
  );
}
