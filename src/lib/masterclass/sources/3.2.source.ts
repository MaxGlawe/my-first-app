/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 3.2
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/3.2.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 3.2`). Niemals lessons/3.2.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Zweite Lektion von Modul 3 (Prävention). „Haltungs-Mythen entzaubert": drei
 * populäre Haltungs-Mythen, die die Forschung nicht stützt — die eine richtige
 * Haltung, Sitzen-ist-das-neue-Rauchen, Stehpulte-heilen-den-Rücken —, der
 * gemeinsame rote Faden Variabilität statt Perfektion, drei Orientierungs-
 * Prinzipien, praktische Empfehlungen, Workbook + Übergang zu 3.3. Keine
 * klassischen Übungen — eine Mythos-Aufklärungs-/Strategie-Lektion. Aufbau
 * identisch zu 3.1:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt; Aufzählungspunkte zu Fließtext verdichtet). EXAKT der
 *     Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–7) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke, die Meta-Tabelle und der Modul-Trenner der MD werden
 * NICHT vertont.
 *
 * 3.-PERSON-REGEL (angewandt): 3.2 enthält zwei Stellen mit Ersteller-Ich, die zu
 * generischer Guide-Form geglättet wurden, um die erste Person Singular zu
 * vermeiden (kein Credential-/Praxis-Ich, daher kein „Max Glawe", analog zur
 * Glättung in 3.1):
 *   - MD: „weil ich gleich Dinge sage, die deinem Eindruck … widersprechen"
 *     → „weil gleich Dinge gesagt werden, die deinem Eindruck … widersprechen".
 *   - MD: „Was ich gerade beschrieben habe – Variabilität"
 *     → „Was gerade beschrieben wurde – Variabilität".
 *   Die übrige Du-/Wir-Anleitungsform bleibt unverändert.
 *
 * HWG: Wortlaut der MD wird – außer der genannten Glättung – beibehalten. Die
 *   Mythos-Korrekturen sind als Orientierung an der Forschungslage formuliert,
 *   nicht als Heilversprechen. „Variabilität schlägt Perfektion", „Bewegung ist
 *   der Schutz" bleiben als allgemeine Lebensstil-Orientierung stehen.
 *
 * GERMAN-QUOTE-GOTCHA (CLAUDE.md): ASCII-`"` in TS-Strings bricht das Literal.
 * In narration/seg NUR einfache Anführungen ('...') oder gar keine. Die Anzeige-
 * Strings der Slides nutzen typografische Quotes („…“) — die sind unproblematisch.
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

// ── Abschnitt 1 – Eröffnung ──────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Willkommen zu Lektion 3.2. Diese Lektion ist gleichzeitig befreiend und kontrovers. Befreiend, weil viele Patienten nach dieser Lektion eine alte Last loswerden. Kontrovers, weil gleich Dinge gesagt werden, die deinem Eindruck von gesunder Haltung widersprechen werden. Worum geht es? Um drei Haltungs-Mythen, die in unserer Kultur als gesichert gelten – aber die wissenschaftliche Datenlage entweder nicht stützt oder direkt widerlegt. Wenn du diese Mythen ablegen kannst, wird dein Alltag deutlich entspannter.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 3 – Prävention",
      lessonLabel: "Lektion 3.2 – Haltungs-Mythen entzaubert",
    },
    {
      type: "content",
      seg: "Willkommen zu Lektion 3.2. Diese Lektion ist gleichzeitig befreiend und kontrovers. Befreiend, weil viele Patienten nach dieser Lektion eine alte Last loswerden. Kontrovers, weil gleich Dinge gesagt werden, die deinem Eindruck von gesunder Haltung widersprechen werden.",
      kicker: "Lektion 3.2",
      headline: "Befreiend und kontrovers zugleich.",
      lead: "Befreiend, weil viele eine alte Last loswerden. Kontrovers, weil gleich Dinge gesagt werden, die deinem Eindruck von gesunder Haltung widersprechen.",
    },
    {
      type: "content",
      seg: " Worum geht es? Um drei Haltungs-Mythen, die in unserer Kultur als gesichert gelten – aber die wissenschaftliche Datenlage entweder nicht stützt oder direkt widerlegt. Wenn du diese Mythen ablegen kannst, wird dein Alltag deutlich entspannter.",
      kicker: "Worum es geht",
      headline: "Drei Haltungs-Mythen, die als gesichert gelten – aber die Datenlage nicht stützt.",
      lead: "Wenn du sie ablegen kannst, wird dein Alltag deutlich entspannter.",
    },
  ],
};

