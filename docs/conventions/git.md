# Git Conventions

## Branches

| Branch | Role |
|---|---|
| `main` | Release branch. Only updated via PR from `dev`. Protected. |
| `dev` | Integration branch. Default branch for new work. |
| `feature/<slug>` | New feature. Branches from `dev`. |
| `fix/<slug>` | Bug fix. Branches from `dev`. |
| `refactor/<slug>` | Refactor. Branches from `dev`. |
| `docs/<slug>` | Docs-only change. Branches from `dev`. |
| `chore/<slug>` | Tooling, deps, config. Branches from `dev`. |

Slugs are English, kebab-case: `feature/patient-search`, `fix/login-redirect-loop`.

## Commit message format

```
<type>: <short description in imperative mood, English, <72 chars>

<optional body — what changed and why, wrap at 72 chars>

<optional footer — refs, breaking changes>
```

### Types

`feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `style`.

### Examples

```
feat: add patient search by name

Adds a debounced search input to PatientsListPage. Query is sent to
GET /api/patients?name=… and results are cached for 30s.

Refs EQ3005B-142
```

```
refactor: extract apiFetch error handling into ApiError class
```

```
fix: prevent login redirect loop when token refresh fails
```

### Rules

- Imperative mood: "add", not "added" or "adds".
- English. (Existing Spanish commits are not rewritten; new commits are English.)
- Lowercase after the type.
- No trailing period in the subject.
- Body explains why, not what. Skip if obvious.
- **No `Co-Authored-By` lines.** AI agent attribution is disabled per project convention.
- Reference issue or ticket in the body or footer if applicable (`Refs EQ3005B-NNN`).

## Pull requests

1. Branch from `dev`.
2. Keep PRs scoped — one logical change. If you find yourself writing "and also" in the description, split.
3. Title follows commit format: `feat: add patient search`.
4. Description includes:
   - **Summary:** what changed and why (2–4 lines).
   - **Test plan:** how to verify (bullet list).
   - **Screenshots/recordings** for UI changes.
   - **Spec link** if this implements a spec (`docs/specs/<slug>/`).
5. CI must be green before merge.
6. Squash merge into `dev`.
7. `dev` → `main` PRs are batched releases, reviewed separately.

## Pre-commit checks

Required green before pushing:

```bash
pnpm build     # tsc -b && vite build
pnpm lint      # 0 errors, 0 warnings
```

Manual checks (until automated):

```bash
grep -rE '#[0-9a-fA-F]{6}' src --include='*.tsx' --include='*.ts'   # should be empty outside stories
grep -rn 'console\.log' src --include='*.tsx' --include='*.ts'      # should be empty
grep -rn ': any' src --include='*.tsx' --include='*.ts'             # should be empty
```

## What requires explicit user confirmation

Never do these without asking, even if it seems obvious:

- `git push --force` to any branch
- `git push --force-with-lease` to `main` or `dev`
- `git reset --hard` on a branch with un-pushed commits
- Deleting branches you did not create in the current session
- Amending commits that are already pushed
- Merging directly into `main`
- Adding heavyweight dependencies (>100KB gzip)
- Changes to `tsconfig*.json`, `eslint.config.js`, `vite.config.ts`
- Breaking the public surface of `components/ui/` or `features/<domain>/api.ts`
- Changes to `.env.example` or new required env vars

## Secrets

- Never commit `.env.local`, `.env.development`, or any file with real credentials.
- `.env.example` lists required variable names with placeholder values.
- If a secret is leaked, rotate immediately and open an incident note.
