# 0006 — Firebase Auth with Quarkus backend

- **Status:** Accepted
- **Date:** 2026-05-12 (retroactive)
- **Deciders:** Frontend + backend teams

## Context

The Quarkus backend already validates Firebase ID tokens. The frontend needs a sign-in flow that produces those tokens. User profile and role data live in the backend, not in Firebase.

## Decision

- Firebase Auth is used only for the credential exchange (`signInWithEmailAndPassword`).
- Immediately after sign-in, the frontend calls `GET /api/users/me` with the Firebase ID token in `Authorization: Bearer`.
- The backend returns the canonical user profile (`name`, `email`, `role`).
- The frontend maps backend field names to English at the schema boundary.
- All subsequent API calls attach the Firebase ID token.

## Consequences

- Two sources of identity (Firebase auth state + backend profile) must stay in sync. `useAuthStore` holds the canonical app user, not Firebase's `User`.
- Sign-out must clear both (Firebase + Zustand persist).
- Token refresh is handled by Firebase; `apiFetch` reads the current token on each call.
- A network failure during `fetchMe` after a successful Firebase sign-in must be surfaced and rolled back.
- Backend cannot evolve identity off Firebase without coordinated frontend work.

## Alternatives considered

- **Backend-issued JWTs only:** requires the backend to manage credentials; rejected because Firebase already handles this well.
- **Storing the full Firebase user in the auth store:** redundant; backend profile is the canonical source.
