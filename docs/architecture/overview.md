# Architecture Overview

## What MedSync Frontend is

A React clinical application for the TEC de Monterrey course EQ3005B. It manages patient records, consultations, and SOAP notes for doctors. The frontend authenticates against Firebase, then talks to a Quarkus backend that validates the Firebase ID token.

## High-level diagram

```
+--------------------+        +-----------------+        +------------------+
|  Browser (React)   |  --->  |  Firebase Auth  |        |  Quarkus API     |
|  Vite + TS         |        |  (sign-in)      |        |  /api/*          |
|                    |  <---  |  ID token       |        |                  |
|                    |        +-----------------+        |                  |
|                    |                                   |                  |
|                    |  ----------- Bearer <id-token> -> |                  |
|                    |  <---------- JSON responses ----- |                  |
+--------------------+                                   +------------------+
```

- **Auth credential exchange** happens between the browser and Firebase.
- **All business data** flows between the browser and Quarkus, with the Firebase ID token attached as `Authorization: Bearer …`.
- **The frontend never holds long-lived secrets.** Firebase config is public; the ID token is short-lived.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 | Course requirement, current ecosystem default |
| Bundler / dev server | Vite 8 | Fast HMR, first-class TS support |
| Language | TypeScript (strict) | Type safety at boundaries |
| Styling | Tailwind 4 (CSS-first `@theme`) | Design tokens via CSS custom properties |
| Routing | React Router 7 (data router API) | Nested routes + layouts |
| Auth | Firebase Auth | Backend already validates Firebase ID tokens |
| Server state | TanStack Query 5 | Caching, request dedup, devtools |
| Client state | Zustand 5 | Lightweight, no provider tree |
| Validation | Zod 4 | Runtime guards + inferred types |
| UI catalog | Storybook 10 | Visual contract for `components/ui/` |

## Folder layout (current)

```
src/
  assets/                  Static assets
  components/ui/           Pure design system (atoms, molecules)
    avatars/ badges/ buttons/ cards/
    feedback/ inputs/ navigation/ selectors/
  config/env.ts            Env var validation (Zod)
  features/                Bounded contexts
    auth/                  Login, store, API
    consultations/         History + SOAP entry
    doctor/                Doctor dashboard
    news/                  Medical news (saved)
    patients/              Patient list + utilities
  layouts/                 AuthLayout, DoctorLayout, ErrorBoundary
  lib/                     Cross-cutting infrastructure
    firebase/              Firebase client init
    http/                  apiFetch wrapper + ApiError
    query/                 TanStack Query setup
    theme/                 ThemeProvider + useTheme
  mocks/                   Sample data, parsed at import
  routes/                  Route definitions + auth guards
  App.tsx / main.tsx       Entry points
```

> **Migration note (i18n):** folder names listed above are already English. Files inside (`pages/`, `components/`, etc.) still contain identifiers and comments in Spanish. See [`conventions/i18n.md`](../conventions/i18n.md).

## Bounded contexts

Each `features/<domain>/` folder is self-contained. The internal layout is:

```
features/<domain>/
  api.ts        HTTP calls (via apiFetch + Zod parse)
  schemas.ts    Zod schemas — source of truth for domain types
  types.ts      Re-exports of inferred types
  store.ts      Zustand store (when client state is needed)
  queries.ts    TanStack Query hooks
  pages/        Route-level page components
  components/   Feature-specific components (not reusable atoms)
  index.ts      Public surface of the feature
```

## Dependency rules

- `features/*` → may import from `@ui`, `@lib`, `@mocks`, other `@features/*` (carefully)
- `components/ui/*` → may **not** import from `@features/*`
- `lib/*` → may **not** import from `@features/*` or `@ui/*`
- `routes/*` → composes layouts and feature pages

A violation of these rules is a code review blocker.

## Path aliases

Defined in `tsconfig.app.json` and mirrored in `vite.config.ts`:

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |
| `@ui/*` | `src/components/ui/*` |
| `@features/*` | `src/features/*` |
| `@layouts/*` | `src/layouts/*` |
| `@lib/*` | `src/lib/*` |
| `@mocks/*` | `src/mocks/*` |
| `@config/*` | `src/config/*` |
| `@routes/*` | `src/routes/*` |
| `@types/*` | `src/types/*` |

Relative imports with `../../` are forbidden — always use aliases.

## Build and run

```bash
pnpm dev          # Vite dev server
pnpm build        # tsc -b && vite build (both must pass)
pnpm lint         # ESLint (zero warnings target)
pnpm storybook    # Storybook on :6006
```

Deployment is Cloud Run via Cloud Build (`cloudbuild.yaml`, `Dockerfile`, `nginx/`).
