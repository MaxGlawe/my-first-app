-- PROJ-APP: Training Session Logs — Übungs-Level Tracking
-- Erfasst pro Training-Session: einzelne Übungen, Sätze, Schwierigkeit, Schmerz

CREATE TABLE IF NOT EXISTS training_session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES patient_assignments(id) ON DELETE CASCADE,
  unit_id UUID,

  -- Zeiterfassung
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Gesamt-Feedback
  overall_difficulty SMALLINT CHECK (overall_difficulty BETWEEN 1 AND 5),
  overall_pain SMALLINT CHECK (overall_pain BETWEEN 0 AND 10),
  notes TEXT,

  -- Einzelne Übungen als JSONB-Array
  -- Format: [{ exercise_id, sets_done, reps_done, duration_seconds,
  --            difficulty (1-5), pain_during (0-10), skipped, skip_reason }]
  exercise_logs JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen nach Patient + Zeitraum
CREATE INDEX IF NOT EXISTS idx_tsl_patient_date
  ON training_session_logs (patient_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_tsl_assignment
  ON training_session_logs (assignment_id, started_at DESC);

-- RLS aktivieren
ALTER TABLE training_session_logs ENABLE ROW LEVEL SECURITY;

-- Patient darf nur eigene Logs sehen
CREATE POLICY "Patient sieht eigene Training-Logs"
  ON training_session_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Patient darf eigene Logs erstellen
CREATE POLICY "Patient erstellt eigene Training-Logs"
  ON training_session_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Therapeuten/Admins können Logs ihrer Patienten sehen
CREATE POLICY "Therapeut sieht Patienten-Logs"
  ON training_session_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('therapeut', 'admin')
    )
  );
