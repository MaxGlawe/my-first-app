import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 1.2 „Anatomie der LWS Teil 2:
 * Muskeln, Faszien, Nerven, ISG".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 1.2", Z. 1616–1949). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 1 ist Anatomie/Theorie — es existieren keine Übungsfotos,
 * daher kein `image`-Block; Abbildungen werden als Text wiedergegeben.
 */
export const WORKBOOK_M1_2: WorkbookData = {
  lessonId: "1.2",
  nr: "1.2",
  sectionLabel: "Modul 1 · Verstehen",
  title: "Anatomie der LWS Teil 2: Muskeln, Faszien, Nerven, ISG",
  subtitle:
    "Die aktiven Strukturen — Muskeln, Faszien, Nerven, ISG — kannst du durch Training und Mobilisation beeinflussen. Die knöchernen nicht.",
  meta: {
    audio: "Audio-Dauer: 20–22 Min",
    lese: "Lese-Zeit Workbook: 40–50 Min",
    uebung: "mit Übung 1.2",
  },

  objectives: [
    "die wichtigsten Muskelgruppen des unteren Rückens und der Hüftumgebung kennen,",
    "die Rolle der Faszien im Schmerz- und Bewegungssystem einordnen können,",
    "ein klares Bild der Nervenversorgung der unteren Wirbelsäule haben (Nervenwurzeln, Plexus, periphere Nerven),",
    "das Iliosakralgelenk (ISG) funktional verstehen und die Kontroverse um seinen Schmerzbeitrag einordnen,",
    "die Übung 1.2 abgeschlossen haben, mit der du dein eigenes Muskel- und Bewegungsmuster kartierst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Einstieg",
      text: "Warum dieses Kapitel entscheidend ist",
    },
    {
      kind: "lead",
      text: "Lektion 1.1 hat die Säulen der Lendenwirbelsäule beschrieben – die knöchernen Strukturen, die Bandscheiben, die Facettengelenke. Diese Strukturen sind die Bühne. Diese Lektion behandelt die Akteure: Muskeln und Faszien (die alles bewegen), Nerven (die alles steuern und melden), und das Iliosakralgelenk (das Becken und Wirbelsäule verbindet).",
    },
    {
      kind: "paragraph",
      text: "Diese aktiven Strukturen sind viel häufiger Schmerzgeneratoren als die knöchernen Säulen aus Lektion 1.1. Sie sind außerdem die Strukturen, die durch Training und Mobilisation – also durch das, was wir in Modul 2 lernen – am stärksten beeinflusst werden können. Die knöchernen Strukturen kannst du nicht ändern. Muskeln, Faszien, Nerven und das ISG schon.",
    },

    {
      kind: "heading",
      eyebrow: "Muskulatur",
      text: "Die Muskulatur der Lendenwirbelsäule",
    },
    {
      kind: "paragraph",
      text: "Die Muskulatur des unteren Rückens und der Hüftumgebung lässt sich funktionell in drei Schichten gliedern, von tief nach oberflächlich. Diese Gliederung ist nicht nur anatomisch wichtig – sie ist die Grundlage für das Verständnis modernen Rumpftrainings.",
    },
    {
      kind: "subheading",
      text: "Schicht 1: Tiefe lokale Stabilisatoren",
    },
    {
      kind: "paragraph",
      text: "Diese Muskeln liegen direkt an der Wirbelsäule und sind klein, aber funktional entscheidend. Ihre Aufgabe ist nicht Kraft erzeugen, sondern Stabilität sichern – sie halten die einzelnen Wirbel präzise zueinander, bevor größere Bewegungen passieren.",
    },
    {
      kind: "bulletList",
      items: [
        "Musculus multifidus — die wichtigsten tiefen Stabilisatoren der LWS. Liegen direkt neben den Dornfortsätzen, in mehreren Etagen, mit kurzen Faserlängen. Stabilisieren segmentweise zwischen je zwei Wirbeln. Bei chronischem Kreuzschmerz atrophieren die Multifidi häufig auf der schmerzhaften Seite – nachweislich auch im MRT (fettige Degeneration). Das ist eine der wichtigsten Strukturveränderungen bei chronischem Schmerz.",
        "Musculus transversus abdominis (TVA) — der tiefste der Bauchmuskeln. Verläuft horizontal um den Bauchraum wie ein Korsett. Stabilisiert die Wirbelsäule von vorne durch Erzeugung von intra-abdominalem Druck. Wirkt synergistisch mit Multifidus, Beckenboden und Diaphragma als sogenanntes „deep core system“.",
        "Beckenbodenmuskulatur — geschlossener Boden des kleinen Beckens, von Schambein bis Steißbein. Aufgaben: Halt der Beckenorgane, Kontrolle von Blase und Mastdarm, Mitsteuerung des intra-abdominalen Drucks. Eng vernetzt mit Atmung und Rumpfstabilisation.",
        "Diaphragma (Zwerchfell) — Hauptatemmuskel, gleichzeitig „Deckel“ des Bauchraumes. Wirkt mit Beckenboden und TVA als Druckmodulator. Atemkontrolle ist deshalb auch Rumpfstabilitäts-Kontrolle (mehr dazu in Lektion 2.5).",
      ],
    },
    {
      kind: "vertiefung",
      title: "Die „deep core“-Synergie",
      body: [
        "Multifidus, Transversus abdominis, Beckenboden und Diaphragma bilden zusammen eine funktionelle Einheit, die in der Fachliteratur als „deep core“ oder „inner unit“ bezeichnet wird. Diese vier Muskeln arbeiten nicht isoliert, sondern als koordiniertes System, das den intra-abdominalen Druck reguliert und der Wirbelsäule eine vorhersehende Stabilität gibt – sie aktivieren sich Millisekunden vor einer Belastungsspitze.",
        "Bei chronischem Rückenschmerz ist dieses Vorhersehverhalten häufig gestört. Studien (Hodges & Richardson 1996, Schabrun & Hodges 2013) zeigen, dass die TVA-Voraktivierung bei chronischen Schmerzpatienten verzögert ist – die Stabilisierung „kommt zu spät“, die Wirbelsäule erfährt höhere mechanische Spitzen.",
        "Konsequenz: gezielte Reaktivierung dieses Systems ist eine der wirksamsten Interventionen bei chronischem Rückenschmerz. Sie ist die Grundlage der Stabilisationsübungen in Modul 2.3.",
      ],
    },
    {
      kind: "subheading",
      text: "Schicht 2: Mittlere Bewegungserzeuger",
    },
    {
      kind: "paragraph",
      text: "Diese Muskeln sind größer und produzieren Bewegung in verschiedenen Achsen.",
    },
    {
      kind: "bulletList",
      items: [
        "Musculus erector spinae — die langen Rückenstrecker. Verlaufen beidseits der Wirbelsäule vom Becken bis zum Kopf. Bei der Extension (Strecken nach hinten) und beim aufrechten Stehen ständig leicht aktiv. Bei chronischem Rückenschmerz oft chronisch erhöht in Tonus und Spannung.",
        "Musculus quadratus lumborum (QL) — viereckiger Muskel zwischen letztem Rippenbogen und Beckenkamm, lateral der LWS. Aufgabe: seitliches Beugen und stabilisierende Halten der LWS. Häufige Schmerzquelle bei einseitiger Belastung (z. B. einseitiges Tragen schwerer Taschen über lange Zeit).",
        "Schräge Bauchmuskeln (Mm. obliqui externus und internus) — formen die seitliche Bauchwand, beteiligt an Rotation und seitlicher Beugung. Wichtig für die Drehmoment-Stabilisierung der LWS bei rotatorischen Belastungen.",
        "Musculus rectus abdominis — der „Sixpack“-Muskel. Beuger der Wirbelsäule. Weniger wichtig für Stabilität als populär angenommen – tatsächliche Stabilitätsleistung kommt von TVA und Schichten dahinter.",
      ],
    },
    {
      kind: "subheading",
      text: "Schicht 3: Hüftmuskulatur — der unterschätzte Spieler",
    },
    {
      kind: "paragraph",
      text: "Hier wird es wichtig. Die Hüftmuskulatur ist bei chronischem Kreuzschmerz fast immer mit beteiligt – entweder als geschwächte Mit-Ursache oder als kompensatorisch überaktive Folge.",
    },
    {
      kind: "bulletList",
      items: [
        "Musculus iliopsoas — bestehend aus Iliacus (Beckenmuskel) und Psoas major (großer Lendenmuskel). Der Psoas major verläuft direkt durch den Bauchraum und hat seinen Ursprung an den LWS-Wirbelkörpern. Verkürzter Psoas → ständiger Zug an der LWS nach vorne → verstärktes Hohlkreuz → mögliche Schmerzentwicklung.",
        "Musculus gluteus maximus — der große Gesäßmuskel. Hauptstrecker der Hüfte. Bei chronischem Sitzen oft „verschlafen“ – das nennt man gluteale Amnesie. Schwache Glutealmuskulatur verlagert Last in die LWS (mehr LWS-Streckung statt Hüftstreckung) und auf andere Muskeln.",
        "Musculus gluteus medius — seitlicher Gesäßmuskel. Stabilisiert das Becken beim Gehen und Stehen auf einem Bein. Schwäche → Beckenkippung → einseitige LWS-Belastung. Eine der häufigsten Schwachstellen bei einseitigem Kreuzschmerz.",
        "Musculus piriformis — kleiner Muskel im tiefen Gesäß, durch den der Nervus ischiadicus verläuft (oder bei Variationen neben dem Nerv). Verspannungen können auf den Nerv drücken — das Piriformis-Syndrom mit pseudo-radikulärer Ausstrahlung ins Bein.",
        "Hüftbeuger und Adduktoren — ergänzende Muskelgruppen, die bei chronischem Sitzen oft verkürzt sind und die hüftnahe Beweglichkeit einschränken.",
      ],
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Das Gluteus-Phänomen",
      body: [
        "Etwa zwei Drittel der chronischen Kreuzschmerzpatienten, die ich sehe, haben einen messbaren Gluteus-medius-Schwächegrad – oft asymmetrisch, mit der schmerzhaften Seite stärker betroffen. Ein einfacher Test: einbeiniger Stand mit Augen geschlossen, 30 Sekunden – schaukelt das Becken oder kippt es zur Spielbeinseite, ist Gluteus medius geschwächt.",
        "Die Behandlung dieser Schwäche ist oft erstaunlich wirksam für den Rückenschmerz – obwohl der Patient sie nicht spürt. Das ist ein gutes Beispiel dafür, dass der Ort des Schmerzes nicht der Ort der Ursache sein muss.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Faszie",
      text: "Die Faszie: das lange unterschätzte Bindegewebe",
    },
    {
      kind: "paragraph",
      text: "In den letzten 15 Jahren hat sich das Verständnis der Rolle von Faszien im Bewegungssystem dramatisch erweitert. Lange wurden Faszien als reines „Verpackungsmaterial“ betrachtet, das Muskeln zusammenhält. Heute weiß man: Faszien sind ein eigenständiges, sensorisch reiches, mechanisch hochrelevantes Gewebe.",
    },
    {
      kind: "paragraph",
      text: "Was sind Faszien? Faszien sind bindegewebige Hüllen, die Muskeln, Organe, Knochen und Gefäße umgeben und verbinden. Sie bilden ein durchgängiges Netzwerk im gesamten Körper. Das Fascia thoracolumbalis (thorakolumbale Faszie) ist die wichtigste Faszienstruktur für den unteren Rücken – eine kräftige Bindegewebshülle, die die Rückenmuskulatur überspannt und Kraftübertragung zwischen Schultergürtel, Rumpf und Becken vermittelt.",
    },
    {
      kind: "numberedList",
      title: "Funktionen der Faszien",
      items: [
        "Kraftübertragung – ein Faszien-Strang kann Kraft über weite Strecken übertragen, ähnlich wie eine Sehne. Die Rückenstrecker übertragen ihre Kraft teilweise über die thorakolumbale Faszie auf den gegenüberliegenden Glutealmuskel – die sogenannte „posterior oblique sling“.",
        "Sensorik – Faszien sind reich an Mechanorezeptoren und freien Nervenendigungen. Sie melden Spannung, Dehnung, Schmerz.",
        "Hydraulische Pufferung – das Faszienwasser dämpft Stoßbelastungen.",
        "Bewegungsökonomie – elastische Komponenten der Faszie sparen Muskelenergie bei wiederkehrenden Bewegungen.",
      ],
    },
    {
      kind: "vertiefung",
      title: "Faszien als Schmerzgenerator",
      body: [
        "Studien der letzten Jahre (Schleip 2012, Tesarz 2011) zeigen, dass die thorakolumbale Faszie selbst eine erhebliche Schmerzquelle sein kann. In Experimenten wurde nachgewiesen, dass die Faszie bei mechanischer Reizung Schmerzempfindungen erzeugt, die sich in Qualität und Lokalisation deutlich vom „muskulären Schmerz“ unterscheiden.",
        "Bei chronischem Rückenschmerz finden sich faszienspezifische Veränderungen: Verklebungen zwischen den Schichten, reduzierte Gleitfähigkeit, lokale Verdickungen. Diese Veränderungen lassen sich durch dynamische Mobilisation und gezielte Faszientechniken (myofasziale Mobilisation, Foam Rolling) positiv beeinflussen.",
        "Die Konsequenz für die Praxis: Übungen, die nicht nur Muskeln stärken, sondern auch Faszien gleitfähig halten, sind bei chronischem Kreuzschmerz besonders wirksam. Genau das tun viele der Mobilisations- und Belastungsübungen in Modul 2.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Nerven",
      text: "Nerven — wie deine LWS Steuerung führt und Meldungen austauscht",
    },
    {
      kind: "paragraph",
      text: "Aus jedem Wirbelsegment der LWS treten paarige Spinalnerven aus (L1 bis L5 + S1 als sakraler Nerv). Diese Nerven steuern die Muskulatur und liefern Empfindungen aus Haut, Muskeln, Bändern, Faszien und Bandscheiben.",
    },
    {
      kind: "table",
      caption: "Spinalnerven und ihre Hauptgebiete",
      headers: ["Nervenwurzel", "Empfindung (Haut)", "Wichtigste Muskelfunktion", "Reflex"],
      rows: [
        ["L1", "Leistenregion", "–", "–"],
        ["L2", "Vorderer Oberschenkel", "Hüftbeugung", "–"],
        ["L3", "Innenseite Oberschenkel/Knie", "Knieextension", "Patellarsehnen"],
        ["L4", "Innenseite Unterschenkel", "Knieextension", "Patellarsehnen"],
        ["L5", "Außenseite Unterschenkel, Fußrücken", "Großzehen-Hebung", "–"],
        ["S1", "Wadenrückseite, Außenseite Fuß", "Plantarflexion (Zehenstand)", "Achillessehnen"],
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Tabelle hat klinische Bedeutung: Wenn du eine genaue Schmerzausstrahlung in einem bestimmten Bein-Areal hast, kann das auf eine bestimmte Nervenwurzel hinweisen. Eine Ausstrahlung in den Großzehenbereich weist auf L5, eine in den kleinen Zeh auf S1. Das ist klassische „radikuläre“ Symptomatik – Hinweis auf Nervenwurzelreizung, häufig durch Bandscheibenprotrusion oder -prolaps.",
    },
    {
      kind: "callout",
      text: "Wichtig: Nicht jede Ausstrahlung ist radikulär. Es gibt auch pseudo-radikuläre Schmerzen, die ähnlich aussehen, aber nicht von der Nervenwurzel kommen, sondern z. B. vom ISG, von muskulären Triggerpunkten oder von Facettengelenken. Die Unterscheidung gehört in ärztliche Hand.",
    },
    {
      kind: "paragraph",
      text: "Der Nervus ischiadicus: Der dickste Nerv des Körpers, gebildet aus den Wurzeln L4–S3, verläuft durch das Gesäß und das Bein. Wenn er gereizt wird (durch Bandscheiben-Material, Piriformis-Verspannung, andere Strukturen), entsteht die Ischialgie – ausstrahlender Beinschmerz im Verlauf des Nerven.",
    },
    {
      kind: "vertiefung",
      title: "Mechanismen von Nervenschmerz",
      body: [
        "Nervenschmerz (neuropathischer Schmerz) unterscheidet sich qualitativ vom muskulären oder Gelenkschmerz. Typische Charakteristika: brennend, elektrisierend, stechend, einschießend; folgt einer bestimmten anatomischen Verlaufsbahn (Dermatom oder Nervenverlauf); kann mit Sensibilitätsstörungen einhergehen (Taubheit, Kribbeln, „Ameisenlaufen“); reagiert oft anders auf konventionelle Schmerzmittel.",
        "Mechanistisch entsteht Nervenschmerz nicht nur durch mechanischen Druck. Eine wichtige Rolle spielen chemische Reize – etwa Entzündungsstoffe, die aus einem Bandscheiben-Material austreten und benachbarte Nerven reizen. Das erklärt, warum manche Bandscheibenvorfälle ohne mechanische Kompression dennoch starken Nervenschmerz erzeugen – und warum sich die Symptome häufig spontan zurückbilden, sobald die Entzündungskomponente abklingt.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "ISG",
      text: "Das Iliosakralgelenk (ISG)",
    },
    {
      kind: "paragraph",
      text: "Das ISG verbindet das Kreuzbein (Os sacrum) mit dem Darmbein (Os ilium) – also Wirbelsäule und Becken. Es ist ein straffes Gelenk mit nur minimaler Beweglichkeit (Schätzungen 2–4° Bewegung in alle Richtungen). Gehalten wird es durch ein extrem starkes Bandsystem – die ISG-Bänder gehören zu den stärksten Bändern des Körpers.",
    },
    {
      kind: "paragraph",
      text: "Funktion: Das ISG ist eine Lastübertragungsstruktur. Es leitet Kräfte vom Rumpf (über die Wirbelsäule) auf die Beine (über das Becken) und umgekehrt. Insbesondere beim Gehen, Laufen und Heben spielt es eine zentrale Rolle.",
    },
    {
      kind: "paragraph",
      text: "ISG als Schmerzquelle: Das ISG wird häufig als Schmerzquelle benannt – die genaue Häufigkeit ist umstritten. Schätzungen zur Mit-Beteiligung des ISG am chronischen Kreuzschmerz reichen von 15 % bis 30 %. Die diagnostische Unsicherheit liegt daran, dass keine bildgebende Untersuchung verlässlich ISG-Schmerz beweisen oder ausschließen kann. Goldstandard ist die diagnostische Infiltration mit Lokalanästhetikum.",
    },
    {
      kind: "bulletList",
      title: "Typisches ISG-Schmerzmuster",
      items: [
        "Lokalisation tief im unteren Rücken, oft einseitig",
        "Etwa eine Handbreit neben der Mittellinie, in der Region des hinteren oberen Beckenknochenrandes",
        "Häufig ausstrahlend ins Gesäß, manchmal in den Oberschenkel (bis Mitte; kein klassisches Dermatom)",
        "Verschlimmerung durch einseitige Belastung, langes Stehen, vom Liegen aufstehen, Treppe steigen",
        "Linderung durch Liegen und durch beidseitig symmetrische Belastung",
      ],
    },
    {
      kind: "vertiefung",
      title: "Die Behandlung der ISG-Dysfunktion",
      body: [
        "Im chronischen Bereich ist die Behandlung der ISG-Dysfunktion nicht primär eine Sache der manuellen Reposition („das ISG einrenken“), wie populär angenommen. Das ISG hat zu wenig Bewegungsspielraum für Verrenkungen im klassischen Sinne. Was tatsächlich oft hilft:",
        "Stabilisation der umgebenden Muskulatur (Gluteus medius, tiefe Bauchmuskeln, Multifidi).",
        "Mobilisation der angrenzenden Bereiche (Hüfte, untere LWS).",
        "Belastungsmodulation im Alltag (kein einseitiges Tragen, keine langen einseitigen Belastungen).",
        "Diese Maßnahmen sind aktive Therapie – und damit Kernbestand der Modul-2-Übungen dieser Masterclass.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Muskel-Verbindungs-Mapping",
    timing: "Geschätzte Bearbeitungszeit: 15 Minuten",
    theorieRueckbindung: [
      "Du hast eben kennengelernt, dass die Hüftmuskulatur (Gluteus maximus, Gluteus medius, Iliopsoas) und die tiefe Stabilisationsmuskulatur (Multifidus, TVA, Beckenboden) bei chronischem Kreuzschmerz fast immer mit beteiligt sind. Diese Übung hilft dir, eigene mögliche Schwachstellen in diesen Muskelgruppen zu identifizieren – ohne dass du dich selbst diagnostizieren musst, sondern als Hinweis darauf, welche Modul-2-Übungen für dich vorrangig wichtig werden.",
    ],
    anleitung: ["Kreuze an, was zutrifft. Es geht um Tendenzen, nicht um Ja/Nein-Diagnostik."],
    blocks: [
      {
        kind: "checklist",
        id: "hueftbeuger",
        label: "Hüftbeuger / Iliopsoas",
        showProgress: true,
        items: [
          { id: "1", label: "Ich sitze täglich mehr als 6 Stunden" },
          {
            id: "2",
            label:
              "Beim Aufstehen aus dem Sitzen brauche ich einen Moment, um aufrecht zu sein",
          },
          {
            id: "3",
            label:
              "Beim Liegen auf dem Rücken kann ich die Beine nicht flach hinlegen ohne Verspannung in den Hüftbeugern",
          },
          { id: "4", label: "Mein Hohlkreuz fühlt sich stärker an als bei Gleichaltrigen" },
        ],
      },
      {
        kind: "checklist",
        id: "gluteus-maximus",
        label: "Gluteus maximus (Gesäßstrecker)",
        showProgress: true,
        items: [
          {
            id: "1",
            label: "Beim Treppensteigen drücke ich mich eher mit dem Oberschenkel als mit dem Gesäß",
          },
          {
            id: "2",
            label: "Wenn ich die Po-Backen anspannen soll, gelingt es mir nicht gut oder einseitig",
          },
          { id: "3", label: "Mein Gesäß ist mehr „weich“ als straff" },
          { id: "4", label: "Bei langem Stehen ermüden meine Lendenmuskeln früher als meine Beine" },
        ],
      },
      {
        kind: "checklist",
        id: "gluteus-medius",
        label: "Gluteus medius (seitliche Beckenstabilisation)",
        showProgress: true,
        items: [
          {
            id: "1",
            label:
              "Beim einbeinigen Stand auf einem Bein wackle ich deutlich oder ich muss die Hand abstützen",
          },
          {
            id: "2",
            label: "Beim Gehen sehe ich, dass mein Becken seitlich kippt (im Spiegel oder auf Video)",
          },
          { id: "3", label: "Mein Kreuzschmerz ist deutlich einseitig" },
          {
            id: "4",
            label: "Beim Sitzen kreuze ich gewohnheitsmäßig die Beine bevorzugt in eine Richtung",
          },
        ],
      },
      {
        kind: "checklist",
        id: "tiefe-stabilisation",
        label: "Tiefe Stabilisationsmuskulatur (TVA + Multifidus)",
        showProgress: true,
        items: [
          { id: "1", label: "Beim Husten oder Niesen geht ein Schmerz durch den Rücken" },
          { id: "2", label: "Bei plötzlichen Bewegungen „schießt es ein“" },
          { id: "3", label: "Mein Rücken fühlt sich morgens steif an, bessert sich aber bei Bewegung" },
          { id: "4", label: "Beim Tragen schwerer Sachen ermüde ich rasch im unteren Rücken" },
        ],
      },
      {
        kind: "checklist",
        id: "atemmuster",
        label: "Atemmuster / Diaphragma",
        showProgress: true,
        items: [
          {
            id: "1",
            label: "Ich atme überwiegend in den oberen Brustkorb (Schultern heben sich beim Atmen)",
          },
          { id: "2", label: "Bei Stress wird meine Atmung deutlich flacher" },
          { id: "3", label: "Mein Bauch bewegt sich beim Ruheatmen kaum" },
          { id: "4", label: "In Belastungssituationen halte ich die Luft an statt zu atmen" },
        ],
      },

      { kind: "step", n: 1, title: "Auswertung und Priorisierung" },
      {
        kind: "text",
        text: "Bei dieser Übung gibt es keine „richtige“ Antwortzahl. Aber die Bereiche mit drei oder vier zutreffenden Antworten sind für dich besonders relevant. Vermerke sie hier.",
      },
      {
        kind: "note",
        field: {
          id: "prioritaet",
          label: "Priorisierte Bereiche für Modul 2:",
          rows: 4,
        },
      },

      { kind: "step", n: 2, title: "Empfohlene Modul-2-Fokusse" },
      {
        kind: "text",
        text: "Anhand deiner Auswertung kannst du in Modul 2 prioritär arbeiten an:",
      },
      {
        kind: "hint",
        text: "Hüftbeuger → Lektion 2.2 (Mobilisation Hüftbeuger), Übungskarte ÜK-M5. Gluteus maximus → Lektion 2.4 (Belastungstoleranz), Hip Hinge (ÜK-B1). Gluteus medius → Lektion 2.3 (Stabilisation), Step-up (ÜK-S5), Side Plank (ÜK-S4). Tiefe Stabilisation → Lektion 2.3 (Stabilisation), Dead Bug (ÜK-S2), Bird Dog (ÜK-S3). Atemmuster → Lektion 2.5 (Atemmechanik), 360°-Atmung (ÜK-A1), Box Breathing (ÜK-A2).",
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Welche Erkenntnisse nehme ich aus dieser Übung mit? Wo war ich überrascht?",
          rows: 5,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
    ],
  },

  zusammenfassung: [
    "Die Muskulatur des unteren Rückens und der Hüftumgebung gliedert sich in drei Schichten: tiefe Stabilisatoren, mittlere Bewegungserzeuger, Hüftmuskulatur. Die tiefe Schicht ist bei chronischem Schmerz besonders relevant.",
    "Die deep-core-Synergie aus Multifidus, TVA, Beckenboden und Diaphragma ist die Grundlage moderner Rumpfstabilisation. Bei chronischen Schmerzen oft gestört.",
    "Faszien sind nicht passives Verpackungsmaterial, sondern aktiv schmerzempfindlich und mechanisch relevant. Die thorakolumbale Faszie ist die wichtigste Faszienstruktur für den unteren Rücken.",
    "Nervenwurzeln L1–S1 versorgen Bein-Sensorik und -Motorik. Ausstrahlende Schmerzen können radikulär (Nervenwurzel) oder pseudo-radikulär (ISG, Muskel, Faszie) sein.",
    "Das ISG überträgt Kräfte zwischen Wirbelsäule und Becken. Beteiligung an chronischem Schmerz in etwa 15–30 % der Fälle. Behandlung primär durch Stabilisation und Belastungsmodulation, nicht durch manuelle „Einrenkung“.",
  ],

  querverweise: [
    {
      label: "Lektion 2.3",
      text: "behandelt die Stabilisationsübungen, die die deep-core-Synergie reaktivieren.",
    },
    {
      label: "Lektion 2.5",
      text: "vertieft die Atemmechanik mit ihrer engen Verbindung zu Beckenboden und Rumpfstabilisation.",
    },
    {
      label: "Lektion 2.7",
      text: "behandelt Coping-Strategien für pseudo-radikuläre Schmerzen.",
    },
    {
      label: "Übungskartendeck",
      text: "ÜK-S-Serie (Stabilisation) und ÜK-M-Serie (Mobilisation) für die konkreten Übungen.",
    },
  ],

  notizfeld: {
    id: "notiz-1.2",
    label: "Notizfeld",
    rows: 12,
  },
};
