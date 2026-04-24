# MedSync Frontend — Guía técnica

Referencia del proyecto para cualquier persona (o agente) que trabaje sobre este repo. Si vas a escribir o modificar código, lee este archivo completo antes.

---

## Contexto

MedSync es una aplicación clínica (proyecto del TEC de Monterrey — EQ3005B) para manejo de historial de pacientes, consultas y notas SOAP. El frontend consume un backend Quarkus que valida tokens de Firebase Auth.

**Stack:**
- React 19 + TypeScript (strict) + Vite 8
- Tailwind 4 (CSS-first con `@theme`)
- React Router 7 (data router API)
- Firebase Auth (login) + backend Quarkus (`/api/*`)
- Zod (schemas runtime + tipos inferidos)
- Zustand (estado cliente: auth)
- Storybook 10 (design system)

---

## Comandos

```bash
pnpm dev         # Servidor de desarrollo
pnpm build       # tsc + vite build (ambos deben pasar)
pnpm lint        # ESLint (debe quedar limpio antes de commit)
pnpm storybook   # Design system en http://localhost:6006
```

**Variables de entorno:** copiar `.env.example` a `.env.local` y llenar los 4 valores de Firebase + `VITE_API_BASE_URL`. Si falta alguna, `src/config/env.ts` tira un error al arranque indicando qué falta.

---

## Estructura de carpetas

```
src/
  components/ui/         # Design system puro (átomos/moléculas reutilizables)
    {avatars,badges,buttons,cards,feedback,inputs,navigation,selectors}/
    */index.ts           # Barrel export por categoría
    index.ts             # Barrel raíz (@ui)
  features/              # Bounded contexts del dominio
    auth/                # Login, store, API de auth, schemas
    consultations/       # Páginas de historial y SOAP
    patients/            # Tipos y schemas del paciente
  layouts/               # AuthLayout, DoctorLayout, ErrorBoundary
  lib/                   # Infraestructura compartida
    firebase/client.ts   # Init de Firebase Auth
    http/client.ts       # apiFetch<T> wrapper
    http/errors.ts       # ApiError + BackendErrorSchema
    theme/               # ThemeProvider + useTheme
  mocks/                 # Data de ejemplo (validada con .parse)
  routes/                # Definición de rutas + guards
  config/env.ts          # Validación de env con Zod
```

**Regla clave:** un `feature/` puede importar de `@ui`, `@lib`, `@mocks`. Un componente `ui/` **no debe** importar de `@features` salvo tipos de dominio (ver excepción en `ConsultationCard`, `SOAPModal`).

---

## Path aliases

Definidos en `tsconfig.app.json` y `vite.config.ts`:

| Alias | Ruta |
|-------|------|
| `@/*` | `src/*` |
| `@ui/*` | `src/components/ui/*` |
| `@features/*` | `src/features/*` |
| `@layouts/*` | `src/layouts/*` |
| `@lib/*` | `src/lib/*` |
| `@mocks/*` | `src/mocks/*` |
| `@config/*` | `src/config/*` |
| `@routes/*` | `src/routes/*` |
| `@types/*` | `src/types/*` |

Nunca uses `../../../` en imports — siempre alias.

---

## Design tokens (Tailwind 4)

Todos los colores viven en `src/index.css` bajo `@theme`. Los overrides para dark mode se hacen redefiniendo las mismas variables bajo `.dark`:

```css
@theme {
  --color-primary: #4f46e5;
  --color-surface: #ffffff;
  /* ... */
}
@layer base {
  .dark { --color-surface: #1e293b; }
}
```

Eso genera utilidades automáticas: `bg-primary`, `bg-surface`, `text-danger`, etc. **No escribas hex literales en componentes** (`bg-[#4f46e5]` está prohibido). Agrega un token nuevo en `index.css` si necesitas un color.

**Tokens disponibles:** `primary`, `primary-hover`, `primary-subtle`, `accent`, `accent-hover`, `background`, `surface`, `surface-muted`, `text-primary`, `text-muted`, `border-subtle`, `danger`, `danger-hover`, `success`, `warning`.

---

## Theming

`src/lib/theme/ThemeProvider.tsx` aplica la clase `dark` en `<html>` y persiste en `localStorage` (key `medsync-theme`). Envuelve la app en `App.tsx`. Para togglear desde cualquier componente:

```tsx
import { useTheme } from '@lib/theme';
const { theme, toggle } = useTheme();
```

---

## Autenticación

Firebase Auth para credenciales + backend Quarkus para el perfil y role.

**Flujo:**
1. `LoginForm` valida con `LoginCredentialsSchema.safeParse()` (Zod)
2. `signInWithEmail()` (en `features/auth/api.ts`) hace:
   - `signInWithEmailAndPassword(auth, email, password)` (Firebase)
   - `fetchMe()` → `GET /api/users/me` con el JWT Firebase
   - Mapea `{nombre, correo}` del backend a `{name, email}` del frontend
3. `useAuthStore.login(user)` guarda la sesión (persist en localStorage)
4. `RequireAuth` (en `src/routes/RequireAuth.tsx`) protege rutas privadas
5. `RedirectIfAuth` evita que usuarios logueados vean `/`

**Store:** `useAuthStore` con selectores granulares: `const logout = useAuthStore(s => s.logout)`.

