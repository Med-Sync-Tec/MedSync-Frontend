# Prompts

Templates and a library of vetted prompts for working with AI agents on this codebase.

## Folder layout

- **`templates/`** — blank, reusable scaffolds. Fill in the placeholders for your task.
- **`library/`** — prompts that worked well and are worth reusing. Add yours after a successful run.

## How to use a template

1. Copy the template content (do not edit the file).
2. Replace every `<…>` placeholder.
3. Paste into your agent of choice (Claude Code, Cursor, etc.).

## How to contribute to the library

After a prompt produces a good result:

1. Sanitize: remove project-specific data that's already in this repo (the agent will see it anyway).
2. Save the prompt as `library/<topic-slug>.md`.
3. Add a one-line description at the top.
4. Note which agent / model the prompt was tested with.

## Standard front-matter for library prompts

```markdown
# <Title>

- **Use case:** <one-line description>
- **Tested with:** <agent + model>
- **Last verified:** <YYYY-MM-DD>

---

<the prompt>
```
