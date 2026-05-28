/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 2.1
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/2.1.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 2.1`). Niemals lessons/2.1.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Erste Lektion von Modul 2 (Kurativ handeln). Aufbau identisch zu 1.1–1.5:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * 3.-PERSON-REGEL: 2.1 (Mindset-Setup für Modul 2) enthält ausschließlich
 * generische Guide-Ich-/Wir-/Du-Form (der Sprecher erklärt, „lass mich dir mitgeben",
 * „zeige ich dir in Modul 4"). Keine Ersteller-/Praxis-/Credential-Aussagen über den
 * Schöpfer → keine Umschreibung auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD wird beibehalten. Bewegung wird als Mechanismus/Therapie
 *   beschrieben, nicht als Heilversprechen. Aussagen bleiben prozesshaft
 *   („kann wirken", „gute Chancen", „besser werden"), exakt wie in der MD.
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
    "Willkommen in Modul 2. Wir verlassen jetzt das Modul Verstehen und betreten das Modul Handeln. In Modul 1 hast du gelernt, was in deinem Rücken passiert und warum chronischer Schmerz so funktioniert, wie er funktioniert. In Modul 2 lernst du, was du damit machen kannst. Bevor wir aber mit der ersten konkreten Übung starten, müssen wir eine wichtige philosophische Vorarbeit leisten. Diese Lektion ist eine Lektion ohne Übungen. Sie ist eine Lektion über das Warum der Übungen, über das Mindset, mit dem du an sie herangehen solltest. Wenn dieses Mindset nicht stimmt, wirst du Übungen entweder schlecht ausführen oder bald wieder aufhören. Wenn es stimmt, hast du gute Chancen, dass die folgenden Übungen wirklich wirken.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 2 – Kurativ handeln",
      lessonLabel: "Lektion 2.1 – Bewegungsphilosophie: Warum Bewegung Medizin ist",
    },
    {
      type: "statement",
      seg: "Willkommen in Modul 2. Wir verlassen jetzt das Modul Verstehen und betreten das Modul Handeln.",
      text: "Vom Verstehen ins Handeln.",
      emphasis: "Handeln",
    },
    {
      type: "content",
      seg: " In Modul 1 hast du gelernt, was in deinem Rücken passiert und warum chronischer Schmerz so funktioniert, wie er funktioniert. In Modul 2 lernst du, was du damit machen kannst.",
      kicker: "Was sich ändert",
      headline: "Modul 1 war das Warum. Modul 2 ist das Was-du-tun-kannst.",
    },
    {
      type: "content",
      seg: " Bevor wir aber mit der ersten konkreten Übung starten, müssen wir eine wichtige philosophische Vorarbeit leisten. Diese Lektion ist eine Lektion ohne Übungen. Sie ist eine Lektion über das Warum der Übungen, über das Mindset, mit dem du an sie herangehen solltest.",
      kicker: "Eine Lektion ohne Übungen",
      headline: "Erst die Vorarbeit: das Warum und das Mindset.",
      lead: "Mit welcher Haltung du an die Übungen herangehst.",
    },
    {
      type: "statement",
      seg: " Wenn dieses Mindset nicht stimmt, wirst du Übungen entweder schlecht ausführen oder bald wieder aufhören. Wenn es stimmt, hast du gute Chancen, dass die folgenden Übungen wirklich wirken.",
      text: "Das Mindset entscheidet, ob die Übung wirkt.",
      emphasis: "Mindset",
    },
  ],
};

// ── Abschnitt 2 – Die Schonungs-Falle ─────────────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Die Schonungs-Falle",
  narration:
    "Beginnen wir mit einer Überzeugung, die in unserer Kultur tief verankert ist und die für chronischen Rückenschmerz oft das Gegenteil von hilfreich ist: Wenn etwas weh tut, dann schone es. Diese Überzeugung kommt aus einer Welt, die viele akute Verletzungen kannte – Knochenbrüche, Bänderrisse, frische Wunden. Bei diesen Verletzungen ist Schonung tatsächlich oft richtig: Du gibst dem Gewebe Zeit zu heilen. Nach drei, vier Wochen ist alles vernarbt, und du kannst langsam wieder anfangen zu belasten. Bei chronischem Rückenschmerz funktioniert diese Strategie nicht. Im Gegenteil – sie ist oft Teil des Problems. Warum? Weil bei chronischem Schmerz die Sensitivitätseinstellung deines Nervensystems – erinnere dich an die Alarmanlage – bereits hoch ist. Wenn du jetzt schonst, machst du zwei Dinge gleichzeitig: Erstens: Du gibst dem Nervensystem zusätzliche Bestätigung, dass die Bewegung gefährlich ist. Ich vermeide das, also muss es schlimm sein. Die Sensitivität bleibt oben. Das Problem verfestigt sich. Zweitens: Du verlierst genau die körperlichen Eigenschaften, die deinen Rücken vor zukünftigen Schmerzen schützen würden. Muskeln werden schwächer. Faszien werden weniger gleitfähig. Bewegungsmuster werden ungeschickter. Die Lastverteilung wird schlechter. Mit jedem Tag Schonung wird dein Körper weniger belastbar. Das Ergebnis ist ein Teufelskreis, den Forschende seit Jahren beschreiben: Schmerz führt zu Schonung, Schonung führt zu reduzierter Belastbarkeit, reduzierte Belastbarkeit führt zu mehr Schmerz bei kleineren Belastungen, das führt zu noch mehr Schonung. Und so weiter. Die Leitlinien sind heute eindeutig: Bei akutem Rückenschmerz wird Bettruhe explizit nicht empfohlen. Bei chronischem Rückenschmerz wird aktive Bewegungstherapie an erster Stelle empfohlen. Nicht passive Behandlung. Nicht Schonung. Aktive Bewegung.",
  slides: [
    {
      type: "quote",
      seg: "Beginnen wir mit einer Überzeugung, die in unserer Kultur tief verankert ist und die für chronischen Rückenschmerz oft das Gegenteil von hilfreich ist: Wenn etwas weh tut, dann schone es.",
      text: "Wenn etwas weh tut, dann schone es.",
      caption: "Eine tief verankerte Überzeugung – und bei chronischem Schmerz oft das Gegenteil von hilfreich.",
    },
    {
      type: "content",
      seg: " Diese Überzeugung kommt aus einer Welt, die viele akute Verletzungen kannte – Knochenbrüche, Bänderrisse, frische Wunden. Bei diesen Verletzungen ist Schonung tatsächlich oft richtig: Du gibst dem Gewebe Zeit zu heilen. Nach drei, vier Wochen ist alles vernarbt, und du kannst langsam wieder anfangen zu belasten.",
      kicker: "Bei akuten Verletzungen",
      headline: "Bei Knochenbruch oder Bänderriss ist Schonung oft richtig.",
      lead: "Du gibst dem Gewebe Zeit – nach drei, vier Wochen ist es vernarbt.",
    },
    {
      type: "statement",
      seg: " Bei chronischem Rückenschmerz funktioniert diese Strategie nicht. Im Gegenteil – sie ist oft Teil des Problems.",
      text: "Bei chronischem Schmerz ist Schonung oft Teil des Problems.",
      emphasis: "Teil des Problems",
    },
    {
      type: "content",
      seg: " Warum? Weil bei chronischem Schmerz die Sensitivitätseinstellung deines Nervensystems – erinnere dich an die Alarmanlage – bereits hoch ist. Wenn du jetzt schonst, machst du zwei Dinge gleichzeitig:",
      kicker: "Erinnere dich an die Alarmanlage",
      headline: "Die Sensitivität ist schon hoch. Schonen macht zwei Dinge gleichzeitig.",
    },
    {
      type: "content",
      seg: " Erstens: Du gibst dem Nervensystem zusätzliche Bestätigung, dass die Bewegung gefährlich ist. Ich vermeide das, also muss es schlimm sein. Die Sensitivität bleibt oben. Das Problem verfestigt sich.",
      kicker: "Erstens",
      headline: "Du bestätigst dem Nervensystem: diese Bewegung ist gefährlich.",
      lead: "„Ich vermeide das, also muss es schlimm sein.“ Die Sensitivität bleibt oben.",
    },
    {
      type: "reveal-list",
      seg: " Zweitens: Du verlierst genau die körperlichen Eigenschaften, die deinen Rücken vor zukünftigen Schmerzen schützen würden. Muskeln werden schwächer. Faszien werden weniger gleitfähig. Bewegungsmuster werden ungeschickter. Die Lastverteilung wird schlechter. Mit jedem Tag Schonung wird dein Körper weniger belastbar.",
      kicker: "Zweitens · was du verlierst",
      title: "Mit jedem Tag Schonung weniger belastbar",
      items: [
        { label: "Muskeln werden schwächer" },
        { label: "Faszien werden weniger gleitfähig" },
        { label: "Bewegungsmuster werden ungeschickter" },
        { label: "Die Lastverteilung wird schlechter" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Das Ergebnis ist ein Teufelskreis, den Forschende seit Jahren beschreiben: Schmerz führt zu Schonung, Schonung führt zu reduzierter Belastbarkeit, reduzierte Belastbarkeit führt zu mehr Schmerz bei kleineren Belastungen, das führt zu noch mehr Schonung. Und so weiter.",
      dark: true,
      kicker: "Der Teufelskreis",
      title: "Schonung → weniger Belastbarkeit → mehr Schmerz",
      items: [
        { label: "Schmerz führt zu Schonung" },
        { label: "Schonung führt zu reduzierter Belastbarkeit" },
        { label: "Weniger Belastbarkeit führt zu mehr Schmerz bei kleineren Belastungen" },
        { label: "Mehr Schmerz führt zu noch mehr Schonung" },
      ],
    },
    {
      type: "statement",
      seg: " Die Leitlinien sind heute eindeutig: Bei akutem Rückenschmerz wird Bettruhe explizit nicht empfohlen. Bei chronischem Rückenschmerz wird aktive Bewegungstherapie an erster Stelle empfohlen. Nicht passive Behandlung. Nicht Schonung. Aktive Bewegung.",
      text: "Die Leitlinien sagen eindeutig: aktive Bewegung statt Schonung.",
      emphasis: "aktive Bewegung",
    },
  ],
};

// ── Abschnitt 3 – Bewegung als Medizin: Die sechs Mechanismen ─────────────────

const abschnitt3: SourceSection = {
  title: "Bewegung als Medizin: Die sechs Mechanismen",
  narration:
    "Aber was macht Bewegung eigentlich konkret? Warum hilft sie? In den letzten zwanzig Jahren hat die Forschung sehr genau analysiert, was bei aktiver Bewegungstherapie passiert. Die Mechanismen sind vielfältig – und es ist nützlich, sie zu kennen, damit du verstehst, warum dich gleich ein Bird-Dog oder ein Hip-Hinge wirklich besser machen kann. Erster Mechanismus: Sicherheits-Information ans Nervensystem. Wir haben das in Lektion 1.5 ausführlich besprochen. Jede schmerzfreie oder gering schmerzhafte Bewegung ist eine kleine Information für dein Nervensystem: Diese Bewegung ist sicher. Hunderte solcher Informationen über Wochen kalibrieren die Sensitivität herunter. Das ist nicht nebenbei – das ist der Hauptmechanismus moderner Bewegungstherapie bei chronischem Schmerz. Zweiter Mechanismus: Wiederaufbau der lokalen Stabilisatoren. Erinnerst du dich an den Multifidus aus Lektion 1.2 – den kleinen tiefen Stabilisator? Bei chronischem Rückenschmerz funktioniert er meistens schlechter. Gezieltes Training stellt seine Funktion wieder her. Eine gute Stabilisation reduziert das, was Forschende aberrant motion nennen – kleine, ungewollte Wackelbewegungen zwischen Wirbeln. Weniger Wackelbewegung heißt weniger Reizung heißt weniger Schmerz. Dritter Mechanismus: Verbesserung der Lastverteilung. In Lektion 1.2 haben wir auch über den Gluteus gesprochen – die Gesäßmuskulatur. Wenn er schwach ist, übernimmt der untere Rücken seine Arbeit. Das ist ein klassisches Schmerzmuster. Krafttraining für Hüfte und Gesäß entlastet den unteren Rücken oft mehr als jede Übung direkt am Rücken. Vierter Mechanismus: Faszien-Mobilität. Faszien lieben Bewegung – das hatten wir auch. Eine durchbewegte Fascia thoracolumbalis ist gleitfähiger, hat bessere Stoffwechselversorgung, ist weniger reizbar. Mobilisationsübungen wirken direkt auf diese Schicht. Fünfter Mechanismus: Endogene Schmerzmodulation. Dein Körper produziert während und nach Bewegung eigene Schmerz-Dämpfer – Endorphine, Endocannabinoide, das parasympathische Nervensystem fährt hoch. Das ist nicht Einbildung, das ist neurobiologisch sauber beschrieben. Bewegung ist tatsächlich Schmerztherapie auf molekularer Ebene. Sechster Mechanismus: Verbesserung von Stress, Schlaf, Stimmung. Wir wissen aus Lektion 1.3, dass diese Faktoren chronischen Schmerz aufrechterhalten können. Regelmäßige Bewegung verbessert sie nachweislich. Das ist systemische Therapie – nicht punktuell, sondern auf das ganze Schmerz-Ökosystem wirkend. Mit anderen Worten: Wenn du gleich Übungen lernst, dann lernst du nicht Sport zum Muskeln machen. Du lernst sechs gleichzeitig wirkende Therapie-Mechanismen, die alle gemeinsam dein Schmerzsystem in die richtige Richtung bewegen. Das ist Medizin im wahrsten Sinne des Wortes.",
  slides: [
    {
      type: "content",
      seg: "Aber was macht Bewegung eigentlich konkret? Warum hilft sie?",
      kicker: "Sechs Mechanismen",
      headline: "Aber was macht Bewegung eigentlich konkret?",
    },
    {
      type: "content",
      seg: " In den letzten zwanzig Jahren hat die Forschung sehr genau analysiert, was bei aktiver Bewegungstherapie passiert. Die Mechanismen sind vielfältig – und es ist nützlich, sie zu kennen, damit du verstehst, warum dich gleich ein Bird-Dog oder ein Hip-Hinge wirklich besser machen kann.",
      headline: "Die Mechanismen sind vielfältig – und nützlich zu kennen.",
      lead: "Damit du verstehst, warum dich gleich ein Bird-Dog oder ein Hip-Hinge besser machen kann.",
    },
    {
      type: "content",
      seg: " Erster Mechanismus: Sicherheits-Information ans Nervensystem. Wir haben das in Lektion 1.5 ausführlich besprochen. Jede schmerzfreie oder gering schmerzhafte Bewegung ist eine kleine Information für dein Nervensystem: Diese Bewegung ist sicher. Hunderte solcher Informationen über Wochen kalibrieren die Sensitivität herunter. Das ist nicht nebenbei – das ist der Hauptmechanismus moderner Bewegungstherapie bei chronischem Schmerz.",
      kicker: "Mechanismus 1 · Sicherheits-Info",
      headline: "Jede gute Bewegung sagt dem Nervensystem: diese Bewegung ist sicher.",
      lead: "Hunderte solcher Informationen kalibrieren die Sensitivität herunter – der Hauptmechanismus.",
    },
    {
      type: "content",
      seg: " Zweiter Mechanismus: Wiederaufbau der lokalen Stabilisatoren. Erinnerst du dich an den Multifidus aus Lektion 1.2 – den kleinen tiefen Stabilisator? Bei chronischem Rückenschmerz funktioniert er meistens schlechter. Gezieltes Training stellt seine Funktion wieder her. Eine gute Stabilisation reduziert das, was Forschende aberrant motion nennen – kleine, ungewollte Wackelbewegungen zwischen Wirbeln. Weniger Wackelbewegung heißt weniger Reizung heißt weniger Schmerz.",
      kicker: "Mechanismus 2 · Stabilisatoren",
      headline: "Gezieltes Training stellt die Funktion des Multifidus wieder her.",
      lead: "Weniger ungewollte Wackelbewegungen zwischen Wirbeln – weniger Reizung, weniger Schmerz.",
    },
    {
      type: "content",
      seg: " Dritter Mechanismus: Verbesserung der Lastverteilung. In Lektion 1.2 haben wir auch über den Gluteus gesprochen – die Gesäßmuskulatur. Wenn er schwach ist, übernimmt der untere Rücken seine Arbeit. Das ist ein klassisches Schmerzmuster. Krafttraining für Hüfte und Gesäß entlastet den unteren Rücken oft mehr als jede Übung direkt am Rücken.",
      kicker: "Mechanismus 3 · Lastverteilung",
      headline: "Ist der Gluteus schwach, übernimmt der untere Rücken seine Arbeit.",
      lead: "Kraft für Hüfte und Gesäß entlastet den Rücken oft mehr als jede Übung direkt am Rücken.",
    },
    {
      type: "content",
      seg: " Vierter Mechanismus: Faszien-Mobilität. Faszien lieben Bewegung – das hatten wir auch. Eine durchbewegte Fascia thoracolumbalis ist gleitfähiger, hat bessere Stoffwechselversorgung, ist weniger reizbar. Mobilisationsübungen wirken direkt auf diese Schicht.",
      kicker: "Mechanismus 4 · Faszien",
      headline: "Faszien lieben Bewegung.",
      lead: "Eine durchbewegte Fascia thoracolumbalis ist gleitfähiger, besser versorgt, weniger reizbar.",
    },
    {
      type: "content",
      seg: " Fünfter Mechanismus: Endogene Schmerzmodulation. Dein Körper produziert während und nach Bewegung eigene Schmerz-Dämpfer – Endorphine, Endocannabinoide, das parasympathische Nervensystem fährt hoch. Das ist nicht Einbildung, das ist neurobiologisch sauber beschrieben. Bewegung ist tatsächlich Schmerztherapie auf molekularer Ebene.",
      kicker: "Mechanismus 5 · Endogene Modulation",
      headline: "Dein Körper produziert bei Bewegung eigene Schmerz-Dämpfer.",
      lead: "Endorphine, Endocannabinoide, parasympathisches Nervensystem – Schmerztherapie auf molekularer Ebene.",
    },
    {
      type: "content",
      seg: " Sechster Mechanismus: Verbesserung von Stress, Schlaf, Stimmung. Wir wissen aus Lektion 1.3, dass diese Faktoren chronischen Schmerz aufrechterhalten können. Regelmäßige Bewegung verbessert sie nachweislich. Das ist systemische Therapie – nicht punktuell, sondern auf das ganze Schmerz-Ökosystem wirkend.",
      kicker: "Mechanismus 6 · Stress, Schlaf, Stimmung",
      headline: "Regelmäßige Bewegung verbessert Stress, Schlaf und Stimmung.",
      lead: "Systemische Therapie – nicht punktuell, sondern auf das ganze Schmerz-Ökosystem wirkend.",
    },
    {
      type: "reveal-list",
      seg: " Mit anderen Worten: Wenn du gleich Übungen lernst, dann lernst du nicht Sport zum Muskeln machen. Du lernst sechs gleichzeitig wirkende Therapie-Mechanismen, die alle gemeinsam dein Schmerzsystem in die richtige Richtung bewegen.",
      kicker: "Sechs Wege gleichzeitig",
      title: "Sechs gleichzeitig wirkende Mechanismen",
      items: [
        { label: "Sicherheits-Information ans Nervensystem" },
        { label: "Wiederaufbau der lokalen Stabilisatoren" },
        { label: "Verbesserung der Lastverteilung" },
        { label: "Faszien-Mobilität" },
        { label: "Endogene Schmerzmodulation" },
        { label: "Verbesserung von Stress, Schlaf, Stimmung" },
      ],
    },
    {
      type: "statement",
      seg: " Das ist Medizin im wahrsten Sinne des Wortes.",
      text: "Bewegung ist nicht Sport. Bewegung ist Medizin.",
      emphasis: "Medizin",
    },
  ],
};

// ── Abschnitt 4 – Die fünf Bewegungs-Prinzipien ───────────────────────────────

const abschnitt4: SourceSection = {
  title: "Die fünf Bewegungs-Prinzipien",
  narration:
    "Bevor wir in die konkreten Übungen gehen, lass mich dir fünf Prinzipien mitgeben, nach denen du in dieser Masterclass mit Bewegung arbeitest. Diese Prinzipien gelten immer – egal ob du eine Mobilisation machst, ein Kraftpaar, oder einfach einen Spaziergang gehst. Erstes Prinzip: Dosiert. Du wirst Übungen nicht in maximaler Intensität machen, sondern in passender Intensität. Bei chronischem Schmerz ist zu wenig oft besser als zu viel. Du gehst nicht ans Limit, du gehst in eine Reizdosis, die dein System verarbeiten kann. Wenn du am nächsten Tag stärker Schmerz hast, war es zu viel – nicht zu wenig. Das ist eine wichtige Verschiebung des Denkens, vor allem für Leute, die früher viel Sport gemacht haben. Zweites Prinzip: Regelmäßig. Häufige kleine Reize wirken besser als seltene große. Lieber jeden Tag fünfzehn Minuten als einmal pro Woche eine Stunde. Dein Nervensystem lernt durch Wiederholung – nicht durch Intensität. Das ist der ganze Grund, warum wir in Modul 4 mit Habit Stacking arbeiten: Tägliche Mini-Dosen sind die wirksame Form. Drittes Prinzip: Vielseitig. Dein Rücken liebt Variabilität. Nicht immer dieselbe Bewegung, nicht immer dieselbe Position, nicht immer dieselbe Belastungsart. Ein Tag Mobilisation, ein Tag Kraft, ein Tag Spaziergang, ein Tag Rumpfstabilisation. Diese Variabilität gibt deinem System mehr Lernerfahrungen, mehr Sicherheits-Signale, mehr Lastverteilungs-Optionen. Viertes Prinzip: Schmerzadaptiv. Das ist der zentrale Begriff dieser Masterclass. Du wirst nicht trotz Schmerz trainieren und auch nicht nur ohne Schmerz. Du wirst lernen, deinen Tagesschmerz wahrzunehmen und die Übung daran anzupassen. An guten Tagen mehr Intensität, an schlechten Tagen weniger – aber an beiden Tagen etwas. Genau dafür hat jede unserer Übungen drei Schienen: reizarm, Standard, belastend. Du wirst lernen, diese Schienen flexibel zu wählen. Fünftes Prinzip: Alltagsintegriert. Die Bewegung der Masterclass soll nicht in deinem Alltag eine Insel sein. Sie soll im Alltag stattfinden. In Modul 4 zeige ich dir, wie du Übungen an Rituale knüpfst – Kaffeemaschine, Zähneputzen, Schreibtischpause. Damit sie nicht zur lästigen Pflicht werden, sondern zu Routinen, die du nicht mehr bemerkst. Halte diese fünf Prinzipien fest, während wir gleich in die ersten Übungen gehen: Dosiert. Regelmäßig. Vielseitig. Schmerzadaptiv. Alltagsintegriert. Das ist die DNA der Bewegung, die hier wirkt.",
  slides: [
    {
      type: "content",
      seg: "Bevor wir in die konkreten Übungen gehen, lass mich dir fünf Prinzipien mitgeben, nach denen du in dieser Masterclass mit Bewegung arbeitest. Diese Prinzipien gelten immer – egal ob du eine Mobilisation machst, ein Kraftpaar, oder einfach einen Spaziergang gehst.",
      kicker: "Fünf Prinzipien",
      headline: "Fünf Prinzipien, die immer gelten.",
      lead: "Egal ob Mobilisation, Kraftpaar oder einfach ein Spaziergang.",
    },
    {
      type: "content",
      seg: " Erstes Prinzip: Dosiert. Du wirst Übungen nicht in maximaler Intensität machen, sondern in passender Intensität. Bei chronischem Schmerz ist zu wenig oft besser als zu viel. Du gehst nicht ans Limit, du gehst in eine Reizdosis, die dein System verarbeiten kann. Wenn du am nächsten Tag stärker Schmerz hast, war es zu viel – nicht zu wenig. Das ist eine wichtige Verschiebung des Denkens, vor allem für Leute, die früher viel Sport gemacht haben.",
      kicker: "Prinzip 1 · Dosiert",
      headline: "Passende Intensität, nicht maximale.",
      lead: "Zu wenig ist oft besser als zu viel. Mehr Schmerz am nächsten Tag heißt: es war zu viel.",
    },
    {
      type: "content",
      seg: " Zweites Prinzip: Regelmäßig. Häufige kleine Reize wirken besser als seltene große. Lieber jeden Tag fünfzehn Minuten als einmal pro Woche eine Stunde. Dein Nervensystem lernt durch Wiederholung – nicht durch Intensität. Das ist der ganze Grund, warum wir in Modul 4 mit Habit Stacking arbeiten: Tägliche Mini-Dosen sind die wirksame Form.",
      kicker: "Prinzip 2 · Regelmäßig",
      headline: "Häufige kleine Reize wirken besser als seltene große.",
      lead: "Lieber jeden Tag fünfzehn Minuten. Dein Nervensystem lernt durch Wiederholung, nicht durch Intensität.",
    },
    {
      type: "content",
      seg: " Drittes Prinzip: Vielseitig. Dein Rücken liebt Variabilität. Nicht immer dieselbe Bewegung, nicht immer dieselbe Position, nicht immer dieselbe Belastungsart. Ein Tag Mobilisation, ein Tag Kraft, ein Tag Spaziergang, ein Tag Rumpfstabilisation. Diese Variabilität gibt deinem System mehr Lernerfahrungen, mehr Sicherheits-Signale, mehr Lastverteilungs-Optionen.",
      kicker: "Prinzip 3 · Vielseitig",
      headline: "Dein Rücken liebt Variabilität.",
      lead: "Mobilisation, Kraft, Spaziergang, Stabilisation – mehr Lernerfahrungen, mehr Sicherheits-Signale.",
    },
    {
      type: "content",
      seg: " Viertes Prinzip: Schmerzadaptiv. Das ist der zentrale Begriff dieser Masterclass. Du wirst nicht trotz Schmerz trainieren und auch nicht nur ohne Schmerz. Du wirst lernen, deinen Tagesschmerz wahrzunehmen und die Übung daran anzupassen. An guten Tagen mehr Intensität, an schlechten Tagen weniger – aber an beiden Tagen etwas. Genau dafür hat jede unserer Übungen drei Schienen: reizarm, Standard, belastend. Du wirst lernen, diese Schienen flexibel zu wählen.",
      dark: true,
      kicker: "Prinzip 4 · Schmerzadaptiv",
      headline: "Nicht trotz Schmerz, nicht nur ohne – sondern angepasst an deinen Tag.",
      lead: "An guten Tagen mehr, an schlechten weniger, aber an beiden etwas. Jede Übung hat drei Schienen: reizarm, Standard, belastend.",
    },
    {
      type: "content",
      seg: " Fünftes Prinzip: Alltagsintegriert. Die Bewegung der Masterclass soll nicht in deinem Alltag eine Insel sein. Sie soll im Alltag stattfinden. In Modul 4 zeige ich dir, wie du Übungen an Rituale knüpfst – Kaffeemaschine, Zähneputzen, Schreibtischpause. Damit sie nicht zur lästigen Pflicht werden, sondern zu Routinen, die du nicht mehr bemerkst.",
      kicker: "Prinzip 5 · Alltagsintegriert",
      headline: "Bewegung soll im Alltag stattfinden, nicht daneben.",
      lead: "An Rituale geknüpft – Kaffeemaschine, Zähneputzen, Schreibtischpause – bis sie zu Routinen werden.",
    },
    {
      type: "reveal-list",
      seg: " Halte diese fünf Prinzipien fest, während wir gleich in die ersten Übungen gehen: Dosiert. Regelmäßig. Vielseitig. Schmerzadaptiv. Alltagsintegriert. Das ist die DNA der Bewegung, die hier wirkt.",
      kicker: "Die DNA der Bewegung",
      title: "Halte diese fünf fest",
      items: [
        { label: "Dosiert" },
        { label: "Regelmäßig" },
        { label: "Vielseitig" },
        { label: "Schmerzadaptiv" },
        { label: "Alltagsintegriert" },
      ],
    },
  ],
};

// ── Abschnitt 5 – Was kommt in Modul 2 ────────────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Was kommt in Modul 2",
  narration:
    "Was erwartet dich in den nächsten Lektionen? Lektion 2.2: Schmerzmodulierende Mobilisation. Sanfte, oft im Liegen oder Vierfüßler-Stand ausgeführte Bewegungen, die deinen Rücken durchbluten, mobilisieren und beruhigen. Das sind die Übungen, die du auch an schlechten Tagen machen kannst – oft sogar dann besonders gerne, weil sie schmerzlindernd wirken. Lektion 2.3: Modernes Rumpftraining Teil 1 – Stabilisation. Hier trainierst du die Feinkontrolle – Multifidus, Transversus, die tiefen Stabilisatoren. Nicht laut, nicht spektakulär, aber neurologisch enorm wirksam. Lektion 2.4: Modernes Rumpftraining Teil 2 – Belastungstoleranz. Hier trainierst du Kraft. Echtes, dosiertes Krafttraining mit Hip Hinges, Kniebeugen, Carries. Du wirst überrascht sein, wie viel dein Rücken aushält – wenn er trainiert ist. Lektion 2.5: Atemmechanik und Beckenboden. Eine der unterschätztesten Bewegungs-Werkzeuge überhaupt. Lektion 2.6: Belastungsdosierung und Pacing. Wie du im Alltag zwischen Aktivitäts-Spitzen und Erholung dosierst, um nicht in den klassischen Push-Crash-Zyklus zu fallen. Lektion 2.7: Schmerz-Coping. Mentale Werkzeuge, mit denen du in Schmerz-Momenten handlungsfähig bleibst – ohne entweder zu verkrampfen oder einzubrechen.",
  slides: [
    {
      type: "content",
      seg: "Was erwartet dich in den nächsten Lektionen?",
      kicker: "Modul 2 · Ausblick",
      headline: "Was erwartet dich in den nächsten Lektionen?",
    },
    {
      type: "content",
      seg: " Lektion 2.2: Schmerzmodulierende Mobilisation. Sanfte, oft im Liegen oder Vierfüßler-Stand ausgeführte Bewegungen, die deinen Rücken durchbluten, mobilisieren und beruhigen. Das sind die Übungen, die du auch an schlechten Tagen machen kannst – oft sogar dann besonders gerne, weil sie schmerzlindernd wirken.",
      kicker: "Lektion 2.2",
      headline: "Schmerzmodulierende Mobilisation.",
      lead: "Sanfte Bewegungen, die durchbluten und beruhigen – auch an schlechten Tagen machbar.",
    },
    {
      type: "content",
      seg: " Lektion 2.3: Modernes Rumpftraining Teil 1 – Stabilisation. Hier trainierst du die Feinkontrolle – Multifidus, Transversus, die tiefen Stabilisatoren. Nicht laut, nicht spektakulär, aber neurologisch enorm wirksam.",
      kicker: "Lektion 2.3",
      headline: "Rumpftraining 1 – Stabilisation.",
      lead: "Feinkontrolle der tiefen Stabilisatoren – nicht spektakulär, aber neurologisch enorm wirksam.",
    },
    {
      type: "content",
      seg: " Lektion 2.4: Modernes Rumpftraining Teil 2 – Belastungstoleranz. Hier trainierst du Kraft. Echtes, dosiertes Krafttraining mit Hip Hinges, Kniebeugen, Carries. Du wirst überrascht sein, wie viel dein Rücken aushält – wenn er trainiert ist.",
      kicker: "Lektion 2.4",
      headline: "Rumpftraining 2 – Belastungstoleranz.",
      lead: "Echtes, dosiertes Krafttraining. Du wirst überrascht sein, wie viel dein Rücken aushält.",
    },
    {
      type: "content",
      seg: " Lektion 2.5: Atemmechanik und Beckenboden. Eine der unterschätztesten Bewegungs-Werkzeuge überhaupt.",
      kicker: "Lektion 2.5",
      headline: "Atemmechanik und Beckenboden.",
      lead: "Eines der unterschätztesten Bewegungs-Werkzeuge überhaupt.",
    },
    {
      type: "content",
      seg: " Lektion 2.6: Belastungsdosierung und Pacing. Wie du im Alltag zwischen Aktivitäts-Spitzen und Erholung dosierst, um nicht in den klassischen Push-Crash-Zyklus zu fallen.",
      kicker: "Lektion 2.6",
      headline: "Belastungsdosierung und Pacing.",
      lead: "Zwischen Aktivitäts-Spitzen und Erholung dosieren – raus aus dem Push-Crash-Zyklus.",
    },
    {
      type: "module",
      seg: " Lektion 2.7: Schmerz-Coping. Mentale Werkzeuge, mit denen du in Schmerz-Momenten handlungsfähig bleibst – ohne entweder zu verkrampfen oder einzubrechen.",
      number: "2",
      title: "Modul 2 – Kurativ handeln",
      lead: "Sieben Lektionen, von der Philosophie bis zum Coping.",
      items: [
        { label: "2.2 – Schmerzmodulierende Mobilisation" },
        { label: "2.3 – Rumpftraining 1: Stabilisation" },
        { label: "2.4 – Rumpftraining 2: Belastungstoleranz" },
        { label: "2.5 – Atemmechanik & Beckenboden" },
        { label: "2.6 – Belastungsdosierung & Pacing" },
        { label: "2.7 – Schmerz-Coping" },
      ],
    },
  ],
};

// ── Abschnitt 6 – Workbook und Übergang ───────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 2.1: Meine Bewegungs-Anamnese. Eine kurze Bestandsaufnahme: Was bewegst du aktuell schon? Was würdest du gerne wieder können? Welche Bewegungen meidest du, und seit wann? Bevor du in Lektion 2.2 weitergehst, hol dir bitte das, was du dafür brauchst: eine ruhige Ecke, eine Yogamatte oder Decke auf dem Boden, bequeme Kleidung, ein Kissen für unter den Kopf. Eine Massagerolle ist hilfreich, aber nicht zwingend – wir kommen darauf zurück. Dann sehen wir uns auf der Matte.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 2.1: Meine Bewegungs-Anamnese. Eine kurze Bestandsaufnahme: Was bewegst du aktuell schon? Was würdest du gerne wieder können? Welche Bewegungen meidest du, und seit wann?",
      kicker: "Workbook · Übung 2.1",
      headline: "Ein Workbook-Stopp: Meine Bewegungs-Anamnese.",
      lead: "Was bewegst du schon? Was würdest du gerne wieder können? Was meidest du, und seit wann?",
    },
    {
      type: "checklist",
      seg: " Bevor du in Lektion 2.2 weitergehst, hol dir bitte das, was du dafür brauchst: eine ruhige Ecke, eine Yogamatte oder Decke auf dem Boden, bequeme Kleidung, ein Kissen für unter den Kopf. Eine Massagerolle ist hilfreich, aber nicht zwingend – wir kommen darauf zurück.",
      items: [
        { icon: "exercise", label: "Yogamatte oder Decke" },
        { icon: "integrate", label: "Bequeme Kleidung" },
        { icon: "quiet", label: "Kissen für unter den Kopf" },
        { icon: "toolbox", label: "Massagerolle (optional)" },
        { icon: "quiet", label: "Eine ruhige Ecke" },
      ],
    },
    {
      type: "word",
      seg: " Dann sehen wir uns auf der Matte.",
      word: "Auf der Matte.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 2.2",
      nextTitle: "Schmerzmodulierende Mobilisation",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "2.1",
  title: "Bewegungsphilosophie: Warum Bewegung Medizin ist",
  subtitle: "Modul 2 – Kurativ handeln · Das Mindset vor der ersten Übung",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
  ],
};
