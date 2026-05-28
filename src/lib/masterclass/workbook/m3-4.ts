import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 3.4 „Bewegung im Alltag (NEAT)
 * statt Workout-Mentalität".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 3.4“, Z. 5491–5719). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 3 ist überwiegend Alltag/Theorie — es existieren keine
 * passenden Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M3_4: WorkbookData = {
  lessonId: "3.4",
  nr: "3.4",
  sectionLabel: "Modul 3 – Prävention",
  title: "Bewegung im Alltag (NEAT) statt Workout-Mentalität",
  subtitle:
    "80 % deiner gesundheitswirksamen Bewegung kommt aus dem Alltag — 30 Mini-Botschaften pro Tag sind wirksamer als drei Workouts pro Woche.",
  meta: {
    audio: "Audio-Dauer: 14–16 Min",
    lese: "Lese-Zeit Workbook: 25–28 Min",
    uebung: "mit Übung 3.4",
  },

  objectives: [
    "den Begriff NEAT (Non-Exercise Activity Thermogenesis) verstehen,",
    "erkennen, warum eine Stunde Workout 23 Stunden Sitzen nicht ausgleicht,",
    "das 80-20-Prinzip der Bewegung anwenden können,",
    "dein persönliches Alltags-Bewegungs-Inventar erstellen können,",
    "die Übung 3.4 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Problem",
      text: "Das Problem der Workout-Mentalität",
    },
    {
      kind: "lead",
      text: "Viele Menschen denken über Bewegung in einem Modus: „Sport machen“. Das heißt: dedizierte Zeit, dedizierter Ort (Studio, Park, Fitness-Studio), dedizierte Kleidung, dediziertes Programm. 3–4 mal pro Woche je eine Stunde.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht schlecht. Aber: bei Menschen mit chronischem Kreuzschmerz reicht es oft nicht. Drei Gründe:",
    },
    {
      kind: "paragraph",
      text: "Erstens: Die Bewegungsmenge ist zu klein. 3 mal 60 Min = 180 Min pro Woche. Über 7 Tage gerechnet sind das etwa 25 Min pro Tag. Der Rest des Tages ist meistens sitzend.",
    },
    {
      kind: "paragraph",
      text: "Zweitens: Die Bewegungsmuster sind zu uniform. Wer 3× pro Woche das gleiche Workout macht, deckt nur einen Bruchteil des menschlichen Bewegungsspektrums ab.",
    },
    {
      kind: "paragraph",
      text: "Drittens: Die Botschaft an das Schmerzsystem ist diskontinuierlich. Drei Sicherheits-Botschaften pro Woche sind weniger wirksam als 30 Mini-Botschaften pro Tag.",
    },

    {
      kind: "heading",
      eyebrow: "NEAT",
      text: "NEAT: die Bewegung zwischen den Workouts",
    },
    {
      kind: "paragraph",
      text: "NEAT = Non-Exercise Activity Thermogenesis. Es bezeichnet die gesamte körperliche Aktivität jenseits von dediziertem Sport: Gehen, Treppensteigen, Stehen, Putzen, Gärtnern, Tragen, Heben im Alltag.",
    },
    {
      kind: "paragraph",
      text: "Forschungs-Ergebnisse: NEAT ist oft vier- bis fünffach umfangreicher als dedizierter Sport. Wer 10.000 Schritte am Tag macht, bewegt sich oft länger und energetisch mehr als beim 60-Minuten-Workout.",
    },
    {
      kind: "bulletList",
      title: "Für Schmerzpatienten ist NEAT aus mehreren Gründen besonders wertvoll:",
      items: [
        "Konsistenz: NEAT verteilt sich über den ganzen Tag. Die Sicherheits-Botschaft an das Schmerzsystem kommt regelmäßig.",
        "Vielfalt: Alltagsbewegung deckt viele Bewegungsmuster ab — Gehen, Heben, Bücken, Greifen, Strecken.",
        "Niedrigschwelligkeit: NEAT braucht keine besondere Ausrüstung, keinen besonderen Ort.",
        "Realismus: Selbst an Tagen, an denen Workout nicht möglich ist, ist NEAT meist möglich.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Faustregel",
      text: "Das 80-20-Prinzip",
    },
    {
      kind: "paragraph",
      text: "Eine nützliche Faustregel: 80 % deiner gesundheitswirksamen Bewegung sollte aus NEAT kommen, 20 % aus dediziertem Training.",
    },
    {
      kind: "bulletList",
      title: "Bei chronischem Kreuzschmerz übersetzt sich das in:",
      items: [
        "NEAT (80 %): Gehen, Treppen statt Lift, Stehen statt Sitzen, Mini-Mobilisation in Pausen, Gartenarbeit, Putzen, mit Kindern spielen, Spazierengehen, Einkäufe tragen.",
        "Workout (20 %): Die strukturierten Übungen aus Modul 2 — Mobilisation, Stabilisation, Belastungstoleranz, Atmung.",
      ],
    },
    {
      kind: "paragraph",
      text: "Das Workout ist nicht überflüssig. Es trainiert spezifische Strukturen, die NEAT allein nicht so gezielt erreicht. Aber es ist die Minderheit der gesundheitlich relevanten Bewegung.",
    },

    {
      kind: "heading",
      eyebrow: "Praxis",
      text: "Konkrete NEAT-Verstärker",
    },
    {
      kind: "table",
      caption: "Praktische NEAT-Steigerung im Alltag",
      headers: ["Bereich", "Konkrete Maßnahme"],
      rows: [
        ["Gehen", "Täglich 7.000–10.000 Schritte als Ziel; Schrittzähler hilft"],
        ["Treppen", "Konsequent Treppen statt Lift / Rolltreppe"],
        ["Auto-Alternativen", "Kurze Strecken zu Fuß oder mit dem Rad"],
        ["Telefonate", "Im Stehen oder beim Gehen führen"],
        ["Meeting-Kultur", "Walking Meetings, wenn möglich"],
        ["Pausen", "Mini-Bewegung alle 30–60 Min"],
        ["Haushalt", "Bewusst als Bewegung wertschätzen (Putzen, Bügeln, Gartenarbeit)"],
        ["Kinder / Enkel", "Aktives Spielen mit ihnen"],
        ["Einkauf", "Zu Fuß oder per Rad zum nahen Laden"],
      ],
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Die 50-Schritte-Regel",
      body: [
        "Ein einfacher Trick, den ich oft empfehle: Mache am Bürotag alle 30 Minuten 50 Schritte. Stell einen Wecker. Steh auf, geh in die Küche und wieder zurück. Das sind ca. 60–80 Schritte. Über 8 Stunden Arbeitszeit ergeben das 16 Pausen mit zusammen ca. 1.000 Schritten und 16 Mobilisations-Mini-Episoden für die Wirbelsäule.",
        "Niedriger Aufwand, hoher Effekt. Die meisten Patienten berichten nach 4 Wochen konsistenter Anwendung subjektive Verbesserung.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Alltags-Bewegungs-Inventar",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Dein aktueller NEAT-Status" },
      {
        kind: "lines",
        id: "neat-status",
        label: "Status:",
        lines: [
          { id: "schritte", prefix: "Geschätzte Schritte pro Tag:" },
          { id: "treppen", prefix: "Wie oft Treppen statt Lift? (immer / oft / selten / nie):" },
          { id: "sitzen", prefix: "Wie viele Stunden sitzen pro Tag?" },
          { id: "mittagspause", prefix: "Bewege ich mich in der Mittagspause? (ja / nein):" },
          { id: "schrittzaehler", prefix: "Habe ich einen Schrittzähler / Smartwatch? (ja / nein):" },
        ],
      },

      { kind: "step", n: 2, title: "Deine NEAT-Hebel" },
      {
        kind: "text",
        text: "Welche drei NEAT-Verstärker baust du in den nächsten 4 Wochen ein?",
      },
      {
        kind: "lines",
        id: "neat-hebel",
        lines: [{ id: "1" }, { id: "2" }, { id: "3" }],
      },

      { kind: "step", n: 3, title: "Das NEAT-Ziel" },
      {
        kind: "lines",
        id: "neat-ziel",
        label: "Heutiger Status → 4-Wochen-Ziel:",
        lines: [
          { id: "schritte", prefix: "Aktuelle Schritte:", mid: "→ Ziel:" },
          { id: "pausen", prefix: "Aktuelle Mini-Pausen:", mid: "→ Ziel:" },
        ],
      },

      { kind: "step", n: 4, title: "Die kleinste tägliche Routine" },
      {
        kind: "text",
        text: "Welche eine Mini-Bewegung machst du jeden Tag, gut oder schlecht? (Beispiel: nach jeder Toilette 10 Knee-to-Chest in der Rückenlage.)",
      },
      {
        kind: "note",
        field: {
          id: "mini-routine",
          label: "Meine kleinste tägliche Routine:",
          rows: 2,
        },
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
    "NEAT (Non-Exercise Activity Thermogenesis) ist die Bewegung jenseits von dediziertem Sport. Oft 4–5× umfangreicher als Workout.",
    "80-20-Prinzip: 80 % gesundheitswirksame Bewegung aus NEAT, 20 % aus strukturiertem Training.",
    "Workout-Mentalität allein reicht selten bei chronischem Schmerz — die Konsistenz und Vielfalt fehlt.",
    "Konkrete Hebel: Schritte (7.000–10.000), Treppen statt Lift, Mini-Pausen alle 30 Min, Gehen statt Auto bei kurzen Strecken.",
    "50-Schritte-Regel: alle 30 Min im Arbeitsalltag 50 Schritte machen — niedriger Aufwand, hoher Effekt.",
  ],

  querverweise: [
    {
      label: "Lektion 3.2",
      text: "Haltungswechsel, häufige Bewegungspausen — die Variabilität, die NEAT im Sitzen ergänzt.",
    },
    {
      label: "Modul 4",
      text: "Habit Stacking integriert NEAT in den Alltag — so wird aus Vorsatz eine tragende Routine.",
    },
  ],

  notizfeld: {
    id: "notiz-3.4",
    label: "Notizfeld",
    rows: 10,
  },
};
