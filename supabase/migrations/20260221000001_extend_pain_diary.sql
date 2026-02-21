-- Migration: Erweitertes Schmerztagebuch
-- Neue Felder für tiefere therapeutische Rückschlüsse

ALTER TABLE pain_diary_entries
  ADD COLUMN IF NOT EXISTS sleep_quality SMALLINT CHECK (sleep_quality >= 0 AND sleep_quality <= 10),
  ADD COLUMN IF NOT EXISTS stress_level SMALLINT CHECK (stress_level >= 0 AND stress_level <= 10),
  ADD COLUMN IF NOT EXISTS movement_restriction SMALLINT CHECK (movement_restriction >= 0 AND movement_restriction <= 10),
  ADD COLUMN IF NOT EXISTS pain_location TEXT[] DEFAULT '{}';

-- Kommentar für Dokumentation
COMMENT ON COLUMN pain_diary_entries.sleep_quality IS 'Schlafqualität 0-10 (0=sehr schlecht, 10=ausgezeichnet)';
COMMENT ON COLUMN pain_diary_entries.stress_level IS 'Stresslevel 0-10 (0=kein Stress, 10=maximaler Stress)';
COMMENT ON COLUMN pain_diary_entries.movement_restriction IS 'Bewegungseinschränkung 0-10 (0=keine, 10=maximale Einschränkung)';
COMMENT ON COLUMN pain_diary_entries.pain_location IS 'Schmerzlokalisation als Array von Körperregionen';
