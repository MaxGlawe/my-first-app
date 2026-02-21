-- ============================================================
-- PROJ-13: Kurs-System (Skalierbares Gruppen-Angebot)
--
-- Tables:
--   1. courses              — Kurs-Metadaten
--   2. course_lessons       — Aktuelle/editierbare Lektionen
--   3. course_lesson_snapshots — Unveränderliche Kopien pro Version
--   4. course_enrollments   — Patient ↔ Kurs Zuordnung
--   5. lesson_completions   — Abgeschlossene Lektionen
--
-- RPC Functions:
--   1. publish_course()       — Version erhöhen + Lektionen snapshotten
--   2. save_course_lessons()  — Atomisch Lektionen speichern
-- ============================================================

-- ----------------------------------------------------------------
-- 1. courses
-- ----------------------------------------------------------------

CREATE TABLE courses (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  name            TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  beschreibung    TEXT        CHECK (char_length(beschreibung) <= 5000),
  cover_image_url TEXT        CHECK (char_length(cover_image_url) <= 1000),
  dauer_wochen    INTEGER     NOT NULL DEFAULT 8 CHECK (dauer_wochen >= 1 AND dauer_wochen <= 104),
  kategorie       TEXT        NOT NULL CHECK (
                    kategorie IN ('ruecken', 'schulter', 'knie', 'huefte', 'nacken', 'ganzkoerper', 'sonstiges')
                  ),

  -- Unlock mode
  unlock_mode     TEXT        NOT NULL DEFAULT 'sequentiell'
                    CHECK (unlock_mode IN ('sequentiell', 'alle_sofort')),

  -- Status lifecycle
  status          TEXT        NOT NULL DEFAULT 'entwurf'
                    CHECK (status IN ('entwurf', 'aktiv', 'archiviert')),

  -- Versioning (0 = never published)
  version         INTEGER     NOT NULL DEFAULT 0,

  -- Invitation
  invite_token    TEXT        UNIQUE,
  invite_enabled  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- System
  is_archived     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_created_by   ON courses(created_by);
CREATE INDEX idx_courses_status       ON courses(status);
CREATE INDEX idx_courses_kategorie    ON courses(kategorie);
CREATE INDEX idx_courses_is_archived  ON courses(is_archived);
CREATE INDEX idx_courses_invite_token ON courses(invite_token) WHERE invite_token IS NOT NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_courses_updated_at();

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select" ON courses
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker') AND (created_by = auth.uid() OR status = 'aktiv'))
    OR (get_my_role() = 'patient' AND status = 'aktiv' AND is_archived = FALSE)
  );

CREATE POLICY "courses_insert" ON courses
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'admin')
  );

CREATE POLICY "courses_update" ON courses
  FOR UPDATE USING (
    created_by = auth.uid()
    OR get_my_role() = 'admin'
  );

CREATE POLICY "courses_delete" ON courses
  FOR DELETE USING (
    created_by = auth.uid()
    OR get_my_role() = 'admin'
  );

-- ----------------------------------------------------------------
-- 2. course_lessons (current/editable — therapist edits these)
-- ----------------------------------------------------------------

CREATE TABLE course_lessons (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Content
  title           TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  beschreibung    TEXT        CHECK (char_length(beschreibung) <= 50000),
  video_url       TEXT        CHECK (char_length(video_url) <= 1000),

  -- Linked exercises from exercise database
  exercise_unit   JSONB,

  -- Ordering
  "order"         INTEGER     NOT NULL DEFAULT 0,

  -- System
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_order     ON course_lessons(course_id, "order");

CREATE OR REPLACE FUNCTION update_course_lessons_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW EXECUTE FUNCTION update_course_lessons_updated_at();

-- RLS
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_lessons_select" ON course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_lessons.course_id
        AND (c.created_by = auth.uid() OR get_my_role() = 'admin' OR c.status = 'aktiv')
    )
  );

