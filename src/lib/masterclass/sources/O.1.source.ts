/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion O.1
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/O.1.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs O.1`). Niemals lessons/O.1.ts von Hand
 * editieren — immer hier ändern und das Build-Skript erneut laufen lassen.
 *
 * Erste Outro-Lektion: konzeptuelle Verdichtung der ganzen Masterclass auf drei
 * Kernbotschaften. Emotional/zusammenfassend → viel Raum für statement-/term-/
 * word-Slides (große Typo, Weißraum). Themenblöcke / Abschnitte:
 *   - Eröffnung:                       Abschnitt 1.
 *   - Kernbotschaft 1 (Verstehen):     Abschnitt 2.
 *   - Kernbotschaft 2 (Bewegung):      Abschnitt 3.
 *   - Kernbotschaft 3 (System trägt):  Abschnitt 4.
 *   - Die drei Sätze als Anker:        Abschnitt 5 (Workbook + Übergang O.2).
 *
 * Aufbau identisch zu I.1 / 4.6:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`. Erste Slide je
 *     Abschnitt: `seg = ""` (→ appearTime 0).
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–5) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die Meta-Tabelle der MD werden NICHT vertont.
 *
 * 3.-PERSON-REGEL (angewandt): die Stimme (Adrian) darf den Ersteller Max Glawe
 * nicht vortäuschen. Persönliche Ersteller-/Praxis-/Credential-Ichs der MD wurden
 * daher auf „Max Glawe / er / seine Praxis" umgeschrieben:
 *   - MD: „Diese drei Sätze sind das, was ich in meiner Praxis nach hunderten
 *     Gesprächen mit chronischen Schmerzpatienten als die zentralen Einsichten
 *     identifiziert habe."
 *     → „Diese drei Sätze sind das, was Max Glawe in seiner Praxis nach hunderten
 *       Gesprächen mit chronischen Schmerzpatienten als die zentralen Einsichten
 *       identifiziert hat."
 *   - MD: „Das ist nicht meine Behauptung – das ist eine der best-belegten Befunde …"
 *     → „Das ist keine bloße Behauptung – das ist einer der best-belegten Befunde …"
 *   - MD: „Wenn ich in der Praxis einen Satz wählen müsste, der die ganze
 *     Behandlungs-Philosophie zusammenfasst, dann diesen."
 *     → „Wenn Max Glawe in seiner Praxis einen Satz wählen müsste, der die ganze
 *       Behandlungs-Philosophie zusammenfasst, dann diesen."
 *   Die generische Guide-/Du-Form (z.B. „verdichte ich die Inhalte", „die du dir
 *   hier erarbeitet hast") bleibt — sie täuscht keine Credentials vor.
 *
 * HWG: Der MD-Wortlaut wird – außer der 3.-Person-Umschreibung – beibehalten.
 *   Kein Heilversprechen; „Schmerzwissen reduziert Schmerz" ist als Forschungs-
 *   aussage formuliert, nicht als individuelles Heilversprechen.
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
    "Willkommen zum Outro. Wir sind am Ende der Masterclass. Du hast vier Module hinter dir – Verstehen, Handeln, Prävention, Recoping. Du hast wahrscheinlich um die zehn Stunden an Inhalt durchgearbeitet, dazu deine Workbook-Übungen, deine Ritual-Map, dein Flare-up-Protokoll. Was nimmst du mit? Wenn du in einem Jahr noch eine Sache aus dieser Masterclass im Kopf hast – was sollte das sein? In dieser ersten Outro-Lektion verdichte ich die ganzen Inhalte auf drei Kernbotschaften. Drei Sätze, die alles zusammenhalten. Diese drei Sätze sind das, was Max Glawe in seiner Praxis nach hunderten Gesprächen mit chronischen Schmerzpatienten als die zentralen Einsichten identifiziert hat. Wer diese drei verinnerlicht, hat ein gutes Fundament für die nächsten Jahre.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Outro",
      lessonLabel: "Lektion O.1 – Drei Kernbotschaften",
    },
    {
      type: "content",
      seg: "Willkommen zum Outro. Wir sind am Ende der Masterclass. Du hast vier Module hinter dir – Verstehen, Handeln, Prävention, Recoping.",
      kicker: "Am Ende der Masterclass",
      headline: "Vier Module liegen hinter dir.",
      lead: "Verstehen, Handeln, Prävention, Recoping.",
    },
    {
      type: "content",
      seg: " Du hast wahrscheinlich um die zehn Stunden an Inhalt durchgearbeitet, dazu deine Workbook-Übungen, deine Ritual-Map, dein Flare-up-Protokoll.",
      headline: "Rund zehn Stunden Inhalt – plus alles, was du selbst gebaut hast.",
      lead: "Workbook-Übungen, Ritual-Map, Flare-up-Protokoll.",
    },
    {
      type: "statement",
      seg: " Was nimmst du mit? Wenn du in einem Jahr noch eine Sache aus dieser Masterclass im Kopf hast – was sollte das sein?",
      text: "Wenn du eine Sache mitnimmst – was sollte das sein?",
      emphasis: "eine Sache",
    },
    {
      type: "content",
      seg: " In dieser ersten Outro-Lektion verdichte ich die ganzen Inhalte auf drei Kernbotschaften. Drei Sätze, die alles zusammenhalten.",
      kicker: "Drei Kernbotschaften",
      headline: "Wir verdichten die ganze Masterclass auf drei Sätze.",
      lead: "Drei Sätze, die alles zusammenhalten.",
    },
    {
      type: "content",
      seg: " Diese drei Sätze sind das, was Max Glawe in seiner Praxis nach hunderten Gesprächen mit chronischen Schmerzpatienten als die zentralen Einsichten identifiziert hat. Wer diese drei verinnerlicht, hat ein gutes Fundament für die nächsten Jahre.",
      kicker: "Die zentralen Einsichten",
      headline: "Was nach hunderten Gesprächen in der Praxis übrig bleibt.",
      lead: "Wer diese drei verinnerlicht, hat ein gutes Fundament für die nächsten Jahre.",
    },
  ],
};

// ── Abschnitt 2 – Kernbotschaft 1: Verstehen verändert ───────────────────────

const abschnitt2: SourceSection = {
  title: "Kernbotschaft 1: Verstehen verändert",
  narration:
    "Erste Kernbotschaft: Verstehen verändert. Du hast in Modul 1 viel Anatomie, Physiologie und Schmerztheorie gelernt. Vielleicht hast du dich gefragt: Wozu eigentlich? Bringt mir das wirklich etwas, wenn ich weiß, wie eine Bandscheibe aufgebaut ist oder was zentrale Sensibilisierung bedeutet? Die Antwort ist klar: ja. Verstehen ist therapeutisch. Das ist keine bloße Behauptung – das ist einer der best-belegten Befunde der modernen Schmerzforschung. Schmerzwissen reduziert Schmerz. Direkt. Warum? Weil Schmerz nicht primär ein Strukturproblem ist – Schmerz ist ein Interpretations-Problem. Dein Gehirn interpretiert Signale aus deinem Rücken im Licht dessen, was es weiß und glaubt. Wer glaubt, jede Bewegung schade einer kaputten Bandscheibe, hat ein Gehirn, das Schmerzsignale verstärkt. Wer versteht, dass Bandscheibenveränderungen normal sind, Schmerz nicht direkt mit Struktur korreliert und Bewegung dem System hilft – hat ein Gehirn, das anders interpretiert. Das Wissen aus Modul 1 ist deshalb kein nettes Beiwerk. Es ist therapeutische Substanz. Jeder klare Gedanke, den du heute über deinen Schmerz hast – jedes Mal, wenn du dich erinnerst Befund ist nicht gleich Schmerz oder Bewegung ist Information – ist eine kleine Re-Kalibrierung deines Schmerzsystems. Verstehen verändert. Es ist eine der mächtigsten Sachen, die du dir selber geben kannst.",
  slides: [
    {
      type: "term",
      seg: "Erste Kernbotschaft: Verstehen verändert.",
      kicker: "Erste Kernbotschaft",
      term: "Verstehen verändert.",
    },
    {
      type: "content",
      seg: " Du hast in Modul 1 viel Anatomie, Physiologie und Schmerztheorie gelernt. Vielleicht hast du dich gefragt: Wozu eigentlich? Bringt mir das wirklich etwas, wenn ich weiß, wie eine Bandscheibe aufgebaut ist oder was zentrale Sensibilisierung bedeutet?",
      kicker: "Wozu eigentlich?",
      headline: "Bringt es wirklich etwas, das alles zu wissen?",
      lead: "Wie eine Bandscheibe aufgebaut ist, was zentrale Sensibilisierung bedeutet.",
    },
    {
      type: "statement",
      seg: " Die Antwort ist klar: ja. Verstehen ist therapeutisch.",
      text: "Verstehen ist therapeutisch.",
      emphasis: "therapeutisch",
    },
    {
      type: "quote",
      seg: " Das ist keine bloße Behauptung – das ist einer der best-belegten Befunde der modernen Schmerzforschung. Schmerzwissen reduziert Schmerz. Direkt.",
      text: "Schmerzwissen reduziert Schmerz.",
      caption: "Forschung, nicht Esoterik.",
    },
    {
      type: "content",
      seg: " Warum? Weil Schmerz nicht primär ein Strukturproblem ist – Schmerz ist ein Interpretations-Problem. Dein Gehirn interpretiert Signale aus deinem Rücken im Licht dessen, was es weiß und glaubt.",
      kicker: "Warum?",
      headline: "Schmerz ist kein Strukturproblem – er ist ein Interpretations-Problem.",
      lead: "Dein Gehirn interpretiert die Signale im Licht dessen, was es weiß und glaubt.",
    },
    {
      type: "content",
      seg: " Wer glaubt, jede Bewegung schade einer kaputten Bandscheibe, hat ein Gehirn, das Schmerzsignale verstärkt. Wer versteht, dass Bandscheibenveränderungen normal sind, Schmerz nicht direkt mit Struktur korreliert und Bewegung dem System hilft – hat ein Gehirn, das anders interpretiert.",
      dark: true,
      headline: "Wer anders glaubt, hat ein Gehirn, das anders interpretiert.",
      lead: "Angst verstärkt Schmerzsignale. Verstehen kalibriert sie neu.",
    },
    {
      type: "content",
      seg: " Das Wissen aus Modul 1 ist deshalb kein nettes Beiwerk. Es ist therapeutische Substanz. Jeder klare Gedanke, den du heute über deinen Schmerz hast – jedes Mal, wenn du dich erinnerst Befund ist nicht gleich Schmerz oder Bewegung ist Information – ist eine kleine Re-Kalibrierung deines Schmerzsystems.",
      kicker: "Kein nettes Beiwerk",
      headline: "Jeder klare Gedanke ist eine kleine Re-Kalibrierung deines Schmerzsystems.",
      lead: "„Befund ist nicht gleich Schmerz.“ „Bewegung ist Information.“",
    },
    {
      type: "statement",
      seg: " Verstehen verändert. Es ist eine der mächtigsten Sachen, die du dir selber geben kannst.",
      text: "Eine der mächtigsten Sachen, die du dir selbst geben kannst.",
      emphasis: "selbst",
    },
  ],
};

