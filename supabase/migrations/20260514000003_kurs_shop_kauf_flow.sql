-- ============================================================
-- PROJ-20: Kurs-Shop & Kauf-Flow
--
-- Produktkatalog (products + product_contents) für den In-App-Shop.
-- Käufe landen in content_entitlements (PROJ-19).
-- Abo-Zugriff wird live berechnet — NICHT materialisiert.
-- Migration ist vollständig idempotent.
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 0. Follow-up PROJ-19 QA: Index für case-insensitiven E-Mail-Lookup
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_user_profiles_lower_email
  ON user_profiles(lower(email));

-- ══════════════════════════════════════════════════════════════
-- 1. PRODUCTS — erweiterbare Produktkatalog-Tabelle
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT NOT NULL UNIQUE,
  titel                TEXT NOT NULL,
  kurzbeschreibung     TEXT,
  beschreibung         TEXT,
  hero_bild            TEXT,
  produkt_typ          TEXT NOT NULL DEFAULT 'kurs'
                         CHECK (produkt_typ IN ('kurs', 'programm', 'masterclass')),
  anliegen             TEXT[],                    -- z.B. ARRAY['ruecken','schmerz']
  preis                NUMERIC(10, 2) NOT NULL,
  waehrung             TEXT NOT NULL DEFAULT 'eur',
  abo_inkludiert       BOOLEAN NOT NULL DEFAULT false,
  abo_rabatt_prozent   INTEGER CHECK (abo_rabatt_prozent BETWEEN 0 AND 100),
  status               TEXT NOT NULL DEFAULT 'entwurf'
                         CHECK (status IN ('entwurf', 'aktiv', 'archiviert')),
  sortierung           INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_status_sortierung
  ON products(status, sortierung);

CREATE INDEX IF NOT EXISTS idx_products_slug
  ON products(slug);

-- ══════════════════════════════════════════════════════════════
-- 2. PRODUCT_CONTENTS — verknüpft Produkt mit Inhalten
--    Normales Produkt → 1 Eintrag; Bundle → mehrere Einträge
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS product_contents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('learning_path')),
  content_id   UUID NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uq_product_content UNIQUE (product_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_product_contents_product_id
  ON product_contents(product_id);

CREATE INDEX IF NOT EXISTS idx_product_contents_content
  ON product_contents(content_type, content_id);

-- ══════════════════════════════════════════════════════════════
-- 3. RLS — products
-- ══════════════════════════════════════════════════════════════

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "active products readable by authenticated" ON products;
DROP POLICY IF EXISTS "admin manages products" ON products;

-- Alle eingeloggten User dürfen aktive Produkte lesen
CREATE POLICY "active products readable by authenticated"
  ON products FOR SELECT TO authenticated
  USING (status = 'aktiv');

-- Admin darf alles (inklusive Entwürfe & archivierte)
CREATE POLICY "admin manages products"
  ON products FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ══════════════════════════════════════════════════════════════
-- 4. RLS — product_contents
-- ══════════════════════════════════════════════════════════════

ALTER TABLE product_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product contents readable by authenticated" ON product_contents;
DROP POLICY IF EXISTS "admin manages product contents" ON product_contents;

-- Authenticated User darf product_contents aktiver Produkte lesen
CREATE POLICY "product contents readable by authenticated"
  ON product_contents FOR SELECT TO authenticated
  USING (
    product_id IN (SELECT id FROM products WHERE status = 'aktiv')
  );

-- Admin darf alles
CREATE POLICY "admin manages product contents"
  ON product_contents FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ══════════════════════════════════════════════════════════════
-- 5. SEED — 4 Produkte aus den bestehenden learning_paths
--    Idempotent via ON CONFLICT DO NOTHING
-- ══════════════════════════════════════════════════════════════

INSERT INTO products (slug, titel, kurzbeschreibung, produkt_typ, anliegen, preis, waehrung, abo_inkludiert, status, sortierung)
SELECT
  lp.slug,
  lp.name,
  lp.subtitle,
  'kurs',
  CASE lp.slug
    WHEN 'hydrations-boost'       THEN ARRAY['hydration', 'wohlbefinden']
    WHEN 'ruecken-mobility'       THEN ARRAY['ruecken', 'beweglichkeit']
    WHEN 'schmerz-tagebuch-routine' THEN ARRAY['schmerz', 'chronische-beschwerden']
    WHEN 'faszien-tiefenarbeit'   THEN ARRAY['faszien', 'schmerz', 'beweglichkeit']
    ELSE ARRAY[]::TEXT[]
  END,
  49.00,
  'eur',
  true,
  'aktiv',
  lp.sort_order
FROM learning_paths lp
WHERE lp.slug IN (
  'hydrations-boost',
  'ruecken-mobility',
  'schmerz-tagebuch-routine',
  'faszien-tiefenarbeit'
)
ON CONFLICT (slug) DO NOTHING;

-- product_contents: verknüpft jedes Produkt mit dem zugehörigen learning_path
INSERT INTO product_contents (product_id, content_type, content_id, sort_order)
SELECT
  p.id,
  'learning_path',
  lp.id,
  0
FROM products p
JOIN learning_paths lp ON lp.slug = p.slug
WHERE p.slug IN (
  'hydrations-boost',
  'ruecken-mobility',
  'schmerz-tagebuch-routine',
  'faszien-tiefenarbeit'
)
ON CONFLICT (product_id, content_type, content_id) DO NOTHING;
