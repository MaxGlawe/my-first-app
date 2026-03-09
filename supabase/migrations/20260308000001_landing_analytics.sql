-- Landing Page Analytics: anonymous page views and conversion tracking

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT NOT NULL DEFAULT 'unknown',
  session_id TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversion events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- Anonymous inserts allowed (API validates input)
CREATE POLICY page_views_insert_anon ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY conversion_events_insert_anon ON conversion_events FOR INSERT WITH CHECK (true);

-- Only admins can read analytics data
CREATE POLICY page_views_select_admin ON page_views FOR SELECT
  USING (get_my_role() = 'admin');
CREATE POLICY conversion_events_select_admin ON conversion_events FOR SELECT
  USING (get_my_role() = 'admin');

-- Indexes for time-range and aggregation queries
CREATE INDEX idx_pv_created_at ON page_views(created_at DESC);
CREATE INDEX idx_pv_session_id ON page_views(session_id);
CREATE INDEX idx_pv_path ON page_views(path);
CREATE INDEX idx_ce_created_at ON conversion_events(created_at DESC);
CREATE INDEX idx_ce_session_id ON conversion_events(session_id);
CREATE INDEX idx_ce_event_type ON conversion_events(event_type);
