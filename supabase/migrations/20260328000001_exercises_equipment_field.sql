-- Add equipment field to exercises table
-- Stores required equipment/tools for the exercise (e.g. Faszienrolle, Theraband, Beinpresse)

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT[] DEFAULT '{}';

-- Index for overlap queries (filtering by equipment)
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING GIN (equipment);

-- Backfill: Tag existing exercises that have equipment in their name
UPDATE exercises SET equipment = array_append(equipment, 'Theraband')
  WHERE name ILIKE '%theraband%' AND NOT ('Theraband' = ANY(equipment));

UPDATE exercises SET equipment = array_append(equipment, 'Kettlebell')
  WHERE name ILIKE '%kettlebell%' AND NOT ('Kettlebell' = ANY(equipment));

UPDATE exercises SET equipment = array_append(equipment, 'Faszienrolle')
  WHERE name ILIKE '%faszienrolle%' AND NOT ('Faszienrolle' = ANY(equipment));

UPDATE exercises SET equipment = array_append(equipment, 'Stab')
  WHERE name ILIKE '%stab%' AND NOT ('Stab' = ANY(equipment));

UPDATE exercises SET equipment = array_append(equipment, 'Pezziball')
  WHERE name ILIKE '%pezziball%' AND NOT ('Pezziball' = ANY(equipment));
