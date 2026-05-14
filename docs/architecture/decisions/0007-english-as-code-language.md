# 0007 — English as the code language

- **Status:** Accepted
- **Date:** 2026-05-12
- **Deciders:** Frontend team

## Context

The existing codebase is written in Spanish: identifiers, file names, comments, commit messages, UI strings, and route segments. This causes friction:

- Industry libraries, AI agents, and documentation assume English identifiers; mixing Spanish names breaks autocomplete and linting heuristics.
- Onboarding non-Spanish-speaking contributors is harder.
- Backend field names (also Spanish: `nombre`, `correo`) leak into frontend types when not mapped at the boundary.
- UI strings cannot be localized as long as they are hardcoded.

## Decision

Going forward:

1. **All code is in English.** Identifiers, file names, folder names, route segments, comments, commit messages, and branch names.
2. **UI strings are externalized** into an i18n catalog (`es.json`, `en.json`). The source key is the English term. Default user-facing locale stays Spanish.
3. **Backend Spanish field names are mapped to English** at the schema boundary via `.transform()`.
4. **Existing code is migrated in waves**, not in a single mass rename. See [`conventions/i18n.md`](../../conventions/i18n.md) for the migration plan.

## Consequences

- New code is unambiguously in English.
- During the migration period, both languages coexist — `conventions/i18n.md` lists the migration order and exceptions.
- URL changes (route segments) require coordinated updates to all `<Link>` and `useNavigate(...)` callers, plus any documentation or bookmarks.
- UI strings move through a single i18n catalog, which adds a small layer between component and text but unlocks future localization.
- Commit history becomes mixed-language during migration; this is acceptable.

## Alternatives considered

- **Stay in Spanish:** rejected — friction with tooling, libraries, and AI agents outweighs the comfort of native-language code.
- **Big-bang rename:** rejected — too risky, blocks all other work until done.
- **Bilingual identifiers:** rejected — worse than either monolingual option.
