/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 4.1
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/4.1.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 4.1`). Niemals lessons/4.1.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Erste Lektion von Modul 4 (Recoping) und das theoretische Fundament des Moduls.
 * „Das Habit-Stacking-Konzept": warum Übungen ohne System scheitern (Motivation
 * vs. Trigger), Habit Stacking nach BJ Fogg / James Clear, der schmerzadaptive
 * Twist (Trigger konstant, Übung in drei Schienen), warum die Methode perfekt für
 * chronischen Schmerz ist, Vorbereitung auf 4.2/4.3 und Workbook. Themenblöcke /
 * Slide-Gruppen klar getrennt:
 *   - Warum Übungen scheitern:  Abschnitt 2 (Motivation vs. Trigger).
 *   - Habit Stacking erklärt:   Abschnitt 3 (Formel, Beispiele, drei Gründe).
 *   - Schmerzadaptiver Twist:   Abschnitt 4 (Trigger konstant, drei Schienen).
 *   - Warum perfekt:            Abschnitt 5 (fünf Vorteile).
 *   - Vorbereitung:             Abschnitt 6 (Ausblick 4.2/4.3).
 *   - Workbook + Übergang:      Abschnitt 7.
 * Keine klassischen Übungen — eine Konzept-/Methoden-Lektion. Aufbau identisch zu
 * 3.1–3.4:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt; Aufzählungspunkte/Beispiele zu Fließtext verdichtet).
 *     EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–7) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke, die Meta-Tabelle und der Modul-Trenner der MD werden
 * NICHT vertont.
 *
 * 3.-PERSON-REGEL (angewandt): 4.1 enthält EINE Stelle mit persönlichem
 * Ersteller-/Credential-Ich (kein generischer Guide-„wir"), die auf „Max Glawe"
 * umgeschrieben wurde:
 *   - MD: „… und in der schmerzadaptiven Variante, die ich gleich vorstelle, ist es
 *     der wichtigste Recoping-Hebel, den ich kenne."
 *     → „… und in der schmerzadaptiven Variante, die Max Glawe gleich vorstellt, ist
 *        es der wichtigste Recoping-Hebel, den Max Glawe kennt."
 *   Generische Guide-/Wir-Form bleibt unverändert („Schauen wir uns kurz an …",
 *   „Wir reden von Unterschieden …").
 *
 * HWG: Wortlaut der MD wird – außer der 3.-Person-Umschreibung – beibehalten. Habit
 *   Stacking ist als Verhaltens-/Compliance-Methode beschrieben (Studienlage „zeigt
 *   konsistent", „höhere Compliance"), NICHT als medizinisches Heilversprechen. Die
 *   Sicherheits-/Anti-Chronifizierungs-Aussagen bleiben prozesshaft formuliert
 *   („gibst deinem Nervensystem Sicherheits-Information", „der wichtigste Anti-
 *   Chronifizierungs-Hebel") wie in der MD.
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
    "Willkommen in Modul 4. Wenn du Modul 3 abgeschlossen hast, hast du jetzt alles, was du brauchst: anatomisches Verständnis, ein gutes Schmerz-Modell, einen vollen Werkzeugkasten an Übungen, eine Belastbarkeits-Mentalität und Lifestyle-Wissen. Theoretisch könntest du jetzt einfach loslegen. Praktisch passiert dann oft Folgendes: Du machst in der ersten Woche begeistert mit. In der zweiten Woche immer noch ganz gut. In der dritten Woche kommt eine stressige Phase und du fällst zwei Tage aus. Aus zwei Tagen werden fünf. Aus fünf werden zehn. Dann bist du wieder bei null. Du fängst von vorne an. Diesmal mit etwas mehr Frust. Dieses Muster ist nicht dein persönliches Versagen. Es ist das Muster von praktisch allen Menschen, die ihr Verhalten ändern wollen – egal in welchem Bereich. Bewegung, Diät, Meditation, Sprachenlernen – überall dieselbe Geschichte. Der eigentliche Grund: Wir versuchen Verhaltensänderung mit Motivation und Disziplin zu erreichen. Aber Motivation ist endlich, und Disziplin lässt sich nicht über Jahre durchhalten. Was wir brauchen, ist ein System, das ohne Motivation funktioniert. Ein System, das sich selbst trägt. Genau das ist Habit Stacking – und in der schmerzadaptiven Variante, die Max Glawe gleich vorstellt, ist es der wichtigste Recoping-Hebel, den Max Glawe kennt.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 4 – Recoping",
      lessonLabel: "Lektion 4.1 – Das Habit-Stacking-Konzept",
    },
    {
      type: "content",
      seg: "Willkommen in Modul 4. Wenn du Modul 3 abgeschlossen hast, hast du jetzt alles, was du brauchst: anatomisches Verständnis, ein gutes Schmerz-Modell, einen vollen Werkzeugkasten an Übungen, eine Belastbarkeits-Mentalität und Lifestyle-Wissen. Theoretisch könntest du jetzt einfach loslegen.",
      kicker: "Modul 4 – Recoping",
      headline: "Du hast jetzt alles, was du brauchst.",
      lead: "Anatomisches Verständnis, ein gutes Schmerz-Modell, ein voller Werkzeugkasten, eine Belastbarkeits-Mentalität, Lifestyle-Wissen. Theoretisch könntest du einfach loslegen.",
    },
    {
      type: "content",
      seg: " Praktisch passiert dann oft Folgendes: Du machst in der ersten Woche begeistert mit. In der zweiten Woche immer noch ganz gut. In der dritten Woche kommt eine stressige Phase und du fällst zwei Tage aus. Aus zwei Tagen werden fünf. Aus fünf werden zehn. Dann bist du wieder bei null. Du fängst von vorne an. Diesmal mit etwas mehr Frust.",
      dark: true,
      kicker: "Was praktisch passiert",
      headline: "Woche eins begeistert, Woche drei zwei Tage aus – und du bist wieder bei null.",
      lead: "Aus zwei Tagen werden fünf, aus fünf werden zehn. Du fängst von vorne an, diesmal mit etwas mehr Frust.",
    },
    {
      type: "content",
      seg: " Dieses Muster ist nicht dein persönliches Versagen. Es ist das Muster von praktisch allen Menschen, die ihr Verhalten ändern wollen – egal in welchem Bereich. Bewegung, Diät, Meditation, Sprachenlernen – überall dieselbe Geschichte. Der eigentliche Grund: Wir versuchen Verhaltensänderung mit Motivation und Disziplin zu erreichen. Aber Motivation ist endlich, und Disziplin lässt sich nicht über Jahre durchhalten.",
      kicker: "Der eigentliche Grund",
      headline: "Wir versuchen Verhaltensänderung mit Motivation und Disziplin.",
      lead: "Das ist kein persönliches Versagen – es ist das Muster aller, die ihr Verhalten ändern wollen. Aber Motivation ist endlich, und Disziplin hält nicht über Jahre.",
    },
    {
      type: "statement",
      seg: " Was wir brauchen, ist ein System, das ohne Motivation funktioniert. Ein System, das sich selbst trägt. Genau das ist Habit Stacking – und in der schmerzadaptiven Variante, die Max Glawe gleich vorstellt, ist es der wichtigste Recoping-Hebel, den Max Glawe kennt.",
      text: "Wir brauchen ein System, das ohne Motivation funktioniert.",
      emphasis: "ohne Motivation",
    },
  ],
};

// ── Abschnitt 2 – Warum Übungen ohne System scheitern ────────────────────────

const abschnitt2: SourceSection = {
  title: "Warum Übungen ohne System scheitern",
  narration:
    "Schauen wir uns kurz an, warum Übungs-Routinen so oft scheitern – und warum das nicht persönliches Versagen ist. Die übliche Annahme: Wer sich genug motivieren kann, schafft Routine. Wenn du es nicht schaffst, fehlt dir Disziplin. Diese Annahme ist falsch und sie schadet jedem, dem es passiert. Was die Verhaltensforschung der letzten zwanzig Jahre konsistent zeigt: Verhalten wird nicht durch Motivation gesteuert. Verhalten wird durch Auslöser gesteuert. Wir tun, was wir tun, weil bestimmte Umgebungs- oder Zeit-Reize uns dazu bringen. Nicht weil wir besonders motiviert sind. Ein Beispiel: Du putzt jeden Morgen die Zähne. Du musst dich nicht jeden Morgen aufs Zähneputzen motivieren. Du machst es einfach. Weil der Trigger – du gehst ins Bad, du siehst die Zahnbürste, du bist gerade aufgewacht – die Handlung automatisch auslöst. Motivation ist hier null. Routine ist hundert Prozent. Wenn deine Übungs-Routine keinen festen Trigger hat – wenn sie davon abhängt, dass du dich irgendwann am Tag daran erinnerst und gerade Lust hast –, dann hängt sie an deiner Motivation. Und Motivation versagt. Nicht heute, nicht morgen, aber bald. Das ist der Grund, warum so viele Patienten genau dieselben Übungen kennen, die wir in Modul 2 gelernt haben, und sie trotzdem nicht regelmäßig machen. Die Übungen fehlen nicht. Was fehlt, sind die Trigger.",
  slides: [
    {
      type: "content",
      seg: "Schauen wir uns kurz an, warum Übungs-Routinen so oft scheitern – und warum das nicht persönliches Versagen ist. Die übliche Annahme: Wer sich genug motivieren kann, schafft Routine. Wenn du es nicht schaffst, fehlt dir Disziplin. Diese Annahme ist falsch und sie schadet jedem, dem es passiert.",
      kicker: "Warum Routinen scheitern",
      headline: "„Wer es nicht schafft, dem fehlt Disziplin.“ – Diese Annahme ist falsch.",
      lead: "Und sie schadet jedem, dem es passiert. Schauen wir uns an, warum Übungs-Routinen wirklich scheitern.",
    },
    {
      type: "statement",
      seg: " Was die Verhaltensforschung der letzten zwanzig Jahre konsistent zeigt: Verhalten wird nicht durch Motivation gesteuert. Verhalten wird durch Auslöser gesteuert. Wir tun, was wir tun, weil bestimmte Umgebungs- oder Zeit-Reize uns dazu bringen. Nicht weil wir besonders motiviert sind.",
      text: "Verhalten wird nicht durch Motivation gesteuert – sondern durch Auslöser.",
      emphasis: "durch Auslöser",
    },
    {
      type: "content",
      seg: " Ein Beispiel: Du putzt jeden Morgen die Zähne. Du musst dich nicht jeden Morgen aufs Zähneputzen motivieren. Du machst es einfach. Weil der Trigger – du gehst ins Bad, du siehst die Zahnbürste, du bist gerade aufgewacht – die Handlung automatisch auslöst. Motivation ist hier null. Routine ist hundert Prozent.",
      kicker: "Das Beispiel · Zähneputzen",
      headline: "Du putzt jeden Morgen die Zähne – ganz ohne Motivation.",
      lead: "Der Trigger – ins Bad gehen, die Zahnbürste sehen, gerade aufgewacht – löst die Handlung automatisch aus. Motivation null, Routine hundert Prozent.",
    },
    {
      type: "content",
      seg: " Wenn deine Übungs-Routine keinen festen Trigger hat – wenn sie davon abhängt, dass du dich irgendwann am Tag daran erinnerst und gerade Lust hast –, dann hängt sie an deiner Motivation. Und Motivation versagt. Nicht heute, nicht morgen, aber bald.",
      dark: true,
      kicker: "Routine ohne Trigger",
      headline: "Ohne festen Trigger hängt deine Routine an der Motivation – und die versagt.",
      lead: "Wenn sie davon abhängt, dass du dich erinnerst und gerade Lust hast: nicht heute, nicht morgen, aber bald.",
    },
    {
      type: "statement",
      seg: " Das ist der Grund, warum so viele Patienten genau dieselben Übungen kennen, die wir in Modul 2 gelernt haben, und sie trotzdem nicht regelmäßig machen. Die Übungen fehlen nicht. Was fehlt, sind die Trigger.",
      text: "Die Übungen fehlen nicht. Was fehlt, sind die Trigger.",
      emphasis: "die Trigger",
    },
  ],
};

// ── Abschnitt 3 – Habit Stacking erklärt ─────────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Habit Stacking erklärt",
  narration:
    "Habit Stacking ist die Methode, mit der wir das Trigger-Problem lösen. Die Idee, die der Verhaltensforscher BJ Fogg von der Stanford University entwickelt hat – und die der Autor James Clear in seinem Buch Atomic Habits einer breiten Öffentlichkeit zugänglich gemacht hat – ist erstaunlich simpel: Du verbindest eine neue Gewohnheit, die du etablieren willst, mit einer bestehenden Gewohnheit, die du sowieso schon hast. Die bestehende Gewohnheit wird zum Trigger für die neue. Beispiele: Während die Kaffeemaschine läuft, mache ich fünf Kniebeugen. Nachdem ich mir die Zähne geputzt habe, mache ich 30 Sekunden Pelvic Tilt. Bevor ich mich aufs Sofa setze, mache ich einen Hip Hinge. Während ich auf den Aufzug warte, mache ich 360-Grad-Atmung. Du siehst das Muster: Nachdem ich X mache, mache ich Y. Oder während X passiert, mache ich Y. Du hängst die neue Gewohnheit an eine bestehende an. Warum funktioniert das? Drei neurobiologische Gründe. Erstens: Die bestehende Gewohnheit ist im Gehirn schon als automatischer Ablauf verankert. Wenn du eine neue Handlung daran anhängst, übernimmt sie diese Automatisierung mit der Zeit. Zweitens: Die Hürde wird minimal. Du musst dir nicht extra Zeit nehmen für die neue Handlung. Sie passiert innerhalb einer Zeit, die ohnehin verbraucht wird. Eine Minute Kaffee warten ergibt 30 Sekunden Übung. Das fällt zeitlich nicht auf. Drittens: Du brauchst keine Motivation. Der Trigger – die Kaffeemaschine, die Zähne, der Aufzug – tut die Arbeit. Du folgst nur. Studien zeigen: Verhalten, das an feste Trigger gekoppelt ist, hat eine deutlich höhere Compliance über Monate und Jahre als Verhalten, das von täglicher Motivation abhängt. Wir reden von Unterschieden im Faktor 5 oder 10 bei der Durchhalterate.",
  slides: [
    {
      type: "term",
      seg: "Habit Stacking ist die Methode, mit der wir das Trigger-Problem lösen.",
      kicker: "Die Methode · nach BJ Fogg & James Clear",
      term: "Habit Stacking",
    },
    {
      type: "content",
      seg: " Die Idee, die der Verhaltensforscher BJ Fogg von der Stanford University entwickelt hat – und die der Autor James Clear in seinem Buch Atomic Habits einer breiten Öffentlichkeit zugänglich gemacht hat – ist erstaunlich simpel: Du verbindest eine neue Gewohnheit, die du etablieren willst, mit einer bestehenden Gewohnheit, die du sowieso schon hast. Die bestehende Gewohnheit wird zum Trigger für die neue.",
      kicker: "Die Idee",
      headline: "Hänge eine neue Gewohnheit an eine bestehende, die du sowieso schon hast.",
      lead: "Entwickelt von BJ Fogg (Stanford), bekannt gemacht durch James Clears „Atomic Habits“. Die bestehende Gewohnheit wird zum Trigger für die neue.",
    },
    {
      type: "reveal-list",
      seg: " Beispiele: Während die Kaffeemaschine läuft, mache ich fünf Kniebeugen. Nachdem ich mir die Zähne geputzt habe, mache ich 30 Sekunden Pelvic Tilt. Bevor ich mich aufs Sofa setze, mache ich einen Hip Hinge. Während ich auf den Aufzug warte, mache ich 360-Grad-Atmung.",
      kicker: "Vier Beispiele",
      title: "Anker → Übung",
      items: [
        { label: "Während die Kaffeemaschine läuft → fünf Kniebeugen" },
        { label: "Nach dem Zähneputzen → 30 Sekunden Pelvic Tilt" },
        { label: "Bevor ich mich aufs Sofa setze → ein Hip Hinge" },
        { label: "Während ich auf den Aufzug warte → 360-Grad-Atmung" },
      ],
    },
    {
      type: "statement",
      seg: " Du siehst das Muster: Nachdem ich X mache, mache ich Y. Oder während X passiert, mache ich Y. Du hängst die neue Gewohnheit an eine bestehende an.",
      text: "Nachdem ich X mache, mache ich Y. Während X passiert, mache ich Y.",
      emphasis: "X … Y",
    },
    {
      type: "reveal-list",
      seg: " Warum funktioniert das? Drei neurobiologische Gründe. Erstens: Die bestehende Gewohnheit ist im Gehirn schon als automatischer Ablauf verankert. Wenn du eine neue Handlung daran anhängst, übernimmt sie diese Automatisierung mit der Zeit. Zweitens: Die Hürde wird minimal. Du musst dir nicht extra Zeit nehmen für die neue Handlung. Sie passiert innerhalb einer Zeit, die ohnehin verbraucht wird. Eine Minute Kaffee warten ergibt 30 Sekunden Übung. Das fällt zeitlich nicht auf. Drittens: Du brauchst keine Motivation. Der Trigger – die Kaffeemaschine, die Zähne, der Aufzug – tut die Arbeit. Du folgst nur.",
      kicker: "Drei neurobiologische Gründe",
      title: "Warum es funktioniert",
      items: [
        { label: "Automatisierung – der bestehende Ablauf zieht die neue Handlung mit" },
        { label: "Minimale Hürde – die Übung passiert in ohnehin verbrauchter Zeit" },
        { label: "Keine Motivation nötig – der Trigger tut die Arbeit, du folgst nur" },
      ],
    },
    {
      type: "content",
      seg: " Studien zeigen: Verhalten, das an feste Trigger gekoppelt ist, hat eine deutlich höhere Compliance über Monate und Jahre als Verhalten, das von täglicher Motivation abhängt. Wir reden von Unterschieden im Faktor 5 oder 10 bei der Durchhalterate.",
      kicker: "Was die Studien zeigen",
      headline: "Trigger-gekoppeltes Verhalten hält über Monate und Jahre deutlich besser durch.",
      lead: "Gegenüber Verhalten, das von täglicher Motivation abhängt, reden wir von Unterschieden im Faktor 5 oder 10 bei der Durchhalterate.",
    },
  ],
};

// ── Abschnitt 4 – Der schmerzadaptive Twist ──────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Der schmerzadaptive Twist",
  narration:
    "Jetzt zum entscheidenden Punkt, der die Variante in dieser Masterclass besonders macht. Das normale Habit Stacking gibt jeder Gewohnheit eine fixe Form: Während der Kaffee läuft, mache ich 10 Kniebeugen. Punkt. Fertig. Bei chronischem Schmerz geht das nicht. Dein Körper ist nicht jeden Tag gleich. An manchen Tagen sind 10 Kniebeugen leicht und sinnvoll. An anderen Tagen sind sie zu viel – sie reizen das System. Wieder andere Tage ist die fixe Form genau zu wenig. Die Lösung ist schmerzadaptives Habit Stacking. Der Trigger bleibt konstant – die Kaffeemaschine läuft, immer dasselbe. Die Übung aber hat drei Versionen – reizarm, Standard, belastend. Du wählst die Version, die zum heutigen Zustand passt. Beispiel: Während die Kaffeemaschine läuft, mache ich Hip Hinge. An schlechten Tagen: reizarm – fünf langsame Hinges, kleine Amplitude. An normalen Tagen: Standard – zehn Hinges in voller Amplitude. An guten Tagen: belastend – zwölf Hinges mit Wasserflasche. Was du gewinnst durch diese Adaptivität: Du machst jeden Tag etwas. Auch an schlechten Tagen. Du brichst die Routine nicht ab, nur weil du dich heute nicht voll fühlst. Du dosierst nur die Intensität. Das ist der entscheidende Unterschied zur klassischen Schmerztherapie. Klassisch ist: An guten Tagen üben, an schlechten Tagen schonen. Aber Schonung verstärkt das Problem, wie wir in Modul 2 und 3 gesehen haben. Das schmerzadaptive Habit Stacking sagt: An jedem Tag etwas. Die Intensität verändert sich, die Routine nicht. Diese kleine Verschiebung – die Routine läuft durch, nur die Schiene passt sich an – ist das, was unsere Variante methodisch besonders macht.",
  slides: [
    {
      type: "content",
      seg: "Jetzt zum entscheidenden Punkt, der die Variante in dieser Masterclass besonders macht. Das normale Habit Stacking gibt jeder Gewohnheit eine fixe Form: Während der Kaffee läuft, mache ich 10 Kniebeugen. Punkt. Fertig.",
      kicker: "Der entscheidende Punkt",
      headline: "Normales Habit Stacking gibt jeder Gewohnheit eine fixe Form.",
      lead: "„Während der Kaffee läuft, mache ich 10 Kniebeugen.“ Punkt. Fertig.",
    },
    {
      type: "content",
      seg: " Bei chronischem Schmerz geht das nicht. Dein Körper ist nicht jeden Tag gleich. An manchen Tagen sind 10 Kniebeugen leicht und sinnvoll. An anderen Tagen sind sie zu viel – sie reizen das System. Wieder andere Tage ist die fixe Form genau zu wenig.",
      dark: true,
      kicker: "Das Problem mit der fixen Form",
      headline: "Dein Körper ist nicht jeden Tag gleich.",
      lead: "Mal sind 10 Kniebeugen leicht und sinnvoll, mal zu viel und reizend, mal genau zu wenig. Eine fixe Form passt nicht zu chronischem Schmerz.",
    },
    {
      type: "content",
      seg: " Die Lösung ist schmerzadaptives Habit Stacking. Der Trigger bleibt konstant – die Kaffeemaschine läuft, immer dasselbe. Die Übung aber hat drei Versionen – reizarm, Standard, belastend. Du wählst die Version, die zum heutigen Zustand passt.",
      kicker: "Die Lösung",
      headline: "Trigger konstant – die Übung in drei Versionen.",
      lead: "Schmerzadaptives Habit Stacking: Der Anker bleibt immer derselbe. Die Übung gibt es reizarm, Standard und belastend. Du wählst, was zum heutigen Zustand passt.",
    },
    {
      type: "reveal-list",
      seg: " Beispiel: Während die Kaffeemaschine läuft, mache ich Hip Hinge. An schlechten Tagen: reizarm – fünf langsame Hinges, kleine Amplitude. An normalen Tagen: Standard – zehn Hinges in voller Amplitude. An guten Tagen: belastend – zwölf Hinges mit Wasserflasche.",
      kicker: "Beispiel · Hip Hinge am Kaffee-Anker",
      title: "Eine Übung, drei Schienen",
      items: [
        { label: "Schlechter Tag · reizarm – fünf langsame Hinges, kleine Amplitude" },
        { label: "Normaler Tag · Standard – zehn Hinges in voller Amplitude" },
        { label: "Guter Tag · belastend – zwölf Hinges mit Wasserflasche" },
      ],
    },
    {
      type: "content",
      seg: " Was du gewinnst durch diese Adaptivität: Du machst jeden Tag etwas. Auch an schlechten Tagen. Du brichst die Routine nicht ab, nur weil du dich heute nicht voll fühlst. Du dosierst nur die Intensität.",
      kicker: "Was du gewinnst",
      headline: "Du machst jeden Tag etwas – auch an schlechten Tagen.",
      lead: "Du brichst die Routine nicht ab, nur weil du dich heute nicht voll fühlst. Du dosierst nur die Intensität.",
    },
    {
      type: "content",
      seg: " Das ist der entscheidende Unterschied zur klassischen Schmerztherapie. Klassisch ist: An guten Tagen üben, an schlechten Tagen schonen. Aber Schonung verstärkt das Problem, wie wir in Modul 2 und 3 gesehen haben. Das schmerzadaptive Habit Stacking sagt: An jedem Tag etwas. Die Intensität verändert sich, die Routine nicht.",
      kicker: "Der Unterschied",
      headline: "Klassisch: an guten Tagen üben, an schlechten schonen – aber Schonung verstärkt das Problem.",
      lead: "Schmerzadaptiv heißt: an jedem Tag etwas. Die Intensität verändert sich, die Routine nicht.",
    },
    {
      type: "statement",
      seg: " Diese kleine Verschiebung – die Routine läuft durch, nur die Schiene passt sich an – ist das, was unsere Variante methodisch besonders macht.",
      text: "Der Trigger bleibt konstant. Die Intervention atmet.",
      emphasis: "Die Intervention atmet",
    },
  ],
};

// ── Abschnitt 5 – Warum perfekt für chronischen Schmerz ──────────────────────

const abschnitt5: SourceSection = {
  title: "Warum perfekt für chronischen Schmerz",
  narration:
    "Warum ist schmerzadaptives Habit Stacking die Recoping-Methode für chronischen Rückenschmerz? Erstens: Es löst das Compliance-Problem. Wer chronisch Schmerz hat, hat oft schon viele Übungsprogramme angefangen und wieder fallen lassen. Habit Stacking macht Routinen wartungsarm. Du brauchst keine wöchentliche Selbstmotivation. Du folgst Triggern. Zweitens: Es löst das Rückfall-Problem. Wenn ein schlechter Tag kommt – und der wird kommen –, hörst du nicht auf. Du wechselst nur in die reizarme Schiene. Damit gibst du deinem Nervensystem auch an den schlechten Tagen Sicherheits-Information: Bewegung ist möglich. Auch heute. Genau diese Botschaft ist der wichtigste Anti-Chronifizierungs-Hebel. Drittens: Es funktioniert ohne Disziplin. Du musst nicht jeden Morgen den Willen aufbringen. Du musst nicht nach Feierabend zur Yogamatte. Du gehst einfach in die Küche, machst Kaffee, und nebenbei passiert die Übung. Das fühlt sich kaum nach Therapie an – aber neurobiologisch ist es genau die richtige Therapie. Viertens: Es passt zum Modell der Antifragilität aus Lektion 3.1. Du hast jeden Tag kleine Belastungsreize. Du baust kontinuierlich Belastbarkeit auf. Du gewöhnst dein System an: Wir haben hier eine konstante Hintergrund-Aktivität, an die wir uns anpassen. Und fünftens: Es macht dich unabhängig. Nach einigen Monaten hat sich dein System selbst etabliert. Du brauchst keinen Therapeuten, keinen Coach, keine App. Die Rituale laufen, weil sie an stabile Tagesanker geknüpft sind. Das ist Selbstwirksamkeit im wahren Sinne.",
  slides: [
    {
      type: "content",
      seg: "Warum ist schmerzadaptives Habit Stacking die Recoping-Methode für chronischen Rückenschmerz? Erstens: Es löst das Compliance-Problem. Wer chronisch Schmerz hat, hat oft schon viele Übungsprogramme angefangen und wieder fallen lassen. Habit Stacking macht Routinen wartungsarm. Du brauchst keine wöchentliche Selbstmotivation. Du folgst Triggern.",
      kicker: "Vorteil 1 · Compliance",
      headline: "Habit Stacking macht Routinen wartungsarm.",
      lead: "Wer chronisch Schmerz hat, hat oft schon viele Programme fallen lassen. Hier brauchst du keine wöchentliche Selbstmotivation – du folgst Triggern.",
    },
    {
      type: "content",
      seg: " Zweitens: Es löst das Rückfall-Problem. Wenn ein schlechter Tag kommt – und der wird kommen –, hörst du nicht auf. Du wechselst nur in die reizarme Schiene. Damit gibst du deinem Nervensystem auch an den schlechten Tagen Sicherheits-Information: Bewegung ist möglich. Auch heute. Genau diese Botschaft ist der wichtigste Anti-Chronifizierungs-Hebel.",
      kicker: "Vorteil 2 · Rückfall",
      headline: "An schlechten Tagen hörst du nicht auf – du wechselst in die reizarme Schiene.",
      lead: "So gibst du deinem Nervensystem auch an schlechten Tagen die Botschaft: Bewegung ist möglich. Auch heute. Der wichtigste Anti-Chronifizierungs-Hebel.",
    },
    {
      type: "content",
      seg: " Drittens: Es funktioniert ohne Disziplin. Du musst nicht jeden Morgen den Willen aufbringen. Du musst nicht nach Feierabend zur Yogamatte. Du gehst einfach in die Küche, machst Kaffee, und nebenbei passiert die Übung. Das fühlt sich kaum nach Therapie an – aber neurobiologisch ist es genau die richtige Therapie.",
      kicker: "Vorteil 3 · Disziplin-frei",
      headline: "Du gehst in die Küche, machst Kaffee – und nebenbei passiert die Übung.",
      lead: "Kein Willensakt am Morgen, kein Gang zur Yogamatte nach Feierabend. Es fühlt sich kaum nach Therapie an – ist aber genau die richtige.",
    },
    {
      type: "content",
      seg: " Viertens: Es passt zum Modell der Antifragilität aus Lektion 3.1. Du hast jeden Tag kleine Belastungsreize. Du baust kontinuierlich Belastbarkeit auf. Du gewöhnst dein System an: Wir haben hier eine konstante Hintergrund-Aktivität, an die wir uns anpassen.",
      kicker: "Vorteil 4 · Antifragilität",
      headline: "Jeden Tag kleine Belastungsreize – kontinuierlich aufgebaute Belastbarkeit.",
      lead: "Passt zum Antifragilitäts-Modell aus Lektion 3.1: Dein System gewöhnt sich an eine konstante Hintergrund-Aktivität, an die es sich anpasst.",
    },
    {
      type: "content",
      seg: " Und fünftens: Es macht dich unabhängig. Nach einigen Monaten hat sich dein System selbst etabliert. Du brauchst keinen Therapeuten, keinen Coach, keine App. Die Rituale laufen, weil sie an stabile Tagesanker geknüpft sind. Das ist Selbstwirksamkeit im wahren Sinne.",
      kicker: "Vorteil 5 · Unabhängigkeit",
      headline: "Nach einigen Monaten läuft dein System von selbst.",
      lead: "Kein Therapeut, kein Coach, keine App. Die Rituale laufen, weil sie an stabile Tagesanker geknüpft sind. Selbstwirksamkeit im wahren Sinne.",
    },
    {
      type: "statement",
      seg: "",
      text: "Gewohnheiten brechen nicht, wenn Motivation bricht.",
      emphasis: "brechen nicht",
    },
  ],
};

// ── Abschnitt 6 – Vorbereitung ───────────────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Vorbereitung",
  narration:
    "In den nächsten Lektionen – 4.2 und 4.3 – bauen wir genau das auf. In 4.2 erstellst du deine persönliche Ritual-Map. Wir identifizieren deine Tages-Anker, wir wählen passende Übungen, wir bauen ein realistisches Wochensystem. In 4.3 schauen wir uns das Drei-Schienen-System nochmal genauer an: Wie wählst du eigentlich, welche Schiene heute passt? Was sind die Kriterien? Was tust du, wenn du dich vertust? Ab heute wird die Masterclass weniger informativ und mehr anwendungsorientiert. Du bist dabei, dein eigenes System zu bauen.",
  slides: [
    {
      type: "content",
      seg: "In den nächsten Lektionen – 4.2 und 4.3 – bauen wir genau das auf. In 4.2 erstellst du deine persönliche Ritual-Map. Wir identifizieren deine Tages-Anker, wir wählen passende Übungen, wir bauen ein realistisches Wochensystem.",
      kicker: "Als Nächstes · Lektion 4.2",
      headline: "Deine persönliche Ritual-Map.",
      lead: "Wir identifizieren deine Tages-Anker, wählen passende Übungen und bauen ein realistisches Wochensystem.",
    },
    {
      type: "content",
      seg: " In 4.3 schauen wir uns das Drei-Schienen-System nochmal genauer an: Wie wählst du eigentlich, welche Schiene heute passt? Was sind die Kriterien? Was tust du, wenn du dich vertust?",
      kicker: "Und dann · Lektion 4.3",
      headline: "Das Drei-Schienen-System genauer.",
      lead: "Wie wählst du, welche Schiene heute passt? Was sind die Kriterien? Und was tust du, wenn du dich vertust?",
    },
    {
      type: "statement",
      seg: " Ab heute wird die Masterclass weniger informativ und mehr anwendungsorientiert. Du bist dabei, dein eigenes System zu bauen.",
      text: "Ab heute wird die Masterclass anwendungsorientiert. Du baust dein eigenes System.",
      emphasis: "dein eigenes System",
    },
  ],
};

// ── Abschnitt 7 – Workbook und Übergang ──────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 4.1: Mein Habits-Inventar. Liste dort einmal die festen Routinen auf, die du jeden Tag fast garantiert machst: Morgenkaffee, Zähneputzen morgens und abends, Aufstehen, Anfahrt zur Arbeit, Mittagspause, Feierabend-Rituale. Diese Liste ist das Rohmaterial für deine Ritual-Map in der nächsten Lektion. Achte beim Auflisten auf das, was garantiert passiert. Nicht was ich eigentlich tun sollte. Sondern was ich faktisch jeden Tag tue, ohne darüber nachzudenken. Genau das sind unsere Trigger. In Lektion 4.2 gehen wir mit deinem Habits-Inventar in die konkrete Konstruktion deiner Ritual-Map. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 4.1: Mein Habits-Inventar. Liste dort einmal die festen Routinen auf, die du jeden Tag fast garantiert machst: Morgenkaffee, Zähneputzen morgens und abends, Aufstehen, Anfahrt zur Arbeit, Mittagspause, Feierabend-Rituale. Diese Liste ist das Rohmaterial für deine Ritual-Map in der nächsten Lektion.",
      kicker: "Workbook · Übung 4.1",
      headline: "Mein Habits-Inventar – deine festen Tages-Routinen.",
      lead: "Morgenkaffee, Zähneputzen, Aufstehen, Anfahrt zur Arbeit, Mittagspause, Feierabend-Rituale. Das Rohmaterial für deine Ritual-Map in der nächsten Lektion.",
    },
    {
      type: "statement",
      seg: " Achte beim Auflisten auf das, was garantiert passiert. Nicht was ich eigentlich tun sollte. Sondern was ich faktisch jeden Tag tue, ohne darüber nachzudenken. Genau das sind unsere Trigger.",
      text: "Liste auf, was du faktisch jeden Tag tust – ohne darüber nachzudenken.",
      emphasis: "garantiert passiert",
    },
    {
      type: "content",
      seg: " In Lektion 4.2 gehen wir mit deinem Habits-Inventar in die konkrete Konstruktion deiner Ritual-Map.",
      kicker: "Als Nächstes · Lektion 4.2",
      headline: "Mit deinem Habits-Inventar in die Konstruktion der Ritual-Map.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 4.2",
      nextTitle: "Deine Ritual-Map erstellen",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "4.1",
  title: "Das Habit-Stacking-Konzept",
  subtitle: "Modul 4 – Recoping · Das theoretische Fundament",
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
