import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.5 „Atemmechanik und Beckenboden:
 * Das unterschätzte Werkzeug".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.5", Z. 4140–4339). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Für ÜK-A1 bis ÜK-A3 existieren Fotos (uk-a1-1.png, uk-a2-1.png,
 * uk-a3-1.png) im Workbook-Bildordner — als `exerciseCard.image`
 * eingebunden.
 */
export const WORKBOOK_M2_5: WorkbookData = {
  lessonId: "2.5",
  nr: "2.5",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Atemmechanik und Beckenboden: Das unterschätzte Werkzeug",
  subtitle:
    "Atmung ist Rumpfstabilisation — drei Atemübungen, die das vegetative System beruhigen und überall machbar sind.",
  meta: {
    audio: "Audio-Dauer: 16–18 Min",
    lese: "Lese-Zeit Workbook: 30–35 Min",
    uebung: "mit Übung 2.5",
  },

  objectives: [
    "die anatomisch-funktionelle Verbindung zwischen Atmung, Beckenboden, TVA und Diaphragma verstehen,",
    "die drei zentralen Atemübungen (ÜK-A1 bis A3) kennen und anwenden können,",
    "den vegetativen Effekt unterschiedlicher Atmungsmuster einordnen,",
    "Atmung als Schmerzmodulator in deinen Alltag integrieren können,",
    "die Übung 2.5 abgeschlossen haben, mit der du dein Atemmuster analysierst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Die große unterschätzte Verbindung",
    },
    {
      kind: "lead",
      text: "Aus Lektion 1.2 weißt du, dass Diaphragma, Beckenboden, Transversus abdominis und Multifidus die deep-core-Synergie bilden. Diese vier Muskelgruppen arbeiten als ein System — sie können nicht voneinander getrennt trainiert werden. Wer am Diaphragma arbeitet, arbeitet am Beckenboden mit. Wer am Beckenboden arbeitet, beeinflusst die Atmung.",
    },
    {
      kind: "paragraph",
      text: "Diese Verbindung wird in der konventionellen Schmerztherapie oft unterschätzt. Atemübungen werden bestenfalls als „Entspannung“ abgetan, nicht als zentrale Säule der Rumpfstabilisation. Das ist methodisch zu kurz gegriffen.",
    },
    {
      kind: "bulletList",
      title: "Drei Gründe, warum Atmung so wirksam ist:",
      items: [
        "Mechanisch. Jeder Atemzug bewegt das Diaphragma um 2–3 cm. Diese rhythmische Bewegung pumpt durch das deep-core-System hindurch und massiert die Bandscheiben (Diffusion, Lektion 1.1). Atem ist permanente Mobilisation.",
        "Vegetativ. Atemfrequenz und -tiefe sind direkte Steuerungs-Variablen des autonomen Nervensystems. Schnelle, flache Atmung → Sympathikus-Aktivierung → erhöhte Schmerzschwelle ungünstig verschoben. Langsame, tiefe Atmung → Parasympathikus → Schmerzschwelle günstig verschoben.",
        "Aufmerksamkeit. Atemfokus zieht Aufmerksamkeit vom Schmerz weg. Wer 5 Minuten bewusst atmet, lenkt die zentrale Schmerzverarbeitung um. Messbar in Bildgebungs-Studien.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "ÜK-A1 bis ÜK-A3",
      text: "Die drei zentralen Atemübungen",
    },
    {
      kind: "exerciseCard",
      code: "ÜK-A1",
      name: "360°-Atmung",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-a1-1.png",
        alt: "ÜK-A1 — 360°-Atmung",
      },
      fields: [
        {
          label: "Die wichtigste Atemübung dieser Masterclass",
          text: "Sie reaktiviert das Diaphragma in seiner vollen Bewegungsfreiheit.",
        },
        {
          label: "Position",
          text: "Bequem sitzen oder liegen. Eine Hand auf den Brustkorb, eine Hand seitlich am unteren Rippenbogen.",
        },
        {
          label: "Bewegung",
          text: "Beim Einatmen soll sich nicht nur die Brust heben (Hand vorne), sondern auch der seitliche und der untere Rippenbogen weiten (Hand seitlich). Das Ziel: Rundum-Atmung, nicht nur nach vorne, sondern auch zur Seite und nach hinten in den unteren Rücken.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 5 Atemzüge, sanft",
            "Standard: 10 Atemzüge, deutliche Rippenweitung",
            "Belastend: 15 Atemzüge mit verlängerter Ausatmung (4 ein / 8 aus)",
          ],
        },
        {
          label: "Wirkung",
          text: "Reaktiviert Diaphragma in seiner vollen Bewegungsfreiheit. Senkt vegetative Aktivität. Mobilisiert die Brustwirbelsäule.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-A2",
      name: "Box Breathing (Quadrat-Atmung)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-a2-1.png",
        alt: "ÜK-A2 — Box Breathing (Quadrat-Atmung)",
      },
      fields: [
        {
          label: "Position",
          text: "Sitzen, Wirbelsäule aufrecht aber entspannt.",
        },
        {
          label: "Bewegung",
          text: "Vier gleich lange Phasen: 4 Sekunden einatmen — 4 Sekunden Atem halten — 4 Sekunden ausatmen — 4 Sekunden Pause. Wie ein Quadrat. Mehrere Zyklen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Je 3 Sekunden, 5 Zyklen",
            "Standard: Je 4 Sekunden, 8 Zyklen",
            "Belastend: Je 5–6 Sekunden, 10 Zyklen",
          ],
        },
        {
          label: "Wirkung",
          text: "Stark beruhigend für das vegetative System. Wird in Militär, bei Polizei (Stressregulation), bei Profisportlern und in der klinischen Schmerzmedizin gleichermaßen eingesetzt.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-A3",
      name: "Crocodile Breathing (Krokodil-Atmung)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-a3-1.png",
        alt: "ÜK-A3 — Crocodile Breathing (Krokodil-Atmung)",
      },
      fields: [
        {
          label: "Position",
          text: "Bauchlage. Stirn auf gekreuzten Unterarmen ablegen. Beine entspannt.",
        },
        {
          label: "Bewegung",
          text: "Bauchatmung. Beim Einatmen drückt sich der Bauch in den Boden, Rücken hebt sich. Beim Ausatmen senkt sich der Rücken wieder. Lass die Atmung tief und langsam fließen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 5 Atemzüge",
            "Standard: 10 Atemzüge",
            "Belastend: 20 Atemzüge mit verlängerter Ausatmung",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert Bauchatmung in einer Position, in der Brustatmung mechanisch erschwert ist. Sehr beruhigend, gut bei Schlafstörungen.",
        },
      ],
    },

    {
      kind: "heading",
      eyebrow: "Im Alltag",
      text: "Atmung als Schmerzmodulator im Alltag",
    },
    {
      kind: "paragraph",
      text: "Drei konkrete Anwendungssituationen:",
    },
    {
      kind: "bulletList",
      items: [
        "Bei akuter Schmerzspitze: 5 Minuten Box Breathing senkt die Schmerzintensität messbar. Nicht weil der Schmerz weggeht — sondern weil das vegetative System aus dem Alarm-Modus rauskommt.",
        "Vor Belastung: 3 tiefe Atemzüge in 360°-Form aktivieren die deep-core-Synergie vor einer Belastungsspitze. Bandscheiben-Schutz inklusive.",
        "Vor dem Schlaf: 10 Minuten Crocodile Breathing schaltet den Sympathikus runter, verbessert die Einschlafqualität messbar.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Atemmuster",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Diagnose" },
      {
        kind: "text",
        text: "Lege eine Hand auf den Brustkorb, eine auf den Bauch. Atme 5 Atemzüge ruhig. Wo bewegt sich was?",
      },
      {
        kind: "ratingMatrix",
        id: "atembewegung",
        columns: ["stark", "mittel", "kaum"],
        rows: [
          { id: "brustkorb", label: "Brustkorb" },
          { id: "bauch", label: "Bauch" },
          { id: "rippen", label: "Seitliche Rippen" },
          { id: "ruecken", label: "Unterer Rücken" },
        ],
      },
      {
        kind: "hint",
        text: "Bei chronischem Stress / Schmerz typisches Muster: viel Brust, wenig Bauch, kaum Seite/Rücken.",
      },

      { kind: "step", n: 2, title: "Stressatmung" },
      {
        kind: "text",
        text: "Beobachte über 3 Tage, was deine Atmung in Stressmomenten tut. Wird sie flacher? Schneller? Hältst du den Atem an?",
      },
      {
        kind: "note",
        field: {
          id: "stressatmung",
          label: "Meine Beobachtungen über 3 Tage:",
          rows: 4,
        },
      },

      { kind: "step", n: 3, title: "Deine Atem-Routine" },
      {
        kind: "text",
        text: "Wähle eine der drei Atemübungen als tägliche Praxis für die nächsten 4 Wochen.",
      },
      {
        kind: "singleChoice",
        id: "routine",
        options: [
          {
            id: "a1",
            label: "ÜK-A1 360°-Atmung",
            description: "täglich morgens, 3 Minuten",
          },
          {
            id: "a2",
            label: "ÜK-A2 Box Breathing",
            description: "täglich abends, 5 Minuten",
          },
          {
            id: "a3",
            label: "ÜK-A3 Crocodile Breathing",
            description: "vor dem Schlafengehen, 5 Minuten",
          },
        ],
      },

      { kind: "step", n: 4, title: "Deine Notfall-Atmung" },
      {
        kind: "text",
        text: "Welche Übung nutzt du bei akuten Schmerzspitzen?",
      },
      {
        kind: "note",
        field: {
          id: "notfallatmung",
          label: "Meine Notfall-Atmung:",
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
    "Atmung ist Rumpfstabilisation — Diaphragma ist Teil der deep-core-Synergie aus Lektion 1.2.",
    "Drei zentrale Atemübungen (ÜK-A1 360°, ÜK-A2 Box, ÜK-A3 Crocodile) decken die wichtigsten Anwendungen ab.",
    "Atmung als Schmerzmodulator: vor Belastung (Schutz), bei Schmerzspitzen (vegetative Beruhigung), vor dem Schlaf (Erholung).",
    "Vegetative Wirkung über das parasympathische System — messbarer Effekt auf die Schmerzschwelle.",
    "Niedrigschwellig integrierbar — keine Ausrüstung, überall machbar, 3–10 Minuten täglich genug.",
  ],

  querverweise: [
    {
      label: "Lektion 1.2",
      text: "behandelt die deep-core-Synergie aus Diaphragma, Beckenboden, TVA und Multifidus.",
    },
    {
      label: "Lektion 3.3",
      text: "vertieft Stress und vegetative Regulation.",
    },
    {
      label: "Modul 4.5",
      text: "nutzt Atmung im Flare-up-Protokoll.",
    },
  ],

  notizfeld: {
    id: "notiz-2.5",
    label: "Notizfeld",
    rows: 10,
  },
};
