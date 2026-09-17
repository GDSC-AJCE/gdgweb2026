"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

// =============================================================================
// GOOGLE LABS ORGANIC SHAPES & KINETIC PILLS (Exact Match to Footer Physics Suite)
// =============================================================================

// 1. Yellow Chamfered Hexagon (#FCE72D) - Exact rounded polygon from physics playground
function YellowHexagon({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.18, rotate: 18 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Yellow Hexagon"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
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

// 2. Blue Sinusoidal Wavy Rosette / Badge (#5483F6) - Exact 14-wave sinusoidal scallop
function BlueWavyRosette({ className = "" }: { className?: string }) {
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
      whileHover={{ scale: 1.18, rotate: -25 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Blue Wavy Starburst"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
        <path d={pathD} fill="#5483F6" />
      </svg>
    </motion.div>
  );
}

// 3. Periwinkle Dome (#95A8FE) - Flat top with rounded corners, curved bowl bottom
function PeriwinkleDome({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -9, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      whileHover={{ scale: 1.18, rotate: 12 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Periwinkle Dome"
    >
      <svg viewBox="0 0 110 80" className="w-18 h-14 sm:w-24 sm:h-18 lg:w-28 lg:h-20">
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

// 4. Orange 4-Lobed Organic Clover / Cross (#FF7B47) - Seamless unified organic geometry
function OrangeClover({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, 9, 0], rotate: [0, 10, 0] }}
      transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      whileHover={{ scale: 1.18, rotate: 45 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Orange Clover"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
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

// 5. Pink Scallop Cloud (#FFAFF6) - Organic multi-arc cloud with side and top mounding
function PinkCloud({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      whileHover={{ scale: 1.18, rotate: -12 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Pink Scallop Cloud"
    >
      <svg viewBox="0 0 130 80" className="w-20 h-14 sm:w-26 sm:h-18 lg:w-30 lg:h-20">
        <g fill="#FFAFF6">
          <rect x="18" y="22" width="94" height="36" rx="18" />
          <circle cx="42" cy="18" r="18" />
          <circle cx="88" cy="18" r="18" />
          <circle cx="42" cy="62" r="18" />
          <circle cx="88" cy="62" r="18" />
          <circle cx="65" cy="40" r="22" />
        </g>
      </svg>
    </motion.div>
  );
}

// 6. Lime Green 4-Leaf Clover (#C6EB3D) - Seamless organic clover
function LimeClover({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
      transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      whileHover={{ scale: 1.18, rotate: -35 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Lime Green Clover"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
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

// 7. Coral Torus / Donut Ring (#FF705D) - Google Labs geometric pattern
function CoralDonut({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, 8, 0], rotate: [0, 15, 0] }}
      transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      whileHover={{ scale: 1.2, rotate: 45 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Coral Ring"
    >
      <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18">
        <path
          d="M 50 14 A 36 36 0 1 0 50 86 A 36 36 0 1 0 50 14 Z M 50 32 A 18 18 0 1 1 50 68 A 18 18 0 1 1 50 32 Z"
          fill="#FF705D"
        />
      </svg>
    </motion.div>
  );
}

// 8. Sunshine 8-Petal Daisy Starburst (#FBBC04 / #FCE72D) - Google Labs floral pattern
function DaisyStarburst({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -7, 0], rotate: [0, 360] }}
      transition={{
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 34, repeat: Infinity, ease: "linear" },
      }}
      whileHover={{ scale: 1.25 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="Sunshine Daisy"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
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

// 9. GDG Developer Code Token (< > in Google 4 Colors)
function GoogleCodeToken({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, 7, 0], rotate: [0, -5, 0] }}
      transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
      whileHover={{ scale: 1.15, rotate: 0 }}
      className={`cursor-pointer select-none drop-shadow-sm ${className}`}
      title="GDG Code Token"
    >
      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white border border-[#d5d5d4] flex items-center justify-center shadow-xs">
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <path d="M 17 12 L 9 20 L 17 28" fill="none" stroke="#4285F4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 23 12 L 31 20 L 23 28" fill="none" stroke="#34A853" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

// 10. Fluffy Paper-Cut Cloud (#FFFFFF) - Pure white storybook cloud with gentle horizontal drift
function PaperCutCloud({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  return (
    <motion.div
      animate={{ x: [-10, 10, -10], y: [0, -5, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      className={`select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <svg width="190" height="95" viewBox="0 0 190 95" fill="none">
        <g fill="#FFFFFF">
          <rect x="25" y="42" width="140" height="36" rx="18" />
          <circle cx="56" cy="46" r="26" />
          <circle cx="95" cy="34" r="32" />
          <circle cx="136" cy="44" r="26" />
        </g>
      </svg>
    </motion.div>
  );
}

// 11. Small Companion Cloud (#FFFFFF)
function SmallCloud({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ x: [8, -8, 8], y: [0, 4, 0] }}
      transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      className={`select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${className}`}
    >
      <svg width="130" height="70" viewBox="0 0 130 70" fill="none">
        <g fill="#FFFFFF" opacity="0.95">
          <rect x="18" y="32" width="94" height="24" rx="12" />
          <circle cx="42" cy="36" r="20" />
          <circle cx="74" cy="28" r="24" />
          <circle cx="102" cy="38" r="16" />
        </g>
      </svg>
    </motion.div>
  );
}

// 12. Official GDG AJCE Mascot (100% Crystal-Clear Transparent Alpha)
function InteractiveMascotVideo() {
  const [greetingIndex, setGreetingIndex] = useState(0);

  const greetings = [
    "Hey there, Innovator! 👋",
    "Welcome to GDG AJCE! 🚀",
    "Ready to build with Google? 💡",
    "Codelabs over lectures! 💻",
    "Let's innovate together! ✨",
  ];

  const cycleGreeting = () => {
    setGreetingIndex((prev) => (prev + 1) % greetings.length);
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Floating Interactive Greeting Bubble */}
      <motion.button
        type="button"
        onClick={cycleGreeting}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="absolute -top-6 -left-6 sm:-left-12 z-30 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff] border border-[#d5d5d4] shadow-md text-[11px] sm:text-xs font-semibold text-[#2c2e2a] hover:border-[#2c2e2a]/40 transition-all cursor-pointer select-none whitespace-nowrap"
        title="Click to interact with the mascot!"
      >
        <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.span
            key={greetingIndex}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
          >
            {greetings[greetingIndex]}
          </motion.span>
        </AnimatePresence>
        <Sparkles className="w-3 h-3 text-[#fbbc04]" />
      </motion.button>

      {/* 2D Animated Mascot Video */}
      <motion.div
        onClick={cycleGreeting}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="relative w-[150px] sm:w-[195px] md:w-[230px] lg:w-[260px] aspect-square cursor-pointer"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain pointer-events-none select-none"
        >
          <source src="/mascot.webm" type="video/webm; codecs=vp9" />
          <Image
            src="/mascot-animated.webp"
            alt="GDG AJCE Mascot Waving"
            width={260}
            height={260}
            unoptimized
            priority
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </video>
      </motion.div>
    </div>
  );
}

export default function MindMarketHero() {
  return (
    <section className="relative w-full bg-transparent text-[#2c2e2a] pt-10 sm:pt-14 pb-24 sm:pb-28 md:pb-20 px-4 sm:px-6 select-none overflow-hidden">
      
      {/* BACKGROUND FLOATING GOOGLE LABS ORGANIC SHAPES & CLOUDS (Scattered harmoniously across all quadrants) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* --- STORYBOOK PAPER-CUT CLOUDS --- */}
        {/* Cloud 1: Upper Left floating cloud */}
        <div className="absolute top-2 left-[14%] sm:left-[17%] hidden sm:block pointer-events-none z-0">
          <PaperCutCloud scale={0.9} />
        </div>

        {/* Cloud 2: Upper Right floating cloud */}
        <div className="absolute top-5 right-[13%] sm:right-[16%] hidden sm:block pointer-events-none z-0">
          <SmallCloud />
        </div>

        {/* Cloud 3: Mid-Left edge cloud */}
        <div className="absolute top-[60%] -left-10 sm:-left-6 pointer-events-none z-0">
          <SmallCloud />
        </div>

        {/* Cloud 4: Mascot Cloud Pedestal (Under/behind the mascot in bottom-right) */}
        <div className="absolute bottom-0 -right-4 sm:right-[4%] md:right-[6%] pointer-events-none z-0">
          <PaperCutCloud scale={1.05} />
        </div>

        {/* Cloud 5: Lower Left baseline cloud */}
        <div className="absolute bottom-2 left-[9%] sm:left-[13%] hidden md:block pointer-events-none z-0">
          <SmallCloud />
        </div>


        {/* --- LEFT SIDE CLUSTER (Enhanced scattering with 6 distinct Google Labs shapes) --- */}
        {/* 1. Top Left: Yellow Chamfered Hexagon */}
        <div className="absolute top-6 left-[2%] sm:left-[5%] lg:left-[7%] pointer-events-auto z-10">
          <YellowHexagon />
        </div>
        
        {/* 2. Upper Mid-Left: Coral Donut Ring (Added Element 1 on left) */}
        <div className="absolute top-[18%] left-[10%] sm:left-[13%] lg:left-[15%] hidden sm:block pointer-events-auto z-10">
          <CoralDonut />
        </div>

        {/* 3. Mid Left: Blue Sinusoidal Wavy Rosette */}
        <div className="absolute top-[35%] left-[1%] sm:left-[3%] lg:left-[4%] pointer-events-auto z-10">
          <BlueWavyRosette />
        </div>

        {/* 4. Mid Left-Inner: Periwinkle Dome */}
        <div className="absolute top-[52%] left-[5%] sm:left-[8%] lg:left-[10%] hidden md:block pointer-events-auto z-10">
          <PeriwinkleDome />
        </div>

        {/* 5. Lower Mid-Left: Orange 4-Lobed Organic Clover (Added Element 2 on left) */}
        <div className="absolute bottom-[34%] left-[9%] sm:left-[12%] lg:left-[14%] hidden sm:block pointer-events-auto z-10">
          <OrangeClover />
        </div>

        {/* 6. Lower Left: Sunshine Daisy Starburst */}
        <div className="absolute bottom-16 left-[2%] sm:left-[5%] lg:left-[7%] hidden sm:block pointer-events-auto z-10">
          <DaisyStarburst />
        </div>


        {/* --- RIGHT SIDE CLUSTER --- */}
        {/* Top Center-Right: Coral Donut Ring */}
        <div className="absolute top-8 right-[21%] sm:right-[24%] hidden lg:block pointer-events-auto z-10">
          <CoralDonut />
        </div>

        {/* Top Right: Lime Green 4-Leaf Clover */}
        <div className="absolute top-6 right-[3%] sm:right-[6%] lg:right-[8%] pointer-events-auto z-10">
          <LimeClover />
        </div>

        {/* Mid Right: Pink Scallop Cloud */}
        <div className="absolute top-[32%] right-[1%] sm:right-[3%] lg:right-[5%] pointer-events-auto z-10">
          <PinkCloud />
        </div>

        {/* Mid Right-Inner: Orange 4-Lobed Organic Clover */}
        <div className="absolute top-[48%] right-[8%] sm:right-[12%] hidden md:block pointer-events-auto z-10">
          <OrangeClover />
        </div>

        {/* Lower Right Token: GDG Developer Code Token */}
        <div className="absolute bottom-16 right-[4%] sm:right-[7%] hidden sm:block pointer-events-auto z-10">
          <GoogleCodeToken />
        </div>

      </div>

      <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center relative">

        {/* CHAPTER IDENTITY PILL CHIP */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[11px] sm:text-[13px] font-medium text-[#2c2e2a] mb-6 sm:mb-8 md:mb-10 shadow-xs max-w-[320px] sm:max-w-none text-center">
          <span className="w-2 h-2 rounded-full bg-[#8ed462] shrink-0" />
          <span>Google Developer Groups on Campus</span>
          <span className="text-[#80827f] hidden sm:inline">•</span>
          <span className="text-[#80827f] hidden sm:inline">Amal Jyothi College of Engineering</span>
        </div>

        {/* HERO DISPLAY: GDG AJCE IN TWO LINES OF ULTRA-BOLD TYPOGRAPHY WITH RIGHT-CORNER MASCOT */}
        <div className="relative w-full max-w-4xl mx-auto my-3 sm:my-5 flex flex-col items-center justify-center">
          {/* Giant Ultra Bold 2-Line Headline */}
          <h1 className="font-black text-[96px] sm:text-[145px] md:text-[185px] lg:text-[215px] text-[#2c2e2a] tracking-[-0.065em] leading-[0.82] m-0 p-0 select-none uppercase text-center">
            <span className="block">GDG</span>
            <span className="block">
              AJC<span className="relative">E<span id="scroll-path-origin" className="absolute bottom-2 -right-1 w-0 h-0 pointer-events-none select-none" /></span>
            </span>
          </h1>

          {/* Animated Mascot Layered in the Right Corner */}
          <div id="mascot-character-container" className="absolute -bottom-3 sm:-bottom-5 right-0 sm:-right-8 md:-right-14 lg:-right-20 pointer-events-none z-10">
            <div className="pointer-events-auto">
              <InteractiveMascotVideo />
            </div>
          </div>
        </div>

        {/* HERO TAGLINE */}
        <p className="text-[24px] sm:text-[32px] md:text-[40px] font-medium text-[#2c2e2a] tracking-[-0.04em] leading-[1.1] max-w-3xl mx-auto">
          Where Student Innovators Build Real Software.
        </p>

        {/* SUBHEADLINE */}
        <p className="mt-4 text-[17px] sm:text-[19px] font-normal text-[#5f6368] max-w-2xl mx-auto leading-[1.5]">
          A warm editorial community where developers build with Google AI, Cloud, Android, and Open Source. Zero chaos, pure hands-on codelabs.
        </p>

        {/* ACTION BUTTON GROUP (Explore Events & About Us) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 z-10">
          {/* Explore Events Button */}
          <Link
            href="/programs"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-[15px] font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
          >
            <span>Explore Events</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] action-dot-expand" />
          </Link>

          {/* About Us Button */}
          <Link
            href="/about"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-[15px] font-medium border border-[#d5d5d4] hover:border-[#2c2e2a]/30 transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
          >
            <span>About Us</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] action-dot-expand" />
          </Link>
        </div>

      </div>
    </section>
  );
}
