/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 1.4
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/1.4.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 1.4`). Niemals lessons/1.4.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Aufbau identisch zu 1.1/1.2/1.3 (siehe sources/1.1.source.ts für die Konvention):
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * 3.-PERSON-REGEL: 1.4 enthält ausschließlich generische Guide-Ich-/Du-Form
 * (der Sprecher erklärt, „wir sprechen", „du kannst"). Keine Ersteller-/Praxis-/
 * Credential-Aussagen → keine Umschreibung auf „Max Glawe" nötig.
 *
 * HWG (besonders kritisch in dieser Lektion): Wortlaut der MD wird beibehalten.
 *   - „Befund ist nicht automatisch gleich Schmerzursache" bleibt als Aussage stehen.
 *   - Studienzahlen sachlich (Prävalenz bei schmerzfreien Menschen, nach Alter).
 *   - Keine Heilversprechen, keine Diagnose-Aussagen. Die Begriffs-Übersetzungen
 *     bleiben einordnend/sachlich (z.B. „Vorwölbung = leicht über die normale
 *     Begrenzung hinausgeschwollen"), exakt wie in der MD.
 *
 * GERMAN-QUOTE-GOTCHA (CLAUDE.md): ASCII-`"` in TS-Strings bricht das Literal.
 * In narration/seg NUR einfache Anführungen ('...') oder gar keine. Die Anzeige-
 * Strings der Slides nutzen typografische Quotes („…") — die sind unproblematisch.
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

// ── Abschnitt 1 – Eröffnung ─────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Hand aufs Herz: Hast du schon mal ein MRT von deinem Rücken machen lassen? Wenn ja – wie hast du dich gefühlt, als der Arzt dir die Befunde mitteilte? Beruhigt? Oder eher: erschrocken? Viele Menschen mit chronischem Rückenschmerz haben mindestens ein MRT in ihrer Geschichte. Manche haben mehrere. Und sehr oft ist die Erfahrung dieselbe: Man kommt mit einer Hoffnung – endlich zu erfahren, was da los ist – und geht raus mit einer Liste schwerwiegend klingender Wörter: Bandscheibenvorwölbung. Modic-Veränderungen. Spondylarthrose. Osteochondrose. Foraminale Stenose. Und der Eindruck bleibt: Mein Rücken ist kaputt. In dieser Lektion sprechen wir darüber, warum das so oft so ist – und warum es trotzdem nicht stimmt. Wir sprechen darüber, was ein MRT eigentlich zeigt, was es nicht zeigt, und warum die Korrelation zwischen MRT-Befund und Schmerz so überraschend schlecht ist. Und am Ende wirst du wissen, wie du mit deinem eigenen MRT-Befund umgehen kannst, ohne dich davon kleiner machen zu lassen.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 1 – Verstehen",
      lessonLabel: "Lektion 1.4 – Das MRT-Paradox: Befund vs. Schmerz",
    },
    {
      type: "statement",
      seg: "Hand aufs Herz: Hast du schon mal ein MRT von deinem Rücken machen lassen? Wenn ja – wie hast du dich gefühlt, als der Arzt dir die Befunde mitteilte? Beruhigt? Oder eher: erschrocken?",
      text: "Beruhigt – oder eher erschrocken?",
    },
    {
      type: "content",
      seg: " Viele Menschen mit chronischem Rückenschmerz haben mindestens ein MRT in ihrer Geschichte. Manche haben mehrere. Und sehr oft ist die Erfahrung dieselbe: Man kommt mit einer Hoffnung – endlich zu erfahren, was da los ist – und geht raus mit einer Liste schwerwiegend klingender Wörter:",
      kicker: "Eine vertraute Erfahrung",
      headline: "Man kommt mit Hoffnung – und geht mit einer Liste schwerer Wörter.",
    },
    {
      type: "reveal-list",
      seg: " Bandscheibenvorwölbung. Modic-Veränderungen. Spondylarthrose. Osteochondrose. Foraminale Stenose. Und der Eindruck bleibt: Mein Rücken ist kaputt.",
      kicker: "Wörter, die schwer klingen",
      title: "Auf dem Befund steht",
      items: [
        { label: "Bandscheibenvorwölbung" },
        { label: "Modic-Veränderungen" },
        { label: "Spondylarthrose" },
        { label: "Osteochondrose" },
        { label: "Foraminale Stenose" },
      ],
    },
    {
      type: "content",
      seg: " In dieser Lektion sprechen wir darüber, warum das so oft so ist – und warum es trotzdem nicht stimmt. Wir sprechen darüber, was ein MRT eigentlich zeigt, was es nicht zeigt, und warum die Korrelation zwischen MRT-Befund und Schmerz so überraschend schlecht ist.",
      kicker: "Worum es heute geht",
      headline: "Was ein MRT zeigt, was es nicht zeigt – und warum „kaputt“ nicht stimmt.",
      lead: "Warum die Korrelation zwischen Befund und Schmerz so überraschend schlecht ist.",
    },
    {
      type: "statement",
      seg: " Und am Ende wirst du wissen, wie du mit deinem eigenen MRT-Befund umgehen kannst, ohne dich davon kleiner machen zu lassen.",
      text: "Am Ende weißt du, wie du mit deinem Befund umgehst – ohne dich kleiner machen zu lassen.",
    },
  ],
};

