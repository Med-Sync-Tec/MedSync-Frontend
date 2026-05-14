# 0003 — Zustand for client state

- **Status:** Accepted
- **Date:** 2026-05-12 (retroactive)
- **Deciders:** Frontend team

## Context

Auth state (current user, role) needs to be readable from anywhere in the tree, persisted across reloads, and updatable without a Context provider explosion.

## Decision

Use Zustand 5 with `persist` middleware for cross-cutting client state (currently only `useAuthStore`). One store per domain. Always read via selectors.

## Consequences

- No provider tree pollution.
- `localStorage` persistence is one line of config.
- Selector discipline is critical: `useAuthStore()` (without selector) re-renders on every change.
- Devtools available via middleware but not enabled by default.

## Alternatives considered

- **Redux Toolkit:** more boilerplate than needed for a single auth slice.
- **React Context:** widely re-renders consumers; ergonomically poor for persistence.
- **Jotai:** atomic model is overkill for the current state surface.
