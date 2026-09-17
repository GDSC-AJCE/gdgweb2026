"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, X } from "lucide-react";
import Sticker from "@/components/ui/Sticker";
import Ribbon3D from "@/components/ui/Ribbon3D";

export default function SlushHeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative w-full bg-[#dceeff] pt-12 pb-24 px-4 sm:px-8 overflow-hidden select-none border-b border-[#000000]">
      {/* 3D INFLATABLE RIBBON (Signature Electric Blue 3D Tube weaving across the hero canvas) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-85">
        <Ribbon3D variant="hero" className="w-full max-w-[1440px] transform -translate-y-6" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto text-center flex flex-col items-center">
        
        {/* TOP STICKER CLUSTER (Asymmetrically scattered around the top) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Sticker type="rocket" label="STUDY JAMS" rotation={-6} size="sm" />
          <Sticker type="coin" label="SEASON 2026" rotation={4} size="sm" />
          <Sticker type="check" label="OFFICIAL CHAPTER" rotation={-3} size="sm" />
          <Sticker type="code" label="GEMINI 2.0" rotation={5} size="sm" />
        </div>

        {/* GIGANTIC SCULPTURAL DISPLAY HEADLINE (Lateral/Antonio 800 at 110px-240px with crushed 0.75-0.80 line-height) */}
        <div className="relative my-2">
          {/* Floating Sticker Accents pinned to text */}
          <div className="hidden lg:block absolute -top-10 -left-12 z-20">
            <Sticker type="wallet" label="UN SDGs" rotation={-12} size="md" />
          </div>
          <div className="hidden lg:block absolute -top-8 -right-14 z-20">
            <Sticker type="tag" label="AMAL JYOTHI" rotation={8} size="md" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <h1 className="font-display text-[90px] sm:text-[150px] md:text-[200px] lg:text-[240px] text-[#000000] tracking-normal uppercase leading-[0.76] m-0 p-0 drop-shadow-none">
              GDG AJCE
            </h1>
            <span className="font-display text-[36px] sm:text-[60px] md:text-[80px] lg:text-[100px] text-[#000000] tracking-tight uppercase leading-[0.82] mt-2 sm:mt-4">
              ALL THINGS GOOGLE
            </span>
          </motion.div>

          <div className="hidden lg:block absolute -bottom-6 right-16 z-20">
            <Sticker type="terminal" label="CLOUD & ANDROID" rotation={-5} size="md" />
          </div>
        </div>

        {/* TAGLINE SUBHEAD (Aeonik Pro 500 at 24-30px, #000000) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg sm:text-2xl font-medium text-[#000000] max-w-2xl mx-auto leading-tight"
        >
          The inflatable developer universe at Amal Jyothi College of Engineering. Build real-world apps with Google AI, Cloud, Flutter, and Open Source.
        </motion.p>

        {/* DUAL ACTION BUTTONS (Filled black CTA + Outlined ghost button, 1600px/40px radius, 1px black outline) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 z-20"
        >
          {/* Primary Action: Filled CTA */}
          <Link
            href="/programs"
            className="px-8 py-3.5 rounded-[40px] bg-[#000000] text-[#ffffff] font-bold text-sm sm:text-base uppercase tracking-[0.032em] border border-[#000000] hover:bg-black/85 active:scale-95 transition-all flex items-center gap-2 shadow-none"
          >
            <span>Launch App</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>

          {/* Secondary Action: Outlined Ghost Button */}
          <button
            onClick={() => setVideoOpen(true)}
            className="px-8 py-3.5 rounded-[1600px] bg-[#ffffff] text-[#000000] font-bold text-sm sm:text-base uppercase tracking-[0.032em] border border-[#000000] hover:bg-[#e9e9e9] active:scale-95 transition-all flex items-center gap-2.5 shadow-none"
          >
            <Play className="w-4 h-4 fill-current stroke-[1.5]" />
            <span>Watch Video</span>
          </button>
        </motion.div>

        {/* THREE SOFT HIGHLIGHT CARDS (20px-40px radius, 1px solid #000000 border, pastel washes, no drop-shadows) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20 pt-4 z-10 text-left">
          
          {/* Card 1: Lavender Wash */}
          <div className="rounded-[30px] border border-[#000000] bg-[#e9ccff] p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <Sticker type="rocket" label="HANDS-ON" rotation={-3} size="sm" />
              <h3 className="font-display text-3xl sm:text-4xl text-[#000000] tracking-tight mt-2 leading-[0.85]">
                ACTIVE WORKSHOPS
              </h3>
              <p className="text-sm font-medium text-[#000000] leading-snug">
                Zero boring lectures. Dive straight into live Gemini 2.0 tool-calling, Firebase backends, and full-stack Flutter builds.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-[#000000] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.032em]">Weekly Sprints</span>
              <span className="text-xs font-bold font-mono">01 //</span>
            </div>
          </div>

          {/* Card 2: Mint Pop Wash */}
          <div className="rounded-[30px] border border-[#000000] bg-[#55db9c] p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <Sticker type="check" label="VERIFIED" rotation={4} size="sm" />
              <h3 className="font-display text-3xl sm:text-4xl text-[#000000] tracking-tight mt-2 leading-[0.85]">
                GLOBAL STAGE
              </h3>
              <p className="text-sm font-medium text-[#000000] leading-snug">
                Compete in Google Solution Challenge, access Google Cloud credits, and represent Amal Jyothi on the international leaderboard.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-[#000000] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.032em]">UN 17 SDGs</span>
              <span className="text-xs font-bold font-mono">02 //</span>
            </div>
          </div>

          {/* Card 3: Paper White Fill */}
          <div className="rounded-[30px] border border-[#000000] bg-[#ffffff] p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <Sticker type="coin" label="CREDENTIALS" rotation={-2} size="sm" />
              <h3 className="font-display text-3xl sm:text-4xl text-[#000000] tracking-tight mt-2 leading-[0.85]">
                DIGITAL PASSES
              </h3>
              <p className="text-sm font-medium text-[#000000] leading-snug">
                Verifiable QR tickets, cryptographically signed attendee certificates, and seasonal member achievements.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-[#000000] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.032em]">Instant Claim</span>
              <span className="text-xs font-bold font-mono">03 //</span>
            </div>
          </div>

        </div>
      </div>

      {/* VIDEO MODAL (Slush hand-cut style with black border & white card) */}
      {videoOpen && (
        <div
          onClick={() => setVideoOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#ffffff] rounded-[30px] border-2 border-[#000000] p-6 sm:p-8 text-center text-[#000000]"
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-[1600px] border border-[#000000] bg-[#e9e9e9] hover:bg-[#cccccc] flex items-center justify-center transition"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="space-y-5">
              <div className="w-16 h-16 rounded-[1600px] border border-[#000000] bg-[#4da2ff] flex items-center justify-center mx-auto text-[#000000]">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
              <h3 className="font-display text-3xl sm:text-4xl uppercase leading-[0.85]">
                WELCOME TO GDG AJCE
              </h3>
              <p className="text-sm font-medium text-gray-700 max-w-md mx-auto">
                Discover student innovators, hands-on Google codelabs, and community hackathons at Amal Jyothi College of Engineering.
              </p>
              <div className="pt-2">
                <Link
                  href="/programs"
                  onClick={() => setVideoOpen(false)}
                  className="inline-block px-7 py-3 rounded-[40px] bg-[#000000] text-[#ffffff] font-bold uppercase tracking-[0.032em] text-xs border border-[#000000]"
                >
                  Browse Upcoming Workshops →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
