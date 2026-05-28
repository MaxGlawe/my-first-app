/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 4.3
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/4.3.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 4.3`). Niemals lessons/4.3.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Die operative Lektion von Modul 4 (Recoping): Sie operationalisiert das
 * Drei-Schienen-System (reizarm / Standard / belastend), das durch Modul 2 lief,
 * und macht es zu einem lebbaren Tages-Werkzeug. Themenblöcke / Slide-Gruppen klar
 * getrennt:
 *   - Eröffnung:                      Abschnitt 1.
 *   - Die drei Schienen im Detail:    Abschnitt 2 (reizarm / Standard / belastend + Spektrum + Gleichwertigkeit).
 *   - Das Tages-Check-in:             Abschnitt 3 (fünf Fragen, Entscheidungs-Logik, Faustregel).
 *   - Schienen-Beispiele:             Abschnitt 4 (Hip Hinge, Cat-Cow, Dead Bug, 360-Grad-Atmung).
 *   - Wenn man sich vertut:           Abschnitt 5 (vier Szenarien + Korrektur).
 *   - Workbook + Übergang:            Abschnitt 6 (Tages-Check-in, Ausblick 4.4).
 *
 * Aufbau identisch zu 4.1 / 4.2 / 2.2:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt; Aufzählungspunkte/Beispiele zu Fließtext verdichtet).
 *     EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–6) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die Meta-Tabelle der MD werden NICHT vertont. Die
 * Workbook-Übung 4.3 selbst (Vorlage zum Ausfüllen) ist ein separates Werkzeug —
 * hier wird nur die vertonte ANLEITUNG/ERKLÄRUNG dazu produziert.
 *
 * 3.-PERSON-REGEL: 4.3 enthält KEINE Stelle mit persönlichem Ersteller-/Praxis-/
 * Credential-Ich. Das einzige „Ich" ist die generische, anleitende Sprecher-Stimme
 * („Mein Vorschlag: Mach jeden Morgen ein kurzes Tages-Check-in") — exakt wie in
 * 4.2 / 2.2 / 2.6 gehandhabt. Diese bleibt unverändert; es war keine Umschreibung
 * auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD wird beibehalten. Die drei Schienen sind als Dosierungs-/
 *   Verhaltens-Werkzeug beschrieben (jede Schiene „die richtige Therapie" für ihren
 *   Tag), NICHT als medizinisches Heilversprechen. Aussagen bleiben prozesshaft
 *   formuliert wie in der MD.
 *
 * GERMAN-QUOTE-GOTCHA (CLAUDE.md): ASCII-`"` in TS-Strings bricht das Literal.
 * In narration/seg NUR einfache Anführungen ('...') oder gar keine. Die Anzeige-
 * Strings der Slides nutzen typografische Quotes („…“) — die sind unproblematisch.
 */

// ── Typen (build-only; nicht an den Client) ─────────────────────────────────

/** Slide-Inhalt + Sprech-Segment. `appearTime` wird vom Build ergänzt. */
export type SourceSlide = Record<string, unknown> & {
  type: string;
  /** Verbatim-Teilstring der narration, bei dem die Slide erscheint. */
  seg: string;
};

export interface SourceSection {
  title: string;
  /** Bereinigter Erzähltext (= vertont + Transkript). */
  narration: string;
  slides: SourceSlide[];
}

export interface SourceLesson {
  id: string;
  title: string;
  subtitle: string;
  sections: SourceSection[];
}

