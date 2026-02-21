-- ============================================================
-- PROJ-17: Patienten-Edukation & Engagement System
-- 4 neue Tabellen + ALTER patient_assignments
-- ============================================================

-- ── 1. education_modules ────────────────────────────────────

CREATE TABLE education_modules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hauptproblem     TEXT NOT NULL,
  title            TEXT NOT NULL,
  lesson_content   TEXT NOT NULL,
  generated_by     UUID NOT NULL REFERENCES auth.users(id),
  status           TEXT NOT NULL DEFAULT 'entwurf'
                     CHECK (status IN ('entwurf', 'freigegeben', 'archiviert')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One active module per hauptproblem (cache)
CREATE UNIQUE INDEX idx_em_hauptproblem_unique
  ON education_modules(hauptproblem) WHERE status != 'archiviert';

CREATE INDEX idx_em_status ON education_modules(status);

ALTER TABLE education_modules ENABLE ROW LEVEL SECURITY;

-- Staff can see all
CREATE POLICY "em_select_staff" ON education_modules
  FOR SELECT USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- Patients see only freigegeben
CREATE POLICY "em_select_patient" ON education_modules
  FOR SELECT USING (
    status = 'freigegeben'
    AND EXISTS (SELECT 1 FROM patients WHERE user_id = auth.uid())
  );

-- Staff can insert
CREATE POLICY "em_insert" ON education_modules
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- Staff can update
CREATE POLICY "em_update" ON education_modules
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- ── 2. education_quizzes ────────────────────────────────────

CREATE TABLE education_quizzes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id        UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  question_number  SMALLINT NOT NULL CHECK (question_number BETWEEN 1 AND 3),
  question_text    TEXT NOT NULL,
  options          JSONB NOT NULL,
  correct_index    SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (module_id, question_number)
);

CREATE INDEX idx_eq_module_id ON education_quizzes(module_id);

ALTER TABLE education_quizzes ENABLE ROW LEVEL SECURITY;

-- Staff sees all
CREATE POLICY "eq_select_staff" ON education_quizzes
  FOR SELECT USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- Patient sees quizzes for freigegeben modules
CREATE POLICY "eq_select_patient" ON education_quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM education_modules em
      WHERE em.id = module_id AND em.status = 'freigegeben'
    )
    AND EXISTS (SELECT 1 FROM patients WHERE user_id = auth.uid())
  );

-- Staff can insert/update
CREATE POLICY "eq_insert" ON education_quizzes
  FOR INSERT WITH CHECK (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

CREATE POLICY "eq_update" ON education_quizzes
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- Staff can delete (for regeneration)
CREATE POLICY "eq_delete" ON education_quizzes
  FOR DELETE USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- ── 3. quiz_attempts ────────────────────────────────────────

CREATE TABLE quiz_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  module_id        UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  answers          JSONB NOT NULL,
  score            SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 3),
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (patient_id, module_id)
);

CREATE INDEX idx_qa_patient_id ON quiz_attempts(patient_id);
CREATE INDEX idx_qa_module_id ON quiz_attempts(module_id);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Patient can insert own
CREATE POLICY "qa_insert_patient" ON quiz_attempts
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Patient can select own
CREATE POLICY "qa_select_patient" ON quiz_attempts
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Staff can see all
CREATE POLICY "qa_select_staff" ON quiz_attempts
  FOR SELECT USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- Patient can delete own (for retake)
CREATE POLICY "qa_delete_patient" ON quiz_attempts
  FOR DELETE USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- ── 4. daily_insights ───────────────────────────────────────

CREATE TABLE daily_insights (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  insight_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  content          TEXT NOT NULL,
  context_data     JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (patient_id, insight_date)
);

CREATE INDEX idx_di_patient_date ON daily_insights(patient_id, insight_date DESC);

ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;

-- Patient sees own
CREATE POLICY "di_select_patient" ON daily_insights
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Patient can insert own (for caching from API)
CREATE POLICY "di_insert_patient" ON daily_insights
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Staff can see all
CREATE POLICY "di_select_staff" ON daily_insights
  FOR SELECT USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
  );

-- ── 5. ALTER patient_assignments ────────────────────────────

ALTER TABLE patient_assignments
  ADD COLUMN IF NOT EXISTS hauptproblem TEXT;

-- ============================================================
-- Verification:
--   1. Run in Supabase SQL Editor
--   2. Check: SELECT * FROM education_modules; (should be empty)
--   3. Check: \d patient_assignments (should have hauptproblem column)
-- ============================================================
