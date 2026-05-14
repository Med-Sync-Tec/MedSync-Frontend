# 0002 — TanStack Query for server state

- **Status:** Accepted
- **Date:** 2026-05-12 (retroactive)
- **Deciders:** Frontend team

## Context

Patient lists, consultations, and news data live on the Quarkus backend and need caching, request deduplication, and revalidation. Doing this manually with `useEffect` + `useState` led to stale data and duplicate requests in early prototypes.

## Consequences

- Server state is no longer mixed with client state.
- Query keys become a public-ish API — renames require updating call sites and invalidation lists.
- Devtools available in dev for inspecting cache.
- TanStack Query does not replace Zod parsing; the typed result still needs schema validation at the API boundary.

## Decision

Use TanStack Query 5 (`@tanstack/react-query`) for all data that originates on the backend. Per-feature hooks live in `features/<domain>/queries.ts` and consume `features/<domain>/api.ts` functions.

## Alternatives considered

- **SWR:** comparable, smaller surface area, but TanStack has better mutation ergonomics and devtools.
- **Redux Toolkit Query:** ties us to Redux for client state too; rejected.
- **Hand-rolled caching:** dismissed after seeing the prototype problems.
