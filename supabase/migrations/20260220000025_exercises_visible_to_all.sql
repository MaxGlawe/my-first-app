-- Alle Übungen für alle authentifizierten Praxis-Mitarbeiter sichtbar machen.
-- Vorher: Nur is_public=TRUE oder eigene Übungen sichtbar.
-- Nachher: Alle authentifizierten User sehen alle Übungen.

-- 1. Alte SELECT-Policy entfernen
DROP POLICY IF EXISTS "Therapeuten sehen öffentliche und eigene Übungen" ON exercises;

-- 2. Neue SELECT-Policy: Alle authentifizierten User sehen alle Übungen
CREATE POLICY "Alle Praxis-Mitarbeiter sehen alle Übungen"
  ON exercises FOR SELECT
  TO authenticated
  USING (TRUE);

-- 3. Standardmäßig is_public = TRUE setzen für neue Übungen
ALTER TABLE exercises ALTER COLUMN is_public SET DEFAULT TRUE;

-- 4. Bestehende Übungen auf is_public = TRUE setzen
UPDATE exercises SET is_public = TRUE WHERE is_public = FALSE;
