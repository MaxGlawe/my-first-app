/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion I.1
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/I.1.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs I.1`). Niemals lessons/I.1.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Konvention für alle Lektionen: jede `sources/<lessonId>.source.ts` exportiert
 * ihre Lektion als `lessonSource: SourceLesson`. (I.1 exportiert zusätzlich den
 * Alt-Namen `i1Source` für Rückwärtskompatibilität.)
 *
 * Aufbau pro Abschnitt:
 *   - `narration`: der bereinigte Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker
 *     und Emphasis-`*` entfernt). EXAKT der Text, der an ElevenLabs geht und
 *     vertont wird. Auch das Transkript im Player kommt 1:1 daraus.
 *   - `slides[]`: die vorhandenen Slide-Inhalte/-Typen, jeweils ergänzt um
 *     `seg` — das zusammenhängende Sprech-Segment (verbatim-Teilstring der
 *     `narration`), bei dem die Slide erscheinen soll.
 *
 * WICHTIG zur Determiniertheit der Timings:
 *   Die `seg`-Strings eines Abschnitts schließen LÜCKENLOS aneinander an und
 *   ergeben aneinandergehängt wieder die ganze `narration`. Das Build-Skript
 *   sucht den Start jedes `seg` sequenziell (Whitespace-robust) im gesprochenen
 *   Text und setzt `appearTime = starts[offset]`. Die erste Slide je Abschnitt
 *   bekommt `seg = ""` (→ appearTime 0).
 *
 * GERMAN-QUOTE-GOTCHA (CLAUDE.md): ASCII-`"` in TS-Strings bricht das Literal.
 * Deshalb in narration/seg NUR einfache Anführungen ('...') oder gar keine.
 * Die Anzeige-Strings der Slides nutzen typografische Quotes („…") — die sind
 * unproblematisch, weil sie keine String-Delimiter sind.
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
    "Willkommen. Ich freue mich, dass du hier bist. Das ist kein leerer Satz. Wenn du diese Masterclass öffnest, dann hast du bereits eine Entscheidung getroffen, die viele Menschen mit chronischen Kreuzschmerzen nie treffen: Du hast entschieden, dass es Zeit ist, das Thema selbst in die Hand zu nehmen. Nicht weil Ärzte oder Therapeuten dir nicht helfen können. Sondern weil du verstanden hast, dass du der wichtigste Mensch in dieser Geschichte bist. Nicht jemand, der dir zwischendurch eine Spritze setzt oder dir sagt: Ruhe halten und abwarten. Ich spreche dich in dieser Masterclass durchgängig mit du an. Nicht aus Distanzlosigkeit, sondern weil wir hier eine Arbeitsbeziehung haben – auch wenn sie über Bildschirm und Kopfhörer läuft. Und in Arbeitsbeziehungen reden wir auf Augenhöhe.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Chronischer Kreuzschmerz",
      lessonLabel: "Lektion I.1 – Willkommen & Versprechen",
    },
    {
      type: "word",
      seg: "Willkommen.",
      word: "Willkommen.",
    },
    {
      type: "content",
      seg: " Ich freue mich, dass du hier bist.",
      kicker: "Schön, dass du hier bist",
      headline: "Ich freue mich, dass du hier bist.",
      lead: "Das ist kein leerer Satz.",
    },
    {
      type: "content",
      seg: " Das ist kein leerer Satz. Wenn du diese Masterclass öffnest, dann hast du bereits eine Entscheidung getroffen, die viele Menschen mit chronischen Kreuzschmerzen nie treffen:",
      kicker: "Deine Entscheidung",
      headline: "Du hast bereits eine Entscheidung getroffen.",
      lead: "Eine, die viele Menschen mit chronischen Kreuzschmerzen nie treffen.",
    },
    {
      type: "statement",
      seg: " Du hast entschieden, dass es Zeit ist, das Thema selbst in die Hand zu nehmen.",
      text: "Es ist Zeit, das Thema selbst in die Hand zu nehmen.",
    },
    {
      type: "content",
      seg: " Nicht weil Ärzte oder Therapeuten dir nicht helfen können.",
      headline: "Nicht, weil Ärzte oder Therapeuten dir nicht helfen können.",
    },
    {
      type: "statement",
      seg: " Sondern weil du verstanden hast, dass du der wichtigste Mensch in dieser Geschichte bist.",
      text: "Du bist der wichtigste Mensch in dieser Geschichte.",
      emphasis: "du",
    },
    {
      type: "quote",
      seg: " Nicht jemand, der dir zwischendurch eine Spritze setzt oder dir sagt: Ruhe halten und abwarten.",
      text: "Ruhe halten und abwarten.",
      caption: "Nicht das, was wir hier tun.",
    },
    {
      type: "content",
      seg: " Ich spreche dich in dieser Masterclass durchgängig mit du an. Nicht aus Distanzlosigkeit, sondern weil wir hier eine Arbeitsbeziehung haben –",
      kicker: "Auf Augenhöhe",
      headline: "Ich spreche dich durchgängig mit du an.",
      lead: "Nicht aus Distanzlosigkeit, sondern weil wir eine Arbeitsbeziehung haben.",
    },
    {
      type: "visual",
      seg: " auch wenn sie über Bildschirm und Kopfhörer läuft. Und in Arbeitsbeziehungen reden wir auf Augenhöhe.",
      caption: "Auf Augenhöhe. Bewegung ist der rote Faden.",
    },
  ],
};

