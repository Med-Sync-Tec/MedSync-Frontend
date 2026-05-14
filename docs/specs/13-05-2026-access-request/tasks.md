# Solicitud Acceso — Tasks

- **Spec slug:** `solicitud-acceso`
- **Status:** Done
- **Last updated:** 2026-05-13

> Reference: `requirements.md` and `design.md` in this folder.

## Phase 1 — Schemas and types

- [x] Update `RegisterSchema` in `features/auth/schemas.ts`: remove `password` field;
  restrict `rol` to `z.enum(['DOCTOR', 'COO'])`
- [x] Verify `RegisterInput` type is correctly inferred (no `password` key)
- [x] Update `LoginCredentialsSchema` — remove `rememberMe` field

## Phase 2 — API and data

- [x] Update `registerUser()` in `features/auth/api.ts`: POST body is
  `{ nombre, correo, rol }` — no password
- [x] Ensure `auth: false` is set so no Firebase token is attached

## Phase 3 — UI

- [x] Create `RegisterModal.tsx` in `features/auth/components/`:
  - Fields: Nombre (text), Correo (email), Rol (select: DOCTOR | COO)
  - No password field
  - Per-field error messages from Zod
  - `isLoading` state on submit button
  - Success state: icon + "Solicitud enviada" + explanation about admin review
    and password-setup email
  - Error alert for backend errors (`describeAuthError`)
  - Close button (X) and backdrop click to dismiss
- [x] Update `LoginForm.tsx`:
  - Remove "Recordarme" checkbox
  - Remove "¿Olvidaste tu contraseña?" link
  - Change "Solicitar acceso" from anchor to button that opens `RegisterModal`

## Phase 4 — Routing

- No new routes required.

## Phase 5 — Edge cases and error handling

- [x] 409 "pending" → "Ya tienes una solicitud en espera."
- [x] 429 "cooldown" → surface backend `detail` field directly
- [x] Double-submit prevented via `isLoading` guard
- [x] Backdrop and X button close modal at any point

## Phase 6 — Tests

- [ ] Unit tests for `RegisterSchema` (valid / missing fields / invalid email / bad rol)
  *(deferred — not shipped in this iteration)*
- [ ] Component tests for `RegisterModal` (form validation, success state, error states)
  *(deferred)*

## Phase 7 — Docs and close-out

- [x] Spec files created under `docs/specs/solicitud-acceso/13-05-2026/`
- [x] Fill in `summary.md`

## Verification gates

- [x] `pnpm build` — clean
- [x] `pnpm lint` — 0 errors, 0 warnings
- [x] No `console.log` in changed files
- [x] No new hex literals
- [x] No new `any`

## Notes / Blockers

- Tests for `RegisterModal` and `RegisterSchema` were deferred to a follow-up task.
  They are logged in `summary.md` under "Follow-ups".
