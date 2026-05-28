-- Masterclass „Chronischer Kreuzschmerz" als verkäufliches Premium-Produkt.
-- Reiner Einmalkauf (399 €), kein Abo-Bezug. Läuft über die bestehende
-- Shop-Mechanik (products / product_contents / content_entitlements /
-- Stripe-Checkout / Webhook-Entitlement). Neuer content_type 'masterclass';
-- der Inhalt der Masterclass ist eine FESTE Content-ID, sodass das Gating
-- ohne DB-Lookup auskommt (Konstante MASTERCLASS_CONTENT_ID im Code).
-- Idempotent.

-- 0. Regulärer „Streichpreis" (allgemein nutzbar, nullable) ───────────────────
-- Wird auf der Verkaufsseite durchgestrichen über dem effektiven Preis gezeigt
-- (z. B. Launch-Aktion). Gilt produktübergreifend, nicht masterclass-spezifisch.
ALTER TABLE products ADD COLUMN IF NOT EXISTS preis_regulaer NUMERIC(10,2);

-- 1. content_type 'masterclass' erlauben (beide Tabellen) ────────────────────
ALTER TABLE product_contents DROP CONSTRAINT IF EXISTS product_contents_content_type_check;
ALTER TABLE product_contents ADD CONSTRAINT product_contents_content_type_check
  CHECK (content_type IN ('learning_path', 'card_deck', 'masterclass'));

ALTER TABLE content_entitlements DROP CONSTRAINT IF EXISTS content_entitlements_content_type_check;
ALTER TABLE content_entitlements ADD CONSTRAINT content_entitlements_content_type_check
  CHECK (content_type IN ('course', 'learning_path', 'card_deck', 'masterclass'));

-- 2. Masterclass-Produkt anlegen (Einmalkauf 399 €) ──────────────────────────
INSERT INTO products (
  slug, titel, kurzbeschreibung, beschreibung, hero_bild,
  produkt_typ, anliegen, preis, preis_regulaer, waehrung, abo_inkludiert, abo_rabatt_prozent,
  status, sortierung
)
VALUES (
  'chronischer-kreuzschmerz',
  'Masterclass · Chronischer Kreuzschmerz',
  '27 vertonte Lektionen, interaktives Workbook und ein Bonus-Übungskartendeck — dein strukturierter Weg im Umgang mit chronischem Kreuzschmerz, in deinem Tempo.',
  'Die Masterclass Chronischer Kreuzschmerz bringt das, was Patienten in der Praxis bekommen, strukturiert und ortsunabhängig zu dir: 27 vertonte Lektionen in sechs Sektionen (Verstehen, Handeln, Bleiben, Wiederkommen), ein interaktives Workbook zum Mitmachen und Ausdrucken sowie ein Bonus-Übungskartendeck für unterwegs. Schritt für Schritt vom Verstehen deines Schmerzes bis zu den Werkzeugen für deinen Alltag.',
  '/images/masterclass/chronischer-kreuzschmerz/kartendeck/00-cover.png',
  'masterclass',
  ARRAY['ruecken', 'schmerz', 'chronische-beschwerden'],
  399.00,
  499.00,
  'eur',
  false,
  NULL,
  'aktiv',
  5
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Masterclass-Inhalt verknüpfen — feste Content-ID (= MASTERCLASS_CONTENT_ID) ─
INSERT INTO product_contents (product_id, content_type, content_id, sort_order)
SELECT id, 'masterclass', 'b9f3a7c2-1d4e-4a8b-9c6f-2e5d8a0b3c71', 0
FROM products WHERE slug = 'chronischer-kreuzschmerz'
ON CONFLICT (product_id, content_type, content_id) DO NOTHING;
