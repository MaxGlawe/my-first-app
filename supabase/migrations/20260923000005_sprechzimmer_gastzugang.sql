-- ============================================================
-- PROJ-27: Gast-Zugang zum Sprechzimmer
--
-- WARUM DAS NOETIG IST — ein Denkfehler im ersten Entwurf:
--
-- Der Zutritt verlangte eine Anmeldung in Praxis OS. Beim wichtigsten
-- Gespraech ueberhaupt, der Videokonsultation, hat der Patient aber noch gar
-- kein Konto: Er bucht auf physiotherapie-glawe.de, wird von Hand angelegt,
-- spricht mit dem Behandler — und erst DANACH entsteht beim Kauf sein Zugang.
-- Die Konsultation waere damit als einzige nicht durchfuehrbar gewesen.
--
-- Dazu kam der Praxistest vom 23.09.2026: Die Benachrichtigung erreichte den
-- Patienten nicht, weil im gesamten System genau eine Push-Anmeldung
-- existiert. Push setzt eine installierte App und eine erteilte Erlaubnis
-- voraus — darauf als einzigen Weg zu bauen, war falsch.
--
-- Der Gast-Token ist ein Trage-Geheimnis: Wer den Link hat, kommt hinein.
-- Genau so arbeitet jeder Videodienst. Abgesichert ist er dreifach — er ist
-- zufaellig und nicht erratbar, er gilt fuer genau EIN Gespraech, und er
-- verfaellt mit dessen Zeitfenster. Ein abgelaufener Link ist wertlos.
--
-- Idempotent.
-- ============================================================

ALTER TABLE video_calls
  ADD COLUMN IF NOT EXISTS gast_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Der Token ist der Schluessel zum Raum; zwei Gespraeche duerfen nie
-- denselben tragen.
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_calls_gast_token
  ON video_calls (gast_token);

COMMENT ON COLUMN video_calls.gast_token IS
  'PROJ-27: Zutritt ohne Praxis-OS-Konto. Gilt fuer genau dieses Gespraech und nur innerhalb seines Zeitfensters.';
