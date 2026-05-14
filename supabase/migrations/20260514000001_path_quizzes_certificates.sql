-- ============================================================
-- Kurs-Quiz + Zertifikat
-- Ergänzt die 21-Tage-Pfade (jetzt "Kurse") um:
--   - modul-spezifische Quizfragen (3 pro Modul, Pflicht zum Abschluss)
--   - Quiz-Ergebnis pro abgeschlossenem Modul
--   - Zertifikat-Zeitstempel pro abgeschlossenem Kurs
-- Eigene Migration (statt Edit der learning_paths-Migration), damit sie
-- unabhängig davon läuft, ob jene bereits angewendet wurde.
-- ============================================================

-- 1. Quizfragen — 1 Eintrag = 1 Frage in 1 Modul (path_lesson)
CREATE TABLE IF NOT EXISTS path_lesson_quizzes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID NOT NULL REFERENCES path_lessons(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,          -- Array von Strings (Antwortoptionen)
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0),
  explanation   TEXT,                    -- Erklärung nach Beantwortung
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_lesson_quiz_order UNIQUE (lesson_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson
  ON path_lesson_quizzes(lesson_id, sort_order);

-- 2. Quiz-Ergebnis pro abgeschlossenem Modul
ALTER TABLE patient_path_progress
  ADD COLUMN IF NOT EXISTS quiz_score INTEGER,
  ADD COLUMN IF NOT EXISTS quiz_total INTEGER;

-- 3. Zertifikat — Zeitstempel, wann der Kurs vollständig abgeschlossen wurde.
-- Die enrollment.id dient als eindeutige Zertifikatsnummer.
ALTER TABLE patient_path_enrollments
  ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMPTZ;

-- 4. Einführungstext — wird vor Modul 1 angezeigt (was erwartet dich, was
-- verbesserst du). Markdown, kuratiert pro Kurs.
ALTER TABLE learning_paths
  ADD COLUMN IF NOT EXISTS intro_content TEXT;

-- 5. Hero-Bild — KI-generiertes Titelbild pro Kurs. Pfad relativ zu /public,
-- z. B. "/kurse/hydrations-boost-hero.png". NULL → Frontend zeigt Farbverlauf.
ALTER TABLE learning_paths
  ADD COLUMN IF NOT EXISTS hero_image TEXT;

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE path_lesson_quizzes ENABLE ROW LEVEL SECURITY;

-- Policies sind nicht idempotent — vor dem Anlegen droppen, damit diese
-- Migration gefahrlos mehrfach ausgeführt werden kann.
DROP POLICY IF EXISTS "anyone authenticated can read quizzes" ON path_lesson_quizzes;
DROP POLICY IF EXISTS "admin manages quizzes" ON path_lesson_quizzes;

-- Quizfragen: alle authentifizierten User dürfen lesen (wie path_lessons).
-- Es ist ein Lern-Quiz, kein hochsicherer Test — Konsistenz mit path_lessons.
CREATE POLICY "anyone authenticated can read quizzes"
  ON path_lesson_quizzes FOR SELECT TO authenticated
  USING (true);

-- Admin verwaltet Quizfragen (für späteres Backoffice)
CREATE POLICY "admin manages quizzes"
  ON path_lesson_quizzes FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
