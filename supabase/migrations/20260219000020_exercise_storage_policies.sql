-- ============================================================
-- Storage RLS Policies for exercise-images and exercise-videos
-- Without these, uploads are blocked even though the buckets exist.
-- ============================================================

-- ── exercise-images ─────────────────────────────────────────

-- Upload: Authenticated non-patient roles can upload images
DROP POLICY IF EXISTS "exercise_images_insert" ON storage.objects;
CREATE POLICY "exercise_images_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-images'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer'
    )
  );

-- Overwrite (upsert): Same roles can update their uploads
DROP POLICY IF EXISTS "exercise_images_update" ON storage.objects;
CREATE POLICY "exercise_images_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'exercise-images'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer'
    )
  )
  WITH CHECK (
    bucket_id = 'exercise-images'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer'
    )
  );

-- Public read: Anyone can view exercise images (public bucket)
DROP POLICY IF EXISTS "exercise_images_select" ON storage.objects;
CREATE POLICY "exercise_images_select" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'exercise-images');

-- Delete: Owner (path starts with user_id) or admin
DROP POLICY IF EXISTS "exercise_images_delete" ON storage.objects;
CREATE POLICY "exercise_images_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exercise-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR get_my_role() = 'admin'
    )
  );

-- ── exercise-videos ─────────────────────────────────────────

-- Upload
DROP POLICY IF EXISTS "exercise_videos_insert" ON storage.objects;
CREATE POLICY "exercise_videos_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-videos'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer'
    )
  );

-- Overwrite
DROP POLICY IF EXISTS "exercise_videos_update" ON storage.objects;
CREATE POLICY "exercise_videos_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'exercise-videos'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer'
    )
  )
  WITH CHECK (
    bucket_id = 'exercise-videos'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer'
    )
  );

-- Public read
DROP POLICY IF EXISTS "exercise_videos_select" ON storage.objects;
CREATE POLICY "exercise_videos_select" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'exercise-videos');

-- Delete: Owner or admin
DROP POLICY IF EXISTS "exercise_videos_delete" ON storage.objects;
CREATE POLICY "exercise_videos_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exercise-videos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR get_my_role() = 'admin'
    )
  );

-- ============================================================
-- Verification:
--   1. Run in Supabase SQL Editor
--   2. Upload an image via /os/exercises → should succeed
--   3. Upload a video → should succeed
--   4. Public URL should be accessible without auth
-- ============================================================
