"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// =============================================================================
// GOOGLE LABS ORGANIC SHAPES & KINETIC PILLS (design.md & AGENTS.md)
// =============================================================================

// 1. Yellow Chamfered Hexagon (#ffd600)
function YellowHexagon({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, rotate: 18 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-1 ${className}`}
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
          fill="#ffd600"
        />
      </svg>
    </motion.div>
  );
}

// 2. Blue Sinusoidal Wavy Rosette / Badge (#2ba0ff - Sky Pop)
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
      whileHover={{ scale: 1.18, rotate: -25 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-2 ${className}`}
      title="Blue Wavy Starburst"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
        <path d={pathD} fill="#2ba0ff" />
      </svg>
    </motion.div>
  );
}

// 3. Periwinkle Dome (#95a8fe)
function PeriwinkleDome({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, rotate: 12 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-3 ${className}`}
      title="Periwinkle Dome"
    >
      <svg viewBox="0 0 110 80" className="w-18 h-14 sm:w-24 sm:h-18 lg:w-28 lg:h-20">
        <path
          d="M 16 12
             L 94 12
             Q 104 12 104 22
             C 104 82 6 82 6 22
             Q 6 12 16 12 Z"
          fill="#95a8fe"
        />
      </svg>
    </motion.div>
  );
}

// 4. Coral 4-Lobed Organic Clover (#ff705d - Coral Pop)
function CoralClover({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, rotate: 45 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-4 ${className}`}
      title="Coral Clover"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
        <g fill="#ff705d">
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

// 5. Pink Scallop Cloud (#ffaff6)
function PinkCloud({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, rotate: -12 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-3 ${className}`}
      title="Pink Scallop Cloud"
    >
      <svg viewBox="0 0 130 80" className="w-20 h-14 sm:w-26 sm:h-18 lg:w-30 lg:h-20">
        <g fill="#ffaff6">
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

// 6. Fresh Grass 4-Leaf Clover (#8ed462)
function FreshGrassClover({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.18, rotate: -35 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-2 ${className}`}
      title="Fresh Grass Clover"
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
        <g fill="#8ed462">
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

// 7. Coral Torus / Donut Ring (#ff705d)
function CoralDonut({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 45 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-1 ${className}`}
      title="Coral Ring"
    >
      <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18">
        <path
          d="M 50 14 A 36 36 0 1 0 50 86 A 36 36 0 1 0 50 14 Z M 50 32 A 18 18 0 1 1 50 68 A 18 18 0 1 1 50 32 Z"
          fill="#ff705d"
        />
      </svg>
    </motion.div>
  );
}

// 8. Sunshine 8-Petal Daisy Starburst (#ffd600)
function DaisyStarburst({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.25 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-spin-daisy ${className}`}
      title="Sunshine Daisy"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        <g fill="#ffd600" transform="translate(50, 50)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse key={deg} cx="0" cy="-28" rx="8" ry="15" transform={`rotate(${deg})`} />
          ))}
          <circle cx="0" cy="0" r="14" fill="#ffffff" />
        </g>
      </svg>
    </motion.div>
  );
}

// 9. GDG Developer Code Token (< > in Google Colors)
function GoogleCodeToken({ className = "" }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 0 }}
      className={`cursor-pointer select-none drop-shadow-xs anim-float-4 ${className}`}
      title="GDG Code Token"
    >
      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center shadow-xs">
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <path d="M 17 12 L 9 20 L 17 28" fill="none" stroke="#4285F4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 23 12 L 31 20 L 23 28" fill="none" stroke="#34A853" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

