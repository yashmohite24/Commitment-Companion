# Commitment App — Software Architecture

> **Related documents:** [Assumptions](./assumptions.md) · [Open Questions](./questions.md) · [PRD](./PRD.md)

---

## Product Summary

The Commitment App helps people follow through on personal commitments by combining social accountability with real stakes. A **Challenger** creates a daily challenge with a defined duration, deadline, optional lives (grace days), and a **Wager**—something they owe their **Companions** if they fail. Each day, the Challenger submits **Proof of Work** (photos, videos, voice recordings, or documents) before a configured daily deadline. **Companions** review and must unanimously approve each submission for the day's check-in to count. Once all Companions have acted on a submission, the check-in is resolved and the media is automatically deleted; a **CheckInLog** entry remains in the activity feed. If the Challenger misses a deadline, a life is consumed (if configured); when lives are exhausted, the challenge fails. Failed challenges require the Challenger to upload proof of wager settlement, which Companions must also approve before the challenge closes. The app provides a three-tab experience—**Challenges**, **Companion**, and **My Profile**—with challenge cards, a challenge overview activity feed (chat-style layout, no text messaging in V1), approval widgets, push notifications, and profile statistics.

---

## Product Goals

### What problem does this app solve?

Making commitments is easy; sustaining them is hard. The app addresses the gap between intention and follow-through by making commitments visible to others, requiring daily evidence of progress, and attaching social and material consequences (wagers) to failure.

### Who is it for?

People who want external accountability to maintain daily habits or goals—typically friends who invite each other as Companions. V1 workflows center on selecting companions from contacts who are on the app; public/stranger accountability is out of scope for V1 (see [assumptions.md](./assumptions.md)).

---

## Core User Roles

### User (base account)

Every registered person has a single account. Roles are **relational**, not fixed: the same user can be a Challenger on their own challenges and a Companion on others' challenges.

### Challenger

- Creates challenges (name, dates, wager, lives, daily deadline, companions).
- Submits daily Proof of Work before the deadline.
- Resubmits Proof of Work after companion rejection (until deadline rules apply).
- Settles the wager (uploads proof) when a challenge fails.
- Views challenge overview activity feed for their challenges.
- Views their challenges (live and archived) and profile statistics.

**Cannot** edit a challenge once it is created, except draft challenges that failed to activate (see User Story 2 in PRD).

### Companion

- Receives and accepts/rejects companion requests.
- Reviews and approves or rejects Proof of Work submissions (unanimous approval required among active Companions).
- Reviews and approves wager settlement proof after a failed challenge.
- Views challenge overview activity feed for companion challenges.
- May leave a live challenge if at least one other Companion remains.
- Views companion requests, ongoing companion challenges (live/past), and profile statistics.

---

## Functional Requirements

### Navigation & layout

- Three main sections: **Companion | Challenges | My Profile** (bottom navigation).
- App opens by default on the **Challenges** section.

### Challenges section (Challenger view)

- Display live/ongoing challenges as cards (PRD specifies infinite scroll; with a 5-challenge cap a flat list is sufficient).
- Filter tags: **Active** (default) and **Past** for archived/expired challenges (Design section also references **All** — see [questions.md](./questions.md)).
- Button to create a new challenge.
- Each challenge card shows: name, progress bar/percentage, lives (if applicable), check-in status, contextual CTA.
- ~~Message count~~ — **not in current release** (deferred to later version per PRD).
- Cards are clickable and open Challenge Overview.
- Failed challenges with unsettled wagers remain visible until wager is settled, then auto-archived.

### Challenge creation

- Form fields: Challenge Name (200 chars), Start Date (today or later), End Date (≥ 7 days after start), Daily Deadline (default 11:59 PM), Wager (300 chars), Lives (integer, < half of challenge duration), Companions (max 10).
- Validations: unique name among active challenges per user; max 5 active challenges; max 10 companion requests/companions per challenge; at least one companion must accept.
- Select companions from contact list who are on the app; invite non-users via text message.
- Companion requests must be accepted within 24 hours after challenge start date; non-responders are excluded.
- If no companion accepts: challenge remains as **draft** with message *"Challenge couldn't be created since no companions accepted the request"*; user may edit start date, companions, or delete.
- Once activated (non-draft), challenge is **not editable**.

