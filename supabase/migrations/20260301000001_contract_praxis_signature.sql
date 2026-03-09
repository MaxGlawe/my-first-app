-- Add praxis_signature_png to treatment_contracts
-- Stores the practice owner's signature (base64 PNG) that is shown
-- on the contract BEFORE the patient signs.
ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS praxis_signature_png TEXT;
