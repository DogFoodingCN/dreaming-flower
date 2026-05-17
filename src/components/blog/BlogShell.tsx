"use client";

import type { ReactNode } from "react";
import { SiteChrome } from "@/components/site/SiteChrome";
import { useSiteTheme } from "@/components/site/SiteThemeProvider";

type BlogShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function BlogShell({ children }: BlogShellProps) {
  const { theme, toggleTheme } = useSiteTheme();

  return (
    <main className={`blog-page blog-page--${theme}`}>
      <div className="blog-stars" aria-hidden="true" />
      <SiteChrome
        theme={theme}
        activePath="/blog"
        eyebrow="Independent Developer · Product Lab"
        title="繁花盛景"
        onToggleTheme={toggleTheme}
      />
      {children}
    </main>
  );
}
