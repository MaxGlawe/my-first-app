-- Patient invite system: allow therapists to invite patients to the app via email
-- Uses Supabase's built-in inviteUserByEmail() for email delivery

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS invite_token TEXT,
  ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invite_status TEXT CHECK (invite_status IN ('invited', 'registered'));

-- Unique partial index for fast token lookups (NULLs excluded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_invite_token
  ON patients(invite_token) WHERE invite_token IS NOT NULL;
