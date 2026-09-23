-- ─────────────────────────────────────────────────────────────────────────────
-- PROJ-27: Erinnerungen an Videotermine (Supabase pg_cron + pg_net)
--
-- Ruft STÜNDLICH /api/cron/sprechzimmer-erinnerungen auf. Der Endpunkt
-- verschickt zwei Erinnerungen je Termin:
--   24 Stunden vorher — fängt die vergessenen Termine ab, lässt Zeit zum Absagen
--   1 Stunde vorher   — der Moment, in dem jemand sein Handy zurechtlegt
--
-- WARUM STÜNDLICH und nicht täglich: Ein Videotermin hat eine Uhrzeit. Ein
-- täglicher Lauf könnte die Ein-Stunden-Erinnerung nur zufällig treffen.
--
-- Das Secret wird aus einem bestehenden Job gelesen, statt es hier als
-- Platzhalter einzutragen. Grund steht in der Projektdoku: Bleibt ein
-- Platzhalter stehen, ist der Job AKTIV, feuert planmäßig, kassiert ein 401
-- und sendet nichts — und pg_cron verbucht ihn trotzdem als erfolgreich.
-- Stiller Totalausfall.
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
  -- Secret aus einem laufenden Cron lesen.
  select substring(command from $re$x-cron-secret'\s*,\s*'([^']+)'$re$)
    into v_secret
    from cron.job
   where jobname in ('schmerzcheck-drip-daily', 'training-reminder-hourly')
   order by jobname
   limit 1;

  if v_secret is null or v_secret = '' or v_secret like '%__DEIN%' then
    raise exception
      'CRON_SECRET konnte aus keinem bestehenden Job gelesen werden. '
      'Vorhandene Jobs pruefen mit: select jobname from cron.job;';
  end if;

  begin
    perform cron.unschedule('sprechzimmer-erinnerungen-hourly');
  exception when others then
    null;
  end;

  v_cmd := format(
    $cmd$
    select net.http_get(
      url     := 'https://wwwpraxis-os.com/api/cron/sprechzimmer-erinnerungen',
      headers := jsonb_build_object('x-cron-secret', %L)
    );
    $cmd$,
    v_secret
  );

  -- Zur vollen Stunde. Die Fenster im Endpunkt sind bewusst breiter als eine
  -- Stunde (23–25 h bzw. 45–75 min), damit ein ausgefallener Lauf nachgeholt
  -- wird, ohne dass jemand zwei Erinnerungen bekommt.
  perform cron.schedule('sprechzimmer-erinnerungen-hourly', '0 * * * *', v_cmd);

  raise notice 'Erinnerungs-Cron angelegt (Secret uebernommen, % Zeichen).', length(v_secret);
end
$outer$;

-- ── Sofortige Kontrolle ──────────────────────────────────────────────────────
-- Muss zeigen: schedule = '0 * * * *', active = true, secret_ok = true
select jobname,
       schedule,
       active,
       command not like '%__DEIN%' and command like '%x-cron-secret%' as secret_ok
  from cron.job
 where jobname = 'sprechzimmer-erinnerungen-hourly';

-- ── Nach dem ersten Lauf ─────────────────────────────────────────────────────
--   select status_code, content, created from net._http_response
--    order by created desc limit 5;
-- Erwartet: {"ok":true,"24h":0,"1h":0,...} solange keine Termine anstehen.
