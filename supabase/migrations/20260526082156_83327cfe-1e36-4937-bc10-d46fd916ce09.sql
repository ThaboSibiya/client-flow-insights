
SELECT cron.unschedule('quikle-agent-scheduled-runner-every-5min')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'quikle-agent-scheduled-runner-every-5min');

SELECT cron.schedule(
  'quikle-agent-scheduled-runner-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://oquiaxbnkdnpixqhqdfq.supabase.co/functions/v1/quikle-agent-scheduled-runner',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdWlheGJua2RucGl4cWhxZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTcyOTYsImV4cCI6MjA2MjEzMzI5Nn0.K6OhS4jbjR-2MnMGPKym6VynV3zFI0bC0QbVMURLwg4"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);
