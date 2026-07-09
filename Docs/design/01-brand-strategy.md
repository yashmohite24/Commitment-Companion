# HeroArc — Brand Strategy

**Product name:** HeroArc  
**Tagline:** Show up every day. Everything else follows.  
**Supporting line:** Big goals. Small steps. Every day.  
**PRD reference:** [Docs/PRD.md](../PRD.md)

---

## Messaging shift (core)

HeroArc is not about "keeping promises" as the lead message. The product helps people **achieve meaningful goals by showing up daily** — small consistent steps compound into identity change.

| Before (de-emphasize) | Now (lead with) |
| --------------------- | ---------------- |
| Keep your promise | Reach your goal |
| Promises made | Goals started |
| Accountability as the story | **Showing up** as the mechanism |
| Moral framing (did you keep your word?) | Progress framing (did you show up today?) |

**Promise Thread** remains a visual motif name only — not primary user-facing copy.

---

## Mission

Help people become someone they can count on.

## Vision

Create a world where people get better by simply showing up every day.

## Brand purpose

Show people that great goals can be achieved with small steps — simply showing up daily.

Showing up is the mechanism. **Identity transformation is the product.**

## What HeroArc is NOT

- A habit tracker
- A productivity app
- A to-do list
- Another accountability application dressed as discipline software



## Positioning

**Feels like:** Headspace × Duolingo × Finch — warm, playful, identity-building consumer products.

**Does NOT feel like:** Notion × Jira × Trello — corporate, task-obsessed, sterile SaaS.

**Benchmark quality bar:** Arc Browser, Apple HIG, Monument Valley (craft and motion — not visual copying).

---



## Emotional north star

When someone opens HeroArc in the morning they should feel:

> **"I'm becoming someone better."**

Not:

> "I have another task."



## Core emotional pillars


| Pillar           | Meaning in product                                               |
| ---------------- | ---------------------------------------------------------------- |
| **Hope**         | Every day is another opportunity. Yesterday never defines today. |
| **Progress**     | Celebrate showing up over perfection. Small wins matter.         |
| **Friendship**   | Companions are coaches, not judges. People succeed together.     |
| **Growth**       | Every check-in is another brick in your future self.             |
| **Self-respect** | Users feel proud of showing up — not guilty for failing.         |




## The single most important principle

**The app must NEVER make users feel guilty.**

- Failure is part of growth.
- Failure is information.
- Failure is expected.
- Companions provide accountability.
- The product provides optimism.
- Never confuse the two.

---



## Brand personality


| Is            | Is not                |
| ------------- | --------------------- |
| Warm          | Aggressive            |
| Wholesome     | Corporate             |
| Inspirational | Serious               |
| Playful       | Robotic               |
| Calm          | Productivity-obsessed |
| Hopeful       | Militaristic          |
| Human         | Intimidating          |
| Encouraging   | Shaming               |




## Brand voice

Speak like your closest friend, your favourite coach, someone who genuinely believes in you.

**Not** like a project manager, a fitness trainer yelling at you, or a productivity guru.

### Tone rules

1. Every sentence should feel supportive.
2. Use plain language — no jargon, no SaaS clichés ("AI-powered", "revolutionary").
3. Frame setbacks as information, not moral failure.
4. Celebrate consistency, not intensity.
5. Wagers stay playful — coffee, pizza, treats — never punitive shame.

---



## Values

1. **Consistency creates identity** — small daily actions compound.
2. **Optimism over guilt** — the product never punishes emotionally.
3. **Togetherness** — accountability through people who care.
4. **Craft** — everything feels handcrafted, never generic.
5. **Simplicity** — reduce cognitive load; never overwhelm.

---



## Design principles

1. Design for emotion before efficiency.
2. People should enjoy opening the app.
3. Every screen should reward progress.
4. Design for consistency, not intensity.
5. Never overwhelm.
6. Reduce cognitive load wherever possible.
7. Everything should feel handcrafted — never generic.
8. Design systems over screens.

---



## Microcopy rewrite guide

