-- ============================================================
-- PROJ-26: Praxis OS als 90-Tage-Programm
--
-- Das Angebot am Ende der Videokonsultation ist ein Behandlungsvertrag —
-- also KEINE neue Tabelle, sondern ein neuer `contract_type` auf
-- treatment_contracts. Damit erben wir Vertragsnummer, Signatur-Token mit
-- Ablauf, Widerrufsfrist, PDF-Snapshot und die 10-Jahres-Aufbewahrung.
--
-- Anders als bei den bestehenden Vertragstypen wird hier nicht per
-- Unterschrift angenommen, sondern per ZAHLUNG (Stripe, Karte/Klarna).
-- Dafür die drei Zahlungsspalten unten.
--
-- Idempotent: läuft mehrfach ohne Fehler.
-- ============================================================

-- ── 1. Neuer Vertragstyp ──────────────────────────────────────────────────
-- Die CHECK-Constraint wurde inline angelegt → Postgres-Standardname.
ALTER TABLE treatment_contracts
  DROP CONSTRAINT IF EXISTS treatment_contracts_contract_type_check;

ALTER TABLE treatment_contracts
  ADD CONSTRAINT treatment_contracts_contract_type_check
  CHECK (contract_type IN (
    'einzelsitzung',
    'mini_reha_post_op',
    'chronik_programm',
    'praxis_os_programm'
  ));

-- ── 2. Anrechnung der Videokonsultation ───────────────────────────────────
-- `gesamtpreis` bleibt der Vertragswert (447 €). `bereits_beglichen` ist der
-- im Buchungskalender bezahlte Teil (69 €). Zu zahlen ist die Differenz.
-- Beides steht so auf dem Vertrag und später auf der Rechnung — die
-- Anrechnung ist damit eine Zeile, keine Rabattlogik.
ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS bereits_beglichen NUMERIC(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN treatment_contracts.bereits_beglichen IS
  'Bereits bezahlter Anteil am Gesamtpreis (z.B. 69 EUR Videokonsultation). Zu zahlen = gesamtpreis - bereits_beglichen.';

-- ── 3. Dauer der Betreuung in Tagen ───────────────────────────────────────
-- Steuert die Länge des app_access_grants nach der Zahlung. NULL = kein
-- App-Zugang (alle Bestandsvertragstypen).
ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS programm_tage INTEGER;

COMMENT ON COLUMN treatment_contracts.programm_tage IS
  'Tage Betreuung, die die Zahlung freischaltet (Praxis-OS-Programm = 90). NULL = keine.';

-- ── 4. Zahlung statt Unterschrift ─────────────────────────────────────────
-- UNIQUE auf der Session ist die harte Idempotenz-Sperre: ein Webhook-Retry
-- kann NIE zweimal denselben Vertrag bezahlen oder zweimal Zugang gewähren.
-- Gleiche Lehre wie bei app_access_grants.
ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'treatment_contracts_stripe_session_key'
  ) THEN
    ALTER TABLE treatment_contracts
      ADD CONSTRAINT treatment_contracts_stripe_session_key UNIQUE (stripe_session_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contracts_paid_at
  ON treatment_contracts (paid_at DESC) WHERE paid_at IS NOT NULL;

-- ── 5. Offene Programm-Angebote schnell finden ────────────────────────────
-- Für die Patientenansicht im OS ("liegt ein Angebot offen?").
CREATE INDEX IF NOT EXISTS idx_contracts_programm_offen
  ON treatment_contracts (patient_id, status)
  WHERE contract_type = 'praxis_os_programm';
