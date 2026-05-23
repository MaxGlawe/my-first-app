-- PROJ-24: Karten-Decks als verkäuflicher Produkttyp + erstes Deck „Vielfahrer-Reset".
-- Decks laufen über die bestehende Shop-Mechanik (products / product_contents /
-- content_entitlements / Stripe-Checkout). Neuer produkt_typ 'deck' und neuer
-- content_type 'card_deck'. Inhalt eines Decks = es selbst (content_id = Produkt-id).
-- Idempotent.

-- 1. produkt_typ 'deck' erlauben ────────────────────────────────────────────
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_produkt_typ_check;
ALTER TABLE products ADD CONSTRAINT products_produkt_typ_check
  CHECK (produkt_typ IN ('challenge', 'programm', 'masterclass', 'deck'));

-- 2. content_type 'card_deck' erlauben (beide Tabellen) ──────────────────────
ALTER TABLE product_contents DROP CONSTRAINT IF EXISTS product_contents_content_type_check;
ALTER TABLE product_contents ADD CONSTRAINT product_contents_content_type_check
  CHECK (content_type IN ('learning_path', 'card_deck'));

ALTER TABLE content_entitlements DROP CONSTRAINT IF EXISTS content_entitlements_content_type_check;
ALTER TABLE content_entitlements ADD CONSTRAINT content_entitlements_content_type_check
  CHECK (content_type IN ('course', 'learning_path', 'card_deck'));

-- 3. Deck-Produkt „Vielfahrer-Reset" anlegen ────────────────────────────────
INSERT INTO products (
  slug, titel, kurzbeschreibung, beschreibung, hero_bild,
  produkt_typ, anliegen, preis, waehrung, abo_inkludiert, status, sortierung
)
VALUES (
  'vielfahrer-reset',
  'Vielfahrer-Reset',
  'Kurze Bewegungsimpulse für Hüfte, LWS & HWS — fürs geparkte Auto. 12 Karten + Sicherheitskarte.',
  'Das digitale Karten-Deck für alle, die viel sitzen und fahren: LKW-Fahrer, Taxifahrer, Außendienst & Pendler. 12 kurze Bewegungs-Karten (je ~30–60 Sekunden) für Hüfte, unteren Rücken und Nacken — gemacht für die Pause am Rastplatz. Inklusive Sicherheitskarte. Ruhig bleiben, sanft bewegen.',
  '/images/decks/vielfahrer-reset/shop-1.png',
  'deck',
  ARRAY['ruecken', 'beweglichkeit'],
  9.99,
  'eur',
  false,
  'aktiv',
  100
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Deck-Inhalt verknüpfen (content_id = Produkt-id) ───────────────────────
INSERT INTO product_contents (product_id, content_type, content_id, sort_order)
SELECT id, 'card_deck', id, 0 FROM products WHERE slug = 'vielfahrer-reset'
ON CONFLICT (product_id, content_type, content_id) DO NOTHING;
