# Commitment App

Accountability app for daily challenges with companion verification and wagers.

- **Repo:** [github.com/yashmohite24/Commitment-Companion](https://github.com/yashmohite24/Commitment-Companion)
- **Supabase:** `https://jcanswwvditynjwvtmec.supabase.co`
- **Docs:** [Docs/PRD.md](Docs/PRD.md) · [Docs/Architecture.md](Docs/Architecture.md) · [Docs/BUILD_PLAN.md](Docs/BUILD_PLAN.md)

## Structure

```
app/           Expo mobile app (React Native)
supabase/      PostgreSQL migrations + Edge Functions
Docs/          Product & architecture docs
```

## Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (domain tests)
- Expo Go or EAS for mobile

## Backend setup

```bash
supabase login
supabase link --project-ref jcanswwvditynjwvtmec
supabase db push
supabase functions deploy challenge-actions
supabase functions deploy scheduled-jobs
supabase functions deploy submit-feedback
```

Copy `supabase/.env.example` → `supabase/.env.local` and set keys from the Supabase dashboard.

Set Edge Function secrets: `CRON_SECRET`, `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `TWILIO_*`, `APP_DOWNLOAD_URL`.

Schedule pg_cron (see comment in `supabase/migrations/20260706120002_cron_setup.sql`).

## Mobile app

```bash
cd app
cp .env.example .env
npm install
npx expo start
```

**Auth (V1):** Welcome → Sign Up (US 10) or Log In with phone + password (US 11). Dev shortcuts when `EXPO_PUBLIC_DEV_SKIP_AUTH=true`.

**Dev companion phones:** challenger `+919000000001`, companion `+919000000002`.

## Tests

```bash
npm run test:domain          # Deno state machine tests
cd app && npm test           # card-status unit tests
```

## Deploy mobile (EAS)

```bash
cd app
npx eas build --profile preview --platform all
```

See [Docs/TEST_MATRIX.md](Docs/TEST_MATRIX.md) for manual QA scenarios.
