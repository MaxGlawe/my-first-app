-- ============================================================
-- BGF: Kopfpreis für Nachbesetzungen über der Paketgrenze
--
-- Ergänzt das Paketmodell (20260730000001) um eine Regel für Teams, die
-- während der Laufzeit wachsen: Jeder Kopf über der Paketgrenze wird mit
-- einem festen Betrag berechnet — höchstens bis zum Preis des nächstgrößeren
-- Pakets („Bestpreis"). Kopfpreise je Staffel: 39 / 29,50 / 25,50 / 24 €
-- (Quelle: src/lib/bgf-pakete.ts).
--
-- Idempotent — kann mehrfach laufen.
-- ============================================================

-- ── 1. Vertrag: vereinbarter Kopfpreis ──────────────────────────────

ALTER TABLE bgf_contracts
  ADD COLUMN IF NOT EXISTS zusatz_ma_preis DECIMAL(8,2);

COMMENT ON COLUMN bgf_contracts.zusatz_ma_preis IS
  'Kopfpreis netto je Mitarbeitendem über der Paketgrenze; NULL bei Altverträgen und individuell verhandelten Paketen';

-- Altverträge (Pro-Kopf-Ära) bekommen keinen Zusatzpreis — dort ist ohnehin
-- jeder Kopf einzeln bepreist.

-- ── 2. Rechnung: zweite Position für Nachbesetzungen ────────────────

ALTER TABLE bgf_invoices
  ADD COLUMN IF NOT EXISTS zusatz_ma_anzahl INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS zusatz_ma_preis DECIMAL(8,2);

COMMENT ON COLUMN bgf_invoices.zusatz_ma_anzahl IS
  'Anzahl abgerechneter Mitarbeitender über der Paketgrenze (0 = keine)';
COMMENT ON COLUMN bgf_invoices.zusatz_ma_preis IS
  'Kopfpreis netto je Nachbesetzung in diesem Abrechnungsmonat';
COMMENT ON COLUMN bgf_invoices.gesamtbetrag IS
  'Netto-Gesamtbetrag: Paketpreis + Nachbesetzungen (ohne USt., ohne Mahngebühren)';
