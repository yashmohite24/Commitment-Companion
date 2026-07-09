# Challenge Journey

**Route:** `/(tabs)/challenge/[id]`  
**PRD:** US-3, US-6, US-9

## Layout

```
┌─────────────────────────────────┐
│ ←  Morning Run            ⋮     │
├─────────────────────────────────┤
│ [ChallengeDetails]              │
│ ProgressTrail · LivesIndicator  │
│ ┌─────────────────────────────┐ │
│ │ Check In / Settle up        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Activity                        │
│ [ActivityFeedItem]              │
│ [ActivityFeedItem + Approval]   │
└─────────────────────────────────┘
```

## Components

- `ChallengeDetails` — name, dates, wager, companions
- `ProgressTrail`, `LivesIndicator`
- Primary `Button` — context-aware CTA
- `ActivityFeed` — no message input (US-4 omitted)
- `ApprovalWidget` — companion only on pending proof
- `MediaUploadSheet` — from Check In
- `ProofViewer` — companion verify
- Menu ⋮ — Leave challenge (companion only)

## Challenger actions

- Check In → upload sheet
- Settle up → wager upload (failed state)

## Companion actions

- Verify → proof viewer + Looks good / Try again
- Leave → confirm dialog

## Header collapse (motion)

On scroll, details compress to compact progress strip — see [08-motion-prototype.md](../08-motion-prototype.md).
