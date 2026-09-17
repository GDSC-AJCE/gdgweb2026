"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Sparkles } from "lucide-react";

// Deterministic string hasher
export function hashPosterSeed(str?: string | null): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// =============================================================================
// 8 STORYBOOK EVENT POSTER ARTWORKS (DIRECTLY MATCHED TO THE LANDING PAGE)
// =============================================================================

// 1. Periwinkle Canvas with Hanging Orange Star Character (Gymnastic Bars)
export function OrangeStarGymnastArt() {
  return (
    <div className="w-full h-full bg-[#C5D2FF] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Gymnastic Bar Frame (Clean Dark Outline) */}
        <line x1="30" y1="45" x2="210" y2="45" stroke="#2c2e2a" strokeWidth="4" strokeLinecap="round" />
        <line x1="45" y1="45" x2="45" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="195" y1="45" x2="195" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />
        {/* Base feet */}
        <line x1="30" y1="175" x2="60" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="180" y1="175" x2="210" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />

        {/* Playful Orange 10-Point Starburst Character */}
        <g transform="translate(120, 95)">
          {/* Hands gripping the bar */}
          <ellipse cx="-42" cy="-48" rx="7" ry="6" fill="#FF8343" />
          <ellipse cx="42" cy="-48" rx="7" ry="6" fill="#FF8343" />
          {/* Main Star Body */}
          <path
            d="M 0 -42
               L 13 -22
               L 36 -32
               L 35 -8
               L 52 8
               L 32 23
               L 38 46
               L 15 37
               L 0 54
               L -15 37
               L -38 46
               L -32 23
               L -52 8
               L -35 -8
               L -36 -32
               L -13 -22 Z"
            fill="#FF8343"
            stroke="#2c2e2a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Cute Face (Closed Smiling Eyes + Smile) */}
          <path d="M -16 -4 Q -11 -9 -6 -4" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 6 -4 Q 11 -9 16 -4" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M -8 10 Q 0 16 8 10" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Rosy Cheeks */}
          <circle cx="-19" cy="4" r="3.5" fill="#FF5722" opacity="0.4" />
          <circle cx="19" cy="4" r="3.5" fill="#FF5722" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

// 2. Sunshine Yellow Canvas with Coral Blossom Hand Balancing Tech Sphere (Volleyball)
export function CoralHandVolleyballArt() {
  return (
    <div className="w-full h-full bg-[#FDF085] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Playful Pink/Coral Multi-Lobe Hand / Fan Creature */}
        <g transform="translate(120, 135)">
          {/* Left finger 1 */}
          <path d="M -75 -12 C -85 -30 -60 -45 -48 -26 L -20 5 Z" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />
          {/* Left finger 2 */}
          <path d="M -50 -36 C -60 -65 -30 -75 -18 -48 L 0 5 Z" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />
          {/* Center finger */}
          <path d="M -14 -60 C -14 -90 14 -90 14 -60 L 0 10 Z" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />
          {/* Right finger 2 */}
          <path d="M 18 -48 C 30 -75 60 -65 50 -36 L 0 5 Z" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />
          {/* Right finger 1 */}
          <path d="M 48 -26 C 60 -45 85 -30 75 -12 L 20 5 Z" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />

          {/* Rounded base body */}
          <rect x="-65" y="-12" width="130" height="24" rx="12" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />

          {/* Cute Face on Hand Body */}
          <path d="M -14 -8 Q -9 -13 -4 -8" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 4 -8 Q 9 -13 14 -8" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M -6 4 Q 0 9 6 4" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Floating Volleyball / Google Sphere on Top */}
        <g transform="translate(142, 44)">
          <circle cx="0" cy="0" r="19" fill="#FFFBEB" stroke="#2c2e2a" strokeWidth="2.5" />
          <path d="M -13 -13 Q 0 0 -13 13" stroke="#2c2e2a" strokeWidth="2" fill="none" />
          <path d="M 13 -13 Q 0 0 13 13" stroke="#2c2e2a" strokeWidth="2" fill="none" />
          <path d="M -19 0 L 19 0" stroke="#2c2e2a" strokeWidth="2" />
        </g>

        {/* Small Companion Blossom Ball */}
        <circle cx="160" cy="46" r="6" fill="#F472B6" />
        <circle cx="125" cy="48" r="5" fill="#F472B6" />
      </svg>
    </div>
  );
}

