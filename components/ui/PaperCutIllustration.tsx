"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface PaperCutIllustrationProps {
  className?: string;
  variant?: "hero" | "coder" | "trio";
}

export default function PaperCutIllustration({
  className = "",
}: PaperCutIllustrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Gaze target offsets
  const targetOffset = useRef({ x: 0, y: 0 });
  // Current interpolated values (LERP)
  const currentOffset = useRef({ x: 0, y: 0 });
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Reverse-engineered LERP damping from mindmarket.com
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Map cursor distance to a subtle range [-7px, 7px]
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      targetOffset.current = {
        x: Math.max(-7, Math.min(7, dx * 7)),
        y: Math.max(-5, Math.min(5, dy * 5)),
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animId: number;
    const updateGaze = () => {
      currentOffset.current.x = lerp(
        currentOffset.current.x,
        targetOffset.current.x,
        0.08 // MindMarket damping factor
      );
      currentOffset.current.y = lerp(
        currentOffset.current.y,
        targetOffset.current.y,
        0.08
      );

      setGaze({
        x: currentOffset.current.x,
        y: currentOffset.current.y,
      });

      animId = requestAnimationFrame(updateGaze);
    };

    animId = requestAnimationFrame(updateGaze);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative pointer-events-none select-none w-full max-w-4xl mx-auto ${className}`}
    >
      <motion.svg
        viewBox="0 0 900 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.0,
          ease: [0.38, 0.005, 0.215, 1.0], // MindMarket signature cubic-bezier
        }}
      >
        {/* CHARACTER 1: Left - Innovator with Laptop (Coral & White) */}
        <g
          id="student-coral"
          style={{
            transform: `translate(${gaze.x * 0.3}px, ${gaze.y * 0.3}px)`,
            transformOrigin: "185px 200px",
          }}
        >
          {/* Body */}
          <rect
            x="120"
            y="190"
            width="130"
            height="150"
            rx="36"
            fill="#ff705d"
            stroke="#2c2e2a"
            strokeWidth="2.5"
          />
          {/* Head */}
          <g
            style={{
              transform: `translate(${gaze.x * 0.5}px, ${gaze.y * 0.5}px)`,
              transformOrigin: "185px 120px",
            }}
          >
            <circle
              cx="185"
              cy="120"
              r="48"
              fill="#f5f1e4"
              stroke="#2c2e2a"
              strokeWidth="2.5"
            />
            {/* Hair (Fresh Grass green cap/hair) */}
            <path
              d="M 140 120 C 140 76, 230 76, 230 120 Z"
              fill="#8ed462"
              stroke="#2c2e2a"
              strokeWidth="2.5"
            />
            {/* Interactive Cursor-Tracking Pupils */}
            <circle
              cx={170 + gaze.x}
              cy={125 + gaze.y}
              r="4"
              fill="#2c2e2a"
            />
            <circle
              cx={200 + gaze.x}
              cy={125 + gaze.y}
              r="4"
              fill="#2c2e2a"
            />
            {/* Smile */}
            <path
              d="M 178 140 Q 185 148, 192 140"
              stroke="#2c2e2a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Arms holding laptop */}
          <path
            d="M 115 220 Q 140 280, 185 270"
            stroke="#2c2e2a"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 255 220 Q 230 280, 185 270"
            stroke="#2c2e2a"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* White Laptop */}
          <rect
            x="145"
            y="240"
            width="80"
            height="50"
            rx="10"
            fill="#ffffff"
            stroke="#2c2e2a"
            strokeWidth="2.5"
          />
          <circle cx="185" cy="265" r="8" fill="#2ba0ff" />
        </g>

        {/* CHARACTER 2: Center - Hero Builder with Google Bracket (Fresh Grass Green & Sky Pop) */}
        <g
          id="student-green"
          style={{
            transform: `translate(${gaze.x * 0.4}px, ${gaze.y * 0.4}px)`,
            transformOrigin: "450px 200px",
          }}
        >
          {/* Legs */}
          <rect x="405" y="320" width="35" height="70" rx="16" fill="#2c2e2a" />
          <rect x="460" y="320" width="35" height="70" rx="16" fill="#2c2e2a" />
          {/* Body */}
          <rect
            x="375"
            y="150"
            width="150"
            height="180"
            rx="50"
            fill="#8ed462"
            stroke="#2c2e2a"
            strokeWidth="2.5"
          />
          {/* Collar */}
          <path
            d="M 425 150 L 450 185 L 475 150"
            stroke="#2c2e2a"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Head & Glasses */}
          <g
            style={{
              transform: `translate(${gaze.x * 0.6}px, ${gaze.y * 0.6}px)`,
              transformOrigin: "450px 75px",
            }}
          >
            <circle
              cx="450"
              cy="75"
              r="52"
              fill="#ffffff"
              stroke="#2c2e2a"
              strokeWidth="2.5"
            />
            {/* Glasses frames */}
            <circle
              cx="432"
              cy="76"
              r="14"
              stroke="#2c2e2a"
              strokeWidth="2.5"
              fill="#f5f1e4"
            />
            <circle
              cx="468"
              cy="76"
              r="14"
              stroke="#2c2e2a"
              strokeWidth="2.5"
              fill="#f5f1e4"
            />
            <line
              x1="446"
              y1="76"
              x2="454"
              y2="76"
              stroke="#2c2e2a"
              strokeWidth="2.5"
            />
            {/* Interactive Cursor-Tracking Pupils behind glasses */}
            <circle
              cx={432 + gaze.x}
              cy={76 + gaze.y}
              r="3.5"
              fill="#2c2e2a"
            />
            <circle
              cx={468 + gaze.x}
              cy={76 + gaze.y}
              r="3.5"
              fill="#2c2e2a"
            />
            <path
              d="M 442 96 Q 450 104, 458 96"
              stroke="#2c2e2a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Hair */}
            <path
              d="M 400 65 C 405 20, 495 20, 500 65 C 480 50, 420 50, 400 65 Z"
              fill="#f5e211"
              stroke="#2c2e2a"
              strokeWidth="2.5"
            />
          </g>

          {/* Floating Google '< >' badge above with subtle lag */}
          <g
            style={{
              transform: `translate(${415 + gaze.x * 0.8}px, ${-10 + gaze.y * 0.8}px)`,
            }}
          >
            <rect
              x="0"
              y="0"
              width="70"
              height="36"
              rx="18"
              fill="#2ba0ff"
              stroke="#2c2e2a"
              strokeWidth="2"
            />
            <text
              x="35"
              y="24"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="18"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              &lt; / &gt;
            </text>
          </g>
        </g>

        {/* CHARACTER 3: Right - Mobile Dev with Smartphone (Sky Pop & Lavender) */}
        <g
          id="student-blue"
          style={{
            transform: `translate(${gaze.x * 0.3}px, ${gaze.y * 0.3}px)`,
            transformOrigin: "705px 200px",
          }}
        >
          {/* Body */}
          <rect
            x="640"
            y="180"
            width="135"
            height="160"
            rx="42"
            fill="#2ba0ff"
            stroke="#2c2e2a"
            strokeWidth="2.5"
          />
          {/* Head */}
          <g
            style={{
              transform: `translate(${gaze.x * 0.5}px, ${gaze.y * 0.5}px)`,
              transformOrigin: "705px 110px",
            }}
          >
            <circle
              cx="705"
              cy="110"
              r="48"
              fill="#f5f1e4"
              stroke="#2c2e2a"
              strokeWidth="2.5"
            />
            {/* Hair */}
            <path
              d="M 660 110 C 660 60, 750 60, 750 110 C 740 85, 670 85, 660 110 Z"
              fill="#2c2e2a"
            />
            {/* Interactive Pupils */}
            <circle
              cx={692 + gaze.x}
              cy={115 + gaze.y}
              r="4"
              fill="#2c2e2a"
            />
            <circle
              cx={722 + gaze.x}
              cy={115 + gaze.y}
              r="4"
              fill="#2c2e2a"
            />
            <path
              d="M 700 130 Q 707 137, 714 130"
              stroke="#2c2e2a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Arm holding mobile phone up */}
          <path
            d="M 640 220 Q 610 210, 600 160"
            stroke="#2c2e2a"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Mobile phone */}
          <rect
            x="580"
            y="120"
            width="40"
            height="70"
            rx="8"
            fill="#ffffff"
            stroke="#2c2e2a"
            strokeWidth="2.5"
          />
          <rect
            x="586"
            y="130"
            width="28"
            height="46"
            rx="4"
            fill="#8ed462"
          />
          <circle cx="600" cy="182" r="2.5" fill="#2c2e2a" />
        </g>

        {/* STORYBOOK DECORATIVE ACCENTS with floating gentle wave */}
        <g className="animate-wave-subtle">
          <path
            d="M 70 140 L 90 120 L 110 140 L 90 160 Z"
            fill="#f5e211"
            stroke="#2c2e2a"
            strokeWidth="2"
          />
          <circle
            cx="310"
            cy="90"
            r="16"
            fill="#ff705d"
            stroke="#2c2e2a"
            strokeWidth="2"
          />
          <rect
            x="560"
            y="60"
            width="24"
            height="24"
            rx="6"
            fill="#8ed462"
            stroke="#2c2e2a"
            strokeWidth="2"
            transform="rotate(18 560 60)"
          />
          <path
            d="M 810 240 Q 830 220, 850 240 Q 830 260, 810 240 Z"
            fill="#2ba0ff"
            stroke="#2c2e2a"
            strokeWidth="2"
          />
          <circle
            cx="790"
            cy="150"
            r="12"
            fill="#ffd731"
            stroke="#2c2e2a"
            strokeWidth="2"
          />
        </g>
      </motion.svg>
    </div>
  );
}
