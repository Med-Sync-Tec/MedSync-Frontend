# Naming Conventions

All naming is in English. See [`i18n.md`](./i18n.md) for the migration plan.

## Files and folders

| Kind | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx` | `LoginForm.tsx`, `PatientCard.tsx` |
| Storybook file | `<Component>.stories.tsx` | `LoginForm.stories.tsx` |
| Hook file | `useCamelCase.ts` | `useDebounce.ts`, `useTheme.ts` |
| Utility file | `camelCase.ts` or `kebab-case.ts` | `formatDate.ts`, `parse-query.ts` |
| Schema file | `schemas.ts` (per feature) | `features/auth/schemas.ts` |
| Type re-export file | `types.ts` | `features/auth/types.ts` |
| Store file | `store.ts` (per domain) | `features/auth/store.ts` |
| API client file | `api.ts` (per feature) | `features/auth/api.ts` |
| Query hooks file | `queries.ts` (per feature) | `features/patients/queries.ts` |
| Barrel | `index.ts` | category and feature roots |
| Folder | `kebab-case` or `camelCase` | `features/patients/`, `components/ui/` |
| Route URL segment | `kebab-case` | `/doctor/saved-news` |
| Route param | `:camelCase` | `:patientId` |

## Identifiers

| Kind | Convention | Example |
|---|---|---|
| Variable | `camelCase` | `currentUser`, `isLoading` |
| Constant (module-scope, true constant) | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_LOCALE` |
| Function | `camelCase`, verb-first | `formatDate`, `parsePatient` |
| React component | `PascalCase` | `LoginForm`, `PatientCard` |
| Hook | `useCamelCase` | `useDebounce`, `usePatient` |
| Type / interface | `PascalCase` | `User`, `ApiResponse<T>` |
| Generic type param | single uppercase letter, or `PascalCase` | `T`, `TData`, `Item` |
| Zod schema | `<Name>Schema` (PascalCase) | `UserSchema`, `ConsultationSchema` |
| Inferred type from schema | bare name | `type User = z.infer<typeof UserSchema>` |
| Event handler prop | `onPascalCase` | `onSubmit`, `onPatientSelect` |
| Event handler implementation | `handlePascalCase` | `handleSubmit`, `handlePatientClick` |
| Boolean | `is/has/can/should + Subject` | `isOpen`, `hasError`, `canEdit` |

## Acronyms

Treat acronyms as words: `parseApiResponse` not `parseAPIResponse`, `SoapNote` not `SOAPNote`. Exception: file names where the acronym is universally uppercase (`SOAPModal.tsx`) — preserve the existing convention but do not extend it to new code.

## Verbs for functions

| Prefix | Use |
|---|---|
| `get` | Synchronous read, pure |
| `fetch` | Network read |
| `load` | Async read that might cache |
| `create` | New entity |
| `update` | Modify existing |
| `delete` / `remove` | Destroy / unlink |
| `parse` | Validate + cast from unknown |
| `format` | Convert to display string |
| `is` / `has` / `can` | Boolean predicate |
| `to` | Conversion (`toIso`, `toMinor`) |

## Negative names

Avoid double negation. `isDisabled` is fine; `isNotEnabled` is not.

## Don't

- `data1`, `data2`, `tmp`, `foo` — pick a meaningful name even in short scopes.
- Single-letter names except: loop counters (`i`), generic params (`T`), short FP helpers (`x => ...`).
- Hungarian notation: `strName`, `bIsOpen`, `arrItems`.
- Abbreviations beyond well-known ones (`id`, `url`, `api`, `db`, `req`, `res`).
