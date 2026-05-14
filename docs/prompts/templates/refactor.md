# Template — Refactor

Use this when restructuring code without changing behavior.

---

## Context

MedSync Frontend (React 19 + TS strict + Vite 8 + Tailwind 4 + TanStack Query + Zustand + Zod).

Read first:

- `docs/constitution.md`
- `docs/architecture/frontend-structure.md` — layer rules.
- `docs/conventions/typescript.md` and `docs/conventions/components.md`.
- The file(s) being refactored.

## Refactor goal

<one paragraph: what is the structural problem and what should it look like after>

## Scope

- **In scope:** <files and folders>
- **Out of scope:** <what NOT to touch>

## Non-goals

- Behavior changes (public API, rendered output, network calls).
- Adding features.
- Bumping dependencies.

## Verification

The refactor is complete when:

- All existing tests pass without modification (if a test had to change, that's a behavior change — stop).
- `pnpm build` — clean.
- `pnpm lint` — clean.
- Storybook stories for any touched UI component still render the same visually.
- A side-by-side diff of input/output for affected code paths shows no difference.

## Output

- Diff summary.
- Migration notes if any imports moved.
- Anything that surfaced as a follow-up but was left for a separate PR.
