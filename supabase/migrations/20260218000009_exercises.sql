-- PROJ-8: Übungsdatenbank-Verwaltung
-- Creates: exercises, exercise_favorites
-- Storage Buckets: exercise-images, exercise-videos

-- ============================================================
-- 1. exercises table
-- ============================================================
CREATE TABLE exercises (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content
  name                      TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  beschreibung              TEXT CHECK (char_length(beschreibung) <= 5000),
  ausfuehrung               JSONB,         -- Array of {nummer: int, beschreibung: text}

  -- Categorization
  muskelgruppen             TEXT[] NOT NULL DEFAULT '{}',
  schwierigkeitsgrad        TEXT NOT NULL CHECK (
    schwierigkeitsgrad IN ('anfaenger', 'mittel', 'fortgeschritten')
  ),

  -- Media
  media_url                 TEXT CHECK (char_length(media_url) <= 1000),
  media_type                TEXT CHECK (media_type IN ('image', 'video')),

  -- Default parameters (template for training plans)
  standard_saetze           SMALLINT CHECK (standard_saetze >= 1 AND standard_saetze <= 99),
  standard_wiederholungen   SMALLINT CHECK (standard_wiederholungen >= 1 AND standard_wiederholungen <= 999),
  standard_pause_sekunden   SMALLINT CHECK (standard_pause_sekunden >= 0 AND standard_pause_sekunden <= 3600),

  -- System flags
  is_public                 BOOLEAN NOT NULL DEFAULT FALSE,   -- true = Praxis-Bibliothek
  is_archived               BOOLEAN NOT NULL DEFAULT FALSE,   -- soft-delete when used in active plans
  created_by                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exercises_updated_at_trigger
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_exercises_updated_at();

-- Full-text search vector (name + beschreibung)
ALTER TABLE exercises
  ADD COLUMN fts_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('german',
      coalesce(name, '') || ' ' || coalesce(beschreibung, '')
    )
  ) STORED;

-- ============================================================
-- 2. exercise_favorites join table
-- ============================================================
CREATE TABLE exercise_favorites (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, exercise_id)
);

-- ============================================================
-- 3. Indexes
-- ============================================================

-- FTS index for fast full-text search (500+ rows < 300ms)
CREATE INDEX idx_exercises_fts ON exercises USING GIN (fts_vector);

-- Filter indexes
CREATE INDEX idx_exercises_created_by     ON exercises (created_by);
CREATE INDEX idx_exercises_is_public      ON exercises (is_public);
CREATE INDEX idx_exercises_is_archived    ON exercises (is_archived);
CREATE INDEX idx_exercises_schwierigkeit  ON exercises (schwierigkeitsgrad);
CREATE INDEX idx_exercises_muskelgruppen  ON exercises USING GIN (muskelgruppen);
CREATE INDEX idx_exercises_name           ON exercises (name);

-- Favorites lookup
CREATE INDEX idx_exercise_favorites_user ON exercise_favorites (user_id);
CREATE INDEX idx_exercise_favorites_exercise ON exercise_favorites (exercise_id);

-- ============================================================
-- 4. Row Level Security — exercises
-- ============================================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can see public exercises OR their own exercises
CREATE POLICY "Therapeuten sehen öffentliche und eigene Übungen"
  ON exercises FOR SELECT
  TO authenticated
  USING (
    is_public = TRUE
    OR created_by = auth.uid()
  );

-- INSERT: Authenticated users can create exercises for themselves
CREATE POLICY "Therapeuten können eigene Übungen erstellen"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Users can update their own exercises;
--         Admins can update public exercises (checked via user_profiles.role)
CREATE POLICY "Therapeuten können eigene Übungen bearbeiten"
  ON exercises FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

-- DELETE: Users can delete their own exercises;
--         Admins can delete public exercises
CREATE POLICY "Therapeuten können eigene Übungen löschen"
  ON exercises FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

-- ============================================================
-- 5. Row Level Security — exercise_favorites
-- ============================================================
ALTER TABLE exercise_favorites ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only their own favorites
CREATE POLICY "Therapeuten sehen eigene Favoriten"
  ON exercise_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Users can favorite any exercise they can see (RLS on exercises handles visibility)
CREATE POLICY "Therapeuten können Favoriten hinzufügen"
  ON exercise_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can remove their own favorites
CREATE POLICY "Therapeuten können Favoriten entfernen"
  ON exercise_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 6. Storage Buckets (run as service role or in Supabase Dashboard)
-- Note: Bucket creation via SQL requires Supabase CLI or Dashboard.
-- The following are the required settings to configure manually:
--
-- Bucket: exercise-images
--   - Public: true
--   - Allowed MIME types: image/jpeg, image/png
--   - Max file size: 5 MB (5242880 bytes)
--
-- Bucket: exercise-videos
--   - Public: true
--   - Allowed MIME types: video/mp4, video/webm
--   - Max file size: 200 MB (209715200 bytes)
--
-- Storage path convention: {user_id}/{exercise_id}.{ext}
-- ============================================================
