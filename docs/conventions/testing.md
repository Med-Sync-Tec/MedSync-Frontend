# Testing Conventions

Testing is currently underdeveloped in this codebase. This file describes the target state.

## Current state

- No unit test runner is configured. **TODO:** add Vitest.
- No E2E runner is configured. **TODO:** add Playwright.
- Storybook provides visual contract checks for `components/ui/` but is not enforced in CI.

## Target stack

| Concern | Tool |
|---|---|
| Unit + integration | Vitest + React Testing Library |
| E2E | Playwright |
| Visual / component contract | Storybook + `@storybook/addon-a11y` |
| Coverage | Vitest's V8 coverage |

## Coverage target

80% lines for new code. Existing untested code is grandfathered; do not block PRs for legacy coverage.

## TDD workflow

For new features and bug fixes:

1. **RED** — write a failing test that captures the expectation.
2. **GREEN** — write the minimum implementation that passes.
3. **REFACTOR** — improve internals; tests stay green.

For exploratory or visual work, tests can come after the first iteration — but no PR ships without tests for the merged behavior.

## Test placement

```
src/features/auth/
  api.ts
  api.test.ts          ← unit test, same folder
  components/
    LoginForm.tsx
    LoginForm.test.tsx ← test next to component
```

Co-locate. No separate `__tests__/` folder.

File naming: `<unit>.test.ts(x)`. The matching Storybook file uses `.stories.tsx`, not `.test.tsx`.

## What to test

| Layer | Test scope |
|---|---|
| Pure utilities (`lib/`, `utils.ts`) | Unit — input/output, edge cases |
| Zod schemas | Unit — valid passes, invalid throws, transforms produce expected shape |
| `apiFetch` and `api.ts` clients | Integration — mock `fetch`, assert URL, headers, parsed response |
| Zustand stores | Integration — actions update state correctly, persistence |
| TanStack Query hooks | Integration — wrap in `QueryClientProvider`, assert lifecycle |
| Components in `ui/` | Story-driven; add RTL test for interactive behavior |
| Components in `features/<domain>/components/` | RTL — render, interact, assert |
| Pages | RTL with router + query provider — happy path |
| Critical user flows (login, create SOAP, view history) | Playwright E2E |

## What not to test

- Things TypeScript already guarantees (a function accepts the typed input).
- Implementation details (private internal state, class instance shape).
- Library code (don't test that React renders).

## React Testing Library

- Query by role, label, or text the user sees — not by `data-testid` unless there's no alternative.
- Prefer `userEvent` over `fireEvent`.
- One assertion focus per test; multiple `expect` calls are fine.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits the login form with valid credentials', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  await userEvent.type(screen.getByLabelText(/email/i), 'doc@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'hunter2');
  await userEvent.click(screen.getByRole('button', { name: /log in/i }));
  expect(onSubmit).toHaveBeenCalledWith({ email: 'doc@example.com', password: 'hunter2' });
});
```

## Mocking

- **HTTP:** mock `fetch` with `vi.spyOn(globalThis, 'fetch')` or use MSW (Mock Service Worker) for higher fidelity.
- **Firebase:** mock `signInWithEmailAndPassword` at module level for unit tests; use a Firebase emulator for integration if it becomes valuable.
- **Don't mock the database in integration tests.** When a real backend interaction is involved, prefer MSW or a local emulator over deep mocks.

## Playwright

- Tests live in `e2e/`.
- Page object model: one `*.page.ts` per page with selectors and actions.
- Critical flows: login, list patients, view consultation history, create SOAP note.
- Capture screenshots and traces on failure (Playwright default).
- Quarantine flaky tests with `test.fixme`; never delete a flaky test silently.

## Open ADRs

- `0008-testing-stack.md` — confirm Vitest + RTL + Playwright (not yet written).