// ── Abschnitt 2 – Was ein MRT zeigt und was nicht ────────────────────────────

const abschnitt2: SourceSection = {
  title: "Was ein MRT zeigt und was nicht",
  narration:
    "Beginnen wir mit dem Grundlegenden. Ein MRT – Magnetresonanztomografie – ist ein bildgebendes Verfahren, das mittels Magnetfeldern detaillierte Schnittbilder vom Körperinneren erzeugt. Im Gegensatz zum Röntgen, das vor allem Knochen zeigt, sieht das MRT auch Weichteile sehr gut: Bandscheiben, Muskeln, Nerven, Bänder. Es ist ein extrem präzises Diagnostik-Werkzeug. Aber – und das ist die zentrale Erkenntnis dieser Lektion – ein MRT zeigt Struktur, nicht Funktion. Es zeigt, wie etwas aussieht, nicht wie etwas arbeitet oder wie es sich anfühlt. Ein MRT kann zeigen, dass eine Bandscheibe leicht vorgewölbt ist. Es kann nicht zeigen, ob diese Vorwölbung Schmerz macht. Ein MRT kann zeigen, dass ein Facettengelenk Verschleißerscheinungen hat. Es kann nicht zeigen, ob diese Erscheinungen Beschwerden verursachen. Ein MRT zeigt einen Zustand zu einem Zeitpunkt, in einer Position – meist liegend, ohne Belastung. Es zeigt keine Bewegung, keine Funktion, kein Erleben. Das ist wichtig zu verstehen, weil viele Menschen das MRT für eine Art finale Wahrheit halten. Das Bild zeigt, was bei mir los ist. In Wirklichkeit zeigt das Bild eine Momentaufnahme deiner Strukturen. Und Strukturen sind, wie wir in den letzten Lektionen gelernt haben, nicht das Einzige, was Schmerz erzeugt.",
  slides: [
    {
      type: "word",
      seg: "Beginnen wir mit dem Grundlegenden.",
      word: "Was ein MRT zeigt.",
    },
    {
      type: "content",
      seg: " Ein MRT – Magnetresonanztomografie – ist ein bildgebendes Verfahren, das mittels Magnetfeldern detaillierte Schnittbilder vom Körperinneren erzeugt. Im Gegensatz zum Röntgen, das vor allem Knochen zeigt, sieht das MRT auch Weichteile sehr gut: Bandscheiben, Muskeln, Nerven, Bänder. Es ist ein extrem präzises Diagnostik-Werkzeug.",
      kicker: "Magnetresonanztomografie",
      headline: "Ein extrem präzises Diagnostik-Werkzeug.",
      lead: "Anders als das Röntgen sieht es auch Weichteile: Bandscheiben, Muskeln, Nerven, Bänder.",
    },
    {
      type: "statement",
      seg: " Aber – und das ist die zentrale Erkenntnis dieser Lektion – ein MRT zeigt Struktur, nicht Funktion. Es zeigt, wie etwas aussieht, nicht wie etwas arbeitet oder wie es sich anfühlt.",
      text: "Ein MRT zeigt Struktur, nicht Funktion.",
      emphasis: "Struktur",
    },
    {
      type: "reveal-list",
      seg: " Ein MRT kann zeigen, dass eine Bandscheibe leicht vorgewölbt ist. Es kann nicht zeigen, ob diese Vorwölbung Schmerz macht. Ein MRT kann zeigen, dass ein Facettengelenk Verschleißerscheinungen hat. Es kann nicht zeigen, ob diese Erscheinungen Beschwerden verursachen.",
      kicker: "Was es zeigt – und was nicht",
      title: "Sehen ist nicht spüren",
      items: [
        { label: "Es zeigt: eine Bandscheibe ist leicht vorgewölbt — nicht: ob sie Schmerz macht" },
        { label: "Es zeigt: ein Facettengelenk hat Verschleiß — nicht: ob er Beschwerden verursacht" },
      ],
    },
    {
      type: "content",
      seg: " Ein MRT zeigt einen Zustand zu einem Zeitpunkt, in einer Position – meist liegend, ohne Belastung. Es zeigt keine Bewegung, keine Funktion, kein Erleben.",
      headline: "Ein Zustand, ein Zeitpunkt, eine Position – meist liegend, ohne Belastung.",
      lead: "Keine Bewegung, keine Funktion, kein Erleben.",
    },
    {
      type: "content",
      seg: " Das ist wichtig zu verstehen, weil viele Menschen das MRT für eine Art finale Wahrheit halten. Das Bild zeigt, was bei mir los ist. In Wirklichkeit zeigt das Bild eine Momentaufnahme deiner Strukturen. Und Strukturen sind, wie wir in den letzten Lektionen gelernt haben, nicht das Einzige, was Schmerz erzeugt.",
      dark: true,
      kicker: "Keine finale Wahrheit",
      headline: "Das Bild ist eine Momentaufnahme deiner Strukturen.",
      lead: "Und Strukturen sind nicht das Einzige, was Schmerz erzeugt.",
    },
  ],
};

