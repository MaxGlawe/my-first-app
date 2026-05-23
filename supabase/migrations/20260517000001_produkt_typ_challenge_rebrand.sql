-- ============================================================
-- Rebrand: produkt_typ 'kurs' → 'challenge'
--
-- Unsere aktuellen 4 Produkte sind keine klassischen "Kurse" (Wissens-
-- vermittlung mit Lektionen), sondern 21-Tage-Challenges (tägliche kleine
-- Einheiten, Habit-Building). Begriff wird DB-seitig sauber gezogen, damit
-- spätere Programme/Masterclasses ihren eigenen Platz haben.
--
-- Idempotent: Drop-Versuche scheitern nicht, UPDATE wirkt nur auf 'kurs',
-- ALTER ... SET DEFAULT ist erneut ausführbar.
-- ============================================================

-- ── 1. Alten CHECK-Constraint droppen ──────────────────────────────────────
-- Direkter Drop des Postgres-Standard-Namens (CHECK-Constraints, die inline
-- definiert wurden, heißen <table>_<column>_check).
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_produkt_typ_check;

-- Sicherheitsnetz: falls der Constraint anders heißt (z.B. manuell umbenannt),
-- dynamisch über pg_constraint suchen. pg_get_constraintdef formatiert
-- IN-Listen als "= ANY (ARRAY[...])" → kein IN-Filter im LIKE!
DO $$
DECLARE c_name TEXT;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'products'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%produkt_typ%';
  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

-- ── 2. Bestehende Daten migrieren ──────────────────────────────────────────
UPDATE products SET produkt_typ = 'challenge' WHERE produkt_typ = 'kurs';

-- ── 3. Default-Wert umstellen ──────────────────────────────────────────────
ALTER TABLE products ALTER COLUMN produkt_typ SET DEFAULT 'challenge';

-- ── 4. Neuen CHECK-Constraint anlegen ──────────────────────────────────────
ALTER TABLE products
  ADD CONSTRAINT products_produkt_typ_check
  CHECK (produkt_typ IN ('challenge', 'programm', 'masterclass'));
