"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function MindMarketPreloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathLeftRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Skip if already seen in current session or requested via query
    if (typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("gdg_preloader_seen") || window.location.search.includes("nopreload");
      if (hasSeen) {
        setShouldRender(false);
        document.documentElement.classList.add("is-first-loaded");
        return;
      }
    }

    const container = containerRef.current;
    const pathLeft = pathLeftRef.current;
    const pathRight = pathRightRef.current;
    const dot = dotRef.current;
    const text = textRef.current;

    if (!container || !pathLeft || !pathRight || !dot || !text) {
      setShouldRender(false);
      return;
    }

    // Set initial states
    const lengthLeft = pathLeft.getTotalLength();
    const lengthRight = pathRight.getTotalLength();

    gsap.set(pathLeft, {
      strokeDasharray: lengthLeft,
      strokeDashoffset: lengthLeft,
    });
    gsap.set(pathRight, {
      strokeDasharray: lengthRight,
      strokeDashoffset: lengthRight,
    });
    gsap.set(dot, { scale: 0, transformOrigin: "center" });
    gsap.set(text, { opacity: 0, y: 12 });

    // Build timeline matching MindMarket preloader choreography
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("gdg_preloader_seen", "true");
        document.documentElement.classList.add("is-first-loaded");
        setShouldRender(false);
      },
    });

    tl.to([pathLeft, pathRight], {
      strokeDashoffset: 0,
      duration: 0.9,
      ease: "power2.inOut",
    })
      .to(
        dot,
        {
          scale: 1,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)", // MindMarket elastic pop
        },
        "-=0.3"
      )
      .to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power1.out",
        },
        "-=0.4"
      )
      .to(
        [pathLeft, pathRight, dot, text],
        {
          y: -15,
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
        },
        "+=0.2"
      )
      .to(
        container,
        {
          yPercent: -100,
          duration: 0.7,
          ease: "power3.inOut",
        },
        "-=0.1"
      );

    return () => {
      tl.kill();
    };
  }, []);

  if (!mounted || !shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f5f1e4] select-none pointer-events-none"
    >
      <div className="flex flex-col items-center gap-4">
        {/* MindMarket Stroke Draw SVG */}
        <svg
          width="120"
          height="70"
          viewBox="0 0 120 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Left Bracket < */}
          <path
            ref={pathLeftRef}
            d="M 45 15 L 18 35 L 45 55"
            stroke="#2c2e2a"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Bracket > */}
          <path
            ref={pathRightRef}
            d="M 75 15 L 102 35 L 75 55"
            stroke="#2c2e2a"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Elastic Action Dot */}
          <circle
            ref={dotRef}
            cx="60"
            cy="35"
            r="6"
            fill="#8ed462"
          />
        </svg>

        {/* Brand Micro Wordmark */}
        <div
          ref={textRef}
          className="text-xs font-medium tracking-tight text-[#2c2e2a]"
        >
          GDG AJCE • Innovation Lab
        </div>
      </div>
    </div>
  );
}
