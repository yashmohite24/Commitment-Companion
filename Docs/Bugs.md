# Bug tracker — QA fixes (2026-07-07)


| Bug                          | Status    | Fix                                                                 |
| ---------------------------- | --------- | ------------------------------------------------------------------- |
| 1 — Challenges RLS           | **Fixed** | Migration `20260707120008_fix_rls_recursion.sql`                    |
| 4 — Companion RLS            | **Fixed** | Same migration                                                      |
| 2 — Create form validation   | **Fixed** | `app/src/lib/challenge-validation.ts` + create screen               |
| 3 — Create button blocked    | **Fixed** | Migration `20260707120011_seed_dev_profiles.sql` + inline errors    |
| 4 — Profile name input       | **Fixed** | US 10 schema + read-only profile name                               |
| 5 — Wager ratio 100%         | **Fixed** | Migration `20260707120010_profile_stats_ratio_fix.sql`              |
| 6 — Companion request card   | **Fixed** | `CompanionRequestCard` + layout order in companion tab              |
| 7 — Companion live cards     | **Fixed** | `CompanionChallengeCard` + challenger profile fetch                 |
| 8 — Check-in proof upload    | **Fixed** | `upload.ts` ImagePicker + `UploadResult`; no false success          |
| 9 — Tabs hidden on overview  | **Fixed** | Challenge overview moved under `(tabs)/challenge/[id]`              |
| 10 — No back on overview     | **Fixed** | Custom header back button + fallback tab route                      |
| 11 — Challenger name Unknown | **Fixed** | RPC + RLS `profiles_select_challenge_linked`                        |
| 12 — Date format ISO         | **Fixed** | `formatDisplayDate()` across UI; DD-MM-YYYY on create form          |
| 13 — Upload filesystem crash | **Fixed** | `fetch` blob read + PUT upload (no expo-file-system)                |
| 14 — UTC vs challenge TZ     | **Fixed** | `challenge-time.ts`; all client day logic uses `challenge.timezone` |
| 15 — Companion proof view    | **Fixed** | Signed URLs + media in `ActivityFeed`; verify UX (US 9)             |
| 16 — Proof opens externally  | **Fixed** | In-app fullscreen modal via `ProofImageViewer`                      |
| 17 — Slow approve/reject UX  | **Fixed** | Optimistic UI + cached URLs + silent background refresh             |
| 18 — Companion add silent    | **Fixed** | `CompanionPicker` list + inline feedback (US 2)                     |
| 19 — No upload confirmation  | **Fixed** | `ChallengerProofPreview` + inline success + media preview           |


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

---

Bug 10 - Challenge Overview Screen - Back button missing

Where: As a companion -> challenge overview screen

Current behaviour: there is no button to go back to the previous screen

Expected behaviour: on the challenge overview screen there should be a back button to go back to the previous screen

**RCA:** Overview lives on a hidden tab stack with no prior stack entry when opened from Companion/Challenges lists, so React Navigation does not show a default back affordance.

**Fix:** Custom `headerLeft` back button on overview; uses `router.back()` when possible, otherwise replaces to Companion or Challenges tab.

**Files:** `app/app/(tabs)/challenge/[id].tsx`, `app/app/(tabs)/challenge/_layout.tsx`

---

Bug 11: Challenge card challenge name is unknown

Where: as a challenge when I open the companion screen, the challenge card shows the name of the companion as 'unknown'

Current behaviour: name of the challeneger on the challenge card shown as unknown

Expected behaviour: actual name of the challenger should be shown

**RCA:** Companion tab queried `profiles` directly, but RLS only allows `SELECT` on your own row (`profiles_select_own`). Challenger rows are blocked → empty map → `'Unknown'` fallback.

**Fix:** `SECURITY DEFINER` RPC `get_challenge_participant_profiles(p_user_ids)` returns name fields only for users linked via shared challenge/companion request. Companion tab calls RPC instead of direct table select. **Follow-up:** Added RLS policy `profiles_select_challenge_linked` via `user_can_view_profile()` (migration `20260707120013`); companion tab falls back to direct `profiles` select and normalizes embedded `challenges` when PostgREST returns an array.

**Files:** `supabase/migrations/20260707120012_participant_profiles_rpc.sql`, `supabase/migrations/20260707120013_profiles_linked_select_rls.sql`, `app/app/(tabs)/companion.tsx`

---

 Bug 12: date format to be DD-MM-YYYY

Where: everywhere

Current behaviour: date format: YYYY-MM-DD

