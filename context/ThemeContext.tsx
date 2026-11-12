"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const adminStored = localStorage.getItem("gdg_admin_theme") as Theme | null;
      const initialTheme: Theme = adminStored || "light";
      setThemeState(initialTheme);
      
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = initialTheme === "system" ? (isSystemDark ? "dark" : "light") : initialTheme;
      setResolvedTheme(resolved);

      // Public site is strictly Warm Cream Paper (no dark mode). Admin panel uses scoped data-admin-theme.
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("data-admin-theme", resolved);
    } catch (e) {
      console.warn("Theme init error:", e);
    } finally {
      setMounted(true);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("gdg_admin_theme", newTheme);
    } catch {}

    const isSystemDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = newTheme === "system" ? (isSystemDark ? "dark" : "light") : newTheme;
    setResolvedTheme(resolved);

    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.setAttribute("data-admin-theme", resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
