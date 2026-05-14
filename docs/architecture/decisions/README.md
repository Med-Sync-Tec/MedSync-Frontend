# Architecture Decision Records

Short documents that capture a decision, the context that drove it, and the consequences. One file per decision. Filename format: `NNNN-kebab-case-title.md`.

## Why ADRs

Six months from now, "why did we pick Zustand instead of Redux?" needs a one-paragraph answer that does not depend on the original author being available. ADRs are that answer.

## Template

```markdown
# NNNN — Title

- **Status:** Proposed | Accepted | Superseded by NNNN | Deprecated
- **Date:** YYYY-MM-DD
- **Deciders:** names or roles

## Context

What problem are we solving? What constraints exist?

## Decision

What did we decide? Be specific.

## Consequences

What becomes easier? What becomes harder? What did we trade away?

## Alternatives considered

Brief — one or two lines per alternative and why it was rejected.
```

## Index

- [`0001-use-vite-as-bundler.md`](./0001-use-vite-as-bundler.md)
- [`0002-tanstack-query-for-server-state.md`](./0002-tanstack-query-for-server-state.md)
- [`0003-zustand-for-client-state.md`](./0003-zustand-for-client-state.md)
- [`0004-zod-as-source-of-truth-for-types.md`](./0004-zod-as-source-of-truth-for-types.md)
- [`0005-tailwind-css-first-design-tokens.md`](./0005-tailwind-css-first-design-tokens.md)
- [`0006-firebase-auth-with-quarkus-backend.md`](./0006-firebase-auth-with-quarkus-backend.md)
- [`0007-english-as-code-language.md`](./0007-english-as-code-language.md)
