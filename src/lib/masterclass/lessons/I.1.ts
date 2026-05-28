/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion I.1
 * Willkommen & Versprechen
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/I.1.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs I.1  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/I.1";

export const lesson_I_1: Lesson = {
  id: "I.1",
  title: "Willkommen & Versprechen",
  subtitle: "Verstehen · Handeln · Bleiben · Wiederkommen",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen. Ich freue mich, dass du hier bist. Das ist kein leerer Satz. Wenn du diese Masterclass öffnest, dann hast du bereits eine Entscheidung getroffen, die viele Menschen mit chronischen Kreuzschmerzen nie treffen: Du hast entschieden, dass es Zeit ist, das Thema selbst in die Hand zu nehmen. Nicht weil Ärzte oder Therapeuten dir nicht helfen können. Sondern weil du verstanden hast, dass du der wichtigste Mensch in dieser Geschichte bist. Nicht jemand, der dir zwischendurch eine Spritze setzt oder dir sagt: Ruhe halten und abwarten. Ich spreche dich in dieser Masterclass durchgängig mit du an. Nicht aus Distanzlosigkeit, sondern weil wir hier eine Arbeitsbeziehung haben – auch wenn sie über Bildschirm und Kopfhörer läuft. Und in Arbeitsbeziehungen reden wir auf Augenhöhe.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Chronischer Kreuzschmerz",
          lessonLabel: "Lektion I.1 – Willkommen & Versprechen",
        },
        {
          type: "word",
          appearTime: 0,
          word: "Willkommen.",
        },
        {
          type: "content",
          appearTime: 0.627,
          kicker: "Schön, dass du hier bist",
          headline: "Ich freue mich, dass du hier bist.",
          lead: "Das ist kein leerer Satz.",
        },
        {
          type: "content",
          appearTime: 1.788,
          kicker: "Deine Entscheidung",
          headline: "Du hast bereits eine Entscheidung getroffen.",
          lead: "Eine, die viele Menschen mit chronischen Kreuzschmerzen nie treffen.",
        },
        {
          type: "statement",
          appearTime: 9.845,
          text: "Es ist Zeit, das Thema selbst in die Hand zu nehmen.",
        },
        {
          type: "content",
          appearTime: 13.502,
          headline: "Nicht, weil Ärzte oder Therapeuten dir nicht helfen können.",
        },
        {
          type: "statement",
          appearTime: 16.439,
          text: "Du bist der wichtigste Mensch in dieser Geschichte.",
          emphasis: "du",
        },
        {
          type: "quote",
          appearTime: 21.2,
          text: "Ruhe halten und abwarten.",
          caption: "Nicht das, was wir hier tun.",
        },
        {
          type: "content",
          appearTime: 26.482,
          kicker: "Auf Augenhöhe",
          headline: "Ich spreche dich durchgängig mit du an.",
          lead: "Nicht aus Distanzlosigkeit, sondern weil wir eine Arbeitsbeziehung haben.",
        },
        {
          type: "visual",
          appearTime: 34.505,
          caption: "Auf Augenhöhe. Bewegung ist der rote Faden.",
        },
      ],
    },
    {
      title: "Versprechen und Grenzen",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Bevor wir loslegen, möchte ich klarmachen, was diese Masterclass ist – und was sie nicht ist. Diese Masterclass ist: ein Werkzeugkasten. Sie ist eine sorgfältig aufgebaute Anleitung, mit der du verstehen wirst, warum dein Rücken tut, was er tut. Sie zeigt dir Übungen, mit denen du arbeiten kannst. Sie gibt dir Strategien, mit denen du Schmerzepisoden besser einordnen, besser dosieren und besser bewältigen kannst. Und sie hilft dir, all das in deinen Alltag zu integrieren – so, dass es nicht zur lästigen Pflicht wird, sondern Teil deines Tages. Diese Masterclass ist nicht: ein Heilversprechen. Ich verspreche dir keinen schmerzfreien Rücken in vier Wochen. Niemand auf dieser Welt kann dir das seriös versprechen – und alle, die es tun, sind unseriös. Chronischer Kreuzschmerz ist ein komplexes Phänomen. Was wir hier gemeinsam tun können, ist dir Schmerzkompetenz, Werkzeuge und Selbstwirksamkeit zurückzugeben. Was bedeutet das praktisch? Es bedeutet: Du wirst nach dieser Masterclass nicht zwangsläufig schmerzfrei sein. Aber du wirst deinen Schmerz besser verstehen, besser einordnen, und in den allermeisten Fällen besser handhaben können. Du wirst weniger Angst vor ihm haben. Und Angst ist – das wirst du in Modul 1 noch genauer kennenlernen – einer der größten Verstärker von chronischem Schmerz. Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik. Wenn du Symptome hast, die in den Bereich der sogenannten Red Flags fallen, dann gehörst du in ärztliche Abklärung. Was das genau bedeutet, klären wir in Lektion I.3 – also gleich. Klare Spielregeln. Das ist die Basis, auf der wir miteinander arbeiten.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Klare Spielregeln",
          headline: "Was diese Masterclass ist – und was nicht.",
        },
        {
          type: "term",
          appearTime: 4.853,
          kicker: "Diese Masterclass ist",
          term: "Ein Werkzeugkasten.",
        },
        {
          type: "content",
          appearTime: 7.001,
          headline: "Du wirst verstehen, warum dein Rücken tut, was er tut.",
          lead: "Eine sorgfältig aufgebaute Anleitung.",
        },
        {
          type: "reveal-list",
          appearTime: 13.038,
          title: "Übungen und Strategien",
          items: [{"label":"Übungen, mit denen du arbeiten kannst"},{"label":"Schmerzepisoden besser einordnen"},{"label":"Besser dosieren"},{"label":"Besser bewältigen"}],
        },
        {
          type: "list",
          appearTime: 21.978,
          title: "Was diese Masterclass IST",
          items: [{"icon":"toolbox","label":"Werkzeugkasten"},{"icon":"understand","label":"Verstehen"},{"icon":"exercise","label":"Übungen"},{"icon":"integrate","label":"Alltagsintegration"}],
        },
        {
          type: "anti-list",
          appearTime: 29.35,
          title: "Was diese Masterclass NICHT IST",
          items: [{"label":"Kein Heilversprechen"},{"label":"Kein Ersatz für Diagnostik"},{"label":"Keine schmerzfreie Garantie"}],
        },
        {
          type: "content",
          appearTime: 32.543,
          dark: true,
          headline: "Keinen schmerzfreien Rücken in vier Wochen.",
          lead: "Niemand kann dir das seriös versprechen – und alle, die es tun, sind unseriös.",
        },
        {
          type: "statement",
          appearTime: 40.694,
          text: "Chronischer Kreuzschmerz ist ein komplexes Phänomen.",
        },
        {
          type: "reveal-list",
          appearTime: 43.712,
          kicker: "Was wir gemeinsam tun können",
          title: "Wir geben dir zurück:",
          items: [{"label":"Schmerzkompetenz"},{"label":"Werkzeuge"},{"label":"Selbstwirksamkeit"}],
        },
        {
          type: "content",
          appearTime: 49.378,
          kicker: "Was bedeutet das praktisch?",
          headline: "Du wirst nicht zwangsläufig schmerzfrei sein.",
        },
        {
          type: "reveal-list",
          appearTime: 56.066,
          title: "Aber du wirst deinen Schmerz",
          items: [{"label":"besser verstehen"},{"label":"besser einordnen"},{"label":"besser handhaben"}],
        },
        {
          type: "content",
          appearTime: 63.519,
          headline: "Du wirst weniger Angst vor ihm haben.",
          lead: "Und Angst ist einer der größten Verstärker von chronischem Schmerz.",
        },
        {
          type: "statement",
          appearTime: 73.109,
          text: "Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik.",
        },
        {
          type: "content",
          appearTime: 77.127,
          kicker: "Red Flags",
          headline: "Manche Symptome gehören zuerst in ärztliche Abklärung.",
          lead: "Was das genau bedeutet, klären wir in Lektion I.3 – also gleich.",
        },
        {
          type: "statement",
          appearTime: 88.086,
          text: "Schmerzkompetenz statt Schmerzfreiheits-Versprechen.",
        },
      ],
    },
    {
      title: "Wer hier spricht und warum",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Ein kurzes Wort dazu, von wem diese Masterclass stammt und warum es sie überhaupt gibt. Entwickelt wurde sie von Max Glawe, Physiotherapeut und sektoraler Heilpraktiker für Physiotherapie. Das heißt vereinfacht: Er darf Patienten ohne ärztliche Verordnung behandeln, weil er die diagnostische Verantwortung selbst tragen kann. In seiner Praxis in Wildau sieht er seit Jahren Menschen mit chronischem Kreuzschmerz. Und dabei zeigt sich immer wieder dasselbe Muster. Diese Menschen kommen oft erst zu ihm, nachdem sie schon Jahre durch das System gegangen sind. MRT, Spritze, Krankschreibung. Vielleicht ein OP-Vorschlag, vielleicht nur ein achselzuckendes Da müssen Sie mit leben. Was die meisten nicht bekommen haben, ist eine vernünftige Erklärung. Sie wissen nicht, was wirklich in ihrem Rücken passiert. Sie haben nie verstanden, warum Bewegung helfen soll, wenn doch jede Bewegung weh tut. Und sie haben kein wirkliches Werkzeug, das sie selbst anwenden können. Das ist der Grund, warum diese Masterclass existiert. In der Praxis lässt sich pro Tag nur eine begrenzte Zahl Menschen begleiten, mehr nicht. Aber das, was diese Menschen brauchen, das Verstehen, die Werkzeuge, die Strategien, das lässt sich vermitteln. Strukturiert, klar, sauber. In dieser Masterclass bekommst du genau dieses Wissen, dasselbe, das Max in seiner Praxis vermittelt. In besserer Reihenfolge, mit mehr Zeit pro Thema, und so aufbereitet, dass du in deinem eigenen Tempo damit arbeiten kannst.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Wer hier spricht",
          headline: "Ein kurzes Wort dazu, warum diese Masterclass existiert.",
        },
        {
          type: "speaker",
          appearTime: 4.992,
          name: "Max Glawe",
          title: "Physiotherapeut & sektoraler Heilpraktiker für Physiotherapie · Praxis Wildau",
        },
        {
          type: "content",
          appearTime: 11.656,
          headline: "Er darf ohne ärztliche Verordnung behandeln.",
          lead: "Weil er die diagnostische Verantwortung selbst tragen kann.",
        },
        {
          type: "content",
          appearTime: 19.238,
          kicker: "Praxis Wildau",
          headline: "Seit Jahren zeigt sich dasselbe Muster.",
        },
        {
          type: "content",
          appearTime: 26.564,
          headline: "Sie kommen oft erst nach Jahren im System.",
        },
        {
          type: "reveal-list",
          appearTime: 31.742,
          dark: true,
          title: "Jahre im System",
          items: [{"label":"MRT"},{"label":"Spritze"},{"label":"Krankschreibung"},{"label":"OP-Vorschlag"}],
        },
        {
          type: "quote",
          appearTime: 36.409,
          dark: true,
          text: "Da müssen Sie mit leben.",
          caption: "Was die meisten gehört haben.",
        },
        {
          type: "statement",
          appearTime: 39.811,
          text: "Was fehlt, ist eine vernünftige Erklärung.",
        },
        {
          type: "reveal-list",
          appearTime: 43.247,
          title: "Was fehlt",
          items: [{"label":"Verstehen, was im Rücken passiert"},{"label":"Warum Bewegung helfen soll"},{"label":"Ein Werkzeug, das man selbst anwenden kann"}],
        },
        {
          type: "statement",
          appearTime: 53.592,
          text: "Genau deshalb existiert diese Masterclass.",
        },
        {
          type: "content",
          appearTime: 56.669,
          headline: "In der Praxis lässt sich pro Tag nur eine begrenzte Zahl Menschen begleiten.",
        },
        {
          type: "reveal-list",
          appearTime: 61.058,
          kicker: "Das lässt sich vermitteln",
          title: "Strukturiert. Klar. Sauber.",
          items: [{"label":"Das Verstehen"},{"label":"Die Werkzeuge"},{"label":"Die Strategien"}],
        },
        {
          type: "statement",
          appearTime: 68.151,
          text: "Dasselbe Wissen wie in der Praxis – in deinem Tempo.",
        },
      ],
    },
    {
      title: "Die Reise im Überblick",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Lass uns kurz darauf schauen, wie wir vorgehen. Diese Masterclass ist wie ein Album aufgebaut. Es gibt eine Intro, vier Module, und eine Outro. Du kannst der Reihe nach durchhören oder einzelne Lektionen gezielt ansteuern. Beides funktioniert. Ich empfehle dir aber, beim ersten Durchgang in der Reihenfolge zu bleiben – die Module bauen aufeinander auf. In der Intro, in der du dich gerade befindest, klären wir die Spielregeln. Lektion I.2 demystifiziert die vielen Namen, die dein Schmerz haben kann – Lumbalgie, Hexenschuss, Bandscheibe, ISG. Lektion I.3 ist ein Selbstcheck: Gehörst du eigentlich in diese Masterclass, oder gibt es Symptome, die zuerst ärztliche Abklärung brauchen? Modul 1 – Verstehen. Hier lernst du, was wirklich in deinem Rücken passiert. Anatomie und Funktion in einer Sprache, die du auch verstehst, wenn du Medizin nicht studiert hast. Was chronisch eigentlich heißt. Warum MRT-Befunde dich oft mehr verwirren als helfen. Und wie dein Schmerzsystem funktioniert – das ist der wichtigste Baustein der ganzen Masterclass. Modul 2 – Kurativ handeln. Hier bekommst du konkrete Werkzeuge: Mobilisationsübungen, modernes Rumpftraining, Atemmechanik, Belastungsdosierung, Schmerz-Coping. Alles direkt anwendbar, alles begründet aus dem, was du in Modul 1 verstanden hast. Modul 3 – Prävention. Wie hältst du das, was du dir erarbeitet hast? Belastbarkeit statt Schonung. Haltungs-Mythen entzaubert. Schlaf, Stress, Ernährung als stille Schmerzmodulatoren. Modul 4 – Recoping. Ehrlich gesagt mein Lieblingsteil. Hier zeige ich dir, wie du die Übungen in deinen Alltag einwebst – nicht als lästige Aufgabe, sondern als kleine Rituale. Plus ein Krisen-Protokoll für die Tage, an denen es trotzdem wieder schlechter wird. In der Outro sortieren wir gemeinsam, was du jetzt in der Hand hast – und wie du damit weitergehst. Insgesamt rund 27 Lektionen, im Schnitt zwanzig Minuten. Du kannst eine Lektion in einer Mittagspause durchhören. Du musst nicht alles auf einmal verstehen. Im Gegenteil – ich empfehle dir, Lektionen wirken zu lassen, bevor du zur nächsten gehst.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Die Reise im Überblick",
          headline: "Lass uns kurz darauf schauen, wie wir vorgehen.",
        },
        {
          type: "content",
          appearTime: 2.125,
          kicker: "Wie ein Album",
          headline: "Eine Intro, vier Module, eine Outro.",
        },
        {
          type: "content",
          appearTime: 7.709,
          headline: "Beim ersten Durchgang in der Reihenfolge bleiben.",
          lead: "Die Module bauen aufeinander auf.",
        },
        {
          type: "timeline",
          appearTime: 19.424,
          highlight: "Intro",
          stations: [{"label":"Intro"},{"label":"Modul 1"},{"label":"Modul 2"},{"label":"Modul 3"},{"label":"Modul 4"},{"label":"Outro"}],
          detail: [{"label":"Die Spielregeln klären"}],
        },
        {
          type: "reveal-list",
          appearTime: 23.569,
          kicker: "Noch in der Intro",
          title: "I.2 & I.3",
          items: [{"label":"I.2 – Die vielen Namen deines Schmerzes"},{"label":"I.3 – Selbstcheck: Bist du hier richtig?"}],
        },
        {
          type: "timeline",
          appearTime: 40.891,
          highlight: "Modul 1",
          stations: [{"label":"Intro"},{"label":"Modul 1"},{"label":"Modul 2"},{"label":"Modul 3"},{"label":"Modul 4"},{"label":"Outro"}],
          caption: "Verstehen",
          detail: [{"label":"Anatomie & Funktion – verständlich"},{"label":"Was „chronisch“ wirklich heißt"},{"label":"Warum MRT-Befunde oft verwirren"},{"label":"Wie dein Schmerzsystem funktioniert"}],
        },
        {
          type: "timeline",
          appearTime: 62.404,
          highlight: "Modul 2",
          stations: [{"label":"Intro"},{"label":"Modul 1"},{"label":"Modul 2"},{"label":"Modul 3"},{"label":"Modul 4"},{"label":"Outro"}],
          caption: "Kurativ handeln",
          detail: [{"label":"Mobilisationsübungen"},{"label":"Modernes Rumpftraining"},{"label":"Atemmechanik"},{"label":"Belastungsdosierung"},{"label":"Schmerz-Coping"}],
        },
        {
          type: "timeline",
          appearTime: 77.764,
          highlight: "Modul 3",
          stations: [{"label":"Intro"},{"label":"Modul 1"},{"label":"Modul 2"},{"label":"Modul 3"},{"label":"Modul 4"},{"label":"Outro"}],
          caption: "Prävention",
          detail: [{"label":"Belastbarkeit statt Schonung"},{"label":"Haltungs-Mythen entzaubert"},{"label":"Schlaf, Stress, Ernährung"}],
        },
        {
          type: "timeline",
          appearTime: 92.149,
          highlight: "Modul 4",
          stations: [{"label":"Intro"},{"label":"Modul 1"},{"label":"Modul 2"},{"label":"Modul 3"},{"label":"Modul 4"},{"label":"Outro"}],
          caption: "Recoping",
          detail: [{"label":"Übungen in den Alltag einweben"},{"label":"Kleine Rituale statt lästige Aufgaben"},{"label":"Krisen-Protokoll für schlechte Tage"}],
        },
        {
          type: "content",
          appearTime: 110.853,
          kicker: "Outro",
          headline: "Wir sortieren, was du in der Hand hast – und wie du weitergehst.",
        },
        {
          type: "stats",
          appearTime: 116.936,
          stats: [{"value":"27","label":"Lektionen"},{"value":"⌀ 20","label":"Minuten"},{"value":"Dein","label":"Tempo"}],
        },
        {
          type: "statement",
          appearTime: 123.972,
          text: "Lass jede Lektion wirken, bevor du zur nächsten gehst.",
        },
      ],
    },
    {
      title: "Was du jetzt tun solltest",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Bevor du in Lektion I.2 weitergehst, drei kleine Dinge. Erstens: Das Workbook. Diese Masterclass kommt mit einem Begleit-PDF, das du dir ausdrucken oder digital ausfüllen kannst. Im Workbook findest du Selbstchecks, Übungsanleitungen und – am Ende – deine persönliche Ritual-Map, dein individuelles Programm. Hol dir das Workbook jetzt, bevor du weitermachst. Zweitens: Stift oder Tastatur. Du wirst in mehreren Lektionen aufgefordert, kurz zu pausieren und etwas einzutragen. Das ist kein optionales Beiwerk. Lernen funktioniert besser, wenn du nicht nur passiv zuhörst, sondern aktiv etwas tust. Drittens: Ruhe. Such dir einen Ort, an dem du nicht ständig unterbrochen wirst. Zwanzig Minuten ungestört. Diese Masterclass ist kein Hintergrundprogramm beim Geschirrspülen – jedenfalls nicht beim ersten Durchgang. Dann sind wir bereit.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Bevor es weitergeht",
          headline: "Drei kleine Dinge.",
        },
        {
          type: "content",
          appearTime: 3.599,
          kicker: "Erstens",
          headline: "Das Workbook.",
          lead: "Ein Begleit-PDF zum Ausdrucken oder digitalen Ausfüllen.",
        },
        {
          type: "reveal-list",
          appearTime: 11.122,
          title: "Im Workbook",
          items: [{"label":"Selbstchecks"},{"label":"Übungsanleitungen"},{"label":"Deine persönliche Ritual-Map"}],
        },
        {
          type: "content",
          appearTime: 20.863,
          kicker: "Zweitens",
          headline: "Stift oder Tastatur.",
          lead: "Du wirst öfter kurz pausieren und etwas eintragen.",
        },
        {
          type: "statement",
          appearTime: 29.711,
          text: "Lernen funktioniert besser, wenn du aktiv etwas tust.",
        },
        {
          type: "content",
          appearTime: 34.9,
          kicker: "Drittens",
          headline: "Ruhe.",
          lead: "Zwanzig Minuten ungestört, ohne ständige Unterbrechung.",
        },
        {
          type: "checklist",
          appearTime: 42.458,
          items: [{"icon":"workbook","label":"Workbook bereit"},{"icon":"pen","label":"Stift in der Hand"},{"icon":"quiet","label":"Ruhiger Ort"}],
        },
        {
          type: "word",
          appearTime: 47.543,
          word: "Bereit?",
        },
      ],
    },
    {
      title: "Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "In der nächsten Lektion klären wir die wichtigste Frage zuerst: Hexenschuss, Lumbalgie, Bandscheibe, ISG – warum gibt es so viele Namen für ein Phänomen, das im Kern fast immer dasselbe meint? Und warum ist das eine gute Nachricht für dich? Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Als Nächstes · Lektion I.2",
          headline: "Warum so viele Namen für ein Phänomen?",
          lead: "Hexenschuss, Lumbalgie, Bandscheibe, ISG.",
        },
        {
          type: "outro",
          appearTime: 7.651,
          nextLabel: "Lektion I.2",
          nextTitle: "Du bist nicht allein: Die vielen Namen deines Schmerzes",
          hint: "Weiter →",
        },
        {
          type: "word",
          appearTime: 14.547,
          word: "Bis gleich.",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_I_1: number = totalSlides(lesson_I_1);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_I_1: FlatSlide[] = flatSlides(lesson_I_1);

export default lesson_I_1;
