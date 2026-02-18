-- ============================================================
-- PROJ-7 BUG-4: Patient self-access RLS for appointments
-- Allows a logged-in patient to read their own appointments
-- by matching their auth email to the patient record.
-- ============================================================

-- Patients may read their own appointments (email-based match)
DROP POLICY IF EXISTS "appointments_select_patient_self" ON appointments;
CREATE POLICY "appointments_select_patient_self" ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
        AND p.email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
    )
  );
