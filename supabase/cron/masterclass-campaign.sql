-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-25 / 25b / 25c: Masterclass-Kampagne (Supabase pg_cron + pg_net)
--
-- Ruft /api/cron/masterclass-campaign auf. Der Endpoint verschickt die einmalige
-- Kampagne an die Schmerzcheck-Bestandsleads — 215 fällige Mails an 215 Menschen.
--
--   M1–M4   →  9  LWS-Leads. Die EINZIGEN, die ein Kaufangebot bekommen.
--   RT1/RT2 → 69  Region unbekannt. Ein-Klick-Frage, KEIN Angebot.
--   C1R     → 13  Offener Check. „Bring ihn zu Ende." KEIN Angebot.
--   RF1     → 45  Im Juni zu Unrecht gestoppt (nur Nacht-Kriterium).
--                 „Ich habe dich zu früh gestoppt." KEIN Angebot.
--   B1/B2   → 72  Echte Warnzeichen. „Warst du beim Arzt?" KEIN Angebot.
--   N1/OB1/K1 → 79  Nacken/oberer Rücken/Knie. Wert-Mail + Warteliste.
--                 KEIN Angebot — für sie gibt es noch kein Produkt.
--   Segment D → 210 Leads OHNE Double-Opt-in bekommen NIEMALS eine Mail.
--
-- ZEITPLAN: Dienstag bis Freitag, 07:00 UTC = 9:00 Uhr deutsche Sommerzeit.
--
--   Kein Montag: Da liegt das Wochenend-Postfach voll, eine Mail geht dort am
--   ehesten unter. Kein Wochenende: In den Mails steht „Antwort innerhalb von
--   48 h werktags" — wer Samstagabend auf die Arzt-Frage antwortet und bis
--   Montag nichts hört, startet die Beziehung schlecht.
--
--   ⚠️ Zeitumstellung: 07:00 UTC ist von Ende März bis Ende Oktober 9:00 Uhr.
--      Im Winter wären es 8:00 Uhr. Die Kampagne dauert ~3 Wochen im Juli —
--      irrelevant. Für Dauerbetrieb müsste man das anpassen.
--
-- SICHERHEITSNETZ (im Endpoint, nicht hier):
--   • Drosselung: max. 30 Mails pro Lauf → die 215 gehen über ~9 Versandtage
--     raus. Das schützt die Absender-Reputation des Praxis-Postfachs.
--   • Sanity-Guard: über 250 fällige Mails → Abbruch + Alarm-Mail, kein Versand.
--   • Jede Mail claimt vor dem Versand → ein Doppellauf kann nichts doppelt senden.
--   • Jeder Query-Fehler bricht den Lauf ab (fail closed).
--   • assertMailable() prüft vor JEDEM Versand nochmal das Segment und wirft.
--
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen (NICHT Teil der App-Deploys).
--    Vorher __DEIN_CRON_SECRET__ durch den echten CRON_SECRET-Wert ersetzen
--    (derselbe wie beim Drip-Cron / in der Server-Env).
--
-- ⚠️ AB DEM AUSFÜHREN DIESER DATEI GEHEN ECHTE MAILS RAUS.
--    Erster Lauf: Dienstag 9:00 Uhr → 9 × M1 + 21 × RT1.
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
  '0 7 * * 2-5',                     -- Di–Fr, 07:00 UTC = 9:00 Uhr deutscher Zeit
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
-- Job vorhanden und aktiv?
--   select jobname, schedule, active from cron.job
--    where jobname = 'masterclass-campaign-daily';
--
-- Läufe (pg_cron):
--   select start_time, status, return_message from cron.job_run_details
--    where jobid = (select jobid from cron.job where jobname='masterclass-campaign-daily')
--    order by start_time desc limit 10;
--
-- Antwort des Endpoints (pg_net ist async — das Ergebnis landet hier):
--   select status_code, content, created from net._http_response
--    order by created desc limit 5;
--   → Erwartet nach dem 1. Lauf: {"ok":true,"sent":30,"failed":0,...}
--
-- Was ist tatsächlich rausgegangen?
--   select email_code, count(*) from schmerzcheck_email_events
--    where event_type = 'sent' and occurred_at > now() - interval '1 day'
--    group by email_code order by 2 desc;
--
-- ── NOTBREMSE ────────────────────────────────────────────────────────────────
-- Kampagne sofort stoppen (der Rest des Systems läuft weiter):
--   select cron.unschedule('masterclass-campaign-daily');
