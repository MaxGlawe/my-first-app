-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-18: BGF Pausen-Fit Erinnerungs-Cron (Supabase pg_cron + pg_net)
--
-- Ruft alle 30 Minuten /api/cron/bgf-pausen-fit auf. Der Endpoint entscheidet
-- selbst anhand der Berliner Zeit, ob gerade ein konfigurierter Firmen-Slot
-- fällig ist (Mo–Fr, HH:00/HH:30-Bucket) und sendet dann Web-Push-Erinnerungen
-- an die aktiven Mitarbeiter. Ausserhalb der Slots ist der Lauf ein No-Op.
--
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen (NICHT Teil der App-Deploys).
--    Vor dem Ausführen __DEIN_CRON_SECRET__ durch den ECHTEN CRON_SECRET-Wert
--    ersetzen (identisch mit Server-Env / training-reminder / schmerzcheck-drip).
--
--    GOTCHA: Bleibt der Platzhalter stehen, feuert der Job planmäßig, kassiert
--    ein 401 und sendet NICHTS — pg_cron verbucht ihn trotzdem als Erfolg.
--    Nach dem Anlegen prüfen:
--      select jobname, schedule, active,
--             command not like '%__DEIN%' as secret_ok
--      from cron.job where jobname = 'bgf-pausen-fit-30min';
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: evtl. bestehenden Job gleichen Namens entfernen.
do $$
begin
  perform cron.unschedule('bgf-pausen-fit-30min');
exception when others then
  null;
end $$;

-- Alle 30 Minuten. Zeit-/Slot-/Wochentag-Logik liegt im Endpoint (Berlin-TZ).
select cron.schedule(
  'bgf-pausen-fit-30min',
  '0,30 * * * *',
  $$
    select net.http_get(
      url     := 'https://wwwpraxis-os.com/api/cron/bgf-pausen-fit',
      headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
      timeout_milliseconds := 120000
    );
  $$
);

-- Kontrolle:
--   select * from cron.job where jobname = 'bgf-pausen-fit-30min';
--   select * from cron.job_run_details order by start_time desc limit 5;
-- Manueller Sofort-Test:
--   select net.http_get(
--     url := 'https://wwwpraxis-os.com/api/cron/bgf-pausen-fit',
--     headers := jsonb_build_object('x-cron-secret', '__DEIN_CRON_SECRET__'),
--     timeout_milliseconds := 120000);
