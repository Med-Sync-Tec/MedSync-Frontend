# Frontend Structure

How code is organized inside `src/` and why.

## Layers

```
       routes        (composition: layouts + guards + pages)
         |
       layouts       (chrome: header, error boundary, suspense)
         |
       features      (domain logic: auth, patients, consultations, news, doctor)
         |
  +------+------+
  |             |
 lib          components/ui    (infrastructure / pure UI atoms)
```

A feature owns its pages, its API calls, its schemas, and its components. The UI layer owns reusable atoms with no domain knowledge. The lib layer owns cross-cutting concerns (HTTP, auth init, query client, theme).

## `components/ui/`

Pure design system. Subfolders are categories, not features:

- `avatars/` — user avatars and placeholders
- `badges/` — status pills, tags
- `buttons/` — primary, secondary, icon, link buttons
- `cards/` — containers with elevation
- `feedback/` — toasts, alerts, empty states, loading spinners
- `inputs/` — text inputs, textareas, checkboxes, radio
- `navigation/` — nav bars, breadcrumbs, tabs, headers
- `selectors/` — dropdowns, comboboxes, date pickers

**Rules:**

- A component here cannot import from `@features/*`.
- Each component is exported from its category's `index.ts` (barrel).
- Each component has a `*.stories.tsx` alongside it.
- Props are typed; refs are forwarded with `forwardRef`.
- Variants are a `Record<Variant, string>` constant extracted outside the component.
- `className` from the parent is concatenated last to allow overrides.

## `features/<domain>/`

Bounded context. Owns the domain.

```
features/auth/
  components/    Feature-specific components (e.g. LoginForm)
  pages/         LoginPage (mounted by routes/)
  api.ts         signInWithEmail, fetchMe (uses apiFetch + Zod)
  errors.ts      Domain-specific error helpers
  schemas.ts     Zod schemas for User, Credentials, etc.
  store.ts       useAuthStore (Zustand + persist)
  types.ts       Re-export of inferred types
  index.ts       Public surface
```

Other features follow the same shape. `queries.ts` appears when TanStack Query hooks are needed.

**Rule:** if a piece of code is reused by 2+ features and has no domain meaning, lift it to `lib/` or `components/ui/`.

## `lib/`

Cross-cutting infrastructure.

- `firebase/client.ts` — Firebase Auth initialization.
- `http/client.ts` — `apiFetch<T>(path, options)` wrapper. Attaches `Authorization: Bearer <firebase-id-token>` by default. Serializes JSON. Parses error responses into `ApiError`.
- `http/errors.ts` — `ApiError` class with `isUnauthorized`, `isValidation`, `fieldErrors` helpers. `BackendErrorSchema` for parsing error bodies.
- `query/` — TanStack Query client and provider setup.
- `theme/` — `ThemeProvider` (writes `.dark` class on `<html>`), `useTheme` hook, `localStorage` persistence under `medsync-theme`.

**Rule:** `lib/` is leaf code. It never imports from `features/`, `components/ui/`, or `routes/`.

## `layouts/`

- `AuthLayout.tsx` — public layout (login). Wraps with `ErrorBoundary` + `Suspense`.
- `DoctorLayout.tsx` — private layout. Header, navigation, sidebar. Derives `activeLink` from `useLocation`.
- `ErrorBoundary.tsx` — React error boundary used by layouts.
- `index.ts` — barrel exports.

## `routes/`

- `index.tsx` — `RouteObject[]` consumed by `useRoutes` in `App.tsx`.
- `RequireAuth.tsx` — guard for private routes; redirects unauthenticated users.
- `RedirectIfAuth.tsx` — guard for the login page; redirects authenticated users.
- `NotFoundPage.tsx` — `/404`.

Private routes are composed inside the `RequireAuth + DoctorLayout` block of `routes/index.tsx`. New private pages register there.

## `mocks/`

Sample data validated on import:

```ts
import { ConsultationSchema } from '@features/consultations/schemas';
export const sampleConsultations = ConsultationSchema.array().parse([...]);
```

If a mock no longer matches the schema, the app fails to start. That's the intended behavior — mocks are part of the contract.

## `config/`

- `env.ts` — validates `import.meta.env` with Zod at module load. Required vars:
  - `VITE_API_BASE_URL`
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- Missing or invalid → throws on import, prints what's wrong.

## File size and growth

| Type | Typical | Hard ceiling |
|---|---|---|
| Component file | 100–250 lines | 400 |
| Page file | 150–400 lines | 600 |
| Schema/types file | 50–200 lines | 400 |
| Store file | 80–200 lines | 400 |
| Anything else | < 400 | 800 |

When a file exceeds the ceiling, split it. Common splits: extract subcomponents into the same folder, move helpers to a `utils.ts`, separate Zod schemas from inferred types.
