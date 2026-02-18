-- ============================================================
-- PROJ-9: Trainingsplan-Builder
-- Training plans, phases, units (days), and per-unit exercises
-- ============================================================

-- ----------------------------------------------------------------
-- 1. training_plans
-- ----------------------------------------------------------------
CREATE TABLE training_plans (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  beschreibung  TEXT,
  is_template   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_archived   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Therapists see own plans + all templates from any therapist
CREATE POLICY "training_plans_select" ON training_plans
  FOR SELECT USING (
    auth.uid() = created_by
    OR is_template = TRUE
  );

CREATE POLICY "training_plans_insert" ON training_plans
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "training_plans_update" ON training_plans
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "training_plans_delete" ON training_plans
  FOR DELETE USING (auth.uid() = created_by);

CREATE INDEX idx_training_plans_created_by ON training_plans(created_by);
CREATE INDEX idx_training_plans_is_template ON training_plans(is_template) WHERE is_template = TRUE;
CREATE INDEX idx_training_plans_is_archived ON training_plans(is_archived);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_training_plans_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_training_plans_updated_at();

-- ----------------------------------------------------------------
-- 2. plan_phases  (optional grouping of units into phases/weeks)
-- ----------------------------------------------------------------
CREATE TABLE plan_phases (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id      UUID        NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL DEFAULT 'Phase 1',
  dauer_wochen INTEGER     NOT NULL DEFAULT 1 CHECK (dauer_wochen >= 1 AND dauer_wochen <= 52),
  "order"      INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE plan_phases ENABLE ROW LEVEL SECURITY;

-- Inherit access from training_plans via join
CREATE POLICY "plan_phases_select" ON plan_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_phases.plan_id
        AND (tp.created_by = auth.uid() OR tp.is_template = TRUE)
    )
  );

CREATE POLICY "plan_phases_insert" ON plan_phases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_phases.plan_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE POLICY "plan_phases_update" ON plan_phases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_phases.plan_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE POLICY "plan_phases_delete" ON plan_phases
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_phases.plan_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE INDEX idx_plan_phases_plan_id ON plan_phases(plan_id);
CREATE INDEX idx_plan_phases_order   ON plan_phases(plan_id, "order");

-- ----------------------------------------------------------------
-- 3. plan_units  (training days, belong to a plan; optionally grouped in a phase)
-- ----------------------------------------------------------------
CREATE TABLE plan_units (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id    UUID        NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  phase_id   UUID        REFERENCES plan_phases(id) ON DELETE SET NULL,
  name       TEXT        NOT NULL DEFAULT 'Trainingstag',
  "order"    INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE plan_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_units_select" ON plan_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_units.plan_id
        AND (tp.created_by = auth.uid() OR tp.is_template = TRUE)
    )
  );

CREATE POLICY "plan_units_insert" ON plan_units
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_units.plan_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE POLICY "plan_units_update" ON plan_units
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_units.plan_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE POLICY "plan_units_delete" ON plan_units
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM training_plans tp
      WHERE tp.id = plan_units.plan_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE INDEX idx_plan_units_plan_id  ON plan_units(plan_id);
CREATE INDEX idx_plan_units_phase_id ON plan_units(phase_id);
CREATE INDEX idx_plan_units_order    ON plan_units(plan_id, "order");

-- ----------------------------------------------------------------
-- 4. plan_exercises  (individual exercise rows inside a training unit)
-- ----------------------------------------------------------------
CREATE TABLE plan_exercises (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id               UUID        NOT NULL REFERENCES plan_units(id) ON DELETE CASCADE,
  exercise_id           UUID        NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  "order"               INTEGER     NOT NULL DEFAULT 0,
  -- Individual parameters stored as JSONB for flexibility
  -- Expected shape: { saetze, wiederholungen?, dauer_sekunden?, pause_sekunden, intensitaet_prozent?, anmerkung? }
  params                JSONB       NOT NULL DEFAULT '{}'::jsonb,
  -- Flag set to TRUE when the referenced exercise is soft-deleted (archived)
  is_archived_exercise  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_exercises_select" ON plan_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM plan_units pu
      JOIN training_plans tp ON tp.id = pu.plan_id
      WHERE pu.id = plan_exercises.unit_id
        AND (tp.created_by = auth.uid() OR tp.is_template = TRUE)
    )
  );

CREATE POLICY "plan_exercises_insert" ON plan_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM plan_units pu
      JOIN training_plans tp ON tp.id = pu.plan_id
      WHERE pu.id = plan_exercises.unit_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE POLICY "plan_exercises_update" ON plan_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM plan_units pu
      JOIN training_plans tp ON tp.id = pu.plan_id
      WHERE pu.id = plan_exercises.unit_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE POLICY "plan_exercises_delete" ON plan_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM plan_units pu
      JOIN training_plans tp ON tp.id = pu.plan_id
      WHERE pu.id = plan_exercises.unit_id
        AND tp.created_by = auth.uid()
    )
  );

CREATE INDEX idx_plan_exercises_unit_id     ON plan_exercises(unit_id);
CREATE INDEX idx_plan_exercises_exercise_id ON plan_exercises(exercise_id);
CREATE INDEX idx_plan_exercises_order       ON plan_exercises(unit_id, "order");

-- ----------------------------------------------------------------
-- 5. Trigger: when an exercise is archived, mark all plan_exercises as archived
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_plan_exercise_archive()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- exercises table has an is_archived column (PROJ-8)
  IF NEW.is_archived = TRUE AND OLD.is_archived = FALSE THEN
    UPDATE plan_exercises
    SET is_archived_exercise = TRUE
    WHERE exercise_id = NEW.id
      AND is_archived_exercise = FALSE;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER exercises_archive_sync
  AFTER UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION sync_plan_exercise_archive();
