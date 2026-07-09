# Challenges List

**Route:** `/(tabs)/challenges`  
**PRD:** US-1

## Layout

```
┌─────────────────────────────────┐
│ Your goals             [+ New]  │
│ Small steps. Real growth.       │
├─────────────────────────────────┤
│ [ Active | Your journey ]       │  SegmentedControl
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ChallengeCard (state n)     │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ChallengeCard               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Components

- `SegmentedControl` — Active (default) | Your journey
- `ChallengeCard` × n — all 8 states per [04-components.md](../04-components.md)
- Header `Button` or FAB — Create challenge → `/challenge/create`
- `EmptyState` when no cards

## Empty state (active)

- Headline: "Your next big goal starts here"
- CTA: "Create a challenge"

## States

- Loading: `Skeleton` cards × 3
- Error: `ErrorState` with retry

## Interaction

- Pull to refresh
- Tap card → `/(tabs)/challenge/[id]`
- CTA on card → check-in sheet or settle flow
