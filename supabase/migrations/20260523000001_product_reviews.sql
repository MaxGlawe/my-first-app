-- ============================================================
-- Produkt-Bewertungen (Shop)
--
-- Bewertungen (Rating 1–5 + optionaler Titel + Text) für Shop-Produkte.
-- Regeln (vom Owner festgelegt):
--   1. NUR verifizierte Käufer dürfen bewerten — die Käufer-Prüfung
--      (hasContentAccess auf einen product_content) macht die API mit
--      Service-Role. RLS erzwingt zusätzlich, dass nur die EIGENE user_id
--      eingetragen werden darf.
--   2. Bewertungen erscheinen ERST nach Freigabe durch einen Admin
--      (Moderation): status startet auf 'pending', öffentlich sichtbar
--      wird nur 'approved'.
--
-- user_id referenziert auth.users(id) — konsistent mit content_entitlements
-- (Berechtigungen hängen am Login, nicht am Profiltyp).
--
-- get_my_role() (definiert in 20260217000002_patients.sql) liefert die Rolle
-- des eingeloggten Users — wird in den RLS-Policies für die Admin-Prüfung
-- genutzt.
-- ============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  titel       TEXT,                                  -- optional, kurz
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 2000),
  autor_name  TEXT,                                  -- Anzeigename (user_profiles.first_name beim Insert gesetzt)
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Eine Bewertung pro Nutzer & Produkt
  CONSTRAINT uq_product_review UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_status
  ON product_reviews (product_id, status);

CREATE INDEX IF NOT EXISTS idx_product_reviews_status
  ON product_reviews (status);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policies sind nicht idempotent — vor dem Anlegen droppen, damit die
-- Migration gefahrlos mehrfach ausgeführt werden kann.
DROP POLICY IF EXISTS "product_reviews_select_approved"  ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_select_own"       ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_select_admin"     ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_insert_own"       ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_update_own"       ON product_reviews;
DROP POLICY IF EXISTS "product_reviews_admin_manage"     ON product_reviews;

-- ── SELECT ─────────────────────────────────────────────────
-- Jeder (auch anonym) darf freigegebene Bewertungen lesen.
CREATE POLICY "product_reviews_select_approved"
  ON product_reviews FOR SELECT
  USING (status = 'approved');

-- Eingeloggte Nutzer dürfen ihre eigene Bewertung lesen (jeder Status,
-- z. B. solange sie noch 'pending' ist).
CREATE POLICY "product_reviews_select_own"
  ON product_reviews FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin sieht alles (für die Moderation).
CREATE POLICY "product_reviews_select_admin"
  ON product_reviews FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

-- ── INSERT ─────────────────────────────────────────────────
-- Eingeloggte dürfen nur ihre EIGENE Bewertung einfügen. status MUSS
-- 'pending' sein (niemand setzt sich selbst auf 'approved'). Die
-- Käufer-Verifizierung erfolgt zusätzlich in der API (Service-Role).
CREATE POLICY "product_reviews_insert_own"
  ON product_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- ── UPDATE ─────────────────────────────────────────────────
-- Nutzer dürfen ihre eigene Bewertung bearbeiten (Rating/Titel/Text),
-- aber den Status NIE selbst auf 'approved'/'rejected' setzen — er muss
-- 'pending' bleiben (Freigabe ist Admin-Sache → erneute Moderation).
CREATE POLICY "product_reviews_update_own"
  ON product_reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admin verwaltet alles (Moderation: approve/reject, löschen).
CREATE POLICY "product_reviews_admin_manage"
  ON product_reviews FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
