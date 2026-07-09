# HeroArc — Design Tokens

**Machine-readable source:** [tokens.json](./tokens.json)  
**Visual reference:** [02-visual-identity.md](./02-visual-identity.md)

---

## Usage

Tokens are the single source of truth for implementation in `app/src/theme/`. Never hardcode hex values in screens or components.

```typescript
// Example consumption
import { colors, spacing, radius } from '@/src/theme';
```

---

## Color

### Primitives

See `tokens.json → color.primitive` for full hex list.

### Semantic aliases

| Token | Resolves to | When to use |
|-------|-------------|-------------|
| `background` | cream `#FAF6EE` | Screen root |
| `surface` | white `#FFFFFF` | Cards, modals |
| `primary` | forest `#3D6B54` | Primary buttons, active progress |
| `accent` | teal `#49B7A5` | Links, Promise Thread, marketing bridge |
| `companion` | sky `#7EB8DA` | Companion tab accents |
| `success` | mint `#A8D5BA` | Approved, done chips |
| `celebration` | gold `#E8B84A` | Streaks, success overlay |
| `gentleAlert` | coral `#E8927C` | Soft failure, wager emphasis |
| `warning` | salmon `#F2B8A8` | Life consumed, missed (no guilt) |
| `textPrimary` | `#2C2820` | Headlines, body |
| `textSecondary` | `#4A453C` | Subcopy |
| `textMuted` | `#9A9488` | Meta, timestamps |

---

## Typography

| Token | Value |
|-------|-------|
| `fontFamily.display` | Manrope |
| `fontFamily.body` | Inter |
| `fontSize.base` | 16px (minimum body) |
| `fontWeight.semibold` | 600 (buttons, chips) |
| `lineHeight.normal` | 1.5 |

### Text styles (composed)

| Style | Font | Size | Weight | Line height |
|-------|------|------|--------|-------------|
| `displayLarge` | Manrope | 40 | 800 | 1.25 |
| `displayMedium` | Manrope | 32 | 700 | 1.25 |
| `heading` | Manrope | 24 | 700 | 1.3 |
| `title` | Manrope | 20 | 600 | 1.4 |
| `body` | Inter | 16 | 400 | 1.5 |
| `bodyMedium` | Inter | 16 | 500 | 1.5 |
| `caption` | Inter | 14 | 400 | 1.5 |
| `label` | Inter | 14 | 600 | 1.4 |
| `chip` | Inter | 12 | 600 | 1.4 |

---

## Spacing

4px base grid.

| Token | px | Common use |
|-------|-----|------------|
| `spacing-1` | 4 | Tight icon gap |
| `spacing-2` | 8 | Chip padding, gutter |
| `spacing-3` | 12 | Input padding |
| `spacing-4` | 16 | Screen horizontal margin |
| `spacing-6` | 24 | Section gap |
| `spacing-8` | 32 | Large section gap |
| `spacing-12` | 48 | Min button height |

---

## Radius

| Token | px | Use |
|-------|-----|-----|
| `radius-sm` | 8 | Chips, small cards |
| `radius-md` | 16 | Challenge cards |
| `radius-lg` | 24 | Bottom sheets (top corners) |
| `radius-full` | 9999 | Buttons, avatars |

---

## Elevation

Soft shadows only — no harsh drop shadows.

| Token | CSS |
|-------|-----|
| `elevation-sm` | `0 2px 8px rgba(44,40,32,0.06)` |
| `elevation-md` | `0 4px 24px rgba(44,40,32,0.08)` |
| `elevation-lg` | `0 8px 32px rgba(44,40,32,0.12)` |

---

## Motion

| Token | Value |
|-------|-------|
| `duration.fast` | 150ms |
| `duration.normal` | 250ms |
| `duration.slow` | 400ms |
| `easing.standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `easing.delight` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

**Reduce motion:** Replace delight easing with `ease-out 200ms`; disable particles.

---

## Layout

| Token | Value |
|-------|-------|
| `screenPaddingHorizontal` | 16px |
| `gutter` | 8px |
| `minTouchTarget` | 48px |
| `bottomNavHeight` | 56px |

---

## Accessibility

- Body text ≥ 16px
- Interactive targets ≥ 48×48px
- Status always uses icon + label (not color alone)
- Documented AA pairs in `tokens.json → accessibility.contrastPairs`

---

## Related

- [04-components.md](./04-components.md)
- [08-motion-prototype.md](./08-motion-prototype.md)
