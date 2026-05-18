# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dreaming Flower is a Next.js App Router project for `dogfooding.cn`. The product positioning is personal space, IP building, product experience, and blog output.

Current MVP scope includes the galaxy-style homepage and a lightweight static MDX blog module. The homepage acts as a galaxy-style entrance for future modules; the blog provides writing output without CMS/database/account features. See committed constraints in `docs/constraints/` before expanding scope:

- `docs/constraints/project.md` — project identity, domain, structure discipline, and file policy
- `docs/constraints/mvp.md` — MVP in-scope and out-of-scope boundaries
- `docs/constraints/architecture.md` — App Router, feature, styling, and content boundaries
- `docs/constraints/visual.md` — galaxy visual direction, responsiveness, theme, and motion

## Commands

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Lint:

```bash
pnpm lint
```

Build:

```bash
pnpm build
```

Start a production build locally:

```bash
pnpm start
```

There is no test runner configured yet.

## Architecture

- `src/app/` contains App Router entry points, route-level metadata, route composition, and `notFound` handling.
- `src/app/layout.tsx` defines the root layout, global metadata, theme provider, Vercel Analytics, Vercel Speed Insights, KaTeX CSS, and global CSS imports.
- `src/app/page.tsx` composes the homepage from `src/features/home/` components and data.
- `src/app/blog/page.tsx` and `src/app/blog/[slug]/page.tsx` compose the static MDX blog list and detail pages.
- `src/components/site/` contains cross-page site chrome and providers. It should not depend on feature internals.
- `src/features/home/` owns the galaxy entrance experience, homepage-only components, homepage entry data, and home-specific types.
- `src/features/blog/` owns static MDX content loading, MDX rendering configuration, blog components, and blog-specific types.
- `src/lib/` contains cross-feature utilities and shared domain-neutral types, including shared theme concepts.
- `content/blog/` contains committed local MDX posts. Required frontmatter fields are `title`, `description`, `date`, `slug`, and `excerpt`; `themeAccent` is optional.
- `src/styles/` contains global CSS split by responsibility and imported by `src/app/globals.css`.

The blog uses local MDX files, `gray-matter` for frontmatter, `next-mdx-remote/rsc` for rendering, and MDX options/components under `src/features/blog/mdx/`. Blog article headings are extracted from MDX content for the article overview.

## Styling Boundaries

- `src/app/globals.css` remains the global style entry and imports Tailwind plus split style files.
- Base element styles belong in `src/styles/base.css`.
- Theme tokens and root theme behavior belong in `src/styles/theme.css`.
- Cross-page chrome styles belong in `src/styles/site.css`.
- Homepage galaxy styles belong in `src/styles/home.css`.
- Blog layout and card styles belong in `src/styles/blog.css`.
- MDX prose, code block, Mermaid, and article-content rendering styles belong in `src/styles/mdx.css`.

When moving CSS, preserve selector specificity and import order before rewriting visual rules.

## Project Constraints

- MVP includes the homepage and static MDX blog list/detail pages.
- Do not implement product detail pages, authentication, admin, CMS, database persistence, comments, subscriptions, user accounts, dynamic blog authoring, or full module routes unless the MVP constraints are explicitly changed.
- Future modules may appear on the homepage as non-final entry points, labels, descriptions, or coming-soon interactions.
- Only implemented routes should have navigable links. Placeholder entries must not imply that full module experiences already exist.
- The site must remain responsive for mobile and desktop.
- The site must support day and night modes.
- Visual direction should stay galaxy-inspired: stars, orbits, nodes, constellations, glass panels, and entrance-like spatial composition.
- Motion should be calm and should not reduce readability or basic accessibility.
- Client component entry props that receive function handlers should use names ending in `Action` (for example `onSelectAction` or `onToggleThemeAction`) to avoid Next.js TS71007 serializability diagnostics.

## Model Fallback

- When a requested model channel is unavailable, fall back to the session default model instead of blocking. The current default model is `gpt-5.5`.

## File Policy

AI-generated planning, ideation, and draft files must stay inside this repository under `.ai/`, separated by purpose:

- `.ai/plans/`
- `.ai/ideas/`
- `.ai/drafts/`

These `.ai/` subdirectories are local-only and ignored by Git. Commit project constraints under `docs/constraints/` instead.
