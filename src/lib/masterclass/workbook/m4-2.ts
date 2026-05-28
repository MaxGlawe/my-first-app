import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 4.2 „Die Ritual-Map: Dein Wochen-Operations-System".
 *
 * ★ HERZSTÜCK DER MASTERCLASS — Übung 4.2 ist die wichtigste Einzelübung.
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 4.2", Z. 5952–6296). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 4 ist Recoping (Routinen/Protokolle) — es existieren keine
 * Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M4_2: WorkbookData = {
  lessonId: "4.2",
  nr: "4.2",
  sectionLabel: "Modul 4 · Recoping",
  title: "Die Ritual-Map: Dein Wochen-Operations-System",
  subtitle:
    "Das Herzstück der Masterclass: dein persönliches, schriftlich fixiertes Wochen-System für die Anwendung aller Werkzeuge — selbsttragend statt motivationsabhängig.",
  meta: {
    audio: "Audio-Dauer: 22–25 Min",
    lese: "Lese-Zeit Workbook: 50–55 Min",
    uebung: "mit Übung 4.2 — Herzstück der Masterclass",
  },

  objectives: [
    "die Konstruktions-Logik einer Ritual-Map verstehen,",
    "die vier Schritte zur eigenen Ritual-Map durchlaufen können,",
    "aus den Werkzeugen von Modul 2 und 3 dein persönliches Wochen-System bauen können,",
    "die drei Praxis-Beispiele als Inspiration für dein eigenes System nutzen,",
    "die Übung 4.2 — die wichtigste Einzelübung der Masterclass — vollständig abgeschlossen haben.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Was ist eine Ritual-Map?",
    },
    {
      kind: "lead",
      text: "Eine Ritual-Map ist dein persönliches, schriftlich fixiertes Wochen-System für die Anwendung aller Werkzeuge dieser Masterclass.",
    },
    {
      kind: "bulletList",
      title: "Sie ist:",
      items: [
        "konkret (welche Übung wann)",
        "realistisch (passt zu deinem Leben)",
        "flexibel (drei Intensitätsschienen)",
        "selbsttragend (an Anker geknüpft, nicht motivationsabhängig)",
        "schriftlich (nicht im Kopf, sondern auf Papier)",
        "review-fähig (nach 4 Wochen prüf- und anpassbar)",
      ],
    },
    {
      kind: "paragraph",
      text: "Sie ist nicht ein Trainingsplan. Sie ist die Operationalisierung deines neuen Verhältnisses zu deinem Rücken. Wer die Ritual-Map ernst nimmt und sie als lebendiges Dokument pflegt, hat ein massives Werkzeug gegen Inkonsistenz und Push-Crash-Muster.",
    },

    {
      kind: "heading",
      eyebrow: "Die Logik",
      text: "Die Vier-Schritte-Konstruktion",
    },
    {
      kind: "subheading",
      text: "Schritt 1: Anker identifizieren",
    },
    {
      kind: "paragraph",
      text: "Aus deinem Habits-Inventar (Übung 4.1) wählst du 3–5 stabile Tages-Anker aus, an die du deine Übungen knüpfst. Diese Anker sind die Stützpfeiler deiner Ritual-Map.",
    },
    {
      kind: "bulletList",
      title: "Typische Anker für Schmerzpatienten:",
      items: [
        "Morgen-Anker: Aufstehen, Kaffee, Frühstück, Vor Arbeitsbeginn",
        "Tag-Anker: Mittagspause, Toiletten-Wege im Büro, Nach Mittag-Mahlzeit",
        "Abend-Anker: Heimkommen, Vor dem Abendessen, Nach Tagesschau, Vor dem Schlaf",
      ],
    },
    {
      kind: "subheading",
      text: "Schritt 2: Übungen zuordnen",
    },
    {
      kind: "paragraph",
      text: "Du ordnest jedem Anker eine Übung aus Modul 2 oder 3 zu. Wichtig: niedrigschwellig beginnen.",
    },
    {
      kind: "table",
      caption: "Beispielhafte Zuordnung",
      headers: ["Anker", "Übung", "Dauer", "Schiene"],
      rows: [
        ["Nach dem Aufstehen", "5 Pelvic Tilts (ÜK-M3)", "1 Min", "Reizarm"],
        ["Nach Mittagspause", "3 Atemzüge 360°-Atmung", "1 Min", "Reizarm"],
        ["Nach Heimkommen (Mo, Mi, Fr)", "Stabilisations-Sequenz (S1+S2+S3)", "10 Min", "Standard"],
        ["Sonntag früh", "Belastungstoleranz-Sequenz (B1+B2+B4)", "30 Min", "Standard"],
        ["Vor dem Schlaf", "5 Crocodile-Atemzüge (ÜK-A3)", "2 Min", "Reizarm"],
      ],
    },
    {
      kind: "subheading",
      text: "Schritt 3: Realitäts-Check",
    },
    {
      kind: "bulletList",
      title: "Frage dich für jede Zuordnung:",
      items: [
        "Schaff ich das auch an schlechten Tagen? Wenn nein → kleinere Mini-Version definieren.",
        "Ist der Anker stabil? Wenn nein → anderer Anker.",
        "Habe ich nicht zu viele neue Routinen gleichzeitig? Wenn ja → priorisieren, andere später.",
      ],
    },
    {
      kind: "subheading",
      text: "Schritt 4: Wochenstruktur",
    },
    {
      kind: "paragraph",
      text: "Du füllst eine Wochen-Übersicht aus, in der alle Übungen ihren Platz haben. Dieser visuelle Plan macht die Routine sichtbar und damit nachvollziehbar.",
    },

    {
      kind: "heading",
      eyebrow: "Drei Praxis-Beispiele",
      text: "So unterschiedlich können Ritual-Maps aussehen",
    },
    {
      kind: "vignette",
      title: "Beispiel 1 — Patricia (52, Lehrerin, chronischer LWS-Schmerz seit 8 Jahren)",
      body: [
        "Mo–Fr nach dem Aufstehen: 3 Pelvic Tilts + 3 Knee-to-Chest (2 Min).",
        "Mo–Fr während der Zähne-Putz-Zeit: 360°-Atmung, 10 Atemzüge (2 Min).",
        "Mo, Mi, Fr nach Schulschluss: vollständige Mobilisations-Sequenz, 5 Übungen (15 Min).",
        "Di + Do nach Arbeit: Stabilisations-Sequenz (Dead Bug, Bird Dog, TVA) (15 Min).",
        "Sa morgens: Belastungstoleranz (Hip Hinge, Goblet Squat, Farmer Walk) (30 Min).",
        "So nachmittags: Spaziergang (45 Min). Jeden Abend vor dem Schlaf: Crocodile Breathing (5 Min).",
        "Schiene: Mobilisation in Standard, Stabilisation in reizarm-bis-Standard, Belastung in reizarm (Wochen 5–8 nach Start). Schmerz-Adaption: an schlechten Tagen wird alles in reizarm gemacht, der Belastungstag wird durch eine zweite Mobilisations-Sequenz ersetzt.",
      ],
    },
    {
      kind: "vignette",
      title: "Beispiel 2 — Michael (39, Bauingenieur, Bandscheibenvorfall vor 18 Monaten, chronischer LWS-Schmerz)",
      body: [
        "Tägl. nach Kaffee: vollständige Mobilisation, alle 7 Übungen (12 Min).",
        "Tägl. nach Mittagessen: Spaziergang als Pause (10 Min).",
        "Mo + Do nach Feierabend: Stabilisation + Atmung (20 Min).",
        "Di + Sa morgens: Belastungstoleranz, 5 Übungen, Hauptsequenz (35 Min).",
        "Mi + Fr Pause: NEAT-Boost — Treppen + Mini-Mobilisation (5 Min).",
        "So Vormittag: Mountainbike-Tour (60–90 Min). Tägl. vor Schlaf: Box Breathing (5 Min).",
      ],
    },
    {
      kind: "vignette",
      title: "Beispiel 3 — Hannelore (68, Rentnerin, multi-segmentale Spondylose, ISG-Beteiligung)",
      body: [
        "Tägl. morgens nach Aufstehen: sanfte Mobilisation, Cat-Cow + Knee-to-Chest (5 Min).",
        "Tägl. nach Frühstück: 360°-Atmung (3 Min). Tägl. Vormittag: Spaziergang (30 Min).",
        "Tägl. Nachmittag: Stabilisation reizarm, S1, S2 vereinfacht (10 Min).",
        "Di + Fr: Belastungstoleranz reizarm — Hip Hinge ohne Gewicht, Wandgestützter Squat (20 Min).",
        "Tägl. abends auf der Couch: Mini-Stretches, Hüftbeuger, Pelvic Tilt (5 Min). Vor Schlaf: Crocodile Breathing (5 Min).",
        "Schiene durchgehend reizarm. Fokus auf Konsistenz und Sicherheit, nicht auf Belastungssteigerung. Hannelores Ziel: Selbstständigkeit erhalten, nicht Performance.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Ein wichtiges Prinzip",
      text: "Drei Intensitätsschienen",
    },
    {
      kind: "paragraph",
      text: "Deine Ritual-Map operiert auf drei Schienen, die du je nach Tagesform wählst:",
    },
    {
      kind: "table",
      caption: "Die drei Schienen für jede Übung",
      headers: ["Schiene", "Wann?", "Dauer"],
      rows: [
        ["Reizarm", "Schlechter Tag, Schmerz 4+/10, Müdigkeit, Krankheit, Unsicherheit", "40–60 % der Standard-Dosis"],
        ["Standard", "Durchschnittlicher Tag, Schmerz 0–3/10", "100 %"],
        ["Belastend", "Guter Tag, Schmerz 0–1/10, Energie hoch", "110–130 %"],
      ],
    },
    {
      kind: "keyTakeaway",
      title: "Wichtiges Prinzip",
      body: [
        "Selbst an den schlechtesten Tagen machst du etwas — in reizarmer Schiene. Die Botschaft an dein System: „Wir machen weiter, in angepasster Form.“",
      ],
    },
    {
      kind: "vertiefung",
      title: "Die Magie der Ritual-Map",
      body: [
        "Was unterscheidet die Ritual-Map von einem normalen Trainingsplan? Drei Dinge:",
        "1. Sie ist explizit schmerzadaptiv — nicht ein Plan für gute Tage, sondern ein Plan für alle Tage.",
        "2. Sie ist an Anker geknüpft — du musst dich nicht jeden Tag entscheiden, wann du trainierst. Die Anker entscheiden für dich.",
        "3. Sie ist niedrigschwellig — die meisten Mini-Aktionen dauern unter 5 Minuten. Du kannst keine „Keine Zeit“-Ausreden erzeugen.",
        "Wer eine Ritual-Map konsequent anwendet, baut nach 8–12 Wochen ein eingelebtes System. Es trägt sich selbst durch Stressphasen, durch Schmerz-Wellen, durch Urlaub. Es ist die nachhaltigste Form der Selbstanwendung.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Meine Ritual-Map ★ Herzstück der Masterclass",
    timing:
      "Geschätzte Bearbeitungszeit: 60–90 Minuten · Plane dir bewusst Zeit dafür ein. Diese Übung ist die wichtigste Einzelübung der Masterclass.",
    theorieRueckbindung: [
      "Du hast in den letzten Wochen viele Werkzeuge kennengelernt. Diese Übung baut daraus dein Wochen-System.",
    ],
    anleitung: ["In sechs Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Deine fünf Anker" },
      {
        kind: "text",
        text: "Aus deinem Habits-Inventar (Übung 4.1) wähle 5 stabile Anker aus — was du sowieso jeden Tag tust, mit ungefährer Tageszeit.",
      },
      {
        kind: "lines",
        id: "anker",
        label: "Anker (was du sowieso tust) · Tageszeit",
        lines: [
          { id: "1", prefix: "Anker 1:", mid: "→ ca." },
          { id: "2", prefix: "Anker 2:", mid: "→ ca." },
          { id: "3", prefix: "Anker 3:", mid: "→ ca." },
          { id: "4", prefix: "Anker 4:", mid: "→ ca." },
          { id: "5", prefix: "Anker 5:", mid: "→ ca." },
        ],
      },

      { kind: "step", n: 2, title: "Deine Prioritäts-Auswahl" },
      {
        kind: "text",
        text: "Welche Übungs-Kategorien sind für dich prioritär? Maximal 3 wählen — Auswahl basierend auf deinem Fünf-Faktoren-Profil aus Übung 1.5.",
      },
      {
        kind: "checklist",
        id: "prioritaet",
        label: "Maximal 3 Kategorien:",
        items: [
          { id: "mobilisation", label: "Mobilisation (ÜK-M) — empfohlen für jeden" },
          {
            id: "stabilisation",
            label: "Stabilisation (ÜK-S) — wichtig bei Bewegungs-Unsicherheit, „einschießendem“ Schmerz",
          },
          {
            id: "belastung",
            label: "Belastungstoleranz (ÜK-B) — wichtig für Vermeidungs-Reduktion und Aufbau",
          },
          {
            id: "atmung",
            label: "Atmung (ÜK-A) — wichtig bei vegetativer Überaktivität, Schlafproblemen",
          },
          { id: "neat", label: "Spaziergänge / NEAT — wichtig für alle" },
          {
            id: "coping",
            label: "Coping-Werkzeuge (Defusion, Exposure) — wichtig bei kognitiv-emotionalen Faktoren",
          },
        ],
      },

      { kind: "step", n: 3, title: "Die Zuordnung" },
      {
        kind: "text",
        text: "Ordne jedem deiner fünf Anker eine Aktivität zu — nach der Formel „Nach diesem Anker mache ich …“. Lege je Anker Dauer, Schiene und Frequenz fest.",
      },

      {
        kind: "lines",
        id: "zuordnung-1",
        label: "Anker 1",
        lines: [
          { id: "anker", prefix: "Anker:" },
          { id: "aktivitaet", prefix: "Nach diesem Anker mache ich:" },
          { id: "dauer", prefix: "Dauer:", mid: "Min" },
        ],
      },
      {
        kind: "singleChoice",
        id: "schiene-1",
        label: "Anker 1 — Schiene:",
        options: [
          { id: "reizarm", label: "Reizarm" },
          { id: "standard", label: "Standard" },
          { id: "belastend", label: "Belastend" },
        ],
      },
      {
        kind: "singleChoice",
        id: "frequenz-1",
        label: "Anker 1 — Frequenz:",
        options: [
          { id: "taeglich", label: "täglich" },
          { id: "momifr", label: "Mo/Mi/Fr" },
          { id: "dido", label: "Di/Do" },
          { id: "andere", label: "andere" },
        ],
      },

      {
        kind: "lines",
        id: "zuordnung-2",
        label: "Anker 2",
        lines: [
          { id: "anker", prefix: "Anker:" },
          { id: "aktivitaet", prefix: "Nach diesem Anker mache ich:" },
          { id: "dauer", prefix: "Dauer:", mid: "Min" },
        ],
      },
      {
        kind: "singleChoice",
        id: "schiene-2",
        label: "Anker 2 — Schiene:",
        options: [
          { id: "reizarm", label: "Reizarm" },
          { id: "standard", label: "Standard" },
          { id: "belastend", label: "Belastend" },
        ],
      },
      {
        kind: "singleChoice",
        id: "frequenz-2",
        label: "Anker 2 — Frequenz:",
        options: [
          { id: "taeglich", label: "täglich" },
          { id: "momifr", label: "Mo/Mi/Fr" },
          { id: "dido", label: "Di/Do" },
          { id: "andere", label: "andere" },
        ],
      },

      {
        kind: "lines",
        id: "zuordnung-3",
        label: "Anker 3",
        lines: [
          { id: "anker", prefix: "Anker:" },
          { id: "aktivitaet", prefix: "Nach diesem Anker mache ich:" },
          { id: "dauer", prefix: "Dauer:", mid: "Min" },
        ],
      },
      {
        kind: "singleChoice",
        id: "schiene-3",
        label: "Anker 3 — Schiene:",
        options: [
          { id: "reizarm", label: "Reizarm" },
          { id: "standard", label: "Standard" },
          { id: "belastend", label: "Belastend" },
        ],
      },
      {
        kind: "singleChoice",
        id: "frequenz-3",
        label: "Anker 3 — Frequenz:",
        options: [
          { id: "taeglich", label: "täglich" },
          { id: "momifr", label: "Mo/Mi/Fr" },
          { id: "dido", label: "Di/Do" },
          { id: "andere", label: "andere" },
        ],
      },

      {
        kind: "lines",
        id: "zuordnung-4",
        label: "Anker 4",
        lines: [
          { id: "anker", prefix: "Anker:" },
          { id: "aktivitaet", prefix: "Nach diesem Anker mache ich:" },
          { id: "dauer", prefix: "Dauer:", mid: "Min" },
        ],
      },
      {
        kind: "singleChoice",
        id: "schiene-4",
        label: "Anker 4 — Schiene:",
        options: [
          { id: "reizarm", label: "Reizarm" },
          { id: "standard", label: "Standard" },
          { id: "belastend", label: "Belastend" },
        ],
      },
      {
        kind: "singleChoice",
        id: "frequenz-4",
        label: "Anker 4 — Frequenz:",
        options: [
          { id: "taeglich", label: "täglich" },
          { id: "momifr", label: "Mo/Mi/Fr" },
          { id: "dido", label: "Di/Do" },
          { id: "andere", label: "andere" },
        ],
      },

      {
        kind: "lines",
        id: "zuordnung-5",
        label: "Anker 5",
        lines: [
          { id: "anker", prefix: "Anker:" },
          { id: "aktivitaet", prefix: "Nach diesem Anker mache ich:" },
          { id: "dauer", prefix: "Dauer:", mid: "Min" },
        ],
      },
      {
        kind: "singleChoice",
        id: "schiene-5",
        label: "Anker 5 — Schiene:",
        options: [
          { id: "reizarm", label: "Reizarm" },
          { id: "standard", label: "Standard" },
          { id: "belastend", label: "Belastend" },
        ],
      },
      {
        kind: "singleChoice",
        id: "frequenz-5",
        label: "Anker 5 — Frequenz:",
        options: [
          { id: "taeglich", label: "täglich" },
          { id: "momifr", label: "Mo/Mi/Fr" },
          { id: "dido", label: "Di/Do" },
          { id: "andere", label: "andere" },
        ],
      },

      { kind: "step", n: 4, title: "Deine Wochen-Übersicht" },
      {
        kind: "text",
        text: "Trage deine Routine in die Wochen-Map ein — je Tageszeit-Zeile, was du an welchem Wochentag tust. Dieser visuelle Plan macht dein System sichtbar.",
      },
      {
        kind: "lines",
        id: "woche-morgen",
        label: "Morgen — Mo · Di · Mi · Do · Fr · Sa · So",
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
      {
        kind: "lines",
        id: "woche-vormittag",
        label: "Vormittag — Mo · Di · Mi · Do · Fr · Sa · So",
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
      {
        kind: "lines",
        id: "woche-mittag",
        label: "Mittag — Mo · Di · Mi · Do · Fr · Sa · So",
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
      {
        kind: "lines",
        id: "woche-nachmittag",
        label: "Nachmittag — Mo · Di · Mi · Do · Fr · Sa · So",
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
      {
        kind: "lines",
        id: "woche-abend",
        label: "Abend — Mo · Di · Mi · Do · Fr · Sa · So",
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
      {
        kind: "lines",
        id: "woche-vor-schlaf",
        label: "Vor Schlaf — Mo · Di · Mi · Do · Fr · Sa · So",
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

      { kind: "step", n: 5, title: "Dein Adaptations-Plan" },
      {
        kind: "text",
        text: "Deine Map muss für alle Tage funktionieren, nicht nur für gute. Definiere, was du in jeder der drei Schienen konkret tust.",
      },
      {
        kind: "note",
        field: {
          id: "adaption-reizarm",
          label: "Was machst du an einem reizarmen Tag (Schmerz 4+/10, Müdigkeit)?",
          rows: 3,
        },
      },
      {
        kind: "note",
        field: {
          id: "adaption-standard",
          label: "Was machst du an einem Standard-Tag (Schmerz 0–3/10)?",
          rows: 3,
        },
      },
      {
        kind: "note",
        field: {
          id: "adaption-belastend",
          label: "Was machst du an einem belastenden Tag (Schmerz 0–1/10, Energie hoch)?",
          rows: 3,
        },
      },

      { kind: "step", n: 6, title: "Dein Ziel für die nächsten 4 Wochen" },
      {
        kind: "text",
        text: "In 4 Wochen reviewst du diese Map. Was ist dein eine Erfolgs-Kriterium?",
      },
      {
        kind: "note",
        field: {
          id: "ziel",
          label: "Mein eine Erfolgs-Kriterium für die nächsten 4 Wochen:",
          rows: 3,
        },
      },
      {
        kind: "hint",
        text: "Beispiele: „Ich habe an mindestens 5 von 7 Tagen die Mobilisation gemacht.“ „Ich habe meine Belastungs-Sequenz mindestens 1× pro Woche durchgezogen.“",
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Was war an der Erstellung dieser Map schwierig? Welche Bedenken habe ich? Wo bin ich überrascht, wie viel oder wie wenig ich mir zumute?",
          rows: 8,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
      { kind: "date", id: "review-termin", label: "Nächster Review-Termin (in 4 Wochen)" },
    ],
  },

  zusammenfassung: [
    "Die Ritual-Map ist dein persönliches Wochen-System — konkret, realistisch, flexibel, selbsttragend, schriftlich.",
    "Vier-Schritte-Konstruktion: Anker identifizieren → Übungen zuordnen → Realitäts-Check → Wochenstruktur.",
    "Drei Schienen für jeden Tag: reizarm (schlechte Tage), Standard (Normalfall), belastend (gute Tage). Auch an schlechten Tagen wird etwas gemacht.",
    "Praxisbeispiele zeigen, wie unterschiedlich Ritual-Maps aussehen können — je nach Lebenssituation und Schmerzniveau.",
    "Nach 4 Wochen Review — die Map ist lebendig, nicht festgemeißelt.",
  ],

  querverweise: [
    {
      label: "Lektion 4.3",
      text: "operationalisiert die drei Schienen.",
    },
    {
      label: "Lektion 4.4",
      text: "lehrt schmerzadaptive Auswahl im Detail.",
    },
    {
      label: "Lektion 4.6",
      text: "liefert das Monatsreview-Werkzeug.",
    },
  ],

  notizfeld: {
    id: "notiz-4.2",
    label: "Notizfeld",
    rows: 12,
  },
};
