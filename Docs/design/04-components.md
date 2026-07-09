# HeroArc — Component Library

**Tokens:** [03-tokens.md](./03-tokens.md) · **Preview:** [component-showcase.html](./component-showcase.html)  
**Microcopy:** [01-brand-strategy.md](./01-brand-strategy.md)

Every component uses design tokens. No one-off styles per screen.

---

## Button

### Variants

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | `primary` | `textInverse` | none |
| Secondary | `surface` | `primary` | 1.5px `primary` |
| Ghost | transparent | `primary` | none |
| Soft destructive | `gentleAlertMuted` | `gentleAlert` | none |

### States

- **Default:** min height 48px, pill radius, horizontal padding 24px
- **Pressed:** `primaryPressed` (primary only), scale 0.98
- **Disabled:** 40% opacity, no press animation
- **Loading:** spinner replaces label, maintain width

### PRD CTAs

Check In · Verify · Settle up · Accept · Share proof

### Accessibility

`accessibilityRole="button"`, min 48×48px hit area, visible focus ring on web.

---

## TextInput

- Height 52px, radius 12px, border `border`, focus border `primary`
- Label above (caption style), error below in `gentleAlert` — never harsh red
- Support: text, email, password (toggle visibility), phone (with country code row)

---

## SegmentedControl

- Pill container on `surfaceTint`, active segment `surface` with `elevation-sm`
- Labels: **Active** / **Your journey** (Past filter)
- Height 40px, full width minus screen padding

---

## StatusChip

Icon + label always paired.

| State | Icon | Bg | Label |
|-------|------|-----|-------|
| Pending | clock | gold-100 | Ready for today |
| Validating | users | sky-100 | Companions reviewing |
| Done | check | mint-100 | Showed up today |
| Missed | leaf | salmon tint | Save used |
| Failed | gift | coral-100 | Settle up |
| Success | star | gold-100 | Goal complete |

---

## ChallengeCard (Challenger)

**PRD:** US-1, US-3, US-6

### Anatomy

```
┌─────────────────────────────────────┐
│ [Title]                    [Chip]   │
│ Day 12 of 30 · 40%                  │
│ [ProgressTrail ────────○]           │
│ [LivesIndicator] (if lives > 0)     │
│ [Primary CTA]                       │
└─────────────────────────────────────┘
```

### Eight states (PRD-aligned)

| # | State | Chip | CTA | Card tint |
|---|-------|------|-----|-----------|
| 1 | Check-in Pending | Ready for today | Check In | default |
| 2 | Pending Validation | Companions reviewing | — | sky-100 border |
| 3 | Check-in Done | Showed up today | — | mint-100 border |
| 4 | Check-in Missed | Save used | — | salmon tint |
| 5 | Failed, Settle Wager | Settle up | Settle up | coral-100 |
| 6 | Challenge Closed | All wrapped up | — | muted |
| 7 | Challenge Successful | Goal complete | — | gold-100 |
| 8 | Draft | Waiting for companions | Edit challenge | peach tint |

### Interaction

- Whole card tappable → Challenge Journey
- CTA stops propagation → check-in / settle flow

---

## CompanionChallengeCard

**PRD:** US-7, US-9

### Anatomy

```
┌─────────────────────────────────────┐
│ [Challenger avatar] [Name]          │
│ [Challenge title]                   │
│ [Progress %]  [Time left badge]     │
│ [StatusChip]  [Verify CTA]          │
└─────────────────────────────────────┘
```

Shows challenger name, completion %, time left to verify, Verify CTA when pending.

---

## CompanionRequestCard

**PRD:** US-7

- Challenger name, wager (peach accent), challenge name, dates, duration
- Actions: **Accept** (primary) · **Decline** (ghost)
- Removed from list after action

---

## ProgressTrail

Organic horizontal path with filled segment. Day markers as small dots.

- Primary fill: `primary` with subtle gradient to `teal-400`
- Percentage secondary: caption below trail
- Animates width on gain (`duration.slow`, `easing.delight`)

---

## LivesIndicator

Row of leaf icons. Filled = available, faded = consumed.

- On consume: single leaf opacity 0.3 + scale 0.9 over 400ms
- Copy: "2 saves left" — not "2 lives remaining" (warmer)

---

## AvatarGroup

Overlapping circles, max 6 visible + "+N" overflow.

- Approval tally: "4 of 6 companions approved" — tappable expands list with ✓ / pending per name

---

## ApprovalWidget

**Companion only**, attached to proof in activity feed.

- **Looks good** (primary soft) · **Try again** (secondary)
- Never label "Reject"

---

## ActivityFeedItem

Timeline row: icon, event copy, timestamp.

| Event | Copy pattern |
|-------|--------------|
| Proof submitted | [Name] shared proof |
| Approved | Check-in verified |
| Try again | Companion asked for another try |
| Life used | One save used — still in it |
| Companion left | [Name] stepped back |
| Wager settled | Wager settled — challenge closed |

---

## MediaUploadSheet

Bottom sheet, radius-lg top corners.

- Headline: "Share proof of showing up"
- Options: Photo · Video · Voice · Document (platform picker)
- Note: 20MB limit
- Upload progress bar on `primary`

---

## ProofViewer

Full-screen media with companion approval bar at bottom.

- Swipe between multiple attachments
- Pinch zoom on images

---

## BottomNav

Three tabs equal weight: Companion · Challenges · Profile

- Active: `tabActive` + label semibold
- Inactive: `tabInactive`
- Challenges tab default on launch (PRD)

---

## EmptyState

Illustration (128px), headline (title), subcopy (body), single primary CTA.

---

## Skeleton

Shimmer on `neutral-100` → `neutral-200`, radius matches target component.

---

## ErrorState

Soft illustration, supportive headline, retry CTA (ghost or primary).

---

## Snackbar

Floating pill, `neutral-900` bg, `textInverse`, 4s auto-dismiss, bottom above nav.

---

## CelebrationOverlay

Full-screen scrim, gold organic particles (reduce-motion: static bloom SVG).

- Headline from [01-brand-strategy.md](./01-brand-strategy.md) celebration table
- Dismiss tap or auto 3s

---

## ProfileMetricCard

```
┌──────────────────┐
│ [icon]  [value]  │
│ [narrative label]│
└──────────────────┘
```

Six metrics per PRD with narrative labels:

| PRD metric | Narrative label |
|------------|-----------------|
| Consistent Since | Showing up since |
| Longest Streak | Longest run |
| Wager Settlement Ratio | Settled with honesty |
| Challenges created | Goals started |
| Challenges Companioned | Friends supported |
| Wagers Realized | Wagers kept |

---

## Dialog

Centered card on overlay. Title (heading) + body + primary/ghost actions.

Used for: max 5 challenges, leave challenge confirm, last companion block.

---

## Related

- [07-screens/](./07-screens/) — screen compositions
- [08-motion-prototype.md](./08-motion-prototype.md) — interaction timing
