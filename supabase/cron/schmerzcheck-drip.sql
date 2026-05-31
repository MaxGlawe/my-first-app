-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-23: Schmerzcheck-Drip-Scheduler (Supabase pg_cron + pg_net)
--
-- Ruft täglich den Next.js-Endpoint /api/cron/schmerzcheck-drip auf, der pro Lead
-- die fällige Drip-Stufe (D1 +1d · D2 +3d · D3 +5d · D4 +7d · D5 +10d ab
-- completed_at) versendet. Endpoint ist per CRON_SECRET abgesichert.
--
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen (NICHT Teil der App-Deploys).
--    Vor dem Ausführen __DEIN_CRON_SECRET__ durch den echten CRON_SECRET-Wert
--    ersetzen (derselbe wie in der Server-Env / wie bei training-reminder).
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions (auf Supabase i. d. R. bereits aktiv — schadet nicht):
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: evtl. bestehenden Job gleichen Namens entfernen.
do $$
begin
  perform cron.unschedule('schmerzcheck-drip-daily');
exception when others then
  null;
end $$;

-- Täglich 08:00 UTC den Drip-Endpoint aufrufen (Tages-Cadence reicht für die
-- Tag-basierten Offsets; der Endpoint sendet pro Lauf max. 1 Stufe je Lead).
select cron.schedule(
  'schmerzcheck-drip-daily',
  '0 8 * * *',
  $$
    select net.http_get(
      url     := 'https://wwwpraxis-os.com/api/cron/schmerzcheck-drip',
      headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
      timeout_milliseconds := 120000
    );
  $$
);

-- Kontrolle:
--   select * from cron.job where jobname = 'schmerzcheck-drip-daily';
--   select * from cron.job_run_details order by start_time desc limit 5;
-- Manueller Sofort-Test (statt auf 08:00 zu warten):
--   select net.http_get(
--     url := 'https://wwwpraxis-os.com/api/cron/schmerzcheck-drip',
--     headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
--     timeout_milliseconds := 120000);
