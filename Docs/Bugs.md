# Bug tracker — QA fixes (2026-07-07)

| Bug | Status | Fix |
|-----|--------|-----|
| 1 — Challenges RLS | **Fixed** | Migration `20260707120008_fix_rls_recursion.sql` |
| 4 — Companion RLS | **Fixed** | Same migration |
| 2 — Create form validation | **Fixed** | `app/src/lib/challenge-validation.ts` + create screen |
| 3 — Create button blocked | **Fixed** | Migration `20260707120011_seed_dev_profiles.sql` + inline errors |
| 4 — Profile name input | **Fixed** | US 10 schema + read-only profile name |
| 5 — Wager ratio 100% | **Fixed** | Migration `20260707120010_profile_stats_ratio_fix.sql` |
| 6 — Companion request card | **Fixed** | `CompanionRequestCard` + layout order in companion tab |
| 7 — Companion live cards | **Fixed** | `CompanionChallengeCard` + challenger profile fetch |
| 8 — Check-in proof upload | **Fixed** | `upload.ts` ImagePicker + `UploadResult`; no false success |
| 9 — Tabs hidden on overview | **Fixed** | Challenge overview moved under `(tabs)/challenge/[id]` |

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


---

## Bug 6 - Accepting Companion Request: 
where: Companion section, new companion request created
Current behaviour: the companion request currently doesn't show all the details mentioned in user story 7, currently only showing Challenge name, Wager. Moreover the request is now being shown above the tags which is incorrect. Tags will always remain above all the requests
Expected Behaviour - match the requirements mentioned in user story 7

**RCA:** Companion tab rendered pending requests before Live/Past filter chips. Request cards used inline JSX with only name and wager; challenger name and date range were not fetched from `profiles`.

**Fix:** Live/Past filters render first in `ListHeaderComponent`. New `CompanionRequestCard` shows challenger name, challenge name, wager, and date range. Batch-load challenger profiles via `formatProfileName()`.

**Files:** `app/app/(tabs)/companion.tsx`, `app/src/components/CompanionRequestCard.tsx`, `app/src/lib/challenge-display.ts`

---

## Bug 7 - Viewing challenge as a companion
Where: Challenges section -> view live challenges
Current Behaviour : when a live challenge is visible to a companion, it doesn't show all the details mentioned in user story 7
Expected behaviour - match the requirements mentioned in user story 7 

**RCA:** Companion tab reused generic `ChallengeCard` built for challengers; missing challenger name, progress context, and “time left to verify” for pending proofs.

**Fix:** New `CompanionChallengeCard` with challenger name, progress bar, card status, verify deadline countdown, and CTA. Companion tab loads today's check-ins and done counts per challenge.

**Files:** `app/app/(tabs)/companion.tsx`, `app/src/components/CompanionChallengeCard.tsx`, `app/src/lib/challenge-display.ts`

---

## Bug 8 - Submitting proof of work as a challenger
Where - challenge overview - submit proof of work
Current Behaviour: I click on Check in -> the media selection component opens up -> I select media and that is the end of the flow. The proof of work is not being submitted
Expected Behaviour: when the user submits the proof of work, it should go to the companion for approval

**RCA:** `DocumentPicker` + silent early returns on cancel left the UI showing no feedback and upload often failed on native/web without completing storage PUT + `submit_check_in`. Success alert could fire even when upload did not finish.

**Fix:** Replaced picker with `expo-image-picker`. Upload via signed URL (`FileSystem.uploadAsync` on native, `fetch` PUT on web). Returns typed `UploadResult`; overview only shows success after `submit_check_in` succeeds and shows errors otherwise. Button shows loading state while uploading.

**Files:** `app/src/lib/upload.ts`, `app/app/(tabs)/challenge/[id].tsx`

---

## Bug 9 - Bottom tabs/ sections disappear on challenge overview

Where: challenge overview as a companion
Current behaviour: as a companion when I open the a challenge, tabs (Companion , Challenge, Profile) disappears
Expected Behaviour: when the companion enters challnege overview, the 3 tabs to the bottom of the screen should not hidden, it should be visible

**RCA:** Challenge overview lived at root Stack route `app/challenge/[id].tsx`, outside the `(tabs)` layout, so the tab navigator unmounted on navigation.

**Fix:** Moved overview to `app/(tabs)/challenge/[id].tsx` with nested Stack layout. Registered `challenge` tab screen with `href: null` so it stays off the tab bar but inside the tab shell. Removed root Stack screen for `[id]`.

**Files:** `app/app/(tabs)/challenge/_layout.tsx`, `app/app/(tabs)/challenge/[id].tsx`, `app/app/(tabs)/_layout.tsx`, `app/app/_layout.tsx`