CREATE POLICY "course_lessons_insert" ON course_lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_lessons.course_id
        AND (c.created_by = auth.uid() OR get_my_role() = 'admin')
    )
  );

CREATE POLICY "course_lessons_update" ON course_lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_lessons.course_id
        AND (c.created_by = auth.uid() OR get_my_role() = 'admin')
    )
  );

CREATE POLICY "course_lessons_delete" ON course_lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_lessons.course_id
        AND (c.created_by = auth.uid() OR get_my_role() = 'admin')
    )
  );

-- ----------------------------------------------------------------
-- 3. course_lesson_snapshots (immutable copies per version)
-- ----------------------------------------------------------------

CREATE TABLE course_lesson_snapshots (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id       UUID        NOT NULL,
  version         INTEGER     NOT NULL,

  -- Snapshot content
  title           TEXT        NOT NULL,
  beschreibung    TEXT,
  video_url       TEXT,
  exercise_unit   JSONB,
  "order"         INTEGER     NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_lesson_version UNIQUE (course_id, lesson_id, version)
);

CREATE INDEX idx_cls_course_version ON course_lesson_snapshots(course_id, version);
CREATE INDEX idx_cls_order          ON course_lesson_snapshots(course_id, version, "order");

-- RLS
ALTER TABLE course_lesson_snapshots ENABLE ROW LEVEL SECURITY;

-- NOTE: cls_select policy is created AFTER course_enrollments table (dependency)
-- INSERT/UPDATE/DELETE only via RPC (SECURITY DEFINER)
-- No direct write policies needed

-- ----------------------------------------------------------------
-- 4. course_enrollments
-- ----------------------------------------------------------------

CREATE TABLE course_enrollments (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id         UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  patient_id        UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  enrolled_by       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_version  INTEGER     NOT NULL,

  -- Status
  status            TEXT        NOT NULL DEFAULT 'aktiv'
                      CHECK (status IN ('aktiv', 'abgeschlossen', 'abgebrochen')),

  -- Timestamps
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,

  -- One enrollment per patient per course (re-enroll = UPDATE)
  CONSTRAINT uq_active_enrollment UNIQUE (course_id, patient_id)
);

CREATE INDEX idx_ce_course_id   ON course_enrollments(course_id);
CREATE INDEX idx_ce_patient_id  ON course_enrollments(patient_id);
CREATE INDEX idx_ce_status      ON course_enrollments(status);
CREATE INDEX idx_ce_enrolled_by ON course_enrollments(enrolled_by);

-- RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ce_select" ON course_enrollments
  FOR SELECT USING (
    enrolled_by = auth.uid()
    OR get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_enrollments.course_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = course_enrollments.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "ce_insert" ON course_enrollments
  FOR INSERT WITH CHECK (
    get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'admin')
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = course_enrollments.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "ce_update" ON course_enrollments
  FOR UPDATE USING (
    enrolled_by = auth.uid()
    OR get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_enrollments.course_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = course_enrollments.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- ── Deferred: cls_select policy (needs course_enrollments) ───────
CREATE POLICY "cls_select" ON course_lesson_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_lesson_snapshots.course_id
        AND (c.created_by = auth.uid() OR get_my_role() = 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM course_enrollments ce
      JOIN patients p ON p.id = ce.patient_id
      WHERE ce.course_id = course_lesson_snapshots.course_id
        AND ce.enrolled_version = course_lesson_snapshots.version
        AND p.user_id = auth.uid()
        AND ce.status IN ('aktiv', 'abgeschlossen')
    )
  );

-- ----------------------------------------------------------------
-- 5. lesson_completions
-- ----------------------------------------------------------------

CREATE TABLE lesson_completions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id   UUID        NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id       UUID        NOT NULL,
  patient_id      UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_lesson_completion UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX idx_lc_enrollment_id ON lesson_completions(enrollment_id);
CREATE INDEX idx_lc_patient_id    ON lesson_completions(patient_id);

-- RLS
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lc_select" ON lesson_completions
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM course_enrollments ce
      WHERE ce.id = lesson_completions.enrollment_id
        AND (
          ce.enrolled_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM courses c WHERE c.id = ce.course_id AND c.created_by = auth.uid()
          )
        )
    )
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = lesson_completions.patient_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "lc_insert" ON lesson_completions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = lesson_completions.patient_id
        AND p.user_id = auth.uid()
    )
    OR get_my_role() = 'admin'
  );

