"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Cloud, Smartphone, Globe, Code2 } from "lucide-react";
import Sticker from "@/components/ui/Sticker";

const TRACKS = [
  {
    id: "ai-labs",
    title: "AI & GEMINI 2.0",
    desc: "Build multimodal agentic pipelines, tool-calling APIs, and autonomous assistants with Google Gemini and Vertex AI.",
    tag: "AI SPRINT",
    tagType: "rocket" as const,
    surface: "bg-[#e9ccff]", // Lavender
    icon: Sparkles,
    cta: "Join AI Track",
  },
  {
    id: "cloud-devops",
    title: "CLOUD & KUBERNETES",
    desc: "Autoscale containerized microservices, configure Firebase App Hosting, and master serverless GCP architectures.",
    tag: "CLOUD LABS",
    tagType: "code" as const,
    surface: "bg-[#dceeff]", // Sky Wash
    icon: Cloud,
    cta: "Deploy Cloud",
  },
  {
    id: "mobile-compose",
    title: "FLUTTER & ANDROID",
    desc: "Craft high-performance expressive UIs with Jetpack Compose, Kotlin multiplatform, and responsive Flutter engines.",
    tag: "MOBILE DEV",
    tagType: "check" as const,
    surface: "bg-[#55db9c]", // Mint Pop
    icon: Smartphone,
    cta: "Build Mobile",
  },
  {
    id: "open-source",
    title: "OPEN SOURCE CORE",
    desc: "Contribute to community SDKs, review peer PRs, and ship production packages under guidance from Google mentors.",
    tag: "OPEN SOURCE",
    tagType: "terminal" as const,
    surface: "bg-[#e9e9e9]", // Soft Mist
    icon: Globe,
    cta: "Explore Repos",
  },
];

export default function SlushTracksSection() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const FILTERS = ["ALL", "AI & ML", "CLOUD", "ANDROID", "OPEN SOURCE"];

  return (
    <section className="relative w-full bg-[#ffffff] py-24 px-4 sm:px-8 overflow-hidden select-none border-b border-[#000000]">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* SECTION HEADER: Gigantic sculptural crushed display type */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sticker type="coin" label="CORE PILLARS" rotation={-2} size="sm" />
              <span className="text-xs font-bold uppercase tracking-[0.032em] text-[#000000]">// BUILD REAL APPS</span>
            </div>
            <h2 className="font-display text-[64px] sm:text-[100px] md:text-[130px] text-[#000000] uppercase leading-[0.78] m-0">
              INNOVATION TRACKS
            </h2>
          </div>

          <p className="text-base sm:text-lg font-medium text-[#000000] max-w-md leading-snug">
            Hands-on learning pathways curated for student engineers across Amal Jyothi College of Engineering.
          </p>
        </div>

        {/* PILL FILTER ROW (1600px border-radius, 1px solid #000000 border, no shadows) */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-[1600px] text-xs font-bold uppercase tracking-[0.032em] border border-[#000000] transition-all ${
                activeFilter === f
                  ? "bg-[#000000] text-[#ffffff]"
                  : "bg-[#ffffff] text-[#000000] hover:bg-[#e9e9e9]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 4 CARDS GRID (20px-40px radius, 1px solid #000000 border, pastel washes, zero drop-shadows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {TRACKS.map((track, idx) => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                className={`rounded-[30px] border border-[#000000] ${track.surface} p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform`}
              >
                <div className="space-y-4">
                  {/* Top Sticker tag & Icon */}
                  <div className="flex items-center justify-between">
                    <Sticker type={track.tagType} label={track.tag} rotation={idx % 2 === 0 ? -3 : 3} size="sm" />
                    <div className="w-9 h-9 rounded-[1600px] border border-[#000000] bg-[#ffffff] flex items-center justify-center text-[#000000]">
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="pt-2">
                    <h3 className="font-display text-3xl sm:text-4xl text-[#000000] uppercase leading-[0.82] tracking-tight">
                      {track.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-[#000000] leading-snug mt-3">
                      {track.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Action: 1600px Outlined black button */}
                <div className="pt-8 mt-6 border-t border-[#000000] flex items-center justify-between">
                  <Link
                    href="/programs"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[1600px] bg-[#000000] text-[#ffffff] hover:bg-black/80 text-xs font-bold uppercase tracking-[0.032em] border border-[#000000] transition"
                  >
                    <span>{track.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </Link>
                  <span className="font-mono text-xs font-bold">0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
