-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-25 / 25b / 25c: Masterclass-Kampagne (Supabase pg_cron + pg_net)
--
-- ⚠️ KEIN PLATZHALTER MEHR ZU ERSETZEN. Einfach ausführen.
--
--    Diese Datei hatte ursprünglich ein `__DEIN_CRON_SECRET__` zum Ersetzen —
--    und genau das wurde beim ersten Anlauf übersehen. Der Job lief an, kassierte
--    ein 401 und verschickte NICHTS, während pg_cron ihn als „erfolgreich"
--    verbuchte. Ein stiller Totalausfall, den man erst Tage später bemerkt hätte.
--
--    Deshalb liest das Skript den CRON_SECRET jetzt aus dem bereits laufenden
--    Drip-Cron (`schmerzcheck-drip-daily`) aus. Das Secret muss nirgends kopiert,
--    eingefügt oder durch einen Chat geschickt werden — und es kann nicht mehr
--    vergessen werden. Fehlt der Drip-Cron, bricht das Skript mit einer klaren
--    Fehlermeldung ab, statt einen kaputten Job anzulegen.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- WAS DIE KAMPAGNE VERSCHICKT — 215 fällige Mails an 215 Menschen:
--
--   M1–M4     →  9  LWS-Leads. Die EINZIGEN, die ein Kaufangebot bekommen.
--   RT1/RT2   → 69  Region unbekannt. Ein-Klick-Frage, KEIN Angebot.
--   C1R       → 13  Offener Check. „Bring ihn zu Ende." KEIN Angebot.
--   RF1       → 45  Im Juni zu Unrecht gestoppt (nur Nacht-Kriterium).
--                   „Ich habe dich zu früh gestoppt." KEIN Angebot.
--   B1/B2     → 72  Echte Warnzeichen. „Warst du beim Arzt?" KEIN Angebot.
--   N1/OB1/K1 → 79  Nacken / oberer Rücken / Knie. Wert-Mail + Warteliste.
--                   KEIN Angebot — für sie gibt es noch kein Produkt.
--   Segment D → 210 Leads OHNE Double-Opt-in bekommen NIEMALS eine Mail.
--
-- ZEITPLAN: Dienstag–Freitag, 07:00 UTC = 9:00 Uhr deutsche Sommerzeit.
--   Kein Montag (volles Wochenend-Postfach), kein Wochenende (in den Mails steht
--   „Antwort innerhalb von 48 h werktags").
--
-- SICHERHEITSNETZ (im Endpoint): 30 Mails/Lauf · Sanity-Guard bei 250 ·
--   Claim vor jedem Versand · fail closed bei jedem Query-Fehler.
--
-- ⚠️ AB DEM AUSFÜHREN GEHEN ECHTE MAILS RAUS.
--    Erster Lauf: Dienstag 9:00 Uhr → 9 × M1 + 21 × RT1.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $outer$
declare
  v_secret text;
  v_cmd    text;
begin
  -- ── Secret aus dem laufenden Drip-Cron lesen ───────────────────────────────
  select substring(command from $re$x-cron-secret'\s*,\s*'([^']+)'$re$)
    into v_secret
    from cron.job
   where jobname = 'schmerzcheck-drip-daily';

  if v_secret is null or v_secret = '' or v_secret like '%__DEIN%' then
    raise exception
      'CRON_SECRET konnte nicht aus dem Job "schmerzcheck-drip-daily" gelesen werden. '
      'Existiert der Drip-Cron? Prüfen mit: select jobname from cron.job;';
  end if;

  -- ── Idempotent: evtl. bestehenden (auch kaputten) Job entfernen ────────────
  begin
    perform cron.unschedule('masterclass-campaign-daily');
  exception when others then
    null;
  end;

  -- ── Neu anlegen, mit dem echten Secret ────────────────────────────────────
  v_cmd := format(
    $cmd$
    select net.http_get(
      url     := 'https://wwwpraxis-os.com/api/cron/masterclass-campaign',
      headers := jsonb_build_object('x-cron-secret', %L)
    );
    $cmd$,
    v_secret
  );

  perform cron.schedule('masterclass-campaign-daily', '0 7 * * 2-5', v_cmd);

  raise notice 'Kampagnen-Cron angelegt. Secret aus dem Drip-Cron übernommen (%L Zeichen).',
    length(v_secret);
end
$outer$;

-- ── Sofortige Kontrolle ──────────────────────────────────────────────────────
-- Muss zeigen: schedule = '0 7 * * 2-5', active = true, secret_ok = true
select jobname,
       schedule,
       active,
       command not like '%__DEIN%' and command like '%x-cron-secret%' as secret_ok
  from cron.job
 where jobname = 'masterclass-campaign-daily';

-- ── Nach dem 1. Lauf (Dienstag) ──────────────────────────────────────────────
-- Hat der Endpoint geantwortet? Erwartet: {"ok":true,"sent":30,"failed":0,...}
--   select status_code, content, created from net._http_response
--    order by created desc limit 5;
--
-- Was ging tatsächlich raus? Erwartet: M1 = 9, RT1 = 21
--   select email_code, count(*) from schmerzcheck_email_events
--    where event_type = 'sent' and occurred_at > now() - interval '1 day'
--    group by email_code order by 2 desc;
--
-- ── NOTBREMSE ────────────────────────────────────────────────────────────────
--   select cron.unschedule('masterclass-campaign-daily');
