/**
 * Masterclass „Chronischer Kreuzschmerz" — Laufzeit-Daten der Lektion 2.4
 * Modernes Rumpftraining Teil 2: Belastungstoleranz
 *
 * ⚠️  GENERIERT — NICHT VON HAND EDITIEREN.
 * Quelle:   src/lib/masterclass/sources/2.4.source.ts
 * Erzeugt:  node scripts/build-masterclass.mjs 2.4  (Stimme: Adrian / YYyi4prp0WCqZCPDNGu1)
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

const AUDIO_BASE = "/audio/masterclass/chronischer-kreuzschmerz/2.4";

export const lesson_2_4: Lesson = {
  id: "2.4",
  title: "Modernes Rumpftraining Teil 2: Belastungstoleranz",
  subtitle: "Modul 2 – Kurativ handeln · Sieben Kraftübungen & Last als Therapie",
  sections: [
    {
      title: "Eröffnung: Vom Schutz zum Belasten",
      audioSrc: `${AUDIO_BASE}/abschnitt-1.mp3`,
      transkript: "Willkommen zur Belastungstoleranz-Lektion. Wenn du jetzt schon ein bisschen Sorge hast, weil ich gleich Worte wie Last, Gewicht und Kettlebell benutzen werde – bleib dran. Diese Lektion ist nicht nur sicher, sie ist mit hoher Wahrscheinlichkeit die Lektion mit dem größten Hebel in deiner ganzen Reise. Warum? Weil chronischer Rückenschmerz oft mit einer Geschichte von Entlastung einhergeht. Du hast vermieden zu heben. Du hast Sport reduziert. Du hast Vorsicht verinnerlicht. Über Monate oder Jahre wurde dein Körper weniger belastbar. Und weniger belastbar zu sein heißt: jedes kleine Heben im Alltag wird relativ gesehen zu einer großen Belastung. Genau das ist ein Schmerzgrund. Die Lösung ist nicht noch mehr Schonung. Die Lösung ist kontrolliert mehr Belastung. Schritt für Schritt, mit guter Technik, in dosierter Intensität – aber konsequent. Damit dein Rücken wieder das wird, was er sein soll: belastbar.",
      slides: [
        {
          type: "title",
          appearTime: 0,
          kicker: "Masterclass · Modul 2 – Kurativ handeln",
          lessonLabel: "Lektion 2.4 – Modernes Rumpftraining Teil 2: Belastungstoleranz",
        },
        {
          type: "content",
          appearTime: 0,
          kicker: "Bleib dran",
          headline: "Die Lektion mit dem wahrscheinlich größten Hebel deiner Reise.",
          lead: "Last, Gewicht, Kettlebell – wenn das Sorge macht: bleib dran. Diese Lektion ist sicher.",
        },
        {
          type: "content",
          appearTime: 16.045,
          dark: true,
          kicker: "Die Geschichte der Entlastung",
          headline: "Über Monate wurde dein Körper weniger belastbar.",
          lead: "Weniger belastbar heißt: jedes kleine Heben im Alltag wird relativ zur großen Belastung – genau das ist ein Schmerzgrund.",
        },
        {
          type: "statement",
          appearTime: 37.501,
          text: "Weniger Schonung. Mehr dosierte Belastung.",
          emphasis: "dosierte Belastung",
        },
      ],
    },
    {
      title: "Warum Last gut ist",
      audioSrc: `${AUDIO_BASE}/abschnitt-2.mp3`,
      transkript: "Drei wissenschaftlich gut belegte Botschaften, bevor wir die Übungen anschauen. Erstens: Bandscheiben und Wirbel werden durch Last nicht verbraucht – sie werden durch dosierte Last stärker. Knochen, Bandscheiben, Sehnen, all diese Gewebe folgen dem Prinzip use it or lose it. Was nicht belastet wird, baut ab. Was dosiert belastet wird, baut auf. Das gilt für jedes Alter – mit Anpassungen, aber das Prinzip ist universell. Zweitens: Die Lendenwirbelsäule ist enorm belastbar. Wir haben in Lektion 1.1 darüber gesprochen – Wirbelkörper brauchen tausende Kilogramm, um zu brechen. Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose kannst du sehr beruhigt Lasten heben – mit guter Technik. Drittens: Krafttraining ist eine der effektivsten Interventionen bei chronischem Rückenschmerz, die wir kennen. Mehrere Meta-Analysen der letzten Jahre zeigen das immer wieder. Nicht weil du dann stärker bist, sondern weil dein gesamtes System – Muskeln, Nerven, Bewegungsmuster, Selbstwirksamkeit – sich neu kalibriert. Was wir gleich lernen, ist also nicht Sport für Sportler. Es ist therapeutisches Krafttraining – mit Übungen, die im Alltag direkt nutzbar sind, in Intensitäten, die für chronische Schmerzpatienten geeignet sind.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Drei wissenschaftlich gut belegte Botschaften.",
          emphasis: "Drei",
        },
        {
          type: "content",
          appearTime: 4.075,
          kicker: "Erstens · Belastung baut auf",
          headline: "Gewebe werden durch dosierte Last nicht verbraucht, sondern stärker.",
          lead: "Use it or lose it: Was nicht belastet wird, baut ab. Was dosiert belastet wird, baut auf – in jedem Alter.",
        },
        {
          type: "content",
          appearTime: 25.368,
          kicker: "Zweitens · LWS ist belastbar",
          headline: "Wirbelkörper brauchen tausende Kilogramm, um zu brechen.",
          lead: "Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose kannst du sehr beruhigt Lasten heben – mit guter Technik.",
        },
        {
          type: "content",
          appearTime: 42.701,
          kicker: "Drittens · Krafttraining wirkt",
          headline: "Eine der effektivsten Interventionen bei chronischem Rückenschmerz.",
          lead: "Nicht nur weil du stärker bist – dein gesamtes System aus Muskeln, Nerven, Bewegungsmustern und Selbstwirksamkeit kalibriert sich neu.",
        },
        {
          type: "statement",
          appearTime: 59.767,
          text: "Nicht Sport für Sportler – therapeutisches Krafttraining.",
          emphasis: "therapeutisches Krafttraining",
        },
      ],
    },
    {
      title: "Übung 1 – Hip Hinge (ÜK-B1)",
      audioSrc: `${AUDIO_BASE}/abschnitt-3.mp3`,
      transkript: "Erste und wichtigste Übung: Hip Hinge – das Hüftgelenk-Beugen ohne Last. Übungskarte ÜK-B1. Hip Hinge ist die Grundbewegung für alles, was mit Bücken, Heben, Aufrichten zu tun hat. Wenn du diese Bewegung gut beherrschst, hebst du im Alltag mit Hüfte und Beinen – nicht mit dem unteren Rücken. Das ist der Game-Changer. Position: Stehe aufrecht, Füße hüftbreit, Knie leicht weich. Die Hände führen wir gleich an einen Stab – einen Besenstiel, eine Stange –, die du vertikal hinter deinem Rücken hältst, sodass sie deinen Hinterkopf, deinen oberen Rücken und dein Steißbein berührt. Drei Kontaktpunkte mit der Stange. Diese drei Punkte sollen während der ganzen Bewegung verbunden bleiben. Bewegung: Schieb das Becken nach hinten, als würdest du eine Schublade hinter dir mit dem Hintern schließen. Knie bleiben leicht gebeugt, aber sie ändern ihre Position kaum. Der Oberkörper neigt sich nach vorne, aber die Wirbelsäule bleibt gerade – die drei Kontaktpunkte mit dem Stab bleiben verbunden. Du gehst so weit nach vorne, wie du es kannst, ohne die Verbindung zur Stange zu verlieren. Dann zurück in die Aufrichtung. Was du lernst, ist: Die Bewegung kommt aus den Hüften, nicht aus dem Rücken. Der Rücken ist starr wie ein Lineal, die Hüften sind die Scharniere. Reizarme Schiene: Kleine Amplitude, 6 bis 8 Wiederholungen, sehr langsam. Standard: Volle Amplitude – Oberkörper etwa parallel zum Boden, wenn deine Beweglichkeit das zulässt –, 10 bis 12 Wiederholungen. Belastend: Volle Amplitude plus leichtes Gewicht in den Händen – eine Wasserflasche oder kleine Hantel, je 1 bis 2 Kilo. Volle Wiederholungen, langsame Ausführung. Häufiger Fehler: Du beugst dich aus dem Rücken statt aus den Hüften – der Stab verliert Kontakt zu deinem Rücken. Wenn das passiert, ist der Bewegungsumfang zu groß für deine aktuelle Beweglichkeit. Geh kürzer. Lieber kleine, saubere Hinges als große, schiefe. Wichtig: Bevor du jemals einen Gegenstand vom Boden hebst, üb diese Bewegung. Sie ist die Vorlage für jedes spätere Heben.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 1 · ÜK-B1",
          term: "Hip Hinge",
        },
        {
          type: "statement",
          appearTime: 7.465,
          text: "Heben mit Hüfte und Beinen – nicht mit dem unteren Rücken.",
          emphasis: "Game-Changer",
        },
        {
          type: "content",
          appearTime: 20.097,
          kicker: "Ausgangsposition",
          headline: "Ein Stab hinter dem Rücken – drei Kontaktpunkte.",
          lead: "Hinterkopf, oberer Rücken und Steißbein berühren die Stange. Diese drei Punkte bleiben während der ganzen Bewegung verbunden.",
        },
        {
          type: "content",
          appearTime: 44.721,
          kicker: "Die Bewegung",
          headline: "Becken nach hinten schieben – wie eine Schublade mit dem Hintern schließen.",
          lead: "Knie kaum verändert, Wirbelsäule gerade, drei Kontaktpunkte verbunden. So weit nach vorne, wie es ohne Verlust der Verbindung geht.",
        },
        {
          type: "statement",
          appearTime: 67.373,
          text: "Der Rücken ist starr wie ein Lineal, die Hüften sind die Scharniere.",
          emphasis: "die Hüften sind die Scharniere",
        },
        {
          type: "reveal-list",
          appearTime: 75.082,
          kicker: "ÜK-B1 · Drei Schienen",
          title: "Hip Hinge nach Tagesform",
          items: [{"label":"Reizarm – kleine Amplitude, sehr langsam · 6–8x"},{"label":"Standard – volle Amplitude · 10–12x"},{"label":"Belastend – mit leichtem Gewicht, je 1–2 kg · langsam"}],
        },
        {
          type: "content",
          appearTime: 100.194,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Aus dem Rücken beugen statt aus den Hüften – der Stab verliert Kontakt.",
          lead: "Dann ist die Amplitude zu groß für deine Beweglichkeit. Geh kürzer – lieber kleine, saubere Hinges als große, schiefe.",
        },
        {
          type: "statement",
          appearTime: 114.8,
          text: "Diese Bewegung ist die Vorlage für jedes spätere Heben.",
          emphasis: "die Vorlage",
        },
      ],
    },
    {
      title: "Übung 2 – Goblet Squat (ÜK-B2)",
      audioSrc: `${AUDIO_BASE}/abschnitt-4.mp3`,
      transkript: "Zweite Übung: Goblet Squat – die Kniebeuge mit Gewicht vor der Brust. Übungskarte ÜK-B2. Goblet Squat ist die anfängerfreundlichste Variante der Kniebeuge. Das Gewicht vor der Brust hilft dir, in einer aufrechten Position zu bleiben – was die Wirbelsäule entlastet. Position: Stehe aufrecht, Füße etwas mehr als hüftbreit, Zehen leicht nach außen rotiert. Halte ein Gewicht – Kettlebell, Hantel, große Wasserflasche – mit beiden Händen vor deiner Brust, nah am Körper. Bewegung: Geh in die Kniebeuge. Knie bewegen sich in dieselbe Richtung wie die Fußspitzen – nicht nach innen klappen. Die Hüfte geht nach hinten und nach unten. Du gehst so tief, wie du es ohne Hohlkreuz-Vermeidung schaffst. Bei den meisten Menschen ist das, wenn die Oberschenkel etwa parallel zum Boden sind. Dann drückst du aktiv durch die Fersen wieder hoch. Wichtig: Brust bleibt aufrecht, Wirbelsäule gerade. Das Gewicht vor der Brust hilft dabei automatisch, weil es nach vorne zieht – du musst aktiv dagegen halten und bleibst aufrecht. Reizarme Schiene: Ohne Gewicht, mit Stuhl hinter dir als Tiefen-Referenz. 6 bis 8 Wiederholungen. Standard: Mit Gewicht zwischen 4 und 8 Kilo, 8 bis 10 Wiederholungen, 3 Durchgänge. Belastend: Mit Gewicht zwischen 10 und 16 Kilo, 6 bis 8 Wiederholungen, 4 Durchgänge mit Pausen. Häufiger Fehler: Knie kippen nach innen, oder die Fersen heben sich vom Boden. Beides sind Hinweise, dass entweder das Gewicht zu hoch ist oder Beweglichkeit fehlt. Reduziere die Tiefe oder das Gewicht und arbeite mit der Zeit nach oben.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 2 · ÜK-B2",
          term: "Goblet Squat",
        },
        {
          type: "content",
          appearTime: 7.941,
          kicker: "Was sie ist",
          headline: "Die anfängerfreundlichste Variante der Kniebeuge.",
          lead: "Das Gewicht vor der Brust hilft dir, aufrecht zu bleiben – was die Wirbelsäule entlastet.",
        },
        {
          type: "content",
          appearTime: 18.715,
          kicker: "Ausgangsposition",
          headline: "Füße etwas mehr als hüftbreit, Zehen leicht nach außen.",
          lead: "Ein Gewicht – Kettlebell, Hantel, große Wasserflasche – mit beiden Händen vor der Brust, nah am Körper.",
        },
        {
          type: "content",
          appearTime: 31.834,
          kicker: "Die Bewegung",
          headline: "Knie in Richtung der Fußspitzen, Hüfte nach hinten und unten.",
          lead: "So tief, wie es ohne Hohlkreuz geht – meist bis die Oberschenkel parallel zum Boden sind. Dann durch die Fersen wieder hoch.",
        },
        {
          type: "statement",
          appearTime: 54.439,
          text: "Brust aufrecht, Wirbelsäule gerade – das Gewicht hilft dir dabei.",
          emphasis: "aufrecht",
        },
        {
          type: "reveal-list",
          appearTime: 64.62,
          kicker: "ÜK-B2 · Drei Schienen",
          title: "Goblet Squat nach Tagesform",
          items: [{"label":"Reizarm – ohne Gewicht, Stuhl als Referenz · 6–8x"},{"label":"Standard – 4–8 kg · 8–10x, 3 Durchgänge"},{"label":"Belastend – 10–16 kg · 6–8x, 4 Durchgänge"}],
        },
        {
          type: "content",
          appearTime: 84.95,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Knie kippen nach innen oder die Fersen heben sich.",
          lead: "Hinweise auf zu viel Gewicht oder fehlende Beweglichkeit. Tiefe oder Gewicht reduzieren und mit der Zeit nach oben arbeiten.",
        },
      ],
    },
    {
      title: "Übung 3 – Romanian Deadlift (ÜK-B3)",
      audioSrc: `${AUDIO_BASE}/abschnitt-5.mp3`,
      transkript: "Dritte Übung: Romanian Deadlift mit Kettlebell. Übungskarte ÜK-B3. Romanian Deadlift, kurz RDL, ist die geladene Variante des Hip Hinge. Wenn du Hip Hinge sauber beherrschst, ist RDL der nächste Schritt. Position: Stehe aufrecht. Eine Kettlebell vor deinen Füßen auf dem Boden. Beug dich mit Hip Hinge nach vorne, greif den Henkel der Kettlebell mit beiden Händen, richte dich wieder auf. Das ist die Ausgangsposition. Bewegung: Hip Hinge nach vorne – genau wie du es gelernt hast. Die Kettlebell wandert dabei mit den Händen nach unten, nah am Körper, etwa bis zur Mitte des Schienbeins. Wirbelsäule bleibt gerade, Rücken wie ein Lineal, Knie leicht gebeugt aber stabil. Dann durch aktives Hüftstrecken wieder hoch. Wichtig: Die Kettlebell bleibt während der gesamten Bewegung nah am Körper. Wenn sie sich weit von dir entfernt, entsteht ein langer Hebel auf deine Lendenwirbelsäule – das wollen wir vermeiden. Halte sie nahe. Reizarme Schiene: Geringe Last – 4 bis 6 Kilo – kleine Amplitude, 6 Wiederholungen. Standard: 8 bis 12 Kilo, volle Amplitude, 8 bis 10 Wiederholungen, 3 Durchgänge. Belastend: 16 bis 24 Kilo, 6 bis 8 Wiederholungen, 4 Durchgänge. Häufiger Fehler: Wirbelsäulenrundung in der unteren Position – der Rücken wird zum gerundeten Bogen. Das überlastet die Bandscheiben in einer ungünstigen Position. Wenn du das nicht halten kannst, geh kürzer in der Amplitude.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 3 · ÜK-B3",
          term: "Romanian Deadlift",
        },
        {
          type: "statement",
          appearTime: 5.364,
          text: "Der RDL ist die geladene Variante des Hip Hinge.",
          emphasis: "der nächste Schritt",
        },
        {
          type: "content",
          appearTime: 13.967,
          kicker: "Ausgangsposition",
          headline: "Kettlebell vor den Füßen, mit Hip Hinge greifen, wieder aufrichten.",
          lead: "Beug dich mit sauberem Hip Hinge nach vorne, greif den Henkel mit beiden Händen – das ist die Ausgangsposition.",
        },
        {
          type: "content",
          appearTime: 27.179,
          kicker: "Die Bewegung",
          headline: "Hip Hinge nach vorne, Kettlebell nah am Körper bis zur Schienbeinmitte.",
          lead: "Wirbelsäule gerade, Rücken wie ein Lineal, Knie leicht gebeugt aber stabil. Dann durch aktives Hüftstrecken wieder hoch.",
        },
        {
          type: "statement",
          appearTime: 49.342,
          text: "Die Kettlebell bleibt nah am Körper – sonst ein langer Hebel auf die LWS.",
          emphasis: "nah am Körper",
        },
        {
          type: "reveal-list",
          appearTime: 60.871,
          kicker: "ÜK-B3 · Drei Schienen",
          title: "Romanian Deadlift nach Tagesform",
          items: [{"label":"Reizarm – 4–6 kg, kleine Amplitude · 6x"},{"label":"Standard – 8–12 kg, volle Amplitude · 8–10x, 3 Durchgänge"},{"label":"Belastend – 16–24 kg · 6–8x, 4 Durchgänge"}],
        },
        {
          type: "content",
          appearTime: 78.39,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Wirbelsäulenrundung in der unteren Position – der Rücken wird zum Bogen.",
          lead: "Das belastet die Bandscheiben ungünstig. Wenn du die gerade Linie nicht hältst, geh kürzer in der Amplitude.",
        },
      ],
    },
    {
      title: "Übung 4 – Suitcase Carry (ÜK-B4)",
      audioSrc: `${AUDIO_BASE}/abschnitt-6.mp3`,
      transkript: "Vierte Übung: Suitcase Carry – der Koffertrage-Gang. Übungskarte ÜK-B4. Carries sind eine der unterschätztesten Übungen für den Rumpf. Sie sind im Alltag direkt anwendbar – du trägst sowieso Sachen – und sie trainieren Stabilisation unter Last in Bewegung. Position: Stehe aufrecht. Eine Kettlebell oder Hantel in einer Hand. Die andere Hand ist frei. Genau wie ein Koffer. Bewegung: Geh in der aufrechten Haltung durch deinen Raum. Etwa 20 bis 30 Schritte, dann Wechsel zur anderen Hand. Die Aufgabe ist: Beim Gehen nicht zur belasteten Seite kippen. Dein Rumpf hält dich gerade, gegen die einseitige Last. Du wirst spüren, wie die seitliche Bauchmuskulatur und die seitliche Rumpfmuskulatur aktiv arbeiten, um dich gerade zu halten. Das ist genau der Punkt. Reizarme Schiene: Leichtes Gewicht – 4 bis 6 Kilo –, kurze Strecke, 1 bis 2 Durchgänge pro Seite. Standard: 8 bis 12 Kilo, 20 Schritte, 3 Durchgänge pro Seite. Belastend: 16 bis 24 Kilo, 30 Schritte, 4 Durchgänge pro Seite. Häufiger Fehler: Du kippst zur belasteten Seite – dein Oberkörper neigt sich. Das ist das Gegenteil von dem, was wir wollen. Wenn das passiert, wähle eine geringere Last.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 4 · ÜK-B4",
          term: "Suitcase Carry",
        },
        {
          type: "content",
          appearTime: 5.399,
          kicker: "Die unterschätzte Übung",
          headline: "Carries trainieren Stabilisation unter Last in Bewegung.",
          lead: "Eine der unterschätztesten Rumpf-Übungen – und im Alltag direkt anwendbar, denn du trägst sowieso Sachen.",
        },
        {
          type: "content",
          appearTime: 14.547,
          kicker: "Ausgangsposition",
          headline: "Eine Kettlebell oder Hantel in einer Hand – genau wie ein Koffer.",
          lead: "Aufrecht stehen, die andere Hand bleibt frei.",
        },
        {
          type: "content",
          appearTime: 21.954,
          kicker: "Die Bewegung",
          headline: "Aufrecht gehen, 20 bis 30 Schritte, dann die Hand wechseln.",
          lead: "Die Aufgabe: beim Gehen nicht zur belasteten Seite kippen. Der Rumpf hält dich gerade gegen die einseitige Last.",
        },
        {
          type: "statement",
          appearTime: 37.152,
          text: "Die seitliche Rumpfmuskulatur hält dich gerade – das ist genau der Punkt.",
          emphasis: "genau der Punkt",
        },
        {
          type: "reveal-list",
          appearTime: 45.941,
          kicker: "ÜK-B4 · Drei Schienen",
          title: "Suitcase Carry nach Tagesform",
          items: [{"label":"Reizarm – 4–6 kg, kurze Strecke · 1–2 Durchgänge pro Seite"},{"label":"Standard – 8–12 kg, 20 Schritte · 3 Durchgänge pro Seite"},{"label":"Belastend – 16–24 kg, 30 Schritte · 4 Durchgänge pro Seite"}],
        },
        {
          type: "content",
          appearTime: 61.324,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Du kippst zur belasteten Seite – der Oberkörper neigt sich.",
          lead: "Das ist das Gegenteil von dem, was wir wollen. Wenn das passiert, wähle eine geringere Last.",
        },
      ],
    },
    {
      title: "Übung 5 – Farmer's Walk (ÜK-B5)",
      audioSrc: `${AUDIO_BASE}/abschnitt-7.mp3`,
      transkript: "Fünfte Übung: Farmer's Walk – die Bauern-Trage. Übungskarte ÜK-B5. Farmer's Walk ist die symmetrische Variante des Suitcase Carry. Du trägst in beiden Händen Gewicht. Die Belastung verteilt sich gleichmäßig, was den Rumpf weniger seitlich fordert, dafür aber die Grip-Kraft und das gesamte Halten in der Aufrechten stärker. Position: Stehe aufrecht. Eine Hantel oder Kettlebell in jeder Hand. Brust raus, Schultern leicht nach hinten gezogen. Bewegung: Geh aufrecht und ruhig. 30 bis 50 Schritte. Atme normal. Knie und Hüfte bewegen sich natürlich, Schultern bleiben oben gezogen, der Rumpf hält die aufrechte Position. Reizarme Schiene: Leichte Last – je 4 bis 6 Kilo –, 20 Schritte, 2 Durchgänge. Standard: Je 8 bis 12 Kilo, 30 Schritte, 3 Durchgänge. Belastend: Je 16 bis 24 Kilo, 40 bis 50 Schritte, 4 Durchgänge. Wann sinnvoll: Farmer's Walks sind perfekt am Ende einer Trainingseinheit – sie fordern den Rumpf nach vorigen Übungen besonders gut und trainieren das gesamte aufrechte Halten. Außerdem haben sie einen unmittelbaren Alltagstransfer – du trägst genau so deine Einkaufstüten.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 5 · ÜK-B5",
          term: "Farmer's Walk",
        },
        {
          type: "content",
          appearTime: 5.364,
          kicker: "Was sie ist",
          headline: "Die symmetrische Variante des Suitcase Carry.",
          lead: "Gewicht in beiden Händen – weniger seitliche Forderung, dafür mehr Grip-Kraft und Halten in der Aufrechten.",
        },
        {
          type: "content",
          appearTime: 18.309,
          kicker: "Ausgangsposition",
          headline: "Eine Hantel oder Kettlebell in jeder Hand.",
          lead: "Aufrecht stehen, Brust raus, Schultern leicht nach hinten gezogen.",
        },
        {
          type: "content",
          appearTime: 24.799,
          kicker: "Die Bewegung",
          headline: "Aufrecht und ruhig gehen – 30 bis 50 Schritte.",
          lead: "Normal atmen. Knie und Hüfte bewegen sich natürlich, Schultern oben gezogen, der Rumpf hält die aufrechte Position.",
        },
        {
          type: "reveal-list",
          appearTime: 36.873,
          kicker: "ÜK-B5 · Drei Schienen",
          title: "Farmer's Walk nach Tagesform",
          items: [{"label":"Reizarm – je 4–6 kg, 20 Schritte · 2 Durchgänge"},{"label":"Standard – je 8–12 kg, 30 Schritte · 3 Durchgänge"},{"label":"Belastend – je 16–24 kg, 40–50 Schritte · 4 Durchgänge"}],
        },
        {
          type: "content",
          appearTime: 54.277,
          kicker: "Wann sinnvoll",
          headline: "Perfekt am Ende einer Trainingseinheit.",
          lead: "Sie fordern den Rumpf nach vorigen Übungen und trainieren das aufrechte Halten – mit direktem Alltagstransfer zu deinen Einkaufstüten.",
        },
      ],
    },
    {
      title: "Übung 6 – Step-up (ÜK-B6)",
      audioSrc: `${AUDIO_BASE}/abschnitt-8.mp3`,
      transkript: "Sechste Übung: Step-up. Übungskarte ÜK-B6. Step-ups trainieren einbeinige Belastbarkeit. Im Alltag bewegst du dich oft auf einem Bein – Treppensteigen, aus dem Sitz aufstehen, aus dem Bus steigen. Step-ups sind die kontrollierte Trainingsvariante davon. Position: Vor dir eine stabile Erhöhung – eine kleine Bank, eine Treppenstufe, ein Kasten. Anfangs etwa knöchel- bis schienbeinhoch. Beide Füße auf dem Boden. Bewegung: Setze einen Fuß auf die Erhöhung. Schieb dich aktiv mit dem oberen Bein nach oben – der untere Fuß löst sich vom Boden, du stehst kurz auf der Erhöhung mit beiden Beinen. Dann kontrolliert wieder runter – das untere Bein setzt zuerst auf, das obere folgt. Wichtig: Die Kraft kommt aus dem oberen Bein. Nicht aus dem Schwung des unteren Beins. Du sollst spüren, wie der Oberschenkel und das Gesäß arbeiten. Reizarme Schiene: Niedrige Stufe, ohne Last, 8 Wiederholungen pro Seite. Standard: Höhere Stufe, ohne Last, 10 bis 12 Wiederholungen pro Seite, 3 Durchgänge. Belastend: Mittlere Stufe, mit Gewicht in den Händen – zwei Hanteln oder eine Kettlebell vor der Brust –, 8 bis 10 Wiederholungen pro Seite, 3 bis 4 Durchgänge. Häufiger Fehler: Du benutzt das untere Bein als Sprungbein, drückst dich also vom Boden ab. Das ist Trickserei – das obere Bein lernt dabei nicht. Kontrollier den Schwung.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 6 · ÜK-B6",
          term: "Step-up",
        },
        {
          type: "content",
          appearTime: 4.365,
          kicker: "Was sie ist",
          headline: "Step-ups trainieren einbeinige Belastbarkeit.",
          lead: "Treppensteigen, Aufstehen, aus dem Bus steigen – im Alltag oft auf einem Bein. Step-ups sind die kontrollierte Trainingsvariante.",
        },
        {
          type: "content",
          appearTime: 16.916,
          kicker: "Ausgangsposition",
          headline: "Eine stabile Erhöhung – Bank, Treppenstufe, Kasten.",
          lead: "Anfangs etwa knöchel- bis schienbeinhoch. Beide Füße auf dem Boden.",
        },
        {
          type: "content",
          appearTime: 27.051,
          kicker: "Die Bewegung",
          headline: "Mit dem oberen Bein aktiv nach oben schieben, kontrolliert wieder runter.",
          lead: "Der untere Fuß löst sich, du stehst kurz mit beiden Beinen oben. Beim Absteigen setzt das untere Bein zuerst auf.",
        },
        {
          type: "statement",
          appearTime: 44.037,
          text: "Die Kraft kommt aus dem oberen Bein – nicht aus dem Schwung.",
          emphasis: "aus dem oberen Bein",
        },
        {
          type: "reveal-list",
          appearTime: 53.882,
          kicker: "ÜK-B6 · Drei Schienen",
          title: "Step-up nach Tagesform",
          items: [{"label":"Reizarm – niedrige Stufe, ohne Last · 8x pro Seite"},{"label":"Standard – höhere Stufe, ohne Last · 10–12x pro Seite, 3 Durchgänge"},{"label":"Belastend – mittlere Stufe, mit Gewicht · 8–10x pro Seite, 3–4 Durchgänge"}],
        },
        {
          type: "content",
          appearTime: 76.534,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Das untere Bein als Sprungbein benutzen.",
          lead: "Das ist Trickserei – das obere Bein lernt dabei nicht. Kontrollier den Schwung.",
        },
      ],
    },
    {
      title: "Übung 7 – Single-leg Glute Bridge (ÜK-B7)",
      audioSrc: `${AUDIO_BASE}/abschnitt-9.mp3`,
      transkript: "Siebte Übung: Single-leg Glute Bridge. Übungskarte ÜK-B7. Du kennst Glute Bridge schon aus Lektion 2.3. Die einbeinige Variante macht daraus eine deutlich anspruchsvollere Kraftübung für das Gesäß und die Beckenstabilität. Position: Rücken auf der Matte. Ein Bein angestellt, Fuß flach am Boden. Das andere Bein gerade nach vorne gestreckt – in der Luft, in Verlängerung des Oberschenkels. Bewegung: Press die Ferse des angestellten Beins in den Boden und heb das Becken ab. Das gestreckte Bein bleibt in der Linie mit dem Oberschenkel – es sinkt nicht ab. Halte die obere Position kurz. Dann ablegen. Reizarme Schiene: Geringe Hubhöhe, 5 bis 8 Wiederholungen pro Seite. Standard: Volle Hubhöhe, 10 bis 12 Wiederholungen pro Seite, 3 Durchgänge. Belastend: Volle Hubhöhe mit 3 Sekunden Haltezeit oben, 12 bis 15 Wiederholungen pro Seite, 4 Durchgänge. Häufiger Fehler: Das Becken kippt zur Seite des freien Beins – du verlierst die gerade Linie und das Becken sinkt einseitig ab. Wenn das passiert, ist das Standbein nicht stark genug oder die Hüftstabilität fehlt. Geh zurück zur beidbeinigen Brücke und arbeite an Symmetrie.",
      slides: [
        {
          type: "term",
          appearTime: 0,
          kicker: "Übung 7 · ÜK-B7",
          term: "Single-leg Glute Bridge",
        },
        {
          type: "content",
          appearTime: 5.132,
          kicker: "Aus 2.3 bekannt",
          headline: "Die einbeinige Variante der Glute Bridge.",
          lead: "Deutlich anspruchsvoller – eine Kraftübung für das Gesäß und die Beckenstabilität.",
        },
        {
          type: "content",
          appearTime: 15.79,
          kicker: "Ausgangsposition",
          headline: "Ein Bein angestellt, das andere gerade nach vorne gestreckt.",
          lead: "Rückenlage, Fuß des Standbeins flach am Boden. Das gestreckte Bein liegt in der Luft, in Verlängerung des Oberschenkels.",
        },
        {
          type: "content",
          appearTime: 25.252,
          kicker: "Die Bewegung",
          headline: "Ferse des Standbeins in den Boden pressen, Becken abheben.",
          lead: "Das gestreckte Bein bleibt in der Linie mit dem Oberschenkel – es sinkt nicht ab. Obere Position kurz halten, dann ablegen.",
        },
        {
          type: "reveal-list",
          appearTime: 36.839,
          kicker: "ÜK-B7 · Drei Schienen",
          title: "Single-leg Glute Bridge nach Tagesform",
          items: [{"label":"Reizarm – geringe Hubhöhe · 5–8x pro Seite"},{"label":"Standard – volle Hubhöhe · 10–12x pro Seite, 3 Durchgänge"},{"label":"Belastend – 3 s Haltezeit oben · 12–15x pro Seite, 4 Durchgänge"}],
        },
        {
          type: "content",
          appearTime: 53.371,
          dark: true,
          kicker: "Häufiger Fehler",
          headline: "Das Becken kippt zur Seite des freien Beins und sinkt einseitig ab.",
          lead: "Dann ist das Standbein nicht stark genug oder die Hüftstabilität fehlt. Zurück zur beidbeinigen Brücke und an Symmetrie arbeiten.",
        },
      ],
    },
    {
      title: "Progression & Beispielplan",
      audioSrc: `${AUDIO_BASE}/abschnitt-10.mp3`,
      transkript: "Wie kombinierst du Belastungstoleranz-Übungen sinnvoll? Mein Vorschlag: ein bis zwei Krafttage pro Woche. An jedem Krafttag wählst du drei bis vier Übungen aus den sieben. Eine Einheit dauert 30 bis 40 Minuten inklusive Aufwärmen. Eine empfehlenswerte Anfangs-Sequenz: Aufwärmen: Eine Mobilisationssequenz aus Lektion 2.2 – etwa Cat-Cow, Hüftbeuger-Mobilisation, Becken-Kreisen. Hauptteil: Hip Hinge ohne Last – 10 Wiederholungen, 2 Durchgänge. Goblet Squat. Romanian Deadlift. Glute Bridge oder Step-up. Finisher: Suitcase Carry oder Farmer's Walk. Wie progressierst du? Anfangs gehst du an die Wiederholungszahlen heran. Du startest mit der niedrigeren Zahl, übst zwei Wochen, dann gehst du an die obere Grenze. Erst wenn du die obere Wiederholungszahl mit guter Technik schaffst, gehst du zur nächsten Last-Stufe. Wichtig: Krafttraining hat eine ganz andere Erholungs-Charakteristik als Mobilisation. Zwischen zwei Krafttagen sollten mindestens 48 Stunden Pause sein. An Pausentagen kannst du Mobilisation oder Spaziergänge einbauen.",
      slides: [
        {
          type: "statement",
          appearTime: 0,
          text: "Wie kombinierst du das sinnvoll?",
          emphasis: "sinnvoll",
        },
        {
          type: "content",
          appearTime: 3.425,
          kicker: "Ein bis zwei Krafttage",
          headline: "Ein bis zwei Krafttage pro Woche, je drei bis vier Übungen.",
          lead: "An jedem Krafttag wählst du drei bis vier der sieben Übungen. Eine Einheit dauert 30 bis 40 Minuten inklusive Aufwärmen.",
        },
        {
          type: "reveal-list",
          appearTime: 14.083,
          kicker: "Anfangs-Sequenz · 30–40 Min",
          title: "Eine empfehlenswerte Kraft-Einheit",
          items: [{"label":"Aufwärmen – Mobilisationssequenz aus 2.2 (Cat-Cow, Hüftbeuger, Becken-Kreisen)"},{"label":"Hauptteil – Hip Hinge, Goblet Squat, Romanian Deadlift, Glute Bridge oder Step-up"},{"label":"Finisher – Suitcase Carry oder Farmer's Walk"}],
        },
        {
          type: "reveal-list",
          appearTime: 37.407,
          kicker: "Die Progressions-Treppe",
          title: "So steigerst du – in dieser Reihenfolge",
          items: [{"label":"Wiederholungen erhöhen – von der unteren zur oberen Zahl"},{"label":"Last erhöhen – erst wenn die obere Zahl mit guter Technik sitzt"},{"label":"Nächste Variante – wenn auch die Last sicher beherrscht wird"}],
        },
        {
          type: "statement",
          appearTime: 51.967,
          text: "Zwischen zwei Krafttagen mindestens 48 Stunden Pause.",
          emphasis: "48 Stunden Pause",
        },
      ],
    },
    {
      title: "Workbook & Übergang",
      audioSrc: `${AUDIO_BASE}/abschnitt-11.mp3`,
      transkript: "Im Workbook findest du Übung 2.4: Mein Krafttraining-Plan. Eine Vorlage, in die du deine Wochenstruktur einträgst – welche Übungen, welche Tage, welche Schienen. In der nächsten Lektion – 2.5 – kommen Atemmechanik und Beckenboden-Verbindung. Klingt erst einmal soft, ist aber für die Rumpfstabilität extrem wichtig. Außerdem ist es eine Lektion, die du buchstäblich überall machen kannst – während du diese Lektion hörst zum Beispiel. Bis gleich.",
      slides: [
        {
          type: "content",
          appearTime: 0,
          kicker: "Workbook · Übung 2.4",
          headline: "Ein Workbook-Stopp: Mein Krafttraining-Plan.",
          lead: "Eine Vorlage für deine Wochenstruktur – welche Übungen, welche Tage, welche Schienen.",
        },
        {
          type: "content",
          appearTime: 10.6,
          kicker: "Als Nächstes · Lektion 2.5",
          headline: "Atemmechanik und Beckenboden – soft, aber extrem wichtig.",
          lead: "Zentral für die Rumpfstabilität. Und eine Lektion, die du buchstäblich überall machen kannst.",
        },
        {
          type: "word",
          appearTime: 24.74,
          word: "Bis gleich.",
        },
        {
          type: "outro",
          appearTime: 24.74,
          nextLabel: "Lektion 2.5",
          nextTitle: "Atemmechanik & Beckenboden-Verbindung",
          hint: "Weiter →",
        },
      ],
    },
  ],
};

/** Gesamtanzahl Slides der Lektion. */
export const total_2_4: number = totalSlides(lesson_2_4);

/** Flache Liste aller Slides (mit Rückverweis auf den Abschnitt). */
export const flat_2_4: FlatSlide[] = flatSlides(lesson_2_4);

export default lesson_2_4;
