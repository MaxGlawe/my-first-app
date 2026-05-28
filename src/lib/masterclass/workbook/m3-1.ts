import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 3.1 „Belastbarkeit statt Schonung“.
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 3.1“, Z. 4820–5037). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 3 ist überwiegend Alltag/Theorie — es existieren keine
 * passenden Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M3_1: WorkbookData = {
  lessonId: "3.1",
  nr: "3.1",
  sectionLabel: "Modul 3 – Prävention",
  title: "Belastbarkeit statt Schonung",
  subtitle:
    "Dein Körper ist antifragil — er wird durch dosierte Belastung stärker, nicht trotz ihr. Schonung ist Verzicht auf Wachstum.",
  meta: {
    audio: "Audio-Dauer: 16–18 Min",
    lese: "Lese-Zeit Workbook: 30–35 Min",
    uebung: "mit Übung 3.1",
  },

  objectives: [
    "das Antifragilitäts-Konzept (Nassim Taleb) auf den menschlichen Körper anwenden können,",
    "die drei Phasen der Belastbarkeits-Entwicklung nach Modul 2 verstehen,",
    "den Unterschied zwischen Wachstumszone, Komfortzone und Überforderungszone einordnen können,",
    "eine realistische Belastbarkeits-Vision für dich definieren,",
    "die Übung 3.1 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Problem",
      text: "Das Schonungs-Paradigma und sein Problem",
    },
    {
      kind: "lead",
      text: "Die populäre Vorstellung: Ein verletzter / schmerzender Rücken braucht Schonung. Wer schont, hilft. Wer belastet, schadet.",
    },
    {
      kind: "paragraph",
      text: "Diese Vorstellung stammt aus dem akuten Schmerzbereich, wo sie teilweise zutrifft — frische Gewebsschäden brauchen tatsächlich kurzfristige Schonung. Aber bei chronischem Schmerz, der über die akute Heilungsphase hinausgeht, wird die Schonung zum Hauptproblem.",
    },
    {
      kind: "bulletList",
      title: "Schonung über Wochen und Monate führt zu:",
      items: [
        "Muskel-Atrophie (besonders Multifidi, siehe Lektion 1.2)",
        "Bandscheiben-Degeneration durch fehlende Diffusionsförderung",
        "Knochendichte-Verlust durch fehlende Belastungsreize",
        "Bindegewebs-Versteifung",
        "Vegetative Dysregulation",
        "Schmerz-Sensibilisierung (das System lernt: „Belastung ist gefährlich“)",
        "Selbstwirksamkeits-Verlust",
        "Lebensraum-Schrumpfung (immer weniger Aktivitäten)",
      ],
    },
    {
      kind: "paragraph",
      text: "Die paradoxe Wahrheit: chronische Schonung ist eine der größten Schmerzursachen, die wir kennen.",
    },

    {
      kind: "heading",
      eyebrow: "Antifragilität",
      text: "Antifragilität — die biologische Wahrheit",
    },
    {
      kind: "paragraph",
      text: "Der Statistiker Nassim Taleb hat den Begriff Antifragilität eingeführt. Er beschreibt Systeme, die durch Belastung stärker werden — nicht nur belastungsresistent sind, sondern aktiv von Belastung profitieren.",
    },
    {
      kind: "paragraph",
      text: "Dein menschlicher Körper ist genau so ein System.",
    },
    {
      kind: "table",
      caption: "Drei Reaktions-Typen auf Belastung",
      headers: ["Typ", "Reagiert auf Belastung mit…", "Beispiele"],
      rows: [
        ["Fragil", "Schaden", "Glas, Porzellan"],
        ["Robust", "Widerstand", "Stahl, Eisen"],
        ["Antifragil", "Wachstum / Anpassung", "Muskel, Knochen, Sehnen, Schmerzsystem"],
      ],
    },
    {
      kind: "paragraph",
      text: "Dein Körper wird stärker, wenn er passend belastet wird. Knochen werden dichter, Muskeln werden kräftiger, Sehnen werden zugfester, Bandscheiben werden besser ernährt, das Nervensystem wird belastbarer. Diese Anpassung ist nicht trotz Belastung — sie passiert wegen Belastung.",
    },
    {
      kind: "paragraph",
      text: "Die Konsequenz: Schonung ist kein Wegbleiben-vom-Schaden — sie ist Verzicht auf Wachstum. Sie entzieht deinem System genau die Reize, die es zur Anpassung braucht.",
    },

    {
      kind: "heading",
      eyebrow: "Dosierung",
      text: "Die drei Zonen",
    },
    {
      kind: "paragraph",
      text: "Wenn Belastung wachstumsfördernd ist — wie viel ist richtig? Hier hilft ein Modell mit drei Zonen:",
    },
    {
      kind: "subheading",
      text: "Komfortzone",
    },
    {
      kind: "paragraph",
      text: "Die Aktivitäten, die du mühelos schaffst. Hier gibt es kein Stress-Signal, also auch keinen Wachstumsreiz. Du behältst, was du hast, du wirst nicht besser. Wichtig zur Erholung, aber nicht zum Aufbau.",
    },
    {
      kind: "subheading",
      text: "Wachstumszone",
    },
    {
      kind: "paragraph",
      text: "Die Aktivitäten, die etwas Anstrengung erfordern. Du musst dich konzentrieren, du wirst gefordert, aber du schaffst es. Hier passiert Anpassung. Hier wirst du stärker. Dies ist der Bereich, in dem du den Großteil deines Trainings haben willst.",
    },
    {
      kind: "subheading",
      text: "Überforderungszone",
    },
    {
      kind: "paragraph",
      text: "Die Aktivitäten, die deine aktuelle Kapazität übersteigen. Sie führen zu Verletzung, Sensibilisierung, Crash. Vermeide diese Zone weitgehend.",
    },
    {
      kind: "paragraph",
      text: "Die Kunst des produktiven Trainings ist, regelmäßig in die Wachstumszone zu gehen, ohne dabei in die Überforderungszone zu rutschen. Die Schienen-Logik aus Modul 2.1 und das Pacing aus 2.6 sind die Werkzeuge dafür.",
    },

    {
      kind: "heading",
      eyebrow: "Verlauf",
      text: "Die drei Phasen nach Modul 2",
    },
    {
      kind: "paragraph",
      text: "Nach Bearbeitung von Modul 2 (Bewegung, Mobilisation, Stabilisation, Belastung, Atmung, Pacing, Coping) durchläufst du in der Regel drei Phasen:",
    },
    {
      kind: "subheading",
      text: "Phase 1 — Konsolidierung (Wochen 1–8)",
    },
    {
      kind: "paragraph",
      text: "Die Mobilisations- und Stabilisationsübungen werden zur Routine. Die „stille Phase“ (Lektion 2.3): neurologische Aktivierung passiert, ist aber subjektiv noch leise. Du fängst an, Schmerzspitzen weniger katastrophal zu erleben (Coping aus 2.7).",
    },
    {
      kind: "subheading",
      text: "Phase 2 — Sichtbarer Aufbau (Wochen 8–24)",
    },
    {
      kind: "paragraph",
      text: "Belastungstoleranz-Übungen tragen Früchte. Du hebst sicherer, schaffst mehr Wiederholungen, fühlst dich kräftiger. Schmerzspitzen werden seltener und kürzer. Du erweiterst deinen Aktivitätsradius. Diese Phase ist die spannendste — der subjektive Sprung passiert.",
    },
    {
      kind: "subheading",
      text: "Phase 3 — Konsolidierung und Ausweitung (Monate 6–24)",
    },
    {
      kind: "paragraph",
      text: "Die Routine ist etabliert. Du tust nicht mehr gegen den Schmerz, sondern für deine Belastbarkeit. Schmerz ist da, aber kleiner und integrierbar. Du machst Dinge wieder, die du jahrelang nicht gemacht hast. Selbstwirksamkeit ist hoch.",
    },
    {
      kind: "paragraph",
      text: "Diese Phasen sind nicht linear — Rückfälle gehören dazu. Aber die Trajektorie ist klar.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Die Verschiebung des Selbstbildes",
      body: [
        "Was ich in Phase 3 immer wieder beobachte: Patienten sehen sich nicht mehr als Schmerzpatient. Sie sehen sich als Mensch, der auch Rückenbeschwerden hat. Diese Verschiebung ist klein im Wortlaut, riesig in der Bedeutung. Sie verändert, wie das Schmerzsystem die täglichen Signale interpretiert.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Meine Belastbarkeits-Vision",
    timing: "Geschätzte Bearbeitungszeit: 20 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Die 12-Monats-Vision" },
      {
        kind: "text",
        text: "Stell dir vor, es ist heute in einem Jahr. Du hast die Masterclass-Werkzeuge konsequent angewandt. Was kannst du tun, das du heute nicht (mehr) kannst?",
      },
      {
        kind: "lines",
        id: "vision-12m",
        label: "In 12 Monaten will ich können…",
        lines: [
          { id: "familie", prefix: "Familie / Beziehungen:" },
          { id: "arbeit", prefix: "Arbeit / Beruf:" },
          { id: "sport", prefix: "Sport / Hobby:" },
          { id: "reisen", prefix: "Reisen:" },
          { id: "haushalt", prefix: "Haushalt:" },
          { id: "sonstiges", prefix: "Sonstiges:" },
        ],
      },

      { kind: "step", n: 2, title: "Die 3-Jahres-Vision" },
      {
        kind: "text",
        text: "Und in 3 Jahren? Größer denken.",
      },
      {
        kind: "note",
        field: {
          id: "vision-3j",
          label: "Meine 3-Jahres-Vision:",
          rows: 5,
        },
      },

      { kind: "step", n: 3, title: "Deine aktuelle Zone-Verteilung" },
      {
        kind: "text",
        text: "Wie verteilen sich deine täglichen Aktivitäten heute? Schätze für jede Zone den Anteil deines Tages.",
      },
      {
        kind: "lines",
        id: "zonen",
        label: "Geschätzter Anteil deines Tages:",
        lines: [
          { id: "komfort", prefix: "Komfortzone:", mid: "%" },
          { id: "wachstum", prefix: "Wachstumszone:", mid: "%" },
          { id: "ueberforderung", prefix: "Überforderungszone:", mid: "%" },
        ],
      },
      {
        kind: "hint",
        text: "Ideales Verhältnis bei chronischem Schmerz im Aufbau: ca. 60 % Komfort, 35 % Wachstum, 5 % gelegentliche Überforderung.",
      },

      { kind: "step", n: 4, title: "Die eine neue Zone-Wanderung" },
      {
        kind: "text",
        text: "Welche eine Aktivität wirst du in den nächsten 4 Wochen von der „Vermeide ich“-Liste in die Wachstumszone holen?",
      },
      {
        kind: "note",
        field: {
          id: "zone-wanderung",
          label: "Meine Zone-Wanderung:",
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
    "Chronische Schonung schadet — Muskeln, Knochen, Bandscheiben, Schmerzsystem, Selbstbild verlieren alle durch sie.",
    "Dein Körper ist antifragil — er wird stärker durch dosierte Belastung, nicht trotz ihr.",
    "Drei Zonen: Komfort (Erholung), Wachstum (Aufbau), Überforderung (zu vermeiden). Zielverhältnis 60/35/5.",
    "Drei Phasen nach Modul 2: Konsolidierung (1–8 Wochen), sichtbarer Aufbau (8–24 Wochen), Konsolidierung und Ausweitung (6–24 Monate).",
    "Selbstbild verschiebt sich: vom Schmerzpatient zum Menschen, der auch Rückenbeschwerden hat. Diese Verschiebung ist wirksam.",
  ],

  querverweise: [
    {
      label: "Lektion 2.1",
      text: "Bewegungsphilosophie — die Grundlage der hier vertieften Belastungs-Logik.",
    },
    {
      label: "Lektion 2.6",
      text: "Pacing — das Werkzeug, um in der Wachstumszone zu bleiben, ohne in die Überforderung zu rutschen.",
    },
    {
      label: "Modul 4",
      text: "Routine-Aufbau — wie aus der Belastbarkeits-Vision eine tragende Praxis wird.",
    },
  ],

  notizfeld: {
    id: "notiz-3.1",
    label: "Notizfeld",
    rows: 10,
  },
};
