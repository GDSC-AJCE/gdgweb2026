/**
 * GDG AJCE Unified Design System Tokens v2.0
 * Aligned with the Warm Storybook & Google Labs Editorial System
 * Source of Truth: design.md
 */

export const DESIGN_TOKENS = {
  version: "2.0.0",
  name: "GDG AJCE Unified Design System",
  paradigm: "Warm Storybook on Cream Paper + Google Labs Organic Geometry",
  college: "Amal Jyothi College of Engineering",

  // Core Surfaces & Neutral Canvas Tokens
  surfaces: {
    creamPaper: {
      name: "Cream Paper",
      hex: "#f5f1e4",
      token: "--color-cream-paper",
      role: "Global base canvas background for all pages",
    },
    pureWhite: {
      name: "Pure White",
      hex: "#ffffff",
      token: "--color-pure-white",
      role: "Elevated bento cards, floating nav background, storybook clouds",
    },
    sandstone: {
      name: "Sandstone",
      hex: "#e0dbce",
      token: "--color-sandstone",
      role: "Recessed surface, subtle inset containers, hover states",
    },
    inkBlack: {
      name: "Ink Black",
      hex: "#2c2e2a",
      token: "--color-ink-black",
      role: "Primary typography, dark buttons, dominant hairline borders",
    },
    stoneGray: {
      name: "Stone Gray",
      hex: "#80827f",
      token: "--color-stone-gray",
      role: "Secondary body text, metadata, deactivated tab labels",
    },
    hairlineMist: {
      name: "Hairline Mist",
      hex: "#d5d5d4",
      token: "--color-hairline-mist",
      role: "Hairline borders, nav dividers, card outlines",
    },
    borderWarm: {
      name: "Warm Sand Border",
      hex: "#e5e1d5",
      token: "--color-border-warm",
      role: "Bento card boundary borders on pure white cards",
    },
  },

  // Chromatic Accents & Google Labs Geometries
  accents: {
    freshGrass: {
      name: "Fresh Grass",
      hex: "#8ed462",
      token: "--color-fresh-grass",
      role: "Primary brand structural accent, active badges, green cards",
    },
    coralPop: {
      name: "Coral Pop",
      hex: "#ff705d",
      token: "--color-coral-pop",
      role: "Primary CTA button fill, quote marks, flame accents",
    },
    skyPop: {
      name: "Sky Pop",
      hex: "#2ba0ff",
      token: "--color-sky-pop",
      role: "Action dot indicator, cloud technology highlights",
    },
    sunshinePop: {
      name: "Sunshine Pop",
      hex: "#ffd600",
      token: "--color-sunshine-pop",
      role: "Yellow feature cards, daisy petals, smiling sticker badges",
    },
    periwinkle: {
      name: "Periwinkle",
      hex: "#95a8fe",
      token: "--color-periwinkle",
      role: "Google Labs organic dome shape",
    },
    pinkScallop: {
      name: "Pink Scallop",
      hex: "#ffaff6",
      token: "--color-pink-scallop",
      role: "Google Labs organic cloud shape",
    },
    limeClover: {
      name: "Lime Clover",
      hex: "#c6eb3d",
      token: "--color-lime-clover",
      role: "Google Labs organic 4-leaf clover shape",
    },
    googleBlue: {
      name: "Google Blue",
      hex: "#4285F4",
      token: "--color-google-blue",
      role: "GDG code token chevron, technology badge",
    },
    googleGreen: {
      name: "Google Green",
      hex: "#34A853",
      token: "--color-google-green",
      role: "Live indicator dot, verified checkmarks",
    },
    googleYellow: {
      name: "Google Yellow",
      hex: "#FBBC04",
      token: "--color-google-yellow",
      role: "Trophy icons, podium badges, daisy flower core",
    },
    googleRed: {
      name: "Google Red",
      hex: "#EA4335",
      token: "--color-google-red",
      role: "Urgent announcements, deadlines",
    },
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
        sample: "GDG AJCE",
      },
      {
        token: "Headline Display (L)",
        size: "60px - 72px",
        weight: "Medium (500) / SemiBold (600)",
        lineHeight: "1.05",
        tracking: "-0.04em",
        usage: "Major section titles",
        sample: "Innovation Pathways",
      },
      {
        token: "Section Title (M)",
        size: "32px - 40px",
        weight: "Medium (500)",
        lineHeight: "1.15",
        tracking: "-0.035em",
        usage: "Subsection titles, page taglines",
        sample: "Where Student Innovators Build Real Software",
      },
      {
        token: "Card Heading (S)",
        size: "22px - 28px",
        weight: "Medium (500) / SemiBold (600)",
        lineHeight: "1.25",
        tracking: "-0.03em",
        usage: "Bento cards, feature blocks",
        sample: "Changing my thoughts has allowed me to change my life.",
      },
      {
        token: "Subheading",
        size: "18px - 20px",
        weight: "Regular (400) / Medium (500)",
        lineHeight: "1.4",
        tracking: "-0.02em",
        usage: "Lead paragraphs, introductory context",
        sample: "Thoughtfully organized learning tracks with production-grade curriculum.",
      },
      {
        token: "Body Standard",
        size: "15px - 16px",
        weight: "Regular (400)",
        lineHeight: "1.5",
        tracking: "normal",
        usage: "Prose, card descriptions, form fields",
        sample: "Zero prerequisites to join. Whether you wrote your first line of code yesterday or contribute to Linux kernels, GDG welcomes you.",
      },
      {
        token: "Body Small",
        size: "13px - 14px",
        weight: "Regular (400) / Medium (500)",
        lineHeight: "1.5",
        tracking: "normal",
        usage: "Metadata, timestamps, card footnotes",
        sample: "Davide, GDG AJCE • On using meditation & code",
      },
      {
        token: "Micro / Chip",
        size: "11px - 12px",
        weight: "Medium (500) / SemiBold (600)",
        lineHeight: "1.2",
        tracking: "0.02em",
        usage: "Pill badges, category chips, rank numbers",
        sample: "Codelabs Over Lectures",
      },
    ],
  },

  // Corner Radii Tokens
  radii: {
    full: "50px (rounded-full)",
    bento: "36px - 50px (rounded-[36px] / rounded-[50px])",
    card: "28px - 32px (rounded-[28px])",
    medium: "16px - 20px (rounded-2xl)",
    small: "10px - 12px (rounded-xl)",
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
