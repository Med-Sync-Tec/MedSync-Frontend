# Styling Conventions

Tailwind 4 with CSS-first design tokens.

## Tokens, not hex literals

All colors come from CSS custom properties defined in `src/index.css` under `@theme`:

```css
@theme {
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-surface: #ffffff;
  --color-text-primary: #1e293b;
  /* ... */
}

@layer base {
  .dark {
    --color-surface: #1e293b;
    --color-text-primary: #f1f5f9;
    /* ... */
  }
}
```

These generate utilities automatically: `bg-primary`, `bg-surface`, `text-text-primary`, `border-border-subtle`, etc.

### Forbidden

```tsx
// WRONG
<div className="bg-[#4f46e5] text-[#1d2451]">

// RIGHT
<div className="bg-primary text-text-primary">
```

A CI / lint check should reject any `[#...]` color in `*.tsx` outside Storybook stories.

## Adding a token

1. Add the variable under `@theme` in `src/index.css`.
2. Add the dark override under `.dark` in the same file.
3. Use a **semantic** name (`--color-caution`, not `--color-orange`).
4. Document the new token in the table in [`architecture/decisions/0005-tailwind-css-first-design-tokens.md`](../architecture/decisions/0005-tailwind-css-first-design-tokens.md).

## Available tokens

`primary`, `primary-hover`, `primary-subtle`,
`accent`, `accent-hover`,
`background`, `surface`, `surface-muted`,
`text-primary`, `text-muted`,
`border-subtle`,
`danger`, `danger-hover`,
`success`, `warning`.

## Dark mode

Implemented by redefining tokens under `.dark`, applied by `ThemeProvider` (writes the class on `<html>`).

**Do not** use `dark:` prefixes for color overrides:

```tsx
// WRONG
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">

// RIGHT
<div className="bg-surface text-text-primary">
```

`dark:` is acceptable for the rare case where the shape/layout differs between modes (a border that only shows in light mode, for example), but never for colors that have a semantic token.

## Spacing, sizing, typography

Use Tailwind's scale. Avoid arbitrary values (`p-[13px]`) unless there is no scale value within 4px and you can name the design reason.

| Concern | Tool |
|---|---|
| Spacing | `p-*`, `m-*`, `gap-*` |
| Sizing | `w-*`, `h-*`, `min-*`, `max-*` |
| Typography | `text-{size}`, `font-{weight}`, `leading-*`, `tracking-*` |
| Layout | `flex`, `grid`, `container` |

## Responsive

Mobile-first. Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Container queries

`@tailwindcss/container-queries` is installed. Use `@container` and `@xs:`, `@md:`, etc. for component-level responsiveness.

## Class composition

For long lists or conditional classes, group with template strings or a small helper:

```tsx
const classes = [
  'inline-flex items-center',
  isActive ? 'bg-primary text-white' : 'bg-surface text-text-primary',
  className,
].join(' ');
```

A `clsx`-style helper is fine to add when conditional class composition becomes common — flag in a PR.

## Custom CSS

Avoid. Use Tailwind utilities. If you must:

- Put the rule in `src/index.css` under `@layer components` or `@layer utilities`.
- Name the class with a `medsync-` prefix to avoid Tailwind collision.
- Justify in the commit message.

## Icons

Use `lucide-react`. Wrap in a thin component if the same icon-with-style is used in many places.

## Forms

`@tailwindcss/forms` is installed. Inputs get sensible defaults out of the box; rely on those instead of restyling from scratch.

## Animations and transitions

- Tailwind's `transition-*`, `duration-*`, `ease-*` for simple state transitions.
- For complex animations, prefer CSS keyframes over JS animation libraries unless interactivity demands it.
- Respect `prefers-reduced-motion`.
