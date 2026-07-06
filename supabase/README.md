# Commitment App — Backend

Supabase backend for the Commitment App MVP.

## Structure

```
supabase/
├── migrations/           # PostgreSQL schema, RLS, storage buckets
├── functions/
│   ├── _shared/          # Domain logic (testable) + Supabase helpers
│   ├── challenge-actions/  # All domain mutations (JWT auth)
│   └── scheduled-jobs/     # pg_cron target (CRON_SECRET header)
└── config.toml
```

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (for tests and Edge Functions)

## Local setup

```bash
supabase start
supabase db reset
```

Copy `supabase/.env.example` to `supabase/.env.local` and fill in values from `supabase status`.

## Run domain tests

```bash
npm run test:domain
# or
deno test --allow-read supabase/functions/_shared/domain/check-in_test.ts
```

## Serve Edge Functions locally

```bash
supabase functions serve --env-file supabase/.env.local
```

## challenge-actions API

POST `/functions/v1/challenge-actions` with `Authorization: Bearer <user_jwt>`:

| action | payload |
|--------|---------|
| `create_challenge` | `name`, `start_date`, `end_date`, `daily_deadline_time`, `timezone`, `wager`, `lives_total`, `companion_user_ids[]` |
| `respond_companion_request` | `request_id`, `decision` (`accepted` \| `rejected`) |
| `prepare_check_in_upload` | `challenge_id`, `check_in_date` |
| `submit_check_in` | `challenge_id`, `check_in_date`, `storage_paths[]`, `media_size_bytes` |
| `approve_proof` | `proof_id`, `decision` (`accepted` \| `rejected`) |
| `leave_challenge` | `challenge_id` |
| `prepare_wager_upload` | `challenge_id` |
| `submit_wager_settlement` | `challenge_id`, `storage_paths[]`, `media_size_bytes` |
| `approve_wager_settlement` | `wager_settlement_id` |

## scheduled-jobs

POST `/functions/v1/scheduled-jobs` with header `x-cron-secret: <CRON_SECRET>`.

Runs every minute via pg_cron (configure in Supabase Dashboard → Database → Cron).

## Schema overview

- **challenges** — lifecycle (`draft`, `active`, `successful`, `failed`, `closed`)
- **daily_check_ins** — per-day status (`pending`, `pending_validation`, `done`, `missed`)
- **proof_of_work** / **approvals** — check-in submissions and companion votes
- **check_in_logs** / **system_messages** — activity feed
- **wager_settlements** / **wager_settlement_approvals** — post-failure wager flow

Domain writes use the service role inside Edge Functions. Clients read via RLS.
