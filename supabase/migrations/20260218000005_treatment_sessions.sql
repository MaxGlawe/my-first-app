-- ============================================================
-- PROJ-5: Behandlungsdokumentation
-- Migration: treatment_sessions table + RLS + indexes
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Enable UUID extension (idempotent)
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 2. treatment_sessions table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS treatment_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Session date: DATE (not TIMESTAMP) so over-midnight sessions use the start date
  session_date      DATE NOT NULL,

  -- Treatment duration in minutes (optional — therapist may forget)
  duration_minutes  INTEGER CHECK (duration_minutes IS NULL OR (duration_minutes >= 1 AND duration_minutes <= 480)),

  -- JSONB array: MassnahmeId strings + optional free-text entry
  -- e.g. ["KG", "MT", "Wärme", "PNF-Gangschule"]
  measures          JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- NRS pain scale 0–10 at start of session (mandatory)
  nrs_before        INTEGER NOT NULL CHECK (nrs_before >= 0 AND nrs_before <= 10),

  -- NRS pain scale 0–10 at end of session (optional)
  nrs_after         INTEGER CHECK (nrs_after IS NULL OR (nrs_after >= 0 AND nrs_after <= 10)),

  -- Free text fields
  notes             TEXT NOT NULL DEFAULT '' CHECK (char_length(notes) <= 5000),
  next_steps        TEXT NOT NULL DEFAULT '' CHECK (char_length(next_steps) <= 2000),

  -- Status: entwurf (auto-save drafts) or abgeschlossen (confirmed by therapist)
  status            TEXT NOT NULL DEFAULT 'entwurf'
                      CHECK (status IN ('entwurf', 'abgeschlossen')),

  -- Timestamp set when therapist confirms the session (status -> abgeschlossen)
  confirmed_at      TIMESTAMPTZ,

  -- Edit lock: created_at + 24 hours (set automatically by trigger on INSERT)
  -- After locked_at the record is read-only (enforced in API + RLS)
  locked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

-- ----------------------------------------------------------------
-- 3a. locked_at trigger: always set to created_at + 24h on INSERT
--     (GENERATED ALWAYS AS is not allowed for TIMESTAMPTZ arithmetic in Postgres)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_treatment_locked_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.locked_at := NEW.created_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_treatment_sessions_locked_at ON treatment_sessions;
CREATE TRIGGER trg_treatment_sessions_locked_at
  BEFORE INSERT ON treatment_sessions
  FOR EACH ROW EXECUTE FUNCTION set_treatment_locked_at();

-- ----------------------------------------------------------------
-- 3b. updated_at auto-trigger (reuses set_updated_at() from PROJ-2)
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_treatment_sessions_updated_at ON treatment_sessions;
CREATE TRIGGER trg_treatment_sessions_updated_at
  BEFORE UPDATE ON treatment_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 4. Performance indexes
-- ----------------------------------------------------------------

-- Primary lookup: all sessions for a patient (most common query)
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_patient_id
  ON treatment_sessions(patient_id);

-- Chronological listing within a patient (timeline view, newest first)
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_patient_date
  ON treatment_sessions(patient_id, session_date DESC);

-- Therapist lookup (who created this session)
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_therapist_id
  ON treatment_sessions(therapist_id);

-- Status filter (finding open drafts for cleanup or auto-save recovery)
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_status
  ON treatment_sessions(status);

-- NRS aggregation for chart (covered by patient_date index, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_nrs
  ON treatment_sessions(patient_id, session_date ASC, nrs_before, nrs_after);

-- ----------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- RLS Policy: SELECT
-- Therapeut darf nur Sessions seiner eigenen Patienten lesen.
-- Admin darf alle lesen.
-- Patient: kein Zugriff (kommt in PROJ-11 über separate /app/* Routen).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "treatment_sessions_select" ON treatment_sessions;
CREATE POLICY "treatment_sessions_select" ON treatment_sessions
  FOR SELECT
  USING (
    -- Admin sieht alle
    get_my_role() = 'admin'
    OR
    -- Physiotherapeut / Heilpraktiker sieht Sessions seiner eigenen Patienten
    (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = treatment_sessions.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: INSERT
-- Alle Therapeuten dürfen Sessions für ihre eigenen Patienten anlegen.
-- Admin darf überall anlegen.
-- therapist_id muss der eigene User sein (Manipulation ausgeschlossen).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "treatment_sessions_insert" ON treatment_sessions;
CREATE POLICY "treatment_sessions_insert" ON treatment_sessions
  FOR INSERT
  WITH CHECK (
    therapist_id = auth.uid()
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() IN ('physiotherapeut', 'heilpraktiker')
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = treatment_sessions.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: UPDATE
-- Nur innerhalb der 24h-Bearbeitungsfrist (NOW() < locked_at).
-- Nur der ursprüngliche Ersteller (therapist_id) oder Admin darf bearbeiten.
-- Nach Ablauf der Frist: read-only (Rechtssicherheit in der Behandlungsdoku).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "treatment_sessions_update" ON treatment_sessions;
CREATE POLICY "treatment_sessions_update" ON treatment_sessions
  FOR UPDATE
  USING (
    -- Admin kann immer bearbeiten (auch nach Ablauf der 24h-Frist — Freischaltung)
    get_my_role() = 'admin'
    OR
    -- Therapeut kann eigene Sessions nur innerhalb der 24h-Bearbeitungsfrist bearbeiten
    (
      NOW() < locked_at
      AND get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND therapist_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = treatment_sessions.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    -- therapist_id must not be changed on update
    therapist_id = auth.uid()
    OR get_my_role() = 'admin'
  );

-- ----------------------------------------------------------------
-- RLS Policy: DELETE
-- Physisches Löschen verboten (DSGVO: Dokumentationspflicht).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "treatment_sessions_delete" ON treatment_sessions;
CREATE POLICY "treatment_sessions_delete" ON treatment_sessions
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------
-- 6. Grant helper function access (already granted in PROJ-2)
-- ----------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- ----------------------------------------------------------------
-- Done.
-- After running this migration:
--   1. Verify RLS: SELECT relrowsecurity FROM pg_class WHERE relname = 'treatment_sessions';
--   2. Verify locked_at trigger: INSERT a row, check locked_at = created_at + 24h
--   3. Test SELECT as physiotherapeut: should only see own patients' sessions
--   4. Test INSERT with wrong therapist_id: should fail RLS
--   5. Test UPDATE after 24h (mock by setting created_at to 25h ago): should be blocked
--   6. Test DELETE: should always fail
-- ----------------------------------------------------------------
