-- ============================================================
-- Masterclass → 3 Monate PraxisOS-Begleitung
--
-- Der Kauf der Masterclass (399 €, Einmalzahlung) schaltet 92 Tage
-- App-Begleitung frei (Chat mit dem Therapeuten + Übungsprogramm).
--
-- Drei Bausteine:
--   1. stripe_webhook_events — Idempotenz-Register (fehlte bisher komplett!)
--   2. app_access_grants     — zeitlich begrenzter App-Zugang, getrennt vom Abo
--   3. products.app_zugang_tage + Lead-Attribution
--
-- WARUM eine eigene Grant-Tabelle statt patient_subscriptions:
--   patient_subscriptions hat UNIQUE(patient_id) und wird von Stripe bei jeder
--   Abrechnung überschrieben (current_period_end). Hätte ein Bestandsabonnent
--   die 92 Tage dort angehängt bekommen, wären sie beim nächsten Monatswechsel
--   still verschwunden. Grants sind davon entkoppelt und stapelbar.
--
-- KEIN Auto-Abo: Grants laufen aus, sie verlängern sich nie von selbst.
-- Der Masterclass-Kurszugang (content_entitlements) bleibt lebenslang —
-- nur die Begleitung endet.
-- ============================================================

-- ── 1. Stripe-Idempotenz ──────────────────────────────────────────────────
-- Der Stripe-Webhook hatte KEINE Event-Dedup. Stripe wiederholt bei jedem 500
-- (die Route gibt an 5 Stellen bewusst 500 zurück) und liefert Events im
-- Zweifel mehrfach aus. Ohne Register würde jeder Retry erneut 92 Tage Zugang
-- gewähren. Gleiche Lehre wie beim Schmerzcheck-Doppelversand.
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id     TEXT PRIMARY KEY,        -- Stripe evt_...
  event_type   TEXT NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ              -- NULL = läuft noch / vorheriger Versuch schlug fehl
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_received ON stripe_webhook_events (received_at DESC);

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- Kein Policy-Grant: nur die Service-Role (bypasst RLS) schreibt/liest hier.

-- ── 2. App-Zugangs-Grants ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_access_grants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  plan       TEXT NOT NULL DEFAULT 'masterclass_begleitung',
  starts_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Herkunft + Idempotenz: eine Stripe-Session kann NIE zwei Grants erzeugen.
  -- Das ist die harte Garantie gegen Mehrfach-Freischaltung bei Webhook-Retries
  -- (unabhängig vom Event-Register oben).
  source            TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,

  revoked_at TIMESTAMPTZ,               -- gesetzt bei Refund/Widerruf
  revoke_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_grant_period CHECK (expires_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_grants_user   ON app_access_grants (user_id);
-- Deckt die Hot-Query ab: "hat dieser User gerade einen gültigen Grant?"
CREATE INDEX IF NOT EXISTS idx_grants_active ON app_access_grants (user_id, expires_at DESC)
  WHERE revoked_at IS NULL;

ALTER TABLE app_access_grants ENABLE ROW LEVEL SECURITY;

-- User darf den eigenen Grant sehen (Enddatum in der App anzeigen)
CREATE POLICY "grants_select_own" ON app_access_grants
  FOR SELECT USING (user_id = auth.uid());

-- Staff darf alle sehen (Admin-Liste "Aktive Begleitungs-Patienten")
CREATE POLICY "grants_select_staff" ON app_access_grants
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));

-- Schreiben ausschließlich über die Service-Role (Stripe-Webhook).
CREATE POLICY "grants_no_client_write" ON app_access_grants
  FOR ALL USING (false) WITH CHECK (false);

-- ── 3. Produkt: wie viele Tage App-Zugang gibt dieser Kauf? ───────────────
-- NULL / 0 = kein App-Zugang (Normalfall für Kurse, Decks, Challenges).
ALTER TABLE products ADD COLUMN IF NOT EXISTS app_zugang_tage INTEGER;

COMMENT ON COLUMN products.app_zugang_tage IS
  'Tage App-Begleitung, die dieser Kauf freischaltet (NULL/0 = keine). Masterclass = 92.';

UPDATE products
   SET app_zugang_tage = 92
 WHERE slug = 'chronischer-kreuzschmerz'
   AND produkt_typ = 'masterclass';

-- ── 4. Lead-Attribution: welcher Schmerzcheck-Lead hat gekauft? ───────────
-- Bisher war die Konversion unsichtbar (booked_at blieb bei 0 von 521 Leads,
-- weil das externe Buchungs-Widget nie zurückmeldet). Ein Stripe-Kauf läuft
-- durch unseren eigenen Webhook → die Attribution ist endlich messbar.
ALTER TABLE schmerzcheck_leads ADD COLUMN IF NOT EXISTS converted_at       TIMESTAMPTZ;
ALTER TABLE schmerzcheck_leads ADD COLUMN IF NOT EXISTS conversion_source  TEXT;
ALTER TABLE schmerzcheck_leads ADD COLUMN IF NOT EXISTS conversion_value   NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_sc_leads_converted ON schmerzcheck_leads (converted_at)
  WHERE converted_at IS NOT NULL;
