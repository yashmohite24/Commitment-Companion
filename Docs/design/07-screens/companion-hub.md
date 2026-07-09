# Companion Hub

**Route:** `/(tabs)/companion`  
**PRD:** US-7, US-8

## Layout

```
┌─────────────────────────────────┐
│ Supporting your people          │
├─────────────────────────────────┤
│ Invitations                     │
│ [CompanionRequestCard]          │
├─────────────────────────────────┤
│ [ Active | Your journey ]       │
├─────────────────────────────────┤
│ [CompanionChallengeCard]        │
└─────────────────────────────────┘
```

## Components

- Section header "Invitations" (if requests exist)
- `CompanionRequestCard` — Accept / Decline
- `SegmentedControl`
- `CompanionChallengeCard` — Verify CTA + time left badge
- `EmptyState` — "No invitations right now"

## Companion card details (PRD)

- Challenger name
- Challenge name
- Completion %
- Time left to verify
- Status chip
- Verify CTA when pending

## Interaction

- Tap card → same Journey screen as challenger view (role-aware widgets)
