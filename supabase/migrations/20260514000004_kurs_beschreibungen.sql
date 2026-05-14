-- ============================================================
-- PROJ-20/21: Kurs-Beschreibungstexte (Aufhübschen)
--
-- Füllt das beschreibung-Feld der 4 Shop-Kurse mit echten Texten.
-- Vorher NULL → die "Über diesen Kurs"-Sektion auf der Kursseite
-- blieb leer. kurzbeschreibung bleibt unverändert (= learning_path
-- subtitle aus dem Seed).
--
-- Idempotent: UPDATE setzt jedes Mal denselben Wert.
-- ============================================================

UPDATE products SET beschreibung = $$In 21 Tagen baust du eine Trinkroutine auf, die wirklich hält. Der Kurs zeigt dir Tag für Tag, wie ausreichende Flüssigkeitszufuhr Konzentration, Gelenkgesundheit und allgemeines Wohlbefinden beeinflusst — mit kleinen, alltagstauglichen Impulsen statt starrer Regeln.

Du lernst, deinen individuellen Bedarf einzuschätzen, Trink-Anker fest in deinen Tag einzubauen und typische Stolperfallen zu umgehen. Am Ende ist gutes Trinken kein Vorsatz mehr, sondern Gewohnheit.$$
WHERE slug = 'hydrations-boost';

UPDATE products SET beschreibung = $$Ein beweglicher Rücken ist die Grundlage für einen schmerzfreien Alltag. Dieser 21-Tage-Kurs führt dich durch ein sanftes, progressiv aufgebautes Mobilitätsprogramm — von Physiotherapeuten entwickelt, ohne Geräte, in 15–20 Minuten täglich.

Du arbeitest gezielt an Wirbelsäule, Hüfte und der umgebenden Muskulatur, verstehst die Zusammenhänge hinter den Übungen und spürst Schritt für Schritt mehr Leichtigkeit in deinen Bewegungen. Ideal für alle, die viel sitzen oder ihren Rücken präventiv stärken wollen.$$
WHERE slug = 'ruecken-mobility';

UPDATE products SET beschreibung = $$Wer chronische Beschwerden besser verstehen will, braucht zuerst gute Beobachtung. In 21 Tagen baust du eine Schmerz-Tagebuch-Routine auf, die dir hilft, Auslöser, Muster und Einflussfaktoren deiner Beschwerden zu erkennen.

Der Kurs verbindet das tägliche Festhalten mit physiotherapeutischem Hintergrundwissen — damit du nicht nur dokumentierst, sondern auch einordnest. So entsteht eine fundierte Grundlage für Gespräche mit deiner Therapeutin oder deinem Arzt und für bewusstere Entscheidungen im Alltag.$$
WHERE slug = 'schmerz-tagebuch-routine';

UPDATE products SET beschreibung = $$Faszien — das bindegewebige Netzwerk, das deinen Körper durchzieht — beeinflussen Beweglichkeit, Spannung und Schmerzempfinden weit mehr, als lange angenommen. Dieser 21-Tage-Kurs führt dich in die gezielte Faszienarbeit ein: mit klar angeleiteten Übungen, die verklebte Strukturen lösen und die Gleitfähigkeit des Gewebes verbessern.

Du verstehst, was beim Dehnen und Ausrollen tatsächlich passiert, und entwickelst eine Routine, die Verspannungen vorbeugt. Von Physiotherapeuten entwickelt, geeignet auch für Einsteiger.$$
WHERE slug = 'faszien-tiefenarbeit';
