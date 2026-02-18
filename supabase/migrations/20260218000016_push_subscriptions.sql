-- PROJ-14: PWA Push Notifications — push_subscriptions table
-- Each row represents one device's push subscription for a patient.
-- Multi-device support: one patient can have multiple rows (one per device).

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  subscription_json JSONB     NOT NULL,
  device_type     TEXT        NOT NULL CHECK (device_type IN ('ios', 'android', 'desktop')),
  reminder_enabled BOOLEAN    NOT NULL DEFAULT TRUE,
  reminder_time   TEXT        NOT NULL DEFAULT '08:00' CHECK (reminder_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  chat_enabled    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one subscription endpoint per patient
-- (prevents duplicate rows if subscribe is called twice for the same browser)
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON push_subscriptions ((subscription_json->>'endpoint'));

-- Index for looking up all subscriptions by patient (used in sendPushToPatient)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_patient_id
  ON push_subscriptions (patient_id);

-- Index for cron job: quickly find subscriptions where reminder_enabled = true
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_reminder
  ON push_subscriptions (reminder_enabled, reminder_time)
  WHERE reminder_enabled = TRUE;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Patients can SELECT their own subscriptions
CREATE POLICY "patient_select_own_push_subscriptions"
  ON push_subscriptions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = push_subscriptions.patient_id
    )
  );

-- Patients can INSERT their own subscriptions
CREATE POLICY "patient_insert_own_push_subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = push_subscriptions.patient_id
    )
  );

-- Patients can UPDATE their own subscriptions (for preferences changes)
CREATE POLICY "patient_update_own_push_subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = push_subscriptions.patient_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = push_subscriptions.patient_id
    )
  );

-- Patients can DELETE their own subscriptions (unsubscribe)
CREATE POLICY "patient_delete_own_push_subscriptions"
  ON push_subscriptions FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = push_subscriptions.patient_id
    )
  );

-- Admins and therapists have no direct access to subscription data via RLS.
-- Server-side code (sendPushToPatient, cron) uses the service-role client
-- which bypasses RLS — this is intentional for the internal push-send flow.
