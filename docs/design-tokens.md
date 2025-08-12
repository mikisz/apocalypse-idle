# Design Tokens

This project uses a small set of CSS variables that power the design system. These tokens are mapped into the Tailwind/Shadcn theme so that utilities like `bg-background` or `text-foreground` resolve to the colors below.

## Colors

| Token | Value | Usage |
| ----- | ----- | ----- |
| `--color-ink` | `#e8edf6` | Primary foreground text |
| `--color-muted` | `#97a3b6` | Muted foreground text |
| `--color-bg` | `#0b0e14` | Base background |
| `--color-bg2` | `#101522` | Secondary background |
| `--color-panel` | `#151b2b` | Panel and card surfaces |
| `--color-stroke` | `#232b3d` | Borders and rings |

## Spacing

Spacing utilities use the [default Tailwind scale](https://tailwindcss.com/docs/padding#spacing), which follows a 4&nbsp;px baseline (e.g. `p-2` → 8&nbsp;px).

## Border Radius

Border radius is derived from the base `--radius` token (10&nbsp;px) and exposed through utility classes:

| Token | Value |
| ----- | ----- |
| `--radius-sm` | `calc(var(--radius) - 4px)` |
| `--radius-md` | `calc(var(--radius) - 2px)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) + 4px)` |

These tokens correspond to Tailwind classes `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-xl` respectively.

