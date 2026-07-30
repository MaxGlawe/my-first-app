-- ============================================================
-- BGF: Umstellung Pro-Kopf-Tarife → EIN Produkt, Paketpreis nach Teamgröße
--
-- Vorher: contract_type basic/pro/enterprise mit preis_pro_ma_monat (29/39/59 €),
--         Gesamtpreis = lizenzen × preis_pro_ma_monat.
-- Nachher: Vollumfang für jeden Mitarbeitenden, fester Monatspreis je Staffel
--         (390 € bis 10 MA, 590 € bis 20, 890 € bis 35, 1.190 € bis 50 MA,
--          darüber individuell) — Quelle: src/lib/bgf-pakete.ts
--
-- Bestandsdaten bleiben wirtschaftlich unverändert: monatlicher_gesamtpreis /
-- gesamtbetrag werden NICHT angefasst. preis_pro_ma_monat wird nur nullable
-- gemacht (Altverträge behalten ihren Wert, neue schreiben NULL).
--
-- Idempotent — kann mehrfach laufen.
-- ============================================================

-- ── 1. Organisationen: Paketgröße + Monatspreis ─────────────────────

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS vertrag_paket_max_ma INTEGER,
  ADD COLUMN IF NOT EXISTS vertrag_monatspreis DECIMAL(10,2);

COMMENT ON COLUMN organizations.vertrag_paket_max_ma IS
  'Obergrenze der Preisstaffel in Mitarbeitenden (10/20/35/50; NULL = individuell)';
COMMENT ON COLUMN organizations.vertrag_monatspreis IS
  'Fester Monatspreis netto in Euro (ersetzt vertrag_preis_pro_ma_monat)';

-- Backfill: bisherige Monatssumme erhalten (lizenzen × Pro-Kopf-Preis),
-- Staffel aus der Lizenzanzahl ableiten.
UPDATE organizations
SET vertrag_monatspreis = ROUND(COALESCE(vertrag_lizenzen, 0) * COALESCE(vertrag_preis_pro_ma_monat, 0), 2)
WHERE vertrag_monatspreis IS NULL;

-- Staffel nur zuordnen, wenn der erhaltene Monatsbetrag exakt dem Listenpreis
-- dieser Staffel entspricht. Sonst bleibt es ein individuell bepreister
-- Altvertrag (NULL) — ein falsches Paket-Label wäre schlimmer als keins.
UPDATE organizations
SET vertrag_paket_max_ma = CASE
    WHEN vertrag_monatspreis = 390  AND COALESCE(vertrag_lizenzen, 0) <= 10 THEN 10
    WHEN vertrag_monatspreis = 590  AND vertrag_lizenzen <= 20 THEN 20
    WHEN vertrag_monatspreis = 890  AND vertrag_lizenzen <= 35 THEN 35
    WHEN vertrag_monatspreis = 1190 AND vertrag_lizenzen <= 50 THEN 50
    ELSE NULL
  END
WHERE vertrag_paket_max_ma IS NULL;

-- Pro-Kopf-Preis ist nur noch Altlast: Default weg, nullable.
ALTER TABLE organizations ALTER COLUMN vertrag_preis_pro_ma_monat DROP DEFAULT;
ALTER TABLE organizations ALTER COLUMN vertrag_preis_pro_ma_monat DROP NOT NULL;

-- vertrag_tier steuert seit dem Wegfall des Feature-Gatings keine Funktionen
-- mehr (nur noch Vertrags-Metadatum). Neue Orgs schreiben 'voll'.
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_vertrag_tier_check;
ALTER TABLE organizations
  ADD CONSTRAINT organizations_vertrag_tier_check
  CHECK (vertrag_tier IN ('basic', 'pro', 'enterprise', 'voll'));
ALTER TABLE organizations ALTER COLUMN vertrag_tier SET DEFAULT 'voll';

-- ── 2. Verträge: Paketfelder ────────────────────────────────────────

ALTER TABLE bgf_contracts
  ADD COLUMN IF NOT EXISTS paket_max_ma INTEGER,
  ADD COLUMN IF NOT EXISTS paket_label TEXT;

COMMENT ON COLUMN bgf_contracts.paket_max_ma IS
  'Obergrenze der Preisstaffel in Mitarbeitenden (NULL = individuell verhandelt)';
COMMENT ON COLUMN bgf_contracts.paket_label IS
  'Paket-Bezeichnung für Vertrag/Rechnung, z. B. „bis 20 Mitarbeitende“';
COMMENT ON COLUMN bgf_contracts.monatlicher_gesamtpreis IS
  'Fester Monatspreis netto — seit 30.07.2026 der Paketpreis, nicht mehr lizenzen × Pro-Kopf';
COMMENT ON COLUMN bgf_contracts.preis_pro_ma_monat IS
  'ALTLAST: Pro-Kopf-Preis der Tarif-Ära. Neue Verträge schreiben NULL.';

-- KEIN Backfill für Altverträge: Ein Vertrag mit Pro-Kopf-Preis ist kein
-- Paketvertrag. Ein abgeleitetes Label („bis 50 Mitarbeitende") würde einem
-- Vertrag über 50 × 39 € = 1.950 € ein Paket zuschreiben, das laut Liste
-- 1.190 € kostet — und im PDF dem gespeicherten Vertragstext widersprechen.
-- Altverträge behalten deshalb paket_max_ma/paket_label = NULL.
UPDATE bgf_contracts
SET paket_max_ma = NULL, paket_label = NULL
WHERE preis_pro_ma_monat IS NOT NULL;

ALTER TABLE bgf_contracts ALTER COLUMN preis_pro_ma_monat DROP NOT NULL;

-- contract_type: 'voll' als neuer Wert, Alt-Werte bleiben für Bestandsverträge
-- gültig (sonst wären historische PDFs nicht mehr reproduzierbar).
ALTER TABLE bgf_contracts DROP CONSTRAINT IF EXISTS bgf_contracts_contract_type_check;
ALTER TABLE bgf_contracts
  ADD CONSTRAINT bgf_contracts_contract_type_check
  CHECK (contract_type IN ('basic', 'pro', 'enterprise', 'voll'));

-- ── 3. Rechnungen: Paketfeld + Pro-Kopf optional ────────────────────

ALTER TABLE bgf_invoices
  ADD COLUMN IF NOT EXISTS paket_label TEXT;

COMMENT ON COLUMN bgf_invoices.paket_label IS
  'Paket-Bezeichnung der Rechnungsposition; NULL bei Altrechnungen (Pro-Kopf-Modell)';
COMMENT ON COLUMN bgf_invoices.preis_pro_ma IS
  'ALTLAST: Pro-Kopf-Preis. NULL bei Rechnungen ab dem Paketmodell.';

ALTER TABLE bgf_invoices ALTER COLUMN preis_pro_ma DROP NOT NULL;
