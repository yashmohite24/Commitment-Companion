# HeroArc — Visual Identity

**Brand assets:** [Landing Page Design Experiments/brand/](../../Landing%20Page%20Design%20Experiments/brand/)  
**Marketing reference:** [heroarc.xyz](https://www.heroarc.xyz)

---

## Logo

### Primary mark: Growth Mark

**File:** `HeroArc-growth-mark.svg`

**Metaphor:** seed (day one) → arc (consistent growth) → bloom (who you become)

**Tone:** "No capes. No conquest. Just the quiet upward line of showing up."

### Usage

| Context | Asset |
|---------|-------|
| App icon | `HeroArc-growth-mark.svg` |
| Splash screen | Growth mark centered on cream background |
| Nav header (optional) | `HeroArc-logo.svg` horizontal lockup |
| Favicon / web | `HeroArc-growth-mark-mono.svg` on dark or cream |
| Tab bar accent | Simplified arc stroke, 24×24 — see [tab-icons.md](./tab-icons.md) |

### Clear space

Minimum padding around mark = height of the seed dot on all sides.

### Don't

- Stretch or rotate the mark
- Use heroic crest / shield variants (superseded explorations)
- Place mark on busy photography
- Use pure black `#000` or pure white `#FFF` as backgrounds

---

## Color system (unified)

HeroArc reconciles **marketing teal** (heroarc.xyz) with **in-app forest** (depth, trust, growth).

### Primitive palette

| Token | Hex | Role |
|-------|-----|------|
| `forest-500` | `#3D6B54` | Primary brand, primary buttons, active nav |
| `forest-600` | `#2F5542` | Pressed primary |
| `forest-100` | `#E8F0EB` | Primary tint backgrounds |
| `teal-400` | `#49B7A5` | Marketing bridge, links, Promise Thread |
| `teal-100` | `#E7F5F2` | Teal tint cards |
| `neutral-50` | `#FAF6EE` | App background (warm cream) |
| `neutral-0` | `#FFFFFF` | Card surfaces |
| `neutral-100` | `#F0EBE0` | Subtle section tint |
| `neutral-200` | `#E2DDD2` | Borders, dividers |
| `neutral-400` | `#9A9488` | Muted text, placeholders |
| `neutral-700` | `#4A453C` | Secondary text |
| `neutral-900` | `#2C2820` | Primary text |
| `gold-400` | `#E8B84A` | Celebration, streaks |
| `gold-100` | `#FBF3DC` | Success backgrounds |
| `sky-400` | `#7EB8DA` | Companion accents |
| `sky-100` | `#E8F4FA` | Companion tint |
| `mint-300` | `#A8D5BA` | Done / approved states |
| `mint-100` | `#EAF6EF` | Done backgrounds |
| `coral-400` | `#E8927C` | Gentle emphasis, wagers |
| `coral-100` | `#FBEAE4` | Soft alert backgrounds |
| `salmon-300` | `#F2B8A8` | Life consumed, soft warnings |
| `peach-400` | `#F7B267` | Wager stakes, warmth accent |

### Semantic mapping

| Semantic | Primitive | Usage |
|----------|-----------|-------|
| `background` | neutral-50 | Screen canvas |
| `surface` | neutral-0 | Cards, sheets |
| `primary` | forest-500 | CTAs, progress fill |
| `primaryMuted` | forest-100 | Tinted sections |
| `companion` | sky-400 / teal-400 | Companion tab, approval UI |
| `success` | mint-300 / gold-400 | Done, celebration |
| `gentleAlert` | coral-400 / salmon-300 | Missed, life used — never harsh red |
| `textPrimary` | neutral-900 | Headlines, body |
| `textSecondary` | neutral-700 | Supporting copy |
| `textMuted` | neutral-400 | Timestamps, hints |
| `border` | neutral-200 | Card edges |

### Gradients (sparingly)

- **Growth gradient:** `#49B7A5` → `#6BBF8A` — logo wordmark "Arc", celebration accents
- **Promise Thread:** `#49B7A5` stroke on `#E4DED4` base path
- Never use gradients on primary buttons (solid forest only)

### Color rules

1. No harsh red for failure — coral/salmon only.
2. Avoid pure black and pure white.
3. Pastel tints for card variety (teal, peach, salmon) — max one tint per card.
4. AA contrast required: forest on cream, neutral-900 on cream, white on forest.

---

## Typography

### Families

| Role | Family | Weights |
|------|--------|---------|
| Display / headings | **Manrope** | 600, 700, 800 |
| Body / UI | **Inter** | 400, 500, 600 |

### Scale (mobile)

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `text-3xl` | 40px | 1.25 | Hero headlines (welcome) |
| `text-2xl` | 32px | 1.25 | Screen titles |
| `text-xl` | 24px | 1.3 | Section headers |
| `text-lg` | 20px | 1.4 | Card titles |
| `text-base` | 16px | 1.5 | Body (minimum) |
| `text-sm` | 14px | 1.5 | Captions, chips |
| `text-xs` | 12px | 1.4 | Timestamps |

### Rules

- Headlines: Manrope, semibold or bold, tight tracking (`-0.02em` on large sizes)
- Body: Inter regular/medium, never below 16px for readable content
- Labels / chips: Inter medium, 14px, optional uppercase with `0.08em` tracking
- Button text: Inter semibold 16px

---

## Illustration

### In-app style

- Organic, abstract, comic-soft, hand-drawn feel
- Rounded forms, slightly imperfect edges
- Soft fills from brand tints (forest-100, gold-100, sky-100)
- Line weight ~2px, rounded caps

### Use cases

| Context | Illustration |
|---------|-------------|
| Empty states | Small scene — seed sprouting, path on hill |
| Celebration | Bloom at end of arc, organic particles |
| Life consumed | Single leaf gently fading — not shattering |
| Profile header | Abstract growth trail behind avatar |

### Marketing-only (not in-app V1)

- Matte clay 3D objects from landing page orbit animation
- Keep landing and app visually related via palette, not 3D assets

### Avoid

- Corporate flat SaaS people
- Isometric office scenes
- Stock illustration packs
- Sharp geometric corporate icons

---

## Iconography

- **Style:** Rounded, friendly, minimal, 2px stroke
- **Corner radius:** Match `--radius-sm` (8px) on icon containers
- **Size grid:** 20px (inline), 24px (nav, chips), 32px (empty states)
- **Fill icons:** Use sparingly; prefer outline + semantic color
- **No** sharp edges or militaristic symbols

### Core icon set (V1)

| Icon | Meaning |
|------|---------|
| Arc / sprout | Brand, growth |
| Camera | Check-in photo |
| Mic | Voice proof |
| Document | File proof |
| Users | Companions |
| Leaf | Lives / saves |
| Check circle | Approved |
| Refresh | Try again |
| Gift | Wager |
| Clock | Deadline |

---

## Photography

**V1:** No photography in product UI.

- User avatars: initials on soft color circle (deterministic color from name hash)
- Proof media: user-uploaded photos/videos only

---

## Shape language

| Property | Value |
|----------|-------|
| Card radius | 16px (`radius-md`) |
| Sheet radius | 24px top (`radius-lg`) |
| Button radius | 9999px (pill) |
| Input radius | 12px |
| Shadow | Soft, low elevation — `0 4px 24px rgba(44,40,32,0.08)` |
| Spacing rhythm | 4px base grid |

---

## Signature motifs

### Promise Thread

Wavy path connecting sections / progress trail on challenge cards. Teal stroke animates on scroll or progress gain. Symbolizes consistency and momentum.

### Growth trail (progress)

Challenge progress shown as a path with day markers, not a bare percentage bar. Percentage appears as secondary label ("Day 12 of 30 · 40%").

---

## Related artifacts

- [03-tokens.md](./03-tokens.md) — machine-readable token definitions
- [04-components.md](./04-components.md) — component visual specs
- [component-showcase.html](./component-showcase.html) — live token preview
