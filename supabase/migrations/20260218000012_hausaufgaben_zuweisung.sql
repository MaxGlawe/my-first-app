-- ============================================================
-- PROJ-10: Hausaufgaben-Zuweisung
-- patient_assignments — assignment of training plans to patients
-- assignment_completions — patient marks a session as done
-- ============================================================

-- ----------------------------------------------------------------
-- 1. patient_assignments
-- ----------------------------------------------------------------
CREATE TABLE patient_assignments (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id          UUID        REFERENCES training_plans(id) ON DELETE SET NULL,

  start_date       DATE        NOT NULL,
  end_date         DATE        NOT NULL,

  -- Text array of weekday codes: ["mo","di","mi","do","fr","sa","so"]
  active_days      TEXT[]      NOT NULL DEFAULT '{}',

  -- "aktiv" | "abgelaufen" | "deaktiviert"
  status           TEXT        NOT NULL DEFAULT 'aktiv'
    CHECK (status IN ('aktiv', 'abgelaufen', 'deaktiviert')),

  -- JSONB list of exercises for ad-hoc assignments (when plan_id IS NULL)
  adhoc_exercises  JSONB,

  -- Optional therapist note visible to patient (max 1000 chars enforced at API)
  notiz            TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Business rule: either plan_id OR adhoc_exercises must be provided
  CONSTRAINT chk_plan_or_adhoc CHECK (
    plan_id IS NOT NULL
    OR (adhoc_exercises IS NOT NULL AND jsonb_array_length(adhoc_exercises) > 0)
  ),

  -- End date must be >= start date
  CONSTRAINT chk_date_order CHECK (end_date >= start_date)
);

ALTER TABLE patient_assignments ENABLE ROW LEVEL SECURITY;

-- Therapist sees all assignments they created; admin sees all
CREATE POLICY "pa_select" ON patient_assignments
  FOR SELECT USING (
    auth.uid() = therapist_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only the owning therapist (or admin) can insert assignments
CREATE POLICY "pa_insert" ON patient_assignments
  FOR INSERT WITH CHECK (
    auth.uid() = therapist_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only the owning therapist (or admin) can update
CREATE POLICY "pa_update" ON patient_assignments
  FOR UPDATE USING (
    auth.uid() = therapist_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Hard deletes are never used (soft-delete via status = 'deaktiviert')
-- but guard the DELETE path anyway
CREATE POLICY "pa_delete" ON patient_assignments
  FOR DELETE USING (
    auth.uid() = therapist_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Performance indexes
CREATE INDEX idx_pa_patient_id    ON patient_assignments(patient_id);
CREATE INDEX idx_pa_therapist_id  ON patient_assignments(therapist_id);
CREATE INDEX idx_pa_status        ON patient_assignments(status);
CREATE INDEX idx_pa_end_date      ON patient_assignments(end_date);
-- Composite: therapist + status for dashboard query
CREATE INDEX idx_pa_therapist_status ON patient_assignments(therapist_id, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_patient_assignments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER pa_updated_at
  BEFORE UPDATE ON patient_assignments
  FOR EACH ROW EXECUTE FUNCTION update_patient_assignments_updated_at();

-- ----------------------------------------------------------------
-- 2. assignment_completions
-- ----------------------------------------------------------------
-- One row per (assignment, completed_date) — patient marks daily session done.
-- unit_id is optional — links to the specific plan_unit completed that day.
CREATE TABLE assignment_completions (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id    UUID        NOT NULL REFERENCES patient_assignments(id) ON DELETE CASCADE,
  unit_id          UUID        REFERENCES plan_units(id) ON DELETE SET NULL,
  patient_id       UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- The calendar date the patient claims to have trained (allows backdating)
  completed_date   DATE        NOT NULL,

  -- Exact timestamp the record was created
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One completion per assignment per day (prevents double-marking)
  CONSTRAINT uq_completion_per_day UNIQUE (assignment_id, completed_date)
);

ALTER TABLE assignment_completions ENABLE ROW LEVEL SECURITY;

-- Therapist reads completions for their patients (via assignment ownership)
CREATE POLICY "ac_select" ON assignment_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_assignments pa
      WHERE pa.id = assignment_id
        AND (
          pa.therapist_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- Patient inserts their own completion (patient_id must match auth user)
-- Therapists can also insert on behalf of patient (for testing / backfill)
CREATE POLICY "ac_insert" ON assignment_completions
  FOR INSERT WITH CHECK (
    -- Patient marking their own session
    auth.uid() = patient_id
    -- OR therapist who owns the assignment
    OR EXISTS (
      SELECT 1 FROM patient_assignments pa
      WHERE pa.id = assignment_id AND pa.therapist_id = auth.uid()
    )
    -- OR admin
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Completions are immutable (no UPDATE policy)
-- Hard delete allowed only by the patient themselves or admin
CREATE POLICY "ac_delete" ON assignment_completions
  FOR DELETE USING (
    auth.uid() = patient_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Performance indexes
CREATE INDEX idx_ac_assignment_id    ON assignment_completions(assignment_id);
CREATE INDEX idx_ac_patient_id       ON assignment_completions(patient_id);
CREATE INDEX idx_ac_completed_date   ON assignment_completions(completed_date);
-- Composite for 7-day compliance window queries
CREATE INDEX idx_ac_assignment_date  ON assignment_completions(assignment_id, completed_date);