-- Completions are immutable
CREATE POLICY "lc_delete" ON lesson_completions
  FOR DELETE USING (get_my_role() = 'admin');

-- ----------------------------------------------------------------
-- RPC: publish_course — Increment version + snapshot lessons
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION publish_course(p_course_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id   UUID;
  v_is_admin    BOOLEAN;
  v_new_version INTEGER;
  v_course      RECORD;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = v_caller_id AND role = 'admin'
  ) INTO v_is_admin;

  SELECT id, version, status INTO v_course
  FROM courses
  WHERE id = p_course_id
    AND is_archived = FALSE
    AND (created_by = v_caller_id OR v_is_admin);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized or course not found';
  END IF;

  -- Must have at least 1 lesson
  IF NOT EXISTS (SELECT 1 FROM course_lessons WHERE course_id = p_course_id) THEN
    RAISE EXCEPTION 'Course must have at least one lesson to publish';
  END IF;

  v_new_version := v_course.version + 1;

  -- Update course status and version
  UPDATE courses
  SET version = v_new_version,
      status = 'aktiv',
      updated_at = NOW()
  WHERE id = p_course_id;

  -- Remove any existing snapshots for this version (safety for re-publish)
  DELETE FROM course_lesson_snapshots
  WHERE course_id = p_course_id AND version = v_new_version;

  -- Snapshot all current lessons
  INSERT INTO course_lesson_snapshots (course_id, lesson_id, version, title, beschreibung, video_url, exercise_unit, "order")
  SELECT course_id, id, v_new_version, title, beschreibung, video_url, exercise_unit, "order"
  FROM course_lessons
  WHERE course_id = p_course_id
  ORDER BY "order";

  RETURN v_new_version;
END;
$$;

GRANT EXECUTE ON FUNCTION publish_course(UUID) TO authenticated;

-- ----------------------------------------------------------------
-- RPC: save_course_lessons — Atomic lesson save (delete + re-insert)
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION save_course_lessons(
  p_course_id UUID,
  p_lessons   JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_is_admin  BOOLEAN;
  v_lesson    JSONB;
  v_idx       INTEGER := 0;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = v_caller_id AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT EXISTS (
    SELECT 1 FROM courses
    WHERE id = p_course_id
      AND is_archived = FALSE
      AND (created_by = v_caller_id OR v_is_admin)
  ) THEN
    RAISE EXCEPTION 'Not authorized or course not found';
  END IF;

  -- Delete existing lessons
  DELETE FROM course_lessons WHERE course_id = p_course_id;

  -- Re-insert in order
  FOR v_lesson IN SELECT value FROM jsonb_array_elements(p_lessons) LOOP
    INSERT INTO course_lessons (course_id, title, beschreibung, video_url, exercise_unit, "order")
    VALUES (
      p_course_id,
      v_lesson->>'title',
      v_lesson->>'beschreibung',
      NULLIF(v_lesson->>'video_url', ''),
      CASE WHEN v_lesson->'exercise_unit' IS NOT NULL AND v_lesson->'exercise_unit' != 'null'::jsonb
           THEN v_lesson->'exercise_unit'
           ELSE NULL END,
      v_idx
    );
    v_idx := v_idx + 1;
  END LOOP;

  -- Touch course updated_at
  UPDATE courses SET updated_at = NOW() WHERE id = p_course_id;
END;
$$;

GRANT EXECUTE ON FUNCTION save_course_lessons(UUID, JSONB) TO authenticated;
