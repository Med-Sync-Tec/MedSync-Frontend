# Component Conventions

Patterns for React components in this codebase.

## Anatomy

```tsx
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const BASE = 'inline-flex items-center justify-center font-medium';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-text-primary border border-border-subtle',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-muted',
};

export const MyButton = forwardRef<HTMLButtonElement, MyButtonProps>(
  function MyButton({ variant = 'primary', className = '', ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={`${BASE} ${VARIANTS[variant]} ${className}`}
        {...rest}
      />
    );
  },
);
```

## Rules

1. **`forwardRef`** for any component that wraps a DOM element, so React Hook Form and focus management work.
2. **Variants are constants** extracted outside the function — no runtime allocation per render.
3. **`className` prop is concatenated last** so the parent can override.
4. **Spread the rest** so HTML attributes pass through.
5. **No inline styles** for color, spacing, or typography — use tokens.
6. **One component per file** for components exported from the file. Subcomponents used only locally can live in the same file.

## Props

- `interface`, not `type` (extends well).
- Required props first, optional last.
- Optional props with sensible defaults — destructure with default values.
- Boolean props default to `false`. If the natural default is `true`, name it `hide…` or invert the meaning.
- Event handlers are named `onSomething` for the prop and `handleSomething` for the local implementation.

## Composition over configuration

Prefer composition (children, slots) to configuration (boolean flags, "kitchen sink" props).

```tsx
// WRONG
<Card title="Patient" subtitle="..." footer="..." actionLabel="Edit" onAction={...} />

// RIGHT
<Card>
  <CardHeader title="Patient" subtitle="..." />
  <CardBody>...</CardBody>
  <CardFooter><Button onClick={...}>Edit</Button></CardFooter>
</Card>
```

## State

- Default to `useState`. Lift state only when shared.
- Use `useReducer` when state transitions have rules worth naming.
- Server state goes through TanStack Query, not `useEffect + useState`.
- Global state goes in Zustand with selectors.

## Effects

- Avoid `useEffect` for derivations — compute during render.
- Avoid `useEffect` for events — use event handlers.
- Use `useEffect` for synchronization with external systems (subscriptions, DOM APIs, third-party).
- Always include a cleanup when subscribing.

## Memoization

- Default to no memoization.
- Add `useMemo` / `useCallback` only with a measured reason (profiling, child memo dependency).
- `React.memo` for pure presentational components in lists.

## Conditional rendering

```tsx
// Truthy guard
{isLoading && <Spinner />}

// Either/or
{isError ? <ErrorState /> : <Content />}

// Multi-state — use early returns, not nested ternaries
if (query.isLoading) return <Spinner />;
if (query.isError) return <ErrorState />;
return <Content data={query.data} />;
```

Avoid nested ternaries beyond two levels. Reach for an early return.

## Lists

Always provide a stable `key`. Never use the array index unless the list is truly static and immutable.

```tsx
{patients.map(p => <PatientRow key={p.id} patient={p} />)}
```

## Storybook

Every component in `components/ui/` has a story:

```tsx
// MyButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyButton } from './MyButton';

const meta: Meta<typeof MyButton> = {
  component: MyButton,
};
export default meta;
type Story = StoryObj<typeof MyButton>;

export const Primary: Story = { args: { children: 'Click me' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } };
```

## Accessibility

- Use semantic HTML first (`<button>`, `<nav>`, `<label>`, `<form>`).
- Every input has an associated `<label>` (visible or `aria-label`).
- Interactive elements have a visible focus ring.
- Color is never the only signal — pair with icon or text.
- `@storybook/addon-a11y` is installed; run it on stories before merging.

## What goes where

| Type | Location |
|---|---|
| Reusable UI atom with no domain knowledge | `components/ui/<category>/` |
| Domain-specific component used only by one feature | `features/<domain>/components/` |
| Domain-specific component reused across features | `components/<shared-domain>/` (does not exist yet; create when needed) |
| Page-level component (route target) | `features/<domain>/pages/<Name>Page.tsx` |
