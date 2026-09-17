"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { Trophy, Flame, Target, Sparkles, Zap, Award } from "lucide-react";
import {
  YellowHexagon,
  BlueWavyRosette,
  PeriwinkleDome,
  OrangeClover,
  PinkCloud,
  LimeClover,
  CoralDonut,
  DaisyStarburst,
  GoogleCodeToken,
  PaperCutCloud,
  SmallCloud,
} from "@/components/shapes/GoogleLabsShapes";

// Mascot Interactive Video with Leaderboard Cheer Quotes
function LeaderboardMascot() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes = [
    "Sprint champions in the house! 🏆",
    "Solve codelabs to climb ranks! ⚡",
    "Top 3 unlock exclusive GDG Swag! 🎁",
    "Daily streaks give bonus XP! 🔥",
    "Let's see who claims #1! 🚀",
  ];

  const handleMascotClick = (e: React.MouseEvent) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
        colors: ["#ffd600", "#ff705d", "#8ed462", "#2ba0ff"],
        disableForReducedMotion: true,
      });
    } catch {
      // fallback
    }
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Speech Bubble */}
      <motion.button
        type="button"
        onClick={handleMascotClick}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="absolute -top-7 -left-10 sm:-left-16 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffffff] border border-[#d5d5d4] shadow-md text-xs font-semibold text-[#2c2e2a] hover:border-[#2c2e2a]/40 transition-all cursor-pointer whitespace-nowrap"
        title="Click mascot for cheer & confetti!"
      >
        <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.span
            key={quoteIndex}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
          >
            {quotes[quoteIndex]}
          </motion.span>
        </AnimatePresence>
        <Sparkles className="w-3.5 h-3.5 text-[#ffd600]" />
      </motion.button>

      {/* 2D Mascot Video */}
      <motion.div
        onClick={handleMascotClick}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="relative w-[130px] sm:w-[160px] md:w-[190px] aspect-square cursor-pointer"
        title="Click mascot for cheer & confetti!"
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
            alt="GDG AJCE Cheering Mascot"
            width={190}
            height={190}
            unoptimized
            priority
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </video>
      </motion.div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e4] text-[#2c2e2a] relative overflow-hidden pb-32 select-none">
      
      {/* FLOATING GOOGLE LABS ORGANIC SHAPES & STORYBOOK CLOUDS (Hero UI Theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Clouds */}
        <div className="absolute top-6 left-[6%] hidden sm:block">
          <PaperCutCloud scale={0.85} />
        </div>
        <div className="absolute top-12 right-[8%] hidden sm:block">
          <SmallCloud />
        </div>
        <div className="absolute top-[42%] -left-8">
          <SmallCloud />
        </div>
        <div className="absolute top-[68%] -right-8">
          <PaperCutCloud scale={0.9} />
        </div>

        {/* Left Organic Cluster */}
        <div className="absolute top-10 left-[2%] sm:left-[4%] pointer-events-auto">
          <YellowHexagon />
        </div>
        <div className="absolute top-[28%] left-[1%] sm:left-[3%] hidden sm:block pointer-events-auto">
          <BlueWavyRosette />
        </div>
        <div className="absolute top-[50%] left-[3%] hidden md:block pointer-events-auto">
          <OrangeClover />
        </div>
        <div className="absolute bottom-[20%] left-[2%] hidden sm:block pointer-events-auto">
          <DaisyStarburst />
        </div>

        {/* Right Organic Cluster */}
        <div className="absolute top-12 right-[2%] sm:right-[4%] pointer-events-auto">
          <LimeClover />
        </div>
        <div className="absolute top-[26%] right-[3%] hidden sm:block pointer-events-auto">
          <CoralDonut />
        </div>
        <div className="absolute top-[52%] right-[2%] hidden md:block pointer-events-auto">
          <PinkCloud />
        </div>
        <div className="absolute bottom-[18%] right-[3%] hidden sm:block pointer-events-auto">
          <GoogleCodeToken />
        </div>
      </div>

      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        
        {/* PAGE HEADER: Inter Display Typography & Cheering Mascot */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          
          <div className="text-center md:text-left space-y-4 max-w-2xl">
            {/* Pill Chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#ff705d] animate-pulse" />
              <span>Campus Standings & Hall of Fame</span>
              <span className="text-[#80827f]">•</span>
              <span className="text-[#80827f]">Amal Jyothi Chapter</span>
            </div>

            {/* Oversized Inter Display Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-[-0.045em] text-[#2c2e2a] leading-[1.02]">
              Developer Arena & Leaderboard
            </h1>

            <p className="text-[16px] sm:text-[17px] text-[#80827f] leading-relaxed max-w-xl">
              Real code. Real builders. Compete in monthly hackathons, build Gemini AI prompts, and complete Cloud Study Jams to rack up XP and climb the seasonal ranks.
            </p>
          </div>

          {/* Interactive Mascot on right */}
          <div className="shrink-0 flex items-center justify-center pt-4 md:pt-0">
            <LeaderboardMascot />
          </div>

        </div>

        {/* SEASON OVERVIEW STATS (Tactile Cream & White Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          
          <div className="bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2ba0ff] p-5 sm:p-6 rounded-[32px] flex items-center gap-4 transition shadow-xs group">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2ba0ff] group-hover:scale-105 transition">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#80827f] block font-semibold">
                Current Season
              </span>
              <span className="text-base sm:text-xl font-bold text-[#2c2e2a]">
                Season 2026
              </span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#d5d5d4] hover:border-[#8ed462] p-5 sm:p-6 rounded-[32px] flex items-center gap-4 transition shadow-xs group">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#8ed462] group-hover:scale-105 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#80827f] block font-semibold">
                Active Builders
              </span>
              <span className="text-base sm:text-xl font-bold text-[#2c2e2a]">
                140+ Students
              </span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#d5d5d4] hover:border-[#ffd600] p-5 sm:p-6 rounded-[32px] flex items-center gap-4 transition shadow-xs group">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#ffd600] group-hover:scale-105 transition">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#80827f] block font-semibold">
                Sprints Completed
              </span>
              <span className="text-base sm:text-xl font-bold text-[#2c2e2a]">
                8 Hackathons
              </span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#d5d5d4] hover:border-[#ff705d] p-5 sm:p-6 rounded-[32px] flex items-center gap-4 transition shadow-xs group">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#ff705d] group-hover:scale-105 transition">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#80827f] block font-semibold">
                Record Streak
              </span>
              <span className="text-base sm:text-xl font-bold text-[#2c2e2a]">
                14 Sprints 🔥
              </span>
            </div>
          </div>

        </div>

        {/* INTERACTIVE LEADERBOARD TABLE & CARDS SUITE */}
        <LeaderboardTable />

      </section>
    </main>
  );
}
