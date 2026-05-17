# Project Constraints

## Identity

- Project name: Dreaming Flower
- Domain: `dogfooding.cn`
- Framework: Next.js full-stack application
- Positioning: personal space, IP building, product experience, and blog output

## Current Direction

Dreaming Flower should begin as a personal galaxy entrance: a memorable homepage that introduces the project identity and creates room for future modules. The site should grow from this entrance into a structured personal space for product experience, writing, and future experiments without becoming a broad unfinished platform.

## Structure Discipline

- Route files in `src/app/` should stay thin and compose feature-level capabilities.
- Cross-page chrome and providers belong in `src/components/site/`.
- Feature-owned UI, data, rendering helpers, and types belong under `src/features/<feature>/` once a feature grows beyond a single component.
- Shared domain-neutral utilities and types belong in `src/lib/`.
- Global styles should be split by responsibility under `src/styles/` and imported from `src/app/globals.css`.

## Scope Discipline

The project should evolve from a clear MVP instead of expanding into multiple unfinished sections. New modules may be represented as homepage entries before their full implementation exists.

## File Policy

- AI-generated planning, ideation, and draft files stay inside the project under `.ai/`.
- `.ai/plans/`, `.ai/ideas/`, and `.ai/drafts/` are local-only and must not be committed.
- Project constraints live under `docs/constraints/` and should be committed.
