import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.7 „Schmerz-Coping: Graded Exposure
 * und kognitive Defusion".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.7", Z. 4547–4820). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Diese Lektion ist konzeptionell/psychologisch — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M2_7: WorkbookData = {
  lessonId: "2.7",
  nr: "2.7",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Schmerz-Coping: Graded Exposure und kognitive Defusion",
  subtitle:
    "Du musst den Schmerz nicht besiegen — du musst lernen, neben ihm zu leben: Schmerzkompetenz statt Schmerzfreiheit.",
  meta: {
    audio: "Audio-Dauer: 18–20 Min",
    lese: "Lese-Zeit Workbook: 35–40 Min",
    uebung: "mit Übung 2.7",
  },

  objectives: [
    "den Unterschied zwischen Schmerz reduzieren und mit Schmerz umgehen verstehen,",
    "das Graded-Exposure-Konzept anwenden können, um schmerzbedingte Vermeidungen schrittweise abzubauen,",
    "die Technik der kognitiven Defusion kennen, mit der du dich aus Schmerzgedanken-Schleifen lösen kannst,",
    "den Begriff Schmerzkompetenz als Ziel statt Schmerzfreiheit verstehen,",
    "die Übung 2.7 abgeschlossen haben, mit der du dein Coping-Repertoire aufbaust.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Die wichtigste begriffliche Verschiebung",
    },
    {
      kind: "lead",
      text: "Bei chronischem Schmerz ist Schmerzfreiheit selten ein realistisches Ziel. Selbst bei guten therapeutischen Erfolgen erreichen die meisten Patienten „deutliche Verbesserung“, nicht „vollständige Schmerzfreiheit“. Wenn Schmerzfreiheit das einzige Erfolgskriterium ist, gibt es daher viel Frustration.",
    },
    {
      kind: "paragraph",
      text: "Eine produktivere Zielsetzung heißt Schmerzkompetenz: die Fähigkeit, mit dem Schmerz so umzugehen, dass er das Leben nicht mehr dominiert. Du musst den Schmerz nicht besiegen — du musst lernen, mit ihm zu leben, ohne dass er dich besiegt.",
    },
    {
      kind: "bulletList",
      title: "Drei Dimensionen von Schmerzkompetenz:",
      items: [
        "Funktionalität. Was kannst du tun, trotz Schmerz? Welche Aktivitäten, Beziehungen, Aufgaben sind dir möglich?",
        "Reaktivität. Wie stark schwingt dein System aus, wenn Schmerz kommt? Kannst du eine Schmerzspitze als Spitze durchgehen lassen, oder eskaliert sie zur Krise?",
        "Selbstwirksamkeit. Hast du Werkzeuge, mit denen du auf Schmerz reagieren kannst? Oder fühlst du dich ausgeliefert?",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese drei Dimensionen sind direkt trainierbar. Diese Lektion gibt dir zwei der wichtigsten Werkzeuge dafür: Graded Exposure und kognitive Defusion.",
    },

    {
      kind: "heading",
      eyebrow: "Werkzeug 1",
      text: "Graded Exposure",
    },
    {
      kind: "paragraph",
      text: "Was ist es? Eine strukturierte, schrittweise Wiederannäherung an Aktivitäten, die du aus Schmerz-Angst vermeidest.",
    },
    {
      kind: "bulletList",
      title: "Warum funktioniert es? Aus zwei Gründen:",
      items: [
        "Erfahrung schlägt Befürchtung. Wenn du eine vermiedene Bewegung machst und merkst, dass sie nicht zur Katastrophe führt, lernt dein System: „Das war doch sicher.“ Diese Lerngelegenheit funktioniert nur durch Tun, nicht durch Denken.",
        "Das Schmerzsystem braucht Sicherheits-Signale wiederholt. Eine einmalige sichere Erfahrung reicht nicht. Aber 20 sichere Erfahrungen, über Wochen, kalibrieren das System neu.",
      ],
    },
    {
      kind: "numberedList",
      title: "Wie geht es?",
      items: [
        "Schritt 1 — Liste der vermiedenen Aktivitäten. Was machst du nicht (mehr), aus Sorge vor Schmerz oder Verschlechterung? Möglichst konkret.",
        "Schritt 2 — Hierarchie der Bedrohlichkeit. Ordne die Aktivitäten nach gefühlter Bedrohlichkeit. Was wirkt am wenigsten bedrohlich (1) bis am stärksten (10)?",
        "Schritt 3 — Beginn am unteren Ende. Du startest mit der Aktivität, die du als am wenigsten bedrohlich einstufst. Du machst sie wiederholt, bis sie sich routinemäßig anfühlt. Dann steigst du eine Stufe hoch.",
        "Schritt 4 — Atmung und Selbst-Coaching. Während der exponierten Aktivität: ruhig atmen, dir selber sagen „Das ist sicher. Das ist keine Schadensanzeige.“",
        "Schritt 5 — Reflexion nach jeder Exposition. „Was habe ich befürchtet? Was ist tatsächlich passiert? Was lerne ich daraus?“",
      ],
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Eine 6-Stufen-Hierarchie",
      body: [
        "Eine Patientin, 48, vermied seit Jahren das Heben ihrer 5-jährigen Tochter. Wir erarbeiteten:",
        "1. (Bedrohlichkeit 3) Tochter im Sitzen auf den Schoß heben.",
        "2. (4) Tochter im Stehen vor sich her tragen (3 Schritte).",
        "3. (5) Tochter aus dem Stand hochheben und festhalten (30 Sekunden).",
        "4. (6) Tochter aus dem Stand hochheben und 10 Schritte tragen.",
        "5. (7) Tochter aus dem Sitzen / Hocken hochheben.",
        "6. (9) Tochter vom Boden aufnehmen und in den Hochstuhl setzen.",
        "Wir gingen über 4 Monate durch die Stufen, jede Stufe etwa 3 Wochen. Bis Schritt 4 war die Patientin überrascht, dass sie keine Schmerzeskalation hatte. Schritt 5 war emotional schwierig (sie weinte beim ersten Mal). Schritt 6 fühlte sich am Ende routinemäßig an. Sie sagte: „Ich habe meine Tochter wieder.“",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Werkzeug 2",
      text: "Kognitive Defusion",
    },
    {
      kind: "paragraph",
      text: "Was ist es? Eine mentale Technik aus der ACT (Acceptance and Commitment Therapy), um sich von destruktiven Schmerzgedanken zu distanzieren, ohne sie verdrängen zu wollen.",
    },
    {
      kind: "paragraph",
      text: "Warum funktioniert es? Schmerzgedanken haben einen „Klebrigkeits-Effekt“ — sie ziehen die Aufmerksamkeit, befeuern emotionale Reaktion, verstärken den Schmerz. Defusion unterbricht die Klebrigkeit, ohne den Gedanken zu bekämpfen.",
    },
    {
      kind: "subheading",
      text: "Drei konkrete Defusions-Techniken",
    },
    {
      kind: "paragraph",
      text: "Technik 1: Den Gedanken etikettieren. Statt „Es wird nie besser“ zu denken und es zu glauben, denk: „Ich habe gerade den Gedanken, dass es nie besser wird.“ Der kleine sprachliche Schritt — das „Ich habe gerade den Gedanken, dass …“ — erzeugt mentalen Abstand.",
    },
    {
      kind: "paragraph",
      text: "Technik 2: Den Gedanken externalisieren. Stell dir vor, der Gedanke ist ein Radio-Reporter, der ständig die Schmerz-News berichtet. Du kannst dem Reporter zuhören, du musst seine Worte aber nicht glauben. Oder: stell dir vor, der Gedanke schwimmt vor dir vorbei wie ein Blatt auf einem Fluss. Du siehst ihn. Er ist da. Er schwimmt weiter.",
    },
    {
      kind: "paragraph",
      text: "Technik 3: Den Gedanken-Klang verändern. Sprich den Gedanken laut aus mit einer komischen Stimme — sehr hoch, sehr tief, mit Akzent. Oder singe ihn auf eine bekannte Melodie. Das klingt albern, aber es klappt: die emotionale Aufladung des Gedankens fällt ab, wenn er als Klang wahrgenommen wird, nicht als Inhalt.",
    },
    {
      kind: "vertiefung",
      title: "Defusion ist nicht Verdrängung",
      body: [
        "Ein wichtiger Unterschied: Defusion ist nicht dasselbe wie positives Umdenken oder Verdrängung. Du sagst nicht: „Nein, es wird besser werden, ich darf das nicht denken.“ Du sagst: „Ich nehme zur Kenntnis, dass mein Geist gerade dieses Skript abspielt. Es ist da. Es muss nicht handlungsleitend sein.“",
        "Diese Differenzierung ist klinisch wichtig. Verdrängung scheitert oft und führt zu Frustration. Defusion ist auch in schlechten Momenten zugänglich.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Die Integration",
      text: "Kompetenz statt Freiheit",
    },
    {
      kind: "bulletList",
      title: "Die beiden Werkzeuge — Graded Exposure und Defusion — arbeiten zusammen:",
      items: [
        "Graded Exposure baut deine Funktionalität aus (Dimension 1 der Schmerzkompetenz).",
        "Defusion reduziert deine Reaktivität (Dimension 2).",
        "Beides zusammen stärkt deine Selbstwirksamkeit (Dimension 3).",
      ],
    },
    {
      kind: "keyTakeaway",
      body: [
        "Die Botschaft dieser Lektion: Du musst nicht gegen den Schmerz kämpfen. Du musst lernen, neben ihm zu leben — und währenddessen das zu tun, was dir wichtig ist.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Meine Coping-Werkzeuge",
    timing: "Geschätzte Bearbeitungszeit: 25 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Deine vermiedenen Aktivitäten" },
      {
        kind: "text",
        text: "Was machst du nicht (mehr), aus Sorge vor Schmerz oder Verschlechterung?",
      },
      {
        kind: "note",
        field: {
          id: "vermieden",
          label: "Meine vermiedenen Aktivitäten:",
          rows: 6,
        },
      },

      { kind: "step", n: 2, title: "Deine Expositions-Hierarchie" },
      {
        kind: "text",
        text: "Wähle eine vermiedene Aktivität aus. Erstelle eine 5-Stufen-Hierarchie der Annäherung.",
      },
      {
        kind: "note",
        field: {
          id: "ziel-aktivitaet",
          label: "Aktivität, die ich wieder können möchte:",
          rows: 2,
        },
      },
      {
        kind: "lines",
        id: "hierarchie",
        label: "Meine 5 Stufen (konkrete Form — Bedrohlichkeit 1–10):",
        lines: [
          { id: "1", prefix: "Stufe 1" },
          { id: "2", prefix: "Stufe 2" },
          { id: "3", prefix: "Stufe 3" },
          { id: "4", prefix: "Stufe 4" },
          { id: "5", prefix: "Stufe 5" },
        ],
      },
      {
        kind: "lines",
        id: "start",
        lines: [
          { id: "stufe", prefix: "Mein Start: Stufe" },
          { id: "datum", prefix: "Erste Wiederholung am:" },
        ],
      },

      { kind: "step", n: 3, title: "Deine Top-3-Schmerzgedanken" },
      {
        kind: "text",
        text: "Welche Gedanken kommen bei dir in Schmerzphasen am häufigsten?",
      },
      {
        kind: "lines",
        id: "gedanken",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
        ],
      },

      { kind: "step", n: 4, title: "Defusions-Versionen" },
      {
        kind: "text",
        text: "Übersetze jeden Gedanken in eine defusierte Version (mit „Ich habe gerade den Gedanken, dass …“):",
      },
      {
        kind: "lines",
        id: "defusion",
        lines: [
          { id: "1", prefix: "Ich habe gerade den Gedanken, dass" },
          { id: "2", prefix: "Ich habe gerade den Gedanken, dass" },
          { id: "3", prefix: "Ich habe gerade den Gedanken, dass" },
        ],
      },

      { kind: "step", n: 5, title: "Deine 3 Coping-Werkzeuge für den Alltag" },
      {
        kind: "text",
        text: "Welche 3 Werkzeuge nimmst du aus dieser Lektion in den Alltag mit?",
      },
      {
        kind: "lines",
        id: "werkzeuge",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
        ],
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label: "Meine Reflexion",
          rows: 6,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
    ],
  },

  zusammenfassung: [
    "Ziel ist Schmerzkompetenz, nicht zwingend Schmerzfreiheit — drei Dimensionen: Funktionalität, Reaktivität, Selbstwirksamkeit.",
    "Graded Exposure baut Funktionalität auf — schrittweise Wiederannäherung an vermiedene Aktivitäten in 5–7 Stufen.",
    "Kognitive Defusion reduziert Reaktivität — Gedanken etikettieren, externalisieren, klanglich verändern.",
    "Beides zusammen stärkt Selbstwirksamkeit — du wirst handlungsfähig gegenüber dem Schmerz.",
    "Defusion ist nicht Verdrängung — du beobachtest Gedanken, kämpfst nicht gegen sie.",
  ],

  querverweise: [
    {
      label: "Lektion 1.3",
      text: "behandelt die Sensibilisierung, die durch Exposure neu kalibriert wird.",
    },
    {
      label: "Modul 4.4",
      text: "zeigt, wie du schmerzadaptiv wählst.",
    },
    {
      label: "Modul 4.5",
      text: "behandelt das Flare-up-Protokoll.",
    },
  ],

  notizfeld: {
    id: "notiz-2.7",
    label: "Notizfeld",
    rows: 10,
  },
};