// ── Abschnitt 2 – Versprechen und Grenzen ───────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Versprechen und Grenzen",
  narration:
    "Bevor wir loslegen, möchte ich klarmachen, was diese Masterclass ist – und was sie nicht ist. Diese Masterclass ist: ein Werkzeugkasten. Sie ist eine sorgfältig aufgebaute Anleitung, mit der du verstehen wirst, warum dein Rücken tut, was er tut. Sie zeigt dir Übungen, mit denen du arbeiten kannst. Sie gibt dir Strategien, mit denen du Schmerzepisoden besser einordnen, besser dosieren und besser bewältigen kannst. Und sie hilft dir, all das in deinen Alltag zu integrieren – so, dass es nicht zur lästigen Pflicht wird, sondern Teil deines Tages. Diese Masterclass ist nicht: ein Heilversprechen. Ich verspreche dir keinen schmerzfreien Rücken in vier Wochen. Niemand auf dieser Welt kann dir das seriös versprechen – und alle, die es tun, sind unseriös. Chronischer Kreuzschmerz ist ein komplexes Phänomen. Was wir hier gemeinsam tun können, ist dir Schmerzkompetenz, Werkzeuge und Selbstwirksamkeit zurückzugeben. Was bedeutet das praktisch? Es bedeutet: Du wirst nach dieser Masterclass nicht zwangsläufig schmerzfrei sein. Aber du wirst deinen Schmerz besser verstehen, besser einordnen, und in den allermeisten Fällen besser handhaben können. Du wirst weniger Angst vor ihm haben. Und Angst ist – das wirst du in Modul 1 noch genauer kennenlernen – einer der größten Verstärker von chronischem Schmerz. Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik. Wenn du Symptome hast, die in den Bereich der sogenannten Red Flags fallen, dann gehörst du in ärztliche Abklärung. Was das genau bedeutet, klären wir in Lektion I.3 – also gleich. Klare Spielregeln. Das ist die Basis, auf der wir miteinander arbeiten.",
  slides: [
    {
      type: "content",
      seg: "Bevor wir loslegen, möchte ich klarmachen, was diese Masterclass ist – und was sie nicht ist.",
      kicker: "Klare Spielregeln",
      headline: "Was diese Masterclass ist – und was nicht.",
    },
    {
      type: "term",
      seg: " Diese Masterclass ist: ein Werkzeugkasten.",
      kicker: "Diese Masterclass ist",
      term: "Ein Werkzeugkasten.",
    },
    {
      type: "content",
      seg: " Sie ist eine sorgfältig aufgebaute Anleitung, mit der du verstehen wirst, warum dein Rücken tut, was er tut.",
      headline: "Du wirst verstehen, warum dein Rücken tut, was er tut.",
      lead: "Eine sorgfältig aufgebaute Anleitung.",
    },
    {
      type: "reveal-list",
      seg: " Sie zeigt dir Übungen, mit denen du arbeiten kannst. Sie gibt dir Strategien, mit denen du Schmerzepisoden besser einordnen, besser dosieren und besser bewältigen kannst.",
      title: "Übungen und Strategien",
      items: [
        { label: "Übungen, mit denen du arbeiten kannst" },
        { label: "Schmerzepisoden besser einordnen" },
        { label: "Besser dosieren" },
        { label: "Besser bewältigen" },
      ],
    },
    {
      type: "list",
      seg: " Und sie hilft dir, all das in deinen Alltag zu integrieren – so, dass es nicht zur lästigen Pflicht wird, sondern Teil deines Tages.",
      title: "Was diese Masterclass IST",
      items: [
        { icon: "toolbox", label: "Werkzeugkasten" },
        { icon: "understand", label: "Verstehen" },
        { icon: "exercise", label: "Übungen" },
        { icon: "integrate", label: "Alltagsintegration" },
      ],
    },
    {
      type: "anti-list",
      seg: " Diese Masterclass ist nicht: ein Heilversprechen.",
      title: "Was diese Masterclass NICHT IST",
      items: [
        { label: "Kein Heilversprechen" },
        { label: "Kein Ersatz für Diagnostik" },
        { label: "Keine schmerzfreie Garantie" },
      ],
    },
    {
      type: "content",
      seg: " Ich verspreche dir keinen schmerzfreien Rücken in vier Wochen. Niemand auf dieser Welt kann dir das seriös versprechen – und alle, die es tun, sind unseriös.",
      dark: true,
      headline: "Keinen schmerzfreien Rücken in vier Wochen.",
      lead: "Niemand kann dir das seriös versprechen – und alle, die es tun, sind unseriös.",
    },
    {
      type: "statement",
      seg: " Chronischer Kreuzschmerz ist ein komplexes Phänomen.",
      text: "Chronischer Kreuzschmerz ist ein komplexes Phänomen.",
    },
    {
      type: "reveal-list",
      seg: " Was wir hier gemeinsam tun können, ist dir Schmerzkompetenz, Werkzeuge und Selbstwirksamkeit zurückzugeben.",
      kicker: "Was wir gemeinsam tun können",
      title: "Wir geben dir zurück:",
      items: [
        { label: "Schmerzkompetenz" },
        { label: "Werkzeuge" },
        { label: "Selbstwirksamkeit" },
      ],
    },
    {
      type: "content",
      seg: " Was bedeutet das praktisch? Es bedeutet: Du wirst nach dieser Masterclass nicht zwangsläufig schmerzfrei sein.",
      kicker: "Was bedeutet das praktisch?",
      headline: "Du wirst nicht zwangsläufig schmerzfrei sein.",
    },
    {
      type: "reveal-list",
      seg: " Aber du wirst deinen Schmerz besser verstehen, besser einordnen, und in den allermeisten Fällen besser handhaben können.",
      title: "Aber du wirst deinen Schmerz",
      items: [
        { label: "besser verstehen" },
        { label: "besser einordnen" },
        { label: "besser handhaben" },
      ],
    },
    {
      type: "content",
      seg: " Du wirst weniger Angst vor ihm haben. Und Angst ist – das wirst du in Modul 1 noch genauer kennenlernen – einer der größten Verstärker von chronischem Schmerz.",
      headline: "Du wirst weniger Angst vor ihm haben.",
      lead: "Und Angst ist einer der größten Verstärker von chronischem Schmerz.",
    },
    {
      type: "statement",
      seg: " Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik.",
      text: "Diese Masterclass ersetzt nicht deinen Arzt oder deine Diagnostik.",
    },
    {
      type: "content",
      seg: " Wenn du Symptome hast, die in den Bereich der sogenannten Red Flags fallen, dann gehörst du in ärztliche Abklärung. Was das genau bedeutet, klären wir in Lektion I.3 – also gleich.",
      kicker: "Red Flags",
      headline: "Manche Symptome gehören zuerst in ärztliche Abklärung.",
      lead: "Was das genau bedeutet, klären wir in Lektion I.3 – also gleich.",
    },
    {
      type: "statement",
      seg: " Klare Spielregeln. Das ist die Basis, auf der wir miteinander arbeiten.",
      text: "Schmerzkompetenz statt Schmerzfreiheits-Versprechen.",
    },
  ],
};

