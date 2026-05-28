/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion O.1
 * Drei Kernbotschaften
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/O.1.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs O.1  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/O.1";

export const lesson_O_1: Lesson = {
  id: "O.1",
  title: "Drei Kernbotschaften",
  subtitle: "Outro · Verstehen verändert · Bewegung ist Information · Das System trägt sich selbst",
  sections: [
    {
      title: "Eröffnung",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zum Outro. Wir sind am Ende der Masterclass. Du hast vier Module hinter dir – Verstehen, Handeln, Prävention, Recoping. Du hast wahrscheinlich um die zehn Stunden an Inhalt durchgearbeitet, dazu deine Workbook-Übungen, deine Ritual-Map, dein Flare-up-Protokoll. Was nimmst du mit? Wenn du in einem Jahr noch eine Sache aus dieser Masterclass im Kopf hast – was sollte das sein? In dieser ersten Outro-Lektion verdichte ich die ganzen Inhalte auf drei Kernbotschaften. Drei Sätze, die alles zusammenhalten. Diese drei Sätze sind das, was Max Glawe in seiner Praxis nach hunderten Gesprächen mit chronischen Schmerzpatienten als die zentralen Einsichten identifiziert hat. Wer diese drei verinnerlicht, hat ein gutes Fundament für die nächsten Jahre.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Outro",
          lessonLabel: "Lektion O.1 – Drei Kernbotschaften",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Am Ende der Masterclass",
          headline: "Vier Module liegen hinter dir.",
          lead: "Verstehen, Handeln, Prävention, Recoping.",
        },
        {
          type: "content",
          appearTime: 7.338,
          headline: "Rund zehn Stunden Inhalt – plus alles, was du selbst gebaut hast.",
          lead: "Workbook-Übungen, Ritual-Map, Flare-up-Protokoll.",
        },
        {
          type: "statement",
          appearTime: 15.035,
          text: "Wenn du eine Sache mitnimmst – was sollte das sein?",
          emphasis: "eine Sache",
        },
        {
          type: "content",
          appearTime: 21.467,
          kicker: "Drei Kernbotschaften",
          headline: "Wir verdichten die ganze Masterclass auf drei Sätze.",
          lead: "Drei Sätze, die alles zusammenhalten.",
        },
        {
          type: "content",
          appearTime: 28.224,
          kicker: "Die zentralen Einsichten",
          headline: "Was nach hunderten Gesprächen in der Praxis übrig bleibt.",
          lead: "Wer diese drei verinnerlicht, hat ein gutes Fundament für die nächsten Jahre.",
        },
      ],
    },
    {
      title: "Kernbotschaft 1: Verstehen verändert",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Erste Kernbotschaft: Verstehen verändert. Du hast in Modul 1 viel Anatomie, Physiologie und Schmerztheorie gelernt. Vielleicht hast du dich gefragt: Wozu eigentlich? Bringt mir das wirklich etwas, wenn ich weiß, wie eine Bandscheibe aufgebaut ist oder was zentrale Sensibilisierung bedeutet? Die Antwort ist klar: ja. Verstehen ist therapeutisch. Das ist keine bloße Behauptung – das ist einer der best-belegten Befunde der modernen Schmerzforschung. Schmerzwissen reduziert Schmerz. Direkt. Warum? Weil Schmerz nicht primär ein Strukturproblem ist – Schmerz ist ein Interpretations-Problem. Dein Gehirn interpretiert Signale aus deinem Rücken im Licht dessen, was es weiß und glaubt. Wer glaubt, jede Bewegung schade einer kaputten Bandscheibe, hat ein Gehirn, das Schmerzsignale verstärkt. Wer versteht, dass Bandscheibenveränderungen normal sind, Schmerz nicht direkt mit Struktur korreliert und Bewegung dem System hilft – hat ein Gehirn, das anders interpretiert. Das Wissen aus Modul 1 ist deshalb kein nettes Beiwerk. Es ist therapeutische Substanz. Jeder klare Gedanke, den du heute über deinen Schmerz hast – jedes Mal, wenn du dich erinnerst Befund ist nicht gleich Schmerz oder Bewegung ist Information – ist eine kleine Re-Kalibrierung deines Schmerzsystems. Verstehen verändert. Es ist eine der mächtigsten Sachen, die du dir selber geben kannst.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Erste Kernbotschaft",
          term: "Verstehen verändert.",
        },
        {
          type: "content",
          appearTime: 3.204,
          kicker: "Wozu eigentlich?",
          headline: "Bringt es wirklich etwas, das alles zu wissen?",
          lead: "Wie eine Bandscheibe aufgebaut ist, was zentrale Sensibilisierung bedeutet.",
        },
        {
          type: "statement",
          appearTime: 18.298,
          text: "Verstehen ist therapeutisch.",
          emphasis: "therapeutisch",
        },
        {
          type: "quote",
          appearTime: 21.374,
          text: "Schmerzwissen reduziert Schmerz.",
          caption: "Forschung, nicht Esoterik.",
        },
        {
          type: "content",
          appearTime: 28.665,
          kicker: "Warum?",
          headline: "Schmerz ist kein Strukturproblem – er ist ein Interpretations-Problem.",
          lead: "Dein Gehirn interpretiert die Signale im Licht dessen, was es weiß und glaubt.",
        },
        {
          type: "content",
          appearTime: 39.613,
          dark: true,
          headline: "Wer anders glaubt, hat ein Gehirn, das anders interpretiert.",
          lead: "Angst verstärkt Schmerzsignale. Verstehen kalibriert sie neu.",
        },
        {
          type: "content",
          appearTime: 55.124,
          kicker: "Kein nettes Beiwerk",
          headline: "Jeder klare Gedanke ist eine kleine Re-Kalibrierung deines Schmerzsystems.",
          lead: "„Befund ist nicht gleich Schmerz.“ „Bewegung ist Information.“",
        },
        {
          type: "statement",
          appearTime: 71.924,
          text: "Eine der mächtigsten Sachen, die du dir selbst geben kannst.",
          emphasis: "selbst",
        },
      ],
    },
    {
      title: "Kernbotschaft 2: Bewegung ist Information",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Zweite Kernbotschaft: Bewegung ist Information. Wenn Max Glawe in seiner Praxis einen Satz wählen müsste, der die ganze Behandlungs-Philosophie zusammenfasst, dann diesen. Bewegung ist Information. Was bedeutet das? Bewegung ist nicht primär Training für Muskeln. Bewegung ist nicht primär mechanische Belastung. Bewegung ist Information an dein Nervensystem. Eine Botschaft. Eine Mitteilung. Wenn du dich bewegst, schickst du deinem System die Information: Wir sind in Sicherheit. Dieses Gewebe trägt. Hier sind keine Gefahren. Dein Gehirn lernt, deinen Rücken neu zu interpretieren. Es senkt schrittweise die Schmerzschwelle. Es gewöhnt sich daran, dass Belastung verträglich ist. Umgekehrt: Wenn du dich schonst, schickst du die Information: Hier ist etwas Gefährliches. Hier muss ich vorsichtig sein. Dein Gehirn lernt das ebenfalls – und verstärkt die Schmerzempfindlichkeit. Genau deshalb funktioniert das Drei-Schienen-System der Masterclass so gut. Auch in schlechten Phasen machst du etwas – auf reizarmer Schiene. Du sagst deinem System: Hier ist Bewegung. Auch heute. In dieser sanften Form. Du brichst die Botschaft nicht ab. Du dosierst sie nur. Wenn du diese Idee verinnerlichst – Bewegung ist Information, nicht Pflicht, nicht Training, nicht Strafe – verändert sich deine ganze Beziehung zu Übungen. Übungen werden zu Gesprächen mit deinem Nervensystem.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Zweite Kernbotschaft",
          term: "Bewegung ist Information.",
        },
        {
          type: "content",
          appearTime: 3.1,
          kicker: "Die ganze Behandlungs-Philosophie in einem Satz",
          headline: "Wenn nur ein Satz bliebe, dann dieser.",
          lead: "Bewegung ist Information.",
        },
        {
          type: "content",
          appearTime: 13.595,
          kicker: "Was bedeutet das?",
          headline: "Bewegung ist nicht Training und nicht Belastung – sie ist eine Botschaft.",
          lead: "Information an dein Nervensystem. Eine Mitteilung.",
        },
        {
          type: "quote",
          appearTime: 25.751,
          text: "Wir sind in Sicherheit. Dieses Gewebe trägt.",
          caption: "Die Botschaft der Bewegung. Dein Gehirn senkt schrittweise die Schmerzschwelle.",
        },
        {
          type: "quote",
          appearTime: 41.691,
          dark: true,
          text: "Hier ist etwas Gefährliches. Hier muss ich vorsichtig sein.",
          caption: "Die Botschaft der Schonung – sie verstärkt die Schmerzempfindlichkeit.",
        },
        {
          type: "content",
          appearTime: 54.474,
          kicker: "Das Drei-Schienen-System",
          headline: "Auch in schlechten Phasen machst du etwas – auf reizarmer Schiene.",
          lead: "Du brichst die Botschaft nicht ab. Du dosierst sie nur.",
        },
        {
          type: "statement",
          appearTime: 72.051,
          text: "Übungen werden zu Gesprächen mit deinem Nervensystem.",
          emphasis: "Gesprächen",
        },
      ],
    },
    {
      title: "Kernbotschaft 3: Das System trägt sich selbst",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Dritte Kernbotschaft: Das System trägt sich selbst. Diese ist vielleicht die wichtigste. Und sicher diejenige, die am schwersten zu glauben ist, bis man sie selbst erlebt. Was meine ich damit? Wenn du dein System richtig aufgebaut hast – Ritual-Map, Mikro-Routinen, dediziertes Training, Lifestyle-Hygiene – dann läuft es nach einigen Monaten ohne Motivation. Es braucht dich nicht jeden Tag zu überzeugen. Es trägt sich selbst. Die Trigger sind da. Der Kaffee läuft, du machst Hip Hinge. Du putzt Zähne, du machst Pelvic Tilt. Du gehst ins Bett, du atmest. Diese Sequenzen werden Teil deiner Identität. Sie laufen, weil sie an stabile Tagesanker geknüpft sind, nicht weil du jeden Tag dazu überreden musst. Das ist die Befreiung von chronischem Schmerz – nicht die Schmerzfreiheit selbst. Es ist die Freiheit von der täglichen Schmerz-Überforderung. Die Freiheit, ein normales Leben zu führen, in dem dein Rücken eine ungenutzte Stütze ist, kein lautes Problem. Die Freiheit, an deinen Schmerz nicht ständig denken zu müssen, weil dein System die Pflege ohne dich macht. Diese Freiheit kommt nicht von heute auf morgen. Sie braucht die ersten vier bis acht Wochen, in denen du dein System aufbaust und einübst. Aber wenn die Trigger einmal sitzen, hält sich das System mit minimaler Energie. Du machst nicht mehr Therapie – du lebst in einer Art, die deinen Rücken pflegt. Das ist das ultimative Ziel der ganzen Masterclass. Nicht ein bestimmter Schmerzwert. Nicht eine bestimmte funktionelle Leistung. Sondern: ein System, das sich selbst trägt. Eine Lebens-Architektur, in der dein Rücken gut versorgt ist, ohne dass du jeden Tag bewusst daran arbeiten musst.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Dritte Kernbotschaft",
          term: "Das System trägt sich selbst.",
        },
        {
          type: "content",
          appearTime: 2.995,
          kicker: "Vielleicht die wichtigste",
          headline: "Am schwersten zu glauben – bis man sie selbst erlebt.",
        },
        {
          type: "content",
          appearTime: 9.973,
          kicker: "Was das heißt",
          headline: "Nach einigen Monaten läuft das System ohne Motivation.",
          lead: "Ritual-Map, Mikro-Routinen, dediziertes Training, Lifestyle-Hygiene – es braucht dich nicht jeden Tag zu überzeugen.",
        },
        {
          type: "reveal-list",
          appearTime: 25.867,
          kicker: "Die Trigger sind da",
          title: "Es läuft an deinen Tagesankern",
          items: [{"label":"Der Kaffee läuft – du machst Hip Hinge"},{"label":"Du putzt Zähne – du machst Pelvic Tilt"},{"label":"Du gehst ins Bett – du atmest"}],
        },
        {
          type: "content",
          appearTime: 41.517,
          dark: true,
          kicker: "Die eigentliche Befreiung",
          headline: "Nicht die Schmerzfreiheit – die Freiheit, nicht mehr ständig daran denken zu müssen.",
          lead: "Ein Leben, in dem dein Rücken eine ungenutzte Stütze ist, kein lautes Problem.",
        },
        {
          type: "content",
          appearTime: 62.032,
          kicker: "Die ersten vier bis acht Wochen",
          headline: "Du machst nicht mehr Therapie – du lebst in einer Art, die deinen Rücken pflegt.",
          lead: "Wenn die Trigger einmal sitzen, hält sich das System mit minimaler Energie.",
        },
        {
          type: "statement",
          appearTime: 77.067,
          text: "Das ultimative Ziel: ein System, das sich selbst trägt.",
          emphasis: "selbst trägt",
        },
      ],
    },
    {
      title: "Die drei Sätze als Ankerkarten",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Drei Sätze: Verstehen verändert. Bewegung ist Information. Das System trägt sich selbst. Im Workbook findest du eine Reflexionsseite mit dem Titel Meine drei Mitnehm-Sätze. Drei leere Felder. Du kannst diese drei Sätze hineinschreiben – oder eigene Versionen, die für dich klingen. Oder einen vierten Satz, den du selbst formulieren willst. Was wichtig ist: Hab diese Sätze irgendwo zugänglich. Manche Patienten schreiben sie sich auf eine Karte und stecken sie ins Portemonnaie. Andere haben sie als Hintergrundbild im Handy. Wieder andere haben sie auf einem Post-it am Badezimmerspiegel. Wenn du an einem schlechten Tag bist – diese drei Sätze sind dein Erinnerungsanker. Sie holen dich zurück in die Perspektive, die du dir hier erarbeitet hast. In der letzten Lektion – O.2 – machen wir den eigentlichen Abschluss. Es geht um die Übergabe. Was du jetzt bist, wenn du diese Masterclass abgeschlossen hast. Wo du Unterstützung finden kannst, wenn du sie brauchst. Und ein persönlicher Abschluss. Bis gleich.",
      slides: [
        {
          type: "reveal-list",
          appearTime: 0,
          kicker: "Deine drei Mitnehm-Sätze",
          title: "Drei Sätze, die alles zusammenhalten",
          items: [{"label":"Verstehen verändert."},{"label":"Bewegung ist Information."},{"label":"Das System trägt sich selbst."}],
        },
        {
          type: "content",
          appearTime: 6.618,
          kicker: "Workbook · Meine drei Mitnehm-Sätze",
          headline: "Drei leere Felder – für diese Sätze oder deine eigenen.",
          lead: "Schreib sie hinein, formuliere eigene Versionen, oder ergänze einen vierten Satz, der für dich klingt.",
        },
        {
          type: "reveal-list",
          appearTime: 21.641,
          kicker: "Hab sie zugänglich",
          title: "Wohin damit?",
          items: [{"label":"Auf eine Karte ins Portemonnaie"},{"label":"Als Hintergrundbild im Handy"},{"label":"Auf ein Post-it am Badezimmerspiegel"}],
        },
        {
          type: "statement",
          appearTime: 34.343,
          text: "An einem schlechten Tag sind diese drei Sätze dein Erinnerungsanker.",
          emphasis: "Erinnerungsanker",
        },
        {
          type: "content",
          appearTime: 43.109,
          kicker: "Als Nächstes · Lektion O.2",
          headline: "In der letzten Lektion machen wir den eigentlichen Abschluss.",
          lead: "Die Übergabe: was du jetzt bist, wo du Unterstützung findest – und ein persönlicher Abschluss.",
        },
        {
          type: "outro",
          appearTime: 56.878,
          nextLabel: "Outro · Lektion O.2",
          nextTitle: "Die Übergabe",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_O_1: number = totalSlides(lesson_O_1);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_O_1: FlatSlide[] = flatSlides(lesson_O_1);

export default lesson_O_1;
