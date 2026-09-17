"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MindMarketTracks() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full bg-transparent py-16 sm:py-24 px-4 sm:px-6 select-none">
      <div className="max-w-[1240px] mx-auto space-y-10 sm:space-y-14">
        
        {/* SECTION INTRO: MindMarket Editorial Scale */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a]">
              <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
              <span>Codelabs Over Lectures</span>
            </div>
            <h2 className="text-[42px] sm:text-[60px] md:text-[72px] font-medium tracking-[-0.04em] text-[#2c2e2a] leading-[1.05]">
              Innovation Pathways
            </h2>
          </div>
          <p className="text-[16px] sm:text-[17px] font-normal text-[#80827f] max-w-md leading-relaxed">
            Thoughtfully organized learning tracks with production-grade curriculum, direct Google engineer mentorship, and community code reviews.
          </p>
        </div>

        {/* BENTO GRID (3 COLUMNS: LEFT, CENTER, RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* ===================== COLUMN 1 (LEFT) ===================== */}
          <div className="flex flex-col gap-6">
            
            {/* Card 1: Pure White Quote Card */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] p-7 sm:p-9 flex flex-col justify-between flex-1 min-h-[300px] hover:border-[#8ed462] transition-colors duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div>
                <div className="text-[16px] font-medium text-[#2c2e2a]">
                  Davide, GDG AJCE
                </div>
                <div className="text-[13px] text-[#9a9c98] mt-0.5">
                  On using meditation & code to turn his life around
                </div>

                {/* Big Coral Double Quote Marks */}
                <div className="mt-8 mb-4">
                  <svg className="w-12 h-12 text-[#ff705d] fill-current" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.324 1.533-4.212 3.655-3.998 5.357a3.84 3.84 0 0 1 2.375-.815c2.148 0 3.82 1.637 3.82 3.753 0 2.215-1.78 3.99-3.99 3.99a3.88 3.88 0 0 1-3.547-1.165zm11 0C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.324 1.533-4.212 3.655-3.998 5.357a3.84 3.84 0 0 1 2.375-.815c2.148 0 3.82 1.637 3.82 3.753 0 2.215-1.78 3.99-3.99 3.99a3.88 3.88 0 0 1-3.547-1.165z" />
                  </svg>
                </div>

                <h3 className="text-[25px] sm:text-[28px] font-medium text-[#2c2e2a] leading-[1.25] tracking-[-0.03em]">
                  Changing my thoughts has allowed me to change my life.
                </h3>
              </div>

              <div className="pt-6 mt-4 border-t border-[#f5f1e4] flex items-center justify-between text-xs text-[#9a9c98]">
                <span>Student Story</span>
                <span className="font-mono">#CommunityImpact</span>
              </div>
            </motion.div>

            {/* Card 2: Fresh Grass Green Card with Corner Cloud */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#8ed462] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="text-[20px] sm:text-[22px] font-medium text-[#2c2e2a] leading-snug tracking-[-0.02em] max-w-[280px] relative z-10">
                How getting outside can help you (and your mind) get fit
              </h3>

              <div className="pt-6 relative z-10">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white text-[#2c2e2a] text-[14px] font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 group w-fit"
                >
                  <span>Read more</span>
                  <span className="w-6 h-6 rounded-full bg-[#2c2e2a] text-white flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </Link>
              </div>

              {/* Organic White Cloud/Petal Graphic at Bottom-Right */}
              <div className="absolute -bottom-5 -right-5 pointer-events-none z-0">
                <svg width="150" height="110" viewBox="0 0 150 110" fill="none" className="opacity-95">
                  <ellipse cx="130" cy="100" rx="38" ry="34" fill="#ffffff" />
                  <ellipse cx="90" cy="90" rx="34" ry="30" fill="#ffffff" />
                  <ellipse cx="55" cy="105" rx="28" ry="24" fill="#ffffff" />
                </svg>
              </div>
            </motion.div>

          </div>

          {/* ===================== COLUMN 2 (CENTER) ===================== */}
          <div className="flex flex-col gap-6">
            
            {/* Card 3: Sunshine Yellow Card with Top Smiling Sticker Notch */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.05, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#ffd600] p-7 sm:p-8 pt-12 sm:pt-12 relative flex flex-col justify-between min-h-[250px] transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Cute Smiling Face Sticker nested in top notch */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                <div className="w-14 h-14 rounded-full bg-[#ffd600] border-4 border-[#f5f1e4] flex items-center justify-center shadow-xs">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2c2e2a" strokeWidth="2.4" strokeLinecap="round">
                    {/* Left curved eye */}
                    <path d="M7 10c.8-1 2.2-1 3 0" />
                    {/* Right curved eye */}
                    <path d="M14 10c.8-1 2.2-1 3 0" />
                    {/* Joyful smile */}
                    <path d="M8 14.5c1.6 2 6.4 2 8 0" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-[#2c2e2a] text-xs font-semibold tracking-wide w-fit mb-4">
                  Mindfulness
                </div>
                <h3 className="text-[26px] sm:text-[30px] font-medium text-[#2c2e2a] tracking-[-0.03em] leading-tight">
                  Find more joy
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#2c2e2a]/85 font-normal leading-relaxed mt-2.5">
                  Catch your breath, relax your mind, and feel 14% less stressed in just 10 days.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#2c2e2a] hover:opacity-75 transition-opacity"
                >
                  <span>Explore AI track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Card 4: Sky Pop Blue Card with Interactive Audio Player */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#2ba0ff] p-7 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between flex-1 min-h-[290px] transition-transform duration-300 hover:-translate-y-1"
            >
              <div>
                <h3 className="text-[26px] sm:text-[30px] font-medium text-white tracking-[-0.03em] leading-tight">
                  Make every day happier
                </h3>
                <p className="text-[15px] sm:text-[16px] text-white/90 font-normal leading-relaxed mt-2.5">
                  Do it for yourself, and everyone you love. It only takes a few minutes to find some mindspace.
                </p>
              </div>

              {/* Tactile Audio Player Pill */}
              <div className="bg-white rounded-full p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 text-[#2c2e2a] shadow-sm mt-8 select-none">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                  className="w-10 h-10 rounded-full bg-[#ff705d] hover:bg-[#ee6350] flex items-center justify-center text-white shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#2c2e2a] truncate">Alone time</span>
                    <span className="text-[#80827f] font-mono text-[11px] shrink-0 ml-2">
                      {isPlaying ? "05:12" : "4:23"}
                    </span>
                  </div>
                  
                  {/* Progress track with scrubber dot */}
                  <div className="relative w-full h-1.5 bg-[#f0ede4] rounded-full overflow-visible flex items-center">
                    <motion.div
                      className="h-full bg-[#ff705d] rounded-full"
                      animate={{ width: isPlaying ? "58%" : "34%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <div
                      className="w-3 h-3 rounded-full bg-[#ff705d] border-2 border-white absolute shadow-xs pointer-events-none transition-all duration-300"
                      style={{ left: isPlaying ? "calc(58% - 6px)" : "calc(34% - 6px)" }}
                    />
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#80827f] shrink-0">16:20</span>
              </div>
            </motion.div>

          </div>

          {/* ===================== COLUMN 3 (RIGHT) ===================== */}
          <div className="flex flex-col gap-6">
            
            {/* Card 5: Coral Pop Orange Card */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#ff705d] p-7 sm:p-8 text-white flex flex-col justify-between min-h-[220px] transition-transform duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-[#2c2e2a] text-xs font-semibold tracking-wide w-fit mb-4">
                  Sleep
                </div>
                <h3 className="text-[26px] sm:text-[30px] font-medium text-white tracking-[-0.03em] leading-tight">
                  Get more goodnights
                </h3>
                <p className="text-[15px] sm:text-[16px] text-white/90 font-normal leading-relaxed mt-2.5">
                  Put your mind to bed, wake up refreshed, and make good days your new normal.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-xs font-medium text-white hover:opacity-80 transition-opacity"
                >
                  <span>Explore mobile track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Card 6: Hot Pink / Magenta Card with Flower Petals & 3 Stats */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#f33f92] p-7 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between flex-1 min-h-[340px] transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Organic White Flower Petals peaking in from Top Edge */}
              <div className="absolute -top-7 left-12 pointer-events-none z-0">
                <svg width="120" height="70" viewBox="0 0 120 70" fill="none" className="opacity-95">
                  <ellipse cx="60" cy="18" rx="28" ry="24" fill="#ffffff" />
                  <ellipse cx="25" cy="26" rx="22" ry="18" fill="#ffffff" />
                  <ellipse cx="95" cy="26" rx="22" ry="18" fill="#ffffff" />
                </svg>
              </div>

              {/* Organic White Flower Petals peaking in from Right Edge */}
              <div className="absolute top-1/4 -right-8 pointer-events-none z-0">
                <svg width="80" height="130" viewBox="0 0 80 130" fill="none" className="opacity-95">
                  <ellipse cx="60" cy="65" rx="30" ry="26" fill="#ffffff" />
                  <ellipse cx="50" cy="30" rx="24" ry="20" fill="#ffffff" />
                  <ellipse cx="50" cy="100" rx="24" ry="20" fill="#ffffff" />
                </svg>
              </div>

              {/* 3 Stacked Impact Stats */}
              <div className="space-y-6 relative z-10 my-auto py-2">
                <div>
                  <div className="text-[28px] sm:text-[32px] font-medium text-white tracking-tight leading-none">
                    4.9 Stars
                  </div>
                  <div className="text-[14px] text-white/85 font-normal mt-1.5">
                    Average rating
                  </div>
                </div>

                <div>
                  <div className="text-[28px] sm:text-[32px] font-medium text-white tracking-tight leading-none">
                    611.9K Ratings
                  </div>
                  <div className="text-[14px] text-white/85 font-normal mt-1.5">
                    On iOS and Google Play
                  </div>
                </div>

                <div>
                  <div className="text-[28px] sm:text-[32px] font-medium text-white tracking-tight leading-none">
                    70M Downloads
                  </div>
                  <div className="text-[14px] text-white/85 font-normal mt-1.5">
                    Across all platforms
                  </div>
                </div>
              </div>

              <div className="pt-4 relative z-10 border-t border-white/20 flex items-center justify-between text-xs text-white/80">
                <span>Verified Impact</span>
                <span className="font-mono">GDG // 2026</span>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
