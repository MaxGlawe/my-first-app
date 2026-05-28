/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 2.3
 * Modernes Rumpftraining Teil 1: Stabilisation
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/2.3.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 2.3  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
 * Änderungen am Text/Timing → Source ändern + Build-Skript erneut laufen lassen.
 *
 * SYNCHRONISATION (wort-genau):
 *   Jede Slide trägt eine `appearTime` (Sekunden, relativ zum Abschnitt-Audio).
 *   Sie wurde aus dem ElevenLabs-Wort-Alignment berechnet: Für das Sprech-Segment
 *   jeder Slide (`seg` in der Source) wird der Start-Zeichen-Offset im gesprochenen
 *   Text bestimmt und `appearTime = starts[offset]` gesetzt. Der Player schaltet
 *   die Slide, sobald `audio.currentTime >= slide.appearTime`. Weder `seg` noch
 *   das Alignment werden an den Client ausgeliefert — nur die fertigen Zeitwerte.
 *
 * Die Transkripte sind die bereinigten Erzähltexte (Pausen-Marker und Emphasis
 * entfernt). Der Wortlaut bleibt unverändert (HWG: keine Heilversprechen).
 *
 * Die Slide-/Abschnitt-/Lektions-Typen liegen geteilt in ../types.
 */

import {
  type Lesson,
  totalSlides,
  flatSlides,
  type FlatSlide,
} from "../types";

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/2.3";

