-- Add standard_dauer_sekunden column to exercises table
-- Needed for hold exercises (e.g. planks, wall sits) where duration matters, not reps.

ALTER TABLE exercises
  ADD COLUMN standard_dauer_sekunden SMALLINT
  CHECK (standard_dauer_sekunden >= 1 AND standard_dauer_sekunden <= 7200);