// ── Abschnitt 3 – Kernbotschaft 2: Bewegung ist Information ──────────────────

const abschnitt3: SourceSection = {
  title: "Kernbotschaft 2: Bewegung ist Information",
  narration:
    "Zweite Kernbotschaft: Bewegung ist Information. Wenn Max Glawe in seiner Praxis einen Satz wählen müsste, der die ganze Behandlungs-Philosophie zusammenfasst, dann diesen. Bewegung ist Information. Was bedeutet das? Bewegung ist nicht primär Training für Muskeln. Bewegung ist nicht primär mechanische Belastung. Bewegung ist Information an dein Nervensystem. Eine Botschaft. Eine Mitteilung. Wenn du dich bewegst, schickst du deinem System die Information: Wir sind in Sicherheit. Dieses Gewebe trägt. Hier sind keine Gefahren. Dein Gehirn lernt, deinen Rücken neu zu interpretieren. Es senkt schrittweise die Schmerzschwelle. Es gewöhnt sich daran, dass Belastung verträglich ist. Umgekehrt: Wenn du dich schonst, schickst du die Information: Hier ist etwas Gefährliches. Hier muss ich vorsichtig sein. Dein Gehirn lernt das ebenfalls – und verstärkt die Schmerzempfindlichkeit. Genau deshalb funktioniert das Drei-Schienen-System der Masterclass so gut. Auch in schlechten Phasen machst du etwas – auf reizarmer Schiene. Du sagst deinem System: Hier ist Bewegung. Auch heute. In dieser sanften Form. Du brichst die Botschaft nicht ab. Du dosierst sie nur. Wenn du diese Idee verinnerlichst – Bewegung ist Information, nicht Pflicht, nicht Training, nicht Strafe – verändert sich deine ganze Beziehung zu Übungen. Übungen werden zu Gesprächen mit deinem Nervensystem.",
  slides: [
    {
      type: "term",
      seg: "Zweite Kernbotschaft: Bewegung ist Information.",
      kicker: "Zweite Kernbotschaft",
      term: "Bewegung ist Information.",
    },
    {
      type: "content",
      seg: " Wenn Max Glawe in seiner Praxis einen Satz wählen müsste, der die ganze Behandlungs-Philosophie zusammenfasst, dann diesen. Bewegung ist Information.",
      kicker: "Die ganze Behandlungs-Philosophie in einem Satz",
      headline: "Wenn nur ein Satz bliebe, dann dieser.",
      lead: "Bewegung ist Information.",
    },
    {
      type: "content",
      seg: " Was bedeutet das? Bewegung ist nicht primär Training für Muskeln. Bewegung ist nicht primär mechanische Belastung. Bewegung ist Information an dein Nervensystem. Eine Botschaft. Eine Mitteilung.",
      kicker: "Was bedeutet das?",
      headline: "Bewegung ist nicht Training und nicht Belastung – sie ist eine Botschaft.",
      lead: "Information an dein Nervensystem. Eine Mitteilung.",
    },
    {
      type: "quote",
      seg: " Wenn du dich bewegst, schickst du deinem System die Information: Wir sind in Sicherheit. Dieses Gewebe trägt. Hier sind keine Gefahren. Dein Gehirn lernt, deinen Rücken neu zu interpretieren. Es senkt schrittweise die Schmerzschwelle. Es gewöhnt sich daran, dass Belastung verträglich ist.",
      text: "Wir sind in Sicherheit. Dieses Gewebe trägt.",
      caption: "Die Botschaft der Bewegung. Dein Gehirn senkt schrittweise die Schmerzschwelle.",
    },
    {
      type: "quote",
      seg: " Umgekehrt: Wenn du dich schonst, schickst du die Information: Hier ist etwas Gefährliches. Hier muss ich vorsichtig sein. Dein Gehirn lernt das ebenfalls – und verstärkt die Schmerzempfindlichkeit.",
      dark: true,
      text: "Hier ist etwas Gefährliches. Hier muss ich vorsichtig sein.",
      caption: "Die Botschaft der Schonung – sie verstärkt die Schmerzempfindlichkeit.",
    },
    {
      type: "content",
      seg: " Genau deshalb funktioniert das Drei-Schienen-System der Masterclass so gut. Auch in schlechten Phasen machst du etwas – auf reizarmer Schiene. Du sagst deinem System: Hier ist Bewegung. Auch heute. In dieser sanften Form. Du brichst die Botschaft nicht ab. Du dosierst sie nur.",
      kicker: "Das Drei-Schienen-System",
      headline: "Auch in schlechten Phasen machst du etwas – auf reizarmer Schiene.",
      lead: "Du brichst die Botschaft nicht ab. Du dosierst sie nur.",
    },
    {
      type: "statement",
      seg: " Wenn du diese Idee verinnerlichst – Bewegung ist Information, nicht Pflicht, nicht Training, nicht Strafe – verändert sich deine ganze Beziehung zu Übungen. Übungen werden zu Gesprächen mit deinem Nervensystem.",
      text: "Übungen werden zu Gesprächen mit deinem Nervensystem.",
      emphasis: "Gesprächen",
    },
  ],
};

