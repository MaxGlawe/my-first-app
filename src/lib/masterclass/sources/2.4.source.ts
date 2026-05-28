/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 2.4
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/2.4.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 2.4`). Niemals lessons/2.4.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Vierte Lektion von Modul 2 (Kurativ handeln) und die dritte praktische
 * Übungslektion. Modernes Rumpftraining Teil 2: Belastungstoleranz. Sieben Übungen
 * (ÜK-B1…B7), jede mit drei Schienen, plus Progression/Beispielplan. Aufbau
 * identisch zu 2.2/2.3:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–11) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die abschließende Produktions-/Zwischenstand-Notiz
 * der MD werden NICHT vertont.
 *
 * 3.-PERSON-REGEL: 2.4 enthält ausschließlich generische Guide-/Übungs-Anleitungs-
 * Ich-/Du-Form (der Sprecher leitet an, „ich gleich Worte … benutzen werde",
 * „Mein Vorschlag"). Keine Ersteller-/Praxis-/Credential-Aussagen über den Schöpfer
 * → keine Umschreibung auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD wird beibehalten. Übungen werden als Anleitung im angenehmen/
 *   schmerzarmen Bereich beschrieben („dosierte Last", „mit guter Technik", „so tief,
 *   wie du es ohne Hohlkreuz schaffst"), keine Heilversprechen. Aussagen bleiben
 *   prozesshaft, exakt wie in der MD.
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

// ── Abschnitt 1 – Eröffnung: Vom Schutz zum Belasten ─────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung: Vom Schutz zum Belasten",
  narration:
    "Willkommen zur Belastungstoleranz-Lektion. Wenn du jetzt schon ein bisschen Sorge hast, weil ich gleich Worte wie Last, Gewicht und Kettlebell benutzen werde – bleib dran. Diese Lektion ist nicht nur sicher, sie ist mit hoher Wahrscheinlichkeit die Lektion mit dem größten Hebel in deiner ganzen Reise. Warum? Weil chronischer Rückenschmerz oft mit einer Geschichte von Entlastung einhergeht. Du hast vermieden zu heben. Du hast Sport reduziert. Du hast Vorsicht verinnerlicht. Über Monate oder Jahre wurde dein Körper weniger belastbar. Und weniger belastbar zu sein heißt: jedes kleine Heben im Alltag wird relativ gesehen zu einer großen Belastung. Genau das ist ein Schmerzgrund. Die Lösung ist nicht noch mehr Schonung. Die Lösung ist kontrolliert mehr Belastung. Schritt für Schritt, mit guter Technik, in dosierter Intensität – aber konsequent. Damit dein Rücken wieder das wird, was er sein soll: belastbar.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 2 – Kurativ handeln",
      lessonLabel: "Lektion 2.4 – Modernes Rumpftraining Teil 2: Belastungstoleranz",
    },
    {
      type: "content",
      seg: "Willkommen zur Belastungstoleranz-Lektion. Wenn du jetzt schon ein bisschen Sorge hast, weil ich gleich Worte wie Last, Gewicht und Kettlebell benutzen werde – bleib dran. Diese Lektion ist nicht nur sicher, sie ist mit hoher Wahrscheinlichkeit die Lektion mit dem größten Hebel in deiner ganzen Reise.",
      kicker: "Bleib dran",
      headline: "Die Lektion mit dem wahrscheinlich größten Hebel deiner Reise.",
      lead: "Last, Gewicht, Kettlebell – wenn das Sorge macht: bleib dran. Diese Lektion ist sicher.",
    },
    {
      type: "content",
      seg: " Warum? Weil chronischer Rückenschmerz oft mit einer Geschichte von Entlastung einhergeht. Du hast vermieden zu heben. Du hast Sport reduziert. Du hast Vorsicht verinnerlicht. Über Monate oder Jahre wurde dein Körper weniger belastbar. Und weniger belastbar zu sein heißt: jedes kleine Heben im Alltag wird relativ gesehen zu einer großen Belastung. Genau das ist ein Schmerzgrund.",
      dark: true,
      kicker: "Die Geschichte der Entlastung",
      headline: "Über Monate wurde dein Körper weniger belastbar.",
      lead: "Weniger belastbar heißt: jedes kleine Heben im Alltag wird relativ zur großen Belastung – genau das ist ein Schmerzgrund.",
    },
    {
      type: "statement",
      seg: " Die Lösung ist nicht noch mehr Schonung. Die Lösung ist kontrolliert mehr Belastung. Schritt für Schritt, mit guter Technik, in dosierter Intensität – aber konsequent. Damit dein Rücken wieder das wird, was er sein soll: belastbar.",
      text: "Weniger Schonung. Mehr dosierte Belastung.",
      emphasis: "dosierte Belastung",
    },
  ],
};

// ── Abschnitt 2 – Warum Last gut ist ─────────────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Warum Last gut ist",
  narration:
    "Drei wissenschaftlich gut belegte Botschaften, bevor wir die Übungen anschauen. Erstens: Bandscheiben und Wirbel werden durch Last nicht verbraucht – sie werden durch dosierte Last stärker. Knochen, Bandscheiben, Sehnen, all diese Gewebe folgen dem Prinzip use it or lose it. Was nicht belastet wird, baut ab. Was dosiert belastet wird, baut auf. Das gilt für jedes Alter – mit Anpassungen, aber das Prinzip ist universell. Zweitens: Die Lendenwirbelsäule ist enorm belastbar. Wir haben in Lektion 1.1 darüber gesprochen – Wirbelkörper brauchen tausende Kilogramm, um zu brechen. Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose kannst du sehr beruhigt Lasten heben – mit guter Technik. Drittens: Krafttraining ist eine der effektivsten Interventionen bei chronischem Rückenschmerz, die wir kennen. Mehrere Meta-Analysen der letzten Jahre zeigen das immer wieder. Nicht weil du dann stärker bist, sondern weil dein gesamtes System – Muskeln, Nerven, Bewegungsmuster, Selbstwirksamkeit – sich neu kalibriert. Was wir gleich lernen, ist also nicht Sport für Sportler. Es ist therapeutisches Krafttraining – mit Übungen, die im Alltag direkt nutzbar sind, in Intensitäten, die für chronische Schmerzpatienten geeignet sind.",
  slides: [
    {
      type: "statement",
      seg: "Drei wissenschaftlich gut belegte Botschaften, bevor wir die Übungen anschauen.",
      text: "Drei wissenschaftlich gut belegte Botschaften.",
      emphasis: "Drei",
    },
    {
      type: "content",
      seg: " Erstens: Bandscheiben und Wirbel werden durch Last nicht verbraucht – sie werden durch dosierte Last stärker. Knochen, Bandscheiben, Sehnen, all diese Gewebe folgen dem Prinzip use it or lose it. Was nicht belastet wird, baut ab. Was dosiert belastet wird, baut auf. Das gilt für jedes Alter – mit Anpassungen, aber das Prinzip ist universell.",
      kicker: "Erstens · Belastung baut auf",
      headline: "Gewebe werden durch dosierte Last nicht verbraucht, sondern stärker.",
      lead: "Use it or lose it: Was nicht belastet wird, baut ab. Was dosiert belastet wird, baut auf – in jedem Alter.",
    },
    {
      type: "content",
      seg: " Zweitens: Die Lendenwirbelsäule ist enorm belastbar. Wir haben in Lektion 1.1 darüber gesprochen – Wirbelkörper brauchen tausende Kilogramm, um zu brechen. Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose kannst du sehr beruhigt Lasten heben – mit guter Technik.",
      kicker: "Zweitens · LWS ist belastbar",
      headline: "Wirbelkörper brauchen tausende Kilogramm, um zu brechen.",
      lead: "Bei einer ansonsten gesunden Wirbelsäule ohne Osteoporose kannst du sehr beruhigt Lasten heben – mit guter Technik.",
    },
    {
      type: "content",
      seg: " Drittens: Krafttraining ist eine der effektivsten Interventionen bei chronischem Rückenschmerz, die wir kennen. Mehrere Meta-Analysen der letzten Jahre zeigen das immer wieder. Nicht weil du dann stärker bist, sondern weil dein gesamtes System – Muskeln, Nerven, Bewegungsmuster, Selbstwirksamkeit – sich neu kalibriert.",
      kicker: "Drittens · Krafttraining wirkt",
      headline: "Eine der effektivsten Interventionen bei chronischem Rückenschmerz.",
      lead: "Nicht nur weil du stärker bist – dein gesamtes System aus Muskeln, Nerven, Bewegungsmustern und Selbstwirksamkeit kalibriert sich neu.",
    },
    {
      type: "statement",
      seg: " Was wir gleich lernen, ist also nicht Sport für Sportler. Es ist therapeutisches Krafttraining – mit Übungen, die im Alltag direkt nutzbar sind, in Intensitäten, die für chronische Schmerzpatienten geeignet sind.",
      text: "Nicht Sport für Sportler – therapeutisches Krafttraining.",
      emphasis: "therapeutisches Krafttraining",
    },
  ],
};

// ── Abschnitt 3 – Übung 1: ÜK-B1 Hip Hinge ───────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Übung 1 – Hip Hinge (ÜK-B1)",
  narration:
    "Erste und wichtigste Übung: Hip Hinge – das Hüftgelenk-Beugen ohne Last. Übungskarte ÜK-B1. Hip Hinge ist die Grundbewegung für alles, was mit Bücken, Heben, Aufrichten zu tun hat. Wenn du diese Bewegung gut beherrschst, hebst du im Alltag mit Hüfte und Beinen – nicht mit dem unteren Rücken. Das ist der Game-Changer. Position: Stehe aufrecht, Füße hüftbreit, Knie leicht weich. Die Hände führen wir gleich an einen Stab – einen Besenstiel, eine Stange –, die du vertikal hinter deinem Rücken hältst, sodass sie deinen Hinterkopf, deinen oberen Rücken und dein Steißbein berührt. Drei Kontaktpunkte mit der Stange. Diese drei Punkte sollen während der ganzen Bewegung verbunden bleiben. Bewegung: Schieb das Becken nach hinten, als würdest du eine Schublade hinter dir mit dem Hintern schließen. Knie bleiben leicht gebeugt, aber sie ändern ihre Position kaum. Der Oberkörper neigt sich nach vorne, aber die Wirbelsäule bleibt gerade – die drei Kontaktpunkte mit dem Stab bleiben verbunden. Du gehst so weit nach vorne, wie du es kannst, ohne die Verbindung zur Stange zu verlieren. Dann zurück in die Aufrichtung. Was du lernst, ist: Die Bewegung kommt aus den Hüften, nicht aus dem Rücken. Der Rücken ist starr wie ein Lineal, die Hüften sind die Scharniere. Reizarme Schiene: Kleine Amplitude, 6 bis 8 Wiederholungen, sehr langsam. Standard: Volle Amplitude – Oberkörper etwa parallel zum Boden, wenn deine Beweglichkeit das zulässt –, 10 bis 12 Wiederholungen. Belastend: Volle Amplitude plus leichtes Gewicht in den Händen – eine Wasserflasche oder kleine Hantel, je 1 bis 2 Kilo. Volle Wiederholungen, langsame Ausführung. Häufiger Fehler: Du beugst dich aus dem Rücken statt aus den Hüften – der Stab verliert Kontakt zu deinem Rücken. Wenn das passiert, ist der Bewegungsumfang zu groß für deine aktuelle Beweglichkeit. Geh kürzer. Lieber kleine, saubere Hinges als große, schiefe. Wichtig: Bevor du jemals einen Gegenstand vom Boden hebst, üb diese Bewegung. Sie ist die Vorlage für jedes spätere Heben.",
  slides: [
    {
      type: "term",
      seg: "Erste und wichtigste Übung: Hip Hinge – das Hüftgelenk-Beugen ohne Last. Übungskarte ÜK-B1.",
      kicker: "Übung 1 · ÜK-B1",
      term: "Hip Hinge",
    },
    {
      type: "statement",
      seg: " Hip Hinge ist die Grundbewegung für alles, was mit Bücken, Heben, Aufrichten zu tun hat. Wenn du diese Bewegung gut beherrschst, hebst du im Alltag mit Hüfte und Beinen – nicht mit dem unteren Rücken. Das ist der Game-Changer.",
      text: "Heben mit Hüfte und Beinen – nicht mit dem unteren Rücken.",
      emphasis: "Game-Changer",
    },
    {
      type: "content",
      seg: " Position: Stehe aufrecht, Füße hüftbreit, Knie leicht weich. Die Hände führen wir gleich an einen Stab – einen Besenstiel, eine Stange –, die du vertikal hinter deinem Rücken hältst, sodass sie deinen Hinterkopf, deinen oberen Rücken und dein Steißbein berührt. Drei Kontaktpunkte mit der Stange. Diese drei Punkte sollen während der ganzen Bewegung verbunden bleiben.",
      kicker: "Ausgangsposition",
      headline: "Ein Stab hinter dem Rücken – drei Kontaktpunkte.",
      lead: "Hinterkopf, oberer Rücken und Steißbein berühren die Stange. Diese drei Punkte bleiben während der ganzen Bewegung verbunden.",
    },
    {
      type: "content",
      seg: " Bewegung: Schieb das Becken nach hinten, als würdest du eine Schublade hinter dir mit dem Hintern schließen. Knie bleiben leicht gebeugt, aber sie ändern ihre Position kaum. Der Oberkörper neigt sich nach vorne, aber die Wirbelsäule bleibt gerade – die drei Kontaktpunkte mit dem Stab bleiben verbunden. Du gehst so weit nach vorne, wie du es kannst, ohne die Verbindung zur Stange zu verlieren. Dann zurück in die Aufrichtung.",
      kicker: "Die Bewegung",
      headline: "Becken nach hinten schieben – wie eine Schublade mit dem Hintern schließen.",
      lead: "Knie kaum verändert, Wirbelsäule gerade, drei Kontaktpunkte verbunden. So weit nach vorne, wie es ohne Verlust der Verbindung geht.",
    },
    {
      type: "statement",
      seg: " Was du lernst, ist: Die Bewegung kommt aus den Hüften, nicht aus dem Rücken. Der Rücken ist starr wie ein Lineal, die Hüften sind die Scharniere.",
      text: "Der Rücken ist starr wie ein Lineal, die Hüften sind die Scharniere.",
      emphasis: "die Hüften sind die Scharniere",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Kleine Amplitude, 6 bis 8 Wiederholungen, sehr langsam. Standard: Volle Amplitude – Oberkörper etwa parallel zum Boden, wenn deine Beweglichkeit das zulässt –, 10 bis 12 Wiederholungen. Belastend: Volle Amplitude plus leichtes Gewicht in den Händen – eine Wasserflasche oder kleine Hantel, je 1 bis 2 Kilo. Volle Wiederholungen, langsame Ausführung.",
      kicker: "ÜK-B1 · Drei Schienen",
      title: "Hip Hinge nach Tagesform",
      items: [
        { label: "Reizarm – kleine Amplitude, sehr langsam · 6–8x" },
        { label: "Standard – volle Amplitude · 10–12x" },
        { label: "Belastend – mit leichtem Gewicht, je 1–2 kg · langsam" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Du beugst dich aus dem Rücken statt aus den Hüften – der Stab verliert Kontakt zu deinem Rücken. Wenn das passiert, ist der Bewegungsumfang zu groß für deine aktuelle Beweglichkeit. Geh kürzer. Lieber kleine, saubere Hinges als große, schiefe.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Aus dem Rücken beugen statt aus den Hüften – der Stab verliert Kontakt.",
      lead: "Dann ist die Amplitude zu groß für deine Beweglichkeit. Geh kürzer – lieber kleine, saubere Hinges als große, schiefe.",
    },
    {
      type: "statement",
      seg: " Wichtig: Bevor du jemals einen Gegenstand vom Boden hebst, üb diese Bewegung. Sie ist die Vorlage für jedes spätere Heben.",
      text: "Diese Bewegung ist die Vorlage für jedes spätere Heben.",
      emphasis: "die Vorlage",
    },
  ],
};

// ── Abschnitt 4 – Übung 2: ÜK-B2 Goblet Squat ────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Übung 2 – Goblet Squat (ÜK-B2)",
  narration:
    "Zweite Übung: Goblet Squat – die Kniebeuge mit Gewicht vor der Brust. Übungskarte ÜK-B2. Goblet Squat ist die anfängerfreundlichste Variante der Kniebeuge. Das Gewicht vor der Brust hilft dir, in einer aufrechten Position zu bleiben – was die Wirbelsäule entlastet. Position: Stehe aufrecht, Füße etwas mehr als hüftbreit, Zehen leicht nach außen rotiert. Halte ein Gewicht – Kettlebell, Hantel, große Wasserflasche – mit beiden Händen vor deiner Brust, nah am Körper. Bewegung: Geh in die Kniebeuge. Knie bewegen sich in dieselbe Richtung wie die Fußspitzen – nicht nach innen klappen. Die Hüfte geht nach hinten und nach unten. Du gehst so tief, wie du es ohne Hohlkreuz-Vermeidung schaffst. Bei den meisten Menschen ist das, wenn die Oberschenkel etwa parallel zum Boden sind. Dann drückst du aktiv durch die Fersen wieder hoch. Wichtig: Brust bleibt aufrecht, Wirbelsäule gerade. Das Gewicht vor der Brust hilft dabei automatisch, weil es nach vorne zieht – du musst aktiv dagegen halten und bleibst aufrecht. Reizarme Schiene: Ohne Gewicht, mit Stuhl hinter dir als Tiefen-Referenz. 6 bis 8 Wiederholungen. Standard: Mit Gewicht zwischen 4 und 8 Kilo, 8 bis 10 Wiederholungen, 3 Durchgänge. Belastend: Mit Gewicht zwischen 10 und 16 Kilo, 6 bis 8 Wiederholungen, 4 Durchgänge mit Pausen. Häufiger Fehler: Knie kippen nach innen, oder die Fersen heben sich vom Boden. Beides sind Hinweise, dass entweder das Gewicht zu hoch ist oder Beweglichkeit fehlt. Reduziere die Tiefe oder das Gewicht und arbeite mit der Zeit nach oben.",
  slides: [
    {
      type: "term",
      seg: "Zweite Übung: Goblet Squat – die Kniebeuge mit Gewicht vor der Brust. Übungskarte ÜK-B2.",
      kicker: "Übung 2 · ÜK-B2",
      term: "Goblet Squat",
    },
    {
      type: "content",
      seg: " Goblet Squat ist die anfängerfreundlichste Variante der Kniebeuge. Das Gewicht vor der Brust hilft dir, in einer aufrechten Position zu bleiben – was die Wirbelsäule entlastet.",
      kicker: "Was sie ist",
      headline: "Die anfängerfreundlichste Variante der Kniebeuge.",
      lead: "Das Gewicht vor der Brust hilft dir, aufrecht zu bleiben – was die Wirbelsäule entlastet.",
    },
    {
      type: "content",
      seg: " Position: Stehe aufrecht, Füße etwas mehr als hüftbreit, Zehen leicht nach außen rotiert. Halte ein Gewicht – Kettlebell, Hantel, große Wasserflasche – mit beiden Händen vor deiner Brust, nah am Körper.",
      kicker: "Ausgangsposition",
      headline: "Füße etwas mehr als hüftbreit, Zehen leicht nach außen.",
      lead: "Ein Gewicht – Kettlebell, Hantel, große Wasserflasche – mit beiden Händen vor der Brust, nah am Körper.",
    },
    {
      type: "content",
      seg: " Bewegung: Geh in die Kniebeuge. Knie bewegen sich in dieselbe Richtung wie die Fußspitzen – nicht nach innen klappen. Die Hüfte geht nach hinten und nach unten. Du gehst so tief, wie du es ohne Hohlkreuz-Vermeidung schaffst. Bei den meisten Menschen ist das, wenn die Oberschenkel etwa parallel zum Boden sind. Dann drückst du aktiv durch die Fersen wieder hoch.",
      kicker: "Die Bewegung",
      headline: "Knie in Richtung der Fußspitzen, Hüfte nach hinten und unten.",
      lead: "So tief, wie es ohne Hohlkreuz geht – meist bis die Oberschenkel parallel zum Boden sind. Dann durch die Fersen wieder hoch.",
    },
    {
      type: "statement",
      seg: " Wichtig: Brust bleibt aufrecht, Wirbelsäule gerade. Das Gewicht vor der Brust hilft dabei automatisch, weil es nach vorne zieht – du musst aktiv dagegen halten und bleibst aufrecht.",
      text: "Brust aufrecht, Wirbelsäule gerade – das Gewicht hilft dir dabei.",
      emphasis: "aufrecht",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Ohne Gewicht, mit Stuhl hinter dir als Tiefen-Referenz. 6 bis 8 Wiederholungen. Standard: Mit Gewicht zwischen 4 und 8 Kilo, 8 bis 10 Wiederholungen, 3 Durchgänge. Belastend: Mit Gewicht zwischen 10 und 16 Kilo, 6 bis 8 Wiederholungen, 4 Durchgänge mit Pausen.",
      kicker: "ÜK-B2 · Drei Schienen",
      title: "Goblet Squat nach Tagesform",
      items: [
        { label: "Reizarm – ohne Gewicht, Stuhl als Referenz · 6–8x" },
        { label: "Standard – 4–8 kg · 8–10x, 3 Durchgänge" },
        { label: "Belastend – 10–16 kg · 6–8x, 4 Durchgänge" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Knie kippen nach innen, oder die Fersen heben sich vom Boden. Beides sind Hinweise, dass entweder das Gewicht zu hoch ist oder Beweglichkeit fehlt. Reduziere die Tiefe oder das Gewicht und arbeite mit der Zeit nach oben.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Knie kippen nach innen oder die Fersen heben sich.",
      lead: "Hinweise auf zu viel Gewicht oder fehlende Beweglichkeit. Tiefe oder Gewicht reduzieren und mit der Zeit nach oben arbeiten.",
    },
  ],
};

// ── Abschnitt 5 – Übung 3: ÜK-B3 Romanian Deadlift ───────────────────────────

const abschnitt5: SourceSection = {
  title: "Übung 3 – Romanian Deadlift (ÜK-B3)",
  narration:
    "Dritte Übung: Romanian Deadlift mit Kettlebell. Übungskarte ÜK-B3. Romanian Deadlift, kurz RDL, ist die geladene Variante des Hip Hinge. Wenn du Hip Hinge sauber beherrschst, ist RDL der nächste Schritt. Position: Stehe aufrecht. Eine Kettlebell vor deinen Füßen auf dem Boden. Beug dich mit Hip Hinge nach vorne, greif den Henkel der Kettlebell mit beiden Händen, richte dich wieder auf. Das ist die Ausgangsposition. Bewegung: Hip Hinge nach vorne – genau wie du es gelernt hast. Die Kettlebell wandert dabei mit den Händen nach unten, nah am Körper, etwa bis zur Mitte des Schienbeins. Wirbelsäule bleibt gerade, Rücken wie ein Lineal, Knie leicht gebeugt aber stabil. Dann durch aktives Hüftstrecken wieder hoch. Wichtig: Die Kettlebell bleibt während der gesamten Bewegung nah am Körper. Wenn sie sich weit von dir entfernt, entsteht ein langer Hebel auf deine Lendenwirbelsäule – das wollen wir vermeiden. Halte sie nahe. Reizarme Schiene: Geringe Last – 4 bis 6 Kilo – kleine Amplitude, 6 Wiederholungen. Standard: 8 bis 12 Kilo, volle Amplitude, 8 bis 10 Wiederholungen, 3 Durchgänge. Belastend: 16 bis 24 Kilo, 6 bis 8 Wiederholungen, 4 Durchgänge. Häufiger Fehler: Wirbelsäulenrundung in der unteren Position – der Rücken wird zum gerundeten Bogen. Das überlastet die Bandscheiben in einer ungünstigen Position. Wenn du das nicht halten kannst, geh kürzer in der Amplitude.",
  slides: [
    {
      type: "term",
      seg: "Dritte Übung: Romanian Deadlift mit Kettlebell. Übungskarte ÜK-B3.",
      kicker: "Übung 3 · ÜK-B3",
      term: "Romanian Deadlift",
    },
    {
      type: "statement",
      seg: " Romanian Deadlift, kurz RDL, ist die geladene Variante des Hip Hinge. Wenn du Hip Hinge sauber beherrschst, ist RDL der nächste Schritt.",
      text: "Der RDL ist die geladene Variante des Hip Hinge.",
      emphasis: "der nächste Schritt",
    },
    {
      type: "content",
      seg: " Position: Stehe aufrecht. Eine Kettlebell vor deinen Füßen auf dem Boden. Beug dich mit Hip Hinge nach vorne, greif den Henkel der Kettlebell mit beiden Händen, richte dich wieder auf. Das ist die Ausgangsposition.",
      kicker: "Ausgangsposition",
      headline: "Kettlebell vor den Füßen, mit Hip Hinge greifen, wieder aufrichten.",
      lead: "Beug dich mit sauberem Hip Hinge nach vorne, greif den Henkel mit beiden Händen – das ist die Ausgangsposition.",
    },
    {
      type: "content",
      seg: " Bewegung: Hip Hinge nach vorne – genau wie du es gelernt hast. Die Kettlebell wandert dabei mit den Händen nach unten, nah am Körper, etwa bis zur Mitte des Schienbeins. Wirbelsäule bleibt gerade, Rücken wie ein Lineal, Knie leicht gebeugt aber stabil. Dann durch aktives Hüftstrecken wieder hoch.",
      kicker: "Die Bewegung",
      headline: "Hip Hinge nach vorne, Kettlebell nah am Körper bis zur Schienbeinmitte.",
      lead: "Wirbelsäule gerade, Rücken wie ein Lineal, Knie leicht gebeugt aber stabil. Dann durch aktives Hüftstrecken wieder hoch.",
    },
    {
      type: "statement",
      seg: " Wichtig: Die Kettlebell bleibt während der gesamten Bewegung nah am Körper. Wenn sie sich weit von dir entfernt, entsteht ein langer Hebel auf deine Lendenwirbelsäule – das wollen wir vermeiden. Halte sie nahe.",
      text: "Die Kettlebell bleibt nah am Körper – sonst ein langer Hebel auf die LWS.",
      emphasis: "nah am Körper",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Geringe Last – 4 bis 6 Kilo – kleine Amplitude, 6 Wiederholungen. Standard: 8 bis 12 Kilo, volle Amplitude, 8 bis 10 Wiederholungen, 3 Durchgänge. Belastend: 16 bis 24 Kilo, 6 bis 8 Wiederholungen, 4 Durchgänge.",
      kicker: "ÜK-B3 · Drei Schienen",
      title: "Romanian Deadlift nach Tagesform",
      items: [
        { label: "Reizarm – 4–6 kg, kleine Amplitude · 6x" },
        { label: "Standard – 8–12 kg, volle Amplitude · 8–10x, 3 Durchgänge" },
        { label: "Belastend – 16–24 kg · 6–8x, 4 Durchgänge" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Wirbelsäulenrundung in der unteren Position – der Rücken wird zum gerundeten Bogen. Das überlastet die Bandscheiben in einer ungünstigen Position. Wenn du das nicht halten kannst, geh kürzer in der Amplitude.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Wirbelsäulenrundung in der unteren Position – der Rücken wird zum Bogen.",
      lead: "Das belastet die Bandscheiben ungünstig. Wenn du die gerade Linie nicht hältst, geh kürzer in der Amplitude.",
    },
  ],
};

// ── Abschnitt 6 – Übung 4: ÜK-B4 Suitcase Carry ──────────────────────────────

const abschnitt6: SourceSection = {
  title: "Übung 4 – Suitcase Carry (ÜK-B4)",
  narration:
    "Vierte Übung: Suitcase Carry – der Koffertrage-Gang. Übungskarte ÜK-B4. Carries sind eine der unterschätztesten Übungen für den Rumpf. Sie sind im Alltag direkt anwendbar – du trägst sowieso Sachen – und sie trainieren Stabilisation unter Last in Bewegung. Position: Stehe aufrecht. Eine Kettlebell oder Hantel in einer Hand. Die andere Hand ist frei. Genau wie ein Koffer. Bewegung: Geh in der aufrechten Haltung durch deinen Raum. Etwa 20 bis 30 Schritte, dann Wechsel zur anderen Hand. Die Aufgabe ist: Beim Gehen nicht zur belasteten Seite kippen. Dein Rumpf hält dich gerade, gegen die einseitige Last. Du wirst spüren, wie die seitliche Bauchmuskulatur und die seitliche Rumpfmuskulatur aktiv arbeiten, um dich gerade zu halten. Das ist genau der Punkt. Reizarme Schiene: Leichtes Gewicht – 4 bis 6 Kilo –, kurze Strecke, 1 bis 2 Durchgänge pro Seite. Standard: 8 bis 12 Kilo, 20 Schritte, 3 Durchgänge pro Seite. Belastend: 16 bis 24 Kilo, 30 Schritte, 4 Durchgänge pro Seite. Häufiger Fehler: Du kippst zur belasteten Seite – dein Oberkörper neigt sich. Das ist das Gegenteil von dem, was wir wollen. Wenn das passiert, wähle eine geringere Last.",
  slides: [
    {
      type: "term",
      seg: "Vierte Übung: Suitcase Carry – der Koffertrage-Gang. Übungskarte ÜK-B4.",
      kicker: "Übung 4 · ÜK-B4",
      term: "Suitcase Carry",
    },
    {
      type: "content",
      seg: " Carries sind eine der unterschätztesten Übungen für den Rumpf. Sie sind im Alltag direkt anwendbar – du trägst sowieso Sachen – und sie trainieren Stabilisation unter Last in Bewegung.",
      kicker: "Die unterschätzte Übung",
      headline: "Carries trainieren Stabilisation unter Last in Bewegung.",
      lead: "Eine der unterschätztesten Rumpf-Übungen – und im Alltag direkt anwendbar, denn du trägst sowieso Sachen.",
    },
    {
      type: "content",
      seg: " Position: Stehe aufrecht. Eine Kettlebell oder Hantel in einer Hand. Die andere Hand ist frei. Genau wie ein Koffer.",
      kicker: "Ausgangsposition",
      headline: "Eine Kettlebell oder Hantel in einer Hand – genau wie ein Koffer.",
      lead: "Aufrecht stehen, die andere Hand bleibt frei.",
    },
    {
      type: "content",
      seg: " Bewegung: Geh in der aufrechten Haltung durch deinen Raum. Etwa 20 bis 30 Schritte, dann Wechsel zur anderen Hand. Die Aufgabe ist: Beim Gehen nicht zur belasteten Seite kippen. Dein Rumpf hält dich gerade, gegen die einseitige Last.",
      kicker: "Die Bewegung",
      headline: "Aufrecht gehen, 20 bis 30 Schritte, dann die Hand wechseln.",
      lead: "Die Aufgabe: beim Gehen nicht zur belasteten Seite kippen. Der Rumpf hält dich gerade gegen die einseitige Last.",
    },
    {
      type: "statement",
      seg: " Du wirst spüren, wie die seitliche Bauchmuskulatur und die seitliche Rumpfmuskulatur aktiv arbeiten, um dich gerade zu halten. Das ist genau der Punkt.",
      text: "Die seitliche Rumpfmuskulatur hält dich gerade – das ist genau der Punkt.",
      emphasis: "genau der Punkt",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Leichtes Gewicht – 4 bis 6 Kilo –, kurze Strecke, 1 bis 2 Durchgänge pro Seite. Standard: 8 bis 12 Kilo, 20 Schritte, 3 Durchgänge pro Seite. Belastend: 16 bis 24 Kilo, 30 Schritte, 4 Durchgänge pro Seite.",
      kicker: "ÜK-B4 · Drei Schienen",
      title: "Suitcase Carry nach Tagesform",
      items: [
        { label: "Reizarm – 4–6 kg, kurze Strecke · 1–2 Durchgänge pro Seite" },
        { label: "Standard – 8–12 kg, 20 Schritte · 3 Durchgänge pro Seite" },
        { label: "Belastend – 16–24 kg, 30 Schritte · 4 Durchgänge pro Seite" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Du kippst zur belasteten Seite – dein Oberkörper neigt sich. Das ist das Gegenteil von dem, was wir wollen. Wenn das passiert, wähle eine geringere Last.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Du kippst zur belasteten Seite – der Oberkörper neigt sich.",
      lead: "Das ist das Gegenteil von dem, was wir wollen. Wenn das passiert, wähle eine geringere Last.",
    },
  ],
};

// ── Abschnitt 7 – Übung 5: ÜK-B5 Farmer's Walk ───────────────────────────────

const abschnitt7: SourceSection = {
  title: "Übung 5 – Farmer's Walk (ÜK-B5)",
  narration:
    "Fünfte Übung: Farmer's Walk – die Bauern-Trage. Übungskarte ÜK-B5. Farmer's Walk ist die symmetrische Variante des Suitcase Carry. Du trägst in beiden Händen Gewicht. Die Belastung verteilt sich gleichmäßig, was den Rumpf weniger seitlich fordert, dafür aber die Grip-Kraft und das gesamte Halten in der Aufrechten stärker. Position: Stehe aufrecht. Eine Hantel oder Kettlebell in jeder Hand. Brust raus, Schultern leicht nach hinten gezogen. Bewegung: Geh aufrecht und ruhig. 30 bis 50 Schritte. Atme normal. Knie und Hüfte bewegen sich natürlich, Schultern bleiben oben gezogen, der Rumpf hält die aufrechte Position. Reizarme Schiene: Leichte Last – je 4 bis 6 Kilo –, 20 Schritte, 2 Durchgänge. Standard: Je 8 bis 12 Kilo, 30 Schritte, 3 Durchgänge. Belastend: Je 16 bis 24 Kilo, 40 bis 50 Schritte, 4 Durchgänge. Wann sinnvoll: Farmer's Walks sind perfekt am Ende einer Trainingseinheit – sie fordern den Rumpf nach vorigen Übungen besonders gut und trainieren das gesamte aufrechte Halten. Außerdem haben sie einen unmittelbaren Alltagstransfer – du trägst genau so deine Einkaufstüten.",
  slides: [
    {
      type: "term",
      seg: "Fünfte Übung: Farmer's Walk – die Bauern-Trage. Übungskarte ÜK-B5.",
      kicker: "Übung 5 · ÜK-B5",
      term: "Farmer's Walk",
    },
    {
      type: "content",
      seg: " Farmer's Walk ist die symmetrische Variante des Suitcase Carry. Du trägst in beiden Händen Gewicht. Die Belastung verteilt sich gleichmäßig, was den Rumpf weniger seitlich fordert, dafür aber die Grip-Kraft und das gesamte Halten in der Aufrechten stärker.",
      kicker: "Was sie ist",
      headline: "Die symmetrische Variante des Suitcase Carry.",
      lead: "Gewicht in beiden Händen – weniger seitliche Forderung, dafür mehr Grip-Kraft und Halten in der Aufrechten.",
    },
    {
      type: "content",
      seg: " Position: Stehe aufrecht. Eine Hantel oder Kettlebell in jeder Hand. Brust raus, Schultern leicht nach hinten gezogen.",
      kicker: "Ausgangsposition",
      headline: "Eine Hantel oder Kettlebell in jeder Hand.",
      lead: "Aufrecht stehen, Brust raus, Schultern leicht nach hinten gezogen.",
    },
    {
      type: "content",
      seg: " Bewegung: Geh aufrecht und ruhig. 30 bis 50 Schritte. Atme normal. Knie und Hüfte bewegen sich natürlich, Schultern bleiben oben gezogen, der Rumpf hält die aufrechte Position.",
      kicker: "Die Bewegung",
      headline: "Aufrecht und ruhig gehen – 30 bis 50 Schritte.",
      lead: "Normal atmen. Knie und Hüfte bewegen sich natürlich, Schultern oben gezogen, der Rumpf hält die aufrechte Position.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Leichte Last – je 4 bis 6 Kilo –, 20 Schritte, 2 Durchgänge. Standard: Je 8 bis 12 Kilo, 30 Schritte, 3 Durchgänge. Belastend: Je 16 bis 24 Kilo, 40 bis 50 Schritte, 4 Durchgänge.",
      kicker: "ÜK-B5 · Drei Schienen",
      title: "Farmer's Walk nach Tagesform",
      items: [
        { label: "Reizarm – je 4–6 kg, 20 Schritte · 2 Durchgänge" },
        { label: "Standard – je 8–12 kg, 30 Schritte · 3 Durchgänge" },
        { label: "Belastend – je 16–24 kg, 40–50 Schritte · 4 Durchgänge" },
      ],
    },
    {
      type: "content",
      seg: " Wann sinnvoll: Farmer's Walks sind perfekt am Ende einer Trainingseinheit – sie fordern den Rumpf nach vorigen Übungen besonders gut und trainieren das gesamte aufrechte Halten. Außerdem haben sie einen unmittelbaren Alltagstransfer – du trägst genau so deine Einkaufstüten.",
      kicker: "Wann sinnvoll",
      headline: "Perfekt am Ende einer Trainingseinheit.",
      lead: "Sie fordern den Rumpf nach vorigen Übungen und trainieren das aufrechte Halten – mit direktem Alltagstransfer zu deinen Einkaufstüten.",
    },
  ],
};

// ── Abschnitt 8 – Übung 6: ÜK-B6 Step-up ─────────────────────────────────────

const abschnitt8: SourceSection = {
  title: "Übung 6 – Step-up (ÜK-B6)",
  narration:
    "Sechste Übung: Step-up. Übungskarte ÜK-B6. Step-ups trainieren einbeinige Belastbarkeit. Im Alltag bewegst du dich oft auf einem Bein – Treppensteigen, aus dem Sitz aufstehen, aus dem Bus steigen. Step-ups sind die kontrollierte Trainingsvariante davon. Position: Vor dir eine stabile Erhöhung – eine kleine Bank, eine Treppenstufe, ein Kasten. Anfangs etwa knöchel- bis schienbeinhoch. Beide Füße auf dem Boden. Bewegung: Setze einen Fuß auf die Erhöhung. Schieb dich aktiv mit dem oberen Bein nach oben – der untere Fuß löst sich vom Boden, du stehst kurz auf der Erhöhung mit beiden Beinen. Dann kontrolliert wieder runter – das untere Bein setzt zuerst auf, das obere folgt. Wichtig: Die Kraft kommt aus dem oberen Bein. Nicht aus dem Schwung des unteren Beins. Du sollst spüren, wie der Oberschenkel und das Gesäß arbeiten. Reizarme Schiene: Niedrige Stufe, ohne Last, 8 Wiederholungen pro Seite. Standard: Höhere Stufe, ohne Last, 10 bis 12 Wiederholungen pro Seite, 3 Durchgänge. Belastend: Mittlere Stufe, mit Gewicht in den Händen – zwei Hanteln oder eine Kettlebell vor der Brust –, 8 bis 10 Wiederholungen pro Seite, 3 bis 4 Durchgänge. Häufiger Fehler: Du benutzt das untere Bein als Sprungbein, drückst dich also vom Boden ab. Das ist Trickserei – das obere Bein lernt dabei nicht. Kontrollier den Schwung.",
  slides: [
    {
      type: "term",
      seg: "Sechste Übung: Step-up. Übungskarte ÜK-B6.",
      kicker: "Übung 6 · ÜK-B6",
      term: "Step-up",
    },
    {
      type: "content",
      seg: " Step-ups trainieren einbeinige Belastbarkeit. Im Alltag bewegst du dich oft auf einem Bein – Treppensteigen, aus dem Sitz aufstehen, aus dem Bus steigen. Step-ups sind die kontrollierte Trainingsvariante davon.",
      kicker: "Was sie ist",
      headline: "Step-ups trainieren einbeinige Belastbarkeit.",
      lead: "Treppensteigen, Aufstehen, aus dem Bus steigen – im Alltag oft auf einem Bein. Step-ups sind die kontrollierte Trainingsvariante.",
    },
    {
      type: "content",
      seg: " Position: Vor dir eine stabile Erhöhung – eine kleine Bank, eine Treppenstufe, ein Kasten. Anfangs etwa knöchel- bis schienbeinhoch. Beide Füße auf dem Boden.",
      kicker: "Ausgangsposition",
      headline: "Eine stabile Erhöhung – Bank, Treppenstufe, Kasten.",
      lead: "Anfangs etwa knöchel- bis schienbeinhoch. Beide Füße auf dem Boden.",
    },
    {
      type: "content",
      seg: " Bewegung: Setze einen Fuß auf die Erhöhung. Schieb dich aktiv mit dem oberen Bein nach oben – der untere Fuß löst sich vom Boden, du stehst kurz auf der Erhöhung mit beiden Beinen. Dann kontrolliert wieder runter – das untere Bein setzt zuerst auf, das obere folgt.",
      kicker: "Die Bewegung",
      headline: "Mit dem oberen Bein aktiv nach oben schieben, kontrolliert wieder runter.",
      lead: "Der untere Fuß löst sich, du stehst kurz mit beiden Beinen oben. Beim Absteigen setzt das untere Bein zuerst auf.",
    },
    {
      type: "statement",
      seg: " Wichtig: Die Kraft kommt aus dem oberen Bein. Nicht aus dem Schwung des unteren Beins. Du sollst spüren, wie der Oberschenkel und das Gesäß arbeiten.",
      text: "Die Kraft kommt aus dem oberen Bein – nicht aus dem Schwung.",
      emphasis: "aus dem oberen Bein",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Niedrige Stufe, ohne Last, 8 Wiederholungen pro Seite. Standard: Höhere Stufe, ohne Last, 10 bis 12 Wiederholungen pro Seite, 3 Durchgänge. Belastend: Mittlere Stufe, mit Gewicht in den Händen – zwei Hanteln oder eine Kettlebell vor der Brust –, 8 bis 10 Wiederholungen pro Seite, 3 bis 4 Durchgänge.",
      kicker: "ÜK-B6 · Drei Schienen",
      title: "Step-up nach Tagesform",
      items: [
        { label: "Reizarm – niedrige Stufe, ohne Last · 8x pro Seite" },
        { label: "Standard – höhere Stufe, ohne Last · 10–12x pro Seite, 3 Durchgänge" },
        { label: "Belastend – mittlere Stufe, mit Gewicht · 8–10x pro Seite, 3–4 Durchgänge" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Du benutzt das untere Bein als Sprungbein, drückst dich also vom Boden ab. Das ist Trickserei – das obere Bein lernt dabei nicht. Kontrollier den Schwung.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Das untere Bein als Sprungbein benutzen.",
      lead: "Das ist Trickserei – das obere Bein lernt dabei nicht. Kontrollier den Schwung.",
    },
  ],
};

// ── Abschnitt 9 – Übung 7: ÜK-B7 Single-leg Glute Bridge ─────────────────────

const abschnitt9: SourceSection = {
  title: "Übung 7 – Single-leg Glute Bridge (ÜK-B7)",
  narration:
    "Siebte Übung: Single-leg Glute Bridge. Übungskarte ÜK-B7. Du kennst Glute Bridge schon aus Lektion 2.3. Die einbeinige Variante macht daraus eine deutlich anspruchsvollere Kraftübung für das Gesäß und die Beckenstabilität. Position: Rücken auf der Matte. Ein Bein angestellt, Fuß flach am Boden. Das andere Bein gerade nach vorne gestreckt – in der Luft, in Verlängerung des Oberschenkels. Bewegung: Press die Ferse des angestellten Beins in den Boden und heb das Becken ab. Das gestreckte Bein bleibt in der Linie mit dem Oberschenkel – es sinkt nicht ab. Halte die obere Position kurz. Dann ablegen. Reizarme Schiene: Geringe Hubhöhe, 5 bis 8 Wiederholungen pro Seite. Standard: Volle Hubhöhe, 10 bis 12 Wiederholungen pro Seite, 3 Durchgänge. Belastend: Volle Hubhöhe mit 3 Sekunden Haltezeit oben, 12 bis 15 Wiederholungen pro Seite, 4 Durchgänge. Häufiger Fehler: Das Becken kippt zur Seite des freien Beins – du verlierst die gerade Linie und das Becken sinkt einseitig ab. Wenn das passiert, ist das Standbein nicht stark genug oder die Hüftstabilität fehlt. Geh zurück zur beidbeinigen Brücke und arbeite an Symmetrie.",
  slides: [
    {
      type: "term",
      seg: "Siebte Übung: Single-leg Glute Bridge. Übungskarte ÜK-B7.",
      kicker: "Übung 7 · ÜK-B7",
      term: "Single-leg Glute Bridge",
    },
    {
      type: "content",
      seg: " Du kennst Glute Bridge schon aus Lektion 2.3. Die einbeinige Variante macht daraus eine deutlich anspruchsvollere Kraftübung für das Gesäß und die Beckenstabilität.",
      kicker: "Aus 2.3 bekannt",
      headline: "Die einbeinige Variante der Glute Bridge.",
      lead: "Deutlich anspruchsvoller – eine Kraftübung für das Gesäß und die Beckenstabilität.",
    },
    {
      type: "content",
      seg: " Position: Rücken auf der Matte. Ein Bein angestellt, Fuß flach am Boden. Das andere Bein gerade nach vorne gestreckt – in der Luft, in Verlängerung des Oberschenkels.",
      kicker: "Ausgangsposition",
      headline: "Ein Bein angestellt, das andere gerade nach vorne gestreckt.",
      lead: "Rückenlage, Fuß des Standbeins flach am Boden. Das gestreckte Bein liegt in der Luft, in Verlängerung des Oberschenkels.",
    },
    {
      type: "content",
      seg: " Bewegung: Press die Ferse des angestellten Beins in den Boden und heb das Becken ab. Das gestreckte Bein bleibt in der Linie mit dem Oberschenkel – es sinkt nicht ab. Halte die obere Position kurz. Dann ablegen.",
      kicker: "Die Bewegung",
      headline: "Ferse des Standbeins in den Boden pressen, Becken abheben.",
      lead: "Das gestreckte Bein bleibt in der Linie mit dem Oberschenkel – es sinkt nicht ab. Obere Position kurz halten, dann ablegen.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Geringe Hubhöhe, 5 bis 8 Wiederholungen pro Seite. Standard: Volle Hubhöhe, 10 bis 12 Wiederholungen pro Seite, 3 Durchgänge. Belastend: Volle Hubhöhe mit 3 Sekunden Haltezeit oben, 12 bis 15 Wiederholungen pro Seite, 4 Durchgänge.",
      kicker: "ÜK-B7 · Drei Schienen",
      title: "Single-leg Glute Bridge nach Tagesform",
      items: [
        { label: "Reizarm – geringe Hubhöhe · 5–8x pro Seite" },
        { label: "Standard – volle Hubhöhe · 10–12x pro Seite, 3 Durchgänge" },
        { label: "Belastend – 3 s Haltezeit oben · 12–15x pro Seite, 4 Durchgänge" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Das Becken kippt zur Seite des freien Beins – du verlierst die gerade Linie und das Becken sinkt einseitig ab. Wenn das passiert, ist das Standbein nicht stark genug oder die Hüftstabilität fehlt. Geh zurück zur beidbeinigen Brücke und arbeite an Symmetrie.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Das Becken kippt zur Seite des freien Beins und sinkt einseitig ab.",
      lead: "Dann ist das Standbein nicht stark genug oder die Hüftstabilität fehlt. Zurück zur beidbeinigen Brücke und an Symmetrie arbeiten.",
    },
  ],
};

// ── Abschnitt 10 – Progression und Beispielplan ──────────────────────────────

const abschnitt10: SourceSection = {
  title: "Progression & Beispielplan",
  narration:
    "Wie kombinierst du Belastungstoleranz-Übungen sinnvoll? Mein Vorschlag: ein bis zwei Krafttage pro Woche. An jedem Krafttag wählst du drei bis vier Übungen aus den sieben. Eine Einheit dauert 30 bis 40 Minuten inklusive Aufwärmen. Eine empfehlenswerte Anfangs-Sequenz: Aufwärmen: Eine Mobilisationssequenz aus Lektion 2.2 – etwa Cat-Cow, Hüftbeuger-Mobilisation, Becken-Kreisen. Hauptteil: Hip Hinge ohne Last – 10 Wiederholungen, 2 Durchgänge. Goblet Squat. Romanian Deadlift. Glute Bridge oder Step-up. Finisher: Suitcase Carry oder Farmer's Walk. Wie progressierst du? Anfangs gehst du an die Wiederholungszahlen heran. Du startest mit der niedrigeren Zahl, übst zwei Wochen, dann gehst du an die obere Grenze. Erst wenn du die obere Wiederholungszahl mit guter Technik schaffst, gehst du zur nächsten Last-Stufe. Wichtig: Krafttraining hat eine ganz andere Erholungs-Charakteristik als Mobilisation. Zwischen zwei Krafttagen sollten mindestens 48 Stunden Pause sein. An Pausentagen kannst du Mobilisation oder Spaziergänge einbauen.",
  slides: [
    {
      type: "statement",
      seg: "Wie kombinierst du Belastungstoleranz-Übungen sinnvoll?",
      text: "Wie kombinierst du das sinnvoll?",
      emphasis: "sinnvoll",
    },
    {
      type: "content",
      seg: " Mein Vorschlag: ein bis zwei Krafttage pro Woche. An jedem Krafttag wählst du drei bis vier Übungen aus den sieben. Eine Einheit dauert 30 bis 40 Minuten inklusive Aufwärmen.",
      kicker: "Ein bis zwei Krafttage",
      headline: "Ein bis zwei Krafttage pro Woche, je drei bis vier Übungen.",
      lead: "An jedem Krafttag wählst du drei bis vier der sieben Übungen. Eine Einheit dauert 30 bis 40 Minuten inklusive Aufwärmen.",
    },
    {
      type: "reveal-list",
      seg: " Eine empfehlenswerte Anfangs-Sequenz: Aufwärmen: Eine Mobilisationssequenz aus Lektion 2.2 – etwa Cat-Cow, Hüftbeuger-Mobilisation, Becken-Kreisen. Hauptteil: Hip Hinge ohne Last – 10 Wiederholungen, 2 Durchgänge. Goblet Squat. Romanian Deadlift. Glute Bridge oder Step-up. Finisher: Suitcase Carry oder Farmer's Walk.",
      kicker: "Anfangs-Sequenz · 30–40 Min",
      title: "Eine empfehlenswerte Kraft-Einheit",
      items: [
        { label: "Aufwärmen – Mobilisationssequenz aus 2.2 (Cat-Cow, Hüftbeuger, Becken-Kreisen)" },
        { label: "Hauptteil – Hip Hinge, Goblet Squat, Romanian Deadlift, Glute Bridge oder Step-up" },
        { label: "Finisher – Suitcase Carry oder Farmer's Walk" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Wie progressierst du? Anfangs gehst du an die Wiederholungszahlen heran. Du startest mit der niedrigeren Zahl, übst zwei Wochen, dann gehst du an die obere Grenze. Erst wenn du die obere Wiederholungszahl mit guter Technik schaffst, gehst du zur nächsten Last-Stufe.",
      kicker: "Die Progressions-Treppe",
      title: "So steigerst du – in dieser Reihenfolge",
      items: [
        { label: "Wiederholungen erhöhen – von der unteren zur oberen Zahl" },
        { label: "Last erhöhen – erst wenn die obere Zahl mit guter Technik sitzt" },
        { label: "Nächste Variante – wenn auch die Last sicher beherrscht wird" },
      ],
    },
    {
      type: "statement",
      seg: " Wichtig: Krafttraining hat eine ganz andere Erholungs-Charakteristik als Mobilisation. Zwischen zwei Krafttagen sollten mindestens 48 Stunden Pause sein. An Pausentagen kannst du Mobilisation oder Spaziergänge einbauen.",
      text: "Zwischen zwei Krafttagen mindestens 48 Stunden Pause.",
      emphasis: "48 Stunden Pause",
    },
  ],
};

// ── Abschnitt 11 – Workbook und Übergang ─────────────────────────────────────

const abschnitt11: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 2.4: Mein Krafttraining-Plan. Eine Vorlage, in die du deine Wochenstruktur einträgst – welche Übungen, welche Tage, welche Schienen. In der nächsten Lektion – 2.5 – kommen Atemmechanik und Beckenboden-Verbindung. Klingt erst einmal soft, ist aber für die Rumpfstabilität extrem wichtig. Außerdem ist es eine Lektion, die du buchstäblich überall machen kannst – während du diese Lektion hörst zum Beispiel. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 2.4: Mein Krafttraining-Plan. Eine Vorlage, in die du deine Wochenstruktur einträgst – welche Übungen, welche Tage, welche Schienen.",
      kicker: "Workbook · Übung 2.4",
      headline: "Ein Workbook-Stopp: Mein Krafttraining-Plan.",
      lead: "Eine Vorlage für deine Wochenstruktur – welche Übungen, welche Tage, welche Schienen.",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 2.5 – kommen Atemmechanik und Beckenboden-Verbindung. Klingt erst einmal soft, ist aber für die Rumpfstabilität extrem wichtig. Außerdem ist es eine Lektion, die du buchstäblich überall machen kannst – während du diese Lektion hörst zum Beispiel.",
      kicker: "Als Nächstes · Lektion 2.5",
      headline: "Atemmechanik und Beckenboden – soft, aber extrem wichtig.",
      lead: "Zentral für die Rumpfstabilität. Und eine Lektion, die du buchstäblich überall machen kannst.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 2.5",
      nextTitle: "Atemmechanik & Beckenboden-Verbindung",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "2.4",
  title: "Modernes Rumpftraining Teil 2: Belastungstoleranz",
  subtitle: "Modul 2 – Kurativ handeln · Sieben Kraftübungen & Last als Therapie",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
    abschnitt7,
    abschnitt8,
    abschnitt9,
    abschnitt10,
    abschnitt11,
  ],
};
