"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Copy, Check, Play, RefreshCw } from "lucide-react";
import GoogleLabsLoadingIcon, { GoogleLabsLoaderVariant, GoogleLabsLoaderSize } from "@/components/ui/GoogleLabsLoadingIcon";
import LoadingSpinner, { useFullPageLoader } from "@/components/LoadingSpinner";

export default function LoadingDemoPage() {
  const [selectedVariant, setSelectedVariant] = useState<GoogleLabsLoaderVariant>("cluster");
  const [selectedSize, setSelectedSize] = useState<GoogleLabsLoaderSize>("md");
  const [customText, setCustomText] = useState("Loading Google Developer assets...");
  const [copied, setCopied] = useState(false);
  const { show, hide, FullPageLoaderComponent, isLoading } = useFullPageLoader();

  const codeSnippet = `<LoadingSpinner
  variant="${selectedVariant}"
  size="${selectedSize}"
  text="${customText}"
/>`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const triggerFullPage = () => {
    show("Verifying cryptographic chapter credentials...");
    setTimeout(() => {
      hide();
    }, 2800);
  };

  return (
    <main className="min-h-screen bg-[#f5f1e4] text-[#2c2e2a] select-none p-4 sm:p-8 lg:p-12">
      {FullPageLoaderComponent}

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#d5d5d4]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#d5d5d4] text-[11px] font-mono uppercase tracking-wider text-[#80827f]">
              <Sparkles className="w-3 h-3 text-[#5483F6]" />
              <span>Google Labs Kinetic Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2c2e2a]">
              Google Labs Organic Loader
            </h1>
            <p className="text-xs sm:text-sm text-[#80827f]">
              Playful kinetic loading indicators crafted from the hero section & footer physics playground organic shapes.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] hover:bg-[#eae6d8] transition w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* 1. INTERACTIVE PLAYGROUND STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Stage Display (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#d5d5d4] rounded-[36px] p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
            <div className="absolute top-4 left-6 text-[11px] font-mono text-[#80827f] uppercase tracking-wider">
              LIVE PREVIEW • {selectedVariant.toUpperCase()}
            </div>

            {/* Centered Loading Component */}
            <div className="py-6">
              <LoadingSpinner
                variant={selectedVariant}
                size={selectedSize}
                text={customText}
              />
            </div>

            {/* Trigger Full Screen Test */}
            <button
              onClick={triggerFullPage}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] hover:bg-[#ebe6d6] transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-[#5483F6]" />
              <span>Test Full-Screen Overlay (3s)</span>
            </button>
          </div>

          {/* Controls Dock (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#d5d5d4] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#2c2e2a] uppercase tracking-wider font-mono">
              Loader Configuration
            </h3>

            {/* Variant Picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#80827f]">Style Variant</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cluster", label: "4-Shape Orbit (Default)" },
                  { id: "rosette", label: "14-Wave Rosette" },
                  { id: "morph", label: "Shape Cycler" },
                  { id: "daisy", label: "8-Petal Daisy" },
                  { id: "code", label: "Code Token < >" },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id as GoogleLabsLoaderVariant)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition border ${
                      selectedVariant === v.id
                        ? "bg-[#2c2e2a] text-white border-[#2c2e2a]"
                        : "bg-[#f5f1e4] text-[#2c2e2a] border-transparent hover:border-[#d5d5d4]"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#80827f]">Scale Size</label>
              <div className="flex items-center gap-2">
                {(["xs", "sm", "md", "lg", "xl"] as GoogleLabsLoaderSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition border ${
                      selectedSize === s
                        ? "bg-[#2c2e2a] text-white border-[#2c2e2a]"
                        : "bg-[#f5f1e4] text-[#2c2e2a] border-transparent hover:border-[#d5d5d4]"
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#80827f]">Custom Label</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Loading message..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a] focus:outline-none focus:border-[#2c2e2a]"
              />
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-2 pt-2 border-t border-[#d5d5d4]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#80827f]">
                <span>USAGE CODE</span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 hover:text-[#2c2e2a] transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#34A853]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#2c2e2a] text-[#8ed462] font-mono text-[11px] overflow-x-auto leading-relaxed">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* 2. GALLERY OF ALL 5 VARIANTS SIDE-BY-SIDE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#2c2e2a] tracking-tight">
            All Kinetic Variations
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Cluster */}
            <div className="bg-white border border-[#d5d5d4] rounded-[28px] p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="h-20 flex items-center justify-center">
                <GoogleLabsLoadingIcon variant="cluster" size="lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2c2e2a]">4-Shape Cluster</h4>
                <p className="text-[11px] text-[#80827f] mt-0.5">Hero & footer physics exact match</p>
              </div>
            </div>

            {/* 2. Rosette */}
            <div className="bg-white border border-[#d5d5d4] rounded-[28px] p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="h-20 flex items-center justify-center">
                <GoogleLabsLoadingIcon variant="rosette" size="lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2c2e2a]">14-Wave Rosette</h4>
                <p className="text-[11px] text-[#80827f] mt-0.5">Blue sinusoidal badge with code mark</p>
              </div>
            </div>

            {/* 3. Morph */}
            <div className="bg-white border border-[#d5d5d4] rounded-[28px] p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="h-20 flex items-center justify-center">
                <GoogleLabsLoadingIcon variant="morph" size="lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2c2e2a]">Shape Cycler</h4>
                <p className="text-[11px] text-[#80827f] mt-0.5">Morphs through Google 4 colors</p>
              </div>
            </div>

            {/* 4. Daisy */}
            <div className="bg-white border border-[#d5d5d4] rounded-[28px] p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="h-20 flex items-center justify-center">
                <GoogleLabsLoadingIcon variant="daisy" size="lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2c2e2a]">Sunshine Daisy</h4>
                <p className="text-[11px] text-[#80827f] mt-0.5">Hero floral 8-petal sunshine starburst</p>
              </div>
            </div>

            {/* 5. Code Token */}
            <div className="bg-white border border-[#d5d5d4] rounded-[28px] p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="h-20 flex items-center justify-center">
                <GoogleLabsLoadingIcon variant="code" size="lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2c2e2a]">GDG Code Token</h4>
                <p className="text-[11px] text-[#80827f] mt-0.5">Google 4-color developer brackets</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. INLINE BUTTON & BADGE INTEGRATIONS */}
        <div className="bg-white border border-[#d5d5d4] rounded-[36px] p-8 space-y-6 shadow-xs">
          <h2 className="text-xl font-bold text-[#2c2e2a] tracking-tight">
            Button & Micro-Component Integrations
          </h2>
          <p className="text-xs text-[#80827f] -mt-4">
            Small sizes (<span className="font-mono text-[#2c2e2a]">xs</span> and <span className="font-mono text-[#2c2e2a]">sm</span>) designed for embedding inside CTA buttons, badge pills, and input bars.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Button 1: Dark pill with cluster */}
            <button className="inline-flex items-center gap-3 px-6 py-3 rounded-[50px] bg-[#2c2e2a] text-white text-xs font-medium shadow-sm">
              <GoogleLabsLoadingIcon variant="cluster" size={20} />
              <span>Registering Participant...</span>
            </button>

            {/* Button 2: White ghost pill with rosette */}
            <button className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[50px] bg-white border border-[#d5d5d4] text-[#2c2e2a] text-xs font-medium shadow-xs">
              <GoogleLabsLoadingIcon variant="rosette" size={20} />
              <span>Verifying Certificate</span>
            </button>

            {/* Button 3: Daisy action button */}
            <button className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[50px] bg-[#FBBC04]/20 border border-[#FBBC04]/40 text-[#2c2e2a] text-xs font-semibold">
              <GoogleLabsLoadingIcon variant="daisy" size={20} />
              <span>Generating Badge</span>
            </button>

            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-[11px] font-mono text-[#80827f]">
              <GoogleLabsLoadingIcon variant="code" size={16} />
              <span>SYNCHRONIZING REPOSITORY</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
