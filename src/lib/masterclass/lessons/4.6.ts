/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 4.6
 * Selbst-Monitoring & Fortschrittsmessung
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/4.6.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 4.6  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/4.6";

export const lesson_4_6: Lesson = {
  id: "4.6",
  title: "Selbst-Monitoring & Fortschrittsmessung",
  subtitle: "Modul 4 – Recoping · Was zählt, was nicht – das 4-Wochen-Review und der Abschluss des Werkzeugkastens",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zur letzten Lektion von Modul 4. Diese Lektion schließt das Recoping-Modul ab und macht den Übergang zum Outro. Worum geht es? Um Selbst-Monitoring. Wie merkst du eigentlich, ob du Fortschritte machst? Wie evaluierst du nach Wochen und Monaten, ob das System, das du dir gebaut hast, funktioniert? Diese Frage klingt einfach, ist aber täuschend komplex – weil chronischer Schmerz ein nicht-linearer Verlauf hat. Wer falsch misst, bekommt die falschen Antworten und macht falsche Anpassungen. In dieser Lektion lernst du, was wirklich zählt – und was du nicht messen solltest.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 4 – Recoping",
          lessonLabel: "Lektion 4.6 – Selbst-Monitoring & Fortschrittsmessung",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Die letzte Lektion von Modul 4",
          headline: "Diese Lektion schließt das Recoping-Modul ab.",
          lead: "Und sie macht den Übergang zum Outro.",
        },
        {
          type: "content",
          appearTime: 7.581,
          kicker: "Selbst-Monitoring",
          headline: "Wie merkst du eigentlich, ob du Fortschritte machst?",
          lead: "Wie evaluierst du nach Wochen und Monaten, ob das System, das du dir gebaut hast, funktioniert?",
        },
        {
          type: "content",
          appearTime: 18.321,
          dark: true,
          kicker: "Täuschend komplex",
          headline: "Chronischer Schmerz verläuft nicht-linear – wer falsch misst, bekommt falsche Antworten.",
          lead: "Du lernst, was wirklich zählt – und was du nicht messen solltest.",
        },
      ],
    },
    {
      title: "Was du nicht messen sollst",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Beginnen wir mit dem, was du nicht messen sollst. Diese Liste ist wichtiger als die Was-messen-Liste, weil die meisten Menschen genau die falschen Dinge tracken und sich damit selbst frustrieren. Erstens: Die isolierte Tages-Schmerzskala. Wer jeden Tag fragt: Wo war mein Schmerz heute auf null bis zehn?, kriegt ein extrem volatiles Signal. Schmerz schwankt tagesweise stark, das ist normal. Wer das täglich liest, sieht Volatilität statt Trend. Folge: ständige Aufregung über Tages-Schwankungen, vergessen der monatlichen Verbesserung. Eine Tages-Skala kann einmal sinnvoll sein – für die fünf Fragen im Morgens-Check-in zur Schienen-Wahl. Aber nicht als regelmäßiges Trend-Maß. Zweitens: Der Vergleich mit deinem Best-Tag. Diese Woche bin ich nicht so gut wie letzte Woche, als ich kaum Schmerzen hatte. Wenn du dich an deinem besten Tag misst, wirst du fast immer enttäuscht. Schmerz hat eine natürliche Variabilität. Manche Wochen sind besser, manche schlechter, auch wenn der Trend gut ist. Drittens: Der Vergleich mit deinem Vor-Schmerz-Zustand. Ich bin immer noch nicht da, wo ich vor zehn Jahren war. Das ist eine der schmerzhaftesten Vergleichs-Fallen. Vor zehn Jahren warst du jünger, anders, in einer anderen Lebensphase. Dein Ziel ist nicht zurück zu früher – dein Ziel ist gut leben mit dem, was jetzt ist. Frühere Zustände sind nicht das Ziel. Viertens: Schmerz als alleinigen Indikator. Das ist der größte Fehler. Wer nur Schmerz misst, sieht nur einen Bruchteil der wahren Entwicklung. Was zählt, ist viel umfassender – funktionelle Kapazität, Erholungsfähigkeit, mentale Stabilität, Schlaf, Stimmung. Schmerz ist eine Dimension von vielen. Wenn du nur Schmerz misst, kannst du die paradoxe Situation haben: deine Belastbarkeit ist massiv gewachsen, dein Schlaf ist viel besser, deine Stimmung deutlich stabiler – aber dein Schmerz schwankt heute zufällig in einem hohen Bereich. Du würdest sagen: Mir geht es schlecht. Falsch. Dir geht es viel besser. Du misst nur ein Detail.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Zuerst das Negative",
          headline: "Was du nicht messen sollst – wichtiger als die Was-messen-Liste.",
          lead: "Die meisten Menschen tracken genau die falschen Dinge und frustrieren sich damit selbst.",
        },
        {
          type: "content",
          appearTime: 9.729,
          kicker: "Falle 1 · Tages-Schmerzskala",
          headline: "Die isolierte Tages-Schmerzskala ist ein extrem volatiles Signal.",
          lead: "Schmerz schwankt tagesweise stark – das ist normal. Wer täglich liest, sieht Volatilität statt Trend und regt sich über Schwankungen auf, statt die monatliche Verbesserung zu sehen.",
        },
        {
          type: "content",
          appearTime: 32.763,
          kicker: "Die Ausnahme",
          headline: "Einmal sinnvoll: das Morgens-Check-in zur Schienen-Wahl.",
          lead: "Aber nicht als regelmäßiges Trend-Maß.",
        },
        {
          type: "content",
          appearTime: 40.38,
          kicker: "Falle 2 · der Best-Tag-Vergleich",
          headline: "Wer sich an seinem besten Tag misst, wird fast immer enttäuscht.",
          lead: "Schmerz hat eine natürliche Variabilität. Manche Wochen sind besser, manche schlechter – auch wenn der Trend gut ist.",
        },
        {
          type: "content",
          appearTime: 56.482,
          kicker: "Falle 3 · der Vor-Schmerz-Vergleich",
          headline: "„Ich bin immer noch nicht da, wo ich vor zehn Jahren war.“",
          lead: "Eine der schmerzhaftesten Fallen. Dein Ziel ist nicht zurück zu früher – dein Ziel ist gut leben mit dem, was jetzt ist.",
        },
        {
          type: "content",
          appearTime: 76.114,
          dark: true,
          kicker: "Falle 4 · Schmerz allein",
          headline: "Schmerz als alleiniger Indikator – der größte Fehler.",
          lead: "Was zählt, ist viel umfassender: funktionelle Kapazität, Erholungsfähigkeit, mentale Stabilität, Schlaf, Stimmung. Schmerz ist eine Dimension von vielen.",
        },
        {
          type: "content",
          appearTime: 96.223,
          kicker: "Die paradoxe Situation",
          headline: "Belastbarkeit, Schlaf, Stimmung viel besser – aber der Schmerz schwankt heute hoch.",
          lead: "Du würdest sagen: Mir geht es schlecht. Falsch. Dir geht es viel besser – du misst nur ein Detail.",
        },
        {
          type: "statement",
          appearTime: 96.223,
          text: "Schmerz ist eine Dimension von vielen.",
          emphasis: "von vielen",
        },
      ],
    },
    {
      title: "Was du stattdessen messen sollst",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Was misst du stattdessen? Vier Dimensionen, die zusammen ein realistisches Bild geben. Dimension eins: Funktionelle Kapazität. Was kannst du tun, das du vor sechs Monaten nicht oder nur schwer tun konntest? Diese Frage ist viel aussagekräftiger als jede Schmerz-Skala. Beispiele: Ich kann jetzt eine Stunde wandern. Ich kann eine 20-Kilo-Einkaufstüte tragen. Ich kann zwei Stunden Auto fahren ohne Pause. Ich kann ein Wochenende renovieren, ohne nachher liegen zu müssen. Funktion ist das, was du im Leben tun willst. Verbesserte Funktion ist der eigentliche Erfolg deiner Therapie. Dimension zwei: Erholungszeit. Wenn du belastet wurdest – wie schnell erholst du dich? Das ist ein hervorragendes Maß für deine Antifragilität. Vor sechs Monaten hat eine längere Autofahrt zwei Tage Recovery gebraucht. Heute eine halbe Stunde. Das ist Fortschritt. Dimension drei: Flare-Statistik. Wie oft hattest du Flares in den letzten drei, sechs, zwölf Monaten? Wie lange dauerten sie? Wie schwer waren sie? Wenn die Frequenz, Dauer oder Intensität deiner Flares sinkt – das ist ein klares Zeichen für funktionierende Selbstpflege. Das ist messbar, ohne dass du jeden Tag tracken musst. Dimension vier: Compliance und Selbstwirksamkeit. Hast du deine Mikro-Routinen die meisten Tage gemacht? Hast du dein Wochen-System einigermaßen gehalten? Fühlst du dich handlungsfähig gegenüber deinem Schmerz – oder ohnmächtig? Diese Dimension ist subjektiv, aber ein extrem starker Prädiktor für langfristigen Erfolg. Wer diese vier Dimensionen im Blick hat, hat ein realistisches Bild der eigenen Entwicklung. Schmerz allein ist Lärm. Funktion plus Erholung plus Flares plus Selbstwirksamkeit ist Signal.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Stattdessen",
          title: "Vier Dimensionen, die zusammen zählen",
          items: [{"label":"Funktionelle Kapazität"},{"label":"Erholungszeit"},{"label":"Flare-Statistik"},{"label":"Compliance und Selbstwirksamkeit"}],
        },
        {
          type: "content",
          appearTime: 4.458,
          kicker: "Dimension 1 · Funktionelle Kapazität",
          headline: "Was kannst du tun, das du vor sechs Monaten nicht oder nur schwer konntest?",
          lead: "Eine Stunde wandern, eine 20-Kilo-Tüte tragen, zwei Stunden Auto fahren ohne Pause, ein Wochenende renovieren ohne nachher liegen zu müssen. Aussagekräftiger als jede Schmerz-Skala.",
        },
        {
          type: "statement",
          appearTime: 28.329,
          text: "Verbesserte Funktion ist der eigentliche Erfolg deiner Therapie.",
          emphasis: "Funktion",
        },
        {
          type: "content",
          appearTime: 34.528,
          kicker: "Dimension 2 · Erholungszeit",
          headline: "Wie schnell erholst du dich nach Belastung?",
          lead: "Ein hervorragendes Maß für deine Antifragilität. Vor sechs Monaten zwei Tage Recovery nach einer langen Autofahrt – heute eine halbe Stunde. Das ist Fortschritt.",
        },
        {
          type: "content",
          appearTime: 49.667,
          kicker: "Dimension 3 · Flare-Statistik",
          headline: "Frequenz, Dauer und Intensität deiner Flares über die Monate.",
          lead: "Sinkt eine davon, ist das ein klares Zeichen für funktionierende Selbstpflege. Messbar, ohne dass du jeden Tag tracken musst.",
        },
        {
          type: "content",
          appearTime: 69.671,
          kicker: "Dimension 4 · Compliance & Selbstwirksamkeit",
          headline: "Hältst du dein System – und fühlst du dich handlungsfähig?",
          lead: "Mikro-Routinen die meisten Tage, Wochen-System einigermaßen gehalten, handlungsfähig statt ohnmächtig. Subjektiv, aber ein extrem starker Prädiktor für langfristigen Erfolg.",
        },
        {
          type: "statement",
          appearTime: 88.467,
          text: "Schmerz allein ist Lärm. Diese vier zusammen sind Signal.",
          emphasis: "Signal",
        },
      ],
    },
    {
      title: "Das 4-Wochen-Review",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Statt täglicher Tracking-Praxis empfiehlt Max Glawe ein monatliches Review. Einmal pro Monat – zum Beispiel jeden ersten Sonntag im Monat – nimmst du dir fünfzehn bis zwanzig Minuten Zeit und beantwortest fünf Fragen. Frage eins: Was konnte ich diesen Monat, das ich vor einem Monat noch nicht konnte oder schwerer fand? Sammle konkrete Beispiele aus den letzten vier Wochen. Auch kleine Dinge zählen. Ich konnte zwei Stunden im Garten arbeiten. Ich bin ein paar Mal Treppen genommen, ohne zu zögern. Ich habe das Auto neu gepackt, ohne danach Schmerzen zu haben. Frage zwei: Wie viele Flares hatte ich diesen Monat, und wie schwer waren sie? Nicht jeder Monat hat Flares. Wenn ja: notier die Frequenz und Dauer. Vergleich monatlich. Lass sich Trends erkennen. Frage drei: Wie konsequent habe ich meine Mikro-Routinen gemacht? Geschätzt prozentual. 50 Prozent? 70 Prozent? 90 Prozent? Sei ehrlich. Diese Compliance ist ein Schlüsselindikator. Frage vier: Wie fühle ich mich generell – Energie, Stimmung, Schlaf, Vertrauen? Eine subjektive Selbsteinschätzung. Im Vergleich zu vor einem Monat: besser, gleich, schlechter? Frage fünf: Was will ich im nächsten Monat anpassen? Eine Sache. Nicht fünf. Vielleicht: Eine neue Übung in meine Ritual-Map einbauen. Oder: Box Breathing zur Pflicht machen, nicht nur an stressigen Tagen. Oder: Mit dem höhenverstellbaren Tisch wirklich wechseln, nicht nur im Stehen sitzen lassen. Diese fünf Fragen plus eine Anpassung pro Monat sind das richtige Maß. Genug, um Fortschritt zu sehen. Wenig genug, um nicht zur Tracking-Zwangsneurose zu kippen.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Das richtige Maß",
          headline: "Kein tägliches Tracking – ein monatliches Review.",
          lead: "Einmal pro Monat, zum Beispiel jeden ersten Sonntag, nimmst du dir fünfzehn bis zwanzig Minuten und beantwortest fünf Fragen.",
        },
        {
          type: "reveal-list",
          appearTime: 15.72,
          kicker: "Das Monatsreview · fünf Fragen",
          title: "Die fünf Fragen",
          items: [{"label":"1 · Was konnte ich diesen Monat, das vor einem Monat schwerer war?"},{"label":"2 · Wie viele Flares hatte ich – und wie schwer waren sie?"},{"label":"3 · Wie konsequent habe ich meine Mikro-Routinen gemacht?"},{"label":"4 · Wie fühle ich mich – Energie, Stimmung, Schlaf, Vertrauen?"},{"label":"5 · Was will ich im nächsten Monat anpassen? Eine Sache."}],
        },
        {
          type: "content",
          appearTime: 78.472,
          kicker: "Frage 5 · Beispiele für die eine Anpassung",
          headline: "Eine Anpassung – konkret und klein.",
          lead: "Eine neue Übung in die Ritual-Map. Box Breathing zur Pflicht, nicht nur an stressigen Tagen. Mit dem höhenverstellbaren Tisch wirklich wechseln.",
        },
        {
          type: "statement",
          appearTime: 93.194,
          text: "Eine Anpassung pro Monat. Nicht fünf.",
          emphasis: "Eine Anpassung",
        },
      ],
    },
    {
      title: "Signale guter Entwicklung",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Was sind objektive Signale, dass es in die richtige Richtung geht? Vier Dinge, an denen du dich orientieren kannst. Signal eins: Du machst Dinge im Alltag, die früher schwer oder unmöglich waren. Funktionelle Erweiterung. Signal zwei: Flares werden seltener, kürzer oder weniger intensiv. Selbst wenn sie immer noch passieren – sie reichen weniger weit. Signal drei: Du erholst dich schneller von Belastungs-Spitzen. Wo früher ein Tag Recovery brauchte, brauchst du jetzt ein paar Stunden. Signal vier: Du fühlst dich mental anders mit deinem Schmerz. Weniger Angst, weniger Ohnmacht, mehr Vertrauen ins eigene System. Das ist das wichtigste Signal überhaupt – und das schwierigste in Worte zu fassen. Wenn diese vier Signale auftauchen, läuft dein System. Selbst wenn dein Schmerz an bestimmten Tagen schwankt – diese vier Trends sind das, was zählt.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Vier Signale guter Entwicklung",
          title: "Daran orientierst du dich",
          items: [{"label":"Funktion erweitert sich – du machst Dinge, die früher schwer waren"},{"label":"Flares werden seltener, kürzer oder weniger intensiv"},{"label":"Du erholst dich schneller von Belastungs-Spitzen"},{"label":"Du fühlst dich mental anders – weniger Angst, mehr Vertrauen"}],
        },
        {
          type: "content",
          appearTime: 42.783,
          kicker: "Was es bedeutet",
          headline: "Wenn diese vier Signale auftauchen, läuft dein System.",
          lead: "Selbst wenn dein Schmerz an bestimmten Tagen schwankt – diese vier Trends sind das, was zählt.",
        },
      ],
    },
    {
      title: "Warnsignale",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Umgekehrt: Wann ist es Zeit, etwas Größeres zu überdenken oder Hilfe zu holen? Warnsignal eins: Du machst seit sechs Monaten dein System konsequent, und keine der vier Verbesserungs-Signale zeigt sich. Funktion gleich, Flares gleich, Erholung gleich, mental gleich. Dann ist es Zeit für ärztliche oder physiotherapeutische Re-Evaluation. Möglicherweise gibt es eine Komponente, die du selbst nicht erfasst. Warnsignal zwei: Du machst dein System, aber es geht abwärts – mehr Flares, schlechtere Funktion, sinkende Stimmung. Das ist nicht normal. Hilfe holen. Warnsignal drei: Du machst dein System nicht – und du erkennst, dass du es alleine nicht hinkriegst. Auch das ist okay zu erkennen. Suche dir Unterstützung – einen Physiotherapeuten vor Ort, eine Schmerzklinik, einen Coach. Selbstwirksamkeit heißt auch: erkennen, wann Begleitung das richtige ist. Selbstmanagement ist nicht Selbstkampf. Es ist Selbstführung mit der gelegentlichen Bereitschaft, Unterstützung zu holen.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Die andere Richtung",
          headline: "Wann ist es Zeit, etwas Größeres zu überdenken oder Hilfe zu holen?",
        },
        {
          type: "content",
          appearTime: 6.246,
          kicker: "Warnsignal 1 · keine Bewegung",
          headline: "Sechs Monate konsequent – und keines der vier Signale zeigt sich.",
          lead: "Funktion gleich, Flares gleich, Erholung gleich, mental gleich. Zeit für ärztliche oder physiotherapeutische Re-Evaluation. Möglicherweise gibt es eine Komponente, die du selbst nicht erfasst.",
        },
        {
          type: "content",
          appearTime: 27.771,
          dark: true,
          kicker: "Warnsignal 2 · es geht abwärts",
          headline: "Du machst dein System – aber es geht abwärts.",
          lead: "Mehr Flares, schlechtere Funktion, sinkende Stimmung. Das ist nicht normal. Hilfe holen.",
        },
        {
          type: "content",
          appearTime: 37.732,
          kicker: "Warnsignal 3 · alleine nicht machbar",
          headline: "Du kriegst es alleine nicht hin – auch das ist okay zu erkennen.",
          lead: "Such dir Unterstützung: einen Physiotherapeuten vor Ort, eine Schmerzklinik, einen Coach. Selbstwirksamkeit heißt auch, zu erkennen, wann Begleitung das richtige ist.",
        },
        {
          type: "statement",
          appearTime: 56.227,
          text: "Selbstmanagement ist nicht Selbstkampf – es ist Selbstführung.",
          emphasis: "Selbstführung",
        },
      ],
    },
    {
      title: "Workbook & Modul-4-Abschluss",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook findest du Übung 4.6: Mein Monatsreview – mit den fünf Fragen und einer Vorlage für zwölf Monate. Du kannst dir das Workbook anlegen und einmal pro Monat hineinschreiben. Über ein Jahr siehst du erstaunlich deutlich, wohin deine Reise geht. Damit ist Modul 4 abgeschlossen. Du hast jetzt: Das Habit-Stacking-Konzept verstanden, in 4.1. Deine persönliche Ritual-Map erstellt, in 4.2. Das Drei-Schienen-System operationalisiert, in 4.3. Schmerzadaptiv intraday navigieren gelernt, in 4.4. Ein Flare-up-Protokoll gebaut, in 4.5. Und ein Selbst-Monitoring-System, in 4.6. Das ist der komplette Recoping-Werkzeugkasten. Du hast jetzt alles, was du brauchst, um in den nächsten Monaten und Jahren mit deinem Rücken selbstständig zu arbeiten. Im Outro – zwei kurze Lektionen, O.1 und O.2 – verdichten wir die wichtigsten Kernbotschaften und machen den emotionalen Abschluss. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 4.6 – Mein Monatsreview",
          headline: "Mein Monatsreview – fünf Fragen, eine Vorlage für zwölf Monate.",
          lead: "Einmal pro Monat hineinschreiben. Über ein Jahr siehst du erstaunlich deutlich, wohin deine Reise geht.",
        },
        {
          type: "reveal-list",
          appearTime: 17.438,
          kicker: "Modul 4 abgeschlossen",
          title: "Das nimmst du aus Modul 4 mit",
          items: [{"label":"Das Habit-Stacking-Konzept verstanden (4.1)"},{"label":"Deine persönliche Ritual-Map erstellt (4.2)"},{"label":"Das Drei-Schienen-System operationalisiert (4.3)"},{"label":"Schmerzadaptiv intraday navigieren gelernt (4.4)"},{"label":"Ein Flare-up-Protokoll gebaut (4.5)"},{"label":"Ein Selbst-Monitoring-System (4.6)"}],
        },
        {
          type: "statement",
          appearTime: 41.041,
          text: "Du hast jetzt einen kompletten Werkzeugkasten.",
          emphasis: "kompletten Werkzeugkasten",
        },
        {
          type: "content",
          appearTime: 50.515,
          kicker: "Als Nächstes · Das Outro",
          headline: "Zwei kurze Lektionen, O.1 und O.2, verdichten die wichtigsten Kernbotschaften.",
          lead: "Im Outro machen wir den emotionalen Abschluss der Masterclass.",
        },
        {
          type: "word",
          appearTime: 58.294,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 58.294,
          nextLabel: "Outro · Lektion O.1",
          nextTitle: "Drei Kernbotschaften",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_4_6: number = totalSlides(lesson_4_6);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_4_6: FlatSlide[] = flatSlides(lesson_4_6);

export default lesson_4_6;
