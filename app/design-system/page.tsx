"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DESIGN_TOKENS } from "@/lib/design-system";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import { 
  Check, 
  Copy, 
  Sparkles, 
  ArrowRight,
  Layers, 
  Palette, 
  Type, 
  Sliders, 
  Shapes,
  ExternalLink,
  Code,
  Trophy,
  Flame,
  CheckCircle2,
  Heart
} from "lucide-react";

// =============================================================================
// GOOGLE LABS ORGANIC SHAPES SHOWCASE SUITE
// =============================================================================

function YellowHexagon() {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 15 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer select-none"
      title="Yellow Chamfered Hexagon (#ffd600)"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
        <path
          d="M 46 10.3 
             L 20.3 25.1 A 8 8 0 0 0 16.3 32.1 
             L 16.3 67.9 A 8 8 0 0 0 20.3 74.9 
             L 46 89.7 A 8 8 0 0 0 54 89.7 
             L 79.7 74.9 A 8 8 0 0 0 83.7 67.9 
             L 83.7 32.1 A 8 8 0 0 0 79.7 25.1 
             L 54 10.3 A 8 8 0 0 0 46 10.3 Z"
          fill="#ffd600"
        />
      </svg>
    </motion.div>
  );
}

function BlueWavyRosette() {
  const numWaves = 14;
  const baseR = 40;
  const amp = 6.5;
  const steps = 140;
  let pathD = "";
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const r = baseR + amp * Math.cos(numWaves * theta);
    const x = 50 + Math.cos(theta) * r;
    const y = 50 + Math.sin(theta) * r;
    pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  pathD += " Z";

  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: -20 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer select-none"
      title="Blue Sinusoidal Wavy Badge (#5483F6)"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
        <path d={pathD} fill="#5483F6" />
      </svg>
    </motion.div>
  );
}

function PeriwinkleDome() {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer select-none"
      title="Periwinkle Dome (#95A8FE)"
    >
      <svg viewBox="0 0 110 80" className="w-16 h-12 sm:w-20 sm:h-14">
        <path
          d="M 16 12
             L 94 12
             Q 104 12 104 22
             C 104 82 6 82 6 22
             Q 6 12 16 12 Z"
          fill="#95A8FE"
        />
      </svg>
    </motion.div>
  );
}

function OrangeClover() {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 45 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer select-none"
      title="Orange 4-Lobed Clover (#FF7B47)"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
        <g fill="#FF7B47">
          <circle cx="50" cy="27" r="21" />
          <circle cx="73" cy="50" r="21" />
          <circle cx="50" cy="73" r="21" />
          <circle cx="27" cy="50" r="21" />
          <rect x="29" y="29" width="42" height="42" rx="12" />
        </g>
      </svg>
    </motion.div>
  );
}

function LimeClover() {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: -45 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer select-none"
      title="Lime Green Clover (#C6EB3D)"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
        <g fill="#C6EB3D">
          <circle cx="50" cy="27" r="21" />
          <circle cx="73" cy="50" r="21" />
          <circle cx="50" cy="73" r="21" />
          <circle cx="27" cy="50" r="21" />
          <rect x="29" y="29" width="42" height="42" rx="12" />
        </g>
      </svg>
    </motion.div>
  );
}

