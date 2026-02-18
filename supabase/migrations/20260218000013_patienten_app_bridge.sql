-- ============================================================
-- PROJ-11: Patienten-App — Dashboard & Trainingspläne
-- Migration: patients.user_id bridge column + Patient RLS policies
-- ============================================================
--
-- This migration solves the "bridge problem":
-- Patients log in with an auth.users account, but their clinical data
-- (assignments, completions) is linked to the patients record (by clinic ID).
-- This new column links the Auth account to the patients record.
--
-- This migration also:
--   - Grants patients READ access to their own record (needed for /api/me/profile)
--   - Grants patients READ access to their own assignments (needed for /api/me/assignments)
--   - Grants patients READ access to their own completions (needed for progress display)
--   - Grants patients INSERT access to their own completions (needed for marking sessions done)
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Add user_id bridge column to patients
-- ----------------------------------------------------------------
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Unique: one patient record per auth account (one-to-one mapping)
-- NULLS NOT DISTINCT: multiple NULL values allowed (unlinked patients)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_id
  ON patients(user_id)
  WHERE user_id IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. Update patients RLS SELECT policy to include patients themselves
--
-- Previously: only therapists and admins could read patient records
-- Now: patients can also read THEIR OWN record (via user_id bridge)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "patients_select" ON patients;
CREATE POLICY "patients_select" ON patients
  FOR SELECT
  USING (
    -- Admin sieht alle
    get_my_role() = 'admin'
    -- Therapeut sieht eigene Patienten
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker') AND therapeut_id = auth.uid())
    -- Patient sieht nur seinen eigenen Datensatz (über user_id-Bridge)
    OR user_id = auth.uid()
  );

-- ----------------------------------------------------------------
-- 3. Update patient_assignments RLS SELECT policy
--
-- Previously: only therapist (owner) and admin could read
-- Now: patients can also read their OWN assignments
--
-- We look up the patient record via user_id to get the patient_id,
-- then check that it matches the assignment's patient_id.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "pa_select" ON patient_assignments;
CREATE POLICY "pa_select" ON patient_assignments
  FOR SELECT USING (
    -- Therapist who created the assignment
    auth.uid() = therapist_id
    -- Admin
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    -- Patient reading their own assignments (via user_id bridge in patients table)
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_assignments.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 4. Update assignment_completions RLS SELECT policy
--
-- Previously: only therapist (via assignment ownership) and admin
-- Now: patients can also read their OWN completions
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "ac_select" ON assignment_completions;
CREATE POLICY "ac_select" ON assignment_completions
  FOR SELECT USING (
    -- Therapist who owns the assignment (via patient_assignments join)
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
    -- Patient reading their own completions (via user_id bridge in patients table)
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = assignment_completions.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 5. Update assignment_completions RLS INSERT policy
--
-- Previously:  auth.uid() = patient_id  — this compared auth.uid() to the
-- patients.id (the clinic UUID), which is never equal for patient auth accounts.
--
-- Now: we allow patients to insert completions when their auth account
-- resolves to the matching patient record via the user_id bridge.
-- The API still enforces patient_id from the assignment (BUG-3 fix maintained).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "ac_insert" ON assignment_completions;
CREATE POLICY "ac_insert" ON assignment_completions
  FOR INSERT WITH CHECK (
    -- Patient inserting their own completion (via user_id bridge)
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = assignment_completions.patient_id
        AND p.user_id = auth.uid()
    )
    -- Therapist who owns the assignment
    OR EXISTS (
      SELECT 1 FROM patient_assignments pa
      WHERE pa.id = assignment_id AND pa.therapist_id = auth.uid()
    )
    -- Admin
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 6. Verify indexes exist for performance
-- ----------------------------------------------------------------
-- idx_patients_user_id already created above (conditional)
-- Ensure patient_id index on completions for patient self-lookup
CREATE INDEX IF NOT EXISTS idx_ac_patient_id ON assignment_completions(patient_id);

-- ----------------------------------------------------------------
-- Done.
-- After running this migration:
--   1. In Supabase Dashboard, link a test patient:
--      UPDATE patients SET user_id = '<auth-user-uuid>' WHERE email = '<patient-email>';
--   2. Log in as that patient user and verify:
--      GET /api/me/profile  → returns the patient record
--      GET /api/me/assignments  → returns the patient's assignments
--   3. Complete a training session to verify completions INSERT works
-- ----------------------------------------------------------------
