"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

const CAROUSEL_EXPERIMENTS = [
  {
    id: "gemini-hackjam",
    title: "Gemini 2.0 Hack Jam",
    desc: "Hands-on engineering workshop exploring real-time multimodal audio, spatial vision, and structured tool calling.",
    tag: "AI LABS",
    color: "#4285F4",
    linkText: "Join Hack Jam →",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    quoteSnippet: "Build production agentic pipelines with live Gemini 2.0 Flash function calling.",
    category: "AI & ML"
  },
  {
    id: "cloud-run-k8s",
    title: "Cloud Run & Kubernetes",
    desc: "Deploy microservices with Google Cloud Platform, zero-maintenance autoscaling, and secure ingress.",
    tag: "CLOUD LABS",
    color: "#EA4335",
    linkText: "View Workshop →",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    quoteSnippet: "Continuous integration, automated container builds, and global edge caching.",
    category: "Cloud"
  },
  {
    id: "flutter-compose",
    title: "Flutter & Jetpack Compose",
    desc: "Craft responsive, declarative UI applications for Android, iOS, and Web from a unified, modern architecture.",
    tag: "MOBILE LABS",
    color: "#34A853",
    linkText: "Explore Track →",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    quoteSnippet: "State management, Material 3 expressiveness, and seamless platform interop.",
    category: "Mobile & Web"
  },
  {
    id: "solution-challenge",
    title: "Global Solution Challenge",
    desc: "Annual international competition inviting student teams to build solutions for United Nations 17 SDGs.",
    tag: "COMMUNITY",
    color: "#FBBC04",
    linkText: "Learn More →",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
    quoteSnippet: "Receive mentorship from Google engineers, prototype grants, and global showcase.",
    category: "Open Source"
  },
  {
    id: "open-source-sprint",
    title: "Open Source Core Sprint",
    desc: "Collaborative weekend hack sprints contributing to developer tools, CLI utilities, and community SDKs.",
    tag: "OPEN SOURCE",
    color: "#4285F4",
    linkText: "Join Sprint →",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    quoteSnippet: "Peer code reviews, architecture discussions, and production releases on GitHub.",
    category: "Open Source"
  }
];

const FILTER_TAGS = ["All", "AI & ML", "Cloud", "Mobile & Web", "Open Source"];

export default function LabsExperimentsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const filteredExperiments =
    activeCategory === "All"
      ? CAROUSEL_EXPERIMENTS
      : CAROUSEL_EXPERIMENTS.filter((exp) => exp.category === activeCategory);

  return (
    <section className="relative bg-[#F3F0E6] text-[#1F1F1F] py-24 px-4 sm:px-8 overflow-hidden">
      {/* Background Organic Color Shapes (Matching official GDG colors) */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#4285F4]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#34A853]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-[#FBBC04]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* HEADER: "Be the first to build" (Google Labs style) */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-6xl font-normal tracking-tight text-[#1F1F1F] font-sans">
            Be the first to <span className="font-semibold text-[#1A73E8]">build</span>
          </h2>
        </div>

        {/* HORIZONTAL CAROUSEL CARDS (M3 Elevated Cards with #FAF8F2 surface & #DEDACB border) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4 px-2 -mx-2"
        >
          {filteredExperiments.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="w-[300px] sm:w-[340px] shrink-0 bg-[#FAF8F2] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] border border-[#DEDACB] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Visual Preview Header */}
                <div className="w-full h-44 rounded-xl overflow-hidden relative bg-[#EAE7DC] border border-[#DEDACB]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <p className="text-[11px] text-white font-medium line-clamp-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                      "{item.quoteSnippet}"
                    </p>
                  </div>
                </div>

                {/* Text Content */}
                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F] tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#555] leading-relaxed mt-2 line-clamp-3">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Action link */}
              <div className="pt-6 border-t border-[#DEDACB]/60 mt-4 flex items-center justify-between">
                <Link
                  href="/programs"
                  className="text-xs font-semibold text-[#1F1F1F] hover:text-[#1A73E8] transition-colors"
                >
                  {item.linkText}
                </Link>
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CAROUSEL CONTROLS: Left & Right M3 IconButtons */}
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => scroll("left")}
            className="p-2.5 rounded-xl border border-[#DEDACB] bg-[#FAF8F2] hover:bg-[#EAE7DC] text-gray-800 transition shadow-xs active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2.5 rounded-xl border border-[#DEDACB] bg-[#FAF8F2] hover:bg-[#EAE7DC] text-gray-800 transition shadow-xs active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* M3 FILTER CHIPS: All, AI & ML, Cloud, Mobile & Web, Open Source (8px rounded-lg) */}
        <div className="pt-4 flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveCategory(tag)}
              className={`px-4 py-2 rounded-lg text-xs font-medium tracking-normal transition-all shadow-xs ${
                activeCategory === tag
                  ? "bg-[#4285F4]/15 border border-[#4285F4] text-[#1967D2] font-semibold"
                  : "bg-[#FAF8F2] hover:bg-[#EAE7DC] text-gray-700 border border-[#DEDACB]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
