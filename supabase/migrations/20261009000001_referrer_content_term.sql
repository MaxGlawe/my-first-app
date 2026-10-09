-- ============================================================
-- Kampagnen-Attribution: referrer_content und referrer_term
--
-- `appointments` trug bisher source, medium und campaign. Fuer die Auswertung
-- einzelner Anzeigen fehlen die beiden feineren Ebenen:
--
--   utm_content  welche Anzeige / welcher Seitenabschnitt
--   utm_term     welches Keyword (Google Ads)
--
-- Ohne `content` laesst sich nicht sagen, WELCHE Anzeige einer Kampagne
-- gebucht hat — und genau das ist die Frage, die ueber das Budget entscheidet.
--
-- HINWEIS zum Stand (09.10.2026): Das Buchungstool sendet bislang GAR KEINE
-- referrer-Angaben. Geprueft an allen vorliegenden appointment.created-
-- Ereignissen — das Feld fehlt im Payload, alle Spalten sind NULL. Die
-- Empfangsseite ist damit vollstaendig, die Sendeseite fehlt.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS referrer_content TEXT,
  ADD COLUMN IF NOT EXISTS referrer_term    TEXT;

COMMENT ON COLUMN appointments.referrer_content IS
  'utm_content der Buchung — welche Anzeige bzw. welcher Seitenabschnitt. Kommt vom Buchungstool.';
COMMENT ON COLUMN appointments.referrer_term IS
  'utm_term der Buchung — Keyword bei Suchanzeigen. Kommt vom Buchungstool.';

-- Auswertung „Buchungen nach Kanal": nur Termine, die eine Herkunft tragen.
CREATE INDEX IF NOT EXISTS idx_appointments_herkunft
  ON appointments (referrer_source, referrer_content)
  WHERE referrer_source IS NOT NULL;

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select referrer_source, referrer_content, referrer_term
--     from appointments limit 1;
-- Muss drei Spalten liefern (alle NULL, solange das Buchungstool nichts sendet).
