-- ============================================================
-- PROJ-18: Praxis-Stammdaten (Singleton)
-- Extracted from billing migration (de58195) for standalone use.
-- ============================================================

CREATE TABLE IF NOT EXISTS praxis_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  praxis_name      TEXT NOT NULL,
  inhaber_name     TEXT NOT NULL,
  strasse          TEXT NOT NULL,
  plz              TEXT NOT NULL,
  ort              TEXT NOT NULL,
  telefon          TEXT,
  email            TEXT,
  website          TEXT,
  steuernummer     TEXT,
  iban             TEXT NOT NULL,
  bic              TEXT,
  bank_name        TEXT,
  zulassungsnummer TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_praxis_settings_updated_at ON praxis_settings;
CREATE TRIGGER trg_praxis_settings_updated_at
  BEFORE UPDATE ON praxis_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE praxis_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "praxis_settings_select" ON praxis_settings;
CREATE POLICY "praxis_settings_select" ON praxis_settings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "praxis_settings_update" ON praxis_settings;
CREATE POLICY "praxis_settings_update" ON praxis_settings
  FOR UPDATE
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "praxis_settings_insert" ON praxis_settings;
CREATE POLICY "praxis_settings_insert" ON praxis_settings
  FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

-- DSGVO: Stammdaten dürfen nicht gelöscht werden
DROP POLICY IF EXISTS "praxis_settings_delete" ON praxis_settings;
CREATE POLICY "praxis_settings_delete" ON praxis_settings
  FOR DELETE
  USING (false);

-- Seed: Platzhalter — Admin füllt über /os/admin/vertraege aus
INSERT INTO praxis_settings (
  praxis_name, inhaber_name, strasse, plz, ort,
  telefon, email, website, iban, bic, bank_name
) VALUES (
  'Physiotherapie Glawe',
  'Max Glawe',
  'Musterstraße 1',
  '12345',
  'Musterstadt',
  '+49 123 456789',
  'info@physiotherapie-glawe.de',
  'https://physiotherapie-glawe.de',
  'DE00 0000 0000 0000 0000 00',
  'COBADEFFXXX',
  'Commerzbank'
) ON CONFLICT DO NOTHING;
