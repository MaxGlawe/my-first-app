import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion I.2 „Du bist nicht allein: Die vielen Namen
 * deines Schmerzes".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion I.2", Z. 490–782). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische Anführungszeichen
 * — kein ASCII-".
 */
export const WORKBOOK_I2: WorkbookData = {
  lessonId: "I.2",
  nr: "I.2",
  sectionLabel: "Intro · Ankommen & Spielregeln",
  title: "Du bist nicht allein: Die vielen Namen deines Schmerzes",
  subtitle:
    "Warum die vielen Diagnose-Etiketten oft dieselbe biologische Familie beschreiben — und was das für dich bedeutet.",
  meta: {
    audio: "Audio-Dauer: 12–14 Min",
    lese: "Lese-Zeit Workbook: 25–30 Min",
    uebung: "keine Übung",
  },

  objectives: [
    "die wichtigsten Diagnosebegriffe rund um chronischen Kreuzschmerz kennen und einordnen können,",
    "verstehen, warum die scheinbare Vielfalt der Diagnosen biologisch eine Familie bildet,",
    "ein realistisches Bild von der Verbreitung und gesellschaftlichen Bedeutung des Problems haben,",
    "den Begriff „unspezifischer Kreuzschmerz“ nicht mehr als Unklarheit, sondern als präzise medizinische Klassifikation lesen können,",
    "nachvollziehen, warum ein gemeinsames Behandlungs-Konzept trotz unterschiedlicher Diagnose-Etiketten methodisch sauber ist.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Das Phänomen",
      text: "Das Diagnose-Karussell",
    },
    {
      kind: "lead",
      text: "Wenn du seit längerem mit chronischem Kreuzschmerz lebst, hast du wahrscheinlich schon mehrere Etiketten an deinem Rücken kleben sehen.",
    },
    {
      kind: "paragraph",
      text: "Vielleicht hieß es zuerst Lumbago. Dann Bandscheibenvorfall L4/L5. Beim nächsten Arzt ISG-Blockade. Bei der Reha muskuläre Dysbalance. Beim Orthopäden dann Facettensyndrom. Im MRT-Befund stand Spondylose mit Osteochondrose und Aktivierungszeichen. Beim Physiotherapeuten unspezifischer Kreuzschmerz. Beim Heilpraktiker Blockade im Beckenring.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht erfunden – das ist ein typischer Diagnose-Lebenslauf eines chronischen Schmerzpatienten in Deutschland.",
    },
    {
      kind: "paragraph",
      text: "Die meisten Menschen erleben dieses Karussell als zunehmend verwirrend und entmutigend. Welche Diagnose stimmt jetzt? Bin ich ein Sonderfall? Wenn schon die Profis sich nicht einig sind – wie soll ich dann verstehen, was los ist?",
    },
    {
      kind: "paragraph",
      text: "Diese Lektion räumt mit dem Karussell auf. Nicht indem sie behauptet, eine der Diagnosen sei die richtige. Sondern indem sie zeigt: Die meisten dieser Etiketten beschreiben denselben Phänomenbereich aus unterschiedlichen Beobachtungswinkeln. Sie sind nicht alle falsch – sie sind unterschiedliche Schichten einer biologisch zusammenhängenden Lage.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Sieben Diagnosen in drei Jahren",
      body: [
        "Ein Patient, Mitte 50, kam vor einigen Jahren in meine Praxis mit einer beachtlichen Sammlung: einem MRT-Befund, drei Arztbriefen, einem Physiotherapie-Verordnungsfächer und einer Akte aus einer Schmerzklinik. In drei Jahren hatte er sieben unterschiedliche Diagnosen erhalten. Jeder neue Behandler hatte einen neuen Begriff geliefert. Jeder mit guter Begründung, aus seiner jeweiligen Perspektive. Aber niemand hatte ihm je gesagt, was diese Begriffe miteinander zu tun haben.",
        "Im ersten Gespräch ging es nicht um Befund. Es ging um Begriffe. Es ging darum, ihm einen Übersichtsplan zu zeichnen, in dem all diese sieben Diagnosen ihren Platz fanden, sich nicht widersprachen, sondern ein Gesamtbild ergaben. Nach zwei Stunden sagte er: „Das ist das erste Mal, dass jemand meine Geschichte sortiert.“ Das war keine Therapie. Das war nur Orientierung. Aber sie war therapeutisch.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Geordneter Überblick",
      text: "Die wichtigsten Diagnose-Etiketten",
    },
    {
      kind: "paragraph",
      text: "Schauen wir die Begriffe der Reihe nach an. Diese Sammlung ist nicht vollständig, aber sie deckt den überwiegenden Teil dessen ab, was in Arztbriefen, MRT-Befunden und Therapieprotokollen rund um chronischen Kreuzschmerz auftaucht.",
    },
    {
      kind: "subheading",
      text: "Akut-Begriffe",
    },
    {
      kind: "bulletList",
      items: [
        "Lumbago / Hexenschuss: Beides bezeichnet dasselbe: einen plötzlich einschießenden, oft heftigen Schmerz im unteren Rücken, der die Bewegungsfähigkeit stark einschränkt. Akut, in der Regel selbstlimitierend (das heißt: ohne Behandlung in 1–2 Wochen abklingend). Lumbago ist der medizinische Begriff (lat. lumbus = Lende), Hexenschuss der volkstümliche. Der Mechanismus ist meist eine reflektorische Muskelverspannung als Schutzreaktion auf einen Reizimpuls – nicht ein „Verrutschen“ der Wirbelsäule, wie der Volksmund suggeriert.",
        "Akuter Kreuzschmerz: Sammelbegriff für Schmerzen im Bereich der unteren Wirbelsäule mit Dauer unter sechs Wochen.",
      ],
    },
    {
      kind: "subheading",
      text: "Strukturbezogene Begriffe",
    },
    {
      kind: "bulletList",
      items: [
        "Bandscheibenvorfall (Diskusprolaps, Hernie): Eine Verlagerung des inneren weichen Anteils der Bandscheibe durch einen Riss im äußeren Faserring nach außen. Bei der Bildgebung sichtbar als Protrusion (Vorwölbung, Faserring intakt) oder Prolaps (Durchbruch des Faserrings). Vorfälle können mechanisch auf Nerven drücken (dann mit ausstrahlender Schmerzsymptomatik) oder asymptomatisch sein. Die Häufigkeit asymptomatischer Vorfälle ist hoch (siehe Lektion 1.4).",
        "Spinalkanalstenose (Lumbalkanalstenose): Eine Verengung des Wirbelkanals, in dem das Rückenmark und die Nervenwurzeln verlaufen. Meist degenerativ bedingt, häufiger im höheren Alter. Charakteristisch: Claudicatio spinalis – schmerzhafte Beinsymptomatik beim Gehen, die sich durch Vornüberbeugen oder Sitzen bessert.",
        "Spondylarthrose / Facettengelenksarthrose: Verschleißzeichen der kleinen Wirbelgelenke (Facettengelenke). Ab dem 30. Lebensjahr in unterschiedlichem Ausmaß bei praktisch jedem Menschen vorhanden. Wird oft als Facettensyndrom zur Schmerzursache erklärt – ob aber eine erkennbare Arthrose wirklich der Schmerzgenerator ist, lässt sich bildgebend nicht eindeutig beweisen.",
        "Osteochondrose: Bezeichnet degenerative Veränderungen an Wirbelkörperdeckplatten und der angrenzenden Bandscheibe. Ähnlich wie Spondylarthrose ein Befund, der mit dem Alter zunimmt und nicht zwingend Schmerz erzeugt.",
        "Spondylose: Sammelbegriff für degenerative Veränderungen der Wirbelsäule insgesamt – Osteophyten (Knochenanbauten), Spondylarthrose, Osteochondrose. Auf Röntgen-Befunden sehr häufig zu finden, oft als Befund „schwer“ formuliert, obwohl viele dieser Veränderungen klinisch wenig bedeuten.",
        "Spondylolisthese: Verschiebung eines Wirbelkörpers gegenüber dem darunter liegenden. Wird in Schweregrade (Meyerding I–IV) eingeteilt. Kann angeboren oder degenerativ sein. Niedrige Grade häufig und oft asymptomatisch.",
      ],
    },
    {
      kind: "subheading",
      text: "Gelenkbezogene Begriffe",
    },
    {
      kind: "bulletList",
      items: [
        "ISG-Syndrom / Sakroiliakalgelenks-Dysfunktion: Beschwerden ausgehend von oder zugeordnet zum Iliosakralgelenk – der Übergangsstelle zwischen Wirbelsäule und Becken. Diagnostisch schwierig zu sichern; die genaue Häufigkeit als alleiniger Schmerzgenerator ist umstritten (Schätzungen 15–30 % der chronischen Kreuzschmerzen).",
        "Coccygodynie: Steißbeinschmerz, oft posttraumatisch oder nach langer Sitzbelastung.",
      ],
    },
    {
      kind: "subheading",
      text: "Symptomatische Begriffe (am Ort des Schmerzes orientiert)",
    },
    {
      kind: "bulletList",
      items: [
        "Lumbalgie: Schmerz im unteren Rücken (Lendenbereich), ohne Hinweis auf eine spezifische Ursache. Im Grunde das medizinische Synonym für Kreuzschmerz.",
        "Lumboischialgie / Ischialgie: Lumbalgie mit ins Bein ausstrahlendem Schmerz entlang des Verlaufs des Nervus ischiadicus. Sagt nichts über die Ursache aus – die kann ein Bandscheibenvorfall, eine Foramenstenose oder ein Piriformis-Syndrom sein, ebenso wie eine referred pain aus muskulären oder ligamentären Strukturen.",
        "Brachialgie / Cervikobrachialgie: (Für Vollständigkeit erwähnt – gehört eigentlich zur Halswirbelsäule.) Schmerz, der von der Halswirbelsäule in den Arm ausstrahlt.",
      ],
    },
    {
      kind: "subheading",
      text: "Funktionelle Begriffe",
    },
    {
      kind: "bulletList",
      items: [
        "Muskuläre Dysbalance / muskuläres Defizit: Beschreibt eine Asymmetrie in Kraft oder Spannung zwischen Muskelgruppen. Diagnostisch nicht standardisiert. Mehr eine Beobachtung als eine Diagnose.",
        "Myofasziales Schmerzsyndrom: Schmerz ausgehend von Triggerpunkten in Muskeln und Faszien, mit charakteristischer Schmerzausstrahlung. Diagnostisch ebenfalls unscharf, klinisch aber häufig sinnvoll als Beschreibungsebene.",
        "Blockade / Blockierung: Begriff aus der manuellen Medizin für eine vorübergehende Bewegungseinschränkung eines Gelenkes ohne strukturelle Ursache. Funktionelle Diagnose, in der wissenschaftlichen Literatur umstritten, im klinischen Alltag häufig verwendet.",
      ],
    },
    {
      kind: "subheading",
      text: "Übergeordnete Klassifikation",
    },
    {
      kind: "bulletList",
      items: [
        "Unspezifischer (nicht-spezifischer) Kreuzschmerz: Kreuzschmerz, der sich nicht einer spezifischen behandlungsrelevanten Pathologie zuordnen lässt. Das ist die Diagnose, die etwa 85–90 % aller chronischen Kreuzschmerzen trägt – auch dann, wenn Bildgebung Veränderungen zeigt, sofern diese nicht eindeutig der Schmerzgenerator sind.",
        "Chronischer primärer Schmerz (ICD-11): Seit der ICD-11-Klassifikation (2019, in Deutschland 2022 in Kraft) ist Chronic Primary Pain eine eigenständige Diagnosegruppe. Primär heißt: der Schmerz ist nicht sekundär zu einer anderen Erkrankung, sondern eigenständige Pathologie. Dazu zählt der häufige chronische primäre lumbosakrale Schmerz.",
      ],
    },
    {
      kind: "vertiefung",
      title: "Wie viele Etiketten ein einziger Befund haben kann",
      body: [
        "Ein und derselbe MRT-Befund einer 52-jährigen Patientin kann je nach Berichtschreiber unterschiedliche Sprach-Schwerpunkte bekommen:",
        "„Multietagäre degenerative Veränderungen mit Bandscheibenprotrusionen L4/L5 und L5/S1, aktivierte Osteochondrose L5/S1, Facettengelenksarthrose beidseits L4-S1, Spondylose.“",
        "„Altersentsprechende Veränderungen ohne wesentliche Befundrelevanz.“",
        "„Unauffälliger lumbosakraler Befund für das Lebensalter.“",
        "Drei Formulierungen, ein Bild. Die erste klingt alarmierend, die zweite neutral, die dritte sogar beruhigend. Alle drei sind fachlich korrekt – sie unterscheiden sich nur in der Gewichtung dessen, was als bemerkenswert hervorgehoben wird. Patienten, die nur den ersten Bericht erhalten, haben statistisch häufiger anhaltende Schmerzen und ungünstigere Verläufe als Patienten, die einen der anderen erhalten. Das ist die Macht der Sprache im chronischen Schmerz – und es ist einer der Gründe, warum Patientenedukation als therapeutische Intervention wirksam ist.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Der gemeinsame Nenner",
      text: "Die gemeinsame biologische Familie",
    },
    {
      kind: "paragraph",
      text: "Wenn so viele unterschiedliche Etiketten verwendet werden – was haben die Phänomene dahinter gemeinsam? Erstaunlich viel.",
    },
    {
      kind: "paragraph",
      text: "In der modernen Schmerzwissenschaft setzt sich zunehmend ein biopsychosoziales Modell durch, das davon ausgeht, dass chronischer Kreuzschmerz – unabhängig vom Diagnose-Etikett – auf einem Zusammenspiel von vier Mechanismen-Familien beruht:",
    },
    {
      kind: "numberedList",
      items: [
        "Strukturelle und biomechanische Faktoren: Veränderungen an Bandscheiben, Wirbelgelenken, Bändern, Muskeln, Faszien – inklusive Kompensationsmustern und veränderter Belastungsverteilung. Diese Faktoren existieren real, sie sind aber bei chronischen Schmerzen selten der alleinige und oft nicht einmal der primäre Schmerzgenerator.",
        "Sensitivierungs- und Lernprozesse im Nervensystem: Das Schmerzsystem ist plastisch – es lernt und passt sich an. Bei chronischem Schmerz entstehen in Rückenmark und Gehirn Veränderungen, die zu zentraler Sensibilisierung führen: dieselbe Reizmenge wird stärker als Schmerz interpretiert, harmlose Bewegungen werden als schmerzhaft kodiert. Dieses Phänomen behandeln wir ausführlich in Lektion 1.3.",
        "Vegetative und immunologische Faktoren: Stress, Schlafqualität, hormonelle Lage, niedriggradige Entzündungsaktivität, vegetative Tonusveränderungen – all das moduliert die Schmerzschwelle. Wer chronisch im Stress lebt, schlecht schläft, untertrainiert ist, hat ein gereiztes System, das auf identische Reize stärker reagiert. Lektion 3.3 behandelt diese Faktoren.",
        "Psychosoziale und kognitive Faktoren: Wie du über deinen Schmerz denkst, welche Erwartungen du hast, welche Bedeutung du der Symptomatik gibst, in welchem sozialen Kontext du lebst – all das beeinflusst die Schmerzverarbeitung messbar. Das ist keine Esoterik – es ist hirnphysiologisch nachweisbar. Lektion 1.5 vertieft das.",
      ],
    },
    {
      kind: "paragraph",
      text: "Der Punkt: Egal ob dein Etikett Bandscheibenvorfall, ISG-Syndrom, Spondylarthrose oder unspezifischer Kreuzschmerz heißt – die Mischung aus diesen vier Mechanismen-Familien ist bei chronischem Verlauf praktisch immer vorhanden. Die Etiketten unterscheiden sich primär darin, welche Mechanismus-Familie sie hervorheben. Eine sinnvolle Behandlung adressiert alle vier.",
    },
    {
      kind: "paragraph",
      text: "Das ist die methodische Grundlage, warum diese Masterclass ein einheitliches Konzept für sehr unterschiedlich etikettierte Patienten anbieten kann. Wir behandeln nicht das Etikett, sondern die Familie.",
    },

    {
      kind: "heading",
      eyebrow: "Größenordnung",
      text: "Wie viele Menschen betrifft das?",
    },
    {
      kind: "paragraph",
      text: "Eine Größenordnung, damit du das Phänomen einordnen kannst.",
    },
    {
      kind: "table",
      caption:
        "📊 Verbreitung in Deutschland (Robert-Koch-Institut, DEGS1 und Studienkonsens)",
      headers: ["Kennzahl", "Wert"],
      rows: [
        ["Lebenszeitprävalenz (mindestens einmal im Leben Kreuzschmerz)", "85 %"],
        ["12-Monats-Prävalenz (im letzten Jahr Kreuzschmerz)", "60–70 %"],
        ["Punktprävalenz (heute Kreuzschmerz)", "20–25 %"],
        ["Chronifizierungsrate bei akutem Kreuzschmerz", "5–10 %"],
        ["Anteil chronischer Kreuzschmerzen am Gesamt-Patientenaufkommen Hausarzt", "ca. 5 %"],
        ["Anteil von Kreuzschmerz an Frühberentungen", "15–20 %"],
        ["Geschätzte Gesamtkosten pro Jahr (Deutschland)", "ca. 50 Milliarden Euro"],
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Zahlen sollen weder dramatisieren noch beruhigen. Sie sollen einordnen.",
    },
    {
      kind: "paragraph",
      text: "Lebenszeitprävalenz 85 % heißt: Praktisch jeder Mensch hat irgendwann in seinem Leben Kreuzschmerz. Es ist – ähnlich wie Kopfschmerz – eine Grunderfahrung des Menschseins. Das macht es nicht harmlos, aber es macht es zur Normalität. Wer Kreuzschmerz hat, hat keine seltene Krankheit. Er hat eine extrem häufige menschliche Erfahrung.",
    },
    {
      kind: "paragraph",
      text: "Chronifizierungsrate 5–10 % heißt: Von hundert Menschen, die einen akuten Kreuzschmerz erleben, entwickeln fünf bis zehn eine chronische Form. Das ist die Gruppe, in der du wahrscheinlich bist – und es ist eine erhebliche Gruppe. Allein in Deutschland sind das mehrere Millionen Menschen.",
    },
    {
      kind: "vertiefung",
      title: "Geschlechts- und Altersverteilung",
      body: [
        "Chronischer Kreuzschmerz tritt bei Frauen geringfügig häufiger auf als bei Männern (Verhältnis ca. 1,2:1). Die Spitzenprävalenz liegt zwischen dem 40. und 60. Lebensjahr; danach nimmt sie wieder leicht ab. Das widerspricht der populären Erwartung, dass Rückenschmerz im hohen Alter zunimmt. Tatsächlich nimmt zwar die strukturelle Degeneration zu, die Schmerzwahrnehmung der Älteren ist aber oft geringer – ein weiterer Hinweis darauf, dass Befund und Schmerz auseinanderfallen können (siehe Lektion 1.4).",
        "Internationale Daten (Global Burden of Disease 2019) zeigen Kreuzschmerz als die weltweit häufigste Ursache für Jahre mit Behinderung. Vor Depression, vor Migräne, vor Herz-Kreislauf-Erkrankungen. Das ist die globale Größenordnung des Themas.",
      ],
    },
    {
      kind: "keyTakeaway",
      body: [
        "Die wichtigste Information aus diesen Zahlen für dich persönlich: Du bist nicht allein, und du bist nicht ein medizinischer Sonderfall. Du bist Teil einer großen Gruppe von Menschen, deren Mechanismen heute besser verstanden werden als noch vor 20 Jahren und für die zunehmend wirksame Werkzeuge existieren – Werkzeuge, die diese Masterclass dir vermittelt.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Innenperspektive",
      text: "Aber meine Situation ist anders — oder?",
    },
    {
      kind: "paragraph",
      text: "Vielleicht denkst du beim Lesen: Okay, große Gruppe – aber meine Situation ist schon speziell. Sehr wahrscheinlich nicht so speziell, wie es sich aus der Innenperspektive anfühlt. Das ist nicht abwertend gemeint – es ist eine Beobachtung aus tausenden Sprechstunden.",
    },
    {
      kind: "bulletList",
      title: "Was in der Innenperspektive einzigartig wirkt:",
      items: [
        "die spezifische Schmerz-Topographie (genau diese Stelle, genau in dieser Art)",
        "die scheinbar einmalige Auslöser-Geschichte (das Heben dieser einen Kiste, der Sturz beim Skifahren vor sieben Jahren)",
        "die persönlichen Lebensumstände, in denen der Schmerz besonders schwer wiegt",
        "das Empfinden, dass meine Diagnose irgendwie kompliziert ist",
      ],
    },
    {
      kind: "paragraph",
      text: "Was sich in der Außensicht zeigt: All das gibt es bei vielen. Schmerz-Topographien variieren, sind aber nicht beliebig – sie folgen anatomischen und neurologischen Mustern, die sich klassifizieren lassen. Auslöser-Geschichten ähneln sich erstaunlich, wenn man genug Menschen gehört hat. Lebensumstände unterscheiden sich, aber die Mechanismen darunter sind ähnlich.",
    },
    {
      kind: "paragraph",
      text: "Diese Aussage ist keine Verkleinerung deiner Erfahrung – sie ist Befreiung von der Last des Einzelfalls. Wenn du Teil einer großen Gruppe bist, dann sind die Werkzeuge, die für diese Gruppe entwickelt wurden, mit hoher Wahrscheinlichkeit auch für dich anwendbar. Du musst nicht in eine maßgeschneiderte Therapie investieren, die es für deinen einzigartigen Fall braucht. Du kannst von einem gut konzipierten Standard-Toolkit ausgehen – und das innerhalb dieses Standards individuell adaptieren.",
    },
    {
      kind: "paragraph",
      text: "Das macht diese Masterclass möglich.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Das Erleichterungs-Phänomen",
      body: [
        "Patienten, denen ich die statistische Größenordnung erkläre, reagieren in einem von zwei Mustern. Manche werden zunächst irritiert: „Heißt das, mein Schmerz ist nicht so schlimm, wie ich denke?“ Nein, das heißt es nicht. Dein Schmerz ist genau so schlimm, wie du ihn erlebst – Schmerz ist subjektiv und gilt.",
        "Die zweite Reaktion, die häufigere, ist eine spürbare Erleichterung. „Also bin ich nicht der einzige.“ Genau. Du bist nicht der einzige. Du bist nicht einmal in einer kleinen Minderheit. Du bist in einer der größten gesundheitlichen Erfahrungsgruppen, die Menschen weltweit teilen. Das nimmt dem Problem etwas von seiner Einsamkeit – und Einsamkeit ist einer der stärksten Schmerzverstärker, die wir kennen.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Im eigenen Leben",
      text: "Ein Hinweis zur Diagnose-Vielfalt",
    },
    {
      kind: "paragraph",
      text: "Wenn du in deiner Akte mehrere unterschiedliche Diagnosen über die Jahre angesammelt hast, gibt es zwei Möglichkeiten:",
    },
    {
      kind: "bulletList",
      items: [
        "Möglichkeit 1: Die Diagnosen widersprechen sich tatsächlich, weil verschiedene Behandler unterschiedliche Erklärungsmodelle bevorzugen. Das ist unschön, aber häufig. Du musst dich nicht zwischen Bandscheiben-Diagnose und ISG-Diagnose entscheiden – beide können auf dieselbe biologische Lage zeigen, nur aus unterschiedlichen Winkeln.",
        "Möglichkeit 2: Die Diagnosen ergänzen sich. Bandscheibenprotrusion L5/S1 plus ISG-Dysfunktion plus muskuläre Dysbalance können gemeinsam dein Bild beschreiben – jede Komponente ist ein Beitrag.",
      ],
    },
    {
      kind: "paragraph",
      text: "In beiden Fällen ist die Konsequenz für die Selbstanwendung im Rahmen dieser Masterclass dieselbe: du behandelst die zugrunde liegende Familie, nicht die Etiketten. Mobilisation, Stabilisation, Belastungstoleranz, Atmung, Pacing, Coping – diese Werkzeuge wirken auf alle vier Mechanismus-Familien gleichzeitig. Sie sind nicht etiketten-spezifisch, sondern mechanismen-spezifisch.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht weniger seriös – das ist moderner. Internationale Leitlinien gehen genau in diese Richtung: weg von der etiketten-basierten Behandlung, hin zur mechanismen-basierten Therapie.",
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Meine Diagnose-Landkarte",
    timing:
      "Keine formale Übung in dieser Lektion · diese kurze Reflexion hilft dir, dein eigenes Diagnose-Karussell zu sortieren",
    theorieRueckbindung: [
      "Du hast gesehen, dass viele Diagnose-Etiketten dieselbe biologische Familie aus unterschiedlichen Winkeln beschreiben. Sortiere hier deine eigene Geschichte – nicht als Diagnose, sondern als Orientierung.",
    ],
    blocks: [
      {
        kind: "note",
        field: {
          id: "etiketten",
          label:
            "Welche Diagnose-Etiketten hast du selbst schon gehört? Schreibe sie der Reihe nach auf.",
          rows: 5,
        },
      },
      {
        kind: "note",
        field: {
          id: "verunsichert",
          label:
            "Welche dieser Etiketten haben dich besonders verunsichert? Welche fühlten sich plausibel an?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "familie",
          label:
            "Wenn du deine Etiketten als unterschiedliche Schichten einer Lage betrachtest – was verbindet sie vielleicht?",
          rows: 4,
        },
      },
      {
        kind: "hint",
        text: "Diese Übung ersetzt keine ärztliche Diagnose – sie hilft dir nur, deine Geschichte zu ordnen.",
      },
    ],
  },

  zusammenfassung: [
    "Viele Diagnose-Etiketten beschreiben ähnliche Phänomene aus unterschiedlichen Beobachtungswinkeln – sie widersprechen sich oft weniger, als es aussieht.",
    "Chronischer Kreuzschmerz beruht auf einem Zusammenspiel von vier Mechanismus-Familien: strukturell-biomechanisch, neurosensibilisierend, vegetativ-immunologisch, psychosozial-kognitiv. Wirksame Behandlung adressiert alle vier.",
    "Etwa 85 % aller Menschen erleben einmal im Leben Kreuzschmerz, etwa 5–10 % chronifizieren. Du bist nicht in einer Sondergruppe, sondern in einer großen Gruppe.",
    "Unspezifischer Kreuzschmerz ist keine Diagnoselücke – es ist eine präzise Klassifikation, die in 85–90 % aller Fälle korrekt ist und die mechanismen-basierte Therapie nahelegt.",
    "Das in der Masterclass vermittelte Toolkit ist etiketten-übergreifend wirksam, weil es auf den gemeinsamen Mechanismen-Familien aufsetzt.",
  ],

  querverweise: [
    {
      label: "Lektion 1.1 und 1.2",
      text: "vertiefen die anatomischen Strukturen (Wirbel, Bandscheiben, Facettengelenke, Muskeln, Faszien, Nerven, ISG), die hinter den meisten der hier genannten Etiketten stehen.",
    },
    {
      label: "Lektion 1.3",
      text: "behandelt das, was „chronisch“ biologisch wirklich bedeutet – inklusive zentraler Sensibilisierung.",
    },
    {
      label: "Lektion 1.4",
      text: "klärt das MRT-Paradox: warum strukturelle Befunde und Schmerzempfinden oft auseinanderfallen.",
    },
    {
      label: "Anhang: Glossar",
      text: "alphabetisches Verzeichnis der hier eingeführten Begriffe mit präzisen Kurzdefinitionen.",
    },
  ],

  notizfeld: {
    id: "notiz-I.2",
    label: "Notizfeld",
    helper:
      "Welche Diagnose-Etiketten hast du selbst schon gehört? Welche haben dich besonders verunsichert? Welche fühlten sich plausibel an?",
    rows: 14,
  },
};