// ── Abschnitt 3 – Wer hier spricht und warum (3. Person über Max) ───────────
// Neu geschrieben: die Stimme (Adrian) darf Max nicht vortäuschen. Identitäts-
// und Credential-Aussagen daher in der 3. Person über „Max/er/seine Praxis".

const abschnitt3: SourceSection = {
  title: "Wer hier spricht und warum",
  narration:
    "Ein kurzes Wort dazu, von wem diese Masterclass stammt und warum es sie überhaupt gibt. Entwickelt wurde sie von Max Glawe, Physiotherapeut und sektoraler Heilpraktiker für Physiotherapie. Das heißt vereinfacht: Er darf Patienten ohne ärztliche Verordnung behandeln, weil er die diagnostische Verantwortung selbst tragen kann. In seiner Praxis in Wildau sieht er seit Jahren Menschen mit chronischem Kreuzschmerz. Und dabei zeigt sich immer wieder dasselbe Muster. Diese Menschen kommen oft erst zu ihm, nachdem sie schon Jahre durch das System gegangen sind. MRT, Spritze, Krankschreibung. Vielleicht ein OP-Vorschlag, vielleicht nur ein achselzuckendes Da müssen Sie mit leben. Was die meisten nicht bekommen haben, ist eine vernünftige Erklärung. Sie wissen nicht, was wirklich in ihrem Rücken passiert. Sie haben nie verstanden, warum Bewegung helfen soll, wenn doch jede Bewegung weh tut. Und sie haben kein wirkliches Werkzeug, das sie selbst anwenden können. Das ist der Grund, warum diese Masterclass existiert. In der Praxis lässt sich pro Tag nur eine begrenzte Zahl Menschen begleiten, mehr nicht. Aber das, was diese Menschen brauchen, das Verstehen, die Werkzeuge, die Strategien, das lässt sich vermitteln. Strukturiert, klar, sauber. In dieser Masterclass bekommst du genau dieses Wissen, dasselbe, das Max in seiner Praxis vermittelt. In besserer Reihenfolge, mit mehr Zeit pro Thema, und so aufbereitet, dass du in deinem eigenen Tempo damit arbeiten kannst.",
  slides: [
    {
      type: "content",
      seg: "Ein kurzes Wort dazu, von wem diese Masterclass stammt und warum es sie überhaupt gibt.",
      kicker: "Wer hier spricht",
      headline: "Ein kurzes Wort dazu, warum diese Masterclass existiert.",
    },
    {
      type: "speaker",
      seg: " Entwickelt wurde sie von Max Glawe, Physiotherapeut und sektoraler Heilpraktiker für Physiotherapie.",
      name: "Max Glawe",
      title:
        "Physiotherapeut & sektoraler Heilpraktiker für Physiotherapie · Praxis Wildau",
    },
    {
      type: "content",
      seg: " Das heißt vereinfacht: Er darf Patienten ohne ärztliche Verordnung behandeln, weil er die diagnostische Verantwortung selbst tragen kann.",
      headline: "Er darf ohne ärztliche Verordnung behandeln.",
      lead: "Weil er die diagnostische Verantwortung selbst tragen kann.",
    },
    {
      type: "content",
      seg: " In seiner Praxis in Wildau sieht er seit Jahren Menschen mit chronischem Kreuzschmerz. Und dabei zeigt sich immer wieder dasselbe Muster.",
      kicker: "Praxis Wildau",
      headline: "Seit Jahren zeigt sich dasselbe Muster.",
    },
    {
      type: "content",
      seg: " Diese Menschen kommen oft erst zu ihm, nachdem sie schon Jahre durch das System gegangen sind.",
      headline: "Sie kommen oft erst nach Jahren im System.",
    },
    {
      type: "reveal-list",
      seg: " MRT, Spritze, Krankschreibung. Vielleicht ein OP-Vorschlag,",
      dark: true,
      title: "Jahre im System",
      items: [
        { label: "MRT" },
        { label: "Spritze" },
        { label: "Krankschreibung" },
        { label: "OP-Vorschlag" },
      ],
    },
    {
      type: "quote",
      seg: " vielleicht nur ein achselzuckendes Da müssen Sie mit leben.",
      dark: true,
      text: "Da müssen Sie mit leben.",
      caption: "Was die meisten gehört haben.",
    },
    {
      type: "statement",
      seg: " Was die meisten nicht bekommen haben, ist eine vernünftige Erklärung.",
      text: "Was fehlt, ist eine vernünftige Erklärung.",
    },
    {
      type: "reveal-list",
      seg: " Sie wissen nicht, was wirklich in ihrem Rücken passiert. Sie haben nie verstanden, warum Bewegung helfen soll, wenn doch jede Bewegung weh tut. Und sie haben kein wirkliches Werkzeug, das sie selbst anwenden können.",
      title: "Was fehlt",
      items: [
        { label: "Verstehen, was im Rücken passiert" },
        { label: "Warum Bewegung helfen soll" },
        { label: "Ein Werkzeug, das man selbst anwenden kann" },
      ],
    },
    {
      type: "statement",
      seg: " Das ist der Grund, warum diese Masterclass existiert.",
      text: "Genau deshalb existiert diese Masterclass.",
    },
    {
      type: "content",
      seg: " In der Praxis lässt sich pro Tag nur eine begrenzte Zahl Menschen begleiten, mehr nicht.",
      headline: "In der Praxis lässt sich pro Tag nur eine begrenzte Zahl Menschen begleiten.",
    },
    {
      type: "reveal-list",
      seg: " Aber das, was diese Menschen brauchen, das Verstehen, die Werkzeuge, die Strategien, das lässt sich vermitteln. Strukturiert, klar, sauber.",
      kicker: "Das lässt sich vermitteln",
      title: "Strukturiert. Klar. Sauber.",
      items: [
        { label: "Das Verstehen" },
        { label: "Die Werkzeuge" },
        { label: "Die Strategien" },
      ],
    },
    {
      type: "statement",
      seg: " In dieser Masterclass bekommst du genau dieses Wissen, dasselbe, das Max in seiner Praxis vermittelt. In besserer Reihenfolge, mit mehr Zeit pro Thema, und so aufbereitet, dass du in deinem eigenen Tempo damit arbeiten kannst.",
      text: "Dasselbe Wissen wie in der Praxis – in deinem Tempo.",
    },
  ],
};