// ── Abschnitt 1 – Eröffnung ──────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Willkommen zu Lektion 4.3. In dieser Lektion vertiefen wir das Drei-Schienen-System, das durch Modul 2 lief und das deine Ritual-Map operationalisiert. Du hast die Schienen schon kennengelernt: Reizarm. Standard. Belastend. In jeder Übung. In dieser Lektion klären wir die Operationale: Wann wählst du welche Schiene? Wie machst du das jeden Tag, ohne dich zu verkrampfen? Wie korrigierst du, wenn du dich vertust? Diese Lektion macht aus den theoretischen drei Schienen ein lebbares Tages-Werkzeug.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 4 – Recoping",
      lessonLabel: "Lektion 4.3 – Der Übungs-Katalog: Drei Intensitätsschienen",
    },
    {
      type: "content",
      seg: "Willkommen zu Lektion 4.3. In dieser Lektion vertiefen wir das Drei-Schienen-System, das durch Modul 2 lief und das deine Ritual-Map operationalisiert. Du hast die Schienen schon kennengelernt: Reizarm. Standard. Belastend. In jeder Übung.",
      kicker: "Worum es heute geht",
      headline: "Wir vertiefen das Drei-Schienen-System, das deine Ritual-Map operationalisiert.",
      lead: "Die Schienen kennst du schon: reizarm, Standard, belastend – in jeder Übung. Sie liefen durch ganz Modul 2.",
    },
    {
      type: "content",
      seg: " In dieser Lektion klären wir die Operationale: Wann wählst du welche Schiene? Wie machst du das jeden Tag, ohne dich zu verkrampfen? Wie korrigierst du, wenn du dich vertust?",
      kicker: "Die offenen Fragen",
      headline: "Wann wählst du welche Schiene – jeden Tag, ohne dich zu verkrampfen?",
      lead: "Und wie korrigierst du, wenn du dich vertust? Das sind die operativen Fragen, die wir heute klären.",
    },
    {
      type: "statement",
      seg: " Diese Lektion macht aus den theoretischen drei Schienen ein lebbares Tages-Werkzeug.",
      text: "Aus drei theoretischen Schienen wird ein lebbares Tages-Werkzeug.",
      emphasis: "Tages-Werkzeug",
    },
  ],
};

