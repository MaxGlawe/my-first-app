/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 4.4
 * Schmerzadaptiv wählen lernen
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/4.4.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 4.4  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/4.4";

export const lesson_4_4: Lesson = {
  id: "4.4",
  title: "Schmerzadaptiv wählen lernen",
  subtitle: "Modul 4 – Recoping · Drei Adaptions-Ebenen, Vorboten und Re-Plan statt Abbruch",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zu Lektion 4.4. Wir bleiben beim Thema schmerzadaptiv, aber wir gehen eine Ebene tiefer. In 4.3 hast du gelernt, wie du morgens die Schiene für den ganzen Tag wählst. Jetzt geht es um die Frage: Was tust du, wenn der Schmerz im Laufe des Tages kippt? Wenn du morgens normal startest, mittags merkst, dass etwas hochgeht – wie reagierst du? Bricht dann dein ganzes Tages-System zusammen? Die Antwort: Nein, wenn du mit drei Adaptions-Ebenen arbeitest. Das ist das Thema heute.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 4 – Recoping",
          lessonLabel: "Lektion 4.4 – Schmerzadaptiv wählen lernen",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Eine Ebene tiefer",
          headline: "Wir bleiben beim Thema schmerzadaptiv – aber wir gehen eine Ebene tiefer.",
          lead: "In 4.3 hast du gelernt, wie du morgens die Schiene für den ganzen Tag wählst. Heute geht es um das, was danach kommt.",
        },
        {
          type: "content",
          appearTime: 12.005,
          dark: true,
          kicker: "Die Frage",
          headline: "Was tust du, wenn der Schmerz mitten am Tag kippt?",
          lead: "Du startest morgens normal, mittags merkst du, dass etwas hochgeht. Bricht dann dein ganzes Tages-System zusammen?",
        },
        {
          type: "statement",
          appearTime: 25.216,
          text: "Nein – wenn du mit drei Adaptions-Ebenen arbeitest.",
          emphasis: "drei Adaptions-Ebenen",
        },
      ],
    },
    {
      title: "Drei Ebenen der Adaption",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Schmerzadaptiv heißt nicht nur morgens entscheiden. Es heißt: bewusst arbeiten mit drei Zeit-Ebenen der Anpassung. Ebene eins – Der Tag. Das ist das, was wir in 4.3 besprochen haben. Morgens das Check-in, Schienen-Wahl für den Tag. Diese Ebene gibt dir die Grundtonart für 24 Stunden. Ebene zwei – Der Halbtag. Das ist die mittlere Ebene. Du startest morgens in Standard, aber zur Mittagspause merkst du: das wird heute nichts. Du wechselst um in reizarm für den Rest des Tages. Oder umgekehrt: Du startest reizarm, aber nach drei Stunden merkst du, dass du deutlich besser bist als gedacht – du gehst hoch in Standard. Diese Halbtags-Korrektur ist normal. Sie ist kein Versagen der Morgen-Einschätzung. Sie ist intelligentes Mitgehen mit dem System. Ebene drei – Die einzelne Übung. Die feinste Ebene. Du hast die Standard-Schiene für den Tag gewählt. Du machst gerade Hip Hinge in der Küche, neben der Kaffeemaschine. Bei der dritten Wiederholung merkst du, dass dein Rücken Spannung aufbaut, die sich nicht gut anfühlt. Was machst du? Antwort: Du beendest diese Übung in reizarm-Modus. Du machst fertig mit kleineren Amplituden, oder du brichst nach fünf Wiederholungen ab und gehst weiter. Die nächste Übung machst du wieder in der Standard-Schiene, vorausgesetzt das System fühlt sich okay an. Du adaptierst auf Übungs-Ebene. Nicht auf Tages-Ebene. Diese Granularität ist wichtig, weil dein Schmerzsystem kein Tagesplan ist. Es ist ein lebendes System, das von Minute zu Minute Information sendet.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Mehr als morgens entscheiden",
          headline: "Schmerzadaptiv heißt: bewusst arbeiten mit drei Zeit-Ebenen der Anpassung.",
          lead: "Nicht nur die eine Entscheidung am Morgen – sondern ein Mitgehen über drei Ebenen.",
        },
        {
          type: "content",
          appearTime: 7.79,
          kicker: "Ebene 1 · Der Tag",
          headline: "Der Tag – die Grundtonart für 24 Stunden.",
          lead: "Das Morgen-Check-in aus 4.3, die Schienen-Wahl für den Tag. Hier setzt du den Grundton.",
        },
        {
          type: "content",
          appearTime: 20.445,
          kicker: "Ebene 2 · Der Halbtag",
          headline: "Der Halbtag – die mittlere Korrektur.",
          lead: "Standard gestartet, mittags merkst du: wird nichts – runter in reizarm. Oder reizarm gestartet, nach drei Stunden deutlich besser – hoch in Standard.",
        },
        {
          type: "statement",
          appearTime: 39.253,
          text: "Die Halbtags-Korrektur ist kein Versagen – sie ist intelligentes Mitgehen.",
          emphasis: "intelligentes Mitgehen",
        },
        {
          type: "content",
          appearTime: 47.02,
          kicker: "Ebene 3 · Die einzelne Übung",
          headline: "Die einzelne Übung – die feinste Ebene.",
          lead: "Standard gewählt, du machst Hip Hinge an der Kaffeemaschine. Bei der dritten Wiederholung baut der Rücken Spannung auf, die sich nicht gut anfühlt. Was machst du?",
        },
        {
          type: "content",
          appearTime: 63.251,
          kicker: "Die Antwort",
          headline: "Du beendest diese eine Übung in reizarm – die nächste wieder in Standard.",
          lead: "Kleinere Amplituden, oder nach fünf Wiederholungen abbrechen und weitergehen. Die nächste Übung läuft wieder Standard, wenn sich das System okay anfühlt.",
        },
        {
          type: "content",
          appearTime: 79.226,
          kicker: "Warum so fein",
          headline: "Du adaptierst auf Übungs-Ebene, nicht auf Tages-Ebene.",
          lead: "Diese Granularität ist wichtig: Dein Schmerzsystem sendet von Minute zu Minute Information.",
        },
        {
          type: "statement",
          appearTime: 79.226,
          text: "Dein Schmerzsystem ist kein Tagesplan. Es ist ein lebendes System.",
          emphasis: "lebendes System",
        },
      ],
    },
    {
      title: "Schmerz-Wellen-Vorboten erkennen",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Damit du auf der Halbtags- oder Übungs-Ebene gut adaptieren kannst, musst du Signale erkennen, bevor sie zu vollen Schmerzwellen werden. Vier Vorboten, die typischerweise auftreten, bevor die eigentliche Schmerz-Eskalation kommt. Wer sie kennt, kann früh gegensteuern und größere Schmerzwellen vermeiden. Vorbote eins – Lokale Spannung. Eine bestimmte Region in deinem Rücken wird spannig. Noch nicht schmerzhaft, aber spürbar gespannt. Das ist oft das früheste Signal. Wer es zu diesem Zeitpunkt erkennt und gegensteuert, vermeidet meist die Schmerz-Eskalation. Vorbote zwei – Veränderte Atmung. Du atmest plötzlich flacher. Hochgerutscht. Atemzüge werden kürzer. Das ist eine vegetative Reaktion auf Stress oder beginnenden Schmerz. Wenn du es bei dir bemerkst – Box Breathing oder 360-Grad-Atmung sind sofortige Hilfen. Vorbote drei – Mental enger. Du wirst innerlich enger, gereizter, schwerer fokussierbar. Schmerz und Stress sind eng verknüpft – wenn deine Mentalstimmung enger wird, ist das oft ein Vorbote körperlicher Spannung. Pause machen. Atmen. Vorbote vier – Plötzliche Müdigkeit. Du wirst auf einmal sehr müde, obwohl objektiv nichts vorgefallen ist. Das ist häufig ein Signal, dass das Nervensystem sich gegen weitere Belastung wehrt. Vorsicht, vor allem wenn du gerade unter Termindruck stehst. Was machst du, wenn du einen Vorboten bemerkst? Drei Dinge in dieser Reihenfolge. Erstens: Stoppen. Was du gerade tust – beenden oder pausieren. Zweitens: Mikro-Reset. Box Breathing oder 360-Grad-Atmung für zwei bis drei Minuten. Drittens: Re-Plan. Was machst du jetzt anders? Statt Belastungs-Sequenz weitermachen – reizarm. Statt Schreibtisch durchziehen – zehn Minuten Pause mit Spaziergang. Statt geplante Übung in voller Schiene – Übung in tieferer Schiene. Stoppen, Atmen, Re-Plan. Das ist die Drei-Schritt-Antwort auf jeden Vorboten.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Signale vor der Welle",
          headline: "Erkenne die Signale, bevor sie zu vollen Schmerzwellen werden.",
          lead: "Vier Vorboten treten typischerweise vor der eigentlichen Eskalation auf. Wer sie kennt, kann früh gegensteuern und größere Wellen vermeiden.",
        },
        {
          type: "content",
          appearTime: 17.218,
          kicker: "Vorbote 1 · Lokale Spannung",
          headline: "Eine Region im Rücken wird spannig – noch nicht schmerzhaft.",
          lead: "Spürbar gespannt, oft das früheste Signal. Wer hier gegensteuert, vermeidet meist die Eskalation.",
        },
        {
          type: "content",
          appearTime: 32.868,
          kicker: "Vorbote 2 · Veränderte Atmung",
          headline: "Du atmest plötzlich flacher, hochgerutscht, kürzer.",
          lead: "Eine vegetative Reaktion auf Stress oder beginnenden Schmerz. Box Breathing oder 360-Grad-Atmung sind sofortige Hilfen.",
        },
        {
          type: "content",
          appearTime: 51.177,
          kicker: "Vorbote 3 · Mental enger",
          headline: "Du wirst innerlich enger, gereizter, schwerer fokussierbar.",
          lead: "Schmerz und Stress sind eng verknüpft. Eine engere Mentalstimmung ist oft ein Vorbote körperlicher Spannung. Pause machen. Atmen.",
        },
        {
          type: "content",
          appearTime: 66.433,
          kicker: "Vorbote 4 · Plötzliche Müdigkeit",
          headline: "Auf einmal sehr müde, obwohl objektiv nichts vorgefallen ist.",
          lead: "Häufig ein Signal, dass sich das Nervensystem gegen weitere Belastung wehrt. Vorsicht, vor allem unter Termindruck.",
        },
        {
          type: "reveal-list",
          appearTime: 81.642,
          kicker: "Wenn du einen Vorboten bemerkst",
          title: "Drei Dinge in dieser Reihenfolge",
          items: [{"label":"Stoppen – was du gerade tust, beenden oder pausieren"},{"label":"Mikro-Reset – Box Breathing oder 360-Grad-Atmung, zwei bis drei Minuten"},{"label":"Re-Plan – statt voller Schiene jetzt eine tiefere wählen"}],
        },
        {
          type: "statement",
          appearTime: 111.016,
          text: "Stoppen, Atmen, Re-Plan – die Drei-Schritt-Antwort auf jeden Vorboten.",
          emphasis: "Stoppen, Atmen, Re-Plan",
        },
      ],
    },
    {
      title: "Re-Plan statt Abbruch",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Das wichtigste Wort in diesem Abschnitt: Re-Plan. Nicht Abbruch. Wenn der Schmerz hochgeht, ist die häufigste Reaktion: alles abbrechen. Heute mache ich nichts mehr. Heute lasse ich es ruhen. Diese Reaktion ist verständlich, aber sie ist meistens falsch. Sie ist falsch, weil sie zwei Botschaften an dein Nervensystem sendet: Bewegung ist gefährlich, und ich habe keine Kontrolle. Beide Botschaften verstärken Chronifizierung. Was du stattdessen machst: Re-Plan. Was kannst du trotzdem tun, das hilfreich ist und dein System nicht weiter reizt? Mikro-Dosis statt Skip. Beispiele: Statt geplanter zehn-Minuten-Stabilisationssequenz zwei Minuten sanfte Knee-to-Chest und Cat-Cow im Bett. Statt Spaziergang dreißig Minuten fünf Minuten ruhig im Garten oder in der Wohnung gehen. Statt zehn Hip Hinges drei Pelvic Tilts im Liegen. Statt Krafttraining Box Breathing fünf Minuten. Du verkleinerst die Dosis – aber du machst etwas. Damit hältst du die Routine am Leben und du gibst deinem Nervensystem die Botschaft: Auch heute können wir uns bewegen, in einer Form, die wir tragen können. Das ist anti-chronifizierend. Skip ist es nicht. Diese Idee – Mikro-Dosis statt Skip – ist neurobiologisch entscheidend. Sie erhält den Faden. Sie hält die Routine als Identität aufrecht. Auch wenn der heutige Beitrag minimal ist, du bist immer noch jemand, der seine Routine durchzieht.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Re-Plan statt Abbruch. Mikro-Dosis statt Skip.",
          emphasis: "Re-Plan",
        },
        {
          type: "content",
          appearTime: 4.876,
          dark: true,
          kicker: "Die häufigste Reaktion",
          headline: "Alles abbrechen sendet zwei Botschaften: Bewegung ist gefährlich, ich habe keine Kontrolle.",
          lead: "Verständlich, aber meistens falsch. Beide Botschaften verstärken Chronifizierung.",
        },
        {
          type: "content",
          appearTime: 24.66,
          kicker: "Stattdessen",
          headline: "Re-Plan: Was kannst du trotzdem tun, ohne dein System weiter zu reizen?",
          lead: "Mikro-Dosis statt Skip. Du fragst nicht „alles oder nichts“, sondern „was geht heute?“.",
        },
        {
          type: "reveal-list",
          appearTime: 33.519,
          kicker: "Mikro-Dosis statt Skip · Beispiele",
          title: "Statt … → trotzdem etwas",
          items: [{"label":"Statt 10-Min-Stabilisation → 2 Minuten Knee-to-Chest und Cat-Cow im Bett"},{"label":"Statt 30-Min-Spaziergang → 5 Minuten ruhig im Garten oder in der Wohnung gehen"},{"label":"Statt zehn Hip Hinges → drei Pelvic Tilts im Liegen"},{"label":"Statt Krafttraining → Box Breathing, fünf Minuten"}],
        },
        {
          type: "content",
          appearTime: 51.525,
          kicker: "Warum das wirkt",
          headline: "Du verkleinerst die Dosis – aber du machst etwas.",
          lead: "Die Botschaft ans Nervensystem: Auch heute können wir uns bewegen, in einer Form, die wir tragen können. Das ist anti-chronifizierend. Skip ist es nicht.",
        },
        {
          type: "content",
          appearTime: 65.794,
          kicker: "Routine als Identität",
          headline: "Die Mikro-Dosis hält die Routine als Identität aufrecht.",
          lead: "Auch wenn der heutige Beitrag minimal ist – du bist immer noch jemand, der seine Routine durchzieht. Neurobiologisch erhält das den Faden.",
        },
      ],
    },
    {
      title: "Drei Praxis-Szenarien",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Drei konkrete Szenarien, damit du dir das vorstellen kannst. Szenario eins: Mittags merkst du, dass es heute deutlich schlechter wird. Morgens hattest du Standard gewählt. Bis zehn Uhr lief alles okay. Ab elf Uhr merkst du: lokale Spannung, etwas gereizt, Atmung enger. Antwort: Zwölf Uhr fünf Minuten Box Breathing in der Mittagspause statt Espresso. Restliche Nachmittags-Trigger-Übungen alle in reizarm machen. Geplante Stabilisationssequenz am Abend durch zehn Minuten sanfte Mobilisation ersetzen. Dein System bekommt heute trotzdem drei bis vier kleine Bewegungs-Impulse. Aber alle reizarm. Du hast nicht abgebrochen, du hast dosiert. Szenario zwei: Während der Übung steigt die Spannung an. Du machst gerade Hip Hinge an der Kaffeemaschine. Dritte Wiederholung – plötzlich spannt es auf einer Seite stärker. Antwort: Du beendest die Übung. Du machst nicht zehn weiter – du gehst auf fünf, in kleinerer Amplitude. Du atmest dreimal tief durch. Du machst die nächste Übung an deinem nächsten Anker normal weiter. Diese eine Übung war angepasst, nicht der ganze Tag. Szenario drei: Du hast die belastende Schiene gewählt und merkst nachträglich, dass es zu viel war. Du hattest Krafttraining mit dreißig-Minuten-Einheit gemacht. Eine Stunde später merkst du: das war zu viel, dein Rücken meldet sich. Antwort: Du machst sofort fünf Minuten Box Breathing. Du machst eine sanfte Cat-Cow oder Knee-to-Chest am Boden, zwei Minuten. Du gehst früher ins Bett, sorgst für guten Schlaf. Am nächsten Tag: definitiv reizarm. Und du ziehst die Schlüsse: vielleicht war heute kein guter Tag für belastend. Beim nächsten Mal früher merken. Du siehst das Muster. Nichts wird abgebrochen. Alles wird dosiert.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Aus der Praxis",
          headline: "Drei konkrete Szenarien, damit du dir das vorstellen kannst.",
        },
        {
          type: "reveal-list",
          appearTime: 3.03,
          kicker: "Szenario 1 · Der Tag kippt mittags",
          title: "Standard gestartet, ab elf Uhr Vorboten",
          items: [{"label":"12 Uhr → fünf Minuten Box Breathing statt Espresso"},{"label":"Nachmittag → alle Trigger-Übungen in reizarm"},{"label":"Abend → Stabilisationssequenz durch zehn Minuten sanfte Mobilisation ersetzen"}],
        },
        {
          type: "content",
          appearTime: 28.932,
          kicker: "Szenario 1 · das Ergebnis",
          headline: "Trotzdem drei bis vier kleine Bewegungs-Impulse – alle reizarm.",
          lead: "Du hast nicht abgebrochen, du hast dosiert.",
        },
        {
          type: "reveal-list",
          appearTime: 37.488,
          kicker: "Szenario 2 · Spannung während der Übung",
          title: "Hip Hinge, dritte Wiederholung – es spannt einseitig",
          items: [{"label":"Übung beenden – nicht zehn, sondern fünf in kleinerer Amplitude"},{"label":"Dreimal tief durchatmen"},{"label":"Nächste Übung am nächsten Anker normal weiter"}],
        },
        {
          type: "reveal-list",
          appearTime: 65.932,
          kicker: "Szenario 3 · Nachträglich zu viel",
          title: "Belastend gemacht, eine Stunde später meldet sich der Rücken",
          items: [{"label":"Sofort fünf Minuten Box Breathing"},{"label":"Sanfte Cat-Cow oder Knee-to-Chest am Boden, zwei Minuten"},{"label":"Früher ins Bett, guten Schlaf – am nächsten Tag definitiv reizarm"}],
        },
        {
          type: "statement",
          appearTime: 98.452,
          text: "Nichts wird abgebrochen. Alles wird dosiert.",
          emphasis: "Alles wird dosiert",
        },
      ],
    },
    {
      title: "Der Mikro-Dosis-Katalog",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Damit du auf Szenarien wie eben schnell reagieren kannst, ist es nützlich, einen Mikro-Dosis-Katalog vorbereitet zu haben. Das ist eine Liste der kleinstmöglichen Versionen deiner Lieblings-Übungen. Wenn ich nur 30 Sekunden habe, was mache ich? Diese Liste lebt im Hinterkopf, wenn die Situation kommt. Beispiele für Mikro-Dosen pro Übung: Hip Hinge – drei sanfte Wiederholungen. Pelvic Tilt – 30 Sekunden Beckenkippen im Sitzen. 360-Grad-Atmung – fünf ruhige Atemzüge mit Aufmerksamkeit auf Seitenausdehnung. Box Breathing – zwei Minuten, einfach vier Zählzeiten. Cat-Cow – fünf sehr kleine Wellenbewegungen. Knee-to-Chest – 30 Sekunden ein Bein, dann das andere. Wer diese Mikro-Dosen kennt, hat immer eine Antwort. Egal wie der Tag verläuft – du kannst etwas anbieten.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Vorbereitet sein",
          headline: "Der Mikro-Dosis-Katalog – die kleinstmöglichen Versionen deiner Übungen.",
          lead: "Die Frage dahinter: Wenn ich nur 30 Sekunden habe, was mache ich? Diese Liste lebt im Hinterkopf, wenn die Situation kommt.",
        },
        {
          type: "reveal-list",
          appearTime: 16.834,
          kicker: "Mikro-Dosen · pro Übung",
          title: "Wenn ich nur 30 Sekunden habe",
          items: [{"label":"Hip Hinge → drei sanfte Wiederholungen"},{"label":"Pelvic Tilt → 30 Sekunden Beckenkippen im Sitzen"},{"label":"360-Grad-Atmung → fünf ruhige Atemzüge mit Seitenausdehnung"},{"label":"Box Breathing → zwei Minuten, vier Zählzeiten"},{"label":"Cat-Cow → fünf sehr kleine Wellenbewegungen"},{"label":"Knee-to-Chest → 30 Sekunden ein Bein, dann das andere"}],
        },
        {
          type: "statement",
          appearTime: 41.888,
          text: "Wer Mikro-Dosen kennt, hat nie keine Antwort.",
          emphasis: "immer eine Antwort",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook findest du Übung 4.4: Mein Mikro-Dosis-Katalog. Du listest dort für deine drei stabilsten Routine-Übungen jeweils die kleinstmögliche Variante. Das ist deine Notfall-Liste für schwierige Tage und Momente. Plus: Notier dir die vier Vorboten nochmal in deinen eigenen Worten. Wie äußern sie sich bei dir konkret? Manche Leute haben sehr spezifische Vorboten – etwa eine bestimmte Schulter, die hochzieht, oder ein bestimmtes Augenflattern. Wer seine eigenen Vorboten kennt, reagiert schneller. In der nächsten Lektion – 4.5 – steigen wir ein Level hoch. Was tust du nicht, wenn der Schmerz nur etwas schwankt, sondern wenn ein richtiger Flare-up kommt – ein Schub, der mehrere Tage anhält? Dafür brauchst du ein anderes Protokoll, ein dediziertes Vier-Phasen-Modell. Genau das bauen wir in 4.5 auf. Bis gleich.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Workbook · Übung 4.4 – Mein Mikro-Dosis-Katalog",
          title: "Deine Notfall-Liste",
          items: [{"label":"Für deine drei stabilsten Routine-Übungen je die kleinstmögliche Variante"},{"label":"Deine Notfall-Liste für schwierige Tage und Momente"}],
        },
        {
          type: "content",
          appearTime: 14.257,
          kicker: "Plus · deine eigenen Vorboten",
          headline: "Notier die vier Vorboten in deinen eigenen Worten.",
          lead: "Wie äußern sie sich bei dir konkret? Eine Schulter, die hochzieht, ein Augenflattern? Wer seine eigenen Vorboten kennt, reagiert schneller.",
        },
        {
          type: "content",
          appearTime: 29.211,
          kicker: "Als Nächstes · Lektion 4.5",
          headline: "Was tust du, wenn ein richtiger Flare-up kommt?",
          lead: "Nicht nur Schwanken, sondern ein Schub über mehrere Tage. Dafür brauchst du ein anderes Protokoll – ein dediziertes Vier-Phasen-Modell. Das bauen wir in 4.5 auf.",
        },
        {
          type: "word",
          appearTime: 46.405,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 46.405,
          nextLabel: "Lektion 4.5",
          nextTitle: "Mein Flare-up-Protokoll: Vier Phasen",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_4_4: number = totalSlides(lesson_4_4);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_4_4: FlatSlide[] = flatSlides(lesson_4_4);

export default lesson_4_4;