// ── Abschnitt 4 – Die Reise im Überblick ────────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Die Reise im Überblick",
  narration:
    "Lass uns kurz darauf schauen, wie wir vorgehen. Diese Masterclass ist wie ein Album aufgebaut. Es gibt eine Intro, vier Module, und eine Outro. Du kannst der Reihe nach durchhören oder einzelne Lektionen gezielt ansteuern. Beides funktioniert. Ich empfehle dir aber, beim ersten Durchgang in der Reihenfolge zu bleiben – die Module bauen aufeinander auf. In der Intro, in der du dich gerade befindest, klären wir die Spielregeln. Lektion I.2 demystifiziert die vielen Namen, die dein Schmerz haben kann – Lumbalgie, Hexenschuss, Bandscheibe, ISG. Lektion I.3 ist ein Selbstcheck: Gehörst du eigentlich in diese Masterclass, oder gibt es Symptome, die zuerst ärztliche Abklärung brauchen? Modul 1 – Verstehen. Hier lernst du, was wirklich in deinem Rücken passiert. Anatomie und Funktion in einer Sprache, die du auch verstehst, wenn du Medizin nicht studiert hast. Was chronisch eigentlich heißt. Warum MRT-Befunde dich oft mehr verwirren als helfen. Und wie dein Schmerzsystem funktioniert – das ist der wichtigste Baustein der ganzen Masterclass. Modul 2 – Kurativ handeln. Hier bekommst du konkrete Werkzeuge: Mobilisationsübungen, modernes Rumpftraining, Atemmechanik, Belastungsdosierung, Schmerz-Coping. Alles direkt anwendbar, alles begründet aus dem, was du in Modul 1 verstanden hast. Modul 3 – Prävention. Wie hältst du das, was du dir erarbeitet hast? Belastbarkeit statt Schonung. Haltungs-Mythen entzaubert. Schlaf, Stress, Ernährung als stille Schmerzmodulatoren. Modul 4 – Recoping. Ehrlich gesagt mein Lieblingsteil. Hier zeige ich dir, wie du die Übungen in deinen Alltag einwebst – nicht als lästige Aufgabe, sondern als kleine Rituale. Plus ein Krisen-Protokoll für die Tage, an denen es trotzdem wieder schlechter wird. In der Outro sortieren wir gemeinsam, was du jetzt in der Hand hast – und wie du damit weitergehst. Insgesamt rund 27 Lektionen, im Schnitt zwanzig Minuten. Du kannst eine Lektion in einer Mittagspause durchhören. Du musst nicht alles auf einmal verstehen. Im Gegenteil – ich empfehle dir, Lektionen wirken zu lassen, bevor du zur nächsten gehst.",
  slides: [
    {
      type: "content",
      seg: "Lass uns kurz darauf schauen, wie wir vorgehen.",
      kicker: "Die Reise im Überblick",
      headline: "Lass uns kurz darauf schauen, wie wir vorgehen.",
    },
    {
      type: "content",
      seg: " Diese Masterclass ist wie ein Album aufgebaut. Es gibt eine Intro, vier Module, und eine Outro.",
      kicker: "Wie ein Album",
      headline: "Eine Intro, vier Module, eine Outro.",
    },
    {
      type: "content",
      seg: " Du kannst der Reihe nach durchhören oder einzelne Lektionen gezielt ansteuern. Beides funktioniert. Ich empfehle dir aber, beim ersten Durchgang in der Reihenfolge zu bleiben – die Module bauen aufeinander auf.",
      headline: "Beim ersten Durchgang in der Reihenfolge bleiben.",
      lead: "Die Module bauen aufeinander auf.",
    },
    {
      // Mitlaufende Übersicht: alle 6 Stationen sichtbar, Highlight auf Intro.
      type: "timeline",
      seg: " In der Intro, in der du dich gerade befindest, klären wir die Spielregeln.",
      highlight: "Intro",
      stations: [
        { label: "Intro" },
        { label: "Modul 1" },
        { label: "Modul 2" },
        { label: "Modul 3" },
        { label: "Modul 4" },
        { label: "Outro" },
      ],
      detail: [{ label: "Die Spielregeln klären" }],
    },
    {
      type: "reveal-list",
      seg: " Lektion I.2 demystifiziert die vielen Namen, die dein Schmerz haben kann – Lumbalgie, Hexenschuss, Bandscheibe, ISG. Lektion I.3 ist ein Selbstcheck: Gehörst du eigentlich in diese Masterclass, oder gibt es Symptome, die zuerst ärztliche Abklärung brauchen?",
      kicker: "Noch in der Intro",
      title: "I.2 & I.3",
      items: [
        { label: "I.2 – Die vielen Namen deines Schmerzes" },
        { label: "I.3 – Selbstcheck: Bist du hier richtig?" },
      ],
    },
    {
      // Highlight wandert zu Modul 1 — alle Stationen bleiben sichtbar.
      // seg = beide bisherigen Modul-1-Segmente zusammenhängend.
      type: "timeline",
      seg: " Modul 1 – Verstehen. Hier lernst du, was wirklich in deinem Rücken passiert. Anatomie und Funktion in einer Sprache, die du auch verstehst, wenn du Medizin nicht studiert hast. Was chronisch eigentlich heißt. Warum MRT-Befunde dich oft mehr verwirren als helfen. Und wie dein Schmerzsystem funktioniert – das ist der wichtigste Baustein der ganzen Masterclass.",
      highlight: "Modul 1",
      stations: [
        { label: "Intro" },
        { label: "Modul 1" },
        { label: "Modul 2" },
        { label: "Modul 3" },
        { label: "Modul 4" },
        { label: "Outro" },
      ],
      caption: "Verstehen",
      detail: [
        { label: "Anatomie & Funktion – verständlich" },
        { label: "Was „chronisch“ wirklich heißt" },
        { label: "Warum MRT-Befunde oft verwirren" },
        { label: "Wie dein Schmerzsystem funktioniert" },
      ],
    },
    {
      // Highlight wandert zu Modul 2.
      type: "timeline",
      seg: " Modul 2 – Kurativ handeln. Hier bekommst du konkrete Werkzeuge: Mobilisationsübungen, modernes Rumpftraining, Atemmechanik, Belastungsdosierung, Schmerz-Coping. Alles direkt anwendbar, alles begründet aus dem, was du in Modul 1 verstanden hast.",
      highlight: "Modul 2",
      stations: [
        { label: "Intro" },
        { label: "Modul 1" },
        { label: "Modul 2" },
        { label: "Modul 3" },
        { label: "Modul 4" },
        { label: "Outro" },
      ],
      caption: "Kurativ handeln",
      detail: [
        { label: "Mobilisationsübungen" },
        { label: "Modernes Rumpftraining" },
        { label: "Atemmechanik" },
        { label: "Belastungsdosierung" },
        { label: "Schmerz-Coping" },
      ],
    },
    {
      // Highlight wandert zu Modul 3.
      type: "timeline",
      seg: " Modul 3 – Prävention. Wie hältst du das, was du dir erarbeitet hast? Belastbarkeit statt Schonung. Haltungs-Mythen entzaubert. Schlaf, Stress, Ernährung als stille Schmerzmodulatoren.",
      highlight: "Modul 3",
      stations: [
        { label: "Intro" },
        { label: "Modul 1" },
        { label: "Modul 2" },
        { label: "Modul 3" },
        { label: "Modul 4" },
        { label: "Outro" },
      ],
      caption: "Prävention",
      detail: [
        { label: "Belastbarkeit statt Schonung" },
        { label: "Haltungs-Mythen entzaubert" },
        { label: "Schlaf, Stress, Ernährung" },
      ],
    },
    {
      // Highlight wandert zu Modul 4.
      type: "timeline",
      seg: " Modul 4 – Recoping. Ehrlich gesagt mein Lieblingsteil. Hier zeige ich dir, wie du die Übungen in deinen Alltag einwebst – nicht als lästige Aufgabe, sondern als kleine Rituale. Plus ein Krisen-Protokoll für die Tage, an denen es trotzdem wieder schlechter wird.",
      highlight: "Modul 4",
      stations: [
        { label: "Intro" },
        { label: "Modul 1" },
        { label: "Modul 2" },
        { label: "Modul 3" },
        { label: "Modul 4" },
        { label: "Outro" },
      ],
      caption: "Recoping",
      detail: [
        { label: "Übungen in den Alltag einweben" },
        { label: "Kleine Rituale statt lästige Aufgaben" },
        { label: "Krisen-Protokoll für schlechte Tage" },
      ],
    },
    {
      type: "content",
      seg: " In der Outro sortieren wir gemeinsam, was du jetzt in der Hand hast – und wie du damit weitergehst.",
      kicker: "Outro",
      headline: "Wir sortieren, was du in der Hand hast – und wie du weitergehst.",
    },
    {
      type: "stats",
      seg: " Insgesamt rund 27 Lektionen, im Schnitt zwanzig Minuten. Du kannst eine Lektion in einer Mittagspause durchhören.",
      stats: [
        { value: "27", label: "Lektionen" },
        { value: "⌀ 20", label: "Minuten" },
        { value: "Dein", label: "Tempo" },
      ],
    },
    {
      type: "statement",
      seg: " Du musst nicht alles auf einmal verstehen. Im Gegenteil – ich empfehle dir, Lektionen wirken zu lassen, bevor du zur nächsten gehst.",
      text: "Lass jede Lektion wirken, bevor du zur nächsten gehst.",
    },
  ],
};