export const lesson_2_3: Lesson = {
  id: "2.3",
  title: "Modernes Rumpftraining Teil 1: Stabilisation",
  subtitle: "Modul 2 – Kurativ handeln · Sechs Stabilisationsübungen & das Anti-Bewegungs-Prinzip",
  sections: [
    {
      title: "Eröffnung & was Stabilisation hier heißt",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zurück. In der letzten Lektion hast du Mobilisation gelernt – sanfte, beruhigende Bewegungen, die deinen Rücken durchbluten und das Nervensystem entspannen. In dieser Lektion gehen wir einen Schritt weiter. Wir trainieren Stabilisation. Klingt erst einmal nach harter Arbeit – ist aber etwas anderes als Bauchmuskeltraining im klassischen Sinn. Stabilisation in unserem Verständnis bedeutet: Du trainierst die Fähigkeit deiner tiefen Muskeln, deine Wirbelsäule während Bewegung in einer guten Position zu halten. Das ist nicht der dicke Bauchmuskel. Es ist Feinkontrolle. Es ist die Fähigkeit, dass deine Wirbel zueinander stabil bleiben, während sich Arme und Beine bewegen. Erinnere dich an Lektion 1.2: Der wichtigste Akteur hier ist der Multifidus – der tiefe Stabilisator entlang der Wirbelsäule – zusammen mit dem Transversus abdominis – dem quer verlaufenden tiefen Bauchmuskel. Diese beiden bilden ein Korsett um deine Wirbelsäule. Bei chronischem Rückenschmerz arbeitet dieses Korsett oft schlechter. Es lässt sich aber gezielt wieder trainieren – und das tun wir heute. Sechs Übungen. Alle wieder mit drei Schienen. Reizarm, Standard, belastend.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 2 – Kurativ handeln",
          lessonLabel: "Lektion 2.3 – Modernes Rumpftraining Teil 1: Stabilisation",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Ein Schritt weiter",
          headline: "Letzte Lektion: Mobilisation. Heute: ein Schritt weiter.",
          lead: "Sanfte, beruhigende Bewegungen hast du gelernt – jetzt gehen wir tiefer.",
        },
        {
          type: "statement",
          appearTime: 12.736,
          text: "Wir trainieren Stabilisation – nicht Bauchmuskeltraining.",
          emphasis: "Stabilisation",
        },
        {
          type: "content",
          appearTime: 21.211,
          kicker: "Was Stabilisation heißt",
          headline: "Die Wirbelsäule stabil halten, während sich Arme und Beine bewegen.",
          lead: "Nicht der dicke Bauchmuskel – Feinkontrolle. Deine Wirbel bleiben zueinander stabil.",
        },
        {
          type: "content",
          appearTime: 40.81,
          kicker: "Das tiefe Korsett",
          headline: "Multifidus und Transversus abdominis bilden ein Korsett um die Wirbelsäule.",
          lead: "Bei chronischem Rückenschmerz arbeitet es oft schlechter – aber es lässt sich gezielt wieder trainieren.",
        },
        {
          type: "statement",
          appearTime: 65.098,
          text: "Sechs Übungen. Alle wieder mit drei Schienen.",
          emphasis: "drei Schienen",
        },
      ],
    },
    {
      title: "Warum kein Sit-up",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Bevor wir einsteigen, eine wichtige Klarstellung: Wir machen keine Sit-ups in dieser Masterclass. Wir machen auch keine klassischen Crunches. Warum nicht? Sit-ups und Crunches trainieren den geraden Bauchmuskel – den Rectus abdominis. Der ist nicht der Stabilisator, der bei chronischem Rückenschmerz das Problem ist. Im Gegenteil: Sit-ups erzeugen Flexion in der Lendenwirbelsäule unter Last. Genau die Bewegung, die viele Bandscheiben reizt. Bei Menschen mit chronischem Kreuzschmerz sind Sit-ups oft kontraproduktiv. Was funktioniert, ist Anti-Bewegungs-Training. Das ist der moderne Begriff. Anstatt deine Wirbelsäule aktiv zu beugen, lernst du, sie stabil zu halten, während andere Körperteile sich bewegen. Du wirst gleich Übungen lernen, in denen du in einer stabilen Wirbelsäulen-Position bist und Arme oder Beine bewegst – ohne dass die Wirbelsäule mitwackelt. Das ist funktionelle Stabilisation. Genau das, was im Alltag und in echten Belastungssituationen zählt. Eine weitere Verschiebung: Wir trainieren nicht maximale Spannung, sondern intelligente Spannung. Du sollst nicht den Bauchnabel mit aller Kraft nach hinten ziehen, bis dir der Atem stockt. Du sollst eine milde, kontinuierliche Aktivierung spüren – etwa 20 bis 30 Prozent deiner maximalen Anspannung. So lernen die tiefen Stabilisatoren am besten.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Keine Sit-ups. Keine klassischen Crunches.",
          emphasis: "Keine Sit-ups",
        },
        {
          type: "content",
          appearTime: 7.233,
          dark: true,
          kicker: "Warum nicht",
          headline: "Sit-ups erzeugen Flexion in der Lendenwirbelsäule unter Last.",
          lead: "Sie trainieren den Rectus abdominis – nicht den Stabilisator. Bei chronischem Kreuzschmerz oft kontraproduktiv.",
        },
        {
          type: "content",
          appearTime: 31.091,
          kicker: "Klassisch vs. modern",
          headline: "Anti-Bewegungs-Training: stabil halten statt aktiv beugen.",
          lead: "Du bewegst Arme oder Beine, ohne dass die Wirbelsäule mitwackelt. Funktionelle Stabilisation für den Alltag.",
        },
        {
          type: "statement",
          appearTime: 57.458,
          text: "Intelligente Spannung, nicht maximale Spannung.",
          emphasis: "Intelligente Spannung",
        },
      ],
    },
    {
      title: "Übung 1 – Transversus-Aktivierung (ÜK-S1)",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Erste Übung: Transversus-Aktivierung im Liegen. Übungskarte ÜK-S1. Das ist die Grundübung für die tiefe Bauchmuskulatur. Wenn du nur eine einzige Stabilisations-Übung üben würdest, dann diese – weil sie dir das Gefühl für deine tiefen Muskeln vermittelt, das du in allen anderen Übungen brauchst. Position: Rücken auf der Matte. Beide Beine angestellt, Füße flach auf dem Boden. Arme entspannt neben dem Körper. Beckenneutrale Position – das heißt: kleiner Spalt zwischen unterem Rücken und Boden, nicht plattgedrückt, nicht hohlkreuz. Leg die Fingerspitzen beider Hände flach auf dein Bauchgewebe, etwa zwei Finger breit innerhalb der vorderen Beckenkanten. Spürst du da, wo deine Fingerspitzen liegen? Genau dort spürst du gleich die Aktivierung des Transversus abdominis. Jetzt die Bewegung: Atme ruhig ein. Beim Ausatmen ziehst du den Bauchnabel sanft nach innen und leicht nach oben – als würdest du eine zu enge Hose zuknöpfen wollen. Nicht maximal. Eine milde Aktivierung. Du spürst unter deinen Fingerspitzen eine leichte Spannung. Halte das, atme dabei normal weiter, und löse nach 10 Sekunden wieder. Häufiger Fehler: Du presst zu stark. Wenn du beim Halten die Luft anhältst oder sich der Bauch nach außen wölbt, ist es zu viel. Lass nach. Such die milde Aktivierung. Reizarme Schiene: Halte 5 Sekunden, 5 Wiederholungen. Standard: Halte 10 Sekunden, 8 bis 10 Wiederholungen. Belastend: Halte 15 bis 20 Sekunden, 10 bis 12 Wiederholungen, optional zusätzlich ein Bein leicht anheben. Wozu ist diese Übung gut? Sie ist Wahrnehmungsschulung und Kraftaufbau gleichzeitig. Du lernst, deine tiefe Schicht überhaupt zu spüren – viele Menschen mit chronischem Rückenschmerz haben dieses Gefühl verloren. Und du baust gleichzeitig die Ausdauerkraft des Transversus auf, die du in allen folgenden Übungen brauchst.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 1 · ÜK-S1",
          term: "Transversus-Aktivierung",
        },
        {
          type: "statement",
          appearTime: 5.747,
          text: "Wenn du nur eine Stabilisations-Übung übst, dann diese.",
          emphasis: "diese",
        },
        {
          type: "content",
          appearTime: 17.775,
          kicker: "Ausgangsposition",
          headline: "Rückenlage, Beine angestellt, beckenneutrale Position.",
          lead: "Ein kleiner Spalt zwischen unterem Rücken und Boden – nicht plattgedrückt, nicht hohlkreuz.",
        },
        {
          type: "content",
          appearTime: 33.796,
          kicker: "Wo du spürst",
          headline: "Fingerspitzen zwei Finger breit innerhalb der vorderen Beckenkanten.",
          lead: "Genau dort spürst du gleich die Aktivierung des Transversus abdominis.",
        },
        {
          type: "content",
          appearTime: 49.377,
          kicker: "Die Bewegung",
          headline: "Beim Ausatmen den Bauchnabel sanft nach innen und leicht nach oben ziehen.",
          lead: "Wie eine zu enge Hose zuknöpfen. Eine milde Aktivierung halten, normal weiteratmen, nach 10 Sekunden lösen.",
        },
        {
          type: "content",
          appearTime: 73.201,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Zu stark pressen – Luft anhalten oder Bauch wölbt sich nach außen.",
          lead: "Das ist zu viel. Lass nach und such die milde Aktivierung.",
        },
        {
          type: "reveal-list",
          appearTime: 84.729,
          kicker: "ÜK-S1 · Drei Schienen",
          title: "Transversus-Aktivierung nach Tagesform",
          items: [{"label":"Reizarm – 5 s halten · 5x"},{"label":"Standard – 10 s halten · 8–10x"},{"label":"Belastend – 15–20 s halten, ein Bein anheben · 10–12x"}],
        },
        {
          type: "content",
          appearTime: 100.716,
          kicker: "Was sie bewirkt",
          headline: "Wahrnehmungsschulung und Kraftaufbau gleichzeitig.",
          lead: "Du lernst, deine tiefe Schicht zu spüren, und baust die Ausdauerkraft auf, die du in allen folgenden Übungen brauchst.",
        },
      ],
    },
    {
      title: "Übung 2 – Dead Bug (ÜK-S2)",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Zweite Übung: Dead Bug. Übungskarte ÜK-S2. Dead Bug ist eine der wichtigsten Stabilisationsübungen überhaupt. Sie sieht harmlos aus, ist aber neurologisch sehr lehrreich: Du lernst, Arme und Beine zu bewegen, ohne dass deine Wirbelsäule mitwackelt. Position: Rücken auf der Matte. Beide Beine angehoben in einer 90-Grad-Position – die Hüfte ist 90 Grad gebeugt, die Knie sind 90 Grad gebeugt. Die Unterschenkel sind also parallel zum Boden. Die Arme zeigen nach oben in Richtung Decke – direkt über den Schultern. Aktiviere zuerst deinen Transversus – das hast du gerade gelernt. Sanfte Anspannung. Dein unterer Rücken bleibt in beckenneutraler Position – nicht durchgedrückt, nicht hohlkreuz. Jetzt die Bewegung: Strecke gleichzeitig einen Arm nach hinten zum Boden hin und das gegenüberliegende Bein gerade nach vorne – so weit, wie du die Position deines Rückens stabil halten kannst. Wenn du merkst, dass dein unterer Rücken in ein Hohlkreuz kippt, geh nicht so weit. Zurück in die Ausgangsposition. Dann die andere Diagonale. Reizarme Schiene: Nur ein Bein zur Zeit, ohne Arm. Die Bewegung ist klein – das Bein streckt sich nur leicht. 6 Wiederholungen pro Seite. Standard: Volle Diagonal-Bewegung mit Arm und Bein, 8 bis 10 Wiederholungen pro Seite. Belastend: Mehr Wiederholungen – 12 bis 15 pro Seite – und langsamer ausgeführt, jede Wiederholung 3 Sekunden in der Endposition halten. Häufiger Fehler: Der untere Rücken wölbt sich in der Bewegung nach oben, der Spalt zwischen Boden und Lendenwirbelsäule wird größer. Wenn das passiert, ist die Bewegung zu weit. Geh nur so weit, wie du die Beckenneutralität halten kannst.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 2 · ÜK-S2",
          term: "Dead Bug",
        },
        {
          type: "content",
          appearTime: 4.098,
          kicker: "Warum so wichtig",
          headline: "Sieht harmlos aus, ist neurologisch sehr lehrreich.",
          lead: "Du lernst, Arme und Beine zu bewegen – ohne dass deine Wirbelsäule mitwackelt.",
        },
        {
          type: "content",
          appearTime: 16.394,
          kicker: "Ausgangsposition",
          headline: "Rückenlage, Beine in 90-Grad-Position, Arme zur Decke.",
          lead: "Hüfte und Knie 90 Grad gebeugt, Unterschenkel parallel zum Boden, Arme direkt über den Schultern.",
        },
        {
          type: "content",
          appearTime: 32.892,
          kicker: "Erst aktivieren",
          headline: "Zuerst den Transversus aktivieren – sanfte Anspannung.",
          lead: "Dein unterer Rücken bleibt beckenneutral – nicht durchgedrückt, nicht hohlkreuz.",
        },
        {
          type: "content",
          appearTime: 43.457,
          kicker: "Die Bewegung",
          headline: "Arm nach hinten, gegenüberliegendes Bein nach vorne – diagonal.",
          lead: "So weit, wie du den Rücken stabil halten kannst. Kippt er ins Hohlkreuz, geh nicht so weit. Dann die andere Diagonale.",
        },
        {
          type: "reveal-list",
          appearTime: 64.123,
          kicker: "ÜK-S2 · Drei Schienen",
          title: "Dead Bug nach Tagesform",
          items: [{"label":"Reizarm – nur ein Bein, kleine Bewegung · 6x pro Seite"},{"label":"Standard – volle Diagonale, Arm und Bein · 8–10x pro Seite"},{"label":"Belastend – langsam, 3 s in der Endposition · 12–15x pro Seite"}],
        },
        {
          type: "content",
          appearTime: 90.234,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Der untere Rücken wölbt sich nach oben, der Spalt wird größer.",
          lead: "Dann ist die Bewegung zu weit. Geh nur so weit, wie du die Beckenneutralität halten kannst.",
        },
      ],
    },
    {
      title: "Übung 3 – Bird-Dog (ÜK-S3)",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Dritte Übung: Bird-Dog. Übungskarte ÜK-S3. Bird-Dog ist die Vierfüßler-Variante der Dead-Bug-Idee. Sie trainiert dasselbe – Stabilisation während Extremitäten-Bewegung – aber in einer aufrechteren Position, die zusätzlich Schulter- und Hüftstabilität fordert. Position: Vierfüßlerstand. Hände unter den Schultern, Knie unter den Hüften. Wirbelsäule in einer neutralen Position – nicht hängend, nicht buckelnd. Aktiviere deinen Transversus. Bewegung: Streck einen Arm nach vorne aus und gleichzeitig das gegenüberliegende Bein nach hinten – sodass Arm, Rumpf und Bein eine gerade Linie bilden. Hand und Fuß sind etwa auf Hüfthöhe. Wichtig: Dein Rumpf bleibt absolut ruhig. Wenn du wackelst oder dein Becken sich neigt, bist du außerhalb deiner Stabilitätszone. Halte die ausgestreckte Position kurz – ein oder zwei Atemzüge. Dann zurück, dann die andere Diagonale. Reizarme Schiene: Nur Arm oder nur Bein, nicht beides gleichzeitig. Sehr langsame Bewegung. 5 Wiederholungen pro Seite. Standard: Arm und Bein gleichzeitig, Haltedauer 2 Sekunden, 8 Wiederholungen pro Seite. Belastend: Mit Pause in der Mitte – du führst Hand und Knie unter dem Körper zusammen und streckst sie dann wieder aus, ohne den Boden zu berühren. Diese Variante heißt Bird-Dog mit Crunch. 8 bis 10 Wiederholungen pro Seite. Häufiger Fehler: Das Becken kippt zur Seite, weil das gestreckte Bein versucht, höher zu kommen, als der Rumpf zulässt. Bleib unter der Höhe, in der du noch ein gerades Becken halten kannst.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 3 · ÜK-S3",
          term: "Bird-Dog",
        },
        {
          type: "content",
          appearTime: 4.586,
          kicker: "Was sie ist",
          headline: "Die Vierfüßler-Variante der Dead-Bug-Idee.",
          lead: "Stabilisation während Extremitäten-Bewegung – plus zusätzlich Schulter- und Hüftstabilität.",
        },
        {
          type: "content",
          appearTime: 17.961,
          kicker: "Ausgangsposition",
          headline: "Vierfüßlerstand, Wirbelsäule neutral – nicht hängend, nicht buckelnd.",
          lead: "Hände unter den Schultern, Knie unter den Hüften. Aktiviere deinen Transversus.",
        },
        {
          type: "content",
          appearTime: 30.407,
          kicker: "Die Bewegung",
          headline: "Arm nach vorne, gegenüberliegendes Bein nach hinten – eine gerade Linie.",
          lead: "Hand und Fuß etwa auf Hüfthöhe. Der Rumpf bleibt absolut ruhig – wackelst du, bist du außerhalb deiner Stabilitätszone.",
        },
        {
          type: "content",
          appearTime: 49.598,
          kicker: "Kurz halten",
          headline: "Kurz halten – ein oder zwei Atemzüge. Dann die andere Diagonale.",
        },
        {
          type: "reveal-list",
          appearTime: 57.215,
          kicker: "ÜK-S3 · Drei Schienen",
          title: "Bird-Dog nach Tagesform",
          items: [{"label":"Reizarm – nur Arm oder nur Bein, sehr langsam · 5x pro Seite"},{"label":"Standard – Arm und Bein, 2 s halten · 8x pro Seite"},{"label":"Belastend – mit Crunch, Hand und Knie zusammenführen · 8–10x pro Seite"}],
        },
        {
          type: "content",
          appearTime: 86.75,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Das Becken kippt zur Seite, weil das Bein zu hoch will.",
          lead: "Bleib unter der Höhe, in der du noch ein gerades Becken halten kannst.",
        },
      ],
    },
    {
      title: "Übung 4 – Glute Bridge (ÜK-S4)",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Vierte Übung: Glute Bridge – die Hüftbrücke. Übungskarte ÜK-S4. Glute Bridge ist eine Übung, die mehrere Ziele gleichzeitig erfüllt: Sie trainiert deine Gesäßmuskulatur, sie aktiviert deine hintere Kette – also die Linie aus Rumpf und Bein – und sie ist gleichzeitig sehr rückenfreundlich, weil die Wirbelsäule die ganze Zeit gut unterstützt am Boden liegt. Position: Rücken auf der Matte. Beide Beine angestellt, Füße flach auf dem Boden, Knie etwa hüftbreit. Die Arme liegen entspannt neben dem Körper. Aktiviere deinen Transversus. Bewegung: Press die Fersen aktiv in den Boden und heb das Becken vom Boden ab. Geh nicht maximal hoch – das Ziel ist, dass Knie, Hüfte und Schulter in einer Linie sind. Wenn du höher gehst, kippst du in ein Hohlkreuz, das wollen wir vermeiden. Halte die Endposition kurz – ein bis zwei Sekunden. Dann langsam ablegen. Wichtig: Die Kraft kommt aus dem Gesäß. Bauchnabel sanft zur Wirbelsäule, sodass du die Bewegung nicht durch ein Hohlkreuz schummelst. Wenn dein unterer Rücken in der Endposition unangenehm zieht, gehst du zu hoch oder die Gesäßmuskulatur arbeitet nicht aktiv. Reizarme Schiene: Niedrige Brücke, kurze Haltedauer, 6 bis 8 Wiederholungen. Standard: Volle Brücke bis zur graden Linie, 2 Sekunden halten, 10 bis 12 Wiederholungen. Belastend: Mit Haltedauer von 5 Sekunden pro Wiederholung, 12 bis 15 Wiederholungen. Alternative: einbeinige Variante – du hebst ein Bein vom Boden ab und machst die Brücke nur mit dem anderen Standbein. Das ist gleichzeitig ÜK-B7 in der Belastungstoleranz-Lektion. Häufiger Fehler: Die Bewegung kommt aus dem unteren Rücken statt aus dem Gesäß. Du spürst das Ziehen im Rücken statt einer Aktivierung im Po. Konzentriere dich aktiv auf das Gesäß-Anspannen. Manche Menschen müssen erst lernen, ihr Gesäß überhaupt willentlich zu aktivieren – das ist normal und trainierbar.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 4 · ÜK-S4",
          term: "Glute Bridge",
        },
        {
          type: "content",
          appearTime: 6.165,
          kicker: "Mehrere Ziele",
          headline: "Eine Übung, mehrere Ziele gleichzeitig.",
          lead: "Gesäßmuskulatur, hintere Kette – und sehr rückenfreundlich, weil die Wirbelsäule gut unterstützt am Boden liegt.",
        },
        {
          type: "content",
          appearTime: 22.175,
          kicker: "Ausgangsposition",
          headline: "Rückenlage, Beine angestellt, Knie etwa hüftbreit.",
          lead: "Füße flach am Boden, Arme entspannt neben dem Körper. Aktiviere deinen Transversus.",
        },
        {
          type: "content",
          appearTime: 34.133,
          kicker: "Die Bewegung",
          headline: "Fersen in den Boden pressen, Becken abheben – Knie, Hüfte, Schulter in einer Linie.",
          lead: "Nicht maximal hoch – sonst kippst du ins Hohlkreuz. Endposition kurz halten, dann langsam ablegen.",
        },
        {
          type: "statement",
          appearTime: 54.032,
          text: "Die Kraft kommt aus dem Gesäß – nicht aus dem Rücken.",
          emphasis: "aus dem Gesäß",
        },
        {
          type: "reveal-list",
          appearTime: 69.021,
          kicker: "ÜK-S4 · Drei Schienen",
          title: "Glute Bridge nach Tagesform",
          items: [{"label":"Reizarm – niedrige Brücke, kurz halten · 6–8x"},{"label":"Standard – volle Brücke, 2 s halten · 10–12x"},{"label":"Belastend – 5 s halten oder einbeinig · 12–15x"}],
        },
        {
          type: "content",
          appearTime: 95.19,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Die Bewegung kommt aus dem Rücken statt aus dem Gesäß.",
          lead: "Konzentriere dich aktiv aufs Gesäß-Anspannen. Manche müssen das willentliche Aktivieren erst lernen – normal und trainierbar.",
        },
      ],
    },
    {
      title: "Übung 5 – Side Plank in drei Stufen (ÜK-S5)",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Fünfte Übung: Side Plank – der seitliche Stütz. Übungskarte ÜK-S5. Side Plank trainiert die seitliche Rumpfmuskulatur – also die schrägen Bauchmuskeln und die seitliche Hüftmuskulatur. Diese Region wird in den meisten Trainingsprogrammen unterschätzt, ist aber für die Stabilisation der Lendenwirbelsäule sehr wichtig. Wir gehen das in drei Stufen an – du wählst die Stufe, die für dich heute passt. Stufe 1 – Knee Side Plank: Seitlage. Stütz dich auf den Unterarm, Ellbogen direkt unter der Schulter. Knie sind übereinander, Beine angewinkelt. Heb das Becken vom Boden ab, sodass dein Körper von Knien bis Schulter eine gerade Linie bildet. Halte. Atem fließt ruhig weiter. Stufe 2 – Full Side Plank: Wie Stufe 1, aber die Beine sind gestreckt. Du stützt dich auf der äußeren Kante des unteren Fußes ab. Anspruchsvoller, weil der Hebelarm länger ist und mehr Stabilität gefordert wird. Stufe 3 – Side Plank mit Beckenheben: Volle Position wie Stufe 2, aber zusätzlich senkst du das Becken minimal ab und hebst es wieder – eine kontrollierte kleine Wellenbewegung. Reizarme Schiene: Stufe 1, 10 bis 15 Sekunden pro Seite, 2 Durchgänge. Standard: Stufe 2, 20 bis 30 Sekunden pro Seite, 2 Durchgänge. Belastend: Stufe 3, 30 bis 45 Sekunden pro Seite, optional mit oberem Bein leicht angehoben. Häufiger Fehler: Das Becken hängt durch – du verlierst die gerade Linie und der Körper rutscht in eine V-Form. Wenn das passiert, geh in die einfachere Schiene oder beende die Übung. Mit hängendem Becken trainierst du nicht stabilisierend, du trainierst nur die Schwerkraft.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 5 · ÜK-S5",
          term: "Side Plank",
        },
        {
          type: "content",
          appearTime: 6.525,
          kicker: "Die unterschätzte Region",
          headline: "Die seitliche Rumpfmuskulatur – oft unterschätzt, für die LWS sehr wichtig.",
          lead: "Schräge Bauchmuskeln und seitliche Hüftmuskulatur – zentral für die Stabilisation der Lendenwirbelsäule.",
        },
        {
          type: "statement",
          appearTime: 20.863,
          text: "Drei Stufen – du wählst, was heute passt.",
          emphasis: "drei Stufen",
        },
        {
          type: "content",
          appearTime: 25.472,
          kicker: "Stufe 1 · Knee Side Plank",
          headline: "Seitlage auf dem Unterarm, Knie angewinkelt und übereinander.",
          lead: "Ellbogen unter der Schulter, Becken abheben – von Knien bis Schulter eine gerade Linie. Ruhig weiteratmen.",
        },
        {
          type: "content",
          appearTime: 45.57,
          kicker: "Stufe 2 · Full Side Plank",
          headline: "Wie Stufe 1, aber mit gestreckten Beinen.",
          lead: "Du stützt dich auf der äußeren Kante des unteren Fußes ab – anspruchsvoller durch den längeren Hebelarm.",
        },
        {
          type: "content",
          appearTime: 59.409,
          kicker: "Stufe 3 · mit Beckenheben",
          headline: "Volle Position plus kontrolliertes Senken und Heben des Beckens.",
          lead: "Eine kontrollierte kleine Wellenbewegung – das Becken minimal ab und wieder hoch.",
        },
        {
          type: "reveal-list",
          appearTime: 70.288,
          kicker: "ÜK-S5 · Drei Schienen",
          title: "Side Plank nach Tagesform",
          items: [{"label":"Reizarm – Stufe 1, 10–15 s pro Seite · 2 Durchgänge"},{"label":"Standard – Stufe 2, 20–30 s pro Seite · 2 Durchgänge"},{"label":"Belastend – Stufe 3, 30–45 s pro Seite, oberes Bein anheben"}],
        },
        {
          type: "content",
          appearTime: 86.112,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Das Becken hängt durch – der Körper rutscht in eine V-Form.",
          lead: "Dann eine einfachere Schiene wählen oder beenden. Mit hängendem Becken trainierst du nur die Schwerkraft.",
        },
      ],
    },
    {
      title: "Übung 6 – Bear Crawl Hold (ÜK-S6)",
      audioSrc: `${AUDIO_BASE}/abschnitt-8.mp3`,
      transkript: "Sechste Übung: Bear Crawl Hold. Übungskarte ÜK-S6. Bear Crawl Hold ist eine Halte-Übung, die die Stabilisation in einer anspruchsvollen Position trainiert – und gleichzeitig Schultern, Hüften und tiefe Bauchmuskeln zusammen arbeiten lässt. Position: Geh in den Vierfüßlerstand. Dann hebst du beide Knie vom Boden ab, etwa zwei bis drei Zentimeter. Die Zehen sind aufgestellt, die Hände unterstützen dich, der Rücken bleibt absolut gerade. Du hältst diese Position – das ist alles. Klingt einfach, ist es nicht. Du wirst Spannung im ganzen Rumpf spüren – das ist genau richtig. Atme ruhig weiter, nicht anhalten. Reizarme Schiene: 5 bis 10 Sekunden halten, 3 Wiederholungen mit Pausen. Standard: 15 bis 20 Sekunden halten, 3 Wiederholungen. Belastend: 30 Sekunden halten, 4 Wiederholungen, optional ein Arm oder Bein abwechselnd kurz anheben. Häufiger Fehler: Der Rücken hängt durch oder du schiebst den Hintern in die Luft. Beides sind Ausweichstrategien, die die Übung leichter machen, aber wirkungslos. Halte den Rücken gerade – lass dich von jemandem kontrollieren oder filme dich kurz, wenn du unsicher bist.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 6 · ÜK-S6",
          term: "Bear Crawl Hold",
        },
        {
          type: "content",
          appearTime: 4.992,
          kicker: "Was sie ist",
          headline: "Eine Halte-Übung für die Stabilisation in anspruchsvoller Position.",
          lead: "Schultern, Hüften und tiefe Bauchmuskeln arbeiten gleichzeitig zusammen.",
        },
        {
          type: "content",
          appearTime: 15.638,
          kicker: "Ausgangsposition",
          headline: "Vierfüßlerstand, dann beide Knie zwei bis drei Zentimeter abheben.",
          lead: "Zehen aufgestellt, Hände unterstützen, Rücken absolut gerade. Du hältst diese Position – das ist alles.",
        },
        {
          type: "statement",
          appearTime: 30.813,
          text: "Klingt einfach, ist es nicht.",
          emphasis: "ist es nicht",
        },
        {
          type: "reveal-list",
          appearTime: 37.93,
          kicker: "ÜK-S6 · Drei Schienen",
          title: "Bear Crawl Hold nach Tagesform",
          items: [{"label":"Reizarm – 5–10 s halten · 3x mit Pausen"},{"label":"Standard – 15–20 s halten · 3x"},{"label":"Belastend – 30 s halten, Arm/Bein anheben · 4x"}],
        },
        {
          type: "content",
          appearTime: 51.641,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Der Rücken hängt durch oder der Hintern geht in die Luft.",
          lead: "Beides macht die Übung leichter, aber wirkungslos. Rücken gerade halten – im Zweifel kontrollieren lassen oder filmen.",
        },
      ],
    },
    {
      title: "Zusammenstellung & Frequenz",
      audioSrc: `${AUDIO_BASE}/abschnitt-9.mp3`,
      transkript: "Sechs Übungen. Wie kombinierst du das? Mein Vorschlag: Nicht jeden Tag alle. Ein bis zwei Stabilisations-Einheiten pro Woche reichen vollkommen aus, vor allem am Anfang. Eine Einheit dauert etwa 15 bis 20 Minuten und enthält 4 bis 5 der sechs Übungen. Eine empfehlenswerte Anfangs-Sequenz: Transversus-Aktivierung als Aufwärmen. Dead Bug, Bird-Dog, Glute Bridge als Hauptteil. Side Plank Stufe 1 oder Bear Crawl Hold als Abschluss. Die Mobilisationen aus 2.2 kannst du täglich machen, die Stabilisationen aus 2.3 zwei- bis dreimal pro Woche. Das ist nachhaltig und übertrainiert dich nicht.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Sechs Übungen. Wie kombinierst du das?",
          emphasis: "Sechs Übungen",
        },
        {
          type: "content",
          appearTime: 3.646,
          kicker: "Nicht jeden Tag alle",
          headline: "Ein bis zwei Stabilisations-Einheiten pro Woche reichen.",
          lead: "Vor allem am Anfang. Eine Einheit dauert 15 bis 20 Minuten und enthält 4 bis 5 der sechs Übungen.",
        },
        {
          type: "reveal-list",
          appearTime: 18.227,
          kicker: "Anfangs-Sequenz · 15–20 Min",
          title: "Eine empfehlenswerte Start-Sequenz",
          items: [{"label":"Transversus-Aktivierung – als Aufwärmen"},{"label":"Dead Bug, Bird-Dog, Glute Bridge – als Hauptteil"},{"label":"Side Plank Stufe 1 oder Bear Crawl Hold – als Abschluss"}],
        },
        {
          type: "statement",
          appearTime: 31.59,
          text: "Mobilisation täglich, Stabilisation zwei- bis dreimal pro Woche.",
          emphasis: "nachhaltig",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-10.mp3`,
      transkript: "Im Workbook findest du Übung 2.3: Stabilisations-Test – ein einfacher Selbsttest, wie gut deine Beckenneutralität in Bewegung schon funktioniert. Dazu eine Sequenz-Empfehlung als Vorlage, die du an deine Tagesform anpassen kannst. In der nächsten Lektion – 2.4 – kommt der zweite Teil des Rumpftrainings: Belastungstoleranz. Echtes Krafttraining mit Lasten und Bewegungen, die du auch im Alltag brauchst. Du wirst Hip Hinges lernen, Squats, Carries. Übungen, die deinen Rücken belastbar machen für all das, was er später wieder können soll – Einkaufstüten tragen, Kinder hochheben, Möbel verschieben. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 2.3",
          headline: "Ein Workbook-Stopp: Stabilisations-Test.",
          lead: "Ein einfacher Selbsttest deiner Beckenneutralität in Bewegung – plus eine Sequenz-Vorlage für deine Tagesform.",
        },
        {
          type: "content",
          appearTime: 14.547,
          kicker: "Als Nächstes · Lektion 2.4",
          headline: "Belastungstoleranz – echtes Krafttraining für den Alltag.",
          lead: "Hip Hinges, Squats, Carries. Übungen, die deinen Rücken belastbar machen: Tüten tragen, Kinder hochheben, Möbel verschieben.",
        },
        {
          type: "word",
          appearTime: 37.511,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 37.511,
          nextLabel: "Lektion 2.4",
          nextTitle: "Modernes Rumpftraining Teil 2: Belastungstoleranz",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_2_3: number = totalSlides(lesson_2_3);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_2_3: FlatSlide[] = flatSlides(lesson_2_3);

export default lesson_2_3;
