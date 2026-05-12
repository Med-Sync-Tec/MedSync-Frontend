# 0005 — Tailwind 4 CSS-first design tokens

- **Status:** Accepted
- **Date:** 2026-05-12 (retroactive)
- **Deciders:** Frontend team

## Context

Hex literals were leaking into components (`bg-[#4f46e5]`). Theming (light/dark) was implemented with `dark:` color prefixes scattered across components, leading to inconsistent overrides.

## Decision

Define design tokens as CSS custom properties under `@theme` in `src/index.css`. Override the same variables under `.dark` for dark mode. Components reference token-named utilities (`bg-primary`, `text-danger`) — never hex literals.

Token list:
`primary`, `primary-hover`, `primary-subtle`,
`accent`, `accent-hover`,
`background`, `surface`, `surface-muted`,
`text-primary`, `text-muted`,
`border-subtle`,
`danger`, `danger-hover`,
`success`, `warning`.

## Consequences

- Adding a new color is a one-line edit in `index.css`.
- Dark mode is consistent because tokens are redefined, not utility classes.
- Components are theme-agnostic.
- Token names must be semantic (`caution`, not `orange`).
- Lint must catch hex literals in `.tsx` (currently a `grep` check; ideally an ESLint rule).

## Alternatives considered

- **CSS-in-JS (Emotion, styled-components):** runtime cost, harder to lint.
- **Tailwind config tokens (pre-v4):** still required; v4's CSS-first approach is simpler.
- **Hex literals in components:** rejected; was the previous state and caused drift.
