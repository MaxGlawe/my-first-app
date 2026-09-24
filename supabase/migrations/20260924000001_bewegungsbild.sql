-- ============================================================
-- PROJ-28: Bewegungsbilder in der Dokumentenakte
--
-- Ein Standbild aus dem Gespräch, mit eingezeichneten Winkeln, ist kein
-- Arztbrief und keine Bildgebung. Es bekommt eine eigene Kategorie, sonst
-- verschwindet es zwischen MRT-Berichten — und genau der Vergleich über
-- Wochen, der den Wert ausmacht, wäre dann nicht mehr auffindbar.
--
-- Idempotent.
-- ⚠️ MANUELL im Supabase SQL-Editor ausführen (Migrationen laufen nicht im Deploy).
-- ============================================================

DO $$
BEGIN
  ALTER TABLE patient_documents DROP CONSTRAINT IF EXISTS patient_documents_kategorie_check;
  ALTER TABLE patient_documents
    ADD CONSTRAINT patient_documents_kategorie_check
    CHECK (kategorie IN (
      'arztbrief',
      'bildgebung',
      'op_bericht',
      'labor',
      'verordnung',
      'bewegungsbild',
      'sonstiges'
    ));
END $$;

COMMENT ON COLUMN patient_documents.kategorie IS
  'PROJ-28: bewegungsbild = Standbild aus dem Videogespraech mit Winkelmessung.';

-- ── Kontrolle ────────────────────────────────────────────────────────────
-- Muss ohne Fehler durchlaufen und danach wieder entfernt werden:
--
--   insert into patient_documents (patient_id, kategorie, titel, storage_path, mime_type, groesse_bytes)
--   select id, 'bewegungsbild', '(Test)', '(test)', 'image/jpeg', 1 from patients limit 1;
--   delete from patient_documents where titel = '(Test)';