// 10. Fluffy Paper-Cut Cloud (#FFFFFF)
function PaperCutCloud({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  return (
    <div
      className={`select-none pointer-events-none drop-shadow-xs anim-drift-1 ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <svg width="190" height="95" viewBox="0 0 190 95" fill="none">
        <g fill="#ffffff">
          <rect x="25" y="42" width="140" height="36" rx="18" />
          <circle cx="56" cy="46" r="26" />
          <circle cx="95" cy="34" r="32" />
          <circle cx="136" cy="44" r="26" />
        </g>
      </svg>
    </div>
  );
}

// 11. Small Companion Cloud (#FFFFFF)
function SmallCloud({ className = "" }: { className?: string }) {
  return (
    <div
      className={`select-none pointer-events-none drop-shadow-xs anim-drift-2 ${className}`}
    >
      <svg width="130" height="70" viewBox="0 0 130 70" fill="none">
        <g fill="#ffffff" opacity="0.95">
          <rect x="18" y="32" width="94" height="24" rx="12" />
          <circle cx="42" cy="36" r="20" />
          <circle cx="74" cy="28" r="24" />
          <circle cx="102" cy="38" r="16" />
        </g>
      </svg>
    </div>
  );
}

// 12. Official GDG AJCE Mascot
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
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="absolute -top-6 -left-6 sm:-left-12 z-30 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff] border border-[#d5d5d4] shadow-xs text-[11px] sm:text-xs font-semibold text-[#2c2e2a] hover:border-[#2c2e2a]/40 transition-all cursor-pointer select-none whitespace-nowrap anim-float-1"
        title="Click to interact with the mascot!"
      >
        <span className="w-2 h-2 rounded-full bg-[#8ed462] animate-pulse" />
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
        <Sparkles className="w-3 h-3 text-[#ffd600]" />
      </motion.button>

      {/* 2D Animated Mascot Video */}
      <motion.div
        onClick={cycleGreeting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="relative w-[150px] sm:w-[195px] md:w-[230px] lg:w-[260px] aspect-square cursor-pointer anim-float-2"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/gdg-mascot.png"
          className="w-full h-full object-contain pointer-events-none select-none"
        >
          <source src="/mascot.webm" type="video/webm; codecs=vp9" />
          <source src="/mascot.webm" type="video/webm" />
          <img
            src="/gdg-mascot.png"
            alt="GDG AJCE Mascot"
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </video>
      </motion.div>
    </div>
  );
}

export default function MindMarketHero() {
  const [driveOpen, setDriveOpen] = useState(false);

  useEffect(() => {
    const checkDrive = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "execomRecruitment"));
        if (snap.exists() && snap.data()?.isOpen) {
          setDriveOpen(true);
        }
      } catch (e) {
        console.error("Error checking recruitment status:", e);
      }
    };
    checkDrive();
  }, []);

  return (
    <section className="relative w-full bg-transparent text-[#2c2e2a] pt-10 sm:pt-14 pb-24 sm:pb-28 md:pb-20 px-4 sm:px-6 select-none overflow-hidden">
      
      {/* BACKGROUND FLOATING GOOGLE LABS ORGANIC SHAPES & CLOUDS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* STORYBOOK PAPER-CUT CLOUDS */}
        <div className="absolute top-2 left-[14%] sm:left-[17%] hidden sm:block pointer-events-none z-0">
          <PaperCutCloud scale={0.9} />
        </div>

        <div className="absolute top-5 right-[13%] sm:right-[16%] hidden sm:block pointer-events-none z-0">
          <SmallCloud />
        </div>

        <div className="absolute top-[60%] -left-10 sm:-left-6 pointer-events-none z-0">
          <SmallCloud />
        </div>

        <div className="absolute bottom-0 -right-4 sm:right-[4%] md:right-[6%] pointer-events-none z-0">
          <PaperCutCloud scale={1.05} />
        </div>

        <div className="absolute bottom-2 left-[9%] sm:left-[13%] hidden md:block pointer-events-none z-0">
          <SmallCloud />
        </div>

        {/* LEFT SIDE CLUSTER */}
        <div className="absolute top-6 left-[2%] sm:left-[5%] lg:left-[7%] pointer-events-auto z-10">
          <YellowHexagon />
        </div>
        
        <div className="absolute top-[18%] left-[10%] sm:left-[13%] lg:left-[15%] hidden sm:block pointer-events-auto z-10">
          <CoralDonut />
        </div>

        <div className="absolute top-[35%] left-[1%] sm:left-[3%] lg:left-[4%] pointer-events-auto z-10">
          <BlueWavyRosette />
        </div>

        <div className="absolute top-[52%] left-[5%] sm:left-[8%] lg:left-[10%] hidden md:block pointer-events-auto z-10">
          <PeriwinkleDome />
        </div>

        <div className="absolute bottom-[34%] left-[9%] sm:left-[12%] lg:left-[14%] hidden sm:block pointer-events-auto z-10">
          <CoralClover />
        </div>

        <div className="absolute bottom-16 left-[2%] sm:left-[5%] lg:left-[7%] hidden sm:block pointer-events-auto z-10">
          <DaisyStarburst />
        </div>

        {/* RIGHT SIDE CLUSTER */}
        <div className="absolute top-8 right-[21%] sm:right-[24%] hidden lg:block pointer-events-auto z-10">
          <CoralDonut />
        </div>

        <div className="absolute top-6 right-[3%] sm:right-[6%] lg:right-[8%] pointer-events-auto z-10">
          <FreshGrassClover />
        </div>

        <div className="absolute top-[32%] right-[1%] sm:right-[3%] lg:right-[5%] pointer-events-auto z-10">
          <PinkCloud />
        </div>

        <div className="absolute top-[48%] right-[8%] sm:right-[12%] hidden md:block pointer-events-auto z-10">
          <CoralClover />
        </div>

        <div className="absolute bottom-16 right-[4%] sm:right-[7%] hidden sm:block pointer-events-auto z-10">
          <GoogleCodeToken />
        </div>

      </div>

      <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center relative">

        {/* CHAPTER IDENTITY PILL CHIP (design.md: rounded-[50px] bg-[#ffffff] border-[#d5d5d4]) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[11px] sm:text-[13px] font-medium text-[#2c2e2a] mb-6 sm:mb-8 md:mb-10 shadow-xs max-w-[320px] sm:max-w-none text-center">
          <span className="w-2 h-2 rounded-full bg-[#8ed462] shrink-0 animate-pulse" />
          <span>Google Developer Groups on Campus</span>
          <span className="text-[#80827f] hidden sm:inline">•</span>
          <span className="text-[#80827f] hidden sm:inline">Amal Jyothi College of Engineering</span>
        </div>

        {/* HERO DISPLAY: GDG AJCE IN TWO LINES OF ULTRA-BOLD TYPOGRAPHY WITH RIGHT-CORNER MASCOT */}
        <div className="relative w-full max-w-4xl mx-auto my-3 sm:my-5 flex flex-col items-center justify-center">
          <h1 className="font-black text-[96px] sm:text-[145px] md:text-[185px] lg:text-[215px] text-[#2c2e2a] tracking-[-0.065em] leading-[0.82] m-0 p-0 select-none uppercase text-center font-display-hero">
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
        <p className="mt-4 text-[17px] sm:text-[19px] font-normal text-[#80827f] max-w-2xl mx-auto leading-[1.5]">
          A high-energy student community where developers build with Google AI, Cloud, Android, and Open Source. Zero chaos, pure hands-on codelabs.
        </p>

        {/* ACTION BUTTON GROUP (design.md: 50px pill with expanding action dots) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 z-10">
          {driveOpen && (
            <Link
              href="/execom"
              className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#8ed462] hover:bg-[#7ec452] text-[#2c2e2a] text-[15px] font-semibold transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#ffd600]" />
              <span>Join Community / Apply for Execom</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2c2e2a] action-dot-expand shadow-xs" />
            </Link>
          )}

          {/* Primary CTA: Coral Pop Button */}
          <Link
            href="/programs"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-[15px] font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
          >
            <span>Explore Events</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] action-dot-expand shadow-xs" />
          </Link>

          {/* Secondary CTA: White on Cream Button */}
          <Link
            href="/about"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-[15px] font-medium border border-[#d5d5d4] hover:border-[#2c2e2a]/30 transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
          >
            <span>About Us</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] action-dot-expand shadow-xs" />
          </Link>
        </div>

      </div>
    </section>
  );
}