// 3. Purple / Lavender Canvas with Tech Racquet & Sparkling Orb
export function LavenderRacquetArt() {
  return (
    <div className="w-full h-full bg-[#D6C7FF] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Soft Background Dome Shape */}
        <path d="M 140 170 L 210 170 C 210 90 140 90 140 170 Z" fill="#C4B5FD" opacity="0.6" />

        {/* Cute Mascot Character */}
        <g transform="translate(90, 105)">
          <ellipse cx="0" cy="20" rx="36" ry="42" fill="#8B5CF6" stroke="#2c2e2a" strokeWidth="2.5" />
          <circle cx="-12" cy="10" r="3.5" fill="#2c2e2a" />
          <circle cx="12" cy="10" r="3.5" fill="#2c2e2a" />
          <path d="M -6 22 Q 0 27 6 22" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Racquet */}
          <g transform="translate(38, -12)">
            <ellipse cx="20" cy="-10" rx="24" ry="28" fill="#FFFBEB" stroke="#2c2e2a" strokeWidth="3" />
            <line x1="8" y1="12" x2="-4" y2="38" stroke="#2c2e2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="20" y1="-38" x2="20" y2="18" stroke="#2c2e2a" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="-4" y1="-10" x2="44" y2="-10" stroke="#2c2e2a" strokeWidth="1.5" strokeDasharray="3,3" />
          </g>
        </g>

        {/* Floating Glowing Code Ball */}
        <g transform="translate(175, 55)">
          <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="2" />
          <path d="M -5 -4 L -9 0 L -5 4" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
          <path d="M 5 -4 L 9 0 L 5 4" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Small floating sparkles */}
        <circle cx="65" cy="50" r="4" fill="#FFFFFF" />
        <circle cx="195" cy="115" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// 4. Mint Green Canvas with Coding Clover Bot
export function MintCloverBotArt() {
  return (
    <div className="w-full h-full bg-[#D2F4B8] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Soft Organic Clover Shape */}
        <g transform="translate(120, 90)">
          <circle cx="-24" cy="-15" r="22" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
          <circle cx="24" cy="-15" r="22" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
          <circle cx="0" cy="20" r="24" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />

          {/* Cute Face */}
          <circle cx="-10" cy="-2" r="3" fill="#2c2e2a" />
          <circle cx="10" cy="-2" r="3" fill="#2c2e2a" />
          <path d="M -5 8 Q 0 13 5 8" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Laptop Base */}
          <rect x="-38" y="32" width="76" height="8" rx="4" fill="#2c2e2a" />
          <rect x="-28" y="10" width="56" height="24" rx="4" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="2.5" />
          {/* Laptop Screen Code Lines */}
          <line x1="-20" y1="18" x2="-2" y2="18" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
          <line x1="-20" y1="24" x2="6" y2="24" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Android Antennas */}
        <line x1="105" y1="46" x2="95" y2="30" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" />
        <line x1="135" y1="46" x2="145" y2="30" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 5. Sky Blue Canvas with Soaring Google Rocket & Storybook Clouds
export function SkyRocketCloudArt() {
  return (
    <div className="w-full h-full bg-[#BAE6FD] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Background Clouds */}
        <g fill="#FFFFFF" opacity="0.85">
          <ellipse cx="60" cy="140" rx="35" ry="20" />
          <ellipse cx="40" cy="130" rx="20" ry="16" />
          <ellipse cx="180" cy="50" rx="28" ry="16" />
        </g>

        {/* Diagonal Soaring Rocket */}
        <g transform="translate(125, 88) rotate(-35)">
          {/* Exhaust Flame */}
          <path d="M -10 32 Q 0 52 0 60 Q 0 52 10 32 Z" fill="#FBBC04" stroke="#2c2e2a" strokeWidth="2" />
          <path d="M -5 32 Q 0 46 0 50 Q 0 46 5 32 Z" fill="#EA4335" />

          {/* Fins */}
          <path d="M -16 18 L -28 32 L -14 30 Z" fill="#4285F4" stroke="#2c2e2a" strokeWidth="2" />
          <path d="M 16 18 L 28 32 L 14 30 Z" fill="#4285F4" stroke="#2c2e2a" strokeWidth="2" />

          {/* Rocket Body */}
          <path d="M -14 28 L -14 -4 Q -14 -32 0 -42 Q 14 -32 14 -4 L 14 28 Z" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="2.5" />
          
          {/* Nosecone */}
          <path d="M -14 -8 Q 0 -42 0 -42 Q 0 -42 14 -8 Z" fill="#EA4335" stroke="#2c2e2a" strokeWidth="2" />

          {/* Porthole with Cute Face */}
          <circle cx="0" cy="4" r="8" fill="#BAE6FD" stroke="#2c2e2a" strokeWidth="2" />
          <circle cx="-2.5" cy="3" r="1.5" fill="#2c2e2a" />
          <circle cx="2.5" cy="3" r="1.5" fill="#2c2e2a" />
          <path d="M -1.5 6 Q 0 7.5 1.5 6" stroke="#2c2e2a" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>

        {/* Floating Google 4-Color Sparkles */}
        <polygon points="195,95 197,90 202,88 197,86 195,81 193,86 188,88 193,90" fill="#FBBC04" />
        <polygon points="50,60 52,56 56,54 52,52 50,48 48,52 44,54 48,56" fill="#34A853" />
      </svg>
    </div>
  );
}

