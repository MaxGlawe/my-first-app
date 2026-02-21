-- PROJ-8: Seed-Daten — 15 Beispielübungen für die Übungsbibliothek
-- Diese Übungen sind is_public = TRUE und für alle Therapeuten sichtbar.
-- created_by wird auf den ersten Admin-User gesetzt (oder ersten User überhaupt).

DO $$
DECLARE
  v_owner UUID;
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

  -- Übungen werden einzeln eingefügt — bestehende (gleicher Name) werden übersprungen

  -- ── 1. Kniebeuge (Squat) ──────────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Kniebeuge',
    'Grundübung für die gesamte Beinmuskulatur. Stärkt Oberschenkel, Gesäß und Rumpf. Ideal für den Aufbau von Beinkraft und Stabilität.',
    ARRAY['Oberschenkel', 'Gesäß', 'Rumpf'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich schulterbreit hin, Füße leicht nach außen gedreht."},{"nummer":2,"beschreibung":"Beuge die Knie und senke das Gesäß ab, als würdest du dich auf einen Stuhl setzen."},{"nummer":3,"beschreibung":"Halte den Rücken gerade und die Knie hinter den Zehenspitzen."},{"nummer":4,"beschreibung":"Drücke dich über die Fersen wieder hoch in die Ausgangsposition."}]'::jsonb,
    3, 12, 60, TRUE, v_owner
  );

  -- ── 2. Brücke (Bridge) ────────────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Brücke (Bridge)',
    'Aktiviert die Gesäßmuskulatur und stabilisiert die Lendenwirbelsäule. Besonders wichtig bei Rückenbeschwerden und nach Hüft-OPs.',
    ARRAY['Gesäß', 'Unterer Rücken', 'Oberschenkel'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Lege dich auf den Rücken, stelle die Füße hüftbreit auf, Knie gebeugt."},{"nummer":2,"beschreibung":"Drücke die Hüfte nach oben, bis Oberschenkel und Oberkörper eine Linie bilden."},{"nummer":3,"beschreibung":"Spanne den Po oben fest an und halte kurz."},{"nummer":4,"beschreibung":"Senke die Hüfte langsam wieder ab, ohne den Boden ganz zu berühren."}]'::jsonb,
    3, 15, 45, TRUE, v_owner
  );

  -- ── 3. Plank (Unterarmstütz) ──────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Plank (Unterarmstütz)',
    'Ganzkörper-Stabilisationsübung für den Rumpf. Verbessert Körperhaltung und schützt die Wirbelsäule im Alltag.',
    ARRAY['Rumpf', 'Bauch', 'Schultern'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Gehe in den Unterarmstütz: Ellenbogen unter den Schultern, Körper bildet eine gerade Linie."},{"nummer":2,"beschreibung":"Spanne Bauch und Gesäß fest an."},{"nummer":3,"beschreibung":"Halte die Position ohne durchzuhängen oder den Po hochzudrücken."},{"nummer":4,"beschreibung":"Atme gleichmäßig weiter."}]'::jsonb,
    3, 1, 60, TRUE, v_owner
  );

  -- ── 4. Ausfallschritt (Lunge) ─────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Ausfallschritt',
    'Einseitige Beinübung für Kraft und Gleichgewicht. Trainiert besonders den vorderen Oberschenkel und das Gesäß.',
    ARRAY['Oberschenkel', 'Gesäß', 'Waden'],
    'mittel',
    '[{"nummer":1,"beschreibung":"Stehe aufrecht, Hände an der Hüfte."},{"nummer":2,"beschreibung":"Mache einen großen Schritt nach vorne und beuge beide Knie auf ca. 90°."},{"nummer":3,"beschreibung":"Das hintere Knie schwebt knapp über dem Boden."},{"nummer":4,"beschreibung":"Drücke dich über den vorderen Fuß zurück in die Ausgangsposition."},{"nummer":5,"beschreibung":"Wechsle die Seite nach jeder Wiederholung."}]'::jsonb,
    3, 10, 60, TRUE, v_owner
  );

  -- ── 5. Schulterblattziehen (Scapula Retraction) ───────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Schulterblattziehen',
    'Aktiviert die Muskulatur zwischen den Schulterblättern. Wichtig bei Schulterproblemen, Impingement und schlechter Haltung.',
    ARRAY['Oberer Rücken', 'Schultern'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stehe oder sitze aufrecht, Arme hängen locker neben dem Körper."},{"nummer":2,"beschreibung":"Ziehe die Schulterblätter zusammen, als wolltest du einen Stift dazwischen klemmen."},{"nummer":3,"beschreibung":"Halte die Spannung 5 Sekunden."},{"nummer":4,"beschreibung":"Löse langsam und wiederhole."}]'::jsonb,
    3, 15, 30, TRUE, v_owner
  );

  -- ── 6. Wandsitzen (Wall Sit) ──────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Wandsitzen',
    'Isometrische Übung für die Oberschenkelmuskulatur. Ideal nach Knie-TEP und bei Arthrose zur schonenden Kräftigung.',
    ARRAY['Oberschenkel', 'Gesäß'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Lehne dich mit dem Rücken an eine Wand."},{"nummer":2,"beschreibung":"Rutsche nach unten, bis die Oberschenkel waagerecht sind (90° im Knie)."},{"nummer":3,"beschreibung":"Halte die Position — Rücken bleibt an der Wand."},{"nummer":4,"beschreibung":"Drücke dich nach der Haltezeit wieder hoch."}]'::jsonb,
    3, 1, 60, TRUE, v_owner
  );

  -- ── 7. Katzenbuckel-Pferderücken (Cat-Cow) ────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Katzenbuckel-Pferderücken',
    'Mobilisiert die gesamte Wirbelsäule und löst Verspannungen. Perfekt als Aufwärmübung und bei Rückenschmerzen.',
    ARRAY['Unterer Rücken', 'Oberer Rücken', 'Rumpf'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Gehe in den Vierfüßlerstand: Hände unter Schultern, Knie unter Hüfte."},{"nummer":2,"beschreibung":"Katzenbuckel: Runde den Rücken nach oben, Kinn zur Brust."},{"nummer":3,"beschreibung":"Pferderücken: Senke den Bauch ab, hebe den Kopf und schaue nach vorne."},{"nummer":4,"beschreibung":"Wechsle fließend zwischen beiden Positionen."}]'::jsonb,
    3, 10, 30, TRUE, v_owner
  );

  -- ── 8. Seitlicher Unterarmstütz (Side Plank) ──────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Seitlicher Unterarmstütz',
    'Kräftigt die seitliche Rumpfmuskulatur und verbessert die Wirbelsäulenstabilität. Wichtig bei Skoliose und LWS-Problemen.',
    ARRAY['Seitliche Bauchmuskulatur', 'Rumpf', 'Schultern'],
    'mittel',
    '[{"nummer":1,"beschreibung":"Lege dich auf die Seite, Ellenbogen unter der Schulter."},{"nummer":2,"beschreibung":"Hebe die Hüfte an — Körper bildet eine gerade Linie von Kopf bis Fuß."},{"nummer":3,"beschreibung":"Halte die Position, Bauch fest angespannt."},{"nummer":4,"beschreibung":"Senke langsam ab und wechsle die Seite."}]'::jsonb,
    3, 1, 45, TRUE, v_owner
  );

  -- ── 9. Einbeinstand ───────────────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Einbeinstand',
    'Trainiert Gleichgewicht und Propriozeption. Essentiell nach Knieverletzungen, Sprunggelenksproblemen und für Sturzprävention.',
    ARRAY['Waden', 'Oberschenkel', 'Rumpf'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich auf ein Bein, das andere Knie leicht angehoben."},{"nummer":2,"beschreibung":"Fixiere einen Punkt vor dir mit den Augen."},{"nummer":3,"beschreibung":"Halte das Gleichgewicht 30 Sekunden."},{"nummer":4,"beschreibung":"Wechsle das Bein."},{"nummer":5,"beschreibung":"Steigerung: Augen schließen oder auf weicher Unterlage stehen."}]'::jsonb,
    3, 1, 30, TRUE, v_owner
  );

  -- ── 10. Beinheben im Liegen (Straight Leg Raise) ──────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Beinheben im Liegen',
    'Kräftigt den Hüftbeuger und vorderen Oberschenkel ohne Kniebelastung. Standard nach Knie-TEP und Kreuzband-Reha.',
    ARRAY['Oberschenkel', 'Hüftbeuger'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Lege dich auf den Rücken, ein Bein angestellt, das andere gestreckt."},{"nummer":2,"beschreibung":"Spanne den Oberschenkel des gestreckten Beins an."},{"nummer":3,"beschreibung":"Hebe das gestreckte Bein langsam auf die Höhe des gebeugten Knies."},{"nummer":4,"beschreibung":"Halte kurz oben, dann langsam absenken."}]'::jsonb,
    3, 12, 45, TRUE, v_owner
  );

  -- ── 11. Wadenheben (Calf Raise) ───────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Wadenheben',
    'Stärkt die Wadenmuskulatur und Achillessehne. Wichtig bei Fersensporn, Plantarfasziitis und nach Sprunggelenksverletzungen.',
    ARRAY['Waden'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich mit den Fußballen auf eine Stufe (Fersen frei)."},{"nummer":2,"beschreibung":"Drücke dich langsam auf die Zehenspitzen hoch."},{"nummer":3,"beschreibung":"Halte oben kurz."},{"nummer":4,"beschreibung":"Senke die Fersen langsam unter das Stufenniveau ab (Dehnung spüren)."}]'::jsonb,
    3, 15, 45, TRUE, v_owner
  );

  -- ── 12. Pendeln (Shoulder Pendulum) ────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Pendeln (Codman)',
    'Sanfte Mobilisation der Schulter bei Frozen Shoulder, nach Schulter-OPs und bei Impingement. Nutzt Schwerkraft statt Muskelkraft.',
    ARRAY['Schultern'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Beuge dich nach vorne, stütze dich mit einer Hand auf einem Tisch ab."},{"nummer":2,"beschreibung":"Lasse den betroffenen Arm locker hängen."},{"nummer":3,"beschreibung":"Bewege den Arm sanft in kleinen Kreisen — erst im Uhrzeigersinn, dann dagegen."},{"nummer":4,"beschreibung":"Lasse die Schwerkraft arbeiten, nicht die Muskeln."}]'::jsonb,
    3, 10, 30, TRUE, v_owner
  );

  -- ── 13. Dehnung Brustmuskulatur (Pec Stretch) ─────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Brustdehnung am Türrahmen',
    'Dehnt die verkürzte Brustmuskulatur. Verbessert die aufrechte Haltung und entlastet die Halswirbelsäule.',
    ARRAY['Brust', 'Schultern'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Stelle dich in einen Türrahmen, Unterarme an den Rahmen (90° im Ellenbogen)."},{"nummer":2,"beschreibung":"Mache einen kleinen Schritt nach vorne, bis du eine Dehnung in der Brust spürst."},{"nummer":3,"beschreibung":"Halte die Dehnung 30 Sekunden."},{"nummer":4,"beschreibung":"Atme dabei ruhig und gleichmäßig."}]'::jsonb,
    3, 1, 30, TRUE, v_owner
  );

  -- ── 14. Superman ──────────────────────────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Superman',
    'Kräftigt die Rückenstrecker und stabilisiert die gesamte hintere Kette. Gut bei LWS-Syndrom und zur Haltungsverbesserung.',
    ARRAY['Unterer Rücken', 'Gesäß', 'Oberer Rücken'],
    'mittel',
    '[{"nummer":1,"beschreibung":"Lege dich auf den Bauch, Arme nach vorne gestreckt."},{"nummer":2,"beschreibung":"Hebe gleichzeitig Arme, Brust und Beine vom Boden ab."},{"nummer":3,"beschreibung":"Halte die Position 3-5 Sekunden, Blick zum Boden."},{"nummer":4,"beschreibung":"Senke langsam ab und wiederhole."}]'::jsonb,
    3, 10, 45, TRUE, v_owner
  );

  -- ── 15. Nackenretrakion (Chin Tuck) ───────────────────────────
  INSERT INTO exercises (name, beschreibung, muskelgruppen, schwierigkeitsgrad,
    ausfuehrung, standard_saetze, standard_wiederholungen, standard_pause_sekunden,
    is_public, created_by)
  VALUES (
    'Nackenretraktion (Chin Tuck)',
    'Stärkt die tiefe Nackenmuskulatur und korrigiert die Kopfhaltung. Die wichtigste Übung bei HWS-Syndrom und Spannungskopfschmerzen.',
    ARRAY['Nacken', 'Oberer Rücken'],
    'anfaenger',
    '[{"nummer":1,"beschreibung":"Sitze oder stehe aufrecht, Blick geradeaus."},{"nummer":2,"beschreibung":"Schiebe das Kinn gerade nach hinten (Doppelkinn machen)."},{"nummer":3,"beschreibung":"Halte 5 Sekunden — du spürst eine Spannung im Nacken."},{"nummer":4,"beschreibung":"Löse langsam und wiederhole."}]'::jsonb,
    3, 15, 30, TRUE, v_owner
  );

  RAISE NOTICE 'Seed: 15 Beispielübungen erfolgreich eingefügt.';
END $$;
