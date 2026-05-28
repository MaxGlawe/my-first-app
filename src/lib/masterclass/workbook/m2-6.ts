import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.6 „Belastungsdosierung und Pacing".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.6", Z. 4339–4547). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Diese Lektion ist konzeptionell — es existieren keine Übungsfotos,
 * daher kein `image`-Block.
 */
export const WORKBOOK_M2_6: WorkbookData = {
  lessonId: "2.6",
  nr: "2.6",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Belastungsdosierung und Pacing",
  subtitle:
    "Der Push-Crash-Zyklus ist eines der ungünstigsten Muster bei chronischem Schmerz — Baseline und stufenweise Steigerung sind die Antwort.",
  meta: {
    audio: "Audio-Dauer: 18–20 Min",
    lese: "Lese-Zeit Workbook: 30–35 Min",
    uebung: "mit Übung 2.6",
  },

  objectives: [
    "den Push-Crash-Zyklus und seine biologischen Folgen erkennen,",
    "das Baseline-Prinzip und die schrittweise Steigerung anwenden können,",
    "die drei häufigsten Pacing-Fehler und ihre Korrektur kennen,",
    "ein realistisches Verhältnis von Aktivität und Erholung für dich definieren können,",
    "die Übung 2.6 abgeschlossen haben, mit der du dein Pacing-Profil erstellst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Problem",
      text: "Der Push-Crash-Zyklus",
    },
    {
      kind: "lead",
      text: "Eines der häufigsten Muster bei chronischem Schmerz und gleichzeitig eines der ungünstigsten: der Push-Crash-Zyklus.",
    },
    {
      kind: "paragraph",
      text: "Was passiert? An guten Tagen tut der Patient zu viel — er holt nach, was er an schlechten Tagen versäumt hat. Garten machen, Wohnung putzen, Familie besuchen, lange spazieren gehen, alle Übungen „zur Sicherheit“ hintereinander. Das funktioniert für ein paar Stunden. Dann kommt der Crash: am nächsten Tag und für 2–5 Tage drauf ist alles schlimmer. Mehr Schmerz, weniger Beweglichkeit, schlechte Stimmung. Der Patient zieht sich zurück, bewegt sich weniger, wartet ab. Nach Tagen geht es besser. Er fühlt sich wieder gut. Und tut zu viel. Und crasht. Und so weiter.",
    },
    {
      kind: "bulletList",
      title: "Dieser Zyklus hat drei Probleme:",
      items: [
        "Erstens — er sensibilisiert das Schmerzsystem. Wiederholt erlebter Crash trainiert die Alarmanlage darin, vorsichtig zu werden. Die Schmerzschwelle sinkt.",
        "Zweitens — er verhindert Anpassung. Belastung würde dem Körper Adaptation ermöglichen, wenn sie konsistent käme. Im Push-Crash-Modus wechselt sich Überlastung mit Schonung ab. Beide Phasen verhindern Anpassung.",
        "Drittens — er zerstört Selbstvertrauen. Wer immer wieder erlebt, dass aktive Phasen mit Crashes enden, verliert den Glauben an die eigene Belastbarkeit.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Die Lösung",
      text: "Baseline und stufenweise Steigerung",
    },
    {
      kind: "paragraph",
      text: "Das Gegen-Konzept zum Push-Crash heißt Pacing. Es hat zwei Bestandteile.",
    },
    {
      kind: "subheading",
      text: "Baseline",
    },
    {
      kind: "paragraph",
      text: "Eine Baseline ist die Aktivitäts-Menge, die du auch an schlechten Tagen tun kannst, ohne dass danach ein Crash kommt. Das ist deine sichere Grundbelastung. Sie ist niedriger als das, was du an guten Tagen schaffst — aber sie ist zuverlässig.",
    },
    {
      kind: "paragraph",
      text: "Beispiel: Wenn du an guten Tagen 30 Minuten spazieren gehen kannst und an schlechten Tagen nur 10, ist deine Baseline 10 Minuten. Diese 10 machst du an jedem Tag, gut oder schlecht.",
    },
    {
      kind: "paragraph",
      text: "Das Baseline-Prinzip ist kontraintuitiv: Du machst an guten Tagen bewusst weniger, als du könntest. Warum? Weil die Konsistenz wichtiger ist als die Spitze. Konsistenz baut Anpassung. Spitzen führen zum Crash.",
    },
    {
      kind: "subheading",
      text: "Stufenweise Steigerung",
    },
    {
      kind: "paragraph",
      text: "Wenn die Baseline 2–4 Wochen stabil läuft (also: keine Crashes, kein Mehr-Schmerz), erhöhst du sie. Vorsichtig. Statt 10 Minuten gehst du jetzt 12. An jedem Tag. Wieder 2–4 Wochen. Dann 14. Dann 16.",
    },
    {
      kind: "paragraph",
      text: "Die Steigerung ist prozentual klein — etwa 10–20 % pro Schritt. Das fühlt sich langsam an. Aber: über 6 Monate baut sich daraus eine Verdopplung deiner Kapazität. Das wäre mit Push-Crash-Verhalten unmöglich.",
    },
    {
      kind: "vertiefung",
      title: "Die „10%-Regel“ aus der Sportwissenschaft",
      body: [
        "Die Empfehlung, Trainingsbelastung pro Woche um maximal 10 % zu steigern, kommt aus der Lauftrainings-Forschung der 1970er-Jahre. Sie gilt heute als grobe Faustregel.",
        "Bei chronischem Schmerz ist eine ähnliche Faustregel sinnvoll, vielleicht etwas konservativer: 10–15 % Steigerung pro 2–4 Wochen, in einer Dimension (Wiederholungen oder Gewicht oder Zeit). Nicht mehrere Dimensionen gleichzeitig steigern.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Häufige Stolpersteine",
      text: "Die drei häufigsten Pacing-Fehler",
    },
    {
      kind: "vertiefung",
      title: "Fehler 1: „Heute fühle ich mich gut, also doppelt machen“",
      body: [
        "Korrektur: An guten Tagen die Baseline halten, nicht überschreiten. Wenn ein bisschen Mehr-Lust da ist — eine zusätzliche Sache, nicht alle.",
      ],
    },
    {
      kind: "vertiefung",
      title: "Fehler 2: „Heute fühle ich mich schlecht, also nichts machen“",
      body: [
        "Korrektur: An schlechten Tagen die Baseline trotzdem machen, in reizarmer Schiene. Die Botschaft an dein System ist: „Wir machen weiter, in angepasster Form.“",
      ],
    },
    {
      kind: "vertiefung",
      title: "Fehler 3: „Diese Woche war ich krank, jetzt muss ich aufholen“",
      body: [
        "Korrektur: Nach Pause nicht aufholen, sondern wieder einsteigen — eine Stufe niedriger als zuletzt. Du holst keine Belastung nach. Du holst Routine nach.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "In der Praxis",
      text: "Ein praktisches Pacing-Raster",
    },
    {
      kind: "table",
      caption: "Wochen-Pacing-Raster",
      headers: ["Aktivität", "Frequenz pro Woche", "Schiene-Range"],
      rows: [
        ["Mobilisation (Lektion 2.2)", "5–7 mal (täglich)", "Reizarm bis Standard"],
        ["Stabilisation (Lektion 2.3)", "2–3 mal", "Reizarm bis Standard"],
        ["Belastungstoleranz (Lektion 2.4)", "1–2 mal", "Standard bis belastend"],
        ["Atmung (Lektion 2.5)", "täglich", "Reizarm"],
        ["Alltagsbewegung (NEAT, Lektion 3.4)", "täglich", "Permanent"],
      ],
    },
    {
      kind: "bulletList",
      title: "Beispiel-Woche für einen erfahrenen Anwender:",
      items: [
        "Mo — Mobilisation morgens, Stabilisation abends",
        "Di — Mobilisation morgens, Atmung abends",
        "Mi — Mobilisation, Belastungstoleranz",
        "Do — Mobilisation, Atmung",
        "Fr — Mobilisation, Stabilisation",
        "Sa — Mobilisation, Belastungstoleranz",
        "So — Mobilisation, Atmung, längerer Spaziergang",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Pacing-Profil",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Deine Push-Crash-Diagnose" },
      {
        kind: "text",
        text: "Welche Aktivitäten lösen bei dir typische Crashes aus?",
      },
      {
        kind: "note",
        field: {
          id: "push-crash",
          label: "Meine typischen Crash-Auslöser:",
          rows: 4,
        },
      },

      { kind: "step", n: 2, title: "Baseline festlegen" },
      {
        kind: "text",
        text: "Für die folgenden Aktivitäten — was kannst du auch an schlechten Tagen tun, ohne Crash?",
      },
      {
        kind: "lines",
        id: "baseline",
        label: "Meine Baseline:",
        lines: [
          { id: "spazieren", prefix: "Spazierengehen", mid: "Minuten:" },
          { id: "stehen", prefix: "Im Stehen / Arbeiten", mid: "Minuten am Stück:" },
          { id: "sitzen", prefix: "Sitzen", mid: "Minuten am Stück:" },
          { id: "mobilisation", prefix: "Mobilisations-Sequenz", mid: "Minuten:" },
          { id: "stabilisation", prefix: "Stabilisations-Sequenz", mid: "Wiederholungen:" },
        ],
      },

      { kind: "step", n: 3, title: "Steigerungs-Plan" },
      {
        kind: "text",
        text: "Welche Baseline möchtest du in 4 Wochen erweitern? Wie?",
      },
      {
        kind: "lines",
        id: "steigerung",
        label: "Aktivität — Heute → In 4 Wochen → Steigerung in %:",
        lines: [
          { id: "1", prefix: "Aktivität 1:" },
          { id: "2", prefix: "Aktivität 2:" },
        ],
      },

      { kind: "step", n: 4, title: "Der Karton-Test" },
      {
        kind: "text",
        text: "Du kennst dieses Muster bestimmt: Du fühlst dich gut, ein Karton ist umzustellen, also legst du gleich los — und am nächsten Tag tut es weh. Welche eine Regel stellst du dir auf, um in solchen Momenten innezuhalten?",
      },
      {
        kind: "note",
        field: {
          id: "karton-regel",
          label: "Meine eine Regel:",
          rows: 3,
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
    "Push-Crash-Zyklus ist eines der häufigsten und ungünstigsten Muster bei chronischem Schmerz. Er sensibilisiert, verhindert Anpassung, zerstört Selbstvertrauen.",
    "Baseline = Aktivitätsmenge, die du auch an schlechten Tagen schaffst. Sie wird konsequent gemacht, nicht überschritten an guten Tagen.",
    "Stufenweise Steigerung = 10–15 % pro 2–4 Wochen in einer Dimension. Klein, aber konsistent.",
    "Drei häufigste Fehler: an guten Tagen übertreiben, an schlechten Tagen aussetzen, nach Pausen aufholen wollen.",
    "Wochen-Raster: Mobilisation täglich, Stabilisation 2–3 mal, Belastung 1–2 mal, Atmung täglich.",
  ],

  querverweise: [
    {
      label: "Modul 4.3",
      text: "behandelt die drei Intensitätsschienen im Detail.",
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
    id: "notiz-2.6",
    label: "Notizfeld",
    rows: 10,
  },
};
