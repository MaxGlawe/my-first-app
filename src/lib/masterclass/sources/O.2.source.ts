/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion O.2
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/O.2.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs O.2`). Niemals lessons/O.2.ts von Hand
 * editieren — immer hier ändern und das Build-Skript erneut laufen lassen.
 *
 * LETZTE Lektion der ganzen Masterclass (27 von 27): der emotionale und
 * praktische Abschluss. „Die Übergabe" — Selbstverantwortung, ehrliche Grenzen,
 * Unterstützungs-Pfade und ein persönlicher Abschluss. Emotional → viel Raum für
 * statement-/word-/quote-Slides (große Typo, Weißraum). Themenblöcke / Abschnitte:
 *   - Eröffnung (Übergabe):              Abschnitt 1.
 *   - Was du jetzt bist:                 Abschnitt 2 (informiert · handlungsfähig · autonom).
 *   - Was die Masterclass nicht leistet: Abschnitt 3 (vier Grenzen — HWG-relevant).
 *   - Wenn du Unterstützung willst:      Abschnitt 4 (drei Pfade; PraxisOS-Brücke).
 *   - Persönlicher Abschluss:            Abschnitt 5 (Dank, Wünsche, „Mach es gut").
 *   - Workbook & Abschluss:              Abschnitt 6 (Reflexionsseite, finaler Abschluss).
 *
 * KEINE „nächste Lektion": O.2 ist die letzte Lektion. Es gibt KEINE `outro`-Slide
 * ins Leere — der Abschnitt endet mit einem Abschluss-/Glückwunsch-Slide (word/
 * statement), der den Abschluss der gesamten Masterclass markiert.
 *
 * Aufbau identisch zu I.1 / 4.6 / O.1:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`. Erste Slide je
 *     Abschnitt: `seg = ""` (→ appearTime 0).
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–6) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die Meta-Tabelle der MD werden NICHT vertont.
 *
 * 3.-PERSON-REGEL (HIER BESONDERS WICHTIG — MD-Hinweis „persönlich gehalten"):
 * Die Stimme (Adrian) darf den Ersteller Max Glawe NICHT vortäuschen. Ich-Aussagen
 * über Max, seine Praxis, seinen Dienst oder seine Credentials wurden auf
 * „Max Glawe / er / seine Praxis / dieser Dienst" umgeschrieben:
 *   - MD: „Was ich konnte, war: dir die Werkzeuge zu zeigen, dir die Logik zu
 *     erklären, dir den Weg vorzubauen."
 *     → „Was diese Masterclass konnte, war: dir die Werkzeuge zu zeigen, dir die
 *       Logik zu erklären, dir den Weg vorzubauen."
 *   - MD: „Vier Grenzen, die ich klar benennen will"
 *     → „Vier Grenzen, die klar benannt gehören"
 *   - MD: „Ich kenne deinen Körper nicht. Ich weiß nicht, ob du eine spezifische
 *     Diagnose hast …"
 *     → „Diese Masterclass kennt deinen Körper nicht. Sie weiß nicht, ob du eine
 *       spezifische Diagnose hast …"
 *   - MD: „Wenn du in der Nähe von Wildau bist – meine Praxis Physiotherapie Glawe
 *     arbeitet genau in diesem Konzept. Termine über unsere Website."
 *     → „Wenn du in der Nähe von Wildau bist – die Praxis Physiotherapie Glawe von
 *       Max Glawe arbeitet genau in diesem Konzept. Termine über ihre Website."
 *   - MD: „PraxisOS ist mein digitaler Dienst, der gezielt dazu konzipiert ist …"
 *     → „PraxisOS ist der digitale Dienst von Max Glawe, der gezielt dazu
 *       konzipiert ist …"
 *   - MD: „Du sendest mir Video-Aufnahmen deiner Bewegung, ich gebe dir
 *     individuelles Feedback dazu."
 *     → „Du sendest Video-Aufnahmen deiner Bewegung ein, Max Glawe gibt dir
 *       individuelles Feedback dazu."
 *   GENERISCHE Abschluss-Guide-/Du-Form bleibt (sie täuscht keine Credentials vor):
 *   „den Weg gehen musst du selbst", „du hast alles, was du brauchst", die
 *   persönlichen Wünsche/Dank des Abschlusses („ich wünsche dir", „danke, dass du
 *   diese Masterclass gemacht hast", „mach es gut", „alles Gute") bleiben als
 *   Begleiter-Wünsche erhalten.
 *
 * HWG: Der MD-Wortlaut der Grenzen bleibt EXAKT erhalten — kein Heilversprechen,
 *   ausdrücklich „kein Ersatz für medizinische Behandlung", „keine Schmerzfreiheit
 *   versprechen", „kann ergänzen, nicht ersetzen". Die PraxisOS-/Praxis-Brücke ist
 *   dezent und informativ (Unterstützungs-Optionen), kein Heil- oder Erfolgs-
 *   versprechen.
 *
 * GERMAN-QUOTE-GOTCHA (CLAUDE.md): ASCII-`"` in TS-Strings bricht das Literal.
 * In narration/seg NUR einfache Anführungen ('...') oder gar keine. Die Anzeige-
 * Strings der Slides nutzen typografische Quotes („…“) — die sind unproblematisch.
 */

// ── Typen (build-only; nicht an den Client) ─────────────────────────────────

/** Slide-Inhalt + Sprech-Segment. `appearTime` wird vom Build ergänzt. */
export type SourceSlide = Record<string, unknown> & {
  type: string;
  /** Verbatim-Teilstring der narration, bei dem die Slide erscheint. */
  seg: string;
};

export interface SourceSection {
  title: string;
  /** Bereinigter Erzähltext (= vertont + Transkript). */
  narration: string;
  slides: SourceSlide[];
}

export interface SourceLesson {
  id: string;
  title: string;
  subtitle: string;
  sections: SourceSection[];
}

// ── Abschnitt 1 – Eröffnung ──────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Willkommen zur letzten Lektion. Das ist O.2 – Die Übergabe. Übergabe bedeutet: das Heft des Handelns geht vollständig an dich über. Du hast jetzt alles, was du brauchst. Die Verantwortung für deinen Weg, dein System, deine Pflege liegt ab dieser Lektion bei dir. Das klingt vielleicht streng. Es ist auch nicht streng gemeint – sondern sehr klar. Diese Klarheit ist wichtig. Niemand kann für dich gesund werden. Was diese Masterclass konnte, war: dir die Werkzeuge zu zeigen, dir die Logik zu erklären, dir den Weg vorzubauen. Den Weg gehen musst du selbst.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Outro",
      lessonLabel: "Lektion O.2 – Die Übergabe",
    },
    {
      type: "word",
      seg: "Willkommen zur letzten Lektion. Das ist O.2 – Die Übergabe.",
      word: "Die Übergabe.",
    },
    {
      type: "content",
      seg: " Übergabe bedeutet: das Heft des Handelns geht vollständig an dich über. Du hast jetzt alles, was du brauchst. Die Verantwortung für deinen Weg, dein System, deine Pflege liegt ab dieser Lektion bei dir.",
      kicker: "Was Übergabe bedeutet",
      headline: "Das Heft des Handelns geht vollständig an dich über.",
      lead: "Die Verantwortung für deinen Weg, dein System, deine Pflege liegt ab jetzt bei dir.",
    },
    {
      type: "content",
      seg: " Das klingt vielleicht streng. Es ist auch nicht streng gemeint – sondern sehr klar. Diese Klarheit ist wichtig. Niemand kann für dich gesund werden. Was diese Masterclass konnte, war: dir die Werkzeuge zu zeigen, dir die Logik zu erklären, dir den Weg vorzubauen.",
      headline: "Niemand kann für dich gesund werden.",
      lead: "Was diese Masterclass konnte: dir die Werkzeuge zeigen, die Logik erklären, den Weg vorbauen.",
    },
    {
      type: "statement",
      seg: " Den Weg gehen musst du selbst.",
      text: "Den Weg gehen musst du selbst.",
      emphasis: "du",
    },
  ],
};

