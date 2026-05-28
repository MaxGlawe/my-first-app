import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion O.2 „Die Übergabe: Mein Weg ab heute".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion O.2", Z. 7385–7592). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Outro = Abschluss/Übergabe. Es existieren keine Übungsfotos für diese
 * Lektion (nur `uk-*`-Übungskarten der Modul-2-Lektionen) — daher kein
 * `image`-Block; alle visuellen Inhalte werden als Text wiedergegeben.
 * Die Reflexionsseite ist als feierliche Selbstverpflichtung („Mein Weg
 * ab heute") modelliert. „Ein persönliches Wort zum Abschluss" steht als
 * `letzteBemerkung`.
 */
export const WORKBOOK_O2: WorkbookData = {
  lessonId: "O.2",
  nr: "O.2",
  sectionLabel: "Outro · Übergabe",
  title: "Die Übergabe: Mein Weg ab heute",
  subtitle:
    "Was du jetzt bist und kannst, welche vier Grenzen diese Masterclass hat, welche drei Pfade vor dir liegen — und dein konkretes 6-Monats-Bild.",
  meta: {
    audio: "Audio-Dauer: 12–14 Min",
    lese: "Lese-Zeit Workbook: 20–25 Min",
    uebung: "mit Reflexionsseite",
  },

  objectives: [
    "ein realistisches Bild davon haben, was du jetzt bist und kannst,",
    "die vier Grenzen dieser Masterclass kennen und respektieren können,",
    "die drei Pfade nach dieser Masterclass verstehen und für dich wählen,",
    "ein konkretes 6-Monats-Bild deines Weges entworfen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Bilanz",
      text: "Was du jetzt bist",
    },
    {
      kind: "lead",
      text: "Drei Eigenschaften, die du nach dieser Masterclass mitnimmst.",
    },

    {
      kind: "subheading",
      text: "Du bist informiert.",
    },
    {
      kind: "paragraph",
      text: "Du verstehst chronischen Rückenschmerz auf dem aktuellen wissenschaftlichen Stand. Du kannst die populäre Fehlinformation in deinem Umfeld erkennen und einordnen. Du kannst medizinische Befunde lesen, ohne in Panik zu verfallen. Du verstehst, was Sensibilisierung ist, wie Plastizität funktioniert, was das biopsychosoziale Modell bedeutet.",
    },
    {
      kind: "paragraph",
      text: "Diese Information ist kein Lexikonwissen. Sie ist ein neuer Bezugsrahmen, in dem du deine Schmerzerfahrung interpretierst.",
    },

    {
      kind: "subheading",
      text: "Du bist handlungsfähig.",
    },
    {
      kind: "paragraph",
      text: "Du hast einen Werkzeugkasten. Mobilisation in drei Schienen. Stabilisation mit klarer Progression. Belastungstoleranz mit Plan. Atmung für mehrere Zwecke. Coping-Strategien für schwierige Momente. Du musst nicht warten, bis jemand für dich handelt — du kannst selber agieren.",
    },
    {
      kind: "paragraph",
      text: "Diese Handlungsfähigkeit ist nicht nur funktional. Sie ist therapeutisch wirksam an sich — Selbstwirksamkeit reduziert Schmerz messbar.",
    },

    {
      kind: "subheading",
      text: "Du bist autonom.",
    },
    {
      kind: "paragraph",
      text: "Du hast ein System (die Ritual-Map), das nicht von wöchentlichen Therapeuten-Terminen abhängt. Du kannst dich monatelang allein tragen, mit gelegentlichen externen Inputs. Das macht dich unabhängiger vom Versorgungssystem, von Therapeuten-Verfügbarkeit, von der Qualität externer Versorgung.",
    },
    {
      kind: "paragraph",
      text: "Autonomie heißt nicht: keine Hilfe annehmen. Es heißt: nicht von Hilfe abhängig sein.",
    },

    {
      kind: "heading",
      eyebrow: "Ehrlichkeit",
      text: "Die vier Grenzen dieser Masterclass",
    },
    {
      kind: "paragraph",
      text: "Es wäre unredlich, dir den Eindruck zu vermitteln, diese Masterclass könne alles. Vier klare Grenzen.",
    },
    {
      kind: "subheading",
      text: "Grenze 1 — Spezifische Pathologien",
    },
    {
      kind: "paragraph",
      text: "Diese Masterclass ist konzipiert für unspezifischen chronischen Kreuzschmerz — die Form, die die deutliche Mehrheit der Fälle ausmacht. Sie ist nicht primär konzipiert für spezifische Pathologien wie:",
    },
    {
      kind: "bulletList",
      items: [
        "Akute Bandscheibenvorfälle mit klarer Wurzelreizung und neurologischen Ausfällen",
        "Spinalkanalstenose mit klarer Claudicatio spinalis",
        "Entzündliche Erkrankungen (Morbus Bechterew, rheumatoide Arthritis)",
        "Tumor- oder Metastasen-bedingte Schmerzen",
        "Akute Frakturen oder Verletzungen",
        "Postoperative Phasen direkt nach Wirbelsäulen-OPs",
      ],
    },
    {
      kind: "paragraph",
      text: "Wenn eine dieser spezifischen Pathologien bei dir vorliegt, gehört die Therapie in spezialisierte ärztliche und physiotherapeutische Hand.",
    },
    {
      kind: "subheading",
      text: "Grenze 2 — Akute Notfälle",
    },
    {
      kind: "paragraph",
      text: "Die Notfall-Karte (Anhang C) gibt dir die Red-Flag-Symptome. Bei deren Auftreten ist sofortige ärztliche Vorstellung notwendig — keine Masterclass ersetzt das. Cauda equina, hohe entzündliche Werte, traumatische Frakturen sind Notfälle.",
    },
    {
      kind: "subheading",
      text: "Grenze 3 — Schwere psychische Komorbiditäten",
    },
    {
      kind: "paragraph",
      text: "Wenn neben dem Schmerz schwere depressive Episoden, ausgeprägte Angststörungen, posttraumatische Belastungsstörung oder andere psychiatrische Konstellationen vorliegen, braucht es psychiatrische bzw. psychotherapeutische Mitbehandlung. Diese Masterclass kann sie nicht ersetzen.",
    },
    {
      kind: "subheading",
      text: "Grenze 4 — Individuelle Detailfragen",
    },
    {
      kind: "paragraph",
      text: "Diese Masterclass ist ein strukturierter Selbstanwendungs-Kurs für die Mehrheit. Sie kann keine individuelle Diagnostik leisten, keine personalisierte Therapie-Empfehlung. Bei individuellen Fragen — „Soll ich diese Operation machen?“, „Ist mein Befund X kritisch?“, „Welche Behandlung passt zu meiner Konstellation?“ — gehört das in ärztliche Konsultation.",
    },

    {
      kind: "heading",
      eyebrow: "Wie es weitergeht",
      text: "Drei Pfade nach dieser Masterclass",
    },
    {
      kind: "subheading",
      text: "Pfad 1 — Persönliche Praxis-Begleitung in der Physiotherapie Glawe (Wildau)",
    },
    {
      kind: "paragraph",
      text: "Wenn du in räumlicher Nähe bist und dir Begleitung wünschst, kannst du in der Physiotherapie Glawe Termine buchen. Du kommst mit deinem Workbook, deiner Ritual-Map, deinen Fragen. Wir arbeiten an der Verfeinerung — der Übungstechnik, der Progression, individuelle Anpassungen, klinische Fragen.",
    },
    {
      kind: "paragraph",
      text: "Buchung über die Praxis-Website oder per Anruf. Du brauchst keine Überweisung — sektoraler Heilpraktikerstatus ermöglicht den direkten Zugang.",
    },
    {
      kind: "subheading",
      text: "Pfad 2 — PraxisOS für Fern-Begleitung",
    },
    {
      kind: "paragraph",
      text: "Wenn du nicht in räumlicher Nähe bist oder die digitale Variante bevorzugst, ist PraxisOS dein Weg. Drei Säulen:",
    },
    {
      kind: "bulletList",
      items: [
        "69 €-Videoanalyse: Du sendest Videoaufnahmen deiner Bewegungen ein, ich analysiere und gebe schriftliche Auswertung mit konkreten Anpassungen für deine Ritual-Map.",
        "49 €-21-Tage-Challenge: Strukturiertes Programm, das deine Ritual-Map in den Alltag bringt.",
        "16,99 €/Monat-Abo: Laufende Begleitung, Zugang zu Übungs-Bibliothek, Update-Beratungen, Community.",
      ],
    },
    {
      kind: "subheading",
      text: "Pfad 3 — Selbstständige Weiterführung",
    },
    {
      kind: "paragraph",
      text: "Viele Patienten setzen die Masterclass-Inhalte selbstständig fort. Das ist absolut tragfähig. Du hast alle Werkzeuge. Du machst alle 4 Wochen dein Monatsreview. Du passt deine Ritual-Map an. Du arbeitest mit deinem Hausarzt zusammen, wenn medizinische Fragen auftauchen.",
    },
    {
      kind: "paragraph",
      text: "Wer Pfad 3 wählt, kann jederzeit zu Pfad 1 oder 2 wechseln — sie sind nicht ausschließlich.",
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Reflexionsseite — Mein Weg ab heute",
    timing:
      "Dies ist deine Selbstverpflichtung am Ende der Masterclass. Nimm dir Zeit — du schreibst hier für dein zukünftiges Ich.",
    blocks: [
      { kind: "step", n: 1, title: "Teil A — Was ich jetzt bin" },
      {
        kind: "text",
        text: "Drei Eigenschaften, die ich vor 12 Wochen nicht hatte oder weniger hatte:",
      },
      {
        kind: "lines",
        id: "eigenschaften",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
        ],
      },

      { kind: "step", n: 2, title: "Teil B — Mein gewählter Pfad" },
      {
        kind: "text",
        text: "Welchen Pfad wähle ich für die nächsten 6 Monate?",
      },
      {
        kind: "singleChoice",
        id: "pfad",
        options: [
          {
            id: "pfad-1",
            label: "Pfad 1",
            description: "Physiotherapie Glawe Wildau, persönliche Begleitung",
          },
          {
            id: "pfad-2",
            label: "Pfad 2",
            description: "PraxisOS Fern-Begleitung",
          },
          {
            id: "pfad-3",
            label: "Pfad 3",
            description: "Selbstständige Weiterführung",
          },
          {
            id: "kombination",
            label: "Kombination",
            description: "eine Mischung aus mehreren Pfaden",
          },
        ],
      },
      {
        kind: "note",
        field: {
          id: "pfad-begruendung",
          label: "Warum dieser Pfad? Was passt für mein Leben?",
          rows: 4,
        },
      },

      { kind: "step", n: 3, title: "Teil C — Mein 6-Monats-Bild" },
      {
        kind: "text",
        text: "Stell dir vor, du sitzt hier in 6 Monaten wieder und liest diesen Eintrag. Wer bist du dann?",
      },
      {
        kind: "note",
        field: {
          id: "bild-funktionell",
          label: "Funktionell — was wirst du können?",
          rows: 3,
        },
      },
      {
        kind: "note",
        field: {
          id: "bild-emotional",
          label:
            "Emotional / mental — wie wirst du dich fühlen gegenüber deinem Schmerz?",
          rows: 3,
        },
      },
      {
        kind: "note",
        field: {
          id: "bild-strukturell",
          label: "Strukturell — wie wird dein Leben anders sein?",
          rows: 3,
        },
      },

      { kind: "step", n: 4, title: "Teil D — Die eine Sache, die ich nicht verliere" },
      {
        kind: "text",
        text: "Wenn nichts anderes von dieser Masterclass dauerhaft bleibt — welche eine Sache soll bleiben?",
      },
      {
        kind: "note",
        field: {
          id: "eine-sache",
          label: "Die eine Sache, die bleibt:",
          rows: 4,
        },
      },

      { kind: "step", n: 5, title: "Teil E — Meine Abschluss-Worte an mich selbst" },
      {
        kind: "text",
        text: "Was möchtest du dir selbst sagen, am Ende dieser Masterclass?",
      },
      {
        kind: "note",
        field: {
          id: "abschluss-worte",
          label: "Meine Abschluss-Worte an mich selbst:",
          rows: 6,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
      {
        kind: "hint",
        text: "Diese Seite ist deine Selbstverpflichtung. Komm in einem halben Jahr hierher zurück und lies, wer du heute warst — und wer du geworden bist.",
      },
    ],
  },

  letzteBemerkung: {
    title: "Ein persönliches Wort zum Abschluss",
    body: [
      "Du hast diese Masterclass durchgearbeitet. Das ist nicht selbstverständlich. Viele Menschen mit chronischen Schmerzen geben irgendwann auf, in der einen oder anderen Form — sie kapitulieren, sie verbittern, sie betäuben. Du hast etwas anderes getan: du hast Zeit, Aufmerksamkeit, Mühe in dein eigenes Verstehen und in dein eigenes Handeln investiert.",
      "Was jetzt passiert, ist nicht Heilung im klassischen Sinne. Es ist Kompetenz. Du wirst weiter Schmerzen haben — wahrscheinlich. Aber du wirst anders damit umgehen. Du wirst handlungsfähig sein. Du wirst Schmerz als Teil deines Lebens haben, nicht als Hauptthema deines Lebens.",
      "Das ist genug.",
      "Du verdankst diesen Fortschritt nicht mir, nicht der Masterclass — du verdankst ihn dir selbst. Ich habe Werkzeuge zur Verfügung gestellt. Du hast sie aufgenommen und in dein Leben integriert.",
      "Ich wünsche dir die nächsten Wochen, Monate und Jahre einen ruhigen, kompetenten, selbstwirksamen Umgang mit deinem Rücken. Du hast das Zeug dazu. Du hast es schon bewiesen.",
      "Wenn du Fragen hast, wenn du eine Anpassung brauchst, wenn etwas nicht funktioniert — die Tür ist offen. Aber sie ist nicht nötig. Du trägst dich selbst.",
      "— Max Glawe, Physiotherapie Glawe / PraxisOS",
    ],
  },

  zusammenfassung: [
    "Du bist informiert, handlungsfähig und autonom — drei Eigenschaften, die du aus dieser Masterclass mitnimmst.",
    "Die Masterclass hat vier Grenzen: spezifische Pathologien, akute Notfälle, schwere psychische Komorbiditäten und individuelle Detailfragen. Diese gehören in ärztliche Hand.",
    "Drei Pfade stehen dir offen: persönliche Praxis-Begleitung (Physiotherapie Glawe Wildau), PraxisOS-Fern-Begleitung und selbstständige Weiterführung — sie sind nicht ausschließlich.",
    "Dein 6-Monats-Bild macht den Weg konkret: funktionell, emotional und strukturell.",
    "Was bleibt, ist nicht Heilung, sondern Kompetenz — ein selbstwirksamer Umgang mit deinem Rücken. Du trägst dich selbst.",
  ],

  querverweise: [
    {
      label: "Lektion O.1",
      text: "fasst die drei Kernbotschaften der Masterclass zusammen und hilft dir, deine drei Mitnehm-Sätze zu formulieren.",
    },
    {
      label: "Lektion 4.6",
      text: "beschreibt das 5-Fragen-Monatsreview, mit dem du deinen Weg alle 4 Wochen weiterführst.",
    },
    {
      label: "Anhang C: Notfall-Karte",
      text: "enthält die Red-Flag-Symptome für die Grenze der Selbstanwendung — griffbereit für den Bedarfsfall.",
    },
  ],

  notizfeld: {
    id: "notiz-O.2",
    label: "Notizfeld",
    helper:
      "Platz für deine Gedanken zum Abschluss: Welcher Pfad passt zu dir, welche Fragen bleiben offen, was nimmst du dir konkret vor?",
    rows: 10,
  },
};
