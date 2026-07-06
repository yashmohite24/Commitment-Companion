# Commitment App — Open Questions

> Items that are ambiguous, incomplete, or contradictory in the PRD. **Do not implement against these until resolved with product.** Track decisions here once answered.

---

## Blocking (must resolve before implementation)

### B1. End date vs. pending validation on final day

If the challenge End Date is reached but the final day's check-in is still in **Pending Validation** (companions haven't all approved), is the challenge:

- (a) Successful (deadline met, proof submitted)?
- (b) Pending until validation completes?
- (c) Failed?

**Impact:** Challenge lifecycle state machine, success/failure transitions.

---

### B2. "Wagers Realized" metric definition

PRD states: *"Number of challenges in which the user was a challenger and won the wager, that is, the challenge was failed by the challenger."*

This appears contradictory — if the Challenger failed, they **lost** the wager, not won it.

**Clarify:** Does this metric mean:
- (a) Wagers the Challenger **paid out** (lost challenges)?
- (b) Wagers the Challenger **kept** (completed challenges)?
- (c) Something else?

**Impact:** ProfileStats computation.

---

### B3. Wager Settlement Ratio denominator

*"Wager Settlement Ratio = (Number of wagers settled / Total number of wagers) × 100"*

**Clarify:** What is "Total number of wagers"?
- (a) All failed challenges?
- (b) All challenges that had a wager field (regardless of outcome)?
- (c) Only failed challenges where settlement was required?

**Impact:** ProfileStats computation.

---

### B4. Longest Streak scope

*"Maximum time spent without breaking a challenge"*

**Clarify:**
- (a) Longest consecutive successful days across all challenges (global calendar streak)?
- (b) Longest unbroken period within a single challenge?
- (c) Longest period without any failed challenge?

**Impact:** ProfileStats computation.

---

### B5. Post-deadline provisional advance — can Challenger submit next day's check-in?

