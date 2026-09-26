-- ============================================================
-- PROJ-28 / PROJ-7: Videotermin entsteht aus der Buchung
--
-- Wer die Video-Sprechstunde auf der Website bucht, soll den Termin im
-- Sprechzimmer vorfinden, ohne dass jemand ihn abtippt — samt Einladung.
-- Dafuer muss das Gespraech wissen, aus welcher Buchung es entstanden ist:
--
--   — damit ein zweites Mal geliefertes Ereignis keinen zweiten Termin
--     anlegt (Webhooks werden wiederholt, das ist normal);
--   — damit eine Verlegung im Kalender den Videotermin mitnimmt;
--   — damit eine Absage im Kalender auch hier absagt.
--
-- Nullable: Termine, die der Behandler selbst anlegt, haben keine Buchung —
-- und das bleibt der normale Weg fuer alles ausser der Konsultation.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren (Migrationen laufen nicht im Deploy).
-- ============================================================

ALTER TABLE video_calls
  ADD COLUMN IF NOT EXISTS booking_appointment_id TEXT;

-- Eindeutig, aber nur wo gesetzt: Ein partieller Index laesst beliebig viele
-- Termine ohne Buchung zu und genau einen je Buchung.
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_calls_booking_appointment
  ON video_calls (booking_appointment_id)
  WHERE booking_appointment_id IS NOT NULL;

COMMENT ON COLUMN video_calls.booking_appointment_id IS
  'PROJ-28: Buchung aus dem Kalender, aus der dieses Gespraech entstanden ist. NULL = von Hand angelegt.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
-- Muss eine Zeile liefern:
--   select column_name from information_schema.columns
--    where table_name = 'video_calls' and column_name = 'booking_appointment_id';
