"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const BEYOND_EXPERIMENTS = [
  {
    id: "study-jams",
    badge: "Study Jam → Production App",
    name: "Hands-on Cloud & AI Jams",
    cta: "Explore Tracks",
    link: "/programs",
    previewType: "chat",
    greeting: "Dev Session Active",
    prompt: "gcloud run deploy --image gcr.io/gdg/app",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "solution-challenge",
    badge: "Ideation → Solution Challenge",
    name: "UN SDG Solutions",
    cta: "Join Challenge",
    link: "/programs",
    previewType: "video",
    desc: "University teams engineer AI and Cloud prototypes addressing global environmental, healthcare, and educational challenges.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "devfest",
    badge: "Community → DevFest Keynote",
    name: "DevFest Tech Summit",
    cta: "View Summit",
    link: "/programs",
    previewType: "audio",
    audioTitle: "Keynote: Building with Gemini 2.0",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "open-source",
    badge: "Hackathon → Global OSS",
    name: "Open Source Initiatives",
    cta: "Contribute",
    link: "/programs",
    previewType: "music",
    desc: "Community-maintained open source libraries, developer tools, and university software incubators.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
  }
];

export default function LabsBeyondSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 380;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative bg-[#f5f1e4] text-[#2c2e2a] py-24 px-4 sm:px-8 border-t border-[#d5d5d4] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* ABOUT GDG HIGHLIGHT SECTION (matching Google Labs video layout) */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-[10px] font-mono uppercase tracking-widest text-[#80827f] font-bold">
            ABOUT GOOGLE DEVELOPER GROUPS
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal text-[#2c2e2a] tracking-tight leading-[1.15] font-sans">
            Connect with passionate developers, build real-world software, and accelerate your engineering journey. Learn Google technologies, share knowledge, and turn bold ideas{" "}
            <span className="text-[#8ed462] font-semibold">into impactful applications.</span>
          </h2>
        </div>

        {/* LIFE AT GDG HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#2c2e2a] tracking-tight">
            Life at GDG: The Developer Journey
          </h3>
          <p className="text-xs sm:text-sm text-[#80827f] leading-relaxed">
            At GDG, every developer begins with curiosity: How can we build technology that makes a difference? Through hands-on study jams, codelabs, and hackathons, our community brings ideas to life. Members grow from beginners to project leads, open-source contributors, and industry engineers.
          </p>
        </div>

        {/* HORIZONTAL CAROUSEL OF BEYOND-THE-LAB PRODUCTS (matching video 00:12 - 00:13) */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4 px-2"
        >
          {BEYOND_EXPERIMENTS.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="w-[300px] sm:w-[350px] shrink-0 bg-[#ffffff] text-[#2c2e2a] rounded-3xl p-5 shadow-xs border border-[#d5d5d4] flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Evolution Badge Pill */}
                <div className="inline-block px-3 py-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-[10px] font-mono text-[#80827f]">
                  {item.badge}
                </div>

                {/* Preview Screen Box */}
                <div className="w-full h-56 rounded-2xl overflow-hidden relative bg-black border border-white/10 p-4 flex flex-col justify-between text-white">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  
                  {item.previewType === "chat" && (
                    <div className="relative z-10 space-y-6 pt-4">
                      <h4 className="text-2xl font-bold text-white tracking-tight">{item.greeting}</h4>
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-zinc-300">
                        {item.prompt}
                      </div>
                    </div>
                  )}

                  {item.previewType === "video" && (
                    <div className="relative z-10 mt-auto bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] text-zinc-300 line-clamp-3">
                      {item.desc}
                    </div>
                  )}

                  {item.previewType === "audio" && (
                    <div className="relative z-10 mt-auto bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <span>{item.audioTitle}</span>
                      <span className="text-[10px] font-mono text-[#4285F4]">Interactive</span>
                    </div>
                  )}

                  {item.previewType === "music" && (
                    <div className="relative z-10 mt-auto bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[11px] text-zinc-300">
                      {item.desc}
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-bold text-[#2c2e2a] tracking-tight pt-2">
                  {item.name}
                </h4>
              </div>

              {/* Try It Now CTA */}
              <div className="pt-6 mt-4 border-t border-[#f5f1e4]">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block w-full py-2.5 rounded-[50px] bg-[#2c2e2a] text-white hover:bg-[#1a1a1a] font-semibold text-xs text-center transition shadow-xs"
                >
                  {item.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carousel arrows */}
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-full border border-[#d5d5d4] bg-[#ffffff] hover:bg-[#f5f1e4] text-[#2c2e2a] transition shadow-xs active:scale-95 cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full border border-[#d5d5d4] bg-[#ffffff] hover:bg-[#f5f1e4] text-[#2c2e2a] transition shadow-xs active:scale-95 cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
