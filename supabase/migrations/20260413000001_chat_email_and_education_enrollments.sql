-- Migration: Chat email notification debounce + Education enrollments
-- Features: Chat-E-Mail-Benachrichtigung, Wissenslektionen beibehalten, Trainingstage flexibel

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Chat email notification debounce timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE patients
ADD COLUMN IF NOT EXISTS last_chat_email_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Patient-controlled active days override for flexible training days
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE patient_assignments
ADD COLUMN IF NOT EXISTS patient_active_days TEXT[];

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Education enrollments — decoupled from assignments
--    Persists education progress even when assignments are modified/deleted.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS education_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hauptproblem    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'aktiv'
                    CHECK (status IN ('aktiv', 'pausiert', 'abgeschlossen')),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  enrolled_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (patient_id, hauptproblem)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ee_patient_id ON education_enrollments(patient_id);
CREATE INDEX IF NOT EXISTS idx_ee_hauptproblem ON education_enrollments(hauptproblem);

-- RLS
ALTER TABLE education_enrollments ENABLE ROW LEVEL SECURITY;

-- Patients can see their own enrollments
CREATE POLICY ee_patient_select ON education_enrollments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE user_id = auth.uid()
         OR email = auth.email()
    )
  );

-- Staff (therapists/admin) can manage enrollments for their patients
CREATE POLICY ee_staff_select ON education_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'therapeut', 'heilpraktiker', 'trainer')
    )
  );

CREATE POLICY ee_staff_insert ON education_enrollments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'therapeut', 'heilpraktiker', 'trainer')
    )
  );

CREATE POLICY ee_staff_update ON education_enrollments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'therapeut', 'heilpraktiker', 'trainer')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Backfill: create education_enrollments from existing assignments
--    This ensures existing patients keep their education progress.
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO education_enrollments (patient_id, hauptproblem, enrolled_by)
SELECT DISTINCT
  pa.patient_id,
  pa.hauptproblem,
  pa.therapist_id
FROM patient_assignments pa
WHERE pa.hauptproblem IS NOT NULL
  AND pa.hauptproblem != ''
ON CONFLICT (patient_id, hauptproblem) DO NOTHING;
