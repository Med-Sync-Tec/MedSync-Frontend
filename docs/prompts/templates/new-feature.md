# Template — New Feature

Use this when starting a new feature. Pair it with a spec under `docs/specs/<feature-slug>/`.

---

## Context

I'm working on the MedSync Frontend (React 19 + TS strict + Vite 8 + Tailwind 4 + TanStack Query + Zustand + Zod + Firebase Auth).

Before making changes, read:

- `docs/constitution.md` — non-negotiable principles.
- `docs/architecture/overview.md` — system layout.
- `docs/architecture/frontend-structure.md` — folder rules.
- `docs/conventions/` — naming, typescript, components, styling.
- `docs/specs/<feature-slug>/requirements.md` and `design.md` — what to build.

## Task

Implement the feature described in `docs/specs/<feature-slug>/`. Follow the task list in `tasks.md` exactly. If reality diverges from the spec, update the spec first.

## Constraints

- All new code is in English (identifiers, comments, commits). UI strings use the i18n catalog or are flagged for translation.
- Strict TypeScript: no `any`, no `as`, no `enum`.
- Every backend boundary uses Zod `.parse()`.
- HTTP only via `apiFetch<T>` from `@lib/http/client`.
- Navigation only via `useNavigate`, `<Navigate>`, `<Link>`.
- No hex literals — use design tokens.
- Path aliases — no `../../../`.
- Tests for new logic.

## Verification gates

Before declaring done:

- `pnpm build` — clean
- `pnpm lint` — 0 errors, 0 warnings
- New tests pass and cover new logic
- No `console.log` in changed files
- `summary.md` filled in for the spec

## Output

After implementing, give me:

- A short diff summary (files added / changed).
- How to test the change locally (commands + URL).
- Anything left out of scope (with a reason).
