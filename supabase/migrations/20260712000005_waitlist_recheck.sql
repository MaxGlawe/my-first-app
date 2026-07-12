-- ============================================================
-- PROJ-25c: Warteliste + Wiedereinstieg in den Check
--
-- ZWEI NEUE WEGE, mit Leads umzugehen, denen wir nichts verkaufen können:
--
-- 1. WARTELISTE (79 Leads: Nacken 51, oberer Rücken 22, Knie/Hüfte/Fuß 6)
--    Sie haben den Check komplett gemacht, einen Report bekommen, ein echtes
--    chronisches Problem — und wir haben kein Produkt für sie. Statt sie
--    stillschweigend zu parken, bekommen sie eine Wert-Mail (drei fachliche
--    Punkte, kein Verkauf) und können sich per Klick auf eine Warteliste
--    setzen. Die Klickzahl ist zugleich die Vorab-Validierung: Ab ~15 Klicks
--    aus 73 Nacken+BWS-Leads lohnt sich die Produktion eines Nacken-Moduls.
--
-- 2. WIEDEREINSTIEG (45 Leads)
--    Diese 45 wurden im Juni gestoppt, weil sie „Beschwerden, die dich nachts
--    aufwecken" angekreuzt hatten — und NUR deswegen. Nach der entschärften
--    Regel (07/2026) wäre keiner von ihnen gestoppt worden: Nächtlicher Schmerz
--    ist bei chronischen Beschwerden der Normalfall und hat als alleiniges
--    Kriterium keine Trennschärfe. Sie dürfen den Check erneut durchlaufen.
--    `recheck_invited_at` dokumentiert, wann wir das Stopp-Flag gelöst haben —
--    das ist eine klinisch relevante Zustandsänderung und gehört nachvollziehbar
--    festgehalten, nicht still überschrieben.
-- ============================================================

ALTER TABLE schmerzcheck_leads
  ADD COLUMN IF NOT EXISTS waitlist_region     TEXT,
  ADD COLUMN IF NOT EXISTS waitlist_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recheck_invited_at  TIMESTAMPTZ;

ALTER TABLE schmerzcheck_leads
  DROP CONSTRAINT IF EXISTS chk_sc_waitlist_region;

ALTER TABLE schmerzcheck_leads
  ADD CONSTRAINT chk_sc_waitlist_region CHECK (
    waitlist_region IS NULL OR waitlist_region IN (
      'nacken_schulter',   -- N1  (51 Leads)
      'oberer_ruecken',    -- OB1 (22 Leads) → zeigt auf dasselbe Nacken/BWS-Modul
      'knie_huefte_fuss'   -- K1  (6 Leads)  → eigenes Flag, Signal wird gezählt
    )
  );

COMMENT ON COLUMN schmerzcheck_leads.waitlist_region IS
  'Lead hat sich per Klick für ein künftiges Regions-Modul vormerken lassen. Zählt als Nachfrage-Signal für die Produktentscheidung.';

COMMENT ON COLUMN schmerzcheck_leads.recheck_invited_at IS
  'Zeitpunkt, zu dem das Red-Flag-Stopp-Flag gelöst wurde, weil der alleinige Stopp-Grund (nächtlicher Schmerz) nach der entschärften Regel keiner mehr ist.';

CREATE INDEX IF NOT EXISTS idx_sc_leads_waitlist ON schmerzcheck_leads (waitlist_region)
  WHERE waitlist_region IS NOT NULL;