// ── Abschnitt 3 – Die Schlüsselstudien ────────────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Die Schlüsselstudien",
  narration:
    "Jetzt zu dem Punkt, der bei vielen Patienten echte Erleichterung auslöst. Seit etwa zwei Jahrzehnten gibt es eine Forschungs-Richtung, die untersucht: Wie sieht eigentlich ein normaler, schmerzfreier Rücken im MRT aus? Forschende haben dafür Menschen ohne jegliche Rückenschmerzen ins MRT geschoben und ihre Bilder anonymisiert auswerten lassen. Die Ergebnisse sind seit Jahren bemerkenswert konsistent. Bei Menschen ohne Rückenschmerzen finden sich: Bei den 20- bis 30-Jährigen: bei etwa 30 Prozent Bandscheibenveränderungen. Davon bei rund 30 Prozent Vorwölbungen. Bei den 40-Jährigen: bei etwa 50 Prozent Bandscheibenveränderungen. Vorwölbungen bei etwa 40 Prozent. Bandscheibenvorfälle bei rund 25 Prozent. Bei den 60-Jährigen: bei etwa 90 Prozent Bandscheibenveränderungen. Vorwölbungen bei rund 70 Prozent. Bandscheibenvorfälle bei knapp 30 Prozent. Bei den 80-Jährigen: bei etwa 95 Prozent klar sichtbare Bandscheibenveränderungen. Vorwölbungen bei 80 Prozent. Und das sind alles Menschen ohne Schmerzen. Die Hauptbotschaft ist klar: Was wir oft als Pathologie sehen, ist in Wirklichkeit oft schlicht Altern. Bandscheiben verändern sich mit den Jahren. Wirbel zeigen Spuren der Zeit. Das ist normal. Genau wie graue Haare oder Falten – normale, altersbedingte Veränderungen, die in den meisten Fällen keine Schmerzen machen. Was bedeutet das für deinen MRT-Befund? Wenn dort etwa steht Bandscheibenvorwölbung L4/L5 – dann ist das ein Befund, der bei rund 40 Prozent aller schmerzfreien 40-Jährigen genauso zu finden wäre. Es ist nicht automatisch deine Schmerzursache. Es ist erstmal nur eine Beschreibung deiner Anatomie.",
  slides: [
    {
      type: "word",
      seg: "Jetzt zu dem Punkt, der bei vielen Patienten echte Erleichterung auslöst.",
      word: "Die Schlüsselstudien.",
    },
    {
      type: "content",
      seg: " Seit etwa zwei Jahrzehnten gibt es eine Forschungs-Richtung, die untersucht: Wie sieht eigentlich ein normaler, schmerzfreier Rücken im MRT aus? Forschende haben dafür Menschen ohne jegliche Rückenschmerzen ins MRT geschoben und ihre Bilder anonymisiert auswerten lassen.",
      kicker: "Seit zwei Jahrzehnten erforscht",
      headline: "Wie sieht ein schmerzfreier Rücken im MRT aus?",
      lead: "Forschende haben Menschen ganz ohne Rückenschmerzen ins MRT geschoben.",
    },
    {
      type: "content",
      seg: " Die Ergebnisse sind seit Jahren bemerkenswert konsistent. Bei Menschen ohne Rückenschmerzen finden sich:",
      headline: "Die Ergebnisse sind seit Jahren bemerkenswert konsistent.",
      lead: "Bei Menschen ohne jegliche Rückenschmerzen findet sich:",
    },
    {
      type: "content",
      seg: " Bei den 20- bis 30-Jährigen: bei etwa 30 Prozent Bandscheibenveränderungen. Davon bei rund 30 Prozent Vorwölbungen.",
      kicker: "20–30 Jahre · ohne Schmerzen",
      headline: "Etwa 30 % zeigen Bandscheibenveränderungen.",
      lead: "Davon rund 30 % Vorwölbungen.",
    },
    {
      type: "content",
      seg: " Bei den 40-Jährigen: bei etwa 50 Prozent Bandscheibenveränderungen. Vorwölbungen bei etwa 40 Prozent. Bandscheibenvorfälle bei rund 25 Prozent.",
      kicker: "40 Jahre · ohne Schmerzen",
      headline: "Etwa 50 % zeigen Bandscheibenveränderungen.",
      lead: "Vorwölbungen bei rund 40 %, Bandscheibenvorfälle bei rund 25 %.",
    },
    {
      type: "content",
      seg: " Bei den 60-Jährigen: bei etwa 90 Prozent Bandscheibenveränderungen. Vorwölbungen bei rund 70 Prozent. Bandscheibenvorfälle bei knapp 30 Prozent.",
      kicker: "60 Jahre · ohne Schmerzen",
      headline: "Etwa 90 % zeigen Bandscheibenveränderungen.",
      lead: "Vorwölbungen bei rund 70 %, Bandscheibenvorfälle bei knapp 30 %.",
    },
    {
      type: "content",
      seg: " Bei den 80-Jährigen: bei etwa 95 Prozent klar sichtbare Bandscheibenveränderungen. Vorwölbungen bei 80 Prozent.",
      kicker: "80 Jahre · ohne Schmerzen",
      headline: "Etwa 95 % zeigen klar sichtbare Bandscheibenveränderungen.",
      lead: "Vorwölbungen bei 80 %.",
    },
    {
      type: "statement",
      seg: " Und das sind alles Menschen ohne Schmerzen.",
      text: "Und das sind alles Menschen ohne Schmerzen.",
      emphasis: "ohne",
    },
    {
      type: "content",
      seg: " Die Hauptbotschaft ist klar: Was wir oft als Pathologie sehen, ist in Wirklichkeit oft schlicht Altern. Bandscheiben verändern sich mit den Jahren. Wirbel zeigen Spuren der Zeit. Das ist normal. Genau wie graue Haare oder Falten – normale, altersbedingte Veränderungen, die in den meisten Fällen keine Schmerzen machen.",
      kicker: "Die Hauptbotschaft",
      headline: "Was wir oft als Pathologie sehen, ist oft schlicht Altern.",
      lead: "Wie graue Haare oder Falten – normale Veränderungen, die meist keine Schmerzen machen.",
    },
    {
      type: "content",
      seg: " Was bedeutet das für deinen MRT-Befund? Wenn dort etwa steht Bandscheibenvorwölbung L4/L5 – dann ist das ein Befund, der bei rund 40 Prozent aller schmerzfreien 40-Jährigen genauso zu finden wäre. Es ist nicht automatisch deine Schmerzursache. Es ist erstmal nur eine Beschreibung deiner Anatomie.",
      kicker: "Für deinen Befund heißt das",
      headline: "„Bandscheibenvorwölbung L4/L5“ hätten auch rund 40 % schmerzfreier 40-Jähriger.",
      lead: "Nicht automatisch deine Schmerzursache – erstmal nur eine Beschreibung deiner Anatomie.",
    },
  ],
};

