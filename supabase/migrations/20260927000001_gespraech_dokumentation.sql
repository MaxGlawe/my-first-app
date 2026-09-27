-- ============================================================
-- PROJ-29: Was im Gespräch dokumentiert wird, trägt später die Rechnung
--
-- Zwei Angaben, die nur im Gespräch selbst entstehen können und ohne die
-- eine GebüH-Rechnung nicht entstehen darf:
--
--   diagnose           Die Diagnose ist Pflichtangabe auf jeder Rechnung.
--                      Sie im Nachhinein zu rekonstruieren heisst raten —
--                      also wird sie erfasst, waehrend der Patient noch da
--                      ist. Die ausfuehrliche Diagnose mit ICD-10 bleibt in
--                      `diagnoses` (PROJ-4); hier steht die Zeile, die auf
--                      die Rechnung gehoert.
--
--   uebung_angeleitet  Die Analogziffer A20.1 (aktive Bewegungstherapie per
--                      Video) darf nur abgerechnet werden, wenn tatsaechlich
--                      eine Uebung angeleitet wurde — mit Dokumentation.
--                      Ohne Haken keine Position: Die 31 € wandern in die
--                      Programmpauschale statt in eine Leistung, die nicht
--                      stattfand.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren (Migrationen laufen nicht im Deploy).
-- ============================================================

ALTER TABLE video_calls
  ADD COLUMN IF NOT EXISTS diagnose          TEXT,
  ADD COLUMN IF NOT EXISTS uebung_angeleitet BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN video_calls.diagnose IS
  'PROJ-29: Diagnose fuer die Rechnung, im Gespraech erfasst. Ausfuehrlich: siehe diagnoses.';
COMMENT ON COLUMN video_calls.uebung_angeleitet IS
  'PROJ-29: Wurde im Gespraech eine Uebung angeleitet? Voraussetzung fuer die Analogziffer A20.1.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select column_name from information_schema.columns
--    where table_name = 'video_calls'
--      and column_name in ('diagnose', 'uebung_angeleitet');
-- Muss zwei Zeilen liefern.
