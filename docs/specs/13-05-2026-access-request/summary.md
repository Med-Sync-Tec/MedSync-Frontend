# Solicitud Acceso — Summary

- **Spec slug:** `solicitud-acceso`
- **Shipped:** 2026-05-13
- **Owner:** EQ3005B team
- **Related PR(s):** pending

> Filled in after the feature ships.

## What shipped

A `RegisterModal` component that allows prospective MedSync users to submit an access
request with their name, email, and role (DOCTOR or COO). The form uses Zod for
client-side validation. On success it shows a confirmation state explaining that the
admin will review and the user will receive a password-setup link by email — no password
field is ever presented. The login form was cleaned up: "Recordarme" and
"¿Olvidaste tu contraseña?" were removed, and "Solicitar acceso" was wired to open the
modal.

## Deviations from initial design

None. Implementation matched the design document.

## Decisions made during implementation

- **`rol` typed as `'DOCTOR' | 'COO'` literal union, not `UserRole`** — `UserRole`
  includes `CMO` which is not a valid registration role. A separate `RegisterRole` type
  is derived from `z.enum(['DOCTOR', 'COO'])` inside `RegisterSchema`, keeping the
  schemas decoupled.
- **No password field from the start** — the previous iteration included a password
  field that was transmitted and stored in plaintext. This iteration removed it
  entirely, aligning with the backend security refactor.

## What worked well

- Zod `safeParse` for client-side field validation before any API call — clean pattern,
  avoids unnecessary network requests.
- `describeAuthError` as a single error-mapping function — 409 and 429 surface
  correctly without ad-hoc conditionals in the component.

## What didn't work

- `Alert` component does not accept a `className` prop — caught during implementation;
  removed the prop rather than patching the component.

## Follow-ups

- [ ] Unit tests for `RegisterSchema` (valid, missing fields, invalid email, bad rol) —
  deferred; no test infra decision made yet for this feature area.
- [ ] Component tests for `RegisterModal` (validation, success, backend error states).
- [ ] Accessibility audit: focus management when modal opens; keyboard navigation
  through the form.
- [ ] Migrate UI strings to i18n catalog once the catalog is set up.

## Metrics

- Bundle size delta: negligible (one new modal component, ~100 lines).
- Coverage: 0% new tests (deferred — see Follow-ups).

## Links

- Requirements: `./requirements.md`
- Design: `./design.md`
- Tasks: `./tasks.md`
- Backend spec: `MedSync-Backend/docs/specs/solicitud-acceso/13-05-2026/`