Map PRD-default labels to HeroArc voice. Use the **Display label** in UI; keep **PRD key** for engineering logic.

### Challenge card states


| PRD / legacy label             | HeroArc display label             | CTA (HeroArc)  |
| ------------------------------ | --------------------------------- | -------------- |
| Check-in Pending               | Ready for today's check-in        | Check In       |
| Pending Validation             | Your companions are reviewing     | —              |
| Check-in Done                  | You showed up today               | —              |
| Check-in Missed                | Life happened — one save used     | —              |
| Challenge Failed, Settle Wager | This challenge didn't go your way | Settle up      |
| Challenge Closed               | All wrapped up                    | —              |
| Challenge Successful           | Goal complete — you showed up     | —              |
| Draft / awaiting companions    | Waiting for your companions       | Edit challenge |




### Companion card states


| PRD label                    | HeroArc display                 | CTA    |
| ---------------------------- | ------------------------------- | ------ |
| Pending Verification         | [Name] shared proof — your turn | Verify |
| Check-in Pending (companion) | Waiting for today's proof       | —      |




### Actions and buttons


| Avoid             | Prefer                            |
| ----------------- | --------------------------------- |
| Reject            | Try again                         |
| Challenge Failed  | This challenge didn't go your way |
| Missed Check-in   | Tomorrow is still yours           |
| Error             | Something didn't go as planned    |
| You Lost          | This one didn't go your way       |
| Submit            | Share proof                       |
| Verify settlement | Confirm they settled up           |




### Dialogs and errors


| Scenario                   | Copy                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- |
| Max 5 active challenges    | You've got 5 challenges going — finish or archive one before starting another.   |
| Last companion can't leave | At least one companion needs to stay — your challenger is counting on the group. |
| No companions accepted     | No one joined yet. Try new companions or a later start date.                     |
| Duplicate phone on signup  | Looks like you already have an account — want to log in instead?                 |
| Wrong password             | That password didn't match. Give it another try.                                 |
| OTP mismatch               | That code didn't work. You can request a new one in 2 minutes.                   |
| Upload too large           | That file's a bit big — keep it under 20MB.                                      |
| Deadline passed            | Today's window closed. Check back tomorrow.                                      |




### Empty states


| Screen                  | Headline                              | Subcopy                                                 |
| ----------------------- | ------------------------------------- | ------------------------------------------------------- |
| Challenges (no active)  | Your next big goal starts here        | Pick something that matters. Show up daily — invite people who believe in you. |
| Companion (no requests) | No invitations right now              | When a friend invites you, it'll show up here.          |
| Activity feed           | Your journey starts with one check-in | Share proof and your companions will cheer you on.      |




### Celebrations


| Moment             | Headline                     |
| ------------------ | ---------------------------- |
| Check-in approved  | You showed up                |
| Challenge complete | You reached your goal        |
| Streak milestone   | [N] days of showing up       |
| Wager settled      | Honesty counts — all settled |


---



## Anti-patterns (never ship)

- Harsh red (`#b91c1c`, `#dc2626`) for failure states
- Copy that implies moral failure ("You failed", "You lost", "Strike")
- Casino-style confetti or slot-machine gamification
- Artificial urgency ("Only 2 hours left!!!")
- Dark patterns (hidden unsubscribe, guilt-trip notifications)
- Militaristic language ("Deploy", "Mission", "Execute")
- Productivity framing ("Tasks", "Productivity score", "Efficiency")
- Empty error messages with no recovery path
- Color-only status indicators without icon + label
- Sharp corners, sterile flat SaaS illustration style

---



## Success criterion

A successful HeroArc experience makes users feel:

> **"I actually want to open this today."**

Not **"I need to open this."**

When someone completes a challenge, they should feel:

> **"I showed up — and I'm closer to the person I want to become."**

Not **"I checked off another task."**

---



## Related artifacts

- [02-visual-identity.md](./02-visual-identity.md)
- [03-tokens.md](./03-tokens.md)
- [04-components.md](./04-components.md)

