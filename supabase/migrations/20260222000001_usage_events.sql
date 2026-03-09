-- ============================================================
-- V2 Phase 0: Usage Analytics / Nutzungsstatistiken
-- Tracks feature usage for V1 testing insights
-- ============================================================

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "usage_events_insert_own" ON usage_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can read all events
CREATE POLICY "usage_events_select_admin" ON usage_events
  FOR SELECT USING (get_my_role() = 'admin');

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_ue_event_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ue_created_at ON usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ue_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ue_type_date ON usage_events(event_type, created_at DESC);
