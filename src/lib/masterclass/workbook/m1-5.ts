import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 1.5 „Dein Schmerzsystem als Alarmanlage”.
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 1.5”, Z. 2602–2991). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-". Modul 1 ist Theorie — keine Übungsfotos.
 */
export const WORKBOOK_M1_5: WorkbookData = {
  lessonId: "1.5",
  nr: "1.5",
  sectionLabel: "Modul 1 · Verstehen",
  title: "Dein Schmerzsystem als Alarmanlage",
  subtitle:
    "Ein modernes biopsychosoziales Schmerzmodell — und die fünf Faktoren, die mitbestimmen, wie laut deine Alarmanlage spricht.",
  meta: {
    audio: "Audio-Dauer: 20–22 Min",
    lese: "Lese-Zeit Workbook: 40–45 Min",
    uebung: "mit Übung 1.5",
  },

  objectives: [
    "ein modernes biopsychosoziales Schmerzmodell im Kopf haben,",
    "verstehen, warum Schmerz im Gehirn entsteht, nicht im verletzten Gewebe,",
    "die fünf wichtigsten Faktoren kennen, die deine Schmerzschwelle modulieren,",
    "den Übergang von akutem Schutz zu chronischer Fehlfunktion der Alarmanlage nachvollziehen können,",
    "die Übung 1.5 abgeschlossen haben, mit der du deine eigenen fünf Faktoren analysierst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Der falsche Gedanke",
      text: "Schmerz kommt aus dem Rücken",
    },
    {
      kind: "lead",
      text: "Die populäre Vorstellung: Schmerz entsteht dort, wo es weh tut. Wenn dein Rücken schmerzt, ist im Rücken etwas, das schmerzt. Eine kaputte Bandscheibe, ein eingeklemmter Nerv, ein verspannter Muskel. Beseitige die Quelle, dann verschwindet der Schmerz.",
    },
    {
      kind: "paragraph",
      text: "Diese Vorstellung ist nicht falsch im Sinne von „alles falsch” – sie ist unvollständig. Sie beschreibt einen Teil der Wahrheit (es gibt periphere Signal-Generatoren) und übersieht den größeren Teil (Schmerz wird im Gehirn erzeugt).",
    },
    {
      kind: "paragraph",
      text: "Die korrekte moderne Vorstellung lautet: Schmerz ist eine Ausgabe deines Gehirns, basierend auf einer Vielzahl von Eingaben – aus dem peripheren Gewebe, aus dem Nervensystem selbst, aus deinen Gedanken, deinem Stress-Niveau, deinen Erwartungen, deinem Lebenskontext.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht Esoterik. Es ist die Konsensbildung moderner Schmerzforschung der letzten 30 Jahre (Melzack & Casey, Moseley, Apkarian, Wager).",
    },

    {
      kind: "heading",
      eyebrow: "Die Metapher",
      text: "Das Gehirn erzeugt, was geschützt werden soll",
    },
    {
      kind: "paragraph",
      text: "Eine bessere Metapher: Dein Schmerzsystem ist eine Alarmanlage, die dein Gehirn betreibt. Die Sensoren in deinem Körper liefern Daten – Drucksignale, Dehnungssignale, chemische Signale, Temperatur-Signale. Diese Daten werden in mehreren Stufen verarbeitet: in der Peripherie, im Rückenmark, in mehreren Hirnregionen.",
    },
    {
      kind: "paragraph",
      text: "Das Gehirn entscheidet, basierend auf der Gesamtschau der eingehenden Daten plus der gespeicherten Erfahrung plus dem aktuellen Kontext, ob die Lage schutzbedürftig ist. Wenn ja, erzeugt es Schmerz als Schutzmechanismus.",
    },
    {
      kind: "paragraph",
      text: "Schmerz ist also kein Sinneserlebnis im selben Sinne wie Sehen oder Hören. Du empfängst nicht Schmerz von außen – dein Gehirn erzeugt Schmerz als Schutzaufforderung an deinen Körper.",
    },
    {
      kind: "vertiefung",
      title: "Klassische Belege für die „Schmerz ist Gehirn-Erzeugung”-These",
      body: [
        "Phantomschmerz: Menschen mit amputierten Gliedmaßen empfinden Schmerz in dem Körperteil, das gar nicht mehr existiert. Wenn Schmerz nur aus der Peripherie käme – woher kommt dieser Schmerz?",
        "Stress-induzierte Analgesie: Soldaten im Kampf, Sportler im Wettkampf, Mütter in der Geburt erleben schwere Verletzungen oft schmerz-arm – das Gehirn unterdrückt Schmerzsignale aktiv. Wenn Schmerz nur Sensoren-Output wäre, sollte das nicht möglich sein.",
        "Placebo-Analgesie: Patienten erleben echte, messbare Schmerzreduktion durch wirkstofflose Tabletten – nachweisbar über endogene Opioid-Systeme. Schmerz reagiert auf Erwartung.",
        "Hypnotische Analgesie: Unter Hypnose lässt sich Schmerz selektiv reduzieren oder ausschalten – ohne dass periphere Sensoren beeinflusst werden.",
        "Bildgebungs-Studien: fMRT-Untersuchungen zeigen, dass Schmerz mit Aktivierung in mehreren Hirnregionen einhergeht (anteriorer cingulärer Cortex, Insel, somatosensorischer Cortex, präfrontaler Cortex, periaquäduktales Grau). Diese sogenannte „Schmerz-Neuromatrix” ist im Gehirn lokalisiert – nicht im peripheren Gewebe.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Das biopsychosoziale Modell",
      text: "Fünf Faktoren-Familien",
    },
    {
      kind: "paragraph",
      text: "Wenn Schmerz im Gehirn entsteht, basierend auf vielfältigen Eingaben – welche Faktoren beeinflussen, wie laut deine Alarmanlage spricht? Fünf große Faktoren-Familien werden konsistent in der Forschung beschrieben.",
    },
    {
      kind: "subheading",
      text: "1. Strukturell-biomechanisch",
    },
    {
      kind: "paragraph",
      text: "Was an den peripheren Geweben tatsächlich los ist. Bandscheiben, Facettengelenke, Muskeln, Bänder, Nerven – ihre aktuelle mechanische, entzündliche, chemische Situation. Das sind die peripheren Eingaben in das Schmerzsystem.",
    },
    {
      kind: "paragraph",
      text: "Praktische Konsequenz: Übungen zur Mobilisation, Stabilisation, Belastungstoleranz wirken auf dieser Ebene. Sie sind wichtig, aber nicht der einzige Hebel.",
    },
    {
      kind: "subheading",
      text: "2. Neurosensibilisierend",
    },
    {
      kind: "paragraph",
      text: "Wie empfindlich das Schmerzsystem selbst gerade ist. Wie weit die periphere und zentrale Sensibilisierung fortgeschritten ist, wie stark die hemmenden Bahnen funktionieren, wie das Schmerzgedächtnis aufgebaut ist.",
    },
    {
      kind: "paragraph",
      text: "Praktische Konsequenz: Sichere Bewegung, Patientenedukation, dosierte Belastungsexposition wirken auf dieser Ebene. Das ist der Kern dessen, was Modul 2 und 4 leisten.",
    },
    {
      kind: "subheading",
      text: "3. Vegetativ-immunologisch",
    },
    {
      kind: "paragraph",
      text: "Der Zustand des autonomen Nervensystems (sympathisch/parasympathisch), niedrig-gradige Entzündungsaktivität, Hormonstatus, Schlafqualität, allgemeine körperliche Gesundheit. Ein chronisch gestresstes vegetatives System hat eine niedrigere Schmerzschwelle.",
    },
    {
      kind: "paragraph",
      text: "Praktische Konsequenz: Atemübungen, Schlafhygiene, Ernährung, Lebensstil-Faktoren wirken auf dieser Ebene. Modul 3 ist hier zentral.",
    },
    {
      kind: "subheading",
      text: "4. Kognitiv-emotional",
    },
    {
      kind: "paragraph",
      text: "Wie du über deinen Schmerz denkst und fühlst. Ängste, Erwartungen, katastrophisierende oder beruhigende Gedanken, depressive Stimmung, Selbstwirksamkeitsempfinden. Diese Faktoren modulieren die zentrale Schmerzverarbeitung erheblich.",
    },
    {
      kind: "paragraph",
      text: "Praktische Konsequenz: Coping-Strategien, kognitive Defusion, Graded Exposure, mentale Werkzeuge wirken auf dieser Ebene. Lektion 2.7 und Modul 4 vertiefen das.",
    },
    {
      kind: "subheading",
      text: "5. Sozial-kontextuell",
    },
    {
      kind: "paragraph",
      text: "Soziale Beziehungen, Arbeitskontext, finanzielle Situation, kulturelle Konzepte von Schmerz und Krankheit, Versorgungssystem. Diese „Außenwelt” prägt die innere Schmerzverarbeitung mehr, als populär angenommen.",
    },
    {
      kind: "paragraph",
      text: "Praktische Konsequenz: Veränderungen am Arbeitsplatz, soziale Verbindung, Therapeuten-Wahl und -Kommunikation wirken auf dieser Ebene. Im Modul 3.3 (Stress) und 4.6 (Selbst-Monitoring) angesprochen.",
    },
    {
      kind: "vertiefung",
      title: "Wie die Faktoren-Familien zusammenwirken",
      body: [
        "Diese fünf Familien beeinflussen sich gegenseitig. Schlechter Schlaf (Familie 3) erhöht die zentrale Sensibilisierung (Familie 2) und macht negative Schmerzgedanken wahrscheinlicher (Familie 4). Beruflicher Stress (Familie 5) erhöht die vegetative Aktivierung (Familie 3) und senkt die Schmerzschwelle. Eine ausgeprägte Schmerz-Sensibilisierung (Familie 2) macht Vermeidungsverhalten wahrscheinlicher (Familie 4), was zu muskulärem Abbau und Bewegungseinschränkung (Familie 1) führt.",
        "Diese Verschränkung erklärt zwei Phänomene. Erstens: Warum monomodale Therapien (nur Physio, nur Medikament, nur Operation) oft enttäuschend wirken – sie adressieren nur eine Familie. Zweitens: Warum vielschichtige (multimodale) Konzepte deutlich bessere Outcomes erzeugen – sie greifen mehrere Familien gleichzeitig an.",
        "Diese Masterclass ist methodisch multimodal aufgebaut. Modul 2 adressiert primär Familien 1 und 2, Modul 3 die Familien 3 und 5, Modul 4 die Familie 4 plus Integration aller.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Akut versus chronisch",
      text: "Vom Akutschutz zur chronischen Fehlfunktion",
    },
    {
      kind: "paragraph",
      text: "Ein zentraler Punkt zum Verständnis: Die Alarmanlage ist eigentlich eine sinnvolle Schutzeinrichtung. Akuter Schmerz schützt vor weiterer Verletzung, fordert zur Schonung auf, ermöglicht Heilung. Aber – wie jede Alarmanlage – kann sie fehlkalibriert werden.",
    },
    {
      kind: "bulletList",
      title: "Funktionale akute Alarmanlage:",
      items: [
        "Reagiert auf reale Bedrohungen",
        "Aktiviert sich proportional zur Gefahr",
        "Beendet sich, wenn die Gefahr vorüber ist",
        "Lernt aus Erfahrungen („das war doch ungefährlich”)",
      ],
    },
    {
      kind: "bulletList",
      title: "Fehlkalibrierte chronische Alarmanlage:",
      items: [
        "Reagiert auch auf harmlose Reize",
        "Aktiviert sich überproportional zu objektiver Gefahr",
        "Bleibt aktiv, auch wenn ursprünglicher Anlass vorbei ist",
        "Lernt nicht aus Erfahrungen („ich vermeide diese Bewegung weiterhin”)",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Fehlkalibrierung ist keine Schwäche, kein Charakterproblem, kein Versagen. Sie ist eine Lernfehleinheit des Gehirns – ein gut gemeintes System, das überzogen hat und sich nicht selbst korrigieren konnte.",
    },
    {
      kind: "keyTakeaway",
      body: [
        "Die gute Nachricht – die wir aus Lektion 1.3 schon kennen: Die Plastizität, die zur Fehlkalibrierung führte, ist auch die Plastizität, die zur Re-Kalibrierung führen kann. Dein Gehirn kann seine Alarmanlage neu einstellen – durch konsistente Erfahrungen, die zeigen: „Bewegung ist sicher. Belastung ist tolerabel. Der Körper trägt.”",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Für deinen Alltag",
      text: "Die Botschaft",
    },
    {
      kind: "subheading",
      text: "1. Schmerz ist Information, nicht Auftrag.",
    },
    {
      kind: "paragraph",
      text: "Wenn dein Rücken schmerzt, ist das eine Information aus deinem Schmerzsystem. Es ist nicht notwendigerweise ein Auftrag, etwas zu meiden. Die Frage ist nicht „Soll ich aufhören?” – die Frage ist „Was sagt mir das System gerade?” Eine sensibilisierte Alarmanlage produziert oft Information, die nicht zu meiden auffordert, sondern zu sicher weiter machen einlädt.",
    },
    {
      kind: "subheading",
      text: "2. Mehrere Hebel — gleichzeitig.",
    },
    {
      kind: "paragraph",
      text: "Wenn du nur an einer Faktoren-Familie arbeitest (z. B. nur Bewegung), bekommst du oft nur Teilerfolg. Wer Bewegung mit Atmung mit Stressregulation mit Sprach-Pflege mit sozialer Verbindung kombiniert, bekommt überproportional bessere Ergebnisse. Das ist nicht Mehrarbeit – das ist richtige Arbeit.",
    },
    {
      kind: "subheading",
      text: "3. Der Hebel ist Zeit und Wiederholung.",
    },
    {
      kind: "paragraph",
      text: "Re-Kalibrierung des Schmerzsystems passiert nicht in einem Tag. Sie passiert in Wochen und Monaten konsistenter Erfahrungen. Wer einmal pro Woche etwas macht, kalibriert wenig. Wer mehrmals pro Woche etwas macht, kalibriert messbar. Genau deshalb ist die Routine in Modul 4 so wichtig.",
    },
    {
      kind: "subheading",
      text: "4. Selbstwirksamkeit ist eigenständig wirksam.",
    },
    {
      kind: "paragraph",
      text: "Allein das Gefühl, handlungsfähig zu sein gegenüber dem eigenen Schmerz, senkt die Schmerzintensität messbar. Wer eine eigene Strategie hat (auch wenn sie nicht perfekt ist), erlebt seine Symptome milder als wer sich ausgeliefert fühlt. Diese Masterclass baut Selbstwirksamkeit auf – das ist ein eigenständiger Therapie-Effekt.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Was sich nach Lektion 1.5 oft verändert",
      body: [
        "Wenn Patienten in der Sprechstunde dieses Modell verstanden haben, höre ich häufig: „Ich habe meinen Schmerz immer als objektives Signal aus meinem Rücken gelesen. Jetzt verstehe ich, dass mein Gehirn ihn erzeugt – auf Basis vieler Faktoren. Das fühlt sich anders an.”",
        "Das ist keine kognitive Akrobatik. Es ist eine Neueinordnung der eigenen Wahrnehmung. Sie macht den Schmerz nicht weg – aber sie macht ihn weniger bedrohlich und gibt dem Patienten Spielraum, mit ihm zu arbeiten statt gegen ihn zu kämpfen.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Die fünf Faktoren meines Schmerzes",
    timing: "Geschätzte Bearbeitungszeit: 25 Minuten",
    theorieRueckbindung: [
      "Du hast eben gelernt, dass dein Schmerz das Ergebnis eines Zusammenspiels aus fünf Faktoren-Familien ist. Diese Übung lädt dich ein, dein eigenes Schmerzbild aufzuschlüsseln: Welche Familie ist bei dir besonders aktiv? Welche kannst du als nächstes adressieren?",
      "Diese Aufschlüsselung ist therapeutisch wichtig. Sie macht klar, dass dein Schmerz kein Schicksal ist – sondern ein System mit mehreren Stellschrauben. Du wirst danach Modul 2, 3 und 4 mit klarerer Fokussierung durchgehen können.",
    ],
    anleitung: [
      "Bewerte für jede Faktoren-Familie auf einer Skala von 0 bis 10, wie stark sie momentan in deinem Schmerzbild beteiligt ist. 0 = keine Beteiligung, 10 = maximale Beteiligung. Es geht nicht um Genauigkeit, sondern um Selbstwahrnehmung.",
    ],
    blocks: [
      { kind: "step", n: 1, title: "Die fünf Faktoren-Bewertung" },

      {
        kind: "text",
        text: "Familie 1 — Strukturell-biomechanisch. Frage an dich: Wie stark spielen tatsächliche körperliche Faktoren bei meinem Schmerz eine Rolle? (Verkürzte Muskulatur, schwache Stabilisation, ungünstige Bewegungsmuster, dosierte Belastung, etc.)",
      },
      {
        kind: "hint",
        text: "Indizien für hohe Beteiligung: klar reproduzierbare Schmerz-bei-bestimmten-Bewegungen-Auslöser; deutliche muskuläre Asymmetrien oder Schwächen; Hebe-/Lade-Situationen verschlimmern den Schmerz konsistent.",
      },
      {
        kind: "scale",
        id: "familie1",
        label: "Meine Bewertung Familie 1 — Strukturell-biomechanisch",
        min: 0,
        max: 10,
        minLabel: "keine Beteiligung",
        maxLabel: "maximale Beteiligung",
      },

      {
        kind: "text",
        text: "Familie 2 — Neurosensibilisierend. Wie stark ist mein Schmerzsystem sensibilisiert? (Allodynie, Schmerz auf eigentlich harmlose Reize, Schmerzausbreitung, Dauerempfindlichkeit?)",
      },
      {
        kind: "hint",
        text: "Indizien für hohe Beteiligung: Schmerz bei leichter Berührung oder leichten Bewegungen; Schmerz, der lange nach dem Auslöser anhält; ausgebreitete Schmerzregionen; Dauer des Schmerzes > 6 Monate.",
      },
      {
        kind: "scale",
        id: "familie2",
        label: "Meine Bewertung Familie 2 — Neurosensibilisierend",
        min: 0,
        max: 10,
        minLabel: "keine Beteiligung",
        maxLabel: "maximale Beteiligung",
      },

      {
        kind: "text",
        text: "Familie 3 — Vegetativ-immunologisch. Wie sehr beeinflussen Stress, Schlaf, Ernährung, allgemeine körperliche Gesundheit meinen Schmerz?",
      },
      {
        kind: "hint",
        text: "Indizien für hohe Beteiligung: Schmerz korreliert mit Stress-Phasen; schlechter Schlaf macht es messbar schlimmer; Atemmuster flach / dauerhaft hochgespannt; geringe Bewegung im Alltag.",
      },
      {
        kind: "scale",
        id: "familie3",
        label: "Meine Bewertung Familie 3 — Vegetativ-immunologisch",
        min: 0,
        max: 10,
        minLabel: "keine Beteiligung",
        maxLabel: "maximale Beteiligung",
      },

      {
        kind: "text",
        text: "Familie 4 — Kognitiv-emotional. Wie sehr beeinflussen meine Gedanken, Emotionen und Erwartungen meinen Schmerz?",
      },
      {
        kind: "hint",
        text: "Indizien für hohe Beteiligung: häufige katastrophisierende Gedanken („Es wird nie besser”); Angst vor bestimmten Bewegungen; Niedergeschlagenheit, Hoffnungslosigkeit; ich vermeide aktiv viele Aktivitäten aus Sorge.",
      },
      {
        kind: "scale",
        id: "familie4",
        label: "Meine Bewertung Familie 4 — Kognitiv-emotional",
        min: 0,
        max: 10,
        minLabel: "keine Beteiligung",
        maxLabel: "maximale Beteiligung",
      },

      {
        kind: "text",
        text: "Familie 5 — Sozial-kontextuell. Wie sehr beeinflussen mein Arbeits- und Lebenskontext meinen Schmerz?",
      },
      {
        kind: "hint",
        text: "Indizien für hohe Beteiligung: Konflikte am Arbeitsplatz, beruflicher Stress; geringer sozialer Rückhalt; familiäre oder finanzielle Belastung; mein Umfeld redet viel über Schmerz / behandelt mich als „krank”.",
      },
      {
        kind: "scale",
        id: "familie5",
        label: "Meine Bewertung Familie 5 — Sozial-kontextuell",
        min: 0,
        max: 10,
        minLabel: "keine Beteiligung",
        maxLabel: "maximale Beteiligung",
      },

      { kind: "step", n: 2, title: "Mein persönliches Schmerz-Profil" },
      {
        kind: "text",
        text: "Betrachte deine fünf Werte als zusammenhängendes Bild. Welche Familien stechen heraus, welche bleiben niedrig? Verbinde sie gedanklich zu einem Linienprofil – das ist dein persönliches Schmerz-Profil.",
      },

      { kind: "step", n: 3, title: "Die zwei wichtigsten Hebel" },
      {
        kind: "text",
        text: "Welche zwei Familien zeigen bei dir die höchsten Werte? Diese zwei Familien werden in den nächsten Wochen deine prioritären Hebel sein.",
      },
      {
        kind: "lines",
        id: "hebel",
        label: "Meine zwei prioritären Hebel:",
        lines: [
          { id: "1", prefix: "Familie", mid: "— Punktzahl ___/10" },
          { id: "2", prefix: "Familie", mid: "— Punktzahl ___/10" },
        ],
      },

      { kind: "step", n: 4, title: "Konkrete erste Schritte" },
      {
        kind: "text",
        text: "Wo in der Masterclass findest du Werkzeuge für deine zwei Familien? Zur Orientierung: Familie 1 — Modul 2, Lektionen 2.1–2.4 (Bewegung, Mobilisation, Stabilisation, Belastung). Familie 2 — Lektion 1.5 (verstanden), Lektion 2.7 (Coping), Modul 4 (Routine als Sensibilisierungs-Gegenstrategie). Familie 3 — Lektion 2.5 (Atemmechanik), Modul 3.3 (Schlaf, Stress, Ernährung). Familie 4 — Lektion 2.7 (Schmerz-Coping), Modul 4 (Routine als Selbstwirksamkeits-Bauer). Familie 5 — Modul 3.3 (Stress), Modul 4.6 (Monitoring).",
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Welches Profil ergibt sich für mich? Wo war ich überrascht? Welcher Hebel ist mir nach dieser Übung am wichtigsten?",
          rows: 6,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
      {
        kind: "hint",
        text: "Empfehlung: Wiederhole diese Übung nach 12 Wochen. Du wirst sehen, dass sich dein Profil verändert – das ist messbarer Fortschritt.",
      },
    ],
  },

  zusammenfassung: [
    "Schmerz wird im Gehirn erzeugt, basierend auf vielen Eingaben – nicht „aus dem Rücken empfangen”.",
    "Schmerz ist eine Schutzaufforderung, kein objektives Sinneserlebnis. Eine sensibilisierte Alarmanlage produziert zu viel davon.",
    "Fünf Faktoren-Familien modulieren deinen Schmerz: strukturell-biomechanisch, neurosensibilisierend, vegetativ-immunologisch, kognitiv-emotional, sozial-kontextuell.",
    "Eine multimodale Strategie (mehrere Familien gleichzeitig adressieren) ist Standardvorgehen mit besseren Outcomes als monomodale Ansätze.",
    "Selbstwirksamkeit ist eigenständig therapeutisch wirksam. Wer sich handlungsfähig fühlt, hat objektiv weniger Schmerz – nicht nur subjektiv.",
  ],

  querverweise: [
    {
      label: "Lektion 2.1",
      text: "vertieft die Brücke zwischen Schmerzmodell und Bewegungsphilosophie.",
    },
    {
      label: "Lektion 2.5 und Modul 3.3",
      text: "(Atmung sowie Schlaf/Stress/Ernährung) sind die zentralen Werkzeuge für Familie 3.",
    },
    {
      label: "Lektion 2.7",
      text: "ist die zentrale Lektion für Familie 4 (Coping, Defusion, Graded Exposure).",
    },
    {
      label: "Modul 4",
      text: "ist die Integrations-Ebene: alle fünf Familien werden im Recoping-System zusammengeführt.",
    },
    {
      label: "Anhang: Glossar",
      text: "für biopsychosoziales Modell, Neuromatrix, zentrale Sensibilisierung.",
    },
  ],

  notizfeld: {
    id: "notiz-1.5",
    label: "Notizfeld",
    rows: 12,
  },
};
