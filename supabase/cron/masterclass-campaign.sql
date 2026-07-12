-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-25 / 25b: Masterclass-Kampagne (Supabase pg_cron + pg_net)
--
-- Ruft täglich /api/cron/masterclass-campaign auf. Der Endpoint verschickt die
-- einmalige Kampagne an die Schmerzcheck-Bestandsleads:
--
--   RT1/RT2  → 69 Leads mit unbekannter Region. Routing-Frage, KEIN Angebot.
--   M1–M4    → nur an Leads mit main_region = 'unterer_ruecken' (LWS).
--              Die Masterclass ist ein Kreuzschmerz-Kurs — ein Nacken-Patient
--              bekommt sie NICHT angeboten.
--   B1/B2    → 117 Red-Flag-Leads. Frage nach ärztlicher Abklärung, KEIN Angebot.
--   C1R      → 13 Leads mit offenem Check.
--   Segment D → 210 Leads OHNE Double-Opt-in bekommen NIEMALS eine Mail.
--
-- SICHERHEITSNETZ (im Endpoint, nicht hier):
--   • Drosselung: max. 30 Mails pro Lauf → die 91 fälligen gehen über ~3 Tage
--     raus. Gut für die Zustellbarkeit, und es bleibt Zeit zum Gegensteuern.
--   • Sanity-Guard: über 200 fällige Mails → Abbruch + Alarm-Mail, kein Versand.
--   • Jede Mail claimt vor dem Versand → ein Doppellauf kann nichts doppelt senden.
--   • Jeder Query-Fehler bricht den Lauf ab (fail closed).
--
-- Zeit: 09:00 UTC (11:00 deutsche Sommerzeit) — bewusst NACH dem Drip-Cron
-- (08:00 UTC), damit sich die beiden nicht überlappen und im Log auseinander-
-- zuhalten sind.
--
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen (NICHT Teil der App-Deploys).
--    Vorher __DEIN_CRON_SECRET__ durch den echten CRON_SECRET-Wert ersetzen
--    (derselbe wie in der Server-Env / wie beim Drip-Cron).
--
-- ⚠️ AB DEM AUSFÜHREN DIESER DATEI GEHEN ECHTE MAILS RAUS.
--    Erster Lauf: 30 × RT1 an die Leads mit unbekannter Region.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: evtl. bestehenden Job gleichen Namens entfernen.
do $$
begin
  perform cron.unschedule('masterclass-campaign-daily');
exception when others then
  null;
end $$;

select cron.schedule(
  'masterclass-campaign-daily',
  '0 9 * * *',                       -- täglich 09:00 UTC
  $$
  select net.http_get(
    url     := 'https://wwwpraxis-os.com/api/cron/masterclass-campaign',
    headers := jsonb_build_object(
      'x-cron-secret', '__DEIN_CRON_SECRET__'
    )
  );
  $$
);

-- ── Kontrolle ────────────────────────────────────────────────────────────────
-- Job vorhanden?
--   select jobid, jobname, schedule, active from cron.job
--    where jobname = 'masterclass-campaign-daily';
--
-- Läufe (pg_cron):
--   select * from cron.job_run_details
--    where jobid = (select jobid from cron.job where jobname='masterclass-campaign-daily')
--    order by start_time desc limit 10;
--
-- Antworten des Endpoints (pg_net ist async — das Ergebnis landet hier):
--   select id, status_code, content, created
--     from net._http_response order by created desc limit 10;
--
-- ── NOTBREMSE ────────────────────────────────────────────────────────────────
-- Kampagne sofort stoppen (der Rest des Systems läuft weiter):
--   select cron.unschedule('masterclass-campaign-daily');