// ── Abschnitt 2 – Was du jetzt bist ──────────────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Was du jetzt bist",
  narration:
    "Lass uns kurz beschreiben, was du jetzt bist – auch wenn du es vielleicht selbst noch nicht voll merkst. Du bist informiert. Du verstehst Anatomie und Physiologie deines Rückens auf einem Level, das die meisten Menschen ohne medizinische Ausbildung nie erreichen. Du kannst zwischen MRT-Befund und Schmerz unterscheiden. Du verstehst zentrale Sensibilisierung. Das ist riesig. Es ist die Grundlage für alle vernünftigen Entscheidungen, die du in deinem Leben in Sachen Rücken treffen wirst. Du bist handlungsfähig. Du hast einen vollen Werkzeugkasten an Übungen, mit drei Schienen jeweils. Du weißt, wie Mobilisation, Stabilisation, Belastungstoleranz, Atmung zusammenspielen. Du hast ein Pacing-Verständnis. Du kannst akute Situationen managen und chronische Entwicklungen steuern. Du bist autonom. Du hast eine eigene Ritual-Map gebaut. Du hast ein Flare-up-Protokoll geschrieben. Du hast ein Monitoring-System für deine Entwicklung. Du brauchst diese Masterclass nicht mehr aktiv – sie ist dein Nachschlagewerk, wenn du etwas vergisst. Aber dein operatives System hast du selbst gebaut. Das ist das Profil eines reifen Schmerzpatienten in der modernen Medizin: informiert, handlungsfähig, autonom. Du bist das jetzt. Vielleicht musst du noch ein paar Wochen oder Monate ins System wachsen, bis es sich selbstverständlich anfühlt. Aber du bist es.",
  slides: [
    {
      type: "content",
      seg: "Lass uns kurz beschreiben, was du jetzt bist – auch wenn du es vielleicht selbst noch nicht voll merkst.",
      kicker: "Was du jetzt bist",
      headline: "Lass uns beschreiben, was du jetzt bist – auch wenn du es selbst noch nicht voll merkst.",
    },
    {
      type: "term",
      seg: " Du bist informiert. Du verstehst Anatomie und Physiologie deines Rückens auf einem Level, das die meisten Menschen ohne medizinische Ausbildung nie erreichen. Du kannst zwischen MRT-Befund und Schmerz unterscheiden. Du verstehst zentrale Sensibilisierung. Das ist riesig. Es ist die Grundlage für alle vernünftigen Entscheidungen, die du in deinem Leben in Sachen Rücken treffen wirst.",
      kicker: "Erstens",
      term: "Du bist informiert.",
    },
    {
      type: "term",
      seg: " Du bist handlungsfähig. Du hast einen vollen Werkzeugkasten an Übungen, mit drei Schienen jeweils. Du weißt, wie Mobilisation, Stabilisation, Belastungstoleranz, Atmung zusammenspielen. Du hast ein Pacing-Verständnis. Du kannst akute Situationen managen und chronische Entwicklungen steuern.",
      kicker: "Zweitens",
      term: "Du bist handlungsfähig.",
    },
    {
      type: "term",
      seg: " Du bist autonom. Du hast eine eigene Ritual-Map gebaut. Du hast ein Flare-up-Protokoll geschrieben. Du hast ein Monitoring-System für deine Entwicklung. Du brauchst diese Masterclass nicht mehr aktiv – sie ist dein Nachschlagewerk, wenn du etwas vergisst. Aber dein operatives System hast du selbst gebaut.",
      kicker: "Drittens",
      term: "Du bist autonom.",
    },
    {
      type: "reveal-list",
      seg: " Das ist das Profil eines reifen Schmerzpatienten in der modernen Medizin: informiert, handlungsfähig, autonom.",
      kicker: "Dein Profil",
      title: "Ein reifer Schmerzpatient in der modernen Medizin",
      items: [
        { label: "Informiert" },
        { label: "Handlungsfähig" },
        { label: "Autonom" },
      ],
    },
    {
      type: "statement",
      seg: " Du bist das jetzt. Vielleicht musst du noch ein paar Wochen oder Monate ins System wachsen, bis es sich selbstverständlich anfühlt. Aber du bist es.",
      text: "Du bist das jetzt. Vielleicht musst du noch hineinwachsen – aber du bist es.",
      emphasis: "du bist es",
    },
  ],
};

