/**
 * GDG AJCE Design Token Store & Bridge
 * Exports unified tokens and utility classes derived from design.md & AGENTS.md
 */

import { DESIGN_TOKENS } from "./design-system";

export { DESIGN_TOKENS };

export const LABS_TOKENS = {
  colors: {
    google: {
      blue: DESIGN_TOKENS.accents.googleBlue.hex,
      red: DESIGN_TOKENS.accents.googleRed.hex,
      yellow: DESIGN_TOKENS.accents.googleYellow.hex,
      green: DESIGN_TOKENS.accents.googleGreen.hex,
    },
    brand: {
      creamPaper: DESIGN_TOKENS.surfaces.creamPaper.hex,
      pureWhite: DESIGN_TOKENS.surfaces.pureWhite.hex,
      sandstone: DESIGN_TOKENS.surfaces.sandstone.hex,
      inkBlack: DESIGN_TOKENS.surfaces.inkBlack.hex,
      stoneGray: DESIGN_TOKENS.surfaces.stoneGray.hex,
      hairlineMist: DESIGN_TOKENS.surfaces.hairlineMist.hex,
      borderWarm: DESIGN_TOKENS.surfaces.borderWarm.hex,
      freshGrass: DESIGN_TOKENS.accents.freshGrass.hex,
      coralPop: DESIGN_TOKENS.accents.coralPop.hex,
      skyPop: DESIGN_TOKENS.accents.skyPop.hex,
      sunshinePop: DESIGN_TOKENS.accents.sunshinePop.hex,
    },
    adminDark: DESIGN_TOKENS.adminDark,
  },
  radius: DESIGN_TOKENS.radii,
  spacing: DESIGN_TOKENS.spacing,
  typography: DESIGN_TOKENS.typography,
  animation: DESIGN_TOKENS.animation,
} as const;

export const brandStyles = {
  canvas: "bg-background text-foreground",
  card: "rounded-bento border border-border bg-card text-card-foreground shadow-xs transition-colors",
  cardHover: "hover:border-foreground/20 hover:shadow-sm transition-all duration-300",
  buttonPrimary: "rounded-full bg-coral-pop hover:brightness-95 text-white font-medium shadow-xs transition-all",
  buttonSecondary: "rounded-full bg-card hover:bg-muted text-foreground border border-border shadow-xs transition-all",
  buttonDark: "rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs transition-all",
  pillBadge: "rounded-full px-3 py-1 text-xs font-semibold select-none",
};
