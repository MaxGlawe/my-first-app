-- ============================================================
-- PROJ-18: Behandlungsverträge (Treatment Contracts)
-- E-Mail-basierte Signierung mit Token
-- ============================================================

-- ================================================================
-- 1. treatment_contracts Tabelle
-- ================================================================
CREATE TABLE IF NOT EXISTS treatment_contracts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Vertragsnummer (V-YYYY-NNNN)
  contract_number   TEXT NOT NULL UNIQUE,

  -- Beziehungen
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  created_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Vertragstyp & Leistungen
  contract_type     TEXT NOT NULL CHECK (contract_type IN ('einzelsitzung', 'mini_reha_post_op', 'chronik_programm')),
  leistungen        JSONB NOT NULL DEFAULT '[]',
  gesamtpreis       NUMERIC(10,2) NOT NULL,
  zahlungsweise     TEXT NOT NULL DEFAULT 'pro_sitzung' CHECK (zahlungsweise IN ('einmalig', 'pro_sitzung')),
  dauer_wochen      INTEGER,
  sitzungen_anzahl  INTEGER,

  -- Vertragstext (eingefrorener Snapshot)
  vertrag_text      JSONB NOT NULL DEFAULT '{}',

  -- Praxis-Snapshot (eingefroren bei Erstellung)
  praxis_name       TEXT NOT NULL,
  praxis_address    TEXT NOT NULL,
  praxis_inhaber    TEXT NOT NULL,
  praxis_zulassung  TEXT,

  -- Patient-Snapshot (eingefroren bei Erstellung)
  patient_name      TEXT NOT NULL,
  patient_address   TEXT,
  patient_email     TEXT NOT NULL,
  patient_geburtsdatum DATE,

  -- Signing Token
  signing_token     TEXT UNIQUE,
  token_expires_at  TIMESTAMPTZ,

  -- Status-Flow: entwurf → versendet → unterschrieben | widerrufen | abgelaufen | storniert
  status            TEXT NOT NULL DEFAULT 'entwurf'
                      CHECK (status IN ('entwurf', 'versendet', 'unterschrieben', 'widerrufen', 'abgelaufen', 'storniert')),

  -- Versand
  sent_at           TIMESTAMPTZ,
  sent_to_email     TEXT,

  -- Signatur
  signed_at         TIMESTAMPTZ,
  signature_png     TEXT,
  signer_ip         TEXT,
  signer_user_agent TEXT,
  signer_consent    BOOLEAN DEFAULT false,

  -- Widerrufsrecht (14 Tage nach Unterschrift)
  widerruf_bis      DATE,
  widerrufen_at     TIMESTAMPTZ,

  -- PDF Storage Paths
  pdf_path          TEXT,
  signed_pdf_path   TEXT,

  -- Notizen
  notes             TEXT
);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_treatment_contracts_updated_at ON treatment_contracts;
CREATE TRIGGER trg_treatment_contracts_updated_at
  BEFORE UPDATE ON treatment_contracts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================================================================
-- 2. Indexes
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_contracts_patient_id ON treatment_contracts(patient_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON treatment_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON treatment_contracts(created_by);
CREATE INDEX IF NOT EXISTS idx_contracts_signing_token ON treatment_contracts(signing_token);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON treatment_contracts(contract_number);

-- ================================================================
-- 3. RLS Policies
-- ================================================================
ALTER TABLE treatment_contracts ENABLE ROW LEVEL SECURITY;

-- Admin: alles lesen
DROP POLICY IF EXISTS "contracts_select" ON treatment_contracts;
CREATE POLICY "contracts_select" ON treatment_contracts
  FOR SELECT
  USING (
    get_my_role() = 'admin'
    OR
    created_by = auth.uid()
    OR
    (
      get_my_role() = 'patient'
      AND status = 'unterschrieben'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = treatment_contracts.patient_id
          AND p.user_id = auth.uid()
      )
    )
  );

-- Insert: Admin + Therapeuten
DROP POLICY IF EXISTS "contracts_insert" ON treatment_contracts;
CREATE POLICY "contracts_insert" ON treatment_contracts
  FOR INSERT
  WITH CHECK (
    get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut')
    AND created_by = auth.uid()
  );

-- Update: Admin + eigene
DROP POLICY IF EXISTS "contracts_update" ON treatment_contracts;
CREATE POLICY "contracts_update" ON treatment_contracts
  FOR UPDATE
  USING (
    get_my_role() = 'admin'
    OR created_by = auth.uid()
  )
  WITH CHECK (
    get_my_role() = 'admin'
    OR created_by = auth.uid()
  );

-- DSGVO: 10 Jahre Aufbewahrungspflicht — keine Löschung
DROP POLICY IF EXISTS "contracts_delete" ON treatment_contracts;
CREATE POLICY "contracts_delete" ON treatment_contracts
  FOR DELETE
  USING (false);

-- ================================================================
-- 4. Vertragsnummer-Generator (V-YYYY-NNNN)
-- ================================================================
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(contract_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM treatment_contracts
  WHERE contract_number LIKE 'V-' || current_year || '-%';

  RETURN 'V-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_contract_number() TO authenticated;

-- ================================================================
-- 5. Storage Bucket für Vertrags-PDFs (privat)
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "contracts_storage_select" ON storage.objects;
CREATE POLICY "contracts_storage_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "contracts_storage_insert" ON storage.objects;
CREATE POLICY "contracts_storage_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "contracts_storage_update" ON storage.objects;
CREATE POLICY "contracts_storage_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');
