-- ============================================================
-- PROJ-18: push_subscriptions auf Auth-User verallgemeinern
--
-- Bisher hing jede Push-Subscription an patients(id). BGF-Mitarbeiter
-- haben KEINEN patients-Datensatz und konnten sich daher gar nicht für
-- Push registrieren. Wir ergänzen eine user_id-Spalte, sodass eine
-- Subscription entweder einem klinischen Patienten (patient_id) ODER
-- einem beliebigen Auth-User (user_id) gehört — genau eines von beiden.
--
-- Bestehende Zeilen (alle mit patient_id gesetzt, user_id NULL) erfüllen
-- die neue CHECK-Bedingung → keine Datenmigration nötig.
-- ============================================================

-- 1. Neue Besitzer-Spalte + patient_id optional machen
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE push_subscriptions
  ALTER COLUMN patient_id DROP NOT NULL;

-- 2. Genau ein Besitzer: patient_id XOR user_id
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_owner_chk;
ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_owner_chk CHECK (
    (patient_id IS NOT NULL AND user_id IS NULL)
    OR (patient_id IS NULL AND user_id IS NOT NULL)
  );

-- 3. Index für Cron-Lookups nach user_id
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions (user_id);

-- 4. RLS-Policies für user_id-basierte Zeilen
--    (die bestehenden patient_*-Policies bleiben unverändert bestehen;
--     Server-seitiger Versand nutzt weiterhin den service-role-Client.)
DROP POLICY IF EXISTS "user_select_own_push_subscriptions" ON push_subscriptions;
CREATE POLICY "user_select_own_push_subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_own_push_subscriptions" ON push_subscriptions;
CREATE POLICY "user_insert_own_push_subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_update_own_push_subscriptions" ON push_subscriptions;
CREATE POLICY "user_update_own_push_subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_delete_own_push_subscriptions" ON push_subscriptions;
CREATE POLICY "user_delete_own_push_subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = auth.uid());
