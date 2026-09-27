-- ============================================================
-- PROJ-29: Monatsrechnungen des Programms
--
-- Jede Rechnung gehoert zu genau einem Programm und zu genau einem seiner
-- drei Monate. Ohne diese Zuordnung wuesste der taegliche Lauf nicht, was er
-- schon erledigt hat — und legte beim naechsten Durchlauf dieselbe Rechnung
-- noch einmal an. Eine doppelte Rechnung ist kein Schoenheitsfehler: Sie hat
-- eine eigene Nummer und steht damit in der Buchhaltung.
--
-- Nullable, weil die allermeisten Rechnungen im System nichts mit dem
-- Programm zu tun haben (Einzelsitzungen, Shop, BGF).
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren (Migrationen laufen nicht im Deploy).
-- ============================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS programm_contract_id UUID REFERENCES treatment_contracts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS programm_monat       SMALLINT CHECK (programm_monat IS NULL OR programm_monat BETWEEN 1 AND 3);

-- Genau eine Rechnung je Programm und Monat — aber beliebig viele Rechnungen
-- ohne Programmbezug.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_programm_monat
  ON invoices (programm_contract_id, programm_monat)
  WHERE programm_contract_id IS NOT NULL;

COMMENT ON COLUMN invoices.programm_contract_id IS
  'PROJ-29: Behandlungsvertrag des 90-Tage-Programms, zu dem diese Monatsrechnung gehoert.';
COMMENT ON COLUMN invoices.programm_monat IS
  'PROJ-29: 1, 2 oder 3 — welcher der drei Programmmonate abgerechnet wird.';

-- ── Merker fuer die Berichts-Erinnerungen ────────────────────────────────
-- Damit die Erinnerung an Verlaufs- und Abschlussbericht genau einmal geht.
ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS bericht_erinnerung_woche6_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bericht_erinnerung_woche12_at TIMESTAMPTZ;

COMMENT ON COLUMN treatment_contracts.bericht_erinnerung_woche6_at IS
  'PROJ-29: Wann an den Verlaufsbericht erinnert wurde. Vor dem Versand gesetzt.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select column_name from information_schema.columns
--    where table_name = 'invoices' and column_name like 'programm%';
-- Muss zwei Zeilen liefern.
