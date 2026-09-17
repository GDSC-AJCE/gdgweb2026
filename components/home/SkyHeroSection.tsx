"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, X, Sparkles, Cloud, Smartphone, Award, Code2, Globe } from "lucide-react";

export default function SkyHeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure smooth continuous playback without stutter or layout shift
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play().catch(() => {
        // Autoplay policy handled gracefully
      });
    }
  }, []);

  const M3_TOPICS = [
    { label: "Gemini AI", icon: Sparkles, color: "#4285F4" },
    { label: "Cloud Sprint", icon: Cloud, color: "#EA4335" },
    { label: "Android & Compose", icon: Smartphone, color: "#34A853" },
    { label: "Solution Challenge", icon: Award, color: "#FBBC04" },
    { label: "Open Source", icon: Code2, color: "#4285F4" },
    { label: "Web Platform", icon: Globe, color: "#34A853" },
  ];

  return (
    <section className="relative min-h-[96vh] pt-28 pb-20 overflow-hidden flex flex-col justify-between select-none">
      {/* 1. CONTINUOUS PERFORMANCE-OPTIMIZED BACKGROUND VIDEO */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-[#F3F0E6] pointer-events-none">
        <video
          ref={videoRef}
          src="/hero-background.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="w-full h-full object-cover object-center will-change-transform transform-gpu scale-[1.02]"
        />

        {/* Soft subtle tint overlay to guarantee maximum text contrast and elegant atmosphere */}
        <div className="absolute inset-0 bg-white/20 backdrop-brightness-[1.02]" />

        {/* Bottom Horizon Gradient: Fades seamlessly into the main website canvas #F3F0E6 */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#F3F0E6] via-[#F3F0E6]/85 to-transparent" />
      </div>

      {/* 2. CENTER HERO STAGE */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center z-10">
        
        {/* M3 Segmented / Tonal Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-2xl border border-[#DEDACB] bg-[#FAF8F2]/90 backdrop-blur-md shadow-sm flex items-center justify-center p-2 hover:scale-105 transition-transform">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="17" r="15.5" stroke="#4285F4" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="17" cy="17" r="10" stroke="#EA4335" strokeWidth="1.5" />
              <circle cx="17" cy="17" r="4.5" fill="#34A853" />
            </svg>
          </div>
        </motion.div>

        {/* Official Headline (Figma Node 2059:110 Typography) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-3 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 font-sans drop-shadow-sm">
            GDG AJCE
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-gray-800">
            Google Developer Groups
          </p>
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[#1A73E8] uppercase">
            Amal Jyothi College of Engineering
          </p>
        </motion.div>

        {/* Mission Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed font-normal"
        >
          Empowering student developers to innovate, build real-world software, and master Google AI, Cloud, Android, and Open Source.
        </motion.p>

        {/* Dual Call to Action Buttons (M3 Buttons: rounded-xl) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 z-20"
        >
          {/* Primary CTA: M3 Filled Button (GDG Blue #4285F4) */}
          <Link
            href="/programs"
            className="group px-7 py-3.5 rounded-xl bg-[#4285F4] hover:bg-[#1A73E8] text-white font-medium text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary CTA: M3 Outlined / Tonal Button */}
          <button
            onClick={() => setVideoOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE7DC] text-gray-900 font-medium text-sm sm:text-base border border-[#DEDACB] shadow-xs hover:shadow-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2.5 backdrop-blur-sm"
          >
            <div className="w-5 h-5 rounded-lg bg-[#4285F4]/15 text-[#1967D2] flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Watch Video</span>
          </button>
        </motion.div>

        {/* 3. MATERIAL DESIGN 3 SUGGESTION CHIPS (Replacing arbitrary floating tilted pills) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl"
        >
          {M3_TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.label}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FAF8F2]/90 hover:bg-[#FAF8F2] border border-[#DEDACB] text-xs font-medium text-gray-800 shadow-xs backdrop-blur-sm hover:shadow-sm transition-all hover:scale-[1.02]"
              >
                <Icon className="w-3.5 h-3.5" style={{ color: topic.color }} />
                <span>{topic.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 4. VALUE PROPOSITION ROW (M3 Elevated Cards resting seamlessly on #F3F0E6 canvas) */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full mt-20 pt-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Column 1: Institutional Pitch (M3 Elevated Card) */}
          <div className="bg-[#FAF8F2] border border-[#DEDACB] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow text-left flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#1967D2] mb-4">
                <Sparkles className="w-5 h-5 text-[#4285F4]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900">
                Why choose GDG AJCE?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                Our students learn to build production software, gain direct Google mentorship, and access global developer resources at Amal Jyothi College of Engineering.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#DEDACB]/60 flex items-center gap-2 text-xs font-medium text-[#1967D2]">
              <span>Official Chapter</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
            </div>
          </div>

          {/* Column 2: Hands-on Codelabs (M3 Elevated Card) */}
          <div className="bg-[#FAF8F2] border border-[#DEDACB] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow text-left flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#34A853]/15 border border-[#34A853]/30 flex items-center justify-center text-[#137333] mb-4">
                <Code2 className="w-5 h-5 text-[#34A853]" />
              </div>
              <h4 className="text-xl font-bold tracking-tight text-gray-900">
                Hands-on Codelabs
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                We believe coding should contribute to real-world capability. Dive deep into Gemini APIs, Firebase App Hosting, Flutter, and Google Cloud.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#DEDACB]/60 flex items-center gap-2 text-xs font-medium text-[#137333]">
              <span>Active Workshops</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
            </div>
          </div>

          {/* Column 3: Global Impact (M3 Elevated Card) */}
          <div className="bg-[#FAF8F2] border border-[#DEDACB] rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow text-left flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FBBC04]/20 border border-[#FBBC04]/40 flex items-center justify-center text-[#8F6B00] mb-4">
                <Award className="w-5 h-5 text-[#FBBC04]" />
              </div>
              <h4 className="text-xl font-bold tracking-tight text-gray-900">
                Global Competitions
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                Participate in the Google Solution Challenge, seasonal Study Jams, and hackathons with verified credentials and chapter leaderboards.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#DEDACB]/60 flex items-center gap-2 text-xs font-medium text-[#8F6B00]">
              <span>UN 17 SDGs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]" />
            </div>
          </div>

        </div>
      </div>

      {/* 5. VIDEO MODAL POPUP */}
      {videoOpen && (
        <div
          onClick={() => setVideoOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video flex flex-col items-center justify-center text-white p-6"
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#4285F4]/20 border border-[#4285F4]/40 flex items-center justify-center mx-auto text-[#4285F4]">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Welcome to GDG on Campus AJCE</h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                Explore how student innovators at Amal Jyothi College of Engineering build solutions using Google technologies.
              </p>
              <Link
                href="/programs"
                onClick={() => setVideoOpen(false)}
                className="inline-block px-6 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#1A73E8] text-white text-xs font-medium shadow-sm transition"
              >
                Browse Upcoming Workshops
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