// ── Abschnitt 2 – Mythos 1: Die eine richtige Haltung ────────────────────────

const abschnitt2: SourceSection = {
  title: "Mythos 1: Die eine richtige Haltung",
  narration:
    "Mythos 1: Es gibt eine richtige Haltung. Wer sie nicht hat, schadet seinem Rücken. Diese Idee ist tief verankert. Du kennst die Bilder: Aufrechter Oberkörper, Schultern zurück, leichter Bauch eingezogen, Kopf gerade über der Wirbelsäule, gesunde S-Form der Wirbelsäule. So muss es aussehen, sonst tut der Rücken bald weh. Was sagt die aktuelle Forschung dazu? Erstaunlich wenig Bestätigung. Eine ganze Reihe von Studien hat verglichen: Wer hat statistisch häufiger Rückenschmerz – Menschen mit guter Haltung oder Menschen mit schlechter Haltung nach klassischer Definition? Die Antwort ist: kaum ein Unterschied. Manche Studien finden sogar einen umgekehrten Effekt – Menschen mit als perfekt bewerteter Haltung haben tendenziell mehr Rückenschmerz, weil sie sich permanent in eine angeblich richtige Position zwingen. Was zählt wirklich? Nicht eine bestimmte Form, sondern Variabilität. Dein Rücken hat keine Probleme mit einer Position – auch wenn sie schlecht aussieht. Er hat Probleme damit, zu lange in derselben Position zu sein, egal welcher. Das gilt für Sitzen, Stehen, Liegen. Eine perfekte Haltung, eine Stunde lang gehalten, belastet deine Strukturen stärker als eine schlechte Haltung, die du alle zehn Minuten wechselst. Die Bewegung ist der Schutz – nicht die Form. Was bedeutet das praktisch? Du kannst aufhören, dich permanent zu beobachten und zu korrigieren. Du kannst auch mal in einem alten Sessel zusammensacken. Du kannst auch mal mit hochgezogenen Schultern am Schreibtisch sitzen, weil du gerade konzentriert bist. Du musst nicht ständig deine eigene Haltung kontrollieren – das raubt dir Energie und verschlimmert oft genau das Problem, das du vermeiden willst.",
  slides: [
    {
      type: "statement",
      seg: "Mythos 1: Es gibt eine richtige Haltung. Wer sie nicht hat, schadet seinem Rücken.",
      text: "Mythos 1: Es gibt die eine richtige Haltung – wer sie nicht hat, schadet seinem Rücken.",
      emphasis: "Mythos 1",
    },
    {
      type: "content",
      seg: " Diese Idee ist tief verankert. Du kennst die Bilder: Aufrechter Oberkörper, Schultern zurück, leichter Bauch eingezogen, Kopf gerade über der Wirbelsäule, gesunde S-Form der Wirbelsäule. So muss es aussehen, sonst tut der Rücken bald weh.",
      kicker: "Tief verankert",
      headline: "Du kennst die Bilder: aufrecht, Schultern zurück, gesunde S-Form.",
      lead: "Oberkörper aufrecht, Bauch leicht eingezogen, Kopf gerade über der Wirbelsäule – so muss es aussehen, sonst tut der Rücken bald weh.",
    },
    {
      type: "content",
      seg: " Was sagt die aktuelle Forschung dazu? Erstaunlich wenig Bestätigung. Eine ganze Reihe von Studien hat verglichen: Wer hat statistisch häufiger Rückenschmerz – Menschen mit guter Haltung oder Menschen mit schlechter Haltung nach klassischer Definition? Die Antwort ist: kaum ein Unterschied.",
      dark: true,
      kicker: "Was die Forschung sagt",
      headline: "Gute Haltung, schlechte Haltung – kaum ein Unterschied beim Rückenschmerz.",
      lead: "Eine ganze Reihe von Studien hat genau das verglichen. Die Bestätigung für die eine richtige Haltung? Erstaunlich wenig.",
    },
    {
      type: "content",
      seg: " Manche Studien finden sogar einen umgekehrten Effekt – Menschen mit als perfekt bewerteter Haltung haben tendenziell mehr Rückenschmerz, weil sie sich permanent in eine angeblich richtige Position zwingen.",
      kicker: "Der umgekehrte Effekt",
      headline: "Wer sich permanent in die perfekte Position zwingt, hat tendenziell mehr Schmerz.",
      lead: "Manche Studien finden sogar das Gegenteil: die als perfekt bewertete Haltung kostet, weil sie ständig gehalten werden muss.",
    },
    {
      type: "content",
      seg: " Was zählt wirklich? Nicht eine bestimmte Form, sondern Variabilität. Dein Rücken hat keine Probleme mit einer Position – auch wenn sie schlecht aussieht. Er hat Probleme damit, zu lange in derselben Position zu sein, egal welcher.",
      kicker: "Was wirklich zählt",
      headline: "Nicht die Form ist das Problem – sondern zu lange dieselbe Position.",
      lead: "Dein Rücken hat keine Probleme mit einer Position, auch wenn sie schlecht aussieht. Er hat Probleme damit, zu lange in derselben zu bleiben – egal welcher.",
    },
    {
      type: "content",
      seg: " Das gilt für Sitzen, Stehen, Liegen. Eine perfekte Haltung, eine Stunde lang gehalten, belastet deine Strukturen stärker als eine schlechte Haltung, die du alle zehn Minuten wechselst. Die Bewegung ist der Schutz – nicht die Form.",
      kicker: "Sitzen, Stehen, Liegen",
      headline: "Eine Stunde perfekt gehalten belastet mehr als eine schlechte Haltung, alle zehn Minuten gewechselt.",
      lead: "Die Bewegung ist der Schutz – nicht die Form.",
    },
    {
      type: "content",
      seg: " Was bedeutet das praktisch? Du kannst aufhören, dich permanent zu beobachten und zu korrigieren. Du kannst auch mal in einem alten Sessel zusammensacken. Du kannst auch mal mit hochgezogenen Schultern am Schreibtisch sitzen, weil du gerade konzentriert bist. Du musst nicht ständig deine eigene Haltung kontrollieren – das raubt dir Energie und verschlimmert oft genau das Problem, das du vermeiden willst.",
      kicker: "Was das praktisch heißt",
      headline: "Du darfst zusammensacken. Du musst dich nicht permanent korrigieren.",
      lead: "Mal in den alten Sessel sinken, mal konzentriert mit hochgezogenen Schultern sitzen: ständige Selbstkontrolle raubt Energie und verschlimmert oft genau das Problem, das du vermeiden willst.",
    },
    {
      type: "statement",
      seg: "",
      text: "Variabilität schlägt Perfektion. Immer.",
      emphasis: "Variabilität",
    },
  ],
};

