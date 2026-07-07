# Bug tracker — QA fixes (2026-07-07)

| Bug | Status | Fix |
|-----|--------|-----|
| 1 — Challenges RLS | **Fixed** | Migration `20260707120008_fix_rls_recursion.sql` |
| 4 — Companion RLS | **Fixed** | Same migration |
| 2 — Create form validation | **Fixed** | `app/src/lib/challenge-validation.ts` + create screen |
| 3 — Create button blocked | **Fixed** | Migration `20260707120011_seed_dev_profiles.sql` + inline errors |
| 4 — Profile name input | **Fixed** | US 10 schema + read-only profile name |
| 5 — Wager ratio 100% | **Fixed** | Migration `20260707120010_profile_stats_ratio_fix.sql` |

---

## Bug 1 & 4 — RLS infinite recursion (`42P17`)

**RCA:** `challenges` SELECT policy queried `companion_requests`; `companion_requests` SELECT policy queried `challenges` → infinite loop.

**Fix:** `SECURITY DEFINER` helpers `user_has_challenge_read_access()` and `is_challenge_challenger()`; policies call helpers instead of cross-table EXISTS.

**Files:** `supabase/migrations/20260707120008_fix_rls_recursion.sql`

---

## Bug 2 — No create-challenge validation

**RCA:** Validation existed only in Edge Function; client sent raw input.

**Fix:** Frontend validation in `app/src/lib/challenge-validation.ts` with field-level errors on create screen. Server validation retained (including start date ≥ today).

**Files:** `app/app/challenge/create.tsx`, `app/src/lib/challenge-validation.ts`, `supabase/functions/_shared/domain/challenge.ts`

---

## Bug 3 — Create button “does nothing”

**RCA:** (1) Client blocked submit when no companions added. (2) `public.profiles` empty for dev users — phone search failed. (3) Without profile row, FK on `challenger_id` would fail even if API were called.

**Fix:** Seed dev profiles with phones (`+919000000001` challenger, `+919000000002` companion). Inline companion validation on create form. Signup (US 10) creates profiles via trigger for new users.

**Dev QA:** Sign in as challenger → add companion phone `9000000002` → fill form (≥7 day range) → Create.

**Files:** `supabase/migrations/20260707120011_seed_dev_profiles.sql`

---

## Bug 4 (Profile) — Editable display name

**RCA:** Profile built for optional `display_name` input; US 10 requires first/last name at signup.

**Fix:** Schema adds `first_name`, `last_name`, `email`, `country`, `phone_country_code`. Profile shows read-only name. Signup populates via `handle_new_user` trigger.

**Files:** `supabase/migrations/20260707120009_profile_signup_fields.sql`, `app/app/(tabs)/profile.tsx`, US 10 screens

---

## Bug 5 — Wager settlement ratio

**RCA:** `get_profile_stats()` returned `100` when `v_wagers_total = 0`.

**Fix:** Return `0` when `challenges_created = 0` or `v_wagers_total = 0`.

**Files:** `supabase/migrations/20260707120010_profile_stats_ratio_fix.sql`