// ── Abschnitt 3 – Was diese Masterclass nicht leisten kann ───────────────────

const abschnitt3: SourceSection = {
  title: "Was diese Masterclass nicht leisten kann",
  narration:
    "Ehrlich auch dazu: was diese Masterclass nicht leisten kann. Vier Grenzen, die klar benannt gehören. Erstens: Sie ist keine individuelle Befundung. Diese Masterclass kennt deinen Körper nicht. Sie weiß nicht, ob du eine spezifische Diagnose hast, die zusätzliche Vorsicht erfordert. Für individuelle Befundung ist ein Therapeut oder Arzt vor Ort nötig. Zweitens: Sie ist kein Ersatz für medizinische Behandlung. Wenn du eine spezifische Pathologie hast, die medikamentös oder chirurgisch zu behandeln ist, dann ist dieser Pfad nicht durch eine Masterclass abgedeckt. Diese Masterclass kann ergänzen, nicht ersetzen. Drittens: Sie kann dir keine Schmerzfreiheit versprechen. Das hatten wir am Anfang besprochen. Schmerzkompetenz, ja. Schmerzfreiheits-Versprechen, nein. Wer dir Schmerzfreiheit verspricht, ist unseriös. Viertens: Sie kann dich nicht zwingen, das System umzusetzen. Das ist die alte Wahrheit: Wissen wird zu Veränderung, wenn es zu Handlung wird. Ein gut gefülltes Notizbuch reicht nicht. Diese Grenzen gehören benannt. Du solltest sie kennen. Sie zu kennen schützt dich vor falschen Erwartungen – und macht dich realistisch in dem, was du als nächstes brauchst.",
  slides: [
    {
      type: "anti-list",
      seg: "Ehrlich auch dazu: was diese Masterclass nicht leisten kann. Vier Grenzen, die klar benannt gehören.",
      title: "Was diese Masterclass NICHT leisten kann",
      items: [
        { label: "Keine individuelle Befundung" },
        { label: "Kein Ersatz für medizinische Behandlung" },
        { label: "Keine Schmerzfreiheit versprechen" },
        { label: "Kein Zwang zur Umsetzung" },
      ],
    },
    {
      type: "content",
      seg: " Erstens: Sie ist keine individuelle Befundung. Diese Masterclass kennt deinen Körper nicht. Sie weiß nicht, ob du eine spezifische Diagnose hast, die zusätzliche Vorsicht erfordert. Für individuelle Befundung ist ein Therapeut oder Arzt vor Ort nötig.",
      kicker: "Grenze 1 · keine Befundung",
      headline: "Diese Masterclass kennt deinen Körper nicht.",
      lead: "Für individuelle Befundung ist ein Therapeut oder Arzt vor Ort nötig.",
    },
    {
      type: "content",
      seg: " Zweitens: Sie ist kein Ersatz für medizinische Behandlung. Wenn du eine spezifische Pathologie hast, die medikamentös oder chirurgisch zu behandeln ist, dann ist dieser Pfad nicht durch eine Masterclass abgedeckt. Diese Masterclass kann ergänzen, nicht ersetzen.",
      kicker: "Grenze 2 · kein Ersatz",
      headline: "Diese Masterclass kann ergänzen, nicht ersetzen.",
      lead: "Eine spezifische Pathologie, die medikamentös oder chirurgisch zu behandeln ist, gehört nicht hierher.",
    },
    {
      type: "content",
      seg: " Drittens: Sie kann dir keine Schmerzfreiheit versprechen. Das hatten wir am Anfang besprochen. Schmerzkompetenz, ja. Schmerzfreiheits-Versprechen, nein. Wer dir Schmerzfreiheit verspricht, ist unseriös.",
      dark: true,
      kicker: "Grenze 3 · keine Schmerzfreiheit",
      headline: "Schmerzkompetenz, ja. Schmerzfreiheits-Versprechen, nein.",
      lead: "Wer dir Schmerzfreiheit verspricht, ist unseriös.",
    },
    {
      type: "content",
      seg: " Viertens: Sie kann dich nicht zwingen, das System umzusetzen. Das ist die alte Wahrheit: Wissen wird zu Veränderung, wenn es zu Handlung wird. Ein gut gefülltes Notizbuch reicht nicht.",
      kicker: "Grenze 4 · kein Zwang",
      headline: "Wissen wird zu Veränderung, wenn es zu Handlung wird.",
      lead: "Ein gut gefülltes Notizbuch reicht nicht.",
    },
    {
      type: "content",
      seg: " Diese Grenzen gehören benannt. Du solltest sie kennen. Sie zu kennen schützt dich vor falschen Erwartungen – und macht dich realistisch in dem, was du als nächstes brauchst.",
      kicker: "Warum das wichtig ist",
      headline: "Diese Grenzen zu kennen schützt dich vor falschen Erwartungen.",
      lead: "Und macht dich realistisch in dem, was du als nächstes brauchst.",
    },
  ],
};