// ── Abschnitt 3 – Mythos 2: Sitzen ist das neue Rauchen ──────────────────────

const abschnitt3: SourceSection = {
  title: "Mythos 2: Sitzen ist das neue Rauchen",
  narration:
    "Mythos 2: Sitzen ist das neue Rauchen. Lange Sitzphasen zerstören deinen Rücken. Auch ein populärer Satz. Sitzen sei genauso gesundheitsschädlich wie Rauchen, gerade für den Rücken. Studien zeigen Zusammenhänge zwischen langem Sitzen und Rückenschmerzen, also muss Sitzen das Problem sein. Richtig? Nicht ganz. Die Forschungslage ist differenzierter. Was wirklich schaden kann, ist nicht Sitzen an sich. Es ist Mangel an Bewegung. Wenn du acht Stunden am Tag sitzt und dich sonst nicht bewegst, ist das ein Problem. Wenn du acht Stunden am Tag sitzt und dich ansonsten regelmäßig bewegst – einkaufen, spazieren, Treppen steigen, Übungen machen – dann ist das deutlich weniger ein Problem. Sitzen ist auch nicht die Schmerzursache. Studien zeigen: Menschen, die acht Stunden sitzen, haben statistisch leicht häufiger Rückenschmerz als Menschen, die fünf Stunden sitzen. Leicht häufiger, nicht dramatisch. Und der Effekt verschwindet weitgehend, wenn man andere Faktoren – Bewegungsmangel, Stress, Schlafmangel – mit berücksichtigt. Was wirklich zählt? Wieder Variabilität. Lang sitzen ohne Unterbrechung – das ist das Problem. Lang sitzen mit Mikro-Pausen, mit gelegentlichem Aufstehen, mit Positionswechsel – das ist deutlich weniger problematisch. Wenn dein Beruf Sitzen erfordert, dann darfst du sitzen. Du musst dich nicht schuldig fühlen für deine acht Stunden Schreibtisch. Was du brauchst, ist Mikro-Bewegung während des Sitzens und zwischendurch. Ein bisschen wackeln. Alle 30 Minuten mal aufstehen. Kurze Treppenrunde in der Pause. Das ist die richtige Antwort – nicht Sitzen verbieten.",
  slides: [
    {
      type: "statement",
      seg: "Mythos 2: Sitzen ist das neue Rauchen. Lange Sitzphasen zerstören deinen Rücken.",
      text: "Mythos 2: Sitzen ist das neue Rauchen – lange Sitzphasen zerstören deinen Rücken.",
      emphasis: "Mythos 2",
    },
    {
      type: "content",
      seg: " Auch ein populärer Satz. Sitzen sei genauso gesundheitsschädlich wie Rauchen, gerade für den Rücken. Studien zeigen Zusammenhänge zwischen langem Sitzen und Rückenschmerzen, also muss Sitzen das Problem sein. Richtig?",
      kicker: "Ein populärer Satz",
      headline: "Sitzen so schädlich wie Rauchen – also muss Sitzen das Problem sein. Richtig?",
      lead: "Studien zeigen Zusammenhänge zwischen langem Sitzen und Rückenschmerzen. Der Schluss liegt nahe – aber stimmt er?",
    },
    {
      type: "content",
      seg: " Nicht ganz. Die Forschungslage ist differenzierter. Was wirklich schaden kann, ist nicht Sitzen an sich. Es ist Mangel an Bewegung. Wenn du acht Stunden am Tag sitzt und dich sonst nicht bewegst, ist das ein Problem. Wenn du acht Stunden am Tag sitzt und dich ansonsten regelmäßig bewegst – einkaufen, spazieren, Treppen steigen, Übungen machen – dann ist das deutlich weniger ein Problem.",
      dark: true,
      kicker: "Differenzierter",
      headline: "Nicht das Sitzen schadet – der Bewegungsmangel drumherum.",
      lead: "Acht Stunden sitzen und sonst nichts: ein Problem. Acht Stunden sitzen und sich ansonsten regelmäßig bewegen – einkaufen, spazieren, Treppen, Übungen –: deutlich weniger.",
    },
    {
      type: "content",
      seg: " Sitzen ist auch nicht die Schmerzursache. Studien zeigen: Menschen, die acht Stunden sitzen, haben statistisch leicht häufiger Rückenschmerz als Menschen, die fünf Stunden sitzen. Leicht häufiger, nicht dramatisch. Und der Effekt verschwindet weitgehend, wenn man andere Faktoren – Bewegungsmangel, Stress, Schlafmangel – mit berücksichtigt.",
      kicker: "Nicht die Ursache",
      headline: "Acht statt fünf Stunden sitzen: leicht häufiger Schmerz – nicht dramatisch.",
      lead: "Und der Effekt verschwindet weitgehend, wenn man Bewegungsmangel, Stress und Schlafmangel mit berücksichtigt.",
    },
    {
      type: "statement",
      seg: " Was wirklich zählt? Wieder Variabilität. Lang sitzen ohne Unterbrechung – das ist das Problem. Lang sitzen mit Mikro-Pausen, mit gelegentlichem Aufstehen, mit Positionswechsel – das ist deutlich weniger problematisch.",
      text: "Nicht Sitzen ist das Problem. Bewegungsmangel ist das Problem.",
      emphasis: "Bewegungsmangel",
    },
    {
      type: "content",
      seg: " Wenn dein Beruf Sitzen erfordert, dann darfst du sitzen. Du musst dich nicht schuldig fühlen für deine acht Stunden Schreibtisch.",
      kicker: "Kein Schuldgefühl",
      headline: "Wenn dein Beruf Sitzen erfordert, dann darfst du sitzen.",
      lead: "Du musst dich nicht schuldig fühlen für deine acht Stunden Schreibtisch.",
    },
    {
      type: "reveal-list",
      seg: " Was du brauchst, ist Mikro-Bewegung während des Sitzens und zwischendurch. Ein bisschen wackeln. Alle 30 Minuten mal aufstehen. Kurze Treppenrunde in der Pause. Das ist die richtige Antwort – nicht Sitzen verbieten.",
      kicker: "Die richtige Antwort",
      title: "Mikro-Bewegung statt Sitz-Verbot",
      items: [
        { label: "Mikro-Bewegung beim Sitzen – ein bisschen wackeln" },
        { label: "Alle 30 Minuten mal aufstehen" },
        { label: "Pausen-Treppe statt Aufzug" },
      ],
    },
  ],
};