// 6. Coral Peach Canvas with Gemini AI Multi-Lobe Sparkle Galaxy
export function GeminiSparkleGalaxyArt() {
  return (
    <div className="w-full h-full bg-[#FED7AA] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Orbit Ring */}
        <ellipse cx="120" cy="90" rx="75" ry="32" stroke="#2c2e2a" strokeWidth="2.5" strokeDasharray="6,6" fill="none" transform="rotate(-15 120 90)" />

        {/* Central Gemini Star Creature */}
        <g transform="translate(120, 88)">
          {/* 4-point curved Gemini diamond */}
          <path
            d="M 0 -44
               Q 6 -12 36 0
               Q 6 12 0 44
               Q -6 12 -36 0
               Q -6 -12 0 -44 Z"
            fill="#5483F6"
            stroke="#2c2e2a"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Cute Face in center */}
          <circle cx="-6" cy="-4" r="3" fill="#ffffff" />
          <circle cx="-5" cy="-4" r="1.8" fill="#2c2e2a" />
          <circle cx="6" cy="-4" r="3" fill="#ffffff" />
          <circle cx="7" cy="-4" r="1.8" fill="#2c2e2a" />
          <path d="M -3 4 Q 0 8 3 4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Orbiting Planets / Spheres */}
        <circle cx="58" cy="68" r="10" fill="#34A853" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="182" cy="112" r="12" fill="#EA4335" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="148" cy="40" r="7" fill="#FBBC04" stroke="#2c2e2a" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// 7. Sunshine Cream Canvas with Retro Terminal & Steaming Coffee
export function TerminalCoffeeArt() {
  return (
    <div className="w-full h-full bg-[#FEF08A] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Terminal Window */}
        <g transform="translate(70, 40)">
          <rect width="115" height="85" rx="10" fill="#2c2e2a" stroke="#2c2e2a" strokeWidth="2" />
          {/* Window Buttons */}
          <circle cx="14" cy="13" r="3" fill="#EA4335" />
          <circle cx="24" cy="13" r="3" fill="#FBBC04" />
          <circle cx="34" cy="13" r="3" fill="#34A853" />
          <line x1="0" y1="24" x2="115" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

          {/* Syntax Lines */}
          <line x1="12" y1="36" x2="45" y2="36" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="36" x2="78" y2="36" stroke="#8ED462" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="46" x2="58" y2="46" stroke="#FFAFF6" strokeWidth="3" strokeLinecap="round" />
          <line x1="24" y1="56" x2="88" y2="56" stroke="#FBBC04" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="68" x2="38" y2="68" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <rect x="42" y="65" width="6" height="7" fill="#8ED462" />
        </g>

        {/* Steaming Coffee Cup */}
        <g transform="translate(165, 115)">
          <rect x="-14" y="-18" width="28" height="26" rx="6" fill="#FF705D" stroke="#2c2e2a" strokeWidth="2" />
          {/* Handle */}
          <path d="M 14 -12 C 22 -12 22 2 14 2" stroke="#2c2e2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Steam curves */}
          <path d="M -6 -24 Q -2 -28 -6 -32" stroke="#2c2e2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 2 -24 Q 6 -28 2 -32" stroke="#2c2e2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// 8. Fresh Sage Canvas with Google Code Brackets & Robotic Squircle
export function CodeMatrixSquircleArt() {
  return (
    <div className="w-full h-full bg-[#D1FAE5] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Big Code Squircle Container */}
        <g transform="translate(120, 90)">
          <rect x="-48" y="-48" width="96" height="96" rx="28" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="3" />

          {/* Left Google Blue Bracket < */}
          <path d="M -12 -24 L -28 0 L -12 24" stroke="#4285F4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

          {/* Right Google Red Bracket > */}
          <path d="M 12 -24 L 28 0 L 12 24" stroke="#EA4335" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

          {/* Center Tech Dots */}
          <circle cx="0" cy="-10" r="4" fill="#FBBC04" stroke="#2c2e2a" strokeWidth="1.5" />
          <circle cx="0" cy="10" r="4" fill="#34A853" stroke="#2c2e2a" strokeWidth="1.5" />
        </g>

        {/* Floating Accent Petals */}
        <circle cx="48" cy="48" r="8" fill="#FBBC04" stroke="#2c2e2a" strokeWidth="1.5" />
        <circle cx="192" cy="132" r="8" fill="#8ED462" stroke="#2c2e2a" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Master Art List
export const CREATIVE_POSTER_ARTS = [
  OrangeStarGymnastArt,
  CoralHandVolleyballArt,
  LavenderRacquetArt,
  MintCloverBotArt,
  SkyRocketCloudArt,
  GeminiSparkleGalaxyArt,
  TerminalCoffeeArt,
  CodeMatrixSquircleArt,
];

export interface CreativeEventPosterProps {
  /** Uploaded image URL if any */
  posterUrl?: string | null;
  /** Event title */
  title: string;
  /** Category badge text (e.g. "Codelab", "Hackathon", "Cloud Sprint") */
  category?: string;
  /** Event date */
  date?: string;
  /** Registration status */
  isClosed?: boolean;
  /** Seed string to deterministically select vector illustration */
  seed?: string | number | null;
  /** Explicit variant index (0-7) */
  variant?: number;
  /** Aspect ratio preset */
  aspectRatio?: "video" | "square" | "banner" | "wide" | "auto";
  /** Additional container classes */
  className?: string;
  /** Whether to show status chips on top */
  showBadges?: boolean;
}

const ASPECT_CLASSES = {
  video: "aspect-video",
  square: "aspect-square",
  banner: "aspect-[21/9]",
  wide: "aspect-[16/10]",
  auto: "h-full",
};

export default function CreativeEventPoster({
  posterUrl,
  title,
  category = "Event",
  date,
  isClosed = false,
  seed,
  variant,
  aspectRatio = "video",
  className = "",
  showBadges = true,
}: CreativeEventPosterProps) {
  const [imgError, setImgError] = useState(false);

  // Deterministically select artwork if no poster uploaded
  const artIndex = useMemo(() => {
    if (typeof variant === "number") {
      return Math.abs(variant) % CREATIVE_POSTER_ARTS.length;
    }
    const seedVal = seed !== undefined && seed !== null ? String(seed) : title || "GDG Event";
    return hashPosterSeed(seedVal) % CREATIVE_POSTER_ARTS.length;
  }, [variant, seed, title]);

  const ArtComponent = CREATIVE_POSTER_ARTS[artIndex];
  const aspectClass = ASPECT_CLASSES[aspectRatio];

  const hasValidImage = Boolean(posterUrl && !imgError && posterUrl.trim().length > 0);

  return (
    <div
      className={`relative w-full overflow-hidden border-b border-[#d5d5d4] select-none ${aspectClass} ${className}`}
    >
      {/* Top Status & Category Badges */}
      {showBadges && (
        <>
          <div className="absolute top-3 left-3 z-20 flex items-center h-7 px-3.5 rounded-[50px] bg-[#ffffff]/95 backdrop-blur-sm border border-[#d5d5d4] text-[#2c2e2a] text-xs font-medium shadow-xs">
            <Calendar className="w-3 h-3 mr-1.5 text-[#ff705d]" />
            <span>{category}</span>
          </div>

          <div
            className={`absolute top-3 right-3 z-20 flex items-center h-7 px-3.5 rounded-[50px] border text-xs font-medium shadow-xs ${
              isClosed
                ? "text-[#ffffff] bg-[#2c2e2a] border-[#2c2e2a]"
                : "text-[#2c2e2a] bg-[#ffffff]/95 backdrop-blur-sm border-[#d5d5d4]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                isClosed ? "bg-[#ff705d]" : "bg-[#8ed462] animate-pulse"
              }`}
            />
            <span>{isClosed ? "Closed" : "Open"}</span>
          </div>
        </>
      )}

      {/* Main Visual: Uploaded Image OR Creative Storybook Vector Art */}
      {hasValidImage ? (
        <img
          src={posterUrl!}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02]">
          <ArtComponent />
        </div>
      )}
    </div>
  );
}
