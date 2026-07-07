# Commitment App — Backend

Supabase backend for the Commitment App MVP.

## Structure

```
supabase/
├── migrations/           # PostgreSQL schema, RLS, storage buckets
├── functions/
│   ├── _shared/          # Domain logic (testable) + Supabase helpers
│   ├── challenge-actions/  # All domain mutations (JWT auth)
│   ├── scheduled-jobs/     # pg_cron target (CRON_SECRET header)
│   └── submit-feedback/    # Google Sheets
└── config.toml
```

## Deploy (hosted project jcanswwvditynjwvtmec)

```bash
supabase login
supabase link --project-ref jcanswwvditynjwvtmec
supabase db push
supabase functions deploy challenge-actions
supabase functions deploy scheduled-jobs
supabase functions deploy submit-feedback
```

Set secrets: `CRON_SECRET`, `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `APP_DOWNLOAD_URL`.

## challenge-actions API

POST `/functions/v1/challenge-actions` with `Authorization: Bearer <user_jwt>`:

| action | payload |
|--------|---------|
| `create_challenge` | `name`, `start_date`, `end_date`, `daily_deadline_time`, `timezone`, `wager`, `lives_total`, `companion_user_ids[]` |
| `update_challenge` | `challenge_id`, same fields as create (draft only) |
| `delete_challenge` | `challenge_id` (draft only) |
| `invite_companion_sms` | `challenge_id`, `phone` |
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

## submit-feedback

POST `/functions/v1/submit-feedback` with JWT body `{ header, message }`.

## RPC

- `get_profile_stats()` — profile tab statistics
- `search_profiles_by_phone(p_digits)` — companion picker
- `check_phone_registered(p_phone)` — signup duplicate check
- `get_login_email_by_phone(p_phone)` — login V1 (phone → email)

Domain writes use the service role inside Edge Functions. Clients read via RLS.
