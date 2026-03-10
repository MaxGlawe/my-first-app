-- ============================================================
-- Open patient access for all praxis staff
--
-- Previously: therapists could only see/edit their OWN patients
-- (therapeut_id = auth.uid()). This prevented patient handover
-- between therapists.
--
-- Now: all praxis staff (therapists, trainers, management) can
-- see ALL patients. The "therapeut_id" remains as the primary
-- therapist but is no longer a visibility restriction.
--
-- Patient self-access via user_id bridge is unchanged.
-- ============================================================

-- ── Helper function: is the current user a praxis staff member? ──
CREATE OR REPLACE FUNCTION is_praxis_staff()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT get_my_role() IN (
    'admin',
    'praxismanagement',
    'physiotherapeut',
    'heilpraktiker',
    'praeventionstrainer',
    'personal_trainer'
  );
$$;
GRANT EXECUTE ON FUNCTION is_praxis_staff() TO authenticated;


-- ══════════════════════════════════════════════════════════════
-- 1. patients table
-- ══════════════════════════════════════════════════════════════

-- SELECT: all staff see all patients
DROP POLICY IF EXISTS "patients_select" ON patients;
CREATE POLICY "patients_select" ON patients
  FOR SELECT USING (
    is_praxis_staff()
    OR user_id = auth.uid()  -- Patient sees own record
  );

-- UPDATE: all staff can update any patient
DROP POLICY IF EXISTS "patients_update" ON patients;
CREATE POLICY "patients_update" ON patients
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());

-- INSERT stays as-is (therapist sets therapeut_id to themselves)


-- ══════════════════════════════════════════════════════════════
-- 2. anamnesis_records
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "anamnesis_select" ON anamnesis_records;
CREATE POLICY "anamnesis_select" ON anamnesis_records
  FOR SELECT USING (is_praxis_staff());

DROP POLICY IF EXISTS "anamnesis_insert" ON anamnesis_records;
CREATE POLICY "anamnesis_insert" ON anamnesis_records
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "anamnesis_update" ON anamnesis_records;
CREATE POLICY "anamnesis_update" ON anamnesis_records
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "anamnesis_delete" ON anamnesis_records;
CREATE POLICY "anamnesis_delete" ON anamnesis_records
  FOR DELETE USING (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 3. treatment_sessions
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "treatment_sessions_select" ON treatment_sessions;
CREATE POLICY "treatment_sessions_select" ON treatment_sessions
  FOR SELECT USING (is_praxis_staff());

DROP POLICY IF EXISTS "treatment_sessions_insert" ON treatment_sessions;
CREATE POLICY "treatment_sessions_insert" ON treatment_sessions
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "treatment_sessions_update" ON treatment_sessions;
CREATE POLICY "treatment_sessions_update" ON treatment_sessions
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 4. diagnoses
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "diagnoses_select" ON diagnoses;
CREATE POLICY "diagnoses_select" ON diagnoses
  FOR SELECT USING (is_praxis_staff());

DROP POLICY IF EXISTS "diagnoses_insert" ON diagnoses;
CREATE POLICY "diagnoses_insert" ON diagnoses
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "diagnoses_update" ON diagnoses;
CREATE POLICY "diagnoses_update" ON diagnoses
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "diagnoses_delete" ON diagnoses;
CREATE POLICY "diagnoses_delete" ON diagnoses
  FOR DELETE USING (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 5. medical_reports
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "reports_select" ON medical_reports;
CREATE POLICY "reports_select" ON medical_reports
  FOR SELECT USING (is_praxis_staff());

DROP POLICY IF EXISTS "reports_insert" ON medical_reports;
CREATE POLICY "reports_insert" ON medical_reports
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "reports_update" ON medical_reports;
CREATE POLICY "reports_update" ON medical_reports
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "reports_delete" ON medical_reports;
CREATE POLICY "reports_delete" ON medical_reports
  FOR DELETE USING (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 6. appointments
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (
    is_praxis_staff()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
        AND p.user_id = auth.uid()
    )
  );


-- ══════════════════════════════════════════════════════════════
-- 7. chat_messages
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "chat_select" ON chat_messages;
CREATE POLICY "chat_select" ON chat_messages
  FOR SELECT USING (
    is_praxis_staff()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = chat_messages.patient_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_insert" ON chat_messages;
CREATE POLICY "chat_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    is_praxis_staff()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = chat_messages.patient_id
        AND p.user_id = auth.uid()
    )
  );


-- ══════════════════════════════════════════════════════════════
-- 8. funktionsuntersuchungen
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "fu_select" ON funktionsuntersuchungen;
CREATE POLICY "fu_select" ON funktionsuntersuchungen
  FOR SELECT USING (is_praxis_staff());

DROP POLICY IF EXISTS "fu_insert" ON funktionsuntersuchungen;
CREATE POLICY "fu_insert" ON funktionsuntersuchungen
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "fu_update" ON funktionsuntersuchungen;
CREATE POLICY "fu_update" ON funktionsuntersuchungen
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "fu_delete" ON funktionsuntersuchungen;
CREATE POLICY "fu_delete" ON funktionsuntersuchungen
  FOR DELETE USING (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 9. training_documentations
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "td_select" ON training_documentations;
CREATE POLICY "td_select" ON training_documentations
  FOR SELECT USING (is_praxis_staff());

DROP POLICY IF EXISTS "td_insert" ON training_documentations;
CREATE POLICY "td_insert" ON training_documentations
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "td_update" ON training_documentations;
CREATE POLICY "td_update" ON training_documentations
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 10. patient_assignments (Hausaufgaben)
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "pa_select" ON patient_assignments;
CREATE POLICY "pa_select" ON patient_assignments
  FOR SELECT USING (
    is_praxis_staff()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_assignments.patient_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pa_insert" ON patient_assignments;
CREATE POLICY "pa_insert" ON patient_assignments
  FOR INSERT WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "pa_update" ON patient_assignments;
CREATE POLICY "pa_update" ON patient_assignments
  FOR UPDATE
  USING (is_praxis_staff())
  WITH CHECK (is_praxis_staff());

DROP POLICY IF EXISTS "pa_delete" ON patient_assignments;
CREATE POLICY "pa_delete" ON patient_assignments
  FOR DELETE USING (is_praxis_staff());


-- ══════════════════════════════════════════════════════════════
-- 11. assignment_completions
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "ac_select" ON assignment_completions;
CREATE POLICY "ac_select" ON assignment_completions
  FOR SELECT USING (
    is_praxis_staff()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = assignment_completions.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- INSERT: patients can still insert their own completions
DROP POLICY IF EXISTS "ac_insert" ON assignment_completions;
CREATE POLICY "ac_insert" ON assignment_completions
  FOR INSERT WITH CHECK (
    is_praxis_staff()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = assignment_completions.patient_id
        AND p.user_id = auth.uid()
    )
  );