// ── Abschnitt 2 – Die drei Schienen im Detail ────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Die drei Schienen im Detail",
  narration:
    "Erinnern wir uns: Jede Übung in dieser Masterclass hat drei Schienen. Reizarm. Das ist die sanfte Schiene. Kleine Amplituden, geringer Belastungsgrad, oft mit Hilfsmitteln, weniger Wiederholungen. Du wählst diese Schiene an Tagen, an denen es dir schlechter geht oder du müde bist. Standard. Die mittlere Schiene. Volle Bewegungsamplitude, normale Wiederholungszahlen, mittlere Intensität. Diese Schiene ist dein Tages-Standard – das, was du meistens machst. Belastend. Die anspruchsvolle Schiene. Mehr Wiederholungen, längere Haltezeiten, höhere Intensität oder Zusatzlast. Diese Schiene wählst du an Tagen, an denen du dich gut fühlst und Energie hast. Wichtig: Diese Schienen sind keine starren Kategorien. Sie sind ein Spektrum. An manchen Tagen bist du zwischen reizarm und Standard – mach etwas Mittleres. An manchen Tagen zwischen Standard und belastend – mach etwas zwischen den beiden. Sei flexibel. Wichtig auch: Reizarm ist nicht weniger Therapie als belastend. Reizarm ist die richtige Therapie für einen schlechten Tag. Standard ist die richtige Therapie für einen normalen Tag. Belastend ist die richtige Therapie für einen guten Tag. Jede Schiene hat ihren Platz. Keine ist besser als die andere.",
  slides: [
    {
      type: "content",
      seg: "Erinnern wir uns: Jede Übung in dieser Masterclass hat drei Schienen. Reizarm. Das ist die sanfte Schiene. Kleine Amplituden, geringer Belastungsgrad, oft mit Hilfsmitteln, weniger Wiederholungen. Du wählst diese Schiene an Tagen, an denen es dir schlechter geht oder du müde bist.",
      kicker: "Schiene 1 · Reizarm",
      headline: "Reizarm – die sanfte Schiene.",
      lead: "Kleine Amplituden, geringer Belastungsgrad, oft mit Hilfsmitteln, weniger Wiederholungen. Für Tage, an denen es dir schlechter geht oder du müde bist.",
    },
    {
      type: "content",
      seg: " Standard. Die mittlere Schiene. Volle Bewegungsamplitude, normale Wiederholungszahlen, mittlere Intensität. Diese Schiene ist dein Tages-Standard – das, was du meistens machst.",
      kicker: "Schiene 2 · Standard",
      headline: "Standard – die mittlere Schiene, dein Tages-Standard.",
      lead: "Volle Bewegungsamplitude, normale Wiederholungszahlen, mittlere Intensität. Das, was du meistens machst.",
    },
    {
      type: "content",
      seg: " Belastend. Die anspruchsvolle Schiene. Mehr Wiederholungen, längere Haltezeiten, höhere Intensität oder Zusatzlast. Diese Schiene wählst du an Tagen, an denen du dich gut fühlst und Energie hast.",
      kicker: "Schiene 3 · Belastend",
      headline: "Belastend – die anspruchsvolle Schiene.",
      lead: "Mehr Wiederholungen, längere Haltezeiten, höhere Intensität oder Zusatzlast. Für Tage, an denen du dich gut fühlst und Energie hast.",
    },
    {
      type: "content",
      seg: " Wichtig: Diese Schienen sind keine starren Kategorien. Sie sind ein Spektrum. An manchen Tagen bist du zwischen reizarm und Standard – mach etwas Mittleres. An manchen Tagen zwischen Standard und belastend – mach etwas zwischen den beiden. Sei flexibel.",
      kicker: "Ein Spektrum, keine Schubladen",
      headline: "Die Schienen sind keine starren Kategorien – sie sind ein Spektrum.",
      lead: "Mal bist du zwischen reizarm und Standard, mal zwischen Standard und belastend. Mach etwas dazwischen. Sei flexibel.",
    },
    {
      type: "reveal-list",
      seg: " Wichtig auch: Reizarm ist nicht weniger Therapie als belastend. Reizarm ist die richtige Therapie für einen schlechten Tag. Standard ist die richtige Therapie für einen normalen Tag. Belastend ist die richtige Therapie für einen guten Tag. Jede Schiene hat ihren Platz. Keine ist besser als die andere.",
      kicker: "Jede Schiene ist gleichwertig",
      title: "Die richtige Therapie für den richtigen Tag",
      items: [
        { label: "Reizarm – die richtige Therapie für einen schlechten Tag" },
        { label: "Standard – die richtige Therapie für einen normalen Tag" },
        { label: "Belastend – die richtige Therapie für einen guten Tag" },
      ],
    },
    {
      type: "statement",
      seg: "",
      text: "Reizarm an einem schlechten Tag ist volle Therapie. Nicht halbe.",
      emphasis: "volle Therapie",
    },
  ],
};

// ── Abschnitt 3 – Wie du die Schiene wählst: Das Tages-Check-in ───────────────

