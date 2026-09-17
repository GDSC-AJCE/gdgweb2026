/**
 * Google Labs & GDG Design Token System
 * 
 * Formalized tokens derived from the Google Labs aesthetic and GDG identity.
 * Provides unified theme variables, color definitions, typography, radii,
 * shadows, and reusable component styling helpers.
 */

export const LABS_TOKENS = {
  // Core Google & Google Labs Brand Palettes
  colors: {
    // Google Core Brand Quad
    google: {
      blue: "#4285F4",
      red: "#EA4335",
      yellow: "#FBBC04",
      green: "#34A853",
    },
    // Google Labs Accents (from official Labs interface & video)
    labs: {
      canvas: "#F3F0E6",       // Warm organic Labs editorial background
      canvasCard: "#FFFFFF",   // Crisp white card on Labs canvas
      pink: "#FF77B8",         // Labs vibrant pink accent
      hotPink: "#FF2E93",      // Highlight keyword accent ("experiment", "build")
      neonGreen: "#25EA7A",    // Labs vivid terminal/status green
      amber: "#FBBC04",        // Labs spark yellow
      cyan: "#24C1E0",         // Labs secondary cyan
      charcoal: "#1F1F1F",     // Dark primary text on light canvas
      mutedCharcoal: "#555555",// Secondary text on light canvas
    },
    // Dark Theme (Default GDG Space / Lab UI)
    dark: {
      background: "#0C0C0E",   // Deep obsidian space
      surface: "#131314",      // Surface layer 1
      surfaceCard: "#18191B",  // Surface layer 2 (Cards, Panels)
      surfaceElevated: "#202124", // Hover / active surfaces
      borderSubtle: "rgba(255, 255, 255, 0.08)",
      borderMedium: "rgba(255, 255, 255, 0.15)",
      borderFocus: "rgba(255, 255, 255, 0.3)",
      textPrimary: "#FFFFFF",
      textSecondary: "#E3E3E3",
      textMuted: "#9AA0A6",
    },
  },

  // Corner Radii System (Distinctive Google Labs pill & curved geometry)
  radius: {
    full: "9999px", // Pill buttons, badges, status indicators
    hero: "2.5rem", // 40px - Large featured hero containers
    card: "1.5rem", // 24px - Editorial cards, feature tiles
    modal: "1.75rem", // 28px - Popups, dialogs, drawers
    item: "1rem",   // 16px - Inner subcards, input fields
    badge: "0.5rem", // 8px - Chip tags, mono pills
  },

  // Shadows & Ambient Glows
  shadows: {
    subtle: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    elevated: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
    floating: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
    glowBlue: "0 0 40px -10px rgba(66, 133, 244, 0.35)",
    glowGreen: "0 0 40px -10px rgba(37, 234, 122, 0.35)",
    glowPink: "0 0 40px -10px rgba(255, 46, 147, 0.35)",
    glowYellow: "0 0 40px -10px rgba(251, 188, 4, 0.35)",
  },

  // Typography Tokens
  typography: {
    fontFamily: {
      sans: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      mono: "var(--font-mono, 'Roboto Mono', 'Fira Code', monospace)",
    },
    tracking: {
      tighter: "-0.04em",
      tight: "-0.02em",
      normal: "0",
      wide: "0.05em",
      widest: "0.15em",
    }
  },

  // Transition Curves
  animation: {
    smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  }
} as const;

/**
 * Reusable Class Utilities mapped to Design Tokens
 */
export const labsStyles = {
  // Card containers
  cardDark: "bg-[#18191B] border border-white/[0.08] rounded-3xl p-6 transition-all duration-300 hover:border-white/20",
  cardLight: "bg-white text-[#1F1F1F] border border-black/[0.08] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow",
  cardGlass: "bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl",

  // Interactive buttons
  btnPrimaryPill: "px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 flex items-center gap-2",
  btnWhitePill: "bg-white text-black font-semibold px-6 py-2.5 rounded-full text-xs sm:text-sm hover:bg-white/90 hover:shadow-lg transition-all",
  btnDarkPill: "bg-[#1F1F1F] text-white font-semibold px-6 py-2.5 rounded-full text-xs sm:text-sm hover:bg-black transition-all",
  
  // Badges & Tag chips
  badgePillMono: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold",
  badgePillLight: "bg-black/5 border border-black/10 text-[#555]",
  badgePillDark: "bg-white/[0.05] border border-white/10 text-zinc-300",

  // Editorial Section Titles
  sectionHeadingLight: "text-3xl sm:text-5xl md:text-6xl font-normal text-[#1F1F1F] tracking-tight font-sans",
  sectionHeadingDark: "text-3xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight font-sans",
};
