# Architecture Constraints

## Source Layout

- `src/app/` contains App Router entry points, route-level metadata, route composition, and `notFound` handling.
- `src/components/site/` contains cross-page chrome and providers that are not owned by a single feature.
- `src/features/home/` owns the galaxy entrance experience, homepage-only components, homepage entry data, and home-specific types.
- `src/features/blog/` owns static MDX blog content loading, MDX rendering configuration, blog components, and blog-specific types.
- `src/lib/` contains only cross-feature utilities, route helpers, and shared domain-neutral types.
- `src/styles/` contains global CSS split by responsibility and imported by `src/app/globals.css`.
- `content/blog/` contains local committed MDX posts.

## App Router Boundaries

Routes should stay thin. Page files may compose feature components and pass route params, but should not own feature data parsing, MDX plugin setup, large visual components, or future module registries.

Client component entry props that receive function handlers should use names ending in `Action` (for example `onSelectAction` or `onToggleThemeAction`) so Next.js treats them as intentional action-style props and avoids TS71007 serializability diagnostics.

## Feature Boundaries

A feature directory is allowed when a capability has its own components plus data, rendering, or types. Current feature directories are `home` and `blog`.

Feature code may depend on `src/components/site` and `src/lib`, but site-level shared components should not depend on feature internals. Shared concepts such as the day/night `Theme` type should live outside feature directories.

## Styling Boundaries

- `src/app/globals.css` should remain the global style entry and import Tailwind plus split style files.
- Base element styles belong in `src/styles/base.css`.
- Theme tokens and root theme behavior belong in `src/styles/theme.css`.
- Cross-page chrome styles belong in `src/styles/site.css`.
- Homepage galaxy styles belong in `src/styles/home.css`.
- Blog layout and card styles belong in `src/styles/blog.css`.
- MDX prose, code block, Mermaid, and article-content rendering styles belong in `src/styles/mdx.css`.

When moving CSS, preserve selector specificity and import order before rewriting visual rules.

## Content Boundaries

Blog content remains static MDX under `content/blog/`. Required frontmatter fields are `title`, `description`, `date`, `slug`, and `excerpt`; `themeAccent` is optional.

All frontmatter field values must be quoted strings (e.g., `date: "2026-05-30"`) to prevent YAML from auto-parsing non-string values. Unquoted `date: 2026-05-30` is valid YAML but gets parsed as a Date object by `gray-matter`, causing unexpected rendering behavior.

The blog feature may support MDX enhancements such as headings, Mermaid, and LaTeX, but should not become a CMS, database-backed authoring system, moderation workflow, or dynamic publishing platform during the MVP.

## Future Module Entry Rules

Future modules may appear on the homepage as entries, planets, orbit nodes, labels, descriptions, or coming-soon states. A real route for a future module requires an explicit constraint update before implementation.

Only implemented routes should have navigable links. Placeholder entries must not imply that full module experiences already exist.

## What Requires a Constraint Update

Update constraints before adding product detail routes, authenticated flows, admin surfaces, CMS or database persistence, comments, subscriptions, user accounts, dynamic authoring, or complete module routes beyond homepage and static blog.

## What Must Stay Out of MVP

Authentication, admin dashboards, CMS integration, database persistence, comments, subscriptions, user accounts, dynamic blog authoring, moderation workflows, and fully implemented future module routes remain out of scope.
