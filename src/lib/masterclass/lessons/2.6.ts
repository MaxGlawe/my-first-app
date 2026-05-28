/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 2.6
 * Belastungsdosierung & Pacing-Prinzipien
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/2.6.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 2.6  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/2.6";

export const lesson_2_6: Lesson = {
  id: "2.6",
  title: "Belastungsdosierung & Pacing-Prinzipien",
  subtitle: "Modul 2 – Kurativ handeln · Raus aus dem Push-Crash-Zyklus",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zur Lektion 2.6. Diese Lektion handelt nicht von Übungen im klassischen Sinn. Sie handelt von einem unsichtbaren, aber extrem wichtigen Werkzeug der chronischen Schmerztherapie: Pacing. Pacing ist ein Sammelbegriff für Strategien, mit denen du deine Aktivität über den Tag und die Woche verteilst, sodass du nicht in den klassischen Push-Crash-Zyklus fällst, in dem so viele chronische Schmerzpatienten gefangen sind. Du wirst gleich verstehen, was das ist – und du wirst dich vermutlich wiedererkennen. Pacing zu beherrschen ist neben Bewegung und Verstehen vielleicht das wichtigste Werkzeug überhaupt.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 2 – Kurativ handeln",
          lessonLabel: "Lektion 2.6 – Belastungsdosierung & Pacing-Prinzipien",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Keine Übung – ein Werkzeug",
          headline: "Ein unsichtbares, aber extrem wichtiges Werkzeug: Pacing.",
          lead: "Diese Lektion handelt nicht von Übungen im klassischen Sinn.",
        },
        {
          type: "content",
          appearTime: 13.978,
          kicker: "Was Pacing meint",
          headline: "Deine Aktivität über Tag und Woche so verteilen, dass du nicht abstürzt.",
          lead: "Ein Sammelbegriff für Strategien gegen den Push-Crash-Zyklus, in dem so viele chronische Schmerzpatienten gefangen sind.",
        },
        {
          type: "statement",
          appearTime: 26.226,
          text: "Neben Bewegung und Verstehen vielleicht das wichtigste Werkzeug überhaupt.",
          emphasis: "das wichtigste Werkzeug",
        },
      ],
    },
    {
      title: "Der Push-Crash-Zyklus",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Beginnen wir mit einer Beobachtung, die Max Glawe in der Praxis ständig macht und die du selbst wahrscheinlich auch kennst: An guten Tagen denken viele Menschen mit chronischem Rückenschmerz: Endlich geht es wieder. Das hole ich jetzt nach. Sie putzen die Wohnung, gehen einkaufen, machen den Garten, sortieren die Schubladen. Sie werden plötzlich produktiv, weil es nach Wochen oder Monaten endlich mal wieder geht. Das ist Push. Am Abend desselben Tages oder am nächsten Tag merken sie es. Der Rücken wird wieder steif, der Schmerz kommt zurück, oft schlimmer als vor dem guten Tag. Sie müssen sich hinlegen, sie kommen nicht mehr in die Gänge, Termine müssen abgesagt werden. Das ist Crash. Nach ein paar Tagen Crash kehrt langsam die Funktion zurück. Es geht wieder. Sie merken, dass sie das Pensum vom Push-Tag nicht geschafft haben – der Garten ist halb fertig, die Wohnung halb geputzt. Sie wollen das nachholen. Sie pushen wieder. Und der Zyklus wiederholt sich. Das ist der Push-Crash-Zyklus. Englischsprachige Forschende nennen das auch Boom-Bust-Cycle. Er ist eines der Hauptprobleme bei chronischem Schmerz und einer der wichtigsten Aufrechterhalter der Chronifizierung. Warum ist er so problematisch? Erstens: Er verstärkt die Schmerz-Spitzen. Jeder Crash ist eine neue Lehrerfahrung für dein Nervensystem: Bewegung führt zu Schmerz. Die Sensitivitätsschraube bleibt oben. Zweitens: Er führt zu Unverlässlichkeit. Du kannst nichts mehr planen, weil du nicht weißt, ob du in der nächsten Woche ein Push-Tag, ein Crash-Tag oder einen neutralen Tag hast. Das frisst dich auf – mental und sozial. Drittens: Er produziert insgesamt weniger statt mehr. Wenn man die durchschnittliche tägliche Aktivität über einen Monat berechnet, schaffst du im Push-Crash-Modell weniger als wenn du gleichmäßig dosiert hättest. Die Crashes ziehen dich runter. Pacing löst dieses Problem. Es ist die Strategie, die dich aus dem Zyklus rausholt.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Eine Beobachtung",
          headline: "Eine Beobachtung, die du wahrscheinlich an dir selbst kennst.",
        },
        {
          type: "content",
          appearTime: 6.374,
          kicker: "Phase 1 · Push",
          headline: "Endlich geht es wieder – das hole ich jetzt nach.",
          lead: "An guten Tagen plötzlich produktiv: Wohnung putzen, einkaufen, Garten. Das ist Push.",
        },
        {
          type: "content",
          appearTime: 23.348,
          dark: true,
          kicker: "Phase 2 · Crash",
          headline: "Der Schmerz kommt zurück – oft schlimmer als vor dem guten Tag.",
          lead: "Rücken steif, hinlegen müssen, Termine absagen. Das ist Crash.",
        },
        {
          type: "content",
          appearTime: 36.827,
          kicker: "Phase 3 · Und wieder von vorn",
          headline: "Das Pensum wurde nicht geschafft – sie pushen wieder.",
          lead: "Der Garten halb fertig, die Wohnung halb geputzt. Sie wollen nachholen, pushen wieder – der Zyklus wiederholt sich.",
        },
        {
          type: "statement",
          appearTime: 50.968,
          text: "Der Push-Crash-Zyklus – einer der wichtigsten Aufrechterhalter der Chronifizierung.",
          emphasis: "Push-Crash-Zyklus",
        },
        {
          type: "content",
          appearTime: 64.981,
          kicker: "Warum problematisch · Erstens",
          headline: "Jeder Crash ist eine neue Lehrerfahrung: Bewegung führt zu Schmerz.",
          lead: "Er verstärkt die Schmerz-Spitzen – die Sensitivitätsschraube bleibt oben.",
        },
        {
          type: "content",
          appearTime: 78.275,
          kicker: "Warum problematisch · Zweitens",
          headline: "Du kannst nichts mehr planen – Push-Tag, Crash-Tag oder neutral?",
          lead: "Die Unverlässlichkeit frisst dich auf – mental und sozial.",
        },
        {
          type: "content",
          appearTime: 92.625,
          kicker: "Warum problematisch · Drittens",
          headline: "Über einen Monat produziert Push-Crash insgesamt weniger statt mehr.",
          lead: "Im Schnitt schaffst du weniger als bei gleichmäßiger Dosierung – die Crashes ziehen dich runter.",
        },
        {
          type: "statement",
          appearTime: 108.508,
          text: "Push-Crash produziert insgesamt weniger als Pacing. Das ist mathematisch.",
          emphasis: "Pacing",
        },
      ],
    },
    {
      title: "Was Pacing wirklich ist",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Pacing wird oft missverstanden. Es heißt nicht langsamer machen. Es heißt nicht weniger machen. Es heißt nicht nichts machen. Pacing heißt: deine Aktivität intelligent dosieren, sodass du eine gleichmäßige Belastungskurve über den Tag und die Woche hinkriegst. Statt Spitzen und Tälern – eine ruhige Welle. Über die Zeit hinweg leistet dieser ruhige Wellen-Modus mehr als der Push-Crash-Modus. Das funktioniert auf zwei Ebenen: Erstens: Innerhalb einer Aktivität. Wenn du eine Stunde Garten machst, machst du nicht eine Stunde durch, brichst zusammen und liegst drei Tage. Du machst zehn Minuten, machst fünf Minuten Pause – bewusst, nicht passiv – machst wieder zehn Minuten. Du verteilst die Belastung. Zweitens: Über den Tag und die Woche. Du planst nicht einen Marathon-Tag, an dem du alles erledigst. Du planst kleine, machbare Einheiten über mehrere Tage. Gartenarbeit eine halbe Stunde am Dienstag, eine halbe Stunde am Donnerstag, eine halbe Stunde am Sonntag. Statt zwei Stunden an einem Tag. Das klingt nach weniger Effizienz. In Wirklichkeit ist es das Gegenteil. Du erledigst über die Woche mehr – weil keine Crashes dazwischenkommen, die dich tageweise lahmlegen.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Was Pacing NICHT ist",
          headline: "Pacing heißt nicht langsamer, nicht weniger, nicht nichts machen.",
        },
        {
          type: "content",
          appearTime: 6.711,
          kicker: "Was Pacing IST",
          headline: "Aktivität intelligent dosieren – eine gleichmäßige Belastungskurve.",
          lead: "Statt Spitzen und Tälern eine ruhige Welle. Über die Zeit leistet der ruhige Wellen-Modus mehr als der Push-Crash-Modus.",
        },
        {
          type: "content",
          appearTime: 22.187,
          kicker: "Ebene 1 · Innerhalb einer Aktivität",
          headline: "Zehn Minuten, fünf Minuten Pause, wieder zehn Minuten.",
          lead: "Keine Stunde durchmachen und drei Tage liegen. Du verteilst die Belastung innerhalb der Aktivität – die Pause bewusst, nicht passiv.",
        },
        {
          type: "content",
          appearTime: 39.172,
          kicker: "Ebene 2 · Über die Woche",
          headline: "Kleine, machbare Einheiten über mehrere Tage verteilen.",
          lead: "Eine halbe Stunde Dienstag, Donnerstag, Sonntag – statt zwei Stunden an einem Marathon-Tag.",
        },
        {
          type: "statement",
          appearTime: 56.204,
          text: "Klingt nach weniger Effizienz – ist das Gegenteil. Über die Woche erledigst du mehr.",
          emphasis: "das Gegenteil",
        },
      ],
    },
    {
      title: "Time-based vs. Symptom-based",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Jetzt zu einer wichtigen Unterscheidung, die Pacing erst wirklich wirksam macht: Time-based versus Symptom-based Pacing. Symptom-based Pacing heißt: Du hörst auf, wenn der Schmerz schlimmer wird. Klingt vernünftig, ist aber bei chronischem Schmerz problematisch. Warum? Weil dein Schmerz oft erst nachher hochkommt – Stunden nach der Belastung, oder am nächsten Tag. Wenn du nach Schmerz pacest, hast du die Spitze schon erlebt, bevor du gemerkt hast, dass du zu viel gemacht hast. Du bist also reaktiv – du reagierst auf den Crash, du verhinderst ihn nicht. Time-based Pacing heißt: Du hörst auf, wenn die Zeit um ist – unabhängig vom Schmerz. Du machst die geplanten zehn Minuten und hörst dann auf, auch wenn du gerade gar nicht Schmerz hast und gefühlt noch eine Stunde weiter machen könntest. Genau dieser Punkt – aufhören, wenn man eigentlich noch könnte – ist der zentrale mentale Sprung beim Pacing. Es ist unintuitiv. Es fühlt sich an wie Sich-Bremsen. Aber genau das ist es, was den Push-Crash-Zyklus durchbricht. Mit Time-based Pacing trainierst du eine neue Beziehung zu deinem Körper: Ich vertraue darauf, dass weniger heute mehr morgen bedeutet. Das ist der Mindset-Shift.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Eine Unterscheidung, die Pacing erst wirklich wirksam macht.",
          emphasis: "Time-based versus Symptom-based",
        },
        {
          type: "content",
          appearTime: 8.324,
          kicker: "Symptom-based · reaktiv",
          headline: "Symptom-based: Du hörst auf, wenn der Schmerz schlimmer wird.",
          lead: "Klingt vernünftig, ist bei chronischem Schmerz aber problematisch.",
        },
        {
          type: "content",
          appearTime: 16.974,
          dark: true,
          kicker: "Das Problem",
          headline: "Der Schmerz kommt oft erst Stunden später oder am nächsten Tag.",
          lead: "Wenn du nach Schmerz pacest, hast du die Spitze schon erlebt. Du bist reaktiv – du reagierst auf den Crash, statt ihn zu verhindern.",
        },
        {
          type: "content",
          appearTime: 32.078,
          kicker: "Time-based · proaktiv",
          headline: "Time-based: Du hörst auf, wenn die Zeit um ist – unabhängig vom Schmerz.",
          lead: "Die geplanten zehn Minuten, dann Stopp – auch wenn du gerade gar keinen Schmerz hast und gefühlt noch eine Stunde könntest.",
        },
        {
          type: "statement",
          appearTime: 45.291,
          text: "Aufhören, wenn du eigentlich noch könntest. Das ist der Sprung.",
          emphasis: "noch könntest",
        },
        {
          type: "content",
          appearTime: 58.201,
          kicker: "Der Mindset-Shift",
          headline: "Ich vertraue darauf, dass weniger heute mehr morgen bedeutet.",
          lead: "Time-based Pacing trainiert eine neue Beziehung zu deinem Körper.",
        },
      ],
    },
    {
      title: "Das Belastungs-Budget",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Ein nützliches Bild, mit dem Max Glawe Patienten Pacing erklärt, ist das Belastungs-Budget. Stell dir vor, du hast pro Tag eine bestimmte Menge an Belastungspunkten zur Verfügung. Sagen wir 100 Punkte am Tag. Jede Aktivität kostet Punkte: Putzen 30, Einkaufen 25, Schreibtischarbeit 20, Gartenarbeit 50, Familienbesuch 40 und so weiter. Du selbst kennst die ungefähre Größenordnung. Wenn du an einem Tag 150 Punkte ausgibst, gehst du ins Minus. Die fehlenden Punkte holst du dir am nächsten Tag wieder zurück – durch Crash. Wenn du jeden Tag in der Nähe deines 100-Punkte-Budgets bleibst, hast du eine ruhige Belastungskurve. Wichtig: Dein Budget ist nicht starr. Mit zunehmender Belastbarkeit – die durch Bewegungstraining wächst – steigt dein Budget. Was vor sechs Monaten 50 Punkte gekostet hat, kostet vielleicht in sechs Monaten nur noch 30. Das ist Fortschritt. Aber dieser Fortschritt kommt nur, wenn du nicht regelmäßig im Minus stehst. Eine zweite Erweiterung des Bildes: Manche Aktivitäten geben dir Punkte zurück. Schlaf gibt viele Punkte zurück. Eine Mobilisationssequenz aus Lektion 2.2 gibt einige Punkte zurück. Sozialer Kontakt – mit guten Menschen – gibt Punkte zurück. Box Breathing gibt Punkte zurück. Auch das gehört in dein Budget-Management. Wer länger mit diesem Modell arbeitet, merkt: Du lernst, dein eigenes Budget zu spüren. Du planst Aktivitäten nicht mehr nach Lust und Laune, sondern nach Budget. Das ist die ruhige Belastungswelle, die wir wollen.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Ein Bild",
          term: "Das Belastungs-Budget",
        },
        {
          type: "content",
          appearTime: 5.457,
          kicker: "100 Punkte am Tag",
          headline: "Jede Aktivität kostet Punkte aus deinem Tages-Budget.",
          lead: "Putzen 30, Einkaufen 25, Schreibtisch 20, Garten 50, Familienbesuch 40 – die ungefähre Größenordnung kennst du selbst.",
        },
        {
          type: "content",
          appearTime: 22.43,
          kicker: "Im Minus = Crash",
          headline: "150 Punkte ausgegeben – die fehlenden holt sich der nächste Tag durch Crash.",
          lead: "Bleibst du jeden Tag in der Nähe deiner 100 Punkte, hast du eine ruhige Belastungskurve.",
        },
        {
          type: "content",
          appearTime: 36.211,
          kicker: "Das Budget wächst",
          headline: "Dein Budget ist nicht starr – mit der Belastbarkeit steigt es.",
          lead: "Was vor sechs Monaten 50 Punkte kostete, kostet vielleicht bald nur noch 30. Aber nur, wenn du nicht regelmäßig im Minus stehst.",
        },
        {
          type: "reveal-list",
          appearTime: 55.843,
          kicker: "Punktegeber",
          title: "Manche Aktivitäten geben Punkte zurück",
          items: [{"label":"Schlaf – gibt viele Punkte zurück"},{"label":"Eine Mobilisationssequenz aus Lektion 2.2"},{"label":"Sozialer Kontakt – mit guten Menschen"},{"label":"Box Breathing"}],
        },
        {
          type: "statement",
          appearTime: 74.989,
          text: "Du planst nicht mehr nach Lust und Laune, sondern nach Budget.",
          emphasis: "nach Budget",
        },
      ],
    },
    {
      title: "Praktische Tools",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Wie setzt du Pacing konkret um? Erstens: Mit einem Timer. Wenn du eine schmerzfreundliche Aktivitätsdosis von zehn Minuten geplant hast, stell dir den Timer auf zehn Minuten. Wenn er klingelt – hör auf. Auch wenn du gerade in Schwung bist. Auch wenn du gar nicht Schmerz hast. Der Timer ist dein externer Vertrauensanker, der dich vor dir selbst schützt. Zweitens: Mit Zeitfenstern statt Endzielen. Statt zu sagen Ich putze, bis die ganze Wohnung sauber ist, sagst du Ich putze 20 Minuten. Was in den 20 Minuten geschafft wird, ist geschafft. Was nicht, übernimmst du morgen. Endlosaufgaben werden zu definierten Zeit-Einheiten. Drittens: Mit Aktivitätstagebuch. Mindestens in den ersten zwei Wochen ist es sehr hilfreich, kurz zu notieren: Welche Aktivität, wie lange, wie war der Schmerz vorher, wie war er nachher und am nächsten Tag? Du lernst sehr schnell deine eigenen Budget-Größen. Viertens: Mit Mikro-Pausen. In jede längere Aktivität integrierst du bewusst Mikro-Pausen – drei bis fünf Minuten alle dreißig Minuten. In diesen Pausen machst du nicht passiv etwas anderes, du machst etwas aktiv anderes: Box Breathing. Eine Mobilisationsübung. Einen kurzen Spaziergang. Das hält dein Nervensystem in der Sicherheit, ohne dass du komplett aussteigst. Fünftens: Wochenplan statt Tagesplan. Wenn du etwas Größeres erledigen musst – die Wohnung putzen, einen Geburtstag vorbereiten, eine Reise packen – planst du es nicht für einen Tag. Du planst es über drei oder vier Tage verteilt. Die Belastung wird gestreckt. Das Ergebnis ist dasselbe – aber ohne Crash.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Fünf Tools",
          headline: "Wie setzt du Pacing konkret um?",
        },
        {
          type: "content",
          appearTime: 2.694,
          kicker: "Tool 1 · Timer",
          headline: "Wenn der Timer klingelt – hör auf. Auch wenn du in Schwung bist.",
          lead: "Der Timer ist dein externer Vertrauensanker, der dich vor dir selbst schützt.",
        },
        {
          type: "content",
          appearTime: 19.946,
          kicker: "Tool 2 · Zeitfenster",
          headline: "Ich putze 20 Minuten – statt: bis die ganze Wohnung sauber ist.",
          lead: "Was in den 20 Minuten geschafft wird, ist geschafft. Endlosaufgaben werden zu definierten Zeit-Einheiten.",
        },
        {
          type: "content",
          appearTime: 36.629,
          kicker: "Tool 3 · Aktivitätstagebuch",
          headline: "Notiere: Aktivität, Dauer, Schmerz vorher, nachher, am nächsten Tag.",
          lead: "Mindestens in den ersten zwei Wochen – so lernst du sehr schnell deine eigenen Budget-Größen.",
        },
        {
          type: "content",
          appearTime: 53.998,
          kicker: "Tool 4 · Mikro-Pausen",
          headline: "Drei bis fünf Minuten alle dreißig Minuten – aktiv, nicht passiv.",
          lead: "Box Breathing, eine Mobilisationsübung, ein kurzer Spaziergang. Das hält dein Nervensystem in der Sicherheit, ohne komplett auszusteigen.",
        },
        {
          type: "content",
          appearTime: 76.928,
          kicker: "Tool 5 · Wochenplan",
          headline: "Größeres über mehrere Tage verteilen statt an einem Tag.",
          lead: "Wohnung putzen, einen Geburtstag vorbereiten, eine Reise packen – nicht für einen Tag planen.",
        },
        {
          type: "reveal-list",
          appearTime: 87.365,
          kicker: "Pacing-Werkzeugkasten",
          title: "Fünf Tools im Überblick",
          items: [{"label":"Timer – aufhören, wenn er klingelt"},{"label":"Zeitfenster statt Endzielen"},{"label":"Aktivitätstagebuch – Budget-Größen lernen"},{"label":"Mikro-Pausen – aktiv, nicht passiv"},{"label":"Wochenplan statt Tagesplan"}],
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Im Workbook findest du Übung 2.6: Mein Belastungs-Budget. Du listest deine typischen Aktivitäten und schätzt grob ein, wie viel sie kosten. Plus eine Wochen-Vorlage, in der du eine pacing-orientierte Woche planst. Eines vorweg: Pacing ist eine Disziplin. Es fühlt sich anfangs unangenehm an, weil du dich bewusst bremst, obwohl du theoretisch könntest. Diese Disziplin lohnt sich. Patienten, die Pacing wirklich beherrschen, berichten oft, dass es der einzelne Hebel war, der ihnen am meisten geholfen hat – mehr als jede Übung. In Lektion 2.7 – der letzten Lektion von Modul 2 – sprechen wir über Schmerz-Coping. Was tust du in den Momenten, in denen der Schmerz trotzdem hochkommt? Was sind die mentalen Werkzeuge, mit denen du handlungsfähig bleibst, ohne dich vom Schmerz übernehmen zu lassen? Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 2.6",
          headline: "Ein Workbook-Stopp: Mein Belastungs-Budget.",
          lead: "Liste deine typischen Aktivitäten und schätze grob ihre Kosten. Plus eine Wochen-Vorlage für eine pacing-orientierte Woche.",
        },
        {
          type: "content",
          appearTime: 12.098,
          kicker: "Die Disziplin lohnt sich",
          headline: "Patienten berichten oft: der einzelne Hebel, der am meisten geholfen hat.",
          lead: "Pacing fühlt sich anfangs unangenehm an, weil du dich bremst, obwohl du könntest. Wer es beherrscht, nennt es oft hilfreicher als jede Übung.",
        },
        {
          type: "content",
          appearTime: 31.81,
          kicker: "Als Nächstes · Lektion 2.7",
          headline: "Schmerz-Coping – wenn der Schmerz trotzdem hochkommt.",
          lead: "Die letzte Lektion von Modul 2: mentale Werkzeuge, mit denen du handlungsfähig bleibst, ohne dich vom Schmerz übernehmen zu lassen.",
        },
        {
          type: "word",
          appearTime: 48.1,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 48.1,
          nextLabel: "Lektion 2.7",
          nextTitle: "Schmerz-Coping in der Praxis",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_2_6: number = totalSlides(lesson_2_6);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_2_6: FlatSlide[] = flatSlides(lesson_2_6);

export default lesson_2_6;
