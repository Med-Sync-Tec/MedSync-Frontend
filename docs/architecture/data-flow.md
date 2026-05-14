# Data Flow

How data moves between the backend, the frontend, and the UI.

## Three flavors of state

| Flavor | Tool | Examples |
|---|---|---|
| **Server state** | TanStack Query | Patient list, consultation history, news feed |
| **Auth state** | Zustand (persisted) | Current user, role, ID token presence |
| **Local UI state** | `useState` / component-level | Modal open/closed, form input draft |

Picking the wrong flavor is the most common architecture mistake. Server state in `useState` causes stale data; UI state in Zustand causes coupling. When in doubt: if the data lives on the server, use TanStack Query.

## End-to-end request lifecycle

```
1. Component calls a query hook:        useConsultations(patientId)
2. queries.ts wraps apiFetch:           apiFetch<Consultation[]>('/api/patients/.../consultations')
3. apiFetch attaches the bearer token:  Authorization: Bearer <firebase-id-token>
4. Backend responds with JSON
5. apiFetch deserializes the JSON
6. api.ts parses with Zod:              ConsultationSchema.array().parse(json)
7. Hook returns typed data to the component
8. On error, apiFetch throws ApiError, parsed from BackendErrorSchema
```

## HTTP client

```ts
const data = await apiFetch<Consultation[]>(
  `/api/patients/${id}/consultations`,
);
```

- Base URL from `env.VITE_API_BASE_URL`.
- `auth: true` by default — adds the Firebase ID token.
- `auth: false` only for endpoints that must remain anonymous.
- Body is JSON-stringified automatically.
- Response is JSON-parsed automatically.

## Error handling

```ts
try {
  const data = await apiFetch<T>('/api/...');
  const parsed = MySchema.parse(data);
  return parsed;
} catch (err) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized) { /* 401: route to login */ }
    if (err.isValidation)   { /* 400: surface err.fieldErrors */ }
  }
  throw err;
}
```

Components should not handle 401 directly — that's the job of the query client and `RequireAuth`. Components handle domain errors (validation, business rule violations).

## Schemas are the source of truth

Domain types are inferred from Zod schemas:

```ts
// features/consultations/schemas.ts
export const ConsultationSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  createdAt: z.string().datetime(),
  /* ... */
});
export type Consultation = z.infer<typeof ConsultationSchema>;
```

`features/<domain>/types.ts` re-exports the inferred types for backward-compatible imports.

**Rules:**

- Every boundary crossing (backend response, mock import, `localStorage` read, form submit) goes through `.parse()` or `.safeParse()`.
- Mocks live in `src/mocks/` and are parsed at import — broken mocks break the build.
- Never cast with `as`. Write a schema and parse.
- Schemas can be composed: `BaseSchema.pick({...})`, `.omit()`, `.extend({...})`.

## Backend field mapping

The Quarkus backend uses Spanish field names in some places (e.g. `nombre`, `correo`). The frontend maps these into English field names at the boundary, inside the schema or the API function:

```ts
const BackendUserSchema = z.object({
  nombre: z.string(),
  correo: z.string().email(),
}).transform(({ nombre, correo }) => ({ name: nombre, email: correo }));

export const UserSchema = BackendUserSchema.pipe(
  z.object({ name: z.string(), email: z.string().email() }),
);
```

> **Migration note:** the existing code does this transformation inline in `api.ts`. Centralizing it inside the schema (via `.transform`) is the target pattern.

## TanStack Query conventions

- Query keys are arrays starting with the domain: `['consultations', patientId]`, `['patients', 'list']`.
- Stale time defaults to 30 seconds; override per-query for data that changes faster/slower.
- Mutations invalidate the relevant query keys on success, never on error.
- A query hook lives in `features/<domain>/queries.ts` and returns the unmodified `useQuery` result.

## Client state (Zustand)

- One store per domain that needs it: `useAuthStore`, etc.
- Use **selectors** to subscribe to slices: `const logout = useAuthStore(s => s.logout)`.
- Never read the whole store: `const store = useAuthStore()` causes re-renders on any change.
- `persist` middleware for state that survives reloads (auth user). Persist key: `medsync-<domain>`.

## Local UI state

Default to `useState` and `useReducer`. Avoid lifting state higher than necessary. Avoid Context for anything that changes frequently — it causes wide re-renders.
