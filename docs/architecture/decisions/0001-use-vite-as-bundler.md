# 0001 — Use Vite as the bundler

- **Status:** Accepted
- **Date:** 2026-05-12 (retroactive — decision predates this ADR)
- **Deciders:** Frontend team

## Context

The project needed a React + TypeScript dev environment with fast feedback loops, first-class TS support, and a low-config build pipeline. Course constraints rule out Next.js (no SSR requirement; full backend is in Quarkus).

## Decision

Use Vite 8 with `@vitejs/plugin-react` and the Tailwind 4 Vite plugin.

## Consequences

- Sub-second HMR.
- Native ESM in dev; `tsc -b && vite build` for production.
- Storybook 10 integrates via `@storybook/react-vite`.
- Path aliases live in `vite.config.ts` and must mirror `tsconfig.app.json` — drift is a recurring footgun.

## Alternatives considered

- **Create React App:** archived, no longer recommended.
- **Webpack + custom config:** more configuration burden, slower dev experience.
- **Next.js:** SSR/SSG features are unused for this app.
