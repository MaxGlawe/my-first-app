import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.1 „Bewegungsphilosophie: Warum Bewegung
 * Medizin ist".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.1", Z. 2991–3318). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * 2.1 ist eine Philosophie-/Grundlagen-Lektion ohne dedizierte
 * Übungsfotos — daher kein `image`-Block.
 */
export const WORKBOOK_M2_1: WorkbookData = {
  lessonId: "2.1",
  nr: "2.1",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Bewegungsphilosophie: Warum Bewegung Medizin ist",
  subtitle:
    "Bewegung ist die wirksamste Einzelintervention bei chronischem Kreuzschmerz — und sie wirkt als Information, nicht nur als Sport.",
  meta: {
    audio: "Audio-Dauer: 14–16 Min",
    lese: "Lese-Zeit Workbook: 25–30 Min",
    uebung: "mit Übung 2.1",
  },

  objectives: [
    "die evidenzbasierte Begründung für Bewegung als Erstlinien-Therapie bei chronischem Kreuzschmerz kennen,",
    "den Unterschied zwischen „Bewegung als Sport“ und „Bewegung als Information“ verstehen,",
    "die drei Funktions-Ebenen von Bewegung im chronischen Schmerz unterscheiden können (mechanisch, neurosensorisch, vegetativ),",
    "die häufigsten Bewegungs-Mythen und -Fehler entzaubern können,",
    "die Übung 2.1 abgeschlossen haben, mit der du deine eigene Bewegungsbiographie reflektierst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Einstieg",
      text: "Warum Bewegung?",
    },
    {
      kind: "lead",
      text: "Wenn ich nur einen einzigen Wirkfaktor für chronischen Kreuzschmerz wählen müsste, wäre es Bewegung. Nicht ein bestimmtes Medikament. Nicht eine bestimmte Operation. Nicht eine bestimmte Therapieform. Bewegung.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht meine persönliche Vorliebe. Es ist die Schlussfolgerung aller großen internationalen Leitlinien zur Behandlung chronischer unspezifischer Kreuzschmerzen – inklusive der Nationalen Versorgungsleitlinie (NVL) in Deutschland, der NICE-Guidelines in Großbritannien, der ACP-Guidelines in den USA.",
    },
    {
      kind: "table",
      caption:
        "Konsens der internationalen Leitlinien zur Therapie chronischer Kreuzschmerzen",
      headers: ["Therapie", "Empfehlungsgrad"],
      rows: [
        ["Bewegungstherapie (verschiedene Formen)", "Hoch — Erstlinie"],
        ["Patientenedukation", "Hoch — Erstlinie"],
        ["Kognitive Verhaltenstherapie", "Hoch (bei psychosozialen Belastungen)"],
        ["Multimodale Schmerztherapie", "Hoch (bei schweren Verläufen)"],
        ["Manuelle Therapie", "Moderat (als Ergänzung)"],
        ["Akupunktur", "Moderat"],
        ["NSAR (kurzfristig)", "Moderat"],
        ["Opioide", "Niedrig (nur bei strenger Indikation)"],
        ["Routine-MRT", "Negativ (wird ausdrücklich nicht empfohlen)"],
        ["Operation (bei unspezifischem Kreuzschmerz)", "Niedrig (selten indiziert)"],
      ],
    },
    {
      kind: "paragraph",
      text: "Bewegung steht ganz oben. Aber: welche Bewegung? Hier wird es interessant. Die Leitlinien sind in einem zweiten Punkt erstaunlich einig: Es ist weniger wichtig, welche Form von Bewegung, als dass überhaupt regelmäßig bewegt wird. Yoga, Pilates, Krafttraining, Gehen, Schwimmen, Tanzen – alle wirken bei chronischem Kreuzschmerz. Mit leichten Unterschieden im Detail, aber konsistent positiv.",
    },
    {
      kind: "paragraph",
      text: "Was bedeutet das? Es bedeutet: Du musst nicht die perfekte Übung finden. Du musst eine Bewegungsform finden, die du machst. Was du regelmäßig tust, wird wirken. Was du nicht tust, wirkt nicht – egal wie evidenzbasiert.",
    },

    {
      kind: "heading",
      eyebrow: "Drei Wirk-Ebenen",
      text: "Die drei Wirk-Ebenen von Bewegung",
    },
    {
      kind: "paragraph",
      text: "Warum wirkt Bewegung eigentlich? Drei Ebenen, die zusammenkommen.",
    },
    {
      kind: "bulletList",
      title: "Ebene 1 — Mechanisch-strukturell",
      items: [
        "Bandscheiben-Ernährung durch rhythmische Be- und Entlastung (Diffusion, siehe Lektion 1.1)",
        "Muskel-Aufbau durch wiederholte Belastung",
        "Bindegewebe-Hydration und Gleitfähigkeit der Faszien",
        "Knochen-Stabilität durch Belastungsreize (Osteozyten-Aktivierung)",
        "Beweglichkeit durch wiederholte Bewegung in vollem Bewegungsausmaß",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Effekte sind real, aber sie sind nicht der Haupt-Wirkmechanismus. Sie sind oft schon nach 2–4 Wochen messbar, erklären aber nicht die volle therapeutische Wirkung.",
    },
    {
      kind: "bulletList",
      title: "Ebene 2 — Neurosensorisch (Hauptwirkmechanismus)",
      items: [
        "Re-Kalibrierung des Schmerzsystems durch positive Bewegungserfahrungen. Jede schmerzfreie oder schmerz-tolerable Bewegung ist eine Lerngelegenheit für das sensibilisierte System: „Diese Bewegung ist sicher.“",
        "Aktivierung absteigender Schmerzhemmung durch Bewegung (endogene Opioide, Serotonin, Noradrenalin in absteigenden Bahnen)",
        "Veränderung der zentralen Schmerzverarbeitung über Wochen und Monate (messbar in fMRT-Studien)",
        "Wiederaufbau gestörter Körperwahrnehmung und Bewegungs-Karten im Gehirn",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Wirkebene ist der eigentliche Hauptgrund, warum Bewegung bei chronischem Schmerz so wirksam ist. Sie greift dort an, wo der Schmerz tatsächlich entsteht: im sensibilisierten Nervensystem.",
    },
    {
      kind: "bulletList",
      title: "Ebene 3 — Vegetativ-mental",
      items: [
        "Senkung sympathischer Überaktivität (Stressreduktion)",
        "Verbesserung der Schlafqualität",
        "Antidepressive Wirkung vergleichbar mit milden Antidepressiva (in Studien mehrfach repliziert)",
        "Steigerung der Selbstwirksamkeit durch erlebte Handlungsfähigkeit",
        "Reduktion von Angstzuständen durch wiederholt erlebte Sicherheit in Bewegung",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Ebene erklärt, warum Bewegung auch bei Menschen wirkt, deren strukturelle Befunde sich gar nicht verändern – sie verändern dafür den Zustand ihres Schmerz-Verarbeitungs-Systems erheblich.",
    },
    {
      kind: "vertiefung",
      title: "Die „Sicherheits-Botschaft“ als Hauptmechanismus",
      body: [
        "Eine moderne Sicht auf Bewegung bei chronischem Schmerz: Die wichtigste Funktion ist nicht Muskel-Aufbau oder Beweglichkeits-Steigerung. Es ist die Vermittlung der Sicherheits-Botschaft an das überaktivierte Schmerzsystem.",
        "Wenn du dich bewegst und keine Schmerzeskalation passiert (oder eine kleinere, als befürchtet), lernt dein System: „Diese Bewegung ist sicher. Diese Belastung ist tolerabel. Wir müssen nicht überreagieren.“ Diese Lerngelegenheit muss wiederholt stattfinden – einmal hat keine Wirkung, dreimal pro Woche über drei Monate verändert das System messbar.",
        "Das hat Konsequenzen für die Art der Bewegung: sie sollte oft mit moderater Intensität stattfinden, in einem Bereich, in dem das System die Sicherheits-Botschaft empfangen kann. Maximale Belastung ist hier nicht zielführend – sie kann das System eher in den Schutzmodus zwingen statt in den Lernmodus.",
        "Genau deshalb arbeiten wir in dieser Masterclass mit drei Intensitätsschienen pro Übung. Die richtige Schiene am richtigen Tag ist die, in der dein System Sicherheit lernen kann.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Die Philosophie",
      text: "Bewegung ist Information, nicht nur Sport",
    },
    {
      kind: "paragraph",
      text: "Dieser Satz – Bewegung ist Information, nicht nur Sport – ist eines der drei Kernkonzepte, die in den Outro-Lektionen O.1 zusammengefasst werden. Er meint:",
    },
    {
      kind: "paragraph",
      text: "Im populären Verständnis ist Bewegung primär Sport: Du machst Sport, um Muskeln aufzubauen, Kalorien zu verbrennen, fitter zu werden. Sport ist Leistung, Aufwand, Anstrengung. Wenn du Schmerz hast, machst du wahrscheinlich weniger Sport — denn Sport mit Schmerz scheint schlecht zu sein.",
    },
    {
      kind: "paragraph",
      text: "Im modernen schmerzwissenschaftlichen Verständnis ist Bewegung primär Information: Du bewegst dich, um deinem Schmerzsystem Botschaften zu schicken. Botschaften wie: „Wir bewegen uns. Es ist sicher. Wir tragen Belastung. Wir reagieren auf Anforderungen.“ Diese Botschaften kalibrieren ein sensibilisiertes System neu.",
    },
    {
      kind: "paragraph",
      text: "In diesem Verständnis ist Bewegung mit Schmerz nicht automatisch schlecht – sie kann sogar besonders wichtig sein, vorausgesetzt sie passiert in der richtigen Dosierung (Schiene), so dass das System Sicherheit lernen kann statt Bedrohung.",
    },
    {
      kind: "table",
      caption: "Drei Beispiele für den Unterschied",
      headers: ["Sport-Mentalität", "Information-Mentalität"],
      rows: [
        [
          "„Heute geht es mir schlecht, ich mache keine Übungen.“",
          "„Heute geht es mir schlecht, ich mache die reizarme Schiene meiner Übungen. Mein System soll auch heute die Sicherheits-Botschaft bekommen.“",
        ],
        [
          "„Ich muss meine Übungen perfekt machen.“",
          "„Ich muss meine Übungen regelmäßig machen. Perfekt ist nicht das Ziel – Wiederholung ist das Ziel.“",
        ],
        [
          "„Wenn es weh tut, muss ich aufhören.“",
          "„Wenn es deutlich verstärkt weh tut oder ich Angst bekomme, dosiere ich runter. Leichter Schmerz während sicherer Bewegung ist akzeptabel.“",
        ],
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Verschiebung ist eine der zentralen mentalen Verschiebungen der Masterclass.",
    },

    {
      kind: "heading",
      eyebrow: "Mythen",
      text: "Die häufigsten Bewegungs-Mythen",
    },
    {
      kind: "paragraph",
      text: "Drei populäre Vorstellungen über Bewegung bei Rückenschmerz, die gefährlich falsch sind.",
    },
    {
      kind: "subheading",
      text: "Mythos 1: „Mit Rückenschmerzen soll man sich schonen.“",
    },
    {
      kind: "paragraph",
      text: "Falsch. Schonung verschlechtert chronischen Kreuzschmerz nachweislich – sie schwächt Muskulatur, dehydriert Bandscheiben, verstärkt Sensibilisierung, fördert Vermeidungsverhalten. Die Leitlinien empfehlen explizit: bei akutem und chronischem Kreuzschmerz so weit möglich aktiv bleiben. Bettruhe als Therapie ist veraltet und schadet mehr als sie nützt.",
    },
    {
      kind: "subheading",
      text: "Mythos 2: „Ich darf nichts Schweres heben.“",
    },
    {
      kind: "paragraph",
      text: "Falsch in dieser Allgemeinheit. Dein Rücken ist – außer in akuten Episoden – in der Regel stark genug für Hebebelastungen. Was zählt, ist wie du hebst (Hip Hinge, Hüftgelenks-Mobilisation) und wie viel auf einmal (Dosierung, Pacing). Heben ist nicht grundsätzlich gefährlich – im Gegenteil, regelmäßiges, dosiertes Heben stärkt deinen Rücken erheblich. Die Frage ist nur Technik und Dosis.",
    },
    {
      kind: "subheading",
      text: "Mythos 3: „Es gibt die eine richtige Übung.“",
    },
    {
      kind: "paragraph",
      text: "Falsch. Wie eben gezeigt: alle größeren Bewegungsformen wirken. Die „beste“ Übung ist die, die du regelmäßig machst. Die zweitbeste ist die, die zu deinem Leben passt. Die schlechteste ist die, die du dir vornimmst und nicht machst – egal wie wissenschaftlich.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Der Vermeidungs-Teufelskreis",
      body: [
        "Ein Patient kam vor Jahren mit deutlich eingeschränkter Beweglichkeit und chronischem Kreuzschmerz. Er hatte vor einigen Jahren einen akuten Bandscheibenvorfall durchgemacht – damals operiert, Schmerz weitgehend weg. Aber: Er hatte Angst entwickelt, dass Heben den Rückfall verursachen würde. In den Jahren danach hatte er konsequent vermieden, Lasten zu tragen. Seine Frau übernahm die Einkäufe, er trug nichts schwerer als ein Buch.",
        "Die Folge: massive Muskelschwäche, Bandscheiben-Schrumpfung durch Schonung, Bewegungsangst, die sich verselbstständigte. Der Schmerz, der gar nicht von der alten Bandscheibe kam, wurde immer schlimmer.",
        "Therapeutische Wende: schrittweiser Wiederaufbau des Hebens. Beginnend mit 1-kg-Hanteln, im halben Jahr aufgebaut auf 15-kg-Lasten. Parallel: Hip-Hinge-Technik. Der Schmerz nahm ab, je mehr er hob – nicht umgekehrt. Das war kontra-intuitiv für ihn, aber neurobiologisch genau das Erwartbare.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Leitfaden",
      text: "Ein praktischer Leitfaden: Was, wie oft, wie lange?",
    },
    {
      kind: "paragraph",
      text: "Wenn du nach dieser Lektion praktisch starten willst – hier eine erste Orientierung. Die Details folgen in den nächsten Lektionen.",
    },
    {
      kind: "bulletList",
      title: "Was? Eine Mischung aus vier Kategorien:",
      items: [
        "Mobilisation (Lektion 2.2) – täglich, kurze Sequenzen",
        "Stabilisation (Lektion 2.3) – 2–3 mal pro Woche, gezielt",
        "Belastungstoleranz (Lektion 2.4) – 1–2 mal pro Woche, progressiv",
        "Atmung (Lektion 2.5) – täglich, mehrfach kurze Sequenzen",
      ],
    },
    {
      kind: "paragraph",
      text: "Wie oft? Insgesamt eine Form von Bewegung an mindestens 5 von 7 Tagen der Woche. Lieber kurz und häufig als lang und selten. 10 Minuten täglich schlagen 1 Stunde am Sonntag.",
    },
    {
      kind: "paragraph",
      text: "Wie lange? Die Dauer ist weniger wichtig als die Konsistenz. Studien zeigen positive Effekte ab ca. 150 Minuten moderater Aktivität pro Woche. Das sind etwa 20 Minuten täglich. Mehr ist nicht schlechter, aber 20 Minuten als Minimum sind ein realistisches und wirksames Ziel.",
    },
    {
      kind: "keyTakeaway",
      title: "Welche Schiene?",
      body: [
        "Beginne eine Schiene unter dem, was du dir zutraust. Wenn du denkst „Standard wäre okay“, mach reizarm. Wenn du denkst „belastend könnte gehen“, mach Standard. Das System bekommt seine Sicherheits-Botschaft auch in der kleineren Dosis – und das Risiko einer Überforderung sinkt. Wenn die kleinere Dosis nach 1–2 Wochen problemlos läuft, gehst du eine Schiene hoch.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Meine Bewegungsbiographie",
    timing: "Geschätzte Bearbeitungszeit: 20 Minuten",
    theorieRueckbindung: [
      "Wie du dich heute zu Bewegung verhältst, hat eine Geschichte. Bewegungsbiographie ist die Summe deiner Bewegungs-Erfahrungen über das Leben – schöne, schmerzhafte, prägende. Wer seine Biographie kennt, kann besser einschätzen, welche Bewegungsformen für ihn realistisch und tragbar sind.",
    ],
    anleitung: ["In vier Schritten. Lass dir Zeit – Reflexion, nicht Schnelldurchlauf."],
    blocks: [
      { kind: "step", n: 1, title: "Kindheit und Jugend" },
      {
        kind: "note",
        field: {
          id: "kindheit",
          label: "Welche Bewegungs-Erfahrungen prägten deine Kindheit?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "kindheit-sport",
          label:
            "Welche Sportarten hast du betrieben? Wie war das Erleben – positiv, neutral, negativ?",
          rows: 3,
        },
      },

      { kind: "step", n: 2, title: "Erwachsenenalter vor dem chronischen Schmerz" },
      {
        kind: "note",
        field: {
          id: "vor-schmerz",
          label:
            "Wie hast du dich vor dem chronischen Schmerz bewegt? Was hat dir Spaß gemacht? Was hast du regelmäßig getan?",
          rows: 4,
        },
      },

      { kind: "step", n: 3, title: "Veränderungen durch den Schmerz" },
      {
        kind: "note",
        field: {
          id: "veraenderung",
          label:
            "Wie hat der Schmerz dein Bewegungsverhalten verändert? Was hast du aufgegeben? Was hast du weniger gemacht?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "nicht-noetig",
          label:
            "Welche dieser Aufgaben war eigentlich nicht nötig (im Licht dieser Lektion)?",
          rows: 3,
        },
      },

      { kind: "step", n: 4, title: "Die Bewegungsphilosophie, mit der du neu anfängst" },
      {
        kind: "text",
        text: "Welche Verschiebung in deiner Bewegungsphilosophie nimmst du aus dieser Lektion mit?",
      },
      {
        kind: "lines",
        id: "verschiebung",
        label: "Alte Vorstellung → Neue Vorstellung:",
        lines: [
          { id: "1", prefix: "Alt:", mid: "→ Neu:" },
          { id: "2", prefix: "Alt:", mid: "→ Neu:" },
          { id: "3", prefix: "Alt:", mid: "→ Neu:" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "rueckkehr",
          label:
            "Welche Bewegungsformen, die dir früher Freude gemacht haben, könnten – mit Anpassungen – zurück in dein Leben?",
          rows: 3,
        },
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Welcher Satz aus dieser Lektion bleibt mir hängen? Welche Veränderung möchte ich in den nächsten 4 Wochen versuchen?",
          rows: 5,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
    ],
  },

  zusammenfassung: [
    "Bewegung ist die wirksamste Einzelintervention bei chronischem Kreuzschmerz nach allen internationalen Leitlinien.",
    "Die Form der Bewegung ist sekundär, die Regelmäßigkeit ist primär. Die Übung, die du machst, schlägt die wissenschaftlich beste Übung, die du nicht machst.",
    "Bewegung wirkt auf drei Ebenen: mechanisch-strukturell, neurosensorisch (Hauptwirkung bei chronischem Schmerz), vegetativ-mental.",
    "Bewegung ist Information, nicht nur Sport. Sie schickt deinem Schmerzsystem Sicherheits-Botschaften. Auch in reizarmer Schiene wirksam.",
    "Schonung schadet, dosierte Belastung hilft. Selbst Hebe-Belastungen sind in den allermeisten Fällen nicht gefährlich, sondern – richtig dosiert – stärkend.",
  ],

  querverweise: [
    {
      label: "Lektion 2.2–2.5",
      text: "liefern die konkreten Übungen: Mobilisation, Stabilisation, Belastungstoleranz, Atmung.",
    },
    {
      label: "Lektion 2.6",
      text: "behandelt das wie viel pro Woche: Pacing und Belastungsdosierung.",
    },
    {
      label: "Lektion 2.7",
      text: "behandelt Coping-Strategien für Bewegung bei Schmerz.",
    },
    {
      label: "Lektion 3.4",
      text: "vertieft Alltagsbewegung (NEAT) als Ergänzung zum dedizierten Training.",
    },
    {
      label: "Übungskartendeck",
      text: "alle vier Kategorien (ÜK-M, ÜK-S, ÜK-B, ÜK-A).",
    },
  ],

  notizfeld: {
    id: "notiz-2.1",
    label: "Notizfeld",
    rows: 12,
  },
};
