# Create Challenge

**Route:** `/challenge/create`  
**PRD:** US-2

## 3-step wizard

### Step 1 — Basics

- Challenge name (200 char)
- Start date (today+)
- End date (start + 7 min)
- Daily deadline (default 11:59 PM)

### Step 2 — Companions

- `CompanionPicker` search
- Selected avatars row
- SMS invite for non-users
- Helper: "Pick people who want to see you win"

### Step 3 — Stakes

- Wager (300 char) — placeholder: "Buy the group coffee if I miss"
- Lives — stepper with max = floor(duration/2) - 1
- Helper: "Saves are for busy days — not excuses"

## Components

- Progress dots (3 steps)
- `TextInput`, date/time pickers
- `CompanionPicker`
- `Button` primary "Send invitations" / "Save draft"

## Dialogs

- Max 5 active: "You've got 5 challenges going…"
- Validation inline per field

## Success

Navigate to Challenges — show draft or pending state card.