// ── Abschnitt 4 – Mythos 3: Stehpulte heilen den Rücken ──────────────────────

const abschnitt4: SourceSection = {
  title: "Mythos 3: Stehpulte heilen den Rücken",
  narration:
    "Mythos 3: Wer ein Stehpult hat, hat das Sitz-Problem gelöst. Stehpulte sind ein Mode-Phänomen der letzten zehn Jahre. Die Idee: Wenn Sitzen schädlich ist, ist Stehen die Lösung. Studien zeigen aber: Wer acht Stunden steht, hat ähnliche oder andere Probleme als wer acht Stunden sitzt. Stehen erzeugt andere Belastungs-Muster, die ihrerseits zu Beschwerden führen können – vor allem in der unteren Wirbelsäule, in den Knien und Füßen. Was wirklich hilft, ist – wieder mal – Wechsel. Höhenverstellbare Pulte, die du zwischen Sitzen und Stehen flexibel nutzt, sind viel sinnvoller als reine Stehpulte. Du sitzt 30 Minuten, du stehst 30 Minuten, du sitzt wieder, du gehst kurz raus. Das Wechselspiel ist der Schutz. Wenn du kein höhenverstellbares Pult hast, ist das auch nicht das Drama. Du kannst Variabilität anders erzeugen – mit Pausen, mit Positions-Wechseln, mit Übungen zwischendurch. Das Pult ist nicht das Problem. Die Bewegung drumherum ist die Lösung.",
  slides: [
    {
      type: "statement",
      seg: "Mythos 3: Wer ein Stehpult hat, hat das Sitz-Problem gelöst.",
      text: "Mythos 3: Wer ein Stehpult hat, hat das Sitz-Problem gelöst.",
      emphasis: "Mythos 3",
    },
    {
      type: "content",
      seg: " Stehpulte sind ein Mode-Phänomen der letzten zehn Jahre. Die Idee: Wenn Sitzen schädlich ist, ist Stehen die Lösung. Studien zeigen aber: Wer acht Stunden steht, hat ähnliche oder andere Probleme als wer acht Stunden sitzt. Stehen erzeugt andere Belastungs-Muster, die ihrerseits zu Beschwerden führen können – vor allem in der unteren Wirbelsäule, in den Knien und Füßen.",
      dark: true,
      kicker: "Ein Mode-Phänomen",
      headline: "Acht Stunden stehen hat ähnliche oder andere Probleme als acht Stunden sitzen.",
      lead: "Die Idee klingt logisch: ist Sitzen schädlich, ist Stehen die Lösung. Doch Stehen erzeugt eigene Belastungs-Muster – vor allem in der unteren Wirbelsäule, den Knien und Füßen.",
    },
    {
      type: "content",
      seg: " Was wirklich hilft, ist – wieder mal – Wechsel. Höhenverstellbare Pulte, die du zwischen Sitzen und Stehen flexibel nutzt, sind viel sinnvoller als reine Stehpulte. Du sitzt 30 Minuten, du stehst 30 Minuten, du sitzt wieder, du gehst kurz raus. Das Wechselspiel ist der Schutz.",
      kicker: "Was wirklich hilft",
      headline: "Wechsel: 30 Minuten sitzen, 30 Minuten stehen, wieder sitzen, kurz raus.",
      lead: "Höhenverstellbare Pulte, flexibel zwischen Sitzen und Stehen genutzt, sind viel sinnvoller als reine Stehpulte. Das Wechselspiel ist der Schutz.",
    },
    {
      type: "statement",
      seg: " Wenn du kein höhenverstellbares Pult hast, ist das auch nicht das Drama. Du kannst Variabilität anders erzeugen – mit Pausen, mit Positions-Wechseln, mit Übungen zwischendurch. Das Pult ist nicht das Problem. Die Bewegung drumherum ist die Lösung.",
      text: "Das Pult ist nicht das Problem. Die Bewegung drumherum ist die Lösung.",
      emphasis: "die Bewegung drumherum",
    },
  ],
};

