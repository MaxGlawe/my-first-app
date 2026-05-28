import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 3.3 „Schlaf, Stress, Ernährung:
 * Die drei großen Modulatoren".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 3.3“, Z. 5237–5491). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 3 ist überwiegend Alltag/Theorie — es existieren keine
 * passenden Übungsfotos, daher kein `image`-Block.
 */
export const WORKBOOK_M3_3: WorkbookData = {
  lessonId: "3.3",
  nr: "3.3",
  sectionLabel: "Modul 3 – Prävention",
  title: "Schlaf, Stress, Ernährung: Die drei großen Modulatoren",
  subtitle:
    "Kein Selbstheilungsversprechen, sondern drei Hebel mit starker Evidenz — jeder kann die Schmerzintensität um 10–30 % modulieren.",
  meta: {
    audio: "Audio-Dauer: 22–25 Min",
    lese: "Lese-Zeit Workbook: 40–45 Min",
    uebung: "mit Übung 3.3",
  },

  objectives: [
    "die drei großen Schmerz-Modulatoren Schlaf, Stress, Ernährung einordnen können,",
    "konkrete Schlafhygiene-Werkzeuge kennen,",
    "praktische Stressregulations-Strategien in deinen Alltag integrieren können,",
    "die wichtigsten ernährungsbezogenen Hebel bei chronischem Schmerz kennen,",
    "die Übung 3.3 abgeschlossen haben mit einem Lifestyle-Scan.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Einordnung",
      text: "Warum diese drei?",
    },
    {
      kind: "lead",
      text: "Schlaf, Stress und Ernährung sind die drei Lifestyle-Faktoren mit der stärksten empirischen Evidenz für ihre Wirkung auf chronischen Schmerz.",
    },
    {
      kind: "paragraph",
      text: "Sie greifen direkt in die Familien 2 (Neurosensibilisierung) und 3 (Vegetativ-immunologisch) aus Lektion 1.5 ein.",
    },
    {
      kind: "paragraph",
      text: "Sie sind nicht Selbstheilungsversprechen. Niemand wird durch besseren Schlaf von chronischen Schmerzen befreit. Aber: jeder der drei Faktoren kann die Schmerzintensität um 10–30 % modulieren. Wer alle drei optimiert, summiert das auf.",
    },

    {
      kind: "heading",
      eyebrow: "Teil 1",
      text: "Schlaf",
    },
    {
      kind: "paragraph",
      text: "Schlaf ist möglicherweise der wirksamste Einzelfaktor. Studien (Smith 2010, Sivertsen 2014) zeigen einen klaren bidirektionalen Zusammenhang: Schlechter Schlaf erhöht die Schmerzintensität messbar am Folgetag — und Schmerz verschlechtert den Schlaf. Ein Teufelskreis, der gebrochen werden kann.",
    },
    {
      kind: "bulletList",
      title: "Was ist „guter Schlaf“?",
      items: [
        "7–9 Stunden für die meisten Erwachsenen",
        "Wenige Aufwachphasen",
        "Tiefere Schlafphasen mit erholsamem Anteil",
        "Subjektive Erholung am Morgen",
      ],
    },
    {
      kind: "paragraph",
      text: "Schlafhygiene-Werkzeuge (in Wirksamkeits-Reihenfolge):",
    },
    {
      kind: "table",
      caption: "Top-10 evidenzbasierte Maßnahmen",
      headers: ["#", "Maßnahme", "Wirkung"],
      rows: [
        ["1", "Feste Schlafzeiten (auch Wochenende)", "Stark"],
        ["2", "Schlafzimmer dunkel und kühl (16–18 °C)", "Stark"],
        ["3", "Letzte Mahlzeit 2–3 h vor dem Schlaf", "Stark"],
        ["4", "Kein Bildschirm 60 Min vor dem Schlaf", "Stark"],
        ["5", "Kein Koffein nach 14 Uhr", "Stark"],
        ["6", "Alkohol nicht als Schlafhilfe", "Mittel-Stark"],
        ["7", "Regelmäßige Bewegung tagsüber", "Stark"],
        ["8", "Box Breathing oder Crocodile Breathing vor dem Schlaf", "Mittel"],
        ["9", "Bett nur für Schlaf (keine Bildschirme im Bett)", "Mittel"],
        ["10", "Nickerchen kurz halten (< 30 Min, nicht nach 15 Uhr)", "Mittel"],
      ],
    },
    {
      kind: "vertiefung",
      title: "Schlaf-Maßnahmen in der Schmerzpraxis",
      body: [
        "Studien zur kognitiven Verhaltenstherapie für Insomnie (CBT-I) bei chronischen Schmerzpatienten zeigen Verbesserungen sowohl im Schlaf als auch in der Schmerzintensität. CBT-I ist evidenzbasiert wirksamer als Schlafmedikamente — und ohne deren Nebenwirkungen.",
        "Wenn du erhebliche Schlafprobleme hast, ist eine gezielte Schlaftherapie (ärztlich oder psychologisch begleitet) eine sinnvolle Ergänzung zu dieser Masterclass.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Teil 2",
      text: "Stress",
    },
    {
      kind: "paragraph",
      text: "Stress ist der zweite große Modulator. Chronischer Stress führt zu erhöhtem Sympathikus-Tonus, geringerer Schmerzhemmung, gesteigerter Sensibilisierung, schlechterem Schlaf.",
    },
    {
      kind: "bulletList",
      title: "Was wirkt gegen chronischen Stress? Praktisch alles, was Parasympathikus-Aktivierung fördert:",
      items: [
        "Atemübungen (Lektion 2.5: 360°-Atmung, Box Breathing)",
        "Bewegung (besonders Zone-2-Cardio, niedrig-intensives Ausdauer-Training)",
        "Naturkontakt (auch 20 Min Spaziergang im Grünen wirkt messbar)",
        "Soziale Verbindung (Gespräche, Berührung, gemeinsame Mahlzeiten)",
        "Meditation / Achtsamkeit (10 Min täglich genügen für messbare Effekte)",
        "Kreative Tätigkeiten (Hände, Musik, Gartenarbeit)",
        "Genug Schlaf (siehe oben)",
      ],
    },
    {
      kind: "bulletList",
      title: "Was verstärkt Stress?",
      items: [
        "Bildschirmzeit / News-Konsum jenseits einer informationellen Notwendigkeit",
        "Chronische Konflikte (privat / beruflich) ohne Klärungs-Strategie",
        "Multitasking",
        "Mangel an Pausen",
        "Schlechte Ernährung (Blutzucker-Schwankungen)",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Teil 3",
      text: "Ernährung",
    },
    {
      kind: "paragraph",
      text: "Ernährung wird oft überpromoted („entzündungshemmende Diät heilt Rückenschmerzen“). Realistisch ist: bestimmte Ernährungsmuster reduzieren niedriggradige Entzündungsaktivität, die einer der Schmerzmodulatoren ist. Sie heilen keine Bandscheibe.",
    },
    {
      kind: "paragraph",
      text: "Drei evidenzbasierte Hebel:",
    },
    {
      kind: "subheading",
      text: "Hebel 1: Eiweiß-Versorgung",
    },
    {
      kind: "paragraph",
      text: "Ausreichendes Protein ist Voraussetzung für Muskelaufbau (das du in Modul 2 forderst). Empfehlung: 0.8–1.2 g pro kg Körpergewicht pro Tag für die meisten Erwachsenen, mehr bei aktivem Training. Bei einer 70-kg-Person also etwa 60–80 g Protein.",
    },
    {
      kind: "paragraph",
      text: "Gute Quellen: Magerquark, Joghurt, Hülsenfrüchte, Fisch, Eier, mageres Fleisch, Tofu.",
    },
    {
      kind: "subheading",
      text: "Hebel 2: Omega-3-Fettsäuren",
    },
    {
      kind: "paragraph",
      text: "Reduzieren niedriggradige Entzündung messbar. Empfehlung: 1–3 g EPA+DHA pro Tag.",
    },
    {
      kind: "paragraph",
      text: "Quellen: Fetter Fisch (Lachs, Hering, Makrele) 2× pro Woche, oder hochwertiges Algenöl als vegane Alternative.",
    },
    {
      kind: "subheading",
      text: "Hebel 3: Vitamin D",
    },
    {
      kind: "paragraph",
      text: "Vitamin-D-Mangel ist in Deutschland weit verbreitet (besonders Winter), und steht in Zusammenhang mit chronischen Schmerzen. Lass deinen Spiegel überprüfen. Ziel: 30–60 ng/ml (in der Laboreinheit nmol/l: 75–150).",
    },
    {
      kind: "paragraph",
      text: "Quelle: Sonnenexposition (limitiert in Deutschland), Nahrungsergänzung bei Mangel.",
    },
    {
      kind: "bulletList",
      title: "Was du sonst noch wissen solltest",
      items: [
        "Ausreichend Wasser trinken (1.5–2 L pro Tag)",
        "Magnesium-Versorgung (gut für Muskel und Schlaf)",
        "Vollkornprodukte statt Weißmehl (stabilere Blutzucker-Kurve, weniger niedriggradige Entzündung)",
        "Wenig Alkohol (verschlechtert Schlaf, fördert Entzündung)",
        "Keine extreme Diät (Caloric Restriction zur Gewichtsabnahme nicht prioritär bei chronischem Schmerz, außer bei deutlichem Übergewicht)",
      ],
    },
    {
      kind: "vertiefung",
      title: "Was wirkt NICHT zuverlässig?",
      body: [
        "Viele populäre Empfehlungen zur „Schmerz-Ernährung“ haben dünne Evidenz:",
        "„Glucosamin/Chondroitin“ für Bandscheiben-Regeneration: enttäuschende Studienlage.",
        "„Anti-Bandscheibe-Lebensmittel“: gibt es nicht.",
        "„Fasten heilt Schmerz“: teilweise Effekte bei Übergewicht, kein Wundermittel.",
        "Bestimmte Superfoods: Marketing > Evidenz.",
        "Konzentriere dich auf die drei Hebel oben und gute Grundlagenernährung — das ist 90 % des nutzbaren Effekts.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Lifestyle-Scan",
    timing: "Geschätzte Bearbeitungszeit: 20 Minuten",
    blocks: [
      { kind: "step", n: 1, title: "Dein Schlaf-Profil" },
      {
        kind: "lines",
        id: "schlaf-profil",
        label: "Schlaf:",
        lines: [
          { id: "stunden", prefix: "Wie viele Stunden schläfst du im Schnitt?" },
          { id: "erholt", prefix: "Fühlst du dich morgens erholt? (ja / teilweise / nein):" },
          { id: "aufwachen", prefix: "Wachst du nachts häufig auf? (ja / nein):" },
          { id: "feste-zeiten", prefix: "Hast du feste Schlafzeiten? (ja / nein):" },
          { id: "bildschirm", prefix: "Bildschirm-Konsum vor dem Schlaf:", mid: "Minuten" },
          { id: "mahlzeit", prefix: "Letzte Mahlzeit zu welcher Uhrzeit?", mid: "Uhr" },
          { id: "temperatur", prefix: "Schlafzimmer-Temperatur:", mid: "°C" },
        ],
      },
      {
        kind: "lines",
        id: "schlaf-aenderungen",
        label: "Meine zwei wichtigsten Schlaf-Veränderungen für die nächsten 4 Wochen:",
        lines: [{ id: "1" }, { id: "2" }],
      },

      { kind: "step", n: 2, title: "Dein Stress-Profil" },
      {
        kind: "scale",
        id: "stress-niveau",
        label: "Wie hoch ist dein Stress-Niveau im Durchschnitt?",
        min: 1,
        max: 10,
        minLabel: "sehr niedrig",
        maxLabel: "sehr hoch",
      },
      {
        kind: "lines",
        id: "stress-quellen",
        label: "Welche 2 Hauptquellen erkennst du?",
        lines: [{ id: "1" }, { id: "2" }],
      },
      {
        kind: "lines",
        id: "stress-massnahmen",
        label: "Welche 2 Stress-Regulations-Maßnahmen baust du ein?",
        lines: [{ id: "1" }, { id: "2" }],
      },

      { kind: "step", n: 3, title: "Dein Ernährungs-Profil" },
      {
        kind: "lines",
        id: "ernaehrung-profil",
        label: "Ernährung:",
        lines: [
          { id: "protein", prefix: "Geschätzte Protein-Aufnahme pro Tag: ca.", mid: "g" },
          { id: "fisch", prefix: "Fischverzehr pro Woche:", mid: "×" },
          { id: "vitd", prefix: "Vitamin-D-Spiegel bekannt? (ja, ___ ng/ml / nein):" },
          { id: "wasser", prefix: "Wasseraufnahme pro Tag: ca.", mid: "L" },
          { id: "alkohol", prefix: "Alkoholkonsum pro Woche: ca.", mid: "Einheiten" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "ernaehrung-aenderung",
          label: "Meine eine Ernährungs-Veränderung für die nächsten 4 Wochen:",
          rows: 2,
        },
      },

      { kind: "step", n: 4, title: "Die eine Priorität" },
      {
        kind: "text",
        text: "Wenn du einen der drei Bereiche zuerst angehen würdest — welcher?",
      },
      {
        kind: "singleChoice",
        id: "prioritaet",
        options: [
          { id: "schlaf", label: "Schlaf" },
          { id: "stress", label: "Stress" },
          { id: "ernaehrung", label: "Ernährung" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "prioritaet-warum",
          label: "Warum?",
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
    "Schlaf, Stress, Ernährung sind die drei großen Lifestyle-Modulatoren des chronischen Schmerzes — jeder mit 10–30 % Effektgröße.",
    "Schlaf ist möglicherweise der stärkste Einzelfaktor: feste Zeiten, kühles dunkles Zimmer, kein Bildschirm vor dem Schlaf.",
    "Stress-Regulation über Parasympathikus-Aktivierung: Atmung, Bewegung, Naturkontakt, soziale Verbindung, Meditation.",
    "Drei Ernährungs-Hebel: ausreichend Protein (0.8–1.2 g/kg), Omega-3 (1–3 g EPA+DHA), Vitamin D (30–60 ng/ml).",
    "Nicht überfordern: ein Bereich nach dem anderen angehen. Kumuliert ergibt das messbare Schmerzmodulation.",
  ],

  querverweise: [
    {
      label: "Lektion 2.5",
      text: "Atemübungen als Stress-Werkzeug — die konkreten Techniken zur Parasympathikus-Aktivierung.",
    },
    {
      label: "Modul 4.6",
      text: "Monitoring der Lifestyle-Faktoren — wie du Schlaf, Stress und Ernährung dauerhaft im Blick behältst.",
    },
  ],

  notizfeld: {
    id: "notiz-3.3",
    label: "Notizfeld",
    rows: 10,
  },
};
