# Manual E2E Test Matrix — V1

Run on iOS and Android before release. Requires two test accounts (Challenger + Companion).

## Auth

- [ ] Phone OTP login succeeds
- [ ] Session persists after app restart
- [ ] Logout clears session and redirects to login

## Challenge creation (User Story 2)

- [ ] Create draft with valid fields (≥7 days, companions, wager)
- [ ] Reject duplicate active challenge name
- [ ] Reject 6th active challenge
- [ ] Edit draft (dates, companions)
- [ ] Delete draft

## Companion flow (User Stories 7–8)

- [ ] Companion sees pending request
- [ ] Accept activates challenge on/after start date
- [ ] Reject removes request
- [ ] Companion sees live challenge card
- [ ] Leave challenge (with ≥2 companions) succeeds
- [ ] Last companion cannot leave

## Check-in (User Stories 3, 9)

- [ ] Challenger uploads proof before deadline
- [ ] Companion receives push (if token registered)
- [ ] Unanimous approve → check-in done, media removed from feed
- [ ] One reject → resubmit before deadline
- [ ] Miss deadline with lives → missed + life consumed
- [ ] Miss deadline without lives → challenge failed

## Pooja scenario

- [ ] Pending validation past deadline → provisional advance
- [ ] Post-deadline reject → 24h makeup window
- [ ] Can submit next day while prior day pending

## Wager (User Story 6)

- [ ] Failed challenge shows Settle Wager CTA
- [ ] Upload settlement proof
- [ ] All companions approve → challenge closed → Past tab

## Profile (User Story 5)

- [ ] Stats load via `get_profile_stats`
- [ ] Feedback submits to Google Sheet
- [ ] Privacy/Data links open in browser

## Scheduled jobs

- [ ] pg_cron invokes `scheduled-jobs` every minute
- [ ] 1-hour deadline reminder push fires
