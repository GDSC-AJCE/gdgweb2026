"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

// Module-level singleton so useBodyScrollLock (and any other hook/utility)
// can pause/resume Lenis without needing React context.
let _lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return _lenis;
}

/** Pause Lenis smooth-scroll (called when a modal/overlay opens). */
export function stopLenis() {
  _lenis?.stop();
}

/** Resume Lenis smooth-scroll (called when a modal/overlay closes). */
export function startLenis() {
  _lenis?.start();
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Respect user reduced-motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis smooth scroll matching MindMarket's exact momentum & damping parameters
    const lenis = new Lenis({
      lerp: 0.09, // Buttery soft cream-paper inertia damping
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false,
    });

    _lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      _lenis = null;
    };
  }, []);

  return <>{children}</>;
}
