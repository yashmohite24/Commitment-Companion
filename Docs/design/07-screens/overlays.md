# Overlays — Dialogs & Sheets

**PRD edge cases across US-2, US-6, US-8**

## Max 5 active challenges

**Trigger:** Create when user has 5 active challenges.

```
Title: Room for one more goal?
Body: You've got 5 challenges going. Wrap one up before starting another.
CTA: Got it (primary)
```

## Leave challenge confirm

```
Title: Step back from this challenge?
Body: [Name] won't see you on their companion list anymore. They'll be notified.
CTA: Stay (primary) · Step back (ghost)
```

## Last companion block

```
Title: They need someone in their corner
Body: At least one companion needs to stay — your friend is counting on the group.
CTA: Got it
```

## MediaUploadSheet

See [04-components.md](../04-components.md) — bottom sheet with photo/video/voice/document.

## CelebrationOverlay

- Challenge success
- Optional streak milestones on profile

## Snackbar patterns

- Upload success: "Proof shared — your companions will take a look"
- Feedback sent: "Thanks — we read every note"
