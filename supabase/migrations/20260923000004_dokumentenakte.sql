-- ============================================================
-- PROJ-27 Etappe 4: Dokumentenakte
--
-- Bis heute gab es in Praxis OS keine Möglichkeit, einen Arztbrief, einen
-- MRT-Befund oder einen OP-Bericht abzulegen. Von 89 Tabellen trug keine
-- Dokumente; die sieben Storage-Buckets enthielten Übungsvideos, Avatare und
-- Vertrags-PDFs. Ein Heilpraktiker, der ohne ärztliche Verordnung behandelt,
-- arbeitet aber genau mit diesen Unterlagen.
--
-- ENTSCHEIDUNGEN (am 23.09.2026 mit dem Praxisinhaber getroffen):
--
--   EINSICHT — alle klinischen Rollen, dafür wird jeder Zugriff protokolliert.
--   Der Nachweis ersetzt die technische Sperre: Vertretung und Urlaub
--   funktionieren, ohne dass Patienten umgetragen werden müssen, und
--   nachvollziehbar bleibt es trotzdem.
--
--   LÖSCHEN — der Patient kann nicht löschen. Was in der Akte liegt,
--   unterliegt der Dokumentationspflicht des Behandlers. Er sieht seine
--   Dokumente und kann eines als fehlerhaft MELDEN; entfernen tut es die
--   Praxis. Andernfalls könnte sich rückwirkend ein Befund in Luft auflösen,
--   auf den sich eine Behandlungsentscheidung gestützt hat.
--
--   AUFBEWAHRUNG — es wird nichts automatisch gelöscht. Die
--   Dokumentationspflicht liegt regelmässig bei zehn Jahren; eine Automatik,
--   die früher zuschlägt, wäre schlimmer als gar keine. Ein Löschkonzept
--   gehört später bewusst entschieden, nicht nebenbei eingebaut.
--
-- Idempotent.
-- ============================================================

-- ── Der Bucket ──────────────────────────────────────────────────────────────
--
-- Privat, im Gegensatz zu exercise-images und Konsorten. Ausgeliefert wird
-- ausschliesslich über kurzlebige signierte Links, die der Server erzeugt.
-- Bewusst KEINE RLS-Policies auf storage.objects: Ohne Policy kommt nur der
-- Service-Client heran, und genau das ist gewollt — jeder Zugriff läuft durch
-- unsere Endpunkte und wird dort protokolliert. Eine Policy wäre eine zweite
-- Tür an der Protokollierung vorbei.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents',
  'patient-documents',
  false,
  26214400,  -- 25 MB: ein mehrseitiger Scan passt, ein Video nicht
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ── Das Dokument ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patient_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  kategorie     TEXT NOT NULL DEFAULT 'sonstiges'
                CHECK (kategorie IN ('arztbrief', 'bildgebung', 'op_bericht', 'labor', 'verordnung', 'sonstiges')),
  titel         TEXT NOT NULL,
  notiz         TEXT,

  storage_path  TEXT NOT NULL UNIQUE,
  mime_type     TEXT NOT NULL,
  groesse_bytes BIGINT NOT NULL,
  seiten        INTEGER,

  -- Wer es eingestellt hat. Beides kann NULL sein — ein Dokument gehört zum
  -- Patienten, nicht zu dem, der es hochgeladen hat, und Konten können
  -- verschwinden.
  hochgeladen_von UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quelle        TEXT NOT NULL DEFAULT 'praxis' CHECK (quelle IN ('praxis', 'patient')),

  -- Der Patient kann ein Dokument als fehlerhaft melden. Gelöscht wird es
  -- dadurch nicht — siehe Kopfkommentar.
  korrektur_gemeldet_at TIMESTAMPTZ,
  korrektur_grund       TEXT,

  -- Weiches Löschen durch die Praxis. Die Datei verschwindet aus dem Bucket,
  -- die Zeile bleibt: Dass ein Dokument existierte und entfernt wurde, ist
  -- selbst Teil der Dokumentation.
  geloescht_at  TIMESTAMPTZ,
  geloescht_von UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_patient
  ON patient_documents (patient_id, created_at DESC)
  WHERE geloescht_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_documents_korrektur
  ON patient_documents (korrektur_gemeldet_at DESC)
  WHERE korrektur_gemeldet_at IS NOT NULL AND geloescht_at IS NULL;

COMMENT ON TABLE patient_documents IS
  'PROJ-27: Befunde und Unterlagen zur Patientenakte. Ausgeliefert nur ueber signierte Links; jeder Inhaltszugriff steht in patient_document_access.';


-- ── Das Zugriffsprotokoll ───────────────────────────────────────────────────
--
-- Der Preis dafür, dass alle klinischen Rollen hineinsehen dürfen. Ohne
-- dieses Protokoll wäre die Öffnung eine reine Bequemlichkeitsentscheidung;
-- mit ihm ist sie belegbar.
--
-- Protokolliert wird der Zugriff auf den INHALT, nicht das Anzeigen einer
-- Liste. Sonst ertrinkt der Nachweis in Rauschen, und niemand sieht mehr hin.

CREATE TABLE IF NOT EXISTS patient_document_access (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES patient_documents(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rolle       TEXT,
  aktion      TEXT NOT NULL CHECK (aktion IN ('angesehen', 'hochgeladen', 'geloescht', 'korrektur_gemeldet')),
  at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip          TEXT
);

CREATE INDEX IF NOT EXISTS idx_document_access_doc
  ON patient_document_access (document_id, at DESC);

CREATE INDEX IF NOT EXISTS idx_document_access_patient
  ON patient_document_access (patient_id, at DESC);

COMMENT ON TABLE patient_document_access IS
  'PROJ-27: Wer wann welches Dokument geoeffnet hat. Gegenstueck zur Oeffnung fuer alle klinischen Rollen.';


-- ── Rechte ──────────────────────────────────────────────────────────────────

ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_document_access ENABLE ROW LEVEL SECURITY;

-- Patient: sieht die eigenen, nicht gelöschten Dokumente. Kein INSERT, kein
-- DELETE über RLS — das Hochladen läuft über den Endpunkt, der die Datei
-- prüft und den Pfad vergibt.
DROP POLICY IF EXISTS "Patient sieht eigene Dokumente" ON patient_documents;
CREATE POLICY "Patient sieht eigene Dokumente"
  ON patient_documents FOR SELECT
  USING (
    geloescht_at IS NULL
    AND patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Klinische Rollen sehen und verwalten Dokumente" ON patient_documents;
CREATE POLICY "Klinische Rollen sehen und verwalten Dokumente"
  ON patient_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
       WHERE up.id = auth.uid()
         AND up.role IN ('admin', 'heilpraktiker', 'physiotherapeut', 'praxismanagement')
    )
  );

-- Das Protokoll liest nur die Praxis, und niemand ausser dem Server schreibt
-- hinein. Ein Nachweis, den der Beobachtete ändern kann, ist keiner.
DROP POLICY IF EXISTS "Praxis liest Zugriffsprotokoll" ON patient_document_access;
CREATE POLICY "Praxis liest Zugriffsprotokoll"
  ON patient_document_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
       WHERE up.id = auth.uid()
         AND up.role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );
