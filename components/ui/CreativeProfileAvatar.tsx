"use client";

import React, { useState, useMemo } from "react";

// =============================================================================
// DETERMINISTIC HASHING UTILITY
// Ensures the same user/name always gets the exact same charismatic illustration
// =============================================================================
export function hashStringToNumber(str?: string | null): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// =============================================================================
// 8 CHARISMATIC STORYBOOK ILLUSTRATION AVATARS
// Designed specifically to harmonize with the GDG AJCE cream paper & Google aesthetic
// =============================================================================

// 0. Android Mascot Bot on Sky Blue Canvas
function MascotBotAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#BAE6FD" />
      {/* Antennas */}
      <line x1="38" y1="28" x2="30" y2="18" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" />
      <line x1="62" y1="28" x2="70" y2="18" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="18" r="3" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
      <circle cx="70" cy="18" r="3" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />

      {/* Head / Body Squircle */}
      <rect x="22" y="26" width="56" height="52" rx="22" fill="#8ED462" stroke="#2c2e2a" strokeWidth="3" />

      {/* Eyes */}
      <ellipse cx="38" cy="46" rx="4.5" ry="5.5" fill="#ffffff" stroke="#2c2e2a" strokeWidth="2" />
      <circle cx="39" cy="46" r="2.5" fill="#2c2e2a" />
      <ellipse cx="62" cy="46" rx="4.5" ry="5.5" fill="#ffffff" stroke="#2c2e2a" strokeWidth="2" />
      <circle cx="63" cy="46" r="2.5" fill="#2c2e2a" />

      {/* Rosy Cheeks */}
      <circle cx="31" cy="55" r="3.5" fill="#FF705D" opacity="0.6" />
      <circle cx="69" cy="55" r="3.5" fill="#FF705D" opacity="0.6" />

      {/* Sweet Smile */}
      <path d="M 43 56 Q 50 63 57 56" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Little Google Bowtie / Code Token */}
      <path d="M 45 74 L 50 78 L 45 82" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
      <path d="M 55 74 L 50 78 L 55 82" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 1. Playful Orange Star Spark on Periwinkle Canvas (Directly matched to landing page gymnast star)
function StarSparkAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#C5D2FF" />
      {/* 10-Point Playful Starburst Body */}
      <g transform="translate(50, 50)">
        <path
          d="M 0 -34
             L 10 -18
             L 29 -26
             L 28 -6
             L 42 6
             L 26 19
             L 31 37
             L 12 30
             L 0 44
             L -12 30
             L -31 37
             L -26 19
             L -42 6
             L -28 -6
             L -29 -26
             L -10 -18 Z"
          fill="#FF8343"
          stroke="#2c2e2a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Closed Happy Eyes */}
        <path d="M -13 -3 Q -9 -8 -5 -3" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 5 -3 Q 9 -8 13 -3" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Cheerful Smile */}
        <path d="M -6 8 Q 0 13 6 8" stroke="#2c2e2a" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Rosy Cheeks */}
        <circle cx="-15" cy="4" r="3" fill="#FF5722" opacity="0.5" />
        <circle cx="15" cy="4" r="3" fill="#FF5722" opacity="0.5" />
      </g>
    </svg>
  );
}

// 2. Curious Wavy Rosette Buddy on Sunshine Yellow Canvas
function WavyRosetteAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#FDF085" />
      <g transform="translate(50, 50)">
        {/* 12-Wave Sinusoidal Rosette Path */}
        <path
          d="M 36.00 0.00 L 33.24 8.91 L 34.02 18.25 L 28.18 25.56 L 24.81 34.34 L 16.03 37.71 L 8.72 43.55 L -0.62 42.77 L -9.53 45.53 L -18.25 41.02 L -26.96 40.51 L -33.24 33.24 L -40.51 26.96 L -41.02 18.25 L -45.53 9.53 L -42.77 0.62 L -43.55 -8.72 L -37.71 -16.03 L -34.34 -24.81 L -25.56 -28.18 L -18.25 -34.02 L -8.91 -33.24 L 0.00 -36.00 L 8.91 -33.24 L 18.25 -34.02 L 25.56 -28.18 L 34.34 -24.81 L 37.71 -16.03 L 43.55 -8.72 L 42.77 0.62 Z"
          fill="#5483F6"
          stroke="#2c2e2a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Big Curious Anime Eyes */}
        <circle cx="-11" cy="-3" r="5" fill="#ffffff" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="-10" cy="-4" r="2.5" fill="#2c2e2a" />
        <circle cx="-12" cy="-5" r="1" fill="#ffffff" />
        <circle cx="11" cy="-3" r="5" fill="#ffffff" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="12" cy="-4" r="2.5" fill="#2c2e2a" />
        <circle cx="10" cy="-5" r="1" fill="#ffffff" />

        {/* Small Cute Mouth */}
        <circle cx="0" cy="8" r="2.5" fill="#2c2e2a" />
      </g>
    </svg>
  );
}

