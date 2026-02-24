-- PROJ-15: Orthopädische Spezialtests Katalog
-- ~30 klinische Tests nach Region

CREATE TABLE IF NOT EXISTS ortho_test_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  kategorie TEXT NOT NULL,
  test_name TEXT NOT NULL,
  beschreibung TEXT,
  positiver_befund TEXT,
  klinische_relevanz TEXT,
  sort_order INT DEFAULT 0
);

-- RLS
ALTER TABLE ortho_test_catalog ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read
CREATE POLICY "ortho_test_catalog_read"
  ON ortho_test_catalog FOR SELECT
  TO authenticated
  USING (true);

-- ── Schulter (7) ──────────────────────────────────────────────────────────────

INSERT INTO ortho_test_catalog (region, kategorie, test_name, beschreibung, positiver_befund, klinische_relevanz, sort_order) VALUES
('Schulter', 'Impingement', 'Hawkins-Kennedy-Test',
 'Schulter 90° Flexion, dann forcierte Innenrotation des Unterarms.',
 'Schmerz im Bereich der Rotatorenmanschette bei Innenrotation.',
 'Subakromiales Impingement, Supraspinatustendinopathie', 10),

('Schulter', 'Impingement', 'Neer-Test',
 'Passives Anheben des gestreckten Arms in Flexion bei fixierter Scapula.',
 'Schmerz bei >90° Flexion im Schulterbereich.',
 'Subakromiales Impingement', 11),

('Schulter', 'Rotatorenmanschette', 'Jobe-Test (Empty Can)',
 'Arm 90° Abduktion, 30° Horizontalflexion, Daumen nach unten. Widerstand gegen Abduktion.',
 'Schmerz oder Kraftverlust bei Widerstand.',
 'Supraspinatusläsion/-ruptur', 12),

('Schulter', 'Rotatorenmanschette', 'Drop-Arm-Test',
 'Patient hält Arm in 90° Abduktion, soll langsam absenken.',
 'Arm fällt unkontrolliert ab oder starke Schmerzen.',
 'Komplette Supraspinatusruptur', 13),

('Schulter', 'Bizepssehne', 'Speed-Test',
 'Arm 90° Flexion, Supination, Ellbogen gestreckt. Widerstand gegen Flexion.',
 'Schmerz im Sulcus bicipitalis.',
 'Bizepssehnentendinopathie, SLAP-Läsion', 14),

('Schulter', 'Labrum', 'O''Brien-Test (Active Compression)',
 'Arm 90° Flexion, 10° Adduktion. Pronation + Druck vs. Supination + Druck.',
 'Schmerz bei Pronation, Besserung bei Supination.',
 'SLAP-Läsion, AC-Gelenkpathologie', 15),

('Schulter', 'Instabilität', 'Apprehension-Test',
 'Rückenlage, 90° Abduktion, 90° Ellbogenflexion, passive Außenrotation.',
 'Angstgefühl/Abwehr des Patienten, Schmerz.',
 'Vordere Schulterinstabilität/-luxation', 16),

-- ── Knie (7) ──────────────────────────────────────────────────────────────────

('Knie', 'Bandstabilität', 'Lachman-Test',
 'Knie 20-30° Flexion, Femur fixieren, Tibia nach ventral ziehen.',
 'Vermehrte anteriore Translation, weicher Anschlag.',
 'VKB-Ruptur (vorderes Kreuzband)', 20),

('Knie', 'Bandstabilität', 'Vordere Schublade',
 'Knie 90° Flexion, Fuß fixiert, Tibia nach ventral ziehen.',
 'Vermehrte anteriore Translation >6mm.',
 'VKB-Insuffizienz', 21),

('Knie', 'Bandstabilität', 'Hintere Schublade',
 'Knie 90° Flexion, Tibia nach dorsal drücken.',
 'Vermehrte posteriore Translation.',
 'HKB-Ruptur (hinteres Kreuzband)', 22),

('Knie', 'Meniskus', 'McMurray-Test',
 'Knie maximale Flexion, Rotation + Extension. Außenrotation = Innenmeniskus, Innenrotation = Außenmeniskus.',
 'Schnappen, Klicken oder Schmerz im Gelenkspalt.',
 'Meniskusriss', 23),

('Knie', 'Meniskus', 'Apley-Grinding-Test',
 'Bauchlage, Knie 90° Flexion, axialer Druck + Rotation auf Tibia.',
 'Schmerz im Gelenkspalt bei Kompression + Rotation.',
 'Meniskusläsion', 24),

('Knie', 'Bandstabilität', 'Valgus-Stress-Test',
 'Knie leicht gebeugt (20-30°), Valgus-Stress von lateral.',
 'Aufklappbarkeit medial, Schmerz.',
 'MCL-Insuffizienz (mediales Seitenband)', 25),