// ── Abschnitt 4 – Wenn du weiter Unterstützung willst ────────────────────────

const abschnitt4: SourceSection = {
  title: "Wenn du weiter Unterstützung willst",
  narration:
    "Wenn du nach dieser Masterclass merkst: Ich will mehr Unterstützung – dann gibt es drei Pfade. Pfad eins: Ein Therapeut vor Ort. Wenn du in der Nähe einer Praxis wohnst, die mit chronischem Schmerz arbeitet, ist das oft die beste Lösung. Individuelle Befundung, manuelle Therapie, Begleitung über Wochen. Wenn du in der Nähe von Wildau bist – die Praxis Physiotherapie Glawe von Max Glawe arbeitet genau in diesem Konzept. Termine über ihre Website. Pfad zwei: PraxisOS. PraxisOS ist der digitale Dienst von Max Glawe, der gezielt dazu konzipiert ist, Selbstanwender wie dich aus der Distanz zu begleiten. Wenn du keine lokale Praxis findest oder lieber digital arbeitest, ist das eine Option. PraxisOS bietet drei Komponenten. Eine Video-Analyse: Du sendest Video-Aufnahmen deiner Bewegung ein, Max Glawe gibt dir individuelles Feedback dazu. Ein einmaliger Service, der für viele Patienten der nächste sinnvolle Schritt nach einer Masterclass ist. Eine 21-Tage-Challenge: Ein strukturiertes Drei-Wochen-Programm, das den Recoping-Aufbau begleitet, mit täglichen Mini-Anleitungen und Check-ins. Und ein Monats-Abo: Wenn du langfristige Begleitung möchtest, eine niedrigschwellige Abonnement-Option mit regelmäßigem Austausch. Pfad drei: Selbständig weiter. Du machst dein System ohne weitere Unterstützung. Das ist legitim und es ist für viele Menschen die richtige Lösung. Wenn du dich gut ausgestattet fühlst und du willst es selbst angehen – du hast alles, was du brauchst. Es gibt keinen richtigen Pfad. Es gibt nur den Pfad, der für dich gerade passt. Wenn du diesen oder einen anderen Pfad gehst – das Wichtigste ist, dass du einen Pfad gehst.",
  slides: [
    {
      type: "content",
      seg: "Wenn du nach dieser Masterclass merkst: Ich will mehr Unterstützung – dann gibt es drei Pfade.",
      kicker: "Wenn du mehr Unterstützung willst",
      headline: "Dann gibt es drei Pfade.",
    },
    {
      type: "content",
      seg: " Pfad eins: Ein Therapeut vor Ort. Wenn du in der Nähe einer Praxis wohnst, die mit chronischem Schmerz arbeitet, ist das oft die beste Lösung. Individuelle Befundung, manuelle Therapie, Begleitung über Wochen. Wenn du in der Nähe von Wildau bist – die Praxis Physiotherapie Glawe von Max Glawe arbeitet genau in diesem Konzept. Termine über ihre Website.",
      kicker: "Pfad 1 · Therapeut vor Ort",
      headline: "Ein Therapeut vor Ort ist oft die beste Lösung.",
      lead: "Individuelle Befundung, manuelle Therapie, Begleitung über Wochen. In der Nähe von Wildau arbeitet die Praxis Physiotherapie Glawe genau in diesem Konzept.",
    },
    {
      type: "content",
      seg: " Pfad zwei: PraxisOS. PraxisOS ist der digitale Dienst von Max Glawe, der gezielt dazu konzipiert ist, Selbstanwender wie dich aus der Distanz zu begleiten. Wenn du keine lokale Praxis findest oder lieber digital arbeitest, ist das eine Option.",
      kicker: "Pfad 2 · PraxisOS",
      headline: "PraxisOS begleitet Selbstanwender aus der Distanz.",
      lead: "Der digitale Dienst von Max Glawe – eine Option, wenn du keine lokale Praxis findest oder lieber digital arbeitest.",
    },
    {
      type: "reveal-list",
      seg: " PraxisOS bietet drei Komponenten. Eine Video-Analyse: Du sendest Video-Aufnahmen deiner Bewegung ein, Max Glawe gibt dir individuelles Feedback dazu. Ein einmaliger Service, der für viele Patienten der nächste sinnvolle Schritt nach einer Masterclass ist. Eine 21-Tage-Challenge: Ein strukturiertes Drei-Wochen-Programm, das den Recoping-Aufbau begleitet, mit täglichen Mini-Anleitungen und Check-ins. Und ein Monats-Abo: Wenn du langfristige Begleitung möchtest, eine niedrigschwellige Abonnement-Option mit regelmäßigem Austausch.",
      kicker: "PraxisOS · drei Komponenten",
      title: "Was PraxisOS bietet",
      items: [
        { label: "Video-Analyse – individuelles Feedback zu deiner Bewegung" },
        { label: "21-Tage-Challenge – strukturierter Recoping-Aufbau" },
        { label: "Monats-Abo – langfristige Begleitung mit regelmäßigem Austausch" },
      ],
    },
    {
      type: "content",
      seg: " Pfad drei: Selbständig weiter. Du machst dein System ohne weitere Unterstützung. Das ist legitim und es ist für viele Menschen die richtige Lösung. Wenn du dich gut ausgestattet fühlst und du willst es selbst angehen – du hast alles, was du brauchst.",
      kicker: "Pfad 3 · selbständig weiter",
      headline: "Du machst dein System ohne weitere Unterstützung.",
      lead: "Legitim – und für viele Menschen die richtige Lösung. Du hast alles, was du brauchst.",
    },
    {
      type: "statement",
      seg: " Es gibt keinen richtigen Pfad. Es gibt nur den Pfad, der für dich gerade passt. Wenn du diesen oder einen anderen Pfad gehst – das Wichtigste ist, dass du einen Pfad gehst.",
      text: "Das Wichtigste ist nicht der richtige Pfad – sondern dass du einen Pfad gehst.",
      emphasis: "einen Pfad gehst",
    },
  ],
};

