/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 3.4
 * Bewegung im Alltag statt Workout-Mentalität
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/3.4.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 3.4  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/3.4";

export const lesson_3_4: Lesson = {
  id: "3.4",
  title: "Bewegung im Alltag statt Workout-Mentalität",
  subtitle: "Modul 3 – Prävention · Bewegung als Lebensweise",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zur letzten Lektion von Modul 3. Diese Lektion ist gleichzeitig der Abschluss des Präventions-Moduls und die direkte Brücke zu Modul 4 – dem Recoping-Modul mit Habit Stacking. Worum geht es? Um eine Verschiebung deines Bewegungs-Verständnisses. Weg von der Workout-Mentalität – also dem Konzept, dass Bewegung in fest umrissenen Trainingseinheiten stattfindet, idealerweise zwei- bis dreimal pro Woche im Sportstudio – hin zu einer Bewegungs-Lebensweise: Bewegung als kontinuierliche Hintergrundmusik deines Tages, immer und überall. Diese Verschiebung ist nicht nur philosophisch. Sie ist messbar wichtiger für chronischen Schmerz als jede Trainingseinheit.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 3 – Prävention",
          lessonLabel: "Lektion 3.4 – Bewegung im Alltag statt Workout-Mentalität",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Die letzte Lektion von Modul 3",
          headline: "Abschluss der Prävention – und Brücke zu Modul 4.",
          lead: "Diese Lektion schließt das Präventions-Modul ab und führt direkt ins Recoping-Modul mit Habit Stacking.",
        },
        {
          type: "content",
          appearTime: 13.375,
          kicker: "Die Verschiebung",
          headline: "Von der Workout-Mentalität zur Bewegungs-Lebensweise.",
          lead: "Nicht Bewegung als fest umrissene Trainingseinheit zwei- bis dreimal pro Woche – sondern Bewegung als kontinuierliche Hintergrundmusik deines Tages, immer und überall.",
        },
        {
          type: "statement",
          appearTime: 37.536,
          text: "Diese Verschiebung ist messbar wichtiger für chronischen Schmerz als jede Trainingseinheit.",
          emphasis: "messbar wichtiger",
        },
      ],
    },
    {
      title: "Das Problem mit der Workout-Mentalität",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Viele Menschen denken über Bewegung so: Ich muss dreimal pro Woche Sport machen, um gesund zu sein. Das ist die Workout-Mentalität. Bewegung als Termin. Bewegung als abgeschlossene Einheit. Bewegung als Pflicht, die man hinter sich bringt. Diese Mentalität hat zwei Probleme. Erstens: Sie ist störungsanfällig. Eine Erkältung, eine Reise, eine stressige Arbeitswoche – und der Trainings-Termin fällt aus. Ein, zwei verpasste Wochen, und der ganze Rhythmus bricht zusammen. Wer Bewegung nur als wöchentlichen Termin kennt, hat in Wirklichkeit oft viel weniger Bewegung als gedacht. Zweitens: Sie macht 23 Stunden am Tag zu Nicht-Bewegungs-Zeit. Du machst eine Stunde Training, super. Was machst du in den anderen 23 Stunden? Sitzen, liegen, wenig laufen. Forschende sprechen hier vom Active Couch Potato Syndrome – Menschen, die zwar trainieren, aber den Rest des Tages bewegungsarm sind. Studien zeigen: Diese Menschen haben fast genauso hohe Gesundheitsrisiken wie Menschen, die gar nicht trainieren. Für chronischen Rückenschmerz ist das besonders relevant. Dein Rücken liebt nicht eine intensive Trainingsstunde gefolgt von langem Sitzen. Er liebt viele kleine Bewegungs-Impulse über den Tag verteilt. Genau das, was die Workout-Mentalität nicht liefert.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Die Workout-Mentalität",
          headline: "„Ich muss dreimal pro Woche Sport machen, um gesund zu sein.“",
          lead: "Bewegung als Termin. Als abgeschlossene Einheit. Als Pflicht, die man hinter sich bringt.",
        },
        {
          type: "content",
          appearTime: 12.364,
          kicker: "Problem 1 · Störungsanfällig",
          headline: "Eine Erkältung, eine Reise, eine stressige Woche – und der Rhythmus bricht zusammen.",
          lead: "Wer Bewegung nur als wöchentlichen Termin kennt, hat in Wirklichkeit oft viel weniger Bewegung als gedacht.",
        },
        {
          type: "content",
          appearTime: 29.059,
          dark: true,
          kicker: "Problem 2 · Active Couch Potato",
          headline: "Eine Stunde Training – und 23 Stunden Sitzen, Liegen, wenig Laufen.",
          lead: "Wer trainiert, aber den Rest des Tages bewegungsarm ist, hat fast genauso hohe Gesundheitsrisiken wie jemand, der gar nicht trainiert.",
        },
        {
          type: "statement",
          appearTime: 53.313,
          text: "Dein Rücken liebt viele kleine Bewegungs-Impulse über den Tag verteilt.",
          emphasis: "viele kleine Bewegungs-Impulse",
        },
      ],
    },
    {
      title: "NEAT: Bewegung außerhalb des Trainings",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Es gibt einen technischen Begriff für die Bewegung, die du außerhalb von Training machst: NEAT – Non-Exercise Activity Thermogenesis. Wörtlich übersetzt: Bewegungs-Energieverbrauch außerhalb von Sport. NEAT umfasst: Aufstehen, Gehen, Treppensteigen, Einkaufen, Wäsche aufhängen, Garten machen, Wackeln, Zappeln, Stehen statt Sitzen, Tippen, Gestikulieren. Alles, was nicht bewusster Sport ist, aber Bewegung. Studien der letzten zwanzig Jahre zeigen konsistent: Menschen mit hohem NEAT sind gesünder, haben weniger chronische Schmerzen, sind belastbarer – auch wenn sie kein dediziertes Training machen. NEAT ist eine Art Grundrauschen an Bewegung, das alles andere fundamentiert. Konkrete Größenordnung: Es gibt einen Unterschied von mehreren hundert Kalorien pro Tag zwischen Menschen mit hohem und niedrigem NEAT – allein durch Mikro-Bewegungen, ohne dass jemand Sport macht. Über ein Jahr summiert sich das zu erheblichen Belastungs-Unterschieden für Muskeln, Knochen, Bandscheiben. Was bedeutet das für dich? Wenn du chronisch hohen NEAT aufbaust, hast du eine Belastbarkeit, die wenig wackelt – auch wenn dein dediziertes Training mal ausfällt. NEAT ist robuster gegen Lebensstörungen als Workout-Routine.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Non-Exercise Activity Thermogenesis",
          term: "NEAT",
        },
        {
          type: "reveal-list",
          appearTime: 12.771,
          kicker: "Was NEAT umfasst",
          title: "Bewegung, die nicht Sport ist",
          items: [{"label":"Aufstehen, Gehen, Treppensteigen"},{"label":"Einkaufen, Wäsche aufhängen, Garten machen"},{"label":"Wackeln, Zappeln, Stehen statt Sitzen"},{"label":"Tippen, Gestikulieren"}],
        },
        {
          type: "content",
          appearTime: 25.948,
          kicker: "Was die Forschung zeigt",
          headline: "Hoher NEAT heißt gesünder, weniger chronische Schmerzen, belastbarer.",
          lead: "Und das auch ohne dediziertes Training. NEAT ist eine Art Grundrauschen an Bewegung, das alles andere fundamentiert.",
        },
        {
          type: "content",
          appearTime: 41.912,
          kicker: "Größenordnung",
          headline: "Mehrere hundert Kalorien pro Tag – allein durch Mikro-Bewegungen.",
          lead: "Über ein Jahr summiert sich das zu erheblichen Belastungs-Unterschieden für Muskeln, Knochen, Bandscheiben – ganz ohne Sport.",
        },
        {
          type: "statement",
          appearTime: 59.176,
          text: "NEAT ist das Grundrauschen der Bewegung. Es trägt alles andere.",
          emphasis: "Grundrauschen",
        },
      ],
    },
    {
      title: "Konkrete Alltagsbewegungen",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Wie baust du NEAT in deinem Alltag auf? Hier sind die wirksamsten Hebel. Erstens: Gehen. Der einfachste, billigste, unterschätzteste Hebel. Wer täglich 6.000 bis 10.000 Schritte geht, hat ein deutlich besseres Gesundheitsprofil als wer 2.000 Schritte geht. Das ist keine raketenwissenschaftliche Zahl – das ist im Alltag erreichbar. Statt zur Arbeit zu fahren, ein Teil davon zu laufen. Die Mittagspause draußen verbringen. Nach dem Abendessen eine Runde drehen. Zweitens: Treppen. Treppen sind ein perfektes Mini-Krafttraining. Du belastest deine Beine, deinen Rumpf, dein Herz-Kreislauf-System. Wo immer Aufzüge sind, nimm Treppen. Bewusst. Es kostet zwei Minuten mehr und es schenkt dir eine kleine Trainingseinheit. Drittens: Aktivere Wahlentscheidungen. Parkplatz weiter weg vom Eingang. Tagesziele zu Fuß erledigen statt mit Auto. Einkäufe nicht alle auf einmal, sondern dreimal pro Woche eine kleine Runde. Solche Mini-Entscheidungen summieren sich. Viertens: Stehende Aktivitäten. Manche Aufgaben, die du normalerweise sitzend machst, kannst du stehend machen. Telefonieren im Stehen. E-Mails am Stehpult. Mit der Familie nicht auf dem Sofa, sondern im Stehen kurze Gespräche. Fünftens: Pausen aktiv gestalten. Statt in der Pause das Handy zu checken, geh fünf Minuten draußen. Mach drei Hip Hinges. Eine Cat-Cow. Die Mobilisationen aus Modul 2 sind so kurz, dass du sie als Pausen-Füller einbauen kannst. Sechstens: Wochenenden als Bewegungs-Ressource. Wandern, Radfahren, Schwimmen, im Garten arbeiten, mit Kindern oder Enkeln rumtoben. Solche Aktivitäten sind nicht Sport im engeren Sinne, aber sie sind Bewegung, die Spaß macht und Stunden anhält. Dafür sind Wochenenden ideal.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Die wirksamsten Hebel",
          title: "Sechs Hebel für mehr NEAT",
          items: [{"label":"Gehen"},{"label":"Treppen"},{"label":"Aktivere Wahlentscheidungen"},{"label":"Stehende Aktivitäten"},{"label":"Pausen aktiv gestalten"},{"label":"Wochenenden als Bewegungs-Ressource"}],
        },
        {
          type: "content",
          appearTime: 4.342,
          kicker: "Hebel 1 · Gehen",
          headline: "Der einfachste, billigste, unterschätzteste Hebel.",
        },
        {
          type: "stats",
          appearTime: 8.29,
          stats: [{"value":"2.000","label":"Schritte – wenig"},{"value":"6.000","label":"Schritte – deutlich besser"},{"value":"10.000","label":"Schritte – Alltagsziel"}],
        },
        {
          type: "content",
          appearTime: 18.97,
          kicker: "Gehen im Alltag",
          headline: "Ein Teil des Arbeitswegs zu Fuß, die Mittagspause draußen, abends eine Runde.",
          lead: "Schritte verstecken sich überall im Tag – du musst sie nur einsammeln.",
        },
        {
          type: "content",
          appearTime: 24.786,
          kicker: "Hebel 2 · Treppen",
          headline: "Treppen sind ein perfektes Mini-Krafttraining.",
          lead: "Beine, Rumpf, Herz-Kreislauf-System. Wo immer Aufzüge sind: bewusst die Treppe. Zwei Minuten mehr – eine kleine Trainingseinheit geschenkt.",
        },
        {
          type: "content",
          appearTime: 39.252,
          kicker: "Hebel 3 · Aktivere Wahl",
          headline: "Kleine Wahlentscheidungen summieren sich.",
          lead: "Parkplatz weiter weg, Tagesziele zu Fuß statt mit Auto, Einkäufe in drei kleinen Runden statt einer großen.",
        },
        {
          type: "content",
          appearTime: 53.812,
          kicker: "Hebel 4 · Stehen",
          headline: "Was du sonst sitzend machst, geht oft auch im Stehen.",
          lead: "Telefonieren im Stehen, E-Mails am Stehpult, kurze Gespräche nicht auf dem Sofa, sondern im Stehen.",
        },
        {
          type: "content",
          appearTime: 67.372,
          kicker: "Hebel 5 · Aktive Pausen",
          headline: "Pausen als Bewegung statt als Handy-Zeit.",
          lead: "Fünf Minuten draußen, drei Hip Hinges, eine Cat-Cow. Die Mobilisationen aus Modul 2 sind kurz genug als Pausen-Füller.",
        },
        {
          type: "content",
          appearTime: 82.059,
          kicker: "Hebel 6 · Wochenenden",
          headline: "Wandern, Radfahren, Schwimmen, Garten, mit den Kindern rumtoben.",
          lead: "Kein Sport im engeren Sinne – aber Bewegung, die Spaß macht und Stunden anhält. Dafür sind Wochenenden ideal.",
        },
      ],
    },
    {
      title: "Das 80-20-Prinzip",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Eine letzte Idee, mit der Max Glawe Patienten oft arbeitet: das 80-20-Prinzip für Bewegung. Das Prinzip lautet: Ungefähr 80 Prozent der Wirkung kommen aus Alltagsbewegung – NEAT, Gehen, Treppen, kleine Routinen. Etwa 20 Prozent der Wirkung kommen aus dediziertem Training – Stabilisation, Krafttraining, Sport. Wenn du es umgekehrt versuchst – also 80 Prozent deiner Energie in dediziertes Training steckst und die anderen 80 Prozent des Tages bewegungsarm bist – kämpfst du gegen Schwerkraft. Wenn du es richtig herum machst – 80 Prozent leichte aber kontinuierliche Bewegung, 20 Prozent fokussiertes Training – kriegst du mehr Wirkung mit weniger Aufwand. Das heißt nicht, dass Training unwichtig ist. Modul 2 bleibt absolut wichtig. Aber Training läuft am besten, wenn es auf einem Fundament hoher Alltagsbewegung sitzt. Wer wenig sitzt, viel geht, regelmäßig die Treppe nimmt – der profitiert von einer Stabilisations-Einheit pro Woche viel mehr als jemand, der den ganzen Tag sitzt und am Wochenende krampfhaft trainiert.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Das 80-20-Prinzip",
          headline: "80 Prozent der Wirkung kommen aus Alltagsbewegung, 20 aus Training.",
          lead: "Alltagsbewegung: NEAT, Gehen, Treppen, kleine Routinen. Dediziertes Training: Stabilisation, Krafttraining, Sport.",
        },
        {
          type: "stats",
          appearTime: 21.629,
          stats: [{"value":"80%","label":"Alltagsbewegung"},{"value":"20%","label":"fokussiertes Training"},{"value":"mehr","label":"Wirkung, weniger Aufwand"}],
        },
        {
          type: "statement",
          appearTime: 40.762,
          text: "Training läuft am besten auf einem Fundament hoher Alltagsbewegung.",
          emphasis: "Fundament",
        },
      ],
    },
    {
      title: "Brücke zu Modul 4",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Vielleicht denkst du gerade: Das klingt alles vernünftig, aber wie soll ich das im Alltag wirklich umsetzen, wenn ich es immer wieder vergesse? Genau diese Frage beantworten wir im nächsten Modul. Modul 4 heißt Recoping – schmerzadaptive Wiedereingliederung von Ritualen. Du lernst dort konkret, wie du Bewegung, Atmung, Pacing in deinen Tagesablauf einknüpfst, sodass sie automatisch passieren, ohne dass du dich permanent erinnern musst. Du wirst lernen, was Habit Stacking heißt, und du wirst deine eigene Ritual-Map erstellen – ein persönliches System aus Tages-Ankern und Mini-Übungen, das deinen Alltag von innen verändert. Modul 4 ist – ehrlich gesagt – Max Glawes Lieblingsteil der Masterclass. Hier wird die Theorie zur Praxis im echten Sinne. Vorbereiten dafür musst du nichts – du bist schon mit allem ausgestattet, was du brauchst.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Die naheliegende Frage",
          headline: "„Wie setze ich das wirklich um, wenn ich es immer wieder vergesse?“",
          lead: "Genau diese Frage beantworten wir im nächsten Modul.",
        },
        {
          type: "content",
          appearTime: 12.968,
          kicker: "Modul 4 · Recoping",
          headline: "Bewegung, Atmung, Pacing so eingeknüpft, dass sie automatisch passieren.",
          lead: "Schmerzadaptive Wiedereingliederung von Ritualen: Habit Stacking und deine eigene Ritual-Map – ein System aus Tages-Ankern und Mini-Übungen.",
        },
        {
          type: "statement",
          appearTime: 39.543,
          text: "Modul 4: aus Wissen wird Alltag.",
          emphasis: "wird Alltag",
        },
      ],
    },
    {
      title: "Workbook & Modul-3-Abschluss",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook findest du Übung 3.4: Mein Alltags-Bewegungs-Inventar. Du listest dort, wann und wie du dich aktuell schon im Alltag bewegst – und identifizierst drei Punkte, an denen du mehr NEAT einbauen könntest. Ohne große Pläne, ohne Sport-Verträge. Einfach drei kleine Verschiebungen. Damit ist Modul 3 abgeschlossen. Du hast jetzt: ein Belastbarkeits-Mindset statt eines Schonungs-Reflexes aus 3.1, Befreiung von rigiden Haltungs-Vorstellungen aus 3.2, drei Lifestyle-Hebel – Schlaf, Stress, Ernährung – aus 3.3, und eine NEAT- und 80-20-Idee für Alltagsbewegung aus 3.4. Bevor du in Modul 4 startest – mach wieder einen Tag Pause. Schau, was von Modul 3 zu dir spricht und was du als nächstes umsetzen willst. Modul 4 ist dann die direkte Anwendungs-Anleitung dafür. Bis dann.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 3.4",
          headline: "Mein Alltags-Bewegungs-Inventar – drei Punkte für mehr NEAT.",
          lead: "Wann und wie bewegst du dich heute schon im Alltag? Ohne große Pläne, ohne Sport-Verträge. Einfach drei kleine Verschiebungen.",
        },
        {
          type: "reveal-list",
          appearTime: 16.346,
          kicker: "Modul 3 abgeschlossen",
          title: "Das nimmst du aus Modul 3 mit",
          items: [{"label":"Belastbarkeits-Mindset statt Schonungs-Reflex (3.1)"},{"label":"Befreiung von rigiden Haltungs-Vorstellungen (3.2)"},{"label":"Drei Lifestyle-Hebel: Schlaf, Stress, Ernährung (3.3)"},{"label":"NEAT und das 80-20-Prinzip für Alltagsbewegung (3.4)"}],
        },
        {
          type: "content",
          appearTime: 37.175,
          kicker: "Bevor es weitergeht",
          headline: "Mach wieder einen Tag Pause, bevor du in Modul 4 startest.",
          lead: "Schau, was von Modul 3 zu dir spricht und was du als nächstes umsetzen willst. Modul 4 ist die direkte Anwendungs-Anleitung dafür.",
        },
        {
          type: "word",
          appearTime: 46.602,
          word: "Bis dann.",
        },
        {
          type: "outro",
          appearTime: 46.602,
          nextLabel: "Modul 4 · Lektion 4.1",
          nextTitle: "Das Habit-Stacking-Konzept",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_3_4: number = totalSlides(lesson_3_4);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_3_4: FlatSlide[] = flatSlides(lesson_3_4);

export default lesson_3_4;
