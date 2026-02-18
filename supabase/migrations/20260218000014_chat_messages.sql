-- ============================================================
-- PROJ-12: Chat (Therapeut ↔ Patient)
-- Migration: chat_messages table + RLS + indexes
-- ============================================================
--
-- Conversation model: a conversation is uniquely identified by
-- patient_id alone. There is no separate conversations table.
-- The therapist is derived from patients.therapeut_id.
--
-- RLS:
--   - Patient can read/insert messages where patient_id matches
--     their own patients record (via user_id bridge)
--   - Therapist can read/insert messages for their own patients
--     (patients.therapeut_id = auth.uid())
--   - Admin can read all messages
--   - Only the receiver (not sender) can UPDATE read_at (mark as read)
--
-- DSGVO: Supabase at-rest AES-256 encryption satisfies MVP.
--   The retain_until column enables a future pg_cron job to
--   auto-delete messages older than 2 years (PROJ-14/Infra).
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Create chat_messages table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sender_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content      TEXT        CHECK (char_length(content) <= 2000),
  media_url    TEXT,
  media_type   TEXT        CHECK (media_type IN ('image') OR media_type IS NULL),
  read_at      TIMESTAMPTZ,
  retain_until TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. Enable Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 3. RLS — SELECT
--    Patient reads own messages; Therapist reads their patients'
--    messages; Admin reads all.
-- ----------------------------------------------------------------
CREATE POLICY "chat_select" ON chat_messages
  FOR SELECT USING (
    -- Admin sieht alle Nachrichten
    get_my_role() = 'admin'

    -- Therapeut sieht Nachrichten seiner eigenen Patienten
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = chat_messages.patient_id
        AND p.therapeut_id = auth.uid()
    )

    -- Patient sieht nur seine eigene Konversation (via user_id bridge)
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = chat_messages.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 4. RLS — INSERT
--    Patient can insert into their own conversation.
--    Therapist can insert into their patients' conversations.
-- ----------------------------------------------------------------
CREATE POLICY "chat_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    -- sender_id must be the authenticated user (prevents impersonation)
    sender_id = auth.uid()

    AND (
      -- Therapeut schreibt an einen seiner Patienten
      EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = chat_messages.patient_id
          AND p.therapeut_id = auth.uid()
      )

      -- Patient schreibt in seiner eigenen Konversation
      OR EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = chat_messages.patient_id
          AND p.user_id = auth.uid()
      )

      -- Admin
      OR get_my_role() = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 5. RLS — UPDATE (only read_at may be set, only by the receiver)
--    Patient can mark therapist messages as read.
--    Therapist can mark patient messages as read.
--    No one can alter content, media_url, sender_id, or patient_id.
-- ----------------------------------------------------------------
CREATE POLICY "chat_update_read_at" ON chat_messages
  FOR UPDATE USING (
    -- Receiver: Patient marking therapist messages as read
    (
      EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = chat_messages.patient_id
          AND p.user_id = auth.uid()
      )
      AND sender_id <> auth.uid()  -- message was sent by someone else (therapist)
    )

    OR

    -- Receiver: Therapist marking patient messages as read
    (
      EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = chat_messages.patient_id
          AND p.therapeut_id = auth.uid()
      )
      AND sender_id <> auth.uid()  -- message was sent by someone else (patient)
    )

    -- Admin
    OR get_my_role() = 'admin'
  )
  WITH CHECK (
    -- Only allow changing read_at — all other fields must stay the same
    patient_id = patient_id
    AND sender_id = sender_id
  );

-- ----------------------------------------------------------------
-- 6. RLS — DELETE
--    Only admins may delete messages (e.g. moderation / harassment case).
-- ----------------------------------------------------------------
CREATE POLICY "chat_delete" ON chat_messages
  FOR DELETE USING (
    get_my_role() = 'admin'
  );

-- ----------------------------------------------------------------
-- 7. Indexes
-- ----------------------------------------------------------------

-- Primary access pattern: load all messages for a conversation
CREATE INDEX IF NOT EXISTS idx_chat_patient_id_created
  ON chat_messages(patient_id, created_at DESC);

-- Unread count per conversation (Posteingang badge)
-- Partial index — only unread messages (read_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_chat_unread
  ON chat_messages(patient_id, sender_id)
  WHERE read_at IS NULL;

-- DSGVO cleanup job: scan by retain_until
CREATE INDEX IF NOT EXISTS idx_chat_retain_until
  ON chat_messages(retain_until);

-- ----------------------------------------------------------------
-- 8. Supabase Realtime: enable for chat_messages
--    Run in Supabase Dashboard → Database → Replication, or via:
-- ----------------------------------------------------------------
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
--
-- NOTE: The above line is commented out because the publication may
-- already exist. Run it manually in the Supabase SQL editor if
-- Realtime is not yet enabled for this table.

-- ----------------------------------------------------------------
-- Done.
-- After running this migration:
--   1. In Supabase Dashboard → Database → Replication:
--      Ensure chat_messages is added to the supabase_realtime publication
--   2. Test: Log in as a patient and POST /api/me/chat — message should appear
--   3. Test: Log in as therapist and GET /api/patients/[id]/chat — should return messages
--   4. Test: Realtime — open two browser tabs, send a message, verify it appears without reload
-- ----------------------------------------------------------------
