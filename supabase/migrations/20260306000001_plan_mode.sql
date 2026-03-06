-- ============================================================
-- Add plan_mode to training_plans
-- 'sections' = Aufwärmen/Hauptteil/Cool-Down (default for new plans)
-- 'phases' = classic multi-week phases (existing plans)
-- ============================================================

ALTER TABLE training_plans
  ADD COLUMN IF NOT EXISTS plan_mode TEXT NOT NULL DEFAULT 'phases'
  CHECK (plan_mode IN ('sections', 'phases'));

-- Existing plans stay in 'phases' mode (the default above).
-- New plans will be created with 'sections' by the API.
