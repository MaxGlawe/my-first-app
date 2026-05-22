-- ============================================================
-- PROJ-23: Schmerzcheck-Funnel — Phase 2 (Assessment)
-- Per-item responses (auto-save) + computed result per lead.
-- Adapted from spec §8 to Supabase. Writes happen via the service role
-- (public, token-gated endpoints); authenticated access is staff read-only.
-- ============================================================

-- ── Responses (one row per answered item) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS schmerzcheck_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES schmerzcheck_leads(id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL,           -- region, duration, onset, pain_current, ...
  value       JSONB NOT NULL,          -- scalar | array | object, depending on item type
  is_red_flag BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (lead_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_sc_responses_lead     ON schmerzcheck_responses (lead_id);
CREATE INDEX IF NOT EXISTS idx_sc_responses_red_flag ON schmerzcheck_responses (is_red_flag) WHERE is_red_flag = true;

-- ── Results (one row per completed check or red-flag stop) ────────────────────
CREATE TABLE IF NOT EXISTS schmerzcheck_results (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id            UUID NOT NULL UNIQUE REFERENCES schmerzcheck_leads(id) ON DELETE CASCADE,

  status             TEXT NOT NULL CHECK (status IN ('completed', 'red_flag_stopped')),

  region             TEXT,
  duration_bucket    TEXT,   -- acute | subacute | chronic
  severity_score     NUMERIC(4,2),
  severity_bucket    TEXT,   -- mild | moderate | high | very_high
  yellow_flag_score  INTEGER,
  psychosocial_risk  TEXT,   -- low | moderate | high
  movement_readiness TEXT,   -- low | moderate | high
  result_category    TEXT,   -- see spec §5.6
  soft_flag          BOOLEAN NOT NULL DEFAULT false,
  red_flag_codes     TEXT[],

  -- Phase 3 (report) fills these
  pdf_url            TEXT,
  pdf_generated_at   TIMESTAMPTZ,

  completed_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sc_results_lead     ON schmerzcheck_results (lead_id);
CREATE INDEX IF NOT EXISTS idx_sc_results_category ON schmerzcheck_results (result_category);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE schmerzcheck_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schmerzcheck_results   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sc_responses_select_staff" ON schmerzcheck_responses
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));

CREATE POLICY "sc_results_select_staff" ON schmerzcheck_results
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));
