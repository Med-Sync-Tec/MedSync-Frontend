# Routing

How URLs map to layouts, guards, and pages.

## Definition

Routes are defined as `RouteObject[]` in `src/routes/index.tsx` and consumed by `useRoutes` in `App.tsx`.

## Tree

```
/
  AuthLayout
    /                         RedirectIfAuth -> LoginPage

  RequireAuth + DoctorLayout
    /doctor/dashboard         DoctorDashboardPage
    /doctor/patients          PatientsListPage
    /doctor/saved-news        SavedNewsPage
    /patients/:patientId/history          ConsultationHistoryPage
    /patients/:patientId/consultas/new    NewSOAPEntryPage   [TODO: i18n — rename to /consultations/new]

  /404                        NotFoundPage
  *                           Navigate to /404
```

> **Migration note (i18n):** route segments like `/consultas` need to be renamed to `/consultations`. URL changes require updating all `<Link>` and `useNavigate(...)` call sites and any external references. See [`conventions/i18n.md`](../conventions/i18n.md).

## Guards

- **`RequireAuth`** — wraps an element. If the auth store has no user, redirects to `/`. Use to protect any private route.
- **`RedirectIfAuth`** — wraps an element. If the auth store has a user, redirects to the default authenticated landing (currently `/doctor/dashboard`). Use on the login page.

Both guards compose: place them inside `element:` of the relevant route or wrap the layout.

## Layouts

- **`AuthLayout`** — for public routes. Wraps children with `ErrorBoundary` + `Suspense`. No header.
- **`DoctorLayout`** — for authenticated doctor routes. Renders `Header`, sidebar/nav, derives the active link from `useLocation`. Wraps children with `ErrorBoundary` + `Suspense`.

When a new role layout is added (`COO`, `CMO`), follow the same shape: layout component + guard composition in `routes/index.tsx`.

## Adding a route

1. Create the page in `features/<domain>/pages/<Name>Page.tsx`.
2. Import it in `src/routes/index.tsx`.
3. Add a route object inside the appropriate guard/layout block.
4. Use English URL segments (`/consultations/new`, not `/consultas/new`).
5. Use `kebab-case` for multi-word segments.
6. Use `:camelCase` for params (`:patientId`).

## Navigation

Inside components:

```tsx
import { useNavigate, Link } from 'react-router-dom';
const navigate = useNavigate();
navigate(`/patients/${id}/history`);
// or
<Link to={`/patients/${id}/history`}>Open history</Link>
```

Forbidden:

- `window.location.href = '...'`
- `window.location.assign(...)`
- `<a href="/internal/route">` (use `<Link>` instead; raw `<a>` only for external URLs)

## Search params and route params

- Route params: `useParams<{ patientId: string }>()` — always validate shape if the type matters.
- Search params: `useSearchParams()` — parse with Zod if used to drive logic.

## Role-based routes (future)

The `Role` enum is `'DOCTOR' | 'COO' | 'CMO'`. When `COO`/`CMO` flows are added, the pattern is:

1. New layout per role: `COOLayout`, `CMOLayout`.
2. Role guard reading the user from the auth store.
3. Compose: `<RequireAuth><RoleGuard role="COO"><COOLayout/></RoleGuard></RequireAuth>`.

This is not yet implemented. Open an ADR before adding it.
