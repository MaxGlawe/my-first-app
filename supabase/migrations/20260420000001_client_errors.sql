-- Client-side JS error log: populated by POST /api/log/client-error
-- so we can diagnose crashes users report without asking for their browser console.

CREATE TABLE IF NOT EXISTS client_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  source TEXT NOT NULL CHECK (source IN ('error', 'unhandledrejection', 'errorboundary')),
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  user_agent TEXT,
  ip TEXT,
  lineno INTEGER,
  colno INTEGER,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_errors_created_at ON client_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_errors_user_id ON client_errors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_errors_unresolved ON client_errors(created_at DESC) WHERE resolved_at IS NULL;

ALTER TABLE client_errors ENABLE ROW LEVEL SECURITY;

-- Only admins can read. Inserts go through the service client in the API route
-- (bypasses RLS), so no INSERT policy is needed.
CREATE POLICY client_errors_select_admin ON client_errors FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY client_errors_update_admin ON client_errors FOR UPDATE
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');