// ── Abschnitt 5 – Persönlicher Abschluss ─────────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Persönlicher Abschluss",
  narration:
    "Ein letzter persönlicher Gedanke. Du hast viele Stunden mit dieser Masterclass verbracht. Du hast dir die Zeit genommen, etwas Komplexes zu verstehen. Du hast in dein eigenes Leben investiert. Das ist nicht selbstverständlich. Die meisten Menschen tun das nicht. Wenn du diese Masterclass an einem schwierigen Punkt deines Lebens begonnen hast – und das tun die meisten Menschen, sonst hätten sie nicht so eine Investition gemacht – dann ist die Tatsache, dass du jetzt hier am Ende stehst, schon ein Erfolg. Ein Erfolg von Durchhaltevermögen. Ein Erfolg von Vertrauen. Ein Erfolg von Selbstfürsorge. Ich wünsche dir für die kommenden Monate und Jahre, dass sich dein System langsam einbaut. Dass deine Ritual-Map in deinem Alltag ruhig läuft. Dass du Flares schneller und weniger schwer durchgehst. Dass du dich beim Wandern wieder darauf freust, weiter zu gehen. Dass du dich beim Einkaufen mit Selbstverständlichkeit bückst. Dass dein Rücken eines Tages wieder zur ungenutzten Stütze wird, nicht zum lauten Problem. Ich wünsche dir vor allem: dass du dir selbst gegenüber freundlich bleibst auf diesem Weg. Du wirst gute Tage und schlechte Tage haben. Wochen, in denen alles läuft, und Wochen, in denen alles zerbricht. Sei dir selbst die Person, die du dir an diesen schwierigen Tagen wünschst. Streng, aber liebevoll. Klar, aber geduldig. Danke, dass du diese Masterclass gemacht hast. Schön, dass es dich gibt – und dass du diese Reise antrittst. Mach es gut.",
  slides: [
    {
      type: "content",
      seg: "Ein letzter persönlicher Gedanke. Du hast viele Stunden mit dieser Masterclass verbracht. Du hast dir die Zeit genommen, etwas Komplexes zu verstehen. Du hast in dein eigenes Leben investiert. Das ist nicht selbstverständlich. Die meisten Menschen tun das nicht.",
      kicker: "Ein letzter persönlicher Gedanke",
      headline: "Du hast in dein eigenes Leben investiert.",
      lead: "Das ist nicht selbstverständlich. Die meisten Menschen tun das nicht.",
    },
    {
      type: "reveal-list",
      seg: " Wenn du diese Masterclass an einem schwierigen Punkt deines Lebens begonnen hast – und das tun die meisten Menschen, sonst hätten sie nicht so eine Investition gemacht – dann ist die Tatsache, dass du jetzt hier am Ende stehst, schon ein Erfolg. Ein Erfolg von Durchhaltevermögen. Ein Erfolg von Vertrauen. Ein Erfolg von Selbstfürsorge.",
      kicker: "Dass du hier am Ende stehst, ist schon ein Erfolg",
      title: "Ein Erfolg von",
      items: [
        { label: "Durchhaltevermögen" },
        { label: "Vertrauen" },
        { label: "Selbstfürsorge" },
      ],
    },
    {
      type: "content",
      seg: " Ich wünsche dir für die kommenden Monate und Jahre, dass sich dein System langsam einbaut. Dass deine Ritual-Map in deinem Alltag ruhig läuft. Dass du Flares schneller und weniger schwer durchgehst. Dass du dich beim Wandern wieder darauf freust, weiter zu gehen. Dass du dich beim Einkaufen mit Selbstverständlichkeit bückst. Dass dein Rücken eines Tages wieder zur ungenutzten Stütze wird, nicht zum lauten Problem.",
      kicker: "Für die kommenden Monate und Jahre",
      headline: "Dass dein Rücken eines Tages wieder zur ungenutzten Stütze wird – nicht zum lauten Problem.",
      lead: "Dass dein System sich einbaut, deine Ritual-Map ruhig läuft, du Flares schneller durchgehst und dich beim Wandern wieder aufs Weitergehen freust.",
    },
    {
      type: "quote",
      seg: " Ich wünsche dir vor allem: dass du dir selbst gegenüber freundlich bleibst auf diesem Weg. Du wirst gute Tage und schlechte Tage haben. Wochen, in denen alles läuft, und Wochen, in denen alles zerbricht. Sei dir selbst die Person, die du dir an diesen schwierigen Tagen wünschst. Streng, aber liebevoll. Klar, aber geduldig.",
      text: "Sei dir selbst die Person, die du dir an schwierigen Tagen wünschst.",
      caption: "Streng, aber liebevoll. Klar, aber geduldig.",
    },
    {
      type: "statement",
      seg: " Danke, dass du diese Masterclass gemacht hast. Schön, dass es dich gibt – und dass du diese Reise antrittst.",
      text: "Danke, dass du diese Masterclass gemacht hast.",
      emphasis: "Danke",
    },
    {
      type: "word",
      seg: " Mach es gut.",
      word: "Mach es gut.",
    },
  ],
};

