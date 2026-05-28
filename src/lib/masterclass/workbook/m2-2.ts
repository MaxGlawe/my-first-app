import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 2.2 „Schmerzmodulierende Mobilisation".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 2.2", Z. 3318–3600). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-".
 */
export const WORKBOOK_2_2: WorkbookData = {
  lessonId: "2.2",
  nr: "2.2",
  sectionLabel: "Modul 2 · Kurativ handeln",
  title: "Schmerzmodulierende Mobilisation",
  subtitle:
    "Sieben sanfte Bewegungen, die deine Beweglichkeit erhalten — die alltagstauglichste Eingangs-Kategorie aktiver Selbstanwendung.",
  meta: {
    audio: "Audio-Dauer: 24–28 Min",
    lese: "Lese-Zeit Workbook: 40–50 Min",
    uebung: "mit Übung 2.2",
  },

  objectives: [
    "die sieben zentralen Mobilisationsübungen dieser Masterclass kennen und durchführen können,",
    "den Unterschied zwischen Mobilisation, Dehnung und Stabilisation verstehen,",
    "die richtige Dosierung von Mobilisation einschätzen können,",
    "die Mobilisationsübungen in deinen Alltag integrieren können,",
    "die Übung 2.2 abgeschlossen haben, mit der du dein eigenes Mobilisations-Set zusammenstellst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Was ist Mobilisation — und was nicht?",
    },
    {
      kind: "lead",
      text: "Mobilisation ist die rhythmische, sanfte, schmerzfreie Bewegung von Gelenken durch ihren physiologischen Bewegungsbereich.",
    },
    {
      kind: "paragraph",
      text: "Sie ist nicht dasselbe wie Dehnung (statisches Halten an der Bewegungsgrenze) und nicht dasselbe wie Stabilisation (gezielte Aktivierung haltender Muskulatur).",
    },
    {
      kind: "bulletList",
      title: "Mobilisation ist die alltagstauglichste der drei Kategorien, weil sie:",
      items: [
        "sanft ist und in Phasen mit Schmerz weiter machbar bleibt,",
        "die „Sicherheits-Botschaft“ aus Lektion 2.1 sehr direkt vermittelt,",
        "in kurzen Mini-Sequenzen (1–3 Minuten) eingebaut werden kann,",
        "die Bandscheiben-Ernährung durch rhythmische Be- und Entlastung fördert (Lektion 1.1),",
        "in jeder Schiene gut dosierbar ist.",
      ],
    },
    {
      kind: "paragraph",
      text: "Mobilisation ist die ideale Eingangs-Kategorie. Wer mit chronischem Rückenschmerz neu mit aktiver Therapie beginnt, startet hier.",
    },

    {
      kind: "heading",
      eyebrow: "ÜK-M1 bis ÜK-M7",
      text: "Die sieben zentralen Mobilisationsübungen",
    },
    {
      kind: "paragraph",
      text: "Diese sieben Übungen decken die wichtigsten Bewegungsrichtungen der LWS und der angrenzenden Strukturen ab. Sie sind im Übungskartendeck als ÜK-M1 bis ÜK-M7 dokumentiert.",
    },

    {
      kind: "exerciseCard",
      code: "ÜK-M1",
      name: "Cat-Cow (Katze-Kuh)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m1-combo.png",
        alt: "ÜK-M1 — Cat-Cow (Katze-Kuh)",
      },
      fields: [
        {
          label: "Position",
          text: "Vierfüßlerstand. Hände unter Schultern, Knie unter Hüften, Wirbelsäule neutral.",
        },
        {
          label: "Bewegung",
          text: "Wechselnd zwischen Cat (runder Rücken, Becken kippt nach hinten, Blick nach unten) und Cow (Hohlkreuz, Becken kippt nach vorne, Blick leicht nach oben). Langsam, rhythmisch, mit Atmung verbunden — Cat beim Ausatmen, Cow beim Einatmen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 3–5 sehr sanfte Wellenbewegungen, kleine Amplitude",
            "Standard: 10 volle Wiederholungen",
            "Belastend: 15 mit kurzer Haltezeit in den Endpositionen",
          ],
        },
        {
          label: "Wirkung",
          text: "Mobilisiert die gesamte Wirbelsäule, aktiviert sanft Bauch- und Rückenmuskulatur, koordiniert Atmung mit Bewegung.",
        },
        {
          label: "Häufige Fehler",
          text: "Schultern hochziehen, Bewegung nur aus dem Hals statt aus der Brustwirbelsäule, zu schnelle Wiederholungen.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-M2",
      name: "Knee-to-Chest (Knie zur Brust)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m2-combo.png",
        alt: "ÜK-M2 — Knee-to-Chest (Knie zur Brust)",
      },
      fields: [
        {
          label: "Position",
          text: "Rückenlage, Beine angewinkelt aufgestellt.",
        },
        {
          label: "Bewegung",
          text: "Ein Knie mit beiden Händen sanft zur Brust ziehen, Schultern bleiben am Boden. 10–30 Sekunden halten, dann anderes Bein. Optional: beide Knie gleichzeitig.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 1 Bein, 10 Sekunden, sehr sanft",
            "Standard: abwechselnd beide Beine, jeweils 20 Sekunden",
            "Belastend: beide Beine gleichzeitig, sanfte Wippbewegung",
          ],
        },
        {
          label: "Wirkung",
          text: "Sanfte Dekompression der unteren LWS, Streckung der Lendenmuskulatur, oft sehr entspannend.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-M3",
      name: "Pelvic Tilt (Beckenkippung)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m3-combo.png",
        alt: "ÜK-M3 — Pelvic Tilt (Beckenkippung)",
      },
      fields: [
        {
          label: "Position",
          text: "Rückenlage, Beine angewinkelt aufgestellt, Hände entspannt neben dem Körper.",
        },
        {
          label: "Bewegung",
          text: "Becken sanft nach hinten kippen (Lendenwirbelsäule berührt den Boden), dann zurück in Neutralstellung. Bewegung kommt aus dem Beckenboden und der tiefen Bauchmuskulatur.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 5 sanfte Kippungen, kleine Amplitude",
            "Standard: 10 volle Wiederholungen, 2 Sekunden halten",
            "Belastend: 15 mit längerer Haltezeit, mit Beckenboden-Aktivierung",
          ],
        },
        {
          label: "Wirkung",
          text: "Reaktiviert die deep-core-Synergie aus Lektion 1.2, schult Becken-Wahrnehmung, sanfte LWS-Mobilisation.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-M4",
      name: "Thorakale Rotation im Vierfüßlerstand",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m4-combo.png",
        alt: "ÜK-M4 — Thorakale Rotation im Vierfüßlerstand",
      },
      fields: [
        {
          label: "Position",
          text: "Vierfüßlerstand. Eine Hand am Hinterkopf.",
        },
        {
          label: "Bewegung",
          text: "Den Ellenbogen der Hand am Hinterkopf nach unten zur gegenüberliegenden Hand führen (Wirbelsäule rotiert nach unten), dann den Ellenbogen weit nach außen / oben öffnen (Wirbelsäule rotiert nach oben). Blick folgt dem Ellenbogen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 5 sanfte Rotationen pro Seite",
            "Standard: 8 pro Seite, volle Amplitude",
            "Belastend: 10 pro Seite mit kurzem Halten am Ende",
          ],
        },
        {
          label: "Wirkung",
          text: "Mobilisiert die Brustwirbelsäule – ein oft vernachlässigter Bereich, der bei Steifheit die LWS überlastet.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-M5",
      name: "Hüftbeuger-Mobilisation (Ausfallschritt-Stretch)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m5-combo.png",
        alt: "ÜK-M5 — Hüftbeuger-Mobilisation (Ausfallschritt-Stretch)",
      },
      fields: [
        {
          label: "Position",
          text: "Halber Kniestand. Ein Bein vorne aufgesetzt (90°-Winkel im Knie), das andere Bein hinten auf dem Boden (Knie auf Polster wenn unangenehm).",
        },
        {
          label: "Bewegung",
          text: "Becken nach vorne schieben, hintere Hüfte streckt sich. 30–60 Sekunden halten, optional sanftes Wippen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 20 Sekunden, sanfte Dehnung",
            "Standard: 30–45 Sekunden mit kontrolliertem Atemfluss",
            "Belastend: 60 Sekunden, oder mit erhobenem gleichseitigem Arm zum gestreckteren Hüftbeuger",
          ],
        },
        {
          label: "Wirkung",
          text: "Mobilisiert den Iliopsoas (Lektion 1.2) – einen zentralen Mitspieler bei chronischem Kreuzschmerz, oft verkürzt durch viel Sitzen.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-M6",
      name: "Beinkreisen im Liegen (Hip Circles)",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m6-combo.png",
        alt: "ÜK-M6 — Beinkreisen im Liegen (Hip Circles)",
      },
      fields: [
        {
          label: "Position",
          text: "Rückenlage, ein Bein angewinkelt aufgestellt, anderes Bein gestreckt.",
        },
        {
          label: "Bewegung",
          text: "Das angewinkelte Bein anheben (90°-Hüftbeugung) und Knie kreist langsam in größer werdenden Bewegungen (5 in jede Richtung).",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: Kleine Kreise, 5 pro Richtung",
            "Standard: Mittlere Kreise, 5 pro Richtung, beide Beine nacheinander",
            "Belastend: Große Kreise, 8 pro Richtung",
          ],
        },
        {
          label: "Wirkung",
          text: "Mobilisiert das Hüftgelenk in allen Achsen, ohne LWS-Belastung.",
        },
      ],
    },
    {
      kind: "exerciseCard",
      code: "ÜK-M7",
      name: "Schultern-Roll / Schulterblatt-Mobilisation",
      image: {
        src: "/images/masterclass/chronischer-kreuzschmerz/workbook/uk-m7-combo.png",
        alt: "ÜK-M7 — Schultern-Roll / Schulterblatt-Mobilisation",
      },
      fields: [
        {
          label: "Position",
          text: "Sitzen oder Stehen, neutrale Wirbelsäule.",
        },
        {
          label: "Bewegung",
          text: "Schultern in großen Kreisen rollen – 5 nach hinten, 5 nach vorne. Dann Schulterblätter aktiv zusammenführen und wieder lösen.",
        },
        {
          label: "Schienen",
          items: [
            "Reizarm: 5 Kreise pro Richtung, sanft",
            "Standard: 8 pro Richtung plus 10 aktive Schulterblatt-Annäherungen",
            "Belastend: Mit kleinem Widerstand (Theraband oder ausgestreckte Arme)",
          ],
        },
        {
          label: "Wirkung",
          text: "Mobilisiert den Schultergürtel, der über die Fascia thoracolumbalis mit der LWS verbunden ist. Verbessert oberkörperliche Beweglichkeit, die bei chronischem Kreuzschmerz oft mit eingeschränkt ist.",
        },
      ],
    },

    {
      kind: "heading",
      eyebrow: "Wie oft, wie viel, wann",
      text: "Dosierungs-Leitlinien",
    },
    {
      kind: "paragraph",
      text: "Wie oft? Mobilisation ist täglich machbar – das ist sogar empfohlen. Drei bis sieben Mal pro Woche, idealerweise täglich kurze Mini-Sequenzen.",
    },
    {
      kind: "paragraph",
      text: "Wie viel pro Sequenz? 2–6 der sieben Übungen, je nach Zeit und Energie. Eine kurze Sequenz: 5 Minuten. Eine mittlere: 10 Minuten. Eine ausführliche: 15–20 Minuten.",
    },
    {
      kind: "bulletList",
      title: "Wann? Mobilisation eignet sich für:",
      items: [
        "Morgens (gegen Morgensteifigkeit)",
        "Pausen (gegen das Sitzen)",
        "Vor anderem Training (als Vorbereitung)",
        "Abends (als Beruhigung vor dem Schlaf)",
      ],
    },
    {
      kind: "paragraph",
      text: "In welcher Schiene? Im Zweifel eine Schiene niedriger als du dir zutraust. Mobilisation soll angenehm sein. Wenn sie Schmerz auslöst – Schiene runter, sanfter, kleinere Amplitude.",
    },
    {
      kind: "vertiefung",
      title: "Warum Mobilisation kein „Aufwärmen“ ist",
      body: [
        "Ein populäres Missverständnis: Mobilisationsübungen werden manchmal nur als „Aufwärmen“ vor „richtigem Training“ gesehen. Das untertreibt ihren Wert erheblich.",
        "Bei chronischem Kreuzschmerz ist die regelmäßige sanfte Mobilisation für sich eine eigenständig wirksame Intervention. Sie hat – im Gegensatz zu intensivem Training – fast keine Nebenwirkungen, ist in fast jeder Schmerzphase machbar, und vermittelt die „Sicherheits-Botschaft“ besonders effizient an das sensibilisierte System.",
        "Für viele Patienten sind die Mobilisations-Routinen der wichtigste Bewegungsbeitrag in den ersten Wochen und Monaten. Stabilisation und Belastungstoleranz folgen später, als Ergänzung – nicht als Ersatz.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Mobilisations-Set",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    theorieRueckbindung: [
      "Du hast sieben Mobilisationsübungen kennengelernt. Diese Übung hilft dir, dein persönliches Set zusammenzustellen – nicht alle sieben gleichzeitig, sondern eine Auswahl, die zu dir und deinem Alltag passt.",
    ],
    anleitung: ["In drei Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Relevanz-Bewertung" },
      {
        kind: "text",
        text: "Bewerte jede Übung danach, wie relevant sie für dich erscheint:",
      },
      {
        kind: "ratingMatrix",
        id: "relevanz",
        columns: ["Geringe Relevanz", "Mittlere", "Hohe"],
        rows: [
          { id: "m1", label: "ÜK-M1 Cat-Cow" },
          { id: "m2", label: "ÜK-M2 Knee-to-Chest" },
          { id: "m3", label: "ÜK-M3 Pelvic Tilt" },
          { id: "m4", label: "ÜK-M4 Thorakale Rotation" },
          { id: "m5", label: "ÜK-M5 Hüftbeuger-Mobilisation" },
          { id: "m6", label: "ÜK-M6 Beinkreisen" },
          { id: "m7", label: "ÜK-M7 Schultern-Roll" },
        ],
      },

      { kind: "step", n: 2, title: "Drei Übungen für deinen Start" },
      {
        kind: "text",
        text: "Wähle aus den drei mit hoher Relevanz die drei, mit denen du startest. Diese werden deine Kern-Mobilisations-Routine für die nächsten 4 Wochen.",
      },
      {
        kind: "lines",
        id: "start",
        label: "Meine drei Start-Übungen:",
        lines: [
          { id: "1", prefix: "ÜK-M" },
          { id: "2", prefix: "ÜK-M" },
          { id: "3", prefix: "ÜK-M" },
        ],
      },

      { kind: "step", n: 3, title: "Zeit-Anker (Habit Stacking)" },
      {
        kind: "text",
        text: "An welche bestehenden Alltags-Routinen kannst du diese drei Übungen knüpfen? (Mehr dazu in Modul 4.)",
      },
      {
        kind: "lines",
        id: "trigger",
        lines: [
          { id: "1", prefix: "Übung 1", mid: "→ Trigger:" },
          { id: "2", prefix: "Übung 2", mid: "→ Trigger:" },
          { id: "3", prefix: "Übung 3", mid: "→ Trigger:" },
        ],
      },
      {
        kind: "hint",
        text: "Beispiele für Trigger: morgens beim Kaffee, beim Zähneputzen, vor dem Schlafengehen, in der Mittagspause, nach jeder Toilette.",
      },

      { kind: "step", n: 4, title: "Die Startschiene" },
      {
        kind: "text",
        text: "In welcher Schiene startest du?",
      },
      {
        kind: "singleChoice",
        id: "schiene",
        options: [
          {
            id: "reizarm",
            label: "Reizarm",
            description: "ich gehe niedrig ein, vorsichtig, kleine Amplituden",
          },
          {
            id: "standard",
            label: "Standard",
            description: "ich starte mittel, mit Möglichkeit zu reduzieren",
          },
          {
            id: "belastend",
            label: "Belastend",
            description:
              "ich starte ambitioniert (nur empfohlen, wenn du aktuell wenig Schmerz hast)",
          },
        ],
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Was ist mir an dieser Auswahl wichtig? Welche Bedenken habe ich, welche Ressourcen helfen?",
          rows: 5,
        },
      },
      { kind: "date", id: "startdatum", label: "Datum des Starts" },
    ],
  },

  zusammenfassung: [
    "Mobilisation ist die alltagstauglichste Bewegungsform: sanft, in fast jeder Phase machbar, gut dosierbar.",
    "Sieben zentrale Übungen (ÜK-M1 bis M7) decken die wichtigsten Bewegungsrichtungen ab. Du brauchst nicht alle – drei gut gewählte sind ein wirksames Start-Set.",
    "Dosierung: täglich oder fast täglich, 5–15 Minuten, immer in der zu deinem Zustand passenden Schiene.",
    "Habit Stacking (Knüpfung an bestehende Tages-Anker) ist der wichtigste Erfolgsfaktor für regelmäßige Praxis — Detail in Modul 4.1 und 4.2.",
    "Mobilisation ist eigenständig wirksam, nicht nur Vorbereitung auf „richtiges Training“. Bei chronischem Schmerz oft der wichtigste Bewegungsbeitrag.",
  ],

  querverweise: [
    {
      label: "Lektion 2.3",
      text: "behandelt Stabilisationsübungen, die du nach den ersten Mobilisationswochen ergänzen kannst.",
    },
    {
      label: "Lektion 2.6",
      text: "behandelt Dosierung und Pacing der Übungen.",
    },
    {
      label: "Modul 4.1 und 4.2",
      text: "vertiefen Habit Stacking und die Ritual-Map.",
    },
    {
      label: "Übungskartendeck",
      text: "ÜK-M1 bis ÜK-M7 mit Bildern, Schienen-Detail und Fehlerhinweisen.",
    },
  ],

  notizfeld: {
    id: "notiz-2.2",
    label: "Notizfeld",
    rows: 12,
  },
};
