-- PROJ-8: Seed-Daten — 15 Beispielübungen (idempotent, überspringt existierende per Name)
-- Diese Migration löst das Problem, dass 20260220000024 übersprungen wurde,
-- weil die Tabelle bereits eine Übung enthielt.

DO $$
DECLARE
  v_owner UUID;
  v_inserted INT := 0;
BEGIN
  -- Finde den ersten Admin-User als Owner
  SELECT id INTO v_owner
  FROM user_profiles
  WHERE role = 'admin'
  LIMIT 1;

  -- Fallback: erster User überhaupt
  IF v_owner IS NULL THEN
    SELECT id INTO v_owner
    FROM auth.users
    LIMIT 1;
  END IF;

  -- Wenn gar kein User existiert, abbrechen
  IF v_owner IS NULL THEN
    RAISE NOTICE 'Kein User gefunden — Seed übersprungen.';
    RETURN;
  END IF;

  -- 1. Kniebeuge
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Kniebeuge',
    'Grundübung für die gesamte Beinmuskulatur. Stärkt Oberschenkel, Gesäß und Rumpf.',
    ARRAY['Oberschenkel', 'Gesäß', 'Core'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich schulterbreit hin, Füße leicht nach außen gedreht."},{"nummer":2,"beschreibung":"Beuge die Knie und senke das Gesäß ab, als würdest du dich auf einen Stuhl setzen."},{"nummer":3,"beschreibung":"Halte den Rücken gerade und die Knie hinter den Zehenspitzen."},{"nummer":4,"beschreibung":"Drücke dich über die Fersen wieder hoch in die Ausgangsposition."}]'::jsonb,
    3, 12, 60, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Kniebeuge');
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  -- 2. Brücke
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Brücke (Bridge)',
    'Aktiviert die Gesäßmuskulatur und stabilisiert die Lendenwirbelsäule. Besonders wichtig bei Rückenbeschwerden.',
    ARRAY['Gesäß', 'Rücken', 'Oberschenkel'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Lege dich auf den Rücken, stelle die Füße hüftbreit auf, Knie gebeugt."},{"nummer":2,"beschreibung":"Drücke die Hüfte nach oben, bis Oberschenkel und Oberkörper eine Linie bilden."},{"nummer":3,"beschreibung":"Spanne den Po oben fest an und halte kurz."},{"nummer":4,"beschreibung":"Senke die Hüfte langsam wieder ab."}]'::jsonb,
    3, 15, 45, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Brücke (Bridge)');

  -- 3. Plank
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Plank (Unterarmstütz)',
    'Ganzkörper-Stabilisationsübung für den Rumpf. Verbessert Körperhaltung und schützt die Wirbelsäule.',
    ARRAY['Core', 'Schulter', 'Rücken'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Gehe in den Unterarmstütz: Ellenbogen unter den Schultern, Körper bildet eine gerade Linie."},{"nummer":2,"beschreibung":"Spanne Bauch und Gesäß fest an."},{"nummer":3,"beschreibung":"Halte die Position ohne durchzuhängen."},{"nummer":4,"beschreibung":"Atme gleichmäßig weiter."}]'::jsonb,
    3, 1, 60, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Plank (Unterarmstütz)');

  -- 4. Ausfallschritt
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Ausfallschritt',
    'Einseitige Beinübung für Kraft und Gleichgewicht. Trainiert besonders den vorderen Oberschenkel und das Gesäß.',
    ARRAY['Oberschenkel', 'Gesäß', 'Wade'],
    'mittel',
    '[{"nummer":1,"beschreibung":"Stehe aufrecht, Hände an der Hüfte."},{"nummer":2,"beschreibung":"Mache einen großen Schritt nach vorne und beuge beide Knie auf ca. 90°."},{"nummer":3,"beschreibung":"Das hintere Knie schwebt knapp über dem Boden."},{"nummer":4,"beschreibung":"Drücke dich über den vorderen Fuß zurück in die Ausgangsposition."}]'::jsonb,
    3, 10, 60, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Ausfallschritt');

  -- 5. Schulterblattziehen
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Schulterblattziehen',
    'Aktiviert die Muskulatur zwischen den Schulterblättern. Wichtig bei Schulterproblemen und schlechter Haltung.',
    ARRAY['Rücken', 'Schulter'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stehe oder sitze aufrecht, Arme hängen locker."},{"nummer":2,"beschreibung":"Ziehe die Schulterblätter zusammen, als wolltest du einen Stift dazwischen klemmen."},{"nummer":3,"beschreibung":"Halte die Spannung 5 Sekunden."},{"nummer":4,"beschreibung":"Löse langsam und wiederhole."}]'::jsonb,
    3, 15, 30, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Schulterblattziehen');

  -- 6. Wandsitzen
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Wandsitzen',
    'Isometrische Übung für die Oberschenkelmuskulatur. Ideal nach Knie-TEP und bei Arthrose.',
    ARRAY['Oberschenkel', 'Gesäß'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Lehne dich mit dem Rücken an eine Wand."},{"nummer":2,"beschreibung":"Rutsche nach unten, bis die Oberschenkel waagerecht sind."},{"nummer":3,"beschreibung":"Halte die Position — Rücken bleibt an der Wand."},{"nummer":4,"beschreibung":"Drücke dich nach der Haltezeit wieder hoch."}]'::jsonb,
    3, 1, 60, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Wandsitzen');

  -- 7. Katzenbuckel-Pferderücken
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Katzenbuckel-Pferderücken',
    'Mobilisiert die gesamte Wirbelsäule und löst Verspannungen. Perfekt als Aufwärmübung.',
    ARRAY['Rücken', 'Core'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Gehe in den Vierfüßlerstand: Hände unter Schultern, Knie unter Hüfte."},{"nummer":2,"beschreibung":"Katzenbuckel: Runde den Rücken nach oben, Kinn zur Brust."},{"nummer":3,"beschreibung":"Pferderücken: Senke den Bauch ab, hebe den Kopf."},{"nummer":4,"beschreibung":"Wechsle fließend zwischen beiden Positionen."}]'::jsonb,
    3, 10, 30, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Katzenbuckel-Pferderücken');

  -- 8. Seitlicher Unterarmstütz
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Seitlicher Unterarmstütz',
    'Kräftigt die seitliche Rumpfmuskulatur und verbessert die Wirbelsäulenstabilität.',
    ARRAY['Core', 'Schulter'],
    'mittel',
    '[{"nummer":1,"beschreibung":"Lege dich auf die Seite, Ellenbogen unter der Schulter."},{"nummer":2,"beschreibung":"Hebe die Hüfte an — Körper bildet eine gerade Linie."},{"nummer":3,"beschreibung":"Halte die Position, Bauch fest angespannt."},{"nummer":4,"beschreibung":"Senke langsam ab und wechsle die Seite."}]'::jsonb,
    3, 1, 45, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Seitlicher Unterarmstütz');

  -- 9. Einbeinstand
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Einbeinstand',
    'Trainiert Gleichgewicht und Propriozeption. Essentiell nach Knieverletzungen und für Sturzprävention.',
    ARRAY['Wade', 'Oberschenkel', 'Core'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich auf ein Bein, das andere Knie leicht angehoben."},{"nummer":2,"beschreibung":"Fixiere einen Punkt vor dir mit den Augen."},{"nummer":3,"beschreibung":"Halte das Gleichgewicht 30 Sekunden."},{"nummer":4,"beschreibung":"Wechsle das Bein."}]'::jsonb,
    3, 1, 30, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Einbeinstand');

  -- 10. Beinheben im Liegen
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Beinheben im Liegen',
    'Kräftigt den Hüftbeuger und vorderen Oberschenkel ohne Kniebelastung. Standard nach Knie-TEP.',
    ARRAY['Oberschenkel', 'Hüfte'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Lege dich auf den Rücken, ein Bein angestellt, das andere gestreckt."},{"nummer":2,"beschreibung":"Spanne den Oberschenkel des gestreckten Beins an."},{"nummer":3,"beschreibung":"Hebe das gestreckte Bein langsam auf die Höhe des gebeugten Knies."},{"nummer":4,"beschreibung":"Halte kurz oben, dann langsam absenken."}]'::jsonb,
    3, 12, 45, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Beinheben im Liegen');

  -- 11. Wadenheben
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Wadenheben',
    'Stärkt die Wadenmuskulatur und Achillessehne. Wichtig bei Fersensporn und Plantarfasziitis.',
    ARRAY['Wade'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich mit den Fußballen auf eine Stufe."},{"nummer":2,"beschreibung":"Drücke dich langsam auf die Zehenspitzen hoch."},{"nummer":3,"beschreibung":"Halte oben kurz."},{"nummer":4,"beschreibung":"Senke die Fersen langsam unter das Stufenniveau ab."}]'::jsonb,
    3, 15, 45, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Wadenheben');

  -- 12. Pendeln (Codman)
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Pendeln (Codman)',
    'Sanfte Mobilisation der Schulter bei Frozen Shoulder und nach Schulter-OPs.',
    ARRAY['Schulter'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Beuge dich nach vorne, stütze dich mit einer Hand auf einem Tisch ab."},{"nummer":2,"beschreibung":"Lasse den betroffenen Arm locker hängen."},{"nummer":3,"beschreibung":"Bewege den Arm sanft in kleinen Kreisen."},{"nummer":4,"beschreibung":"Lasse die Schwerkraft arbeiten, nicht die Muskeln."}]'::jsonb,
    3, 10, 30, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Pendeln (Codman)');

  -- 13. Brustdehnung am Türrahmen
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Brustdehnung am Türrahmen',
    'Dehnt die verkürzte Brustmuskulatur. Verbessert die aufrechte Haltung.',
    ARRAY['Brust', 'Schulter'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich in einen Türrahmen, Unterarme an den Rahmen."},{"nummer":2,"beschreibung":"Mache einen kleinen Schritt nach vorne bis du eine Dehnung spürst."},{"nummer":3,"beschreibung":"Halte die Dehnung 30 Sekunden."},{"nummer":4,"beschreibung":"Atme dabei ruhig und gleichmäßig."}]'::jsonb,
    3, 1, 30, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Brustdehnung am Türrahmen');

  -- 14. Superman
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Superman',
    'Kräftigt die Rückenstrecker und stabilisiert die gesamte hintere Kette.',
    ARRAY['Rücken', 'Gesäß'],
    'mittel',
    '[{"nummer":1,"beschreibung":"Lege dich auf den Bauch, Arme nach vorne gestreckt."},{"nummer":2,"beschreibung":"Hebe gleichzeitig Arme, Brust und Beine vom Boden ab."},{"nummer":3,"beschreibung":"Halte die Position 3-5 Sekunden, Blick zum Boden."},{"nummer":4,"beschreibung":"Senke langsam ab und wiederhole."}]'::jsonb,
    3, 10, 45, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Superman');

  -- 15. Nackenretraktion (Chin Tuck)
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  SELECT 'Nackenretraktion (Chin Tuck)',
    'Stärkt die tiefe Nackenmuskulatur und korrigiert die Kopfhaltung. Wichtig bei HWS-Syndrom.',
    ARRAY['Nacken', 'Rücken'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Sitze oder stehe aufrecht, Blick geradeaus."},{"nummer":2,"beschreibung":"Schiebe das Kinn gerade nach hinten (Doppelkinn machen)."},{"nummer":3,"beschreibung":"Halte 5 Sekunden."},{"nummer":4,"beschreibung":"Löse langsam und wiederhole."}]'::jsonb,
    3, 15, 30, TRUE, v_owner
  WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Nackenretraktion (Chin Tuck)');

  RAISE NOTICE 'Seed: Beispielübungen eingefügt (existierende übersprungen).';
END $$;
