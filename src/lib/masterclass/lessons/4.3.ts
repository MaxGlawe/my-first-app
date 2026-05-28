/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 4.3
 * Der Übungs-Katalog: Drei Intensitätsschienen
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/4.3.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 4.3  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/4.3";

export const lesson_4_3: Lesson = {
  id: "4.3",
  title: "Der Übungs-Katalog: Drei Intensitätsschienen",
  subtitle: "Modul 4 – Recoping · Reizarm, Standard, belastend – als Tages-Werkzeug",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zu Lektion 4.3. In dieser Lektion vertiefen wir das Drei-Schienen-System, das durch Modul 2 lief und das deine Ritual-Map operationalisiert. Du hast die Schienen schon kennengelernt: Reizarm. Standard. Belastend. In jeder Übung. In dieser Lektion klären wir die Operationale: Wann wählst du welche Schiene? Wie machst du das jeden Tag, ohne dich zu verkrampfen? Wie korrigierst du, wenn du dich vertust? Diese Lektion macht aus den theoretischen drei Schienen ein lebbares Tages-Werkzeug.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 4 – Recoping",
          lessonLabel: "Lektion 4.3 – Der Übungs-Katalog: Drei Intensitätsschienen",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Worum es heute geht",
          headline: "Wir vertiefen das Drei-Schienen-System, das deine Ritual-Map operationalisiert.",
          lead: "Die Schienen kennst du schon: reizarm, Standard, belastend – in jeder Übung. Sie liefen durch ganz Modul 2.",
        },
        {
          type: "content",
          appearTime: 13.816,
          kicker: "Die offenen Fragen",
          headline: "Wann wählst du welche Schiene – jeden Tag, ohne dich zu verkrampfen?",
          lead: "Und wie korrigierst du, wenn du dich vertust? Das sind die operativen Fragen, die wir heute klären.",
        },
        {
          type: "statement",
          appearTime: 24.498,
          text: "Aus drei theoretischen Schienen wird ein lebbares Tages-Werkzeug.",
          emphasis: "Tages-Werkzeug",
        },
      ],
    },
    {
      title: "Die drei Schienen im Detail",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Erinnern wir uns: Jede Übung in dieser Masterclass hat drei Schienen. Reizarm. Das ist die sanfte Schiene. Kleine Amplituden, geringer Belastungsgrad, oft mit Hilfsmitteln, weniger Wiederholungen. Du wählst diese Schiene an Tagen, an denen es dir schlechter geht oder du müde bist. Standard. Die mittlere Schiene. Volle Bewegungsamplitude, normale Wiederholungszahlen, mittlere Intensität. Diese Schiene ist dein Tages-Standard – das, was du meistens machst. Belastend. Die anspruchsvolle Schiene. Mehr Wiederholungen, längere Haltezeiten, höhere Intensität oder Zusatzlast. Diese Schiene wählst du an Tagen, an denen du dich gut fühlst und Energie hast. Wichtig: Diese Schienen sind keine starren Kategorien. Sie sind ein Spektrum. An manchen Tagen bist du zwischen reizarm und Standard – mach etwas Mittleres. An manchen Tagen zwischen Standard und belastend – mach etwas zwischen den beiden. Sei flexibel. Wichtig auch: Reizarm ist nicht weniger Therapie als belastend. Reizarm ist die richtige Therapie für einen schlechten Tag. Standard ist die richtige Therapie für einen normalen Tag. Belastend ist die richtige Therapie für einen guten Tag. Jede Schiene hat ihren Platz. Keine ist besser als die andere.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Schiene 1 · Reizarm",
          headline: "Reizarm – die sanfte Schiene.",
          lead: "Kleine Amplituden, geringer Belastungsgrad, oft mit Hilfsmitteln, weniger Wiederholungen. Für Tage, an denen es dir schlechter geht oder du müde bist.",
        },
        {
          type: "content",
          appearTime: 18.75,
          kicker: "Schiene 2 · Standard",
          headline: "Standard – die mittlere Schiene, dein Tages-Standard.",
          lead: "Volle Bewegungsamplitude, normale Wiederholungszahlen, mittlere Intensität. Das, was du meistens machst.",
        },
        {
          type: "content",
          appearTime: 29.93,
          kicker: "Schiene 3 · Belastend",
          headline: "Belastend – die anspruchsvolle Schiene.",
          lead: "Mehr Wiederholungen, längere Haltezeiten, höhere Intensität oder Zusatzlast. Für Tage, an denen du dich gut fühlst und Energie hast.",
        },
        {
          type: "content",
          appearTime: 42.132,
          kicker: "Ein Spektrum, keine Schubladen",
          headline: "Die Schienen sind keine starren Kategorien – sie sind ein Spektrum.",
          lead: "Mal bist du zwischen reizarm und Standard, mal zwischen Standard und belastend. Mach etwas dazwischen. Sei flexibel.",
        },
        {
          type: "reveal-list",
          appearTime: 56.493,
          kicker: "Jede Schiene ist gleichwertig",
          title: "Die richtige Therapie für den richtigen Tag",
          items: [{"label":"Reizarm – die richtige Therapie für einen schlechten Tag"},{"label":"Standard – die richtige Therapie für einen normalen Tag"},{"label":"Belastend – die richtige Therapie für einen guten Tag"}],
        },
        {
          type: "statement",
          appearTime: 56.493,
          text: "Reizarm an einem schlechten Tag ist volle Therapie. Nicht halbe.",
          emphasis: "volle Therapie",
        },
      ],
    },
    {
      title: "Das Tages-Check-in",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Jetzt zur entscheidenden Frage: Wie wählst du jeden Tag, welche Schiene heute passt? Mein Vorschlag: Mach jeden Morgen ein kurzes Tages-Check-in. Es dauert maximal 30 Sekunden. Fünf Fragen. Erstens: Wie ist mein Schmerz auf einer Skala von null bis zehn? Zweitens: Wie ist meine Energie? Drittens: Wie habe ich geschlafen? Viertens: Welche stressigen oder belastenden Termine habe ich heute? Fünftens: Wann habe ich zuletzt eine belastende Schiene gemacht? Aus diesen fünf Antworten ergibt sich intuitiv, welche Schiene passt. Hoher Schmerz, niedrige Energie, schlecht geschlafen – reizarm. Mittlerer Schmerz, mittlere Energie, okay geschlafen – Standard. Niedriger Schmerz, hohe Energie, gut geschlafen, letzter belastender Tag länger her – belastend. Das ist keine Wissenschaft. Es ist eine intuitive Selbsteinschätzung. Mit der Zeit machst du das automatisch, ohne explizit nachzudenken. Eine Faustregel hilft: Wenn du nicht weißt, was passt – geh eine Schiene tiefer als du denkst. Etwas weniger ist besser als etwas zu viel. Du kannst immer aufstocken. Aber wenn du dich überreizt hast, ist es schwerer rückgängig zu machen.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Die entscheidende Frage",
          headline: "Mach jeden Morgen ein kurzes Tages-Check-in – maximal 30 Sekunden.",
          lead: "Wie wählst du täglich, welche Schiene heute passt? Über fünf kurze Fragen am Morgen.",
        },
        {
          type: "reveal-list",
          appearTime: 12.26,
          kicker: "Das Tages-Check-in · fünf Fragen",
          title: "Die fünf Morgen-Fragen",
          items: [{"label":"1 · Wie ist mein Schmerz auf einer Skala von null bis zehn?"},{"label":"2 · Wie ist meine Energie?"},{"label":"3 · Wie habe ich geschlafen?"},{"label":"4 · Welche stressigen oder belastenden Termine habe ich heute?"},{"label":"5 · Wann habe ich zuletzt eine belastende Schiene gemacht?"}],
        },
        {
          type: "reveal-list",
          appearTime: 30.059,
          kicker: "Antworten → Schiene",
          title: "So ergibt sich die Schiene intuitiv",
          items: [{"label":"Hoher Schmerz, niedrige Energie, schlecht geschlafen → reizarm"},{"label":"Mittlerer Schmerz, mittlere Energie, okay geschlafen → Standard"},{"label":"Niedriger Schmerz, hohe Energie, gut geschlafen, letzter belastender Tag länger her → belastend"}],
        },
        {
          type: "content",
          appearTime: 51.491,
          kicker: "Keine Wissenschaft",
          headline: "Das ist eine intuitive Selbsteinschätzung – keine Wissenschaft.",
          lead: "Mit der Zeit machst du das automatisch, ohne explizit nachzudenken.",
        },
        {
          type: "content",
          appearTime: 60.941,
          dark: true,
          kicker: "Die Faustregel",
          headline: "Im Zweifel eine Schiene tiefer als du denkst.",
          lead: "Etwas weniger ist besser als etwas zu viel. Aufstocken kannst du immer – ein überreiztes System rückgängig zu machen ist schwerer.",
        },
        {
          type: "statement",
          appearTime: 60.941,
          text: "Im Zweifel eine Schiene tiefer. Immer.",
          emphasis: "eine Schiene tiefer",
        },
      ],
    },
    {
      title: "Schienen-Beispiele pro Kategorie",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Drei kurze Beispiele, damit die Schienen-Wahl konkreter wird. Beispiel Hip Hinge. Reizarm: fünf langsame Wiederholungen, kleine Amplitude, ohne Last. Standard: zehn Wiederholungen, volle Amplitude. Belastend: zwölf Wiederholungen mit Wasserflasche oder Kettlebell in den Händen. Beispiel Cat-Cow. Reizarm: drei sehr kleine Wellenbewegungen, nur Atmungs-Amplitude. Standard: zehn volle Wiederholungen. Belastend: fünfzehn mit zwei bis drei Sekunden Haltezeit in den Endpositionen. Beispiel Dead Bug. Reizarm: nur ein Bein, kleine Amplitude, sechs Wiederholungen pro Seite. Standard: volle Diagonale, acht bis zehn Wiederholungen pro Seite. Belastend: zwölf bis fünfzehn Wiederholungen mit Haltezeit, langsam. Beispiel 360-Grad-Atmung. Reizarm: fünf Atemzüge ruhig. Standard: zehn Atemzüge mit Aufmerksamkeit auf Seitenausdehnung. Belastend: fünfzehn bis zwanzig Atemzüge mit verlängerter Ausatmung, vier Sekunden ein, acht Sekunden aus. Du siehst das Prinzip. Reizarm gleich weniger Amplitude, weniger Last, weniger Wiederholungen. Standard gleich mittel. Belastend gleich mehr in irgendeiner Dimension. Im Übungskartendeck, das du am Ende der Masterclass bekommst, sind alle drei Schienen pro Übung sauber dokumentiert. Du musst dir das nicht merken – du nutzt die Karten als Referenz.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Schienen in der Praxis",
          headline: "Ein paar Beispiele, damit die Schienen-Wahl konkreter wird.",
        },
        {
          type: "reveal-list",
          appearTime: 3.587,
          kicker: "Beispiel · Hip Hinge",
          title: "Hip Hinge in drei Schienen",
          items: [{"label":"Reizarm – fünf langsame Wiederholungen, kleine Amplitude, ohne Last"},{"label":"Standard – zehn Wiederholungen, volle Amplitude"},{"label":"Belastend – zwölf Wiederholungen mit Wasserflasche oder Kettlebell"}],
        },
        {
          type: "reveal-list",
          appearTime: 17.16,
          kicker: "Beispiel · Cat-Cow",
          title: "Cat-Cow in drei Schienen",
          items: [{"label":"Reizarm – drei sehr kleine Wellenbewegungen, nur Atmungs-Amplitude"},{"label":"Standard – zehn volle Wiederholungen"},{"label":"Belastend – fünfzehn mit zwei bis drei Sekunden Haltezeit"}],
        },
        {
          type: "reveal-list",
          appearTime: 30.651,
          kicker: "Beispiel · Dead Bug",
          title: "Dead Bug in drei Schienen",
          items: [{"label":"Reizarm – nur ein Bein, kleine Amplitude, sechs Wiederholungen pro Seite"},{"label":"Standard – volle Diagonale, acht bis zehn Wiederholungen pro Seite"},{"label":"Belastend – zwölf bis fünfzehn Wiederholungen mit Haltezeit, langsam"}],
        },
        {
          type: "reveal-list",
          appearTime: 46.01,
          kicker: "Beispiel · 360-Grad-Atmung",
          title: "360-Grad-Atmung in drei Schienen",
          items: [{"label":"Reizarm – fünf Atemzüge ruhig"},{"label":"Standard – zehn Atemzüge mit Aufmerksamkeit auf Seitenausdehnung"},{"label":"Belastend – fünfzehn bis zwanzig Atemzüge, vier Sekunden ein, acht Sekunden aus"}],
        },
        {
          type: "content",
          appearTime: 62.403,
          kicker: "Das Prinzip dahinter",
          headline: "Reizarm = weniger, Standard = mittel, belastend = mehr in irgendeiner Dimension.",
          lead: "Weniger Amplitude, weniger Last, weniger Wiederholungen – oder eben mehr. Immer dieselbe Logik.",
        },
        {
          type: "content",
          appearTime: 74.037,
          kicker: "Das Übungskartendeck",
          headline: "Alle drei Schienen sind pro Übung sauber dokumentiert.",
          lead: "Im Übungskartendeck am Ende der Masterclass. Du musst dir nichts merken – du nutzt die Karten als Referenz.",
        },
      ],
    },
    {
      title: "Wenn man sich vertut",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Eine wichtige Frage: Was tust du, wenn du die falsche Schiene gewählt hast? Szenario eins: Du hast belastend gewählt und merkst nach der Übung, dass dein Schmerz hochgeht. Zunächst: keine Panik. Schmerzspitzen nach Belastung sind nicht das Ende der Welt. Sie sind eine Information: heute war es zu viel. Konkrete Schritte: Mach Box Breathing fünf bis zehn Minuten. Mach eine sanfte Cat-Cow oder Knee-to-Chest. Geh früh ins Bett. Am nächsten Tag: reizarm. Szenario zwei: Du hast reizarm gewählt und merkst, du hättest mehr gekonnt. Auch kein Problem. Du hast deinem System eine kleine sanfte Bewegungs-Botschaft gegeben – das ist nie verkehrt. Beim nächsten Mal probierst du Standard. Szenario drei: Du machst seit Wochen nur reizarm, weil du dich nicht traust, in Standard zu gehen. Das ist gefährlicher. Die Wachstumszone aus Lektion 3.1 liegt nicht in der reizarmen Schiene. Wenn du dauerhaft unter deiner aktuellen Belastbarkeit bleibst, verschiebt sich deine Wachstumszone nicht. Hier ist die Aufgabe: an einem guten Tag trotzdem Standard probieren, auch wenn es sich erstmal unsicher anfühlt. Szenario vier: Du machst seit Wochen nur belastend und kriegst regelmäßig Crashes. Das ist die andere Falle. Du überreizt chronisch dein System. Hier ist die Aufgabe: bewusst öfter Standard wählen, auch an guten Tagen. Antifragilität braucht Dosierung, nicht maximalen Reiz. Generell gilt: Vertun ist okay. Das ist keine Prüfung. Wer chronischen Schmerz hat, lernt seinen Körper im Laufe der Monate. Du wirst immer besser darin, zu wählen. Das ist ein Lernprozess – und Lernprozesse beinhalten Vertuser.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Wenn die Wahl danebenliegt",
          headline: "Was tust du, wenn du die falsche Schiene gewählt hast?",
        },
        {
          type: "content",
          appearTime: 4.76,
          kicker: "Szenario 1 · Zu viel",
          headline: "Belastend gewählt, der Schmerz geht hoch – keine Panik.",
          lead: "Schmerzspitzen sind eine Information: heute war es zu viel. Box Breathing fünf bis zehn Minuten, sanfte Cat-Cow oder Knee-to-Chest, früh ins Bett – am nächsten Tag reizarm.",
        },
        {
          type: "content",
          appearTime: 31.103,
          kicker: "Szenario 2 · Zu wenig im Moment",
          headline: "Reizarm gewählt, du hättest mehr gekonnt – auch kein Problem.",
          lead: "Du hast deinem System eine kleine sanfte Bewegungs-Botschaft gegeben. Das ist nie verkehrt. Beim nächsten Mal probierst du Standard.",
        },
        {
          type: "content",
          appearTime: 44.303,
          dark: true,
          kicker: "Szenario 3 · Chronisch reizarm",
          headline: "Seit Wochen nur reizarm, aus Angst vor Standard – das ist gefährlicher.",
          lead: "Die Wachstumszone aus 3.1 liegt nicht in der reizarmen Schiene. Aufgabe: an einem guten Tag trotzdem Standard probieren, auch wenn es sich erst unsicher anfühlt.",
        },
        {
          type: "content",
          appearTime: 69.799,
          dark: true,
          kicker: "Szenario 4 · Chronisch belastend",
          headline: "Seit Wochen nur belastend, regelmäßig Crashes – die andere Falle.",
          lead: "Du überreizt chronisch. Aufgabe: bewusst öfter Standard wählen, auch an guten Tagen. Antifragilität braucht Dosierung, nicht maximalen Reiz.",
        },
        {
          type: "content",
          appearTime: 86.354,
          kicker: "Generell gilt",
          headline: "Vertun ist okay. Das ist keine Prüfung.",
          lead: "Wer chronischen Schmerz hat, lernt seinen Körper über Monate. Du wirst immer besser im Wählen – und Lernprozesse beinhalten Vertuser.",
        },
        {
          type: "statement",
          appearTime: 86.354,
          text: "Vertun ist okay. Du lernst deinen Körper über Monate.",
          emphasis: "über Monate",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Im Workbook findest du Übung 4.3: Mein Tages-Check-in. Eine Vorlage für die fünf Fragen, die du täglich kurz beantworten kannst. Plus eine Notiz-Spalte für eine Woche, damit du im ersten Probe-Zeitraum dein Muster siehst. Nach diesen sieben Tagen wirst du erstaunlich klar erkennen, was deine guten und schlechten Tage prägt. Diese Selbst-Beobachtung ist ein eigener therapeutischer Wert – jenseits der reinen Schienen-Wahl. In der nächsten Lektion – 4.4 – vertiefen wir das Thema schmerzadaptiv. Wir schauen uns an, wie du auch in spezifischen Schmerz-Situationen flexibel und konstruktiv bleibst – nicht nur an Tagen, an denen du generell schlechter dran bist, sondern auch in akuten Momenten innerhalb eines Tages. Bis gleich.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Workbook · Übung 4.3 – Mein Tages-Check-in",
          title: "Die Vorlage hat zwei Teile",
          items: [{"label":"Die fünf Fragen – täglich kurz zu beantworten"},{"label":"Eine Notiz-Spalte über eine Woche – dein Muster im Probe-Zeitraum"}],
        },
        {
          type: "content",
          appearTime: 13.201,
          kicker: "Sieben Tage Beobachtung",
          headline: "Nach sieben Tagen erkennst du erstaunlich klar, was deine Tage prägt.",
          lead: "Eine Notiz-Spalte über eine Woche – und plötzlich wird sichtbar, was deine guten von deinen schlechten Tagen unterscheidet.",
        },
        {
          type: "statement",
          appearTime: 18.297,
          text: "Sieben Tage Selbstbeobachtung schaffen große Klarheit über deine Muster.",
          emphasis: "große Klarheit",
        },
        {
          type: "content",
          appearTime: 24.706,
          kicker: "Als Nächstes · Lektion 4.4",
          headline: "Schmerzadaptiv – auch in akuten Momenten innerhalb eines Tages.",
          lead: "Nicht nur an Tagen, an denen du generell schlechter dran bist – auch dann, wenn der Schmerz mitten am Tag kippt. Flexibel und konstruktiv bleiben.",
        },
        {
          type: "word",
          appearTime: 45.069,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 45.069,
          nextLabel: "Lektion 4.4",
          nextTitle: "Schmerzadaptiv wählen lernen",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_4_3: number = totalSlides(lesson_4_3);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_4_3: FlatSlide[] = flatSlides(lesson_4_3);

export default lesson_4_3;
