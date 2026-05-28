/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 1.4
 * Das MRT-Paradox: Befund vs. Schmerz
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/1.4.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 1.4  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
 * Änderungen am Text/Timing → Source ändern + Build-Skript erneut laufen lassen.
 *
 * SYNCHRONISATION (wort-genau):
 *   Jede Slide trägt eine `appearTime` (Sekunden, relativ zum Abschnitt-Audio).
 *   Sie wurde aus dem ElevenLabs-Wort-Alignment berechnet: Für das Sprech-Segment
 *   jeder Slide (`seg` in der Source) wird der Start-Zeichen-Offset im gesprochenen
 *   Text bestimmt und `appearTime = starts[offset]` gesetzt. Der Player schaltet
 *   die Slide, sobald `audio.currentTime >= slide.appearTime`. Weder `seg` noch
 *   das Alignment werden an den Client ausgeliefert — nur die fertigen Zeitwerte.
 *
 * Die Transkripte sind die bereinigten Erzähltexte (Pausen-Marker und Emphasis
 * entfernt). Der Wortlaut bleibt unverändert (HWG: keine Heilversprechen).
 *
 * Die Slide-/Abschnitt-/Lektions-Typen liegen geteilt in ../types.
 */

import {
  type Lesson,
  totalSlides,
  flatSlides,
  type FlatSlide,
} from "../types";

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/1.4";

