# Phase 8 — Prototype Interactions

Wire these transitions in Paper when MCP quota is available (`node scripts/build-promise-design.mjs prototype`).

## Core flows

1. **Tab switching** — Gentle crossfade between Companion | Challenges | Profile
2. **Challenge card → Journey** — Push transition; header collapses to compact progress strip
3. **Check In** — Bottom sheet media picker (photo / video / voice / document) → upload progress → status chip changes to Pending Validation
4. **Companion Verify** — Full-screen proof viewer → "Looks good" / "Try again" → tally updates (4 of 6) → Check-in Done celebration
5. **Life consumed** — Lives indicator leaf fades (opacity + scale, no shatter) → supportive copy "Life happened — one save used"
6. **Challenge success** — Full-screen gold celebration → "You reached your goal" → auto-archive to Past
7. **Live / Past filter** — Segmented control morph; list crossfade

## Micro-delight moments

| Moment | Animation |
|--------|-----------|
| Primary button press | 8px rise + subtle bounce (cubic-bezier 0.34, 1.56, 0.64, 1) |
| Progress trail fill | Organic width growth + 2% scale pulse |
| Streak badge | Gentle gold pulse on profile |
| Check-in submit | Trail segment blooms mint |
| Success | Organic particles (not casino confetti) |

## Reduce motion variant

Replace bounce easing with ease-out 200ms. Disable particle celebration; use static illustration + copy only.
