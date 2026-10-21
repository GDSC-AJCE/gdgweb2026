"use client";

import React, { useEffect, useState, RefObject, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollDrawnPathProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function ScrollDrawnPath({ containerRef }: ScrollDrawnPathProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 3600 });
  const [startPoint, setStartPoint] = useState({ x: 760, y: 520 });
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Scroll progress relative to the entire home container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 2. Direct, zero-lag scroll synchronization
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.035, 1]);

  // 3. Measure container & exact position of origin
  useEffect(() => {
    const updateMeasurements = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const currentWidth = containerRef.current.offsetWidth || cRect.width || window.innerWidth;
      const currentHeight = containerRef.current.scrollHeight || cRect.height;

      setDimensions({
        width: currentWidth,
        height: currentHeight,
      });

      const mascotEl = document.getElementById("mascot-character-container");
      if (mascotEl) {
        const mRect = mascotEl.getBoundingClientRect();
        setStartPoint({
          x: mRect.left - cRect.left + mRect.width * 0.48,
          y: mRect.top - cRect.top + mRect.height * 0.52,
        });
      } else {
        const originEl = document.getElementById("scroll-path-origin");
        if (originEl) {
          const oRect = originEl.getBoundingClientRect();
          setStartPoint({
            x: oRect.left - cRect.left,
            y: oRect.top - cRect.top + oRect.height / 2,
          });
        } else {
          setStartPoint({
            x: currentWidth * 0.65,
            y: 490,
          });
        }
      }
    };

    updateMeasurements();

    const debouncedUpdate = () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(updateMeasurements, 150);
    };

    // Re-measure after fonts & video load
    const timeout = setTimeout(updateMeasurements, 400);

    const ro = new ResizeObserver(debouncedUpdate);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener("resize", debouncedUpdate, { passive: true });

    return () => {
      clearTimeout(timeout);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      ro.disconnect();
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [containerRef]);

  const { width: w, height: h } = dimensions;
  const { x: x0, y: y0 } = startPoint;
  const rem = Math.max(1200, h - y0);

  // Generate dynamic, organic Bézier curves flowing down through the sections
  const pathData = `
    M ${x0} ${y0}
    C ${x0 + 75} ${y0 + rem * 0.025}, ${w * 0.88} ${y0 + rem * 0.055}, ${w * 0.82} ${y0 + rem * 0.10}
    C ${w * 0.76} ${y0 + rem * 0.145}, ${w * 0.42} ${y0 + rem * 0.165}, ${w * 0.22} ${y0 + rem * 0.21}
    C ${w * 0.08} ${y0 + rem * 0.25}, ${w * 0.04} ${y0 + rem * 0.31}, ${w * 0.16} ${y0 + rem * 0.36}
    C ${w * 0.30} ${y0 + rem * 0.41}, ${w * 0.86} ${y0 + rem * 0.43}, ${w * 0.90} ${y0 + rem * 0.49}
    C ${w * 0.94} ${y0 + rem * 0.55}, ${w * 0.72} ${y0 + rem * 0.60}, ${w * 0.36} ${y0 + rem * 0.64}
    C ${w * 0.10} ${y0 + rem * 0.68}, ${w * 0.06} ${y0 + rem * 0.74}, ${w * 0.20} ${y0 + rem * 0.80}
    C ${w * 0.34} ${y0 + rem * 0.85}, ${w * 0.84} ${y0 + rem * 0.88}, ${w * 0.80} ${y0 + rem * 0.94}
    C ${w * 0.76} ${y0 + rem * 0.97}, ${w * 0.58} ${y0 + rem * 0.99}, ${w * 0.50} ${y0 + rem * 1.00}
  `;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 w-full overflow-visible select-none"
      style={{ height: `${h}px` }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Four-Way Design System Gradient (Google Electric Blue -> Crimson Red -> Warm Amber -> Emerald Green) */}
        <linearGradient id="fourWayBrandGradient" x1="0" y1="0" x2="0" y2="1">
          {/* Electric Blue */}
          <stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
          <stop offset="24%" stopColor="#2563EB" stopOpacity="1" />
          {/* Crimson Red */}
          <stop offset="38%" stopColor="#EF4444" stopOpacity="1" />
          <stop offset="55%" stopColor="#EF4444" stopOpacity="1" />
          {/* Warm Amber */}
          <stop offset="68%" stopColor="#F59E0B" stopOpacity="1" />
          <stop offset="82%" stopColor="#F59E0B" stopOpacity="1" />
          {/* Emerald Green */}
          <stop offset="93%" stopColor="#10B981" stopOpacity="1" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
        </linearGradient>

        {/* Lightweight SVG Shadow filter */}
        <filter id="pathGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background track (faint dashed trail) */}
      <path
        d={pathData}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={14}
        strokeDasharray="18 24"
        strokeOpacity={0.45}
        strokeLinecap="round"
      />

      {/* Primary Scroll-Drawn Animated Line with Vibrant Google 4-Way Gradient */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#fourWayBrandGradient)"
        strokeWidth={26}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pathGlow)"
        style={{
          pathLength,
          willChange: "stroke-dashoffset",
        }}
      />
    </svg>
  );
}

