-- ============================================================
-- PROJ-3: Anamnese & Untersuchungsdokumentation
-- Migration: anamnesis_records table + RLS + indexes
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Enable UUID extension (idempotent)
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 2. anamnesis_records table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anamnesis_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Versionierung: automatisch hochgezählt je Patient
  version      INTEGER NOT NULL DEFAULT 1,

  -- Status: entwurf (bearbeitbar) oder abgeschlossen (schreibgeschützt)
  status       TEXT NOT NULL DEFAULT 'entwurf'
                 CHECK (status IN ('entwurf', 'abgeschlossen')),

  -- JSONB: alle Formulardaten flexibel gespeichert (schema-agnostisch)
  data         JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- ----------------------------------------------------------------
-- 3. updated_at auto-trigger
--    Reuses set_updated_at() function created in PROJ-2 migration.
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_anamnesis_records_updated_at ON anamnesis_records;
CREATE TRIGGER trg_anamnesis_records_updated_at
  BEFORE UPDATE ON anamnesis_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 4. Auto-increment version per patient
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_anamnesis_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
    INTO NEW.version
    FROM anamnesis_records
   WHERE patient_id = NEW.patient_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_anamnesis_version ON anamnesis_records;
CREATE TRIGGER trg_anamnesis_version
  BEFORE INSERT ON anamnesis_records
  FOR EACH ROW EXECUTE FUNCTION set_anamnesis_version();

-- ----------------------------------------------------------------
-- 5. Performance indexes
-- ----------------------------------------------------------------
-- Primary lookup by patient (all records for a patient)
CREATE INDEX IF NOT EXISTS idx_anamnesis_patient_id
  ON anamnesis_records(patient_id);

-- Chronological listing within a patient
CREATE INDEX IF NOT EXISTS idx_anamnesis_patient_created
  ON anamnesis_records(patient_id, created_at DESC);

-- Author lookup (created_by for name join)
CREATE INDEX IF NOT EXISTS idx_anamnesis_created_by
  ON anamnesis_records(created_by);

-- Status filter (e.g. finding open drafts)
CREATE INDEX IF NOT EXISTS idx_anamnesis_status
  ON anamnesis_records(status);

-- JSONB GIN index for future full-text search on content
CREATE INDEX IF NOT EXISTS idx_anamnesis_data_gin
  ON anamnesis_records USING GIN (data);

-- ----------------------------------------------------------------
-- 6. Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE anamnesis_records ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- RLS Policy: SELECT
-- Therapeut darf nur Anamnesen von eigenen Patienten lesen.
-- Admin darf alle lesen.
-- Patients haben keinen Zugriff (klinische Dokumentation).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "anamnesis_select" ON anamnesis_records;
CREATE POLICY "anamnesis_select" ON anamnesis_records
  FOR SELECT
  USING (
    -- Admin sieht alles
    get_my_role() = 'admin'
    OR
    -- Therapeut sieht Anamnesen seiner eigenen Patienten
    (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = anamnesis_records.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: INSERT
-- Therapeut darf neue Anamnesen nur für eigene Patienten anlegen.
-- Admin darf überall anlegen.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "anamnesis_insert" ON anamnesis_records;
CREATE POLICY "anamnesis_insert" ON anamnesis_records
  FOR INSERT
  WITH CHECK (
    get_my_role() = 'admin'
    OR (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = anamnesis_records.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: UPDATE
-- Nur Entwürfe dürfen bearbeitet werden.
-- Nur der ursprüngliche Ersteller oder Admin darf bearbeiten.
-- Abgeschlossene Bögen: unveränderlich.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "anamnesis_update" ON anamnesis_records;
CREATE POLICY "anamnesis_update" ON anamnesis_records
  FOR UPDATE
  USING (
    -- Nur Entwürfe können bearbeitet werden
    status = 'entwurf'
    AND (
      -- Admin darf alles
      get_my_role() = 'admin'
      OR
      -- Ersteller darf eigenen Entwurf bearbeiten (Patient muss ihm gehören)
      (
        get_my_role() IN ('physiotherapeut', 'heilpraktiker')
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = anamnesis_records.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    status = 'entwurf'
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() IN ('physiotherapeut', 'heilpraktiker')
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = anamnesis_records.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: DELETE
-- Physisches Löschen verboten (DSGVO: Dokumentationspflicht).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "anamnesis_delete" ON anamnesis_records;
CREATE POLICY "anamnesis_delete" ON anamnesis_records
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------
-- 7. Grant helper function access (already granted in PROJ-2)
-- ----------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION set_anamnesis_version() TO authenticated;

-- ----------------------------------------------------------------
-- Done.
-- After running this migration:
--   1. Verify RLS: SELECT relrowsecurity FROM pg_class WHERE relname = 'anamnesis_records';
--   2. Test SELECT as therapist: should only return records for own patients
--   3. Test UPDATE on abgeschlossen record: should be blocked by RLS
--   4. Test INSERT: version should auto-increment per patient
-- ----------------------------------------------------------------