// ── Abschnitt 6 – Workbook und Abschluss ─────────────────────────────────────
// LETZTER Abschnitt der ganzen Masterclass. Endet NICHT mit einem `outro`-Slide
// (keine nächste Lektion), sondern mit einem Abschluss-/Glückwunsch-Statement +
// einem finalen word-Slide.

const abschnitt6: SourceSection = {
  title: "Workbook & Abschluss",
  narration:
    "Im Workbook findest du eine letzte Reflexionsseite – Mein Weg ab heute. Drei Felder. Erstens: Was sind die ersten drei Schritte, die du in den nächsten zwei Wochen umsetzen willst? Zweitens: Welche Unterstützung – wenn überhaupt – willst du dir holen? Drittens: Welches Bild hast du von deinem Leben in einem Jahr, wenn du dieses System konsequent umsetzt? Nimm dir zum Abschluss diese fünfzehn Minuten. Es ist ein kleiner Akt der Selbstverantwortung – und gleichzeitig ein kleiner Akt der Selbstfreundlichkeit, mit dem die Masterclass endet. Das war die letzte von siebenundzwanzig Lektionen. Die Masterclass ist abgeschlossen. Alles Gute.",
  slides: [
    {
      type: "reveal-list",
      seg: "Im Workbook findest du eine letzte Reflexionsseite – Mein Weg ab heute. Drei Felder. Erstens: Was sind die ersten drei Schritte, die du in den nächsten zwei Wochen umsetzen willst? Zweitens: Welche Unterstützung – wenn überhaupt – willst du dir holen? Drittens: Welches Bild hast du von deinem Leben in einem Jahr, wenn du dieses System konsequent umsetzt?",
      kicker: "Workbook · Mein Weg ab heute",
      title: "Die letzte Reflexionsseite",
      items: [
        { label: "1 · Deine ersten drei Schritte in den nächsten zwei Wochen" },
        { label: "2 · Welche Unterstützung – wenn überhaupt – du dir holst" },
        { label: "3 · Dein Bild vom Leben in einem Jahr" },
      ],
    },
    {
      type: "content",
      seg: " Nimm dir zum Abschluss diese fünfzehn Minuten. Es ist ein kleiner Akt der Selbstverantwortung – und gleichzeitig ein kleiner Akt der Selbstfreundlichkeit, mit dem die Masterclass endet.",
      kicker: "Zum Abschluss",
      headline: "Ein kleiner Akt der Selbstverantwortung – und der Selbstfreundlichkeit.",
      lead: "Nimm dir diese fünfzehn Minuten, mit denen die Masterclass endet.",
    },
    {
      type: "statement",
      seg: " Das war die letzte von siebenundzwanzig Lektionen. Die Masterclass ist abgeschlossen.",
      text: "Geschafft. Alle 27 Lektionen – die Masterclass ist abgeschlossen.",
      emphasis: "Geschafft",
    },
    {
      type: "word",
      seg: " Alles Gute.",
      word: "Alles Gute.",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "O.2",
  title: "Die Übergabe",
  subtitle: "Outro · Selbstverantwortung · Deine Pfade · Ein persönlicher Abschluss",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
  ],
};
