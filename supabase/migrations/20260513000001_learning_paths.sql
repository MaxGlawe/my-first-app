-- ============================================================
-- 21-Tage-Pfade (Learning Paths)
-- Kuratierte Mini-Programme, in die Patienten sich aktiv einschreiben.
-- 4 Pfade zum Start: Hydrations-Boost, Rücken-Mobility, Schmerz-Tagebuch,
-- Faszien-Tiefenarbeit. Jeweils 21 Tageslektionen.
-- ============================================================

-- 1. Pfad-Definitionen (statische Metadaten, kuratiert)
CREATE TABLE IF NOT EXISTS learning_paths (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  icon            TEXT,                   -- lucide icon name, z.B. "Droplets", "Activity"
  color           TEXT NOT NULL DEFAULT 'emerald', -- tailwind color stem
  duration_days   INTEGER NOT NULL DEFAULT 21 CHECK (duration_days > 0),
  target_audience TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paths_active_sort
  ON learning_paths(sort_order) WHERE is_active = true;

-- 2. Lektionen (1 Eintrag = 1 Tag in 1 Pfad)
CREATE TABLE IF NOT EXISTS path_lessons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id             UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  day_number          INTEGER NOT NULL CHECK (day_number > 0),
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,            -- Hauptinhalt (Markdown)
  task                TEXT,                     -- Tages-Aufgabe
  reflection_question TEXT,                     -- Reflexionsfrage
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_path_day UNIQUE (path_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_lessons_path_day
  ON path_lessons(path_id, day_number);

-- 3. Patienten-Anmeldungen — Patient meldet sich aktiv für einen Pfad an
CREATE TABLE IF NOT EXISTS patient_path_enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  path_id       UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'completed', 'abandoned')),
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  abandoned_at  TIMESTAMPTZ
);

-- Ein Patient kann denselben Pfad mehrfach machen (z. B. nach Abbruch neu starten).
-- Aber nur einer kann gleichzeitig aktiv sein.
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_enrollment
  ON patient_path_enrollments(patient_id, path_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_enrollments_patient_status
  ON patient_path_enrollments(patient_id, status);

-- 4. Tagesfortschritt — ein Eintrag pro abgeschlossenem Tag
CREATE TABLE IF NOT EXISTS patient_path_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id       UUID NOT NULL REFERENCES patient_path_enrollments(id) ON DELETE CASCADE,
  day_number          INTEGER NOT NULL CHECK (day_number > 0),
  completed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  reflection_answer   TEXT,                     -- frei, optional
  CONSTRAINT uq_enrollment_day UNIQUE (enrollment_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_progress_enrollment
  ON patient_path_progress(enrollment_id, day_number);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_path_progress ENABLE ROW LEVEL SECURITY;

-- Pfade & Lektionen: alle authentifizierten User dürfen lesen (Patient + Therapeut)
CREATE POLICY "anyone authenticated can read paths"
  ON learning_paths FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "anyone authenticated can read lessons"
  ON path_lessons FOR SELECT TO authenticated
  USING (true);

-- Admin darf alle Pfade & Lektionen verwalten (für späteres Backoffice)
CREATE POLICY "admin manages paths"
  ON learning_paths FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin manages lessons"
  ON path_lessons FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enrollments: Patient sieht/verwaltet eigene
CREATE POLICY "patients view own enrollments"
  ON patient_path_enrollments FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "patients insert own enrollments"
  ON patient_path_enrollments FOR INSERT TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "patients update own enrollments"
  ON patient_path_enrollments FOR UPDATE TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Therapeut sieht Enrollments seiner Patienten (für späteres Coaching)
CREATE POLICY "staff view enrollments"
  ON patient_path_enrollments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer', 'praxismanagement')
    )
  );

-- Progress: Patient sieht/schreibt eigene
CREATE POLICY "patients view own progress"
  ON patient_path_progress FOR SELECT TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM patient_path_enrollments
      WHERE patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "patients insert own progress"
  ON patient_path_progress FOR INSERT TO authenticated
  WITH CHECK (
    enrollment_id IN (
      SELECT id FROM patient_path_enrollments
      WHERE patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "staff view progress"
  ON patient_path_progress FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer', 'praxismanagement')
    )
  );

-- ── Seed: die 4 Pfade als Metadaten (Lektionen kommen per Seed-Skript) ──

INSERT INTO learning_paths (slug, name, subtitle, description, icon, color, target_audience, sort_order)
VALUES
  (
    'hydrations-boost',
    'Hydrations-Boost',
    'Mehr Wasser im Körper. Weniger Schmerz. Bessere Beweglichkeit.',
    'Lerne in 21 Tagen, warum dein Körper Wasser braucht — und wie du dauerhaft genug trinkst. Universell sinnvoll, perfekter Einstieg.',
    'Droplets',
    'cyan',
    'Alle Patient:innen',
    1
  ),
  (
    'ruecken-mobility',
    'Rücken-Mobility',
    'Dein Rücken in Bewegung. Schmerzen reduzieren, Beweglichkeit zurückholen.',
    'Verstehe deinen Rücken neu — und baue konkrete Routinen, die deine Beschwerden nachhaltig reduzieren.',
    'Activity',
    'emerald',
    'Patient:innen mit Rückenschmerzen',
    2
  ),
  (
    'schmerz-tagebuch-routine',
    'Schmerz-Tagebuch-Routine',
    'Wenn dein Therapeut wirklich versteht, was bei dir los ist — beginnt echte Heilung.',
    'Lerne, deinen Schmerz präzise zu beobachten. Werde Co-Pilot deiner Therapie — und mach jede Behandlung gezielter.',
    'BookHeart',
    'rose',
    'Patient:innen mit chronischen Beschwerden',
    3
  ),
  (
    'faszien-tiefenarbeit',
    'Faszien-Tiefenarbeit',
    'Tief unter der Oberfläche. Wo viele Beschwerden wirklich herkommen.',
    'Lerne dein größtes Sinnesorgan kennen — und bekomme Werkzeuge an die Hand, die viele Patient:innen erst nach Jahren entdecken.',
    'Layers',
    'indigo',
    'Bei chronischen Beschwerden, "therapieresistenten" Mustern',
    4
  )
ON CONFLICT (slug) DO NOTHING;