// ── Abschnitt 5 – Was du jetzt tun solltest ─────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Was du jetzt tun solltest",
  narration:
    "Bevor du in Lektion I.2 weitergehst, drei kleine Dinge. Erstens: Das Workbook. Diese Masterclass kommt mit einem Begleit-PDF, das du dir ausdrucken oder digital ausfüllen kannst. Im Workbook findest du Selbstchecks, Übungsanleitungen und – am Ende – deine persönliche Ritual-Map, dein individuelles Programm. Hol dir das Workbook jetzt, bevor du weitermachst. Zweitens: Stift oder Tastatur. Du wirst in mehreren Lektionen aufgefordert, kurz zu pausieren und etwas einzutragen. Das ist kein optionales Beiwerk. Lernen funktioniert besser, wenn du nicht nur passiv zuhörst, sondern aktiv etwas tust. Drittens: Ruhe. Such dir einen Ort, an dem du nicht ständig unterbrochen wirst. Zwanzig Minuten ungestört. Diese Masterclass ist kein Hintergrundprogramm beim Geschirrspülen – jedenfalls nicht beim ersten Durchgang. Dann sind wir bereit.",
  slides: [
    {
      type: "content",
      seg: "Bevor du in Lektion I.2 weitergehst, drei kleine Dinge.",
      kicker: "Bevor es weitergeht",
      headline: "Drei kleine Dinge.",
    },
    {
      type: "content",
      seg: " Erstens: Das Workbook. Diese Masterclass kommt mit einem Begleit-PDF, das du dir ausdrucken oder digital ausfüllen kannst.",
      kicker: "Erstens",
      headline: "Das Workbook.",
      lead: "Ein Begleit-PDF zum Ausdrucken oder digitalen Ausfüllen.",
    },
    {
      type: "reveal-list",
      seg: " Im Workbook findest du Selbstchecks, Übungsanleitungen und – am Ende – deine persönliche Ritual-Map, dein individuelles Programm. Hol dir das Workbook jetzt, bevor du weitermachst.",
      title: "Im Workbook",
      items: [
        { label: "Selbstchecks" },
        { label: "Übungsanleitungen" },
        { label: "Deine persönliche Ritual-Map" },
      ],
    },
    {
      type: "content",
      seg: " Zweitens: Stift oder Tastatur. Du wirst in mehreren Lektionen aufgefordert, kurz zu pausieren und etwas einzutragen. Das ist kein optionales Beiwerk.",
      kicker: "Zweitens",
      headline: "Stift oder Tastatur.",
      lead: "Du wirst öfter kurz pausieren und etwas eintragen.",
    },
    {
      type: "statement",
      seg: " Lernen funktioniert besser, wenn du nicht nur passiv zuhörst, sondern aktiv etwas tust.",
      text: "Lernen funktioniert besser, wenn du aktiv etwas tust.",
    },
    {
      type: "content",
      seg: " Drittens: Ruhe. Such dir einen Ort, an dem du nicht ständig unterbrochen wirst. Zwanzig Minuten ungestört.",
      kicker: "Drittens",
      headline: "Ruhe.",
      lead: "Zwanzig Minuten ungestört, ohne ständige Unterbrechung.",
    },
    {
      type: "checklist",
      seg: " Diese Masterclass ist kein Hintergrundprogramm beim Geschirrspülen – jedenfalls nicht beim ersten Durchgang.",
      items: [
        { icon: "workbook", label: "Workbook bereit" },
        { icon: "pen", label: "Stift in der Hand" },
        { icon: "quiet", label: "Ruhiger Ort" },
      ],
    },
    {
      type: "word",
      seg: " Dann sind wir bereit.",
      word: "Bereit?",
    },
  ],
};

