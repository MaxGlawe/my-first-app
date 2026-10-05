-- ============================================================
-- PROJ-29: Rechnung für die Konsultation allein — und ihre Anrechnung
--
-- Der Behandler: „Wer in der Konsultation sagt 'ne, ich muss noch nachdenken',
-- der braucht für die Konsultation ja eine Rechnung. Im Abrechnungsdialog muss
-- ich die auch separat raussenden können. Und falls sie später entscheiden,
-- das Programm zu starten, dennoch diese anrechnen lassen."
--
-- Bisher entstand fuer die Konsultation allein GAR KEIN Beleg: Wer 69 EUR im
-- Buchungskalender zahlte und kein Programm nahm, bekam nichts — auch nichts
-- fuer seine Versicherung.
--
-- Die beiden neuen Spalten tragen genau zwei Dinge:
--
--   `konsultation_call_id` — welches Gespraech diese Rechnung abrechnet.
--     Verhindert Doppelte UND ist der Anker fuer die Anrechnung: Kauft der
--     Patient spaeter das Programm, findet die Bezahlrechnung hierueber, was
--     schon berechnet wurde, und deckt nur noch den Rest.
--
--   `versendet_at` — wann die Rechnung per Mail hinausging. Ohne das laesst
--     sich nicht sagen, ob der Patient sie hat; `status = 'offen'` heisst nur,
--     dass sie kein Entwurf mehr ist.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS konsultation_call_id UUID
    REFERENCES video_calls(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS versendet_at TIMESTAMPTZ;

COMMENT ON COLUMN invoices.konsultation_call_id IS
  'PROJ-29: Das Gespraech, das diese Rechnung abrechnet. Anker fuer Idempotenz und fuer die Anrechnung auf ein spaeter gekauftes Programm.';
COMMENT ON COLUMN invoices.versendet_at IS
  'PROJ-29: Wann die Rechnung per E-Mail an den Patienten ging.';

-- Eine Rechnung je Konsultation. Partiell, weil die Spalte bei fast allen
-- Rechnungen NULL ist.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_konsultation
  ON invoices (konsultation_call_id)
  WHERE konsultation_call_id IS NOT NULL;

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select konsultation_call_id, versendet_at from invoices limit 1;
-- Muss zwei Spalten liefern (beide NULL bei Bestandsrechnungen).
