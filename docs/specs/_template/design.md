# <Feature Name> — Design

- **Spec slug:** `<feature-slug>`
- **Status:** Draft | In review | Approved
- **Last updated:** YYYY-MM-DD

> Reference: `requirements.md` in this folder.

## Approach summary

One paragraph describing the chosen technical approach at a high level. If multiple approaches were considered, list alternatives at the bottom.

## User flow

Step-by-step, from the user's point of view. Diagrams or wireframes welcome.

```
1. User clicks "X" on the dashboard.
2. Modal opens with form fields A, B, C.
3. User submits.
4. ...
```

## UI

- Pages touched / created: <list>
- New components: <list, where they live>
- Modified components: <list>
- Storybook stories: <list>

Sketches, Figma links, or ASCII mockups go here.

## Data

### Backend endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/api/…` | … | required |
| POST | `/api/…` | … | required |

### Request / response shapes

```ts
// features/<domain>/schemas.ts
export const FooSchema = z.object({ /* … */ });
```

### State

- Server state: `<query key>` in `features/<domain>/queries.ts`.
- Client state: <store or local>.
- Mutations: invalidates `<query keys>`.

## Routing

New routes, if any:

| Path | Page | Guard | Layout |
|---|---|---|---|
| `/…` | `<Name>Page` | RequireAuth | DoctorLayout |

## Error handling

- Validation errors (400): <how surfaced>
- Unauthorized (401): <handled by guard>
- Server (500): <fallback UI>
- Network: <retry / message>

## Edge cases

- Empty state: <what shows>
- Loading state: <spinner / skeleton>
- Slow network: <behavior beyond 3s>
- Permission denied: <UX>
- Concurrent edits: <strategy>

## Accessibility

- Keyboard flow: <tab order, shortcuts>
- Screen reader: <labels, announcements>
- Focus management: <where focus lands on modal open, after submit>

## Performance

- Largest expected payload: <size>
- Caching strategy: <stale time, refetch on focus>
- Lazy loading: <which routes/components>

## Security

- Inputs validated: <list>
- Sensitive data displayed: <list>
- PHI considerations: <if any>

## Testing strategy

- Unit: <what>
- Integration: <what>
- E2E (Playwright): <which flow>
- Manual QA: <what to click through>

## Telemetry

- Events emitted: <list>
- Errors logged: <where>

## Rollout

- Feature flag: <name, default>
- Migration steps: <if data shape changes>
- Rollback plan: <how to revert>

## Alternatives considered

- **Alternative A:** <description> — rejected because <reason>.
- **Alternative B:** <description> — rejected because <reason>.

## Open questions

- [ ] <Question> — owner: <name>

---

> Once approved, move to `tasks.md`.