// ── Abschnitt 5 – Was wirklich zählt: Variabilität ───────────────────────────

const abschnitt5: SourceSection = {
  title: "Was wirklich zählt: Variabilität",
  narration:
    "Was gerade beschrieben wurde – Variabilität – ist tatsächlich der zentrale Faktor, den die Forschung konsistent findet. Drei Dinge, an denen du dich orientieren kannst. Erstens: Die nächste Haltung ist die beste Haltung. Egal wie du gerade sitzt oder stehst – die beste Haltung ist die, in die du als nächstes wechselst. Sitzen, stehen, lehnen, hocken, liegen – alles gut, solange du wechselst. Zweitens: Bewegung schlägt Position. Selbst eine schlechte Position ist okay, solange du dabei kleine Bewegungen machst. Zappel mit den Füßen. Streck die Arme. Roll mit den Schultern. Diese Mikro-Bewegungen halten Gewebe durchblutet und Nervensystem in Sicherheit. Drittens: Dein Körper kennt sich selbst. Wenn du in einer Position spürst, dass du sie gleich loswerden willst, glaub diesem Signal. Wechsel. Das Signal ist klüger als jede ergonomische Empfehlung. Wenn du in einer Position sehr lange entspannt bist, ist das auch in Ordnung – du musst nicht zwanghaft alle dreißig Sekunden wechseln. Was du nach dieser Lektion nicht mehr tun musst: dich selbst zur Haltung erziehen. Permanent kontrollieren, ob du gerade richtig sitzt. Schuldgefühle haben, wenn du im Sofa zusammensackst. Diese mentale Last fällt weg.",
  slides: [
    {
      type: "content",
      seg: "Was gerade beschrieben wurde – Variabilität – ist tatsächlich der zentrale Faktor, den die Forschung konsistent findet. Drei Dinge, an denen du dich orientieren kannst.",
      kicker: "Der zentrale Faktor",
      headline: "Variabilität ist das, was die Forschung konsistent findet.",
      lead: "Drei Dinge, an denen du dich orientieren kannst.",
    },
    {
      type: "content",
      seg: " Erstens: Die nächste Haltung ist die beste Haltung. Egal wie du gerade sitzt oder stehst – die beste Haltung ist die, in die du als nächstes wechselst. Sitzen, stehen, lehnen, hocken, liegen – alles gut, solange du wechselst.",
      kicker: "Prinzip 1",
      headline: "Die nächste Haltung ist die beste Haltung.",
      lead: "Egal wie du gerade sitzt oder stehst – sitzen, stehen, lehnen, hocken, liegen ist alles gut, solange du wechselst.",
    },
    {
      type: "content",
      seg: " Zweitens: Bewegung schlägt Position. Selbst eine schlechte Position ist okay, solange du dabei kleine Bewegungen machst. Zappel mit den Füßen. Streck die Arme. Roll mit den Schultern. Diese Mikro-Bewegungen halten Gewebe durchblutet und Nervensystem in Sicherheit.",
      kicker: "Prinzip 2",
      headline: "Bewegung schlägt Position.",
      lead: "Selbst eine schlechte Position ist okay mit kleinen Bewegungen: mit den Füßen zappeln, die Arme strecken, die Schultern rollen. Das hält Gewebe durchblutet und das Nervensystem in Sicherheit.",
    },
    {
      type: "content",
      seg: " Drittens: Dein Körper kennt sich selbst. Wenn du in einer Position spürst, dass du sie gleich loswerden willst, glaub diesem Signal. Wechsel. Das Signal ist klüger als jede ergonomische Empfehlung. Wenn du in einer Position sehr lange entspannt bist, ist das auch in Ordnung – du musst nicht zwanghaft alle dreißig Sekunden wechseln.",
      kicker: "Prinzip 3",
      headline: "Dein Körper kennt sich selbst – vertrau dem Signal.",
      lead: "Willst du eine Position loswerden, glaub dem Signal und wechsle. Es ist klüger als jede ergonomische Empfehlung. Und bist du lange entspannt, musst du nicht zwanghaft alle dreißig Sekunden wechseln.",
    },
    {
      type: "content",
      seg: " Was du nach dieser Lektion nicht mehr tun musst: dich selbst zur Haltung erziehen. Permanent kontrollieren, ob du gerade richtig sitzt. Schuldgefühle haben, wenn du im Sofa zusammensackst. Diese mentale Last fällt weg.",
      kicker: "Was wegfällt",
      headline: "Keine Selbstkontrolle, keine Schuldgefühle mehr im Sofa.",
      lead: "Du musst dich nicht mehr zur Haltung erziehen oder permanent kontrollieren, ob du richtig sitzt. Diese mentale Last fällt weg.",
    },
    {
      type: "statement",
      seg: "",
      text: "Du kannst aufhören, dich zur Haltung zu erziehen.",
      emphasis: "aufhören",
    },
  ],
};

