-- ============================================================
-- PROJ-27: Vom Ad-hoc-Raum zum TERMIN
--
-- Der erste Entwurf kannte nur „jetzt einen Raum aufmachen". Das reicht
-- nicht: Ein Patient hat nicht immer Zeit, wenn der Behandler gerade Zeit
-- hat. Derselbe Gedanke, der beim Extra-Termin nach einer Verschlechterung
-- schon galt — er gilt fuer ALLE Gespraeche.
--
-- Ein Termin hat jetzt eine geplante Zeit. Daraus ergibt sich das
-- Zutrittsfenster:
--
--     oeffnet   = geplant_at minus 5 Minuten
--     schliesst = geplant_at plus Dauer plus 30 Minuten
--
-- Die fuenf Minuten sind der Warteraum, wie man ihn von Videodiensten kennt:
-- Zeit, Kamera und Mikrofon zu pruefen, BEVOR die Gespraechszeit laeuft. Der
-- Nachlauf von einer halben Stunde faengt ab, dass ein Gespraech laenger
-- dauert als geplant — ein Zutritt, der puenktlich zuschlaegt, waehrend
-- beide noch reden, waere absurd.
--
-- oeffnet_at und schliesst_at bleiben eigene Spalten und werden beim Anlegen
-- gesetzt, statt jedes Mal aus geplant_at gerechnet zu werden. Wann jemand
-- hineindurfte, muss nachvollziehbar bleiben, auch wenn sich die Regel im
-- Code spaeter aendert.
--
-- Idempotent.
-- ============================================================

ALTER TABLE video_calls
  ADD COLUMN IF NOT EXISTS geplant_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dauer_minuten INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS titel         TEXT,
  ADD COLUMN IF NOT EXISTS hinweis       TEXT,
  ADD COLUMN IF NOT EXISTS einladung_gesendet_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS erinnerung_24h_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS erinnerung_1h_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS abgesagt_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS abgesagt_grund TEXT;

-- Bestehende Gespraeche waren Ad-hoc — ihre geplante Zeit ist ihre Entstehung.
UPDATE video_calls SET geplant_at = created_at WHERE geplant_at IS NULL;

ALTER TABLE video_calls ALTER COLUMN geplant_at SET NOT NULL;

-- Neuer Zustand 'geplant': angelegt, aber das Zutrittsfenster ist noch zu.
DO $$
BEGIN
  ALTER TABLE video_calls DROP CONSTRAINT IF EXISTS video_calls_status_check;
  ALTER TABLE video_calls
    ADD CONSTRAINT video_calls_status_check
    CHECK (status IN ('geplant', 'offen', 'laeuft', 'beendet', 'abgebrochen', 'abgesagt'));
END $$;

-- Die Terminuebersicht fragt: was steht an? Das ist die haeufigste Abfrage.
CREATE INDEX IF NOT EXISTS idx_video_calls_geplant
  ON video_calls (geplant_at)
  WHERE status IN ('geplant', 'offen', 'laeuft');

-- Der Erinnerungs-Cron sucht Termine, deren Mail noch aussteht.
CREATE INDEX IF NOT EXISTS idx_video_calls_erinnerung_24h
  ON video_calls (geplant_at)
  WHERE erinnerung_24h_at IS NULL AND status = 'geplant';

CREATE INDEX IF NOT EXISTS idx_video_calls_erinnerung_1h
  ON video_calls (geplant_at)
  WHERE erinnerung_1h_at IS NULL AND status = 'geplant';

COMMENT ON COLUMN video_calls.geplant_at IS
  'PROJ-27: Geplanter Beginn. Zutritt ab 5 Min davor bis Dauer + 30 Min danach.';
