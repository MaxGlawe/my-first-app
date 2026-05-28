import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 4.1 „Habit Stacking: Routinen, die sich selbst tragen".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 4.1", Z. 5719–5952). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 4 ist Recoping (Routinen/Protokolle) — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M4_1: WorkbookData = {
  lessonId: "4.1",
  nr: "4.1",
  sectionLabel: "Modul 4 · Recoping",
  title: "Habit Stacking: Routinen, die sich selbst tragen",
  subtitle:
    "Du brauchst keine eiserne Disziplin — du brauchst gute Systeme. Wie du neue Mini-Aktionen an bestehende Anker knüpfst.",
  meta: {
    audio: "Audio-Dauer: 14–16 Min",
    lese: "Lese-Zeit Workbook: 25–30 Min",
    uebung: "mit Übung 4.1",
  },

  objectives: [
    "das Konzept des Habit Stacking verstehen (BJ Fogg, James Clear),",
    "den Unterschied zwischen Motivation und System einordnen können,",
    "die vier Bestandteile eines stabilen Habits kennen,",
    "dein Habits-Inventar erstellen können — die bestehenden Anker, auf die du aufbauen kannst,",
    "die Übung 4.1 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Einstieg",
      text: "Das Problem mit Motivation",
    },
    {
      kind: "lead",
      text: "Wenn du nach 8–12 Wochen Masterclass-Anwendung noch immer regelmäßig deine Übungen machst, wirst du das nicht durch Motivation schaffen.",
    },
    {
      kind: "paragraph",
      text: "Motivation ist volatil — sie ist hoch, wenn du dich gut fühlst, niedrig, wenn du Schmerz hast oder müde bist. Wer auf Motivation baut, wird inkonsistent.",
    },
    {
      kind: "paragraph",
      text: "Wer langfristig dabei bleibt, baut auf Systeme. Systeme funktionieren auch ohne Motivation. Sie sind in den Alltag eingebaut, an Anker geknüpft, fast unbewusst durchführbar.",
    },
    {
      kind: "keyTakeaway",
      title: "Die zentrale Erkenntnis",
      body: ["Du brauchst keine eiserne Disziplin. Du brauchst gute Systeme."],
    },

    {
      kind: "heading",
      eyebrow: "Das Prinzip",
      text: "Das Habit-Stacking-Prinzip",
    },
    {
      kind: "paragraph",
      text: "Habit Stacking, ein Konzept aus der Verhaltenswissenschaft (BJ Fogg, „Tiny Habits“, James Clear, „Atomic Habits“), funktioniert so:",
    },
    {
      kind: "callout",
      text: "Formel: Nach [bestehender Anker-Routine] werde ich [neue Mini-Aktion] tun.",
    },
    {
      kind: "bulletList",
      title: "Beispiele:",
      items: [
        "„Nach dem Zähneputzen morgens werde ich 5 Pelvic Tilts machen.“",
        "„Nach dem Kaffeekochen werde ich 3 Atemzüge in 360°-Atmung machen.“",
        "„Nach dem ich die Spülmaschine ausgeräumt habe, werde ich 30 Sekunden Cat-Cow machen.“",
        "„Nach dem Mittagessen werde ich 5 Min spazieren gehen.“",
        "„Nach dem ich ins Bett gehe, werde ich 5 Crocodile-Atemzüge machen.“",
      ],
    },
    {
      kind: "paragraph",
      text: "Die Mini-Aktion muss so klein sein, dass sie sich nicht zu vermeiden lohnt. Drei Pelvic Tilts dauern 30 Sekunden. Du wirst nicht jeden Morgen 30 Min trainieren — aber 30 Sekunden? Das wirst du machen.",
    },
    {
      kind: "paragraph",
      text: "Über Wochen werden aus 30-Sekunden-Mini-Aktionen automatische Gewohnheiten. Und diese Gewohnheiten erweitern sich oft natürlicherweise: aus 3 Pelvic Tilts werden 5, dann 8, dann eine ganze 3-Minuten-Mobilisations-Sequenz.",
    },

    {
      kind: "heading",
      eyebrow: "Anatomie einer Gewohnheit",
      text: "Die vier Bestandteile eines stabilen Habits",
    },
    {
      kind: "paragraph",
      text: "Nach James Clear haben stabile Gewohnheiten vier Elemente:",
    },
    {
      kind: "bulletList",
      title: "1. Cue (Anker / Trigger)",
      items: [
        "Ein klares, wiederkehrendes Signal, das die Gewohnheit auslöst. Bei Habit Stacking ist das eine bestehende Routine. Tageszeiten, andere Aktivitäten, körperliche Empfindungen, Orte.",
      ],
    },
    {
      kind: "bulletList",
      title: "2. Craving (Erwartung / Motivation)",
      items: [
        "Eine Erwartung des positiven Effekts. Bei Schmerzpatienten oft: das Gefühl der Selbstwirksamkeit. „Ich habe etwas für mich getan.“",
      ],
    },
    {
      kind: "bulletList",
      title: "3. Response (Aktion)",
      items: [
        "Die eigentliche Handlung. Bei uns: die Mini-Übung. Wichtig: muss niedrigschwellig sein.",
      ],
    },
    {
      kind: "bulletList",
      title: "4. Reward (Belohnung)",
      items: [
        "Ein positiver Effekt, der die Gewohnheit verstärkt. Manchmal subtil (Gefühl der Erleichterung), manchmal explizit (Kreuz im Tracker, Selbst-Lob).",
      ],
    },
    {
      kind: "paragraph",
      text: "Wenn alle vier Elemente da sind, wird eine Aktion zur Gewohnheit. Wenn eines fehlt, bleibt es Anstrengung.",
    },

    {
      kind: "heading",
      eyebrow: "Leitplanken",
      text: "Wichtige Prinzipien",
    },
    {
      kind: "bulletList",
      items: [
        "Klein beginnen. Sehr klein. Wenn du denkst, „das ist zu wenig“, ist es richtig. Erst nach 4–6 Wochen Konsistenz steigerst du.",
        "Spezifisch sein. Nicht „ich mache morgens Übungen“, sondern „nach dem Zähneputzen mache ich 5 Pelvic Tilts“.",
        "An Anker knüpfen, nicht an Tageszeiten. Tageszeiten sind unzuverlässig. Bestehende Routinen sind zuverlässig.",
        "Eine Gewohnheit nach der anderen. Nicht 5 neue Gewohnheiten gleichzeitig.",
        "Konsistenz schlägt Perfektion. Lieber 5 Minuten täglich als 1 Stunde sonntags.",
      ],
    },
    {
      kind: "vertiefung",
      title: "Warum 2–3 Wochen die kritische Phase sind",
      body: [
        "In den ersten 2–3 Wochen ist eine neue Gewohnheit fragil. Sie braucht aktive Erinnerung, kostet bewusste Energie. Nach 3–4 Wochen wird sie zunehmend automatisch. Nach 8–12 Wochen ist sie weitgehend selbstständig.",
        "Praktische Konsequenz: Plan dich selbst durch die ersten 3 Wochen. Visualisiere die Habits in einem Tracker. Erinnere dich selbst. Nach 3 Wochen geht es leichter.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Habits-Inventar",
    timing: "Geschätzte Bearbeitungszeit: 20 Minuten",
    theorieRueckbindung: [
      "Bevor du in Lektion 4.2 deine Ritual-Map baust, brauchst du die Anker, auf die du aufsetzt. Diese Übung sammelt deine bestehenden, zuverlässigen Tages-Routinen und koppelt erste Mini-Aktionen daran.",
    ],
    anleitung: ["In fünf Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Deine bestehenden Tages-Anker" },
      {
        kind: "text",
        text: "Liste deine bestehenden, zuverlässigen Tages-Routinen auf. Was tust du jeden Tag, gut oder schlecht?",
      },
      {
        kind: "lines",
        id: "anker",
        label: "Anker-Routine · ungefähre Tageszeit",
        lines: [
          { id: "1", mid: "→ ca." },
          { id: "2", mid: "→ ca." },
          { id: "3", mid: "→ ca." },
          { id: "4", mid: "→ ca." },
          { id: "5", mid: "→ ca." },
          { id: "6", mid: "→ ca." },
          { id: "7", mid: "→ ca." },
        ],
      },
      {
        kind: "hint",
        text: "Typische Anker: Aufstehen, Zähneputzen morgens, Kaffeekochen, Frühstück, vor Arbeitsbeginn, Mittagspause, nach Arbeit, Abendessen, vor dem Schlafengehen, nach jedem Toilettengang, beim Hand-Waschen.",
      },

      { kind: "step", n: 2, title: "Deine drei Prioritäts-Aktivitäten" },
      {
        kind: "text",
        text: "Welche drei Aktivitäten aus Modul 2 und 3 möchtest du als Gewohnheit etablieren?",
      },
      {
        kind: "lines",
        id: "prioritaet",
        lines: [{ id: "1" }, { id: "2" }, { id: "3" }],
      },

      { kind: "step", n: 3, title: "Die Kopplung" },
      {
        kind: "text",
        text: "Knüpfe jede Aktivität an einen Anker — nach der Formel „Nach [Anker] werde ich [Aktivität] machen“.",
      },
      {
        kind: "lines",
        id: "kopplung-1",
        label: "Aktivität 1:",
        lines: [{ id: "aktivitaet", prefix: "Aktivität:" }, { id: "anker", prefix: "Nach diesem Anker:", mid: "→ mache ich:" }],
      },
      {
        kind: "lines",
        id: "kopplung-2",
        label: "Aktivität 2:",
        lines: [{ id: "aktivitaet", prefix: "Aktivität:" }, { id: "anker", prefix: "Nach diesem Anker:", mid: "→ mache ich:" }],
      },
      {
        kind: "lines",
        id: "kopplung-3",
        label: "Aktivität 3:",
        lines: [{ id: "aktivitaet", prefix: "Aktivität:" }, { id: "anker", prefix: "Nach diesem Anker:", mid: "→ mache ich:" }],
      },

      { kind: "step", n: 4, title: "Die Mini-Version" },
      {
        kind: "text",
        text: "Sind deine drei Aktivitäten klein genug? Wenn nicht — wie kannst du sie kleiner machen?",
      },
      {
        kind: "lines",
        id: "mini",
        lines: [
          { id: "1", prefix: "Mini-Version 1:" },
          { id: "2", prefix: "Mini-Version 2:" },
          { id: "3", prefix: "Mini-Version 3:" },
        ],
      },

      { kind: "step", n: 5, title: "Dein 3-Wochen-Tracker" },
      {
        kind: "text",
        text: "Plane für die nächsten 3 Wochen ein einfaches Tracking. Ein Kreuz pro Tag pro Habit reicht. Hake hier ab, sobald du einen Tag geschafft hast — die Liste zeigt dir deinen Fortschritt durch die kritische erste Phase.",
      },
      {
        kind: "checklist",
        id: "tracker",
        label: "21-Tage-Tracker (ein Häkchen pro geschafftem Tag):",
        showProgress: true,
        items: [
          { id: "t1", label: "Tag 1" },
          { id: "t2", label: "Tag 2" },
          { id: "t3", label: "Tag 3" },
          { id: "t4", label: "Tag 4" },
          { id: "t5", label: "Tag 5" },
          { id: "t6", label: "Tag 6" },
          { id: "t7", label: "Tag 7" },
          { id: "t8", label: "Tag 8" },
          { id: "t9", label: "Tag 9" },
          { id: "t10", label: "Tag 10" },
          { id: "t11", label: "Tag 11" },
          { id: "t12", label: "Tag 12" },
          { id: "t13", label: "Tag 13" },
          { id: "t14", label: "Tag 14" },
          { id: "t15", label: "Tag 15" },
          { id: "t16", label: "Tag 16" },
          { id: "t17", label: "Tag 17" },
          { id: "t18", label: "Tag 18" },
          { id: "t19", label: "Tag 19" },
          { id: "t20", label: "Tag 20" },
          { id: "t21", label: "Tag 21" },
        ],
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
    "Motivation ist volatil, Systeme sind stabil — wer langfristig dabei bleibt, baut Systeme, nicht Motivation.",
    "Habit Stacking: Neue Mini-Aktion an bestehende Anker-Routinen knüpfen. Formel: „Nach [Anker] werde ich [Mini-Aktion] tun.“",
    "Vier Bestandteile: Cue (Anker), Craving (Erwartung), Response (Aktion), Reward (Belohnung).",
    "Klein, spezifisch, an Anker geknüpft, eine nach der anderen, Konsistenz vor Perfektion.",
    "2–3 Wochen sind die kritische Phase, in der die Gewohnheit etabliert wird.",
  ],

  querverweise: [
    {
      label: "Lektion 4.2",
      text: "baut die Ritual-Map aus diesen Habits.",
    },
  ],

  notizfeld: {
    id: "notiz-4.1",
    label: "Notizfeld",
    rows: 10,
  },
};
