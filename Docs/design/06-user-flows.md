# HeroArc — User Flows

**PRD:** [Docs/PRD.md](../PRD.md) · **IA:** [05-information-architecture.md](./05-information-architecture.md)  
**Omitted:** US-4 (chat) — activity feed only in V1.

---

## Flow 1 — Onboarding (US-10, US-11)

```mermaid
flowchart TD
    A[App open] --> B{Session?}
    B -->|No| C[Welcome]
    C --> D[Sign Up]
    C --> E[Log In]
    D --> F[Form validation]
    F --> G[OTP verify]
    G --> H{OTP ok?}
    H -->|Yes| I[Challenges tab]
    H -->|No| J[Supportive error + retry]
    E --> K[Phone + password]
    K --> L{Auth ok?}
    L -->|Yes| I
    L -->|No| M[Explain + retry]
```

**Edge cases:**
- Duplicate phone → redirect to login with warm copy
- OTP resend after 2 minutes
- OTP mismatch → option to edit signup details

---

## Flow 2 — View challenges (US-1)

```mermaid
flowchart TD
    A[Challenges tab] --> B[Active filter default]
    B --> C[List challenge cards]
    C --> D[Tap card]
    D --> E[Challenge Journey]
    B --> F[Switch to Your journey]
    F --> G[Past/archived cards]
```

**Edge cases:**
- Empty active → EmptyState + Create CTA
- Draft card → Edit challenge CTA

---

## Flow 3 — Create challenge (US-2)

```mermaid
flowchart TD
    A[Create CTA] --> B[Step 1 Basics]
    B --> C[Step 2 Companions]
    C --> D[Step 3 Stakes]
    D --> E[Submit]
    E --> F{Valid?}
    F -->|No| G[Inline errors]
    F -->|Yes| H[Companion requests sent]
    H --> I{All accept within 24h of start?}
    I -->|Some accept| J[Challenge active with accepted only]
    I -->|None accept| K[Draft state on list]
    I -->|All accept| J
```

**Validations:**
- Unique name among active challenges
- Max 5 active challenges → dialog
- Max 10 companion requests
- End date ≥ start + 7 days
- Lives < half duration
- At least 1 companion must eventually accept

---

## Flow 4 — Daily check-in (US-3)

```mermaid
flowchart TD
    A[Check In CTA] --> B[MediaUploadSheet]
    B --> C[Pick media]
    C --> D{Under 20MB?}
    D -->|No| E[Size error]
    D -->|Yes| F[Upload]
    F --> G[Status: Pending Validation]
    G --> H[Activity feed event]
```

**Entry points:** Challenge card CTA OR Journey header button.

**Rules:**
- Only before deadline (or makeup window)
- Cannot edit proof after submit
- Multiple media types allowed

---

## Flow 5 — Companion verification (US-9)

```mermaid
flowchart TD
    A[Verify CTA] --> B[ProofViewer]
    B --> C{Decision}
    C -->|Looks good| D[Record approval]
    C -->|Try again| E[Record rejection]
    D --> F{All approved?}
    F -->|Yes| G[Check-in Done + delete media]
    F -->|No| H[Wait for others]
    E --> I{Before deadline?}
    I -->|Yes| J[Challenger can resubmit]
    I -->|No| K[24h makeup window]
```

**Edge — delayed approval (PRD special case):**
- Deadline passes without all approvals → provisional advance to next day
- Later rejection → challenger owes 2 submissions (missed day + current day)

---

## Flow 6 — Life consumed

```mermaid
flowchart TD
    A[Deadline missed] --> B{Lives left?}
    B -->|Yes| C[Consume 1 life]
    C --> D[Check-in Missed status]
    D --> E[Gentle animation + copy]
    E --> F[Challenge continues]
    B -->|No| G[Challenge failed]
```

**Copy:** "Life happened — one save used" (never guilt).

---

## Flow 7 — Challenge success

```mermaid
flowchart TD
    A[Last day check-in approved] --> B[CelebrationOverlay]
    B --> C[Challenge Successful]
    C --> D[Auto-archive to Your journey]
```

Note: Success allowed even if lives were used during challenge (PRD).

---

## Flow 8 — Settle wager (US-6)

```mermaid
flowchart TD
    A[Challenge failed] --> B[Settle up CTA]
    B --> C[Upload wager proof]
    C --> D[Companions verify]
    D --> E{All approve?}
    E -->|Yes| F[Challenge Closed]
    F --> G[Archive]
    E -->|No| H[Await remaining]
```

Failed challenges visible in Active until wager settled.

---

## Flow 9 — Companion invitation (US-7)

```mermaid
flowchart TD
    A[Companion tab] --> B[Request card]
    B --> C{Accept or Decline}
    C -->|Accept| D[Join challenge]
    C -->|Decline| E[Remove request]
    D --> F[Ongoing companion cards]
```

---

## Flow 10 — Leave challenge (US-8)

```mermaid
flowchart TD
    A[Journey → Leave] --> B{Last companion?}
    B -->|Yes| C[Block + error dialog]
    B -->|No| D[Confirm dialog]
    D --> E[Leave]
    E --> F[Notify others + feed event]
    F --> G[Card hidden for leaver]
```

---

## Flow 11 — Profile (US-5)

View growth metrics, submit feedback (header + message → Google Sheet), open policies, log out.

---

## Notifications (reference)

Push registration: [app/src/lib/push.ts](../../app/src/lib/push.ts)

| Trigger | Audience |
|---------|----------|
| Check-in reminder | Challenger |
| Proof submitted | Companions |
| Verification complete | Challenger |
| Companion request | Companion |
| Companion left | Challenger + companions |
| Challenge success | All participants |

---

## Related

- [07-screens/](./07-screens/)
- [08-motion-prototype.md](./08-motion-prototype.md)
