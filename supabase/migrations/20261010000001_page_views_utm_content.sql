-- Analytics: utm_content und utm_term mitschreiben.
--
-- Bisher wurden nur source/medium/campaign gespeichert. Damit liess sich
-- sagen „Meta bringt 218 Sitzungen", aber nicht WELCHE Anzeige — und genau
-- das ist die Frage, nach der Budget verschoben wird. Meta liefert die
-- Anzeigen-Kennung in utm_content; sie zu messen und nicht zu speichern
-- waere die teuerste Zeile dieses Projekts.
--
-- Zusaetzlich: utm_content='test' markiert eigene Besuche (siehe lib/intern).

ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_term TEXT;

-- Die Aufschluesselung laeuft immer ueber einen Zeitraum, deshalb der
-- zusammengesetzte Index: erst der Zeitfilter, dann die Gruppierung.
CREATE INDEX IF NOT EXISTS idx_pv_created_content ON page_views(created_at DESC, utm_content);

-- ── Einmalige Datenkorrektur: Testbuchung vom 09.10.2026 ─────────────────
--
-- Der Termin wurde mit vollstaendiger Herkunft angelegt
-- (source=meta, medium=paid, campaign=test, content=test — nachweisbar in
-- webhook_events, appointment.created um 12:50:46) und drei Minuten spaeter
-- abgesagt. Der Upsert der Absage schrieb alle Felder, also auch die
-- Herkunft — mit NULL. Die Ursache ist im Code behoben (die Herkunft wird
-- jetzt nur geschrieben, wenn sie mitkommt); hier wird der verlorene Wert
-- zurueckgetragen.
--
-- Damit ist die Buchung gleichzeitig als Test markiert: content='test'
-- nimmt sie aus dem Trichter heraus, so wie utm_content=test die eigenen
-- Seitenbesuche herausnimmt.

UPDATE appointments
   SET referrer_source   = 'meta',
       referrer_medium   = 'paid',
       referrer_campaign = 'test',
       referrer_content  = 'test'
 WHERE booking_system_appointment_id = '5d2dd646-2034-4131-81c5-d1cf58a35934'
   AND referrer_source IS NULL;

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select utm_content, utm_term from page_views limit 1;          -- 2 Spalten
--   select referrer_source, referrer_content from appointments
--    where booking_system_appointment_id = '5d2dd646-2034-4131-81c5-d1cf58a35934';
--   -- muss 'meta' / 'test' liefern
