-- pg_cron: invoke scheduled-jobs Edge Function every minute.
-- Requires pg_cron and pg_net extensions (enable in Supabase Dashboard if needed).
-- After deploy, run in SQL editor (replace placeholders from Project Settings → API):

/*
SELECT cron.schedule(
  'commitment-scheduled-jobs',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/scheduled-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

COMMENT ON EXTENSION pg_cron IS 'Schedules commitment-app deadline sweeper via scheduled-jobs Edge Function';

-- SQL helper invoked by cron for deadline processing without HTTP (fallback / local dev)
CREATE OR REPLACE FUNCTION public.run_deadline_sweep_marker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Edge Function scheduled-jobs performs domain logic.
  -- This function exists as a hook for pg_cron when HTTP to Edge Functions is unavailable.
  NULL;
END;
$$;