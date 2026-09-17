"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  YellowHexagon,
  BlueWavyRosette,
  PaperCutCloud,
  LimeClover,
} from "@/components/shapes/GoogleLabsShapes";

const MASCOT_404_QUOTES = [
  "Who forgot to render this chunk? 🗺️",
  "404: Fell out of the world! ⛏️",
  "I checked all the blocks... nothing! 🔍",
  "Let's respawn at base camp! 🚀",
  "Click me for good build karma! ✨",
];

export default function NotFound() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const handleMascotClick = (e: React.MouseEvent) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: ["#4285F4", "#34A853", "#FBBC04", "#EA4335", "#ff705d", "#8ed462"],
        disableForReducedMotion: true,
      });
    } catch {
      // fallback
    }
    setQuoteIndex((prev) => (prev + 1) % MASCOT_404_QUOTES.length);
  };

  return (
    <div className="relative min-h-[85vh] w-full bg-[#f5f1e4] text-[#2c2e2a] overflow-hidden flex flex-col justify-between select-none">
      
      {/* ── MINIMAL BACKGROUND ACCENTS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-4 right-[16%] hidden md:block opacity-80">
          <PaperCutCloud scale={0.9} />
        </div>
        <div className="absolute top-12 left-[10%] hidden lg:block pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
          <YellowHexagon />
        </div>
        <div className="absolute bottom-20 right-[10%] hidden md:block pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
          <BlueWavyRosette />
        </div>
        <div className="absolute bottom-16 left-[8%] hidden lg:block pointer-events-auto opacity-60 hover:opacity-100 transition-opacity">
          <LimeClover />
        </div>
      </div>

      {/* ── CENTERED HERO SECTION ── */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 my-auto py-10 sm:py-16 flex flex-col items-center text-center">
        
        {/* Status Pill Chip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-xs sm:text-[13px] font-medium text-[#2c2e2a] shadow-xs mb-6 sm:mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" />
          <span>Chunk Missing • Error 404</span>
        </motion.div>

        {/* ── BIG CARTOONISH 404 WITH CHARACTER OVER THE RIGHT 4-NODE ── */}
        <div className="relative inline-flex items-center justify-center select-none my-3 sm:my-6">
          
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5 select-none">
            
            {/* Left 4: Coral Pop */}
            <motion.div
              whileHover={{ scale: 1.06, rotate: -8 }}
              whileTap={{ scale: 0.94 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative cursor-pointer select-none"
              title="Click to bounce!"
            >
              <span
                className="text-[100px] sm:text-[150px] md:text-[200px] lg:text-[220px] font-black text-[#ff705d] leading-none inline-block -rotate-6 transition-transform"
                style={{
                  WebkitTextStroke: "4px #2c2e2a",
                  filter: "drop-shadow(6px 7px 0px #2c2e2a)",
                  paintOrder: "stroke fill",
                }}
              >
                4
              </span>
              {/* Glossy cartoon highlight dot */}
              <span className="absolute top-4 sm:top-6 left-5 sm:left-8 w-2 sm:w-3.5 h-4 sm:h-8 rounded-full bg-white/40 -rotate-12 pointer-events-none" />
            </motion.div>

            {/* Center 0: Sunshine Yellow with Dizzy Cartoon Face (✕ ‿ ✕) */}
            <motion.div
              whileHover={{ scale: 1.06, rotate: 6 }}
              whileTap={{ scale: 0.94 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="relative cursor-pointer select-none"
              title="Oops! Dizzy Zero"
            >
              <span
                className="text-[100px] sm:text-[150px] md:text-[200px] lg:text-[220px] font-black text-[#ffd600] leading-none inline-block rotate-3 transition-transform"
                style={{
                  WebkitTextStroke: "4px #2c2e2a",
                  filter: "drop-shadow(6px 7px 0px #2c2e2a)",
                  paintOrder: "stroke fill",
                }}
              >
                0
              </span>
              
              {/* Dizzy cartoon face (✕ ‿ ✕) in the center of the zero */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none rotate-3">
                <div className="flex items-center gap-2 sm:gap-3.5 text-[#2c2e2a] font-black text-xs sm:text-base md:text-lg leading-none">
                  <span>✕</span>
                  <span>✕</span>
                </div>
                <div className="w-3 sm:w-5 md:w-6 h-1 sm:h-1.5 border-b-2 sm:border-b-[2.5px] border-[#2c2e2a] rounded-full mt-0.5 sm:mt-1" />
              </div>
            </motion.div>

            {/* Right 4: Fresh Grass Green — With the Character Sitting Right OVER It */}
            <div className="relative">
              
              {/* Character Over the 4-Node (Moved ~6cm down onto the crossbar/side of 4) */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-1 sm:bottom-3 md:bottom-5 -right-5 sm:-right-8 md:-right-10 z-30 flex flex-col items-center pointer-events-auto"
              >
                {/* Speech Bubble Above Mascot */}
                <motion.button
                  type="button"
                  onClick={handleMascotClick}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff] border border-[#d5d5d4] shadow-md text-[10px] sm:text-xs font-semibold text-[#2c2e2a] hover:border-[#2c2e2a]/40 transition-all cursor-pointer whitespace-nowrap mb-0.5"
                  title="Click for dev tips & confetti!"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse shrink-0" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.15 }}
                    >
                      {MASCOT_404_QUOTES[quoteIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <Sparkles className="w-3 h-3 text-[#fbbc04] shrink-0" />
                </motion.button>

                {/* The Character Video Layered Over the 4 */}
                <motion.div
                  onClick={handleMascotClick}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative w-[85px] sm:w-[115px] md:w-[130px] aspect-square cursor-pointer select-none"
                  title="Click me!"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
                  >
                    <source src="/mascot.webm" type="video/webm; codecs=vp9" />
                    <Image
                      src="/mascot-animated.webp"
                      alt="GDG AJCE Mascot"
                      width={130}
                      height={130}
                      unoptimized
                      priority
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  </video>
                </motion.div>
              </motion.div>

              {/* The Right 4 Numeral Itself */}
              <motion.div
                whileHover={{ scale: 1.06, rotate: 10 }}
                whileTap={{ scale: 0.94 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="relative cursor-pointer select-none"
                title="Click to bounce!"
              >
                <span
                  className="text-[100px] sm:text-[150px] md:text-[200px] lg:text-[220px] font-black text-[#8ed462] leading-none inline-block rotate-6 transition-transform"
                  style={{
                    WebkitTextStroke: "4px #2c2e2a",
                    filter: "drop-shadow(6px 7px 0px #2c2e2a)",
                    paintOrder: "stroke fill",
                  }}
                >
                  4
                </span>
                {/* Glossy cartoon highlight dot */}
                <span className="absolute top-4 sm:top-6 right-5 sm:right-8 w-2 sm:w-3.5 h-4 sm:h-8 rounded-full bg-white/40 rotate-12 pointer-events-none" />
              </motion.div>

            </div>

          </div>

        </div>

        {/* ── EDITORIAL HEADLINE & SUBTITLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-2 mt-4 sm:mt-6 max-w-md mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2c2e2a]">
            Oops! You&apos;ve wandered off the grid.
          </h2>
          <p className="text-sm sm:text-[15px] text-[#80827f] leading-relaxed">
            The coordinates you followed lead to an ungenerated chunk. Let our companion guide you back safely.
          </p>
        </motion.div>

        {/* ── MINIMAL ACTION BUTTONS (Signature Expanding Action Dots) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-7"
        >
          {/* Primary CTA (Coral Pop) */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-[14px] sm:text-[15px] font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Respawn at Home</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
          </Link>

          {/* Secondary CTA (White on Cream) */}
          <Link
            href="/programs"
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-[14px] sm:text-[15px] font-medium border border-[#d5d5d4] hover:border-[#2c2e2a]/30 transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
          >
            <span>Explore Events</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] transition-all duration-300 group-hover:scale-125" />
          </Link>
        </motion.div>

      </div>

      {/* ── MINIMAL FOOTER WAYPOINTS ── */}
      <div className="relative z-10 w-full py-4 text-center border-t border-[#d5d5d4]/40 bg-[#ffffff]/30 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#80827f]">
          <span>Waypoints:</span>
          <Link href="/" className="hover:text-[#2c2e2a] hover:underline transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link href="/programs" className="hover:text-[#2c2e2a] hover:underline transition-colors">
            Events
          </Link>
          <span>•</span>
          <Link href="/leaderboard" className="hover:text-[#2c2e2a] hover:underline transition-colors">
            Leaderboard
          </Link>
          <span>•</span>
          <Link href="/team" className="hover:text-[#2c2e2a] hover:underline transition-colors">
            Team
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#2c2e2a] hover:underline transition-colors">
            Contact
          </Link>
        </div>
      </div>

    </div>
  );
}
