import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 4.6 „Selbst-Monitoring:
 * Was du messen sollst — und was nicht".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 4.6", Z. 6969–7229). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-".
 *
 * Modul 4 ist Recoping/Verhaltens-Strategie — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M4_6: WorkbookData = {
  lessonId: "4.6",
  nr: "4.6",
  sectionLabel: "Modul 4 · Recoping",
  title: "Selbst-Monitoring: Was du messen sollst — und was nicht",
  subtitle:
    "Bei chronischem Schmerz ist falsches Messen schlimmer als gar nicht messen. Vier sinnvolle Dimensionen statt der Schmerzskala allein.",
  meta: {
    audio: "Audio-Dauer: 16–18 Min",
    lese: "Lese-Zeit Workbook: 28–32 Min",
    uebung: "mit Übung 4.6",
  },

  objectives: [
    "erkennen, welche Messungen schädlich sein können bei chronischem Schmerz,",
    "die vier sinnvollen Dimensionen für Selbst-Monitoring kennen,",
    "das 5-Fragen-Monatsreview anwenden können,",
    "dein eigenes Review-System aufbauen,",
    "die Übung 4.6 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Die Falle",
      text: "Was du nicht messen sollst",
    },
    {
      kind: "lead",
      text: "Bei chronischem Schmerz ist falsches Messen schlimmer als gar nicht messen. Vier Mess-Praktiken, die populär aber problematisch sind:",
    },
    {
      kind: "subheading",
      text: "1. Die Tages-Schmerzskala isoliert",
    },
    {
      kind: "paragraph",
      text: "„Wie ist dein Schmerz heute auf 0–10?“ — diese Frage täglich ohne Kontext zu beantworten, lenkt deine Aufmerksamkeit auf den Schmerz und kann die zentrale Sensibilisierung verstärken. Schmerz steht im Fokus, Funktionalität rückt in den Hintergrund.",
    },
    {
      kind: "callout",
      text: "Besser: Wenn überhaupt Schmerzskala — dann im Kontext mit Funktion und Lebensqualität.",
    },
    {
      kind: "subheading",
      text: "2. Der Bestbär-Vergleich",
    },
    {
      kind: "paragraph",
      text: "„An manchen Tagen habe ich nur Schmerz 2/10 — warum nicht heute auch?“ — Der ständige Vergleich mit den besten Tagen erzeugt Frustration. Schmerz schwankt natürlich.",
    },
    {
      kind: "callout",
      text: "Besser: Vergleiche dich mit dem langfristigen Durchschnitt der letzten Monate, nicht mit dem besten Tag.",
    },
    {
      kind: "subheading",
      text: "3. Der Vor-Schmerz-Vergleich",
    },
    {
      kind: "paragraph",
      text: "„Vor dem Schmerz konnte ich problemlos 30 km wandern.“ — Der Vergleich mit dem Vor-Schmerz-Zustand ist meistens nicht realistisch und führt zu Verzweiflung.",
    },
    {
      kind: "callout",
      text: "Besser: Vergleiche dich mit dem Zustand am Anfang der Masterclass-Anwendung.",
    },
    {
      kind: "subheading",
      text: "4. Schmerz als alleiniger Erfolgs-Indikator",
    },
    {
      kind: "paragraph",
      text: "„Wenn der Schmerz nicht weniger wird, hilft das Programm nicht.“ — Diese Logik unterschätzt erheblich, was sich verändert: Funktion, Aktivitätsradius, Selbstwirksamkeit, Schmerzkompetenz.",
    },
    {
      kind: "callout",
      text: "Besser: Schmerzintensität ist eine Dimension von vieren, nicht die einzige.",
    },

    {
      kind: "heading",
      eyebrow: "Funktion · Erholung · Flare-ups · Compliance",
      text: "Die vier sinnvollen Dimensionen",
    },
    {
      kind: "paragraph",
      text: "Stattdessen, was du sinnvoll monitorierst:",
    },
    {
      kind: "subheading",
      text: "Dimension 1 — Funktion",
    },
    {
      kind: "paragraph",
      text: "Welche Aktivitäten kannst du wieder, die du vor 3 Monaten nicht oder kaum konntest? Beispiele: Tochter heben, Garten machen, lange Spaziergänge, schwere Einkäufe tragen, Rückentraining mit Gewichten, längere Auto-Fahrten.",
    },
    {
      kind: "paragraph",
      text: "Funktion ist der wichtigste Indikator für tatsächlichen Fortschritt. Sie ist objektiver als Schmerzempfindung.",
    },
    {
      kind: "subheading",
      text: "Dimension 2 — Erholungsfähigkeit",
    },
    {
      kind: "paragraph",
      text: "Wie schnell kommst du von Belastungen oder Schmerzspitzen zurück zur Baseline? Verbesserung: Eine 3-tägige Schmerzspitze wird zu einer 1-tägigen. Ein einwöchiges Flare-up wird zu einem 3-tägigen.",
    },
    {
      kind: "subheading",
      text: "Dimension 3 — Flare-up-Statistik",
    },
    {
      kind: "paragraph",
      text: "Wie viele Flare-ups hattest du im letzten Monat / Quartal / halben Jahr? Wie lang waren sie? Verbesserung: Weniger Flare-ups, kürzere Flare-ups, leichtere Flare-ups.",
    },
    {
      kind: "subheading",
      text: "Dimension 4 — Compliance",
    },
    {
      kind: "paragraph",
      text: "Hast du dich an deine Ritual-Map gehalten? Wie viele Tage der letzten 28 hast du deine Routine gemacht? Diese Dimension ist prozessuell — sie misst, ob du dranbleibst, nicht ob es wirkt. Aber sie ist die Voraussetzung für alle anderen.",
    },

    {
      kind: "heading",
      eyebrow: "Einmal pro Monat",
      text: "Das 5-Fragen-Monatsreview",
    },
    {
      kind: "paragraph",
      text: "Einmal pro Monat (etwa 30 Minuten Zeit) durchläufst du fünf Fragen.",
    },
    {
      kind: "numberedList",
      items: [
        "Frage 1 — Was funktioniert, was du im letzten Monat hingekriegt hast, was vorher schwierig war? Liste mindestens 3 Funktionsgewinne. Nicht „keine“. Es gibt immer welche, auch wenn klein.",
        "Frage 2 — Was hat sich an deinen Flare-ups verändert? Anzahl, Dauer, Intensität? Auch keine Veränderung ist Information.",
        "Frage 3 — Wie viele der letzten 28 Tage warst du in deiner Ritual-Map? Eine ehrliche Schätzung. Über 70 %? Über 50 %?",
        "Frage 4 — Welche Faktoren haben gestört (Compliance-Abbruch, Crashes, Stresswellen)? Identifiziere Muster.",
        "Frage 5 — Was passt du an deiner Ritual-Map für den nächsten Monat an? Aufgrund der Antworten 1–4: Was bleibt, was kommt dazu, was wird leichter.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein erstes Monatsreview",
    timing: "Geschätzte Bearbeitungszeit: 30 Minuten",
    theorieRueckbindung: [
      "Du kennst jetzt die vier sinnvollen Dimensionen und das 5-Fragen-Monatsreview. Diese Übung ist dein erstes Review — eine Standortbestimmung über vier Dimensionen statt der Schmerzskala allein.",
    ],
    anleitung: ["In drei Teilen — A, B und C."],
    blocks: [
      { kind: "step", n: 1, title: "Teil A — Meine 4-Dimensions-Inventur" },
      {
        kind: "text",
        text: "Funktion (Dimension 1): Was kann ich heute, das vor 4 Wochen schwierig oder unmöglich war?",
      },
      {
        kind: "lines",
        id: "funktion",
        label: "Meine Funktionsgewinne:",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
        ],
      },
      {
        kind: "note",
        field: {
          id: "erholung",
          label:
            "Erholungsfähigkeit (Dimension 2): Wie schnell komme ich heute nach einer Schmerzspitze zurück zur Baseline?",
          rows: 3,
        },
      },
      {
        kind: "text",
        text: "Flare-up-Statistik (Dimension 3): Anzahl und durchschnittliche Dauer der Flare-ups in den letzten 4 Wochen.",
      },
      {
        kind: "lines",
        id: "flareup-statistik",
        lines: [
          { id: "anzahl", prefix: "Diesen Monat — Anzahl Flare-ups:" },
          { id: "dauer", prefix: "Durchschnittliche Dauer", mid: "Tage:" },
        ],
      },
      {
        kind: "singleChoice",
        id: "flareup-vergleich",
        label: "Im Vergleich zum letzten Monat:",
        options: [
          { id: "besser", label: "besser" },
          { id: "gleich", label: "gleich" },
          { id: "schlechter", label: "schlechter" },
        ],
      },
      {
        kind: "lines",
        id: "compliance-a",
        label: "Compliance (Dimension 4):",
        lines: [
          { id: "tage", prefix: "Von den letzten 28 Tagen war ich an etwa", mid: "Tagen in meiner Ritual-Map." },
        ],
      },

      { kind: "step", n: 2, title: "Teil B — Meine 5 Fragen" },
      {
        kind: "note",
        field: {
          id: "frage1",
          label: "1. Was funktioniert, was du im letzten Monat hingekriegt hast?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "frage2",
          label: "2. Was hat sich an deinen Flare-ups verändert?",
          rows: 3,
        },
      },
      {
        kind: "lines",
        id: "frage3",
        lines: [
          { id: "tage", prefix: "3. Compliance-Schätzung:", mid: "von 28 Tagen" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "frage4",
          label: "4. Welche Faktoren haben gestört?",
          rows: 3,
        },
      },
      {
        kind: "note",
        field: {
          id: "frage5",
          label: "5. Was passt du an deiner Ritual-Map an?",
          rows: 4,
        },
      },

      { kind: "step", n: 3, title: "Teil C — Dein Monatsreview-Rhythmus" },
      {
        kind: "singleChoice",
        id: "rhythmus-tag",
        label: "Wann machst du dein Monatsreview regelmäßig?",
        options: [
          { id: "letzter-sonntag", label: "Letzter Sonntag des Monats" },
          { id: "erster-montag", label: "Erster Montag" },
          { id: "anderer", label: "Anderer Tag" },
        ],
      },
      {
        kind: "lines",
        id: "rhythmus-tag-anderer",
        lines: [{ id: "1", prefix: "Anderer Tag:" }],
      },
      {
        kind: "singleChoice",
        id: "rhythmus-ort",
        label: "Wo dokumentierst du es?",
        options: [
          { id: "workbook", label: "In diesem Workbook (Anhang B Tagebuch)" },
          { id: "anderswo", label: "Anderswo" },
        ],
      },
      {
        kind: "lines",
        id: "rhythmus-ort-anderswo",
        lines: [{ id: "1", prefix: "Anderswo:" }],
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label: "Meine Reflexion",
          rows: 5,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
    ],
  },

  zusammenfassung: [
    "Falsches Messen kann schaden: Tages-Schmerzskala isoliert, Bestbär-Vergleich, Vor-Schmerz-Vergleich, Schmerz als alleiniger Indikator.",
    "Vier sinnvolle Dimensionen: Funktion, Erholungsfähigkeit, Flare-up-Statistik, Compliance.",
    "Funktion ist der wichtigste Indikator für tatsächlichen Fortschritt — objektiver als Schmerzempfindung.",
    "5-Fragen-Monatsreview als regelmäßige Standortbestimmung — 30 Min, einmal monatlich.",
    "Anpassung der Ritual-Map basierend auf dem Review — lebendig, nicht festgemeißelt.",
  ],

  querverweise: [
    {
      label: "Lektion 4.2",
      text: "Ritual-Map, die monatlich reviewt wird.",
    },
    {
      label: "Anhang B",
      text: "Tagebuch-Vorlagen für die Dokumentation.",
    },
  ],

  notizfeld: {
    id: "notiz-4.6",
    label: "Notizfeld",
    rows: 10,
  },
};
