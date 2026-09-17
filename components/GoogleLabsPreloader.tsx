"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function GoogleLabsPreloader({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<"intro" | "dot" | "reveal" | "done">("intro");
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("gdg_preloader_seen") || window.location.search.includes("nopreload");
      if (hasSeen) {
        setPhase("done");
        return;
      }
    }
    setShouldRender(true);

    // 0s - 1.8s: Intro text & morphing blob shapes
    const t1 = setTimeout(() => {
      setPhase("dot");
    }, 1800);

    // 1.8s - 2.6s: Concentric dot animation
    const t2 = setTimeout(() => {
      setPhase("reveal");
    }, 2600);

    // 2.6s - 3.2s: Zoom out / fade out into the app
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("gdg_preloader_seen", "true");
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done" || !shouldRender) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={phase === "reveal" ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-[#F3F0E6] overflow-hidden"
    >
      {/* Corner Organic Blobs with Google Colors from the video */}
      <AnimatePresence>
        {phase === "intro" && (
          <>
            {/* Top-Left Yellow Blob */}
            <motion.div
              initial={{ scale: 0.8, x: -50, y: -50, opacity: 0 }}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute -top-12 -left-12 w-64 h-48 sm:w-96 sm:h-72 bg-[#FBBC04] rounded-[40%_60%_70%_30%/40%_50%_60%_50%]"
            />

            {/* Top-Right Blue Blob */}
            <motion.div
              initial={{ scale: 0.8, x: 50, y: -50, opacity: 0 }}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="absolute -top-16 -right-16 w-56 h-72 sm:w-80 sm:h-96 bg-[#4285F4] rounded-[50%_50%_30%_70%/60%_40%_60%_40%]"
            />

            {/* Bottom-Left Pink/Magenta Blob */}
            <motion.div
              initial={{ scale: 0.8, x: -50, y: 50, opacity: 0 }}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute -bottom-16 -left-16 w-52 h-64 sm:w-72 sm:h-80 bg-[#FF77B8] rounded-[60%_40%_50%_50%/40%_60%_50%_50%]"
            />

            {/* Bottom-Right Green Blob */}
            <motion.div
              initial={{ scale: 0.8, x: 50, y: 50, opacity: 0 }}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="absolute -bottom-16 -right-16 w-64 h-56 sm:w-96 sm:h-80 bg-[#25EA7A] rounded-[40%_60%_60%_40%/60%_30%_70%_40%]"
            />
          </>
        )}
      </AnimatePresence>

      {/* Center Flask Icon & Typography */}
      {phase === "intro" && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4"
        >
          <div className="flex items-center justify-center gap-2.5 mb-3">
            {/* Google Flask / Lab beaker Icon */}
            <svg
              className="w-7 h-7 text-[#1F1F1F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2v7.31L4.41 19.1A2 2 0 0 0 6 22h12a2 2 0 0 0 1.59-2.9L14 9.31V2" />
              <path d="M8.5 2h7" />
              <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
            </svg>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F1F] font-sans">
              Google Developer Groups
            </span>
          </div>
          <p className="text-[#444746] text-base sm:text-lg font-normal tracking-wide">
            The home for developer experiments & innovation
          </p>
        </motion.div>
      )}

      {/* Pulsing Single Dot Phase (as seen in video frame 00:03) */}
      {phase === "dot" && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: 1 }}
          exit={{ scale: 30, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative z-20 flex items-center justify-center"
        >
          <div className="w-5 h-5 rounded-full bg-[#1F1F1F] shadow-lg" />
        </motion.div>
      )}
    </motion.div>
  );
}