function CoralDonut() {
  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer select-none"
      title="Coral Donut (#FF705D)"
    >
      <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16">
        <path
          d="M 50 14 A 36 36 0 1 0 50 86 A 36 36 0 1 0 50 14 Z M 50 32 A 18 18 0 1 1 50 68 A 18 18 0 1 1 50 32 Z"
          fill="#FF705D"
        />
      </svg>
    </motion.div>
  );
}

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [buttonState, setButtonState] = useState<"coral" | "white" | "dark" | "outline">("coral");
  const [buttonText, setButtonText] = useState("Explore Events");

  const copyToClipboard = (text: string, tokenKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenKey);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f5f1e4] text-[#2c2e2a] select-none pb-32">
      
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Chapter Pill Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
            <span>Google Developer Groups on Campus</span>
            <span className="text-[#80827f]">•</span>
            <span className="text-[#80827f]">Design System v2.0</span>
          </div>

          {/* Master Headline */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <GDGLogoMark width={54} height={32} />
              <span className="text-sm font-mono text-[#80827f] uppercase tracking-wider">
                Amal Jyothi Chapter Standard
              </span>
            </div>
            <h1 className="text-[42px] sm:text-[64px] md:text-[76px] font-medium tracking-[-0.045em] text-[#2c2e2a] leading-[1.02]">
              Warm Storybook & Organic System
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-[17px] sm:text-[19px] font-normal text-[#5f6368] leading-relaxed max-w-2xl">
            A tactile editorial canvas where oversized Inter headlines, sticker-soft radii, and Google Labs organic geometry create an inviting, human-centered developer hub.
          </p>

          {/* Quick Jump Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { label: "Colors & Surfaces", href: "#colors" },
              { label: "Typography Scale", href: "#typography" },
              { label: "Action Buttons", href: "#buttons" },
              { label: "Bento Cards", href: "#cards" },
              { label: "Organic Shapes", href: "#shapes" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-1.5 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] transition-colors shadow-xs"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 1. COLOR TOKENS & SURFACES ===================== */}
      <section id="colors" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d5d5d4] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#80827f] uppercase tracking-wider mb-1">
                <Palette className="w-3.5 h-3.5 text-[#ff705d]" />
                <span>Token Hierarchy 01</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-medium tracking-[-0.035em] text-[#2c2e2a]">
                Surfaces & Canvas Foundations
              </h2>
            </div>
            <p className="text-sm text-[#80827f] max-w-md">
              Warm cream-paper base eliminates digital glare. Elevation is established through crisp surface shifts without murky drop shadows.
            </p>
          </div>

          {/* Neutral Surface Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(DESIGN_TOKENS.surfaces).map(([key, item]) => {
              const isCopied = copiedToken === key;
              return (
                <div
                  key={key}
                  onClick={() => copyToClipboard(item.hex, key)}
                  className="group relative rounded-[28px] bg-[#ffffff] border border-[#d5d5d4] p-5 flex flex-col justify-between cursor-pointer hover:border-[#2c2e2a]/40 hover:-translate-y-0.5 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl border border-black/10 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: item.hex }}
                    >
                      {item.hex === "#2c2e2a" && <span className="text-[10px] text-white font-mono">Ink</span>}
                    </div>
                    <button
                      type="button"
                      aria-label={`Copy ${item.name} hex code`}
                      className="w-8 h-8 rounded-full bg-[#f5f1e4] flex items-center justify-center text-[#2c2e2a] opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-[#34A853]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[#2c2e2a]">{item.name}</h3>
                      <span className="text-xs font-mono text-[#80827f] font-medium">{item.hex}</span>
                    </div>
                    <p className="text-xs text-[#80827f] mt-1 line-clamp-2 leading-relaxed">{item.role}</p>
                  </div>

                  {isCopied && (
                    <div className="absolute inset-x-0 bottom-2 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#2c2e2a] text-white text-[10px] font-mono">
                        Copied {item.hex}!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chromatic Accents & Google Labs Colors */}
          <div className="pt-4">
            <h3 className="text-xl font-medium text-[#2c2e2a] mb-4">Chromatic Accents & Organic Highlights</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {Object.entries(DESIGN_TOKENS.accents).map(([key, item]) => {
                const isCopied = copiedToken === key;
                return (
                  <div
                    key={key}
                    onClick={() => copyToClipboard(item.hex, key)}
                    className="group rounded-[24px] bg-[#ffffff] border border-[#d5d5d4] p-4 flex flex-col justify-between cursor-pointer hover:border-[#2c2e2a]/40 hover:-translate-y-0.5 transition-all shadow-xs"
                  >
                    <div
                      className="w-full h-12 rounded-xl mb-3 shadow-xs border border-black/5 flex items-center justify-end p-2"
                      style={{ backgroundColor: item.hex }}
                    >
                      {isCopied && <Check className="w-3.5 h-3.5 text-black drop-shadow-sm" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#2c2e2a] truncate">{item.name}</div>
                      <div className="text-[11px] font-mono text-[#80827f]">{item.hex}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ===================== 2. TYPOGRAPHY HIERARCHY ===================== */}
      <section id="typography" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d5d5d4] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#80827f] uppercase tracking-wider mb-1">
                <Type className="w-3.5 h-3.5 text-[#2ba0ff]" />
                <span>Token Hierarchy 02</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-medium tracking-[-0.035em] text-[#2c2e2a]">
                Single-Family Typography (Inter)
              </h2>
            </div>
            <p className="text-sm text-[#80827f] max-w-md">
              Inter powers the full hierarchy from 11px badges to 215px hero acronyms. Tightly compressed line heights and tracking give it weight and distinction.
            </p>
          </div>

          <div className="rounded-[36px] bg-[#ffffff] border border-[#d5d5d4] p-6 sm:p-10 space-y-8 shadow-xs">
            {DESIGN_TOKENS.typography.scale.map((item, idx) => (
              <div
                key={item.token}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  idx !== DESIGN_TOKENS.typography.scale.length - 1 ? "border-b border-[#f5f1e4] pb-8" : ""
                }`}
              >
                {/* Specimen Description */}
                <div className="w-full lg:w-72 shrink-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#2c2e2a]">{item.token}</span>
                    <span className="text-xs font-mono text-[#80827f]">{item.size}</span>
                  </div>
                  <div className="text-xs text-[#80827f]">
                    Weight: {item.weight} • Leading: {item.lineHeight}
                  </div>
                  <div className="text-[11px] text-[#9a9c98] font-mono">{item.usage}</div>
                </div>

                {/* Specimen Text Rendering */}
                <div className="flex-1 overflow-hidden">
                  <p
                    className="text-[#2c2e2a] truncate font-sans"
                    style={{
                      fontSize: item.size.includes("-") ? item.size.split("-")[0].trim() : item.size,
                      lineHeight: item.lineHeight,
                      letterSpacing: item.tracking,
                      fontWeight: item.weight.includes("900")
                        ? 900
                        : item.weight.includes("700")
                        ? 700
                        : item.weight.includes("600")
                        ? 600
                        : item.weight.includes("500")
                        ? 500
                        : 400,
                    }}
                  >
                    {item.sample}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================== 3. ACTION BUTTONS & COMPONENT SANDBOX ===================== */}
      <section id="buttons" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d5d5d4] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#80827f] uppercase tracking-wider mb-1">
                <Sliders className="w-3.5 h-3.5 text-[#8ed462]" />
                <span>Token Hierarchy 03</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-medium tracking-[-0.035em] text-[#2c2e2a]">
                Interactive Buttons & Expanding Action Dots
              </h2>
            </div>
            <p className="text-sm text-[#80827f] max-w-md">
              50px pill buttons featuring our signature expanding circular indicator dot on hover. No harsh background flips.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Interactive Sandbox Controls & Preview */}
            <div className="lg:col-span-7 rounded-[36px] bg-[#ffffff] border border-[#d5d5d4] p-8 sm:p-10 flex flex-col justify-between shadow-xs">
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#80827f] uppercase tracking-wider">Live Sandbox</span>
                  <h3 className="text-2xl font-medium text-[#2c2e2a]">Hover & Test Button Variants</h3>
                </div>

                {/* Variant Selectors */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "coral", label: "Primary Coral CTA" },
                    { id: "white", label: "Secondary White CTA" },
                    { id: "dark", label: "Dark Neutral CTA" },
                    { id: "outline", label: "Outlined Pill" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setButtonState(v.id as any)}
                      className={`px-4 py-2 rounded-[50px] text-xs font-medium transition-all ${
                        buttonState === v.id
                          ? "bg-[#2c2e2a] text-white font-semibold"
                          : "bg-[#f5f1e4] text-[#2c2e2a] hover:bg-[#eae5d7]"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Text input to test custom label */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#80827f]">Button Label</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full max-w-xs bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2 text-xs text-[#2c2e2a] outline-none focus:border-[#2c2e2a]"
                  />
                </div>
              </div>

              {/* Rendered Live Button Preview Stage */}
              <div className="mt-8 p-10 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center">
                {buttonState === "coral" && (
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-[15px] font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
                  </button>
                )}

                {buttonState === "white" && (
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-[15px] font-medium border border-[#d5d5d4] hover:border-[#2c2e2a]/30 transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] transition-all duration-300 group-hover:scale-125" />
                  </button>
                )}

                {buttonState === "dark" && (
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] text-[#ffffff] text-[15px] font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8ed462] transition-all duration-300 group-hover:scale-125" />
                  </button>
                )}

                {buttonState === "outline" && (
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[50px] bg-transparent hover:bg-white text-[#2c2e2a] text-[15px] font-medium border border-[#2c2e2a]/30 hover:border-[#2c2e2a] transition-all duration-300 hover:-translate-y-[1px] active:scale-95 cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff705d] transition-all duration-300 group-hover:scale-125" />
                  </button>
                )}
              </div>
            </div>

            {/* Pill Badges, Status Chips, and Micro-affordances */}
            <div className="lg:col-span-5 rounded-[36px] bg-[#ffffff] border border-[#d5d5d4] p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#80827f] uppercase tracking-wider">Pill Chips & Micro-Badges</span>
                <h3 className="text-2xl font-medium text-[#2c2e2a]">Status & Section Indicators</h3>
                <p className="text-xs text-[#80827f] leading-relaxed">
                  Chips use 50px pill geometry paired with chromatic 8px status indicator dots.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f5f1e4] text-xs font-medium text-[#2c2e2a]">
                  <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
                  <span>Fresh Grass • Active Status</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f5f1e4] text-xs font-medium text-[#2c2e2a]">
                  <span className="w-2 h-2 rounded-full bg-[#ff705d]" />
                  <span>Coral Pop • Hackathon Jam</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f5f1e4] text-xs font-medium text-[#2c2e2a]">
                  <span className="w-2 h-2 rounded-full bg-[#2ba0ff]" />
                  <span>Sky Pop • Cloud Study Jam</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#f5f1e4] text-xs font-medium text-[#2c2e2a]">
                  <span className="w-2 h-2 rounded-full bg-[#ffd600]" />
                  <span>Sunshine • Community Milestone</span>
                </div>
              </div>

              {/* Input field demonstration */}
              <div className="pt-4 border-t border-[#f5f1e4] space-y-2">
                <span className="text-xs font-medium text-[#2c2e2a]">Standard Form Input (Rounded-2xl)</span>
                <input
                  type="text"
                  placeholder="name@amaljyothi.ac.in"
                  readOnly
                  className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== 4. BENTO CARDS & STORYBOOK SURFACES ===================== */}
      <section id="cards" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d5d5d4] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#80827f] uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5 text-[#ffd600]" />
                <span>Token Hierarchy 04</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-medium tracking-[-0.035em] text-[#2c2e2a]">
                Bento Cards & Storybook Surfaces
              </h2>
            </div>
            <p className="text-sm text-[#80827f] max-w-md">
              Cards adopt generous 36px to 50px corner rounding. Chromatic fills like Fresh Grass and Sunshine Yellow punctuate the white-on-cream flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 1: Pure White Quote Card */}
            <div className="rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] p-7 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-[15px] font-medium text-[#2c2e2a]">Davide, GDG AJCE</div>
                <div className="text-xs text-[#80827f] mt-0.5">On codelabs over lectures</div>

                <div className="mt-6 mb-3">
                  <svg className="w-10 h-10 text-[#ff705d] fill-current" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.324 1.533-4.212 3.655-3.998 5.357a3.84 3.84 0 0 1 2.375-.815c2.148 0 3.82 1.637 3.82 3.753 0 2.215-1.78 3.99-3.99 3.99a3.88 3.88 0 0 1-3.547-1.165zm11 0C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.324 1.533-4.212 3.655-3.998 5.357a3.84 3.84 0 0 1 2.375-.815c2.148 0 3.82 1.637 3.82 3.753 0 2.215-1.78 3.99-3.99 3.99a3.88 3.88 0 0 1-3.547-1.165z" />
                  </svg>
                </div>

                <h3 className="text-xl sm:text-2xl font-medium text-[#2c2e2a] leading-snug tracking-[-0.03em]">
                  Changing my thoughts has allowed me to change my life.
                </h3>
              </div>

              <div className="pt-6 mt-4 border-t border-[#f5f1e4] flex items-center justify-between text-xs text-[#80827f]">
                <span>Student Story</span>
                <span className="font-mono">#PureWhiteCard</span>
              </div>
            </div>

            {/* Card 2: Fresh Grass Green Card with Corner Cloud */}
            <div className="rounded-[36px] bg-[#8ed462] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-xs">
              <h3 className="text-xl sm:text-2xl font-medium text-[#2c2e2a] leading-snug tracking-[-0.02em] relative z-10">
                How getting outside can help you (and your mind) get fit
              </h3>

              <div className="pt-6 relative z-10">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#2c2e2a] text-xs font-medium shadow-xs">
                  <span>Read story</span>
                  <span className="w-5 h-5 rounded-full bg-[#2c2e2a] text-white flex items-center justify-center text-[10px]">
                    →
                  </span>
                </span>
              </div>

              {/* Organic White Cloud Graphic at Bottom-Right */}
              <div className="absolute -bottom-4 -right-4 pointer-events-none z-0">
                <svg width="140" height="100" viewBox="0 0 140 100" fill="none" className="opacity-95">
                  <ellipse cx="120" cy="90" rx="35" ry="30" fill="#ffffff" />
                  <ellipse cx="85" cy="80" rx="30" ry="26" fill="#ffffff" />
                  <ellipse cx="50" cy="95" rx="25" ry="22" fill="#ffffff" />
                </svg>
              </div>
            </div>

            {/* Card 3: Sunshine Yellow Card with Top Sticker */}
            <div className="rounded-[36px] bg-[#ffd600] p-7 sm:p-8 relative flex flex-col justify-between min-h-[260px] shadow-xs">
              <div>
                <span className="text-xs font-mono text-[#2c2e2a]/70 uppercase tracking-wider block mb-2">
                  Chapter Activity
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-[#2c2e2a] leading-snug tracking-[-0.02em]">
                  Build fast prototypes with Gemini 2.5 Flash and Google Cloud.
                </h3>
              </div>

              <div className="pt-6 flex items-center justify-between text-xs text-[#2c2e2a]/80 font-medium">
                <span>Active Track</span>
                <span>#SunshineYellow</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== 5. GOOGLE LABS ORGANIC SHAPES ===================== */}
      <section id="shapes" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d5d5d4] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#80827f] uppercase tracking-wider mb-1">
                <Shapes className="w-3.5 h-3.5 text-[#ff705d]" />
                <span>Token Hierarchy 05</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-medium tracking-[-0.035em] text-[#2c2e2a]">
                Google Labs Kinetic Organic Shapes
              </h2>
            </div>
            <p className="text-sm text-[#80827f] max-w-md">
              Mathematically generated curves that float through hero sections and react interactively on hover and click.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Yellow Hexagon", shape: <YellowHexagon />, hex: "#ffd600" },
              { name: "Blue Rosette", shape: <BlueWavyRosette />, hex: "#5483F6" },
              { name: "Periwinkle Dome", shape: <PeriwinkleDome />, hex: "#95A8FE" },
              { name: "Orange Clover", shape: <OrangeClover />, hex: "#FF7B47" },
              { name: "Lime Clover", shape: <LimeClover />, hex: "#C6EB3D" },
              { name: "Coral Donut", shape: <CoralDonut />, hex: "#FF705D" },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-[28px] bg-[#ffffff] border border-[#d5d5d4] p-5 flex flex-col items-center justify-between text-center space-y-4 shadow-xs"
              >
                <div className="py-2">{item.shape}</div>
                <div>
                  <div className="text-xs font-semibold text-[#2c2e2a]">{item.name}</div>
                  <div className="text-[11px] font-mono text-[#80827f]">{item.hex}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================== 6. SOURCE CODE & GUIDELINES LINK ===================== */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12">
        <div className="rounded-[36px] bg-[#ffffff] border border-[#d5d5d4] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-medium text-[#2c2e2a]">Authoritative Design Source</h3>
            <p className="text-sm text-[#80827f] max-w-xl">
              All rules, token mappings, and component conventions are codified in <code className="font-mono text-[#2c2e2a] bg-[#f5f1e4] px-2 py-0.5 rounded-md">design.md</code> and <code className="font-mono text-[#2c2e2a] bg-[#f5f1e4] px-2 py-0.5 rounded-md">HEAD.md</code>.
            </p>
          </div>

          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-sm font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs shrink-0"
          >
            <span>Back to Landing Page</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
          </Link>
        </div>
      </section>

    </div>
  );
}
