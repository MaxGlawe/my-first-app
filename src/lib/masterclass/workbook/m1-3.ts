import type { WorkbookData } from "./types";

/**
 * Workbook-Daten — Lektion 1.3 „Was ‚chronisch‘ wirklich bedeutet".
 *
 * Wortlaut 1:1 aus `docs/workbook-chronischer-kreuzschmerz-source.md`
 * (Sektion „Lektion 1.3", Z. 1949–2265). HWG-konform: Orientierung,
 * keine Diagnose, keine Heilversprechen. Typografische
 * Anführungszeichen — kein ASCII-".
 *
 * Modul 1 ist Anatomie/Theorie — es existieren keine Übungsfotos,
 * daher kein `image`-Block.
 */
export const WORKBOOK_M1_3: WorkbookData = {
  lessonId: "1.3",
  nr: "1.3",
  sectionLabel: "Modul 1 · Verstehen",
  title: "Was „chronisch“ wirklich bedeutet",
  subtitle:
    "Dein Schmerzsystem ist sensibilisiert, aber es ist auch plastisch — was es gelernt hat, kann es ent-lernen.",
  meta: {
    audio: "Audio-Dauer: 17–19 Min",
    lese: "Lese-Zeit Workbook: 35–40 Min",
    uebung: "mit Übung 1.3",
  },

  objectives: [
    "den medizinischen Unterschied zwischen akutem und chronischem Schmerz präzise verstehen,",
    "das Phänomen der zentralen Sensibilisierung und seine biologischen Mechanismen erklären können,",
    "nachvollziehen, warum chronischer Schmerz nicht durch „Schmerzmittel + Geduld“ verschwindet,",
    "die Plastizität deines Schmerzsystems als entscheidende Tatsache erkennen – sie ist Problem und Lösungshebel zugleich,",
    "die Übung 1.3 abgeschlossen haben, mit der du deinen eigenen Chronifizierungs-Verlauf rekonstruierst.",
  ],

  content: [
    {
      kind: "heading",
      eyebrow: "Grundlage",
      text: "Die begriffliche Grundlage",
    },
    {
      kind: "lead",
      text: "In der medizinischen Sprache ist chronisch nicht einfach seit länger her. Es ist eine eigenständige Klassifikation mit biologisch klar abgrenzbaren Mechanismen.",
    },
    {
      kind: "bulletList",
      items: [
        "Akuter Schmerz — Schmerz, der weniger als 3 Monate andauert. Biologisch typischerweise direkt verbunden mit einer aktuellen Gewebsschädigung oder einem aktuellen Reiz. Sinnvolle Warnfunktion. Verschwindet in der Regel mit der Ausheilung des zugrunde liegenden Gewebes.",
        "Subakuter Schmerz — Schmerz zwischen 6 Wochen und 3 Monaten Dauer. Übergangsphase. Hier entscheidet sich häufig, ob der Schmerz ausheilt oder chronifiziert.",
        "Chronischer Schmerz — Schmerz, der länger als 3 Monate anhält oder regelmäßig wiederkehrt. Die ICD-11 (2019) hat Chronic Primary Pain als eigenständige Diagnosegruppe etabliert – mit der wichtigen Botschaft: chronischer Schmerz ist eine eigenständige Krankheit, nicht mehr nur ein Symptom.",
      ],
    },
    {
      kind: "paragraph",
      text: "Diese Definition über die Zeit ist ein bisschen irreführend. Die wichtigere Definition ist eine mechanistische:",
    },
    {
      kind: "paragraph",
      text: "Akuter Schmerz ist Schmerz, der hauptsächlich von einem aktuellen peripheren Reiz getragen wird – das Schmerzsystem meldet, was in einem Gewebe gerade passiert.",
    },
    {
      kind: "paragraph",
      text: "Chronischer Schmerz ist Schmerz, bei dem das Schmerzsystem selbst zur primären Quelle des Schmerzerlebnisses geworden ist – auch ohne (oder weit über das Maß) aktuelle Gewebsschäden. Das Schmerzsystem ist sensibilisiert, lerngeprägt, vegetativ überaktiv und sensorisch verändert.",
    },
    {
      kind: "paragraph",
      text: "Diese mechanistische Definition ist wichtig, weil sie die Behandlungs-Logik bestimmt: Akuter Schmerz wird durch Heilung des verletzten Gewebes behandelt. Chronischer Schmerz wird durch Modulation des Schmerzsystems selbst behandelt – durch Bewegung, Edukation, Coping, Lebensstil. Das ist eine andere Therapielogik.",
    },

    {
      kind: "heading",
      eyebrow: "Kernmechanismus",
      text: "Zentrale Sensibilisierung — das Herz-Stück des Verständnisses",
    },
    {
      kind: "paragraph",
      text: "Wenn du nur einen einzigen biologischen Mechanismus aus Modul 1 mitnehmen sollst, dann diesen: zentrale Sensibilisierung. Es ist der Mechanismus, der erklärt, warum chronischer Schmerz anders ist als akuter und warum die übliche Schmerz-Logik nicht greift.",
    },
    {
      kind: "paragraph",
      text: "Was passiert dabei? Dein Schmerzsystem besteht aus mehreren Ebenen: peripheren Nerven (Rezeptoren in Geweben, Nervenleitungen zur Wirbelsäule), Rückenmark (erste Umschaltstelle und Filterstation), und Gehirn (mehrere Bereiche, die zusammen Schmerz erzeugen). Im akuten Schmerzfall sendet ein Gewebe-Reiz Signale durch das System, das Gehirn erzeugt daraus eine Schmerzempfindung. Reize verschwinden → Schmerzempfindung verschwindet.",
    },
    {
      kind: "paragraph",
      text: "Bei wiederholten oder langanhaltenden Reizen passieren Veränderungen auf allen drei Ebenen:",
    },
    {
      kind: "bulletList",
      items: [
        "Periphere Sensibilisierung – Schmerzrezeptoren in der Peripherie werden empfindlicher. Sie aktivieren sich bei niedrigeren Reizschwellen.",
        "Spinale Sensibilisierung – im Rückenmark werden die Umschaltstellen empfindlicher. Schmerzsignale werden verstärkt weitergeleitet statt gedämpft. Bisher schmerz-untaugliche Nervenfasern (z. B. Berührungs-Fasern) beginnen, Schmerz-Codierung zu übernehmen.",
        "Zentrale Sensibilisierung im Gehirn – die schmerzverarbeitenden Hirnregionen werden überaktiv. Ihre Aktivierungsschwelle sinkt, ihre Aktivierungsdauer steigt, ihr Vernetzungsmuster verändert sich. Schmerzhemmungs-Systeme (absteigende Bahnen) werden geschwächt. Das Gehirn „lernt Schmerz“.",
      ],
    },
    {
      kind: "keyTakeaway",
      title: "Das Ergebnis",
      body: [
        "Das Schmerzsystem reagiert auf identische Reize stärker als zuvor. Reize, die früher harmlos waren, werden als schmerzhaft kodiert. Schmerz dauert länger an, breitet sich aus, wird hartnäckiger. Auch bei objektiv kleinen Auslösern springt das System an wie bei einer Großbelastung.",
      ],
    },
    {
      kind: "vertiefung",
      title: "Die „Allodynie“ als typisches Sensibilisierungs-Zeichen",
      body: [
        "Ein charakteristisches Zeichen zentraler Sensibilisierung ist die Allodynie – Schmerz auf Reize, die normalerweise nicht schmerzhaft sind. Beispiele bei chronischem Rückenschmerz: Druck auf Hautareale, die früher unauffällig waren, erzeugt jetzt Schmerz; leichtes Vorbeugen, das früher harmlos war, fühlt sich plötzlich bedrohlich an; Sitzen in vorher völlig akzeptablen Stuhlpositionen wird nach Minuten schmerzhaft; sogar Berührung des Rückens kann unangenehm werden.",
        "Das ist nicht „Einbildung“. Das ist eine biologisch nachweisbare Veränderung im Schmerzsystem – messbar in Studien mit quantitativer sensorischer Testung (QST). Die Schmerzschwelle ist real gesenkt, nicht nur subjektiv wahrgenommen.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Zeitfenster",
      text: "Wie lange dauert Chronifizierung?",
    },
    {
      kind: "paragraph",
      text: "Es gibt keinen festen Zeitpunkt, an dem Schmerz „chronisch wird“. Die 3-Monats-Grenze ist eine Konvention. Tatsächlich beginnen sensibilisierende Veränderungen oft schon nach Tagen oder Wochen anhaltenden Schmerzes. Sie verstärken sich, je länger die Reize anhalten.",
    },
    {
      kind: "bulletList",
      title: "Kritische Zeitfenster",
      items: [
        "0–6 Wochen (akuter Bereich): Die meisten Schmerzen heilen ohne Folgen aus. Sensibilisierung beginnt, ist aber meist reversibel.",
        "6–12 Wochen (subakuter Bereich): Das Window of Opportunity. Hier entscheidet sich häufig, ob ein Schmerz chronifiziert oder nicht. Aktive, bewegungsbasierte, edukative Interventionen haben in dieser Phase besonders gute Wirksamkeit.",
        "12 Wochen+ (chronischer Bereich): Sensibilisierung ist etabliert. Der Schmerz ist eigenständige Pathologie geworden. Behandlung wird komplexer, ist aber weiterhin gut möglich – mit anderen Strategien.",
      ],
    },
    {
      kind: "paragraph",
      text: "Was begünstigt Chronifizierung? Mehrere Faktoren wurden in Studien identifiziert.",
    },
    {
      kind: "table",
      caption: "Risikofaktoren für Chronifizierung (nach Linton, Pincus)",
      headers: ["Bereich", "Risikofaktor"],
      rows: [
        ["Schmerzcharakteristik", "Hohe initiale Schmerzintensität, ausstrahlende Symptome"],
        ["Verhalten", "Ausgeprägtes Vermeidungsverhalten, langes Liegen, frühe Krankschreibung"],
        ["Kognition", "Katastrophisierende Schmerzgedanken („Es wird nie besser“)"],
        ["Emotional", "Niedrige Stimmung, Angst, depressive Symptomatik"],
        ["Sozial", "Konflikte am Arbeitsplatz, geringer sozialer Rückhalt"],
        ["Iatrogen", "Frühe MRT-Befunde mit angsteinflößender Befundung, häufige Therapie-Wechsel"],
        ["Behandlung", "Passive Therapien als alleinige Strategie, Operation bei unklarem Befund"],
      ],
    },
    {
      kind: "paragraph",
      text: "Die iatrogenen (durch die Behandlung verursachten) Faktoren sind interessant. Sie zeigen: was um den Patienten herum passiert – Sprache der Ärzte, Befundgestaltung, Therapie-Routen – beeinflusst die Chronifizierung erheblich. Das ist nicht Schuldzuweisung an die Behandler – es ist ein Hinweis, wie wichtig gute Edukation und aktive Therapie im akuten und subakuten Stadium sind.",
    },

    {
      kind: "heading",
      eyebrow: "Die gute Nachricht",
      text: "Die Plastizität — Problem und Hebel zugleich",
    },
    {
      kind: "paragraph",
      text: "Hier kommt die gute Nachricht. Sensibilisierung passiert deshalb, weil dein Nervensystem plastisch ist – also lernfähig. Das gleiche Lernsystem, das gerade Schmerz lernt, kann auch Sicherheit lernen. Es kann sich desensibilisieren. Es kann die Schmerzschwelle wieder anheben. Es kann hemmende Bahnen reaktivieren. Es kann Schmerz „ent-lernen“.",
    },
    {
      kind: "paragraph",
      text: "Das ist nicht Wunschdenken. Es ist neurobiologisch nachweisbar. Funktionelle MRT-Studien zeigen, dass die mit Schmerz verbundenen Hirnregionen bei erfolgreicher Schmerztherapie messbar weniger aktiv werden, ihre Vernetzung normalisiert sich, hemmende Bahnen werden wieder stärker.",
    },
    {
      kind: "numberedList",
      title: "Was triggert Desensibilisierung? Vier Faktoren, die sich konsistent als wirksam zeigen",
      items: [
        "Sichere Bewegung – Wenn du dich bewegst, ohne dass danach eine Schmerzeskalation folgt, lernt dein System: Bewegung ist nicht gefährlich. Diese Lerngelegenheiten müssen wiederholt stattfinden, über Wochen und Monate.",
        "Verstehen – Wenn dein Gehirn versteht, was Schmerz ist und was nicht, ändert sich die Interpretation der Signale. Das Gehirn kann mehrdeutige Signale weniger bedrohlich kodieren, wenn der Kontext klar ist.",
        "Vegetative Beruhigung – Atmung, Schlaf, Stressregulation senken den vegetativen Grundtonus. Das verändert die Schmerzschwelle messbar.",
        "Positive Emotionen – Soziale Verbindung, sinnvolle Aktivitäten, Freude – sie wirken antinozizeptiv. Das ist nicht Esoterik, sondern messbar über endogene Schmerzhemmungs-Systeme (Endorphine, körpereigene Cannabinoide).",
      ],
    },
    {
      kind: "paragraph",
      text: "Genau diese vier Faktoren sind die methodische Grundlage der Module 2, 3 und 4 dieser Masterclass. Du arbeitest also nicht gegen deinen Schmerz – du arbeitest mit der Plastizität deines Nervensystems.",
    },
    {
      kind: "vignette",
      title: "Aus der Praxis — Die Tonangabe verändert die Schmerzschwelle",
      body: [
        "Ein klassisches Beispiel aus der Schmerz-Edukations-Forschung: Patienten mit chronischen Rückenschmerzen werden in zwei Gruppen aufgeteilt. Beide bekommen identische Bewegungsübungen. Eine Gruppe erhält dazu eine Schmerz-Edukations-Einheit (genau wie diese Masterclass-Lektion); die andere Gruppe erhält stattdessen eine traditionelle Anatomie-Information („Sie haben einen Bandscheibenverschleiß“).",
        "Nach 8 Wochen Training: Die edukations-Gruppe zeigt signifikant niedrigere Schmerzintensität, weniger Angst, höhere Funktionalität – obwohl beide Gruppen exakt dieselben Übungen gemacht haben. Der Unterschied lag in der Sprache, die das Gehirn lernte.",
        "Solche Studien (Moseley, Butler, Louw, Diener) gibt es inzwischen in Hunderten – das Muster ist robust replizierbar. Patientenedukation ist eine eigenständige therapeutische Intervention, nicht nur „Drumherum“.",
      ],
    },

    {
      kind: "heading",
      eyebrow: "Übersetzung",
      text: "Was das für deinen Alltag bedeutet",
    },
    {
      kind: "paragraph",
      text: "Wenn du diese Lektion in einem Satz für dich übersetzen würdest, wäre er: Mein Schmerzsystem ist sensibilisiert, aber es ist auch plastisch. Was es gelernt hat, kann es ent-lernen – wenn ich ihm konsistent Sicherheits-Signale gebe.",
    },
    {
      kind: "numberedList",
      title: "Konkrete Konsequenzen",
      items: [
        "Bewegung wird zur Therapie. Nicht weil sie Strukturen heilt, sondern weil sie dem Schmerzsystem über Wochen und Monate die Botschaft „Bewegung ist sicher“ eintrainiert. Diese Botschaft braucht Wiederholung – einmalig hat keine Wirkung, dreimal pro Woche über drei Monate schon.",
        "Schmerzspitzen sind keine Schadensanzeigen. Ein sensibilisiertes System produziert Schmerzspitzen, die nicht einer aktuellen Gewebsschädigung entsprechen. Lerne, sie als Systemreaktion zu lesen, nicht als Warnung vor Verletzung. (Das ist Inhalt von Lektion 1.5 und Modul 2.7.)",
        "Sprache und Gedanken matter. Wie du über deinen Schmerz denkst, beeinflusst die zentrale Verarbeitung. Katastrophisierung verstärkt, einordnen reduziert. Diese Masterclass gibt dir gezielt die Sprache, die hilft.",
        "Lebensstil ist Therapie. Schlaf, Stressregulation, soziale Verbindung sind keine Wellness-Extras – sie sind direkte Schmerzmodulatoren. Modul 3.3 vertieft diesen Punkt.",
        "Zeit-Skala ist Wochen bis Monate. Ent-Sensibilisierung passiert nicht in einer Woche. Realistische Verbesserungen siehst du nach 6–12 Wochen konsequenter Anwendung. Wer nach zwei Wochen aufgibt, hat das System nicht erreicht.",
      ],
    },
  ],

  exercise: {
    kind: "blocks",
    title: "Mein persönlicher Chronifizierungs-Verlauf",
    timing: "Geschätzte Bearbeitungszeit: 20 Minuten",
    theorieRueckbindung: [
      "Du hast eben gelernt, dass Chronifizierung nicht zufällig passiert, sondern durch eine Kombination biologischer und psychosozialer Faktoren begünstigt wird. Diese Übung lädt dich ein, deinen eigenen Verlauf zu rekonstruieren – wo kam der Schmerz her, wann wurde er chronisch, welche Faktoren waren beteiligt?",
      "Diese Rekonstruktion hat zwei therapeutische Effekte: Sie macht den Verlauf erklärbar (statt unerklärlich-bedrohlich), und sie zeigt dir, welche Faktoren du jetzt aktiv beeinflussen kannst.",
    ],
    anleitung: [
      "In vier Schritten. Bearbeite ehrlich, nimm dir Zeit – das ist eine Reflexionsübung, keine Schnellrunde.",
    ],
    blocks: [
      { kind: "step", n: 1, title: "Die Anfänge" },
      {
        kind: "note",
        field: {
          id: "anfaenge-ausloeser",
          label: "Wann hat dein Kreuzschmerz angefangen? Was war damals der Auslöser oder Anlass?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "anfaenge-lebensphase",
          label: "Wie alt warst du? In welcher Lebensphase warst du (Beruf, Familie, Belastung)?",
          rows: 3,
        },
      },

      { kind: "step", n: 2, title: "Der Verlauf der ersten 3 Monate" },
      {
        kind: "note",
        field: {
          id: "verlauf-entwicklung",
          label:
            "Wie ging es nach den ersten Episoden weiter? Wurde der Schmerz schlimmer, besser, blieb gleich?",
          rows: 4,
        },
      },
      {
        kind: "note",
        field: {
          id: "verlauf-reaktion",
          label:
            "Wie hast du damals reagiert? Was hast du getan? (Bewegung reduziert, Therapie gesucht, Schmerzmittel genommen, weitergemacht?)",
          rows: 4,
        },
      },

      { kind: "step", n: 3, title: "Die Risikofaktoren bei dir" },
      {
        kind: "text",
        text: "Schau auf die Liste der Chronifizierungs-Risiken und markiere, welche bei dir vorlagen oder vorliegen. Sei ehrlich. Kreuze separat an: Was traf in der akuten Phase (damals) zu, was trifft heute (chronische Phase) zu?",
      },
      {
        kind: "checklist",
        id: "risiko-damals",
        label: "Damals (akute Phase)",
        items: [
          { id: "intensitaet", label: "Sehr hohe initiale Schmerzintensität" },
          { id: "krankschreibung", label: "Frühe Krankschreibung über mehrere Wochen" },
          { id: "angst", label: "Angst, Bewegung zu machen" },
          { id: "gedanken", label: "Gedanken wie „Das wird nie besser“" },
          { id: "niedergeschlagen", label: "Niedergeschlagenheit, Hoffnungslosigkeit" },
          { id: "stress", label: "Stressige Lebenssituation parallel" },
          { id: "konflikte", label: "Konflikte am Arbeitsplatz" },
          { id: "mrt", label: "MRT-Befund früh, mit alarmierender Sprache" },
          { id: "wechsel", label: "Häufige Therapie-Wechsel" },
          { id: "passiv", label: "Hauptsächlich passive Therapien (Spritzen, Massage)" },
          { id: "schlaf", label: "Schlechter Schlaf über Wochen" },
          { id: "rueckzug", label: "Sozialer Rückzug" },
        ],
      },
      {
        kind: "checklist",
        id: "risiko-heute",
        label: "Heute (chronische Phase)",
        items: [
          { id: "intensitaet", label: "Sehr hohe initiale Schmerzintensität" },
          { id: "krankschreibung", label: "Frühe Krankschreibung über mehrere Wochen" },
          { id: "angst", label: "Angst, Bewegung zu machen" },
          { id: "gedanken", label: "Gedanken wie „Das wird nie besser“" },
          { id: "niedergeschlagen", label: "Niedergeschlagenheit, Hoffnungslosigkeit" },
          { id: "stress", label: "Stressige Lebenssituation parallel" },
          { id: "konflikte", label: "Konflikte am Arbeitsplatz" },
          { id: "mrt", label: "MRT-Befund früh, mit alarmierender Sprache" },
          { id: "wechsel", label: "Häufige Therapie-Wechsel" },
          { id: "passiv", label: "Hauptsächlich passive Therapien (Spritzen, Massage)" },
          { id: "schlaf", label: "Schlechter Schlaf über Wochen" },
          { id: "rueckzug", label: "Sozialer Rückzug" },
        ],
      },

      { kind: "step", n: 4, title: "Die Plastizitäts-Hebel für heute" },
      {
        kind: "text",
        text: "Welche der vier Plastizitäts-Hebel sind für dich gerade besonders relevant? Bewerte jeden auf einer Skala (0 niedrig, 10 hoch) und notiere darunter deinen möglichen ersten Schritt.",
      },
      {
        kind: "scale",
        id: "hebel-bewegung",
        label: "Sichere Bewegung wiederaufnehmen",
        minLabel: "niedrig",
        maxLabel: "hoch",
      },
      {
        kind: "scale",
        id: "hebel-verstehen",
        label: "Verständnis vertiefen (diese Masterclass)",
        minLabel: "niedrig",
        maxLabel: "hoch",
      },
      {
        kind: "scale",
        id: "hebel-vegetativ",
        label: "Vegetative Beruhigung (Atmung, Schlaf, Stress)",
        minLabel: "niedrig",
        maxLabel: "hoch",
      },
      {
        kind: "scale",
        id: "hebel-emotionen",
        label: "Positive Emotionen / soziale Verbindung stärken",
        minLabel: "niedrig",
        maxLabel: "hoch",
      },
      {
        kind: "lines",
        id: "erste-schritte",
        label: "Was könnte mein erster Schritt sein?",
        lines: [
          { id: "bewegung", prefix: "Sichere Bewegung" },
          { id: "verstehen", prefix: "Verständnis" },
          { id: "vegetativ", prefix: "Vegetative Beruhigung" },
          { id: "emotionen", prefix: "Positive Emotionen" },
        ],
      },

      {
        kind: "note",
        field: {
          id: "reflexion",
          label:
            "Meine Reflexion: Welche Einsichten nehme ich aus dieser Rekonstruktion mit? Was wird klarer, wo bleiben Fragen?",
          rows: 8,
        },
      },
      { kind: "date", id: "datum", label: "Datum" },
      {
        kind: "hint",
        text: "Vergiss nicht: Diese Übung erklärt deinen Verlauf, sie beschuldigt dich nicht. Niemand entscheidet sich für Chronifizierung. Die Faktoren waren da, du hast reagiert, wie ein Mensch in deiner Lage reagiert. Der Wert dieser Reflexion liegt im Verständnis, nicht in der Bewertung.",
      },
    ],
  },

  zusammenfassung: [
    "Chronischer Schmerz ist eine eigenständige biologische Pathologie, nicht nur „länger andauernder akuter Schmerz“. ICD-11 (2019) erkennt das als eigene Diagnose-Gruppe an.",
    "Zentrale Sensibilisierung ist der Hauptmechanismus: das Schmerzsystem selbst wird empfindlicher, lerngeprägt, vegetativ überaktiv. Auch bei kleinen Auslösern überreagiert es.",
    "Es gibt ein Window of Opportunity zwischen 6 und 12 Wochen, in dem aktive Interventionen besonders gut wirken. Es bleibt nicht nur diese Phase wirksam, aber sie ist der günstigste Einstieg.",
    "Plastizität ist Problem und Lösung zugleich: das gleiche System, das sensibilisiert, kann auch desensibilisieren – durch sichere Bewegung, Verstehen, vegetative Beruhigung, positive Emotionen.",
    "Realistische Zeitskala für Veränderung: 6–12 Wochen für erste klare Effekte, mehrere Monate für stabile Veränderungen.",
  ],

  querverweise: [
    {
      label: "Lektion 1.4",
      text: "zeigt, warum strukturelle Bildbefunde die zentrale Sensibilisierung nicht erfassen können – und warum das ein Problem ist.",
    },
    {
      label: "Lektion 1.5",
      text: "vertieft die neurobiologische Sicht: Schmerz entsteht im Gehirn, nicht im Rücken.",
    },
    {
      label: "Lektion 2.7",
      text: "behandelt Coping-Strategien für sensibilisierte Systeme (Graded Exposure, kognitive Defusion).",
    },
    {
      label: "Lektion 3.3",
      text: "vertieft die „vegetativen Beruhiger“ Schlaf, Stress, Ernährung.",
    },
    {
      label: "Anhang: Glossar",
      text: "für zentrale Sensibilisierung, Allodynie, Plastizität.",
    },
  ],

  notizfeld: {
    id: "notiz-1.3",
    label: "Notizfeld",
    rows: 12,
  },
};
