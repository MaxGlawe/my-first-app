-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-29: Täglicher Rechnungslauf des Programms (Supabase pg_cron + pg_net)
--
-- Ruft EINMAL TÄGLICH /api/cron/programm-rechnungen auf. Der Endpunkt legt
-- fällige Monatsrechnungen als ENTWURF an und erinnert in Woche 6 und 12 an
-- den Verlaufs- beziehungsweise Abschlussbericht.
--
-- WARUM TÄGLICH und nicht monatlich: Programme starten an jedem beliebigen
-- Tag. Ein monatlicher Lauf träfe die Dreissig-Tage-Grenze nur zufällig.
--
-- WARUM 05:30 UTC (7:30 Ortszeit im Sommer): Der Behandler soll den Entwurf
-- morgens vorfinden, nicht mitten im Sprechbetrieb. Vor dem
-- Erinnerungs-Cron des Sprechzimmers (volle Stunde), damit beide nicht
-- gleichzeitig Mails verschicken.
--
-- Das Secret wird aus einem bestehenden Job gelesen, statt es hier als
-- Platzhalter einzutragen. Grund steht in der Projektdoku: Bleibt ein
-- Platzhalter stehen, ist der Job AKTIV, feuert planmäßig, kassiert ein 401
-- und tut nichts — und pg_cron verbucht ihn trotzdem als erfolgreich.
--
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen (NICHT Teil der App-Deploys).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $outer$
declare
  v_secret text;
  v_cmd    text;
begin
  select substring(command from $re$x-cron-secret'\s*,\s*'([^']+)'$re$)
    into v_secret
    from cron.job
   where jobname in ('sprechzimmer-erinnerungen-hourly', 'schmerzcheck-drip-daily', 'training-reminder-hourly')
   order by jobname
   limit 1;

  if v_secret is null or v_secret = '' or v_secret like '%__DEIN%' then
    raise exception
      'CRON_SECRET konnte aus keinem bestehenden Job gelesen werden. '
      'Vorhandene Jobs pruefen mit: select jobname from cron.job;';
  end if;

  begin
    perform cron.unschedule('programm-rechnungen-daily');
  exception when others then
    null;
  end;

  v_cmd := format(
    $cmd$
    select net.http_get(
      url     := 'https://wwwpraxis-os.com/api/cron/programm-rechnungen',
      headers := jsonb_build_object('x-cron-secret', %L)
    );
    $cmd$,
    v_secret
  );

  perform cron.schedule('programm-rechnungen-daily', '30 5 * * *', v_cmd);

  raise notice 'Rechnungslauf angelegt (Secret uebernommen, % Zeichen).', length(v_secret);
end
$outer$;

-- ── Sofortige Kontrolle ──────────────────────────────────────────────────────
select jobname,
       schedule,
       active,
       command not like '%__DEIN%' and command like '%x-cron-secret%' as secret_ok
  from cron.job
 where jobname = 'programm-rechnungen-daily';

-- ── Nach dem ersten Lauf ─────────────────────────────────────────────────────
--   select status_code, content, created from net._http_response
--    order by created desc limit 5;
-- Erwartet: {"ok":true,"entwuerfe":0,"erinnerungen":0,...} solange kein
-- Programm dreissig Tage alt ist.