('Knie', 'Patella', 'Patella-Apprehension-Test',
 'Knie in Streckung, Patella nach lateral schieben.',
 'Angstreaktion, Abwehr, Schmerz des Patienten.',
 'Patellaluxation/-instabilität', 26),

-- ── Hüfte (4) ─────────────────────────────────────────────────────────────────

('Hüfte', 'Impingement', 'FADIR-Test',
 'Rückenlage: Hüfte 90° Flexion + Adduktion + Innenrotation.',
 'Leistenschmerz bei der Kombinationsbewegung.',
 'Femoroacetabuläres Impingement (FAI)', 30),

('Hüfte', 'Impingement', 'FABER-Test (Patrick)',
 'Rückenlage: Fuß auf kontralaterales Knie, Knie nach lateral drücken.',
 'Leistenschmerz (Hüfte) oder Schmerz dorsal (SIG).',
 'Hüftgelenk- oder SIG-Pathologie', 31),

('Hüfte', 'Muskulär', 'Thomas-Test',
 'Rückenlage am Bankrand, kontralaterales Knie zur Brust ziehen.',
 'Oberschenkel der Testseite hebt sich von der Bank.',
 'Hüftbeuger-Verkürzung (M. iliopsoas)', 32),

('Hüfte', 'Muskulär', 'Trendelenburg-Test',
 'Einbeinstand auf der Testseite, Becken beobachten.',
 'Kontralaterales Becken sinkt ab.',
 'Gluteus-medius-Insuffizienz', 33),

-- ── HWS (3) ───────────────────────────────────────────────────────────────────

('HWS', 'Nervenwurzel', 'Spurling-Test',
 'HWS-Extension + Lateralflexion zur betroffenen Seite + axiale Kompression.',
 'Ausstrahlung in den Arm (radikulärer Schmerz).',
 'Zervikale Nervenwurzelkompression', 40),

('HWS', 'Nervenwurzel', 'Distraktionstest',
 'Axialer Zug am Kopf (manuell oder mit Tuch).',
 'Schmerzreduktion bei Traktion.',
 'Zervikale Nervenwurzelkompression (Bestätigung)', 41),

('HWS', 'Instabilität', 'Sharp-Purser-Test',
 'Sitzend, HWS leicht flektiert. Druck auf Processus spinosus C2 nach dorsal.',
 'Gleitbewegung spürbar, Klickphänomen.',
 'Atlantoaxiale Instabilität (C1/C2)', 42),

-- ── LWS (4) ───────────────────────────────────────────────────────────────────

('LWS', 'Nervenwurzel', 'Lasègue-Test (SLR)',
 'Rückenlage, gestrecktes Bein passiv anheben.',
 'Radikulärer Schmerz im Bein bei 30-70° Hüftflexion.',
 'Bandscheibenvorfall L4-S1, Irritation N. ischiadicus', 50),

('LWS', 'Nervenwurzel', 'Bragard-Test',
 'Wie Lasègue, aber bei einsetzender Schmerzangabe das Bein leicht absenken, dann Dorsalextension des Fußes.',
 'Erneuter radikulärer Schmerz bei Dorsalextension.',
 'Bestätigung Nervenwurzelreizung (Lasègue-Verstärkung)', 51),

('LWS', 'Nervenwurzel', 'Slump-Test',
 'Sitzend: BWS-Flexion, HWS-Flexion (Kinn zur Brust), dann Kniestreckung + Dorsalextension Fuß.',
 'Reproduktion der radikulären Symptome.',
 'Neurale Mobilität eingeschränkt, durale Spannung', 52),

('LWS', 'SIG', 'SIG-Provokationstest',
 'Verschiedene Provokationstests: Kompression, Distraktion, Gaenslen, Thigh Thrust.',
 'Schmerz im Bereich des Iliosakralgelenks (≥3 von 5 Tests positiv = signifikant).',
 'SIG-Dysfunktion', 53),

-- ── Sprunggelenk (3) ─────────────────────────────────────────────────────────

('Sprunggelenk', 'Achillessehne', 'Thompson-Test',
 'Bauchlage, Wadenkompression (Kneten der Wade).',
 'Keine Plantarflexion des Fußes bei Kompression.',
 'Achillessehnenruptur', 60),

('Sprunggelenk', 'Bandstabilität', 'Vordere Schublade OSG',
 'Knie 90° Flexion, eine Hand fixiert Tibia, andere zieht Kalkaneus/Talus nach ventral.',
 'Vermehrte anteriore Translation, weicher Anschlag.',
 'Lig. talofibulare anterius Ruptur (Außenbandruptur)', 61),

('Sprunggelenk', 'Bandstabilität', 'Talar-Tilt-Test',
 'Fuß in Neutralstellung, Talus in Inversion kippen.',
 'Vermehrte Aufklappbarkeit im Vergleich zur Gegenseite.',
 'Laterale Bandinstabilität OSG', 62);
