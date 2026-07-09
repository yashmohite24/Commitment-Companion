#!/usr/bin/env bash
# Deploy backend to linked Supabase project (requires supabase login + link)
set -euo pipefail
supabase db push
supabase functions deploy challenge-actions
supabase functions deploy scheduled-jobs
supabase functions deploy submit-feedback
supabase functions deploy waitlist-signup
echo "Done. Configure pg_cron in SQL editor (see migrations/20260706120002_cron_setup.sql)."
