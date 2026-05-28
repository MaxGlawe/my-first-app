import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 4.4 „Schmerzadaptiv wählen: Mikro-Dosis statt Skip".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 4.4", Z. 6514–6735). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-".
 *
 * Modul 4 ist Recoping/Verhaltens-Strategie — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M4_4: WorkbookData = {
  lessonId: "4.4",
  nr: "4.4",
  sectionLabel: "Modul 4 · Recoping",
  title: "Schmerzadaptiv wählen: Mikro-Dosis statt Skip",
  subtitle:
    "Auch in Schmerzphasen wird etwas gemacht — in deutlich verkleinerter Form, aber kontinuierlich. Der Ausweg aus dem Alles-oder-Nichts-Reflex.",
  meta: {
    audio: "Audio-Dauer: 16–18 Min",
    lese: "Lese-Zeit Workbook: 30–35 Min",
    uebung: "mit Übung 4.4",
  },

  objectives: [
    "die Drei-Ebenen-Adaption auf Schmerz-Wellen verstehen (Tag · Halbtag · Übung),",
    "die vier Vorboten einer Schmerz-Welle erkennen,",
    "das Mikro-Dosis-Prinzip anwenden können — statt nichts machen,",
    "deinen persönlichen Mikro-Dosis-Katalog zusammenstellen,",
    "die Übung 4.4 abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Problem",
      text: "Der Alles-oder-Nichts-Reflex",
    },
    {
      kind: "lead",
      text: "Patienten neigen dazu, in Schmerzphasen alles fallen zu lassen. Übungen werden komplett ausgesetzt. Bewegung wird vermieden. Der Tag wird auf der Couch verbracht. Dann, wenn der Schmerz besser wird, wird alles wieder hochgefahren — und oft der nächste Crash provoziert.",
    },
    {
      kind: "paragraph",
      text: "Diese Alles-oder-Nichts-Logik ist eine der häufigsten Selbstsabotagen bei chronischem Schmerz. Sie verstärkt das Push-Crash-Muster (Lektion 2.6), schwächt die Routine, untergräbt die Sicherheits-Botschaft an das Schmerzsystem.",
    },
    {
      kind: "paragraph",
      text: "Die Alternative heißt Mikro-Dosis statt Skip: Auch in Schmerzphasen wird etwas gemacht, in deutlich verkleinerter Form, aber kontinuierlich.",
    },

    {
      kind: "heading",
      eyebrow: "Tag · Halbtag · Übung",
      text: "Die Drei-Ebenen-Adaption",
    },
    {
      kind: "paragraph",
      text: "Anstatt binär zu denken (ich mache mein Programm / ich mache nichts), arbeite auf drei Ebenen der Anpassung:",
    },
    {
      kind: "subheading",
      text: "Ebene 1 — Tages-Adaption",
    },
    {
      kind: "paragraph",
      text: "An welchem Tag in der Woche stehst du, und was war gestern? Wenn gestern viel war, ist heute leichter. Wenn gestern Pause, kann heute Standard sein.",
    },
    {
      kind: "subheading",
      text: "Ebene 2 — Halbtags-Adaption",
    },
    {
      kind: "paragraph",
      text: "Wie ist dein Tag heute aufgebaut? Hast du morgens einen anstrengenden Termin, dann ist das Mobilisations-Programm am Morgen besser reizarm. Abends nach Entlastung kannst du Standard machen.",
    },
    {
      kind: "subheading",
      text: "Ebene 3 — Übungs-Adaption",
    },
    {
      kind: "paragraph",
      text: "Innerhalb des Übungs-Sets kannst du differenzieren: 5 statt 10 Wiederholungen, 15 statt 30 Sekunden Haltezeit, ohne Gewicht statt mit Gewicht, eine Übung weglassen statt das ganze Set zu skippen.",
    },
    {
      kind: "paragraph",
      text: "Diese drei Ebenen kombinierst du je nach Situation. Sie geben dir viel feinere Anpassungsmöglichkeit als die Schienen allein.",
    },

    {
      kind: "heading",
      eyebrow: "Frühwarn-System",
      text: "Die vier Vorboten einer Schmerz-Welle",
    },
    {
      kind: "paragraph",
      text: "Mit Erfahrung lernst du, die Anzeichen einer kommenden Schmerz-Welle zu erkennen, bevor sie da ist. Vier typische Vorboten:",
    },
    {
      kind: "bulletList",
      items: [
        "Vorbote 1: Veränderte Bewegungsqualität — Du bemerkst, dass deine üblichen Bewegungen „anders“ sich anfühlen — etwas steifer, etwas zurückhaltender, etwas vorsichtiger.",
        "Vorbote 2: Vegetative Veränderungen — Du schläfst schlechter, fühlst dich tagsüber müder, dein Stresslevel ist erhöht ohne klare Ursache.",
        "Vorbote 3: Kognitive Veränderungen — Du hast wieder mehr katastrophisierende Schmerzgedanken („Es wird wieder schlimm“). Defusion fällt schwerer.",
        "Vorbote 4: Beginnende periphere Symptome — Leichtes Ziehen, leichte Empfindlichkeit, fast ein Schmerz — aber noch kein voller Schmerz.",
      ],
    },
    {
      kind: "callout",
      text: "Wenn du Vorboten erkennst: nicht die Routine skippen, sondern Schiene wechseln — und Atmung, Schlaf, Stress prioritär adressieren.",
    },

    {
      kind: "heading",
      eyebrow: "Die kleinste wirksame Aktivierung",
      text: "Das Mikro-Dosis-Prinzip",
    },
    {
      kind: "lead",
      text: "Mikro-Dosis bedeutet: die kleinste Aktivierung, die dein System die Sicherheits-Botschaft empfangen lässt. Auch an den schwersten Tagen ist diese Mikro-Dosis möglich.",
    },
    {
      kind: "table",
      caption: "Mikro-Dosis-Katalog",
      headers: ["Bereich", "Mikro-Dosis"],
      rows: [
        ["Mobilisation", "3 Pelvic Tilts im Bett"],
        ["Mobilisation", "5 sanfte Knee-to-Chest"],
        ["Mobilisation", "30 Sekunden Cat-Cow"],
        ["Stabilisation", "3 TVA-Aktivierungen im Liegen"],
        ["Stabilisation", "30 Sekunden statisches deep-core-Halten"],
        ["Atmung", "5 Atemzüge in 360°-Atmung"],
        ["Atmung", "3 Box-Breathing-Zyklen"],
        ["Atmung", "5 Crocodile-Atemzüge"],
        ["Bewegung", "50 Schritte im Zimmer"],
        ["Bewegung", "5 Min sehr langsamer Spaziergang"],
        ["Coping", "3 defusionsbasierte Gedanken-Etikettierungen"],
      ],
    },
    {
      kind: "keyTakeaway",
      title: "Die Botschaft",
      body: [
        "Selbst an Tagen, an denen Schmerz 7+/10 ist, sind 3 Atemzüge möglich. Sind 5 Pelvic Tilts möglich. Dein System empfängt: „Wir bleiben dran. Wir geben nicht auf. Wir warten nicht ab, wir adaptieren.“",
      ],
    },
    {
      kind: "vertiefung",
      title: "Mikro-Dosis als Schutz vor Sensibilisierung",
      body: [
        "Ein subtiler, aber wichtiger Mechanismus: Vollständige Inaktivität in Schmerzphasen ist eine implizite Bestätigung für das Schmerzsystem, dass Bewegung tatsächlich gefährlich ist. Das System lernt: „Bei Schmerz wird vermieden, also ist Schmerz ein zuverlässiges Vermeidungs-Signal.“ Diese Lernlogik verstärkt Sensibilisierung.",
        "Mikro-Dosis bricht diese Lernschleife. Selbst die kleinste Aktivität in Schmerzphasen signalisiert dem System: „Schmerz ist nicht automatisches Vermeidungs-Signal. Wir tun trotzdem etwas. Bewegung ist sicher, auch wenn Schmerz da ist.“ Diese Botschaft, in vielen Wiederholungen, trägt zur Re-Kalibrierung bei.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Mikro-Dosis-Katalog",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    theorieRueckbindung: [
      "Du hast das Mikro-Dosis-Prinzip kennengelernt. Diese Übung hilft dir, deinen persönlichen Mikro-Dosis-Katalog zusammenzustellen — die kleinste Aktivierung pro Bereich, die du auch an deinen schlechtesten Tagen immer schaffst.",
    ],
    anleitung: ["In drei Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Deine Vorboten" },
      {
        kind: "text",
        text: "Welche der vier Vorboten erkennst du bei dir am ehesten? Kreuze an und notiere, wie sie sich bei dir konkret zeigen.",
      },
      {
        kind: "checklist",
        id: "vorboten",
        label: "Das erkenne ich bei mir:",
        items: [
          { id: "bewegung", label: "Veränderte Bewegungsqualität" },
          { id: "vegetativ", label: "Vegetative Veränderungen" },
          { id: "kognitiv", label: "Kognitive Veränderungen" },
          { id: "peripher", label: "Beginnende periphere Symptome" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "vorboten-notiz",
          label: "Wie zeigen sich meine Vorboten konkret?",
          rows: 4,
        },
      },

      { kind: "step", n: 2, title: "Dein Mikro-Dosis-Set" },
      {
        kind: "text",
        text: "Stelle dir für jeden Schmerz-Bereich eine Mikro-Dosis-Variante zusammen, die du immer schaffst.",
      },
      {
        kind: "lines",
        id: "mobilisation",
        label: "Mobilisations-Mikro-Dosis (auch bei Schmerz 7/10 machbar):",
        lines: [{ id: "1" }, { id: "2" }],
      },
      {
        kind: "lines",
        id: "stabilisation",
        label: "Stabilisations-Mikro-Dosis:",
        lines: [{ id: "1" }, { id: "2" }],
      },
      {
        kind: "lines",
        id: "atmung",
        label: "Atmungs-Mikro-Dosis:",
        lines: [{ id: "1" }, { id: "2" }],
      },
      {
        kind: "lines",
        id: "bewegung",
        label: "Bewegungs-Mikro-Dosis:",
        lines: [{ id: "1" }, { id: "2" }],
      },
      {
        kind: "lines",
        id: "coping",
        label: "Coping-Mikro-Dosis:",
        lines: [{ id: "1" }, { id: "2" }],
      },

      { kind: "step", n: 3, title: "Die eine Regel" },
      {
        kind: "text",
        text: "Welche eine Regel stellst du dir auf für Schmerz-Wellen?",
      },
      {
        kind: "hint",
        text: "Beispiel: „Auch an meinen schlechtesten Tagen mache ich mindestens 5 Pelvic Tilts und 5 Atemzüge. Egal wie sehr es weh tut.“",
      },
      {
        kind: "note",
        field: {
          id: "regel",
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
    "Der Alles-oder-Nichts-Reflex ist eine häufige Selbstsabotage — verstärkt Push-Crash, schwächt die Routine.",
    "Drei-Ebenen-Adaption: Tag · Halbtag · Übung. Je nach Situation feiner anpassen.",
    "Vier Vorboten einer Schmerz-Welle: Bewegungsqualität, vegetativ, kognitiv, periphere Symptome.",
    "Mikro-Dosis statt Skip: Auch an den schlechtesten Tagen wird etwas gemacht. 3 Atemzüge sind immer möglich.",
    "Sensibilisierungs-Schutz: Mikro-Dosis verhindert die implizite Bestätigung, dass Bewegung bei Schmerz vermieden werden muss.",
  ],

  querverweise: [
    {
      label: "Lektion 4.5",
      text: "liefert das Flare-up-Protokoll für die sehr schweren Tage.",
    },
    {
      label: "Lektion 4.2",
      text: "stellt die Ritual-Map, in der die Mikro-Dosis-Variante mit ausgearbeitet wird.",
    },
  ],

  notizfeld: {
    id: "notiz-4.4",
    label: "Notizfeld",
    rows: 10,
  },
};
