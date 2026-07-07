# Commitment App — Locked Decisions

> Product decisions for ambiguous PRD items. Defaults below match current backend implementation unless noted.

**Status:** Approved for V1 implementation (2026-07-06)

---

## Blocking questions

### B1 — End date vs. pending validation on final day

**Decision:** (b) Pending until validation completes.

Challenge becomes `successful` only when `today >= end_date` **and** every `daily_check_ins` row is `done` or `missed`. A final day still in `pending_validation` blocks success until resolved or marked `missed` by the deadline sweeper.

**Code:** `shouldMarkChallengeSuccessful()` in `supabase/functions/_shared/domain/challenge.ts`

---

### B2 — "Wagers Realized" metric

**Decision:** Count of failed challenges where the challenger **settled** the wager (status `closed` after failure).

Interpretation: wagers the challenger **paid out** (lost the challenge and completed settlement).

---

### B3 — Wager Settlement Ratio denominator

**Decision:** (a) All failed challenges for the user as challenger.

`ratio = (challenges with status closed after failed) / (challenges with status failed or closed) × 100`

Unsettled failed challenges count in the denominator but not the numerator.

**Zero case (2026-07-07):** When `challenges_created = 0` or no failed/closed wagers exist, return **0%** (not 100%).

---

### B4 — Longest Streak

**Decision:** (b) Longest unbroken run of consecutive `done` check-in days within a **single** challenge; reported as the maximum across all challenges.

---

### B5 — Concurrent check-ins after provisional advance

**Decision:** Challenger **may** submit the next day's check-in before the prior day is fully resolved (Pooja scenario).

---

### B6 — Media deletion on rejection

**Decision:** (a) Media deleted only after **every** active companion has submitted Accept or Reject.

---

### B7 — Wager settlement media deletion

**Decision:** Retained permanently after approval (no automatic deletion).

---

### B8 — 24-hour makeup window

**Decision:** (c) 24 hours from the rejection timestamp, **per rejected day** (each pending day gets its own makeup deadline).

---

## Auth & onboarding (I3)

**Decision (updated 2026-07-07):** Align with PRD User Stories 10–11.

| Flow | V1 behaviour |
|------|----------------|
| **Sign up (US 10)** | Welcome → Sign Up form (first/last name, country, phone, email, password) → duplicate check by **phone** → Supabase `signUp` (email + password + metadata) → **phone OTP** verify → profile row via `handle_new_user` trigger |
| **Login (US 11)** | Phone + **password** (lookup `profiles.email` by phone, then `signInWithPassword`) |
| **Future login** | Phone OTP only (no password) |
| **Profile name** | Read-only `first_name` + `last_name` from signup; no manual display-name editor in V1 |
| **Avatar** | Not in V1 |

**Dev testing:** `EXPO_PUBLIC_DEV_SKIP_AUTH=true` shows shortcut buttons on welcome screen; dev users seeded with phones `+919000000001` / `+919000000002`.

**Schema:** `profiles.first_name`, `last_name`, `email`, `country`, `phone_country_code`, unique `phone`.

**RPCs:** `check_phone_registered`, `get_login_email_by_phone`.

---

## SMS invites (I4)

**Decision:** Generic app download link via Twilio. No pre-association; invitee registers normally and companion request must still be accepted in-app.

---