// ── Abschnitt 4 – Warum trotzdem MRTs gemacht werden ─────────────────────────

const abschnitt4: SourceSection = {
  title: "Warum trotzdem MRTs gemacht werden",
  narration:
    "An dieser Stelle könnte sich die Frage stellen: Wenn MRT-Befunde so oft nicht aussagekräftig sind – warum macht man dann überhaupt MRTs? Die Antwort ist: Es gibt absolut sinnvolle Indikationen für ein MRT bei Rückenschmerz. Das sind genau die Situationen, die wir in Lektion I.3 als Red Flags besprochen haben. Wenn der Verdacht auf eine ernsthafte Ursache besteht – einen Tumor, eine Entzündung, eine relevante Nervenkompression mit motorischen Ausfällen – dann ist ein MRT das Mittel der Wahl. Wenn es um unspezifischen chronischen Kreuzschmerz geht – also den Schmerz, mit dem wir uns in dieser Masterclass beschäftigen – dann sagen die Leitlinien: Routinemäßiges MRT ist nicht empfohlen. Es bringt selten neue Erkenntnisse und führt häufiger zu mehr Verwirrung als zu mehr Klarheit. Trotzdem werden in der Praxis viele MRTs auch ohne klare Indikation gemacht. Aus Vorsicht, aus Patientenwunsch, aus Routine. Das Ergebnis ist eine Welle von Zufallsbefunden – Veränderungen, die im Bild zu sehen sind, aber keine klinische Relevanz haben. Diese Befunde landen dann im Arztbrief, der Patient liest sie, und der ohnehin schwierige Schmerz bekommt jetzt noch eine schwere medizinische Verpackung. Das ist nicht die Schuld einzelner Ärzte. Das ist ein systemisches Problem moderner Medizin: Wir haben die Bildgebung schneller weiterentwickelt als das klinische Verständnis dafür, was diese Bilder bedeuten.",
  slides: [
    {
      type: "content",
      seg: "An dieser Stelle könnte sich die Frage stellen: Wenn MRT-Befunde so oft nicht aussagekräftig sind – warum macht man dann überhaupt MRTs?",
      kicker: "Eine berechtigte Frage",
      headline: "Warum macht man dann überhaupt MRTs?",
    },
    {
      type: "content",
      seg: " Die Antwort ist: Es gibt absolut sinnvolle Indikationen für ein MRT bei Rückenschmerz. Das sind genau die Situationen, die wir in Lektion I.3 als Red Flags besprochen haben. Wenn der Verdacht auf eine ernsthafte Ursache besteht – einen Tumor, eine Entzündung, eine relevante Nervenkompression mit motorischen Ausfällen – dann ist ein MRT das Mittel der Wahl.",
      kicker: "MRT sinnvoll bei · Red Flags",
      headline: "Bei Verdacht auf eine ernsthafte Ursache ist das MRT das Mittel der Wahl.",
      lead: "Tumor, Entzündung, relevante Nervenkompression mit motorischen Ausfällen – die Red Flags aus Lektion I.3.",
    },
    {
      type: "content",
      seg: " Wenn es um unspezifischen chronischen Kreuzschmerz geht – also den Schmerz, mit dem wir uns in dieser Masterclass beschäftigen – dann sagen die Leitlinien: Routinemäßiges MRT ist nicht empfohlen. Es bringt selten neue Erkenntnisse und führt häufiger zu mehr Verwirrung als zu mehr Klarheit.",
      kicker: "MRT nicht routinemäßig bei · unspezifischem Kreuzschmerz",
      headline: "Beim unspezifischen Kreuzschmerz raten die Leitlinien vom Routine-MRT ab.",
      lead: "Es bringt selten neue Erkenntnisse – und führt häufiger zu Verwirrung als zu Klarheit.",
    },
    {
      type: "content",
      seg: " Trotzdem werden in der Praxis viele MRTs auch ohne klare Indikation gemacht. Aus Vorsicht, aus Patientenwunsch, aus Routine. Das Ergebnis ist eine Welle von Zufallsbefunden – Veränderungen, die im Bild zu sehen sind, aber keine klinische Relevanz haben. Diese Befunde landen dann im Arztbrief, der Patient liest sie, und der ohnehin schwierige Schmerz bekommt jetzt noch eine schwere medizinische Verpackung.",
      kicker: "Die Folge",
      headline: "Eine Welle von Zufallsbefunden – im Bild sichtbar, aber ohne klinische Relevanz.",
      lead: "Sie landen im Arztbrief, und der Schmerz bekommt eine schwere medizinische Verpackung.",
    },
    {
      type: "statement",
      seg: " Das ist nicht die Schuld einzelner Ärzte. Das ist ein systemisches Problem moderner Medizin: Wir haben die Bildgebung schneller weiterentwickelt als das klinische Verständnis dafür, was diese Bilder bedeuten.",
      text: "Die Bildgebung war schneller als das Verständnis dafür, was die Bilder bedeuten.",
    },
  ],
};

