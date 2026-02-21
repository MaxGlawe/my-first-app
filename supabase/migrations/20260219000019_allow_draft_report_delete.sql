-- ============================================================
-- Allow deletion of draft reports (status = 'entwurf')
-- Only the report creator or admins can delete drafts.
-- Finalized reports remain permanently protected.
-- ============================================================

-- Replace the blanket deny policy with a conditional one
DROP POLICY IF EXISTS "medical_reports_delete" ON medical_reports;
CREATE POLICY "medical_reports_delete" ON medical_reports
  FOR DELETE
  USING (
    -- Only drafts can be deleted
    status = 'entwurf'
    AND (
      -- The original creator can delete their own drafts
      generated_by = auth.uid()
      -- Admins can delete any draft
      OR get_my_role() = 'admin'
    )
  );

-- ============================================================
-- Verification:
--   1. Run this migration in Supabase SQL Editor
--   2. As the report creator: DELETE a draft → should succeed
--   3. As the report creator: DELETE a finalized report → should fail (0 rows)
--   4. As admin: DELETE any draft → should succeed
-- ============================================================
