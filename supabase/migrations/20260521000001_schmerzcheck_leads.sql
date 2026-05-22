-- ============================================================
-- PROJ-23: Schmerzcheck-Funnel — Phase 1 (Landing + Lead-Capture)
-- Lead capture from paid Meta traffic, Double-Opt-in tracking,
-- and email lifecycle events. Adapted from spec §8 to Supabase.
--
-- Tables (logically namespaced with schmerzcheck_ prefix):
--   schmerzcheck_leads         — one row per lead (unique by email+source)
--   schmerzcheck_email_events  — email lifecycle (sent/opened/clicked/...)
--   schmerzcheck_unsubscribes  — suppression list (checked before any send)
--
-- HWG/DSGVO: leads are kept for analytics + audit; deletion is handled
-- server-side via the service role (right-to-erasure), not via client RLS.
-- ============================================================

-- ── Leads ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schmerzcheck_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 100),
  email      TEXT NOT NULL,
  -- Deterministic hash for suppression checks + Meta CAPI matching (no PII in joins)
  email_hash TEXT GENERATED ALWAYS AS (encode(sha256(lower(email)::bytea), 'hex')) STORED,

  -- Funnel stage (Phase 2 fills the later states)
  status TEXT NOT NULL DEFAULT 'awaiting_check'
    CHECK (status IN ('awaiting_check', 'check_started', 'check_completed', 'red_flag_routed', 'abandoned')),

  -- Double-Opt-in: the T1 email's check link confirms consent on click
  consent_status       TEXT NOT NULL DEFAULT 'pending'
    CHECK (consent_status IN ('pending', 'confirmed')),
  consent_confirmed_at TIMESTAMPTZ,

  source TEXT NOT NULL DEFAULT 'schmerzcheck_landing',

  -- Attribution
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  utm_term     TEXT,
  fbclid       TEXT,
  referrer     TEXT,

  -- Spam / audit
  ip_address INET,
  user_agent TEXT,

  consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (email, source)
);

CREATE INDEX IF NOT EXISTS idx_sc_leads_email      ON schmerzcheck_leads (lower(email));
CREATE INDEX IF NOT EXISTS idx_sc_leads_email_hash ON schmerzcheck_leads (email_hash);
CREATE INDEX IF NOT EXISTS idx_sc_leads_status     ON schmerzcheck_leads (status);
CREATE INDEX IF NOT EXISTS idx_sc_leads_consent    ON schmerzcheck_leads (consent_status);
CREATE INDEX IF NOT EXISTS idx_sc_leads_created    ON schmerzcheck_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sc_leads_utm        ON schmerzcheck_leads (utm_campaign, utm_content);

CREATE TRIGGER trg_sc_leads_updated_at
  BEFORE UPDATE ON schmerzcheck_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Email events ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schmerzcheck_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL REFERENCES schmerzcheck_leads(id) ON DELETE CASCADE,
  email_code TEXT NOT NULL,  -- T1 | T2 | T3 | D1..D4
  event_type TEXT NOT NULL
    CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'confirmed', 'failed')),
  metadata    JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sc_email_events_lead ON schmerzcheck_email_events (lead_id);
CREATE INDEX IF NOT EXISTS idx_sc_email_events_code ON schmerzcheck_email_events (email_code, event_type);

-- ── Unsubscribes (suppression list) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schmerzcheck_unsubscribes (
  email_hash      TEXT PRIMARY KEY,
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason          TEXT
);

-- ============================================================
-- Row Level Security
-- Public writes happen only via the service role (bypasses RLS).
-- Authenticated access is read-only for clinical/admin staff.
-- ============================================================
ALTER TABLE schmerzcheck_leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE schmerzcheck_email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schmerzcheck_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Staff may read leads
CREATE POLICY "sc_leads_select_staff" ON schmerzcheck_leads
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));

-- No client-side deletes (erasure runs via service role)
CREATE POLICY "sc_leads_no_delete" ON schmerzcheck_leads
  FOR DELETE USING (false);

-- Staff may read email events
CREATE POLICY "sc_email_events_select_staff" ON schmerzcheck_email_events
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));

-- Staff may read the suppression list
CREATE POLICY "sc_unsubscribes_select_staff" ON schmerzcheck_unsubscribes
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));
