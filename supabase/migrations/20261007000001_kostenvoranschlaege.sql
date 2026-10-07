-- ============================================================
-- PROJ-29: Kostenvoranschläge — ohne Patientenkonto
--
-- Der Behandler: „Ich brauche vor allem den Builder, wo ich einen solchen sehr
-- sehr schnell erstellen kann. Baue so etwas auch unabhängig von
-- Benutzerkonten in Praxis OS, damit ich für jeden Patienten einen erstellen
-- kann, ohne einen Account zu erstellen."
--
-- Deshalb eine eigene Tabelle und NICHT `invoices`:
--
--   1. `invoices.patient_id` ist NOT NULL. Wer anruft und fragt, was das
--      kostet, ist noch kein Patient — fuer einen Kostenvoranschlag erst ein
--      Konto anzulegen waere die Huerde, die genau diese Anfrage verhindert.
--
--   2. Ein Kostenvoranschlag ist KEIN Umsatz und darf in keiner Auswertung
--      auftauchen. In `invoices` haetten wir ihn ueberall wieder herausfiltern
--      muessen — eine Filterbedingung, die man einmal vergisst.
--
--   3. Eigener Nummernkreis (KV-2026-0001). Ein Kostenvoranschlag darf keine
--      Luecke in die Rechnungsnummern reissen.
--
-- Die Website verspricht ihn an zwei Stellen („Ein Kostenvoranschlag wird auf
-- Wunsch vorab ausgestellt"), ohne dass es ihn je gab.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

CREATE TABLE IF NOT EXISTS kostenvoranschlaege (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nummer        TEXT NOT NULL UNIQUE,

  /** Wer ihn ausgestellt hat. Pflicht — ein Beleg ohne Urheber gibt es nicht. */
  created_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  /**
   * Freitext statt Verweis: Der Empfaenger muss kein Patient sein.
   * Ist er einer, wird `patient_id` zusaetzlich gesetzt — aber nie verlangt.
   */
  empfaenger_name       TEXT NOT NULL CHECK (char_length(empfaenger_name) BETWEEN 1 AND 200),
  empfaenger_anschrift  TEXT,
  empfaenger_geburtstag DATE,
  patient_id            UUID REFERENCES patients(id) ON DELETE SET NULL,

  diagnose      TEXT,
  /** 'begleitet' | 'intensiv' | 'konsultation' — oder frei zusammengestellt. */
  variante      TEXT,
  /** Die Positionen, wie sie auf dem Blatt stehen. */
  positionen    JSONB NOT NULL DEFAULT '[]'::jsonb,
  summe         NUMERIC(10,2) NOT NULL DEFAULT 0,

  gueltig_bis   DATE,
  hinweis       TEXT,

  /** Praxisdaten zum Zeitpunkt der Ausstellung — damit er reproduzierbar bleibt. */
  praxis_name       TEXT,
  praxis_adresse    TEXT,
  praxis_steuernr   TEXT,

  versendet_at  TIMESTAMPTZ,
  storniert_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kv_neueste ON kostenvoranschlaege (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kv_patient ON kostenvoranschlaege (patient_id)
  WHERE patient_id IS NOT NULL;

ALTER TABLE kostenvoranschlaege ENABLE ROW LEVEL SECURITY;

-- Nur die Praxis. Geschrieben wird ausschliesslich ueber den Service-Key.
DROP POLICY IF EXISTS kv_select_praxis ON kostenvoranschlaege;
CREATE POLICY kv_select_praxis ON kostenvoranschlaege
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
       WHERE user_profiles.id = auth.uid()
         AND user_profiles.role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );

-- ── Eigener Nummernkreis ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_kv_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  jahr     TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  naechste INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(nummer, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO naechste
  FROM kostenvoranschlaege
  WHERE nummer LIKE 'KV-' || jahr || '-%';

  RETURN 'KV-' || jahr || '-' || LPAD(naechste::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_kv_number() TO authenticated;

COMMENT ON TABLE kostenvoranschlaege IS
  'PROJ-29: Kostenvoranschlaege fuer die Einreichung bei Versicherungen. Kein Umsatz, eigener Nummernkreis, kein Patientenkonto noetig.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select generate_kv_number();   -- muss 'KV-2026-0001' liefern
--   select count(*) from kostenvoranschlaege;
