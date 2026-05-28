import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion I.1 „Willkommen & Versprechen".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion I.1", Z. 302–490). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-".
 */
export const WORKBOOK_I1: WorkbookData = {
  lessonId: "I.1",
  nr: "I.1",
  sectionLabel: "Intro · Ankommen & Spielregeln",
  title: "Willkommen & Versprechen",
  subtitle:
    "Was diese Masterclass dir bietet — und was sie bewusst nicht verspricht.",
  meta: {
    audio: "Audio-Dauer: 8–10 Min",
    lese: "Lese-Zeit Workbook: 20–25 Min",
    uebung: "keine Übung",
  },

  objectives: [
    "klar wissen, was diese Masterclass leisten kann und was nicht,",
    "den Unterschied zwischen Heilversprechen und Schmerzkompetenz verstehen und erklären können,",
    "nachvollziehen, warum konservatives Selbstmanagement im chronischen Kreuzschmerz heute den höchsten Evidenz-Standard hat,",
    "ein Gefühl dafür haben, wer hier zu dir spricht und welche Grenzen daraus folgen,",
    "die rechtlichen und ethischen Rahmen kennen, in denen diese Masterclass arbeitet (HWG, Selbstanwendung, Red Flags).",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Klarstellung zum Start",
      text: "Das Versprechen, das diese Masterclass dir macht",
    },
    {
      kind: "lead",
      text: "Bevor irgendetwas anderes passiert, eine Klarstellung darüber, was du hier eingekauft hast – und ebenso wichtig, was nicht.",
    },
    {
      kind: "paragraph",
      text: "Diese Masterclass ist: ein strukturierter, mehrstufiger Werkzeugkasten für den Selbstumgang mit chronischem Kreuzschmerz. Du bekommst medizinisch fundiertes Wissen über deinen Rücken, ein Bewegungs- und Übungsrepertoire mit drei Intensitätsschienen, ein Pacing- und Coping-System für deinen Alltag, eine Methodik zur stabilen Integration der Routinen in dein Leben, ein Flare-up-Protokoll für Schübe und ein Monitoring-System für deine langfristige Entwicklung.",
    },
    {
      kind: "paragraph",
      text: "Diese Masterclass ist nicht: ein Heilversprechen. An keiner Stelle dieser Masterclass wirst du den Satz hören oder lesen: „Du wirst nach X Wochen schmerzfrei sein.“ Wer dir das verspricht – egal ob als Therapie, als Kurs, als Programm – arbeitet entweder unseriös oder unsauber. Chronischer Kreuzschmerz ist ein hochkomplexes biopsychosoziales Phänomen. Es ist kein Knochenbruch, der heilt. Es ist kein Infekt, der ausklingt. Es ist ein langfristig veränderter Zustand deines Schmerzsystems, deiner Bewegungsmuster, deiner Belastbarkeit, deiner Lebensweise und teilweise deines vegetativen Nervensystems. Genau weil das so ist, brauchst du ein System – nicht einen Trick.",
    },
    {
      kind: "vertiefung",
      title: "Warum „Heilung“ das falsche Wort ist",
      body: [
        "Die Begriffe Heilung, Genesung und Wiederherstellung stammen aus dem akutmedizinischen Modell: ein klar definiertes Schadensereignis wird durch eine klar definierte Intervention behoben, der Vorzustand wird wiederhergestellt. Für ein gebrochenes Schienbein ist dieses Modell richtig. Für chronischen Kreuzschmerz ist es ein Kategorienfehler.",
        "Die internationale Schmerz-Klassifikation (ICD-11) hat 2019 Chronic Primary Pain als eigenständige Diagnosegruppe etabliert – ausdrücklich anerkennend, dass chronischer Schmerz nicht mehr Symptom einer anderen Erkrankung ist, sondern eine eigenständige Krankheit mit eigenen Mechanismen. Die Konsequenz: das Ziel ist nicht Heilung (im Sinne von Rückkehr in einen prä-existenten Zustand), sondern Management – Symptomatik reduzieren, funktionelle Kapazität ausweiten, Lebensqualität verbessern, Wiederkehr-Strategien aufbauen.",
        "Das ist sprachlich weniger spektakulär. Wissenschaftlich ist es heute der Konsens.",
      ],
    },
    {
      kind: "paragraph",
      text: "Was du also gewinnst, wenn du mit diesem System arbeitest, ist Schmerzkompetenz. Das ist mehr als nur Information. Schmerzkompetenz ist die Fähigkeit, deinen Schmerz zu verstehen (was wird hier eigentlich gespürt und warum?), ihn einzuordnen (ist das hier eine Warnung oder nur ein Geräusch des Systems?), ihn zu modulieren (welches Werkzeug nutze ich gerade?) und mit ihm zu leben (ohne dass er dein Leben bestimmt).",
    },
    {
      kind: "paragraph",
      text: "Studien aus der modernen Schmerzforschung – Moseley, Butler, Vlaeyen, Linton – zeigen konsistent, dass Patienten mit hoher Schmerzkompetenz bei objektiv identischen Befunden signifikant weniger subjektive Beeinträchtigung, weniger Angst, weniger Vermeidungsverhalten und höhere Lebensqualität haben als Patienten mit niedriger Schmerzkompetenz. Verstehen ist therapeutisch wirksam. Das ist nicht Esoterik – das ist einer der best replizierten Befunde der letzten 20 Jahre in der Schmerzforschung.",
    },

    {
      kind: "heading",
      eyebrow: "Die Evidenz",
      text: "Warum Selbstanwendung heute evidenzbasiert ist",
    },
    {
      kind: "paragraph",
      text: "Vielleicht hast du im Hinterkopf den Gedanken: Ist es wirklich seriös, einen so komplexen Zustand wie chronischen Schmerz alleine zu Hause zu behandeln? Brauche ich nicht eine echte Therapeutin oder einen echten Arzt?",
    },
    {
      kind: "paragraph",
      text: "Antwort: in vielen Fällen ja, aber nicht so, wie du denkst.",
    },
    {
      kind: "numberedList",
      title:
        "Die internationalen Leitlinien zur Behandlung chronischer unspezifischer Rückenschmerzen – darunter die deutsche NVL (Nationale Versorgungsleitlinie Nicht-spezifischer Kreuzschmerz, 2017, aktualisiert 2024) – nennen in erster Priorität:",
      items: [
        "Patientenedukation – also strukturierte Wissensvermittlung darüber, was Schmerz biologisch und psychologisch ist und was er nicht ist",
        "Bewegung und körperliche Aktivität – als wirksamste konservative Intervention, mehrfach evidenzgeprüft",
        "Aktive Selbstmanagement-Strategien – Pacing, Coping, Gewohnheits-Architektur",
        "Multimodale konservative Therapie – mit psychologischen, physiotherapeutischen und edukativen Anteilen",
      ],
    },
    {
      kind: "paragraph",
      text: "Erst danach: medikamentöse Therapien, invasive Verfahren, Operationen.",
    },
    {
      kind: "paragraph",
      text: "Die Reihenfolge ist wichtig. Selbstanwendung mit guter Edukation und strukturierter Aktivität ist nicht die schwächere Alternative zur richtigen Therapie – sondern in den meisten Fällen von chronischem unspezifischem Kreuzschmerz die leitliniengerechte erste Wahl. Operationen, Spritzen, manualtherapeutische Dauerbehandlungen sind in den allermeisten Fällen nicht die evidenzgesicherte Erstlinientherapie. Sie können in spezifischen Konstellationen sinnvoll sein, sind aber Zweit- oder Drittlinie.",
    },
    {
      kind: "vertiefung",
      title: "Was ist „unspezifischer“ Kreuzschmerz?",
      body: [
        "Der Begriff unspezifisch in der medizinischen Diagnose ist erklärungsbedürftig. Er klingt zunächst nach Unklarheit oder Diagnostiklücke – tatsächlich ist er aber eine bewusste Klassifikation.",
        "Unspezifischer Kreuzschmerz heißt: dein Schmerz lässt sich keiner einzelnen, klar abgrenzbaren strukturellen Ursache zuordnen, die als alleiniger Schmerzgenerator gelten kann. Das ist bei 85–90 % aller chronischen Kreuzschmerz-Fälle der Fall. Es schließt nicht aus, dass deine Bandscheiben, deine Facettengelenke oder deine Muskeln Veränderungen zeigen – diese Veränderungen sind aber bei den meisten Menschen ohne Schmerz ebenfalls vorhanden (siehe Lektion 1.4: das MRT-Paradox).",
        "Spezifischer Kreuzschmerz dagegen wäre: ein eindeutiger Bandscheibenvorfall mit klarer Nervenwurzelkompression und passender Symptomatik, eine Spondylolisthese mit Instabilität, eine Wirbelkörperfraktur, ein Tumor, eine Infektion, eine entzündlich-rheumatische Erkrankung. Diese sind selten – und sie gehören in fachärztliche Behandlung.",
        "Diese Masterclass ist konzipiert für chronischen unspezifischen Kreuzschmerz. Falls du Hinweise auf eine spezifische Ursache hast (siehe Red-Flag-Selbstcheck in I.3), ist eine ärztliche Vorab-Abklärung Voraussetzung.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Die Stimme dieser Masterclass",
      text: "Wer hier zu dir spricht",
    },
    {
      kind: "paragraph",
      text: "Ein kurzes Wort zu mir – nicht aus Eitelkeit, sondern weil du wissen sollst, wer da spricht und welche Grenzen meine Rolle hat.",
    },
    {
      kind: "paragraph",
      text: "Ich bin Physiotherapeut und sektoraler Heilpraktiker für Physiotherapie. Das ist ein deutsches Berufsbild, das vielen Menschen wenig sagt – also kurz erklärt: Der sektorale Heilpraktiker für Physiotherapie ist ein Physiotherapeut mit erweiterter Diagnostik-Befugnis. Das heißt: Ich darf Patienten ohne ärztliche Verordnung behandeln (Direktzugang) und trage dabei die diagnostische Verantwortung selbst – inklusive der Pflicht, behandlungsbedürftige Pathologien zu erkennen und ggf. an einen Arzt weiterzuleiten.",
    },
    {
      kind: "paragraph",
      text: "Praktisch heißt das: Ich sehe in meiner Praxis seit Jahren Menschen mit chronischem Kreuzschmerz, oft erst nach langen Wegen durch das medizinische System. MRT-Bilder. Wechselnde Diagnosen. Spritzen. Krankschreibungen. Eine ständige Hin- und Her-Beweglichkeit zwischen „Sie haben einen Verschleiß“ und „Da ist eigentlich nichts“. Und durchgehend einen Mangel an einer einzigen Sache: vernünftiger, zusammenhängender Erklärung dessen, was eigentlich passiert.",
    },
    {
      kind: "paragraph",
      text: "Diese Masterclass ist der Versuch, diese Erklärung systematisch zu liefern – plus die Werkzeuge, die zu dieser Erklärung gehören. Sie ist im Kern destillierte Sprechstunde: das, was ich in tausenden Einzelgesprächen erkläre, in eine vermittelbare Form gebracht.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Was Patienten am Ende eines Erstgesprächs oft sagen",
      body: [
        "„Warum hat mir das vorher noch nie jemand so erklärt?“",
        "Diesen Satz höre ich – ohne Übertreibung – in vielleicht jedem dritten Erstgespräch mit chronischen Schmerzpatienten. Nicht weil meine Erklärungen besonders genial wären. Sondern weil in der knappen Zeit des Arzt- oder Therapie-Termins für vernünftige Erklärungen schlicht oft keine Minuten übrig sind. Das ist kein Vorwurf an meine Kolleginnen und Kollegen – es ist eine systemische Lücke, die die Masterclass zu schließen versucht.",
      ],
    },
    {
      kind: "bulletList",
      title: "Grenzen meiner Rolle:",
      items: [
        "Was ich tue: Ich erkläre die wissenschaftlich abgesicherte Grundlage, vermittle Werkzeuge zur Selbstanwendung, gebe einen klaren Rahmen.",
        "Was ich nicht tue: Ich kenne deinen Körper nicht. Ich habe deine Befunde nicht gesehen. Ich kann deinen individuellen Fall nicht differenzieren. Diese Masterclass ist deshalb explizit kein Ersatz für individuelle Befundung und Behandlung vor Ort.",
      ],
    },
    {
      kind: "paragraph",
      text: "Wenn du in der Region Wildau / Königs Wusterhausen / Berlin-Süd wohnst, kannst du als Ergänzung zur Masterclass auch eine Behandlung in meiner Praxis in Anspruch nehmen. Wenn du weiter entfernt wohnst, ist eine Physiotherapie-Praxis in deiner Nähe der richtige Weg. Frage gezielt nach Praxen, die mit modernen schmerzwissenschaftlichen Konzepten arbeiten (Begriffe, die du nennen kannst: Pain Neuroscience Education, Graded Exposure, kognitiv-funktionelle Therapie, biopsychosoziales Modell).",
    },

    {
      kind: "heading",
      eyebrow: "Spielregeln",
      text: "Der rechtliche und ethische Rahmen",
    },
    {
      kind: "paragraph",
      text: "Drei kurze, aber wichtige Hinweise zum Rahmen, in dem du dich beim Arbeiten mit dieser Masterclass bewegst.",
    },
    {
      kind: "subheading",
      text: "1. Das Heilmittelwerbegesetz (HWG)",
    },
    {
      kind: "paragraph",
      text: "Diese Masterclass hält das HWG konsequent ein. Es gibt keine Werbeversprechen über garantierte Heilung, schmerzfreie Zustände nach X Wochen, sichere Erfolge oder ähnliches. Was die Masterclass anbietet: strukturierte Bildung, evidenzbasierte Werkzeuge, methodische Anleitung. Was du daraus machst, hängt von deinem individuellen Fall, deiner Konsequenz in der Umsetzung und biologischen Faktoren ab, die niemand vorab garantieren kann.",
    },
    {
      kind: "subheading",
      text: "2. Selbstanwendung erfolgt eigenverantwortlich",
    },
    {
      kind: "paragraph",
      text: "Du arbeitest mit dieser Masterclass auf eigene Verantwortung. Das ist kein juristischer Reflex – das ist eine inhaltliche Wahrheit. Eigenverantwortung in der Selbstanwendung bedeutet: du hörst auf deinen Körper, du wendest die Übungen in der für dich passenden Schiene an, du brichst ab, wenn etwas nicht stimmt, du holst ärztlichen Rat, wenn du dir unsicher bist. Die Masterclass schult dich darin – aber sie kann das nicht für dich tun.",
    },
    {
      kind: "subheading",
      text: "3. Red Flags und ärztliche Abklärung",
    },
    {
      kind: "paragraph",
      text: "Es gibt eine Reihe von Symptomen und Konstellationen, bei denen Selbstanwendung nicht das Richtige ist. Diese sogenannten Red Flags werden in Lektion I.3 ausführlich behandelt und gemeinsam mit dir abgeglichen. Die Liste reicht von neurologischen Ausfällen über Hinweise auf Frakturen bis hin zu möglichen entzündlichen oder onkologischen Ursachen. Wenn du an dieser Stelle bei dir Warnsignale feststellst, ist die nächste richtige Handlung nicht das Weiterlesen, sondern ein Hausarzt- oder Facharzt-Termin.",
    },
    {
      kind: "paragraph",
      text: "Diese Konsequenz ist nicht Selbstschutz von mir – sie ist Selbstschutz für dich. Selbstanwendung ist genau dann sinnvoll, wenn die schweren, klar behandlungsbedürftigen Ursachen ausgeschlossen sind. Mit gutem Vorab-Screening ist sie eines der wirksamsten Werkzeuge der modernen Schmerzmedizin.",
    },

    {
      kind: "heading",
      eyebrow: "Wortschatz",
      text: "Drei Begriffe, die die ganze Masterclass tragen",
    },
    {
      kind: "paragraph",
      text: "Drei Wörter, die in den kommenden 26 Lektionen immer wieder vorkommen. Du wirst sie nicht alle in dieser Lektion verstehen – das ist nicht das Ziel. Du sollst sie aber schon kennen, damit sie dir nicht als Fremdwörter begegnen, wenn sie später ausführlicher behandelt werden.",
    },
    {
      kind: "subheading",
      text: "Schmerzkompetenz",
    },
    {
      kind: "paragraph",
      text: "Schmerzkompetenz ist die Summe aus Wissen, Werkzeugen und Selbstwirksamkeit im Umgang mit dem eigenen Schmerz. Wer hohe Schmerzkompetenz hat, versteht, was bei Schmerz biologisch passiert, kann ihn einordnen, hat Werkzeuge zu seiner Modulation, und hat das innere Bild von sich selbst als handlungsfähig statt ausgeliefert. Schmerzkompetenz ist das übergeordnete Ziel dieser Masterclass.",
    },
    {
      kind: "subheading",
      text: "Recoping",
    },
    {
      kind: "paragraph",
      text: "Ein in dieser Masterclass eingeführter Begriff – eine Verschmelzung aus Recovery (Erholung, Wiedereinstieg) und Coping (Umgang mit Belastung). Recoping bezeichnet die schmerzadaptive Wiedereingliederung von Bewegungs- und Atmungs-Ritualen in den Alltag, mit dem zentralen Trick, Übungen an existierende Tages-Anker zu hängen (Habit Stacking). Modul 4 widmet sich vollständig diesem Konzept.",
    },
    {
      kind: "subheading",
      text: "Antifragilität",
    },
    {
      kind: "paragraph",
      text: "Ein Begriff aus der Systemtheorie (Nassim Taleb), der beschreibt, dass bestimmte Systeme nicht nur belastungsstabil sind, sondern durch dosierte Belastung stärker werden. Knochen, Muskeln, Bandscheiben, das Schmerzsystem selbst sind in diesem Sinne antifragil. Modul 3 baut auf diesem Konzept auf.",
    },
    {
      kind: "paragraph",
      text: "Diese drei Wörter werden bis zum Ende der Masterclass zu deinen Begriffen werden. Im Glossar im Anhang findest du sie noch einmal präzise definiert.",
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein Ausgangspunkt",
    timing:
      "Keine formale Übung in dieser Lektion · diese kurze Reflexion hilft dir, mit klarem Kopf zu starten",
    theorieRueckbindung: [
      "Diese Lektion legt den Rahmen fest: Schmerzkompetenz statt Heilversprechen, Selbstanwendung in Eigenverantwortung, ärztliche Abklärung bei Red Flags. Halte zum Start kurz fest, mit welcher Erwartung du in die Masterclass gehst.",
    ],
    blocks: [
      {
        kind: "note",
        field: {
          id: "erwartung",
          label:
            "Mit welcher Erwartung gehe ich in diese Masterclass? Was würde es für mich konkret bedeuten, Schmerzkompetenz zu gewinnen?",
          rows: 5,
        },
      },
      {
        kind: "note",
        field: {
          id: "heilversprechen",
          label:
            "Habe ich in der Vergangenheit Heilversprechen gehört, die sich nicht erfüllt haben? Was nehme ich daraus mit?",
          rows: 4,
        },
      },
      {
        kind: "hint",
        text: "Es gibt hier kein Richtig und kein Falsch – diese Zeilen sind nur für dich.",
      },
    ],
  },

  zusammenfassung: [
    "Diese Masterclass leistet Schmerzkompetenz – nicht Heilversprechen. Wer Heilversprechen verspricht, arbeitet unseriös.",
    "Selbstanwendung mit guter Edukation und strukturierter Aktivität ist bei chronischem unspezifischem Kreuzschmerz leitliniengerechte Erstlinientherapie – nicht Notbehelf.",
    "Verstehen ist therapeutisch wirksam – nicht weil es Schmerz weg-denkt, sondern weil es das Schmerzsystem messbar moduliert.",
    "Diese Masterclass ist konzipiert für chronischen unspezifischen Kreuzschmerz. Bei Red Flags (siehe I.3) ist ärztliche Vorab-Abklärung Voraussetzung.",
    "Der Sprecher ist Physiotherapeut und sektoraler Heilpraktiker, kennt aber deinen individuellen Fall nicht. Eigenverantwortung in der Anwendung ist Teil des Designs.",
  ],

  querverweise: [
    {
      label: "Lektion I.2",
      text: "vertieft, was sich hinter dem Etikett chronischer Kreuzschmerz alles verbergen kann und warum die scheinbare Vielfalt der Diagnosen biologisch eine Familie bildet.",
    },
    {
      label: "Lektion I.3",
      text: "liefert den Red-Flag-Selbstcheck als ✏️ Übung – bitte vor Beginn von Modul 1 abschließen.",
    },
    {
      label: "Lektion 1.4",
      text: "vertieft das MRT-Paradox (Befund versus Schmerz) – einer der wichtigsten kognitiven Schalter in der ganzen Masterclass.",
    },
    {
      label: "Anhang: Glossar",
      text: "für präzise Definitionen der Begriffe Schmerzkompetenz, Recoping, Antifragilität.",
    },
  ],

  notizfeld: {
    id: "notiz-I.1",
    label: "Notizfeld",
    helper:
      "Eigene Gedanken zu dieser Lektion. Was hat dich überrascht, womit gehst du nicht ganz mit, was willst du dir merken?",
    rows: 14,
  },
};
