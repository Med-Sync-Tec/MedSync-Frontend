# <Feature Name> — Tasks

- **Spec slug:** `<feature-slug>`
- **Status:** Not started | In progress | Blocked | Done
- **Last updated:** YYYY-MM-DD

> Reference: `requirements.md` and `design.md` in this folder.

## How to use

Each task is atomic and verifiable on its own. Check off as you complete. If you need to add a task mid-implementation, add it here with a `[NEW]` tag and a one-line reason.

Tasks are roughly ordered for sequential execution. Reorder if dependencies allow earlier wins.

## Phase 1 — Schemas and types

- [ ] Add Zod schemas in `features/<domain>/schemas.ts`
- [ ] Re-export inferred types from `features/<domain>/types.ts`
- [ ] Add or extend mocks in `src/mocks/` and verify they parse

## Phase 2 — API and data

- [ ] Implement `features/<domain>/api.ts` functions using `apiFetch`
- [ ] Add TanStack Query hooks in `features/<domain>/queries.ts`
- [ ] Define query keys and document them at the top of `queries.ts`
- [ ] Wire invalidation in mutation hooks

## Phase 3 — UI

- [ ] Create or extend page component in `features/<domain>/pages/`
- [ ] Create feature-specific components in `features/<domain>/components/`
- [ ] Add or extend UI atoms in `components/ui/<category>/` (if reusable)
- [ ] Add Storybook stories for new UI atoms
- [ ] Verify dark mode visually for all new screens

## Phase 4 — Routing

- [ ] Add new route(s) in `src/routes/index.tsx`
- [ ] Update navigation entry points (links, menu items)
- [ ] Verify guards (`RequireAuth`, role checks) are applied

## Phase 5 — Edge cases and error handling

- [ ] Loading state
- [ ] Empty state
- [ ] Error state (validation, server, network)
- [ ] Accessibility check (keyboard, screen reader, focus)

## Phase 6 — Tests

- [ ] Unit tests for schemas (valid / invalid / transform)
- [ ] Unit tests for utilities
- [ ] Integration test for the API client
- [ ] Component tests for new components (RTL)
- [ ] E2E test for the critical user flow (Playwright)
- [ ] Coverage at or above 80% for new code

## Phase 7 — Docs and close-out

- [ ] Update relevant files in `docs/architecture/` if patterns changed
- [ ] Add an ADR if a new technical decision was made
- [ ] Fill in `summary.md`
- [ ] Open PR with link to this spec

## Verification gates

Run before declaring done:

- [ ] `pnpm build` — clean
- [ ] `pnpm lint` — 0 errors, 0 warnings
- [ ] All new tests pass
- [ ] No new `console.log`
- [ ] No new hex literals
- [ ] No new `any`
- [ ] All UI strings either in i18n catalog or flagged for migration

## Notes / Blockers

Use this section for inline notes during execution.