### Daily check-in & Proof of Work

- V1 focuses on **daily** challenges only.
- Challenger submits Proof of Work before the daily deadline via Challenge Card CTA or Challenge Overview.
- Media types: photos, videos, voice recordings, documents (platform-native picker acceptable).
- Multiple files allowed, total size limit **20 MB** per submission.
- Submitted Proof of Work cannot be changed after submission.
- After submission, status becomes **Pending Validation** / **Pending Verification**.
- Upload disabled after deadline; failure or life consumption applies per rules.

### Companion approval of Proof of Work

- **All active Companions** must approve for a valid check-in.
- **Any single rejection** rejects the submission; Challenger may resubmit until deadline (unlimited resubmissions before deadline).
- If not all Companions approve before deadline: challenge provisionally advances to next day; late approval/rejection rules apply (including 24-hour extension for resubmission after post-deadline rejection).
- Approval status widget shows count (e.g., 4/6) with companion names and status.
- **Once all Companions have acted** on a submission and the check-in is completely accepted or rejected, the media is **automatically deleted** from storage and removed from the activity feed. A **CheckInLog** entry remains (e.g., *"Check In Verified [Media Automatically deleted]"* or *"Check In Rejected [Media Automatically deleted]"*).

### Lives

- Optional safety mechanism: one life consumed per missed daily Proof of Work submission.
- Challenge fails when lives are exhausted and another day is missed.
- Challenge success is unaffected by lives used during the challenge.

### Challenge states

- Check-in Pending
- Pending Validation
- Check-in Done
- Check-in Missed (saved by a life)
- Challenge Failed, Settle Wager
- Challenge Closed (wager settled)
- Challenge Successful

### Challenge end conditions

1. End date reached (success if all daily check-ins satisfied).
2. Challenger fails (no lives remaining and missed check-in).
3. Wager settled and challenge closed (after failure).

### Challenge overview / activity feed

- Timeline-style interface (chat-like layout) with date separators; **text messaging is not in the current release** (User Story 4 deprioritised for V1).
- Fixed Challenge Details header (shared component with card details).
- Custom activity widgets: Proof of Work upload, Check-in Approval (Companions only), Approval Status, Lives Remaining, CheckInLog entries, system messages (e.g., companion left).
- Proof of Work media appears in the feed until all Companions have acted and the check-in is resolved; then media is removed and replaced by a CheckInLog entry.

### Companion section

- **Companion Requests**: challenger name, wager, challenge name, dates, duration; Accept/Reject actions.
- **Ongoing Challenges**: challenger name, challenge name, completion %, CTA, time left to validate, status; Live/Past filters.
- ~~Message count~~ — **not in current release** (deferred per PRD Design section).
- Companion may leave a challenge (if not the only companion) with confirmation; activity feed and notifications reflect departure.
- Companions **cannot** be added to a live challenge after creation.

### Wager settlement

- On failure, Challenger uploads proof of wager settlement (media, up to 20 MB).
- All active Companions must approve; **no time limit** for companion validation.
- Challenge closes only after unanimous approval of wager settlement proof.
- Whether wager settlement media is deleted after approval is **not specified in the PRD** — see [questions.md](./questions.md).

### Profile section

**User data (computed statistics):**

| Metric | Logic |
|--------|-------|
| Consistent Since | Days with accepted Proof of Work (excludes life-save days) |
| Longest Streak | Maximum unbroken successful challenge period |
| Wager Settlement Ratio | (Wagers settled / Total wagers) × 100 |
| Number of Challenges | Total challenges created |
| Challenges Companioned | Count of challenges as Companion |
| Wagers Realized | Per PRD wording — see [questions.md](./questions.md) |

**Company data:**

- Data and Privacy Policies
- Provide feedback (header + message → Google Sheet)
- Log out

### Notifications

