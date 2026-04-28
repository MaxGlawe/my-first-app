-- Add UTM/referrer attribution to appointments so we can track which
-- bookings came from the wwwpraxis-os.com direct-book button (vs. organic
-- bookings from the Praxis-Glawe main site).
--
-- All three columns are nullable: missing means "no UTM tag" = direct/organic.

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS referrer_source   TEXT,
  ADD COLUMN IF NOT EXISTS referrer_medium   TEXT,
  ADD COLUMN IF NOT EXISTS referrer_campaign TEXT;

-- Lightweight index for the most common query: "how many bookings from each source?"
CREATE INDEX IF NOT EXISTS idx_appointments_referrer_source
  ON appointments(referrer_source)
  WHERE referrer_source IS NOT NULL;
