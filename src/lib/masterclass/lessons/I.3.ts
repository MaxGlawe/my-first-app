/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion I.3
 * Der Red-Flag-Selbstcheck
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/I.3.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs I.3  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/I.3";

export const lesson_I_3: Lesson = {
  id: "I.3",
  title: "Der Red-Flag-Selbstcheck",
  subtitle: "Sicher unterwegs · Bist du hier richtig?",
  sections: [
    {
      title: "Warum dieser Check",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "In dieser Lektion machen wir einen Selbstcheck. Er ist kurz, aber wichtig – ich bitte dich, ihn ernst zu nehmen, auch wenn ich davon ausgehe, dass die allermeisten von euch ihn mit Entwarnung abschließen werden. Worum geht's? Wir haben in der vorigen Lektion gesehen, dass chronischer Kreuzschmerz in den meisten Fällen unspezifisch ist – also nicht an einer klaren strukturellen Ursache hängt, die akut bedrohlich ist. Das gilt für die Mehrheit. Aber es gibt eine kleine Gruppe von Symptomen, die Hinweise auf etwas Ernsteres sein können – und bei denen du nicht in einer Online-Masterclass sitzen solltest, sondern zeitnah einen Arzt aufsuchen musst. Diese Symptome nennt man in der medizinischen Sprache Red Flags – rote Flaggen. Sie sind kein Beweis für eine ernsthafte Erkrankung. Sie sind nur ein Hinweis, dass eine ärztliche Abklärung sinnvoll oder notwendig ist, bevor du anderswo weitermachst. Schnapp dir jetzt dein Workbook, blätter zur Übung I.3 – das ist eine einfache Checkliste, die wir gemeinsam durchgehen. Hake an, was auf dich zutrifft. Pausiere die Lektion ruhig zwischendurch, wenn du nachdenken musst.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Chronischer Kreuzschmerz",
          lessonLabel: "Lektion I.3 – Der Red-Flag-Selbstcheck",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Kurz, aber wichtig",
          headline: "Wir machen einen Selbstcheck.",
          lead: "Nimm ihn ernst – auch wenn die meisten ihn mit Entwarnung abschließen.",
        },
        {
          type: "content",
          appearTime: 11.378,
          kicker: "Worum geht es?",
          headline: "Für die Mehrheit ist Kreuzschmerz unspezifisch.",
          lead: "Nicht an einer klaren, akut bedrohlichen Ursache hängend.",
        },
        {
          type: "statement",
          appearTime: 23.278,
          text: "Bei manchen Symptomen gehörst du nicht hierher – sondern zum Arzt.",
        },
        {
          type: "term",
          appearTime: 34.412,
          kicker: "Medizinischer Begriff",
          term: "Red Flags",
        },
        {
          type: "content",
          appearTime: 39.892,
          headline: "Kein Beweis – nur ein Hinweis.",
          lead: "Sie zeigen an, dass eine ärztliche Abklärung sinnvoll oder notwendig ist.",
        },
        {
          type: "checklist",
          appearTime: 48.448,
          items: [{"icon":"workbook","label":"Workbook öffnen – Übung I.3"},{"icon":"pen","label":"Anhaken, was zutrifft"},{"icon":"quiet","label":"Ruhig pausieren zum Nachdenken"}],
        },
      ],
    },
    {
      title: "Sofort zum Arzt",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Die ersten Symptome, über die wir reden, sind die ernstesten. Wenn auch nur eines davon auf dich zutrifft, gehst du nicht weiter mit dieser Masterclass – du gehst zum Arzt oder, in den dringendsten Fällen, in die Notaufnahme. Heute, nicht morgen. Erstens: Plötzliche Schwäche in einem oder beiden Beinen, vor allem wenn sie schnell zunimmt. Du merkst, dass dein Bein nachgibt, du kannst nicht mehr richtig auftreten, du stolperst über deinen eigenen Fuß. Das ist ein klares Signal: Arzt, sofort. Zweitens: Taubheit im Sattelbereich – also Innenseite der Oberschenkel, im Gesäß zwischen den Beinen, im Genitalbereich. Diese Region nennt man medizinisch Reithosenbereich. Wenn du dort plötzlich kein Gefühl mehr hast oder ein verändertes Gefühl, ist das ein potentieller Notfall. Es kann ein Zeichen für eine sogenannte Cauda-Equina-Symptomatik sein – eine Nervenkompression am unteren Ende des Rückenmarkkanals. Das gehört in die Notaufnahme. Drittens: Plötzliche Störung von Blasen- oder Darmfunktion. Du merkst, dass du den Urin nicht mehr richtig halten kannst, oder du musst dringend, schaffst es aber nicht. Oder das Gegenteil: Du merkst gar nichts mehr, obwohl die Blase voll sein müsste. Auch das gehört zur Cauda-Equina-Symptomatik. Notaufnahme. Viertens: Starker, akuter Rückenschmerz nach einem klaren Trauma – Sturz von der Leiter, Autounfall, Schlag. Vor allem, wenn du älter als 65 bist oder eine Osteoporose-Diagnose hast. Ein Wirbelkörperbruch muss ausgeschlossen werden. Fünftens: Hohes Fieber zusammen mit Rückenschmerz. Sehr selten, aber wichtig: Es kann ein Hinweis auf eine Entzündung im Bereich der Wirbelsäule sein. Auch das gehört zeitnah in ärztliche Abklärung. Wenn auch nur eines dieser fünf Symptome auf dich zutrifft – pausiere die Masterclass jetzt und kümmer dich darum. Komm wieder, wenn das geklärt ist.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Sofort zum Arzt.",
        },
        {
          type: "statement",
          appearTime: 3.297,
          text: "Trifft auch nur eines zu: zum Arzt. Heute, nicht morgen.",
          emphasis: "Heute",
        },
        {
          type: "content",
          appearTime: 13.409,
          dark: true,
          kicker: "Erstens",
          headline: "Plötzliche, zunehmende Beinschwäche.",
          lead: "Das Bein gibt nach, du stolperst über den eigenen Fuß. Arzt, sofort.",
        },
        {
          type: "content",
          appearTime: 29.222,
          dark: true,
          kicker: "Zweitens",
          headline: "Taubheit im Reithosenbereich.",
          lead: "Innenseite Oberschenkel, Gesäß, Genitalbereich – plötzlich gefühllos oder verändert.",
        },
        {
          type: "content",
          appearTime: 46.579,
          dark: true,
          kicker: "Cauda-Equina-Symptomatik",
          headline: "Nervenkompression am unteren Ende des Rückenmarkkanals.",
          lead: "Das gehört in die Notaufnahme.",
        },
        {
          type: "content",
          appearTime: 56.633,
          dark: true,
          kicker: "Drittens",
          headline: "Plötzliche Störung von Blase oder Darm.",
          lead: "Urin nicht halten können – oder nichts mehr spüren. Auch das: Notaufnahme.",
        },
        {
          type: "content",
          appearTime: 73.85,
          dark: true,
          kicker: "Viertens",
          headline: "Starker Schmerz nach klarem Trauma.",
          lead: "Sturz, Unfall, Schlag – besonders über 65 oder bei Osteoporose. Wirbelbruch ausschließen.",
        },
        {
          type: "content",
          appearTime: 86.993,
          dark: true,
          kicker: "Fünftens",
          headline: "Hohes Fieber zusammen mit Rückenschmerz.",
          lead: "Selten, aber möglicher Hinweis auf eine Entzündung – zeitnah ärztlich abklären.",
        },
        {
          type: "reveal-list",
          appearTime: 98.057,
          kicker: "Liste 1 · Sofort zum Arzt",
          title: "Die fünf akuten Red Flags",
          items: [{"label":"Plötzliche Beinschwäche"},{"label":"Taubheit im Reithosenbereich"},{"label":"Blasen- oder Darmstörung"},{"label":"Schmerz nach Trauma"},{"label":"Hohes Fieber mit Rückenschmerz"}],
        },
        {
          type: "statement",
          appearTime: 105.278,
          text: "Komm wieder, wenn das geklärt ist.",
        },
      ],
    },
    {
      title: "Zeitnah abklären",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Die nächste Gruppe von Symptomen ist nicht akut bedrohlich, aber sie verdient ärztliche Abklärung innerhalb der nächsten Tage bis Wochen. Mit anderen Worten: Du musst nicht in die Notaufnahme, aber du solltest einen Termin beim Hausarzt machen, bevor du tief in diese Masterclass einsteigst. Erstens: Du hast eine Krebsvorgeschichte – egal welcher Art, auch wenn sie schon Jahre zurückliegt – und du hast einen neuen, anhaltenden Rückenschmerz, der sich nicht klar mit Bewegung oder Belastung erklären lässt. Lass das einmal ärztlich anschauen. Zweitens: Du hast ungeklärten Gewichtsverlust – also du nimmst ab, ohne es zu wollen, ohne Diät, ohne Lebensumstellung. Das kombiniert mit Rückenschmerz braucht eine Abklärung. Drittens: Du hast anhaltenden Nachtschmerz, der dich aufweckt und der sich nicht durch Positionsänderung verbessert. Normaler Rückenschmerz wechselt meistens seinen Charakter, je nachdem, ob du auf dem Rücken liegst, auf der Seite, aufstehst. Ein Schmerz, der unabhängig von Position bleibt und vor allem nachts zunimmt, gehört abgeklärt. Viertens: Lang anhaltende oder zunehmende neurologische Symptome – also Taubheit, Kribbeln, Schwäche in einem Bein – auch wenn sie nicht akut bedrohlich sind. Wenn das seit Wochen besteht oder schlimmer wird, ist ein Termin sinnvoll. Fünftens: Du bist unter zwanzig oder erstmalig über fünfzig mit massivem Rückenschmerz. Beide Altersgruppen haben statistisch etwas höhere Risiken für spezifische Ursachen, die ärztlich gesichert werden sollten, bevor du in Eigenregie weiterarbeitest. Sechstens: Du hast morgens länger als sechzig Minuten Steifigkeit im Rücken, die sich erst durch Bewegung wieder löst. Das kann ein Hinweis auf eine entzündlich-rheumatische Erkrankung sein – das gehört nicht in diese Masterclass, sondern zum Rheumatologen. Siebtens: Du hast eine chronische Erkrankung wie Diabetes, eine Immunsuppression, Langzeit-Kortison-Therapie oder eine Vorgeschichte mit intravenösem Drogenkonsum. Diese Konstellationen brauchen vor jeder neuen Trainings- oder Übungstherapie eine ärztliche Einordnung. Das mag wie eine lange Liste klingen. Sie ist es auch. Aber sie ist da, damit du sicher unterwegs bist. Hak dich ruhig durch im Workbook.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Zeitnah abklären.",
        },
        {
          type: "content",
          appearTime: 7.465,
          kicker: "Tage bis Wochen",
          headline: "Keine Notaufnahme – aber ein Termin beim Hausarzt.",
          lead: "Am besten, bevor du tief in diese Masterclass einsteigst.",
        },
        {
          type: "content",
          appearTime: 15.627,
          kicker: "Erstens",
          headline: "Krebsvorgeschichte + neuer, unerklärter Rückenschmerz.",
          lead: "Lass das einmal ärztlich anschauen.",
        },
        {
          type: "content",
          appearTime: 27.412,
          kicker: "Zweitens",
          headline: "Ungeklärter Gewichtsverlust.",
          lead: "Abnehmen ohne Diät, ohne Wollen – mit Rückenschmerz: abklären.",
        },
        {
          type: "content",
          appearTime: 37.21,
          kicker: "Drittens",
          headline: "Nachtschmerz, der sich nicht durch Positionswechsel bessert.",
          lead: "Bleibt unabhängig von der Lage und nimmt nachts zu – das gehört abgeklärt.",
        },
        {
          type: "content",
          appearTime: 55.461,
          kicker: "Viertens",
          headline: "Anhaltende neurologische Symptome.",
          lead: "Taubheit, Kribbeln, Schwäche im Bein seit Wochen oder zunehmend – Termin sinnvoll.",
        },
        {
          type: "content",
          appearTime: 68.302,
          kicker: "Fünftens",
          headline: "Unter 20 – oder erstmalig über 50 mit massivem Schmerz.",
          lead: "Beide Altersgruppen: statistisch höheres Risiko für spezifische Ursachen.",
        },
        {
          type: "content",
          appearTime: 82.559,
          kicker: "Sechstens",
          headline: "Über 60 Minuten Morgensteifigkeit.",
          lead: "Möglicher Hinweis auf eine entzündlich-rheumatische Erkrankung – zum Rheumatologen.",
        },
        {
          type: "content",
          appearTime: 95.516,
          kicker: "Siebtens",
          headline: "Bestimmte Vorerkrankungen.",
          lead: "Diabetes, Immunsuppression, Langzeit-Kortison, i.v.-Drogenanamnese – vorher ärztlich einordnen.",
        },
        {
          type: "reveal-list",
          appearTime: 110.423,
          kicker: "Liste 2 · Zeitnah abklären",
          title: "Die sieben Abklärungs-Flags",
          items: [{"label":"Krebsvorgeschichte"},{"label":"Gewichtsverlust"},{"label":"Nachtschmerz"},{"label":"Neurologische Symptome"},{"label":"Alter unter 20 / über 50"},{"label":"Morgensteifigkeit über 60 Min."},{"label":"Vorerkrankungen"}],
        },
        {
          type: "statement",
          appearTime: 113.093,
          text: "Sie ist da, damit du sicher unterwegs bist.",
        },
      ],
    },
    {
      title: "Wahrscheinlich okay",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Und jetzt die gute Nachricht – wahrscheinlich für die meisten von euch. Wenn keines der genannten Symptome auf dich zutrifft, dann gehörst du höchstwahrscheinlich zu den 80 bis 85 Prozent von Rückenschmerz-Patienten, bei denen wir von unspezifischem chronischem Kreuzschmerz sprechen. Für dich ist diese Masterclass gemacht. Hier kannst du sicher und sinnvoll mitarbeiten. Typische Eigenschaften deines Schmerzes, wenn er in diese Gruppe fällt: Er verändert sich mit Bewegung oder Position. Mal besser, mal schlechter, je nachdem was du tust. Er hat oft Auslöser, die du benennen kannst – langes Sitzen, Heben, eine ungewohnte Belastung, Stress. Er hat Phasen: bessere Tage, schlechtere Tage. Er strahlt vielleicht etwas ins Gesäß oder den Oberschenkel aus, aber nicht klar bis unter das Knie. Du fühlst dich ansonsten gesund – kein Fieber, kein Gewichtsverlust, keine andere neue Symptomatik. Wenn das auf dich passt: willkommen in der richtigen Masterclass.",
      slides: [
        {
          type: "word",
          appearTime: 0,
          word: "Wahrscheinlich okay.",
        },
        {
          type: "content",
          appearTime: 3.727,
          kicker: "Wenn nichts zutrifft",
          headline: "Dann gehörst du zu den 80–85 % unspezifischer Fälle.",
        },
        {
          type: "statement",
          appearTime: 16.788,
          text: "Für dich ist diese Masterclass gemacht.",
        },
        {
          type: "content",
          appearTime: 21.479,
          kicker: "Typische Merkmale",
          headline: "Woran du unspezifischen Kreuzschmerz erkennst.",
        },
        {
          type: "reveal-list",
          appearTime: 25.078,
          title: "Sechs typische Merkmale",
          items: [{"label":"Verändert sich mit Bewegung oder Position"},{"label":"Mal besser, mal schlechter"},{"label":"Hat benennbare Auslöser"},{"label":"Hat Phasen: bessere und schlechtere Tage"},{"label":"Strahlt höchstens bis Gesäß/Oberschenkel, nicht unter das Knie"},{"label":"Ansonsten fühlst du dich gesund"}],
        },
        {
          type: "statement",
          appearTime: 52.013,
          text: "Willkommen in der richtigen Masterclass.",
        },
      ],
    },
    {
      title: "Klare Handlungsanleitung",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Bevor wir in Modul 1 starten, fasse ich kurz zusammen, was als nächstes passieren sollte. Wenn du einen oder mehrere Red Flags aus der ersten Liste angehakt hast – die akuten Symptome – pausiere die Masterclass und kümmer dich heute oder morgen darum. Notaufnahme oder hausärztlicher Notdienst. Komm wieder, wenn das geklärt ist. Wenn du etwas aus der zweiten Liste angehakt hast – die zeitnah abzuklärenden Symptome – mach einen Termin beim Hausarzt oder direkt beim Facharzt. Du musst die Masterclass nicht zwingend pausieren, aber kläre die Symptomatik parallel ab. Sprich ruhig mit deinem Arzt darüber, dass du diese Masterclass machst – die meisten begrüßen das ausdrücklich. Wenn du nichts angehakt hast – fantastisch. Dann sehen wir uns in Modul 1. Ein letzter wichtiger Hinweis: Diese Checkliste ersetzt keine ärztliche Diagnostik. Sie ist ein erstes Sieb. Wenn du dir trotz Entwarnung unsicher bist oder dein Bauchgefühl sagt etwas stimmt nicht, dann hör auf dein Bauchgefühl. Geh zum Arzt. Im Zweifel immer.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Klare Handlungsanleitung",
          headline: "Was als Nächstes passieren sollte.",
        },
        {
          type: "content",
          appearTime: 4.946,
          dark: true,
          kicker: "Liste 1 angehakt",
          headline: "Pausieren und heute oder morgen kümmern.",
          lead: "Notaufnahme oder hausärztlicher Notdienst. Komm wieder, wenn das geklärt ist.",
        },
        {
          type: "content",
          appearTime: 19.842,
          kicker: "Liste 2 angehakt",
          headline: "Termin beim Haus- oder Facharzt machen.",
          lead: "Du darfst weitermachen – aber kläre die Symptomatik parallel ab.",
        },
        {
          type: "content",
          appearTime: 32.995,
          headline: "Sprich mit deinem Arzt über diese Masterclass.",
          lead: "Die meisten begrüßen das ausdrücklich.",
        },
        {
          type: "statement",
          appearTime: 38.626,
          text: "Nichts angehakt? Dann sehen wir uns in Modul 1.",
        },
        {
          type: "content",
          appearTime: 42.643,
          kicker: "Ein letzter Hinweis",
          headline: "Diese Checkliste ersetzt keine ärztliche Diagnostik.",
          lead: "Sie ist ein erstes Sieb.",
        },
        {
          type: "content",
          appearTime: 49.342,
          headline: "Wenn dein Bauchgefühl sagt: etwas stimmt nicht – hör darauf.",
          lead: "Geh zum Arzt.",
        },
        {
          type: "statement",
          appearTime: 55.554,
          text: "Im Zweifel: immer zum Arzt.",
          emphasis: "immer",
        },
      ],
    },
    {
      title: "Übergang zu Modul 1",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Mit der nächsten Lektion verlassen wir das Intro und steigen in Modul 1 ein. In Modul 1 geht es ums Verstehen – um die Frage, was eigentlich in deinem Rücken passiert. Wir gehen zuerst durch die Anatomie, dann durch die Mechanismen, die Schmerz chronisch werden lassen, und am Ende des Moduls wirst du dein Schmerzsystem so verstehen, dass alles, was danach kommt – Übungen, Strategien, Rituale – Sinn ergibt. Wir sehen uns dort.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Als Nächstes · Modul 1",
          headline: "Wir verlassen das Intro und steigen in Modul 1 ein.",
          lead: "Es geht ums Verstehen: Was passiert eigentlich in deinem Rücken?",
        },
        {
          type: "timeline",
          appearTime: 9.903,
          highlight: "Modul 1",
          stations: [{"label":"Intro"},{"label":"Modul 1"},{"label":"Modul 2"},{"label":"Modul 3"},{"label":"Modul 4"},{"label":"Outro"}],
          caption: "Verstehen",
          detail: [{"label":"Anatomie der LWS"},{"label":"Wie Schmerz chronisch wird"},{"label":"Dein Schmerzsystem verstehen"}],
        },
        {
          type: "outro",
          appearTime: 23.092,
          nextLabel: "Modul 1 – Verstehen",
          nextTitle: "Was ist da los in deinem Rücken?",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_I_3: number = totalSlides(lesson_I_3);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_I_3: FlatSlide[] = flatSlides(lesson_I_3);

export default lesson_I_3;
