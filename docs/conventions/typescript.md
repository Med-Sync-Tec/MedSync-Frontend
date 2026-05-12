# TypeScript Conventions

Strict mode is non-negotiable (see [`../constitution.md`](../constitution.md)).

## Type-only imports

```ts
import type { Patient } from '@features/patients/types';
import { PatientSchema } from '@features/patients/schemas';
```

`verbatimModuleSyntax` is on — type imports must be explicit. Mixed imports must split.

## Never `any`. Rarely `as`.

```ts
// WRONG
function handle(err: any) { ... }

// RIGHT
function handle(err: unknown) {
  if (err instanceof Error) { ... }
  if (err instanceof ApiError) { ... }
}
```

For runtime data crossing a boundary, parse with Zod instead of casting:

```ts
// WRONG
const user = JSON.parse(raw) as User;

// RIGHT
const user = UserSchema.parse(JSON.parse(raw));
```

`as` is allowed in narrow cases: `as const` for literal narrowing, `as unknown as T` when interoperating with a library whose types are wrong (document the why).

## No `enum`, no `namespace`

Blocked by `erasableSyntaxOnly`. Use literal unions:

```ts
export type Role = 'DOCTOR' | 'COO' | 'CMO';
export const ROLES = ['DOCTOR', 'COO', 'CMO'] as const;
```

For an enum-like object, use `as const`:

```ts
export const Status = {
  Idle: 'idle',
  Loading: 'loading',
  Error: 'error',
} as const;
export type Status = typeof Status[keyof typeof Status];
```

## Discriminated unions

Prefer discriminated unions over boolean flags or optional fields for state with multiple shapes:

```ts
// WRONG
type State = { isLoading: boolean; data?: User; error?: string };

// RIGHT
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };
```

## Inference over annotation

Annotate at boundaries (function signatures, exports, props). Let inference handle locals.

```ts
// WRONG — redundant
const count: number = 0;

// RIGHT
const count = 0;
```

```ts
// WRONG — implicit return
export function load(id: string) { return fetch(...); }

// RIGHT — explicit return on exports
export function load(id: string): Promise<Patient> { return fetchPatient(id); }
```

## Schema-first types

Domain types are inferred from Zod schemas. Do not write the interface twice.

```ts
export const PatientSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Patient = z.infer<typeof PatientSchema>;
```

## Immutability in types

Prefer `readonly` for array/object fields that should not mutate:

```ts
interface Props {
  readonly items: readonly Patient[];
  readonly onSelect: (id: string) => void;
}
```

## Function signatures

- Keep parameter lists short (≤3). Beyond that, pass an object.
- Required params first, optional last.
- Avoid boolean parameters; use named options:
  ```ts
  // WRONG
  load(id, true);
  // RIGHT
  load(id, { includeArchived: true });
  ```

## Generics

Name generic params meaningfully when there's more than one:

```ts
function apiFetch<TData>(path: string): Promise<TData>;
function pick<TObject, TKey extends keyof TObject>(obj: TObject, key: TKey): TObject[TKey];
```

## Null vs undefined

- `undefined` for "not yet computed" / "absent property".
- `null` for "explicitly empty" / values coming from JSON.
- Don't mix in the same field.

## Error handling

- Throw `Error` subclasses, not strings.
- `ApiError` for HTTP failures; create a subclass per domain if useful.
- Always type the catch as `unknown` and narrow.

## Comments and JSDoc

Default to none. Add a comment only when the WHY is non-obvious. Never write a comment that paraphrases the code.

```ts
// WRONG
// Increment the counter
counter++;

// RIGHT — explains why, not what
// Firebase token TTL is 1h; refresh 5 minutes early to avoid 401s mid-request.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
```
