"use client";

import React from "react";
import { motion } from "framer-motion";

interface Ribbon3DProps {
  className?: string;
  variant?: "hero" | "loop" | "wave";
}

export default function Ribbon3D({ className = "", variant = "hero" }: Ribbon3DProps) {
  if (variant === "wave") {
    return (
      <div className={`relative pointer-events-none select-none overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 1200 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto opacity-95"
        >
          {/* Back tube shadow outline */}
          <path
            d="M-50 180 C 200 40, 450 260, 700 130 C 950 0, 1100 240, 1250 160"
            stroke="#000000"
            strokeWidth="56"
            strokeLinecap="round"
          />
          {/* Main Electric Blue inflatable tube */}
          <path
            d="M-50 180 C 200 40, 450 260, 700 130 C 950 0, 1100 240, 1250 160"
            stroke="#4da2ff"
            strokeWidth="52"
            strokeLinecap="round"
          />
          {/* Volumetric highlight line */}
          <path
            d="M-45 174 C 205 34, 445 254, 705 124 C 945 -6, 1095 234, 1245 154"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
        </svg>
      </div>
    );
  }

  // Hero Ribbon: An inflated 3D tube that twists and weaves behind the giant display text
  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 1440 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto max-w-7xl mx-auto"
        >
          <defs>
            {/* Tubular linear highlights */}
            <linearGradient id="tubeShading" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78b9ff" />
              <stop offset="50%" stopColor="#4da2ff" />
              <stop offset="100%" stopColor="#1e7ee6" />
            </linearGradient>
            <filter id="grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
            </filter>
          </defs>

          {/* Layer 1: Under-loop Shadow Tube */}
          <path
            d="M 120 320 C 260 480, 520 380, 720 220 C 920 60, 1160 120, 1340 280"
            stroke="#000000"
            strokeWidth="68"
            strokeLinecap="round"
          />

          {/* Layer 2: Main Electric Blue Tubular Body */}
          <path
            d="M 120 320 C 260 480, 520 380, 720 220 C 920 60, 1160 120, 1340 280"
            stroke="url(#tubeShading)"
            strokeWidth="62"
            strokeLinecap="round"
          />

          {/* Layer 3: High Gloss Reflection Line */}
          <path
            d="M 125 310 C 265 470, 515 370, 725 210 C 915 50, 1155 110, 1335 270"
            stroke="#ffffff"
            strokeWidth="14"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />

          {/* Swirling Forward Hook */}
          <path
            d="M 80 180 C 140 80, 320 110, 480 240"
            stroke="#000000"
            strokeWidth="56"
            strokeLinecap="round"
          />
          <path
            d="M 80 180 C 140 80, 320 110, 480 240"
            stroke="#4da2ff"
            strokeWidth="50"
            strokeLinecap="round"
          />
          <path
            d="M 85 174 C 145 74, 315 104, 475 234"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
        </svg>
      </motion.div>
    </div>
  );
}
