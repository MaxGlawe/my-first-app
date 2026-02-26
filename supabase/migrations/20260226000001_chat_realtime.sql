-- Enable Supabase Realtime for chat_messages table
-- Without this, real-time message delivery via WebSocket does not work.
-- Was commented out in the original migration (20260218000014).

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
