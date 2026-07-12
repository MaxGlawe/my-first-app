-- ============================================================
-- Masterclass-Kampagne: Segmentierung der Bestandsleads
--
-- Die Segmente A/B/C/D werden NICHT als Spalte gepflegt, sondern aus den
-- vorhandenen Feldern abgeleitet (siehe src/lib/schmerzcheck/segments.ts) —
-- eine denormalisierte Spalte würde nur veralten.
--
-- Was hier NEU dazukommt, ist der „Türsteher" für Segment B (Red-Flag):
-- Diese 117 Leads bekommen KEINEN Kauf-Pitch, solange ihre Warnzeichen nicht
-- ärztlich abgeklärt sind. Erst wenn sie in der Brücken-Mail aktiv bestätigen
-- („Ja, war beim Arzt — nichts Akutes"), wandern sie in Segment A und dürfen
-- die Masterclass angeboten bekommen.
--
-- Das ist die HWG-sichere Umsetzung von „bei Reaktion → A": der Klick ist die
-- Bedingung, nicht die Interpretation. Und er ist nachweisbar dokumentiert.
-- ============================================================

ALTER TABLE schmerzcheck_leads ADD COLUMN IF NOT EXISTS medical_cleared_at     TIMESTAMPTZ;
ALTER TABLE schmerzcheck_leads ADD COLUMN IF NOT EXISTS medical_cleared_source TEXT;

COMMENT ON COLUMN schmerzcheck_leads.medical_cleared_at IS
  'Lead hat aktiv bestätigt, dass die Red-Flag-Symptome ärztlich abgeklärt sind. Erst ab dann darf ein Angebot folgen (HWG).';

CREATE INDEX IF NOT EXISTS idx_sc_leads_cleared ON schmerzcheck_leads (medical_cleared_at)
  WHERE medical_cleared_at IS NOT NULL;

-- Der Klick auf „noch nicht abgeklärt" wird ebenfalls festgehalten (als Event),
-- damit wir sehen, wer reagiert hat, ohne ihn zu bepitchen.
-- Nutzt die bestehende schmerzcheck_email_events-Tabelle → kein neues Schema.
-- event_type 'clicked' + email_code 'B1'/'B2' + metadata.answer = 'cleared'|'not_yet'
