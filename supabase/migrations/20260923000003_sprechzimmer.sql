-- ============================================================
-- PROJ-27: Digitales Sprechzimmer — Fundament
--
-- ENTSCHEIDUNG, die diese Tabelle trägt: Ein Gespräch hängt am PATIENTEN und
-- an einem ANLASS, nicht an einem Termin.
--
-- Der naheliegende Entwurf wäre „ein Raum je Termin" gewesen. Er scheitert an
-- der Wirklichkeit: `appointments` wird ausschliesslich vom Buchungs-Webhook
-- gefüllt, und der ist seit dem 23.09.2026 bewusst stillgelegt — er hätte
-- sonst jedem Praxispatienten ungefragt ein Konto samt Zugangsmail angelegt.
-- Ein Sprechzimmer, das an dieser Anbindung hängt, wäre am Tag seiner
-- Fertigstellung unbenutzbar gewesen.
--
-- Deshalb: Der Therapeut eröffnet das Gespräch, der Patient tritt bei. Das
-- ist ohnehin der Ablauf in der Praxis — man sitzt im Kalender, klickt und
-- spricht. Kommt die Terminanbindung je zurück, lässt sich ein Termin
-- nachträglich verknüpfen (`appointment_id`), ohne dass hier etwas
-- umgebaut werden muss.
--
-- Idempotent.
-- ============================================================

-- ── Das Gespräch ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS video_calls (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Der Raumname geht an LiveKit und taucht in URLs auf. Deshalb eine eigene,
  -- zufällige UUID und NICHT die id: Wer einen Raumnamen erraten oder aus
  -- einer Log-Zeile ablesen kann, darf damit trotzdem nichts anfangen — der
  -- Zutritt hängt am Token, nicht am Namen. Aber raten soll trotzdem niemand.
  room_name    UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

  patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Warum das Gespräch stattfindet. Bestimmt Beschriftung, Dauer und später
  -- die Zuordnung zur Leistung.
  anlass       TEXT NOT NULL
               CHECK (anlass IN ('konsultation', 'programm_sitzung', 'verschlechterung', 'sonstiges')),

  -- Bei 'verschlechterung': der auslösende Vorgang. So ist im Nachhinein
  -- belegbar, dass auf eine Meldung ein Gespräch folgte — und wie schnell.
  verschlechterung_id UUID REFERENCES programm_verschlechterungen(id) ON DELETE SET NULL,
  contract_id  UUID REFERENCES treatment_contracts(id) ON DELETE SET NULL,
  -- Platzhalter für den Fall, dass die Terminanbindung zurückkehrt.
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  status       TEXT NOT NULL DEFAULT 'offen'
               CHECK (status IN ('offen', 'laeuft', 'beendet', 'abgebrochen')),

  -- Zutrittsfenster. Ausserhalb wird KEIN Token mehr ausgestellt; ein bereits
  -- ausgestelltes läuft von selbst ab. Beide Zeiten stehen hier und werden
  -- nicht im Code errechnet: Wann jemand hineindurfte, muss später
  -- nachvollziehbar sein, auch wenn sich die Regel im Code ändert.
  oeffnet_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  schliesst_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '2 hours'),

  begonnen_at  TIMESTAMPTZ,
  beendet_at   TIMESTAMPTZ,

  notiz        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Der Patient fragt „läuft gerade ein Gespräch für mich?" — das ist die
-- häufigste Abfrage überhaupt und muss billig sein.
CREATE INDEX IF NOT EXISTS idx_video_calls_patient_offen
  ON video_calls (patient_id, schliesst_at DESC)
  WHERE status IN ('offen', 'laeuft');

CREATE INDEX IF NOT EXISTS idx_video_calls_patient
  ON video_calls (patient_id, created_at DESC);

COMMENT ON TABLE video_calls IS
  'PROJ-27: Ein Videogespraech. Haengt am Patienten und am Anlass, nicht an einem Termin — siehe Migrationskommentar.';


-- ── Das Protokoll ───────────────────────────────────────────────────────────
--
-- Gefüttert von den LiveKit-Webhooks. Bewusst eine eigene Tabelle und keine
-- Spalten am Gespräch: Ein Gespräch hat beliebig viele Beitritte und
-- Verbindungsabbrüche, und genau deren Abfolge ist die interessante
-- Information, wenn hinterher jemand fragt, ob ein Termin stattgefunden hat.
--
-- WICHTIG: Das ist ein Anwesenheitsnachweis, keine Abrechnungsautomatik.
-- „War verbunden" ist nicht „Leistung erbracht". Grundlage der Rechnung
-- bleiben Behandlungsvertrag und Dokumentation.

CREATE TABLE IF NOT EXISTS video_call_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id      UUID REFERENCES video_calls(id) ON DELETE CASCADE,
  room_name    TEXT NOT NULL,
  event        TEXT NOT NULL,
  identity     TEXT,
  rolle        TEXT,
  at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload      JSONB
);

CREATE INDEX IF NOT EXISTS idx_video_events_call
  ON video_call_events (call_id, at);

COMMENT ON TABLE video_call_events IS
  'PROJ-27: Anwesenheitsprotokoll aus den LiveKit-Webhooks. Nachweis, KEINE Abrechnungsgrundlage.';


-- ── Rechte ──────────────────────────────────────────────────────────────────

ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_events ENABLE ROW LEVEL SECURITY;

-- Patient: sieht die eigenen Gespräche, legt aber keine an. Ein Gespräch
-- eröffnet der Behandler — sonst könnte sich jeder selbst einen Termin geben.
DROP POLICY IF EXISTS "Patient sieht eigene Gespraeche" ON video_calls;
CREATE POLICY "Patient sieht eigene Gespraeche"
  ON video_calls FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Praxis verwaltet Gespraeche" ON video_calls;
CREATE POLICY "Praxis verwaltet Gespraeche"
  ON video_calls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
       WHERE up.id = auth.uid()
         AND up.role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praxismanagement')
    )
  );

-- Das Protokoll ist ein Nachweis. Niemand ausser dem Server schreibt hinein,
-- und der Patient hat darin nichts zu suchen.
DROP POLICY IF EXISTS "Praxis liest Protokoll" ON video_call_events;
CREATE POLICY "Praxis liest Protokoll"
  ON video_call_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
       WHERE up.id = auth.uid()
         AND up.role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praxismanagement')
    )
  );