// ── Abschnitt 5 – Wie du mit deinem Befund umgehen solltest ───────────────────

const abschnitt5: SourceSection = {
  title: "Wie du mit deinem Befund umgehen solltest",
  narration:
    "Wenn du selbst einen MRT-Befund hast, hier ein praktischer Leitfaden, wie du damit umgehen kannst. Erstens: Drucke dir den Befund aus und unterstreiche alle Worte, die dich beunruhigt haben. Häufig sind das: Vorwölbung. Protrusion. Prolaps. Spondylarthrose. Osteochondrose. Modic-Zeichen. Foraminale Stenose. Vielleicht hast du dir bei diesen Worten gemerkt: Hier ist etwas Schlimmes. Zweitens: Setz dich hin und sortier die Worte einmal neu ein. Vorwölbung heißt: Eine Bandscheibe ist leicht über ihre normale Begrenzung hinausgeschwollen. Protrusion ist das medizinische Wort für Vorwölbung. Prolaps ist ein Bandscheibenvorfall. Spondylarthrose heißt: Verschleißzeichen an den Facettengelenken. Osteochondrose heißt: Veränderungen an den Bandscheiben und angrenzenden Wirbelkörpern. Modic-Zeichen sind kleine Signalveränderungen im Knochenmark angrenzend an Bandscheiben. Foraminale Stenose heißt: Verengung eines Zwischenwirbel-Lochs. Drittens: Frag dich bei jedem dieser Befunde: Wie viele schmerzfreie Menschen meiner Altersgruppe würden vermutlich denselben Befund haben? Die Antwort ist fast immer: Viele. Bei den meisten dieser Worte sprichst du von Normalvarianten oder altersbedingten Veränderungen, die in der schmerzfreien Bevölkerung weit verbreitet sind. Viertens: Wenn dich etwas ehrlich nicht beruhigt, suche das Gespräch mit deinem Arzt. Frage explizit: Hat dieser Befund konkrete Konsequenzen für meine Behandlung? Würde ich diesen Befund auch haben, wenn ich keine Schmerzen hätte? Diese Fragen helfen, Befunde von echten klinischen Hinweisen zu unterscheiden. Fünftens: Bringe deinen MRT-Befund in Beziehung zu deinem Schmerz – aber sei misstrauisch bei einfachen Geschichten wie Das ist die Ursache deines Schmerzes. Echte Schmerzursachen sind selten so eindeutig zuzuordnen.",
  slides: [
    {
      type: "content",
      seg: "Wenn du selbst einen MRT-Befund hast, hier ein praktischer Leitfaden, wie du damit umgehen kannst.",
      kicker: "Ein praktischer Leitfaden",
      headline: "Wie du mit deinem eigenen MRT-Befund umgehst.",
    },
    {
      type: "content",
      seg: " Erstens: Drucke dir den Befund aus und unterstreiche alle Worte, die dich beunruhigt haben. Häufig sind das: Vorwölbung. Protrusion. Prolaps. Spondylarthrose. Osteochondrose. Modic-Zeichen. Foraminale Stenose. Vielleicht hast du dir bei diesen Worten gemerkt: Hier ist etwas Schlimmes.",
      kicker: "Schritt 1",
      headline: "Druck den Befund aus und unterstreiche, was dich beunruhigt hat.",
      lead: "Vorwölbung, Protrusion, Prolaps, Spondylarthrose, Osteochondrose, Modic, foraminale Stenose.",
    },
    {
      type: "reveal-list",
      seg: " Zweitens: Setz dich hin und sortier die Worte einmal neu ein. Vorwölbung heißt: Eine Bandscheibe ist leicht über ihre normale Begrenzung hinausgeschwollen. Protrusion ist das medizinische Wort für Vorwölbung. Prolaps ist ein Bandscheibenvorfall. Spondylarthrose heißt: Verschleißzeichen an den Facettengelenken. Osteochondrose heißt: Veränderungen an den Bandscheiben und angrenzenden Wirbelkörpern. Modic-Zeichen sind kleine Signalveränderungen im Knochenmark angrenzend an Bandscheiben. Foraminale Stenose heißt: Verengung eines Zwischenwirbel-Lochs.",
      kicker: "Schritt 2 · die Worte neu einsortieren",
      title: "Was die Begriffe wirklich heißen",
      items: [
        { label: "Vorwölbung: eine Bandscheibe ist leicht über ihre normale Begrenzung hinausgeschwollen" },
        { label: "Protrusion: das medizinische Wort für Vorwölbung" },
        { label: "Prolaps: ein Bandscheibenvorfall" },
        { label: "Spondylarthrose: Verschleißzeichen an den Facettengelenken" },
        { label: "Osteochondrose: Veränderungen an Bandscheiben und angrenzenden Wirbelkörpern" },
        { label: "Modic-Zeichen: kleine Signalveränderungen im Knochenmark neben Bandscheiben" },
        { label: "Foraminale Stenose: Verengung eines Zwischenwirbel-Lochs" },
      ],
    },
    {
      type: "content",
      seg: " Drittens: Frag dich bei jedem dieser Befunde: Wie viele schmerzfreie Menschen meiner Altersgruppe würden vermutlich denselben Befund haben? Die Antwort ist fast immer: Viele. Bei den meisten dieser Worte sprichst du von Normalvarianten oder altersbedingten Veränderungen, die in der schmerzfreien Bevölkerung weit verbreitet sind.",
      kicker: "Schritt 3",
      headline: "Frag dich: Wie viele Schmerzfreie meines Alters hätten denselben Befund?",
      lead: "Die Antwort ist fast immer: Viele. Meist sind es Normalvarianten oder altersbedingte Veränderungen.",
    },
    {
      type: "reveal-list",
      seg: " Viertens: Wenn dich etwas ehrlich nicht beruhigt, suche das Gespräch mit deinem Arzt. Frage explizit: Hat dieser Befund konkrete Konsequenzen für meine Behandlung? Würde ich diesen Befund auch haben, wenn ich keine Schmerzen hätte? Diese Fragen helfen, Befunde von echten klinischen Hinweisen zu unterscheiden.",
      kicker: "Schritt 4 · Fragen an deinen Arzt",
      title: "Wenn dich etwas nicht beruhigt",
      items: [
        { label: "Hat dieser Befund konkrete Konsequenzen für meine Behandlung?" },
        { label: "Hätte ich diesen Befund auch, wenn ich keine Schmerzen hätte?" },
      ],
    },
    {
      type: "statement",
      seg: " Fünftens: Bringe deinen MRT-Befund in Beziehung zu deinem Schmerz – aber sei misstrauisch bei einfachen Geschichten wie Das ist die Ursache deines Schmerzes. Echte Schmerzursachen sind selten so eindeutig zuzuordnen.",
      text: "Sei misstrauisch bei einfachen Geschichten wie „Das ist die Ursache“.",
      emphasis: "misstrauisch",
    },
  ],
};

