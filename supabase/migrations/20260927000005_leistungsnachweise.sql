-- ============================================================
-- PROJ-29: Eine Rechnung, drei Leistungsnachweise
--
-- Der Behandler: „Ich will eine Bezahlrechnung, die der Klient bezahlt hat,
-- und dann drei Teilrechnungen für das, was bisher passiert ist."
--
-- Beides wird gebraucht, aber nur EINES davon darf Umsatz sein. Traegen die
-- Bezahlrechnung (299 EUR) und die drei Monatsdokumente (zusammen 299 EUR) je
-- eine echte Rechnungsnummer, stehen in den Buechern 598 EUR fuer ein
-- 299-EUR-Programm. Doppelt gezaehlt.
--
-- Entschieden am 27.09.2026:
--   Die Bezahlrechnung ist der Umsatz. Die drei Monatsdokumente sind
--   LEISTUNGSNACHWEISE — eigene Nummernfolge (N-2026-0001), Verweis auf die
--   Rechnung, alle GebueH-Ziffern mit Datum fuer die Versicherung, und
--   ausdruecklich KEINE Zahlungsaufforderung.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS beleg_art TEXT NOT NULL DEFAULT 'rechnung'
    CHECK (beleg_art IN ('rechnung', 'leistungsnachweis')),
  -- Die Rechnung, zu der dieser Nachweis gehoert. Nur bei Nachweisen gesetzt.
  ADD COLUMN IF NOT EXISTS bezug_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

COMMENT ON COLUMN invoices.beleg_art IS
  'PROJ-29: rechnung = zaehlt als Umsatz. leistungsnachweis = Aufstellung zu einer bereits beglichenen Rechnung, NIE Umsatz.';
COMMENT ON COLUMN invoices.bezug_invoice_id IS
  'PROJ-29: Bei einem Leistungsnachweis die Rechnung, die ihn bereits bezahlt hat.';

-- Bestandsrechnungen sind durch das DEFAULT bereits 'rechnung'. Ausdruecklich
-- nochmal, falls die Spalte aus einem frueheren Lauf ohne NOT NULL stammt.
UPDATE invoices SET beleg_art = 'rechnung' WHERE beleg_art IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_bezug
  ON invoices (bezug_invoice_id)
  WHERE bezug_invoice_id IS NOT NULL;

-- Die haeufigste Abfrage der Buchhaltung: alles, was Umsatz ist.
CREATE INDEX IF NOT EXISTS idx_invoices_umsatz
  ON invoices (invoice_date DESC)
  WHERE beleg_art = 'rechnung';

-- ── Eigene Nummernfolge fuer Nachweise ──────────────────────────────────
--
-- Getrennt von den Rechnungsnummern, sonst reisst jeder Nachweis eine Luecke
-- in den Rechnungsnummernkreis — und ein lueckenhafter Nummernkreis ist
-- genau das, was bei einer Pruefung auffaellt.
--
-- Format: N-2026-0001. `generate_invoice_number()` sucht mit
-- `LIKE '2026-%'` und findet diese deshalb nicht; umgekehrt gilt dasselbe.
CREATE OR REPLACE FUNCTION generate_nachweis_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  jahr     TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  naechste INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO naechste
  FROM invoices
  WHERE invoice_number LIKE 'N-' || jahr || '-%';

  RETURN 'N-' || jahr || '-' || LPAD(naechste::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_nachweis_number() TO authenticated;

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select generate_nachweis_number();          -- muss 'N-2026-0001' liefern
--   select beleg_art, count(*) from invoices group by 1;
-- Alle Bestandsrechnungen muessen 'rechnung' sein.
