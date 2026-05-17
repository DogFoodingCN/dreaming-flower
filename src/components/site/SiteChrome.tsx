"use client";

import Link from "next/link";
import type { Theme } from "@/components/home/types";

type SiteChromeProps = {
  theme: Theme;
  activePath: "/" | "/blog";
  eyebrow?: string;
  title?: string;
  onToggleTheme: () => void;
};

const navigationItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
] as const;

export function SiteChrome({ theme, activePath, eyebrow = "Independent Developer · Product Lab", title = "繁花盛景", onToggleTheme }: SiteChromeProps) {
  return (
    <section className="site-chrome" aria-label="Dreaming Flower navigation">
      <div className="site-brand-panel">
        <Link className="site-brand" href="/" aria-label="返回 Dreaming Flower 首页">
          <span className="site-brand-main">
            <span className="site-logo-text">DF</span>
            <span className="site-title-divider" aria-hidden="true" />
            <strong>{title}</strong>
          </span>
          <span className="site-brand-eyebrow">{eyebrow}</span>
        </Link>
      </div>

      <div className="site-actions">
        <nav className="site-nav" aria-label="站点导航">
          {navigationItems.map((item) => (
            <Link key={item.href} className={item.href === activePath ? "site-nav-link site-nav-link--active" : "site-nav-link"} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="site-theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "night" ? "day" : "night"} mode`}
        >
          {theme === "night" ? "Day mode" : "Night mode"}
        </button>
      </div>
    </section>
  );
}