// 3. Sunshine Daisy Coder on Fresh Mint Canvas
function SunshineDaisyAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#D2F4B8" />
      <g transform="translate(50, 50)">
        {/* 8 Flower Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
          <ellipse
            key={idx}
            cx="0"
            cy="-28"
            rx="11"
            ry="14"
            fill="#FBBC04"
            stroke="#2c2e2a"
            strokeWidth="2"
            transform={`rotate(${angle})`}
          />
        ))}

        {/* Center Face Disk */}
        <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="2.5" />

        {/* Winking Eye Left, Open Right */}
        <path d="M -13 -3 Q -8 -7 -3 -3" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="8" cy="-3" r="3.5" fill="#2c2e2a" />
        <circle cx="7" cy="-4.5" r="1" fill="#ffffff" />

        {/* Rosy Cheeks */}
        <circle cx="-11" cy="5" r="3" fill="#FF705D" opacity="0.6" />
        <circle cx="11" cy="5" r="3" fill="#FF705D" opacity="0.6" />

        {/* Smile */}
        <path d="M -5 7 Q 0 12 5 7" stroke="#2c2e2a" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// 4. Mint Clover Geek with Coder Glasses on Lavender Canvas
function CloverGeekAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#D6C7FF" />
      <g transform="translate(50, 52)">
        {/* 4 Clover Lobes */}
        <circle cx="-17" cy="-14" r="17" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="17" cy="-14" r="17" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="-17" cy="14" r="17" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="17" cy="14" r="17" fill="#8ED462" stroke="#2c2e2a" strokeWidth="2" />
        <circle cx="0" cy="0" r="16" fill="#8ED462" />

        {/* Geek Glasses */}
        <rect x="-24" y="-8" width="18" height="15" rx="5" fill="#ffffff" stroke="#2c2e2a" strokeWidth="2.5" />
        <rect x="6" y="-8" width="18" height="15" rx="5" fill="#ffffff" stroke="#2c2e2a" strokeWidth="2.5" />
        <line x1="-6" y1="-1" x2="6" y2="-1" stroke="#2c2e2a" strokeWidth="2.5" />
        {/* Eyes inside glasses */}
        <circle cx="-15" cy="-0.5" r="2.5" fill="#2c2e2a" />
        <circle cx="15" cy="-0.5" r="2.5" fill="#2c2e2a" />

        {/* Big confident grin */}
        <path d="M -7 13 Q 0 20 7 13" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// 5. Periwinkle Dome DJ on Peach Canvas (Music & Tech vibes)
function DomeDjAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#FED7AA" />
      {/* Arch Dome Body */}
      <g transform="translate(50, 54)">
        <path
          d="M -26 24 L -26 -2 C -26 -26 26 -26 26 -2 L 26 24 Z"
          fill="#95A8FE"
          stroke="#2c2e2a"
          strokeWidth="2.5"
        />

        {/* Headphones band */}
        <path d="M -30 -2 C -30 -34 30 -34 30 -2" stroke="#2c2e2a" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Headphone ear pads */}
        <rect x="-35" y="-10" width="7" height="18" rx="3.5" fill="#FF705D" stroke="#2c2e2a" strokeWidth="2" />
        <rect x="28" y="-10" width="7" height="18" rx="3.5" fill="#FF705D" stroke="#2c2e2a" strokeWidth="2" />

        {/* Face */}
        <circle cx="-10" cy="0" r="3" fill="#2c2e2a" />
        <circle cx="10" cy="0" r="3" fill="#2c2e2a" />
        <path d="M -5 8 Q 0 12 5 8" stroke="#2c2e2a" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// 6. Coral Blossom Creature on Lemon Canvas (Matched to landing page volleyball hand)
function CoralBlossomAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#FEF08A" />
      <g transform="translate(50, 54)">
        {/* Fingers / Petals */}
        <ellipse cx="-20" cy="-10" rx="7" ry="18" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" transform="rotate(-25)" />
        <ellipse cx="0" cy="-20" rx="7" ry="19" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" />
        <ellipse cx="20" cy="-10" rx="7" ry="18" fill="#F472B6" stroke="#2c2e2a" strokeWidth="2" transform="rotate(25)" />
        
        {/* Rounded Base */}
        <ellipse cx="0" cy="10" rx="28" ry="18" fill="#FF705D" stroke="#2c2e2a" strokeWidth="2.5" />

        {/* Face */}
        <circle cx="-10" cy="8" r="3" fill="#ffffff" stroke="#2c2e2a" strokeWidth="1.5" />
        <circle cx="-9" cy="8" r="1.5" fill="#2c2e2a" />
        <circle cx="10" cy="8" r="3" fill="#ffffff" stroke="#2c2e2a" strokeWidth="1.5" />
        <circle cx="9" cy="8" r="1.5" fill="#2c2e2a" />
        <path d="M -4 16 Q 0 20 4 16" stroke="#2c2e2a" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// 7. Candy Pink Cloud Explorer on Azure Canvas
function PinkCloudAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
      <rect width="100" height="100" fill="#E0F2FE" />
      <g transform="translate(50, 52)">
        {/* Multi-bubble cloud body */}
        <path
          d="M -30 14
             C -40 14 -40 -2 -28 -6
             C -32 -22 -12 -30 0 -22
             C 12 -30 32 -22 28 -6
             C 40 -2 40 14 30 14 Z"
          fill="#FFAFF6"
          stroke="#2c2e2a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Cute Sleepy Smiling Face */}
        <path d="M -13 -2 Q -9 -6 -5 -2" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 5 -2 Q 9 -6 13 -2" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M -4 6 Q 0 10 4 6" stroke="#2c2e2a" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Tiny Floating Star Sparkle */}
        <polygon points="26,-16 28,-11 33,-9 28,-7 26,-2 24,-7 19,-9 24,-11" fill="#FBBC04" />
      </g>
    </svg>
  );
}

// Array of all 8 character components
export const CREATIVE_AVATAR_ILLUSTRATIONS = [
  MascotBotAvatar,
  StarSparkAvatar,
  WavyRosetteAvatar,
  SunshineDaisyAvatar,
  CloverGeekAvatar,
  DomeDjAvatar,
  CoralBlossomAvatar,
  PinkCloudAvatar,
];

// Size mappings
const SIZE_CLASSES = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-20 h-20",
  "2xl": "w-28 h-28",
  custom: "",
};

export interface CreativeProfileAvatarProps {
  /** Optional uploaded image URL (e.g. from Google SSO or Firestore) */
  src?: string | null;
  /** Display name, email, or username used for deterministic illustration selection */
  name?: string | null;
  /** Custom seed string or index to override selection */
  seed?: string | number | null;
  /** Fixed avatar size or "custom" for arbitrary Tailwind widths */
  size?: keyof typeof SIZE_CLASSES;
  /** Additional Tailwind classes applied to the avatar container */
  className?: string;
  /** Custom explicit illustration variant index (0-7) */
  variant?: number;
  /** Alt tag for accessibility */
  alt?: string;
  /** Whether to render circular boundary border */
  showBorder?: boolean;
}

export default function CreativeProfileAvatar({
  src,
  name,
  seed,
  size = "md",
  className = "",
  variant,
  alt,
  showBorder = true,
}: CreativeProfileAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Compute deterministic index based on name/seed/variant
  const illustrationIndex = useMemo(() => {
    if (typeof variant === "number") {
      return Math.abs(variant) % CREATIVE_AVATAR_ILLUSTRATIONS.length;
    }
    const seedVal = seed !== undefined && seed !== null ? String(seed) : name || "GDG";
    return hashStringToNumber(seedVal) % CREATIVE_AVATAR_ILLUSTRATIONS.length;
  }, [variant, seed, name]);

  const Illustration = CREATIVE_AVATAR_ILLUSTRATIONS[illustrationIndex];
  const sizeClass = SIZE_CLASSES[size];

  // Has valid, non-errored uploaded image
  const hasValidImage = Boolean(src && !imgError && src.trim().length > 0);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
        showBorder ? "border border-[#d5d5d4]" : ""
      } ${sizeClass} ${className}`}
      title={name || alt || "GDG Member"}
    >
      {hasValidImage ? (
        <img
          src={src!}
          alt={alt || name || "User Avatar"}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Illustration />
        </div>
      )}
    </div>
  );
}
