import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 1.1 „Anatomie der LWS Teil 1:
 * Wirbel, Bandscheiben, Facetten".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 1.1", Z. 1244–1616). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 1 ist Anatomie/Theorie — es existieren keine Übungsfotos,
 * daher kein `image`-Block; Abbildungen werden als Text wiedergegeben.
 */
export const WORKBOOK_M1_1: WorkbookData = {
  lessonId: "1.1",
  nr: "1.1",
  sectionLabel: "Modul 1 · Verstehen",
  title: "Anatomie der LWS Teil 1: Wirbel, Bandscheiben, Facetten",
  subtitle:
    "Wer die Struktur seines Rückens versteht, hat ein anderes Verhältnis zu Schmerz und Bewegung — eine genauere Vorstellung ist therapeutisch wirksam.",
  meta: {
    audio: "Audio-Dauer: 18–20 Min",
    lese: "Lese-Zeit Workbook: 35–45 Min",
    uebung: "mit Übung 1.1",
  },

  objectives: [
    "den Aufbau der Lendenwirbelsäule auf Strukturebene erklären können,",
    "den Bauplan einer Bandscheibe verstehen und wissen, warum sie nicht verrutscht,",
    "die Rolle der Facettengelenke als Bewegungs- und Belastungsorgan einordnen,",
    "die Zusammenhänge zwischen Struktur, Funktion und Belastung im Alltag praktisch nachvollziehen,",
    "die Übung 1.1 abgeschlossen haben, mit der du deine eigene anatomische Topographie kartierst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Einstieg",
      text: "Warum Anatomie — und warum in dieser Tiefe?",
    },
    {
      kind: "lead",
      text: "Du arbeitest dich gleich durch eine recht ausführliche anatomische Lektion. Bevor wir starten, drei Gründe, warum sich diese Investition lohnt.",
    },
    {
      kind: "paragraph",
      text: "Erstens: Wer die Struktur seines Rückens versteht, hat ein anderes Verhältnis zu Schmerz und Bewegung als wer mit einer vagen Vorstellung „irgendwas mit Bandscheibe“ lebt. Das ist messbar – Patientenedukation senkt die Schmerzintensität und das Angstniveau (zahlreiche RCTs der letzten 15 Jahre).",
    },
    {
      kind: "paragraph",
      text: "Zweitens: Die populären Bilder vom Rücken sind oft falsch oder irreführend. „Bandscheiben rutschen heraus.“ „Wirbel verschieben sich.“ „Mein Rücken ist kaputt.“ Solche Vorstellungen prägen das Schmerzverhalten – und sie sind weitgehend unrichtig. Eine genauere Vorstellung ist therapeutisch wirksam.",
    },
    {
      kind: "paragraph",
      text: "Drittens: Die Übungen aus Modul 2 (Mobilisation, Stabilisation, Belastungstoleranz) werden klarer, wenn du verstehst, welche Strukturen sie ansprechen. Hip Hinge ist nicht irgendeine Bewegung – Hip Hinge ist die kontrollierte Lasteinleitung in die Bandscheiben unter Schutz der Facettengelenke. Das versteht man besser, wenn man weiß, was Bandscheiben und Facettengelenke sind.",
    },

    {
      kind: "heading",
      eyebrow: "Überblick",
      text: "Die Wirbelsäule als Ganzes",
    },
    {
      kind: "paragraph",
      text: "Die menschliche Wirbelsäule besteht aus 33–34 Wirbeln, die in fünf Abschnitte gegliedert sind.",
    },
    {
      kind: "table",
      caption: "Abschnitte der Wirbelsäule",
      headers: ["Abschnitt", "Wirbelzahl", "Beweglichkeit", "Belastung"],
      rows: [
        ["Halswirbelsäule (HWS)", "7 (C1–C7)", "Sehr hoch", "Niedrig (Kopfgewicht)"],
        [
          "Brustwirbelsäule (BWS)",
          "12 (T1–T12)",
          "Mittel, durch Rippenkorb stabilisiert",
          "Mittel",
        ],
        ["Lendenwirbelsäule (LWS)", "5 (L1–L5)", "Hoch", "Sehr hoch"],
        ["Kreuzbein (Os sacrum)", "5 verschmolzene (S1–S5)", "Praktisch null", "Sehr hoch"],
        ["Steißbein (Os coccygis)", "4–5 verschmolzene", "Praktisch null", "Niedrig"],
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Anordnung ist kein Zufall: Die Wirbelsäule ist im Kompromiss zwischen Stabilität (Stützfunktion für den aufrechten Gang) und Mobilität (Bewegungsfähigkeit in alle Richtungen) konstruiert. Verschiedene Abschnitte gewichten diese beiden Faktoren unterschiedlich.",
    },
    {
      kind: "bulletList",
      items: [
        "HWS: maximale Mobilität, dafür instabilst – Verletzungen häufig",
        "BWS: stabilster Bereich durch Rippenanbindung, dafür weniger beweglich",
        "LWS: hoher Bewegungsspielraum bei gleichzeitig hoher Lastaufnahme – ein anspruchsvoller Kompromiss",
      ],
    },
    {
      kind: "paragraph",
      text: "Genau dieser Kompromiss in der LWS ist der Grund, warum chronischer Kreuzschmerz so häufig ist. Die LWS muss gleichzeitig viel tragen und viel bewegen können – eine biomechanisch heikle Konstellation.",
    },

    {
      kind: "heading",
      eyebrow: "Bauplan",
      text: "Die Lendenwirbelsäule: Bauplan und Doppelbogen",
    },
    {
      kind: "paragraph",
      text: "Die LWS besteht aus fünf großen Wirbelkörpern (L1 bis L5), die in einer charakteristischen lordotischen Krümmung angeordnet sind – das heißt: nach vorne gewölbt, mit dem Scheitelpunkt etwa auf Höhe von L3. Diese Krümmung ist physiologisch (also gesund) und sie ist funktional notwendig: sie verteilt die Last in der vertikalen Achse so, dass der Schwerpunkt des Oberkörpers über dem Becken bleibt.",
    },
    {
      kind: "paragraph",
      text: "Bei der populären Aussage „Sie haben ein zu starkes Hohlkreuz“ oder „Ihre Lordose ist zu flach“ ist Vorsicht angebracht. Die normale Lordose-Tiefe variiert individuell stark, und der Zusammenhang zur Schmerzentstehung ist deutlich schwächer als populär angenommen. Mehr dazu in Lektion 3.2 (Haltungs-Mythen).",
    },
    {
      kind: "vertiefung",
      title: "Der Doppelbogen-Aufbau eines Wirbels",
      body: [
        "Ein einzelner LWS-Wirbel besteht aus zwei Hauptteilen, die eine raffinierte Aufgabenteilung haben:",
        "1. Wirbelkörper (Corpus vertebrae) – der massive vordere Anteil. Hauptaufgabe: Lastaufnahme. Das ist die Säule, die trägt. Bei chronischem Kreuzschmerz sind die Wirbelkörper sehr selten direkter Schmerzgenerator – sie sind robust gebaut und werden in der Regel nur bei Frakturen oder Tumoren symptomatisch.",
        "2. Wirbelbogen (Arcus vertebrae) – der hintere, ringförmige Anteil. Bildet zusammen mit dem Wirbelkörper das Foramen vertebrale, in dem das Rückenmark verläuft. Vom Wirbelbogen gehen sieben Fortsätze ab: ein Dornfortsatz (das, was du am Rücken als knöcherne Erhebung tasten kannst), zwei Querfortsätze, vier Gelenkfortsätze (zwei nach oben, zwei nach unten gerichtet, sie bilden die Facettengelenke).",
        "Diese Doppelbogen-Konstruktion ist evolutionär elegant: die Lastaufnahme passiert vorne (über die Wirbelkörper und Bandscheiben), die Bewegungssteuerung und Stabilisierung passiert hinten (über die Facettengelenke und Bänder). Wenn diese Aufgabenteilung gestört ist – etwa weil die hintere Säule überlastet wird – kann das schmerzhaft werden.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Bandscheibe",
      text: "Die Bandscheibe: das meistbeschuldigte Struktur-Element",
    },
    {
      kind: "paragraph",
      text: "Zwischen je zwei Wirbelkörpern liegt eine Bandscheibe (Discus intervertebralis). In der LWS gibt es somit 5 Bandscheiben (L1/L2, L2/L3, L3/L4, L4/L5, L5/S1). Die unteren beiden (L4/L5 und L5/S1) tragen am meisten Last und sind statistisch am häufigsten von Veränderungen betroffen.",
    },
    {
      kind: "paragraph",
      text: "Eine Bandscheibe ist nicht ein einheitliches Polster, wie man populär denkt, sondern ein zweischichtiges Bauelement.",
    },
    {
      kind: "bulletList",
      title: "Nucleus pulposus (innerer Gallertkern)",
      items: [
        "Gelartige Masse mit hohem Wassergehalt (70–90 % Wasser bei jungen Erwachsenen, abnehmend mit Alter)",
        "Hauptaufgabe: hydrostatische Druckverteilung – wie ein Wasserkissen",
        "Wird beim Stehen oder Heben zusammengedrückt (Wasser wird abgegeben), entlastet sich beim Liegen (Wasser kehrt zurück)",
        "Dieses tägliche Auf- und Ab erklärt, warum Menschen morgens etwa 1,5–2 cm größer sind als abends",
      ],
    },
    {
      kind: "bulletList",
      title: "Anulus fibrosus (äußerer Faserring)",
      items: [
        "Mehrere konzentrische Lagen straffer Bindegewebsfasern",
        "Jede Lage versetzt zur nächsten – wie Reifenkord",
        "Aufgabe: Begrenzung der Nucleus-Bewegung, Aufnahme von Scher- und Torsionskräften",
        "Wenn Risse im Faserring entstehen, kann sich der Nucleus nach außen verlagern → das ist ein Bandscheibenvorfall",
      ],
    },
    {
      kind: "vertiefung",
      title: "Die Bandscheibe rutscht nicht heraus",
      body: [
        "Die populäre Vorstellung „Meine Bandscheibe ist rausgerutscht“ ist anatomisch falsch und therapeutisch ungünstig. Die Bandscheibe ist fest verwachsen mit den oberen und unteren Wirbelkörper-Deckplatten – sie kann nicht als Ganzes herausgleiten.",
        "Was tatsächlich bei einem Bandscheibenvorfall passiert: Risse im Anulus fibrosus ermöglichen, dass Anteile des inneren Nucleus pulposus durch die Fasern hindurch nach außen quellen. Es ist also kein Verschieben der Bandscheibe, sondern ein lokales Durchquellen von Material durch einen Riss. Bildlich: nicht ein verschobenes Polster, sondern eine Tube Zahnpasta, aus der durch ein Loch ein bisschen Inhalt austritt.",
        "Diese Präzisierung hat therapeutische Konsequenzen. Wer glaubt, seine Bandscheibe rutscht, hat ständig Angst vor erneutem Verrutschen – etwa beim Heben. Wer versteht, dass es um die Fasern und den Inneninhalt geht, hat ein realistisches Bild: Bandscheiben sind robuste Strukturen, die Belastung brauchen (Stoffwechsel) und nicht aktiv verrutschen.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Stoffwechsel",
      text: "Die Bandscheibe lebt — und braucht Bewegung",
    },
    {
      kind: "paragraph",
      text: "Ein zentraler, oft unbekannter Punkt: Bandscheiben werden nicht über Blutgefäße versorgt (bis auf eine schmale Randzone). Sie ernähren sich passiv durch Diffusion – Nährstoffe wandern aus den angrenzenden Wirbelkörpern durch die Deckplatten in die Bandscheibe hinein, Abfallstoffe wandern in umgekehrter Richtung wieder hinaus.",
    },
    {
      kind: "paragraph",
      text: "Dieser Diffusionsprozess funktioniert nur, wenn die Bandscheibe belastet und entlastet wird. Belastung (Stehen, Gehen, Heben) presst Wasser und Abfallstoffe aus der Bandscheibe heraus. Entlastung (Liegen, Sitzen mit angelehntem Rücken) erlaubt der Bandscheibe, frische Nährflüssigkeit und Wasser aufzunehmen.",
    },
    {
      kind: "keyTakeaway",
      title: "Konsequenz",
      body: [
        "Bandscheiben brauchen Bewegungswechsel. Sie hassen sowohl Dauer-Schonung als auch Dauer-Belastung. Was sie lieben, ist rhythmische, abwechselnde Be- und Entlastung. Genau das ist die biomechanische Grundlage dafür, dass Bewegung Bandscheiben gut tut, nicht schadet – auch dann (vielleicht gerade dann), wenn sie degenerativ verändert sind.",
      ],
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Die paradoxe Schonung",
      body: [
        "Ein häufiges Muster: Patienten mit MRT-Befund „Bandscheibenprotrusion L4/L5“ beginnen instinktiv zu schonen. Weniger gehen, weniger heben, mehr liegen. Sie glauben, das hilft der Bandscheibe.",
        "Tatsächlich ist es das Gegenteil. Geschonte Bandscheiben werden schlechter ernährt (weniger Diffusion), verlieren ihre Pufferqualität schneller (weniger Wasserretention), bauen den umgebenden Stützapparat (Muskulatur, Bänder) ab. Nach drei Monaten Schonung ist die Situation schlechter als zu Beginn – nicht trotz, sondern wegen der Schonung.",
        "Diese paradoxe Schonung ist eines der häufigsten therapeutischen Probleme bei chronischem Kreuzschmerz. Sie aufzulösen ist eine der wichtigsten Aufgaben dieser Masterclass.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Facettengelenke",
      text: "Die Facettengelenke: die vergessenen Gelenke",
    },
    {
      kind: "paragraph",
      text: "Zwischen je zwei benachbarten Wirbeln bilden die hinteren Gelenkfortsätze zwei kleine, paarige Gelenke – die Facettengelenke (Articulationes zygapophysiales). Sie sind anatomisch echte Gelenke mit Knorpel, Gelenkkapsel und Synovialflüssigkeit – die meisten Menschen denken bei Wirbelsäule nicht an Gelenke, aber jedes Wirbelpaar hat zwei davon.",
    },
    {
      kind: "numberedList",
      title: "Aufgaben der Facettengelenke",
      items: [
        "Bewegungsführung – sie geben vor, welche Bewegungen die Wirbelsäule machen kann und welche nicht. In der LWS erlauben sie Flexion (Beugen nach vorne), Extension (Strecken nach hinten) und Lateralflexion (Seitneigen), begrenzen aber Rotation (Drehen) erheblich.",
        "Lastaufnahme im Stehen – etwa 15–20 % der Last in der LWS wird von den Facettengelenken getragen, der Rest von Wirbelkörpern und Bandscheiben.",
        "Stabilisierung gegen Scherung – sie verhindern, dass Wirbel gegeneinander verrutschen.",
      ],
    },
    {
      kind: "paragraph",
      text: "Schmerz aus Facettengelenken: Facettengelenke sind reich innerviert und können schmerzhaft werden. Typisches Muster: lokaler tiefer Kreuzschmerz, oft beim Strecken nach hinten (Extension) und beim Drehen, der durch Vornüberbeugen besser wird. Bildbefunde zeigen oft Spondylarthrose – Verschleißzeichen der Facetten. Ob diese tatsächlich der Schmerzgenerator sind, ist im Einzelfall diagnostisch schwer zu beweisen.",
    },
    {
      kind: "vertiefung",
      title: "Facettensyndrom: eine umstrittene Diagnose",
      body: [
        "Der Begriff Facettensyndrom wird in Deutschland häufig vergeben und meist auch behandelt (Facetteninfiltrationen, Radiofrequenzdenervation). Die Datenlage zur Effektivität dieser Therapien ist allerdings deutlich schwächer als die klinische Häufigkeit der Diagnose nahelegen würde.",
        "Cochrane Reviews und systematische Reviews (Maas 2015, Manchikanti 2020) finden moderate kurzfristige Effekte von Facetteninterventionen, aber unklare Langzeitwirkung und hohe Placebo-Anteile. Die internationalen Leitlinien empfehlen Facetteninterventionen deshalb in der Regel als nachrangige Option – nach Versagen konservativer Therapie.",
        "Was bedeutet das für dich? Wenn deine Diagnose Facettensyndrom lautet, ist das eine Beschreibung, keine zwingende Therapieempfehlung. Aktive konservative Therapie (also: diese Masterclass) ist nach Leitlinien Erstlinie, auch bei Facettensyndrom.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Biomechanik",
      text: "Wie Belastung in der LWS verteilt wird",
    },
    {
      kind: "paragraph",
      text: "Wenn du stehst, gehst, hebst – wie verteilt sich die Last in deiner Lendenwirbelsäule? Die Antwort ist überraschend differenziert und macht klar, warum bewegungs- und atmungs-bewusste Strategien (Modul 2) so wichtig sind.",
    },
    {
      kind: "table",
      caption:
        "Last in L5/S1 in typischen Alltags-Aktivitäten (vereinfacht, nach Nachemson und Wilke)",
      headers: ["Aktivität", "Lastfaktor (× Körpergewicht)"],
      rows: [
        ["Liegen flach", "0,3 ×"],
        ["Liegen auf der Seite", "0,7 ×"],
        ["Aufrechtes Stehen", "1,0 ×"],
        ["Aufrechtes Sitzen", "1,4 ×"],
        ["Vorgebeugtes Stehen", "1,8 ×"],
        ["Vorgebeugtes Sitzen", "1,9 ×"],
        ["Heben 10 kg, gebeugt", "4,5 ×"],
        ["Heben 10 kg, mit Hüftbeugung (Hip Hinge)", "2,3 ×"],
        ["Heben 20 kg, sehr gebeugt mit gerundetem Rücken", "6,0 ×"],
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Zahlen sind Modellrechnungen aus In-vivo-Messungen (Wilke 1999, mit instrumentierten Bandscheibenprothesen) und schwanken individuell. Aber sie zeigen die Größenordnung: die Hebetechnik kann die LWS-Belastung um den Faktor 2–3 unterscheiden – bei gleichem Gewicht.",
    },
    {
      kind: "paragraph",
      text: "Konsequenz für den Alltag: Hip Hinge (Hüftgelenks-Beugung, gerader Rücken) statt Round-Back-Heben (gebeugter Rücken) halbiert die Belastung. Das ist die biomechanische Begründung der gleichnamigen Übung aus Modul 2 (ÜK-B1).",
    },
    {
      kind: "paragraph",
      text: "Aber – und das ist wichtig: Die Lastfaktoren sagen nichts über Schmerz. Bandscheiben können kurzzeitig das Vielfache des Körpergewichts tolerieren, ohne Schaden zu nehmen. Was schadet, ist nicht die kurze hohe Last, sondern entweder dauerhafte Fehlbelastung (durch ungünstige Bewegungsmuster über Jahre) oder plötzliche Überbelastung (Sturz, akuter Heberunfall mit Faserring-Riss). Bei normalem Alltag sind die Strukturen erstaunlich tolerant.",
    },

    {
      kind: "heading",
      eyebrow: "Bilanz",
      text: "Eine Bilanz zum Strukturteil",
    },
    {
      kind: "paragraph",
      text: "Du hast jetzt einen ersten anatomischen Überblick. Bevor wir in der nächsten Lektion zu den nicht-knöchernen Strukturen weitergehen (Muskeln, Faszien, Nerven, ISG), drei Schlüsselgedanken zur Vertiefung.",
    },
    {
      kind: "keyTakeaway",
      title: "Drei Schlüsselgedanken",
      body: [
        "1. Strukturen sind robust. Wirbel, Bandscheiben, Facettengelenke sind in normaler Lebenserwartung bemerkenswert tolerant gegen Belastung. Sie haben eine breite Belastungs-Reserve. Schäden entstehen nicht durch normale Belastung – sie entstehen durch akute Überlast, durch dauerhaft ungünstige Muster, oder durch krankheitsbedingte Schwächung.",
        "2. Strukturen brauchen Belastung. Insbesondere Bandscheiben sind aktiv auf rhythmische Be- und Entlastung angewiesen. Schonung schädigt sie. Belastung in moderater, dosierter Form fördert sie. Das gilt grundsätzlich auch bei degenerativen Veränderungen.",
        "3. Struktur ≠ Schmerz. Das wichtigste Take-away. Strukturelle Veränderungen sind häufig und gehören in den meisten Fällen zum normalen Älterwerden. Sie korrelieren nur schwach mit Schmerz. Das MRT-Paradox – ausführlich in Lektion 1.4 – wird dir zeigen, wie schwach diese Korrelation tatsächlich ist.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Anatomie-Kompass: meine eigene Topografie",
    timing: "Geschätzte Bearbeitungszeit: 15–20 Minuten",
    theorieRueckbindung: [
      "Diese Übung ist eine Selbst-Kartierung. Du übersetzt das Gelernte auf deinen eigenen Körper – wo genau sind deine Beschwerden, welche Strukturen sind dort vermutlich beteiligt, welche Bewegungen verändern den Schmerz?",
      "Diese Übersetzung von „Anatomie im Lehrbuch“ zu „Anatomie in mir“ ist therapeutisch wertvoll. Sie verändert die Schmerz-Wahrnehmung von einem diffusen „es tut weh“ zu einem präzisen „hier, in diesem Bereich, möglicherweise diese Struktur, schlimmer bei dieser Bewegung“. Diese Präzision senkt Angst und gibt dir Material für gezielte Gespräche mit Ärzten oder Therapeuten.",
    ],
    anleitung: ["In vier Schritten."],
    blocks: [
      { kind: "step", n: 1, title: "Topografie" },
      {
        kind: "text",
        text: "Beschreibe, wo deine Hauptbeschwerden liegen – Hauptlokalisation, mögliche Ausstrahlung und sekundäre Schmerzpunkte.",
      },
      {
        kind: "note",
        field: {
          id: "topografie",
          label: "Wo sitzt mein Schmerz?",
          helper:
            "Z. B. Hauptlokalisation (X), Ausstrahlung (Pfeil), sekundäre Schmerzpunkte (○).",
          rows: 4,
        },
      },

      { kind: "step", n: 2, title: "Strukturhypothese" },
      {
        kind: "text",
        text: "Welche Strukturen könnten in deiner Schmerz-Region beteiligt sein? Hier raten ist erlaubt – es geht um Hypothesen, nicht um Diagnosen. (Mehrfachnennung möglich.)",
      },
      {
        kind: "checklist",
        id: "struktur",
        label: "Beteiligung wahrscheinlich?",
        items: [
          { id: "bandscheibe", label: "Bandscheibe (welches Niveau?)" },
          { id: "facette", label: "Facettengelenk" },
          { id: "isg", label: "Iliosakralgelenk (ISG)" },
          { id: "muskulatur", label: "Tiefe Rückenmuskulatur" },
          { id: "huefte", label: "Hüftgelenk" },
          { id: "nerv", label: "Nerv mit Ausstrahlung" },
          { id: "andere", label: "Andere Struktur" },
        ],
      },
      {
        kind: "note",
        field: {
          id: "struktur-notiz",
          label: "Notizen zur Strukturhypothese (z. B. welches Bandscheiben-Niveau, welche andere Struktur):",
          rows: 3,
        },
      },

      { kind: "step", n: 3, title: "Bewegungsabhängigkeit" },
      {
        kind: "text",
        text: "Welche Bewegungen oder Positionen verstärken oder lindern deinen Schmerz?",
      },
      {
        kind: "lines",
        id: "verschlimmert",
        label: "Verschlimmert wird der Schmerz durch:",
        lines: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
      },
      {
        kind: "lines",
        id: "gelindert",
        label: "Gelindert wird der Schmerz durch:",
        lines: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
      },

      { kind: "step", n: 4, title: "Tageszeit-Muster" },
      {
        kind: "text",
        text: "Wann am Tag ist es typischerweise schlimmer oder besser? Gib für jede Tageszeit deine typische Schmerzintensität an (0–10).",
      },
      {
        kind: "scale",
        id: "tag-aufwachen",
        label: "Beim Aufwachen",
        minLabel: "kein Schmerz",
        maxLabel: "stärkster Schmerz",
      },
      {
        kind: "scale",
        id: "tag-vormittag",
        label: "Vormittag",
        minLabel: "kein Schmerz",
        maxLabel: "stärkster Schmerz",
      },
      {
        kind: "scale",
        id: "tag-mittag",
        label: "Mittag/Nachmittag",
        minLabel: "kein Schmerz",
        maxLabel: "stärkster Schmerz",
      },
      {
        kind: "scale",
        id: "tag-abend",
        label: "Abend",
        minLabel: "kein Schmerz",
        maxLabel: "stärkster Schmerz",
      },
      {
        kind: "scale",
        id: "tag-einschlafen",
        label: "Beim Einschlafen",
        minLabel: "kein Schmerz",
        maxLabel: "stärkster Schmerz",
      },
      {
        kind: "note",
        field: {
          id: "muster-notiz",
          label: "Auffälligkeiten oder Notizen zum Muster:",
          rows: 3,
        },
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Was hat sich durch diese Übung in meiner Wahrnehmung verändert? Habe ich Klarheit gewonnen oder eher mehr Fragen?",
          rows: 5,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
      {
        kind: "hint",
        text: "Diese Übung ist eine Momentaufnahme. Es lohnt sich, sie nach 4 Wochen erneut auszufüllen und mit der ersten Version zu vergleichen. Sie ist keine Diagnose – sie ist Eigenwahrnehmung in strukturierter Form.",
      },
    ],
  },

  zusammenfassung: [
    "Die Lendenwirbelsäule ist ein biomechanischer Kompromiss zwischen Stabilität und Mobilität – beide auf hohem Niveau gefordert.",
    "Bandscheiben sind zweischichtig gebaut (Nucleus + Anulus) und ernähren sich durch Diffusion bei rhythmischer Be- und Entlastung – sie brauchen Bewegung.",
    "Die Vorstellung „meine Bandscheibe ist rausgerutscht“ ist anatomisch falsch. Was bei einem Vorfall passiert: Material des inneren Nucleus quillt durch Risse im äußeren Faserring – kein Verrutschen der Bandscheibe als Ganzes.",
    "Facettengelenke sind oft vergessene, aber relevante Gelenke. Sie steuern Bewegung, nehmen Last auf, stabilisieren – und können selbst schmerzhaft werden.",
    "Hebetechnik macht den Unterschied: Hip Hinge halbiert die LWS-Belastung gegenüber gebeugter Hebetechnik bei gleichem Gewicht. Basis vieler Übungen in Modul 2.",
  ],

  querverweise: [
    {
      label: "Lektion 1.2",
      text: "behandelt die nicht-knöchernen Strukturen: Muskeln, Faszien, Nerven, ISG. Sie vervollständigt das anatomische Bild.",
    },
    {
      label: "Lektion 1.4",
      text: "behandelt das MRT-Paradox: warum die hier beschriebenen strukturellen Veränderungen oft nicht mit Schmerz korrelieren.",
    },
    {
      label: "Modul 2 — Lektion 2.2",
      text: "vertieft praktische Mobilisationsübungen, die direkt aus der Bandscheiben-Diffusionsbiologie abgeleitet sind.",
    },
    {
      label: "Übungskartendeck — ÜK-B1 (Hip Hinge)",
      text: "ist die zentrale Anwendung der hier vermittelten Hebetechnik-Erkenntnisse.",
    },
    {
      label: "Anhang: Glossar",
      text: "für präzise Definitionen von Nucleus pulposus, Anulus fibrosus, Facettengelenk, Lordose.",
    },
  ],

  notizfeld: {
    id: "notiz-1.1",
    label: "Notizfeld",
    helper:
      "Eigene Gedanken zur Anatomie und zu deinem eigenen Rücken. Was wusstest du, was hat dich überrascht, was willst du dir merken?",
    rows: 12,
  },
};
