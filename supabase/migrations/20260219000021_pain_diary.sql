-- ============================================================
-- PROJ-16: Schmerztagebuch / Pain Diary
-- Patients record daily pain (NRS 0-10) and wellbeing scores.
-- Therapists see the timeline in the OS patient detail view.
-- ============================================================

CREATE TABLE IF NOT EXISTS pain_diary_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_level  SMALLINT NOT NULL CHECK (pain_level BETWEEN 0 AND 10),
  wellbeing   SMALLINT NOT NULL CHECK (wellbeing BETWEEN 0 AND 10),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Max 1 entry per patient per day (upsert-friendly)
  UNIQUE (patient_id, entry_date)
);

-- Index for therapist timeline queries (patient + date range)
CREATE INDEX IF NOT EXISTS idx_pain_diary_patient_date
  ON pain_diary_entries (patient_id, entry_date DESC);

-- ── RLS ───────────────────────────────────────────────────────────

ALTER TABLE pain_diary_entries ENABLE ROW LEVEL SECURITY;

-- Patient can INSERT their own entries
CREATE POLICY "pain_diary_insert_patient" ON pain_diary_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- patient_id must match the logged-in patient's clinic ID
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Patient can UPDATE (upsert) their own entries
CREATE POLICY "pain_diary_update_patient" ON pain_diary_entries
  FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Patient can SELECT their own entries
CREATE POLICY "pain_diary_select_patient" ON pain_diary_entries
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Therapists & Admin can SELECT all entries (for their patients)
CREATE POLICY "pain_diary_select_therapist" ON pain_diary_entries
  FOR SELECT
  TO authenticated
  USING (
    get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer', 'praxismanagement'
    )
  );

-- ============================================================
-- Verification:
--   1. Run in Supabase SQL Editor
--   2. As patient: INSERT an entry → should succeed
--   3. As patient: INSERT second entry same day → should upsert
--   4. As therapist: SELECT entries for a patient → should succeed
--   5. As patient: SELECT another patient's entries → should fail
-- ============================================================
