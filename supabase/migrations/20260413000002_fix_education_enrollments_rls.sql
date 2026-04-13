-- Fix: RLS policy on education_enrollments used auth.users table directly,
-- which is not accessible from RLS context. Use auth.email() function instead.

-- Drop the broken patient policy
DROP POLICY IF EXISTS ee_patient_select ON education_enrollments;

-- Recreate with auth.email() instead of subquery on auth.users
CREATE POLICY ee_patient_select ON education_enrollments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE user_id = auth.uid()
         OR email = auth.email()
    )
  );
