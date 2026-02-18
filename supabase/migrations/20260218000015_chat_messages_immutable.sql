-- ============================================================
-- PROJ-12 BUG-2 FIX: Enforce chat_messages column immutability
-- ============================================================
--
-- Problem: The WITH CHECK clause in the chat_update_read_at policy
-- contained a tautology:
--   WITH CHECK (patient_id = patient_id AND sender_id = sender_id)
-- Both conditions compare a column with itself → always TRUE.
-- This allowed any receiver to UPDATE content, media_url, etc.
--
-- Fix: A BEFORE UPDATE trigger that raises an exception if any
-- column other than read_at is modified. This enforces immutability
-- at the database level, regardless of how the RLS WITH CHECK
-- condition evaluates.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Trigger function: reject mutations of immutable columns
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_chat_message_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- patient_id is immutable
  IF NEW.patient_id IS DISTINCT FROM OLD.patient_id THEN
    RAISE EXCEPTION 'chat_messages.patient_id is immutable';
  END IF;

  -- sender_id is immutable
  IF NEW.sender_id IS DISTINCT FROM OLD.sender_id THEN
    RAISE EXCEPTION 'chat_messages.sender_id is immutable';
  END IF;

  -- content is immutable
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    RAISE EXCEPTION 'chat_messages.content is immutable';
  END IF;

  -- media_url is immutable
  IF NEW.media_url IS DISTINCT FROM OLD.media_url THEN
    RAISE EXCEPTION 'chat_messages.media_url is immutable';
  END IF;

  -- media_type is immutable
  IF NEW.media_type IS DISTINCT FROM OLD.media_type THEN
    RAISE EXCEPTION 'chat_messages.media_type is immutable';
  END IF;

  -- retain_until is immutable
  IF NEW.retain_until IS DISTINCT FROM OLD.retain_until THEN
    RAISE EXCEPTION 'chat_messages.retain_until is immutable';
  END IF;

  -- created_at is immutable
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'chat_messages.created_at is immutable';
  END IF;

  -- Only read_at may be changed — allow the update
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------
-- 2. Attach trigger to chat_messages
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS chat_messages_immutable ON chat_messages;

CREATE TRIGGER chat_messages_immutable
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION enforce_chat_message_immutability();
