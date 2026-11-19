/**
 * GDG AJCE Unified Design System Tokens & Token Store v3.0
 * Authority: Single Source of Truth for GDG on Campus AJCE Design Language
 * Standard: Warm Storybook on Cream Paper + Google Labs Organic Geometry
 * Specifications: design.md & AGENTS.md
 */

export const DESIGN_TOKENS = {
  version: "3.0.0",
  name: "GDG AJCE Unified Design System",
  paradigm: "Warm Storybook on Cream Paper + Google Labs Organic Geometry",
  college: "Amal Jyothi College of Engineering",

  // Core Surface & Canvas Tokens (Warm Paper Ecosystem)
  surfaces: {
    creamPaper: {
      name: "Cream Paper",
      hex: "#f5f1e4",
      token: "--cream-paper",
      role: "Global base canvas background for all public pages",
    },
    pureWhite: {
      name: "Pure White",
      hex: "#ffffff",
      token: "--pure-white",
      role: "Elevated bento cards, floating nav background, storybook clouds",
    },
    sandstone: {
      name: "Sandstone",
      hex: "#e0dbce",
      token: "--sandstone",
      role: "Recessed surface, subtle inset containers, hover states, muted chips",
    },
    inkBlack: {
      name: "Ink Black",
      hex: "#2c2e2a",
      token: "--ink-black",
      role: "Primary typography, dark buttons, dominant hairline borders",
    },
    stoneGray: {
      name: "Stone Gray",
      hex: "#80827f",
      token: "--stone-gray",
      role: "Secondary body text, metadata, deactivated tab labels, subtitles",
    },
    hairlineMist: {
      name: "Hairline Mist",
      hex: "#d5d5d4",
      token: "--hairline-mist",
      role: "Hairline borders, nav dividers, card outlines",
    },
    borderWarm: {
      name: "Warm Sand Border",
      hex: "#e5e1d5",
      token: "--border-warm",
      role: "Bento card boundary borders on pure white cards",
    },
  },

  // Chromatic Accents & Google Labs Palette
  accents: {
    freshGrass: {
      name: "Fresh Grass Green",
      hex: "#8ed462",
      hover: "#7ec452",
      token: "--fresh-grass",
      role: "Primary brand structural accent, active badges, green card accents",
    },
    coralPop: {
      name: "Coral Pop",
      hex: "#ff705d",
      hover: "#ee6350",
      token: "--coral-pop",
      role: "Primary CTA button fill, quote marks, flame accents, urgent alerts",
    },
    skyPop: {
      name: "Sky Pop",
      hex: "#2ba0ff",
      hover: "#208be6",
      token: "--sky-pop",
      role: "Action dot indicator, links, cloud technology highlights",
    },
    sunshinePop: {
      name: "Sunshine Pop",
      hex: "#ffd600",
      hover: "#f5cc00",
      token: "--sunshine-pop",
      role: "Yellow feature cards, daisy petals, smiling sticker badges",
    },
    periwinkle: {
      name: "Periwinkle",
      hex: "#95a8fe",
      token: "--periwinkle",
      role: "Google Labs organic dome shape",
    },
    pinkScallop: {
      name: "Pink Scallop",
      hex: "#ffaff6",
      token: "--pink-scallop",
      role: "Google Labs organic cloud shape",
    },
    limeClover: {
      name: "Lime Clover",
      hex: "#c6eb3d",
      token: "--lime-clover",
      role: "Google Labs organic 4-leaf clover shape",
    },
    googleBlue: {
      name: "Google Blue",
      hex: "#4285F4",
      token: "--google-blue",
      role: "GDG code token chevron, technology badge",
    },
    googleGreen: {
      name: "Google Green",
      hex: "#34A853",
      token: "--google-green",
      role: "Live indicator dot, verified checkmarks",
    },
    googleYellow: {
      name: "Google Yellow",
      hex: "#FBBC04",
      token: "--google-yellow",
      role: "Trophy icons, podium badges, daisy flower core",
    },
    googleRed: {
      name: "Google Red",
      hex: "#EA4335",
      token: "--google-red",
      role: "Urgent announcements, deadlines",
    },
  },

  // Admin Dark Theme Tokens
  adminDark: {
    background: "#0f172a",
    foreground: "#f8fafc",
    card: "#1e293b",
    cardForeground: "#f8fafc",
    popover: "#1e293b",
    popoverForeground: "#f8fafc",
    muted: "#334155",
    mutedForeground: "#94a3b8",
    border: "#334155",
    input: "#1e293b",
    ring: "#38bdf8",
  },

  // Spacing Scale
  spacing: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    32: "128px",
    section: "136px",
    hero: "216px",
  },

  // Corner Radii Hierarchy
  radii: {
    sm: "10px",
    md: "16px",
    lg: "20px",
    card: "28px",
    bento: "36px",
    hero: "44px",
    full: "50px",
  },

  // Typography Scale (Inter Single-Family System)
  typography: {
    fontFamilies: {
      sans: "var(--font-inter), 'Inter', ui-sans-serif, system-ui, sans-serif",
      mono: "var(--font-mono), 'Roboto Mono', monospace",
    },
    scale: [
      {
        token: "Display Hero (XL)",
        size: "185px - 215px",
        weight: "Black (900)",
        lineHeight: "0.82",
        tracking: "-0.065em",
        usage: "Home page hero acronym (GDG AJCE)",
      },
      {
        token: "Headline Display (L)",
        size: "60px - 72px",
        weight: "Medium (500) / SemiBold (600)",
        lineHeight: "1.05",
        tracking: "-0.04em",
        usage: "Major section titles",
      },
      {
        token: "Section Title (M)",
        size: "32px - 40px",
        weight: "Medium (500)",
        lineHeight: "1.15",
        tracking: "-0.035em",
        usage: "Subsection titles, page taglines",
      },
      {
        token: "Card Heading (S)",
        size: "22px - 28px",
        weight: "Medium (500) / SemiBold (600)",
        lineHeight: "1.25",
        tracking: "-0.03em",
        usage: "Bento cards, feature blocks",
      },
      {
        token: "Subheading",
        size: "18px - 20px",
        weight: "Regular (400) / Medium (500)",
        lineHeight: "1.4",
        tracking: "-0.02em",
        usage: "Lead paragraphs, introductory context",
      },
      {
        token: "Body Standard",
        size: "15px - 16px",
        weight: "Regular (400)",
        lineHeight: "1.5",
        tracking: "normal",
        usage: "Prose, card descriptions, form fields",
      },
      {
        token: "Body Small",
        size: "13px - 14px",
        weight: "Regular (400) / Medium (500)",
        lineHeight: "1.5",
        tracking: "normal",
        usage: "Metadata, timestamps, card footnotes",
      },
      {
        token: "Micro / Chip",
        size: "11px - 12px",
        weight: "Medium (500) / SemiBold (600)",
        lineHeight: "1.2",
        tracking: "0.02em",
        usage: "Pill badges, category chips, rank numbers",
      },
    ],
  },

  // Easing Curves
  animation: {
    mindmarket: "cubic-bezier(.38, .005, .215, 1)",
    bounce: "cubic-bezier(.17, .67, .3, 1.33)",
    wave: "cubic-bezier(.455, .03, .515, .955)",
    snappy: "cubic-bezier(.5, 0, 0, 1)",
  },

  // Chapter Coordinates
  chapter: {
    name: "GDG AJCE",
    fullName: "Google Developer Groups on Campus • Amal Jyothi College of Engineering",
    location: "Amal Jyothi College of Engineering, Kanjirappally, Kerala, India",
    email: "dsc@amaljyothi.ac.in",
    backupEmail: "gdgajce@gmail.com",
    website: "gdgajce.vercel.app",
    socials: {
      instagram: "@gdgajce",
      twitter: "@gdgajce",
      linkedin: "gdscajce",
    },
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
