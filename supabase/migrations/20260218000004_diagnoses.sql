-- ============================================================
-- PROJ-4: Befund & Diagnose (Heilpraktiker)
-- Migration: diagnoses table + RLS + indexes
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Enable UUID extension (idempotent)
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 2. diagnoses table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnoses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  patient_id            UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by            UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Audit field: DB-level proof that only Heilpraktiker may create diagnoses
  created_by_role       TEXT NOT NULL DEFAULT 'heilpraktiker'
                          CHECK (created_by_role = 'heilpraktiker'),

  -- Status: entwurf (editable) or abgeschlossen (write-protected)
  status                TEXT NOT NULL DEFAULT 'entwurf'
                          CHECK (status IN ('entwurf', 'abgeschlossen')),

  -- Clinical content
  klinischer_befund     TEXT NOT NULL CHECK (char_length(klinischer_befund) BETWEEN 1 AND 10000),

  -- JSONB: { icd10: { code, bezeichnung } | null, sicherheitsgrad, freitextDiagnose?, freitextNotiz? }
  hauptdiagnose         JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- JSONB array: up to 5 DiagnoseEintrag objects
  nebendiagnosen        JSONB NOT NULL DEFAULT '[]'::JSONB,

  therapieziel          TEXT NOT NULL DEFAULT '' CHECK (char_length(therapieziel) <= 5000),
  prognose              TEXT NOT NULL DEFAULT '' CHECK (char_length(prognose) <= 5000),
  therapiedauer_wochen  INTEGER CHECK (therapiedauer_wochen IS NULL OR (therapiedauer_wochen >= 1 AND therapiedauer_wochen <= 520))
);

-- ----------------------------------------------------------------
-- 3. updated_at auto-trigger (reuses set_updated_at() from PROJ-2)
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_diagnoses_updated_at ON diagnoses;
CREATE TRIGGER trg_diagnoses_updated_at
  BEFORE UPDATE ON diagnoses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 4. Performance indexes
-- ----------------------------------------------------------------
-- Primary lookup: all diagnoses for a patient
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id
  ON diagnoses(patient_id);

-- Chronological listing within a patient
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_created
  ON diagnoses(patient_id, created_at DESC);

-- Author lookup (for name join with user_profiles)
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_by
  ON diagnoses(created_by);

-- Status filter (finding open drafts)
CREATE INDEX IF NOT EXISTS idx_diagnoses_status
  ON diagnoses(status);

-- JSONB GIN index for future full-text search / KI-Arztbericht (PROJ-6)
CREATE INDEX IF NOT EXISTS idx_diagnoses_hauptdiagnose_gin
  ON diagnoses USING GIN (hauptdiagnose);

-- ----------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- RLS Policy: SELECT
-- Heilpraktiker darf nur Diagnosen seiner eigenen Patienten lesen.
-- Admin darf alle lesen.
-- Physiotherapeut: KEIN Zugriff (SELECT ebenfalls geblockt).
-- Patient: kein Zugriff.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "diagnoses_select" ON diagnoses;
CREATE POLICY "diagnoses_select" ON diagnoses
  FOR SELECT
  USING (
    -- Admin sieht alles
    get_my_role() = 'admin'
    OR
    -- Heilpraktiker sieht Diagnosen seiner eigenen Patienten
    (
      get_my_role() = 'heilpraktiker'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = diagnoses.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: INSERT
-- Nur Heilpraktiker darf neue Diagnosen für eigene Patienten anlegen.
-- Admin darf überall anlegen.
-- created_by_role wird serverseitig auf 'heilpraktiker' gesetzt.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "diagnoses_insert" ON diagnoses;
CREATE POLICY "diagnoses_insert" ON diagnoses
  FOR INSERT
  WITH CHECK (
    -- created_by_role must always be 'heilpraktiker' (enforced by CHECK constraint too)
    created_by_role = 'heilpraktiker'
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() = 'heilpraktiker'
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = diagnoses.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: UPDATE
-- Nur Entwürfe dürfen bearbeitet werden.
-- Nur der ursprüngliche Ersteller (Heilpraktiker) oder Admin darf bearbeiten.
-- Abgeschlossene Befunde: unveränderlich (Dokumentationspflicht).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "diagnoses_update" ON diagnoses;
CREATE POLICY "diagnoses_update" ON diagnoses
  FOR UPDATE
  USING (
    -- Only drafts can be edited
    status = 'entwurf'
    AND (
      -- Admin kann alles bearbeiten
      get_my_role() = 'admin'
      OR
      -- Heilpraktiker kann eigenen Entwurf bearbeiten (Patient muss ihm gehören)
      (
        get_my_role() = 'heilpraktiker'
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = diagnoses.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    status = 'entwurf'
    AND created_by_role = 'heilpraktiker'
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() = 'heilpraktiker'
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = diagnoses.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: DELETE
-- Physisches Löschen verboten (DSGVO: Dokumentationspflicht).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "diagnoses_delete" ON diagnoses;
CREATE POLICY "diagnoses_delete" ON diagnoses
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------
-- 6. Grant helper function access (already granted in PROJ-2)
-- ----------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- ----------------------------------------------------------------
-- Done.
-- After running this migration:
--   1. Verify RLS: SELECT relrowsecurity FROM pg_class WHERE relname = 'diagnoses';
--   2. Test SELECT as physiotherapeut: should return 0 rows (RLS blocks all)
--   3. Test INSERT as physiotherapeut: should fail with RLS violation
--   4. Test INSERT as heilpraktiker: should succeed for own patients only
--   5. Test UPDATE on abgeschlossen record: should be blocked by RLS
-- ----------------------------------------------------------------
