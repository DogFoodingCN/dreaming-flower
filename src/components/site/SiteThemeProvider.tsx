"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Theme } from "@/components/home/types";

type SiteThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "dreaming-flower-theme";
const THEME_CHANGE_EVENT = "dreaming-flower-theme-change";
const DEFAULT_THEME: Theme = "night";
const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "day" || savedTheme === "night" ? savedTheme : DEFAULT_THEME;
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getStoredTheme(): Theme {
  return readStoredTheme();
}

function getServerTheme(): Theme {
  return DEFAULT_THEME;
}

function setStoredTheme(theme: Theme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToThemeChanges, getStoredTheme, getServerTheme);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        const nextTheme = theme === "night" ? "day" : "night";
        setStoredTheme(nextTheme);
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
