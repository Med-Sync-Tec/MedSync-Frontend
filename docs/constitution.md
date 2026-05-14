# Project Constitution

Non-negotiable principles for the MedSync Frontend. These rules override convenience, speed, and personal preference. Changing one requires a written decision in [`architecture/decisions/`](./architecture/decisions/).

## 1. Language

- **All code is written in English.** Identifiers, file names, folder names, commit messages, branch names, comments, and documentation.
- **UI strings are externalized.** User-facing text lives in an i18n catalog (`es.json`, `en.json`), not hardcoded in components. Default UI locale is Spanish; the source key is the English term.
- See [`conventions/i18n.md`](./conventions/i18n.md) for migration of the existing Spanish code.

## 2. Type safety

- TypeScript runs in `strict` mode. No relaxing flags without an ADR.
- No `any`. Use `unknown` and narrow with type guards or Zod.
- No `as Type` casts to bypass the type system. If runtime data crosses a boundary, parse it with Zod.
- No `enum` and no `namespace` (blocked by `erasableSyntaxOnly`).

## 3. Boundaries are validated

Any data crossing a system boundary is validated with Zod before being used:

- HTTP responses from the backend
- Form input
- `localStorage` and `sessionStorage` reads
- Mock files (`src/mocks/`)
- URL params and query strings (when they drive logic)

## 4. Immutability

Never mutate. Always return a new object. This applies to props, state, store data, and function arguments.

## 5. No hardcoded secrets

Secrets come from environment variables validated at startup (`src/config/env.ts`). Hardcoded API keys, tokens, or credentials — even in mocks — are a release blocker.

## 6. Design tokens, no hex literals

Colors come from CSS custom properties defined in `src/index.css` under `@theme`. `bg-[#xxx]` and `text-[#xxx]` are forbidden in components. Dark mode is implemented by redefining tokens under `.dark`, not by sprinkling `dark:` color prefixes.

## 7. One way to do common things

- HTTP: `apiFetch<T>` from `@lib/http/client`. Never raw `fetch`.
- Navigation: `useNavigate()`, `<Navigate>`, `<Link>`. Never `window.location.href`.
- Server state: TanStack Query.
- Client state: Zustand, with granular selectors.
- Schemas: Zod, with types inferred from schemas (not duplicated).

## 8. File organization

- Many small files over few large files.
- 200–400 lines typical, 800 hard ceiling.
- Business logic lives in `src/features/<domain>/`. Not in `components/ui/`. Not loose in `src/`.
- `components/ui/` does not import from `@features/*` (domain types are the only allowed exception, and they should be moved out over time).

## 9. Tests at boundaries

- Unit tests for pure logic and utilities.
- Integration tests for API clients and stores.
- E2E (Playwright) for critical user flows.
- Coverage target: 80%+ for new code. Existing untested code is grandfathered but not encouraged.

## 10. Spec before code

Non-trivial work starts with a spec in `docs/specs/<feature-slug>/`. The spec is updated as understanding evolves; it is not a one-shot artifact.

## 11. No silent failures

Errors are handled explicitly at every level. UI-facing errors are user-friendly. Server-side errors are logged with context. Never swallow.

## 12. Reversible by default

Destructive git operations (`push --force`, `reset --hard`, branch deletion, amending pushed commits) require explicit user confirmation, every time. There is no implicit authorization.
