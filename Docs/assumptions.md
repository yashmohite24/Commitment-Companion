# Commitment App — Assumptions

> Architectural and product assumptions adopted for V1. These are decisions made in the absence of explicit PRD guidance. If any assumption proves wrong, revisit [Architecture.md](./Architecture.md) before implementation.

---

## Platform & clients

1. **Mobile-only V1.** The PRD references Android/iOS native media flows. V1 targets iOS and Android via React Native (Expo). No web client.

2. **Online-first.** The PRD does not specify offline behaviour. V1 requires network connectivity for all actions except queued media upload retry.

3. **Server-authoritative time.** All deadline enforcement, life consumption, and scheduled transitions are evaluated on the server. Client clocks are not trusted.

---

## Time & deadlines

4. **Challenge timezone is set at creation.** The daily deadline (e.g., 11:59 PM) is interpreted in the timezone captured from the Challenger's device at challenge creation time. The timezone is stored on the Challenge entity and does not change if the Challenger travels.

5. **Daily check-in days are inclusive.** Every calendar day from Start Date through End Date (inclusive) requires a check-in.

6. **Lives = 0 means no lives configured.** The creation form marks Lives as mandatory, but a value of 0 represents the PRD's "Lives NOT Configured" scenario (any miss = immediate failure).

---

## Roles & approvals

7. **Unanimous approval among active Companions only.** When evaluating whether a Proof of Work is approved, only Companions with `active` participation status count. Departed Companions' pending votes are voided upon departure; quorum is recalculated immediately.

8. **Relational roles, not fixed.** A User has no permanent "Challenger" or "Companion" role. Role is determined per-challenge via ownership (Challenger) or ChallengeParticipation (Companion).

9. **No mid-challenge companion addition.** Companions cannot be added to a live challenge after activation (per PRD User Story 8 note).

10. **Minimum one active Companion at all times.** Every active challenge must have ≥ 1 active Companion. The last Companion cannot leave.

---

## Challenge lifecycle

11. **"Active challenges" for the 5-challenge limit** includes: draft challenges awaiting companion acceptance, live/active challenges, and failed challenges with unsettled wagers. Successful and closed challenges do not count.

12. **Draft challenges are editable; active challenges are not.** The only exception to post-creation immutability is a draft that failed to activate (no companion accepted). Drafts can have start date, companions, and other fields edited, or be deleted.

13. **Failed challenges with unsettled wagers appear in the live/active view**, not archived. They auto-archive only after wager settlement is approved by all active Companions.

14. **Challenge success is unaffected by lives used.** A Challenger who consumed lives during a challenge still achieves Challenge Successful if all days are ultimately satisfied.

15. **Progress percentage** = (number of successful check-ins / total challenge duration in days) × 100, rounded to nearest integer. Days not yet reached count in the denominator.

---

## Media & uploads

16. **20 MB limit is per submission (total across all files)**, not per individual file.

17. **Proof of Work metadata is immutable; media files are ephemeral.** Once submitted, a proof record cannot be edited or withdrawn. Rejection allows a new submission (new ProofOfWork record). Media files are **automatically deleted from storage** once all active Companions have acted and the check-in is resolved (accepted or rejected). A CheckInLog entry replaces the media widget in the activity feed.

18. **Platform-native media pickers are acceptable.** V1 does not require custom in-app camera/recording UI; stock Android/iOS flows suffice.

---

## Wager & trust

19. **Wager enforcement is honor-system.** The app records wager terms as text and validates settlement via media proof approved by Companions. There is no payment processing, escrow, or third-party enforcement.

20. **Trust is social, not cryptographic.** Proof authenticity is validated by Companions reviewing media. Malicious rejection or fraudulent proof are out of scope for V1 (no appeal/dispute flow).

21. **Wager settlement has no companion time limit.** Unlike daily check-ins, Companions may take unlimited time to approve wager settlement proof.

---

## Scope exclusions (V1)

22. **Public/stranger accountability is out of scope.** The PRD Problem Statement mentions accountability with strangers, but no V1 user story implements it. V1 supports companion selection from contacts on the app and SMS invite only.

23. **Text messaging is not in V1.** User Story 4 (Chat with companions) is deprioritised for V1. The challenge overview uses a chat-like activity feed layout but has no text input. Message count on challenge cards is deferred to a later version.

24. **No in-app payment or gift card integration.** Wagers are descriptive text only.

---

## Authentication

25. **Phone number + OTP via Supabase Auth.** Registration and login use phone verification. User identity is a phone number. Logout clears the local session.

26. **One account per phone number.**

---

## Notifications

27. **Push notifications via Expo only in V1.** No persisted in-app notification inbox. Device push token stored on the User record.

28. **1-hour deadline reminder.** Sent by `scheduled-jobs` Edge Function if no proof submitted for that day.

---

## Statistics

29. **"Consistent Since" excludes life-save days.** Only days where the Challenger submitted proof that was accepted by Companions count. Days where a life was consumed (missed upload) break consistency.

30. **Profile stats are computed via SQL queries when the Profile tab opens.** No materialized stats table or async recomputation in V1.

31. **Stats are per-user global aggregates**, not per-challenge (except where a metric is inherently per-challenge, like progress on a card).

---

## Integrations

32. **SMS invites use Twilio.** Non-users receive a text with an app download link. Onboarding after invite is a standard registration flow (no pre-registration).

33. **Feedback is appended to a dedicated Google Sheet** via server-side Google Sheets API. The sheet is owned by a service account; credentials are stored as environment secrets.

34. **Companion selection uses the device contact list filtered to app users.** The PRD Create Challenge form specifies selecting from the contact list who are on the app. SMS invite is available for non-users.

---

## Infrastructure

35. **Single Expo app + Supabase project.** No monorepo or shared packages in V1.

36. **Deadline enforcement uses `pg_cron`** invoking the `scheduled-jobs` Edge Function every minute.

37. **All domain mutations run through the `challenge-actions` Edge Function.** Clients read via Supabase client + RLS; they do not write directly to domain tables.

38. **Media uploads use signed URLs issued by Edge Functions**, scoped to a specific proof submission path. Storage objects deleted inline when check-in resolves.

39. **Card status and CTA are derived on the client** from stored `challenges.status` and `daily_check_ins.status` plus viewer role. No server-side projection layer.

40. **Duplicate approvals prevented by database unique constraint** on `(proof_of_work_id, companion_id)`.

41. **No Supabase Realtime in V1.** UI refreshes via pull-to-refresh, screen focus, and Expo push.

---

## Data & privacy

42. **Data and Privacy Policies are external links** opened in an in-app browser (WebView). Content is hosted outside the app.

43. **No automatic data deletion on account deletion in V1.** Account deletion is not specified in the PRD; if added, data retention policy must be defined separately.
