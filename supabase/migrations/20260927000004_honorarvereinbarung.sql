-- ============================================================
-- PROJ-29: Honorarvereinbarung — zwei Erklaerungen, zwei Zeitstempel
--
-- Beim Programm wird nicht unterschrieben, es wird bezahlt. Genau deshalb
-- muss nachweisbar sein, WANN der Patient WAS bestaetigt hat. Bisher gab es
-- dafuer nur `signer_consent` (Widerrufsverzicht) — ohne eigenen Zeitstempel;
-- der lag ausschliesslich in den Stripe-Metadaten, also ausserhalb unserer
-- Akte.
--
-- Es sind zwei verschiedene Erklaerungen und sie duerfen nicht in ein Feld
-- fallen:
--   1. Honorarvereinbarung — „Ich kenne das Honorar und die Abrechnung."
--   2. Widerrufsverzicht (Paragraf 356 Abs. 4 BGB) — „Fang sofort an."
-- Wer nur eine von beiden bestaetigt, hat nicht beide bestaetigt.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE treatment_contracts
  ADD COLUMN IF NOT EXISTS honorar_consent    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS honorar_consent_at TIMESTAMPTZ,
  -- Der Zeitpunkt des Widerrufsverzichts. `signed_at` ist er NICHT: das ist
  -- der Zahlungseingang, gesetzt vom Stripe-Webhook, Minuten spaeter.
  ADD COLUMN IF NOT EXISTS signer_consent_at  TIMESTAMPTZ;

COMMENT ON COLUMN treatment_contracts.honorar_consent IS
  'PROJ-29: Honorarvereinbarung vor der Zahlung bestaetigt (GebueH-Saetze, Erstattung, Monatsrechnungen).';
COMMENT ON COLUMN treatment_contracts.honorar_consent_at IS
  'PROJ-29: Zeitpunkt dieser Bestaetigung.';
COMMENT ON COLUMN treatment_contracts.signer_consent_at IS
  'PROJ-29: Zeitpunkt des Widerrufsverzichts (Paragraf 356 Abs. 4 BGB) — nicht der Zahlungseingang.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select honorar_consent, honorar_consent_at, signer_consent_at
--     from treatment_contracts limit 1;
-- Muss drei Spalten liefern (false / null / null bei Bestandsvertraegen).
