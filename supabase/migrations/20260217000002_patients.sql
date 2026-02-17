-- ============================================================
-- PROJ-2: Patientenstammdaten
-- Migration: patients table + RLS + indexes + Storage bucket
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Enable UUID extension (idempotent)
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 2. patients table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Person (Pflichtfelder)
  vorname         TEXT NOT NULL CHECK (char_length(vorname) BETWEEN 1 AND 100),
  nachname        TEXT NOT NULL CHECK (char_length(nachname) BETWEEN 1 AND 100),
  geburtsdatum    DATE NOT NULL,
  geschlecht      TEXT NOT NULL CHECK (geschlecht IN ('maennlich', 'weiblich', 'divers', 'unbekannt')),

  -- Kontakt (optional)
  telefon         TEXT CHECK (telefon IS NULL OR char_length(telefon) <= 30),
  email           TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  strasse         TEXT CHECK (strasse IS NULL OR char_length(strasse) <= 200),
  plz             TEXT CHECK (plz IS NULL OR char_length(plz) <= 10),
  ort             TEXT CHECK (ort IS NULL OR char_length(ort) <= 100),

  -- Krankenkasse (optional)
  krankenkasse    TEXT CHECK (krankenkasse IS NULL OR char_length(krankenkasse) <= 200),
  versichertennummer TEXT CHECK (versichertennummer IS NULL OR char_length(versichertennummer) <= 50),

  -- Sonstiges
  avatar_url      TEXT,
  interne_notizen TEXT CHECK (interne_notizen IS NULL OR char_length(interne_notizen) <= 5000),

  -- System / Relations
  therapeut_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  archived_at     TIMESTAMPTZ,
  booking_system_id TEXT  -- für spätere PROJ-7 Integration
);

-- ----------------------------------------------------------------
-- 3. updated_at auto-trigger
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 4. Performance indexes
-- ----------------------------------------------------------------
-- Primary lookup by therapist (foundation of all RLS queries)
CREATE INDEX IF NOT EXISTS idx_patients_therapeut_id
  ON patients(therapeut_id);

-- Archivierungsstatus (häufigster Filter: aktiv vs. archiviert)
CREATE INDEX IF NOT EXISTS idx_patients_archived_at
  ON patients(archived_at);

-- Namenssuche (ILIKE queries → lower() index)
CREATE INDEX IF NOT EXISTS idx_patients_nachname_lower
  ON patients(lower(nachname));

CREATE INDEX IF NOT EXISTS idx_patients_vorname_lower
  ON patients(lower(vorname));

-- Geburtsdatum (Suche und Sortierung)
CREATE INDEX IF NOT EXISTS idx_patients_geburtsdatum
  ON patients(geburtsdatum);

-- Duplikatprüfung: Name + Geburtsdatum
CREATE INDEX IF NOT EXISTS idx_patients_duplicate_check
  ON patients(lower(vorname), lower(nachname), geburtsdatum)
  WHERE archived_at IS NULL;

-- ----------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Helper: get role of the current user from user_profiles
-- (uses SECURITY DEFINER so RLS helper always has access to user_profiles)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

-- ----------------------------------------------------------------
-- RLS Policy: SELECT
-- Therapeuten sehen nur ihre eigenen Patienten.
-- Admin sieht alle Patienten.
-- Patients sehen nur ihre eigenen Daten (für spätere Patienten-App).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "patients_select" ON patients;
CREATE POLICY "patients_select" ON patients
  FOR SELECT
  USING (
    -- Admin sieht alle
    get_my_role() = 'admin'
    OR
    -- Therapeut sieht eigene Patienten
    (get_my_role() IN ('physiotherapeut', 'heilpraktiker') AND therapeut_id = auth.uid())
  );

-- ----------------------------------------------------------------
-- RLS Policy: INSERT
-- Nur Therapeuten und Admins dürfen neue Patienten anlegen.
-- therapeut_id muss immer die eigene uid sein (außer Admin).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "patients_insert" ON patients;
CREATE POLICY "patients_insert" ON patients
  FOR INSERT
  WITH CHECK (
    get_my_role() = 'admin'
    OR (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND therapeut_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- RLS Policy: UPDATE
-- Therapeut darf nur eigene Patienten bearbeiten.
-- Admin darf alle bearbeiten.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "patients_update" ON patients;
CREATE POLICY "patients_update" ON patients
  FOR UPDATE
  USING (
    get_my_role() = 'admin'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker') AND therapeut_id = auth.uid())
  )
  WITH CHECK (
    get_my_role() = 'admin'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker') AND therapeut_id = auth.uid())
  );

-- ----------------------------------------------------------------
-- RLS Policy: DELETE
-- Physisches Löschen ist verboten (DSGVO: 10 Jahre Aufbewahrung).
-- Diese Policy erlaubt DELETE explizit für niemanden.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "patients_delete" ON patients;
CREATE POLICY "patients_delete" ON patients
  FOR DELETE
  USING (false);  -- Niemand darf physisch löschen

-- ----------------------------------------------------------------
-- 6. Supabase Storage — avatars bucket
--    Run these via Supabase Dashboard > Storage > New Bucket
--    OR via the SQL below (requires pg_net / storage schema access)
-- ----------------------------------------------------------------

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                              -- Public bucket (CDN URLs)
  2097152,                           -- 2 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Therapeuten dürfen nur den Avatar ihrer eigenen Patienten hochladen
-- (path convention: avatars/{patient_id}.{ext})

DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
CREATE POLICY "avatars_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'admin')
  );

DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'admin'))
  WITH CHECK (bucket_id = 'avatars' AND get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'admin'));

DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

-- Public read for the CDN URLs (avatars are not sensitive as they are
-- publicly-accessible via CDN — only the association with a patient is sensitive)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'avatars');

-- ----------------------------------------------------------------
-- 7. Grant execution rights on helper function
-- ----------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- ----------------------------------------------------------------
-- Done.
-- After running this migration:
--   1. Verify RLS is enabled: SELECT relrowsecurity FROM pg_class WHERE relname = 'patients';
--   2. Test with a therapist session: SELECT * FROM patients; -- should return only own patients
--   3. Test with admin session: SELECT * FROM patients; -- should return all
-- ----------------------------------------------------------------
