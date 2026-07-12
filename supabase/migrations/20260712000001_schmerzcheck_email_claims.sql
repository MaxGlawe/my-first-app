-- ============================================================
-- PROJ-23 / Fix: Doppelversand von Schmerzcheck-Mails hart ausschließen
--
-- Am 2026-07-10 gingen 100 doppelte D1-Mails raus, weil die Dedup-Abfrage im
-- Drip-Cron („wer hat D1 schon?") fehlschlug UND der Fehler verschluckt wurde:
-- alle Leads sahen dadurch „noch nie gemailt" aus. Dieselbe Abfrage stand kurz
-- vor dem PostgREST-Zeilenlimit (931/1000, ohne Pagination) — der nächste
-- Massen-Nachversand war nur eine Frage der Zeit.
--
-- Die Log-Tabelle schmerzcheck_email_events ist als Dedup-Quelle ungeeignet:
-- sie ist ein Audit-Log (viele Zeilen pro Lead) und wird NACH dem Versand
-- geschrieben. Diese Tabelle hier ist stattdessen ein Anspruchs-Register:
-- genau eine Zeile pro (Lead, Mail-Code), geschrieben VOR dem Versand.
--
-- Garantie: claim_schmerzcheck_email() kann pro (lead_id, email_code) nur
-- max_sends-mal erfolgreich sein — atomar, race-sicher (der PK-Konflikt sperrt
-- die Zeile). Schlägt der Claim fehl, wird nicht gesendet. Fail closed.
-- ============================================================

CREATE TABLE IF NOT EXISTS schmerzcheck_email_claims (
  lead_id    UUID NOT NULL REFERENCES schmerzcheck_leads(id) ON DELETE CASCADE,
  email_code TEXT NOT NULL,             -- T1 | T2 | T3 | D1..D5 | R1 | R2 | W1
  send_count INT  NOT NULL DEFAULT 0,
  first_claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_claimed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lead_id, email_code)
);

CREATE INDEX IF NOT EXISTS idx_sc_claims_lead ON schmerzcheck_email_claims (lead_id);

ALTER TABLE schmerzcheck_email_claims ENABLE ROW LEVEL SECURITY;

-- Schreibzugriff nur über die Service-Role (bypasst RLS). Staff darf lesen.
CREATE POLICY "sc_claims_select_staff" ON schmerzcheck_email_claims
  FOR SELECT USING (get_my_role() IN ('admin', 'heilpraktiker', 'physiotherapeut'));

-- ── Atomarer Claim ────────────────────────────────────────────────────────
-- TRUE  → Anspruch erteilt, Mail DARF jetzt raus.
-- FALSE → bereits (oft genug) gesendet, NICHT senden.
CREATE OR REPLACE FUNCTION claim_schmerzcheck_email(
  p_lead_id    UUID,
  p_email_code TEXT,
  p_max_sends  INT DEFAULT 1
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granted BOOLEAN;
BEGIN
  INSERT INTO schmerzcheck_email_claims AS c (lead_id, email_code, send_count)
  VALUES (p_lead_id, p_email_code, 1)
  ON CONFLICT (lead_id, email_code) DO UPDATE
     SET send_count      = c.send_count + 1,
         last_claimed_at = now()
   WHERE c.send_count < p_max_sends   -- greift der WHERE nicht, gibt es KEINE Zeile zurück
  RETURNING TRUE INTO v_granted;

  RETURN COALESCE(v_granted, FALSE);
END;
$$;

-- ── Claim zurückgeben, wenn der Versand fehlschlug ───────────────────────
-- Damit ein echter SMTP-Fehler beim nächsten Lauf erneut versucht werden darf
-- (ohne das Register für erfolgreiche Sendungen aufzuweichen).
CREATE OR REPLACE FUNCTION release_schmerzcheck_email_claim(
  p_lead_id    UUID,
  p_email_code TEXT
) RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE schmerzcheck_email_claims
     SET send_count = GREATEST(send_count - 1, 0)
   WHERE lead_id = p_lead_id AND email_code = p_email_code;
$$;

-- ── Backfill aus dem bestehenden Event-Log ───────────────────────────────
-- Jede Mail, die nachweislich schon rausging, wird als verbraucht registriert.
-- Damit bekommt KEIN Bestandslead eine Mail ein zweites Mal — inklusive der
-- 178 Leads im laufenden Drip und der 100 vom D1-Doppelversand betroffenen.
INSERT INTO schmerzcheck_email_claims (lead_id, email_code, send_count, first_claimed_at, last_claimed_at)
SELECT lead_id,
       email_code,
       COUNT(*)::INT,
       MIN(occurred_at),
       MAX(occurred_at)
  FROM schmerzcheck_email_events
 WHERE event_type = 'sent'
   AND email_code ~ '^(T[123]|D[1-5]|R[12]|W1)$'
 GROUP BY lead_id, email_code
ON CONFLICT (lead_id, email_code) DO NOTHING;

-- ── Zugriff härten ────────────────────────────────────────────────────────
-- Beide Funktionen sind SECURITY DEFINER. Der Default-EXECUTE-Grant liegt auf
-- PUBLIC — ohne diesen REVOKE könnte jeder mit dem Anon-Key fremde Claims
-- verbrennen (Mails unterdrücken) oder freigeben (Doppelversand provozieren).
-- Nur die Service-Role darf sie aufrufen.
REVOKE ALL ON FUNCTION claim_schmerzcheck_email(UUID, TEXT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION release_schmerzcheck_email_claim(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_schmerzcheck_email(UUID, TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION release_schmerzcheck_email_claim(UUID, TEXT) TO service_role;
