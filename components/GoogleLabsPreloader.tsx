"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import mascotData from "@/public/animations/gdg-mascot.json";

// Dynamic import with SSR disabled for optimal hydration and client-side canvas/svg rendering
const Lottie = dynamic(() => import("lottie-react").then((mod) => mod.Lottie as any), {
  ssr: false,
}) as React.ComponentType<any>;

export default function GoogleLabsPreloader() {
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if the user opted to skip via nopreload query
    if (typeof window !== "undefined") {
      if (window.location.search.includes("nopreload")) {
        setPhase("done");
        setShouldRender(false);
        return;
      }
    }

    // Smooth timing: 2.3s loading, then smooth reveal exit
    const t1 = setTimeout(() => {
      setPhase("reveal");
    }, 2300);

    // After reveal animation completes, unmount from DOM
    const t2 = setTimeout(() => {
      setPhase("done");
      setShouldRender(false);
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!shouldRender || phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gdg-creative-preloader"
        initial={{ opacity: 1 }}
        animate={
          phase === "reveal"
            ? { opacity: 0, scale: 1.03, y: -14 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fafaf9] dark:bg-[#090d16] overflow-hidden select-none"
        style={{ willChange: "opacity, transform" }}
      >
        {/* 1. Grainy Paper Noise Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25 mix-blend-multiply dark:mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.75'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* 2. Vibrant Atmospheric Color Blobs (Responsive sizes for phones and desktops) */}
        {/* Top-Left: Sunshine Gold */}
        <div
          className="absolute -top-16 -left-16 sm:-top-24 sm:-left-24 w-60 h-60 sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none transform-gpu"
          style={{
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.38) 0%, rgba(251, 191, 36, 0.16) 45%, transparent 70%)",
          }}
        />

        {/* Top-Right: Google Sky Blue */}
        <div
          className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none transform-gpu"
          style={{
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.36) 0%, rgba(59, 130, 246, 0.15) 45%, transparent 70%)",
          }}
        />

        {/* Bottom-Left: Coral / Crimson Pink */}
        <div
          className="absolute -bottom-16 -left-16 sm:-bottom-24 sm:-left-24 w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none transform-gpu"
          style={{
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(244, 114, 182, 0.15) 45%, transparent 70%)",
          }}
        />

        {/* Bottom-Right: Emerald Grass Green */}
        <div
          className="absolute -bottom-16 -right-16 sm:-bottom-24 sm:-right-24 w-72 h-72 sm:w-[520px] sm:h-[520px] rounded-full pointer-events-none transform-gpu"
          style={{
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.38) 0%, rgba(52, 211, 153, 0.15) 45%, transparent 70%)",
          }}
        />

        {/* 3. Authentic Realistic Organic Cloud Horizon along Bottom (Zero harsh margins or hard cuts) */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 inset-x-0 w-full pointer-events-none z-10 flex flex-col items-center justify-end"
        >
          {/* Realistic High-Res Cloud Bank WebP with organic feathering mask */}
          <div
            className="w-full flex justify-center"
            style={{
              maskImage: "linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
            }}
          >
            <img
              src="/images/realistic-clouds-bed.webp"
              alt=""
              className="w-full min-w-[700px] sm:min-w-full h-40 sm:h-60 md:h-72 object-cover object-bottom select-none dark:opacity-40 dark:invert"
              loading="eager"
              decoding="async"
            />
          </div>
        </motion.div>

        {/* 4. Center Content: Mascot standing above clouds + Title + Single Piece Spinner (Phone & Desktop Responsive) */}
        <div className="relative z-20 flex flex-col items-center justify-center -mt-6 sm:-mt-10 px-4 w-full max-w-sm sm:max-w-md">
          {/* Mascot Container */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-44 h-44 sm:w-64 sm:h-64 md:w-76 md:h-76 flex items-center justify-center"
          >
            {/* Realistic Cloud Landing Character Shadow */}
            <div
              className="absolute bottom-5 sm:bottom-7 w-28 sm:w-44 h-5 sm:h-7 rounded-[100%] bg-slate-900/20 dark:bg-black/50 blur-sm pointer-events-none transform-gpu"
              style={{
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.25)",
              }}
            />

            {/* Lottie Animation Instance */}
            <div className="relative z-10 w-full h-full filter drop-shadow-[0_8px_16px_rgba(15,23,42,0.12)]">
              <Lottie
                src={mascotData}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>

          {/* Brand Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-2 sm:mt-4 flex flex-col items-center text-center w-full"
          >
            <div className="flex items-center gap-2 mb-1">
              <GDGLogoMark width={32} height={18} className="sm:w-[38px] sm:h-[22px]" />
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#0f172a] dark:text-white font-sans">
                GDG on Campus AJCE
              </h1>
            </div>

            <p className="text-[11px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              Google Developer Groups • Amal Jyothi College of Engineering
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
