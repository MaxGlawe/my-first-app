-- ============================================================
-- PROJ-17 Enhancement: Multi-Lesson Curriculum System
-- Each hauptproblem gets a 10-lesson curriculum.
-- Lessons are generated on-demand per training day.
-- ============================================================

-- ── Add multi-lesson columns to education_modules ───────────

ALTER TABLE education_modules
  ADD COLUMN IF NOT EXISTS lesson_number INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_lessons INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS curriculum JSONB;

-- ── Drop old unique index (one module per hauptproblem) ─────

DROP INDEX IF EXISTS idx_em_hauptproblem_unique;

-- ── New unique index: one lesson per number per hauptproblem ─

CREATE UNIQUE INDEX idx_em_hauptproblem_lesson_unique
  ON education_modules(hauptproblem, lesson_number)
  WHERE status != 'archiviert';

-- ============================================================
-- curriculum JSONB format:
-- [
--   { "number": 1, "topic": "Was ist Bandscheibenvorfall?" },
--   { "number": 2, "topic": "Anatomie der Wirbelsäule" },
--   ...
--   { "number": 10, "topic": "Langfristige Prävention" }
-- ]
--
-- lesson_number: Which lesson this row represents (1-10)
-- total_lessons: Total planned lessons (usually 10)
-- curriculum: Only stored on lesson_number=1 (the "master" row)
-- ============================================================