// ── Abschnitt 6 – Übergang ──────────────────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Übergang",
  narration:
    "In der nächsten Lektion klären wir die wichtigste Frage zuerst: Hexenschuss, Lumbalgie, Bandscheibe, ISG – warum gibt es so viele Namen für ein Phänomen, das im Kern fast immer dasselbe meint? Und warum ist das eine gute Nachricht für dich? Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "In der nächsten Lektion klären wir die wichtigste Frage zuerst: Hexenschuss, Lumbalgie, Bandscheibe, ISG –",
      kicker: "Als Nächstes · Lektion I.2",
      headline: "Warum so viele Namen für ein Phänomen?",
      lead: "Hexenschuss, Lumbalgie, Bandscheibe, ISG.",
    },
    {
      type: "outro",
      seg: " warum gibt es so viele Namen für ein Phänomen, das im Kern fast immer dasselbe meint? Und warum ist das eine gute Nachricht für dich?",
      nextLabel: "Lektion I.2",
      nextTitle: "Du bist nicht allein: Die vielen Namen deines Schmerzes",
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
  id: "I.1",
  title: "Willkommen & Versprechen",
  subtitle: "Verstehen · Handeln · Bleiben · Wiederkommen",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
  ],
};

/** Alt-Name (Rückwärtskompatibilität mit dem ursprünglichen i1-Build). */
export const i1Source = lessonSource;
