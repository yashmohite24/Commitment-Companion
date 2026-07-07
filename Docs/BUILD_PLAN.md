# Build Plan — Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Product decisions (B1–B8) | Done — [Decisions.md](./Decisions.md) |
| 1 | Deploy + harden backend | Done |
| 2 | Expo shell + auth | Done |
| 3 | Challenger tab | Done |
| 4 | Companion tab | Done |
| 5 | Check-in + activity feed | Done |
| 6 | Wager settlement UI | Done |
| 7 | Profile + stats | Done |
| 8 | Push notifications | Done |
| 9 | Feedback + SMS | Done |
| 10 | QA + EAS scaffolding | Done — [TEST_MATRIX.md](./TEST_MATRIX.md) |
| **11** | **QA bug fixes (bugs 1–13)** | **Done** — [Bugs.md](./Bugs.md) |
| **12** | **Sign up (US 10)** | **Done** — welcome, signup, OTP verify |
| **13** | **Login (US 11)** | **Done** — phone + password V1 |
| 14 | Re-run E2E test matrix | Pending |

See [Architecture.md](./Architecture.md) for full technical design.

## Deploy after pull

```bash
supabase db push
supabase functions deploy challenge-actions
```

New migrations: `20260707120008`–`20260707120013`.