When day N is provisionally advanced (companions didn't all approve before deadline) and day N+1 begins:

- Can the Challenger submit day N+1's check-in before day N is resolved?
- Or must day N be resolved first?

**Impact:** Concurrent check-in handling, card CTA logic.

---

### B6. Media deletion timing when companions disagree

User Story 9 states media is deleted *"once all the companions act on the media"* and when the check-in is *"completely accepted or rejected."*

Earlier PRD rules state a single rejection means the submission stands rejected immediately.

**Clarify:**
- (a) Is media deleted only after **every** Companion has submitted Accept or Reject (even if one already rejected)?
- (b) Or is media deleted as soon as the outcome is determined (e.g., first rejection)?

**Impact:** Media lifecycle job, companion review window, activity feed rendering.

---

### B7. Wager settlement media deletion

User Story 9 specifies automatic media deletion for **check-in** Proof of Work only.

**Clarify:** Is wager settlement proof media also deleted after all Companions approve? Or retained permanently?

**Impact:** Media Service, WagerSettlement entity lifecycle.

---

### B8. 24-hour makeup window scope

When a proof is rejected after the deadline, the Challenger gets *"an additional 24 hours for submitting the new proof of work."*

**Clarify:**
- (a) 24 hours per rejected day (if Pooja scenario creates 2 pending days, each gets 24h)?
- (b) 24 hours total regardless of how many days are pending?
- (c) 24 hours from the rejection timestamp?

**Impact:** Deadline sweeper, makeup check-in logic.

---

## Important (should resolve before relevant feature)

### I1. Incomplete PRD text

- Line 14: *"The idea is to just create a"* — sentence is truncated.
- Line 19: *"Companion: the observers who are looking to"* — definition is incomplete.

**Impact:** Product positioning and onboarding copy.

---

### I2. Number of media items per check-in

Challenge Card references *"number of media items restricted to the number configured while taking in the challenges"*, but the creation form has **no field** for max media count.

**Clarify:** Is there a max media count per submission? If so, what is the default and max?

**Impact:** Upload validation, creation form.

---

### I3. Authentication & onboarding flow

The PRD mentions Log Out but does not describe registration, login, or identity verification.

**Clarify:**
- Phone OTP? Email? Social login?
- Required profile fields (name, avatar)?
- Onboarding flow after first login?

**Impact:** Auth module design. *(Architecture assumes phone/OTP via Supabase Auth — confirm.)*

---

### I4. SMS invite flow for non-users

Users can *"trigger an invite to non-users via text message."*

**Clarify:**
- What does the SMS contain (app store link, deep link, invite code)?
- Does the invite pre-associate the user as a companion, or is it a generic app download link?
- What happens if the invitee registers after the 24-hour companion acceptance window?

**Impact:** SMS integration, companion request lifecycle.

---

### I5. Contact list permissions and matching

The PRD Create Challenge form specifies selecting from the **contact list** who are on the app. User Story 2 also references users available on the application.

**Clarify:**
- How are contacts matched to app users (phone number)?
- Is contact list access required, or is in-app search also supported?
- What happens if a contact has multiple phone numbers?

**Impact:** Mobile permissions, companion selection UI.

---

### I6. Notification channels & complete event list

Notifications are mentioned for companion-leave and verification events, but the full list is not specified.

**Clarify:**
- Push only, or also in-app, email, SMS?
- Full list of notification-worthy events?
- Can users configure notification preferences?

**Impact:** Notification service design. *(Architecture defines a V1 minimum set — confirm with product.)*

---

### I7. Companion leaves after challenge failure

If a Companion leaves after the challenge has failed but before wager settlement is approved:

- Must all **current** (remaining) Companions approve settlement?
- Or must all **original** Companions approve?

**Impact:** Wager settlement approval quorum.

---

### I8. Public/stranger accountability

Problem Statement mentions *"accountability in public, either with strangers or with your friends."* No V1 user story implements stranger/public challenges.

**Clarify:** Is this explicitly deferred to V2, or is there a V1 mechanism not yet documented?

**Impact:** Scope boundary.

---

## Minor (can resolve during implementation)

### M1. Filter naming inconsistency

PRD uses different filter labels in different sections:
- Design section (Challenger): **Active / All**
- User Story 1 (Challenger): **Past** filter (for archived)
- User Story 7 (Companion): **Live / Past**

**Clarify:** Canonical filter labels for Challenger view and Companion view. Is Challenger archived filter labelled "Past" or "All"?

**Impact:** UI copy only.

---

### M7. Message count inconsistency in User Story 7

The PRD Design section and User Story 1 strike through Message Count as not in the current release. User Story 7 Ongoing Challenges still lists Message Count without strikethrough.

**Clarify:** Confirm Message Count is out of scope for both Challenger and Companion views in V1.

**Impact:** Challenge card UI scope.

---

### M2. Status naming inconsistencies

PRD uses varying terms:
- "Challenge Completed" vs. "Challenge Closed" vs. "Challenge Successful"
- "Pending Validation" vs. "Pending Verification" vs. "Verification Pending"
- "Settle Wage" vs. "Settle Wager" (typo in User Story 6)

**Clarify:** Canonical status enum values.

**Impact:** API constants, UI labels.

---

### M3. Challenge name uniqueness

*"Unique name among active challenges per user."*

**Clarify:**
- Case-sensitive or insensitive?
- Are leading/trailing spaces trimmed before comparison?
- Can a user reuse a name from an archived challenge?

**Impact:** Validation logic.

---

### M4. Data and Privacy Policies delivery

Profile section lists *"Data and Privacy Policies"* without specifying format.

**Clarify:**
- External URL?
- In-app static screen?
- PDF download?

**Impact:** Profile section UI. *(Architecture assumes external link — confirm.)*

---

### M5. Google Sheets feedback — ownership & access

*"The message typed here by the user should be added to a dedicated Google Sheet."*

**Clarify:**
- Which Google account owns the sheet?
- Should feedback include user identity (phone, name)?
- Is there an expected response time or acknowledgment to the user?

**Impact:** Feedback service, privacy.

---

### M6. Platform scope confirmation

PRD references Android/iOS flows but does not explicitly state both platforms for V1.

**Clarify:** iOS only, Android only, or both?

**Impact:** Development and testing scope. *(Architecture assumes both — confirm.)*

---

## Decision log

| ID | Question | Decision | Date | Decided by |
|----|----------|----------|------|------------|
| — | — | — | — | — |

> When a question is resolved, move the decision here and remove it from the open sections above.
