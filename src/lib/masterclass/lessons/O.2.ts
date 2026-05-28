/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion O.2
 * Die Übergabe
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/O.2.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs O.2  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/O.2";

export const lesson_O_2: Lesson = {
  id: "O.2",
  title: "Die Übergabe",
  subtitle: "Outro · Selbstverantwortung · Deine Pfade · Ein persönlicher Abschluss",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zur letzten Lektion. Das ist O.2 – Die Übergabe. Übergabe bedeutet: das Heft des Handelns geht vollständig an dich über. Du hast jetzt alles, was du brauchst. Die Verantwortung für deinen Weg, dein System, deine Pflege liegt ab dieser Lektion bei dir. Das klingt vielleicht streng. Es ist auch nicht streng gemeint – sondern sehr klar. Diese Klarheit ist wichtig. Niemand kann für dich gesund werden. Was diese Masterclass konnte, war: dir die Werkzeuge zu zeigen, dir die Logik zu erklären, dir den Weg vorzubauen. Den Weg gehen musst du selbst.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Outro",
          lessonLabel: "Lektion O.2 – Die Übergabe",
        },
        {
          type: "word",
          appearTime: 0,
          word: "Die Übergabe.",
        },
        {
          type: "content",
          appearTime: 4.168,
          kicker: "Was Übergabe bedeutet",
          headline: "Das Heft des Handelns geht vollständig an dich über.",
          lead: "Die Verantwortung für deinen Weg, dein System, deine Pflege liegt ab jetzt bei dir.",
        },
        {
          type: "content",
          appearTime: 16.555,
          headline: "Niemand kann für dich gesund werden.",
          lead: "Was diese Masterclass konnte: dir die Werkzeuge zeigen, die Logik erklären, den Weg vorbauen.",
        },
        {
          type: "statement",
          appearTime: 30.719,
          text: "Den Weg gehen musst du selbst.",
          emphasis: "du",
        },
      ],
    },
    {
      title: "Was du jetzt bist",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Lass uns kurz beschreiben, was du jetzt bist – auch wenn du es vielleicht selbst noch nicht voll merkst. Du bist informiert. Du verstehst Anatomie und Physiologie deines Rückens auf einem Level, das die meisten Menschen ohne medizinische Ausbildung nie erreichen. Du kannst zwischen MRT-Befund und Schmerz unterscheiden. Du verstehst zentrale Sensibilisierung. Das ist riesig. Es ist die Grundlage für alle vernünftigen Entscheidungen, die du in deinem Leben in Sachen Rücken treffen wirst. Du bist handlungsfähig. Du hast einen vollen Werkzeugkasten an Übungen, mit drei Schienen jeweils. Du weißt, wie Mobilisation, Stabilisation, Belastungstoleranz, Atmung zusammenspielen. Du hast ein Pacing-Verständnis. Du kannst akute Situationen managen und chronische Entwicklungen steuern. Du bist autonom. Du hast eine eigene Ritual-Map gebaut. Du hast ein Flare-up-Protokoll geschrieben. Du hast ein Monitoring-System für deine Entwicklung. Du brauchst diese Masterclass nicht mehr aktiv – sie ist dein Nachschlagewerk, wenn du etwas vergisst. Aber dein operatives System hast du selbst gebaut. Das ist das Profil eines reifen Schmerzpatienten in der modernen Medizin: informiert, handlungsfähig, autonom. Du bist das jetzt. Vielleicht musst du noch ein paar Wochen oder Monate ins System wachsen, bis es sich selbstverständlich anfühlt. Aber du bist es.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Was du jetzt bist",
          headline: "Lass uns beschreiben, was du jetzt bist – auch wenn du es selbst noch nicht voll merkst.",
        },
        {
          type: "term",
          appearTime: 4.493,
          kicker: "Erstens",
          term: "Du bist informiert.",
        },
        {
          type: "term",
          appearTime: 25.508,
          kicker: "Zweitens",
          term: "Du bist handlungsfähig.",
        },
        {
          type: "term",
          appearTime: 41.169,
          kicker: "Drittens",
          term: "Du bist autonom.",
        },
        {
          type: "reveal-list",
          appearTime: 57.226,
          kicker: "Dein Profil",
          title: "Ein reifer Schmerzpatient in der modernen Medizin",
          items: [{"label":"Informiert"},{"label":"Handlungsfähig"},{"label":"Autonom"}],
        },
        {
          type: "statement",
          appearTime: 64.053,
          text: "Du bist das jetzt. Vielleicht musst du noch hineinwachsen – aber du bist es.",
          emphasis: "du bist es",
        },
      ],
    },
    {
      title: "Was diese Masterclass nicht leisten kann",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Ehrlich auch dazu: was diese Masterclass nicht leisten kann. Vier Grenzen, die klar benannt gehören. Erstens: Sie ist keine individuelle Befundung. Diese Masterclass kennt deinen Körper nicht. Sie weiß nicht, ob du eine spezifische Diagnose hast, die zusätzliche Vorsicht erfordert. Für individuelle Befundung ist ein Therapeut oder Arzt vor Ort nötig. Zweitens: Sie ist kein Ersatz für medizinische Behandlung. Wenn du eine spezifische Pathologie hast, die medikamentös oder chirurgisch zu behandeln ist, dann ist dieser Pfad nicht durch eine Masterclass abgedeckt. Diese Masterclass kann ergänzen, nicht ersetzen. Drittens: Sie kann dir keine Schmerzfreiheit versprechen. Das hatten wir am Anfang besprochen. Schmerzkompetenz, ja. Schmerzfreiheits-Versprechen, nein. Wer dir Schmerzfreiheit verspricht, ist unseriös. Viertens: Sie kann dich nicht zwingen, das System umzusetzen. Das ist die alte Wahrheit: Wissen wird zu Veränderung, wenn es zu Handlung wird. Ein gut gefülltes Notizbuch reicht nicht. Diese Grenzen gehören benannt. Du solltest sie kennen. Sie zu kennen schützt dich vor falschen Erwartungen – und macht dich realistisch in dem, was du als nächstes brauchst.",
      slides: [
        {
          type: "anti-list",
          appearTime: 0,
          title: "Was diese Masterclass NICHT leisten kann",
          items: [{"label":"Keine individuelle Befundung"},{"label":"Kein Ersatz für medizinische Behandlung"},{"label":"Keine Schmerzfreiheit versprechen"},{"label":"Kein Zwang zur Umsetzung"}],
        },
        {
          type: "content",
          appearTime: 4.818,
          kicker: "Grenze 1 · keine Befundung",
          headline: "Diese Masterclass kennt deinen Körper nicht.",
          lead: "Für individuelle Befundung ist ein Therapeut oder Arzt vor Ort nötig.",
        },
        {
          type: "content",
          appearTime: 19.11,
          kicker: "Grenze 2 · kein Ersatz",
          headline: "Diese Masterclass kann ergänzen, nicht ersetzen.",
          lead: "Eine spezifische Pathologie, die medikamentös oder chirurgisch zu behandeln ist, gehört nicht hierher.",
        },
        {
          type: "content",
          appearTime: 34.099,
          dark: true,
          kicker: "Grenze 3 · keine Schmerzfreiheit",
          headline: "Schmerzkompetenz, ja. Schmerzfreiheits-Versprechen, nein.",
          lead: "Wer dir Schmerzfreiheit verspricht, ist unseriös.",
        },
        {
          type: "content",
          appearTime: 45.57,
          kicker: "Grenze 4 · kein Zwang",
          headline: "Wissen wird zu Veränderung, wenn es zu Handlung wird.",
          lead: "Ein gut gefülltes Notizbuch reicht nicht.",
        },
        {
          type: "content",
          appearTime: 55.404,
          kicker: "Warum das wichtig ist",
          headline: "Diese Grenzen zu kennen schützt dich vor falschen Erwartungen.",
          lead: "Und macht dich realistisch in dem, was du als nächstes brauchst.",
        },
      ],
    },
    {
      title: "Wenn du weiter Unterstützung willst",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Wenn du nach dieser Masterclass merkst: Ich will mehr Unterstützung – dann gibt es drei Pfade. Pfad eins: Ein Therapeut vor Ort. Wenn du in der Nähe einer Praxis wohnst, die mit chronischem Schmerz arbeitet, ist das oft die beste Lösung. Individuelle Befundung, manuelle Therapie, Begleitung über Wochen. Wenn du in der Nähe von Wildau bist – die Praxis Physiotherapie Glawe von Max Glawe arbeitet genau in diesem Konzept. Termine über ihre Website. Pfad zwei: PraxisOS. PraxisOS ist der digitale Dienst von Max Glawe, der gezielt dazu konzipiert ist, Selbstanwender wie dich aus der Distanz zu begleiten. Wenn du keine lokale Praxis findest oder lieber digital arbeitest, ist das eine Option. PraxisOS bietet drei Komponenten. Eine Video-Analyse: Du sendest Video-Aufnahmen deiner Bewegung ein, Max Glawe gibt dir individuelles Feedback dazu. Ein einmaliger Service, der für viele Patienten der nächste sinnvolle Schritt nach einer Masterclass ist. Eine 21-Tage-Challenge: Ein strukturiertes Drei-Wochen-Programm, das den Recoping-Aufbau begleitet, mit täglichen Mini-Anleitungen und Check-ins. Und ein Monats-Abo: Wenn du langfristige Begleitung möchtest, eine niedrigschwellige Abonnement-Option mit regelmäßigem Austausch. Pfad drei: Selbständig weiter. Du machst dein System ohne weitere Unterstützung. Das ist legitim und es ist für viele Menschen die richtige Lösung. Wenn du dich gut ausgestattet fühlst und du willst es selbst angehen – du hast alles, was du brauchst. Es gibt keinen richtigen Pfad. Es gibt nur den Pfad, der für dich gerade passt. Wenn du diesen oder einen anderen Pfad gehst – das Wichtigste ist, dass du einen Pfad gehst.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Wenn du mehr Unterstützung willst",
          headline: "Dann gibt es drei Pfade.",
        },
        {
          type: "content",
          appearTime: 4.574,
          kicker: "Pfad 1 · Therapeut vor Ort",
          headline: "Ein Therapeut vor Ort ist oft die beste Lösung.",
          lead: "Individuelle Befundung, manuelle Therapie, Begleitung über Wochen. In der Nähe von Wildau arbeitet die Praxis Physiotherapie Glawe genau in diesem Konzept.",
        },
        {
          type: "content",
          appearTime: 27.226,
          kicker: "Pfad 2 · PraxisOS",
          headline: "PraxisOS begleitet Selbstanwender aus der Distanz.",
          lead: "Der digitale Dienst von Max Glawe – eine Option, wenn du keine lokale Praxis findest oder lieber digital arbeitest.",
        },
        {
          type: "reveal-list",
          appearTime: 44.037,
          kicker: "PraxisOS · drei Komponenten",
          title: "Was PraxisOS bietet",
          items: [{"label":"Video-Analyse – individuelles Feedback zu deiner Bewegung"},{"label":"21-Tage-Challenge – strukturierter Recoping-Aufbau"},{"label":"Monats-Abo – langfristige Begleitung mit regelmäßigem Austausch"}],
        },
        {
          type: "content",
          appearTime: 77.043,
          kicker: "Pfad 3 · selbständig weiter",
          headline: "Du machst dein System ohne weitere Unterstützung.",
          lead: "Legitim – und für viele Menschen die richtige Lösung. Du hast alles, was du brauchst.",
        },
        {
          type: "statement",
          appearTime: 91.114,
          text: "Das Wichtigste ist nicht der richtige Pfad – sondern dass du einen Pfad gehst.",
          emphasis: "einen Pfad gehst",
        },
      ],
    },
    {
      title: "Persönlicher Abschluss",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Ein letzter persönlicher Gedanke. Du hast viele Stunden mit dieser Masterclass verbracht. Du hast dir die Zeit genommen, etwas Komplexes zu verstehen. Du hast in dein eigenes Leben investiert. Das ist nicht selbstverständlich. Die meisten Menschen tun das nicht. Wenn du diese Masterclass an einem schwierigen Punkt deines Lebens begonnen hast – und das tun die meisten Menschen, sonst hätten sie nicht so eine Investition gemacht – dann ist die Tatsache, dass du jetzt hier am Ende stehst, schon ein Erfolg. Ein Erfolg von Durchhaltevermögen. Ein Erfolg von Vertrauen. Ein Erfolg von Selbstfürsorge. Ich wünsche dir für die kommenden Monate und Jahre, dass sich dein System langsam einbaut. Dass deine Ritual-Map in deinem Alltag ruhig läuft. Dass du Flares schneller und weniger schwer durchgehst. Dass du dich beim Wandern wieder darauf freust, weiter zu gehen. Dass du dich beim Einkaufen mit Selbstverständlichkeit bückst. Dass dein Rücken eines Tages wieder zur ungenutzten Stütze wird, nicht zum lauten Problem. Ich wünsche dir vor allem: dass du dir selbst gegenüber freundlich bleibst auf diesem Weg. Du wirst gute Tage und schlechte Tage haben. Wochen, in denen alles läuft, und Wochen, in denen alles zerbricht. Sei dir selbst die Person, die du dir an diesen schwierigen Tagen wünschst. Streng, aber liebevoll. Klar, aber geduldig. Danke, dass du diese Masterclass gemacht hast. Schön, dass es dich gibt – und dass du diese Reise antrittst. Mach es gut.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Ein letzter persönlicher Gedanke",
          headline: "Du hast in dein eigenes Leben investiert.",
          lead: "Das ist nicht selbstverständlich. Die meisten Menschen tun das nicht.",
        },
        {
          type: "reveal-list",
          appearTime: 12.039,
          kicker: "Dass du hier am Ende stehst, ist schon ein Erfolg",
          title: "Ein Erfolg von",
          items: [{"label":"Durchhaltevermögen"},{"label":"Vertrauen"},{"label":"Selbstfürsorge"}],
        },
        {
          type: "content",
          appearTime: 29.35,
          kicker: "Für die kommenden Monate und Jahre",
          headline: "Dass dein Rücken eines Tages wieder zur ungenutzten Stütze wird – nicht zum lauten Problem.",
          lead: "Dass dein System sich einbaut, deine Ritual-Map ruhig läuft, du Flares schneller durchgehst und dich beim Wandern wieder aufs Weitergehen freust.",
        },
        {
          type: "quote",
          appearTime: 53.592,
          text: "Sei dir selbst die Person, die du dir an schwierigen Tagen wünschst.",
          caption: "Streng, aber liebevoll. Klar, aber geduldig.",
        },
        {
          type: "statement",
          appearTime: 71.008,
          text: "Danke, dass du diese Masterclass gemacht hast.",
          emphasis: "Danke",
        },
        {
          type: "word",
          appearTime: 75.71,
          word: "Mach es gut.",
        },
      ],
    },
    {
      title: "Workbook & Abschluss",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Im Workbook findest du eine letzte Reflexionsseite – Mein Weg ab heute. Drei Felder. Erstens: Was sind die ersten drei Schritte, die du in den nächsten zwei Wochen umsetzen willst? Zweitens: Welche Unterstützung – wenn überhaupt – willst du dir holen? Drittens: Welches Bild hast du von deinem Leben in einem Jahr, wenn du dieses System konsequent umsetzt? Nimm dir zum Abschluss diese fünfzehn Minuten. Es ist ein kleiner Akt der Selbstverantwortung – und gleichzeitig ein kleiner Akt der Selbstfreundlichkeit, mit dem die Masterclass endet. Das war die letzte von siebenundzwanzig Lektionen. Die Masterclass ist abgeschlossen. Alles Gute.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Workbook · Mein Weg ab heute",
          title: "Die letzte Reflexionsseite",
          items: [{"label":"1 · Deine ersten drei Schritte in den nächsten zwei Wochen"},{"label":"2 · Welche Unterstützung – wenn überhaupt – du dir holst"},{"label":"3 · Dein Bild vom Leben in einem Jahr"}],
        },
        {
          type: "content",
          appearTime: 20.26,
          kicker: "Zum Abschluss",
          headline: "Ein kleiner Akt der Selbstverantwortung – und der Selbstfreundlichkeit.",
          lead: "Nimm dir diese fünfzehn Minuten, mit denen die Masterclass endet.",
        },
        {
          type: "statement",
          appearTime: 30.348,
          text: "Geschafft. Alle 27 Lektionen – die Masterclass ist abgeschlossen.",
          emphasis: "Geschafft",
        },
        {
          type: "word",
          appearTime: 34.377,
          word: "Alles Gute.",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_O_2: number = totalSlides(lesson_O_2);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_O_2: FlatSlide[] = flatSlides(lesson_O_2);

export default lesson_O_2;
