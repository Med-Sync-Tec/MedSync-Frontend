# 0004 — Zod as source of truth for types

- **Status:** Accepted
- **Date:** 2026-05-12 (retroactive)
- **Deciders:** Frontend team

## Context

Backend responses, mock files, and form input all carry untrusted shapes at runtime. Hand-written TypeScript interfaces give compile-time safety but lie about runtime shape if the backend changes.

## Decision

Define every domain entity as a Zod schema in `features/<domain>/schemas.ts` and infer the TS type from it. Parse every boundary crossing with `.parse()` or `.safeParse()`.

## Consequences

- One source of truth for shape — schema and type cannot drift.
- Mock files validate at import, breaking the build on contract drift.
- Backend field-name differences (Spanish → English) are handled in `.transform()` inside the schema.
- Slight runtime cost; acceptable for the data volumes here.
- `as` casts are a code smell — they bypass the schema.

## Alternatives considered

- **TypeBox / Valibot:** comparable but smaller ecosystems.
- **io-ts:** more verbose, less ergonomic inference.
- **Manual type guards:** does not scale.
