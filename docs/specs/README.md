# Specs

One folder per feature. Copy `_template/` into `<feature-slug>/` and fill in.

## Workflow

```
1. Copy _template/        cp -r docs/specs/_template docs/specs/<feature-slug>
2. requirements.md        What and why. Get stakeholder buy-in.
3. design.md              How. Get technical buy-in.
4. tasks.md               Break into atomic items. Execute.
5. Implement              Update spec if reality diverges.
6. summary.md             Close out: decisions made, deviations, follow-ups.
```

## Spec slug naming

English, kebab-case, action-oriented when possible:

- `patient-search`
- `soap-note-attachments`
- `dashboard-redesign`
- `migrate-to-i18n-catalog`

## When to use a spec

- New feature.
- Refactor across more than two files.
- Any change that introduces a new pattern, library, or convention.
- Any change to the auth flow, routing tree, or persistence layer.

**Not needed for:**

- Single-file bug fixes.
- Documentation-only changes.
- Dependency bumps with no API change.
- Typography or color tweaks.

## Living documents

Specs are not write-once. When the design changes mid-implementation:

1. Update the relevant section.
2. Note the change in `summary.md` under "Deviations from initial design".
3. Continue.

A spec that doesn't match the final code is worse than no spec.
