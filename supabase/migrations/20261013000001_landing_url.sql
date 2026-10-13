-- ============================================================
-- Die vollstaendige Landing-Adresse mitschreiben.
--
-- Anlass (13.10.2026): Von 92 Sitzungen auf /start/erstattung trugen nur
-- 14 ein `utm_content=erstattung`. 61 kamen voellig ohne Parameter an, 52
-- davon zusaetzlich ohne Referrer. Aus den Einzelspalten laesst sich nicht
-- unterscheiden, ob
--
--   a) die Anzeige die Parameter nie gesetzt hat,
--   b) sie unterwegs verloren gingen (Weiterleitung www/ohne www,
--      abschliessender Schraegstrich, Link-Umschreibung durch Meta),
--   c) der Besucher die Adresse weitergegeben oder aus dem Verlauf
--      aufgerufen hat.
--
-- Mit der rohen Adresse ist das in einer Minute zu sehen, ohne bleibt es
-- Raten. Gespeichert wird NUR Pfad und Query-String, nie ein Fragment —
-- und auch nur von den eigenen Seiten.
--
-- Idempotent.
-- MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS landing_url TEXT;

COMMENT ON COLUMN page_views.landing_url IS
  'Pfad + Query-String des Aufrufs, wie er in der Adresszeile stand. Fuer die Frage, ob Kampagnenparameter fehlen oder unterwegs verloren gehen.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select path, landing_url, referrer from page_views
--    where path like '/start/%' order by created_at desc limit 5;