export const lesson_1_4: Lesson = {
  id: "1.4",
  title: "Das MRT-Paradox: Befund vs. Schmerz",
  subtitle: "Modul 1 – Verstehen · Befund ≠ Schmerzursache",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Hand aufs Herz: Hast du schon mal ein MRT von deinem Rücken machen lassen? Wenn ja – wie hast du dich gefühlt, als der Arzt dir die Befunde mitteilte? Beruhigt? Oder eher: erschrocken? Viele Menschen mit chronischem Rückenschmerz haben mindestens ein MRT in ihrer Geschichte. Manche haben mehrere. Und sehr oft ist die Erfahrung dieselbe: Man kommt mit einer Hoffnung – endlich zu erfahren, was da los ist – und geht raus mit einer Liste schwerwiegend klingender Wörter: Bandscheibenvorwölbung. Modic-Veränderungen. Spondylarthrose. Osteochondrose. Foraminale Stenose. Und der Eindruck bleibt: Mein Rücken ist kaputt. In dieser Lektion sprechen wir darüber, warum das so oft so ist – und warum es trotzdem nicht stimmt. Wir sprechen darüber, was ein MRT eigentlich zeigt, was es nicht zeigt, und warum die Korrelation zwischen MRT-Befund und Schmerz so überraschend schlecht ist. Und am Ende wirst du wissen, wie du mit deinem eigenen MRT-Befund umgehen kannst, ohne dich davon kleiner machen zu lassen.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 1 – Verstehen",
          lessonLabel: "Lektion 1.4 – Das MRT-Paradox: Befund vs. Schmerz",
        },
        {
          type: "statement",
          appearTime: 0,
          text: "Beruhigt – oder eher erschrocken?",
        },
        {
          type: "content",
          appearTime: 9.95,
          kicker: "Eine vertraute Erfahrung",
          headline: "Man kommt mit Hoffnung – und geht mit einer Liste schwerer Wörter.",
        },
        {
          type: "reveal-list",
          appearTime: 23.696,
          kicker: "Wörter, die schwer klingen",
          title: "Auf dem Befund steht",
          items: [{"label":"Bandscheibenvorwölbung"},{"label":"Modic-Veränderungen"},{"label":"Spondylarthrose"},{"label":"Osteochondrose"},{"label":"Foraminale Stenose"}],
        },
        {
          type: "content",
          appearTime: 34.76,
          kicker: "Worum es heute geht",
          headline: "Was ein MRT zeigt, was es nicht zeigt – und warum „kaputt“ nicht stimmt.",
          lead: "Warum die Korrelation zwischen Befund und Schmerz so überraschend schlecht ist.",
        },
        {
          type: "statement",
          appearTime: 51.211,
          text: "Am Ende weißt du, wie du mit deinem Befund umgehst – ohne dich kleiner machen zu lassen.",
        },
      ],
    },
    {
      title: "Was ein MRT zeigt und was nicht",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Beginnen wir mit dem Grundlegenden. Ein MRT – Magnetresonanztomografie – ist ein bildgebendes Verfahren, das mittels Magnetfeldern detaillierte Schnittbilder vom Körperinneren erzeugt. Im Gegensatz zum Röntgen, das vor allem Knochen zeigt, sieht das MRT auch Weichteile sehr gut: Bandscheiben, Muskeln, Nerven, Bänder. Es ist ein extrem präzises Diagnostik-Werkzeug. Aber – und das ist die zentrale Erkenntnis dieser Lektion – ein MRT zeigt Struktur, nicht Funktion. Es zeigt, wie etwas aussieht, nicht wie etwas arbeitet oder wie es sich anfühlt. Ein MRT kann zeigen, dass eine Bandscheibe leicht vorgewölbt ist. Es kann nicht zeigen, ob diese Vorwölbung Schmerz macht. Ein MRT kann zeigen, dass ein Facettengelenk Verschleißerscheinungen hat. Es kann nicht zeigen, ob diese Erscheinungen Beschwerden verursachen. Ein MRT zeigt einen Zustand zu einem Zeitpunkt, in einer Position – meist liegend, ohne Belastung. Es zeigt keine Bewegung, keine Funktion, kein Erleben. Das ist wichtig zu verstehen, weil viele Menschen das MRT für eine Art finale Wahrheit halten. Das Bild zeigt, was bei mir los ist. In Wirklichkeit zeigt das Bild eine Momentaufnahme deiner Strukturen. Und Strukturen sind, wie wir in den letzten Lektionen gelernt haben, nicht das Einzige, was Schmerz erzeugt.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Was ein MRT zeigt.",
        },
        {
          type: "content",
          appearTime: 2.705,
          kicker: "Magnetresonanztomografie",
          headline: "Ein extrem präzises Diagnostik-Werkzeug.",
          lead: "Anders als das Röntgen sieht es auch Weichteile: Bandscheiben, Muskeln, Nerven, Bänder.",
        },
        {
          type: "statement",
          appearTime: 25.553,
          text: "Ein MRT zeigt Struktur, nicht Funktion.",
          emphasis: "Struktur",
        },
        {
          type: "reveal-list",
          appearTime: 36.258,
          kicker: "Was es zeigt – und was nicht",
          title: "Sehen ist nicht spüren",
          items: [{"label":"Es zeigt: eine Bandscheibe ist leicht vorgewölbt — nicht: ob sie Schmerz macht"},{"label":"Es zeigt: ein Facettengelenk hat Verschleiß — nicht: ob er Beschwerden verursacht"}],
        },
        {
          type: "content",
          appearTime: 51.792,
          headline: "Ein Zustand, ein Zeitpunkt, eine Position – meist liegend, ohne Belastung.",
          lead: "Keine Bewegung, keine Funktion, kein Erleben.",
        },
        {
          type: "content",
          appearTime: 60.697,
          dark: true,
          kicker: "Keine finale Wahrheit",
          headline: "Das Bild ist eine Momentaufnahme deiner Strukturen.",
          lead: "Und Strukturen sind nicht das Einzige, was Schmerz erzeugt.",
        },
      ],
    },
    {
      title: "Die Schlüsselstudien",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Jetzt zu dem Punkt, der bei vielen Patienten echte Erleichterung auslöst. Seit etwa zwei Jahrzehnten gibt es eine Forschungs-Richtung, die untersucht: Wie sieht eigentlich ein normaler, schmerzfreier Rücken im MRT aus? Forschende haben dafür Menschen ohne jegliche Rückenschmerzen ins MRT geschoben und ihre Bilder anonymisiert auswerten lassen. Die Ergebnisse sind seit Jahren bemerkenswert konsistent. Bei Menschen ohne Rückenschmerzen finden sich: Bei den 20- bis 30-Jährigen: bei etwa 30 Prozent Bandscheibenveränderungen. Davon bei rund 30 Prozent Vorwölbungen. Bei den 40-Jährigen: bei etwa 50 Prozent Bandscheibenveränderungen. Vorwölbungen bei etwa 40 Prozent. Bandscheibenvorfälle bei rund 25 Prozent. Bei den 60-Jährigen: bei etwa 90 Prozent Bandscheibenveränderungen. Vorwölbungen bei rund 70 Prozent. Bandscheibenvorfälle bei knapp 30 Prozent. Bei den 80-Jährigen: bei etwa 95 Prozent klar sichtbare Bandscheibenveränderungen. Vorwölbungen bei 80 Prozent. Und das sind alles Menschen ohne Schmerzen. Die Hauptbotschaft ist klar: Was wir oft als Pathologie sehen, ist in Wirklichkeit oft schlicht Altern. Bandscheiben verändern sich mit den Jahren. Wirbel zeigen Spuren der Zeit. Das ist normal. Genau wie graue Haare oder Falten – normale, altersbedingte Veränderungen, die in den meisten Fällen keine Schmerzen machen. Was bedeutet das für deinen MRT-Befund? Wenn dort etwa steht Bandscheibenvorwölbung L4/L5 – dann ist das ein Befund, der bei rund 40 Prozent aller schmerzfreien 40-Jährigen genauso zu finden wäre. Es ist nicht automatisch deine Schmerzursache. Es ist erstmal nur eine Beschreibung deiner Anatomie.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Die Schlüsselstudien.",
        },
        {
          type: "content",
          appearTime: 4.783,
          kicker: "Seit zwei Jahrzehnten erforscht",
          headline: "Wie sieht ein schmerzfreier Rücken im MRT aus?",
          lead: "Forschende haben Menschen ganz ohne Rückenschmerzen ins MRT geschoben.",
        },
        {
          type: "content",
          appearTime: 21.676,
          headline: "Die Ergebnisse sind seit Jahren bemerkenswert konsistent.",
          lead: "Bei Menschen ohne jegliche Rückenschmerzen findet sich:",
        },
        {
          type: "content",
          appearTime: 27.179,
          kicker: "20–30 Jahre · ohne Schmerzen",
          headline: "Etwa 30 % zeigen Bandscheibenveränderungen.",
          lead: "Davon rund 30 % Vorwölbungen.",
        },
        {
          type: "content",
          appearTime: 34.005,
          kicker: "40 Jahre · ohne Schmerzen",
          headline: "Etwa 50 % zeigen Bandscheibenveränderungen.",
          lead: "Vorwölbungen bei rund 40 %, Bandscheibenvorfälle bei rund 25 %.",
        },
        {
          type: "content",
          appearTime: 42.527,
          kicker: "60 Jahre · ohne Schmerzen",
          headline: "Etwa 90 % zeigen Bandscheibenveränderungen.",
          lead: "Vorwölbungen bei rund 70 %, Bandscheibenvorfälle bei knapp 30 %.",
        },
        {
          type: "content",
          appearTime: 51.943,
          kicker: "80 Jahre · ohne Schmerzen",
          headline: "Etwa 95 % zeigen klar sichtbare Bandscheibenveränderungen.",
          lead: "Vorwölbungen bei 80 %.",
        },
        {
          type: "statement",
          appearTime: 59.698,
          text: "Und das sind alles Menschen ohne Schmerzen.",
          emphasis: "ohne",
        },
        {
          type: "content",
          appearTime: 62.229,
          kicker: "Die Hauptbotschaft",
          headline: "Was wir oft als Pathologie sehen, ist oft schlicht Altern.",
          lead: "Wie graue Haare oder Falten – normale Veränderungen, die meist keine Schmerzen machen.",
        },
        {
          type: "content",
          appearTime: 79.586,
          kicker: "Für deinen Befund heißt das",
          headline: "„Bandscheibenvorwölbung L4/L5“ hätten auch rund 40 % schmerzfreier 40-Jähriger.",
          lead: "Nicht automatisch deine Schmerzursache – erstmal nur eine Beschreibung deiner Anatomie.",
        },
      ],
    },
    {
      title: "Warum trotzdem MRTs gemacht werden",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "An dieser Stelle könnte sich die Frage stellen: Wenn MRT-Befunde so oft nicht aussagekräftig sind – warum macht man dann überhaupt MRTs? Die Antwort ist: Es gibt absolut sinnvolle Indikationen für ein MRT bei Rückenschmerz. Das sind genau die Situationen, die wir in Lektion I.3 als Red Flags besprochen haben. Wenn der Verdacht auf eine ernsthafte Ursache besteht – einen Tumor, eine Entzündung, eine relevante Nervenkompression mit motorischen Ausfällen – dann ist ein MRT das Mittel der Wahl. Wenn es um unspezifischen chronischen Kreuzschmerz geht – also den Schmerz, mit dem wir uns in dieser Masterclass beschäftigen – dann sagen die Leitlinien: Routinemäßiges MRT ist nicht empfohlen. Es bringt selten neue Erkenntnisse und führt häufiger zu mehr Verwirrung als zu mehr Klarheit. Trotzdem werden in der Praxis viele MRTs auch ohne klare Indikation gemacht. Aus Vorsicht, aus Patientenwunsch, aus Routine. Das Ergebnis ist eine Welle von Zufallsbefunden – Veränderungen, die im Bild zu sehen sind, aber keine klinische Relevanz haben. Diese Befunde landen dann im Arztbrief, der Patient liest sie, und der ohnehin schwierige Schmerz bekommt jetzt noch eine schwere medizinische Verpackung. Das ist nicht die Schuld einzelner Ärzte. Das ist ein systemisches Problem moderner Medizin: Wir haben die Bildgebung schneller weiterentwickelt als das klinische Verständnis dafür, was diese Bilder bedeuten.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Eine berechtigte Frage",
          headline: "Warum macht man dann überhaupt MRTs?",
        },
        {
          type: "content",
          appearTime: 8.15,
          kicker: "MRT sinnvoll bei · Red Flags",
          headline: "Bei Verdacht auf eine ernsthafte Ursache ist das MRT das Mittel der Wahl.",
          lead: "Tumor, Entzündung, relevante Nervenkompression mit motorischen Ausfällen – die Red Flags aus Lektion I.3.",
        },
        {
          type: "content",
          appearTime: 28.445,
          kicker: "MRT nicht routinemäßig bei · unspezifischem Kreuzschmerz",
          headline: "Beim unspezifischen Kreuzschmerz raten die Leitlinien vom Routine-MRT ab.",
          lead: "Es bringt selten neue Erkenntnisse – und führt häufiger zu Verwirrung als zu Klarheit.",
        },
        {
          type: "content",
          appearTime: 45.895,
          kicker: "Die Folge",
          headline: "Eine Welle von Zufallsbefunden – im Bild sichtbar, aber ohne klinische Relevanz.",
          lead: "Sie landen im Arztbrief, und der Schmerz bekommt eine schwere medizinische Verpackung.",
        },
        {
          type: "statement",
          appearTime: 69.231,
          text: "Die Bildgebung war schneller als das Verständnis dafür, was die Bilder bedeuten.",
        },
      ],
    },
    {
      title: "Wie du mit deinem Befund umgehen solltest",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Wenn du selbst einen MRT-Befund hast, hier ein praktischer Leitfaden, wie du damit umgehen kannst. Erstens: Drucke dir den Befund aus und unterstreiche alle Worte, die dich beunruhigt haben. Häufig sind das: Vorwölbung. Protrusion. Prolaps. Spondylarthrose. Osteochondrose. Modic-Zeichen. Foraminale Stenose. Vielleicht hast du dir bei diesen Worten gemerkt: Hier ist etwas Schlimmes. Zweitens: Setz dich hin und sortier die Worte einmal neu ein. Vorwölbung heißt: Eine Bandscheibe ist leicht über ihre normale Begrenzung hinausgeschwollen. Protrusion ist das medizinische Wort für Vorwölbung. Prolaps ist ein Bandscheibenvorfall. Spondylarthrose heißt: Verschleißzeichen an den Facettengelenken. Osteochondrose heißt: Veränderungen an den Bandscheiben und angrenzenden Wirbelkörpern. Modic-Zeichen sind kleine Signalveränderungen im Knochenmark angrenzend an Bandscheiben. Foraminale Stenose heißt: Verengung eines Zwischenwirbel-Lochs. Drittens: Frag dich bei jedem dieser Befunde: Wie viele schmerzfreie Menschen meiner Altersgruppe würden vermutlich denselben Befund haben? Die Antwort ist fast immer: Viele. Bei den meisten dieser Worte sprichst du von Normalvarianten oder altersbedingten Veränderungen, die in der schmerzfreien Bevölkerung weit verbreitet sind. Viertens: Wenn dich etwas ehrlich nicht beruhigt, suche das Gespräch mit deinem Arzt. Frage explizit: Hat dieser Befund konkrete Konsequenzen für meine Behandlung? Würde ich diesen Befund auch haben, wenn ich keine Schmerzen hätte? Diese Fragen helfen, Befunde von echten klinischen Hinweisen zu unterscheiden. Fünftens: Bringe deinen MRT-Befund in Beziehung zu deinem Schmerz – aber sei misstrauisch bei einfachen Geschichten wie Das ist die Ursache deines Schmerzes. Echte Schmerzursachen sind selten so eindeutig zuzuordnen.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Ein praktischer Leitfaden",
          headline: "Wie du mit deinem eigenen MRT-Befund umgehst.",
        },
        {
          type: "content",
          appearTime: 5.143,
          kicker: "Schritt 1",
          headline: "Druck den Befund aus und unterstreiche, was dich beunruhigt hat.",
          lead: "Vorwölbung, Protrusion, Prolaps, Spondylarthrose, Osteochondrose, Modic, foraminale Stenose.",
        },
        {
          type: "reveal-list",
          appearTime: 24.357,
          kicker: "Schritt 2 · die Worte neu einsortieren",
          title: "Was die Begriffe wirklich heißen",
          items: [{"label":"Vorwölbung: eine Bandscheibe ist leicht über ihre normale Begrenzung hinausgeschwollen"},{"label":"Protrusion: das medizinische Wort für Vorwölbung"},{"label":"Prolaps: ein Bandscheibenvorfall"},{"label":"Spondylarthrose: Verschleißzeichen an den Facettengelenken"},{"label":"Osteochondrose: Veränderungen an Bandscheiben und angrenzenden Wirbelkörpern"},{"label":"Modic-Zeichen: kleine Signalveränderungen im Knochenmark neben Bandscheiben"},{"label":"Foraminale Stenose: Verengung eines Zwischenwirbel-Lochs"}],
        },
        {
          type: "content",
          appearTime: 59.536,
          kicker: "Schritt 3",
          headline: "Frag dich: Wie viele Schmerzfreie meines Alters hätten denselben Befund?",
          lead: "Die Antwort ist fast immer: Viele. Meist sind es Normalvarianten oder altersbedingte Veränderungen.",
        },
        {
          type: "reveal-list",
          appearTime: 80.875,
          kicker: "Schritt 4 · Fragen an deinen Arzt",
          title: "Wenn dich etwas nicht beruhigt",
          items: [{"label":"Hat dieser Befund konkrete Konsequenzen für meine Behandlung?"},{"label":"Hätte ich diesen Befund auch, wenn ich keine Schmerzen hätte?"}],
        },
        {
          type: "statement",
          appearTime: 98.081,
          text: "Sei misstrauisch bei einfachen Geschichten wie „Das ist die Ursache“.",
          emphasis: "misstrauisch",
        },
      ],
    },
    {
      title: "Sprache, die heilt vs. Sprache, die krank macht",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Eine letzte Beobachtung, die für deinen Heilungsweg sehr wichtig ist. In der Schmerzforschung gibt es ein Konzept, das Nocebo-Effekt heißt. Das ist im Grunde das Gegenteil des bekannteren Placebo-Effekts. Während Placebo bedeutet positive Erwartung führt zu Verbesserung, bedeutet Nocebo negative Erwartung führt zu Verschlimmerung. Worte können Nocebo-Effekte erzeugen. Wenn dir ein Arzt sagt Ihre Bandscheibe ist abgenutzt, hörst du abgenutzt. Wenn er sagt Ihre Wirbelsäule zeigt Verschleiß, hörst du Verschleiß. Wenn er sagt Ihr Rücken ist im Zustand eines 80-Jährigen, hörst du 80-Jähriger. Diese Worte sind nicht neutral – sie sind Bedrohungs-Wörter. Sie aktivieren in deinem Nervensystem genau die Bedrohungs-Reaktion, die Schmerz verstärkt. Studien zeigen messbar: Menschen, denen schwere Worte über ihren MRT-Befund mitgeteilt werden, haben sechs Monate später mehr Schmerz, mehr Bewegungsangst und mehr Funktionseinschränkungen als Menschen, denen dieselben Befunde in beruhigender, einordnender Sprache erklärt wurden. Du kannst dich davor schützen. Wenn dir jemand schwere Worte über deinen Rücken sagt, dann übersetze sie für dich selbst. Bandscheibenvorwölbung heißt nicht kaputt – es heißt Befund, den auch viele schmerzfreie Menschen haben. Verschleiß heißt nicht unfähig – es heißt altersbedingte Veränderung, ohne Aussagekraft über Funktion. Spondylarthrose heißt nicht fortgeschrittene Erkrankung – es heißt normale Veränderung an den Facettengelenken, die mit Bewegung gut umgangen werden kann. Sprache formt Wahrnehmung. Wahrnehmung formt Schmerzerleben. Du hast Einfluss auf die Sprache, mit der du selbst über deinen Rücken denkst. Und das ist ein erstaunlich wirksames Werkzeug.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Eine letzte Beobachtung",
          headline: "Etwas, das für deinen Weg sehr wichtig ist.",
        },
        {
          type: "content",
          appearTime: 3.936,
          kicker: "Der Nocebo-Effekt",
          headline: "Das Gegenteil des Placebo-Effekts.",
          lead: "Placebo: positive Erwartung führt zu Verbesserung. Nocebo: negative Erwartung führt zu Verschlimmerung.",
        },
        {
          type: "reveal-list",
          appearTime: 20.677,
          kicker: "Worte als Auslöser",
          title: "Was hängen bleibt",
          items: [{"label":"„Ihre Bandscheibe ist abgenutzt“ → du hörst: abgenutzt"},{"label":"„Ihre Wirbelsäule zeigt Verschleiß“ → du hörst: Verschleiß"},{"label":"„Ihr Rücken ist im Zustand eines 80-Jährigen“ → du hörst: 80-Jähriger"}],
        },
        {
          type: "statement",
          appearTime: 37.082,
          text: "Das sind keine neutralen Worte – es sind Bedrohungs-Wörter.",
          emphasis: "Bedrohungs-Wörter",
        },
        {
          type: "content",
          appearTime: 46.556,
          kicker: "Messbar in Studien",
          headline: "Dieselben Befunde, andere Worte – sechs Monate später messbar mehr Schmerz.",
          lead: "Mehr Schmerz, mehr Bewegungsangst, mehr Funktionseinschränkungen bei schweren Worten.",
        },
        {
          type: "reveal-list",
          appearTime: 63.205,
          kicker: "Übersetze für dich selbst",
          title: "Schwere Worte neu einordnen",
          items: [{"label":"Vorwölbung ≠ kaputt → Befund, den auch viele Schmerzfreie haben"},{"label":"Verschleiß ≠ unfähig → altersbedingte Veränderung, ohne Aussage über die Funktion"},{"label":"Spondylarthrose ≠ fortgeschrittene Erkrankung → normale Veränderung, mit Bewegung gut umgehbar"}],
        },
        {
          type: "statement",
          appearTime: 90.628,
          text: "Sprache formt Wahrnehmung. Wahrnehmung formt Schmerz.",
          emphasis: "Sprache",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook findest du Übung 1.4: MRT-Reframing. Wenn du einen MRT-Befund hast, kannst du dort die wichtigsten Begriffe eintragen und mit den Übersetzungen aus dieser Lektion neu einordnen. Wenn du keinen MRT-Befund hast – auch gut. Dann notierst du dir die schweren Worte, die andere Quellen über deinen Rücken gesagt haben, und übersetzt sie in neutralere Sprache. In der nächsten Lektion – 1.5 – kommt die wichtigste Lektion des ganzen Moduls. Wir verbinden alles, was du bisher gelernt hast: die Anatomie, die Chronifizierung, das MRT-Paradox – und führen es zusammen zu einem Modell, das dich für den Rest der Masterclass tragen wird. Wir sprechen über dein Schmerzsystem als Alarmanlage. Was du danach verstanden hast, wird viel von dem, was du bisher über Schmerz geglaubt hast, neu sortieren. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 1.4",
          headline: "Ein Workbook-Stopp: MRT-Reframing.",
          lead: "Begriffe eintragen und neu einordnen – und wenn du keinen Befund hast, die schweren Worte anderer Quellen übersetzen.",
        },
        {
          type: "content",
          appearTime: 24.961,
          kicker: "Als Nächstes · Lektion 1.5",
          headline: "Die wichtigste Lektion des ganzen Moduls.",
          lead: "Anatomie, Chronifizierung, MRT-Paradox – alles fließt in ein tragendes Modell zusammen.",
        },
        {
          type: "outro",
          appearTime: 41.911,
          nextLabel: "Lektion 1.5",
          nextTitle: "Dein Schmerzsystem als Alarmanlage",
          hint: "Weiter →",
        },
        {
          type: "word",
          appearTime: 51.361,
          word: "Bis gleich.",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_1_4: number = totalSlides(lesson_1_4);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_1_4: FlatSlide[] = flatSlides(lesson_1_4);

export default lesson_1_4;
