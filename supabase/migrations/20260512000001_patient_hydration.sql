-- B2C Hydration tracking — daily aggregate per patient.
-- Modeled after the BGF version but tied to patient_id instead of user_id,
-- and standalone (does not depend on a daily check-in row).

CREATE TABLE IF NOT EXISTS patient_hydration_daily (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  entry_date    DATE NOT NULL,
  glasses_count INTEGER NOT NULL DEFAULT 0 CHECK (glasses_count >= 0 AND glasses_count <= 20),
  -- Snapshot of the goal at the time of entry, so changes to the patient's
  -- personal goal don't retroactively alter historical days.
  goal_glasses  INTEGER NOT NULL DEFAULT 8 CHECK (goal_glasses > 0 AND goal_glasses <= 20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_hydration_patient_date UNIQUE (patient_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_hydration_patient_date
  ON patient_hydration_daily(patient_id, entry_date DESC);

ALTER TABLE patient_hydration_daily ENABLE ROW LEVEL SECURITY;

-- Patient: read + insert/update only own rows
CREATE POLICY "Patients can view own hydration"
  ON patient_hydration_daily FOR SELECT
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can insert own hydration"
  ON patient_hydration_daily FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can update own hydration"
  ON patient_hydration_daily FOR UPDATE
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Staff: read all hydration entries for their patients (for the OS dashboard view)
CREATE POLICY "Staff can view hydration"
  ON patient_hydration_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer', 'praxismanagement')
    )
  );

-- Patient's personalised daily hydration goal (default 8 glasses ≈ 2L)
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS hydration_goal_glasses INTEGER NOT NULL DEFAULT 8
    CHECK (hydration_goal_glasses > 0 AND hydration_goal_glasses <= 20);
