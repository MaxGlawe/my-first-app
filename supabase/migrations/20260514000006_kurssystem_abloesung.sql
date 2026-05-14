-- ============================================================
-- PROJ-22: Ablösung PROJ-13 — altes Kurssystem vollständig entfernen
--
-- Entfernt das alte, manuell verwaltete Gruppenkurs-System. Es enthielt
-- nur Test-Daten (keine echten Klienten) — der Sunset ist unkritisch.
-- Das neue System (learning_paths + products + Shop) bleibt unberührt.
--
-- Idempotent: IF EXISTS überall, Übungs-Delete defensiv.
-- ============================================================

-- ── 1. Tabellen ──────────────────────────────────────────────
-- CASCADE entfernt zugleich FKs, RLS-Policies, Indizes und Trigger.
DROP TABLE IF EXISTS lesson_completions       CASCADE;
DROP TABLE IF EXISTS course_enrollments       CASCADE;
DROP TABLE IF EXISTS course_lesson_snapshots  CASCADE;
DROP TABLE IF EXISTS course_lessons           CASCADE;
DROP TABLE IF EXISTS courses                  CASCADE;

-- ── 2. Funktionen ────────────────────────────────────────────
-- Funktionen werden NICHT vom Table-CASCADE erfasst → explizit droppen.
DROP FUNCTION IF EXISTS publish_course(UUID);
DROP FUNCTION IF EXISTS save_course_lessons(UUID, JSONB);
DROP FUNCTION IF EXISTS update_courses_updated_at();
DROP FUNCTION IF EXISTS update_course_lessons_updated_at();

-- ── 3. Geseedete Entspannungsübungen (Traumreisen) ───────────
-- Defensiv: Übungen, die in einem Trainingsplan referenziert sind
-- (plan_exercises hat ON DELETE RESTRICT), werden übersprungen — die
-- Migration läuft dann trotzdem sauber durch. Bleibt eine Übung übrig,
-- ist sie noch in einem Trainingsplan in Verwendung.
DELETE FROM exercises
WHERE is_public = true
  AND name IN (
    'Bauchatmung (Diaphragma)',
    '4-7-8 Atemtechnik',
    'Progressive Muskelentspannung (Kurzform)',
    'Body Scan Meditation',
    'Achtsames Gehen',
    'Schulter-Nacken-Entspannung',
    'Rücken-Dehnungsserie',
    'Atembeobachtung (Achtsamkeit)',
    'Gedankenreise-Visualisierung',
    'Ganzkörper-Entspannung (Savasana)'
  )
  AND id NOT IN (SELECT exercise_id FROM plan_exercises);
