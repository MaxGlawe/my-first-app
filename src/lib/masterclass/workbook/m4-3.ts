import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 4.3 „Drei Intensitätsschienen operationalisiert".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 4.3", Z. 6296–6514). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 4 ist Recoping (Routinen/Protokolle) — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M4_3: WorkbookData = {
  lessonId: "4.3",
  nr: "4.3",
  sectionLabel: "Modul 4 · Recoping",
  title: "Drei Intensitätsschienen operationalisiert",
  subtitle:
    "Aus der Ritual-Map wird jeden Tag eine konkrete Entscheidung: In welcher Schiene mache ich heute meine Übungen? Der 5-Fragen-Check-in gibt dir die Antwort.",
  meta: {
    audio: "Audio-Dauer: 14–16 Min",
    lese: "Lese-Zeit Workbook: 25–28 Min",
    uebung: "mit Übung 4.3",
  },

  objectives: [
    "die drei Intensitätsschienen in konkrete Tages-Entscheidungen übersetzen können,",
    "den 5-Fragen-Tages-Check-in anwenden können,",
    "die häufigsten Fehler bei der Schienenwahl kennen und korrigieren können,",
    "die Übung 4.3 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Einstieg",
      text: "Die praktische Frage",
    },
    {
      kind: "lead",
      text: "Du hast in Lektion 4.2 deine Ritual-Map gebaut. Jetzt steht jeden Tag eine konkrete Entscheidung an: In welcher Schiene mache ich heute meine Übungen?",
    },
    {
      kind: "paragraph",
      text: "Diese Entscheidung wirkt klein, ist aber wichtig. Eine falsche Schienenwahl kann eine ganze Woche verderben — entweder weil du zu viel machst und einen Crash auslöst, oder weil du zu wenig machst und kein Reiz für Anpassung bleibt.",
    },

    {
      kind: "heading",
      eyebrow: "Das Werkzeug",
      text: "Der 5-Fragen-Tages-Check-in",
    },
    {
      kind: "paragraph",
      text: "Diese fünf Fragen, ehrlich beantwortet, bringen dich in der Regel auf die richtige Schiene. Stelle sie dir kurz beim Aufstehen oder vor dem ersten Übungsblock des Tages.",
    },
    {
      kind: "bulletList",
      title: "Frage 1 — Wie ist mein Schmerz-Niveau heute?",
      items: [
        "Selbsteinschätzung auf einer 0–10-Skala. Berücksichtige nicht nur den Moment, sondern wie der Schmerz heute insgesamt ist und wie sich der Tag anfühlt.",
        "0–2: keine Einschränkung",
        "3–4: spürbar, aber funktional",
        "5–6: deutlich einschränkend",
        "7–8: stark einschränkend",
        "9–10: schwerer Schmerz",
      ],
    },
    {
      kind: "bulletList",
      title: "Frage 2 — Wie habe ich geschlafen?",
      items: [
        "Gut (mind. 7 h, fühle mich erholt)",
        "Mittel",
        "Schlecht (< 5 h oder unerholsam)",
      ],
    },
    {
      kind: "bulletList",
      title: "Frage 3 — Wie ist mein Stress-Niveau?",
      items: [
        "Auf 0–10. Hohe Werte (7+) sind Hinweise auf vegetative Überaktivität — die Schmerzschwelle ist heute niedriger als normal.",
      ],
    },
    {
      kind: "bulletList",
      title: "Frage 4 — Welche Belastungen erwarte ich heute noch?",
      items: [
        "Habe ich heute noch viel zu tragen, einen anstrengenden Termin, eine lange Sitzung im Auto? Wenn ja, ist Vorsicht bei der Trainings-Schiene angebracht — du willst nicht für den Rest des Tages Ressourcen wegtrainieren.",
      ],
    },
    {
      kind: "bulletList",
      title: "Frage 5 — Wie ist meine Motivation / Energie?",
      items: [
        "Eine ehrliche Bewertung. Energie ist nicht Motivation, aber sie liefert Material für die Entscheidung.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Übersetzung",
      text: "Die Entscheidungs-Matrix",
    },
    {
      kind: "table",
      caption: "Schienenwahl basierend auf Check-in",
      headers: ["Schmerz", "Schlaf", "Stress", "Empfohlene Schiene"],
      rows: [
        ["0–2", "gut", "niedrig", "Belastend oder Standard"],
        ["0–2", "mittel", "mittel", "Standard"],
        ["3–4", "gut", "niedrig", "Standard"],
        ["3–4", "mittel", "mittel", "Reizarm bis Standard"],
        ["3–4", "schlecht", "hoch", "Reizarm"],
        ["5–6", "beliebig", "beliebig", "Reizarm"],
        ["7+", "beliebig", "beliebig", "Reizarm oder Pause-Tag (nur Atmung + sanfteste Mobilisation)"],
      ],
    },
    {
      kind: "keyTakeaway",
      title: "Wichtig",
      body: [
        "Auch an „Pause-Tagen“ wird etwas gemacht — nur Atmung und sehr sanfte Mobilisation, aber nicht nichts. Die Botschaft an dein System bleibt: „Wir machen weiter, in angepasster Form.“",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Stolpersteine",
      text: "Die häufigsten Fehler und ihre Korrektur",
    },
    {
      kind: "bulletList",
      title: "Fehler 1: Schiene nach Stimmung wählen, nicht nach Daten",
      items: [
        "„Ich hab heute keine Lust auf belastend, also mach ich reizarm.“ — Das ist nicht falsch, aber unbewusst. Wer die Schiene nach kurzfristiger Stimmung wählt, landet langfristig in Inkonsistenz.",
        "Korrektur: Check-in machen, Daten ehrlich bewerten, dann entscheiden.",
      ],
    },
    {
      kind: "bulletList",
      title: "Fehler 2: Immer Standard, egal was",
      items: [
        "„Ich mach mein Programm, weil ich es so geplant habe.“ — Das ist diszipliniert, aber unintelligent. Es ignoriert Tagesform.",
        "Korrektur: Plan ist Rahmen, Tagesform liefert Inhalt.",
      ],
    },
    {
      kind: "bulletList",
      title: "Fehler 3: Reizarm wird zu fast nichts",
      items: [
        "„Heute ist Reizarm — also mache ich gar nichts.“ — Reizarm bedeutet kleiner, nicht nichts. Selbst 3 Pelvic Tilts + 5 Atemzüge ist eine reizarme Routine.",
        "Korrektur: Reizarm hat eine konkrete Form, nicht eine Pause-Form.",
      ],
    },
    {
      kind: "bulletList",
      title: "Fehler 4: Belastend wird zu Crash",
      items: [
        "„Heute fühle ich mich gut, also mach ich extra viel.“ — Das ist der Push-Crash-Zyklus aus Lektion 2.6.",
        "Korrektur: Belastend = 110–130 % von Standard, nicht 200 %. Steigerung bleibt klein.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Tages-Check-in",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    theorieRueckbindung: [
      "Du übersetzt den 5-Fragen-Check-in in ein persönliches Schema, das du in den nächsten 4 Wochen täglich (kurz, 2 Min) anwendest — und definierst deine drei Schienen konkret.",
    ],
    anleitung: ["In drei Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Dein persönlicher Check-in" },
      {
        kind: "text",
        text: "So sieht dein tägliches Check-in-Schema aus. Probiere es hier einmal für heute durch:",
      },
      {
        kind: "scale",
        id: "schmerz",
        label: "1. Schmerz heute",
        minLabel: "kein Schmerz",
        maxLabel: "stärkster Schmerz",
      },
      {
        kind: "singleChoice",
        id: "schlaf",
        label: "2. Schlaf heute Nacht",
        options: [
          { id: "gut", label: "gut" },
          { id: "mittel", label: "mittel" },
          { id: "schlecht", label: "schlecht" },
        ],
      },
      {
        kind: "scale",
        id: "stress",
        label: "3. Stress aktuell",
        minLabel: "kein Stress",
        maxLabel: "maximaler Stress",
      },
      {
        kind: "singleChoice",
        id: "belastung",
        label: "4. Erwartete Tages-Belastung",
        options: [
          { id: "niedrig", label: "niedrig" },
          { id: "mittel", label: "mittel" },
          { id: "hoch", label: "hoch" },
        ],
      },
      {
        kind: "singleChoice",
        id: "energie",
        label: "5. Energie heute",
        options: [
          { id: "niedrig", label: "niedrig" },
          { id: "mittel", label: "mittel" },
          { id: "hoch", label: "hoch" },
        ],
      },
      {
        kind: "singleChoice",
        id: "schiene-heute",
        label: "Heutige Schiene",
        options: [
          { id: "reizarm", label: "Reizarm" },
          { id: "standard", label: "Standard" },
          { id: "belastend", label: "Belastend" },
        ],
      },

      { kind: "step", n: 2, title: "Dein 7-Tage-Tracking" },
      {
        kind: "text",
        text: "Trage über 7 Tage deine Check-in-Werte ein (Schmerz · Schlaf · Stress · Belastung · Energie) und die gewählte Schiene. Danach reflektiere.",
      },
      {
        kind: "lines",
        id: "tracking",
        label: "Schmerz · Schlaf · Stress · Belastung · Energie · Schiene gewählt",
        lines: [
          { id: "mo", prefix: "Mo:" },
          { id: "di", prefix: "Di:" },
          { id: "mi", prefix: "Mi:" },
          { id: "do", prefix: "Do:" },
          { id: "fr", prefix: "Fr:" },
          { id: "sa", prefix: "Sa:" },
          { id: "so", prefix: "So:" },
        ],
      },

      { kind: "step", n: 3, title: "Deine persönlichen Schienen-Definitionen" },
      {
        kind: "text",
        text: "Definiere für deine Übungen konkret, was Reizarm / Standard / Belastend bedeuten.",
      },
      {
        kind: "lines",
        id: "def-mobilisation",
        label: "Mobilisations-Sequenz",
        lines: [
          { id: "reizarm", prefix: "Reizarm:" },
          { id: "standard", prefix: "Standard:" },
          { id: "belastend", prefix: "Belastend:" },
        ],
      },
      {
        kind: "lines",
        id: "def-stabilisation",
        label: "Stabilisations-Sequenz",
        lines: [
          { id: "reizarm", prefix: "Reizarm:" },
          { id: "standard", prefix: "Standard:" },
          { id: "belastend", prefix: "Belastend:" },
        ],
      },
      {
        kind: "lines",
        id: "def-belastung",
        label: "Belastungstoleranz-Sequenz",
        lines: [
          { id: "reizarm", prefix: "Reizarm:" },
          { id: "standard", prefix: "Standard:" },
          { id: "belastend", prefix: "Belastend:" },
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
    "5-Fragen-Check-in beim Aufstehen: Schmerz, Schlaf, Stress, erwartete Belastung, Energie.",
    "Entscheidungs-Matrix übersetzt die Antworten in eine Schiene.",
    "Auch an Pause-Tagen wird etwas gemacht (Atmung + sanfteste Mobilisation).",
    "Häufigste Fehler: Stimmungs-Wahl, starrer Plan, Reizarm = nichts, Belastend = Crash.",
    "Schienen sind konkret und individuell — definiere sie schriftlich für deine Übungen.",
  ],

  querverweise: [
    {
      label: "Lektion 4.4",
      text: "behandelt schmerzadaptive Auswahl im Detail.",
    },
    {
      label: "Lektion 4.5",
      text: "liefert das Flare-up-Protokoll für sehr schlechte Tage.",
    },
  ],

  notizfeld: {
    id: "notiz-4.3",
    label: "Notizfeld",
    rows: 10,
  },
};
