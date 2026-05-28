import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.3 „Modernes Rumpftraining Teil 1:
 * Stabilisation".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.3", Z. 3601–3857). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Übungsfotos: ÜK-S2 bis ÜK-S6 haben Kombi-Fotos (uk-s2-combo.png …
 * uk-s6-combo.png). Für ÜK-S1 existiert kein Kombi-Foto — daher kein
 * `image`-Block in dieser Karte.
 */
export const WORKBOOK_M2_3: WorkbookData = {
  lessonId: "2.3",
  nr: "2.3",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Modernes Rumpftraining Teil 1: Stabilisation",
  subtitle:
    "Sechs Übungen, die das tiefe Haltesystem deines Rückens wieder verlässlich arbeiten lassen — Präzision statt Maximalkraft.",
  meta: {
    audio: "Audio-Dauer: 20–22 Min",
    lese: "Lese-Zeit Workbook: 35–40 Min",
    uebung: "mit Übung 2.3",
  },

  objectives: [
    "den Unterschied zwischen Stabilisation und Krafttraining verstehen,",
    "die sechs zentralen Stabilisationsübungen kennen und durchführen können,",
    "die deep-core-Synergie in Aktion erleben (Multifidus + TVA + Beckenboden + Diaphragma, siehe Lektion 1.2),",
    "die richtige Progression zwischen den Schienen einschätzen können,",
    "die Übung 2.3 abgeschlossen haben, mit der du deinen Stabilisations-Einstieg planst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Klärung",
      text: "Stabilisation ≠ Krafttraining",
    },
    {
      kind: "lead",
      text: "Eine wichtige begriffliche Klärung gleich am Anfang: Stabilisation ist nicht dasselbe wie Krafttraining.",
    },
    {
      kind: "paragraph",
      text: "Krafttraining zielt auf maximale Kraftentwicklung großer Muskelgruppen ab. Hohe Belastung, wenige Wiederholungen, klare Bewegungsbahnen. Es geht um Leistungsspitzen.",
    },
    {
      kind: "paragraph",
      text: "Stabilisation zielt auf die koordinierte Aktivierung der tiefen Haltemuskulatur ab. Niedrigere absolute Belastung, fokussiert auf Präzision und Halten in präzisen Positionen. Es geht um Präzisions-Kontrolle.",
    },
    {
      kind: "paragraph",
      text: "Beides ist wichtig bei chronischem Rückenschmerz, aber Stabilisation kommt zuerst. Wer einen sensibilisierten Rücken hat, profitiert primär davon, dass das tiefe Haltesystem (siehe Lektion 1.2) wieder verlässlich arbeitet. Krafttraining im engeren Sinne kommt in Lektion 2.4 (Belastungstoleranz).",
    },

    {
      kind: "heading",
      eyebrow: "ÜK-S1 bis ÜK-S6",
      text: "Die sechs zentralen Stabilisationsübungen",
    },
    {
      kind: "paragraph",
      text: "Die Übungen sind im Übungskartendeck als ÜK-S1 bis ÜK-S6 dokumentiert.",
    },

    {
      kind: "exerciseCard",
      code: "ÜK-S1",
      name: "Aktivierung TVA + Beckenboden",
      fields: [
        {
          label: "Position",
          text: "Rückenlage, Beine angewinkelt aufgestellt, Hände auf dem Bauch (zur Wahrnehmung).",
        },
        {
          label: "Bewegung",
          text: "Sanftes Anspannen der Beckenboden-Muskulatur (Stell dir vor, du hältst leichten Urindrang zurück). Gleichzeitig leichtes Einziehen des Bauchnabels nach innen-oben (Transversus). Atmung läuft weiter – nicht festhalten. 5 Sekunden halten, 5 Sekunden lösen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 5 Wiederholungen, leichte Aktivierung",
            "Standard: 8–10 Wiederholungen, deutliche aber nicht maximale Aktivierung",
            "Belastend: 10 Wiederholungen mit verlängerter Haltezeit (10 Sekunden)",
          ],
        },
        {
          label: "Wirkung",
          text: "Reaktiviert die fundamentale deep-core-Synergie. Diese Übung ist die Grundlage aller weiteren Stabilisationsübungen.",
        },
        {
          label: "Häufige Fehler",
          text: "Atem anhalten, Schultern hochziehen, zu starke Anspannung.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-S2",
      name: "Dead Bug",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-s2-combo.png",
        alt: "ÜK-S2 — Dead Bug",
      },
      fields: [
        {
          label: "Position",
          text: "Rückenlage. Beide Beine in 90°-Hüftbeugung (Knie über Hüfte), beide Arme senkrecht nach oben gestreckt.",
        },
        {
          label: "Bewegung",
          text: "Becken-Boden und TVA aktivieren (wie in S1). Dann gleichzeitig ein Bein langsam senken (Ferse Richtung Boden, ohne ihn zu berühren) und den gegenüberliegenden Arm nach hinten ablegen. Zurück in die Ausgangsposition. Dann die andere Diagonale.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Nur ein Bein, kleine Amplitude, 6 Wiederholungen pro Seite",
            "Standard: Volle Diagonale, 8–10 pro Seite",
            "Belastend: 12 pro Seite, mit Pausen in der Endposition",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert die deep-core-Synergie in dynamischer Kontrolle. Eine der wirksamsten Stabilisationsübungen für chronischen Rückenschmerz.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-S3",
      name: "Bird Dog (Vogel-Hund)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-s3-combo.png",
        alt: "ÜK-S3 — Bird Dog (Vogel-Hund)",
      },
      fields: [
        {
          label: "Position",
          text: "Vierfüßlerstand, Wirbelsäule neutral.",
        },
        {
          label: "Bewegung",
          text: "Einen Arm nach vorne strecken und gleichzeitig das gegenüberliegende Bein nach hinten ausstrecken. Rumpfposition stabil halten – kein Wegkippen des Beckens, kein Hohlkreuz. 3–5 Sekunden halten, dann zurück.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Nur Arm oder nur Bein, einzeln",
            "Standard: Volle Diagonale, 8 pro Seite",
            "Belastend: 10 mit längerer Haltezeit, oder mit kleinem Gewicht im Arm",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert globale Rumpfstabilität in horizontaler Position. Aktiviert mehrere Muskelketten gleichzeitig.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-S4",
      name: "Side Plank (Seitstütz)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-s4-combo.png",
        alt: "ÜK-S4 — Side Plank (Seitstütz)",
      },
      fields: [
        {
          label: "Position",
          text: "Seitlage. Unterarm und seitliche Hüfte am Boden. Beine gestreckt.",
        },
        {
          label: "Bewegung",
          text: "Becken aktiv hochheben, sodass der Körper eine gerade Linie bildet von Schulter bis Knöchel. 15–30 Sekunden halten, dann andere Seite.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Von Knien aus statt Füßen, 15 Sekunden",
            "Standard: Volle Form, 30 Sekunden",
            "Belastend: 45–60 Sekunden, oder mit Bein-Anheben",
          ],
        },
        {
          label: "Wirkung",
          text: "Stärkt die seitliche Rumpfmuskulatur (Obliquus, Gluteus medius). Wichtig für asymmetrische Rückenschmerzen.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-S5",
      name: "Step-up auf einer Stufe",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-s5-combo.png",
        alt: "ÜK-S5 — Step-up auf einer Stufe",
      },
      fields: [
        {
          label: "Position",
          text: "Vor einer stabilen Stufe (ca. 20–30 cm Höhe) stehen.",
        },
        {
          label: "Bewegung",
          text: "Mit einem Bein auf die Stufe steigen, dabei aktiv das Standbein drücken (nicht mit dem oberen Bein hochziehen). Becken bleibt waagrecht. Wieder absteigen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Niedrige Stufe (10 cm), 6 Wiederholungen pro Bein",
            "Standard: Normale Stufe (20–25 cm), 10 pro Bein",
            "Belastend: Höhere Stufe oder mit Gewicht in den Händen, 12 pro Bein",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert einseitige Beckenstabilisation (Gluteus medius), funktionelle Beinkraft, Hüftstabilisation.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-S6",
      name: "Plank (Unterarmstütz)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-s6-combo.png",
        alt: "ÜK-S6 — Plank (Unterarmstütz)",
      },
      fields: [
        {
          label: "Position",
          text: "Bauchlage. Auf Unterarme und Fußspitzen stützen.",
        },
        {
          label: "Bewegung",
          text: "Körper als gerade Linie halten. Bauch aktiv anspannen, Becken weder hängen lassen noch zu hoch heben. 15–30 Sekunden halten.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Von Knien aus, 15 Sekunden",
            "Standard: Volle Form, 30 Sekunden",
            "Belastend: 60 Sekunden, oder mit alternierendem Beinheben",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert globale Rumpfstabilität in geschlossener Position. Klassiker, aber nicht der wichtigste — die anderen Stabilisationsübungen sind oft wirksamer.",
        },
      ],
    },

    {
      kind: "heading",
      eyebrow: "Progression",
      text: "Die Progression: Wie steigerst du?",
    },
    {
      kind: "paragraph",
      text: "Stabilisationsübungen sind progressiv – das heißt, du wirst über Wochen besser. Wie steigerst du systematisch?",
    },
    {
      kind: "numberedList",
      title: "Fünf Dimensionen der Steigerung",
      items: [
        "Durch Schienen-Wechsel: Von reizarm zu Standard zu belastend, jeweils nach 2–4 Wochen sicherer Praxis.",
        "Durch Haltezeit: Von 5 Sekunden zu 10 zu 20 zu 30.",
        "Durch Wiederholungszahl: Von 5 zu 8 zu 10 zu 12 pro Übung.",
        "Durch Variationen: Bird Dog mit geschlossenen Augen erhöht die Anforderung an die Tiefenwahrnehmung. Dead Bug mit kleinem Gewicht in der Hand.",
        "Durch Frequenz: Von 2 mal pro Woche zu 3 zu 4.",
      ],
    },
    {
      kind: "paragraph",
      text: "Die Progression ist individuell. Manche Patienten brauchen 6 Monate, um von reizarm zu Standard zu kommen. Andere brauchen 6 Wochen. Beides ist okay. Was zählt: konsequente Praxis und aufmerksame Steigerung.",
    },
    {
      kind: "vertiefung",
      title: "Die „stille“ Phase der Stabilisation",
      body: [
        "In den ersten Wochen Stabilisationstraining merkst du oft keine großen Veränderungen am Schmerz. Das ist normal und kein Grund, aufzuhören.",
        "Was in dieser Phase passiert, ist neurologische Aktivierung: Dein Gehirn lernt wieder, die tiefe Stabilisationsmuskulatur zu aktivieren. Diese Re-Verbindung passiert messbar in EMG-Studien, aber sie ist subjektiv leise.",
        "Erst nach 6–12 Wochen kommt der „sichtbare“ Effekt: Du merkst, dass alltägliche Belastungen weniger Rückenreaktion auslösen. Die Bewegungen, die früher einschossen, lassen dich kalt. Das ist die Auszahlung der stillen Aufbauphase.",
        "Botschaft: Gib dem System Zeit. Stabilisation ist eine Mehrwochen-Mehrmonats-Investition.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Stabilisations-Einstieg",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    theorieRueckbindung: [
      "Stabilisation braucht Konsistenz und Geduld. Diese Übung hilft dir, einen realistischen Einstieg zu planen — eine Häufigkeit, eine Auswahl, eine Schiene, ein Ankermechanismus.",
    ],
    blocks: [
      { kind: "step", n: 1, title: "Übungsauswahl" },
      {
        kind: "text",
        text: "Wähle drei der sechs Übungen für deinen Einstieg. Bevorzuge: ÜK-S1 (TVA + Beckenboden) – die Grundlage, immer dabei; eine dynamische Übung – ÜK-S2 (Dead Bug) oder ÜK-S3 (Bird Dog); eine asymmetrische / funktionale Übung – ÜK-S4 (Side Plank) oder ÜK-S5 (Step-up).",
      },
      {
        kind: "lines",
        id: "auswahl",
        label: "Meine drei Stabilisationsübungen (mit Schiene):",
        lines: [
          { id: "1", prefix: "ÜK-S", mid: "· Schiene:" },
          { id: "2", prefix: "ÜK-S", mid: "· Schiene:" },
          { id: "3", prefix: "ÜK-S", mid: "· Schiene:" },
        ],
      },

      { kind: "step", n: 2, title: "Frequenz" },
      {
        kind: "text",
        text: "Wie oft pro Woche wirst du diese Stabilisationssequenz machen?",
      },
      {
        kind: "singleChoice",
        id: "frequenz",
        options: [
          {
            id: "2x",
            label: "2 mal pro Woche",
            description: "Empfehlung für sehr unsichere Einsteiger",
          },
          {
            id: "3x",
            label: "3 mal pro Woche",
            description: "Empfehlung für die meisten",
          },
          {
            id: "4x",
            label: "4 mal pro Woche",
            description: "Empfehlung für motivierte Einsteiger mit Erfahrung",
          },
        ],
      },

      { kind: "step", n: 3, title: "Wann" },
      {
        kind: "text",
        text: "An welchen Tagen und Zeiten? Halte je Einheit Tag, Zeit und geschätzte Dauer fest.",
      },
      {
        kind: "lines",
        id: "wann",
        lines: [
          { id: "1", prefix: "Tag:", mid: "· Zeit / Dauer:" },
          { id: "2", prefix: "Tag:", mid: "· Zeit / Dauer:" },
          { id: "3", prefix: "Tag:", mid: "· Zeit / Dauer:" },
        ],
      },

      { kind: "step", n: 4, title: "Progression" },
      {
        kind: "text",
        text: "Wann wirst du steigern? Setze dir konkrete Meilensteine.",
      },
      {
        kind: "lines",
        id: "progression",
        lines: [
          { id: "1", prefix: "Nach 4 Wochen:" },
          { id: "2", prefix: "Nach 8 Wochen:" },
          { id: "3", prefix: "Nach 12 Wochen:" },
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
    "Stabilisation ≠ Krafttraining. Stabilisation zielt auf Präzisions-Kontrolle der tiefen Haltemuskulatur, nicht auf Maximal-Kraft.",
    "Sechs zentrale Übungen (ÜK-S1 bis S6) decken den wichtigsten Bereich ab. Drei davon reichen für einen wirksamen Einstieg.",
    "Progression in fünf Dimensionen: Schiene, Haltezeit, Wiederholungen, Variationen, Frequenz.",
    "Die „stille Phase“ der ersten 6–12 Wochen ist normal — kein subjektiver Effekt, aber messbare neurologische Aktivierung.",
    "2–3 mal pro Woche ist eine wirksame Frequenz für die meisten Einsteiger.",
  ],

  querverweise: [
    {
      label: "Lektion 1.2",
      text: "liefert die anatomisch-physiologische Grundlage (deep-core-Synergie).",
    },
    {
      label: "Lektion 2.4",
      text: "baut auf Stabilisation auf mit Belastungstoleranz-Übungen.",
    },
    {
      label: "Lektion 2.5",
      text: "vertieft die Atmungskomponente von Stabilisation.",
    },
    {
      label: "Übungskartendeck",
      text: "ÜK-S1 bis ÜK-S6 mit Bildern und detailliertem Schienen-Aufbau.",
    },
  ],

  notizfeld: {
    id: "notiz-2.3",
    label: "Notizfeld",
    rows: 10,
  },
};
