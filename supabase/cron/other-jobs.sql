-- ─────────────────────────────────────────────────────────────────────────────
-- Restliche Cron-Jobs (Supabase pg_cron + pg_net) — Hetzner-Deploy nutzt KEIN
-- Vercel-Cron, daher müssen diese Jobs hier laufen (Schedules aus vercel.json).
--
-- Endpoints sind alle GET + per CRON_SECRET (x-cron-secret-Header) abgesichert.
--
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen. __DEIN_CRON_SECRET__ durch den
--    echten Wert ersetzen. Setzt aktiviertes pg_net + pg_cron voraus.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Idempotent: bestehende Jobs gleichen Namens entfernen.
do $$ begin perform cron.unschedule('training-reminder-hourly'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('bgf-invoicing-daily');      exception when others then null; end $$;
do $$ begin perform cron.unschedule('bgf-quarterly-report-daily'); exception when others then null; end $$;

-- training-reminder — stündlich (Route prüft, wessen reminder_time in der letzten Stunde liegt)
select cron.schedule('training-reminder-hourly', '0 * * * *', $$
  select net.http_get(
    url     := 'https://wwwpraxis-os.com/api/cron/training-reminder',
    headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
    timeout_milliseconds := 60000);
$$);

-- bgf-invoicing — täglich 06:00 UTC
select cron.schedule('bgf-invoicing-daily', '0 6 * * *', $$
  select net.http_get(
    url     := 'https://wwwpraxis-os.com/api/cron/bgf-invoicing',
    headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
    timeout_milliseconds := 120000);
$$);

-- bgf-quarterly-report — täglich 07:00 UTC (Route entscheidet selbst, ob Quartalsende)
select cron.schedule('bgf-quarterly-report-daily', '0 7 * * *', $$
  select net.http_get(
    url     := 'https://wwwpraxis-os.com/api/cron/bgf-quarterly-report',
    headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
    timeout_milliseconds := 120000);
$$);

-- Kontrolle:
--   select jobname, schedule, active from cron.job order by jobname;
--   select status, return_message, start_time from cron.job_run_details order by start_time desc limit 10;
