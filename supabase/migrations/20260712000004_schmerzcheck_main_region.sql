-- ============================================================
-- PROJ-25b: Hauptregion des Leads
--
-- DAS PROBLEM: Die Check-Frage „Wo spürst du deine Beschwerden am stärksten?"
-- war eine EINFACHAUSWAHL mit der Option „Mehrere Bereiche gleichzeitig".
-- 47 % aller Teilnehmer haben genau das geklickt — und damit ihre eigene
-- Detailangabe überschrieben. Von 178 Leads in Segment A wissen wir bei 77
-- schlicht nicht, welche Region gemeint war.
--
-- Für ein Produkt, das „Chronischer Kreuzschmerz" heißt, ist das die
-- kommerziell wichtigste Information überhaupt — und der Check hat sie
-- weggeworfen. Gesichert LWS: 9 anmailbare Leads von 521.
--
-- ZWEI WEGE ZUR INFORMATION:
--   1. Bestandsleads (77) → RT1-Mail mit Ein-Klick-Frage (main_region_source = 'rt1_click')
--   2. Neue Leads        → Check speichert die Regionen jetzt einzeln und fragt
--                           bei Mehrfachnennung nach dem Schwerpunkt
--                           (main_region_source = 'check')
--
-- main_region steuert danach, wer die Masterclass überhaupt angeboten bekommt.
-- ============================================================

ALTER TABLE schmerzcheck_leads
  ADD COLUMN IF NOT EXISTS main_region        TEXT,
  ADD COLUMN IF NOT EXISTS main_region_set_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS main_region_source TEXT;

-- Werte bewusst als CHECK statt als ENUM: neue Regionen sollen sich ohne
-- Typ-Migration ergänzen lassen.
ALTER TABLE schmerzcheck_leads
  DROP CONSTRAINT IF EXISTS chk_sc_main_region;

ALTER TABLE schmerzcheck_leads
  ADD CONSTRAINT chk_sc_main_region CHECK (
    main_region IS NULL OR main_region IN (
      'unterer_ruecken',    -- LWS/Kreuz → einziger Wert, der die Masterclass freischaltet
      'nacken_schulter',
      'oberer_ruecken',
      'knie_huefte_fuss',
      'wechselt_staendig'
    )
  );

ALTER TABLE schmerzcheck_leads
  DROP CONSTRAINT IF EXISTS chk_sc_main_region_source;

ALTER TABLE schmerzcheck_leads
  ADD CONSTRAINT chk_sc_main_region_source CHECK (
    main_region_source IS NULL OR main_region_source IN ('rt1_click', 'check')
  );

COMMENT ON COLUMN schmerzcheck_leads.main_region IS
  'Schwerpunkt der Beschwerden. Nur ''unterer_ruecken'' berechtigt zur M-Sequenz (Masterclass = LWS-Kurs).';

-- „Wer ist noch offen?" ist die Hot-Query der RT1-Kampagne.
CREATE INDEX IF NOT EXISTS idx_sc_leads_main_region ON schmerzcheck_leads (main_region);

-- ── Rückwirkend: die 33 Leads, die EXPLIZIT „Unterer Rücken / LWS" angegeben
-- haben, brauchen keine RT1-Mail — ihre Region ist bekannt. Wir übernehmen sie
-- direkt aus den Check-Antworten (Quelle: 'check').
--
-- Alle anderen Einzelregionen ebenfalls übernehmen, damit die Ergebnisseite und
-- die Drip-Mails sofort korrekt gaten. Nur 'multiple' bleibt offen → RT1.
-- ACHTUNG: schmerzcheck_responses.value ist JSONB, nicht TEXT. Ein direkter
-- Vergleich mit einem String-Literal scheitert („invalid input syntax for type
-- json"). `value #>> '{}'` extrahiert den JSON-Skalar als Text — bei der alten
-- Einfachauswahl ist das genau der Regions-Wert.
UPDATE schmerzcheck_leads l
   SET main_region = CASE r.value #>> '{}'
         WHEN 'lower_back'  THEN 'unterer_ruecken'
         WHEN 'upper_back'  THEN 'oberer_ruecken'
         WHEN 'neck'        THEN 'nacken_schulter'
         WHEN 'shoulder'    THEN 'nacken_schulter'
         WHEN 'knee'        THEN 'knie_huefte_fuss'
         WHEN 'hip'         THEN 'knie_huefte_fuss'
         WHEN 'foot'        THEN 'knie_huefte_fuss'
       END,
       main_region_set_at = r.answered_at,
       main_region_source = 'check'
  FROM schmerzcheck_responses r
 WHERE r.lead_id = l.id
   AND r.item_id = 'region'
   AND l.main_region IS NULL
   AND r.value #>> '{}' IN ('lower_back','upper_back','neck','shoulder','knee','hip','foot');

-- 'multiple' und 'other' bleiben bewusst NULL → genau diese Leads bekommen RT1.