// ── Abschnitt 4 – Kernbotschaft 3: Das System trägt sich selbst ──────────────

const abschnitt4: SourceSection = {
  title: "Kernbotschaft 3: Das System trägt sich selbst",
  narration:
    "Dritte Kernbotschaft: Das System trägt sich selbst. Diese ist vielleicht die wichtigste. Und sicher diejenige, die am schwersten zu glauben ist, bis man sie selbst erlebt. Was meine ich damit? Wenn du dein System richtig aufgebaut hast – Ritual-Map, Mikro-Routinen, dediziertes Training, Lifestyle-Hygiene – dann läuft es nach einigen Monaten ohne Motivation. Es braucht dich nicht jeden Tag zu überzeugen. Es trägt sich selbst. Die Trigger sind da. Der Kaffee läuft, du machst Hip Hinge. Du putzt Zähne, du machst Pelvic Tilt. Du gehst ins Bett, du atmest. Diese Sequenzen werden Teil deiner Identität. Sie laufen, weil sie an stabile Tagesanker geknüpft sind, nicht weil du jeden Tag dazu überreden musst. Das ist die Befreiung von chronischem Schmerz – nicht die Schmerzfreiheit selbst. Es ist die Freiheit von der täglichen Schmerz-Überforderung. Die Freiheit, ein normales Leben zu führen, in dem dein Rücken eine ungenutzte Stütze ist, kein lautes Problem. Die Freiheit, an deinen Schmerz nicht ständig denken zu müssen, weil dein System die Pflege ohne dich macht. Diese Freiheit kommt nicht von heute auf morgen. Sie braucht die ersten vier bis acht Wochen, in denen du dein System aufbaust und einübst. Aber wenn die Trigger einmal sitzen, hält sich das System mit minimaler Energie. Du machst nicht mehr Therapie – du lebst in einer Art, die deinen Rücken pflegt. Das ist das ultimative Ziel der ganzen Masterclass. Nicht ein bestimmter Schmerzwert. Nicht eine bestimmte funktionelle Leistung. Sondern: ein System, das sich selbst trägt. Eine Lebens-Architektur, in der dein Rücken gut versorgt ist, ohne dass du jeden Tag bewusst daran arbeiten musst.",
  slides: [
    {
      type: "term",
      seg: "Dritte Kernbotschaft: Das System trägt sich selbst.",
      kicker: "Dritte Kernbotschaft",
      term: "Das System trägt sich selbst.",
    },
    {
      type: "content",
      seg: " Diese ist vielleicht die wichtigste. Und sicher diejenige, die am schwersten zu glauben ist, bis man sie selbst erlebt.",
      kicker: "Vielleicht die wichtigste",
      headline: "Am schwersten zu glauben – bis man sie selbst erlebt.",
    },
    {
      type: "content",
      seg: " Was meine ich damit? Wenn du dein System richtig aufgebaut hast – Ritual-Map, Mikro-Routinen, dediziertes Training, Lifestyle-Hygiene – dann läuft es nach einigen Monaten ohne Motivation. Es braucht dich nicht jeden Tag zu überzeugen. Es trägt sich selbst.",
      kicker: "Was das heißt",
      headline: "Nach einigen Monaten läuft das System ohne Motivation.",
      lead: "Ritual-Map, Mikro-Routinen, dediziertes Training, Lifestyle-Hygiene – es braucht dich nicht jeden Tag zu überzeugen.",
    },
    {
      type: "reveal-list",
      seg: " Die Trigger sind da. Der Kaffee läuft, du machst Hip Hinge. Du putzt Zähne, du machst Pelvic Tilt. Du gehst ins Bett, du atmest. Diese Sequenzen werden Teil deiner Identität. Sie laufen, weil sie an stabile Tagesanker geknüpft sind, nicht weil du jeden Tag dazu überreden musst.",
      kicker: "Die Trigger sind da",
      title: "Es läuft an deinen Tagesankern",
      items: [
        { label: "Der Kaffee läuft – du machst Hip Hinge" },
        { label: "Du putzt Zähne – du machst Pelvic Tilt" },
        { label: "Du gehst ins Bett – du atmest" },
      ],
    },
    {
      type: "content",
      seg: " Das ist die Befreiung von chronischem Schmerz – nicht die Schmerzfreiheit selbst. Es ist die Freiheit von der täglichen Schmerz-Überforderung. Die Freiheit, ein normales Leben zu führen, in dem dein Rücken eine ungenutzte Stütze ist, kein lautes Problem. Die Freiheit, an deinen Schmerz nicht ständig denken zu müssen, weil dein System die Pflege ohne dich macht.",
      dark: true,
      kicker: "Die eigentliche Befreiung",
      headline: "Nicht die Schmerzfreiheit – die Freiheit, nicht mehr ständig daran denken zu müssen.",
      lead: "Ein Leben, in dem dein Rücken eine ungenutzte Stütze ist, kein lautes Problem.",
    },
    {
      type: "content",
      seg: " Diese Freiheit kommt nicht von heute auf morgen. Sie braucht die ersten vier bis acht Wochen, in denen du dein System aufbaust und einübst. Aber wenn die Trigger einmal sitzen, hält sich das System mit minimaler Energie. Du machst nicht mehr Therapie – du lebst in einer Art, die deinen Rücken pflegt.",
      kicker: "Die ersten vier bis acht Wochen",
      headline: "Du machst nicht mehr Therapie – du lebst in einer Art, die deinen Rücken pflegt.",
      lead: "Wenn die Trigger einmal sitzen, hält sich das System mit minimaler Energie.",
    },
    {
      type: "statement",
      seg: " Das ist das ultimative Ziel der ganzen Masterclass. Nicht ein bestimmter Schmerzwert. Nicht eine bestimmte funktionelle Leistung. Sondern: ein System, das sich selbst trägt. Eine Lebens-Architektur, in der dein Rücken gut versorgt ist, ohne dass du jeden Tag bewusst daran arbeiten musst.",
      text: "Das ultimative Ziel: ein System, das sich selbst trägt.",
      emphasis: "selbst trägt",
    },
  ],
};

