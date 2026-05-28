/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 1.5
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/1.5.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 1.5`). Niemals lessons/1.5.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Aufbau identisch zu 1.1–1.4 (siehe sources/1.4.source.ts für die Konvention):
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * 3.-PERSON-REGEL: 1.5 (Crown Jewel von Modul 1, Pain Neuroscience Education)
 * enthält ausschließlich generische Guide-Ich-/Wir-/Du-Form (der Sprecher erklärt,
 * „lass mich konkret machen", „wir fassen zusammen"). Keine Ersteller-/Praxis-/
 * Credential-Aussagen → keine Umschreibung auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD wird beibehalten. Schmerz wird konsequent als Bewertung/
 *   Output beschrieben, nicht als Diagnose. Keine Heilversprechen — Aussagen wie
 *   „lässt sich korrigieren" / „kann besser werden" bleiben offen und prozesshaft,
 *   exakt wie in der MD.
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

// ── Abschnitt 1 – Eröffnung ─────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Willkommen zur wichtigsten Lektion dieses Moduls. Das mag groß klingen, aber ich meine es so: Wenn du dir nur eine Lektion aus Modul 1 wirklich merkst, dann diese. Was du in den letzten vier Lektionen gelernt hast – die Anatomie deiner Wirbelsäule, die Mechanismen der Chronifizierung, das MRT-Paradox – das alles war Vorarbeit. In dieser Lektion fügen wir diese Bausteine zu einem konsistenten Bild zusammen. Einem Bild, das dich durch alle folgenden Module trägt. Das Bild, das du heute lernst, ist eine Metapher. Eine vereinfachte, aber wissenschaftlich saubere Darstellung dessen, was Schmerzforschende seit etwa zwei Jahrzehnten immer klarer beschreiben. Die Metapher heißt: Dein Schmerzsystem ist eine Alarmanlage. Und wie alle guten Metaphern macht sie eine komplizierte Realität greifbar.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 1 – Verstehen",
      lessonLabel: "Lektion 1.5 – Dein Schmerzsystem als Alarmanlage",
    },
    {
      type: "statement",
      seg: "Willkommen zur wichtigsten Lektion dieses Moduls. Das mag groß klingen, aber ich meine es so: Wenn du dir nur eine Lektion aus Modul 1 wirklich merkst, dann diese.",
      text: "Wenn du dir nur eine Lektion merkst – dann diese.",
      emphasis: "eine",
    },
    {
      type: "content",
      seg: " Was du in den letzten vier Lektionen gelernt hast – die Anatomie deiner Wirbelsäule, die Mechanismen der Chronifizierung, das MRT-Paradox – das alles war Vorarbeit. In dieser Lektion fügen wir diese Bausteine zu einem konsistenten Bild zusammen. Einem Bild, das dich durch alle folgenden Module trägt.",
      kicker: "Alles fließt zusammen",
      headline: "Vier Lektionen Vorarbeit – jetzt fügen wir die Bausteine zusammen.",
      lead: "Zu einem konsistenten Bild, das dich durch alle folgenden Module trägt.",
    },
    {
      type: "content",
      seg: " Das Bild, das du heute lernst, ist eine Metapher. Eine vereinfachte, aber wissenschaftlich saubere Darstellung dessen, was Schmerzforschende seit etwa zwei Jahrzehnten immer klarer beschreiben.",
      kicker: "Eine Metapher",
      headline: "Vereinfacht – aber wissenschaftlich sauber.",
      lead: "Was Schmerzforschende seit etwa zwei Jahrzehnten immer klarer beschreiben.",
    },
    {
      type: "term",
      seg: " Die Metapher heißt: Dein Schmerzsystem ist eine Alarmanlage. Und wie alle guten Metaphern macht sie eine komplizierte Realität greifbar.",
      kicker: "Die Metapher dieser Lektion",
      term: "Dein Schmerzsystem ist eine Alarmanlage.",
    },
  ],
};

// ── Abschnitt 2 – Schmerz als Output, nicht Input ────────────────────────────

const abschnitt2: SourceSection = {
  title: "Schmerz als Output, nicht Input",
  narration:
    "Beginnen wir mit dem fundamentalsten Punkt – einem, den viele Menschen nie hören und der ihre ganze Vorstellung von Schmerz auf den Kopf stellt. Die meisten Menschen denken über Schmerz so: Im Körper passiert etwas Schädigendes. Das wird gemessen. Die Information geht über die Nerven zum Gehirn. Das Gehirn registriert: Aua, da ist Schaden. Ich spüre Schmerz. Schmerz wird also als eine Art Messung verstanden – als direktes Signal aus dem Körper. Diese Vorstellung ist nicht ganz falsch – aber sie ist sehr unvollständig. Die moderne Schmerzforschung sagt etwas anderes: Schmerz ist kein Input. Schmerz ist ein Output. Was heißt das? Es heißt: Schmerz ist keine direkte Übertragung einer Schädigung. Schmerz ist eine Bewertung deines Gehirns. Dein Gehirn sammelt Informationen aus dem ganzen Körper – aus Geweben, aus Bewegungsmustern, aus Hormonsystemen, aus emotionalen Zuständen – und macht daraus eine Einschätzung: Wie bedroht ist mein Körper gerade? Und je nachdem, wie diese Einschätzung ausfällt, produziert es Schmerz – oder nicht. Das klingt vielleicht erstmal seltsam. Aber denk an Situationen, die du selbst kennst: Soldaten im Kampfeinsatz, die schwere Verwundungen erleiden – und in dem Moment keinen oder wenig Schmerz spüren. Das Gehirn hat in der akuten Bedrohung kein Schmerz als nützlichste Reaktion gewählt – Schmerz hätte die Flucht gestoppt, das wäre tödlich gewesen. Das Gewebe war stark verletzt – der Schmerz-Output war abgeschaltet. Oder umgekehrt: Du hast eine schmerzhafte Episode, du gehst zum Hausarzt, der sagt alles in Ordnung, kein ernsthaftes Problem. Sofort fühlt sich der Schmerz weniger schlimm an. Das Gewebe hat sich nicht verändert – die Bewertung Bedrohung hat sich verändert, und damit der Schmerz-Output. Dasselbe Prinzip gilt in beide Richtungen: Eine Bandscheibe kann leicht vorgewölbt sein und gar nicht schmerzen, weil das Gehirn keine Bedrohung sieht. Und ein völlig intakter Rücken kann massiv schmerzen, weil das Gehirn aus anderen Gründen in einem Bedrohungs-Modus ist. Diese Verschiebung – von Schmerz als Messung zu Schmerz als Bewertung – ist die intellektuell anspruchsvollste, aber auch heilsamste Erkenntnis der modernen Schmerzforschung.",
  slides: [
    {
      type: "content",
      seg: "Beginnen wir mit dem fundamentalsten Punkt – einem, den viele Menschen nie hören und der ihre ganze Vorstellung von Schmerz auf den Kopf stellt.",
      kicker: "Der fundamentalste Punkt",
      headline: "Etwas, das viele nie hören – und das alles auf den Kopf stellt.",
    },
    {
      type: "reveal-list",
      seg: " Die meisten Menschen denken über Schmerz so: Im Körper passiert etwas Schädigendes. Das wird gemessen. Die Information geht über die Nerven zum Gehirn. Das Gehirn registriert: Aua, da ist Schaden. Ich spüre Schmerz. Schmerz wird also als eine Art Messung verstanden – als direktes Signal aus dem Körper.",
      kicker: "Das alte Modell",
      title: "Schmerz als Messung",
      items: [
        { label: "Im Körper passiert etwas Schädigendes" },
        { label: "Die Nerven melden es ans Gehirn" },
        { label: "Das Gehirn registriert: da ist Schaden" },
        { label: "Schmerz = direktes Signal aus dem Körper" },
      ],
    },
    {
      type: "content",
      seg: " Diese Vorstellung ist nicht ganz falsch – aber sie ist sehr unvollständig. Die moderne Schmerzforschung sagt etwas anderes:",
      headline: "Nicht ganz falsch – aber sehr unvollständig.",
      lead: "Die moderne Schmerzforschung sagt etwas anderes.",
    },
    {
      type: "statement",
      seg: " Schmerz ist kein Input. Schmerz ist ein Output.",
      text: "Schmerz ist kein Input. Schmerz ist ein Output.",
      emphasis: "Output",
    },
    {
      type: "content",
      seg: " Was heißt das? Es heißt: Schmerz ist keine direkte Übertragung einer Schädigung. Schmerz ist eine Bewertung deines Gehirns. Dein Gehirn sammelt Informationen aus dem ganzen Körper – aus Geweben, aus Bewegungsmustern, aus Hormonsystemen, aus emotionalen Zuständen – und macht daraus eine Einschätzung: Wie bedroht ist mein Körper gerade? Und je nachdem, wie diese Einschätzung ausfällt, produziert es Schmerz – oder nicht.",
      kicker: "Das neue Modell",
      headline: "Schmerz ist eine Bewertung deines Gehirns.",
      lead: "Es sammelt Informationen aus dem ganzen Körper und fragt: Wie bedroht bin ich gerade?",
    },
    {
      type: "content",
      seg: " Das klingt vielleicht erstmal seltsam. Aber denk an Situationen, die du selbst kennst:",
      headline: "Klingt seltsam? Denk an Situationen, die du selbst kennst.",
    },
    {
      type: "content",
      seg: " Soldaten im Kampfeinsatz, die schwere Verwundungen erleiden – und in dem Moment keinen oder wenig Schmerz spüren. Das Gehirn hat in der akuten Bedrohung kein Schmerz als nützlichste Reaktion gewählt – Schmerz hätte die Flucht gestoppt, das wäre tödlich gewesen. Das Gewebe war stark verletzt – der Schmerz-Output war abgeschaltet.",
      kicker: "Schaden ohne Schmerz",
      headline: "Schwer verwundet im Einsatz – und im Moment kaum Schmerz.",
      lead: "Das Gewebe war stark verletzt – der Schmerz-Output war abgeschaltet.",
    },
    {
      type: "content",
      seg: " Oder umgekehrt: Du hast eine schmerzhafte Episode, du gehst zum Hausarzt, der sagt alles in Ordnung, kein ernsthaftes Problem. Sofort fühlt sich der Schmerz weniger schlimm an. Das Gewebe hat sich nicht verändert – die Bewertung Bedrohung hat sich verändert, und damit der Schmerz-Output.",
      kicker: "Schmerz, der nachlässt",
      headline: "„Alles in Ordnung“ – und sofort fühlt es sich weniger schlimm an.",
      lead: "Das Gewebe ist gleich geblieben – nur die Bewertung Bedrohung hat sich verändert.",
    },
    {
      type: "reveal-list",
      seg: " Dasselbe Prinzip gilt in beide Richtungen: Eine Bandscheibe kann leicht vorgewölbt sein und gar nicht schmerzen, weil das Gehirn keine Bedrohung sieht. Und ein völlig intakter Rücken kann massiv schmerzen, weil das Gehirn aus anderen Gründen in einem Bedrohungs-Modus ist.",
      kicker: "In beide Richtungen",
      title: "Befund und Schmerz entkoppeln sich",
      items: [
        { label: "Vorgewölbte Bandscheibe, kein Schmerz – das Gehirn sieht keine Bedrohung" },
        { label: "Völlig intakter Rücken, massiver Schmerz – das Gehirn ist im Bedrohungs-Modus" },
      ],
    },
    {
      type: "statement",
      seg: " Diese Verschiebung – von Schmerz als Messung zu Schmerz als Bewertung – ist die intellektuell anspruchsvollste, aber auch heilsamste Erkenntnis der modernen Schmerzforschung.",
      text: "Von Schmerz als Messung zu Schmerz als Bewertung.",
      emphasis: "Bewertung",
    },
  ],
};

// ── Abschnitt 3 – Die Alarmanlage-Metapher ───────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Die Alarmanlage-Metapher",
  narration:
    "Jetzt zur Metapher selbst, die uns durch den Rest dieser Masterclass begleiten wird. Stell dir dein Schmerzsystem vor wie eine Alarmanlage in einem Haus. Eine moderne, hochwertige Alarmanlage. Sie hat Sensoren überall – an Fenstern, an Türen, in Räumen. Sie hat eine zentrale Steuerung, die alle Sensorsignale zusammenführt. Und sie hat einen Auslöser – einen lauten Alarm, der losgeht, wenn die Steuerung entscheidet, dass eine Bedrohung vorliegt. In dieser Metapher sind: Die Sensoren deine Nervenenden im Gewebe. Sie melden, wenn etwas am Gewebe passiert – Druck, Dehnung, Temperatur, Gewebereizung. Die zentrale Steuerung dein Gehirn – genauer, ein verteiltes Netzwerk aus Hirnregionen, die mit Schmerzverarbeitung beschäftigt sind. Manche nennen das Neuromatrix. Der Alarm ist der Schmerz selbst – das, was du tatsächlich spürst. Was ist die Aufgabe der Alarmanlage? Schutz. Nicht Schmerz erzeugen. Schmerz ist nur das Mittel zum Zweck. Das Ziel ist: dich vor potenziellen Schäden zu schützen. Schmerz ist sozusagen die Sprache, in der dein Schutzsystem mit dir kommuniziert. Eine sehr unangenehme Sprache, zugegeben – aber eine, die schwer zu ignorieren ist. Eine gut funktionierende Alarmanlage hat zwei wichtige Eigenschaften: Erstens: Sie alarmiert, wenn wirklich Gefahr ist. Wenn jemand einbricht, soll der Alarm losgehen. Wenn dein Körper wirklich gefährdet ist, soll Schmerz dich warnen. Zweitens: Sie alarmiert nicht, wenn keine Gefahr ist. Wenn der Wind ans Fenster bläst, soll die Anlage nicht losgehen. Wenn dein Körper normal funktioniert, soll Schmerz nicht permanent da sein. Das ist die Aufgabe. Und so weit funktioniert das bei den meisten Menschen die meiste Zeit auch hervorragend.",
  slides: [
    {
      type: "word",
      seg: "Jetzt zur Metapher selbst, die uns durch den Rest dieser Masterclass begleiten wird.",
      word: "Die Alarmanlage.",
    },
    {
      type: "content",
      seg: " Stell dir dein Schmerzsystem vor wie eine Alarmanlage in einem Haus. Eine moderne, hochwertige Alarmanlage. Sie hat Sensoren überall – an Fenstern, an Türen, in Räumen. Sie hat eine zentrale Steuerung, die alle Sensorsignale zusammenführt. Und sie hat einen Auslöser – einen lauten Alarm, der losgeht, wenn die Steuerung entscheidet, dass eine Bedrohung vorliegt.",
      kicker: "Stell es dir vor",
      headline: "Eine moderne Alarmanlage in einem Haus.",
      lead: "Sensoren überall, eine zentrale Steuerung, und ein Alarm, der losgeht, wenn die Steuerung eine Bedrohung sieht.",
    },
    {
      type: "reveal-list",
      seg: " In dieser Metapher sind: Die Sensoren deine Nervenenden im Gewebe. Sie melden, wenn etwas am Gewebe passiert – Druck, Dehnung, Temperatur, Gewebereizung. Die zentrale Steuerung dein Gehirn – genauer, ein verteiltes Netzwerk aus Hirnregionen, die mit Schmerzverarbeitung beschäftigt sind. Manche nennen das Neuromatrix. Der Alarm ist der Schmerz selbst – das, was du tatsächlich spürst.",
      kicker: "Die drei Komponenten",
      title: "Wer ist was in der Metapher",
      items: [
        { label: "Sensoren = deine Nervenenden im Gewebe (Druck, Dehnung, Temperatur, Reizung)" },
        { label: "Steuerung = dein Gehirn, ein Netzwerk aus Hirnregionen (Neuromatrix)" },
        { label: "Alarm = der Schmerz selbst, das, was du tatsächlich spürst" },
      ],
    },
    {
      type: "statement",
      seg: " Was ist die Aufgabe der Alarmanlage? Schutz. Nicht Schmerz erzeugen. Schmerz ist nur das Mittel zum Zweck. Das Ziel ist: dich vor potenziellen Schäden zu schützen.",
      text: "Die Aufgabe der Alarmanlage ist Schutz, nicht Schmerz.",
      emphasis: "Schutz",
    },
    {
      type: "content",
      seg: " Schmerz ist sozusagen die Sprache, in der dein Schutzsystem mit dir kommuniziert. Eine sehr unangenehme Sprache, zugegeben – aber eine, die schwer zu ignorieren ist.",
      kicker: "Eine Sprache",
      headline: "Schmerz ist die Sprache, in der dein Schutzsystem mit dir spricht.",
      lead: "Eine sehr unangenehme – aber eine, die schwer zu ignorieren ist.",
    },
    {
      type: "content",
      seg: " Eine gut funktionierende Alarmanlage hat zwei wichtige Eigenschaften:",
      headline: "Eine gute Alarmanlage hat zwei Eigenschaften.",
    },
    {
      type: "content",
      seg: " Erstens: Sie alarmiert, wenn wirklich Gefahr ist. Wenn jemand einbricht, soll der Alarm losgehen. Wenn dein Körper wirklich gefährdet ist, soll Schmerz dich warnen.",
      kicker: "Eigenschaft 1",
      headline: "Sie alarmiert, wenn wirklich Gefahr ist.",
      lead: "Bricht jemand ein, geht der Alarm los. Ist dein Körper gefährdet, warnt dich Schmerz.",
    },
    {
      type: "content",
      seg: " Zweitens: Sie alarmiert nicht, wenn keine Gefahr ist. Wenn der Wind ans Fenster bläst, soll die Anlage nicht losgehen. Wenn dein Körper normal funktioniert, soll Schmerz nicht permanent da sein.",
      kicker: "Eigenschaft 2",
      headline: "Sie alarmiert nicht, wenn keine Gefahr ist.",
      lead: "Beim Wind am Fenster bleibt sie still. Funktioniert dein Körper normal, ist Schmerz nicht permanent da.",
    },
    {
      type: "statement",
      seg: " Das ist die Aufgabe. Und so weit funktioniert das bei den meisten Menschen die meiste Zeit auch hervorragend.",
      text: "Bei den meisten Menschen funktioniert das die meiste Zeit hervorragend.",
    },
  ],
};

// ── Abschnitt 4 – Die Sensitivitäts-Einstellung ──────────────────────────────

const abschnitt4: SourceSection = {
  title: "Die Sensitivitäts-Einstellung",
  narration:
    "Jetzt zum entscheidenden Punkt – dem, der erklärt, was bei chronischem Schmerz passiert. Wie jede gute Alarmanlage hat auch dein Schmerzsystem eine Sensitivitätseinstellung. Stell dir einen Regler vor, der zwischen sehr empfindlich und wenig empfindlich hin und her geschoben werden kann. Wenn der Regler weit oben steht – also auf sehr empfindlich – dann reicht schon der Wind am Fenster, um die Alarmanlage auszulösen. Das System ist überwachsam. Es alarmiert vorsichtshalber bei jedem kleinen Reiz, weil es lieber zehnmal zu viel als einmal zu wenig alarmieren will. Wenn der Regler weit unten steht – also auf wenig empfindlich – dann braucht es schon einen echten Einbruch, damit die Anlage losgeht. Das System ist gelassen. Es lässt sich nicht von kleinen Reizen aufschrecken. In einem gesunden, normalen Zustand ist diese Sensitivitätseinstellung mittel. Sie passt sich situativ an: Wenn du gerade aus einer Verletzung kommst, ist sie kurzzeitig nach oben justiert – das ist sinnvoll, damit du das verletzte Gewebe schonst. Sobald die Heilung abgeschlossen ist, wandert sie wieder zurück. Bei chronischem Schmerz passiert etwas anderes. Die Sensitivitätseinstellung wandert nach oben und bleibt dort. Das System bleibt überwachsam – auch nachdem die ursprüngliche Heilung längst abgeschlossen ist. Bewegungen, die früher unauffällig waren, werden jetzt als bedrohlich gemeldet. Berührungen, Belastungen, sogar normale Tätigkeiten lösen Schmerz aus. Das ist das, was Forschende zentrale Sensibilisierung nennen – und was wir in Lektion 1.3 schon kurz besprochen haben. In der Alarmanlagen-Metapher ist es einfach: Der Empfindlichkeitsregler hängt fest auf zu sensibel. Wichtig zu verstehen: Das ist nicht deine Schuld. Es ist auch kein Versagen deines Körpers. Es ist eine Anpassungsreaktion eines Schutzsystems, die in dem Moment, als sie eingestellt wurde, Sinn machte – aber jetzt nicht mehr nötig ist und im Gegenteil schadet.",
  slides: [
    {
      type: "content",
      seg: "Jetzt zum entscheidenden Punkt – dem, der erklärt, was bei chronischem Schmerz passiert.",
      kicker: "Der entscheidende Punkt",
      headline: "Was bei chronischem Schmerz passiert.",
    },
    {
      type: "content",
      seg: " Wie jede gute Alarmanlage hat auch dein Schmerzsystem eine Sensitivitätseinstellung. Stell dir einen Regler vor, der zwischen sehr empfindlich und wenig empfindlich hin und her geschoben werden kann.",
      kicker: "Der Empfindlichkeits-Regler",
      headline: "Auch dein Schmerzsystem hat eine Sensitivitäts-Einstellung.",
      lead: "Ein Regler zwischen sehr empfindlich und wenig empfindlich.",
    },
    {
      type: "content",
      seg: " Wenn der Regler weit oben steht – also auf sehr empfindlich – dann reicht schon der Wind am Fenster, um die Alarmanlage auszulösen. Das System ist überwachsam. Es alarmiert vorsichtshalber bei jedem kleinen Reiz, weil es lieber zehnmal zu viel als einmal zu wenig alarmieren will.",
      kicker: "Regler oben · sehr empfindlich",
      headline: "Schon der Wind am Fenster löst aus.",
      lead: "Das System ist überwachsam – lieber zehnmal zu viel als einmal zu wenig.",
    },
    {
      type: "content",
      seg: " Wenn der Regler weit unten steht – also auf wenig empfindlich – dann braucht es schon einen echten Einbruch, damit die Anlage losgeht. Das System ist gelassen. Es lässt sich nicht von kleinen Reizen aufschrecken.",
      kicker: "Regler unten · wenig empfindlich",
      headline: "Erst ein echter Einbruch löst aus.",
      lead: "Das System ist gelassen – kleine Reize schrecken es nicht auf.",
    },
    {
      type: "content",
      seg: " In einem gesunden, normalen Zustand ist diese Sensitivitätseinstellung mittel. Sie passt sich situativ an: Wenn du gerade aus einer Verletzung kommst, ist sie kurzzeitig nach oben justiert – das ist sinnvoll, damit du das verletzte Gewebe schonst. Sobald die Heilung abgeschlossen ist, wandert sie wieder zurück.",
      kicker: "Der gesunde Normalfall",
      headline: "Normalerweise steht der Regler mittig – und passt sich situativ an.",
      lead: "Nach einer Verletzung kurz nach oben (sinnvoll), nach der Heilung wieder zurück.",
    },
    {
      type: "statement",
      seg: " Bei chronischem Schmerz passiert etwas anderes. Die Sensitivitätseinstellung wandert nach oben und bleibt dort.",
      text: "Bei chronischem Schmerz wandert der Regler nach oben – und bleibt dort.",
      emphasis: "bleibt",
    },
    {
      type: "content",
      seg: " Das System bleibt überwachsam – auch nachdem die ursprüngliche Heilung längst abgeschlossen ist. Bewegungen, die früher unauffällig waren, werden jetzt als bedrohlich gemeldet. Berührungen, Belastungen, sogar normale Tätigkeiten lösen Schmerz aus.",
      headline: "Das System bleibt überwachsam – obwohl die Heilung längst abgeschlossen ist.",
      lead: "Bewegungen, Berührungen, normale Tätigkeiten – früher unauffällig, jetzt als bedrohlich gemeldet.",
    },
    {
      type: "content",
      seg: " Das ist das, was Forschende zentrale Sensibilisierung nennen – und was wir in Lektion 1.3 schon kurz besprochen haben. In der Alarmanlagen-Metapher ist es einfach: Der Empfindlichkeitsregler hängt fest auf zu sensibel.",
      kicker: "Zentrale Sensibilisierung",
      headline: "Der Empfindlichkeitsregler hängt fest auf zu sensibel.",
      lead: "Was Forschende zentrale Sensibilisierung nennen – aus Lektion 1.3.",
    },
    {
      type: "statement",
      seg: " Wichtig zu verstehen: Das ist nicht deine Schuld. Es ist auch kein Versagen deines Körpers. Es ist eine Anpassungsreaktion eines Schutzsystems, die in dem Moment, als sie eingestellt wurde, Sinn machte – aber jetzt nicht mehr nötig ist und im Gegenteil schadet.",
      text: "Das ist nicht dein Versagen – das ist Anpassung, die nicht zurück kalibriert hat.",
      emphasis: "Anpassung",
    },
  ],
};

// ── Abschnitt 5 – Chronischer Schmerz als Fehlkalibrierung ────────────────────

const abschnitt5: SourceSection = {
  title: "Chronischer Schmerz als Fehlkalibrierung",
  narration:
    "Lass mich diese Idee konkret machen. Stell dir vor: Du hattest vor zwei Jahren eine akute Rückenschmerz-Episode – ein Hexenschuss vielleicht, oder ein Bandscheibenvorfall. In der akuten Phase hat dein Nervensystem hochgefahren. Es hat die Sensitivität nach oben geschraubt – aus gutem Grund, um dich zu schützen. Du hast geschont, du hast Bewegungen vermieden, du hast wahrscheinlich auch viel Bestätigung bekommen, dass dein Rücken gefährdet ist. Das alles hat dem Nervensystem signalisiert: Hier ist eine reale Bedrohung, bleib aufmerksam. Dann ist das Gewebe verheilt. Aber das Nervensystem hat seine Sensitivität nicht wieder runter geschraubt. Es bleibt in dem hohen Modus, weil es weiterhin Signale bekommt, die es so interpretiert: die Lage ist gefährlich. Diese Signale können vielfältig sein – Schonungsverhalten, das deine Bewegungsangst täglich bestätigt; schwere medizinische Begriffe, die du immer wieder hörst; ein MRT-Befund, der dir Sorgen macht; allgemeiner Stress in deinem Leben; schlechter Schlaf, der die Schmerzschwelle senkt; Isolation, die kein Sicherheits-Gegengewicht liefert. Das Ergebnis: Du hast nach zwei Jahren immer noch Schmerz, obwohl das ursprüngliche Problem längst nicht mehr da ist. Du bist nicht eingebildet krank. Du bist real fehlkalibriert. Und – das ist die zentrale Botschaft – Fehlkalibrierungen lassen sich korrigieren. Du kannst die Sensitivitätseinstellung wieder nach unten regulieren. Das ist genau das, was Bewegungstherapie, Edukation und neue Routinen bewirken. Sie sind nicht primär Reparatur kaputter Strukturen – sie sind Rekalibrierung eines übersensiblen Systems.",
  slides: [
    {
      type: "word",
      seg: "Lass mich diese Idee konkret machen.",
      word: "Konkret gemacht.",
    },
    {
      type: "content",
      seg: " Stell dir vor: Du hattest vor zwei Jahren eine akute Rückenschmerz-Episode – ein Hexenschuss vielleicht, oder ein Bandscheibenvorfall. In der akuten Phase hat dein Nervensystem hochgefahren. Es hat die Sensitivität nach oben geschraubt – aus gutem Grund, um dich zu schützen.",
      kicker: "Vor zwei Jahren",
      headline: "Eine akute Episode – das Nervensystem fährt hoch.",
      lead: "Es schraubt die Sensitivität nach oben – aus gutem Grund, um dich zu schützen.",
    },
    {
      type: "content",
      seg: " Du hast geschont, du hast Bewegungen vermieden, du hast wahrscheinlich auch viel Bestätigung bekommen, dass dein Rücken gefährdet ist. Das alles hat dem Nervensystem signalisiert: Hier ist eine reale Bedrohung, bleib aufmerksam.",
      headline: "Schonen, vermeiden, ständige Bestätigung der Gefahr.",
      lead: "Das alles signalisiert dem Nervensystem: Hier ist eine reale Bedrohung, bleib aufmerksam.",
    },
    {
      type: "content",
      seg: " Dann ist das Gewebe verheilt. Aber das Nervensystem hat seine Sensitivität nicht wieder runter geschraubt. Es bleibt in dem hohen Modus, weil es weiterhin Signale bekommt, die es so interpretiert: die Lage ist gefährlich.",
      dark: true,
      kicker: "Das Gewebe heilt – das System nicht",
      headline: "Das Gewebe ist verheilt. Die Sensitivität bleibt oben.",
      lead: "Weil das System weiter Signale bekommt, die es als „die Lage ist gefährlich“ interpretiert.",
    },
    {
      type: "reveal-list",
      seg: " Diese Signale können vielfältig sein – Schonungsverhalten, das deine Bewegungsangst täglich bestätigt; schwere medizinische Begriffe, die du immer wieder hörst; ein MRT-Befund, der dir Sorgen macht; allgemeiner Stress in deinem Leben; schlechter Schlaf, der die Schmerzschwelle senkt; Isolation, die kein Sicherheits-Gegengewicht liefert.",
      kicker: "Signale, die oben halten",
      title: "Was das System gefährlich liest",
      items: [
        { label: "Schonung, die deine Bewegungsangst täglich bestätigt" },
        { label: "Schwere medizinische Begriffe, immer wieder gehört" },
        { label: "Ein MRT-Befund, der dir Sorgen macht" },
        { label: "Allgemeiner Stress in deinem Leben" },
        { label: "Schlechter Schlaf, der die Schmerzschwelle senkt" },
        { label: "Isolation, die kein Sicherheits-Gegengewicht liefert" },
      ],
    },
    {
      type: "content",
      seg: " Das Ergebnis: Du hast nach zwei Jahren immer noch Schmerz, obwohl das ursprüngliche Problem längst nicht mehr da ist.",
      kicker: "Das Ergebnis",
      headline: "Nach zwei Jahren immer noch Schmerz – obwohl das Problem längst weg ist.",
    },
    {
      type: "statement",
      seg: " Du bist nicht eingebildet krank. Du bist real fehlkalibriert.",
      text: "Du bist nicht eingebildet krank. Du bist real fehlkalibriert.",
      emphasis: "fehlkalibriert",
    },
    {
      type: "content",
      seg: " Und – das ist die zentrale Botschaft – Fehlkalibrierungen lassen sich korrigieren. Du kannst die Sensitivitätseinstellung wieder nach unten regulieren. Das ist genau das, was Bewegungstherapie, Edukation und neue Routinen bewirken. Sie sind nicht primär Reparatur kaputter Strukturen – sie sind Rekalibrierung eines übersensiblen Systems.",
      kicker: "Die zentrale Botschaft",
      headline: "Und Fehlkalibrierungen lassen sich korrigieren.",
      lead: "Bewegungstherapie, Edukation, neue Routinen sind nicht Reparatur – sie sind Rekalibrierung.",
    },
  ],
};

// ── Abschnitt 6 – Was die Alarmanlage runter-kalibriert ───────────────────────

const abschnitt6: SourceSection = {
  title: "Was die Alarmanlage runter-kalibriert",
  narration:
    "Was muss passieren, damit dein System die Sensitivität wieder herunterregelt? Erstens: wiederholte Erfahrungen von Sicherheit. Wenn du eine Bewegung machst, die du seit Monaten als bedrohlich empfunden hast – und sie geht gut, dein Körper macht das mit, nichts Schlimmes passiert – dann lernt dein Nervensystem eine winzige Information: diese Bewegung ist nicht so gefährlich, wie ich dachte. Eine einzelne Erfahrung dieser Art ändert wenig. Hunderte dieser Erfahrungen über Monate ändern viel. Das ist der Mechanismus von strukturierter, dosierter Bewegungstherapie. Zweitens: ein aktualisiertes Schmerzmodell. Wenn du verstehst, dass Schmerz nicht zwingend Schaden bedeutet, dass Bandscheibenbefunde oft harmlos sind, dass dein Rücken viel belastbarer ist, als du gedacht hast – dann verschwindet ein Teil der konstanten Bedrohungs-Bewertung in deinem Hirn. Genau das tun wir in dieser Masterclass. Drittens: Reduktion allgemeiner Stressoren. Dein Schmerzsystem teilt Schaltkreise mit deinem Stresssystem. Wenn du chronisch unter Druck stehst, läuft das Schmerzsystem heißer. Wenn du Möglichkeiten findest, deinen Stress zu reduzieren – Schlaf, Pausen, Beziehungsarbeit, alles was hilft – sinkt indirekt auch die Schmerzsensitivität. Viertens: Aufmerksamkeit, die nicht ausschließlich auf den Schmerz gerichtet ist. Schmerz wird intensiver, wenn er deine ganze Aufmerksamkeit bekommt. Das heißt nicht ablenken um jeden Preis, sondern: ein Leben, das nicht nur aus Schmerzmanagement besteht. Hobbys, Begegnungen, kleine Freuden, Sinnerleben. Das alles ist nicht nebenbei, sondern Teil der Therapie. Fünftens: gute Schmerz-Sprache. Wie du über deinen Schmerz redest, prägt, wie er sich anfühlt. Mein Rücken ist kaputt erzeugt mehr Schmerz als Mein Schmerzsystem ist aktuell sehr aufmerksam und ich arbeite an seiner Rekalibrierung. Beides beschreibt dieselbe Realität – aber das eine setzt das System in Stress, das andere in einen Lern-Modus. All das ist gemeinsam der Mechanismus, durch den chronischer Schmerz besser werden kann. Es gibt selten die eine Lösung. Es gibt eine systemische Lösung. Und genau die ist das Programm dieser Masterclass.",
  slides: [
    {
      type: "content",
      seg: "Was muss passieren, damit dein System die Sensitivität wieder herunterregelt?",
      kicker: "Fünf Hebel zur Rekalibrierung",
      headline: "Was regelt die Sensitivität wieder herunter?",
    },
    {
      type: "content",
      seg: " Erstens: wiederholte Erfahrungen von Sicherheit. Wenn du eine Bewegung machst, die du seit Monaten als bedrohlich empfunden hast – und sie geht gut, dein Körper macht das mit, nichts Schlimmes passiert – dann lernt dein Nervensystem eine winzige Information: diese Bewegung ist nicht so gefährlich, wie ich dachte. Eine einzelne Erfahrung dieser Art ändert wenig. Hunderte dieser Erfahrungen über Monate ändern viel. Das ist der Mechanismus von strukturierter, dosierter Bewegungstherapie.",
      kicker: "Hebel 1 · Sicherheits-Erfahrungen",
      headline: "Jede gute Bewegung ist eine winzige Information: „nicht so gefährlich, wie ich dachte.“",
      lead: "Eine Erfahrung ändert wenig. Hunderte über Monate ändern viel – der Mechanismus dosierter Bewegungstherapie.",
    },
    {
      type: "content",
      seg: " Zweitens: ein aktualisiertes Schmerzmodell. Wenn du verstehst, dass Schmerz nicht zwingend Schaden bedeutet, dass Bandscheibenbefunde oft harmlos sind, dass dein Rücken viel belastbarer ist, als du gedacht hast – dann verschwindet ein Teil der konstanten Bedrohungs-Bewertung in deinem Hirn. Genau das tun wir in dieser Masterclass.",
      kicker: "Hebel 2 · Aktualisiertes Modell",
      headline: "Verstehen, dass Schmerz nicht zwingend Schaden bedeutet.",
      lead: "Dann verschwindet ein Teil der konstanten Bedrohungs-Bewertung – genau das tun wir hier.",
    },
    {
      type: "content",
      seg: " Drittens: Reduktion allgemeiner Stressoren. Dein Schmerzsystem teilt Schaltkreise mit deinem Stresssystem. Wenn du chronisch unter Druck stehst, läuft das Schmerzsystem heißer. Wenn du Möglichkeiten findest, deinen Stress zu reduzieren – Schlaf, Pausen, Beziehungsarbeit, alles was hilft – sinkt indirekt auch die Schmerzsensitivität.",
      kicker: "Hebel 3 · Stress-Reduktion",
      headline: "Dein Schmerzsystem teilt Schaltkreise mit deinem Stresssystem.",
      lead: "Weniger chronischer Druck – Schlaf, Pausen, Beziehung – senkt indirekt die Schmerzsensitivität.",
    },
    {
      type: "content",
      seg: " Viertens: Aufmerksamkeit, die nicht ausschließlich auf den Schmerz gerichtet ist. Schmerz wird intensiver, wenn er deine ganze Aufmerksamkeit bekommt. Das heißt nicht ablenken um jeden Preis, sondern: ein Leben, das nicht nur aus Schmerzmanagement besteht. Hobbys, Begegnungen, kleine Freuden, Sinnerleben. Das alles ist nicht nebenbei, sondern Teil der Therapie.",
      kicker: "Hebel 4 · Lebensbreite",
      headline: "Ein Leben, das nicht nur aus Schmerzmanagement besteht.",
      lead: "Hobbys, Begegnungen, kleine Freuden, Sinn – nicht nebenbei, sondern Teil der Therapie.",
    },
    {
      type: "content",
      seg: " Fünftens: gute Schmerz-Sprache. Wie du über deinen Schmerz redest, prägt, wie er sich anfühlt. Mein Rücken ist kaputt erzeugt mehr Schmerz als Mein Schmerzsystem ist aktuell sehr aufmerksam und ich arbeite an seiner Rekalibrierung. Beides beschreibt dieselbe Realität – aber das eine setzt das System in Stress, das andere in einen Lern-Modus.",
      kicker: "Hebel 5 · Sprache",
      headline: "„Mein Rücken ist kaputt“ erzeugt mehr Schmerz als „mein System ist aufmerksam“.",
      lead: "Dieselbe Realität – aber das eine setzt das System in Stress, das andere in einen Lern-Modus.",
    },
    {
      type: "reveal-list",
      seg: " All das ist gemeinsam der Mechanismus, durch den chronischer Schmerz besser werden kann.",
      kicker: "Gemeinsam, nicht einzeln",
      title: "Die fünf Hebel im Überblick",
      items: [
        { label: "Wiederholte Sicherheits-Erfahrungen" },
        { label: "Ein aktualisiertes Schmerzmodell" },
        { label: "Reduktion allgemeiner Stressoren" },
        { label: "Aufmerksamkeit, nicht nur auf den Schmerz" },
        { label: "Gute Schmerz-Sprache" },
      ],
    },
    {
      type: "statement",
      seg: " Es gibt selten die eine Lösung. Es gibt eine systemische Lösung. Und genau die ist das Programm dieser Masterclass.",
      text: "Keine eine Lösung. Eine systemische Lösung.",
      emphasis: "systemische",
    },
  ],
};

// ── Abschnitt 7 – Synthese: Modul 1 zusammengefasst ───────────────────────────

const abschnitt7: SourceSection = {
  title: "Synthese: Modul 1 zusammengefasst",
  narration:
    "Lass uns kurz zusammenfassen, was du in Modul 1 gelernt hast – das ist der Boden, auf dem alles Weitere baut. Lektion 1.1 und 1.2: Deine LWS ist anatomisch ein robustes, dynamisches System. Bestehend aus Wirbeln, Bandscheiben, Facettengelenken, drei Muskelschichten, Faszien, Nerven und ISG. Schmerz ist selten ein einzelner kaputter Teil – meist ist es das Zusammenspiel des Systems, das aus dem Takt geraten ist. Lektion 1.3: Chronischer Schmerz ist meist eine Sensibilisierung des Nervensystems – kein einfaches Weiterbestehen einer ursprünglichen Ursache. Diese Sensibilisierung ist real, messbar – und sie ist umkehrbar. Lektion 1.4: MRT-Befunde sind oft missverstandene Beschreibungen normaler altersbedingter Veränderungen. Sie korrelieren meist schlecht mit Schmerz. Du kannst lernen, sie neutraler einzuordnen – und das ist Teil deiner Heilungsarbeit. Diese Lektion 1.5: Dein Schmerzsystem ist eine Alarmanlage, deren Sensitivitätsregler bei chronischem Schmerz hoch geschraubt ist. Schmerz ist nicht direkte Messung, sondern Bewertung. Diese Bewertung lässt sich durch wiederholte Sicherheits-Erfahrungen, ein aktualisiertes Schmerzmodell, weniger Stress, mehr Lebensbreite und bessere Sprache zurückkalibrieren. Das ist das Bild, das du mitnehmen wirst. Es ist kein simples Bild. Aber es ist – soweit wir das heute wissen – das genaueste Bild, das die moderne Schmerzwissenschaft hat. Und es ist ein Bild, das dir Handlungsmöglichkeiten gibt. Das ist das Wichtigste.",
  slides: [
    {
      type: "content",
      seg: "Lass uns kurz zusammenfassen, was du in Modul 1 gelernt hast – das ist der Boden, auf dem alles Weitere baut.",
      kicker: "Modul 1 · Synthese",
      headline: "Der Boden, auf dem alles Weitere baut.",
    },
    {
      type: "content",
      seg: " Lektion 1.1 und 1.2: Deine LWS ist anatomisch ein robustes, dynamisches System. Bestehend aus Wirbeln, Bandscheiben, Facettengelenken, drei Muskelschichten, Faszien, Nerven und ISG. Schmerz ist selten ein einzelner kaputter Teil – meist ist es das Zusammenspiel des Systems, das aus dem Takt geraten ist.",
      kicker: "Lektion 1.1 & 1.2 · Anatomie",
      headline: "Deine LWS ist ein robustes, dynamisches System.",
      lead: "Schmerz ist selten ein einzelner kaputter Teil – meist das Zusammenspiel, das aus dem Takt ist.",
    },
    {
      type: "content",
      seg: " Lektion 1.3: Chronischer Schmerz ist meist eine Sensibilisierung des Nervensystems – kein einfaches Weiterbestehen einer ursprünglichen Ursache. Diese Sensibilisierung ist real, messbar – und sie ist umkehrbar.",
      kicker: "Lektion 1.3 · Chronizität",
      headline: "Chronischer Schmerz ist meist eine Sensibilisierung des Nervensystems.",
      lead: "Real, messbar – und umkehrbar.",
    },
    {
      type: "content",
      seg: " Lektion 1.4: MRT-Befunde sind oft missverstandene Beschreibungen normaler altersbedingter Veränderungen. Sie korrelieren meist schlecht mit Schmerz. Du kannst lernen, sie neutraler einzuordnen – und das ist Teil deiner Heilungsarbeit.",
      kicker: "Lektion 1.4 · MRT",
      headline: "MRT-Befunde sind oft missverstandene Beschreibungen normalen Alterns.",
      lead: "Sie korrelieren meist schlecht mit Schmerz – sie neutraler einzuordnen ist Teil der Arbeit.",
    },
    {
      type: "content",
      seg: " Diese Lektion 1.5: Dein Schmerzsystem ist eine Alarmanlage, deren Sensitivitätsregler bei chronischem Schmerz hoch geschraubt ist. Schmerz ist nicht direkte Messung, sondern Bewertung. Diese Bewertung lässt sich durch wiederholte Sicherheits-Erfahrungen, ein aktualisiertes Schmerzmodell, weniger Stress, mehr Lebensbreite und bessere Sprache zurückkalibrieren.",
      dark: true,
      kicker: "Lektion 1.5 · Alarmanlage",
      headline: "Dein Schmerzsystem ist eine Alarmanlage mit hochgeschraubtem Regler.",
      lead: "Schmerz ist Bewertung, nicht Messung – und diese Bewertung lässt sich zurückkalibrieren.",
    },
    {
      type: "content",
      seg: " Das ist das Bild, das du mitnehmen wirst. Es ist kein simples Bild. Aber es ist – soweit wir das heute wissen – das genaueste Bild, das die moderne Schmerzwissenschaft hat.",
      headline: "Kein simples Bild – aber das genaueste, das die Schmerzwissenschaft heute hat.",
    },
    {
      type: "statement",
      seg: " Und es ist ein Bild, das dir Handlungsmöglichkeiten gibt. Das ist das Wichtigste.",
      text: "Ein Bild, das dir Handlungsmöglichkeiten gibt.",
      emphasis: "Handlungsmöglichkeiten",
    },
  ],
};

// ── Abschnitt 8 – Workbook und Übergang zu Modul 2 ────────────────────────────

const abschnitt8: SourceSection = {
  title: "Workbook & Übergang zu Modul 2",
  narration:
    "Im Workbook findest du Übung 1.5: Meine Alarmanlage. Eine kurze Reflexion: Wo steht dein Sensitivitätsregler aktuell – eher hoch oder eher niedrig? Welche der fünf Hebel zur Rekalibrierung erscheinen dir am leichtesten zugänglich, welche schwieriger? Diese Reflexion wird in Modul 4 die Grundlage für deine persönliche Ritual-Map. In Modul 2 gehen wir jetzt vom Verstehen ins Handeln. Du hast die Theorie. Jetzt bekommst du die Werkzeuge. Wir starten mit der grundlegenden Bewegungsphilosophie, gehen dann durch konkrete Mobilisationsübungen, modernes Rumpftraining, Atemmechanik, Belastungsdosierung und Schmerz-Coping in der Praxis. Alles begründet aus dem, was du jetzt in Modul 1 verstanden hast – nicht zufällig gewählt, sondern als logische Konsequenz. Eine letzte Aufforderung für heute: Bevor du in Modul 2 startest – nimm dir einen Tag Pause. Nicht im Sinne von gar nichts tun, sondern lass das, was du in Modul 1 gelernt hast, einen Tag wirken. Erinnere dich an die Alarmanlage. Beobachte, wo dein Schmerz aktiviert wird – und ob du jetzt anders darüber denken kannst. Das ist die beste Vorbereitung auf den praktischen Teil. Bis dann.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 1.5: Meine Alarmanlage. Eine kurze Reflexion: Wo steht dein Sensitivitätsregler aktuell – eher hoch oder eher niedrig? Welche der fünf Hebel zur Rekalibrierung erscheinen dir am leichtesten zugänglich, welche schwieriger? Diese Reflexion wird in Modul 4 die Grundlage für deine persönliche Ritual-Map.",
      kicker: "Workbook · Übung 1.5",
      headline: "Ein Workbook-Stopp: Meine Alarmanlage.",
      lead: "Wo steht dein Regler – und welche Hebel sind dir zugänglich? Grundlage für deine Ritual-Map in Modul 4.",
    },
    {
      type: "content",
      seg: " In Modul 2 gehen wir jetzt vom Verstehen ins Handeln. Du hast die Theorie. Jetzt bekommst du die Werkzeuge. Wir starten mit der grundlegenden Bewegungsphilosophie, gehen dann durch konkrete Mobilisationsübungen, modernes Rumpftraining, Atemmechanik, Belastungsdosierung und Schmerz-Coping in der Praxis. Alles begründet aus dem, was du jetzt in Modul 1 verstanden hast – nicht zufällig gewählt, sondern als logische Konsequenz.",
      kicker: "Vom Verstehen ins Handeln",
      headline: "Du hast die Theorie. Jetzt bekommst du die Werkzeuge.",
      lead: "Bewegungsphilosophie, Mobilisation, Rumpftraining, Atmung, Dosierung, Coping – alles als logische Konsequenz aus Modul 1.",
    },
    {
      type: "statement",
      seg: " Eine letzte Aufforderung für heute: Bevor du in Modul 2 startest – nimm dir einen Tag Pause. Nicht im Sinne von gar nichts tun, sondern lass das, was du in Modul 1 gelernt hast, einen Tag wirken. Erinnere dich an die Alarmanlage. Beobachte, wo dein Schmerz aktiviert wird – und ob du jetzt anders darüber denken kannst. Das ist die beste Vorbereitung auf den praktischen Teil.",
      text: "Nimm dir einen Tag Pause, bevor Modul 2 startet.",
      emphasis: "wirken",
    },
    {
      type: "outro",
      seg: " Bis dann.",
      nextLabel: "Modul 2 · Lektion 2.1",
      nextTitle: "Bewegungsphilosophie: Warum Bewegung Medizin ist",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "1.5",
  title: "Dein Schmerzsystem als Alarmanlage",
  subtitle: "Modul 1 – Verstehen · Schmerz ist Bewertung, nicht Messung",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
    abschnitt7,
    abschnitt8,
  ],
};