// ── Abschnitt 6 – Sprache, die heilt vs. Sprache, die krank macht ─────────────

const abschnitt6: SourceSection = {
  title: "Sprache, die heilt vs. Sprache, die krank macht",
  narration:
    "Eine letzte Beobachtung, die für deinen Heilungsweg sehr wichtig ist. In der Schmerzforschung gibt es ein Konzept, das Nocebo-Effekt heißt. Das ist im Grunde das Gegenteil des bekannteren Placebo-Effekts. Während Placebo bedeutet positive Erwartung führt zu Verbesserung, bedeutet Nocebo negative Erwartung führt zu Verschlimmerung. Worte können Nocebo-Effekte erzeugen. Wenn dir ein Arzt sagt Ihre Bandscheibe ist abgenutzt, hörst du abgenutzt. Wenn er sagt Ihre Wirbelsäule zeigt Verschleiß, hörst du Verschleiß. Wenn er sagt Ihr Rücken ist im Zustand eines 80-Jährigen, hörst du 80-Jähriger. Diese Worte sind nicht neutral – sie sind Bedrohungs-Wörter. Sie aktivieren in deinem Nervensystem genau die Bedrohungs-Reaktion, die Schmerz verstärkt. Studien zeigen messbar: Menschen, denen schwere Worte über ihren MRT-Befund mitgeteilt werden, haben sechs Monate später mehr Schmerz, mehr Bewegungsangst und mehr Funktionseinschränkungen als Menschen, denen dieselben Befunde in beruhigender, einordnender Sprache erklärt wurden. Du kannst dich davor schützen. Wenn dir jemand schwere Worte über deinen Rücken sagt, dann übersetze sie für dich selbst. Bandscheibenvorwölbung heißt nicht kaputt – es heißt Befund, den auch viele schmerzfreie Menschen haben. Verschleiß heißt nicht unfähig – es heißt altersbedingte Veränderung, ohne Aussagekraft über Funktion. Spondylarthrose heißt nicht fortgeschrittene Erkrankung – es heißt normale Veränderung an den Facettengelenken, die mit Bewegung gut umgangen werden kann. Sprache formt Wahrnehmung. Wahrnehmung formt Schmerzerleben. Du hast Einfluss auf die Sprache, mit der du selbst über deinen Rücken denkst. Und das ist ein erstaunlich wirksames Werkzeug.",
  slides: [
    {
      type: "content",
      seg: "Eine letzte Beobachtung, die für deinen Heilungsweg sehr wichtig ist.",
      kicker: "Eine letzte Beobachtung",
      headline: "Etwas, das für deinen Weg sehr wichtig ist.",
    },
    {
      type: "content",
      seg: " In der Schmerzforschung gibt es ein Konzept, das Nocebo-Effekt heißt. Das ist im Grunde das Gegenteil des bekannteren Placebo-Effekts. Während Placebo bedeutet positive Erwartung führt zu Verbesserung, bedeutet Nocebo negative Erwartung führt zu Verschlimmerung.",
      kicker: "Der Nocebo-Effekt",
      headline: "Das Gegenteil des Placebo-Effekts.",
      lead: "Placebo: positive Erwartung führt zu Verbesserung. Nocebo: negative Erwartung führt zu Verschlimmerung.",
    },
    {
      type: "reveal-list",
      seg: " Worte können Nocebo-Effekte erzeugen. Wenn dir ein Arzt sagt Ihre Bandscheibe ist abgenutzt, hörst du abgenutzt. Wenn er sagt Ihre Wirbelsäule zeigt Verschleiß, hörst du Verschleiß. Wenn er sagt Ihr Rücken ist im Zustand eines 80-Jährigen, hörst du 80-Jähriger.",
      kicker: "Worte als Auslöser",
      title: "Was hängen bleibt",
      items: [
        { label: "„Ihre Bandscheibe ist abgenutzt“ → du hörst: abgenutzt" },
        { label: "„Ihre Wirbelsäule zeigt Verschleiß“ → du hörst: Verschleiß" },
        { label: "„Ihr Rücken ist im Zustand eines 80-Jährigen“ → du hörst: 80-Jähriger" },
      ],
    },
    {
      type: "statement",
      seg: " Diese Worte sind nicht neutral – sie sind Bedrohungs-Wörter. Sie aktivieren in deinem Nervensystem genau die Bedrohungs-Reaktion, die Schmerz verstärkt.",
      text: "Das sind keine neutralen Worte – es sind Bedrohungs-Wörter.",
      emphasis: "Bedrohungs-Wörter",
    },
    {
      type: "content",
      seg: " Studien zeigen messbar: Menschen, denen schwere Worte über ihren MRT-Befund mitgeteilt werden, haben sechs Monate später mehr Schmerz, mehr Bewegungsangst und mehr Funktionseinschränkungen als Menschen, denen dieselben Befunde in beruhigender, einordnender Sprache erklärt wurden.",
      kicker: "Messbar in Studien",
      headline: "Dieselben Befunde, andere Worte – sechs Monate später messbar mehr Schmerz.",
      lead: "Mehr Schmerz, mehr Bewegungsangst, mehr Funktionseinschränkungen bei schweren Worten.",
    },
    {
      type: "reveal-list",
      seg: " Du kannst dich davor schützen. Wenn dir jemand schwere Worte über deinen Rücken sagt, dann übersetze sie für dich selbst. Bandscheibenvorwölbung heißt nicht kaputt – es heißt Befund, den auch viele schmerzfreie Menschen haben. Verschleiß heißt nicht unfähig – es heißt altersbedingte Veränderung, ohne Aussagekraft über Funktion. Spondylarthrose heißt nicht fortgeschrittene Erkrankung – es heißt normale Veränderung an den Facettengelenken, die mit Bewegung gut umgangen werden kann.",
      kicker: "Übersetze für dich selbst",
      title: "Schwere Worte neu einordnen",
      items: [
        { label: "Vorwölbung ≠ kaputt → Befund, den auch viele Schmerzfreie haben" },
        { label: "Verschleiß ≠ unfähig → altersbedingte Veränderung, ohne Aussage über die Funktion" },
        { label: "Spondylarthrose ≠ fortgeschrittene Erkrankung → normale Veränderung, mit Bewegung gut umgehbar" },
      ],
    },
    {
      type: "statement",
      seg: " Sprache formt Wahrnehmung. Wahrnehmung formt Schmerzerleben. Du hast Einfluss auf die Sprache, mit der du selbst über deinen Rücken denkst. Und das ist ein erstaunlich wirksames Werkzeug.",
      text: "Sprache formt Wahrnehmung. Wahrnehmung formt Schmerz.",
      emphasis: "Sprache",
    },
  ],
};

