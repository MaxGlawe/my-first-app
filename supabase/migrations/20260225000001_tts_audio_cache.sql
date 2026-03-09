-- PROJ-17: ElevenLabs TTS Integration — Audio-Cache-Tabelle + Storage-Buckets
-- Zentrale Cache-Tabelle für generierte TTS-Audio-Dateien.
-- Audio wird in Supabase Storage gespeichert, diese Tabelle dient als Index.

-- ── Tabelle ────────────────────────────────────────────────────────────────────

CREATE TABLE tts_audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  model_id TEXT NOT NULL DEFAULT 'eleven_multilingual_v2',
  source_type TEXT NOT NULL CHECK (source_type IN ('exercise', 'lesson', 'training_plan')),
  source_id UUID,
  chunk_index INT NOT NULL DEFAULT 0,
  total_chunks INT NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'tts-audio',
  file_size_bytes INT,
  duration_seconds NUMERIC(8,2),
  input_char_count INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '90 days'),

  CONSTRAINT uq_content_voice_chunk UNIQUE (content_hash, voice_id, chunk_index)
);

-- ── Indexes ────────────────────────────────────────────────────────────────────

CREATE INDEX idx_tts_cache_hash_voice ON tts_audio_cache (content_hash, voice_id);
CREATE INDEX idx_tts_cache_source ON tts_audio_cache (source_type, source_id);
CREATE INDEX idx_tts_cache_expires ON tts_audio_cache (expires_at) WHERE expires_at IS NOT NULL;

-- ── RLS ────────────────────────────────────────────────────────────────────────

ALTER TABLE tts_audio_cache ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read (audio is content-keyed, not user-keyed)
CREATE POLICY "tts_cache_select" ON tts_audio_cache
  FOR SELECT TO authenticated
  USING (true);

-- Only service role can INSERT/UPDATE/DELETE (via API routes)
-- No policies for INSERT/UPDATE/DELETE = blocked for regular users

-- ── Storage-Buckets ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('tts-audio', 'tts-audio', true, 10485760)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('ambient-sounds', 'ambient-sounds', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Public read for TTS audio
CREATE POLICY "tts_audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tts-audio');

-- Public read for ambient sounds
CREATE POLICY "ambient_sounds_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'ambient-sounds');