Expected Behaviour: DD-MM-YYYY

**RCA:** UI rendered raw ISO date strings from the database; create form labels and inputs used YYYY-MM-DD.

**Fix:** Added `formatDisplayDate`, `parseDisplayDate`, and `formatDisplayDateTime` in `challenge-display.ts`. Cards, details, activity feed, and create form display DD-MM-YYYY; API/DB still use ISO internally.

**Files:** `app/src/lib/challenge-display.ts`, `ChallengeCard`, `ChallengeDetails`, `CompanionRequestCard`, `ActivityFeed`, `app/app/challenge/create.tsx`

---

Bug 13: Uploading proof of work leads to failure

Where: challenger uploads daily proof of work

Current behaviour: when I upload the media as a companion I run into the following error:  
ncaught Error  

Method getInfoAsync imported from "expo-file-system" is deprecated.  
You can migrate to the new filesystem API using "File" and "Directory" classes or import the legacy API from "expo-file-system/legacy".  
API reference and examples are available in the filesystem docs:  
[https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/)  

src/lib/upload.ts (61:35)  

59 | let totalSize = 0;  
60 | for (const asset of assets) {  
61 | const info = await FileSystem.getInfoAsync(asset...  
62 |  
63 | if ("info.exists && "size" in info) totalSize += i  
64 | if (totalSize > MAX_MEDIA_BYTES) {  

Call Stack (4)  

pickAndUploadCheckIn  
src/lib/upload.ts:61:35  

handleCheckIn  
app/(tabs)/challenge/[id].tsx:73:22  

Expected behaviour: the cxhallenger should be able to upload the proof of work for check in without errors

**RCA:** Expo SDK 57 deprecates `getInfoAsync` / `uploadAsync` on the main `expo-file-system` import and throws at runtime.

**Fix:** Import from `expo-file-system/legacy` for size checks and binary upload. **Follow-up:** Removed `expo-file-system` entirely; upload now reads blobs via `fetch(uri)` and PUTs to signed URLs (works on web + native without deprecated APIs).

**Files:** `app/src/lib/upload.ts`

---



## Bug 14 — Check-in status stuck on "Missed" after new day

Where: Challenger overview / challenge cards after a missed day when local calendar has rolled over

Current behaviour: After missing yesterday's check-in (life consumed), the new day still shows "Missed" with no Check In button.

Expected behaviour: At midnight in the challenge timezone, today's row (`pending`) should appear with Check In available until daily deadline.

**RCA:** Client used `new Date().toISOString().slice(0, 10)` (UTC calendar date) to load `daily_check_ins`. For timezones ahead of UTC (e.g. Asia/Kolkata), the app kept loading yesterday's `missed` row for hours after local midnight. Server already used `challenge.timezone`.

**Fix:** Added `todayInTimezone()` and helpers in `app/src/lib/challenge-time.ts`. Challenges, companion, and overview screens load today's check-in per challenge timezone; upload sends the same date. Activity feed timestamps use challenge timezone. Create-form validation uses device timezone (stored as `challenge.timezone`).

**Files:** `app/src/lib/challenge-time.ts`, `app/app/(tabs)/challenges.tsx`, `app/app/(tabs)/companion.tsx`, `app/app/(tabs)/challenge/[id].tsx`, `app/src/lib/challenge-validation.ts`, `app/src/components/ActivityFeed.tsx`, [Decisions.md B9](./Decisions.md)

---



## Bug 15 — Companion cannot view proof when verifying (US 9)

Where: Companion Screen → Challenge Overview

Current Behaviour: the companion wants to verify the proof of work but it is not visible in the application, the companion can't take action in this scenario

Expected Behaviour: the companion should be able to view the proof of work while validating it as check-in

**RCA:** `ActivityFeed` loaded `storage_paths` but never fetched signed download URLs or rendered media — only text "Proof submitted (N file(s))". Nested `ScrollView` inside challenge overview could collapse the feed. Accept/Reject showed on all proof rows regardless of check-in status or prior vote.

**Fix:** New `proof-media.ts` resolves signed URLs via Supabase Storage (RLS allows participants). Activity feed renders image previews (or open-file link), highlights pending-validation proofs, shows response count (N/M companions), hides Accept/Reject after this companion voted, and uses a plain `View` (no nested scroll). Overview wraps feed in `feedSection` with min height. **Follow-up:** Storage paths have no file extension (UUID keys); client `createSignedUrl` failed silently. Added `get_proof_download_urls` Edge Function action (service role) and always render V1 uploads as images. **Follow-up 2 (Android):** Proof buried in scrollable feed; URL fetch errors swallowed. Added `PendingProofVerification` card at top of overview for companions, client Storage URL fallback, inline errors + retry, `ProofImageViewer` fullscreen, responsive image sizing.

**Files:** `app/src/lib/proof-media.ts`, `app/src/components/ActivityFeed.tsx`, `app/src/components/PendingProofVerification.tsx`, `app/src/components/ProofImageViewer.tsx`, `app/app/(tabs)/challenge/[id].tsx`, `supabase/functions/challenge-actions/index.ts`

---



## Bug 18 — Companion Add button silent / phone-only picker

Where: Create challenge → Companions section

Current behaviour: Entering a phone number and tapping Add gave no visible feedback. Added companions showed only as truncated UUIDs. Phone-only input did not match PRD (US 2: show available app users).

Expected behaviour: See registered users, search by name or phone, tap to add, see named chips, clear inline success/error messages.

**RCA:** `Alert.alert` for errors/success is unreliable on web. Success state was a cryptic UUID line. V1 used `search_profiles_by_phone` dev shortcut instead of a user list per PRD.

**Fix:** New `CompanionPicker` component with searchable user list, named chips with remove, inline messages. RPC `search_profiles_for_companion` lists/filters invitable profiles. Create screen wired to picker; SMS invite kept for non-users on draft edit. Legacy phone RPC fallback until migration is deployed.

**Files:** `app/src/components/CompanionPicker.tsx`, `app/app/challenge/create.tsx`, `supabase/migrations/20260708120014_search_profiles_for_companion.sql`

## Bug 16 — Proof image opens externally

Where: Companion → Challenge overview → Activity feed → proof thumbnail

Current behaviour: Tapping a proof thumbnail called `Linking.openURL`, opening the signed URL in an external browser.

Expected behaviour: Tap opens the image in-app fullscreen; companion closes the viewer and returns to Accept/Reject on the overview (US 9).

**RCA:** Bug 15 added image previews with `Linking.openURL` as a quick fallback for viewing signed URLs. No in-app modal existed.

**Fix:** New `ProofImageViewer` component (React Native `Modal`, dark backdrop, `resizeMode="contain"`, Close button). `ActivityFeed` sets `fullscreenUri` on image tap instead of opening a link. Non-image files still use "Open file" + external link.

**Files:** `app/src/components/ProofImageViewer.tsx`, `app/src/components/ActivityFeed.tsx`

---



## Bug 17 — Decision slow to register

Where: Companion → Challenge overview → Accept/Reject proof

Current behaviour: After tapping Accept or Reject, the UI took ~5–10 seconds to reflect the decision.

Expected behaviour: Decision should feel instant (<1s).

**RCA:** After `approve_proof`, `ActivityFeed.load()` re-fetched the entire feed sequentially (6+ Supabase round trips), then called `get_proof_download_urls` for every proof even though signed URLs had not changed. `setLoading(true)` replaced the feed with a spinner during reload.

**Fix:** Optimistic UI updates vote state immediately on tap. Signed URL cache (`useRef`) only fetches URLs for proofs missing from cache. Initial load parallelizes independent queries. Post-approve refresh runs silently (no full-screen spinner, no URL re-fetch). Overview header refreshes via `onProofDecision` callback when proof resolves.

**Files:** `app/src/components/ActivityFeed.tsx`, `app/app/(tabs)/challenge/[id].tsx`

---

## Bug 19 — No upload confirmation or preview for challenger

Where: Challenger → Challenge overview → Check In

Current behaviour: After uploading proof photos, no visible confirmation (Alert unreliable on Android). No preview of submitted media on the overview.

Expected behaviour: On successful upload, show inline "Upload Successful" confirmation and image preview of uploaded proof. Preview persists while pending companion verification.

**RCA:** Success used `Alert.alert`, which is unreliable on Android/web (same class of issue as Bug 18 companion Add). Overview had no challenger-facing proof preview card — media only appeared buried in collapsed Activity feed.

**Fix:** `pickAndUploadCheckIn` returns local `previewUris` for immediate display. New `ChallengerProofPreview` card on overview shows green success banner, image thumbnails (local URIs first, then signed URLs from storage), fullscreen tap via `ProofImageViewer`, and pending-verification status. Success banner auto-dismisses after 6s; preview card remains until check-in resolves.

**Files:** `app/src/components/ChallengerProofPreview.tsx`, `app/app/(tabs)/challenge/[id].tsx`, `app/src/lib/upload.ts`