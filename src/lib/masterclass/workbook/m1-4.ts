import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 1.4 „Das MRT-Paradox: Befund versus Schmerz”.
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 1.4”, Z. 2265–2602). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-". Modul 1 ist Theorie — keine Übungsfotos.
 */
export const WORKBOOK_M1_4: WorkbookData = {
  lessonId: "1.4",
  nr: "1.4",
  sectionLabel: "Modul 1 · Verstehen",
  title: "Das MRT-Paradox: Befund versus Schmerz",
  subtitle:
    "Warum strukturelle Bildbefunde und Schmerz oft auseinanderfallen — und wie du einen Befund einordnend statt ängstigend liest.",
  meta: {
    audio: "Audio-Dauer: 14–16 Min",
    lese: "Lese-Zeit Workbook: 30–35 Min",
    uebung: "mit Übung 1.4",
  },

  objectives: [
    "das MRT-Paradox in seinen empirischen Daten kennen,",
    "verstehen, warum strukturelle Befunde und Schmerz oft auseinanderfallen,",
    "einen MRT- oder Röntgenbefund einordnend statt ängstigend lesen können,",
    "die klinische Relevanz verschiedener bildgebender Befunde grob einschätzen können,",
    "die Übung 1.4 abgeschlossen haben, mit der du deinen eigenen Bildbefund (falls vorhanden) neu liest.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Zum Einstieg",
      text: "Ein Gedankenexperiment",
    },
    {
      kind: "lead",
      text: "Stell dir vor, du nimmst hundert zufällig ausgewählte Menschen zwischen 40 und 60 Jahren von der Straße, alle völlig schmerzfrei. Du schickst sie ins MRT. Was findest du?",
    },
    {
      kind: "paragraph",
      text: "Die Antwort ist überraschend.",
    },
    {
      kind: "table",
      caption:
        "📊 Bildgebende Befunde bei asymptomatischen Erwachsenen 40–60 Jahre (Brinjikji et al. 2015, Meta-Analyse über >3000 Personen):",
      headers: ["Befund", "Häufigkeit bei schmerzfreien 40–60-Jährigen"],
      rows: [
        ["Bandscheiben-Degeneration (Wassergehalt-Verlust)", "67–88 %"],
        ["Bandscheiben-Protrusion (Vorwölbung)", "36–50 %"],
        ["Bandscheiben-Vorfall (Prolaps)", "23–33 %"],
        ["Anuluseinriss", "26 %"],
        ["Facettengelenksarthrose", "38–60 %"],
        ["Spondylose (Knochenanbauten)", "30–50 %"],
        ["Spinalkanalstenose (leicht)", "11–21 %"],
        ["Spondylolisthese", "8 %"],
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Tabelle ist eine der wichtigsten Tabellen, die du in dieser ganzen Masterclass liest. Was sie zeigt: Wenn du gar keinen Rückenschmerz hast und Mitte 40 bist, hast du mit 80%iger Wahrscheinlichkeit Bandscheiben-Degeneration im MRT. Mit etwa 40%iger Wahrscheinlichkeit eine Protrusion. Mit etwa 25%iger Wahrscheinlichkeit einen Bandscheiben-Vorfall.",
    },
    {
      kind: "paragraph",
      text: "Diese Menschen haben keinen Schmerz. Sie wussten nicht einmal, dass diese Veränderungen da sind, bis das Studien-MRT gemacht wurde.",
    },
    {
      kind: "vertiefung",
      title: "Die altersabhängigen Veränderungen",
      body: [
        "Die Häufigkeit struktureller Befunde steigt mit dem Alter dramatisch. Die gleiche Studie (Brinjikji 2015) zeigt für die Bandscheiben-Degeneration bei asymptomatischen Personen: 20 Jahre 37 %, 30 Jahre 52 %, 40 Jahre 68 %, 50 Jahre 80 %, 60 Jahre 88 %, 70 Jahre 93 %, 80 Jahre 96 %.",
        "Wenn du Mitte 60 bist und einen MRT-Befund mit „degenerative Bandscheibenveränderungen” hast, gehörst du nicht zu den Kranken – du gehörst zu den 9 von 10 Menschen deines Alters mit identischem Befund.",
      ],
    },
    {
      kind: "keyTakeaway",
      body: [
        "Das ist das MRT-Paradox: Strukturelle Veränderungen sind häufig, oft asymptomatisch, und korrelieren schwach mit Schmerz. Sie sind mehr Lebensspuren als Schmerzursachen.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Die statistische Beziehung",
      text: "Wie stark korreliert Befund mit Schmerz?",
    },
    {
      kind: "paragraph",
      text: "Die Frage, die sich aufdrängt: wenn diese Befunde so häufig auch bei Schmerzfreien sind – wie stark korrelieren sie überhaupt mit Schmerz? Die Antwort: schwach bis moderat, je nach Befund.",
    },
    {
      kind: "table",
      caption:
        "📊 Korrelations-Stärke verschiedener Befunde mit Schmerz (vereinfacht aus Boos 1995, Jensen 1994, Modic 2005):",
      headers: ["Befund", "Korrelation mit Schmerz"],
      rows: [
        ["Modische Veränderungen Typ 1 (Knochenmarködem-artige Signale)", "Moderat"],
        ["Akuter (frischer) Bandscheibenvorfall mit radikulärer Symptomatik", "Moderat–stark"],
        ["Spinalkanalstenose mit Claudicatio spinalis", "Moderat–stark"],
        ["Spondylolisthese mit Instabilitäts-Zeichen", "Moderat"],
        ["Reine Bandscheiben-Degeneration", "Schwach"],
        ["Asymptomatische Bandscheiben-Protrusion", "Sehr schwach"],
        ["Facettengelenksarthrose", "Schwach"],
        ["„Multietagäre degenerative Veränderungen” generell", "Sehr schwach"],
        ["Spondylose (Knochenanbauten)", "Sehr schwach"],
      ],
    },
    {
      kind: "paragraph",
      text: "Die Botschaft ist nicht „alle Bildbefunde sind irrelevant”. Einige Befunde haben klinische Bedeutung – ein akuter Bandscheibenvorfall mit klarer Wurzelreizung, eine ausgeprägte Spinalkanalstenose mit Claudicatio, eine entzündliche Wirbelkörperveränderung. Diese Konstellationen sind real und können behandlungsrelevant sein.",
    },
    {
      kind: "paragraph",
      text: "Aber die häufigsten Befunde – allgemeine Degeneration, Protrusion ohne Wurzelreizung, Facettenarthrose, Spondylose – korrelieren so schwach mit Schmerz, dass sie als alleinige Erklärung nicht ausreichen. Wer Schmerz hat und einen solchen Befund, hat zwei Dinge gleichzeitig – aber nicht notwendig kausal verknüpft.",
    },

    {
      kind: "heading",
      eyebrow: "Drei Konsequenzen",
      text: "Warum ist das so wichtig?",
    },
    {
      kind: "subheading",
      text: "1. Die Sprache des Befundes beeinflusst deinen Schmerz",
    },
    {
      kind: "paragraph",
      text: "Studien (Sloan 2010, McCullough 2012) zeigen: Patienten, die einen MRT-Befund mit alarmierender Sprache erhalten („multietagäre Veränderungen”, „schwerer Bandscheibenverschleiß”, „deutliche Schädigung”), entwickeln statistisch häufiger chronische Schmerzen, höhere Schmerzintensität, mehr Angst und schlechtere funktionelle Outcomes als Patienten mit identischen Befunden, die in neutraler Sprache beschrieben wurden.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht psychosomatisch im populären Sinne. Es ist ein direkter Effekt von Sprache auf das Schmerzsystem. Sprache erzeugt Erwartungen, Erwartungen verändern die zentrale Schmerzverarbeitung. Dein Gehirn interpretiert Signale aus deinem Rücken anders, wenn es glaubt, dass dort „schwere Schäden” sind.",
    },
    {
      kind: "subheading",
      text: "2. Behandlungs-Empfehlungen basierend auf Bildbefunden allein sind oft fragwürdig",
    },
    {
      kind: "paragraph",
      text: "Wenn ein behandelnder Arzt sagt: „Im MRT haben wir L4/L5 eine Protrusion gesehen, wir sollten das operieren”, ist Vorsicht angebracht. Die alleinige Existenz einer Protrusion (ohne klare passende klinische Symptomatik, ohne deutliche neurologische Defizite) ist kein hinreichender Grund für eine Operation. Die Datenlage zur Operationsindikation ist klar – sie ist primär klinisch (Symptomatik, neurologischer Status, Verlauf), nicht bildgebend.",
    },
    {
      kind: "paragraph",
      text: "Das gilt auch für andere Interventionen: Spritzen, Radiofrequenz-Verfahren, etc. Eine Therapie-Empfehlung nur auf Basis eines Bildbefundes ist methodisch fragwürdig.",
    },
    {
      kind: "subheading",
      text: "3. Der Befund ändert sich nicht – aber die Bedeutung kann sich ändern",
    },
    {
      kind: "paragraph",
      text: "Eine Bandscheiben-Protrusion verschwindet in der Regel nicht. Sie kann auch nach Jahren noch da sein. Aber ihr klinischer Sinn kann sich ändern. Wenn du heute mit einer Protrusion Schmerz hast, kannst du in zwei Jahren mit derselben Protrusion schmerzfrei sein – wenn dein Schmerzsystem sich desensibilisiert hat, deine Muskulatur sich aufgebaut hat, dein Lebensstil sich verändert hat.",
    },
    {
      kind: "paragraph",
      text: "Das ist eine ungewöhnliche, aber befreiende Wahrheit: Du musst deinen Befund nicht verändern, um schmerzfreier zu werden. Du musst dein System verändern.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Das verschwiegene MRT",
      body: [
        "Ein Patient, Mitte 50, hatte vor 8 Jahren ein MRT, das einen „Bandscheibenvorfall L5/S1 mit Wurzelkontakt” zeigte. Er bekam ausführliche Operationsempfehlungen, lehnte aber ab, aus persönlichen Gründen. Stattdessen begann er konservative Therapie mit aktiver Bewegung. Nach 18 Monaten war er weitgehend schmerzfrei.",
        "Sieben Jahre später, aus anderem Grund, machte er ein erneutes MRT. Der Befund: praktisch identisch zum alten. Die Bandscheibe war nicht „geheilt”. Sein Körper hatte gelernt, mit ihr zu leben – das Schmerzsystem hatte sich kalibriert.",
        "Er sagte mir damals: „Wenn ich das vor 8 Jahren so verstanden hätte, hätte ich mir viel Sorge gespart.”",
      ],
    },

    {
      kind: "heading",
      eyebrow: "In vier Schritten",
      text: "Wie liest man einen Befund einordnend?",
    },
    {
      kind: "paragraph",
      text: "Wenn du einen MRT-, CT- oder Röntgenbefund deines Rückens vorliegen hast, ein paar konkrete Hilfen, wie du ihn einordnend liest.",
    },
    {
      kind: "subheading",
      text: "Schritt 1: Was steht im Befund?",
    },
    {
      kind: "bulletList",
      title: "Notiere dir die Hauptbefunde wörtlich. Typische Begriffe:",
      items: [
        "Bandscheibendegeneration / Chondrose / Diskopathie — Wassergehalt-Verlust der Bandscheibe. Sehr häufig, korreliert schwach mit Schmerz.",
        "Bandscheibenprotrusion — Vorwölbung, Faserring intakt. Häufig, korreliert schwach mit Schmerz (außer bei klarer Wurzelkompression).",
        "Bandscheibenprolaps / Sequester — Durchbruch des Faserrings, Material verlagert. Mäßig häufig, korreliert moderat mit Schmerz (vor allem mit ausstrahlendem Schmerz).",
        "Spondylose / Osteophyten — Knochenanbauten an Wirbelkörpern. Häufig mit Alter, korreliert schwach mit Schmerz.",
        "Facettengelenksarthrose / Spondylarthrose — Verschleißzeichen an Facettengelenken. Häufig mit Alter, korreliert schwach mit Schmerz.",
        "Modische Veränderungen Typ 1, 2, 3 — Wirbelkörper-Veränderungen verschiedener Aktivitätsstadien. Modic Typ 1 korreliert moderat, Typ 2/3 schwach.",
        "Foramen-/Recessus-Stenose — Verengung der Nervenwurzel-Austrittsstelle. Korreliert mit ausstrahlender Symptomatik, wenn klinisch passend.",
        "Spinalkanalstenose — Verengung des zentralen Wirbelkanals. Wenn ausgeprägt: korreliert mit Claudicatio spinalis.",
      ],
    },
    {
      kind: "subheading",
      text: "Schritt 2: Welche Befunde sind klinisch relevant für dich?",
    },
    {
      kind: "bulletList",
      title: "Frage: passt der Befund zu deiner Symptomatik?",
      items: [
        "Ausstrahlung ins Bein bis zur Zehe → könnte zur Wurzelirritation passen, die im MRT beschrieben wird.",
        "Lokaler tiefer Lendenschmerz beim Strecken → könnte zu Facettenbefunden passen.",
        "Beidseitige Beinschmerzen beim Gehen, die durch Vorbeugen besser werden → könnte zu Spinalkanalstenose passen.",
        "Nicht zuordenbarer diffuser Schmerz ohne klare Bewegungsmuster → wahrscheinlich keine spezifische Struktur als alleinige Ursache.",
      ],
    },
    {
      kind: "subheading",
      text: "Schritt 3: Welche Wörter im Befund sind „Lebensspuren”?",
    },
    {
      kind: "paragraph",
      text: "Wahrscheinlich die meisten. Eine reine Degeneration ohne Wurzelirritation oder Stenose-Symptomatik ist mit hoher Wahrscheinlichkeit eine Begleitveränderung, kein Schmerzgenerator.",
    },
    {
      kind: "subheading",
      text: "Schritt 4: Welche Wörter sind potenziell behandlungsrelevant?",
    },
    {
      kind: "bulletList",
      items: [
        "Akute Wurzelkompression mit passender Symptomatik",
        "Aktive entzündliche Wirbelkörperveränderungen",
        "Cauda-equina-Konstellation (Notfall!)",
        "Hochgradige Spinalkanalstenose mit Symptomatik",
        "Verdacht auf Tumor, Infektion, Fraktur",
      ],
    },
    {
      kind: "callout",
      text: "Wenn solche Hinweise im Befund stehen, gehört das in ärztliche Diskussion. Selbstanwendung der Masterclass ggf. pausieren.",
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein MRT-Befund neu lesen",
    timing:
      "Geschätzte Bearbeitungszeit: 20–25 Minuten · Falls du keinen MRT-Befund hast: Alternative am Ende der Übung.",
    theorieRueckbindung: [
      "Du hast eben gelernt, dass die Sprache eines Befundes deinen Schmerz beeinflussen kann – oft mehr als die Struktur, die der Befund beschreibt. Diese Übung gibt dir die Chance, einen vorhandenen Befund neu zu lesen, mit dem Wissen aus dieser Lektion. Viele Patienten berichten danach, dass ihre Befunde sich anders anfühlen.",
    ],
    anleitung: [
      "Hol deinen aktuellsten MRT-Befund hervor (oder Röntgen / CT, falls kein MRT vorhanden). Gehe in vier Schritten durch.",
    ],
    blocks: [
      { kind: "step", n: 1, title: "Den Befund in eigene Worte übersetzen" },
      {
        kind: "text",
        text: "Lies den Befund einmal durch. Wähle dann die drei wichtigsten Wörter oder Phrasen, die im Befund vorkommen, und übersetze sie für dich.",
      },

      {
        kind: "lines",
        id: "wort1",
        label: "Wort/Phrase 1 im Befund:",
        lines: [{ id: "begriff" }],
      },
      {
        kind: "note",
        field: {
          id: "wort1-bedeutung",
          label:
            "Bedeutung in eigenen Worten (Glossar im Anhang nutzen, wenn unklar):",
          rows: 2,
        },
      },
      {
        kind: "singleChoice",
        id: "wort1-einordnung",
        label: "Wahrscheinliche Bedeutung für dich:",
        options: [
          { id: "lebensspur", label: "Lebensspur — bei Menschen meines Alters häufig" },
          {
            id: "relevant",
            label: "Klinisch potenziell relevant — passt zu meiner Symptomatik",
          },
          { id: "unklar", label: "Unklar — möchte ich ärztlich besprechen" },
        ],
      },

      {
        kind: "lines",
        id: "wort2",
        label: "Wort/Phrase 2 im Befund:",
        lines: [{ id: "begriff" }],
      },
      {
        kind: "note",
        field: {
          id: "wort2-bedeutung",
          label: "Bedeutung in eigenen Worten:",
          rows: 2,
        },
      },
      {
        kind: "singleChoice",
        id: "wort2-einordnung",
        label: "Wahrscheinliche Bedeutung für dich:",
        options: [
          { id: "lebensspur", label: "Lebensspur" },
          { id: "relevant", label: "Klinisch potenziell relevant" },
          { id: "unklar", label: "Unklar" },
        ],
      },

      {
        kind: "lines",
        id: "wort3",
        label: "Wort/Phrase 3 im Befund:",
        lines: [{ id: "begriff" }],
      },
      {
        kind: "note",
        field: {
          id: "wort3-bedeutung",
          label: "Bedeutung in eigenen Worten:",
          rows: 2,
        },
      },
      {
        kind: "singleChoice",
        id: "wort3-einordnung",
        label: "Wahrscheinliche Bedeutung für dich:",
        options: [
          { id: "lebensspur", label: "Lebensspur" },
          { id: "relevant", label: "Klinisch potenziell relevant" },
          { id: "unklar", label: "Unklar" },
        ],
      },

      { kind: "step", n: 2, title: "Den Befund in der Alters-Perspektive lesen" },
      {
        kind: "text",
        text: "Schätze für jeden Hauptbefund: Wie häufig haben Menschen in deinem Alter ohne Schmerzen denselben Befund?",
      },
      {
        kind: "lines",
        id: "haeufigkeit",
        label: "Befund → geschätzte Häufigkeit bei Schmerzfreien (in meinem Alter):",
        lines: [
          { id: "1", mid: "→", },
          { id: "2", mid: "→" },
          { id: "3", mid: "→" },
        ],
      },
      {
        kind: "hint",
        text: "Hilfe: Bandscheiben-Degeneration in den 40ern ~68 %, in den 50ern ~80 %; Protrusion 36–50 %, Vorfall 23–33 %, Facettenarthrose 38–60 % — siehe Tabelle oben in dieser Lektion.",
      },

      { kind: "step", n: 3, title: "Die emotionale Neu-Aufladung" },
      {
        kind: "note",
        field: {
          id: "emotion-erst",
          label:
            "Wie hast du den Befund das erste Mal erlebt? Welche Gefühle hat er ausgelöst?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "emotion-jetzt",
          label: "Wie liest sich der Befund jetzt anders, nach dieser Lektion?",
          rows: 4,
        },
      },

      { kind: "step", n: 4, title: "Die eine Frage für den nächsten Arzt-Termin" },
      {
        kind: "note",
        field: {
          id: "frage",
          label:
            "Auf Grundlage dieser Übung — was ist die eine Frage, die du gerne mit deinem Arzt oder deiner Physiotherapeutin geklärt hättest?",
          helper:
            "Beispiele: „Welcher dieser Befunde ist tatsächlich behandlungsrelevant?” oder „Welche Befunde sind altersentsprechende Lebensspuren?”",
          rows: 3,
        },
      },

      {
        kind: "text",
        text: "Alternative (falls kein Befund vorhanden): Wenn du keinen Bildbefund hast (was völlig in Ordnung ist – Leitlinien empfehlen MRT bei unspezifischem Kreuzschmerz nicht routinemäßig), reflektiere stattdessen, welche populären Vorstellungen du über deinen Rücken hast.",
      },
      {
        kind: "checklist",
        id: "vorstellungen",
        label: "Welche dieser Bilder habe ich im Kopf?",
        items: [
          { id: "abgenutzt", label: "„Meine Bandscheibe ist abgenutzt”" },
          { id: "instabil", label: "„Mein Rücken ist instabil”" },
          { id: "verkuerzt", label: "„Meine Muskulatur ist verkürzt”" },
          { id: "kaputt", label: "„Mein Rücken ist kaputt”" },
          { id: "schaden", label: "„Bestimmte Bewegungen schaden mir”" },
        ],
      },
      {
        kind: "hint",
        text: "Frage dich bei jedem angekreuzten Bild: Wie korrekt ist es wirklich? Oft sind diese Vorstellungen altersnormal, teilweise richtig oder unklar — selten so dramatisch, wie sie sich anfühlen.",
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Was hat sich durch diese Übung bei mir verändert? Welche Befund-Wörter belasten mich nicht mehr so stark?",
          rows: 6,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
    ],
  },

  zusammenfassung: [
    "Strukturelle Bildbefunde sind häufig: Bandscheiben-Degeneration bei ~80 % der schmerzfreien 50-Jährigen, Protrusion bei ~40 %, Vorfall bei ~25 %.",
    "Befund und Schmerz korrelieren schwach für die meisten häufigen Befunde. Sie sind oft Lebensspuren, nicht Schmerzgeneratoren.",
    "Die Sprache eines Befundes beeinflusst den Schmerz – alarmierende Formulierungen verschlechtern Outcomes messbar, neutrale verbessern sie.",
    "Behandlungs-Empfehlungen nur auf Bildbasis sind methodisch fragwürdig – die klinische Symptomatik ist führend, nicht das Bild.",
    "Du musst deinen Befund nicht ändern, um schmerzfreier zu werden. Du kannst mit denselben strukturellen Veränderungen besser leben, wenn dein System sich desensibilisiert.",
  ],

  querverweise: [
    {
      label: "Lektion 1.1 und 1.2",
      text: "liefern die anatomische Grundlage, um Bildbefunde verstehen zu können.",
    },
    {
      label: "Lektion 1.3",
      text: "erklärt, warum Schmerz und Struktur auseinanderfallen können (Sensibilisierung).",
    },
    {
      label: "Lektion 1.5",
      text: "integriert die Bildbefunde in das moderne Schmerzmodell.",
    },
    {
      label: "Anhang: Glossar",
      text: "für medizinische Befundbegriffe.",
    },
  ],

  notizfeld: {
    id: "notiz-1.4",
    label: "Notizfeld",
    rows: 10,
  },
};
