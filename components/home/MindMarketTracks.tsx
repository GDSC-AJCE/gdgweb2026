"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight, Sparkles, Terminal, Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MindMarketTracks() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full bg-transparent py-16 sm:py-24 px-4 sm:px-6 select-none">
      <div className="max-w-[1240px] mx-auto space-y-10 sm:space-y-14">
        
        {/* SECTION INTRO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
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
            
            {/* Card 1: Student Story Quote Card (Pure White Bento Card) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] p-7 sm:p-9 flex flex-col justify-between flex-1 min-h-[300px] hover:border-[#8ed462] transition-colors duration-300 shadow-xs"
            >
              <div>
                <div className="text-[16px] font-semibold text-[#2c2e2a]">
                  Rahul S., GDG AJCE
                </div>
                <div className="text-[13px] text-[#80827f] mt-0.5">
                  On deploying his first full-stack cloud project
                </div>

                {/* Big Coral Double Quote Marks */}
                <div className="mt-8 mb-4">
                  <svg className="w-12 h-12 text-[#ff705d] fill-current" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.324 1.533-4.212 3.655-3.998 5.357a3.84 3.84 0 0 1 2.375-.815c2.148 0 3.82 1.637 3.82 3.753 0 2.215-1.78 3.99-3.99 3.99a3.88 3.88 0 0 1-3.547-1.165zm11 0C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.324 1.533-4.212 3.655-3.998 5.357a3.84 3.84 0 0 1 2.375-.815c2.148 0 3.82 1.637 3.82 3.753 0 2.215-1.78 3.99-3.99 3.99a3.88 3.88 0 0 1-3.547-1.165z" />
                  </svg>
                </div>

                <h3 className="text-[24px] sm:text-[27px] font-medium text-[#2c2e2a] leading-[1.25] tracking-[-0.03em]">
                  Building real software alongside peers completely transformed my engineering journey.
                </h3>
              </div>

              <div className="pt-6 mt-4 border-t border-[#e5e1d5] flex items-center justify-between text-xs text-[#80827f] font-medium">
                <span>Student Story</span>
                <span className="font-mono text-[#2ba0ff]">#CommunityImpact</span>
              </div>
            </motion.div>

            {/* Card 2: AI & Machine Learning Track (Fresh Grass Green - design.md) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#8ed462] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-transform duration-300 hover:-translate-y-1 shadow-xs text-[#2c2e2a]"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff]/60 backdrop-blur-xs text-[#2c2e2a] text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI & Machine Learning</span>
                </div>
                <h3 className="text-[21px] sm:text-[23px] font-bold text-[#2c2e2a] leading-snug tracking-[-0.02em] max-w-[280px] relative z-10">
                  Build with Gemini, Vertex AI & Multimodal Agents
                </h3>
              </div>

              <div className="pt-6 relative z-10">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#ffffff] text-[#2c2e2a] text-[14px] font-semibold transition-all duration-300 hover:shadow-xs hover:scale-[1.02] active:scale-95 group w-fit"
                >
                  <span>Explore Track</span>
                  <span className="w-6 h-6 rounded-full bg-[#2c2e2a] text-white flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </Link>
              </div>

              {/* Organic White Cloud/Petal Graphic */}
              <div className="absolute -bottom-5 -right-5 pointer-events-none z-0">
                <svg width="150" height="110" viewBox="0 0 150 110" fill="none" className="opacity-90">
                  <ellipse cx="130" cy="100" rx="38" ry="34" fill="#ffffff" fillOpacity="0.3" />
                  <ellipse cx="90" cy="90" rx="34" ry="30" fill="#ffffff" fillOpacity="0.3" />
                  <ellipse cx="55" cy="105" rx="28" ry="24" fill="#ffffff" fillOpacity="0.3" />
                </svg>
              </div>
            </motion.div>

          </div>

          {/* ===================== COLUMN 2 (CENTER) ===================== */}
          <div className="flex flex-col gap-6">
            
            {/* Card 3: Google Cloud & DevOps (Sunshine Yellow - design.md) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.05, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#ffd600] p-7 sm:p-8 pt-12 sm:pt-12 relative flex flex-col justify-between min-h-[250px] transition-transform duration-300 hover:-translate-y-1 shadow-xs text-[#2c2e2a]"
            >
              {/* Cute Code Token nested in top notch */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                <div className="w-14 h-14 rounded-full bg-[#ffd600] border-4 border-[#f5f1e4] flex items-center justify-center shadow-xs">
                  <Terminal className="w-6 h-6 text-[#2c2e2a]" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ffffff] text-[#2c2e2a] text-xs font-semibold tracking-wide w-fit mb-4 shadow-xs">
                  Cloud & DevOps
                </div>
                <h3 className="text-[26px] sm:text-[30px] font-bold text-[#2c2e2a] tracking-[-0.03em] leading-tight">
                  Master Google Cloud & Kubernetes
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#2c2e2a]/90 font-normal leading-relaxed mt-2.5">
                  Earn Google Cloud badges, containerize production services, and architect resilient web services.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#2c2e2a] hover:underline transition-all"
                >
                  <span>Explore Cloud Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Card 4: Web & Mobile Engineering (Sky Pop Blue - design.md) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#2ba0ff] p-7 sm:p-8 text-[#ffffff] relative overflow-hidden flex flex-col justify-between flex-1 min-h-[290px] transition-transform duration-300 hover:-translate-y-1 shadow-xs"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff]/20 backdrop-blur-xs text-[#ffffff] text-xs font-semibold mb-3">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Mobile & Web Track</span>
                </div>
                <h3 className="text-[26px] sm:text-[30px] font-bold text-[#ffffff] tracking-[-0.03em] leading-tight">
                  Ship with Jetpack Compose & Flutter
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#ffffff]/90 font-normal leading-relaxed mt-2.5">
                  Build responsive Android applications and modern Web apps using industry best practices.
                </p>
              </div>

              {/* Tactile Audio / Codelab Simulation Pill */}
              <div className="bg-[#ffffff] rounded-full p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 text-[#2c2e2a] shadow-xs mt-8 select-none border border-[#d5d5d4]">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Pause codelab audio" : "Play codelab audio"}
                  className="w-10 h-10 rounded-full bg-[#2ba0ff] hover:bg-[#208be6] flex items-center justify-center text-white shrink-0 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#2c2e2a] truncate">Compose vs Flutter</span>
                    <span className="text-[#80827f] font-mono text-[11px] shrink-0 ml-2">
                      {isPlaying ? "08:14" : "03:45"}
                    </span>
                  </div>
                  
                  {/* Progress track with scrubber dot */}
                  <div className="relative w-full h-1.5 bg-[#f5f1e4] rounded-full overflow-visible flex items-center">
                    <motion.div
                      className="h-full bg-[#2ba0ff] rounded-full"
                      animate={{ width: isPlaying ? "64%" : "34%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <div
                      className="w-3 h-3 rounded-full bg-[#2ba0ff] border-2 border-white absolute shadow-xs pointer-events-none transition-all duration-300"
                      style={{ left: isPlaying ? "calc(64% - 6px)" : "calc(34% - 6px)" }}
                    />
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#80827f] shrink-0">12:30</span>
              </div>
            </motion.div>

          </div>

          {/* ===================== COLUMN 3 (RIGHT) ===================== */}
          <div className="flex flex-col gap-6">
            
            {/* Card 5: Open Source & Solution Challenge (Coral Pop - design.md) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#ff705d] p-7 sm:p-8 text-[#ffffff] flex flex-col justify-between min-h-[220px] transition-transform duration-300 hover:-translate-y-1 shadow-xs"
            >
              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ffffff] text-[#2c2e2a] text-xs font-semibold tracking-wide w-fit mb-4 shadow-xs">
                  Global Hackathon
                </div>
                <h3 className="text-[26px] sm:text-[30px] font-bold text-[#ffffff] tracking-[-0.03em] leading-tight">
                  UN Solution Challenge 2026
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#ffffff]/90 font-normal leading-relaxed mt-2.5">
                  Form sprint teams, solve one of 17 UN Sustainable Development Goals, and represent AJCE globally.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#ffffff] hover:underline transition-all"
                >
                  <span>Learn How to Participate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Card 6: Chapter Impact Stats (Periwinkle - design.md) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[36px] bg-[#95a8fe] p-7 sm:p-8 text-[#2c2e2a] relative overflow-hidden flex flex-col justify-between flex-1 min-h-[340px] transition-transform duration-300 hover:-translate-y-1 shadow-xs"
            >
              {/* Organic White Flower Petals */}
              <div className="absolute -top-7 left-12 pointer-events-none z-0">
                <svg width="120" height="70" viewBox="0 0 120 70" fill="none" className="opacity-90">
                  <ellipse cx="60" cy="18" rx="28" ry="24" fill="#ffffff" fillOpacity="0.35" />
                  <ellipse cx="25" cy="26" rx="22" ry="18" fill="#ffffff" fillOpacity="0.35" />
                  <ellipse cx="95" cy="26" rx="22" ry="18" fill="#ffffff" fillOpacity="0.35" />
                </svg>
              </div>

              {/* 3 Stacked Chapter Impact Stats */}
              <div className="space-y-6 relative z-10 my-auto py-2">
                <div>
                  <div className="text-[30px] sm:text-[34px] font-black text-[#2c2e2a] tracking-tight leading-none">
                    1,200+ Members
                  </div>
                  <div className="text-[14px] text-[#2c2e2a]/85 font-medium mt-1.5">
                    Active student developers on campus
                  </div>
                </div>

                <div>
                  <div className="text-[30px] sm:text-[34px] font-black text-[#2c2e2a] tracking-tight leading-none">
                    45+ Codelabs
                  </div>
                  <div className="text-[14px] text-[#2c2e2a]/85 font-medium mt-1.5">
                    Hands-on build sessions & hack sprints
                  </div>
                </div>

                <div>
                  <div className="text-[30px] sm:text-[34px] font-black text-[#2c2e2a] tracking-tight leading-none">
                    100% Free
                  </div>
                  <div className="text-[14px] text-[#2c2e2a]/85 font-medium mt-1.5">
                    Open community, zero paywalls
                  </div>
                </div>
              </div>

              <div className="pt-4 relative z-10 border-t border-[#2c2e2a]/20 flex items-center justify-between text-xs text-[#2c2e2a]/80 font-medium">
                <span>Verified Chapter</span>
                <span className="font-mono">GDG AJCE // 2026</span>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
