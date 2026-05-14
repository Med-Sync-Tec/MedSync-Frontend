# Template — Bug Fix

Use this when fixing a defect.

---

## Context

MedSync Frontend (React 19 + TS strict + Vite 8 + Tailwind 4 + TanStack Query + Zustand + Zod + Firebase Auth).

Read first:

- `docs/constitution.md`
- The file(s) implicated in the bug.

## Bug report

- **Symptom:** <what the user sees>
- **Expected:** <what should happen>
- **Reproduction:** <steps>
- **Environment:** <browser, route, role, data state>
- **First seen:** <commit / date / report>

## Investigation

Before changing code:

1. Reproduce locally and confirm the symptom.
2. Identify the root cause — not the closest symptom. Trace upward from the failing point.
3. Confirm the root cause with a logged value or a debugger breakpoint.

State the root cause in one sentence before writing any fix.

## Fix

- **Minimal change.** Touch only what's needed to fix the root cause.
- **No incidental refactors** mixed into the same PR.
- **Regression test.** Add a test that fails before the fix and passes after.

## Verification

- New test passes.
- `pnpm build` — clean.
- `pnpm lint` — clean.
- Manual reproduction no longer reproduces.
- Adjacent flows are not broken (smoke check).

## Output

- One-paragraph root cause analysis.
- Diff summary.
- The regression test file and what it covers.
- Confirmation that the original reproduction no longer triggers the symptom.
