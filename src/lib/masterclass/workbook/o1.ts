import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion O.1 „Die drei Kernbotschaften".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion O.1", Z. 7229–7385). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Outro = Abschluss/Übergabe. Es existieren keine Übungsfotos für diese
 * Lektion (nur `uk-*`-Übungskarten der Modul-2-Lektionen) — daher kein
 * `image`-Block; alle visuellen Inhalte werden als Text wiedergegeben.
 */
export const WORKBOOK_O1: WorkbookData = {
  lessonId: "O.1",
  nr: "O.1",
  sectionLabel: "Outro · Übergabe",
  title: "Die drei Kernbotschaften",
  subtitle:
    "Wenn du dich in 5 Jahren an das Wichtigste erinnerst — diese drei Botschaften sollen es sein, als mentale Anker für deinen Alltag.",
  meta: {
    audio: "Audio-Dauer: 10–12 Min",
    lese: "Lese-Zeit Workbook: 20–25 Min",
    uebung: "mit Reflexionsseite",
  },

  objectives: [
    "die drei Kernbotschaften dieser Masterclass für dich zusammenfassen können,",
    "diese Botschaften als mentale Anker in deinem Alltag nutzen können,",
    "deine eigenen drei Mitnehm-Sätze formulieren.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Wesentliche",
      text: "Die drei Kernbotschaften",
    },
    {
      kind: "lead",
      text: "Diese Masterclass hatte viele Inhalte. Wenn du in 5 Jahren versuchst, dich an die wichtigsten Botschaften zu erinnern — diese drei sollen es sein.",
    },

    {
      kind: "subheading",
      text: "Kernbotschaft 1 — Verstehen verändert",
    },
    {
      kind: "paragraph",
      text: "Du weißt jetzt mehr über chronischen Rückenschmerz als 95 % der Allgemeinbevölkerung. Du weißt, dass Schmerz im Gehirn entsteht (Lektion 1.5). Du weißt, dass strukturelle MRT-Befunde oft Lebensspuren sind, keine Schmerzursache (Lektion 1.4). Du weißt, dass dein Schmerzsystem plastisch ist und neu lernen kann (Lektion 1.3).",
    },
    {
      kind: "paragraph",
      text: "Dieses Verstehen ist nicht akademisch. Es ist therapeutisch wirksam. Studien zeigen: Allein die Edukation, die du in Modul 1 bekommen hast, reduziert Schmerz und verbessert Funktion messbar — auch ohne die folgenden Module.",
    },
    {
      kind: "paragraph",
      text: "Verstehen verändert die Bedeutung, die dein Gehirn den Schmerzsignalen zuschreibt. Es verändert, wie ängstlich oder gelassen du auf Schmerzspitzen reagierst. Es verändert, was du dir zutraust.",
    },
    {
      kind: "callout",
      text: "Du verstehst jetzt. Das allein ist schon Veränderung.",
    },

    {
      kind: "subheading",
      text: "Kernbotschaft 2 — Bewegung ist Information",
    },
    {
      kind: "paragraph",
      text: "Du hast in Modul 2 viele Übungen gelernt. Aber die wichtigste Erkenntnis ist nicht welche Übung — es ist die mentale Verschiebung von Bewegung als Sport zu Bewegung als Information.",
    },
    {
      kind: "paragraph",
      text: "Jede Bewegung sendet deinem Schmerzsystem eine Botschaft. Wiederholte sichere Bewegung sendet: „Das ist sicher. Wir müssen nicht überreagieren.“ Diese Botschaften kalibrieren deine Alarmanlage neu — über Wochen und Monate.",
    },
    {
      kind: "paragraph",
      text: "Das verändert deine Haltung zu Schmerz und Bewegung fundamental. Schmerz wird kein automatisches Stopp-Signal mehr — es wird eine Information, die du interpretieren lernst.",
    },
    {
      kind: "callout",
      text: "Du bewegst dich jetzt, um Sicherheit zu lernen. Nicht um Schmerz zu besiegen.",
    },

    {
      kind: "subheading",
      text: "Kernbotschaft 3 — Das System trägt sich selbst",
    },
    {
      kind: "paragraph",
      text: "Modul 4 — die Ritual-Map, das Habit Stacking, die schmerzadaptive Auswahl, das Flare-up-Protokoll — gibt dir nicht noch mehr zu tun. Es gibt dir ein System, das sich selbst trägt.",
    },
    {
      kind: "paragraph",
      text: "Wenn du die Ritual-Map ernst nimmst, hörst du auf, jeden Tag neu zu entscheiden, ob du heute „motiviert“ bist. Die Anker entscheiden für dich. Die drei Schienen passen sich an. Das Flare-up-Protokoll trägt dich durch die Wellen.",
    },
    {
      kind: "paragraph",
      text: "Dieses System ist nicht starr — du passt es alle 4–8 Wochen an. Aber es trägt. Es ist nicht abhängig von Tagesform, von Therapeuten-Verfügbarkeit, von guten Tagen.",
    },
    {
      kind: "callout",
      text: "Du hast jetzt ein System. Das System trägt dich durch dieses Jahr und durch die nächsten.",
    },

    {
      kind: "heading",
      eyebrow: "Dein mentaler Anker",
      text: "Deine drei Mitnehm-Sätze",
    },
    {
      kind: "paragraph",
      text: "Diese drei Botschaften sind die strukturierten Versionen. Was sich für dich daraus ergibt, kann anders klingen. Vielleicht hast du in den letzten Wochen drei eigene Sätze gefunden, die für dich wichtiger sind. Vielleicht sind es Variationen der Kernbotschaften, die zu dir passen.",
    },
    {
      kind: "paragraph",
      text: "Diese drei Sätze sind dein mentaler Anker. Du kannst sie auf einen Zettel schreiben und in die Geldbörse legen. Du kannst sie als Hintergrundbild auf dem Handy haben. Du kannst sie als kurze Erinnerung in stressigen Momenten denken.",
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Reflexionsseite — Meine drei Mitnehm-Sätze",
    timing: "Diese Reflexionsseite ist deine private Zusammenfassung dieser Masterclass.",
    blocks: [
      {
        kind: "note",
        field: {
          id: "satz-1",
          label:
            "Mein Satz 1 — Verstehen verändert (was hast du verstanden, was du vorher nicht verstanden hast?)",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "satz-2",
          label:
            "Mein Satz 2 — Bewegung ist Information (wie hat sich dein Verhältnis zu Bewegung verändert?)",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "satz-3",
          label:
            "Mein Satz 3 — Das System trägt sich selbst (welche Routine wird dich tragen?)",
          rows: 4,
        },
      },

      {
        kind: "text",
        text: "Meine persönlichen drei Kürzest-Sätze: Wenn du jeden Satz auf 5–10 Wörter reduzieren würdest — wie kurz und kraftvoll kannst du sie machen?",
      },
      {
        kind: "lines",
        id: "kuerzest",
        label: "Meine drei Kürzest-Sätze:",
        lines: [
          { id: "1", prefix: "1." },
          { id: "2", prefix: "2." },
          { id: "3", prefix: "3." },
        ],
      },

      {
        kind: "checklist",
        id: "anker-platz",
        label:
          "Mein Anker-Platz: Wo platzierst du diese drei Sätze, damit du sie täglich siehst?",
        items: [
          { id: "geldboerse", label: "Zettel in der Geldbörse" },
          { id: "handy", label: "Hintergrundbild auf dem Handy" },
          { id: "spiegel", label: "Aufkleber am Spiegel" },
          { id: "kuehlschrank", label: "Notiz auf dem Kühlschrank" },
          { id: "andere", label: "Andere" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "anker-andere",
          label: "Anderer Ort (falls oben „Andere“ gewählt):",
          rows: 2,
        },
      },

      {
        kind: "note",
        field: {
          id: "abschluss-reflexion",
          label:
            "🔁 Abschließende Reflexion: Welche eine Veränderung in mir nehme ich aus dieser Masterclass mit, die ich vor 12 Wochen nicht hatte?",
          rows: 6,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
    ],
  },

  zusammenfassung: [
    "Verstehen verändert — was du in Modul 1 gelernt hast, ist eigenständig therapeutisch wirksam.",
    "Bewegung ist Information — Modul 2 hat dein Verhältnis zu Bewegung verschoben: vom Sport zur Sicherheits-Botschaft.",
    "Das System trägt sich selbst — Modul 3 und 4 haben dir kein Mehr-an-Arbeit gegeben, sondern ein selbsttragendes System.",
    "Drei Sätze, sichtbar platziert — als mentaler Anker im Alltag.",
  ],

  querverweise: [
    {
      label: "Lektion O.2",
      text: "Die Übergabe: Was du jetzt bist, welche Grenzen die Masterclass hat, welche Pfade vor dir liegen.",
    },
  ],

  notizfeld: {
    id: "notiz-O.1",
    label: "Notizfeld",
    helper:
      "Eigene Gedanken zu deinen drei Mitnehm-Sätzen und zu dem, was du aus dieser Masterclass behalten willst.",
    rows: 10,
  },
};
