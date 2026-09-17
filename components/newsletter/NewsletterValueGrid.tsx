"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Code2, ShieldCheck, Compass, Sparkles, Terminal, BookOpen, Layers } from "lucide-react";

export default function NewsletterValueGrid() {
  const values = [
    {
      icon: Zap,
      accent: "#EA4335",
      title: "4-Minute Reads. Zero PR Fluff.",
      description: "Curated by engineers who actively write code. No long-winded promotional fluff or corporate marketing copy. Just architectural shifts, tool releases, and benchmark comparisons.",
      badge: "High Signal"
    },
    {
      icon: Terminal,
      accent: "#4285F4",
      title: "Google Ecosystem Deep Dives",
      description: "Direct takeaways from Google AI Studio, Gemini 1.5/2.0 API features, Firebase Data Connect (SQL), Cloud Run GPUs, and Android Jetpack Compose 1.7 layouts.",
      badge: "Google First"
    },
    {
      icon: Code2,
      accent: "#34A853",
      title: "Production-Tested Snippets",
      description: "Every issue contains drop-in snippets in TypeScript, Dart/Flutter, Kotlin, or Python that you can copy directly into your coursework, side projects, or hackathons.",
      badge: "Copy & Paste"
    },
    {
      icon: Compass,
      accent: "#FBBC04",
      title: "Amal Jyothi Campus Radar",
      description: "First look at upcoming GDG AJCE Codelabs, hackathon prompt drops, speaker workshop recordings, and early-bird registrations before public announcements.",
      badge: "Campus Radar"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#34A853]" />
          <span>The GDG Editorial Standard</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2e2a] tracking-tight">
          Why 180+ campus engineers start their Monday with Tech Pulse.
        </h2>
        <p className="text-xs sm:text-sm text-[#80827f] leading-relaxed">
          Designed specifically for computer science students and engineers who want high density without spending hours scrolling Twitter or Reddit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {values.map((val, idx) => {
          const Icon = val.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-[#ffffff] border border-[#d5d5d4] rounded-[32px] p-6 sm:p-8 hover:border-[#2c2e2a]/40 transition duration-300 shadow-xs flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top color highlight */}
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: val.accent }}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
                    style={{ backgroundColor: `${val.accent}15`, color: val.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono"
                    style={{ backgroundColor: `${val.accent}15`, color: val.accent }}
                  >
                    {val.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#2c2e2a] tracking-tight">
                  {val.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#80827f] leading-relaxed">
                  {val.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#f5f1e4] flex items-center gap-2 text-xs font-medium text-[#2c2e2a]/80">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: val.accent }} />
                <span>Included in every weekly dispatch</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
