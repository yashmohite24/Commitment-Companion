# Profile

**Route:** `/(tabs)/profile`  
**PRD:** US-5

## Layout

```
┌─────────────────────────────────┐
│ [Avatar]  First Last            │
│           member since …        │
├─────────────────────────────────┤
│ Your growth                     │
│ ┌──────────┐ ┌──────────┐       │
│ │ Metric   │ │ Metric   │       │
│ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐       │
│ │ Metric   │ │ Metric   │       │
│ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐       │
│ │ Metric   │ │ Metric   │       │
│ └──────────┘ └──────────┘       │
├─────────────────────────────────┤
│ Feedback                        │
│ [header input]                  │
│ [message input]                 │
│ [Send feedback]                 │
├─────────────────────────────────┤
│ Privacy policy · Terms          │
│ Log out                         │
└─────────────────────────────────┘
```

## ProfileMetricCard grid (6 metrics)

| Value source (PRD) | Label |
|--------------------|-------|
| Consistent Since days | Showing up since |
| Longest Streak | Longest run |
| Wager Settlement Ratio % | Settled with honesty |
| Challenges created count | Goals started |
| Challenges Companioned | Friends supported |
| Wagers Realized | Wagers kept |

## Components

- Avatar initials
- `ProfileMetricCard` × 6
- `TextInput` feedback form
- `Button` secondary send feedback
- Ghost links policies
- Soft destructive log out

## Tone

Stats framed as identity growth — not productivity KPIs.
