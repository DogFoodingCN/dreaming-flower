"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Theme } from "@/components/home/types";

type SiteThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "dreaming-flower-theme";
const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "night";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "day" || savedTheme === "night" ? savedTheme : "night";
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((currentTheme) => {
          const nextTheme = currentTheme === "night" ? "day" : "night";
          window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
          return nextTheme;
        });
      },
    }),
    [theme],
  );

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
}

export function useSiteTheme() {
  const value = useContext(SiteThemeContext);

  if (!value) {
    throw new Error("useSiteTheme must be used within SiteThemeProvider");
  }

  return value;
}
