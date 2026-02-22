-- ============================================================
-- V2 Phase 2: Tele-Therapie Intake Requests
-- Public intake form submissions for tele-therapy onboarding
-- ============================================================

CREATE TABLE IF NOT EXISTS intake_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Step 1: Personal info
  vorname TEXT NOT NULL CHECK (char_length(vorname) BETWEEN 1 AND 100),
  nachname TEXT NOT NULL CHECK (char_length(nachname) BETWEEN 1 AND 100),
  email TEXT NOT NULL,
  telefon TEXT NOT NULL CHECK (char_length(telefon) BETWEEN 1 AND 30),

  -- Step 2: Main complaint
  beschwerde_bereich TEXT NOT NULL,
  beschwerde_freitext TEXT NOT NULL CHECK (char_length(beschwerde_freitext) BETWEEN 1 AND 2000),

  -- Step 3: History
  symptom_dauer TEXT NOT NULL,
  vorherige_behandlung TEXT[] NOT NULL DEFAULT '{}',
  vorherige_behandlung_details TEXT,

  -- Step 4: Consent
  datenschutz_akzeptiert BOOLEAN NOT NULL DEFAULT false,
  agb_akzeptiert BOOLEAN NOT NULL DEFAULT false,
  heilpraktiker_info BOOLEAN NOT NULL DEFAULT false,

  -- Workflow
  status TEXT NOT NULL DEFAULT 'neu'
    CHECK (status IN ('neu', 'kontaktiert', 'termin_gebucht', 'patient_erstellt', 'abgelehnt')),
  interne_notizen TEXT,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  zugewiesen_an UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Spam protection
  ip_address INET,
  user_agent TEXT
);

-- Auto-update timestamp
CREATE TRIGGER trg_intake_requests_updated_at
  BEFORE UPDATE ON intake_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_intake_status ON intake_requests(status);
CREATE INDEX IF NOT EXISTS idx_intake_created ON intake_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_email ON intake_requests(lower(email));
CREATE INDEX IF NOT EXISTS idx_intake_patient ON intake_requests(patient_id) WHERE patient_id IS NOT NULL;

-- RLS
ALTER TABLE intake_requests ENABLE ROW LEVEL SECURITY;

-- Staff can read all intake requests
CREATE POLICY "intake_select_staff" ON intake_requests
  FOR SELECT USING (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut')
  );

-- Staff can update (assign therapist, change status, add notes)
CREATE POLICY "intake_update_staff" ON intake_requests
  FOR UPDATE USING (
    get_my_role() IN ('admin', 'heilpraktiker')
  );

-- No delete (keep records for analytics & DSGVO audit trail)
CREATE POLICY "intake_no_delete" ON intake_requests
  FOR DELETE USING (false);
