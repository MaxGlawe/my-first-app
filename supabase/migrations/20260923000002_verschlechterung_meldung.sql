-- ============================================================
-- PROJ-26 Phase 3: Verschlechterung melden
--
-- Beide Programm-Varianten sagen zu: „Bei einer Verschlechterung des
-- Beschwerdebildes wird kurzfristig eine zusätzliche Video-Sitzung
-- vereinbart; Rückmeldung spätestens am nächsten Werktag."
--
-- Bisher gab es dafür keinen Weg ausser dem Chat — und im Chat ist eine
-- Verschlechterung nicht von jeder anderen Nachricht zu unterscheiden. Damit
-- war die einzige Zusage mit einer FRIST die einzige, die niemand nachhalten
-- konnte.
--
-- Diese Tabelle macht die Meldung zu einem eigenen Vorgang mit Frist und
-- Abschluss. Die Ampel des Therapeuten liest daraus.
--
-- Bewusst KEINE Verknüpfung auf den Vertrag als Pflichtfeld: Die Meldung darf
-- nie daran scheitern, dass gerade kein Vertrag zugeordnet werden kann. Wer
-- Schmerzen hat, soll drücken können.
--
-- Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS programm_verschlechterungen (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  contract_id  UUID REFERENCES treatment_contracts(id) ON DELETE SET NULL,
  beschreibung TEXT,
  gemeldet_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Naechster Werktag nach der Meldung. Wird beim Anlegen berechnet und
  -- gespeichert statt jedes Mal neu abgeleitet: Die Frist ist eine Zusage aus
  -- dem Vertrag, sie darf sich nicht nachtraeglich verschieben, wenn sich die
  -- Rechenregel im Code einmal aendert.
  frist_at     TIMESTAMPTZ NOT NULL,
  erledigt_at  TIMESTAMPTZ,
  erledigt_von UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  erledigt_notiz TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Die Ampel fragt ausschliesslich nach offenen Meldungen.
CREATE INDEX IF NOT EXISTS idx_verschlechterung_offen
  ON programm_verschlechterungen (patient_id, gemeldet_at DESC)
  WHERE erledigt_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_verschlechterung_patient
  ON programm_verschlechterungen (patient_id, gemeldet_at DESC);

COMMENT ON TABLE programm_verschlechterungen IS
  'PROJ-26: Patientenmeldung "mir geht es schlechter". Vertraglich zugesagt ist eine Rueckmeldung bis frist_at (naechster Werktag) und eine kurzfristige zusaetzliche Video-Sitzung.';

ALTER TABLE programm_verschlechterungen ENABLE ROW LEVEL SECURITY;

-- Patient: darf die eigenen Meldungen sehen und anlegen, aber nicht abschliessen.
-- Das Abschliessen ist eine Aussage des Behandlers ueber seine eigene
-- Reaktionszeit — die darf der Patient nicht setzen.
DROP POLICY IF EXISTS "Patient liest eigene Meldungen" ON programm_verschlechterungen;
CREATE POLICY "Patient liest eigene Meldungen"
  ON programm_verschlechterungen FOR SELECT
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Patient meldet selbst" ON programm_verschlechterungen;
CREATE POLICY "Patient meldet selbst"
  ON programm_verschlechterungen FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Praxispersonal: voller Zugriff.
DROP POLICY IF EXISTS "Praxis sieht und bearbeitet alle Meldungen" ON programm_verschlechterungen;
CREATE POLICY "Praxis sieht und bearbeitet alle Meldungen"
  ON programm_verschlechterungen FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
       WHERE up.id = auth.uid()
         AND up.role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praxismanagement')
    )
  );
