# HeroArc — Motion & Prototype Spec

**Extends:** [PROTOTYPE.md](./PROTOTYPE.md)  
**Tokens:** [03-tokens.md](./03-tokens.md)

---

## Global motion principles

1. Motion communicates life — nothing snaps harshly.
2. Gentle easing by default; bounce only for primary press and celebrations.
3. Progress grows organically.
4. Lives fade — they don't shatter.
5. Respect `prefers-reduced-motion` / RN `AccessibilityInfo.isReduceMotionEnabled()`.

---

## Easing & duration

| Token | Value | Use |
|-------|-------|-----|
| `duration.fast` | 150ms | Chip state change |
| `duration.normal` | 250ms | Tab crossfade, sheet open |
| `duration.slow` | 400ms | Progress trail fill, life fade |
| `duration.celebration` | 600ms | Success overlay |
| `easing.standard` | ease standard | Most transitions |
| `easing.delight` | cubic-bezier(0.34, 1.56, 0.64, 1) | Button press, card rise |
| Reduce motion | ease-out 200ms | All of the above |

---

## Screen transition map

| From | To | Transition |
|------|-----|------------|
| Tab → Tab | Companion / Challenges / Profile | Crossfade 250ms |
| Challenges list | Challenge Journey | Push from right, header persists |
| Journey | Back | Pop to right |
| Any | Create challenge | Modal slide up |
| Any | MediaUploadSheet | Bottom sheet spring 400ms |
| Any | ProofViewer | Fade in 200ms |
| Any | CelebrationOverlay | Scale 0.9→1 + fade, 600ms |

### Challenge Journey header

- On scroll down: details height 180px → 56px compact strip
- Progress trail remains visible in compact mode
- Interpolate over 120px scroll distance

---

## Core flow animations

### 1. Check In

1. Tap CTA → button scale 0.98 → sheet rises
2. Select media → upload bar fills left-to-right (`primary`)
3. Complete → sheet dismisses, card chip morphs Pending → Reviewing
4. Trail segment blooms mint (scale pulse 1 → 1.02 → 1)

### 2. Companion Verify

1. Tap Verify → ProofViewer fade in
2. Tap "Looks good" → tally increments with number roll
3. All approved → card chip → Done, optional light haptic
4. "Try again" → supportive copy toast, no shake animation

### 3. Life consumed

1. Leaf icon opacity 1 → 0.35, scale 1 → 0.92 over 400ms
2. Snackbar: "Life happened — one save used"
3. No red flash, no screen shake

### 4. Challenge success

1. `CelebrationOverlay` — gold organic particles (12–18 soft circles, slow drift)
2. Headline: "You reached your goal"
3. Auto-dismiss 3s or tap → card moves to Your journey with list crossfade

### 5. Live / Past filter

- Segmented pill slides with `layout` animation
- List crossfade opacity 0.6 → 1

---

## Micro-delight moments

| Moment | Animation | Reduce motion |
|--------|-----------|---------------|
| Primary button press | 8px translateY + bounce back | Opacity 0.85 only |
| Progress trail fill | Width + 2% scale pulse | Instant width |
| Streak badge (profile) | Gold pulse every 8s idle | Static badge |
| Check-in submit | Trail bloom mint | Chip text change only |
| Success | Organic particles | Static bloom SVG + copy |
| Card enter list | Stagger fade-up 40ms each | No stagger |
| Pull refresh | Custom arc spinner | Default indicator |

---

## Bottom sheet — Check In

```
States: closed → half (picker) → full (preview optional)
Snap points: 0%, 45%, 90%
Backdrop: overlay 45% opacity, tap to dismiss (confirm if upload in progress)
Handle: 36×4px pill, neutral-200
```

---

## Haptics (native)

| Event | Style |
|-------|-------|
| Check-in submitted | Light impact |
| All companions approved | Success notification |
| Life consumed | Soft warning (not error) |
| Challenge success | Success |

---

## Implementation notes (Expo)

- Use `react-native-reanimated` for layout and opacity
- Use `react-native-gesture-handler` for sheet
- Gate delight easing behind `useReducedMotion()` hook
- Tab animations via Expo Router default + custom tab bar if needed

---

## Related

- [component-showcase.html](./component-showcase.html)
- [06-user-flows.md](./06-user-flows.md)