// ── Abschnitt 5 – Die drei Sätze als Ankerkarten ─────────────────────────────

const abschnitt5: SourceSection = {
  title: "Die drei Sätze als Ankerkarten",
  narration:
    "Drei Sätze: Verstehen verändert. Bewegung ist Information. Das System trägt sich selbst. Im Workbook findest du eine Reflexionsseite mit dem Titel Meine drei Mitnehm-Sätze. Drei leere Felder. Du kannst diese drei Sätze hineinschreiben – oder eigene Versionen, die für dich klingen. Oder einen vierten Satz, den du selbst formulieren willst. Was wichtig ist: Hab diese Sätze irgendwo zugänglich. Manche Patienten schreiben sie sich auf eine Karte und stecken sie ins Portemonnaie. Andere haben sie als Hintergrundbild im Handy. Wieder andere haben sie auf einem Post-it am Badezimmerspiegel. Wenn du an einem schlechten Tag bist – diese drei Sätze sind dein Erinnerungsanker. Sie holen dich zurück in die Perspektive, die du dir hier erarbeitet hast. In der letzten Lektion – O.2 – machen wir den eigentlichen Abschluss. Es geht um die Übergabe. Was du jetzt bist, wenn du diese Masterclass abgeschlossen hast. Wo du Unterstützung finden kannst, wenn du sie brauchst. Und ein persönlicher Abschluss. Bis gleich.",
  slides: [
    {
      type: "reveal-list",
      seg: "Drei Sätze: Verstehen verändert. Bewegung ist Information. Das System trägt sich selbst.",
      kicker: "Deine drei Mitnehm-Sätze",
      title: "Drei Sätze, die alles zusammenhalten",
      items: [
        { label: "Verstehen verändert." },
        { label: "Bewegung ist Information." },
        { label: "Das System trägt sich selbst." },
      ],
    },
    {
      type: "content",
      seg: " Im Workbook findest du eine Reflexionsseite mit dem Titel Meine drei Mitnehm-Sätze. Drei leere Felder. Du kannst diese drei Sätze hineinschreiben – oder eigene Versionen, die für dich klingen. Oder einen vierten Satz, den du selbst formulieren willst.",
      kicker: "Workbook · Meine drei Mitnehm-Sätze",
      headline: "Drei leere Felder – für diese Sätze oder deine eigenen.",
      lead: "Schreib sie hinein, formuliere eigene Versionen, oder ergänze einen vierten Satz, der für dich klingt.",
    },
    {
      type: "reveal-list",
      seg: " Was wichtig ist: Hab diese Sätze irgendwo zugänglich. Manche Patienten schreiben sie sich auf eine Karte und stecken sie ins Portemonnaie. Andere haben sie als Hintergrundbild im Handy. Wieder andere haben sie auf einem Post-it am Badezimmerspiegel.",
      kicker: "Hab sie zugänglich",
      title: "Wohin damit?",
      items: [
        { label: "Auf eine Karte ins Portemonnaie" },
        { label: "Als Hintergrundbild im Handy" },
        { label: "Auf ein Post-it am Badezimmerspiegel" },
      ],
    },
    {
      type: "statement",
      seg: " Wenn du an einem schlechten Tag bist – diese drei Sätze sind dein Erinnerungsanker. Sie holen dich zurück in die Perspektive, die du dir hier erarbeitet hast.",
      text: "An einem schlechten Tag sind diese drei Sätze dein Erinnerungsanker.",
      emphasis: "Erinnerungsanker",
    },
    {
      type: "content",
      seg: " In der letzten Lektion – O.2 – machen wir den eigentlichen Abschluss. Es geht um die Übergabe. Was du jetzt bist, wenn du diese Masterclass abgeschlossen hast. Wo du Unterstützung finden kannst, wenn du sie brauchst. Und ein persönlicher Abschluss.",
      kicker: "Als Nächstes · Lektion O.2",
      headline: "In der letzten Lektion machen wir den eigentlichen Abschluss.",
      lead: "Die Übergabe: was du jetzt bist, wo du Unterstützung findest – und ein persönlicher Abschluss.",
    },
    {
      type: "outro",
      seg: " Bis gleich.",
      nextLabel: "Outro · Lektion O.2",
      nextTitle: "Die Übergabe",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "O.1",
  title: "Drei Kernbotschaften",
  subtitle: "Outro · Verstehen verändert · Bewegung ist Information · Das System trägt sich selbst",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
  ],
};
