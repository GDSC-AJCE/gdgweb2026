"use client";

import React, { useEffect, useState, RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface ScrollDrawnPathProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function ScrollDrawnPath({ containerRef }: ScrollDrawnPathProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 3600 });
  const [startPoint, setStartPoint] = useState({ x: 760, y: 520 });

  // 1. Scroll progress relative to the entire home container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 2. Direct, zero-lag scroll synchronization (Lenis already provides buttery smooth 60/120fps inertia)
  // Eliminates double-damping, spring hysteresis, and artificial pace drops.
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.035, 1]);

  // 3. Measure container & exact position of the letter 'E' (#scroll-path-origin)
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

    // Re-measure after fonts & video load
    const timeout = setTimeout(updateMeasurements, 400);

    const ro = new ResizeObserver(() => updateMeasurements());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    window.addEventListener("resize", updateMeasurements);

    return () => {
      clearTimeout(timeout);
      ro.disconnect();
      window.removeEventListener("resize", updateMeasurements);
    };
  }, [containerRef]);

  const { width: w, height: h } = dimensions;
  const { x: x0, y: y0 } = startPoint;
  const rem = Math.max(1200, h - y0);

  // Generate dynamic, organic Bézier curves flowing down through the sections
  // Starts directly behind mascot, swoops right, curves dynamically across Innovation Pathways and Chapter Arena
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
        {/* 1. Four-Way Design System Gradient (Google Blue -> Coral Red -> Sunshine Yellow -> Fresh Green) */}
        <linearGradient id="fourWayBrandGradient" x1="0" y1="0" x2="0" y2="1">
          {/* Blue Pop: #2ba0ff */}
          <stop offset="0%" stopColor="#2ba0ff" stopOpacity="1" />
          <stop offset="22%" stopColor="#2ba0ff" stopOpacity="1" />
          {/* Coral Pop / Red: #ff705d */}
          <stop offset="38%" stopColor="#ff705d" stopOpacity="1" />
          <stop offset="55%" stopColor="#ff705d" stopOpacity="1" />
          {/* Sunshine Pop / Yellow: #f5e211 */}
          <stop offset="68%" stopColor="#f5e211" stopOpacity="1" />
          <stop offset="82%" stopColor="#f5e211" stopOpacity="1" />
          {/* Fresh Grass / Green: #8ed462 */}
          <stop offset="93%" stopColor="#8ed462" stopOpacity="1" />
          <stop offset="100%" stopColor="#8ed462" stopOpacity="1" />
        </linearGradient>

        {/* 2. GPU-Accelerated Tiled Noise Pattern (Zero CPU overhead during scroll) */}
        <pattern id="grainTile" width="128" height="128" patternUnits="userSpaceOnUse">
          <image href="/noise.png" width="128" height="128" opacity="0.32" />
        </pattern>
      </defs>

      {/* Background track (faint dashed trail) */}
      <path
        d={pathData}
        fill="none"
        stroke="#2c2e2a"
        strokeWidth={14}
        strokeDasharray="20 28"
        strokeOpacity={0.16}
        strokeLinecap="round"
      />

      {/* Primary Scroll-Drawn Animated Line with Four-Way Gradient */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#fourWayBrandGradient)"
        strokeWidth={32}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          pathLength,
          willChange: "stroke-dashoffset",
        }}
      />

      {/* Organic Noise Grain Overlay (Tightly bound to the animated stroke) */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#grainTile)"
        strokeWidth={32}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          pathLength,
          mixBlendMode: "multiply",
          willChange: "stroke-dashoffset",
        }}
      />
    </svg>
  );
}
