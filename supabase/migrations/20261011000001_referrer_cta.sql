-- ============================================================
-- Welcher Buchungsknopf wurde geklickt?
--
-- `referrer_content` traegt die Anzeige (trailer, teil1, erstattung). Der
-- geklickte Knopf stand bisher ebenfalls dort — aber nur, solange keine
-- Kampagne mitkam. Kommt ein Besucher ueber eine Anzeige, gewinnt deren
-- utm_content, und die Angabe „oben, unten oder feste Leiste" war weg.
-- Also genau bei den Buchungen, die am meisten kosten.
--
-- Zwei Fragen, zwei Spalten:
--   referrer_content = welche Anzeige hat ihn gebracht
--   referrer_cta     = welcher Knopf hat ihn ueberzeugt
--
-- HINWEIS: Die Seite haengt `cta` seit dem 11.10.2026 an jeden
-- Buchungslink. Ob der Wert ankommt, haengt am Buchungstool: Es muss ihn
-- wie die utm_*-Werte in `referrer.cta` weiterreichen. Bis dahin bleibt
-- die Spalte NULL — die Empfangsseite ist dann fertig, die Sendeseite
-- nicht.
--
-- Idempotent.
-- MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS referrer_cta TEXT;

COMMENT ON COLUMN appointments.referrer_cta IS
  'Geklickter Buchungsknopf (z. B. sabine-hero, sabine-leiste). Kommt vom Buchungstool als referrer.cta.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select referrer_source, referrer_content, referrer_cta
--     from appointments order by created_at desc limit 3;
