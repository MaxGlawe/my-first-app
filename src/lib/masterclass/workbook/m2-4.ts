import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.4 „Modernes Rumpftraining Teil 2:
 * Belastungstoleranz".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.4", Z. 3857–4140). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Übungsfotos: ÜK-B1 bis ÜK-B7 haben Kombi-Fotos
 * (uk-b1-combo.png … uk-b7-combo.png).
 */
export const WORKBOOK_M2_4: WorkbookData = {
  lessonId: "2.4",
  nr: "2.4",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Modernes Rumpftraining Teil 2: Belastungstoleranz",
  subtitle:
    "Sieben Übungen, die deine Belastungsfähigkeit Schritt für Schritt erweitern — bis Alltagsbelastungen wieder selbstverständlich werden.",
  meta: {
    audio: "Audio-Dauer: 22–25 Min",
    lese: "Lese-Zeit Workbook: 40–45 Min",
    uebung: "mit Übung 2.4",
  },

  objectives: [
    "den Begriff Belastungstoleranz als Ziel modernen Rückentrainings einordnen,",
    "die sieben zentralen Übungen (ÜK-B1 bis B7) kennen und mit Schienen durchführen können,",
    "die Hip-Hinge-Technik als die wichtigste Hebe-Bewegung beherrschen,",
    "ein realistisches Bild davon haben, warum Lasttragen heilsam ist,",
    "die Übung 2.4 abgeschlossen haben mit einem konkreten Belastungs-Plan für die nächsten 12 Wochen.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Was ist Belastungstoleranz?",
    },
    {
      kind: "lead",
      text: "Belastungstoleranz ist die Kapazität deines Systems, mechanische Belastung zu tolerieren — Heben, Tragen, Drücken, Ziehen, Bewegung unter Gewicht.",
    },
    {
      kind: "paragraph",
      text: "Bei chronischem Kreuzschmerz ist diese Kapazität in der Regel schmaler als nötig. Nicht weil dein Körper objektiv geschwächt wäre — viele Patienten haben eine grundsätzliche Belastbarkeit, die sie unterschätzen. Sondern weil das Schmerzsystem (Sensibilisierung, Vermeidungsverhalten, kognitive Bedrohungseinschätzung) die gefühlte tolerable Belastung weit unter die tatsächlich tolerable Belastung gesetzt hat.",
    },
    {
      kind: "paragraph",
      text: "Das Ziel der Belastungstoleranz-Übungen ist nicht, dich zum Powerlifter zu machen. Das Ziel ist: deine Wachstumszone (Lektion 3.1) systematisch zu erweitern, bis Alltagsbelastungen — Einkäufe heben, Kinder hochheben, Möbel rücken, Gartenarbeit — wieder selbstverständlich werden.",
    },

    {
      kind: "heading",
      eyebrow: "Prinzip",
      text: "Das Prinzip der progressiven Belastung",
    },
    {
      kind: "paragraph",
      text: "Ein Grundgesetz der Sportwissenschaft, das auch hier gilt: Adaptation entsteht durch Belastung, die einen Tick über das aktuelle Maß hinausgeht. Zu wenig: keine Anpassung. Zu viel: Schaden oder Sensibilisierungs-Aktivierung. Genau richtig: Wachstum.",
    },
    {
      kind: "bulletList",
      title: "„Genau richtig“ ist individuell. Bei chronischem Schmerz definieren wir es so:",
      items: [
        "Mechanisch: Belastung, die du in guter Form bewältigen kannst, ohne dass die Bewegungsqualität zerfällt.",
        "Schmerztechnisch: Belastung, bei der Schmerz nicht über das hinaus geht, was du schon vor dem Training hattest — oder maximal 1–2 Punkte auf einer 10er-Skala.",
        "Zeitlich: Belastung, von der du dich innerhalb von 24–48 Stunden vollständig erholst.",
      ],
    },
    {
      kind: "paragraph",
      text: "Wenn diese drei Kriterien erfüllt sind, war die Belastung produktiv. Wenn nicht — Schiene runter.",
    },

    {
      kind: "heading",
      eyebrow: "ÜK-B1 bis ÜK-B7",
      text: "Die sieben zentralen Belastungsübungen",
    },
    {
      kind: "paragraph",
      text: "Die Übungen sind im Übungskartendeck als ÜK-B1 bis ÜK-B7 dokumentiert.",
    },

    {
      kind: "exerciseCard",
      code: "ÜK-B1",
      name: "Hip Hinge (Hüftgelenks-Beugung)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b1-combo.png",
        alt: "ÜK-B1 — Hip Hinge (Hüftgelenks-Beugung)",
      },
      fields: [
        {
          label: "Bedeutung",
          text: "Die wichtigste Übung dieses Moduls. Wenn du nur eine Bewegung aus der ganzen Masterclass im Alltag verankerst, soll es Hip Hinge sein.",
        },
        {
          label: "Position",
          text: "Stand, Füße hüftbreit, Knie minimal gebeugt.",
        },
        {
          label: "Bewegung",
          text: "Becken nach hinten schieben (als würdest du eine Tür mit dem Po schließen). Oberkörper neigt sich nach vorne, Wirbelsäule bleibt neutral (kein Rundrücken). Knie bleiben minimal gebeugt, nicht durchgestreckt, aber auch nicht stark gebeugt. Belastung kommt aus der Hüfte und dem Gesäß, nicht aus der unteren Wirbelsäule. Eine gute Lernhilfe: Stell dich mit dem Rücken etwa 20 cm vor eine Wand. Becken nach hinten bis das Gesäß die Wand berührt, ohne dass die Wirbelsäule sich krümmt.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Ohne Gewicht, Bewegung erkunden, 10 Wiederholungen",
            "Standard: Mit kleinem Gewicht (z.B. 5-kg-Kettlebell vor der Brust), 8–10 Wiederholungen",
            "Belastend: Mit Langhantel oder schweren Kettlebell, 6–8 Wiederholungen",
          ],
        },
        {
          label: "Wirkung",
          text: "Halbiert die LWS-Belastung beim Heben gegenüber Rundrücken-Heben (siehe Lektion 1.1 Tabelle). Die wichtigste Schutz-Bewegung deines Alltags.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-B2",
      name: "Goblet Squat",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b2-combo.png",
        alt: "ÜK-B2 — Goblet Squat",
      },
      fields: [
        {
          label: "Position",
          text: "Stand, Füße etwa schulterbreit, leichte Außenrotation der Füße. Kettlebell oder Kurzhantel vor der Brust gehalten.",
        },
        {
          label: "Bewegung",
          text: "Wie auf einen Stuhl absetzen — Becken nach hinten und unten, Knie folgen den Füßen (kein Einknicken nach innen). Bis Oberschenkel parallel zum Boden oder so tief wie kontrolliert möglich. Aus den Fersen drücken zurück nach oben.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Bodyweight, Teiltiefe (Halbkniebeuge), 8 Wiederholungen",
            "Standard: Mit 5–10 kg, volle Tiefe, 10 Wiederholungen",
            "Belastend: Mit 15+ kg, 8–10 Wiederholungen",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert Bein- und Glutealkraft, lehrt Becken- und Wirbelsäulen-Stabilisation unter Last.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-B3",
      name: "Romanian Deadlift (RDL)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b3-combo.png",
        alt: "ÜK-B3 — Romanian Deadlift (RDL)",
      },
      fields: [
        {
          label: "Position",
          text: "Wie Hip Hinge, mit Gewicht (Kurzhanteln oder Langhantel) vor dem Körper gehalten.",
        },
        {
          label: "Bewegung",
          text: "Vollständige Hip-Hinge-Bewegung, Gewicht wandert dabei nah am Körper nach unten bis zum Schienbein-Mittelteil, dann zurück nach oben. Hauptbewegung kommt aus der Hüfte, Rückenmuskulatur arbeitet isometrisch.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Mit 2× 2 kg Kurzhanteln, 8 Wiederholungen",
            "Standard: Mit 2× 5 kg Kurzhanteln, 10 Wiederholungen",
            "Belastend: Mit Langhantel 20+ kg, 8 Wiederholungen",
          ],
        },
        {
          label: "Wirkung",
          text: "Die wichtigste Übung für posterior chain — die hintere Muskelkette von Wadenbeuger über Gesäß bis zur Rückenmuskulatur. Trainiert genau die Strecker, die im Alltag oft zu wenig arbeiten.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-B4",
      name: "Farmer's Walk (Bauernspaziergang)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b4-combo.png",
        alt: "ÜK-B4 — Farmer's Walk (Bauernspaziergang)",
      },
      fields: [
        {
          label: "Position",
          text: "Stand mit Gewicht in jeder Hand (Kurzhanteln, Kettlebells oder volle Einkaufstüten).",
        },
        {
          label: "Bewegung",
          text: "Aufrecht gehen, 20–40 Meter, mit Belastung. Schultern bleiben gerade, Becken neutral, Rumpf aktiv.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 2× 5 kg, 20 Meter",
            "Standard: 2× 10 kg, 40 Meter",
            "Belastend: 2× 15+ kg, 60 Meter",
          ],
        },
        {
          label: "Wirkung",
          text: "Trainiert globale Stabilisation unter Bewegung, Griffkraft, Atemmuster unter Belastung. Eine der „ehrlichsten“ Übungen — sehr alltagsnah.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-B5",
      name: "Suitcase Carry (einseitiges Tragen)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b5-combo.png",
        alt: "ÜK-B5 — Suitcase Carry (einseitiges Tragen)",
      },
      fields: [
        {
          label: "Position",
          text: "Stand mit Gewicht nur in einer Hand.",
        },
        {
          label: "Bewegung",
          text: "Aufrecht gehen, dabei wird die Gegenseite (Gluteus medius, schräge Bauchmuskeln) aktiv arbeiten, um nicht zur belasteten Seite zu kippen. 20–40 Meter, dann Seite wechseln.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 1× 5 kg, 15 Meter",
            "Standard: 1× 10 kg, 30 Meter",
            "Belastend: 1× 15+ kg, 50 Meter",
          ],
        },
        {
          label: "Wirkung",
          text: "Spezifisch wirksam bei einseitigen Schmerzen und Gluteus-medius-Schwäche. Lehrt asymmetrische Stabilisation.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-B6",
      name: "Step-up belastet",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b6-combo.png",
        alt: "ÜK-B6 — Step-up belastet",
      },
      fields: [
        {
          label: "Position",
          text: "Vor einer stabilen 30–40 cm Stufe. Gewichte in den Händen oder als Kreuzkettlebell.",
        },
        {
          label: "Bewegung",
          text: "Mit einem Bein auf die Stufe steigen, dabei aus dem Standbein drücken (nicht hochziehen). Wieder absteigen kontrolliert. 8–10 pro Bein.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Niedrige Stufe, ohne Gewicht, 6 pro Bein",
            "Standard: Normale Stufe (30 cm), mit 2× 5 kg, 10 pro Bein",
            "Belastend: Höhere Stufe (40 cm), mit 2× 10+ kg, 10 pro Bein",
          ],
        },
        {
          label: "Wirkung",
          text: "Einseitige Beinkraft, funktionelle Hüftstabilisation, simuliert Treppensteigen mit Last.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-B7",
      name: "Floor-to-Stand",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-b7-combo.png",
        alt: "ÜK-B7 — Floor-to-Stand",
      },
      fields: [
        {
          label: "Position",
          text: "Im Liegen am Boden, mit kleinem Gewicht in einer Hand (Kettlebell oder Wasserflasche).",
        },
        {
          label: "Bewegung",
          text: "Aus dem Liegen aufstehen in einer kontrollierten Bewegung (z.B. Turkish-Getup-Variante oder einfaches Aufstehen), dann wieder zurück zum Boden. 3–5 Wiederholungen pro Seite.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Ohne Gewicht, einfache Aufsteh-Variante, 3 pro Seite",
            "Standard: Mit kleinem Gewicht (3–5 kg), 5 pro Seite",
            "Belastend: Full Turkish Getup mit Kettlebell, 3 pro Seite",
          ],
        },
        {
          label: "Wirkung",
          text: "Übersetzt alles aus den anderen Belastungsübungen in eine real-life-Bewegungsfolge: vom Boden aufstehen. Sehr alltagsnah (Putzen, Spielen mit Kindern, gestürzte Sachen aufheben).",
        },
      ],
    },

    {
      kind: "heading",
      eyebrow: "Warum es heilsam ist",
      text: "Warum Lasttragen heilsam ist",
    },
    {
      kind: "paragraph",
      text: "Eine populäre Vorstellung: Heben schadet dem Rücken. Eine sportwissenschaftliche und schmerzwissenschaftliche Sicht: dosiertes Heben heilt den Rücken — gerade bei chronischem Schmerz. Drei Gründe:",
    },
    {
      kind: "bulletList",
      items: [
        "Gewebliche Anpassung: Bandscheiben, Knochen, Sehnen, Muskeln adaptieren auf Belastung. Ohne Reiz keine Adaptation. Mit dosiertem Reiz wird das Gewebe stärker.",
        "Neurologische Re-Kalibrierung: Wer regelmäßig hebt und keine Schmerzeskalation erlebt, sendet seinem Schmerzsystem die Botschaft „Heben ist sicher“. Diese Botschaft, in Hundertfacher Wiederholung, kalibriert die Alarmanlage neu.",
        "Selbstwirksamkeits-Aufbau: Wer 20 kg sicher heben kann, hat ein anderes Selbstbild als wer es nicht traut. Dieses Selbstbild verändert messbar das Schmerzerleben.",
      ],
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Der 70-jährige mit Langhantel",
      body: [
        "Ein Patient, 70 Jahre, mit 30-jähriger Geschichte chronischer Kreuzschmerzen, lernte Romanian Deadlift bei mir. Nach 6 Monaten zog er regelmäßig 60 kg. Sein Schmerz war auf etwa 30% des Ausgangswertes gesunken. Er sagte: „Ich habe mein ganzes Leben Sachen nicht gehoben, aus Sorge. Jetzt hebe ich mehr als meine Söhne.“",
        "Das ist nicht die Regel — aber es zeigt das Potenzial. Sein Rücken war nicht zu jung, nicht zu unbeschädigt für Belastung. Was fehlte, war die methodische Heranführung und die Sicherheits-Erfahrung.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Dosierung",
      text: "Dosierungs-Leitlinien Belastungstoleranz",
    },
    {
      kind: "paragraph",
      text: "Wie oft? 1–2 mal pro Woche reicht. Mehr als 3 mal pro Woche kann bei chronischem Schmerz zu Reizung führen.",
    },
    {
      kind: "paragraph",
      text: "Wie viele Übungen pro Einheit? 2–4 Übungen sind genug für eine Einheit, je nach Erfahrung. Reizarme Einheit: 2 Übungen. Standard: 3. Belastende Einheit: 4.",
    },
    {
      kind: "paragraph",
      text: "Wie viele Sätze? 2–3 Sätze pro Übung sind ein gutes Maß für die meisten.",
    },
    {
      kind: "keyTakeaway",
      title: "Wann starten?",
      body: [
        "Nicht in den ersten 4 Wochen der Masterclass-Anwendung. Erst nach 4–6 Wochen Mobilisation und Stabilisation kommt Belastungstoleranz dazu.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Belastungs-Plan",
    timing: "Geschätzte Bearbeitungszeit: 20 Minuten",
    theorieRueckbindung: [
      "Belastungstoleranz baut sich progressiv über Monate auf. Diese Übung plant deinen Aufbau-Weg.",
    ],
    blocks: [
      { kind: "step", n: 1, title: "Ist-Aufnahme" },
      {
        kind: "text",
        text: "Welche Belastungen schaffst du heute schmerzfrei oder schmerztolerabel?",
      },
      {
        kind: "ratingMatrix",
        id: "ist-aufnahme",
        label: "Aktuell schmerzfrei machbar?",
        columns: ["ja", "ungern", "nein"],
        rows: [
          { id: "tuete", label: "5 kg Einkaufstüte 50 m tragen" },
          { id: "heben10", label: "10 kg vom Boden in Hüfthöhe heben" },
          { id: "heben15", label: "15 kg vom Boden auf einen Tisch heben" },
          { id: "wasserkasten", label: "20 kg gefüllter Wasserkasten heben" },
          { id: "aufstehen", label: "Aus dem Liegen aufstehen ohne Hilfe" },
          { id: "kind", label: "Kind/Enkel hochheben (z.B. 15 kg)" },
          { id: "moebel", label: "Möbel rücken" },
        ],
      },

      { kind: "step", n: 2, title: "Dein 12-Wochen-Aufbau" },
      {
        kind: "text",
        text: "Wochen 1–4: Fokus auf Mobilisation + Stabilisation (Lektionen 2.2 + 2.3). Noch keine Belastungstoleranz.",
      },
      {
        kind: "text",
        text: "Wochen 5–6: Hip Hinge ohne Gewicht (Übungserkundung), 2 mal pro Woche.",
      },
      {
        kind: "text",
        text: "Wochen 7–8: Hip Hinge mit kleinem Gewicht (3–5 kg) + Goblet Squat ohne Gewicht, 2 mal pro Woche.",
      },
      {
        kind: "text",
        text: "Wochen 9–10: Hip Hinge mit 5–10 kg + Goblet Squat mit 5 kg + Farmer's Walk mit 2× 5 kg, 1–2 mal pro Woche.",
      },
      {
        kind: "text",
        text: "Wochen 11–12: Vollständiges Set aus 3–4 Übungen, mit progressiver Belastung.",
      },

      { kind: "step", n: 3, title: "Drei Übungen für deinen Start ab Woche 5" },
      {
        kind: "lines",
        id: "start",
        label: "Meine drei Start-Übungen (mit Schiene):",
        lines: [
          { id: "1", prefix: "ÜK-B", mid: "· Schiene:" },
          { id: "2", prefix: "ÜK-B", mid: "· Schiene:" },
          { id: "3", prefix: "ÜK-B", mid: "· Schiene:" },
        ],
      },

      { kind: "step", n: 4, title: "Dein 12-Monats-Ziel" },
      {
        kind: "note",
        field: {
          id: "ziel",
          label:
            "Welche Belastung möchtest du in 12 Monaten selbstverständlich meistern?",
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
    "Belastungstoleranz ist die Kapazität deines Systems, mechanische Belastung zu tolerieren — bei chronischem Schmerz oft schmaler als nötig.",
    "Sieben zentrale Übungen (ÜK-B1 bis B7), allen voran der Hip Hinge als wichtigste Schutz-Bewegung des Alltags.",
    "Dosiertes Heben heilt, es schadet nicht — vorausgesetzt es passiert in der passenden Schiene und mit guter Technik.",
    "Frequenz: 1–2 mal pro Woche, beginnend nach 4–6 Wochen Mobilisation/Stabilisation als Fundament.",
    "Progression über Schienen, Wiederholungen, Variationen, Frequenz — individuelles Tempo, konsequent.",
  ],

  querverweise: [
    {
      label: "Lektion 1.1",
      text: "Tabelle Lastfaktoren — die biomechanische Begründung des Hip Hinge.",
    },
    {
      label: "Lektion 2.6",
      text: "behandelt Pacing und Belastungsdosierung über die Woche.",
    },
    {
      label: "Modul 4.4",
      text: "vertieft die Mikro-Dosis-Strategie für regelmäßige Belastung.",
    },
    {
      label: "Übungskartendeck",
      text: "ÜK-B-Serie mit Bildern, Schienen-Detail und Fehlerhinweisen.",
    },
  ],

  notizfeld: {
    id: "notiz-2.4",
    label: "Notizfeld",
    rows: 10,
  },
};
