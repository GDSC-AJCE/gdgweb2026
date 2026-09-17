"use client";

import React from "react";
import { motion } from "framer-motion";

export default function NewsletterBackgroundElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      
      {/* ========================================================================= */}
      {/* 1. LARGE VECTOR FLOWING CURVES & RIBBONS */}
      {/* ========================================================================= */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="curveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4" stopOpacity="0.25" />
            <stop offset="35%" stopColor="#EA4335" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#FBBC04" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#34A853" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="curveGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2e2a" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#2c2e2a" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#2c2e2a" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Sweeping S-Curve behind Hero & Subscription */}
        <motion.path
          d="M -100 180 C 300 80, 500 320, 900 180 C 1300 40, 1500 280, 1800 150"
          stroke="url(#curveGradient1)"
          strokeWidth="2.5"
          strokeDasharray="8 8"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />

        {/* Counter S-curve looping down towards latest issue */}
        <motion.path
          d="M -50 480 C 250 560, 450 380, 850 520 C 1250 660, 1450 480, 1750 620"
          stroke="url(#curveGradient2)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.3, ease: "easeOut" }}
        />

        {/* Lower winding curve through archive */}
        <motion.path
          d="M 50 820 C 450 940, 850 720, 1250 880 C 1550 1000, 1750 840, 1950 950"
          stroke="#d5d5d4"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Deep lower flourish */}
        <path
          d="M -80 1200 C 320 1100, 680 1350, 1080 1220 C 1480 1090, 1700 1300, 1980 1180"
          stroke="#e0dbce"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* ========================================================================= */}
      {/* 2. PLAYFUL LOOP-DE-LOOP & SQUIGGLE TRAILS */}
      {/* ========================================================================= */}
      
      {/* Hero Right: Hand-drawn loop-the-loop flight path */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="absolute top-24 right-4 sm:right-28 w-44 h-44 pointer-events-none"
      >
        <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
          <path
            d="M 10 130 C 50 140, 110 120, 105 75 C 100 35, 55 45, 60 85 C 65 125, 120 110, 145 60"
            stroke="#4285F4"
            strokeWidth="1.75"
            strokeDasharray="5 5"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Leading tiny airplane / arrow dot */}
          <circle cx="145" cy="60" r="3" fill="#4285F4" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Hero Left: Playful spring coil / spiral flourish */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="absolute top-64 left-2 sm:left-20 w-36 h-36 pointer-events-none"
      >
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
          <path
            d="M 20 20 C 60 5, 95 30, 85 65 C 75 95, 35 85, 45 55 C 55 30, 80 40, 75 70"
            stroke="#EA4335"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.3"
          />
          <circle cx="75" cy="70" r="2.5" fill="#EA4335" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Mid Right: Concentric orbital rings with dashed arc */}
      <div className="absolute top-[460px] right-0 sm:right-8 w-60 h-60 pointer-events-none opacity-40">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="100" cy="100" r="85" stroke="#d5d5d4" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="100" cy="100" r="60" stroke="#e0dbce" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="35" stroke="#FBBC04" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />
          <path d="M 100 15 A 85 85 0 0 1 185 100" stroke="#34A853" strokeWidth="2" opacity="0.4" />
          <circle cx="185" cy="100" r="3" fill="#34A853" opacity="0.7" />
        </svg>
      </div>

      {/* Mid Left: Dotted guide curve with directional chevron */}
      <div className="absolute top-[720px] left-0 sm:left-6 w-52 h-44 pointer-events-none opacity-40">
        <svg viewBox="0 0 180 140" fill="none" className="w-full h-full">
          <path
            d="M 10 20 C 70 30, 110 80, 80 120 C 65 140, 30 130, 40 100 C 50 70, 130 75, 165 95"
            stroke="#2c2e2a"
            strokeWidth="1.25"
            strokeDasharray="4 4"
            opacity="0.2"
          />
          <path d="M 158 90 L 165 95 L 157 100" stroke="#2c2e2a" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Lower Right: Gentle sine wave cluster */}
      <div className="absolute top-[1080px] right-2 sm:right-16 w-56 h-28 pointer-events-none opacity-35">
        <svg viewBox="0 0 200 80" fill="none" className="w-full h-full">
          <path d="M 0 40 Q 25 15, 50 40 T 100 40 T 150 40 T 200 40" stroke="#4285F4" strokeWidth="1.5" opacity="0.5" />
          <path d="M 0 50 Q 25 25, 50 50 T 100 50 T 150 50 T 200 50" stroke="#80827f" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 3. ARCHITECTURAL PLUS (+) GRID CROSSHAIRS */}
      {/* ========================================================================= */}
      <div className="absolute top-28 left-[15%] text-[#2c2e2a]/15 text-xs font-mono font-light select-none">
        +
      </div>
      <div className="absolute top-44 right-[18%] text-[#2c2e2a]/15 text-xs font-mono font-light select-none">
        +
      </div>
      <div className="absolute top-[420px] left-[8%] text-[#2c2e2a]/15 text-xs font-mono font-light select-none">
        +
      </div>
      <div className="absolute top-[680px] right-[12%] text-[#2c2e2a]/15 text-xs font-mono font-light select-none">
        +
      </div>
      <div className="absolute top-[960px] left-[20%] text-[#2c2e2a]/15 text-xs font-mono font-light select-none">
        +
      </div>
      <div className="absolute top-[1250px] right-[22%] text-[#2c2e2a]/15 text-xs font-mono font-light select-none">
        +
      </div>

      {/* Subtle Starburst Sparkles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-36 left-[30%] text-[#FBBC04]/30 text-sm select-none"
      >
        ✦
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute top-[580px] right-[28%] text-[#4285F4]/30 text-base select-none"
      >
        ✦
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[920px] left-[12%] text-[#34A853]/30 text-xs select-none"
      >
        ✦
      </motion.div>

    </div>
  );
}
