-- Schedule scheduled-jobs Edge Function (CRON_SECRET substituted by deploy script)
DO $$ BEGIN
  PERFORM cron.unschedule('commitment-scheduled-jobs');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'commitment-scheduled-jobs',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://jcanswwvditynjwvtmec.supabase.co/functions/v1/scheduled-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '__CRON_SECRET__'
    ),
    body := '{}'::jsonb
  );
  $$
);
