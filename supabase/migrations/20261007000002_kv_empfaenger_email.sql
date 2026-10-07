-- ============================================================
-- PROJ-29: E-Mail-Adresse am Kostenvoranschlag
--
-- Der Behandler: „Gern ein Adressfeld, dass wir aus Praxis OS gleich die Mail
-- versenden können, vielleicht auch eine fertig gerenderte Mail, damit alles
-- automatisiert rausgeht."
--
-- Die Adresse gehoert an den Kostenvoranschlag und nicht an einen Patienten:
-- Der Empfaenger hat kein Konto — das war der ganze Punkt. Ohne eigene Spalte
-- gaebe es keinen Ort, an dem sie stehen koennte.
--
-- `versendet_at` existiert bereits aus 20261007000001.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausfuehren.
-- ============================================================

ALTER TABLE kostenvoranschlaege
  ADD COLUMN IF NOT EXISTS empfaenger_email TEXT;

COMMENT ON COLUMN kostenvoranschlaege.empfaenger_email IS
  'PROJ-29: Adresse, an die der Voranschlag geschickt wurde. Freitext — der Empfaenger hat kein Konto.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
--   select empfaenger_email, versendet_at from kostenvoranschlaege limit 1;
-- Muss zwei Spalten liefern.
