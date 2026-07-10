# HeroArc — Tab bar icons

**Context:** Bottom navigation · 24×24 · 2px stroke · rounded caps  
**Brand refs:** [01-brand-strategy.md](./01-brand-strategy.md) · [02-visual-identity.md](./02-visual-identity.md)

---

## Design principles

| Principle | Application |
|-----------|-------------|
| Growth, not tasks | Icons suggest becoming — arc, sprout, people — never checklists or trophies |
| Warm & rounded | 2px stroke, round line caps; no sharp corporate geometry |
| Semantic color | Active tint follows tab role (forest / sky / forest) |
| One idea per tab | Each icon reads in ~1 second at 24px |

---

## Tab 1 — Companion

**Screen:** Supporting your people  
**Pillar:** Friendship — companions cheer you on, kindly  

**Icon:** **Linked pair**  
Two rounded figures with a subtle connecting curve between them.

**Meaning:** You're not alone; people in your corner want you to win.

| State | Color token |
|-------|-------------|
| Active | `companion` · `#7EB8DA` |
| Inactive | `tabInactive` · `#9A9488` |

**Avoid:** Gavel, eye/surveillance, whistle, military rank

---

## Tab 2 — Challenges (Your goals)

**Screen:** Your goals  
**Pillar:** Progress — small steps, daily show-up  

**Icon:** **Growth arc** (simplified HeroArc mark)  
Seed dot → rising curve → bloom circle.

**Meaning:** Same metaphor as the app icon: day one → consistency → who you become.

| State | Color token |
|-------|-------------|
| Active | `tabActive` / `primary` · `#3D6B54` |
| Inactive | `tabInactive` · `#9A9488` |

**Avoid:** Trophy, flag, checkbox, flame streak clichés

---

## Tab 3 — Profile (Your growth)

**Screen:** Your growth  
**Pillar:** Self-respect & identity — proud of showing up  

**Icon:** **Person + sprout**  
Figure silhouette with a seed/bloom above the head.

**Meaning:** The person you're becoming; growth is identity, not stats alone.

| State | Color token |
|-------|-------------|
| Active | `primary` · `#3D6B54` |
| Inactive | `tabInactive` · `#9A9488` |

**Avoid:** Gear/settings as primary metaphor (stats live here, but growth is the story)

---

## Implementation

| Asset | Path |
|-------|------|
| React components | `app/src/ui/icons/TabIcons.tsx` |
| Tab wiring | `app/app/(tabs)/_layout.tsx` |

### Active color map

```text
Companion  → colors.companion  (#7EB8DA)
Challenges → colors.tabActive  (#3D6B54)
Profile    → colors.tabActive  (#3D6B54)
```

---

## Future (optional)

- Filled variant on active state (hierarchical SF Symbol style)
- Subtle bounce on tab press (see [08-motion-prototype.md](./08-motion-prototype.md))
- Badge dot on Companion when pending invitations exist
