-- ============================================================
-- PROJ-15: Neue Berufsbilder
-- Präventionstrainer, Personal Trainer, Praxismanagement
-- Migration: Role extension, Janda catalog, new tables, RLS updates
-- ============================================================

-- ################################################################
-- 1. EXTEND USER_PROFILES ROLE CHECK CONSTRAINT
-- ################################################################

-- Drop any existing CHECK on role (name may vary)
DO $$
BEGIN
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

-- Add new CHECK constraint with all 7 roles
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN (
    'admin',
    'heilpraktiker',
    'physiotherapeut',
    'patient',
    'praeventionstrainer',
    'personal_trainer',
    'praxismanagement'
  ));

-- ################################################################
-- 2. JANDA TEST CATALOG (Reference / Seed Data)
-- ################################################################

CREATE TABLE IF NOT EXISTS janda_test_catalog (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region                TEXT NOT NULL,
  muskel                TEXT NOT NULL,
  kategorie             TEXT NOT NULL CHECK (kategorie IN ('verkuerzung', 'abschwaechung', 'muster', 'stabilitaet')),
  test_name             TEXT NOT NULL,
  beschreibung          TEXT NOT NULL,
  normalbefund          TEXT NOT NULL,
  pathologischer_befund TEXT NOT NULL,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Read-only catalog: any authenticated user can read
ALTER TABLE janda_test_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "janda_catalog_select" ON janda_test_catalog
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_janda_region    ON janda_test_catalog(region);
CREATE INDEX IF NOT EXISTS idx_janda_kategorie ON janda_test_catalog(kategorie);
CREATE INDEX IF NOT EXISTS idx_janda_sort      ON janda_test_catalog(sort_order);

-- ── Seed: ~20 Janda tests organized by body region ──

INSERT INTO janda_test_catalog
  (region, muskel, kategorie, test_name, beschreibung, normalbefund, pathologischer_befund, sort_order)
VALUES
-- ─── Hüfte & Becken ── Verkürzung ──────────────────────────────────────
('Hüfte & Becken', 'M. Iliopsoas', 'verkuerzung', 'Thomas-Test',
 'Patient liegt in Rückenlage am Bankende. Ein Knie wird maximal zur Brust gezogen und festgehalten. Das andere Bein hängt frei über die Bankkante herunter.',
 'Das freie Bein hängt entspannt in leichter Extension über die Bankkante. Der Oberschenkel liegt horizontal oder leicht unterhalb der Horizontalen.',
 'Das freie Bein bleibt in Hüftflexion und kann die Horizontale nicht erreichen. Der Oberschenkel hebt von der Bank ab — Zeichen einer Verkürzung des M. Iliopsoas.',
 10),

('Hüfte & Becken', 'M. Rectus femoris', 'verkuerzung', 'Modifizierter Thomas-Test',
 'Gleiche Ausgangsstellung wie Thomas-Test. Zusätzlich wird der Kniewinkel des freihängenden Beins beobachtet.',
 'Das Knie des freihängenden Beins kann mindestens 80° Flexion erreichen, während der Oberschenkel horizontal bleibt.',
 'Das Knie des freihängenden Beins zeigt weniger als 80° Flexion und/oder der Oberschenkel hebt ab. Deutet auf Verkürzung des M. Rectus femoris hin.',
 20),

('Hüfte & Becken', 'M. piriformis', 'verkuerzung', 'FABER-Test (Patrick-Test)',
 'Patient liegt in Rückenlage. Der Fuß des Testbeins wird auf das gegenseitige Knie gelegt (Figur-4-Position). Der Therapeut drückt das Testknie sanft nach unten Richtung Bank.',
 'Das Knie des Testbeins kann bis auf Höhe des gegenüberliegenden Knies oder darunter gesenkt werden. Symmetrisch im Seitenvergleich.',
 'Das Testknie kann nicht auf Höhe des gegenüberliegenden Knies gesenkt werden. Seitendifferenz deutet auf Verkürzung des M. piriformis oder SI-Gelenkproblematik hin.',
 30),

-- ─── Hüfte & Becken ── Abschwächung ────────────────────────────────────
('Hüfte & Becken', 'M. gluteus maximus', 'abschwaechung', 'Hüftextensions-Test (Bauchlage)',
 'Patient liegt in Bauchlage. Er hebt das gestreckte Bein gegen die Schwerkraft an (Hüftextension). Der Therapeut beobachtet die Aktivierungsreihenfolge und Kraftentwicklung.',
 'Der Patient kann das Bein gegen die Schwerkraft anheben und kurz halten. Die Aktivierung beginnt im Gluteus maximus, dann ischiocrurale Muskulatur.',
 'Der Patient kann das Bein nur schwer oder gar nicht anheben. Ischiocrurale Muskulatur und Rückenstrecker kompensieren — Gluteus maximus aktiviert verspätet oder insuffizient.',
 40),

('Hüfte & Becken', 'M. gluteus medius', 'abschwaechung', 'Trendelenburg-Test',
 'Patient steht auf einem Bein (Standbeinseite wird getestet). Der Therapeut beobachtet das Becken von hinten. Mindestens 30 Sekunden halten lassen.',
 'Das Becken bleibt horizontal oder hebt sich leicht auf der Spielbeinseite an. Stabiles Standbein ohne seitliches Abkippen.',
 'Das Becken kippt auf der Spielbeinseite ab (Trendelenburg-Zeichen positiv). Der Oberkörper neigt sich zur Standbeinseite als Kompensation (Duchenne-Zeichen).',
 50),

-- ─── LWS ── Verkürzung ────────────────────────────────────────────────
('LWS', 'Ischiocrurale Muskulatur', 'verkuerzung', 'Straight Leg Raise (SLR)',
 'Patient liegt in Rückenlage. Der Therapeut hebt das gestreckte Bein langsam an. Der Winkel wird gemessen, ab dem ein Dehnungsgefühl in der Oberschenkelrückseite auftritt.',
 'Das Bein kann bis mindestens 80° angehoben werden ohne starkes Dehnungsgefühl oder Ausweichbewegungen des Beckens.',
 'Das Bein kann nur bis unter 70° angehoben werden. Frühzeitiges Dehnungsgefühl, Beckenkippung als Kompensation. Verkürzung der ischiocruralen Muskulatur wahrscheinlich.',
 60),

('LWS', 'M. quadratus lumborum', 'verkuerzung', 'Lateralflexions-Test',
 'Patient steht aufrecht. Er neigt den Oberkörper seitlich so weit wie möglich. Die Reichweite wird im Seitenvergleich beurteilt.',
 'Symmetrische Seitneigung von mindestens 25-30° beidseits. Die Fingerspitzen erreichen eine vergleichbare Höhe am Oberschenkel.',
 'Asymmetrische Seitneigung — die Neigung zur Gegenseite der verkürzten Muskulatur ist eingeschränkt. Seitendifferenz > 3 cm deutet auf Verkürzung hin.',
 70),

-- ─── LWS ── Abschwächung ──────────────────────────────────────────────
('LWS', 'Abdominale Muskulatur', 'abschwaechung', 'Curl-up-Test',
 'Patient liegt in Rückenlage, Knie gebeugt, Füße aufgestellt. Er hebt langsam Kopf und Schulterblätter von der Unterlage ab (Crunch). Arme können vor der Brust gekreuzt oder an den Schläfen gehalten werden.',
 'Der Patient kann die Schulterblätter kontrolliert von der Unterlage lösen und die Position kurz halten. Keine übermäßige Lordosierung der LWS.',
 'Der Patient kann die Schulterblätter nicht oder nur mit Schwung lösen. Hüftbeuger kompensieren (Füße heben ab). Hinweis auf Abschwächung der abdominalen Muskulatur.',
 80),

('LWS', 'Rückenstrecker (M. erector spinae)', 'abschwaechung', 'Biering-Sørensen-Test',
 'Patient liegt in Bauchlage, Oberkörper ragt über die Bankkante hinaus. Die Beine werden fixiert. Der Patient hält den Oberkörper horizontal so lange wie möglich.',
 'Der Patient kann die Position mindestens 60 Sekunden halten ohne Zittern oder Absenken des Oberkörpers.',
 'Der Patient kann die Position weniger als 60 Sekunden halten, der Oberkörper senkt sich frühzeitig ab. Muskuläre Ermüdung der Rückenstrecker.',
 90),

-- ─── BWS & Schulter ── Verkürzung ─────────────────────────────────────
('BWS & Schulter', 'M. pectoralis major', 'verkuerzung', 'Schulterhorizontalabduktions-Test',
 'Patient liegt in Rückenlage. Der Arm wird in 90° Abduktion und 90° Ellbogenbeugung gebracht, dann in horizontale Abduktion fallen gelassen.',
 'Der Arm fällt entspannt auf Bankniveau oder leicht darunter. Kein Zug in der Brustmuskulatur spürbar.',
 'Der Arm bleibt oberhalb der Horizontalen stehen und kann nicht auf Bankniveau abgesenkt werden. Spannungsgefühl in der vorderen Brustmuskulatur.',
 100),

('BWS & Schulter', 'M. trapezius (oberer Anteil)', 'verkuerzung', 'Schulter-Nacken-Dehntest',
 'Patient sitzt aufrecht. Der Therapeut fixiert die Schulter mit einer Hand und neigt den Kopf passiv zur Gegenseite. Der Bewegungsumfang wird im Seitenvergleich beurteilt.',
 'Symmetrische Lateralflexion der HWS von mindestens 40° beidseits. Kein frühzeitiges Spannungsgefühl.',
 'Eingeschränkte Lateralflexion zur Gegenseite (< 40°). Frühzeitiger Widerstand und Spannungsgefühl im seitlichen Nackenbereich. Schulter wird unwillkürlich hochgezogen.',
 110),

-- ─── BWS & Schulter ── Abschwächung ───────────────────────────────────
('BWS & Schulter', 'M. serratus anterior', 'abschwaechung', 'Wall Push-up / Scapula-Push-up',
 'Patient steht vor einer Wand und führt einen Liegestütz gegen die Wand aus. Der Therapeut beobachtet die Scapula (Schulterblatt) von hinten.',
 'Die Scapulae bleiben flach am Thorax anliegend. Kein Abheben der medialen Ränder oder der Angulus inferior sichtbar.',
 'Scapula alata: Der mediale Rand oder Angulus inferior der Scapula hebt sich vom Thorax ab. Zeichen einer Insuffizienz des M. serratus anterior.',
 120),

('BWS & Schulter', 'M. trapezius (mittlerer/unterer Anteil)', 'abschwaechung', 'Arm-Elevations-Test (Bauchlage)',
 'Patient liegt in Bauchlage. Die Arme werden in Y-Position (schräg über Kopf) angehoben. Der Therapeut beobachtet die Scapula-Kontrolle.',
 'Der Patient kann beide Arme in Y-Position anheben und kurz halten. Scapulae bleiben stabil und gleiten kontrolliert nach medial.',
 'Der Patient kann die Arme nicht oder nur kurz anheben. Scapulae weichen nach lateral aus oder heben ab. Hinweis auf Abschwächung des mittleren/unteren Trapezius.',
 130),

-- ─── Nacken ── Verkürzung ─────────────────────────────────────────────
('Nacken', 'M. sternocleidomastoideus', 'verkuerzung', 'HWS-Rotations-Test',
 'Patient sitzt aufrecht. Der Therapeut dreht den Kopf passiv zur Seite. Der Bewegungsumfang wird beidseits verglichen.',
 'Symmetrische Rotation von mindestens 70-80° beidseits. Kein frühzeitiger Widerstand.',
 'Eingeschränkte Rotation zur Gegenseite (< 70°). Frühzeitiger Widerstand. Verkürzung des M. sternocleidomastoideus auf der eingeschränkten Seite.',
 140),

-- ─── Nacken ── Abschwächung ───────────────────────────────────────────
('Nacken', 'Tiefe Nackenflexoren', 'abschwaechung', 'Chin-Tuck-Test (Cranio-Cervicale Flexion)',
 'Patient liegt in Rückenlage. Er wird gebeten, ein leichtes Kinnnicken (Chin Tuck) durchzuführen und die Position 10 Sekunden zu halten.',
 'Der Patient kann das Kinn kontrolliert einziehen und 10 Sekunden halten ohne Zittern. Die oberflächliche Halsmuskulatur (SCM) bleibt weitgehend entspannt.',
 'Der Patient kann die Position nicht halten, zeigt Zittern oder aktiviert hauptsächlich den M. sternocleidomastoideus anstelle der tiefen Nackenflexoren.',
 150),

-- ─── Knie & Unterschenkel ── Verkürzung ───────────────────────────────
('Knie & Unterschenkel', 'M. tensor fasciae latae / Tractus iliotibialis', 'verkuerzung', 'Ober-Test',
 'Patient liegt in Seitlage (Testbein oben). Das untere Bein wird zur Stabilisierung gebeugt. Der Therapeut abduziert und extendiert das obere Bein, dann lässt er es in Adduktion absinken.',
 'Das obere Bein sinkt entspannt bis auf Tischniveau oder darunter ab. Der Tractus iliotibialis ist ausreichend dehnbar.',
 'Das obere Bein bleibt in Abduktion stehen und kann nicht auf Tischniveau abgesenkt werden. Positiver Ober-Test deutet auf Verkürzung des TFL/Tractus iliotibialis hin.',
 160),

-- ─── Knie & Unterschenkel ── Abschwächung ─────────────────────────────
('Knie & Unterschenkel', 'M. vastus medialis obliquus (VMO)', 'abschwaechung', 'VMO-Aktivierungstest',
 'Patient sitzt mit gestrecktem Bein. Er spannt den Quadrizeps an und versucht, die Patella nach medial zu bewegen. Der Therapeut palpiert den VMO oberhalb des medialen Kniegelenkspalts.',
 'Der VMO kontrahiert kräftig und sichtbar. Die Patella bewegt sich nach medial. Gute isometrische Haltefähigkeit über mehrere Sekunden.',
 'Der VMO kontrahiert schwach oder gar nicht. Die Patella gleitet nach lateral (Lateralisation). Hinweis auf VMO-Insuffizienz, häufig bei patellofemoralen Beschwerden.',
 170),

-- ─── Übergreifend ── Funktionelle Tests ───────────────────────────────
('Übergreifend', 'Mehrgelenkige Kette', 'muster', 'Deep Squat Assessment',
 'Patient steht hüftbreit. Die Arme werden über Kopf gehoben (Stange oder Hände). Er geht so tief wie möglich in die Hocke. Beurteilt werden: Fußstellung, Knie-Alignment, LWS-Kontrolle, Brustwirbelsäulen-Extension, Armposition.',
 'Tiefe Hocke möglich mit Fersen am Boden, Knie über den Zehen (nicht Valgus), LWS in neutraler Position, Arme bleiben über Kopf. Symmetrische Bewegung.',
 'Fersen heben ab (Wadenverkürzung), Knie fallen nach innen (Valgus — Glut-med-Schwäche), LWS rundet (Butt Wink — ischiocrurale Verkürzung), Arme fallen nach vorn (BWS/Schulter-Einschränkung).',
 180),

('Übergreifend', 'Einbeinstand-Stabilität', 'stabilitaet', 'Star Excursion Balance Test (Y-Balance)',
 'Patient steht auf einem Bein. Mit dem freien Bein reicht er in drei Richtungen (anterior, posteromedial, posterolateral) so weit wie möglich. Die Reichweite wird gemessen und im Seitenvergleich beurteilt.',
 'Symmetrische Reichweiten im Seitenvergleich (< 4 cm Unterschied). Stabiler Einbeinstand ohne übermäßiges Schwanken. Gleichmäßige Reichweite in allen Richtungen.',
 'Asymmetrie > 4 cm im Seitenvergleich. Instabilität oder Absetzen des Fußes. Eingeschränkte Reichweite deutet auf neuromuskuläre Defizite, Instabilität oder Beweglichkeitseinschränkungen der Standbeinseite hin.',
 190);


-- ################################################################
-- 3. FUNKTIONSUNTERSUCHUNGEN TABLE
-- ################################################################

CREATE TABLE IF NOT EXISTS funktionsuntersuchungen (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Auto-increment per patient (same pattern as anamnesis_records)
  version      INTEGER NOT NULL DEFAULT 1,

  status       TEXT NOT NULL DEFAULT 'entwurf'
                 CHECK (status IN ('entwurf', 'abgeschlossen')),

  -- JSONB: All form data stored flexibly
  -- Structure:
  --   hauptbeschwerde, beschwerdedauer, sportliche_aktivitaet, trainingsziele,
  --   haltungsanalyse, gangbildanalyse,
  --   janda_tests: [{ catalog_id, befund: 'normal'|'leicht_auffaellig'|'deutlich_auffaellig', notiz }],
  --   trainingsempfehlung
  data         JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- updated_at trigger (reuses set_updated_at from PROJ-2)
DROP TRIGGER IF EXISTS trg_funktionsuntersuchungen_updated_at ON funktionsuntersuchungen;
CREATE TRIGGER trg_funktionsuntersuchungen_updated_at
  BEFORE UPDATE ON funktionsuntersuchungen
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-increment version per patient
CREATE OR REPLACE FUNCTION set_funktionsuntersuchung_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
    INTO NEW.version
    FROM funktionsuntersuchungen
   WHERE patient_id = NEW.patient_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_funktionsuntersuchung_version ON funktionsuntersuchungen;
CREATE TRIGGER trg_funktionsuntersuchung_version
  BEFORE INSERT ON funktionsuntersuchungen
  FOR EACH ROW EXECUTE FUNCTION set_funktionsuntersuchung_version();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fu_patient_id      ON funktionsuntersuchungen(patient_id);
CREATE INDEX IF NOT EXISTS idx_fu_patient_created  ON funktionsuntersuchungen(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fu_created_by       ON funktionsuntersuchungen(created_by);
CREATE INDEX IF NOT EXISTS idx_fu_status           ON funktionsuntersuchungen(status);
CREATE INDEX IF NOT EXISTS idx_fu_data_gin         ON funktionsuntersuchungen USING GIN (data);

-- RLS
ALTER TABLE funktionsuntersuchungen ENABLE ROW LEVEL SECURITY;

-- SELECT: Trainer sees own patients, Praxismanagement reads all, Admin reads all
CREATE POLICY "fu_select" ON funktionsuntersuchungen
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (
      get_my_role() IN ('praeventionstrainer', 'personal_trainer')
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = funktionsuntersuchungen.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- INSERT: Only Trainer roles for own patients
CREATE POLICY "fu_insert" ON funktionsuntersuchungen
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    OR (
      get_my_role() IN ('praeventionstrainer', 'personal_trainer')
      AND created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = funktionsuntersuchungen.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- UPDATE: Only drafts, only original creator
CREATE POLICY "fu_update" ON funktionsuntersuchungen
  FOR UPDATE
  USING (
    status = 'entwurf'
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() IN ('praeventionstrainer', 'personal_trainer')
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = funktionsuntersuchungen.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    status = 'entwurf'
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() IN ('praeventionstrainer', 'personal_trainer')
        AND created_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = funktionsuntersuchungen.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- DELETE: Forbidden (DSGVO)
CREATE POLICY "fu_delete" ON funktionsuntersuchungen
  FOR DELETE USING (false);


-- ################################################################
-- 4. TRAINING_DOCUMENTATIONS TABLE
-- ################################################################

CREATE TABLE IF NOT EXISTS training_documentations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by       UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- 'training' = Prävention / Training (simplified)
  -- 'therapeutisch' = Therapeutisch / KG / KGG (full clinical fields)
  typ              TEXT NOT NULL DEFAULT 'training'
                     CHECK (typ IN ('training', 'therapeutisch')),

  session_date     DATE NOT NULL,

  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR (duration_minutes >= 1 AND duration_minutes <= 480)),

  status           TEXT NOT NULL DEFAULT 'entwurf'
                     CHECK (status IN ('entwurf', 'abgeschlossen')),

  -- JSONB: flexible data per mode
  -- 'training': { trainingsart, schwerpunkt, uebungen: [...], anmerkung, naechstes_training }
  -- 'therapeutisch': { massnahmen: [...], nrs_before, nrs_after, befund, notizen, naechste_schritte }
  data             JSONB NOT NULL DEFAULT '{}'::JSONB,

  confirmed_at     TIMESTAMPTZ,
  locked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

-- locked_at trigger (same pattern as treatment_sessions)
CREATE OR REPLACE FUNCTION set_training_doc_locked_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.locked_at := NEW.created_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_training_doc_locked_at ON training_documentations;
CREATE TRIGGER trg_training_doc_locked_at
  BEFORE INSERT ON training_documentations
  FOR EACH ROW EXECUTE FUNCTION set_training_doc_locked_at();

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_training_doc_updated_at ON training_documentations;
CREATE TRIGGER trg_training_doc_updated_at
  BEFORE UPDATE ON training_documentations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_td_patient_id    ON training_documentations(patient_id);
CREATE INDEX IF NOT EXISTS idx_td_patient_date  ON training_documentations(patient_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_td_created_by    ON training_documentations(created_by);
CREATE INDEX IF NOT EXISTS idx_td_typ           ON training_documentations(typ);
CREATE INDEX IF NOT EXISTS idx_td_status        ON training_documentations(status);

-- RLS
ALTER TABLE training_documentations ENABLE ROW LEVEL SECURITY;

-- SELECT: Trainer sees own patients, Praxismanagement reads all
CREATE POLICY "td_select" ON training_documentations
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (
      get_my_role() IN ('praeventionstrainer', 'personal_trainer')
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = training_documentations.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- INSERT: Only Trainer roles for own patients
CREATE POLICY "td_insert" ON training_documentations
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() IN ('praeventionstrainer', 'personal_trainer')
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = training_documentations.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- UPDATE: Only within 24h edit window
CREATE POLICY "td_update" ON training_documentations
  FOR UPDATE
  USING (
    get_my_role() = 'admin'
    OR (
      NOW() < locked_at
      AND get_my_role() IN ('praeventionstrainer', 'personal_trainer')
      AND created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = training_documentations.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR get_my_role() = 'admin'
  );

-- DELETE: Forbidden (DSGVO)
CREATE POLICY "td_delete" ON training_documentations
  FOR DELETE USING (false);


-- ################################################################
-- 5. EXTEND MEDICAL_REPORTS FOR FUNKTIONSANALYSE
-- ################################################################

-- Extend generated_by_role CHECK to include new roles
ALTER TABLE medical_reports
  DROP CONSTRAINT IF EXISTS medical_reports_generated_by_role_check;
ALTER TABLE medical_reports
  ADD CONSTRAINT medical_reports_generated_by_role_check
  CHECK (generated_by_role IN ('heilpraktiker', 'physiotherapeut', 'admin', 'praeventionstrainer', 'personal_trainer'));

-- Extend report_type CHECK to include funktionsanalyse
ALTER TABLE medical_reports
  DROP CONSTRAINT IF EXISTS medical_reports_report_type_check;
ALTER TABLE medical_reports
  ADD CONSTRAINT medical_reports_report_type_check
  CHECK (report_type IN ('arztbericht', 'therapiebericht', 'funktionsanalyse'));


-- ################################################################
-- 6. UPDATE EXISTING RLS POLICIES FOR NEW ROLES
-- ################################################################

-- ── patients ─────────────────────────────────────────────────────────
-- Praxismanagement: sees ALL patients (read-only at API level)
-- Praeventionstrainer + Personal Trainer: see own patients (like Physio)
DROP POLICY IF EXISTS "patients_select" ON patients;
CREATE POLICY "patients_select" ON patients
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer')
        AND therapeut_id = auth.uid())
    OR user_id = auth.uid()
  );

-- INSERT: New roles can create patients (assigned to themselves)
DROP POLICY IF EXISTS "patients_insert" ON patients;
CREATE POLICY "patients_insert" ON patients
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    OR (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer', 'praxismanagement')
      AND therapeut_id = auth.uid()
    )
  );

-- UPDATE: Trainer roles update own patients, Praxismanagement can update ANY patient
-- (Stammdaten-only restriction enforced at API level for Praxismanagement)
DROP POLICY IF EXISTS "patients_update" ON patients;
CREATE POLICY "patients_update" ON patients
  FOR UPDATE
  USING (
    get_my_role() = 'admin'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer')
        AND therapeut_id = auth.uid())
    OR get_my_role() = 'praxismanagement'
  )
  WITH CHECK (
    get_my_role() = 'admin'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer')
        AND therapeut_id = auth.uid())
    OR get_my_role() = 'praxismanagement'
  );

-- ── anamnesis_records ────────────────────────────────────────────────
-- Praxismanagement: read-only access
DROP POLICY IF EXISTS "anamnesis_select" ON anamnesis_records;
CREATE POLICY "anamnesis_select" ON anamnesis_records
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = anamnesis_records.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ── treatment_sessions ──────────────────────────────────────────────
-- Praxismanagement: read-only access
DROP POLICY IF EXISTS "treatment_sessions_select" ON treatment_sessions;
CREATE POLICY "treatment_sessions_select" ON treatment_sessions
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (
      get_my_role() IN ('physiotherapeut', 'heilpraktiker')
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = treatment_sessions.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ── diagnoses ───────────────────────────────────────────────────────
-- Praxismanagement: read-only access
DROP POLICY IF EXISTS "diagnoses_select" ON diagnoses;
CREATE POLICY "diagnoses_select" ON diagnoses
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (
      get_my_role() = 'heilpraktiker'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = diagnoses.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- ── chat_messages ───────────────────────────────────────────────────
-- Praxismanagement: read-only access (all patient chats)
DROP POLICY IF EXISTS "chat_select" ON chat_messages;
CREATE POLICY "chat_select" ON chat_messages
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = chat_messages.patient_id
        AND p.therapeut_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = chat_messages.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- ── medical_reports ─────────────────────────────────────────────────
-- Add Praeventionstrainer/PT read for funktionsanalyse + Praxismanagement read-all
DROP POLICY IF EXISTS "medical_reports_select" ON medical_reports;
CREATE POLICY "medical_reports_select" ON medical_reports
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR get_my_role() = 'praxismanagement'
    OR (
      get_my_role() = 'heilpraktiker'
      AND report_type = 'arztbericht'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = medical_reports.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
    OR (
      get_my_role() = 'physiotherapeut'
      AND report_type = 'therapiebericht'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = medical_reports.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
    OR (
      get_my_role() IN ('praeventionstrainer', 'personal_trainer')
      AND report_type = 'funktionsanalyse'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = medical_reports.patient_id
          AND p.therapeut_id = auth.uid()
      )
    )
  );

-- INSERT: Add Trainer roles for funktionsanalyse
DROP POLICY IF EXISTS "medical_reports_insert" ON medical_reports;
CREATE POLICY "medical_reports_insert" ON medical_reports
  FOR INSERT WITH CHECK (
    generated_by = auth.uid()
    AND (
      get_my_role() = 'admin'
      OR (
        get_my_role() = 'heilpraktiker'
        AND report_type = 'arztbericht'
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = medical_reports.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
      OR (
        get_my_role() = 'physiotherapeut'
        AND report_type = 'therapiebericht'
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = medical_reports.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
      OR (
        get_my_role() IN ('praeventionstrainer', 'personal_trainer')
        AND report_type = 'funktionsanalyse'
        AND EXISTS (
          SELECT 1 FROM patients p
          WHERE p.id = medical_reports.patient_id
            AND p.therapeut_id = auth.uid()
        )
      )
    )
  );

-- UPDATE: Add Trainer roles
DROP POLICY IF EXISTS "medical_reports_update" ON medical_reports;
CREATE POLICY "medical_reports_update" ON medical_reports
  FOR UPDATE
  USING (
    get_my_role() = 'admin'
    OR (
      generated_by = auth.uid()
      AND status = 'entwurf'
      AND get_my_role() IN ('heilpraktiker', 'physiotherapeut', 'praeventionstrainer', 'personal_trainer')
    )
  )
  WITH CHECK (
    generated_by = auth.uid()
    OR get_my_role() = 'admin'
  );

-- ── courses (PROJ-13) ───────────────────────────────────────────────
-- Add Praeventionstrainer/PT access
DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses
  FOR SELECT USING (
    get_my_role() = 'admin'
    OR (get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer')
        AND (created_by = auth.uid() OR status = 'aktiv'))
    OR (get_my_role() = 'patient' AND status = 'aktiv' AND is_archived = FALSE)
  );

DROP POLICY IF EXISTS "courses_insert" ON courses;
CREATE POLICY "courses_insert" ON courses
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer', 'admin')
  );

-- course_enrollments INSERT: add new roles
DROP POLICY IF EXISTS "ce_insert" ON course_enrollments;
CREATE POLICY "ce_insert" ON course_enrollments
  FOR INSERT WITH CHECK (
    get_my_role() IN ('physiotherapeut', 'heilpraktiker', 'praeventionstrainer', 'personal_trainer', 'admin')
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = course_enrollments.patient_id
        AND p.user_id = auth.uid()
    )
  );


-- ################################################################
-- 7. GRANT FUNCTION ACCESS
-- ################################################################

GRANT EXECUTE ON FUNCTION set_funktionsuntersuchung_version() TO authenticated;
GRANT EXECUTE ON FUNCTION set_training_doc_locked_at() TO authenticated;

-- ################################################################
-- Done.
-- After running this migration:
--   1. Verify new tables: SELECT * FROM janda_test_catalog; (should return 20 rows)
--   2. Test new roles: INSERT INTO user_profiles (id, role, ...) VALUES (..., 'praeventionstrainer', ...)
--   3. Test RLS: Login as praxismanagement → SELECT * FROM patients; (should see ALL patients)
--   4. Test RLS: Login as praeventionstrainer → SELECT * FROM patients; (only own)
--   5. Test RLS: Login as praeventionstrainer → INSERT INTO funktionsuntersuchungen ... (should work)
--   6. Test medical_reports: Verify funktionsanalyse type can be created by trainer roles
-- ################################################################
