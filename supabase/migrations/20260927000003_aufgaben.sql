-- ============================================================
-- PROJ-29: Aufgaben — der Arbeitsvorrat im OS statt im Postfach
--
-- Der Behandler: „Kann er mir das nicht als Mail senden, sondern irgendwie
-- ins CRM? Sonst sind bei viel Nutzung meine Mails voll. Einfach ins CRM,
-- vielleicht sogar ins Dashboard, dann hab ich's an einem Fleck und kann es
-- mit jedem Endgerät bearbeiten."
--
-- Richtig: Eine Mail ist eine Benachrichtigung, keine Aufgabe. Sie kennt
-- kein „erledigt", sie sammelt sich, und bei zwanzig Patienten im Programm
-- erzeugt allein der Rechnungslauf sechzig Mails im Quartal.
--
-- Was hier steht, ist deshalb kein Postfach, sondern eine Liste mit genau
-- zwei Zustaenden: offen und erledigt.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren (Migrationen laufen nicht im Deploy).
-- ============================================================

CREATE TABLE IF NOT EXISTS os_aufgaben (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Wofuer die Aufgabe steht. Bestimmt Symbol und Sortierung in der Liste.
  typ           TEXT NOT NULL
                  CHECK (typ IN ('rechnung_freigeben', 'bericht_faellig', 'hinweis')),

  titel         TEXT NOT NULL CHECK (char_length(titel) BETWEEN 1 AND 200),
  beschreibung  TEXT,
  /** Wohin der Klick fuehrt — die Aufgabe ist erst dann eine, wenn man sie
      von dort aus erledigen kann. */
  link          TEXT,

  patient_id    UUID REFERENCES patients(id) ON DELETE CASCADE,

  /**
   * Das Ding, um das es geht (Rechnung, Vertrag, Gespraech). Zusammen mit
   * `typ` verhindert es Doppelte: Der taegliche Lauf darf dieselbe Aufgabe
   * nicht jeden Morgen neu anlegen.
   */
  ref_id        UUID,

  status        TEXT NOT NULL DEFAULT 'offen' CHECK (status IN ('offen', 'erledigt')),
  erledigt_at   TIMESTAMPTZ,
  erledigt_von  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Eine Aufgabe je Sache und Art — egal wie oft der Lauf darueber stolpert.
CREATE UNIQUE INDEX IF NOT EXISTS idx_aufgaben_ref
  ON os_aufgaben (typ, ref_id)
  WHERE ref_id IS NOT NULL;

-- Die haeufigste Abfrage: was ist offen, neueste zuerst.
CREATE INDEX IF NOT EXISTS idx_aufgaben_offen
  ON os_aufgaben (created_at DESC)
  WHERE status = 'offen';

ALTER TABLE os_aufgaben ENABLE ROW LEVEL SECURITY;

-- Nur die Praxis sieht den Arbeitsvorrat — Patienten haben damit nichts zu
-- tun. Geschrieben wird ausschliesslich ueber den Service-Key (Cron, API).
DROP POLICY IF EXISTS aufgaben_select_praxis ON os_aufgaben;
CREATE POLICY aufgaben_select_praxis ON os_aufgaben
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
       WHERE user_profiles.id = auth.uid()
         AND user_profiles.role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );

COMMENT ON TABLE os_aufgaben IS
  'PROJ-29: Arbeitsvorrat der Praxis — offene Aufgaben aus automatischen Laeufen.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select count(*) from os_aufgaben;
-- Muss 0 liefern und darf nicht mit einem Fehler abbrechen.
