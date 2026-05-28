/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 1.3
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/1.3.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 1.3`). Niemals lessons/1.3.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Aufbau identisch zu 1.1/1.2 (siehe sources/1.1.source.ts für die Konvention):
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * 3.-PERSON-REGEL: Die MD enthielt in Abschnitt 4 und 6 zwei Praxis-Ich-Aussagen
 * („eine Frage, die mir Patienten in der Praxis stellen", „den Teil, den ich
 * Patienten am liebsten erzähle"). Da das konkrete Ersteller-/Praxis-Aussagen
 * sind, wurden sie in die 3. Person über „Max Glawe" umformuliert. Die übrige
 * generische Guide-Ich-Form (der Sprecher erklärt, „das tun wir") bleibt erhalten.
 *
 * HWG: Wortlaut der MD beibehalten, Schmerzforschung sachlich, keine
 * Heilversprechen, keine Diagnose-Aussagen.
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
    "In den ersten beiden Lektionen von Modul 1 haben wir uns die Anatomie deines unteren Rückens angeschaut. Jetzt gehen wir einen Schritt tiefer. In dieser Lektion sprechen wir über etwas, das viele Menschen mit chronischem Kreuzschmerz tief beschäftigt – aber selten in einer Form, die wirklich Erleichterung bringt: die Frage, was chronisch eigentlich bedeutet. Warum manche Schmerzen einfach nicht weggehen. Was im Körper passiert, wenn Schmerz zur Dauerbegleitung wird. Und – das ist die wichtige Frage – was sich daran ändern lässt. Vorab: Diese Lektion enthält Inhalte, die manchen Patienten erstmal befremdlich vorkommen. Vielleicht hast du schon gehört: Das ist alles psychisch oder Du bildest dir das ein oder Stell dich nicht so an. Diese Sätze sind nicht nur falsch – sie sind auch das Gegenteil von dem, was die moderne Schmerzforschung sagt. Was du gleich hören wirst, ist nicht, dass dein Schmerz nicht real ist. Was du hören wirst, ist warum dein Schmerz real ist und gleichzeitig veränderbar – und das ist eine der besten Nachrichten in dieser Masterclass.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 1 – Verstehen",
      lessonLabel: "Lektion 1.3 – Was „chronisch“ wirklich bedeutet",
    },
    {
      type: "content",
      seg: "In den ersten beiden Lektionen von Modul 1 haben wir uns die Anatomie deines unteren Rückens angeschaut. Jetzt gehen wir einen Schritt tiefer.",
      kicker: "Modul 1 – Verstehen",
      headline: "Bisher Anatomie. Jetzt gehen wir einen Schritt tiefer.",
    },
    {
      type: "content",
      seg: " In dieser Lektion sprechen wir über etwas, das viele Menschen mit chronischem Kreuzschmerz tief beschäftigt – aber selten in einer Form, die wirklich Erleichterung bringt: die Frage, was chronisch eigentlich bedeutet.",
      kicker: "Die Frage dieser Lektion",
      headline: "Was bedeutet „chronisch“ eigentlich?",
      lead: "Eine Frage, die viele tief beschäftigt – selten so, dass sie Erleichterung bringt.",
    },
    {
      type: "reveal-list",
      seg: " Warum manche Schmerzen einfach nicht weggehen. Was im Körper passiert, wenn Schmerz zur Dauerbegleitung wird. Und – das ist die wichtige Frage – was sich daran ändern lässt.",
      kicker: "Drei Fragen",
      title: "Worum es heute geht",
      items: [
        { label: "Warum manche Schmerzen nicht weggehen" },
        { label: "Was im Körper passiert, wenn Schmerz bleibt" },
        { label: "Was sich daran ändern lässt" },
      ],
    },
    {
      type: "content",
      seg: " Vorab: Diese Lektion enthält Inhalte, die manchen Patienten erstmal befremdlich vorkommen. Vielleicht hast du schon gehört: Das ist alles psychisch oder Du bildest dir das ein oder Stell dich nicht so an. Diese Sätze sind nicht nur falsch – sie sind auch das Gegenteil von dem, was die moderne Schmerzforschung sagt.",
      kicker: "Vorab",
      headline: "„Das ist alles psychisch.“ „Du bildest dir das ein.“",
      lead: "Diese Sätze sind nicht nur falsch – sie sind das Gegenteil der modernen Schmerzforschung.",
    },
    {
      type: "statement",
      seg: " Was du gleich hören wirst, ist nicht, dass dein Schmerz nicht real ist. Was du hören wirst, ist warum dein Schmerz real ist und gleichzeitig veränderbar – und das ist eine der besten Nachrichten in dieser Masterclass.",
      text: "Dein Schmerz ist real – und veränderbar.",
      emphasis: "veränderbar",
    },
  ],
};

// ── Abschnitt 2 – Was „chronisch" medizinisch heißt ──────────────────────────

const abschnitt2: SourceSection = {
  title: "Was „chronisch“ medizinisch heißt",
  narration:
    "Beginnen wir mit der Definition. In der medizinischen Sprache sprechen wir von akutem Schmerz, wenn er weniger als sechs Wochen besteht. Von subakutem Schmerz, wenn er zwischen sechs und zwölf Wochen besteht. Von chronischem Schmerz, wenn er länger als zwölf Wochen besteht – oder wenn er in regelmäßigen Episoden wiederkehrt. Diese Drei-Monats-Grenze ist eine Konvention. Sie ist nicht zufällig gewählt – etwa nach drei Monaten sind die meisten normalen Gewebeheilungsprozesse abgeschlossen. Wenn ein Schmerz nach drei Monaten noch da ist, heißt das in der Regel: Es heilt nicht mehr etwas, sondern es passiert etwas anderes mit dem Schmerz. Das ist der zentrale konzeptionelle Sprung, den wir in dieser Lektion machen. Akuter Schmerz und chronischer Schmerz sind nicht einfach das gleiche Phänomen – einmal kurz, einmal lang. Sie sind in vielerlei Hinsicht unterschiedliche Phänomene. Akuter Schmerz ist meist ein klares Warnsignal: Hier ist gerade etwas passiert, das Aufmerksamkeit braucht. Chronischer Schmerz ist oft kein Warnsignal mehr – er ist eher eine Fehlanpassung des Schmerzsystems. Wir kommen gleich darauf zurück.",
  slides: [
    {
      type: "word",
      seg: "Beginnen wir mit der Definition.",
      word: "Die Definition.",
    },
    {
      type: "reveal-list",
      seg: " In der medizinischen Sprache sprechen wir von akutem Schmerz, wenn er weniger als sechs Wochen besteht. Von subakutem Schmerz, wenn er zwischen sechs und zwölf Wochen besteht. Von chronischem Schmerz, wenn er länger als zwölf Wochen besteht – oder wenn er in regelmäßigen Episoden wiederkehrt.",
      kicker: "Akut · Subakut · Chronisch",
      title: "Wie lange dauert der Schmerz?",
      items: [
        { label: "Akut: weniger als 6 Wochen" },
        { label: "Subakut: 6 bis 12 Wochen" },
        { label: "Chronisch: länger als 12 Wochen – oder in Episoden wiederkehrend" },
      ],
    },
    {
      type: "content",
      seg: " Diese Drei-Monats-Grenze ist eine Konvention. Sie ist nicht zufällig gewählt – etwa nach drei Monaten sind die meisten normalen Gewebeheilungsprozesse abgeschlossen.",
      kicker: "Die Drei-Monats-Grenze",
      headline: "Nach etwa drei Monaten sind die normalen Heilungsprozesse abgeschlossen.",
      lead: "Die Grenze ist eine Konvention – aber nicht zufällig gewählt.",
    },
    {
      type: "content",
      seg: " Wenn ein Schmerz nach drei Monaten noch da ist, heißt das in der Regel: Es heilt nicht mehr etwas, sondern es passiert etwas anderes mit dem Schmerz. Das ist der zentrale konzeptionelle Sprung, den wir in dieser Lektion machen.",
      dark: true,
      headline: "Es heilt nicht mehr etwas – es passiert etwas anderes mit dem Schmerz.",
      lead: "Das ist der zentrale Sprung dieser Lektion.",
    },
    {
      type: "content",
      seg: " Akuter Schmerz und chronischer Schmerz sind nicht einfach das gleiche Phänomen – einmal kurz, einmal lang. Sie sind in vielerlei Hinsicht unterschiedliche Phänomene.",
      headline: "Akut und chronisch sind nicht dasselbe – nur kurz und lang.",
      lead: "Es sind in vielerlei Hinsicht unterschiedliche Phänomene.",
    },
    {
      type: "reveal-list",
      seg: " Akuter Schmerz ist meist ein klares Warnsignal: Hier ist gerade etwas passiert, das Aufmerksamkeit braucht. Chronischer Schmerz ist oft kein Warnsignal mehr – er ist eher eine Fehlanpassung des Schmerzsystems. Wir kommen gleich darauf zurück.",
      kicker: "Der Unterschied",
      title: "Zwei verschiedene Dinge",
      items: [
        { label: "Akuter Schmerz = ein klares Warnsignal" },
        { label: "Chronischer Schmerz = eine Fehlanpassung des Systems" },
      ],
    },
  ],
};

// ── Abschnitt 3 – Wie aus akut chronisch wird ────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Wie aus akut chronisch wird",
  narration:
    "Wie wird aus einem akuten ein chronischer Schmerz? Stell dir vor, du verstauchst dir das Sprunggelenk. Die ersten Tage tut es weh, weil dort echtes Gewebe gereizt ist. Dein Körper sendet Signale aus: Hier ist etwas. Schon mich. Du humpelst, du belastest weniger, du gibst dem Gelenk Zeit zu heilen. Nach drei, vier Wochen ist die Schwellung weg, die Gewebe sind verheilt. Der Schmerz verschwindet. Klassischer akuter Verlauf. Jetzt stell dir denselben Verlauf vor – aber etwas läuft schief. Die ersten Tage tut es weh wegen der akuten Reizung. Aber dein Nervensystem bleibt in dem Modus, in den es während der akuten Phase geschaltet hat. Es bleibt überwachsam. Es bleibt hochempfindlich. Auch nachdem das Gewebe verheilt ist, sendet es weiter Signale aus, als wäre da noch eine Reizung. Du spürst Schmerz, obwohl die ursprüngliche Ursache längst nicht mehr da ist. Diesen Mechanismus nennt man in der Forschung zentrale Sensibilisierung. Zentral, weil er nicht am Ort der ursprünglichen Verletzung passiert, sondern zentral im Rückenmark und im Gehirn. Sensibilisierung, weil das System empfindlicher geworden ist – also schon auf normale Reize mit Schmerz reagiert. In einfacheren Worten: Dein Schmerzsystem hat seine Sensibilitätsschraube hoch gedreht. Reize, die früher gar nicht oder nur leicht spürbar waren, lösen jetzt Schmerz aus. Bewegungen, die früher völlig normal waren, fühlen sich jetzt bedrohlich an. Das ist nicht eingebildet – das ist eine reale, messbare Veränderung im Nervensystem. Das gilt für chronischen Rückenschmerz genauso wie für viele andere chronische Schmerzformen – Fibromyalgie, chronische Kopfschmerzen, neuropathische Schmerzen. In allen Fällen ist das Schmerzsystem empfindlicher geworden, oft ohne dass die ursprüngliche Strukturursache überhaupt noch da ist. Das mag im ersten Moment frustrierend klingen: Was, mein Schmerz hat keine echte Ursache mehr? Im Gegenteil – das ist eine gute Nachricht. Wenn das Nervensystem die Quelle des Schmerzes ist, dann lässt sich am Nervensystem auch arbeiten. Und das tun wir.",
  slides: [
    {
      type: "word",
      seg: "Wie wird aus einem akuten ein chronischer Schmerz?",
      word: "Wie aus akut chronisch wird.",
    },
    {
      type: "content",
      seg: " Stell dir vor, du verstauchst dir das Sprunggelenk. Die ersten Tage tut es weh, weil dort echtes Gewebe gereizt ist. Dein Körper sendet Signale aus: Hier ist etwas. Schon mich. Du humpelst, du belastest weniger, du gibst dem Gelenk Zeit zu heilen.",
      kicker: "Ein Bild · der akute Verlauf",
      headline: "Du verstauchst dir das Sprunggelenk – echtes Gewebe ist gereizt.",
      lead: "Du humpelst, belastest weniger, gibst dem Gelenk Zeit zu heilen.",
    },
    {
      type: "content",
      seg: " Nach drei, vier Wochen ist die Schwellung weg, die Gewebe sind verheilt. Der Schmerz verschwindet. Klassischer akuter Verlauf.",
      headline: "Nach drei, vier Wochen ist alles verheilt – der Schmerz verschwindet.",
      lead: "Der klassische akute Verlauf.",
    },
    {
      type: "content",
      seg: " Jetzt stell dir denselben Verlauf vor – aber etwas läuft schief. Die ersten Tage tut es weh wegen der akuten Reizung. Aber dein Nervensystem bleibt in dem Modus, in den es während der akuten Phase geschaltet hat. Es bleibt überwachsam. Es bleibt hochempfindlich.",
      kicker: "Wenn etwas schiefläuft",
      headline: "Das Nervensystem bleibt im Alarm-Modus der akuten Phase.",
      lead: "Es bleibt überwachsam. Es bleibt hochempfindlich.",
    },
    {
      type: "statement",
      seg: " Auch nachdem das Gewebe verheilt ist, sendet es weiter Signale aus, als wäre da noch eine Reizung. Du spürst Schmerz, obwohl die ursprüngliche Ursache längst nicht mehr da ist.",
      text: "Du spürst Schmerz, obwohl die ursprüngliche Ursache längst weg ist.",
    },
    {
      type: "content",
      seg: " Diesen Mechanismus nennt man in der Forschung zentrale Sensibilisierung. Zentral, weil er nicht am Ort der ursprünglichen Verletzung passiert, sondern zentral im Rückenmark und im Gehirn. Sensibilisierung, weil das System empfindlicher geworden ist – also schon auf normale Reize mit Schmerz reagiert.",
      kicker: "Zentrale Sensibilisierung",
      headline: "Ein in der Forschung gut beschriebener Mechanismus.",
      lead: "„Zentral“: im Rückenmark und Gehirn. „Sensibilisierung“: das System reagiert schon auf normale Reize.",
    },
    {
      type: "content",
      seg: " In einfacheren Worten: Dein Schmerzsystem hat seine Sensibilitätsschraube hoch gedreht. Reize, die früher gar nicht oder nur leicht spürbar waren, lösen jetzt Schmerz aus. Bewegungen, die früher völlig normal waren, fühlen sich jetzt bedrohlich an.",
      kicker: "Die Sensibilitätsschraube",
      headline: "Dein Schmerzsystem hat die Sensibilität hoch gedreht.",
      lead: "Reize, die früher kaum spürbar waren, lösen jetzt Schmerz aus.",
    },
    {
      type: "statement",
      seg: " Das ist nicht eingebildet – das ist eine reale, messbare Veränderung im Nervensystem.",
      text: "Das ist nicht eingebildet – es ist eine messbare Veränderung im Nervensystem.",
      emphasis: "messbare",
    },
    {
      type: "content",
      seg: " Das gilt für chronischen Rückenschmerz genauso wie für viele andere chronische Schmerzformen – Fibromyalgie, chronische Kopfschmerzen, neuropathische Schmerzen. In allen Fällen ist das Schmerzsystem empfindlicher geworden, oft ohne dass die ursprüngliche Strukturursache überhaupt noch da ist.",
      headline: "Dasselbe gilt für viele chronische Schmerzformen.",
      lead: "Fibromyalgie, Kopfschmerzen, neuropathische Schmerzen – das System ist empfindlicher geworden.",
    },
    {
      type: "content",
      seg: " Das mag im ersten Moment frustrierend klingen: Was, mein Schmerz hat keine echte Ursache mehr? Im Gegenteil – das ist eine gute Nachricht. Wenn das Nervensystem die Quelle des Schmerzes ist, dann lässt sich am Nervensystem auch arbeiten. Und das tun wir.",
      kicker: "Warum das gut ist",
      headline: "Ist das Nervensystem die Quelle, lässt sich am Nervensystem arbeiten.",
      lead: "Klingt erst frustrierend – ist aber genau die gute Nachricht. Und genau das tun wir.",
    },
  ],
};

// ── Abschnitt 4 – „Du bildest dir das ein" – der zentrale Mythos ──────────────

const abschnitt4: SourceSection = {
  title: "„Du bildest dir das ein“ – der zentrale Mythos",
  narration:
    "An dieser Stelle kommt sehr oft eine Frage, die Patienten Max Glawe in der Praxis stellen. Sie klingt ungefähr so: Heißt das, mein Schmerz ist also psychisch? Oder direkter: Bilde ich mir das ein? Die Antwort darauf ist klar: Nein. Dein Schmerz ist real. Du bildest dir nichts ein. Jeder Schmerz, den du spürst, ist hundert Prozent real. Was sich verändert hat, ist die Quelle des Schmerzes – aber nicht seine Realität. Wenn dein Nervensystem das Signal Schmerz sendet, dann ist da Schmerz. So sicher, wie ein Auto fährt, wenn du den Motor startest. Es spielt keine Rolle, ob die ursprüngliche Wunde noch da ist oder nicht – wenn das System das Signal sendet, ist das Erleben real. Die Idee, dass psychisch gleich eingebildet heißt, ist falsch. Sie kommt aus einem alten Modell, in dem es zwei strikt getrennte Welten gab: körperlich oder seelisch. Real oder eingebildet. Dieses Modell ist überholt. Was die moderne Schmerzforschung sagt, ist: Schmerz ist immer körperlich-seelisch zugleich. Es gibt keinen Schmerz, der rein körperlich wäre – jeder Schmerz wird im Gehirn verarbeitet, interpretiert, mit Bedeutung versehen. Und es gibt keinen Schmerz, der rein seelisch wäre – jeder Schmerz ist eine messbare Veränderung in deinem Nervensystem. Heißt: Wenn du das nächste Mal jemanden sagen hörst das ist alles in deinem Kopf, dann darfst du innerlich sagen: Ja klar ist es in meinem Kopf. Genau wie Hunger im Kopf ist und Sehen im Kopf ist und alles andere im Kopf ist. Das macht es nicht weniger real – das macht es behandelbar.",
  slides: [
    {
      type: "content",
      seg: "An dieser Stelle kommt sehr oft eine Frage, die Patienten Max Glawe in der Praxis stellen. Sie klingt ungefähr so: Heißt das, mein Schmerz ist also psychisch? Oder direkter: Bilde ich mir das ein?",
      kicker: "Eine häufige Frage",
      headline: "„Heißt das, mein Schmerz ist psychisch? Bilde ich mir das ein?“",
    },
    {
      type: "statement",
      seg: " Die Antwort darauf ist klar: Nein. Dein Schmerz ist real. Du bildest dir nichts ein. Jeder Schmerz, den du spürst, ist hundert Prozent real.",
      text: "Dein Schmerz ist real. Punkt.",
      emphasis: "real",
    },
    {
      type: "content",
      seg: " Was sich verändert hat, ist die Quelle des Schmerzes – aber nicht seine Realität. Wenn dein Nervensystem das Signal Schmerz sendet, dann ist da Schmerz. So sicher, wie ein Auto fährt, wenn du den Motor startest. Es spielt keine Rolle, ob die ursprüngliche Wunde noch da ist oder nicht – wenn das System das Signal sendet, ist das Erleben real.",
      headline: "Verändert hat sich die Quelle – nicht die Realität.",
      lead: "Sendet das System das Signal, ist da Schmerz. So sicher, wie ein Auto fährt, wenn du den Motor startest.",
    },
    {
      type: "content",
      seg: " Die Idee, dass psychisch gleich eingebildet heißt, ist falsch. Sie kommt aus einem alten Modell, in dem es zwei strikt getrennte Welten gab: körperlich oder seelisch. Real oder eingebildet. Dieses Modell ist überholt.",
      kicker: "Ein überholtes Modell",
      headline: "„Psychisch gleich eingebildet“ stammt aus einem alten Modell.",
      lead: "Zwei getrennte Welten: körperlich oder seelisch, real oder eingebildet. Überholt.",
    },
    {
      type: "reveal-list",
      seg: " Was die moderne Schmerzforschung sagt, ist: Schmerz ist immer körperlich-seelisch zugleich. Es gibt keinen Schmerz, der rein körperlich wäre – jeder Schmerz wird im Gehirn verarbeitet, interpretiert, mit Bedeutung versehen. Und es gibt keinen Schmerz, der rein seelisch wäre – jeder Schmerz ist eine messbare Veränderung in deinem Nervensystem.",
      kicker: "Die moderne Sicht",
      title: "Schmerz ist immer beides zugleich",
      items: [
        { label: "Kein Schmerz ist rein körperlich – das Gehirn verarbeitet und deutet ihn" },
        { label: "Kein Schmerz ist rein seelisch – er ist eine messbare Veränderung im Nervensystem" },
      ],
    },
    {
      type: "statement",
      seg: " Heißt: Wenn du das nächste Mal jemanden sagen hörst das ist alles in deinem Kopf, dann darfst du innerlich sagen: Ja klar ist es in meinem Kopf. Genau wie Hunger im Kopf ist und Sehen im Kopf ist und alles andere im Kopf ist. Das macht es nicht weniger real – das macht es behandelbar.",
      text: "„Alles im Kopf“ macht es nicht weniger real – es macht es behandelbar.",
      emphasis: "behandelbar",
    },
  ],
};

// ── Abschnitt 5 – Was den Wandel begünstigt ──────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Was den Wandel begünstigt",
  narration:
    "Schauen wir uns kurz an, welche Faktoren den Wandel von akut zu chronisch begünstigen. Das ist wichtig zu wissen, weil viele dieser Faktoren veränderbar sind. Erster Faktor: Angst vor Bewegung. In der akuten Phase ist Schonung oft sinnvoll. Aber wenn die Schonung zu lange anhält – wenn du Bewegungen vermeidest, weil du Angst vor Schmerz hast – dann wird das Nervensystem in seinem überwachsamen Modus bestätigt. Es lernt: Bewegung ist gefährlich. Und das ist der Anfang der Chronifizierung. Die englischsprachige Forschung nennt das fear-avoidance behavior – angstgetriebenes Vermeidungsverhalten. Zweiter Faktor: Stress und emotionale Belastung. Anhaltender Stress – beruflich, privat, finanziell – hält das Nervensystem in einem dauerhaft angespannten Zustand. Das ist physiologisch derselbe Zustand, in dem auch Schmerzsensibilisierung gut gedeiht. Menschen, die in einer akuten Schmerzepisode unter hoher Stressbelastung stehen, haben ein deutlich höheres Risiko zu chronifizieren. Dritter Faktor: Schlafmangel. Schlaf ist die Zeit, in der dein Nervensystem regenerativ arbeitet – Entzündungsstoffe abbauen, Nervenverbindungen umordnen, Reize neu kalibrieren. Wer chronisch schlecht schläft, hat ein verändertes Schmerzempfinden. Mehrere Studien zeigen: Schlafstörungen sind nicht nur Folge chronischen Schmerzes, sie sind oft auch Treiber davon. Vierter Faktor: Negative Schmerz-Überzeugungen. Wenn jemand glaubt, dass sein Rücken kaputt ist, dass jede Bewegung schädigt, dass nichts hilft – dann lebt er in einem ständigen Bedrohungs-Modus. Das Nervensystem registriert diese Bedrohungs-Überzeugungen und verstärkt entsprechend. Das ist nicht negatives Denken im esoterischen Sinn – das ist ein neurophysiologisch gut beschriebener Mechanismus. Fünfter Faktor: Soziale Isolation und mangelnde Unterstützung. Menschen, die mit ihrem Schmerz allein sind, chronifizieren häufiger als Menschen mit gutem sozialen Netz. Das hat mit den Stress- und Bedrohungssystemen zu tun, die soziale Verbindung dämpft. Sechster Faktor: Bestimmte Behandlungserfahrungen. Klingt überraschend, ist aber relevant: Menschen, die in der akuten Phase wiederholt zu passiven Behandlungen geschickt werden – immer wieder Spritzen, Massage, Wärme, ohne aktive Eigenanteile – haben ein höheres Chronifizierungsrisiko als Menschen, die früh in aktive Konzepte mit Bewegung und Eigenarbeit eingeführt werden. Schau dir diese Liste an. Vieles davon ist veränderbar. Du kannst lernen, mit Bewegungsangst umzugehen. Du kannst an deinem Stressmanagement arbeiten. Du kannst deinen Schlaf verbessern. Du kannst deine Schmerz-Überzeugungen aktualisieren – das tun wir gerade in dieser Masterclass. Du kannst dir Unterstützung suchen. Und du kannst dich für aktive Behandlungskonzepte entscheiden. Das alles ist Arbeit am System.",
  slides: [
    {
      type: "content",
      seg: "Schauen wir uns kurz an, welche Faktoren den Wandel von akut zu chronisch begünstigen. Das ist wichtig zu wissen, weil viele dieser Faktoren veränderbar sind.",
      kicker: "Was den Wandel begünstigt",
      headline: "Welche Faktoren akut zu chronisch werden lassen.",
      lead: "Wichtig zu wissen – denn viele davon sind veränderbar.",
    },
    {
      type: "content",
      seg: " Erster Faktor: Angst vor Bewegung. In der akuten Phase ist Schonung oft sinnvoll. Aber wenn die Schonung zu lange anhält – wenn du Bewegungen vermeidest, weil du Angst vor Schmerz hast – dann wird das Nervensystem in seinem überwachsamen Modus bestätigt. Es lernt: Bewegung ist gefährlich. Und das ist der Anfang der Chronifizierung. Die englischsprachige Forschung nennt das fear-avoidance behavior – angstgetriebenes Vermeidungsverhalten.",
      kicker: "Faktor 1 · Bewegungsangst",
      headline: "Hält Schonung zu lange an, lernt das System: Bewegung ist gefährlich.",
      lead: "In der Forschung „fear-avoidance behavior“ – angstgetriebenes Vermeidungsverhalten.",
    },
    {
      type: "content",
      seg: " Zweiter Faktor: Stress und emotionale Belastung. Anhaltender Stress – beruflich, privat, finanziell – hält das Nervensystem in einem dauerhaft angespannten Zustand. Das ist physiologisch derselbe Zustand, in dem auch Schmerzsensibilisierung gut gedeiht. Menschen, die in einer akuten Schmerzepisode unter hoher Stressbelastung stehen, haben ein deutlich höheres Risiko zu chronifizieren.",
      kicker: "Faktor 2 · Stress",
      headline: "Anhaltender Stress hält das Nervensystem dauerhaft angespannt.",
      lead: "Genau der Zustand, in dem Schmerzsensibilisierung gut gedeiht.",
    },
    {
      type: "content",
      seg: " Dritter Faktor: Schlafmangel. Schlaf ist die Zeit, in der dein Nervensystem regenerativ arbeitet – Entzündungsstoffe abbauen, Nervenverbindungen umordnen, Reize neu kalibrieren. Wer chronisch schlecht schläft, hat ein verändertes Schmerzempfinden. Mehrere Studien zeigen: Schlafstörungen sind nicht nur Folge chronischen Schmerzes, sie sind oft auch Treiber davon.",
      kicker: "Faktor 3 · Schlaf",
      headline: "Im Schlaf arbeitet das Nervensystem regenerativ.",
      lead: "Studien zeigen: Schlafstörungen sind nicht nur Folge, sondern oft auch Treiber chronischen Schmerzes.",
    },
    {
      type: "content",
      seg: " Vierter Faktor: Negative Schmerz-Überzeugungen. Wenn jemand glaubt, dass sein Rücken kaputt ist, dass jede Bewegung schädigt, dass nichts hilft – dann lebt er in einem ständigen Bedrohungs-Modus. Das Nervensystem registriert diese Bedrohungs-Überzeugungen und verstärkt entsprechend. Das ist nicht negatives Denken im esoterischen Sinn – das ist ein neurophysiologisch gut beschriebener Mechanismus.",
      kicker: "Faktor 4 · Überzeugungen",
      headline: "„Mein Rücken ist kaputt“ hält dich im Bedrohungs-Modus.",
      lead: "Kein esoterisches „negatives Denken“ – ein neurophysiologisch gut beschriebener Mechanismus.",
    },
    {
      type: "content",
      seg: " Fünfter Faktor: Soziale Isolation und mangelnde Unterstützung. Menschen, die mit ihrem Schmerz allein sind, chronifizieren häufiger als Menschen mit gutem sozialen Netz. Das hat mit den Stress- und Bedrohungssystemen zu tun, die soziale Verbindung dämpft.",
      kicker: "Faktor 5 · Isolation",
      headline: "Wer mit dem Schmerz allein ist, chronifiziert häufiger.",
      lead: "Soziale Verbindung dämpft die Stress- und Bedrohungssysteme.",
    },
    {
      type: "content",
      seg: " Sechster Faktor: Bestimmte Behandlungserfahrungen. Klingt überraschend, ist aber relevant: Menschen, die in der akuten Phase wiederholt zu passiven Behandlungen geschickt werden – immer wieder Spritzen, Massage, Wärme, ohne aktive Eigenanteile – haben ein höheres Chronifizierungsrisiko als Menschen, die früh in aktive Konzepte mit Bewegung und Eigenarbeit eingeführt werden.",
      kicker: "Faktor 6 · Passive Behandlung",
      headline: "Nur passive Behandlung erhöht das Chronifizierungsrisiko.",
      lead: "Immer nur Spritzen, Massage, Wärme – ohne aktive Eigenanteile.",
    },
    {
      type: "reveal-list",
      seg: " Schau dir diese Liste an. Vieles davon ist veränderbar. Du kannst lernen, mit Bewegungsangst umzugehen. Du kannst an deinem Stressmanagement arbeiten. Du kannst deinen Schlaf verbessern. Du kannst deine Schmerz-Überzeugungen aktualisieren – das tun wir gerade in dieser Masterclass. Du kannst dir Unterstützung suchen. Und du kannst dich für aktive Behandlungskonzepte entscheiden.",
      kicker: "Sechs Faktoren – vieles veränderbar",
      title: "Was du beeinflussen kannst",
      items: [
        { label: "Mit Bewegungsangst umgehen lernen" },
        { label: "Am Stressmanagement arbeiten" },
        { label: "Den Schlaf verbessern" },
        { label: "Schmerz-Überzeugungen aktualisieren" },
        { label: "Unterstützung suchen" },
        { label: "Dich für aktive Konzepte entscheiden" },
      ],
    },
    {
      type: "statement",
      seg: " Das alles ist Arbeit am System.",
      text: "Das alles ist Arbeit am System.",
      emphasis: "System",
    },
  ],
};

// ── Abschnitt 6 – Die gute Nachricht: Plastizität ────────────────────────────

const abschnitt6: SourceSection = {
  title: "Die gute Nachricht: Plastizität",
  narration:
    "Jetzt kommt der Teil, den Max Glawe Patienten am liebsten erzählt. Das Nervensystem ist plastisch. Das heißt: Es kann sich verändern. In beide Richtungen. Wenn es einmal in Richtung sensibilisiert gewandert ist, kann es auch wieder in Richtung normal zurückkalibriert werden. Das ist keine Theorie – das ist täglich beobachtbare klinische Realität. Wie funktioniert diese Rückkalibrierung? Im Grunde durch dasselbe Prinzip, das auch zur Sensibilisierung geführt hat – nur umgekehrt angewendet. Wenn du deinem Nervensystem über längere Zeit zeigst, dass Bewegung sicher ist, dass bestimmte Aktivitäten nicht zu Verschlimmerung führen, dass dein Körper belastbar ist – dann beginnt es, die Sensibilitätsschraube langsam wieder runter zu drehen. Das passiert nicht über Nacht. Es passiert langsam, oft über Monate. Aber es passiert. Und genau das ist die Mechanik, die hinter Bewegungstherapie, Edukation und Verhaltensänderung steht. Bewegungstherapie funktioniert nicht primär, weil du Muskeln aufbaust – das auch, aber nicht hauptsächlich. Sie funktioniert, weil dein Nervensystem über die Bewegungen lernt: Diese Bewegung ist sicher. Diese Belastung ist okay. Mein Körper macht das mit. Diese Botschaft, regelmäßig wiederholt, dosiert, kalibriert das System neu. Edukation – also das, was wir in dieser Masterclass tun – funktioniert, weil du dein Schmerzmodell aktualisierst. Wenn du verstehst, dass dein Schmerz nicht bedeutet, dass etwas kaputt ist, dann verschwindet ein Teil der Bedrohungs-Empfindung. Und das Nervensystem reagiert messbar darauf. Verhaltensänderung – etwa neue Bewegungsrituale im Alltag, besseren Schlaf, Stressmanagement – schafft die Rahmenbedingungen, in denen die Rückkalibrierung überhaupt stattfinden kann.",
  slides: [
    {
      type: "word",
      seg: "Jetzt kommt der Teil, den Max Glawe Patienten am liebsten erzählt.",
      word: "Plastizität.",
    },
    {
      type: "content",
      seg: " Das Nervensystem ist plastisch. Das heißt: Es kann sich verändern. In beide Richtungen. Wenn es einmal in Richtung sensibilisiert gewandert ist, kann es auch wieder in Richtung normal zurückkalibriert werden. Das ist keine Theorie – das ist täglich beobachtbare klinische Realität.",
      kicker: "Das Nervensystem ist plastisch",
      headline: "Es kann sich verändern – in beide Richtungen.",
      lead: "Was sensibilisiert wurde, kann auch zurückkalibriert werden. Keine Theorie – klinische Realität.",
    },
    {
      type: "content",
      seg: " Wie funktioniert diese Rückkalibrierung? Im Grunde durch dasselbe Prinzip, das auch zur Sensibilisierung geführt hat – nur umgekehrt angewendet. Wenn du deinem Nervensystem über längere Zeit zeigst, dass Bewegung sicher ist, dass bestimmte Aktivitäten nicht zu Verschlimmerung führen, dass dein Körper belastbar ist – dann beginnt es, die Sensibilitätsschraube langsam wieder runter zu drehen.",
      kicker: "Die Rückkalibrierung",
      headline: "Zeig dem System über Zeit: Bewegung ist sicher, der Körper ist belastbar.",
      lead: "Dann dreht es die Sensibilitätsschraube langsam wieder runter.",
    },
    {
      type: "statement",
      seg: " Das passiert nicht über Nacht. Es passiert langsam, oft über Monate. Aber es passiert. Und genau das ist die Mechanik, die hinter Bewegungstherapie, Edukation und Verhaltensänderung steht.",
      text: "Nicht über Nacht – langsam, oft über Monate. Aber es passiert.",
    },
    {
      type: "content",
      seg: " Bewegungstherapie funktioniert nicht primär, weil du Muskeln aufbaust – das auch, aber nicht hauptsächlich. Sie funktioniert, weil dein Nervensystem über die Bewegungen lernt: Diese Bewegung ist sicher. Diese Belastung ist okay. Mein Körper macht das mit. Diese Botschaft, regelmäßig wiederholt, dosiert, kalibriert das System neu.",
      kicker: "Säule 1 · Bewegung",
      headline: "Bewegungstherapie wirkt, weil das System lernt: Das ist sicher.",
      lead: "Nicht primär durch mehr Muskel – durch die wiederholte, dosierte Sicherheits-Botschaft.",
    },
    {
      type: "content",
      seg: " Edukation – also das, was wir in dieser Masterclass tun – funktioniert, weil du dein Schmerzmodell aktualisierst. Wenn du verstehst, dass dein Schmerz nicht bedeutet, dass etwas kaputt ist, dann verschwindet ein Teil der Bedrohungs-Empfindung. Und das Nervensystem reagiert messbar darauf.",
      kicker: "Säule 2 · Edukation",
      headline: "Edukation wirkt, weil du dein Schmerzmodell aktualisierst.",
      lead: "Verstehst du: nichts ist „kaputt“, verschwindet ein Teil der Bedrohung – messbar.",
    },
    {
      type: "content",
      seg: " Verhaltensänderung – etwa neue Bewegungsrituale im Alltag, besseren Schlaf, Stressmanagement – schafft die Rahmenbedingungen, in denen die Rückkalibrierung überhaupt stattfinden kann.",
      kicker: "Säule 3 · Verhaltensänderung",
      headline: "Verhaltensänderung schafft die Rahmenbedingungen.",
      lead: "Neue Bewegungsrituale, besserer Schlaf, Stressmanagement – darin findet Rückkalibrierung statt.",
    },
  ],
};

// ── Abschnitt 7 – Was das praktisch heißt ─────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Was das praktisch heißt",
  narration:
    "Was bedeutet das alles für deine Reise durch diese Masterclass? Es bedeutet: Was wir hier zusammen tun, ist nicht einfach Übungen lernen. Es ist Arbeit am Nervensystem. Jede Übung, die du in Modul 2 lernst, ist auch eine Information an dein Nervensystem: Diese Bewegung ist sicher. Jede Erkenntnis, die du in Modul 1 mitnimmst, ist eine Aktualisierung deines Schmerzmodells. Jedes Ritual, das du in Modul 4 in deinen Alltag einwebst, ist eine wiederholte Sicherheits-Botschaft an dein System. Und das wiederum bedeutet: Geduld ist Teil der Strategie. Du bist nicht in zwei Wochen fertig. Aber du wirst nach zwei Wochen schon erste Veränderungen merken – vielleicht nicht in der Schmerzintensität, aber in der Schmerzkompetenz. Du wirst Schmerz anders einordnen. Du wirst weniger Angst davor haben. Du wirst besser dosieren können. Und das ist oft schon der erste, wichtige Wendepunkt.",
  slides: [
    {
      type: "content",
      seg: "Was bedeutet das alles für deine Reise durch diese Masterclass? Es bedeutet: Was wir hier zusammen tun, ist nicht einfach Übungen lernen. Es ist Arbeit am Nervensystem.",
      kicker: "Was das praktisch heißt",
      headline: "Was wir hier tun, ist nicht einfach Übungen lernen.",
      lead: "Es ist Arbeit am Nervensystem.",
    },
    {
      type: "reveal-list",
      seg: " Jede Übung, die du in Modul 2 lernst, ist auch eine Information an dein Nervensystem: Diese Bewegung ist sicher. Jede Erkenntnis, die du in Modul 1 mitnimmst, ist eine Aktualisierung deines Schmerzmodells. Jedes Ritual, das du in Modul 4 in deinen Alltag einwebst, ist eine wiederholte Sicherheits-Botschaft an dein System.",
      kicker: "Jeder Schritt zählt",
      title: "Alles ist Arbeit am System",
      items: [
        { label: "Jede Übung in Modul 2: „Diese Bewegung ist sicher.“" },
        { label: "Jede Erkenntnis in Modul 1: ein aktualisiertes Schmerzmodell" },
        { label: "Jedes Ritual in Modul 4: eine wiederholte Sicherheits-Botschaft" },
      ],
    },
    {
      type: "content",
      seg: " Und das wiederum bedeutet: Geduld ist Teil der Strategie. Du bist nicht in zwei Wochen fertig. Aber du wirst nach zwei Wochen schon erste Veränderungen merken – vielleicht nicht in der Schmerzintensität, aber in der Schmerzkompetenz.",
      kicker: "Geduld gehört dazu",
      headline: "Geduld ist Teil der Strategie.",
      lead: "Erste Veränderungen schon nach zwei Wochen – vielleicht nicht in der Intensität, aber in der Kompetenz.",
    },
    {
      type: "content",
      seg: " Du wirst Schmerz anders einordnen. Du wirst weniger Angst davor haben. Du wirst besser dosieren können.",
      headline: "Schmerz anders einordnen, weniger Angst, besser dosieren.",
      lead: "Schmerzkompetenz kommt vor Schmerzreduktion – beides ist Fortschritt.",
    },
    {
      type: "statement",
      seg: " Und das ist oft schon der erste, wichtige Wendepunkt.",
      text: "Oft schon der erste, wichtige Wendepunkt.",
      emphasis: "Wendepunkt",
    },
  ],
};

// ── Abschnitt 8 – Workbook und Übergang ───────────────────────────────────────

const abschnitt8: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Bevor du in Lektion 1.4 weitergehst – ein wichtiger Workbook-Stopp. Im Workbook findest du Übung 1.3: Mein Schmerz-Profil. Hier trägst du ein, wie lange dein Schmerz schon dauert, welche Faktoren ihn schlechter machen, welche ihn besser machen, und welche der besprochenen Risikofaktoren – Bewegungsangst, Stress, Schlaf, negative Überzeugungen – bei dir eine Rolle spielen könnten. Diese Übung ist die Basis für deine spätere Ritual-Map. In der nächsten Lektion – 1.4 – sprechen wir über etwas, das viele Patienten lange beschäftigt: das MRT. Was steht da eigentlich drauf? Was bedeutet Bandscheibenvorwölbung oder Spondylarthrose wirklich? Warum sagen Befunde oft erstaunlich wenig über deinen Schmerz aus? Und wie solltest du mit einem solchen Befund umgehen, ohne dich krank machen zu lassen von Wörtern, die schlimm klingen? Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Bevor du in Lektion 1.4 weitergehst – ein wichtiger Workbook-Stopp. Im Workbook findest du Übung 1.3: Mein Schmerz-Profil. Hier trägst du ein, wie lange dein Schmerz schon dauert, welche Faktoren ihn schlechter machen, welche ihn besser machen, und welche der besprochenen Risikofaktoren – Bewegungsangst, Stress, Schlaf, negative Überzeugungen – bei dir eine Rolle spielen könnten. Diese Übung ist die Basis für deine spätere Ritual-Map.",
      kicker: "Workbook · Übung 1.3",
      headline: "Ein wichtiger Workbook-Stopp: Mein Schmerz-Profil.",
      lead: "Dauer, verstärkende und lindernde Faktoren, deine Risikofaktoren – die Basis für die spätere Ritual-Map.",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 1.4 – sprechen wir über etwas, das viele Patienten lange beschäftigt: das MRT. Was steht da eigentlich drauf? Was bedeutet Bandscheibenvorwölbung oder Spondylarthrose wirklich? Warum sagen Befunde oft erstaunlich wenig über deinen Schmerz aus?",
      kicker: "Als Nächstes · Lektion 1.4",
      headline: "Das MRT-Paradox: Was steht da eigentlich drauf?",
      lead: "Warum Befunde oft erstaunlich wenig über deinen Schmerz aussagen.",
    },
    {
      type: "outro",
      seg: " Und wie solltest du mit einem solchen Befund umgehen, ohne dich krank machen zu lassen von Wörtern, die schlimm klingen?",
      nextLabel: "Lektion 1.4",
      nextTitle: "Das MRT-Paradox: Befund vs. Schmerz",
      hint: "Weiter →",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "1.3",
  title: "Was „chronisch“ wirklich bedeutet",
  subtitle: "Modul 1 – Verstehen · Chronifizierung & Plastizität",
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
