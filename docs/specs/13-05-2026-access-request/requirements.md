# Solicitud Acceso — Requirements

- **Spec slug:** `solicitud-acceso`
- **Owner:** EQ3005B team
- **Status:** Shipped
- **Created:** 2026-05-13
- **Last updated:** 2026-05-13

## Problem

The previous "Solicitar acceso" button in the login page had no functionality. New users
had no way to request access to MedSync. Additionally, the login form contained UI
elements ("Recordarme", "¿Olvidaste tu contraseña?") that were non-functional and added
visual noise.

## Goals

- Provide a modal form that lets prospective users submit an access request (name, email,
  role) to the system.
- Remove non-functional login UI elements.
- Surface backend error states (duplicate pending, cooldown) with clear, human-readable
  messages.
- No password field — users set their password only after admin approval via a Firebase
  link.

## Non-goals

- Authentication logic (handled by `features/auth/api.ts` existing flows).
- Admin-side UI for approving/rejecting requests (handled via email links).
- Email composition or sending (backend responsibility).
- Role selection beyond `DOCTOR` and `COO`.

## Users and use cases

- **As a prospective MedSync user**, I want to click "Solicitar acceso" on the login
  page and fill in my name, email, and role so that I can request access to the system.
- **As a prospective user**, I want inline validation feedback so that I know what to
  fix before submitting.
- **As a prospective user**, I want a clear success state explaining what happens next
  (admin review + email with password link) so that I am not confused.
- **As a prospective user**, I want a clear error if my email already has a pending
  request or was recently rejected, so that I understand why the form was rejected.

## Acceptance criteria

The feature is "done" when:

- [x] Clicking "Solicitar acceso" opens a modal with fields: Nombre completo, Correo
  electrónico, Rol (DOCTOR | COO). No password field.
- [x] Submitting with empty or invalid fields shows per-field error messages without
  calling the backend.
- [x] A successful submission shows a success state explaining that the admin will review
  and the user will receive a password-setup link by email.
- [x] A 409 response shows "Ya tienes una solicitud en espera."
- [x] A 429 response shows the backend's `detail` message (e.g., "Debes esperar 4 días").
- [x] The modal can be closed at any point via the X button or clicking the backdrop.
- [x] The login form no longer shows "Recordarme" or "¿Olvidaste tu contraseña?".
- [x] `pnpm build` is clean with no TypeScript errors.
- [x] `pnpm lint` reports 0 errors and 0 warnings.

## Constraints

- Strict TypeScript: no `any`, no `as`, no `enum`.
- Zod is the source of truth for types (`RegisterSchema` → `RegisterInput`).
- HTTP calls only via `apiFetch<T>` from `@lib/http/client`.
- No hex literals — use design tokens.
- Path aliases only — no `../../../`.
- UI strings in Spanish (existing convention; pending migration to i18n catalog).

## Open questions

- None outstanding.

## Out of scope (for now)

- Resend confirmation email button.
- Role descriptions or tooltips in the selector.
- Accessibility audit (keyboard focus on modal open not formally tested).