// ── Abschnitt 6 – Praktische Empfehlungen ────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Praktische Empfehlungen",
  narration:
    "Wenn du an deinem Arbeitsplatz – oder grundsätzlich im Alltag – die Variabilitäts-Idee umsetzen willst, drei konkrete Tipps. Erstens: Mehrere Sitz-Optionen. Wechsel zwischen Stuhl, Hocker und – wenn möglich – Stehen. Ein höhenverstellbarer Schreibtisch ist eine gute Investition, aber kein Muss. Ein zweiter Stuhl mit anderer Sitzform geht auch. Zweitens: Bewegungs-Trigger. Wir kommen in Modul 4 ausführlich darauf zurück. Aber schon jetzt: Verknüpfe Positionswechsel mit anderen Aktivitäten, die ohnehin passieren. Beim Telefonieren stehst du. Wenn der Computer hochfährt, machst du fünf Hip Hinges. Wenn das Mailprogramm öffnet, machst du eine Cat-Cow. Solche Mikro-Anker helfen, die Variabilität nicht zu vergessen. Drittens: Spaziergänge in den Tag bauen. Mittagspause: zehn Minuten draußen gehen. Nach Feierabend: nicht direkt heim, sondern eine Runde drehen. Wenn du nicht ins Büro fährst, ein kurzer Vor- und Nach-Arbeit-Spaziergang als Ritual. Bewegung ist dein wichtigster Variabilitäts-Generator – und sie hat zusätzlich messbar schmerzreduzierende Effekte.",
  slides: [
    {
      type: "content",
      seg: "Wenn du an deinem Arbeitsplatz – oder grundsätzlich im Alltag – die Variabilitäts-Idee umsetzen willst, drei konkrete Tipps.",
      kicker: "Praktisch",
      headline: "Drei konkrete Tipps, um Variabilität in den Alltag zu bringen.",
    },
    {
      type: "content",
      seg: " Erstens: Mehrere Sitz-Optionen. Wechsel zwischen Stuhl, Hocker und – wenn möglich – Stehen. Ein höhenverstellbarer Schreibtisch ist eine gute Investition, aber kein Muss. Ein zweiter Stuhl mit anderer Sitzform geht auch.",
      kicker: "Tipp 1 · Mehrere Sitz-Optionen",
      headline: "Wechsel zwischen Stuhl, Hocker und – wenn möglich – Stehen.",
      lead: "Ein höhenverstellbarer Schreibtisch ist eine gute Investition, aber kein Muss. Ein zweiter Stuhl mit anderer Sitzform geht auch.",
    },
    {
      type: "content",
      seg: " Zweitens: Bewegungs-Trigger. Wir kommen in Modul 4 ausführlich darauf zurück. Aber schon jetzt: Verknüpfe Positionswechsel mit anderen Aktivitäten, die ohnehin passieren. Beim Telefonieren stehst du. Wenn der Computer hochfährt, machst du fünf Hip Hinges. Wenn das Mailprogramm öffnet, machst du eine Cat-Cow. Solche Mikro-Anker helfen, die Variabilität nicht zu vergessen.",
      kicker: "Tipp 2 · Bewegungs-Trigger",
      headline: "Verknüpfe Positionswechsel mit Dingen, die ohnehin passieren.",
      lead: "Beim Telefonieren stehst du. Computer fährt hoch: fünf Hip Hinges. Mailprogramm öffnet: eine Cat-Cow. Solche Mikro-Anker helfen, die Variabilität nicht zu vergessen.",
    },
    {
      type: "content",
      seg: " Drittens: Spaziergänge in den Tag bauen. Mittagspause: zehn Minuten draußen gehen. Nach Feierabend: nicht direkt heim, sondern eine Runde drehen. Wenn du nicht ins Büro fährst, ein kurzer Vor- und Nach-Arbeit-Spaziergang als Ritual. Bewegung ist dein wichtigster Variabilitäts-Generator – und sie hat zusätzlich messbar schmerzreduzierende Effekte.",
      kicker: "Tipp 3 · Spaziergänge",
      headline: "Bewegung ist dein wichtigster Variabilitäts-Generator.",
      lead: "Mittagspause zehn Minuten draußen, nach Feierabend eine Runde drehen, im Homeoffice ein Vor- und Nach-Arbeit-Spaziergang als Ritual. Bewegung wirkt zusätzlich messbar schmerzreduzierend.",
    },
  ],
};