// ── Abschnitt 7 – Workbook und Übergang ───────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 1.4: MRT-Reframing. Wenn du einen MRT-Befund hast, kannst du dort die wichtigsten Begriffe eintragen und mit den Übersetzungen aus dieser Lektion neu einordnen. Wenn du keinen MRT-Befund hast – auch gut. Dann notierst du dir die schweren Worte, die andere Quellen über deinen Rücken gesagt haben, und übersetzt sie in neutralere Sprache. In der nächsten Lektion – 1.5 – kommt die wichtigste Lektion des ganzen Moduls. Wir verbinden alles, was du bisher gelernt hast: die Anatomie, die Chronifizierung, das MRT-Paradox – und führen es zusammen zu einem Modell, das dich für den Rest der Masterclass tragen wird. Wir sprechen über dein Schmerzsystem als Alarmanlage. Was du danach verstanden hast, wird viel von dem, was du bisher über Schmerz geglaubt hast, neu sortieren. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 1.4: MRT-Reframing. Wenn du einen MRT-Befund hast, kannst du dort die wichtigsten Begriffe eintragen und mit den Übersetzungen aus dieser Lektion neu einordnen. Wenn du keinen MRT-Befund hast – auch gut. Dann notierst du dir die schweren Worte, die andere Quellen über deinen Rücken gesagt haben, und übersetzt sie in neutralere Sprache.",
      kicker: "Workbook · Übung 1.4",
      headline: "Ein Workbook-Stopp: MRT-Reframing.",
      lead: "Begriffe eintragen und neu einordnen – und wenn du keinen Befund hast, die schweren Worte anderer Quellen übersetzen.",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 1.5 – kommt die wichtigste Lektion des ganzen Moduls. Wir verbinden alles, was du bisher gelernt hast: die Anatomie, die Chronifizierung, das MRT-Paradox – und führen es zusammen zu einem Modell, das dich für den Rest der Masterclass tragen wird.",
      kicker: "Als Nächstes · Lektion 1.5",
      headline: "Die wichtigste Lektion des ganzen Moduls.",
      lead: "Anatomie, Chronifizierung, MRT-Paradox – alles fließt in ein tragendes Modell zusammen.",
    },
    {
      type: "outro",
      seg: " Wir sprechen über dein Schmerzsystem als Alarmanlage. Was du danach verstanden hast, wird viel von dem, was du bisher über Schmerz geglaubt hast, neu sortieren.",
      nextLabel: "Lektion 1.5",
      nextTitle: "Dein Schmerzsystem als Alarmanlage",
      hint: "Weiter →",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "1.4",
  title: "Das MRT-Paradox: Befund vs. Schmerz",
  subtitle: "Modul 1 – Verstehen · Befund ≠ Schmerzursache",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
    abschnitt7,
  ],
};
