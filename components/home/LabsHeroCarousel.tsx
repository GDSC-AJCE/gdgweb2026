"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EXPERIMENTS = [
  {
    id: "gdg-devfest",
    title: "GDG AJCE Tech Summit",
    tagline: "Official Google Developer Groups on Campus chapter at Amal Jyothi College of Engineering empowering student developers to build the next frontier.",
    cta: "Explore Programs",
    link: "/programs",
    cards: [
      { tag: "GEMINI 2.0", title: "Multimodal reasoning & structured outputs in client web apps", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
      { tag: "CLOUD RUN", title: "Zero-ops autoscaling microservices on Google Cloud Platform", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80" },
      { tag: "FLUTTER 3.X", title: "Multiplatform native mobile & desktop application engineering", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80" },
      { tag: "KOTLIN DEV", title: "Declarative Android architectures with Jetpack Compose", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
      { tag: "GENKIT AI", title: "Production-ready AI workflows & telemetry orchestration", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" },
      { tag: "DEV SUMMIT", title: "Annual keynote sessions and code labs with industry GDEs", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" },
      { tag: "OPEN SOURCE", title: "Collaborative code sprints and public repository showcases", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80" },
      { tag: "STUDY JAMS", title: "Hands-on skill badges and cloud architect certifications", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80" },
    ]
  },
  {
    id: "gemini-labs",
    title: "Google Gemini & Cloud Jams",
    tagline: "Monthly hackathons, hands-on codelabs, and seasonal competitions powered by the Google Developer ecosystem.",
    cta: "Join Current Sprint",
    link: "/programs/ongoing",
    cards: [
      { tag: "AGENTIC AI", title: "Autonomous multi-agent orchestration with Gemini 2.0 Flash", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80" },
      { tag: "VISION API", title: "Real-time spatial video and OCR inference pipelines", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" },
      { tag: "ON-DEVICE", title: "Edge AI inferencing with Gemini Nano on Android smartphones", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80" },
      { tag: "DEV TOOLS", title: "Chrome DevTools, Firebase App Hosting & Turbopack optimization", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80" },
      { tag: "WORKSHOPS", title: "Deep dive codelabs with certified Google Developer Experts", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80" },
      { tag: "KUBERNETES", title: "Microservice orchestration with GKE and Envoy ingress filters", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80" },
      { tag: "TENSORFLOW", title: "High-performance neural network research and JAX acceleration", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80" },
      { tag: "SDG IMPACT", title: "Solution Challenge 2026: building for global impact", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80" },
    ]
  }
];

export default function LabsHeroCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentExp = EXPERIMENTS[currentIdx];

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % EXPERIMENTS.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + EXPERIMENTS.length) % EXPERIMENTS.length);
  };

  return (
    <section className="relative min-h-[92vh] bg-transparent text-[var(--foreground)] flex flex-col justify-center items-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden select-none">
      {/* Dynamic 8-card grid surrounding the center content (exact layout from video 00:04) */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[620px] flex items-center justify-center">
        {/* CARDS SURROUNDING CENTER */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-4 sm:gap-6 p-4">
          {currentExp.cards.map((card, i) => (
            <motion.div
              key={`${currentExp.id}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.85, scale: 1 }}
              whileHover={{ opacity: 1, scale: 1.03 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative rounded-2xl overflow-hidden border border-[#d5d5d4] bg-[#ffffff] shadow-xs group pointer-events-auto h-[200px] sm:h-[240px]"
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 sm:p-4 flex flex-col justify-end">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-200 uppercase px-2 py-0.5 rounded bg-black/60 border border-white/15 w-fit mb-1.5">
                  {card.tag}
                </span>
                <p className="text-xs sm:text-[13px] font-medium text-white leading-snug line-clamp-2">
                  {card.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center Vignette Blur Mask to highlight center headline */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] sm:w-[600px] h-[360px] bg-[#f5f1e4]/90 backdrop-blur-md rounded-[3rem] border border-[#d5d5d4] shadow-lg" />
        </div>

        {/* CENTER CONTENT: Title, Tagline & "Try It Now" CTA (matching video frame 00:04) */}
        <div className="relative z-20 text-center max-w-lg px-6 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#2c2e2a] font-sans">
                {currentExp.title}
              </h1>
              <p className="text-sm sm:text-base text-[#80827f] font-normal">
                {currentExp.tagline}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="pt-2">
            <Link
              href={currentExp.link}
              className="inline-block px-7 py-3 rounded-[50px] bg-[#2c2e2a] text-white hover:bg-[#1a1a1a] font-semibold text-xs transition-all shadow-xs active:scale-95"
            >
              {currentExp.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS: Arrow Left, Horizontal Dash Carousel Indicator, Arrow Right (matching video 00:05) */}
      <div className="mt-8 flex items-center gap-4 z-20">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full border border-[#d5d5d4] hover:bg-[#ffffff] text-[#2c2e2a] bg-[#ffffff]/80 backdrop-blur-sm transition active:scale-95 cursor-pointer shadow-xs"
          aria-label="Previous experiment"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dash Indicators */}
        <div className="flex items-center gap-2">
          {EXPERIMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIdx === i
                  ? "w-8 bg-[#2c2e2a]"
                  : "w-3 bg-[#d5d5d4] hover:bg-[#80827f]"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2.5 rounded-full border border-[#d5d5d4] hover:bg-[#ffffff] text-[#2c2e2a] bg-[#ffffff]/80 backdrop-blur-sm transition active:scale-95 cursor-pointer shadow-xs"
          aria-label="Next experiment"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
