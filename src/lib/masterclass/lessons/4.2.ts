/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 4.2
 * Deine Ritual-Map erstellen
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/4.2.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 4.2  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/4.2";

export const lesson_4_2: Lesson = {
  id: "4.2",
  title: "Deine Ritual-Map erstellen",
  subtitle: "Modul 4 – Recoping · Dein persönliches Recoping-System in vier Schritten",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zu Lektion 4.2 – der zentralen Lektion des Recoping-Moduls. In dieser Lektion erstellst du deine persönliche Ritual-Map. Das ist die wichtigste praktische Übung der gesamten Masterclass. Was ist eine Ritual-Map? Sie ist im Grunde dein persönliches Wochensystem aus Tages-Ankern, an die deine Bewegungs-, Atmungs- und Coping-Routinen angeknüpft sind. Eine Übersicht – auf einen Blick – wie dein Bewegungs-Alltag funktioniert, ohne dass du dich permanent erinnern musst. Du wirst sie heute in vier Schritten bauen. Erstens: Tages-Anker identifizieren. Zweitens: Übungen den Ankern zuordnen. Drittens: Realitäts-Check und Reduktion. Viertens: Wochenstruktur ergänzen. Halt dir das Workbook und einen Stift bereit. Wir arbeiten parallel.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 4 – Recoping",
          lessonLabel: "Lektion 4.2 – Deine Ritual-Map erstellen",
        },
        {
          type: "statement",
          appearTime: 0,
          text: "Heute erstellst du deine persönliche Ritual-Map.",
          emphasis: "Ritual-Map",
        },
        {
          type: "content",
          appearTime: 14.629,
          kicker: "Was ist eine Ritual-Map?",
          headline: "Dein Wochensystem aus Tages-Ankern, an die deine Routinen geknüpft sind.",
          lead: "Eine Übersicht auf einen Blick, wie dein Bewegungs-Alltag funktioniert – ohne dass du dich permanent erinnern musst.",
        },
        {
          type: "reveal-list",
          appearTime: 31.718,
          kicker: "In vier Schritten",
          title: "So baust du deine Ritual-Map",
          items: [{"label":"1 · Tages-Anker identifizieren"},{"label":"2 · Übungen den Ankern zuordnen"},{"label":"3 · Realitäts-Check und Reduktion"},{"label":"4 · Wochenstruktur ergänzen"}],
        },
        {
          type: "statement",
          appearTime: 45.986,
          text: "Halt dir Workbook und Stift bereit. Wir arbeiten parallel.",
          emphasis: "parallel",
        },
      ],
    },
    {
      title: "Schritt 1 – Tages-Anker identifizieren",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Schritt eins. Tages-Anker identifizieren. Wenn du dein Habits-Inventar aus Lektion 4.1 schon ausgefüllt hast, ist die Vorarbeit gemacht. Wenn nicht, machen wir das jetzt zusammen. Tages-Anker sind Aktivitäten, die du jeden Tag praktisch garantiert machst, ohne darüber nachdenken zu müssen. Wir suchen Anker, die drei Eigenschaften erfüllen. Erstens: Sie passieren jeden Tag. Mindestens fünfmal pro Woche. Zweitens: Sie passieren zu ähnlichen Zeiten. Nicht punktgenau, aber im selben Tagesabschnitt. Drittens: Sie sind mindestens 30 Sekunden bis ein paar Minuten lang – lang genug, um eine kleine Übung daran zu hängen. Typische gute Anker, einmal über den Tag verteilt: Morgens – Aufstehen, Toilettengang, Zähneputzen, Kaffeemaschine starten, beim Kaffee warten, Frühstück machen, Anziehen, Schuhe binden. Vormittags – Computer hochfahren, erste E-Mail-Runde, Vorbereiten der ersten Aktivität, Telefonate. Mittags – Pause beginnen, Essen, Pause beenden, zurück zum Schreibtisch. Nachmittags – Snacks, Toilettengang, Pausen, Heimkehr nach der Arbeit. Abends – Sofa-Erholung, Abendessen, Aufräumen, Zähneputzen, ins Bett. Ungeeignete Anker sind solche, die unregelmäßig sind oder zu schnell vorbeigehen. Das Lift-Drücken zum Beispiel ist kein guter Anker, weil zu kurz. Spontane Pausen sind keine guten Anker, weil nicht zuverlässig. Bleib bei Stabilen. Im Workbook findest du eine Liste, in die du fünf bis zehn deiner verlässlichsten Tages-Anker einträgst. Pausiere die Lektion jetzt, mach das, und komm wieder.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Schritt 1 von 4",
          term: "Tages-Anker identifizieren",
        },
        {
          type: "content",
          appearTime: 4.493,
          kicker: "Was Tages-Anker sind",
          headline: "Aktivitäten, die du jeden Tag garantiert machst – ohne nachzudenken.",
          lead: "Hast du dein Habits-Inventar aus 4.1 ausgefüllt, ist die Vorarbeit gemacht. Wenn nicht, machen wir das jetzt zusammen.",
        },
        {
          type: "reveal-list",
          appearTime: 20.155,
          kicker: "Drei Kriterien für gute Anker",
          title: "Was einen Anker tauglich macht",
          items: [{"label":"Täglich – mindestens fünfmal pro Woche"},{"label":"Gleiche Zeit – im selben Tagesabschnitt, nicht punktgenau"},{"label":"30 Sekunden+ – lang genug für eine kleine Übung"}],
        },
        {
          type: "reveal-list",
          appearTime: 37.79,
          kicker: "Anker-Bibliothek · über den Tag",
          title: "Wo überall verlässliche Anker sitzen",
          items: [{"label":"Morgens – Zähneputzen, Kaffeemaschine, Anziehen, Schuhe binden"},{"label":"Vormittags – Computer hochfahren, erste E-Mails, Telefonate"},{"label":"Mittags – Pause beginnen, Essen, zurück zum Schreibtisch"},{"label":"Nachmittags – Snacks, Pausen, Heimkehr nach der Arbeit"},{"label":"Abends – Sofa, Abendessen, Aufräumen, Zähneputzen, ins Bett"}],
        },
        {
          type: "content",
          appearTime: 69.486,
          dark: true,
          kicker: "Ungeeignete Anker",
          headline: "Zu kurz oder zu unregelmäßig – das taugt nicht als Anker.",
          lead: "Das Lift-Drücken ist zu kurz, spontane Pausen sind nicht zuverlässig. Bleib bei stabilen Ankern.",
        },
        {
          type: "checklist",
          appearTime: 82.349,
          items: [{"icon":"pen","label":"Trag fünf bis zehn deiner verlässlichsten Tages-Anker ins Workbook ein"},{"icon":"quiet","label":"Pausiere die Lektion jetzt – mach das – und komm wieder"}],
        },
      ],
    },
    {
      title: "Schritt 2 – Übungen zuordnen",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Schritt zwei. Übungen den Ankern zuordnen. Du hast jetzt deine Ankerliste. Jetzt verknüpfst du Übungen damit. Das ist Kreativarbeit, aber mit ein paar Prinzipien wird sie einfacher. Erstes Prinzip: Wähl Übungen, die passen zur Aktivität. Lange Anker – Kaffee aufbrühen, drei bis fünf Minuten – verbinde mit komplexeren Übungen. Kurze Anker – Zähneputzen, zwei Minuten – mit etwas Schnellem. Sitzende Anker am Schreibtisch mit Übungen, die im Sitzen gehen. Stehende Anker in der Küche mit Standübungen. Zweites Prinzip: Decke verschiedene Übungs-Kategorien ab. Du willst über den Tag verteilt Mobilisation, Stabilisation und Atmung haben. Nicht alle Mobilisation morgens und nichts anderes den Rest des Tages. Verteile. Drittes Prinzip: Halte es klein. Eine Übung pro Anker. Zwei wird oft schon zu viel. Wenn du an einem Anker drei Übungen einbauen willst, hast du in Wirklichkeit drei Anker dort, und das Ganze wird unübersichtlich. Beispiele für Anker-Übungs-Kombinationen: Während die Kaffeemaschine läuft – Hip Hinge oder Cat-Cow. Beim Zähneputzen morgens – Pelvic Tilt oder einfach Beckenkippen. Computer-Hochfahren – 360-Grad-Atmung. Vor der Mittagspause – fünf Hip Hinges oder Step-ups. Nach der Mittagspause, vor der Rückkehr zum Schreibtisch – fünf bis zehn Schulter-Rolls oder thorakale Rotation im Stehen. Beim Zähneputzen abends – Transversus-Aktivierung mit Beckenkippen. Beim Ins-Bett-Gehen – Box Breathing für drei Minuten. Im Workbook ordnest du jetzt deinen identifizierten Ankern jeweils eine Übung zu. Es muss nicht für jeden Anker eine Übung sein – lieber wenige, gute Verknüpfungen als viele, halbherzige.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Schritt 2 von 4",
          term: "Übungen zuordnen",
        },
        {
          type: "content",
          appearTime: 4.261,
          kicker: "Anker → Übung",
          headline: "Jetzt verknüpfst du Übungen mit deinen Ankern.",
          lead: "Das ist Kreativarbeit – aber mit ein paar Prinzipien wird sie einfacher.",
        },
        {
          type: "content",
          appearTime: 12.992,
          kicker: "Prinzip 1 · Passend",
          headline: "Wähl Übungen, die zur Aktivität passen.",
          lead: "Lange Anker mit komplexeren Übungen, kurze mit etwas Schnellem, sitzende Anker mit Sitz-Übungen, stehende mit Standübungen.",
        },
        {
          type: "content",
          appearTime: 30.975,
          kicker: "Prinzip 2 · Verteilt",
          headline: "Decke über den Tag Mobilisation, Stabilisation und Atmung ab.",
          lead: "Nicht alle Mobilisation morgens und nichts anderes den Rest des Tages. Verteile die Kategorien.",
        },
        {
          type: "content",
          appearTime: 45.22,
          kicker: "Prinzip 3 · Klein gehalten",
          headline: "Eine Übung pro Anker. Zwei wird oft schon zu viel.",
          lead: "Willst du an einem Anker drei Übungen einbauen, hast du in Wirklichkeit drei Anker dort – und es wird unübersichtlich.",
        },
        {
          type: "reveal-list",
          appearTime: 58.108,
          kicker: "Beispiele · Anker → Übung",
          title: "So sehen gute Kombinationen aus",
          items: [{"label":"Kaffeemaschine läuft → Hip Hinge oder Cat-Cow"},{"label":"Zähneputzen morgens → Pelvic Tilt / Beckenkippen"},{"label":"Computer hochfahren → 360-Grad-Atmung"},{"label":"Vor der Mittagspause → fünf Hip Hinges oder Step-ups"},{"label":"Zurück zum Schreibtisch → Schulter-Rolls / thorakale Rotation"},{"label":"Zähneputzen abends → Transversus-Aktivierung mit Beckenkippen"},{"label":"Ins Bett gehen → Box Breathing, drei Minuten"}],
        },
        {
          type: "content",
          appearTime: 90.814,
          kicker: "Workbook · jetzt zuordnen",
          headline: "Ordne deinen Ankern jeweils eine Übung zu.",
          lead: "Es muss nicht für jeden Anker eine sein – lieber wenige, gute Verknüpfungen als viele, halbherzige.",
        },
      ],
    },
    {
      title: "Schritt 3 – Realitäts-Check & Reduktion",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Schritt drei. Realitäts-Check und Reduktion. Du hast jetzt vielleicht acht oder zehn Anker-Übungs-Paare. Das klingt nach einem schönen System. In der Realität ist es oft zu viel. Was Max Glawe in der Praxis sieht: Patienten, die euphorisch acht Mini-Übungen über den Tag verteilt einbauen, haben in der zweiten Woche schon fünf davon vergessen. Weniger ist mehr. Mein Vorschlag: Beginne mit drei Anker-Übungs-Kombinationen. Nicht mehr. Wähle drei aus deiner Liste, die folgende Eigenschaften haben. Erstens: Die Anker sind besonders stabil. Fünf Mal die Woche oder häufiger. Zweitens: Die Übungen unterscheiden sich in der Kategorie. Idealerweise eine Mobilisation, eine Stabilisation und eine Atmung. Drittens: Sie sind über den Tag verteilt. Morgens, mittags, abends – nicht alles in einer Tageszeit gehäuft. Diese drei machst du für die nächsten vier Wochen. Wenn sie nach vier Wochen automatisch laufen – du machst sie ohne darüber nachzudenken – fügst du eine vierte hinzu. Dann eine fünfte. Schritt für Schritt. Die größte Versuchung ist, zu viel auf einmal zu wollen. Widerstehe der Versuchung. Drei feste Routinen über sechs Monate sind mehr wert als zehn Routinen, die alle nach vier Wochen wieder verschwunden sind.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Schritt 3 von 4",
          term: "Realitäts-Check & Reduktion",
        },
        {
          type: "content",
          appearTime: 5.236,
          dark: true,
          kicker: "Der Realitäts-Check",
          headline: "Acht Mini-Übungen klingen schön – fünf davon sind in Woche zwei vergessen.",
          lead: "Was Max Glawe in der Praxis sieht: zu viel auf einmal scheitert. Weniger ist mehr.",
        },
        {
          type: "reveal-list",
          appearTime: 23.522,
          kicker: "Beginne mit genau drei",
          title: "Die drei wählst du nach diesen Kriterien",
          items: [{"label":"Besonders stabile Anker – fünfmal die Woche oder häufiger"},{"label":"Verschiedene Kategorien – Mobilisation, Stabilisation, Atmung"},{"label":"Über den Tag verteilt – morgens, mittags, abends"}],
        },
        {
          type: "content",
          appearTime: 51.862,
          kicker: "Der Aufbau-Rhythmus",
          headline: "Drei Routinen, vier Wochen – dann erst die nächste.",
          lead: "Laufen sie automatisch, ohne dass du nachdenkst, fügst du eine vierte hinzu. Dann eine fünfte. Schritt für Schritt.",
        },
        {
          type: "statement",
          appearTime: 62.868,
          text: "Drei feste Routinen über sechs Monate schlagen zehn, die nach vier Wochen weg sind.",
          emphasis: "Drei feste Routinen",
        },
      ],
    },
    {
      title: "Schritt 4 – Wochenstruktur ergänzen",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Schritt vier. Wochenstruktur ergänzen. Bis hier hast du dein tägliches Mikro-System. Aber chronischer Rückenschmerz braucht zusätzlich ein Wochensystem – mit den dedizierten Trainings aus Modul 2. Hier ist mein Vorschlag für eine Pacing-orientierte Woche. Montag: tägliche Mikro-Routine plus 15 Minuten Mobilisationssequenz, zum Beispiel nach Feierabend. Dienstag: tägliche Mikro-Routine plus 30 Minuten Stabilisations-Einheit aus 2.3. Mittwoch: tägliche Mikro-Routine plus Spaziergang, 30 Minuten. Donnerstag: tägliche Mikro-Routine plus 30 Minuten Krafttraining aus 2.4. Freitag: tägliche Mikro-Routine plus 15 Minuten Atemübungen aus 2.5. Samstag: tägliche Mikro-Routine plus längere Aktivität nach Wahl – Wandern, Schwimmen, eine größere Bewegungs-Form. Sonntag: tägliche Mikro-Routine plus Erholung oder leichte Mobilisation. Das ist eine Möglichkeit. Du wirst sie anpassen müssen an deinen Beruf, deine Familienlage, deine Wochenrhythmen. Aber das Grundprinzip bleibt: Die tägliche Mikro-Routine durch Habit Stacking ist unverhandelbar. Dazu drei bis vier dedizierte Trainings-Einheiten pro Woche, im Wechsel zwischen den verschiedenen Modul-2-Kategorien. Und Erholungsphasen sind eingebaut. Im Workbook hast du eine Wochenplan-Vorlage. Trag dein eigenes System ein.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Schritt 4 von 4",
          term: "Wochenstruktur ergänzen",
        },
        {
          type: "content",
          appearTime: 2.473,
          kicker: "Vom Tag zur Woche",
          headline: "Zum täglichen Mikro-System kommt ein Wochensystem.",
          lead: "Chronischer Rückenschmerz braucht zusätzlich dedizierte Trainings aus Modul 2.",
        },
        {
          type: "reveal-list",
          appearTime: 12.028,
          kicker: "Eine Pacing-orientierte Woche · Mikro-Routine täglich",
          title: "Vorschlag für deine Trainings-Woche",
          items: [{"label":"Mo – 15 Min Mobilisationssequenz"},{"label":"Di – 30 Min Stabilisation aus 2.3"},{"label":"Mi – Spaziergang, 30 Min"},{"label":"Do – 30 Min Krafttraining aus 2.4"},{"label":"Fr – 15 Min Atemübungen aus 2.5"},{"label":"Sa – längere Aktivität nach Wahl"},{"label":"So – Erholung oder leichte Mobilisation"}],
        },
        {
          type: "content",
          appearTime: 56.179,
          kicker: "Anpassen erlaubt",
          headline: "Das ist eine Möglichkeit – pass sie an dein Leben an.",
          lead: "An deinen Beruf, deine Familienlage, deine Wochenrhythmen. Aber das Grundprinzip bleibt.",
        },
        {
          type: "reveal-list",
          appearTime: 65.305,
          kicker: "Das Grundprinzip",
          title: "Drei Säulen, die bleiben",
          items: [{"label":"Tägliche Mikro-Routine durch Habit Stacking – unverhandelbar"},{"label":"Drei bis vier dedizierte Trainings pro Woche – im Wechsel"},{"label":"Erholungsphasen – fest eingebaut"}],
        },
        {
          type: "checklist",
          appearTime: 79.004,
          items: [{"icon":"pen","label":"Trag dein eigenes Wochensystem in die Vorlage im Workbook ein"}],
        },
      ],
    },
    {
      title: "Drei Praxis-Beispiele",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Drei kurze Beispiele aus der Praxis, damit du dir konkreter vorstellen kannst, wie das aussehen kann. Beispiel eins: Patricia, 52, Bürokraft, alleinerziehend. Ihre täglichen Anker: morgens beim Kaffee 360-Grad-Atmung, eine Minute. Beim Zähneputzen abends Beckenkippen, 30 Sekunden. Vorm Einschlafen im Bett Box Breathing, drei Minuten. Wöchentlich: Dienstag und Freitag jeweils 20 Minuten Stabilisations- oder Mobilisationssequenz nach Feierabend. Patricia macht damit täglich drei Mini-Übungen plus zweimal pro Woche eine kleine Sequenz. Niedriger Aufwand, hohe Compliance, in sechs Monaten deutliche Verbesserung. Beispiel zwei: Michael, 41, Softwareentwickler, viel Schreibtisch. Seine täglichen Anker: Computer hochfahren morgens, Hip Hinge, fünf Wiederholungen. Während des Telefonierens, oft zwei bis drei Mal täglich, Step-up an der Schreibtischkante oder Cat-Cow. Nach dem Mittagessen, vor dem Schreibtisch, ein Spaziergang von fünf bis zehn Minuten. Wöchentlich: Montag, Mittwoch, Freitag jeweils 30 Minuten dediziertes Training. Michael nutzt die viele Schreibtisch-Zeit für Mikro-Bewegung und ergänzt strukturiertes Training. Vorteil: er kommt auf hohe NEAT plus Trainingsvolumen. Beispiel drei: Hannelore, 67, in Rente, sehr aktiv. Ihre täglichen Anker: beim Toaster-Aufwärmen Hüftbeuger-Mobilisation pro Seite. Nach jedem Mahlzeit-Abräumen fünf Step-ups am Couchtisch. Vorm Schlafengehen 360-Grad-Atmung mit Beckenboden, fünf Minuten. Wöchentlich: Mittwoch und Samstag jeweils 30 Minuten Krafttraining mit ihren Kettlebells. Daneben täglich 6.000 bis 8.000 Schritte beim Hund-Ausführen. Hannelore macht eine sehr hohe Alltagsbewegungs-Quote und ergänzt zwei Krafteinheiten pro Woche. Drei sehr unterschiedliche Leben, drei sehr unterschiedliche Ritual-Maps. Was sie eint: Die Routinen passen zu ihrem Alltag. Sie sind nicht aufgesetzt, sondern in den existierenden Rhythmus integriert.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Drei Praxis-Beispiele",
          headline: "Drei Beispiele, damit du dir das konkreter vorstellen kannst.",
        },
        {
          type: "reveal-list",
          appearTime: 4.969,
          kicker: "Beispiel 1 · Patricia, 52, Bürokraft",
          title: "Patricias Ritual-Map",
          items: [{"label":"Morgens beim Kaffee → 360-Grad-Atmung, 1 Minute"},{"label":"Zähneputzen abends → Beckenkippen, 30 Sekunden"},{"label":"Vorm Einschlafen → Box Breathing, 3 Minuten"},{"label":"Wöchentlich → Di & Fr je 20 Min Sequenz nach Feierabend"}],
        },
        {
          type: "content",
          appearTime: 29.455,
          kicker: "Patricia · das Ergebnis",
          headline: "Niedriger Aufwand, hohe Compliance.",
          lead: "Täglich drei Mini-Übungen plus zweimal pro Woche eine kleine Sequenz – in sechs Monaten deutliche Verbesserung.",
        },
        {
          type: "reveal-list",
          appearTime: 38.673,
          kicker: "Beispiel 2 · Michael, 41, Softwareentwickler",
          title: "Michaels Ritual-Map",
          items: [{"label":"Computer hochfahren → Hip Hinge, 5 Wiederholungen"},{"label":"Beim Telefonieren → Step-up an der Schreibtischkante / Cat-Cow"},{"label":"Nach dem Mittagessen → Spaziergang, 5–10 Minuten"},{"label":"Wöchentlich → Mo, Mi, Fr je 30 Min dediziertes Training"}],
        },
        {
          type: "content",
          appearTime: 63.797,
          kicker: "Michael · das Ergebnis",
          headline: "Schreibtisch-Zeit wird zu Mikro-Bewegung.",
          lead: "Ergänzt um strukturiertes Training: hohe NEAT plus Trainingsvolumen.",
        },
        {
          type: "reveal-list",
          appearTime: 74.072,
          kicker: "Beispiel 3 · Hannelore, 67, in Rente",
          title: "Hannelores Ritual-Map",
          items: [{"label":"Toaster aufwärmen → Hüftbeuger-Mobilisation pro Seite"},{"label":"Nach dem Abräumen → 5 Step-ups am Couchtisch"},{"label":"Vorm Schlafengehen → 360-Grad-Atmung mit Beckenboden, 5 Min"},{"label":"Wöchentlich → Mi & Sa je 30 Min Kettlebell-Kraft, täglich 6–8.000 Schritte"}],
        },
        {
          type: "content",
          appearTime: 101.761,
          kicker: "Hannelore · das Ergebnis",
          headline: "Sehr hohe Alltagsbewegung plus zwei Krafteinheiten pro Woche.",
        },
        {
          type: "statement",
          appearTime: 107.891,
          text: "Deine Map passt zu dir. Nicht andersrum.",
          emphasis: "zu dir",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook ist Übung 4.2 das Herzstück deiner gesamten Masterclass-Arbeit: die Ritual-Map-Vorlage. Du hast vier Felder. Feld eins: deine drei stabilsten Tages-Anker. Feld zwei: die zugeordneten Übungen. Feld drei: dein Wochenplan für die dedizierten Einheiten. Feld vier: ein Vier-Wochen-Probe-Plan, mit dem du startest. Diese vier Felder sind dein operatives System für die nächsten Monate. Nimm dir Zeit dafür – vielleicht 20 bis 30 Minuten. Es ist die wichtigste praktische Investition der Masterclass. In Lektion 4.3 schauen wir uns das Drei-Schienen-System nochmal genauer an. Das ist die operative Komponente deiner Ritual-Map – wie wählst du eigentlich, ob du heute reizarm, Standard oder belastend übst? Was ist das Tages-Check-in? Was tust du, wenn du dich vertust? Bis gleich.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Workbook · Übung 4.2 – Meine Ritual-Map",
          title: "Die Ritual-Map-Vorlage hat vier Felder",
          items: [{"label":"Feld 1 – deine drei stabilsten Tages-Anker"},{"label":"Feld 2 – die zugeordneten Übungen"},{"label":"Feld 3 – dein Wochenplan für die dedizierten Einheiten"},{"label":"Feld 4 – ein Vier-Wochen-Probe-Plan zum Starten"}],
        },
        {
          type: "content",
          appearTime: 22.128,
          kicker: "Dein operatives System",
          headline: "Diese vier Felder tragen dich durch die nächsten Monate.",
          lead: "Nimm dir Zeit – vielleicht 20 bis 30 Minuten. Es ist die wichtigste praktische Investition der Masterclass.",
        },
        {
          type: "statement",
          appearTime: 22.128,
          text: "Das ist deine wichtigste Übung der ganzen Masterclass.",
          emphasis: "wichtigste Übung",
        },
        {
          type: "content",
          appearTime: 32.601,
          kicker: "Als Nächstes · Lektion 4.3",
          headline: "Das Drei-Schienen-System genauer – die operative Komponente.",
          lead: "Wie wählst du, ob du heute reizarm, Standard oder belastend übst? Was ist das Tages-Check-in? Und was tust du, wenn du dich vertust?",
        },
        {
          type: "word",
          appearTime: 48.437,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 48.437,
          nextLabel: "Lektion 4.3",
          nextTitle: "Der Übungs-Katalog: Drei Intensitätsschienen",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_4_2: number = totalSlides(lesson_4_2);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_4_2: FlatSlide[] = flatSlides(lesson_4_2);

export default lesson_4_2;
