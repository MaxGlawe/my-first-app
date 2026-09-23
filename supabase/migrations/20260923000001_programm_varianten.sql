-- ============================================================
-- PROJ-26: Zwei Programm-Varianten
--
--   begleitet — 299 €, ohne feste Video-Sitzungen. Einziger fester
--               Videotermin ist die Konsultation; bei Verschlechterung
--               kommt kurzfristig eine Sitzung dazu.
--   intensiv  — 499 €, zusätzlich acht gestaffelte Video-Sitzungen.
--               Das bisherige Programm.
--
-- Die Variante muss am Vertrag stehen und nicht nur im Preis: Rechnung,
-- Willkommensmail und die App müssen wissen, ob Sitzungen zugesagt sind.
-- Aus dem Betrag lässt sich das nicht ableiten — ein Preis kann sich
-- ändern, eine zugesicherte Leistung nicht rückwirkend.
--
-- Idempotent.
-- ============================================================

ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS programm_variante TEXT;

-- Bestehende bezahlte Programm-Verträge sind sämtlich die alte, einzige
-- Variante — also 'intensiv'. Ohne diese Zuordnung stünden sie ohne
-- Variante da, und die Rechnung wüsste nicht, was zugesagt wurde.
UPDATE treatment_contracts
   SET programm_variante = 'intensiv'
 WHERE contract_type = 'praxis_os_programm'
   AND programm_variante IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'treatment_contracts_programm_variante_check'
  ) THEN
    ALTER TABLE treatment_contracts
      ADD CONSTRAINT treatment_contracts_programm_variante_check
      CHECK (programm_variante IS NULL OR programm_variante IN ('begleitet', 'intensiv'));
  END IF;
END $$;

COMMENT ON COLUMN treatment_contracts.programm_variante IS
  'Gewaehlte Programm-Variante: begleitet (ohne feste Video-Sitzungen) oder intensiv (mit acht). NULL bei allen anderen Vertragstypen.';

-- Auswertung: welche Variante wird wie oft abgeschlossen?
CREATE INDEX IF NOT EXISTS idx_contracts_variante
  ON treatment_contracts (programm_variante, paid_at DESC)
  WHERE contract_type = 'praxis_os_programm';
