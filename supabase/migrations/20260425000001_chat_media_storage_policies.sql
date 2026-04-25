-- ============================================================
-- Storage RLS Policies for chat-media bucket
--
-- Background: ChatFenster uploads images via supabase.storage.from('chat-media').upload(...)
-- with path = chat/{patient_id}/{timestamp}.{ext}. Without these policies, both
-- staff and patient uploads fail with "new row violates row-level security policy".
--
-- Bucket is private; reads happen via createSignedUrl (7-day TTL), which itself
-- requires the caller to have SELECT permission on the object.
-- ============================================================

-- Ensure the bucket exists and is private. Idempotent.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ── INSERT (upload) ─────────────────────────────────────────
-- Staff: any non-patient role can upload to any chat folder
-- Patient: can upload only to their own chat/{patient_id}/ path
DROP POLICY IF EXISTS "chat_media_insert_staff" ON storage.objects;
CREATE POLICY "chat_media_insert_staff" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer', 'praxismanagement'
    )
  );

DROP POLICY IF EXISTS "chat_media_insert_patient" ON storage.objects;
CREATE POLICY "chat_media_insert_patient" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media'
    AND (storage.foldername(name))[1] = 'chat'
    AND EXISTS (
      SELECT 1 FROM patients
      WHERE user_id = auth.uid()
      AND id::text = (storage.foldername(name))[2]
    )
  );

-- ── SELECT (read / sign URL) ───────────────────────────────
-- Same access rules as INSERT — staff sees all, patient only own folder.
DROP POLICY IF EXISTS "chat_media_select_staff" ON storage.objects;
CREATE POLICY "chat_media_select_staff" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-media'
    AND get_my_role() IN (
      'admin', 'heilpraktiker', 'physiotherapeut',
      'praeventionstrainer', 'personal_trainer', 'praxismanagement'
    )
  );

DROP POLICY IF EXISTS "chat_media_select_patient" ON storage.objects;
CREATE POLICY "chat_media_select_patient" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-media'
    AND (storage.foldername(name))[1] = 'chat'
    AND EXISTS (
      SELECT 1 FROM patients
      WHERE user_id = auth.uid()
      AND id::text = (storage.foldername(name))[2]
    )
  );

-- ── DELETE ──────────────────────────────────────────────────
-- Admin only — chat is permanent record, deletion should be deliberate.
DROP POLICY IF EXISTS "chat_media_delete_admin" ON storage.objects;
CREATE POLICY "chat_media_delete_admin" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-media'
    AND get_my_role() = 'admin'
  );
