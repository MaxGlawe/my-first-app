-- ============================================================
-- Übungen: „pro Seite" als Stammdatum
--
-- Ob eine Übung einseitig ausgeführt wird (Ausfallschritt, Einbeinstand,
-- Seitstütz …), ist eine Eigenschaft der ÜBUNG — nicht des Plans. Bisher
-- ließ sich das nur je Plan-Übung setzen, was bei einer Übung in 54 Plänen
-- unbrauchbar ist.
--
-- Vorrang im Player (src/lib/exercise-sides.ts):
--   1. plan_exercises.params.pro_seite   (Ausnahme für diesen einen Plan)
--   2. exercises.standard_pro_seite      (Stammdatum, gilt überall)
--   3. Texterkennung                     (Altbestand ohne gepflegtes Feld)
--
-- Idempotent — kann mehrfach laufen.
-- ============================================================

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS standard_pro_seite BOOLEAN;

COMMENT ON COLUMN exercises.standard_pro_seite IS
  'Übung wird pro Seite ausgeführt (Sätze gelten je Seite). NULL = aus den Übungstexten erkennen.';

-- Vorbelegung für eindeutig einseitige Übungen anhand des Namens.
-- Bewusst konservativ: nur Begriffe, die praktisch immer einseitig sind.
-- Alles andere bleibt NULL und wird weiter aus dem Text erkannt bzw. vom
-- Therapeuten gepflegt.
UPDATE exercises
SET standard_pro_seite = true
WHERE standard_pro_seite IS NULL
  AND (
    name ~* 'ausfallschritt'
    OR name ~* 'einbein'
    OR name ~* 'seitst(ü|u)tz'
    OR name ~* 'einarmig'
    OR name ~* 'einseitig'
    OR name ~* '\bside plank\b'
    OR name ~* 'lunge'
  );
