-- ============================================================
-- PROJ-6: KI-Arztbericht-Generator
-- Migration: medical_reports table + RLS + indexes
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Enable UUID extension (idempotent)
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 2. medical_reports table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_reports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relations
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  generated_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- DB-level audit field: role is always set server-side, never from client input
  -- 'heilpraktiker' → creates Arztbericht; 'physiotherapeut' → creates Therapiebericht
  generated_by_role   TEXT NOT NULL
                        CHECK (generated_by_role IN ('heilpraktiker', 'physiotherapeut', 'admin')),

  -- Report type derived from role (server-side enforced — client cannot override)
  report_type         TEXT NOT NULL
                        CHECK (report_type IN ('arztbericht', 'therapiebericht')),

  -- Date range for the documentation window used in this report
  date_from           DATE NOT NULL,
  date_to             DATE NOT NULL,
  CONSTRAINT chk_date_range CHECK (date_from <= date_to),

  -- Recipient information
  recipient_name      TEXT NOT NULL DEFAULT '' CHECK (char_length(recipient_name) <= 500),
  recipient_address   TEXT NOT NULL DEFAULT '' CHECK (char_length(recipient_address) <= 1000),

  -- Optional free-text instructions forwarded to Claude
  -- HP: e.g. "Heilmittelempfehlung: Krankengymnastik 3x/Woche"
  -- PT: e.g. "Weiterverordnung: KG-Gerät 20x"
  extra_instructions  TEXT NOT NULL DEFAULT '' CHECK (char_length(extra_instructions) <= 2000),

  -- Immutable KI draft (pseudonymised patient name — audit trail, never editable)
  draft_content       TEXT NOT NULL DEFAULT '',

  -- Therapist-edited final version (may contain real patient name after de-pseudonymisation)
  final_content       TEXT NOT NULL DEFAULT '',

  -- Workflow status
  status              TEXT NOT NULL DEFAULT 'entwurf'
                        CHECK (status IN ('entwurf', 'finalisiert'))
);

-- ----------------------------------------------------------------
-- 3. updated_at auto-trigger (reuses set_updated_at() from PROJ-2)
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_medical_reports_updated_at ON medical_reports;
CREATE TRIGGER trg_medical_reports_updated_at
  BEFORE UPDATE ON medical_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 4. Performance indexes
-- ----------------------------------------------------------------

-- Primary lookup: all reports for a patient (most common query)
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id
  ON medical_reports(patient_id);

-- Chronological listing within a patient (newest first)
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_created
  ON medical_reports(patient_id, created_at DESC);

-- Therapist lookup (who generated this report)
CREATE INDEX IF NOT EXISTS idx_medical_reports_generated_by
  ON medical_reports(generated_by);

-- Rate limiting query: count reports by therapist in last 60 minutes
CREATE INDEX IF NOT EXISTS idx_medical_reports_rate_limit
  ON medical_reports(generated_by, created_at DESC);

-- Filter by report type (Admin views both; individual roles see their own type)
CREATE INDEX IF NOT EXISTS idx_medical_reports_report_type
  ON medical_reports(report_type);

-- Status filter (draft vs finalized)
CREATE INDEX IF NOT EXISTS idx_medical_reports_status
  ON medical_reports(status);

-- ----------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- RLS Policy: SELECT
--
-- Heilpraktiker:    reads only 'arztbericht' rows for their own patients
-- Physiotherapeut:  reads only 'therapiebericht' rows for their own patients
-- Admin:            reads all rows regardless of type
-- Patient:          no access (patient-facing features come in PROJ-11)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "medical_reports_select" ON medical_reports;
CREATE POLICY "medical_reports_select" ON medical_reports
  FOR SELECT
  USING (
    -- Admin sees everything
    get_my_role() = 'admin'
    OR
    -- Heilpraktiker sees only Arztberichte for their own patients
    (
      get_my_role() = 'heilpraktiker'
      AND report_type = 'arztbericht'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = medical_reports.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
    OR
    -- Physiotherapeut sees only Therapieberichte for their own patients
    (
      get_my_role() = 'physiotherapeut'
      AND report_type = 'therapiebericht'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = medical_reports.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: INSERT
--
-- generated_by must equal auth.uid() (no impersonation).
-- Heilpraktiker may only insert 'arztbericht'.
-- Physiotherapeut may only insert 'therapiebericht'.
-- Admin may insert both types.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "medical_reports_insert" ON medical_reports;
CREATE POLICY "medical_reports_insert" ON medical_reports
  FOR INSERT
  WITH CHECK (
    generated_by = auth.uid()
    AND (
      -- Admin
      get_my_role() = 'admin'
      OR
      -- Heilpraktiker: only arztbericht for own patients
      (
        get_my_role() = 'heilpraktiker'
        AND report_type = 'arztbericht'
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = medical_reports.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
      OR
      -- Physiotherapeut: only therapiebericht for own patients
      (
        get_my_role() = 'physiotherapeut'
        AND report_type = 'therapiebericht'
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = medical_reports.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: UPDATE
--
-- Only the original author (generated_by) or Admin may update.
-- Finalized reports are immutable (status = 'finalisiert').
-- draft_content is always immutable after creation (audit trail).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "medical_reports_update" ON medical_reports;
CREATE POLICY "medical_reports_update" ON medical_reports
  FOR UPDATE
  USING (
    -- Admin can always update
    get_my_role() = 'admin'
    OR
    -- Original author can update only while status = 'entwurf'
    (
      generated_by = auth.uid()
      AND status = 'entwurf'
      AND get_my_role() IN ('heilpraktiker', 'physiotherapeut')
    )
  )
  WITH CHECK (
    -- generated_by must not change on update
    generated_by = auth.uid()
    OR get_my_role() = 'admin'
  );

-- ----------------------------------------------------------------
-- RLS Policy: DELETE
--
-- Physical deletion is forbidden (DSGVO medical record retention).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "medical_reports_delete" ON medical_reports;
CREATE POLICY "medical_reports_delete" ON medical_reports
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------
-- 6. Immutable draft_content trigger (DSGVO audit trail)
--
-- draft_content is the pseudonymised KI raw output and must never
-- be altered after creation. This trigger enforces that at the
-- database level, independent of the API layer.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION protect_draft_content()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.draft_content IS DISTINCT FROM OLD.draft_content THEN
    RAISE EXCEPTION 'draft_content is immutable after creation (audit trail).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_draft_content ON medical_reports;
CREATE TRIGGER trg_protect_draft_content
  BEFORE UPDATE ON medical_reports
  FOR EACH ROW EXECUTE FUNCTION protect_draft_content();

-- ----------------------------------------------------------------
-- 7. Grant helper function access (already granted in PROJ-2)
-- ----------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- ----------------------------------------------------------------
-- Done.
-- After running this migration in the Supabase SQL Editor:
--   1. Verify RLS: SELECT relrowsecurity FROM pg_class WHERE relname = 'medical_reports';
--   2. Test SELECT as heilpraktiker: should only see arztberichte of own patients
--   3. Test SELECT as physiotherapeut: should only see therapieberichte of own patients
--   4. Test INSERT with wrong report_type for role: should be blocked by RLS
--   5. Test UPDATE on finalized report: should be blocked (status check)
--   6. Test DELETE: should always fail
-- ----------------------------------------------------------------
