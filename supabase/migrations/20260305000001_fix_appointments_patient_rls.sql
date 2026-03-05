-- ============================================================
-- Fix: appointments_select_patient_self RLS policy
--
-- The old policy used SELECT email FROM auth.users which patients
-- don't have permission to read. Fix: use patients.user_id = auth.uid()
-- which doesn't require access to auth.users.
-- ============================================================

DROP POLICY IF EXISTS "appointments_select_patient_self" ON appointments;
CREATE POLICY "appointments_select_patient_self" ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
        AND p.user_id = auth.uid()
    )
  );
