-- ============================================================
-- PROJ-9 Bug Fixes
-- BUG-3:  Atomic save via save_training_plan() RPC function
-- BUG-7:  Auto-set is_archived_exercise on INSERT trigger
-- BUG-11: Admin override in RLS policies for training_plans
-- ============================================================

-- ----------------------------------------------------------------
-- BUG-11: Allow admins to update/delete any training plan
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "training_plans_update" ON training_plans;
CREATE POLICY "training_plans_update" ON training_plans
  FOR UPDATE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "training_plans_delete" ON training_plans;
CREATE POLICY "training_plans_delete" ON training_plans
  FOR DELETE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- BUG-7: Auto-set is_archived_exercise on INSERT
-- When a plan_exercise is inserted, check if the referenced
-- exercise is already archived and set the flag accordingly.
-- This prevents the client from controlling archive status.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_plan_exercise_archive_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM exercises
    WHERE id = NEW.exercise_id AND is_archived = TRUE
  ) THEN
    NEW.is_archived_exercise := TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS plan_exercises_set_archive_on_insert ON plan_exercises;
CREATE TRIGGER plan_exercises_set_archive_on_insert
  BEFORE INSERT ON plan_exercises
  FOR EACH ROW EXECUTE FUNCTION set_plan_exercise_archive_on_insert();

-- ----------------------------------------------------------------
-- BUG-3: Atomic save via SECURITY DEFINER RPC function
-- All phases/units/exercises are saved in a single transaction.
-- If any step fails, everything rolls back — no partial state.
-- Ownership is verified inside the function using auth.uid().
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION save_training_plan(
  p_plan_id      UUID,
  p_name         TEXT,
  p_beschreibung TEXT,
  p_is_template  BOOLEAN,
  p_phases       JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id  UUID;
  v_is_admin   BOOLEAN;
  v_phase      JSONB;
  v_unit       JSONB;
  v_exercise   JSONB;
  v_phase_id   UUID;
  v_unit_id    UUID;
  v_phase_idx  INTEGER := 0;
  v_unit_idx   INTEGER;
  v_exer_idx   INTEGER;
BEGIN
  -- Identify the calling user from JWT claims
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = v_caller_id AND role = 'admin'
  ) INTO v_is_admin;

  -- Verify ownership (owner OR admin)
  IF NOT EXISTS (
    SELECT 1 FROM training_plans
    WHERE id = p_plan_id
      AND is_archived = FALSE
      AND (created_by = v_caller_id OR v_is_admin)
  ) THEN
    RAISE EXCEPTION 'Not authorized or plan not found';
  END IF;

  -- Update plan metadata
  UPDATE training_plans
  SET
    name         = p_name,
    beschreibung = p_beschreibung,
    is_template  = p_is_template,
    updated_at   = NOW()
  WHERE id = p_plan_id;

  -- Delete all existing phases (cascades to plan_units and plan_exercises)
  DELETE FROM plan_phases WHERE plan_id = p_plan_id;

  -- Re-insert phases, units, exercises
  FOR v_phase IN SELECT value FROM jsonb_array_elements(p_phases) LOOP
    INSERT INTO plan_phases (plan_id, name, dauer_wochen, "order")
    VALUES (
      p_plan_id,
      v_phase->>'name',
      COALESCE((v_phase->>'dauer_wochen')::INTEGER, 1),
      v_phase_idx
    )
    RETURNING id INTO v_phase_id;

    v_unit_idx := 0;
    FOR v_unit IN SELECT value FROM jsonb_array_elements(v_phase->'units') LOOP
      INSERT INTO plan_units (plan_id, phase_id, name, "order")
      VALUES (
        p_plan_id,
        v_phase_id,
        v_unit->>'name',
        v_unit_idx
      )
      RETURNING id INTO v_unit_id;

      v_exer_idx := 0;
      FOR v_exercise IN SELECT value FROM jsonb_array_elements(v_unit->'exercises') LOOP
        INSERT INTO plan_exercises (unit_id, exercise_id, "order", params)
        VALUES (
          v_unit_id,
          (v_exercise->>'exercise_id')::UUID,
          v_exer_idx,
          COALESCE((v_exercise->'params')::JSONB, '{}'::JSONB)
        );
        -- NOTE: The plan_exercises_set_archive_on_insert trigger will
        -- automatically set is_archived_exercise if the exercise is archived.
        v_exer_idx := v_exer_idx + 1;
      END LOOP;

      v_unit_idx := v_unit_idx + 1;
    END LOOP;

    v_phase_idx := v_phase_idx + 1;
  END LOOP;
END;
$$;

-- Grant execute to authenticated users (Supabase default anon/authenticated roles)
GRANT EXECUTE ON FUNCTION save_training_plan(UUID, TEXT, TEXT, BOOLEAN, JSONB)
  TO authenticated;
