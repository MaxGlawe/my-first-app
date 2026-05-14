-- ============================================================
-- PROJ-19: Externe Käufer-Accounts
--
-- Fügt den neuen Rollen-Wert "externer_kaeufer" zum System hinzu.
-- Käufer-Stammdaten (Name, E-Mail) liegen — wie bei allen anderen
-- Rollen — direkt in user_profiles. KEINE eigene buyer_profiles-Tabelle:
-- user_profiles ist bereits die universelle Profil-Tabelle (id, first_name,
-- last_name, email, role, status). Eine zweite Tabelle wäre reine Redundanz.
--
-- Externe Käufer bekommen KEINEN patients-Datensatz → klinische Daten sind
-- für sie strukturell unerreichbar (alle klinischen RLS-Policies hängen am
-- patients-Datensatz).
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- 1. ROLLE "externer_kaeufer" ZUM CHECK-CONSTRAINT HINZUFÜGEN
-- ══════════════════════════════════════════════════════════════

-- Den bestehenden Rollen-Check droppen und mit der zusätzlichen Rolle neu
-- anlegen. DROP IF EXISTS + ADD ist idempotent (mehrfach ausführbar).
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN (
    'admin',
    'heilpraktiker',
    'physiotherapeut',
    'patient',
    'praeventionstrainer',
    'personal_trainer',
    'praxismanagement',
    'externer_kaeufer'
  ));


-- ══════════════════════════════════════════════════════════════
-- 2. ENTITLEMENTS — KAUF-BERECHTIGUNGEN
--
-- Hängen am Login (user_id), NICHT am Profiltyp. Damit bleiben sie beim
-- Upgrade externer Käufer → Patient automatisch erhalten.
-- Die konkrete Kauf-/Produkt-Logik kommt in PROJ-20 — hier wird nur das
-- Fundament (Tabelle + RLS) gelegt, damit das Käufer-Dashboard schon eine
-- (zunächst leere) Inhalts-Liste laden kann.
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_entitlements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'learning_path')),
  content_id   UUID NOT NULL,           -- FK zu courses.id / learning_paths.id (nicht hart erzwungen, da flexibel)
  source       TEXT NOT NULL CHECK (source IN ('purchase', 'subscription', 'gift', 'admin_grant')),
  valid_from   TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until  TIMESTAMPTZ,             -- NULL = lebenslang (Einzel-Kauf)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_entitlement UNIQUE (user_id, content_type, content_id, source)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id
  ON content_entitlements(user_id);

CREATE INDEX IF NOT EXISTS idx_entitlements_content
  ON content_entitlements(content_type, content_id);

ALTER TABLE content_entitlements ENABLE ROW LEVEL SECURITY;

-- Policies sind nicht idempotent — vor dem Anlegen droppen, damit die
-- Migration gefahrlos mehrfach ausgeführt werden kann.
DROP POLICY IF EXISTS "user sees own entitlements" ON content_entitlements;
DROP POLICY IF EXISTS "admin sees all entitlements" ON content_entitlements;
DROP POLICY IF EXISTS "admin manages entitlements" ON content_entitlements;

-- User sieht eigene Entitlements
CREATE POLICY "user sees own entitlements"
  ON content_entitlements FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin sieht alle Entitlements
CREATE POLICY "admin sees all entitlements"
  ON content_entitlements FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin verwaltet alle Entitlements
CREATE POLICY "admin manages entitlements"
  ON content_entitlements FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Hinweis: Käufe selbst (INSERT) laufen über die API mit Service-Role
-- (bypassed RLS) — eine INSERT-Policy für "authenticated" ist daher nicht nötig.