- Push notifications via Expo when Companions leave a challenge and on Proof of Work verification events (per User Story 9).
- Notification events defined in [Domain Logic](#domain-logic) section below.

### Deferred to later version (explicitly out of V1 scope)

- **Text messaging** between Challenger and Companions (User Story 4 deprioritised for V1).
- **Message count** on challenge cards.
- **Supabase Realtime** — not required; see [V1 Implementation Simplifications](#v1-implementation-simplifications).
- **In-app notification inbox** — push notifications only in V1.

---

## Non-Functional Requirements

### Performance

- Challenge list loads all active challenges in one query (max 5 per user).
- Media uploads up to **20 MB** via Supabase Storage signed upload URLs issued by Edge Functions.
- Challenge status and approval updates: user pulls to refresh or screen refetches on focus; Expo push for events when app is backgrounded.
- Profile statistics computed via SQL queries when the Profile tab is opened.
- Media served via Supabase Storage signed URLs while Proof of Work is pending verification.

### Reliability

- **Daily deadline enforcement** is server-authoritative; missed deadlines trigger life consumption or challenge failure correctly even if the client is offline or closed.
- Deadline enforcement uses **`pg_cron`** invoking a single scheduled Edge Function (see [assumptions.md](./assumptions.md)).
- Duplicate submissions prevented by **database unique constraints** (e.g., one approval per companion per proof submission).
- **24-hour companion acceptance window** after challenge start enforced by the scheduled job.
- Failed challenges remain visible until wager settlement is complete.
- **Media deletion** runs inline when the last companion acts on a proof submission; deletion is retried on failure.

### Security

- Challenge overview content, Proof of Work media, and wager settlement proof accessible only to active challenge participants via **Row Level Security**.
- Media uploads use **scoped signed upload URLs** issued by Edge Functions; clients cannot upload to arbitrary paths.
- Authentication via Supabase Auth (see [assumptions.md](./assumptions.md)).
- SMS invite calls rate-limited in Edge Function.
- Uploaded files validated for type and size (≤ 20 MB) in Edge Functions.
- Feedback writes to Google Sheets are server-side only; no credentials exposed to clients.
- Trust model is **social, not cryptographic** — proof authenticity is companion-validated; abuse cases are scoped in [assumptions.md](./assumptions.md).

### Scalability

- V1 limits: 5 active challenges per user, 10 companions per challenge, daily challenges only.
- Supabase handles database and storage; no custom server infrastructure.
- Ephemeral check-in media reduces long-term storage growth.

### Offline behaviour

- V1 is **online-first** (see [assumptions.md](./assumptions.md)).
- Clients retry failed uploads on reconnect; server enforces deadline at submission receipt time.

---

## Core Entities

> Entity descriptions only — database schema is a separate design phase.

### User

A registered app account. Holds profile identity and device push token.

### Challenge

A commitment created by a Challenger with name, start/end dates, daily deadline time, wager description, lives count, timezone, and lifecycle status (`draft`, `active`, `successful`, `failed`, `closed`). Immutable after activation.

### CompanionRequest

An invitation sent to a prospective Companion when a challenge is created. Has accept/reject actions and a 24-hour acceptance window measured from challenge start date.

### ChallengeParticipation

The relational link between a User and a Challenge as Companion. Tracks active/left status and join/leave timestamps. A challenge requires at least one active Companion at all times.

### DailyCheckIn

Represents one calendar day within a challenge's duration (inclusive of start through end date). Holds day-level status (`pending`, `pending_validation`, `done`, `missed`). Multiple ProofOfWork submissions may exist per day (resubmissions after rejection).

### ProofOfWork

A media submission by the Challenger for a specific daily check-in. Immutable after submission. Media stored in Supabase Storage (≤ 20 MB total). **Media files are deleted from storage once all Companions have acted and the check-in is resolved.** Row retained with `media_deleted_at` timestamp.

### Approval

A Companion's accept/reject decision on a specific ProofOfWork submission. One row per companion per submission (enforced by unique constraint). Unanimous acceptance among **active** Companions required for check-in completion.

### CheckInLog

An activity-feed entry recording the outcome of a resolved check-in after media deletion (e.g., *"Check In Verified [Media Automatically deleted]"* or *"Check In Rejected [Media Automatically deleted]"*).

### SystemMessage

A simple activity-feed entry for non-check-in events (e.g., companion left, challenge failed). Required by PRD to update the overview when a companion departs.

### WagerSettlement

Proof uploaded by the Challenger after challenge failure, demonstrating fulfillment of the wager obligation.

### WagerSettlementApproval

A Companion's accept decision on a WagerSettlement. All active Companions must approve for the challenge to close.

### Feedback

User-submitted header and message from the Profile section, written to Google Sheet via Edge Function (PRD requirement).

### Life

Configured on a Challenge as `lives_total` and `lives_consumed`. One life consumed per missed daily deadline.

---

## Domain Logic

The check-in/approval/deadline rules are the **core product risk**. All rules below are enforced in **Edge Functions** — clients never mutate domain state directly.

### Stored status (two layers)

| Layer | Stored on | Examples |
|-------|-----------|----------|
| **Challenge lifecycle** | `challenges.status` | draft, active, successful, failed, closed |
| **Daily check-in** | `daily_check_ins.status` | pending, pending_validation, done, missed |

**Card status and CTA** (Check In, Verify, Settle Wager) are derived in the **mobile app** from stored status, viewer role (Challenger or Companion), and current time. No server-side projection layer — with max 5 challenges and straightforward status enums, client derivation is sufficient and avoids an extra service.

### State machine (DailyCheckIn)

```
                    ┌──────────────────────────────────────┐
                    │           CHECKIN_PENDING            │
                    └──────────────┬───────────────────────┘
                                   │ proof submitted
                                   ▼
                    ┌──────────────────────────────────────┐
                    │        PENDING_VALIDATION            │
                    └──┬──────────┬──────────┬─────────────┘
           all approve │          │ any reject│ deadline passes
                       ▼          ▼           │ (no unanimous approval)
              ┌────────────┐ ┌─────────┐     ▼
              │ CHECKIN_DONE│ │CHECKIN_ │  provisional advance
              └─────┬──────┘ │ PENDING │  to next day (see PRD)
                    │        └────┬────┘
                    │             │ resubmit
                    │             ▼
                    │      PENDING_VALIDATION
                    │
                    │  all companions acted → delete media → write CheckInLog
                    ▼

  deadline passes, no valid approved check-in:
    lives remain  →  CHECKIN_MISSED  (life consumed, challenge continues)
    no lives left →  CHALLENGE_FAILED
```

Post-deadline rejection triggers a **24-hour makeup window** for that specific day. Multiple days may require simultaneous submissions (Pooja scenario).

### Media lifecycle (Proof of Work)

1. Client calls Edge Function → receives scoped signed upload URL → uploads to Supabase Storage.
2. Edge Function creates `ProofOfWork` record; activity feed shows media widget (query pending proofs).
3. Each Companion submits Accept or Reject via Edge Function (creates `Approval` row).
4. When **all active Companions have acted** and outcome is determined:
   - Edge Function deletes Storage objects inline.
   - Sets `proof_of_work.media_deleted_at`.
   - Inserts `CheckInLog` row.
   - Updates `daily_check_ins.status`.

See [questions.md](./questions.md) for ambiguities on deletion timing when companions disagree.

### Activity feed (query-based, not event-sourced)

The feed is a **paginated query** over three tables — no event log, no projection layer:

| Source | Shows when |
|--------|------------|
| `proof_of_work` (where `media_deleted_at IS NULL`) | Pending verification — media widget + approval controls |
| `check_in_logs` | After check-in resolved — verified/rejected message |
| `system_messages` | Companion left, challenge failed, etc. |

Ordered by `created_at`. Refreshed on pull-to-refresh or screen focus.

### Approval quorum

- Unanimous approval required among **currently active** Companions only.
- When a Companion leaves, their pending approvals are voided; quorum recalculated in Edge Function.
- No mid-challenge companion addition in V1.

### Deadline enforcement

- Daily deadline interpreted in the **Challenge's configured timezone** (see [assumptions.md](./assumptions.md)).
- **`pg_cron`** invokes the `scheduled-jobs` Edge Function every minute to process overdue check-ins, send deadline reminders, and expire companion requests.
- Processing is idempotent: a check-in already marked `missed` or `done` is skipped.

### Push notification events (V1)

| Event | Recipients |
|-------|-----------|
| Companion request received | Invited Companion |
| Proof of Work submitted | All active Companions |
| Proof of Work approved (all) | Challenger |
| Proof of Work rejected | Challenger |
| Check-in deadline approaching (1 hr) | Challenger |
| Life consumed | Challenger + Companions |
| Challenge failed | Challenger + Companions |
| Wager settlement submitted | All active Companions |
| Challenge closed (wager settled) | All participants |
| Companion left | Challenger + remaining Companions |

Delivered via **Expo push** from Edge Functions. No persisted in-app notification inbox in V1.

---

## V1 Implementation Simplifications

Components removed from earlier architecture drafts. Business rules are unchanged; only implementation complexity was reduced.

| Removed | Why unnecessary for V1 | Simpler alternative |
|---------|------------------------|---------------------|
| **ChallengeEvent / event sourcing** | No PRD requirement for audit replay, analytics pipeline, or chat history reconstruction. Adds a write path for every action. | Direct rows in `proof_of_work`, `check_in_logs`, `system_messages`; feed is a query. |
| **Projection Service** | Max 5 challenges, ~8 status values, 2 viewer roles. A server-side projection layer is overhead for combinatorics this small. | Client helper derives card CTA from `challenges.status` + `daily_check_ins.status` + viewer role. |
| **ProfileStats materialization** | Six stats over a tiny dataset per user at MVP scale. Async invalidation adds an Edge Function and bug surface. | SQL aggregate queries run when Profile tab opens. |
| **Supabase Realtime** | No chat, no collaborative editing. Approval updates happen on a single overview screen. | Pull-to-refresh + refetch on screen focus; Expo push when backgrounded. |
| **Seven Edge Functions** | Each function adds deploy config, auth boilerplate, and local dev setup. Domain actions share the same auth and DB context. | **Three functions:** `challenge-actions`, `scheduled-jobs`, `submit-feedback`. |
| **Separate media-deletion function** | Deletion is always the last step of the approval flow, not an independent trigger. | Inline Storage delete inside `challenge-actions` when last companion acts. |
| **Client idempotency keys** | Low traffic; double-tap risk handled more simply at the DB layer. | Unique constraints: `(proof_of_work_id, companion_id)` on approvals. |
| **Persisted notification inbox** | PRD requires notifications, not an in-app notification center. | Expo push only; `users.expo_push_token` column. |
| **Redis / cache layer** | Not applicable with Supabase-only stack; no cache invalidation problem at MVP scale. | Direct PostgreSQL reads. |

---

## Major User Flows

### 1. View challenges as Challenger

Open app → Challenges tab (default) → fetch challenges query → optionally switch to Past filter → tap card → Challenge Overview.

### 2. Create a challenge

Challenges tab → Create Challenge → fill form → select/invite companions → `challenge-actions` Edge Function creates challenge + companion requests → wait for acceptances within 24h of start → activates if ≥ 1 companion accepts, otherwise remains draft.

### 3. Companion request response

Companion tab → Companion Requests → Accept or Reject via `challenge-actions` → request removed from list.

### 4. Daily check-in (Proof of Work submission)

Challenger → Check In CTA → `challenge-actions` returns signed upload URL → upload media → Edge Function creates ProofOfWork + sets check-in to `pending_validation` → feed shows media widget.

### 5. Companion Proof of Work verification

Companion → view pending submission → Accept or Reject via `challenge-actions` → when all active Companions have acted: media deleted inline, CheckInLog written, check-in status updated.

### 6. Deadline miss & life consumption

Deadline passes → `scheduled-jobs` fires → if lives remain: consume life, mark `missed`; if no lives: mark challenge `failed`.

### 7. Delayed companion approval (provisional next-day advance)

Not all Companions approve before deadline → provisionally advance to next day → late approval/rejection triggers PRD follow-up rules (24h makeup window, stacked check-ins).

### 8. Challenge success

All daily check-ins satisfied through end date → challenge marked `successful` → appears in Past filter.

### 9. Challenge failure & wager settlement

Missed check-in with no lives → `failed` → Challenger uploads settlement proof via `challenge-actions` → Companions approve → challenge marked `closed` → auto-archived.

### 10. View challenge activity feed

Open overview → query feed (pending proofs + check-in logs + system messages) → pull-to-refresh.

### 11. View & manage companion challenges

Companion tab → requests + ongoing challenges → Live/Past filters → Verify CTA when validation pending.

### 12. Leave challenge as Companion

Overview → Leave → confirm via `challenge-actions` → SystemMessage inserted → push sent to others.

### 13. View profile

Profile tab → SQL queries compute stats → display results.

### 14. Submit feedback

Profile → Provide feedback → `submit-feedback` Edge Function writes to Google Sheet.

---

## Technical Challenges

1. **Check-in state machine in Edge Functions** — All PRD scenarios including Pooja case, provisional advance, and makeup windows in one `challenge-actions` function.
2. **Row Level Security** — Correct participant-scoped policies across challenges, check-ins, proofs, and storage paths.
3. **Deadline sweeper reliability** — `pg_cron` + Edge Function must handle timezones and idempotent processing.
4. **Media upload trust boundary** — Signed upload URLs scoped to a pending proof; server validates before marking visible.
5. **Media deletion inline** — Storage delete + CheckInLog insert + status update must succeed or roll back atomically.
6. **Companion departure** — Void pending approvals and recalculate quorum.
7. **Profile stat queries** — Correct SQL for ambiguous PRD definitions (see [questions.md](./questions.md)).

---

## Recommended Tech Stack

| Layer | Recommendation | Why this was chosen |
|--------|---------------|--------------------|
| Mobile App | React Native + Expo | Single codebase for Android and iOS, excellent ecosystem, rapid iteration, strong AI support, and easy integration with native capabilities such as camera, storage, notifications and deep links. |
| Backend Platform | Supabase | The application's complexity lies in business rules, not backend infrastructure. Supabase provides Authentication, PostgreSQL, Storage, Edge Functions and Row Level Security, allowing us to focus on product development instead of backend plumbing. |
| Database | PostgreSQL (Supabase) | The product revolves around strongly related entities such as Users, Challenges, Check-ins, Companions, Approvals and Wagers. A relational database models these relationships naturally while providing strong consistency and transactional guarantees. |
| Authentication | Supabase Auth | Native integration with the database, secure authentication flows, social login support, Row Level Security integration and minimal backend maintenance. |
| File Storage | Supabase Storage | Secure object storage with signed URLs, access control and direct integration with Supabase Authentication. Eliminates the need for managing AWS S3 separately. |
| Background Jobs | `pg_cron` + Edge Function (`scheduled-jobs`) | Deadline processing, life consumption, deadline reminders, and companion-request expiry. No separate worker service or queue. |
| Push Notifications | Expo Notifications | Simplifies push notifications during MVP development while integrating cleanly with Expo. Can later evolve to native FCM/APNs if required. |
| SMS Invites | Twilio | Reliable SMS delivery for inviting contacts who are not yet using the application. Isolated integration with no impact on core architecture. |
| Feedback Collection | Google Sheets API | Matches the PRD requirement while avoiding unnecessary admin dashboard development during MVP. |
| Version Control | Git + GitHub | Source control, collaboration, version history and rollback capability. Essential for AI-assisted development. |
| CI/CD | Expo Application Services (EAS) + GitHub Actions (later) | EAS simplifies mobile builds and deployment. GitHub Actions can be introduced once the project matures. |
| Monitoring | Supabase Dashboard + Expo Dashboard | Provides sufficient observability, logs and analytics for the MVP without introducing enterprise monitoring tools. |

## Architectural Philosophy

This project intentionally prefers **managed services over custom infrastructure** and **simplicity over theoretical scalability**.

- Every component must **directly support a PRD requirement**. If it exists only for future scale or engineering elegance, it is removed.
- Engineering effort goes into the **domain rules** (check-ins, unanimous approvals, lives, provisional advance, wager settlement) — not into event logs, projection layers, cache invalidation, or realtime plumbing.
- Supabase absorbs auth, database, storage, and serverless compute. Expo absorbs mobile builds and push. The solo founder maintains **three Edge Functions** and one Expo app — not a distributed system.
- When in doubt, choose the **fewer moving parts** option. Add complexity only when a concrete PRD requirement or measured pain point demands it.

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Mobile App (React Native + Expo)                   │
│  ┌──────────┐  ┌──────────────┐  ┌─────────┐  ┌──────────────┐ │
│  │Challenges│  │  Companion   │  │ Profile │  │ Media Capture│ │
│  │   Tab    │  │     Tab      │  │   Tab   │  │  & Upload    │ │
│  └────┬─────┘  └──────┬───────┘  └────┬────┘  └──────┬───────┘ │
│       └───────────────┴───────────────┴──────────────┘         │
│         Supabase Client SDK  ·  pull-to-refresh  ·  Expo push  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         Supabase                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────────┐   │
│  │    Auth     │ │  PostgreSQL  │ │       Storage           │   │
│  │             │ │  + RLS       │ │  (Proof of Work media)  │   │
│  └─────────────┘ └──────────────┘ └─────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Edge Functions                                           │   │
│  │  · challenge-actions  (check-in, approve, wager, leave)  │   │
│  │  · scheduled-jobs     (deadlines, reminders, expiry)     │   │
│  │  · submit-feedback    (Google Sheets)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  pg_cron  →  scheduled-jobs (every minute)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────────────┐
    │              External Integrations                 │
    │  Expo Notifications · Twilio · Google Sheets API  │
    └───────────────────────────────────────────────────┘
```

### Frontend (mobile)

- Three-tab navigation with stack navigators per tab.
- Challenge cards: fetch `challenges` + today's `daily_check_ins`; client helper derives status label and CTA.
- Challenge Overview: ChallengeDetails header + paginated feed query (proofs + logs + system messages). Pull-to-refresh. No text input in V1.
- Media upload: Edge Function returns scoped signed URL → client uploads to Storage.
- Expo push for background notifications; refetch data on notification tap.

### Backend (Supabase)

- **PostgreSQL + RLS** — Participant-scoped read access; domain writes go through Edge Functions using service role.
- **`challenge-actions`** — Single Edge Function handling: submit check-in, approve/reject, settle wager, leave challenge, companion request accept/reject, challenge create/activate. Contains all domain state machine logic.
- **`scheduled-jobs`** — Invoked by `pg_cron` every minute: overdue check-in processing, 1-hour deadline reminders, companion-request expiry at 24h post-start.
- **`submit-feedback`** — Writes to Google Sheet (PRD requirement); isolated from domain logic.
- **Storage** — Scoped buckets; signed upload/download URLs issued by Edge Functions; inline delete on check-in resolution.

### Integrations

| Integration | Purpose |
|-------------|---------|
| **Supabase Storage** | Proof of Work (ephemeral) and wager settlement media |
| **Expo Notifications** | Push notifications |
| **Twilio** | SMS invites to non-users (PRD requirement) |
| **Google Sheets API** | User feedback (PRD requirement) |
| **Supabase Auth** | Registration, login, logout |

---

## Folder Structure

```
commitment-app/
├── app/                                 # React Native (Expo) mobile app
│   ├── (tabs)/
│   │   ├── challenges/
│   │   ├── companion/
│   │   └── profile/
│   ├── challenge/
│   │   ├── [id]/                        # Challenge overview / activity feed
│   │   └── create/
│   ├── src/
│   │   ├── components/
│   │   │   ├── challenge/               # ChallengeCard, ChallengeDetails
│   │   │   ├── activity-feed/           # Feed list, proof widget, approval widget
│   │   │   ├── companion/
│   │   │   └── common/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── card-status.ts           # Client helper: derive CTA from stored status
│   │   └── utils/
│   ├── app.config.ts
│   └── eas.json
│
├── supabase/
│   ├── functions/
│   │   ├── challenge-actions/           # All domain mutations
│   │   ├── scheduled-jobs/              # pg_cron: deadlines, reminders, expiry
│   │   └── submit-feedback/             # Google Sheets
│   ├── migrations/                      # Schema + RLS policies
│   └── config.toml
│
├── docs/
│   ├── PRD.md
│   ├── Architecture.md
│   ├── assumptions.md
│   └── questions.md
│
├── package.json
└── README.md
```

---

## Implementation Sequence

1. **Schema + RLS** — All tables, policies, unique constraints.
2. **Domain logic in `challenge-actions`** — Table-driven tests for state machine including Pooja case and media deletion.
3. **Auth + challenge CRUD** — Create, draft lifecycle, companion requests.
4. **Check-in + approval flow** — Upload, approve/reject, inline media delete, CheckInLog.
5. **`scheduled-jobs`** — Deadline sweeper, reminders, companion-request expiry.
6. **Activity feed UI** — Query-based feed with proof widgets and approval controls.
7. **Wager settlement** — Via `challenge-actions`.
8. **Expo push** — Token registration + push from Edge Functions.
9. **Profile stats** — SQL queries on Profile tab.
10. **Companion UI + leave flow**.
11. **Feedback + SMS invites**.

*(Text messaging, message count, Realtime, and in-app notification inbox deferred to post-V1.)*
