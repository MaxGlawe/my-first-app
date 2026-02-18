-- ============================================================
-- PROJ-7: Buchungstool-Integration
-- Migration: appointments + webhook_events tables, patients extension
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Extend patients table
--    booking_system_id already exists (added in PROJ-2 migration).
--    Add booking_email for duplicate detection.
-- ----------------------------------------------------------------
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS booking_email TEXT
    CHECK (booking_email IS NULL OR char_length(booking_email) <= 254);

CREATE INDEX IF NOT EXISTS idx_patients_booking_system_id
  ON patients(booking_system_id)
  WHERE booking_system_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patients_booking_email_lower
  ON patients(lower(booking_email))
  WHERE booking_email IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. appointments table
--    Cached appointment data from the booking tool.
--    TTL concept: 24 hours — frontend checks synced_at and shows
--    a stale warning when the data is older than 24 h.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Link to Praxis OS patient
  patient_id                      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- External booking tool identifier (idempotency key)
  booking_system_appointment_id   TEXT NOT NULL,
  -- Appointment details (pushed by booking tool)
  scheduled_at                    TIMESTAMPTZ NOT NULL,
  duration_minutes                INTEGER NOT NULL CHECK (duration_minutes > 0),
  therapist_name                  TEXT,
  service_name                    TEXT,
  status                          TEXT NOT NULL DEFAULT 'scheduled'
                                    CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  -- Cache freshness
  synced_at                       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Uniqueness: one row per booking-system appointment
  CONSTRAINT uq_booking_system_appointment_id UNIQUE (booking_system_appointment_id)
);

-- ----------------------------------------------------------------
-- 2a. Performance indexes — appointments
-- ----------------------------------------------------------------
-- Fetch all appointments for a patient (the primary query)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id
  ON appointments(patient_id);

-- Order by appointment date (common query: upcoming appointments)
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at
  ON appointments(scheduled_at DESC);

-- Status filter (upcoming = scheduled)
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments(status);

-- Composite: patient + date (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_scheduled
  ON appointments(patient_id, scheduled_at DESC);

-- ----------------------------------------------------------------
-- 2b. Row Level Security — appointments
-- ----------------------------------------------------------------
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- SELECT: Therapeut darf Termine seiner eigenen Patienten sehen.
-- Admin darf alle sehen.
DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments
  FOR SELECT
  USING (
    get_my_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
        AND (
          get_my_role() = 'admin'
          OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker') AND p.therapeut_id = auth.uid())
        )
    )
  );

-- INSERT: Nur über Service-Role (Webhook-Endpunkt). Keine direkten Inserts durch Nutzer.
-- Note: The webhook API uses the Supabase service role key → bypasses RLS.
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT
  WITH CHECK (false);  -- Only service role (via API route) may insert

-- UPDATE: Nur Service-Role (Webhook-Endpunkt).
DROP POLICY IF EXISTS "appointments_update" ON appointments;
CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE
  USING (false)
  WITH CHECK (false);  -- Only service role may update

-- DELETE: Nur Service-Role (bei Stornierung wird status auf 'cancelled' gesetzt, kein physisches Delete).
DROP POLICY IF EXISTS "appointments_delete" ON appointments;
CREATE POLICY "appointments_delete" ON appointments
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------
-- 3. webhook_events table
--    Immutable audit log of all incoming webhooks (DSGVO-konform).
--    No UPDATE, no DELETE — append-only.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type        TEXT NOT NULL,
  payload           JSONB NOT NULL DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'success'
                      CHECK (processing_status IN ('success', 'error', 'duplicate')),
  error_message     TEXT
);

-- ----------------------------------------------------------------
-- 3a. Performance indexes — webhook_events
-- ----------------------------------------------------------------
-- Most recent events first (default sort for event log)
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at
  ON webhook_events(received_at DESC);

-- Filter by event type (e.g. show only appointment events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type
  ON webhook_events(event_type);

-- Filter by status (find errors quickly)
CREATE INDEX IF NOT EXISTS idx_webhook_events_status
  ON webhook_events(processing_status);

-- ----------------------------------------------------------------
-- 3b. Row Level Security — webhook_events
--     Audit log: only Admin can SELECT. Nobody (RLS) can INSERT/UPDATE/DELETE.
--     INSERT happens via service role key in the API route.
-- ----------------------------------------------------------------
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Admin-only SELECT
DROP POLICY IF EXISTS "webhook_events_select" ON webhook_events;
CREATE POLICY "webhook_events_select" ON webhook_events
  FOR SELECT
  USING (get_my_role() = 'admin');

-- No INSERT via RLS (service role bypasses)
DROP POLICY IF EXISTS "webhook_events_insert" ON webhook_events;
CREATE POLICY "webhook_events_insert" ON webhook_events
  FOR INSERT
  WITH CHECK (false);

-- No UPDATE ever (immutable audit log)
DROP POLICY IF EXISTS "webhook_events_update" ON webhook_events;
CREATE POLICY "webhook_events_update" ON webhook_events
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- No DELETE ever (immutable audit log)
DROP POLICY IF EXISTS "webhook_events_delete" ON webhook_events;
CREATE POLICY "webhook_events_delete" ON webhook_events
  FOR DELETE
  USING (false);

-- ----------------------------------------------------------------
-- 4. webhook_config table
--    Key-value store for webhook configuration (e.g. secret hash).
--    Only accessible via service role — no direct user access.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- 4a. Row Level Security — webhook_config
--     No direct access via RLS. All reads/writes via service role.
-- ----------------------------------------------------------------
ALTER TABLE webhook_config ENABLE ROW LEVEL SECURITY;

-- Nobody reads via RLS (service role bypasses)
DROP POLICY IF EXISTS "webhook_config_select" ON webhook_config;
CREATE POLICY "webhook_config_select" ON webhook_config
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "webhook_config_insert" ON webhook_config;
CREATE POLICY "webhook_config_insert" ON webhook_config
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "webhook_config_update" ON webhook_config;
CREATE POLICY "webhook_config_update" ON webhook_config
  FOR UPDATE USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "webhook_config_delete" ON webhook_config;
CREATE POLICY "webhook_config_delete" ON webhook_config
  FOR DELETE USING (false);

-- ----------------------------------------------------------------
-- Done.
-- After running this migration, configure Supabase:
--   1. Add BOOKING_WEBHOOK_SECRET to project secrets / environment (initial secret).
--   2. Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars.
--   3. Use /os/admin/integrations → "Neues Secret generieren" for rotation.
--   4. Verify RLS: SELECT relrowsecurity FROM pg_class WHERE relname IN ('appointments', 'webhook_events', 'webhook_config');
--   5. Test webhook: curl -X POST <URL>/api/webhooks/booking with signed payload.
-- ----------------------------------------------------------------
