# Solicitud Acceso — Design

- **Spec slug:** `solicitud-acceso`
- **Status:** Shipped
- **Last updated:** 2026-05-13

> Reference: `requirements.md` in this folder.

## Approach summary

A controlled modal component (`RegisterModal`) lives in `features/auth/components/`. It
manages its own local state (field values, field errors, loading, success). On submit it
calls `registerUser()` from `features/auth/api.ts`, which POSTs to
`/api/auth/register` without an auth token. The `RegisterSchema` (Zod) is the single
source of truth for the `RegisterInput` type. The `LoginForm` component is updated to
remove defunct UI and wire the "Solicitar acceso" button to show the modal.

## User flow

```
1. User lands on the login page.
2. User clicks "Solicitar acceso" button.
3. RegisterModal opens over a blurred backdrop.
4. User fills in: Nombre completo, Correo electrónico, Rol (DOCTOR | COO).
5a. If validation fails → per-field error messages shown; no API call.
5b. If validation passes → POST /api/auth/register is fired; button shows loading state.
6a. 202 Accepted → success state: icon + "Solicitud enviada" + explanation about email.
6b. 409 (pending) → error alert: "Ya tienes una solicitud en espera."
6c. 429 (cooldown) → error alert: detail from backend response.
6d. Any other error → generic error alert via describeAuthError().
7. User clicks "Cerrar" or backdrop → modal unmounts.
```

## UI

- **Pages touched:** `LoginForm.tsx` (remove Recordarme + Olvidaste tu contraseña;
  wire "Solicitar acceso" to open modal)
- **New components:** `RegisterModal.tsx` (`features/auth/components/`)
- **Modified components:** `LoginForm.tsx`
- **Storybook stories:** none added (modal; deferred)

### RegisterModal layout (success state)

```
┌─────────────────────────────────────┐
│  [X]                                │
│  Solicitar acceso                   │
│  Completa los datos para enviar...  │
│                                     │
│  ✉ (green icon)                    │
│  Solicitud enviada correctamente.   │
│  Un administrador revisará tu...    │
│                                     │
│  [  Cerrar  ]                       │
└─────────────────────────────────────┘
```

## Data

### Backend endpoint

| Method | Path                  | Purpose             | Auth     |
|--------|-----------------------|---------------------|----------|
| POST   | `/api/auth/register`  | Submit access request | None   |

### Request shape

```ts
// features/auth/schemas.ts
export const RegisterSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  correo: z.string().min(1, 'Este campo es obligatorio').email('Formato de correo inválido'),
  rol: z.enum(['DOCTOR', 'COO'], { message: 'Selecciona un rol válido' }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
```

### API function

```ts
// features/auth/api.ts
export async function registerUser(data: RegisterInput): Promise<void> {
  await apiFetch<unknown>('/api/auth/register', {
    method: 'POST',
    body: { nombre: data.nombre, correo: data.correo, rol: data.rol },
    auth: false,
  });
}
```

### State

No global state. All state is local to `RegisterModal`:
- `nombre`, `correo`, `rol` — controlled inputs
- `errors: FieldErrors` — per-field Zod validation messages
- `isLoading: boolean`
- `error: string` — backend error message
- `success: boolean` — controls success vs form view

## Error handling

| HTTP status | Backend scenario         | UI message                                               |
|-------------|--------------------------|----------------------------------------------------------|
| 400         | Validation failure       | Per-field from `errors.fieldErrors` (via `describeAuthError`) |
| 409         | Email already registered | "Este correo ya tiene una cuenta registrada."            |
| 409         | Email has pending request | "Ya tienes una solicitud en espera."                    |
| 429         | Cooldown active          | Backend `detail` field (e.g., "Debes esperar 4 días")   |
| Other       | Server error             | Generic message via `describeAuthError`                  |

`describeAuthError` in `features/auth/errors.ts` handles `ApiError` and Firebase errors
and maps them to user-readable Spanish strings.

## Edge cases

- **Empty state:** default role pre-selected as `DOCTOR`; form is not submitted until
  all fields pass Zod validation.
- **Loading state:** button shows spinner and disabled; text changes to "Enviando solicitud...".
- **Backdrop click:** closes the modal even mid-fill (no confirmation prompt).
- **Double-submit:** `isLoading` prevents concurrent submissions.

## Security

- No password field is ever shown, stored, or transmitted from the frontend.
- `auth: false` on `apiFetch` means no Firebase token is attached (endpoint is public).
- Inputs validated client-side (Zod) and server-side (Jakarta Validation + domain rules).

## Testing strategy

- Unit: `RegisterSchema` — valid/invalid cases, rol enum boundaries.
- Component: `RegisterModal` — submit with invalid data, success state, error states.
  *(deferred — no tests shipped in this iteration)*
- Manual QA: submit form → check two emails arrive (confirmation to applicant, request
  to admin); approve link → check approval email with reset link.

## Alternatives considered

- **Separate page at `/register`** — rejected; a modal keeps the user on the login page
  and avoids an extra route guard. The form is short (3 fields) and a page would feel
  disproportionate.
- **Password field with hashing on frontend** — rejected; the secure approach is to
  never involve a password until the user is approved and sets it themselves via Firebase.

## Open questions

- None outstanding.