const abschnitt3: SourceSection = {
  title: "Das Tages-Check-in",
  narration:
    "Jetzt zur entscheidenden Frage: Wie wählst du jeden Tag, welche Schiene heute passt? Mein Vorschlag: Mach jeden Morgen ein kurzes Tages-Check-in. Es dauert maximal 30 Sekunden. Fünf Fragen. Erstens: Wie ist mein Schmerz auf einer Skala von null bis zehn? Zweitens: Wie ist meine Energie? Drittens: Wie habe ich geschlafen? Viertens: Welche stressigen oder belastenden Termine habe ich heute? Fünftens: Wann habe ich zuletzt eine belastende Schiene gemacht? Aus diesen fünf Antworten ergibt sich intuitiv, welche Schiene passt. Hoher Schmerz, niedrige Energie, schlecht geschlafen – reizarm. Mittlerer Schmerz, mittlere Energie, okay geschlafen – Standard. Niedriger Schmerz, hohe Energie, gut geschlafen, letzter belastender Tag länger her – belastend. Das ist keine Wissenschaft. Es ist eine intuitive Selbsteinschätzung. Mit der Zeit machst du das automatisch, ohne explizit nachzudenken. Eine Faustregel hilft: Wenn du nicht weißt, was passt – geh eine Schiene tiefer als du denkst. Etwas weniger ist besser als etwas zu viel. Du kannst immer aufstocken. Aber wenn du dich überreizt hast, ist es schwerer rückgängig zu machen.",
  slides: [
    {
      type: "content",
      seg: "Jetzt zur entscheidenden Frage: Wie wählst du jeden Tag, welche Schiene heute passt? Mein Vorschlag: Mach jeden Morgen ein kurzes Tages-Check-in. Es dauert maximal 30 Sekunden. Fünf Fragen.",
      kicker: "Die entscheidende Frage",
      headline: "Mach jeden Morgen ein kurzes Tages-Check-in – maximal 30 Sekunden.",
      lead: "Wie wählst du täglich, welche Schiene heute passt? Über fünf kurze Fragen am Morgen.",
    },
    {
      type: "reveal-list",
      seg: " Erstens: Wie ist mein Schmerz auf einer Skala von null bis zehn? Zweitens: Wie ist meine Energie? Drittens: Wie habe ich geschlafen? Viertens: Welche stressigen oder belastenden Termine habe ich heute? Fünftens: Wann habe ich zuletzt eine belastende Schiene gemacht?",
      kicker: "Das Tages-Check-in · fünf Fragen",
      title: "Die fünf Morgen-Fragen",
      items: [
        { label: "1 · Wie ist mein Schmerz auf einer Skala von null bis zehn?" },
        { label: "2 · Wie ist meine Energie?" },
        { label: "3 · Wie habe ich geschlafen?" },
        { label: "4 · Welche stressigen oder belastenden Termine habe ich heute?" },
        { label: "5 · Wann habe ich zuletzt eine belastende Schiene gemacht?" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Aus diesen fünf Antworten ergibt sich intuitiv, welche Schiene passt. Hoher Schmerz, niedrige Energie, schlecht geschlafen – reizarm. Mittlerer Schmerz, mittlere Energie, okay geschlafen – Standard. Niedriger Schmerz, hohe Energie, gut geschlafen, letzter belastender Tag länger her – belastend.",
      kicker: "Antworten → Schiene",
      title: "So ergibt sich die Schiene intuitiv",
      items: [
        { label: "Hoher Schmerz, niedrige Energie, schlecht geschlafen → reizarm" },
        { label: "Mittlerer Schmerz, mittlere Energie, okay geschlafen → Standard" },
        { label: "Niedriger Schmerz, hohe Energie, gut geschlafen, letzter belastender Tag länger her → belastend" },
      ],
    },
    {
      type: "content",
      seg: " Das ist keine Wissenschaft. Es ist eine intuitive Selbsteinschätzung. Mit der Zeit machst du das automatisch, ohne explizit nachzudenken.",
      kicker: "Keine Wissenschaft",
      headline: "Das ist eine intuitive Selbsteinschätzung – keine Wissenschaft.",
      lead: "Mit der Zeit machst du das automatisch, ohne explizit nachzudenken.",
    },
    {
      type: "content",
      seg: " Eine Faustregel hilft: Wenn du nicht weißt, was passt – geh eine Schiene tiefer als du denkst. Etwas weniger ist besser als etwas zu viel. Du kannst immer aufstocken. Aber wenn du dich überreizt hast, ist es schwerer rückgängig zu machen.",
      dark: true,
      kicker: "Die Faustregel",
      headline: "Im Zweifel eine Schiene tiefer als du denkst.",
      lead: "Etwas weniger ist besser als etwas zu viel. Aufstocken kannst du immer – ein überreiztes System rückgängig zu machen ist schwerer.",
    },
    {
      type: "statement",
      seg: "",
      text: "Im Zweifel eine Schiene tiefer. Immer.",
      emphasis: "eine Schiene tiefer",
    },
  ],
};

// ── Abschnitt 4 – Schienen-Beispiele pro Kategorie ───────────────────────────

const abschnitt4: SourceSection = {
  title: "Schienen-Beispiele pro Kategorie",
  narration:
    "Drei kurze Beispiele, damit die Schienen-Wahl konkreter wird. Beispiel Hip Hinge. Reizarm: fünf langsame Wiederholungen, kleine Amplitude, ohne Last. Standard: zehn Wiederholungen, volle Amplitude. Belastend: zwölf Wiederholungen mit Wasserflasche oder Kettlebell in den Händen. Beispiel Cat-Cow. Reizarm: drei sehr kleine Wellenbewegungen, nur Atmungs-Amplitude. Standard: zehn volle Wiederholungen. Belastend: fünfzehn mit zwei bis drei Sekunden Haltezeit in den Endpositionen. Beispiel Dead Bug. Reizarm: nur ein Bein, kleine Amplitude, sechs Wiederholungen pro Seite. Standard: volle Diagonale, acht bis zehn Wiederholungen pro Seite. Belastend: zwölf bis fünfzehn Wiederholungen mit Haltezeit, langsam. Beispiel 360-Grad-Atmung. Reizarm: fünf Atemzüge ruhig. Standard: zehn Atemzüge mit Aufmerksamkeit auf Seitenausdehnung. Belastend: fünfzehn bis zwanzig Atemzüge mit verlängerter Ausatmung, vier Sekunden ein, acht Sekunden aus. Du siehst das Prinzip. Reizarm gleich weniger Amplitude, weniger Last, weniger Wiederholungen. Standard gleich mittel. Belastend gleich mehr in irgendeiner Dimension. Im Übungskartendeck, das du am Ende der Masterclass bekommst, sind alle drei Schienen pro Übung sauber dokumentiert. Du musst dir das nicht merken – du nutzt die Karten als Referenz.",
  slides: [
    {
      type: "content",
      seg: "Drei kurze Beispiele, damit die Schienen-Wahl konkreter wird.",
      kicker: "Schienen in der Praxis",
      headline: "Ein paar Beispiele, damit die Schienen-Wahl konkreter wird.",
    },
    {
      type: "reveal-list",
      seg: " Beispiel Hip Hinge. Reizarm: fünf langsame Wiederholungen, kleine Amplitude, ohne Last. Standard: zehn Wiederholungen, volle Amplitude. Belastend: zwölf Wiederholungen mit Wasserflasche oder Kettlebell in den Händen.",
      kicker: "Beispiel · Hip Hinge",
      title: "Hip Hinge in drei Schienen",
      items: [
        { label: "Reizarm – fünf langsame Wiederholungen, kleine Amplitude, ohne Last" },
        { label: "Standard – zehn Wiederholungen, volle Amplitude" },
        { label: "Belastend – zwölf Wiederholungen mit Wasserflasche oder Kettlebell" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Beispiel Cat-Cow. Reizarm: drei sehr kleine Wellenbewegungen, nur Atmungs-Amplitude. Standard: zehn volle Wiederholungen. Belastend: fünfzehn mit zwei bis drei Sekunden Haltezeit in den Endpositionen.",
      kicker: "Beispiel · Cat-Cow",
      title: "Cat-Cow in drei Schienen",
      items: [
        { label: "Reizarm – drei sehr kleine Wellenbewegungen, nur Atmungs-Amplitude" },
        { label: "Standard – zehn volle Wiederholungen" },
        { label: "Belastend – fünfzehn mit zwei bis drei Sekunden Haltezeit" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Beispiel Dead Bug. Reizarm: nur ein Bein, kleine Amplitude, sechs Wiederholungen pro Seite. Standard: volle Diagonale, acht bis zehn Wiederholungen pro Seite. Belastend: zwölf bis fünfzehn Wiederholungen mit Haltezeit, langsam.",
      kicker: "Beispiel · Dead Bug",
      title: "Dead Bug in drei Schienen",
      items: [
        { label: "Reizarm – nur ein Bein, kleine Amplitude, sechs Wiederholungen pro Seite" },
        { label: "Standard – volle Diagonale, acht bis zehn Wiederholungen pro Seite" },
        { label: "Belastend – zwölf bis fünfzehn Wiederholungen mit Haltezeit, langsam" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Beispiel 360-Grad-Atmung. Reizarm: fünf Atemzüge ruhig. Standard: zehn Atemzüge mit Aufmerksamkeit auf Seitenausdehnung. Belastend: fünfzehn bis zwanzig Atemzüge mit verlängerter Ausatmung, vier Sekunden ein, acht Sekunden aus.",
      kicker: "Beispiel · 360-Grad-Atmung",
      title: "360-Grad-Atmung in drei Schienen",
      items: [
        { label: "Reizarm – fünf Atemzüge ruhig" },
        { label: "Standard – zehn Atemzüge mit Aufmerksamkeit auf Seitenausdehnung" },
        { label: "Belastend – fünfzehn bis zwanzig Atemzüge, vier Sekunden ein, acht Sekunden aus" },
      ],
    },
    {
      type: "content",
      seg: " Du siehst das Prinzip. Reizarm gleich weniger Amplitude, weniger Last, weniger Wiederholungen. Standard gleich mittel. Belastend gleich mehr in irgendeiner Dimension.",
      kicker: "Das Prinzip dahinter",
      headline: "Reizarm = weniger, Standard = mittel, belastend = mehr in irgendeiner Dimension.",
      lead: "Weniger Amplitude, weniger Last, weniger Wiederholungen – oder eben mehr. Immer dieselbe Logik.",
    },
    {
      type: "content",
      seg: " Im Übungskartendeck, das du am Ende der Masterclass bekommst, sind alle drei Schienen pro Übung sauber dokumentiert. Du musst dir das nicht merken – du nutzt die Karten als Referenz.",
      kicker: "Das Übungskartendeck",
      headline: "Alle drei Schienen sind pro Übung sauber dokumentiert.",
      lead: "Im Übungskartendeck am Ende der Masterclass. Du musst dir nichts merken – du nutzt die Karten als Referenz.",
    },
  ],
};

// ── Abschnitt 5 – Was tun, wenn man sich vertut ──────────────────────────────

const abschnitt5: SourceSection = {
  title: "Wenn man sich vertut",
  narration:
    "Eine wichtige Frage: Was tust du, wenn du die falsche Schiene gewählt hast? Szenario eins: Du hast belastend gewählt und merkst nach der Übung, dass dein Schmerz hochgeht. Zunächst: keine Panik. Schmerzspitzen nach Belastung sind nicht das Ende der Welt. Sie sind eine Information: heute war es zu viel. Konkrete Schritte: Mach Box Breathing fünf bis zehn Minuten. Mach eine sanfte Cat-Cow oder Knee-to-Chest. Geh früh ins Bett. Am nächsten Tag: reizarm. Szenario zwei: Du hast reizarm gewählt und merkst, du hättest mehr gekonnt. Auch kein Problem. Du hast deinem System eine kleine sanfte Bewegungs-Botschaft gegeben – das ist nie verkehrt. Beim nächsten Mal probierst du Standard. Szenario drei: Du machst seit Wochen nur reizarm, weil du dich nicht traust, in Standard zu gehen. Das ist gefährlicher. Die Wachstumszone aus Lektion 3.1 liegt nicht in der reizarmen Schiene. Wenn du dauerhaft unter deiner aktuellen Belastbarkeit bleibst, verschiebt sich deine Wachstumszone nicht. Hier ist die Aufgabe: an einem guten Tag trotzdem Standard probieren, auch wenn es sich erstmal unsicher anfühlt. Szenario vier: Du machst seit Wochen nur belastend und kriegst regelmäßig Crashes. Das ist die andere Falle. Du überreizt chronisch dein System. Hier ist die Aufgabe: bewusst öfter Standard wählen, auch an guten Tagen. Antifragilität braucht Dosierung, nicht maximalen Reiz. Generell gilt: Vertun ist okay. Das ist keine Prüfung. Wer chronischen Schmerz hat, lernt seinen Körper im Laufe der Monate. Du wirst immer besser darin, zu wählen. Das ist ein Lernprozess – und Lernprozesse beinhalten Vertuser.",
  slides: [
    {
      type: "content",
      seg: "Eine wichtige Frage: Was tust du, wenn du die falsche Schiene gewählt hast?",
      kicker: "Wenn die Wahl danebenliegt",
      headline: "Was tust du, wenn du die falsche Schiene gewählt hast?",
    },
    {
      type: "content",
      seg: " Szenario eins: Du hast belastend gewählt und merkst nach der Übung, dass dein Schmerz hochgeht. Zunächst: keine Panik. Schmerzspitzen nach Belastung sind nicht das Ende der Welt. Sie sind eine Information: heute war es zu viel. Konkrete Schritte: Mach Box Breathing fünf bis zehn Minuten. Mach eine sanfte Cat-Cow oder Knee-to-Chest. Geh früh ins Bett. Am nächsten Tag: reizarm.",
      kicker: "Szenario 1 · Zu viel",
      headline: "Belastend gewählt, der Schmerz geht hoch – keine Panik.",
      lead: "Schmerzspitzen sind eine Information: heute war es zu viel. Box Breathing fünf bis zehn Minuten, sanfte Cat-Cow oder Knee-to-Chest, früh ins Bett – am nächsten Tag reizarm.",
    },
    {
      type: "content",
      seg: " Szenario zwei: Du hast reizarm gewählt und merkst, du hättest mehr gekonnt. Auch kein Problem. Du hast deinem System eine kleine sanfte Bewegungs-Botschaft gegeben – das ist nie verkehrt. Beim nächsten Mal probierst du Standard.",
      kicker: "Szenario 2 · Zu wenig im Moment",
      headline: "Reizarm gewählt, du hättest mehr gekonnt – auch kein Problem.",
      lead: "Du hast deinem System eine kleine sanfte Bewegungs-Botschaft gegeben. Das ist nie verkehrt. Beim nächsten Mal probierst du Standard.",
    },
    {
      type: "content",
      seg: " Szenario drei: Du machst seit Wochen nur reizarm, weil du dich nicht traust, in Standard zu gehen. Das ist gefährlicher. Die Wachstumszone aus Lektion 3.1 liegt nicht in der reizarmen Schiene. Wenn du dauerhaft unter deiner aktuellen Belastbarkeit bleibst, verschiebt sich deine Wachstumszone nicht. Hier ist die Aufgabe: an einem guten Tag trotzdem Standard probieren, auch wenn es sich erstmal unsicher anfühlt.",
      dark: true,
      kicker: "Szenario 3 · Chronisch reizarm",
      headline: "Seit Wochen nur reizarm, aus Angst vor Standard – das ist gefährlicher.",
      lead: "Die Wachstumszone aus 3.1 liegt nicht in der reizarmen Schiene. Aufgabe: an einem guten Tag trotzdem Standard probieren, auch wenn es sich erst unsicher anfühlt.",
    },
    {
      type: "content",
      seg: " Szenario vier: Du machst seit Wochen nur belastend und kriegst regelmäßig Crashes. Das ist die andere Falle. Du überreizt chronisch dein System. Hier ist die Aufgabe: bewusst öfter Standard wählen, auch an guten Tagen. Antifragilität braucht Dosierung, nicht maximalen Reiz.",
      dark: true,
      kicker: "Szenario 4 · Chronisch belastend",
      headline: "Seit Wochen nur belastend, regelmäßig Crashes – die andere Falle.",
      lead: "Du überreizt chronisch. Aufgabe: bewusst öfter Standard wählen, auch an guten Tagen. Antifragilität braucht Dosierung, nicht maximalen Reiz.",
    },
    {
      type: "content",
      seg: " Generell gilt: Vertun ist okay. Das ist keine Prüfung. Wer chronischen Schmerz hat, lernt seinen Körper im Laufe der Monate. Du wirst immer besser darin, zu wählen. Das ist ein Lernprozess – und Lernprozesse beinhalten Vertuser.",
      kicker: "Generell gilt",
      headline: "Vertun ist okay. Das ist keine Prüfung.",
      lead: "Wer chronischen Schmerz hat, lernt seinen Körper über Monate. Du wirst immer besser im Wählen – und Lernprozesse beinhalten Vertuser.",
    },
    {
      type: "statement",
      seg: "",
      text: "Vertun ist okay. Du lernst deinen Körper über Monate.",
      emphasis: "über Monate",
    },
  ],
};

// ── Abschnitt 6 – Workbook und Übergang ──────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 4.3: Mein Tages-Check-in. Eine Vorlage für die fünf Fragen, die du täglich kurz beantworten kannst. Plus eine Notiz-Spalte für eine Woche, damit du im ersten Probe-Zeitraum dein Muster siehst. Nach diesen sieben Tagen wirst du erstaunlich klar erkennen, was deine guten und schlechten Tage prägt. Diese Selbst-Beobachtung ist ein eigener therapeutischer Wert – jenseits der reinen Schienen-Wahl. In der nächsten Lektion – 4.4 – vertiefen wir das Thema schmerzadaptiv. Wir schauen uns an, wie du auch in spezifischen Schmerz-Situationen flexibel und konstruktiv bleibst – nicht nur an Tagen, an denen du generell schlechter dran bist, sondern auch in akuten Momenten innerhalb eines Tages. Bis gleich.",
  slides: [
    {
      type: "reveal-list",
      seg: "Im Workbook findest du Übung 4.3: Mein Tages-Check-in. Eine Vorlage für die fünf Fragen, die du täglich kurz beantworten kannst. Plus eine Notiz-Spalte für eine Woche, damit du im ersten Probe-Zeitraum dein Muster siehst.",
      kicker: "Workbook · Übung 4.3 – Mein Tages-Check-in",
      title: "Die Vorlage hat zwei Teile",
      items: [
        { label: "Die fünf Fragen – täglich kurz zu beantworten" },
        { label: "Eine Notiz-Spalte über eine Woche – dein Muster im Probe-Zeitraum" },
      ],
    },
    {
      type: "content",
      seg: " Nach diesen sieben Tagen wirst du erstaunlich klar erkennen, was deine guten und schlechten Tage prägt.",
      kicker: "Sieben Tage Beobachtung",
      headline: "Nach sieben Tagen erkennst du erstaunlich klar, was deine Tage prägt.",
      lead: "Eine Notiz-Spalte über eine Woche – und plötzlich wird sichtbar, was deine guten von deinen schlechten Tagen unterscheidet.",
    },
    {
      type: "statement",
      seg: " Diese Selbst-Beobachtung ist ein eigener therapeutischer Wert – jenseits der reinen Schienen-Wahl.",
      text: "Sieben Tage Selbstbeobachtung schaffen große Klarheit über deine Muster.",
      emphasis: "große Klarheit",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 4.4 – vertiefen wir das Thema schmerzadaptiv. Wir schauen uns an, wie du auch in spezifischen Schmerz-Situationen flexibel und konstruktiv bleibst – nicht nur an Tagen, an denen du generell schlechter dran bist, sondern auch in akuten Momenten innerhalb eines Tages.",
      kicker: "Als Nächstes · Lektion 4.4",
      headline: "Schmerzadaptiv – auch in akuten Momenten innerhalb eines Tages.",
      lead: "Nicht nur an Tagen, an denen du generell schlechter dran bist – auch dann, wenn der Schmerz mitten am Tag kippt. Flexibel und konstruktiv bleiben.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 4.4",
      nextTitle: "Schmerzadaptiv wählen lernen",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "4.3",
  title: "Der Übungs-Katalog: Drei Intensitätsschienen",
  subtitle: "Modul 4 – Recoping · Reizarm, Standard, belastend – als Tages-Werkzeug",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
  ],
};
