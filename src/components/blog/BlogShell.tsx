"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import type { Theme } from "@/components/home/types";

type BlogShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function BlogShell({ eyebrow = "Dreaming Flower Blog", title, description, children }: BlogShellProps) {
  const [theme, setTheme] = useState<Theme>("night");

  return (
    <main className={`blog-page blog-page--${theme}`}>
      <div className="blog-stars" aria-hidden="true" />
      <header className="blog-header">
        <Link className="blog-brand" href="/">
          <span className="blog-brand-mark">DF</span>
          <span>
            <span>{eyebrow}</span>
            <strong>{title}</strong>
          </span>
        </Link>
        <button
          type="button"
          className="solar-theme-toggle blog-theme-toggle"
          onClick={() => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"))}
          aria-label={`Switch to ${theme === "night" ? "day" : "night"} mode`}
        >
          {theme === "night" ? "Day mode" : "Night mode"}
        </button>
      </header>
      <section className="blog-hero">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </section>
      {children}
    </main>
  );
}