**Role enum:** `'DOCTOR' | 'COO' | 'CMO'` (uppercase, matchea el backend Java).

---

## Cliente HTTP

`apiFetch<T>(path, options)` en `src/lib/http/client.ts`:

```tsx
const consultations = await apiFetch<Consultation[]>(`/api/patients/${id}/consultations`);
```

- Añade `Authorization: Bearer <firebase-id-token>` automáticamente (default `auth: true`)
- Serializa/deserializa JSON
- Base URL desde `env.VITE_API_BASE_URL`
- En error HTTP, parsea el body con `BackendErrorSchema` y lanza `ApiError`

**Manejo de errores:**
```tsx
try {
  const data = await apiFetch<T>('/api/...');
} catch (err) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized) { /* 401 */ }
    if (err.isValidation) { /* 400 con err.fieldErrors */ }
  }
}
```

---

## Schemas y tipos (Zod)

**Fuente única de verdad:** los tipos de dominio se infieren de schemas Zod.

```ts
// features/consultations/schemas.ts
export const ConsultationSchema = z.object({ /* ... */ });
export type Consultation = z.infer<typeof ConsultationSchema>;
```

`features/*/types.ts` re-exporta los tipos inferidos (back-compat con imports antiguos).

**Reglas:**
- Cualquier dato que cruce un boundary (backend, mock file, localStorage, form input) **debe** pasar por `.parse()` o `.safeParse()` antes de usarse
- Los mocks en `src/mocks/` se parsean al importar — si rompes la data, la app no arranca
- No uses `as` para forzar tipos; escribe un schema y parsea

---

## Routing

Definido en `src/routes/index.tsx` como `RouteObject[]`. `App.tsx` lo consume con `useRoutes`.

- `AuthLayout` envuelve rutas públicas (`/`) con `ErrorBoundary` + `Suspense`
- `DoctorLayout` envuelve rutas privadas + `Header` + `useLocation` para derivar el `activeLink`
- `RequireAuth` y `RedirectIfAuth` son guards de composición — wrap el `element` o el child

Navegación **siempre** con `useNavigate()` o `<Navigate>` — nunca `window.location.href`.

---

## Componentes UI

- Todos los inputs/buttons aceptan `ref` vía `forwardRef` (listos para React Hook Form cuando se integre)
- Variantes tipadas con `Record<Variant, string>` extraídas fuera del componente (ver `Button.tsx`)
- `className` del padre se concatena al final para permitir overrides
- Stories en `*.stories.tsx` al lado del componente
- Barrel exports por categoría

**Patrón:**
```tsx
export const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(function MyButton(
  { variant = 'primary', className = '', ...props }, ref
) {
  return <button ref={ref} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
});
```

---

## Cómo extender

**Nueva página privada:**
1. Créala en `features/<domain>/pages/MyPage.tsx`
2. Registra la ruta en `src/routes/index.tsx` dentro del children del bloque con `RequireAuth + DoctorLayout`
3. Usa `useNavigate()` para cualquier navegación interna

**Nuevo endpoint backend:**
1. Define el schema de respuesta en `features/<domain>/schemas.ts`
2. Crea una función en `features/<domain>/api.ts` que use `apiFetch<T>` + `.parse()`
3. Nunca llames `fetch` directamente; siempre `apiFetch`

**Nueva entidad de dominio:**
1. `features/<domain>/schemas.ts` con schemas Zod
2. `features/<domain>/types.ts` re-exporta los tipos inferidos
3. Si necesita estado global, `features/<domain>/store.ts` con Zustand + persist si aplica
4. Si es solo server state, considera TanStack Query (no integrado aún)

**Nuevo componente UI:**
1. Archivo en `components/ui/<categoria>/MyComponent.tsx` con `forwardRef`
2. Story en `MyComponent.stories.tsx`
3. Export en `components/ui/<categoria>/index.ts`

---

## Anti-patrones (qué NO hacer)

- Hex literales en className (`bg-[#4f46e5]`, `text-[#1d2451]`) — usa tokens
- `window.location.href = '...'` — usa `useNavigate()`
- `err: any` — usa `err: unknown` + type guard (`err instanceof Error`)
- `as SomeType` para forzar tipos — parsea con Zod
- `fetch('/api/...')` directo — usa `apiFetch`
- Mutar estado (`user.name = 'x'`) — siempre spread inmutable
- Credenciales hardcodeadas
- `console.log` en código de producción (hay ESLint warning)
- Imports con `../../../` — usa path aliases

---

## TypeScript

Config estricta (`strict: true` + `noImplicitAny` + `strictNullChecks` + `verbatimModuleSyntax` + `erasableSyntaxOnly`).

- `import type { X }` obligatorio para imports de solo tipo
- No hay enums ni namespaces (prohibidos por `erasableSyntaxOnly`)
- Usa `as const` para literales inmutables
- Discriminated unions para estados con varias formas

---

## Convenciones

- Carpetas en `kebab-case` o `camelCase` para features/layouts, `kebab-case` para rutas URL
- Archivos de componentes en `PascalCase.tsx`
- Hooks en `useCamelCase.ts`
- Strings de UI siempre en español
- Fechas ISO 8601 en backend y mocks; formateo solo en la capa de UI
