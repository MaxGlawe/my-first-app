/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 2.5
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/2.5.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 2.5`). Niemals lessons/2.5.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Fünfte Lektion von Modul 2 (Kurativ handeln). Atemmechanik & Beckenboden-
 * Verbindung: das innere Zylinder-System, drei integrierbare Atem-Übungen
 * (ÜK-A1 360°-Atmung, ÜK-A2 Beckenboden mit Atmung, ÜK-A3 Box Breathing), je mit
 * drei Schienen. Aufbau identisch zu 2.1–2.4:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–8) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die Meta-Tabelle der MD werden NICHT vertont.
 *
 * 3.-PERSON-REGEL: 2.5 enthält ausschließlich generische Guide-/Übungs-Anleitungs-
 * Ich-/Du-Form (der Sprecher leitet an: „die wirksamste Schmerz-Notfall-Übung, die
 * ich kenne"). Keine Ersteller-/Praxis-/Credential-Aussagen über den Schöpfer
 * → keine Umschreibung auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD wird beibehalten. Atmung/Übungen werden als Mechanismus
 *   beschrieben, nicht als Heilversprechen. Aussagen bleiben prozesshaft
 *   („kalibriert die Sensitivität nach unten", „senken in der Mehrheit der Fälle die
 *   Schmerzintensität messbar. Nicht weg, aber runter"), exakt wie in der MD.
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

// ── Abschnitt 1 – Eröffnung ──────────────────────────────────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung",
  narration:
    "Willkommen zu Lektion 2.5. Diese Lektion behandelt etwas, das in vielen Rückenschmerz-Programmen unterschätzt oder ganz weggelassen wird: die Verbindung von Atmung und Beckenboden mit der Rumpfstabilität. Du wirst gleich verstehen, warum das nicht soft ist, sondern handfest mechanisch. Dein Zwerchfell – der wichtigste Atemmuskel – ist gleichzeitig die obere Deckplatte eines hochbelasteten Stabilisationssystems in deinem Bauchraum. Wenn diese Atmung nicht richtig funktioniert, fehlt deinem unteren Rücken einer der wichtigsten Stabilisations-Mechanismen, die der Körper kennt. Dazu kommt: Atmung ist gleichzeitig der direkteste Hebel, den du hast, um dein vegetatives Nervensystem zu beruhigen. Erinnere dich an die Alarmanlage aus Lektion 1.5: Eine ruhige Atmung kalibriert die Sensitivität nach unten. Mehrere Studien belegen das messbar. Drei Atem-Übungen heute. Plus eine kurze Anmerkung am Ende für besondere Lebensphasen wie postpartal.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 2 – Kurativ handeln",
      lessonLabel: "Lektion 2.5 – Atemmechanik & Beckenboden-Verbindung",
    },
    {
      type: "content",
      seg: "Willkommen zu Lektion 2.5. Diese Lektion behandelt etwas, das in vielen Rückenschmerz-Programmen unterschätzt oder ganz weggelassen wird: die Verbindung von Atmung und Beckenboden mit der Rumpfstabilität.",
      kicker: "Oft unterschätzt",
      headline: "Atmung, Beckenboden und Rumpfstabilität – eng verbunden.",
      lead: "In vielen Rückenschmerz-Programmen unterschätzt oder ganz weggelassen.",
    },
    {
      type: "content",
      seg: " Du wirst gleich verstehen, warum das nicht soft ist, sondern handfest mechanisch. Dein Zwerchfell – der wichtigste Atemmuskel – ist gleichzeitig die obere Deckplatte eines hochbelasteten Stabilisationssystems in deinem Bauchraum. Wenn diese Atmung nicht richtig funktioniert, fehlt deinem unteren Rücken einer der wichtigsten Stabilisations-Mechanismen, die der Körper kennt.",
      kicker: "Nicht soft, sondern mechanisch",
      headline: "Dein Zwerchfell ist die obere Deckplatte eines Stabilisationssystems.",
      lead: "Funktioniert die Atmung nicht, fehlt dem unteren Rücken einer der wichtigsten Stabilisations-Mechanismen, die der Körper kennt.",
    },
    {
      type: "content",
      seg: " Dazu kommt: Atmung ist gleichzeitig der direkteste Hebel, den du hast, um dein vegetatives Nervensystem zu beruhigen. Erinnere dich an die Alarmanlage aus Lektion 1.5: Eine ruhige Atmung kalibriert die Sensitivität nach unten. Mehrere Studien belegen das messbar.",
      kicker: "Erinnere dich an die Alarmanlage",
      headline: "Atmung ist der direkteste Hebel ans vegetative Nervensystem.",
      lead: "Eine ruhige Atmung kalibriert die Sensitivität nach unten – mehrere Studien belegen das messbar.",
    },
    {
      type: "statement",
      seg: " Drei Atem-Übungen heute. Plus eine kurze Anmerkung am Ende für besondere Lebensphasen wie postpartal.",
      text: "Atmung ist Stabilisation. Und der direkteste Hebel ans Nervensystem.",
      emphasis: "Stabilisation",
    },
  ],
};

// ── Abschnitt 2 – Das innere Zylinder-System ─────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Das innere Zylinder-System",
  narration:
    "Stell dir deinen Bauchraum vor wie einen Zylinder. Diesen Zylinder kennst du noch nicht in dieser Form – aber er ist die zentrale stabilisierende Einheit deines Rumpfes. Die Deckplatte oben: das Zwerchfell. Dein wichtigster Atemmuskel. Bei der Einatmung kontrahiert es sich nach unten, drückt also auf die Bauchorgane. Die Bodenplatte unten: der Beckenboden. Ein Geflecht aus Muskeln und Bindegewebe, das den Beckenausgang abschließt. Er reagiert reflexartig auf das Zwerchfell – bei der Einatmung dehnt er sich leicht, bei der Ausatmung zieht er sich leicht zusammen. Die Seitenwände: die Bauchmuskulatur, vor allem der Transversus abdominis, den du in Lektion 2.3 schon kennengelernt hast. Die Rückwand: der Multifidus und die kleinen tiefen Rückenmuskeln, die direkt an der Wirbelsäule ansetzen. Dieser Zylinder erzeugt durch koordiniertes Zusammenspiel den sogenannten intraabdominalen Druck. Klingt technisch, ist aber zentral. Dieser Druck stabilisiert deine Wirbelsäule von innen, fast so wie Luft in einem Reifen den Reifen stabilisiert. Wenn der Druck gut aufgebaut wird, hast du eine innere Stütze für deine Lendenwirbelsäule. Diese innere Stütze brauchst du nicht nur beim Heben schwerer Lasten. Du brauchst sie bei jedem Aufstehen, bei jedem Husten, bei jedem Niesen, bei jedem Aufrichten aus dem Sitz. Sie ist eine Hintergrund-Funktion, die du normalerweise nicht bewusst wahrnimmst – die aber unermüdlich für dich arbeitet. Und das wichtigste: Sie wird gesteuert durch deine Atmung.",
  slides: [
    {
      type: "content",
      seg: "Stell dir deinen Bauchraum vor wie einen Zylinder. Diesen Zylinder kennst du noch nicht in dieser Form – aber er ist die zentrale stabilisierende Einheit deines Rumpfes.",
      kicker: "Ein Bild",
      headline: "Stell dir deinen Bauchraum vor wie einen Zylinder.",
      lead: "Die zentrale stabilisierende Einheit deines Rumpfes.",
    },
    {
      type: "reveal-list",
      seg: " Die Deckplatte oben: das Zwerchfell. Dein wichtigster Atemmuskel. Bei der Einatmung kontrahiert es sich nach unten, drückt also auf die Bauchorgane. Die Bodenplatte unten: der Beckenboden. Ein Geflecht aus Muskeln und Bindegewebe, das den Beckenausgang abschließt. Er reagiert reflexartig auf das Zwerchfell – bei der Einatmung dehnt er sich leicht, bei der Ausatmung zieht er sich leicht zusammen. Die Seitenwände: die Bauchmuskulatur, vor allem der Transversus abdominis, den du in Lektion 2.3 schon kennengelernt hast. Die Rückwand: der Multifidus und die kleinen tiefen Rückenmuskeln, die direkt an der Wirbelsäule ansetzen.",
      kicker: "Vier Wände einer Kammer",
      title: "Der innere Zylinder",
      items: [
        { label: "Deckplatte oben – das Zwerchfell, dein wichtigster Atemmuskel" },
        { label: "Bodenplatte unten – der Beckenboden, reagiert reflexartig auf das Zwerchfell" },
        { label: "Seitenwände – die Bauchmuskulatur, vor allem der Transversus abdominis" },
        { label: "Rückwand – der Multifidus und die tiefen Rückenmuskeln" },
      ],
    },
    {
      type: "content",
      seg: " Dieser Zylinder erzeugt durch koordiniertes Zusammenspiel den sogenannten intraabdominalen Druck. Klingt technisch, ist aber zentral. Dieser Druck stabilisiert deine Wirbelsäule von innen, fast so wie Luft in einem Reifen den Reifen stabilisiert. Wenn der Druck gut aufgebaut wird, hast du eine innere Stütze für deine Lendenwirbelsäule.",
      kicker: "Die Reifen-Metapher",
      headline: "Der intraabdominale Druck stabilisiert die Wirbelsäule von innen.",
      lead: "Fast so wie Luft in einem Reifen den Reifen stabilisiert – eine innere Stütze für deine Lendenwirbelsäule.",
    },
    {
      type: "content",
      seg: " Diese innere Stütze brauchst du nicht nur beim Heben schwerer Lasten. Du brauchst sie bei jedem Aufstehen, bei jedem Husten, bei jedem Niesen, bei jedem Aufrichten aus dem Sitz. Sie ist eine Hintergrund-Funktion, die du normalerweise nicht bewusst wahrnimmst – die aber unermüdlich für dich arbeitet.",
      kicker: "Eine Hintergrund-Funktion",
      headline: "Du brauchst sie bei jedem Aufstehen, Husten, Niesen, Aufrichten.",
      lead: "Eine Hintergrund-Funktion, die du normalerweise nicht bewusst wahrnimmst – die aber unermüdlich für dich arbeitet.",
    },
    {
      type: "statement",
      seg: " Und das wichtigste: Sie wird gesteuert durch deine Atmung.",
      text: "Innere Stabilität entsteht durch Druck, nicht durch Anspannung. Und der Druck wird gesteuert durch deine Atmung.",
      emphasis: "durch deine Atmung",
    },
  ],
};

// ── Abschnitt 3 – Was bei chronischem Schmerz schiefläuft ────────────────────

const abschnitt3: SourceSection = {
  title: "Was bei chronischem Schmerz schiefläuft",
  narration:
    "Bei chronischem Rückenschmerz funktioniert dieser Zylinder oft nicht mehr richtig. Mehrere Probleme treten auf: Erstens: Brustatmung statt Bauchatmung. Viele Menschen mit chronischem Schmerz – oder mit chronischem Stress, was sich oft überschneidet – atmen primär in den oberen Brustkorb. Schultern heben sich, Bauch bewegt sich kaum. Das Zwerchfell macht nur kleine Bewegungen. Damit funktioniert die obere Deckplatte des Zylinders schlecht. Zweitens: Permanente Anspannung. Aus Schutzreflex spannen sich Bauchmuskeln und Beckenboden permanent leicht an. Das fühlt sich vielleicht nicht spürbar an, aber es verhindert, dass das Zwerchfell sich richtig bewegen kann. Es drückt quasi gegen eine angespannte Bauchwand. Resultat: weniger Atmung, weniger Stabilität. Drittens: Beckenboden-Dysfunktion. Der Beckenboden kann zu schwach sein – das ist klassisch nach Schwangerschaften, manchmal auch im Alter. Oder er kann zu angespannt sein – das ist überraschend häufig bei chronischen Schmerzen, besonders wenn Stress eine Rolle spielt. Beides stört die Zylinder-Funktion. Was wir gleich üben, adressiert all diese drei Punkte: Wir trainieren freie Zwerchfell-Bewegung. Wir lernen, Bauchwand und Beckenboden bei Bedarf zu entspannen und zu aktivieren. Und wir verbinden Atmung mit Aktivierung im richtigen Timing.",
  slides: [
    {
      type: "content",
      seg: "Bei chronischem Rückenschmerz funktioniert dieser Zylinder oft nicht mehr richtig. Mehrere Probleme treten auf:",
      kicker: "Drei Probleme",
      headline: "Bei chronischem Schmerz funktioniert der Zylinder oft nicht mehr richtig.",
    },
    {
      type: "content",
      seg: " Erstens: Brustatmung statt Bauchatmung. Viele Menschen mit chronischem Schmerz – oder mit chronischem Stress, was sich oft überschneidet – atmen primär in den oberen Brustkorb. Schultern heben sich, Bauch bewegt sich kaum. Das Zwerchfell macht nur kleine Bewegungen. Damit funktioniert die obere Deckplatte des Zylinders schlecht.",
      kicker: "Erstens · Brustatmung",
      headline: "Atmung in den oberen Brustkorb – das Zwerchfell bewegt sich kaum.",
      lead: "Schultern heben sich, der Bauch bewegt sich kaum. Damit funktioniert die obere Deckplatte des Zylinders schlecht.",
    },
    {
      type: "content",
      seg: " Zweitens: Permanente Anspannung. Aus Schutzreflex spannen sich Bauchmuskeln und Beckenboden permanent leicht an. Das fühlt sich vielleicht nicht spürbar an, aber es verhindert, dass das Zwerchfell sich richtig bewegen kann. Es drückt quasi gegen eine angespannte Bauchwand. Resultat: weniger Atmung, weniger Stabilität.",
      kicker: "Zweitens · Permanente Anspannung",
      headline: "Bauchmuskeln und Beckenboden spannen aus Schutzreflex permanent an.",
      lead: "Das Zwerchfell drückt gegen eine angespannte Bauchwand. Resultat: weniger Atmung, weniger Stabilität.",
    },
    {
      type: "content",
      seg: " Drittens: Beckenboden-Dysfunktion. Der Beckenboden kann zu schwach sein – das ist klassisch nach Schwangerschaften, manchmal auch im Alter. Oder er kann zu angespannt sein – das ist überraschend häufig bei chronischen Schmerzen, besonders wenn Stress eine Rolle spielt. Beides stört die Zylinder-Funktion.",
      kicker: "Drittens · Beckenboden-Dysfunktion",
      headline: "Der Beckenboden kann zu schwach oder zu angespannt sein.",
      lead: "Zu schwach klassisch nach Schwangerschaften; zu angespannt überraschend häufig bei chronischem Schmerz. Beides stört die Zylinder-Funktion.",
    },
    {
      type: "reveal-list",
      seg: " Was wir gleich üben, adressiert all diese drei Punkte: Wir trainieren freie Zwerchfell-Bewegung. Wir lernen, Bauchwand und Beckenboden bei Bedarf zu entspannen und zu aktivieren. Und wir verbinden Atmung mit Aktivierung im richtigen Timing.",
      kicker: "Was wir gleich üben",
      title: "Die drei Punkte adressieren",
      items: [
        { label: "Freie Zwerchfell-Bewegung trainieren" },
        { label: "Bauchwand und Beckenboden entspannen und aktivieren" },
        { label: "Atmung mit Aktivierung im richtigen Timing verbinden" },
      ],
    },
  ],
};

// ── Abschnitt 4 – Übung 1: ÜK-A1 360°-Atmung ─────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Übung 1 – 360°-Atmung (ÜK-A1)",
  narration:
    "Erste Übung: 360°-Atmung, auch Zwerchfellatmung genannt. Übungskarte ÜK-A1. Diese Übung lehrt dich, in alle Richtungen zu atmen – nicht nur nach vorne in den Bauch, sondern auch zu den Seiten und in den unteren Rücken. 360 Grad heißt: rundherum. Position: Setz dich aufrecht auf einen Stuhl oder leg dich auf den Rücken. Die Wirbelsäule ist in einer neutralen Position. Hände auf die unteren Rippen – nicht auf den Bauch. Die Daumen zeigen nach hinten, die Finger nach vorne, sodass du mit den Händen den unteren Rippenbogen umgreifst. Bewegung: Atme tief und langsam in deine Hände hinein. Wenn du es richtig machst, spürst du, wie sich der Rippenbogen nach allen Seiten ausdehnt – nach vorne, zu den Seiten, und sogar nach hinten gegen die Stuhllehne oder den Boden. Stell dir vor, dein Rumpf ist ein Ballon, der gleichmäßig in alle Richtungen größer wird. Beim Ausatmen entspannt sich der Rippenbogen wieder. Die Ausatmung darf länger sein als die Einatmung – etwa 4 Sekunden ein, 6 Sekunden aus. Reizarme Schiene: 5 Atemzüge, sehr ruhig. Standard: 10 Atemzüge, mit Aufmerksamkeit auf die Seitenausdehnung. Belastend: 15 bis 20 Atemzüge mit verlängerter Ausatmung – 4 Sekunden ein, 8 Sekunden aus. Häufiger Fehler: Hochatmung in die Schultern. Die Schultern sollen sich kaum bewegen. Wenn sie hochziehen, atmest du wieder in den oberen Brustkorb. Wann sinnvoll? Diese Übung ist gut für jeden Trainingseinstieg, gut für Stressmomente im Alltag, gut zum Einschlafen. Sie kostet drei Minuten und beruhigt das Nervensystem messbar.",
  slides: [
    {
      type: "term",
      seg: "Erste Übung: 360°-Atmung, auch Zwerchfellatmung genannt. Übungskarte ÜK-A1.",
      kicker: "Übung 1 · ÜK-A1",
      term: "360°-Atmung",
    },
    {
      type: "statement",
      seg: " Diese Übung lehrt dich, in alle Richtungen zu atmen – nicht nur nach vorne in den Bauch, sondern auch zu den Seiten und in den unteren Rücken. 360 Grad heißt: rundherum.",
      text: "In alle Richtungen atmen – nach vorne, zu den Seiten, in den unteren Rücken.",
      emphasis: "rundherum",
    },
    {
      type: "content",
      seg: " Position: Setz dich aufrecht auf einen Stuhl oder leg dich auf den Rücken. Die Wirbelsäule ist in einer neutralen Position. Hände auf die unteren Rippen – nicht auf den Bauch. Die Daumen zeigen nach hinten, die Finger nach vorne, sodass du mit den Händen den unteren Rippenbogen umgreifst.",
      kicker: "Ausgangsposition",
      headline: "Hände auf die unteren Rippen – nicht auf den Bauch.",
      lead: "Aufrecht sitzen oder auf dem Rücken liegen, Wirbelsäule neutral. Daumen nach hinten, Finger nach vorne, sodass du den unteren Rippenbogen umgreifst.",
    },
    {
      type: "content",
      seg: " Bewegung: Atme tief und langsam in deine Hände hinein. Wenn du es richtig machst, spürst du, wie sich der Rippenbogen nach allen Seiten ausdehnt – nach vorne, zu den Seiten, und sogar nach hinten gegen die Stuhllehne oder den Boden. Stell dir vor, dein Rumpf ist ein Ballon, der gleichmäßig in alle Richtungen größer wird.",
      kicker: "Die Bewegung",
      headline: "Tief und langsam in deine Hände hineinatmen.",
      lead: "Der Rippenbogen dehnt sich nach allen Seiten aus – nach vorne, zu den Seiten, nach hinten. Wie ein Ballon, der gleichmäßig größer wird.",
    },
    {
      type: "content",
      seg: " Beim Ausatmen entspannt sich der Rippenbogen wieder. Die Ausatmung darf länger sein als die Einatmung – etwa 4 Sekunden ein, 6 Sekunden aus.",
      kicker: "Der Rhythmus",
      headline: "Die Ausatmung darf länger sein als die Einatmung.",
      lead: "Etwa 4 Sekunden ein, 6 Sekunden aus – beim Ausatmen entspannt sich der Rippenbogen wieder.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: 5 Atemzüge, sehr ruhig. Standard: 10 Atemzüge, mit Aufmerksamkeit auf die Seitenausdehnung. Belastend: 15 bis 20 Atemzüge mit verlängerter Ausatmung – 4 Sekunden ein, 8 Sekunden aus.",
      kicker: "ÜK-A1 · Drei Schienen",
      title: "360°-Atmung nach Tagesform",
      items: [
        { label: "Reizarm – 5 Atemzüge, sehr ruhig" },
        { label: "Standard – 10 Atemzüge, Aufmerksamkeit auf die Seitenausdehnung" },
        { label: "Belastend – 15–20 Atemzüge, 4 s ein, 8 s aus" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Hochatmung in die Schultern. Die Schultern sollen sich kaum bewegen. Wenn sie hochziehen, atmest du wieder in den oberen Brustkorb.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Hochatmung in die Schultern.",
      lead: "Die Schultern sollen sich kaum bewegen. Wenn sie hochziehen, atmest du wieder in den oberen Brustkorb.",
    },
    {
      type: "content",
      seg: " Wann sinnvoll? Diese Übung ist gut für jeden Trainingseinstieg, gut für Stressmomente im Alltag, gut zum Einschlafen. Sie kostet drei Minuten und beruhigt das Nervensystem messbar.",
      kicker: "Wann sinnvoll",
      headline: "Gut für jeden Trainingseinstieg, für Stressmomente, zum Einschlafen.",
      lead: "Sie kostet drei Minuten und beruhigt das Nervensystem messbar.",
    },
  ],
};

// ── Abschnitt 5 – Übung 2: ÜK-A2 Beckenboden mit Atmung ──────────────────────

const abschnitt5: SourceSection = {
  title: "Übung 2 – Beckenboden mit Atmung (ÜK-A2)",
  narration:
    "Zweite Übung: Beckenboden-Aktivierung mit Atmung. Übungskarte ÜK-A2. Diese Übung verbindet zwei Elemente: Du lernst, deinen Beckenboden bewusst wahrzunehmen und zu steuern – und gleichzeitig verbindest du diese Steuerung mit der Atmung. Position: Setz dich aufrecht auf einen Stuhl oder leg dich auf den Rücken mit angestellten Beinen. Hände entspannt. Erst die Beckenboden-Wahrnehmung: Stell dir vor, du möchtest gleichzeitig den Strahl beim Wasserlassen unterbrechen und einen Wind verkneifen. Ohne dass dabei dein Gesäß anspannt oder du den Atem anhältst. Das ist eine milde Aktivierung der inneren Schließmuskeln und der Beckenboden-Muskulatur drumherum. Wichtig: Es ist eine milde Aktivierung. Etwa 20 Prozent dessen, was du maximal könntest. Nicht zusammenpressen, nicht den Atem anhalten. Jetzt die Atemkopplung: Bei der Einatmung lässt du den Beckenboden los – er entspannt sich. Bei der Ausatmung aktivierst du sanft die Schließmuskeln. Einatmen loslassen, Ausatmen aktivieren. Das ist die natürliche Bewegung deines Beckenbodens. Bei chronischem Schmerz ist sie oft gestört – der Beckenboden bleibt entweder dauerhaft angespannt oder reagiert nicht mehr richtig auf die Atmung. Diese Übung kalibriert ihn wieder ein. Reizarme Schiene: 5 Atemzüge mit Beckenboden-Kopplung. Standard: 10 Atemzüge, plus 3 Sekunden Halte-Phase in der Aktivierung. Belastend: 15 Atemzüge mit länger gehaltener Aktivierung – 5 Sekunden –, optional in der Vierfüßler- oder Liegestütz-Position für Beckenboden unter Last. Häufiger Fehler: Du spannst zu stark an oder ziehst Bauch- und Pomuskeln mit. Such die isolierte milde Aktivierung. Wenn das schwerfällt – was am Anfang oft so ist – üb erst mal nur die Wahrnehmung ohne Atemkopplung. Eine kurze Bemerkung: Wenn du eine konkrete Beckenboden-Problematik hast – sei es nach einer Geburt, einer Operation oder bei Inkontinenz – dann ist eine spezialisierte Beckenboden-Therapie sinnvoll. Diese Masterclass ersetzt das nicht. Wir machen hier die Grundkalibrierung, die jedem hilft. Postpartale Themen verdienen einen eigenen, spezialisierten Rahmen.",
  slides: [
    {
      type: "term",
      seg: "Zweite Übung: Beckenboden-Aktivierung mit Atmung. Übungskarte ÜK-A2.",
      kicker: "Übung 2 · ÜK-A2",
      term: "Beckenboden mit Atmung",
    },
    {
      type: "content",
      seg: " Diese Übung verbindet zwei Elemente: Du lernst, deinen Beckenboden bewusst wahrzunehmen und zu steuern – und gleichzeitig verbindest du diese Steuerung mit der Atmung.",
      kicker: "Was sie verbindet",
      headline: "Beckenboden bewusst wahrnehmen und steuern – gekoppelt an die Atmung.",
      lead: "Die Übung verbindet zwei Elemente: Wahrnehmung und Steuerung des Beckenbodens mit dem Atemrhythmus.",
    },
    {
      type: "content",
      seg: " Position: Setz dich aufrecht auf einen Stuhl oder leg dich auf den Rücken mit angestellten Beinen. Hände entspannt. Erst die Beckenboden-Wahrnehmung: Stell dir vor, du möchtest gleichzeitig den Strahl beim Wasserlassen unterbrechen und einen Wind verkneifen. Ohne dass dabei dein Gesäß anspannt oder du den Atem anhältst. Das ist eine milde Aktivierung der inneren Schließmuskeln und der Beckenboden-Muskulatur drumherum.",
      kicker: "Position & Wahrnehmung",
      headline: "Den Strahl unterbrechen und einen Wind verkneifen – gleichzeitig.",
      lead: "Aufrecht sitzen oder mit angestellten Beinen liegen. Ohne dass Gesäß anspannt oder du den Atem anhältst – eine milde Aktivierung der inneren Schließmuskeln.",
    },
    {
      type: "statement",
      seg: " Wichtig: Es ist eine milde Aktivierung. Etwa 20 Prozent dessen, was du maximal könntest. Nicht zusammenpressen, nicht den Atem anhalten.",
      text: "Eine milde Aktivierung – etwa 20 Prozent. Nicht pressen, nicht den Atem anhalten.",
      emphasis: "20 Prozent",
    },
    {
      type: "content",
      seg: " Jetzt die Atemkopplung: Bei der Einatmung lässt du den Beckenboden los – er entspannt sich. Bei der Ausatmung aktivierst du sanft die Schließmuskeln. Einatmen loslassen, Ausatmen aktivieren.",
      kicker: "Die Atemkopplung",
      headline: "Einatmen loslassen, Ausatmen aktivieren.",
      lead: "Bei der Einatmung entspannt sich der Beckenboden, bei der Ausatmung aktivierst du sanft die Schließmuskeln.",
    },
    {
      type: "content",
      seg: " Das ist die natürliche Bewegung deines Beckenbodens. Bei chronischem Schmerz ist sie oft gestört – der Beckenboden bleibt entweder dauerhaft angespannt oder reagiert nicht mehr richtig auf die Atmung. Diese Übung kalibriert ihn wieder ein.",
      kicker: "Warum das wirkt",
      headline: "Die natürliche Bewegung des Beckenbodens wieder einkalibrieren.",
      lead: "Bei chronischem Schmerz ist sie oft gestört – der Beckenboden bleibt angespannt oder reagiert nicht mehr richtig auf die Atmung.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: 5 Atemzüge mit Beckenboden-Kopplung. Standard: 10 Atemzüge, plus 3 Sekunden Halte-Phase in der Aktivierung. Belastend: 15 Atemzüge mit länger gehaltener Aktivierung – 5 Sekunden –, optional in der Vierfüßler- oder Liegestütz-Position für Beckenboden unter Last.",
      kicker: "ÜK-A2 · Drei Schienen",
      title: "Beckenboden mit Atmung nach Tagesform",
      items: [
        { label: "Reizarm – 5 Atemzüge mit Beckenboden-Kopplung" },
        { label: "Standard – 10 Atemzüge, plus 3 s Halte-Phase" },
        { label: "Belastend – 15 Atemzüge, 5 s gehalten, optional Vierfüßler/Liegestütz" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Du spannst zu stark an oder ziehst Bauch- und Pomuskeln mit. Such die isolierte milde Aktivierung. Wenn das schwerfällt – was am Anfang oft so ist – üb erst mal nur die Wahrnehmung ohne Atemkopplung.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Zu stark anspannen oder Bauch- und Pomuskeln mitziehen.",
      lead: "Such die isolierte milde Aktivierung. Wenn das schwerfällt – am Anfang oft so – üb erst nur die Wahrnehmung ohne Atemkopplung.",
    },
    {
      type: "content",
      seg: " Eine kurze Bemerkung: Wenn du eine konkrete Beckenboden-Problematik hast – sei es nach einer Geburt, einer Operation oder bei Inkontinenz – dann ist eine spezialisierte Beckenboden-Therapie sinnvoll. Diese Masterclass ersetzt das nicht. Wir machen hier die Grundkalibrierung, die jedem hilft. Postpartale Themen verdienen einen eigenen, spezialisierten Rahmen.",
      kicker: "Wichtiger Hinweis",
      headline: "Bei konkreter Beckenboden-Diagnose: spezialisierte Therapie.",
      lead: "Nach Geburt, Operation oder bei Inkontinenz ersetzt diese Masterclass das nicht. Hier machen wir die Grundkalibrierung, die jedem hilft.",
    },
  ],
};

// ── Abschnitt 6 – Übung 3: ÜK-A3 Box Breathing ───────────────────────────────

const abschnitt6: SourceSection = {
  title: "Übung 3 – Box Breathing (ÜK-A3)",
  narration:
    "Dritte Übung: Box Breathing – die Box-Atmung. Übungskarte ÜK-A3. Diese Übung ist die wirksamste Schmerz-Notfall-Übung, die ich kenne. Sie kostet drei Minuten, kann überall gemacht werden, und sie beruhigt das vegetative Nervensystem sehr direkt. Der Name kommt vom Rhythmus: Du atmest vier Sekunden ein, hältst vier Sekunden, atmest vier Sekunden aus, hältst wieder vier Sekunden. Vier mal vier – wie eine Box. Position: Sitz oder lieg ruhig. Augen geschlossen oder weicher Blick auf einen Punkt. Rhythmus: 4 Sekunden einatmen, in den Rumpf hinein, 360 Grad. 4 Sekunden halten, Bauch entspannt. 4 Sekunden ausatmen, ruhig, vollständig. 4 Sekunden halten, ruhig. Dann wieder von vorne. Reizarme Schiene: 5 Wiederholungen mit 3 Sekunden statt 4. Standard: 10 Wiederholungen mit dem vollen 4-4-4-4-Rhythmus. Belastend: 15 bis 20 Wiederholungen mit 5-5-5-5 oder sogar 6-6-6-6. Wann nutzt du Box Breathing? Erstens: als Eröffnungs-Übung deiner täglichen Bewegungsroutine – drei Minuten vor allem anderen. Zweitens, und das ist der eigentliche Hebel: als Schmerz-Akut-Tool. Wenn du eine Schmerzspitze hast, wenn dein Schmerz hochfährt, wenn du gestresst bist und es im Rücken zieht – drei Minuten Box Breathing senken in der Mehrheit der Fälle die Schmerzintensität messbar. Nicht weg, aber runter. Plus dein Nervensystem schaltet vom Sympathikus-Modus, also Stress, in den Parasympathikus-Modus, also Erholung. In Modul 4 wird Box Breathing zentraler Teil deines Flare-up-Protokolls.",
  slides: [
    {
      type: "term",
      seg: "Dritte Übung: Box Breathing – die Box-Atmung. Übungskarte ÜK-A3.",
      kicker: "Übung 3 · ÜK-A3",
      term: "Box Breathing",
    },
    {
      type: "statement",
      seg: " Diese Übung ist die wirksamste Schmerz-Notfall-Übung, die ich kenne. Sie kostet drei Minuten, kann überall gemacht werden, und sie beruhigt das vegetative Nervensystem sehr direkt.",
      text: "Die wirksamste Schmerz-Notfall-Übung – drei Minuten, überall machbar.",
      emphasis: "Schmerz-Notfall-Übung",
    },
    {
      type: "content",
      seg: " Der Name kommt vom Rhythmus: Du atmest vier Sekunden ein, hältst vier Sekunden, atmest vier Sekunden aus, hältst wieder vier Sekunden. Vier mal vier – wie eine Box.",
      kicker: "Woher der Name kommt",
      headline: "Vier Sekunden ein, vier halten, vier aus, vier halten.",
      lead: "Vier mal vier – wie die vier Seiten einer Box.",
    },
    {
      type: "content",
      seg: " Position: Sitz oder lieg ruhig. Augen geschlossen oder weicher Blick auf einen Punkt.",
      kicker: "Ausgangsposition",
      headline: "Sitz oder lieg ruhig.",
      lead: "Augen geschlossen oder weicher Blick auf einen Punkt.",
    },
    {
      type: "reveal-list",
      seg: " Rhythmus: 4 Sekunden einatmen, in den Rumpf hinein, 360 Grad. 4 Sekunden halten, Bauch entspannt. 4 Sekunden ausatmen, ruhig, vollständig. 4 Sekunden halten, ruhig. Dann wieder von vorne.",
      kicker: "Die vier Seiten der Box",
      title: "Der Rhythmus",
      items: [
        { label: "4 Sekunden einatmen – in den Rumpf hinein, 360 Grad" },
        { label: "4 Sekunden halten – Bauch entspannt" },
        { label: "4 Sekunden ausatmen – ruhig, vollständig" },
        { label: "4 Sekunden halten – ruhig, dann von vorne" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: 5 Wiederholungen mit 3 Sekunden statt 4. Standard: 10 Wiederholungen mit dem vollen 4-4-4-4-Rhythmus. Belastend: 15 bis 20 Wiederholungen mit 5-5-5-5 oder sogar 6-6-6-6.",
      kicker: "ÜK-A3 · Drei Schienen",
      title: "Box Breathing nach Tagesform",
      items: [
        { label: "Reizarm – 5 Wiederholungen mit 3 statt 4 Sekunden" },
        { label: "Standard – 10 Wiederholungen, voller 4-4-4-4-Rhythmus" },
        { label: "Belastend – 15–20 Wiederholungen mit 5-5-5-5 oder 6-6-6-6" },
      ],
    },
    {
      type: "content",
      seg: " Wann nutzt du Box Breathing? Erstens: als Eröffnungs-Übung deiner täglichen Bewegungsroutine – drei Minuten vor allem anderen.",
      kicker: "Wann nutzen · Erstens",
      headline: "Als Eröffnungs-Übung deiner täglichen Bewegungsroutine.",
      lead: "Drei Minuten vor allem anderen.",
    },
    {
      type: "content",
      seg: " Zweitens, und das ist der eigentliche Hebel: als Schmerz-Akut-Tool. Wenn du eine Schmerzspitze hast, wenn dein Schmerz hochfährt, wenn du gestresst bist und es im Rücken zieht – drei Minuten Box Breathing senken in der Mehrheit der Fälle die Schmerzintensität messbar. Nicht weg, aber runter. Plus dein Nervensystem schaltet vom Sympathikus-Modus, also Stress, in den Parasympathikus-Modus, also Erholung.",
      dark: true,
      kicker: "Wann nutzen · Zweitens",
      headline: "Der eigentliche Hebel: als Schmerz-Akut-Tool.",
      lead: "Drei Minuten senken in der Mehrheit der Fälle die Schmerzintensität messbar. Nicht weg, aber runter – das Nervensystem schaltet vom Stress- in den Erholungs-Modus.",
    },
    {
      type: "statement",
      seg: " In Modul 4 wird Box Breathing zentraler Teil deines Flare-up-Protokolls.",
      text: "In Modul 4 wird Box Breathing zentraler Teil deines Flare-up-Protokolls.",
      emphasis: "Flare-up-Protokolls",
    },
  ],
};

// ── Abschnitt 7 – Integration ────────────────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Integration",
  narration:
    "Wie nutzt du diese drei Atem-Werkzeuge im Alltag? ÜK-A1, die 360°-Atmung, als tägliche Praxis – drei bis fünf Minuten, am liebsten morgens oder vor dem Schlafen. ÜK-A2, die Beckenboden-Atmung, am Anfang ein- bis zweimal pro Woche zur Wahrnehmungsschulung. Sobald du sie integriert hast, koppelt sich der Beckenboden in jeder anderen Atmung automatisch mit. ÜK-A3, das Box Breathing, nach Bedarf – immer dann, wenn du sie brauchst. Mehrmals pro Tag ist okay. Alle drei Übungen kannst du im Sitzen machen. Sie brauchen kein Equipment. Sie sind die perfekten Übungen für den Schreibtisch, das Wartezimmer, das Auto, den Zug. Genau dort, wo Rückenschmerz oft am ehesten auftaucht.",
  slides: [
    {
      type: "content",
      seg: "Wie nutzt du diese drei Atem-Werkzeuge im Alltag?",
      kicker: "Integration",
      headline: "Wie nutzt du diese drei Atem-Werkzeuge im Alltag?",
    },
    {
      type: "reveal-list",
      seg: " ÜK-A1, die 360°-Atmung, als tägliche Praxis – drei bis fünf Minuten, am liebsten morgens oder vor dem Schlafen. ÜK-A2, die Beckenboden-Atmung, am Anfang ein- bis zweimal pro Woche zur Wahrnehmungsschulung. Sobald du sie integriert hast, koppelt sich der Beckenboden in jeder anderen Atmung automatisch mit. ÜK-A3, das Box Breathing, nach Bedarf – immer dann, wenn du sie brauchst. Mehrmals pro Tag ist okay.",
      kicker: "Drei Werkzeuge, drei Rhythmen",
      title: "So setzt du sie ein",
      items: [
        { label: "A1 · 360°-Atmung – tägliche Praxis, 3–5 Minuten, morgens oder vor dem Schlafen" },
        { label: "A2 · Beckenboden-Atmung – 1–2x pro Woche zur Wahrnehmungsschulung" },
        { label: "A3 · Box Breathing – nach Bedarf, mehrmals pro Tag ist okay" },
      ],
    },
    {
      type: "statement",
      seg: " Alle drei Übungen kannst du im Sitzen machen. Sie brauchen kein Equipment. Sie sind die perfekten Übungen für den Schreibtisch, das Wartezimmer, das Auto, den Zug. Genau dort, wo Rückenschmerz oft am ehesten auftaucht.",
      text: "Kein Equipment. Im Sitzen. Genau dort, wo Rückenschmerz auftaucht.",
      emphasis: "Kein Equipment",
    },
  ],
};

// ── Abschnitt 8 – Workbook und Übergang ──────────────────────────────────────

const abschnitt8: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 2.5: Atem-Tagebuch. Du beobachtest in den nächsten drei Tagen kurz: Wie atmest du eigentlich gerade? – in unterschiedlichen Situationen: Aufstehen, Schreibtisch, Stressmomente. Diese Wahrnehmung ist die erste Stufe der Veränderung. In Lektion 2.6 geht es um eine andere Form der Dosierung – nicht innerhalb einer Übung, sondern innerhalb deines Tages. Belastungsdosierung und Pacing. Wie verhinderst du den klassischen Push-Crash-Zyklus, in den fast jeder chronische Schmerzpatient mindestens einmal pro Woche fällt? Das schauen wir uns als nächstes an. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 2.5: Atem-Tagebuch. Du beobachtest in den nächsten drei Tagen kurz: Wie atmest du eigentlich gerade? – in unterschiedlichen Situationen: Aufstehen, Schreibtisch, Stressmomente. Diese Wahrnehmung ist die erste Stufe der Veränderung.",
      kicker: "Workbook · Übung 2.5",
      headline: "Ein Workbook-Stopp: Atem-Tagebuch über drei Tage.",
      lead: "Beobachte kurz, wie du gerade atmest – beim Aufstehen, am Schreibtisch, in Stressmomenten. Diese Wahrnehmung ist die erste Stufe der Veränderung.",
    },
    {
      type: "content",
      seg: " In Lektion 2.6 geht es um eine andere Form der Dosierung – nicht innerhalb einer Übung, sondern innerhalb deines Tages. Belastungsdosierung und Pacing. Wie verhinderst du den klassischen Push-Crash-Zyklus, in den fast jeder chronische Schmerzpatient mindestens einmal pro Woche fällt? Das schauen wir uns als nächstes an.",
      kicker: "Als Nächstes · Lektion 2.6",
      headline: "Belastungsdosierung und Pacing – Dosierung innerhalb deines Tages.",
      lead: "Wie verhinderst du den klassischen Push-Crash-Zyklus, in den fast jeder chronische Schmerzpatient mindestens einmal pro Woche fällt?",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 2.6",
      nextTitle: "Belastungsdosierung & Pacing-Prinzipien",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "2.5",
  title: "Atemmechanik & Beckenboden-Verbindung",
  subtitle: "Modul 2 – Kurativ handeln · Das innere Zylinder-System & drei Atem-Tools",
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
