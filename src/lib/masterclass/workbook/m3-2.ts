import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 3.2 „Haltungs-Mythen entzaubert“.
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 3.2“, Z. 5037–5237). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 3 ist überwiegend Alltag/Theorie — es existieren keine
 * passenden Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M3_2: WorkbookData = {
  lessonId: "3.2",
  nr: "3.2",
  sectionLabel: "Modul 3 – Prävention",
  title: "Haltungs-Mythen entzaubert",
  subtitle:
    "Es gibt nicht eine richtige Haltung — es gibt viele akzeptable Haltungen, die regelmäßig wechseln sollen. Variabilität schlägt Perfektion.",
  meta: {
    audio: "Audio-Dauer: 14–16 Min",
    lese: "Lese-Zeit Workbook: 28–32 Min",
    uebung: "mit Übung 3.2",
  },

  objectives: [
    "die drei großen Haltungs-Mythen kennen und entkräften können,",
    "das Konzept der Bewegungsvariabilität statt richtiger Haltung verstehen,",
    "Sitzen und Stehen realistisch einordnen können,",
    "die Übung 3.2 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Problem",
      text: "Das Problem mit „der richtigen Haltung“",
    },
    {
      kind: "lead",
      text: "Wenn du in der populären Literatur, in Patienten-Broschüren oder bei manchen Therapeuten suchst, findest du Aussagen wie:",
    },
    {
      kind: "bulletList",
      items: [
        "„Achten Sie auf eine aufrechte Haltung.“",
        "„Sitzen Sie ergonomisch.“",
        "„Halten Sie Ihren Rücken gerade.“",
        "„Vermeiden Sie das Hohlkreuz.“",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Aussagen klingen vernünftig. Aber: die wissenschaftliche Evidenz dafür, dass eine bestimmte Haltung Schmerzen verursacht oder verhindert, ist erstaunlich dünn. Tatsächlich zeigen mehrere große Reviews der letzten Jahre (Slater 2019, Wirth 2014), dass:",
    },
    {
      kind: "bulletList",
      items: [
        "keine einheitliche „schmerzauslösende“ Haltung identifizierbar ist,",
        "die Korrelation zwischen Haltung und Schmerz schwach bis nicht-existent ist,",
        "Variabilität der Haltung gesünder ist als jede statische „perfekte“ Haltung,",
        "Haltungs-Interventionen (Korrekturen, ergonomische Stühle) keine konsistente Schmerzreduktion bringen.",
      ],
    },
    {
      kind: "paragraph",
      text: "Das heißt nicht, dass Haltung egal ist. Es heißt: die populäre Vorstellung, es gäbe eine richtige Haltung, die man pflegen müsse, ist falsch. Eher gibt es viele akzeptable Haltungen, die regelmäßig wechseln sollen.",
    },

    {
      kind: "heading",
      eyebrow: "Drei Mythen",
      text: "Die drei großen Haltungs-Mythen",
    },
    {
      kind: "subheading",
      text: "Mythos 1: „Die richtige Haltung schützt vor Rückenschmerzen.“",
    },
    {
      kind: "paragraph",
      text: "Realität: Menschen mit identischen Haltungs-Mustern haben sehr unterschiedliche Schmerzerfahrungen. Manche Menschen mit „schlechter“ Haltung leben schmerzfrei, manche mit „perfekter“ Haltung haben chronische Schmerzen. Haltung ist eine Variable unter vielen, und nicht die wichtigste.",
    },
    {
      kind: "paragraph",
      text: "Was tatsächlich schützt: Variabilität (häufige Haltungswechsel), Bewegung (Mobilisation, Belastung), Belastbarkeit (gut trainierte Muskulatur).",
    },
    {
      kind: "subheading",
      text: "Mythos 2: „Sitzen ist das neue Rauchen.“",
    },
    {
      kind: "paragraph",
      text: "Realität: Diese Aussage ist eine mediale Reduktion einer differenzierteren Forschungslage. Tatsächlich zeigen Studien Risiken bei prolongiertem Sitzen mit gleichzeitig geringer körperlicher Aktivität insgesamt. Wer 8 Stunden sitzt und sonst aktiv ist (täglich Sport, viel Gehen), hat moderate Risiken. Wer 8 Stunden sitzt und ansonsten kaum bewegt, hat größere Risiken.",
    },
    {
      kind: "paragraph",
      text: "Für Rückenschmerz speziell: Sitzen an sich ist kein primärer Schmerzauslöser. Was schmerzhaft wird, ist das Sitzen in einer Position über Stunden. Wechsel der Sitzposition, gelegentliches Aufstehen, Mini-Bewegungspausen entkräften die meisten Sitz-Probleme.",
    },
    {
      kind: "subheading",
      text: "Mythos 3: „Ein Stehpult heilt Rückenschmerzen.“",
    },
    {
      kind: "paragraph",
      text: "Realität: Stehpulte haben in Studien (Karakolis 2014) gemischte Effekte gezeigt. Dauer-Stehen ist nicht besser als Dauer-Sitzen — es belastet andere Strukturen. Der Vorteil liegt darin, dass Wechsel zwischen Sitzen und Stehen die Variabilität erhöht.",
    },
    {
      kind: "paragraph",
      text: "Wenn du einen höhenverstellbaren Schreibtisch hast: gut, nutze ihn für Wechsel. Wenn nicht: auch okay, mache regelmäßig kurze Bewegungspausen.",
    },

    {
      kind: "heading",
      eyebrow: "Die Alternative",
      text: "Die evidenzbasierte Alternative: Variabilität > Perfektion",
    },
    {
      kind: "paragraph",
      text: "Was die Daten konsistent zeigen: Wechseln ist besser als Halten.",
    },
    {
      kind: "table",
      caption: "Empfehlungen für gesundes Sitzen / Stehen",
      headers: ["Empfehlung", "Praktische Umsetzung"],
      rows: [
        ["Häufige Positionswechsel", "Alle 20–30 Minuten leicht anders sitzen"],
        ["Kurze Stehpausen", "Alle 60 Minuten 2–3 Minuten aufstehen"],
        ["Mini-Bewegungen", "Knee-to-Chest am Stuhl, Pelvic Tilt, Schulter-Rollen"],
        ["Keine extreme Position lang halten", "Weder hyperaufrecht noch hyper-zusammengesunken stundenlang"],
        ["Sitzen und Stehen wechseln", "Wenn möglich, mehrfach am Tag"],
      ],
    },
    {
      kind: "paragraph",
      text: "Die Botschaft: Es gibt nicht eine gesunde Position. Es gibt viele gesunde Positionen, und der Wechsel ist das Gesunde.",
    },
    {
      kind: "vertiefung",
      title: "Warum Variabilität wirkt",
      body: [
        "Mehrere Mechanismen erklären, warum Variabilität schützt:",
        "1. Strukturelle Entlastung: Jede Position belastet bestimmte Strukturen. Wechsel verteilt die Belastung.",
        "2. Bandscheiben-Diffusion: Verschiedene Positionen erzeugen verschiedene Druckverteilungen, die Diffusion fördern.",
        "3. Muskuläre Aktivierung: Verschiedene Positionen aktivieren verschiedene Muskeln, alle bleiben in Funktion.",
        "4. Neurologische Stimulation: Bewegung und Wechsel halten Propriozeption (Körperwahrnehmung) aktiv.",
        "5. Vegetative Effekte: Bewegungswechsel aktiviert das parasympathische System.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Haltungs-Mythen entzaubern",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Deine eigenen Haltungs-Mythen" },
      {
        kind: "text",
        text: "Welche Aussagen über „richtige Haltung“ hast du im Kopf? Notiere 3–5.",
      },
      {
        kind: "note",
        field: {
          id: "eigene-mythen",
          label: "Meine Haltungs-Mythen:",
          rows: 5,
        },
      },

      { kind: "step", n: 2, title: "Deine typischen Haltungs-Dauern" },
      {
        kind: "text",
        text: "Wie lange hältst du typischerweise jeweils eine Position?",
      },
      {
        kind: "lines",
        id: "dauern",
        label: "Dauer am Stück (im Durchschnitt):",
        lines: [
          { id: "schreibtisch", prefix: "Sitzen am Schreibtisch:", mid: "Minuten" },
          { id: "fernseher", prefix: "Sitzen vor dem Fernseher:", mid: "Minuten" },
          { id: "stehen", prefix: "Stehen (Küche, Werkstatt):", mid: "Minuten" },
          { id: "auto", prefix: "Im Auto sitzen:", mid: "Minuten" },
        ],
      },

      { kind: "step", n: 3, title: "Dein Variabilitäts-Plan" },
      {
        kind: "text",
        text: "Wie willst du in den nächsten 4 Wochen Variabilität erhöhen?",
      },
      {
        kind: "lines",
        id: "plan",
        label: "Konkrete Veränderung je Bereich:",
        lines: [
          { id: "schreibtisch", prefix: "Sitzen am Schreibtisch:" },
          { id: "fernseher", prefix: "Sitzen vor dem Fernseher:" },
          { id: "auto", prefix: "Im Auto:" },
          { id: "generell", prefix: "Generell:" },
        ],
      },
      {
        kind: "hint",
        text: "Beispiele: „Ich stelle einen Wecker alle 30 Minuten und stehe 2 Minuten auf.“ — „Ich variiere meine Sitzposition bewusst (mal vorgebeugt, mal aufrecht, mal zurückgelehnt) statt eine zu erzwingen.“ — „Ich nutze meine Mobilisations-Übungen (ÜK-M3 Pelvic Tilt) zwischen Sitz-Phasen.“",
      },

      { kind: "step", n: 4, title: "Die Freiheit zu sitzen, wie es sich gerade gut anfühlt" },
      {
        kind: "text",
        text: "Welcher eine Satz aus dieser Lektion bleibt dir besonders? (z. B. „Es gibt nicht eine richtige Haltung – Wechsel ist das Gesunde.“)",
      },
      {
        kind: "note",
        field: {
          id: "merksatz",
          label: "Mein Satz:",
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
    "Es gibt nicht eine richtige Haltung — die Korrelation zwischen Haltung und Schmerz ist schwach.",
    "Drei populäre Mythen entkräftet: „Richtige Haltung schützt“, „Sitzen = Rauchen“, „Stehpult heilt“.",
    "Variabilität ist besser als Perfektion — häufige Wechsel halten Strukturen, Muskeln, Nerven, Vegetativum aktiv.",
    "Mini-Bewegungspausen alle 30–60 Minuten sind die wirksamste praktische Maßnahme bei sitzender Tätigkeit.",
  ],

  querverweise: [
    {
      label: "Lektion 2.2",
      text: "Mobilisations-Übungen für die Pausen — die Mini-Bewegungen, die Variabilität konkret machen.",
    },
    {
      label: "Lektion 3.4",
      text: "Alltagsbewegung (NEAT) — die Fortsetzung des Variabilitäts-Gedankens über den Schreibtisch hinaus.",
    },
  ],

  notizfeld: {
    id: "notiz-3.2",
    label: "Notizfeld",
    rows: 10,
  },
};