// ── Abschnitt 7 – Workbook und Übergang ──────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 3.2: Meine eigenen Haltungs-Mythen. Du listest dort drei Überzeugungen, die du über richtige und falsche Haltung hast – und überprüfst sie kritisch im Licht dieser Lektion. Welche kannst du loslassen? Welche willst du behalten? In der nächsten Lektion – 3.3 – kommen die unsichtbaren Schmerzmodulatoren. Schlaf, Stress, Ernährung. Drei Faktoren, die viel mehr Einfluss auf chronischen Schmerz haben, als die meisten Menschen vermuten. Wir schauen uns an, was wirklich zählt – ohne in den Diät-Wahn oder die Selbstoptimierungs-Falle zu kippen. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 3.2: Meine eigenen Haltungs-Mythen. Du listest dort drei Überzeugungen, die du über richtige und falsche Haltung hast – und überprüfst sie kritisch im Licht dieser Lektion. Welche kannst du loslassen? Welche willst du behalten?",
      kicker: "Workbook · Übung 3.2",
      headline: "Meine eigenen Haltungs-Mythen – drei Überzeugungen kritisch prüfen.",
      lead: "Du listest drei Überzeugungen über richtige und falsche Haltung und prüfst sie im Licht dieser Lektion: Welche kannst du loslassen? Welche willst du behalten?",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 3.3 – kommen die unsichtbaren Schmerzmodulatoren. Schlaf, Stress, Ernährung. Drei Faktoren, die viel mehr Einfluss auf chronischen Schmerz haben, als die meisten Menschen vermuten. Wir schauen uns an, was wirklich zählt – ohne in den Diät-Wahn oder die Selbstoptimierungs-Falle zu kippen.",
      kicker: "Als Nächstes · Lektion 3.3",
      headline: "Die unsichtbaren Schmerzmodulatoren – Schlaf, Stress, Ernährung.",
      lead: "Drei Faktoren mit mehr Einfluss auf chronischen Schmerz, als die meisten vermuten. Was wirklich zählt – ohne Diät-Wahn, ohne Selbstoptimierungs-Falle.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 3.3",
      nextTitle: "Schlaf, Stress, Ernährung als Schmerzmodulatoren",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "3.2",
  title: "Haltungs-Mythen entzaubert",
  subtitle: "Modul 3 – Prävention · Variabilität schlägt Perfektion",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
    abschnitt7,
  ],
};
