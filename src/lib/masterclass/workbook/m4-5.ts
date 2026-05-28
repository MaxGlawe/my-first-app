import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 4.5 „Das Flare-up-Protokoll:
 * Vier Phasen durch die Welle".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 4.5", Z. 6735–6969). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-".
 *
 * Modul 4 ist Recoping/Verhaltens-Strategie — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M4_5: WorkbookData = {
  lessonId: "4.5",
  nr: "4.5",
  sectionLabel: "Modul 4 · Recoping",
  title: "Das Flare-up-Protokoll: Vier Phasen durch die Welle",
  subtitle:
    "Ein Flare-up ist keine Niederlage, sondern eine Phase im System. Wer es gut managt, kommt schneller und gestärkt zurück.",
  meta: {
    audio: "Audio-Dauer: 16–18 Min",
    lese: "Lese-Zeit Workbook: 30–35 Min",
    uebung: "mit Übung 4.5",
  },

  objectives: [
    "die vier Phasen einer akuten Schmerzwelle (Flare-up) kennen,",
    "für jede Phase konkrete Handlungs-Strategien anwenden können,",
    "dein persönliches Flare-up-Protokoll schriftlich festhalten,",
    "ein Flare-up nicht mehr als Versagen, sondern als Phase im System einordnen,",
    "die Übung 4.5 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Was ist ein Flare-up?",
    },
    {
      kind: "lead",
      text: "Ein Flare-up ist eine vorübergehende deutliche Verschlechterung deiner chronischen Schmerzsymptomatik — typischerweise über Tage bis wenige Wochen, mit anschließender Rückkehr zur Baseline (oder nahe daran).",
    },
    {
      kind: "paragraph",
      text: "Flare-ups sind normal und gehören zum chronischen Verlauf. Sie sind keine Niederlage, kein Scheitern deines Übungsprogramms, keine „Verschlechterung der Grundkrankheit“. Sie sind eine temporäre Hochregulation deines sensibilisierten Schmerzsystems — oft durch Stress, Schlafmangel, akute Überlastung, virale Infekte, hormonelle Schwankungen, emotionale Belastungen oder mehrere dieser Faktoren in Kombination ausgelöst.",
    },
    {
      kind: "paragraph",
      text: "Wer ein Flare-up gut managen kann, hat einen erheblichen Vorteil. Ein gut gemanagtes Flare-up dauert oft 3–10 Tage. Ein schlecht gemanagtes (mit Bettruhe, Panik, Aufgabe der Routine) kann Wochen ziehen und manchmal in einen längeren Rückschlag münden.",
    },

    {
      kind: "heading",
      eyebrow: "Acute · Recovery · Return · Reflect",
      text: "Die vier Phasen",
    },
    {
      kind: "subheading",
      text: "Phase 1 — Acute (24–72 Stunden)",
    },
    {
      kind: "paragraph",
      text: "Erkennungszeichen: Akuter Anstieg der Schmerzintensität, deutliche Bewegungseinschränkung, oft begleitet von vegetativer Aktivierung (Schweiß, Übelkeit, Schlaflosigkeit), starke kognitive Belastung („Was ist passiert?“).",
    },
    {
      kind: "bulletList",
      title: "Handeln:",
      items: [
        "Mikro-Dosis-Bewegung (Lektion 4.4) — keine Bettruhe, aber stark reduziertes Pensum",
        "Atmung im Fokus — Crocodile Breathing, Box Breathing für vegetative Beruhigung",
        "Schmerzmittel — nach ärztlicher Empfehlung, kurzfristig, ohne Schuldgefühle",
        "Wärme oder Kälte — was sich gut anfühlt, ist okay",
        "Selbst-Coaching: „Das ist ein Flare-up. Das geht vorbei. Ich kenne den Verlauf. Ich bleibe in Mikro-Dosis dran.“",
        "Verbieten: Spontane Schiene-Eskalation („ich muss jetzt mehr machen“), Operations-Gedanken („vielleicht doch operieren“), Hilfslosigkeits-Spiralen",
      ],
    },
    {
      kind: "bulletList",
      title: "Was NICHT tun:",
      items: [
        "Komplette Bettruhe über 1–2 Tage hinaus",
        "Übermäßige Diagnostik (sofortiges MRT)",
        "Drastische Therapie-Wechsel",
        "Aufgabe der gesamten Routine",
      ],
    },
    {
      kind: "subheading",
      text: "Phase 2 — Recovery (3–10 Tage)",
    },
    {
      kind: "paragraph",
      text: "Erkennungszeichen: Schmerz ist hoch, aber stabilisiert sich. Bewegung wird wieder etwas leichter. Schlaf erholt sich teilweise.",
    },
    {
      kind: "bulletList",
      title: "Handeln:",
      items: [
        "Schrittweise Rückkehr zur Routine — eine Stufe unter dem Vor-Flare-up-Niveau",
        "Wenn vor dem Flare-up Standard, dann jetzt Reizarm. Wenn belastend, dann Standard.",
        "Tageszeit-Management: Identifiziere, wann der Schmerz am besten ist (oft Vormittag oder später Nachmittag) und mache deine Übungen dann.",
        "Vegetativ priorisieren: Schlaf, Atmung, Stressreduktion stehen an erster Stelle.",
        "Selbst-Coaching: „Ich bin in der Recovery-Phase. Mein System reguliert sich runter. Ich bewege mich sanft mit.“",
      ],
    },
    {
      kind: "subheading",
      text: "Phase 3 — Return (1–3 Wochen)",
    },
    {
      kind: "paragraph",
      text: "Erkennungszeichen: Schmerz nähert sich der Baseline. Bewegung fühlt sich wieder normal an. Die meisten Aktivitäten sind wieder möglich.",
    },
    {
      kind: "bulletList",
      title: "Handeln:",
      items: [
        "Schrittweise Schiene-Steigerung zurück zum Vor-Flare-up-Niveau",
        "Hier ist die größte Falle: zu schnell zu viel machen, weil „es geht ja wieder“. Du holst nichts nach.",
        "Nimm dir Zeit (1–2 Wochen für die volle Rückkehr).",
        "Belastungstoleranz-Übungen kommen zuletzt zurück, nicht zuerst.",
      ],
    },
    {
      kind: "subheading",
      text: "Phase 4 — Reflect (nach 4–6 Wochen)",
    },
    {
      kind: "paragraph",
      text: "Erkennungszeichen: Du bist zurück auf Baseline oder besser. Genug zeitlicher Abstand für Reflexion.",
    },
    {
      kind: "bulletList",
      title: "Handeln:",
      items: [
        "Auslöser-Analyse: Was ist 1–2 Wochen vor dem Flare-up passiert? Stress? Schlaf? Akute Belastung? Krankheit? Mehrere zusammen?",
        "Frühwarn-System updaten: Welche der vier Vorboten (Lektion 4.4) hast du übersehen? Wie kannst du sie früher erkennen?",
        "Schutz-Strategien verfeinern: Was kannst du in vergleichbarer Konstellation präventiv tun?",
        "Selbstwirksamkeits-Bilanz: Was hast du gut gemacht? Worauf kannst du beim nächsten Mal vertrauen?",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Kopf und Körper",
      text: "Die psychologische Dimension",
    },
    {
      kind: "paragraph",
      text: "Flare-ups sind nicht nur körperlich, sondern auch psychologisch belastend. Typische Gedankenmuster, die in Phase 1 hochkommen:",
    },
    {
      kind: "bulletList",
      items: [
        "„Es kommt alles wieder zurück.“",
        "„Alle Fortschritte sind weg.“",
        "„Ich habe etwas falsch gemacht.“",
        "„Ich muss das System ändern, es funktioniert nicht.“",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Gedanken sind kognitive Reaktionen auf die akute Schmerz-Spitze, nicht Wahrheit. In Phase 1 hat dein Schmerzsystem die Kontrolle übernommen — dein Denken folgt ihm.",
    },
    {
      kind: "paragraph",
      text: "Die richtige Antwort auf diese Gedanken ist nicht Bekämpfen (siehe Lektion 2.7 — Defusion), sondern Etikettieren und Vorbeiziehen lassen:",
    },
    {
      kind: "callout",
      text: "„Ich habe gerade den Gedanken, dass alle Fortschritte weg sind. Das ist die Phase-1-Stimme. Sie kommt immer. Sie geht auch wieder. Ich glaube ihr nicht.“",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Das gut gemanagte Flare-up",
      body: [
        "Eine Patientin, die nach 6 Monaten Masterclass-Anwendung ein Flare-up bekam (vermutlich ausgelöst durch eine virale Infektion + Übernachtgast mit Stress), berichtete mir 3 Wochen später: „Ich habe mich nicht hängen lassen. Ich wusste, dass es vorbeigeht. Ich habe meine Atmung gemacht, Mikro-Dosis-Mobilisation, viel geschlafen. Nach 8 Tagen ging es deutlich besser. Nach 3 Wochen war ich wieder da, wo ich vorher war.“",
        "Das gut gemanagte Flare-up erhöht langfristig das Selbstvertrauen. Du hast erlebt: Die Welle kommt, die Welle geht. Du bleibst.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Flare-up-Protokoll",
    timing:
      "Geschätzte Bearbeitungszeit: 20 Minuten · Diese Übung schreibst du im Voraus — bevor das nächste Flare-up kommt.",
    theorieRueckbindung: [
      "Du kennst jetzt die vier Phasen einer Schmerzwelle. In dieser Übung schreibst du dein persönliches Protokoll im Voraus — damit du, wenn die Welle kommt, den Plan schon hast.",
    ],
    anleitung: ["In fünf Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Deine Phase-1-Routine (Acute)" },
      {
        kind: "text",
        text: "Was machst du in den ersten 24–72 Stunden eines Flare-ups?",
      },
      {
        kind: "note",
        field: {
          id: "phase1-bewegung",
          label: "Mikro-Bewegung (täglich):",
          rows: 2,
        },
      },
      {
        kind: "note",
        field: {
          id: "phase1-atmung",
          label: "Atmung (täglich, mehrmals):",
          rows: 2,
        },
      },
      {
        kind: "note",
        field: {
          id: "phase1-schmerzmittel",
          label: "Schmerzmittel (falls verschrieben):",
          rows: 2,
        },
      },
      {
        kind: "note",
        field: {
          id: "phase1-coaching",
          label: "Selbst-Coaching-Satz:",
          rows: 2,
        },
      },
      {
        kind: "note",
        field: {
          id: "phase1-nicht",
          label: "Was ich NICHT mache:",
          rows: 2,
        },
      },

      { kind: "step", n: 2, title: "Deine Phase-2-Routine (Recovery)" },
      {
        kind: "text",
        text: "Schrittweise Rückkehr nach 3–10 Tagen — wähle für jede Aktivität die Schiene während der Recovery.",
      },
      {
        kind: "ratingMatrix",
        id: "recovery",
        label: "Schiene während Recovery:",
        columns: ["Pause", "Reizarm", "Standard"],
        rows: [
          { id: "mobilisation", label: "Mobilisation" },
          { id: "stabilisation", label: "Stabilisation" },
          { id: "belastungstoleranz", label: "Belastungstoleranz" },
          { id: "atmung", label: "Atmung" },
          { id: "bewegung", label: "Bewegung außer Haus" },
        ],
      },

      { kind: "step", n: 3, title: "Deine Phase-3-Routine (Return)" },
      {
        kind: "text",
        text: "Wann gehst du zurück auf Vor-Flare-up-Niveau?",
      },
      {
        kind: "lines",
        id: "return",
        lines: [
          { id: "mobilisation", prefix: "Mobilisation kommt zurück nach", mid: "Tagen:" },
          { id: "stabilisation", prefix: "Stabilisation kommt zurück nach", mid: "Tagen:" },
          { id: "belastungstoleranz", prefix: "Belastungstoleranz kommt zurück nach", mid: "Wochen:" },
        ],
      },

      { kind: "step", n: 4, title: "Dein Reflektions-Schema (Phase 4)" },
      {
        kind: "text",
        text: "Welche Fragen stellst du dir 4–6 Wochen nach einem Flare-up?",
      },
      {
        kind: "lines",
        id: "reflektion-fragen",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
        ],
      },

      { kind: "step", n: 5, title: "Dein Notfall-Wallet-Protokoll" },
      {
        kind: "text",
        text: "Schreibe in 5 Sätzen, was du in einem akuten Flare-up zu dir selbst sagst. Diese 5 Sätze trägst du in der Geldbörse oder auf dem Handy als Erinnerung.",
      },
      {
        kind: "lines",
        id: "wallet",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
          { id: "4", prefix: "4." },
          { id: "5", prefix: "5." },
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
    "Flare-ups sind normal — temporäre Hochregulation eines sensibilisierten Schmerzsystems, kein Versagen.",
    "Vier Phasen: Acute (24–72 h) · Recovery (3–10 Tage) · Return (1–3 Wochen) · Reflect (nach 4–6 Wochen).",
    "In Phase 1: Mikro-Dosis, Atmung, Schmerzmittel ggf., Selbst-Coaching. Keine Bettruhe, keine Operations-Gedanken.",
    "Psychologische Dimension: Phase-1-Gedanken sind Schmerz-Reaktion, nicht Wahrheit. Etikettieren und vorbeiziehen lassen.",
    "Im Voraus aufschreiben: Dein Flare-up-Protokoll. Wenn die Welle kommt, hast du den Plan schon.",
  ],

  querverweise: [
    {
      label: "Lektion 2.7",
      text: "Defusion für Phase-1-Gedanken.",
    },
    {
      label: "Lektion 4.4",
      text: "Mikro-Dosis-Katalog.",
    },
    {
      label: "Anhang C",
      text: "Notfall-Karte mit Flare-up-Protokoll.",
    },
  ],

  notizfeld: {
    id: "notiz-4.5",
    label: "Notizfeld",
    rows: 10,
  },
};
