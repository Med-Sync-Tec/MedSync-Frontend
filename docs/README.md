# MedSync Frontend Documentation

Spec-driven development documentation for the MedSync clinical frontend.

> **Translation status:** This documentation is written in English as the project's target language. The existing codebase (identifiers, comments, commit messages, UI strings) is still in Spanish and is being migrated. See [`conventions/i18n.md`](./conventions/i18n.md) for the migration plan.

## How to navigate

| If you want to... | Go to |
|---|---|
| Understand non-negotiable project principles | [`constitution.md`](./constitution.md) |
| Understand the system at a high level | [`architecture/overview.md`](./architecture/overview.md) |
| Look up a coding convention | [`conventions/`](./conventions/) |
| Start a new feature with a spec | [`specs/_template/`](./specs/_template/) — copy into `specs/<feature-slug>/` |
| Use a vetted prompt template | [`prompts/templates/`](./prompts/templates/) |
| See why a technical decision was made | [`architecture/decisions/`](./architecture/decisions/) |

## Spec-driven development workflow

For any non-trivial feature or refactor:

1. **Copy** `docs/specs/_template/` to `docs/specs/<feature-slug>/`
2. **Fill in** `requirements.md` (what + why, acceptance criteria)
3. **Fill in** `design.md` (how — components, API, state, edge cases)
4. **Break down** `tasks.md` into atomic, executable items
5. **Implement** following the spec; update the spec if reality diverges
6. **Close out** with `summary.md` once shipped (decisions, deviations, follow-ups)

## Source of truth

- **Runtime code:** `src/`
- **Stack and current patterns:** [`Claude.md`](../Claude.md) (Spanish — to be migrated)
- **AI agent rules:** [`AGENT_INSTRUCTIONS.md`](../AGENT_INSTRUCTIONS.md) (Spanish — to be migrated)
- **This folder:** target conventions, specs, and decisions going forward

When `Claude.md` and `docs/` disagree, `docs/` is the intent; `Claude.md` is the legacy snapshot until migrated.
