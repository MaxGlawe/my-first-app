/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 2.2
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/2.2.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 2.2`). Niemals lessons/2.2.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Zweite Lektion von Modul 2 (Kurativ handeln) und zugleich die ERSTE praktische
 * Übungslektion. Die längste der Masterclass (~25 Min): Drei-Schienen-Prinzip +
 * sieben Mobilisationsübungen, jede mit drei Intensitätsschienen. Aufbau identisch
 * zu 1.1–1.5 / 2.1:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Der MD-Meta-Block „## Übungskartendeck – vorläufige Liste für Modul 2" ist eine
 * Produktions-Notiz und wird WEDER vertont NOCH als Slides geführt. Nur die echten
 * Abschnitte mit `🎙 SCRIPT` (Abschnitte 1–10) sind hier verarbeitet.
 *
 * 3.-PERSON-REGEL: 2.2 enthält ausschließlich generische Guide-/Übungs-Anleitungs-
 * Ich-/Du-Form (der Sprecher leitet an, „mein Vorschlag", „ich zeige dir in Modul 4").
 * Keine Ersteller-/Praxis-/Credential-Aussagen über den Schöpfer → keine Umschreibung
 * auf „Max Glawe" nötig.
 *
 * HWG: Wortlaut der MD wird beibehalten. Übungen werden als Anleitung im angenehmen/
 *   schmerzarmen Bereich beschrieben („deutliche aber angenehme Dehnung", „im
 *   schmerzmodulierenden Bereich"), keine Heilversprechen. Aussagen bleiben
 *   prozesshaft („beruhigt", „mobilisiert", „kann beruhigen"), exakt wie in der MD.
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

// ── Abschnitt 1 – Eröffnung und das Drei-Schienen-Prinzip ────────────────────

const abschnitt1: SourceSection = {
  title: "Eröffnung & das Drei-Schienen-Prinzip",
  narration:
    "Willkommen auf der Matte. Diese Lektion ist die erste, in der du tatsächlich aktiv bist – nicht nur zuhörst. Wir machen heute sieben Mobilisationsübungen. Sanft, durchblutungsfördernd, schmerzmodulierend. Diese Übungen sind dein Werkzeugkasten für die schlechten Tage – und ein guter Einstieg in jeden Bewegungstag. Bevor wir die erste Übung machen, eine wichtige Vorarbeit: das Drei-Schienen-Prinzip, das in dieser Masterclass durch jede Übung läuft. Du wirst dieses Prinzip in Lektion 2.1 schon gehört haben – jetzt machen wir es konkret. Jede Übung in dieser Masterclass hat drei Versionen, die wir Schienen nennen: Reizarm. Die sanfteste Variante. Geringe Amplitude, geringe Belastung, oft mit Hilfsmitteln wie Kissen oder verkürzter Hebelarm. Diese Schiene wählst du an deinen schlechten Tagen – wenn der Schmerz höher ist, wenn du müde bist, wenn du nach einer Belastungsspitze gerade wieder runterkommst. Standard. Die mittlere Variante. Die ist das, was du an den meisten normalen Tagen machst. Volle Bewegungsamplitude, mittlere Intensität, normale Wiederholungszahlen. Belastend. Die anspruchsvollste Variante. Mehr Wiederholungen, mehr Tempo, längere Haltezeiten, manchmal mit Zusatzlast. Diese Schiene wählst du an deinen guten Tagen – wenn der Schmerz niedrig ist, wenn du Energie hast. Wichtig: Du wählst die Schiene bevor du anfängst – nicht währenddessen. Das ist ein bewusster Akt der Selbsteinschätzung. Frag dich: Wie geht es mir heute? Wie viel will und kann ich heute reinstecken? Die Antwort bestimmt die Schiene. Niemand schreibt sie dir vor – du entscheidest. Und noch wichtiger: An schlechten Tagen ist die reizarme Schiene nicht weniger Therapie als die belastende Schiene. Sie ist die richtige Therapie für diesen Tag. Dein Nervensystem bekommt genau die Sicherheits-Information, die es heute verarbeiten kann. Das ist Erfolg.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 2 – Kurativ handeln",
      lessonLabel: "Lektion 2.2 – Schmerzmodulierende Mobilisation",
    },
    {
      type: "statement",
      seg: "Willkommen auf der Matte. Diese Lektion ist die erste, in der du tatsächlich aktiv bist – nicht nur zuhörst.",
      text: "Die erste Lektion, in der du aktiv bist.",
      emphasis: "aktiv",
    },
    {
      type: "content",
      seg: " Wir machen heute sieben Mobilisationsübungen. Sanft, durchblutungsfördernd, schmerzmodulierend. Diese Übungen sind dein Werkzeugkasten für die schlechten Tage – und ein guter Einstieg in jeden Bewegungstag.",
      kicker: "Sieben Mobilisationen",
      headline: "Sanft, durchblutungsfördernd, schmerzmodulierend.",
      lead: "Dein Werkzeugkasten für die schlechten Tage – und ein guter Einstieg in jeden Bewegungstag.",
    },
    {
      type: "content",
      seg: " Bevor wir die erste Übung machen, eine wichtige Vorarbeit: das Drei-Schienen-Prinzip, das in dieser Masterclass durch jede Übung läuft. Du wirst dieses Prinzip in Lektion 2.1 schon gehört haben – jetzt machen wir es konkret.",
      kicker: "Eine Vorarbeit",
      headline: "Das Drei-Schienen-Prinzip läuft durch jede Übung.",
      lead: "Du kennst es aus Lektion 2.1 – jetzt machen wir es konkret.",
    },
    {
      type: "content",
      seg: " Jede Übung in dieser Masterclass hat drei Versionen, die wir Schienen nennen:",
      kicker: "Drei Schienen",
      headline: "Jede Übung hat drei Versionen.",
    },
    {
      type: "content",
      seg: " Reizarm. Die sanfteste Variante. Geringe Amplitude, geringe Belastung, oft mit Hilfsmitteln wie Kissen oder verkürzter Hebelarm. Diese Schiene wählst du an deinen schlechten Tagen – wenn der Schmerz höher ist, wenn du müde bist, wenn du nach einer Belastungsspitze gerade wieder runterkommst.",
      kicker: "Schiene 1 · Reizarm",
      headline: "Die sanfteste Variante – für die schlechten Tage.",
      lead: "Geringe Amplitude, geringe Belastung, oft mit Hilfsmitteln. Wenn der Schmerz höher ist oder du müde bist.",
    },
    {
      type: "content",
      seg: " Standard. Die mittlere Variante. Die ist das, was du an den meisten normalen Tagen machst. Volle Bewegungsamplitude, mittlere Intensität, normale Wiederholungszahlen.",
      kicker: "Schiene 2 · Standard",
      headline: "Die mittlere Variante – für die meisten normalen Tage.",
      lead: "Volle Bewegungsamplitude, mittlere Intensität, normale Wiederholungszahlen.",
    },
    {
      type: "content",
      seg: " Belastend. Die anspruchsvollste Variante. Mehr Wiederholungen, mehr Tempo, längere Haltezeiten, manchmal mit Zusatzlast. Diese Schiene wählst du an deinen guten Tagen – wenn der Schmerz niedrig ist, wenn du Energie hast.",
      kicker: "Schiene 3 · Belastend",
      headline: "Die anspruchsvollste Variante – für die guten Tage.",
      lead: "Mehr Wiederholungen, mehr Tempo, längere Haltezeiten. Wenn der Schmerz niedrig ist und du Energie hast.",
    },
    {
      type: "reveal-list",
      seg: " Wichtig: Du wählst die Schiene bevor du anfängst – nicht währenddessen. Das ist ein bewusster Akt der Selbsteinschätzung. Frag dich: Wie geht es mir heute? Wie viel will und kann ich heute reinstecken? Die Antwort bestimmt die Schiene. Niemand schreibt sie dir vor – du entscheidest.",
      kicker: "Das Drei-Schienen-Prinzip",
      title: "Eine Übung, drei Schienen – du wählst vorher",
      items: [
        { label: "Reizarm – sanft, für schlechte Tage" },
        { label: "Standard – mittel, für normale Tage" },
        { label: "Belastend – anspruchsvoll, für gute Tage" },
      ],
    },
    {
      type: "statement",
      seg: " Und noch wichtiger: An schlechten Tagen ist die reizarme Schiene nicht weniger Therapie als die belastende Schiene. Sie ist die richtige Therapie für diesen Tag. Dein Nervensystem bekommt genau die Sicherheits-Information, die es heute verarbeiten kann. Das ist Erfolg.",
      text: "Die richtige Schiene heute ist Erfolg. Punkt.",
      emphasis: "Erfolg",
    },
  ],
};

// ── Abschnitt 2 – Übung 1: Cat-Cow (Katze-Kuh) ───────────────────────────────

const abschnitt2: SourceSection = {
  title: "Übung 1 – Cat-Cow (Katze-Kuh)",
  narration:
    "Erste Übung: Cat-Cow – auf Deutsch Katze-Kuh. Übungskarte ÜK-M1. Geh in den Vierfüßlerstand: Knie unter den Hüften, Hände unter den Schultern, Wirbelsäule in einer neutralen Position. Wenn der Vierfüßlerstand für deine Knie unangenehm ist, leg dir ein zusätzliches Polster unter. Die Bewegung selbst ist eine sanfte Wellenbewegung der Wirbelsäule. Bei der Kuh-Phase atmest du ein und lässt den Bauch sinken – die Wirbelsäule wölbt sich nach unten, der Brustkorb öffnet sich, der Blick geht leicht nach oben. Bei der Katzen-Phase atmest du aus und machst einen Buckel – die Wirbelsäule wölbt sich nach oben, der Kopf sinkt, der Bauchnabel zieht zur Wirbelsäule. Mach das langsam. Stell dir vor, du gießt Honig zwischen den Wirbeln aus. Keine schnelle Bewegung. Keine Maximalpositionen. Die Bewegung soll geschmeidig sein, nicht gepresst. Reizarme Schiene: Sehr kleine Amplitude. Du machst nur winzige Wölbungen, fast nur Atembewegung. Drei bis fünf Wiederholungen. Standard: Volle, geschmeidige Amplitude. Acht bis zwölf Wiederholungen. Belastend: Volle Amplitude plus längere Haltezeit in den Endpositionen – jeweils zwei bis drei Sekunden halten. Fünfzehn bis zwanzig Wiederholungen. Achte beim Üben darauf: Keine ruckartigen Bewegungen. Keine maximale Wirbelsäulenstreckung in der Kuh-Phase – das überreizt die Facettengelenke. Keine maximale Rundung in der Katzen-Phase mit dem Hintern – die Bewegung kommt aus der ganzen Wirbelsäule, nicht nur aus dem unteren Rücken. Wann sinnvoll? Cat-Cow ist eine fantastische Anfangsübung. Sie mobilisiert alle Wirbelsäulen-Segmente, verbindet Bewegung mit Atmung, beruhigt das vegetative Nervensystem. Du kannst sie morgens machen, du kannst sie nach langem Sitzen machen, du kannst sie als erste Übung in jeder Trainingsabfolge nutzen.",
  slides: [
    {
      type: "term",
      seg: "Erste Übung: Cat-Cow – auf Deutsch Katze-Kuh. Übungskarte ÜK-M1.",
      kicker: "Übung 1 · ÜK-M1",
      term: "Cat-Cow",
    },
    {
      type: "content",
      seg: " Geh in den Vierfüßlerstand: Knie unter den Hüften, Hände unter den Schultern, Wirbelsäule in einer neutralen Position. Wenn der Vierfüßlerstand für deine Knie unangenehm ist, leg dir ein zusätzliches Polster unter.",
      kicker: "Ausgangsposition",
      headline: "Vierfüßlerstand: Knie unter den Hüften, Hände unter den Schultern.",
      lead: "Wirbelsäule neutral. Bei empfindlichen Knien ein zusätzliches Polster unterlegen.",
    },
    {
      type: "content",
      seg: " Die Bewegung selbst ist eine sanfte Wellenbewegung der Wirbelsäule. Bei der Kuh-Phase atmest du ein und lässt den Bauch sinken – die Wirbelsäule wölbt sich nach unten, der Brustkorb öffnet sich, der Blick geht leicht nach oben.",
      kicker: "Phase 1 · Kuh",
      headline: "Einatmen, Bauch sinken lassen, Brustkorb öffnen.",
      lead: "Die Wirbelsäule wölbt sich nach unten, der Blick geht leicht nach oben.",
    },
    {
      type: "content",
      seg: " Bei der Katzen-Phase atmest du aus und machst einen Buckel – die Wirbelsäule wölbt sich nach oben, der Kopf sinkt, der Bauchnabel zieht zur Wirbelsäule.",
      kicker: "Phase 2 · Katze",
      headline: "Ausatmen, Buckel machen, Bauchnabel zur Wirbelsäule.",
      lead: "Die Wirbelsäule wölbt sich nach oben, der Kopf sinkt.",
    },
    {
      type: "quote",
      seg: " Mach das langsam. Stell dir vor, du gießt Honig zwischen den Wirbeln aus. Keine schnelle Bewegung. Keine Maximalpositionen. Die Bewegung soll geschmeidig sein, nicht gepresst.",
      text: "Stell dir vor, du gießt Honig zwischen den Wirbeln aus.",
      caption: "Langsam, geschmeidig, nicht gepresst – keine Maximalpositionen.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Sehr kleine Amplitude. Du machst nur winzige Wölbungen, fast nur Atembewegung. Drei bis fünf Wiederholungen. Standard: Volle, geschmeidige Amplitude. Acht bis zwölf Wiederholungen. Belastend: Volle Amplitude plus längere Haltezeit in den Endpositionen – jeweils zwei bis drei Sekunden halten. Fünfzehn bis zwanzig Wiederholungen.",
      kicker: "ÜK-M1 · Drei Schienen",
      title: "Cat-Cow nach Tagesform",
      items: [
        { label: "Reizarm – winzige Wölbungen, fast nur Atmung · 3–5x" },
        { label: "Standard – volle, geschmeidige Amplitude · 8–12x" },
        { label: "Belastend – volle Amplitude, 2–3 s halten · 15–20x" },
      ],
    },
    {
      type: "content",
      seg: " Achte beim Üben darauf: Keine ruckartigen Bewegungen. Keine maximale Wirbelsäulenstreckung in der Kuh-Phase – das überreizt die Facettengelenke. Keine maximale Rundung in der Katzen-Phase mit dem Hintern – die Bewegung kommt aus der ganzen Wirbelsäule, nicht nur aus dem unteren Rücken.",
      dark: true,
      kicker: "Worauf du achtest",
      headline: "Keine ruckartigen Bewegungen, keine Maximalpositionen.",
      lead: "Die Bewegung kommt aus der ganzen Wirbelsäule – nicht nur aus dem unteren Rücken.",
    },
    {
      type: "content",
      seg: " Wann sinnvoll? Cat-Cow ist eine fantastische Anfangsübung. Sie mobilisiert alle Wirbelsäulen-Segmente, verbindet Bewegung mit Atmung, beruhigt das vegetative Nervensystem. Du kannst sie morgens machen, du kannst sie nach langem Sitzen machen, du kannst sie als erste Übung in jeder Trainingsabfolge nutzen.",
      kicker: "Wann sinnvoll",
      headline: "Eine fantastische Anfangsübung.",
      lead: "Mobilisiert alle Segmente, verbindet Bewegung mit Atmung, beruhigt das vegetative Nervensystem.",
    },
  ],
};

// ── Abschnitt 3 – Übung 2: Knee-to-Chest ─────────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Übung 2 – Knee-to-Chest",
  narration:
    "Zweite Übung: Knee-to-Chest – Knie zur Brust. Übungskarte ÜK-M2. Leg dich auf den Rücken. Beide Beine angestellt, Füße flach auf dem Boden. Wenn der Hinterkopf nicht entspannt auf dem Boden liegt, leg ein flaches Kissen darunter. Zieh ein Knie sanft zur Brust. Greif mit beiden Händen unterhalb des Knies oder am Oberschenkel – nicht direkt über das Knie, das belastet das Gelenk unnötig. Zieh nicht maximal – bleib in einer angenehmen Dehnung. Halte für drei bis fünf Atemzüge. Dann das Bein langsam zurück, das andere Bein dran. Reizarme Schiene: Nur ein Bein gleichzeitig, geringe Zugintensität, das andere Bein liegt locker auf dem Boden. Pro Seite drei bis fünf langsame Wiederholungen. Standard: Ein Bein gleichzeitig, deutliche aber angenehme Dehnung, das andere Bein angestellt mit Fuß am Boden. Pro Seite fünf bis acht Wiederholungen. Belastend: Beide Knie gleichzeitig zur Brust ziehen, dann langsam wieder absetzen. Acht bis zwölf Wiederholungen. Diese Doppelvariante belastet die LWS-Mobilität stärker und ist für die guten Tage gedacht. Was bewirkt diese Übung? Sie dehnt die untere Rückenmuskulatur, mobilisiert die LWS-Facettengelenke in Beugung und bringt sanften Druck auf die Bandscheiben in einer entlasteten Position. Sie ist eine klassische Beruhigungsübung – besonders gut nach langem Stehen oder einer harten Belastungsphase.",
  slides: [
    {
      type: "term",
      seg: "Zweite Übung: Knee-to-Chest – Knie zur Brust. Übungskarte ÜK-M2.",
      kicker: "Übung 2 · ÜK-M2",
      term: "Knee-to-Chest",
    },
    {
      type: "content",
      seg: " Leg dich auf den Rücken. Beide Beine angestellt, Füße flach auf dem Boden. Wenn der Hinterkopf nicht entspannt auf dem Boden liegt, leg ein flaches Kissen darunter.",
      kicker: "Ausgangsposition",
      headline: "Rückenlage, beide Beine angestellt, Füße flach am Boden.",
      lead: "Liegt der Hinterkopf nicht entspannt, ein flaches Kissen darunterlegen.",
    },
    {
      type: "content",
      seg: " Zieh ein Knie sanft zur Brust. Greif mit beiden Händen unterhalb des Knies oder am Oberschenkel – nicht direkt über das Knie, das belastet das Gelenk unnötig. Zieh nicht maximal – bleib in einer angenehmen Dehnung. Halte für drei bis fünf Atemzüge. Dann das Bein langsam zurück, das andere Bein dran.",
      kicker: "Die Bewegung",
      headline: "Ein Knie sanft zur Brust – unterhalb des Knies greifen.",
      lead: "Nicht maximal ziehen, in einer angenehmen Dehnung bleiben, drei bis fünf Atemzüge halten.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Nur ein Bein gleichzeitig, geringe Zugintensität, das andere Bein liegt locker auf dem Boden. Pro Seite drei bis fünf langsame Wiederholungen. Standard: Ein Bein gleichzeitig, deutliche aber angenehme Dehnung, das andere Bein angestellt mit Fuß am Boden. Pro Seite fünf bis acht Wiederholungen. Belastend: Beide Knie gleichzeitig zur Brust ziehen, dann langsam wieder absetzen. Acht bis zwölf Wiederholungen. Diese Doppelvariante belastet die LWS-Mobilität stärker und ist für die guten Tage gedacht.",
      kicker: "ÜK-M2 · Drei Schienen",
      title: "Knee-to-Chest nach Tagesform",
      items: [
        { label: "Reizarm – ein Bein, geringer Zug · 3–5x pro Seite" },
        { label: "Standard – ein Bein, deutliche Dehnung · 5–8x pro Seite" },
        { label: "Belastend – beide Knie gleichzeitig · 8–12x" },
      ],
    },
    {
      type: "content",
      seg: " Was bewirkt diese Übung? Sie dehnt die untere Rückenmuskulatur, mobilisiert die LWS-Facettengelenke in Beugung und bringt sanften Druck auf die Bandscheiben in einer entlasteten Position. Sie ist eine klassische Beruhigungsübung – besonders gut nach langem Stehen oder einer harten Belastungsphase.",
      kicker: "Was sie bewirkt",
      headline: "Eine klassische Beruhigungsübung.",
      lead: "Dehnt die untere Rückenmuskulatur, mobilisiert die Facettengelenke – gut nach langem Stehen oder harter Belastung.",
    },
  ],
};

// ── Abschnitt 4 – Übung 3: Pelvic Tilt ───────────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Übung 3 – Pelvic Tilt (Beckenkippen)",
  narration:
    "Dritte Übung: Pelvic Tilt – Beckenkippen im Liegen. Übungskarte ÜK-M3. Du bleibst auf dem Rücken. Beide Beine angestellt, Füße hüftbreit auf dem Boden. Die Arme liegen entspannt neben dem Körper. Spür einmal kurz, wo dein unterer Rücken den Boden berührt – es bleibt meist ein kleiner Spalt zwischen Lendenwirbelsäule und Matte. Das ist deine Neutralposition. Jetzt die Bewegung: Kipp dein Becken sanft nach hinten, sodass dein unterer Rücken vollständig den Boden berührt – der Spalt verschwindet. Halte kurz. Dann kipp dein Becken in die andere Richtung – der untere Rücken hebt sich leicht ab, ein kleines Hohlkreuz entsteht. Halte kurz. Und zurück in die neutrale Mitte. Die Bewegung ist klein. Sie sollte nicht im ganzen Körper sichtbar sein – es ist eine subtile Beckenkippung, kein Brücke-Aufbauen. Reizarme Schiene: Nur die Mitte-Hinten-Kippung. Drei bis fünf Mal sanft anspannen und wieder lösen. Standard: Volle Beckenkippung in beide Richtungen, acht bis zehn Wiederholungen. Belastend: Volle Beckenkippung plus zusätzlich kurzes Halten in jeder Endposition für drei Sekunden. Zwölf bis fünfzehn Wiederholungen. Optional: mit der Hand auf dem Bauch das Anspannen des unteren Bauchmuskels mitfühlen. Wozu ist die Übung gut? Sie ist Mobilisation und Aktivierung gleichzeitig. Du mobilisierst die LWS in Flexion und Extension, du aktivierst gleichzeitig den Transversus abdominis und Multifidus – die zwei wichtigsten tiefen Stabilisatoren, die wir in Lektion 2.3 noch ausführlicher trainieren werden.",
  slides: [
    {
      type: "term",
      seg: "Dritte Übung: Pelvic Tilt – Beckenkippen im Liegen. Übungskarte ÜK-M3.",
      kicker: "Übung 3 · ÜK-M3",
      term: "Pelvic Tilt",
    },
    {
      type: "content",
      seg: " Du bleibst auf dem Rücken. Beide Beine angestellt, Füße hüftbreit auf dem Boden. Die Arme liegen entspannt neben dem Körper. Spür einmal kurz, wo dein unterer Rücken den Boden berührt – es bleibt meist ein kleiner Spalt zwischen Lendenwirbelsäule und Matte. Das ist deine Neutralposition.",
      kicker: "Ausgangsposition",
      headline: "Rückenlage, Füße hüftbreit. Finde deine Neutralposition.",
      lead: "Ein kleiner Spalt bleibt zwischen Lendenwirbelsäule und Matte – das ist neutral.",
    },
    {
      type: "content",
      seg: " Jetzt die Bewegung: Kipp dein Becken sanft nach hinten, sodass dein unterer Rücken vollständig den Boden berührt – der Spalt verschwindet. Halte kurz. Dann kipp dein Becken in die andere Richtung – der untere Rücken hebt sich leicht ab, ein kleines Hohlkreuz entsteht. Halte kurz. Und zurück in die neutrale Mitte.",
      kicker: "Die Bewegung",
      headline: "Becken nach hinten kippen, dann nach vorne – und zurück in die Mitte.",
      lead: "Hinten: der Spalt verschwindet. Vorne: ein kleines Hohlkreuz entsteht. Jeweils kurz halten.",
    },
    {
      type: "content",
      seg: " Die Bewegung ist klein. Sie sollte nicht im ganzen Körper sichtbar sein – es ist eine subtile Beckenkippung, kein Brücke-Aufbauen.",
      kicker: "Klein halten",
      headline: "Eine subtile Beckenkippung – kein Brücke-Aufbauen.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Nur die Mitte-Hinten-Kippung. Drei bis fünf Mal sanft anspannen und wieder lösen. Standard: Volle Beckenkippung in beide Richtungen, acht bis zehn Wiederholungen. Belastend: Volle Beckenkippung plus zusätzlich kurzes Halten in jeder Endposition für drei Sekunden. Zwölf bis fünfzehn Wiederholungen. Optional: mit der Hand auf dem Bauch das Anspannen des unteren Bauchmuskels mitfühlen.",
      kicker: "ÜK-M3 · Drei Schienen",
      title: "Pelvic Tilt nach Tagesform",
      items: [
        { label: "Reizarm – nur Mitte-Hinten-Kippung · 3–5x" },
        { label: "Standard – volle Kippung beidseitig · 8–10x" },
        { label: "Belastend – mit 3 s Halten je Endposition · 12–15x" },
      ],
    },
    {
      type: "content",
      seg: " Wozu ist die Übung gut? Sie ist Mobilisation und Aktivierung gleichzeitig. Du mobilisierst die LWS in Flexion und Extension, du aktivierst gleichzeitig den Transversus abdominis und Multifidus – die zwei wichtigsten tiefen Stabilisatoren, die wir in Lektion 2.3 noch ausführlicher trainieren werden.",
      kicker: "Was sie bewirkt",
      headline: "Mobilisation und Aktivierung gleichzeitig.",
      lead: "Du aktivierst Transversus abdominis und Multifidus – die tiefen Stabilisatoren aus Lektion 2.3.",
    },
  ],
};

// ── Abschnitt 5 – Übung 4: Becken-Kreisen im Vierfüßler ──────────────────────

const abschnitt5: SourceSection = {
  title: "Übung 4 – Becken-Kreisen im Vierfüßler",
  narration:
    "Vierte Übung: Becken-Kreisen im Vierfüßlerstand. Übungskarte ÜK-M4. Geh wieder in den Vierfüßlerstand wie bei Cat-Cow. Die Position bleibt stabil – Hände unter den Schultern, Knie unter den Hüften. Jetzt zeichne mit deinem Becken kleine Kreise in die Luft. Wirklich kleine Kreise, etwa handgroß. Du kannst dir vorstellen, du hast einen Stift im Steißbein und malst damit langsame Kreise auf eine imaginäre Wand hinter dir. Erst fünf Kreise in eine Richtung, dann fünf in die andere. Reizarme Schiene: Sehr kleine Kreise, drei bis fünf pro Richtung. Sehr langsam. Standard: Normale Amplitude, fünf bis acht Kreise pro Richtung. Belastend: Größere Amplitude, acht bis zwölf Kreise pro Richtung, plus Acht- oder Liegende-Acht-Bewegungen als Variation. Warum diese Übung? Sie ist eine kombinierte Mobilisation – die LWS bewegt sich gleichzeitig in mehreren Richtungen, was den Facettengelenken und der Faszie sehr gut tut. Variabilität, erinnerst du dich, ist eines unserer fünf Prinzipien. Diese Übung verkörpert es.",
  slides: [
    {
      type: "term",
      seg: "Vierte Übung: Becken-Kreisen im Vierfüßlerstand. Übungskarte ÜK-M4.",
      kicker: "Übung 4 · ÜK-M4",
      term: "Becken-Kreisen",
    },
    {
      type: "content",
      seg: " Geh wieder in den Vierfüßlerstand wie bei Cat-Cow. Die Position bleibt stabil – Hände unter den Schultern, Knie unter den Hüften.",
      kicker: "Ausgangsposition",
      headline: "Zurück in den Vierfüßlerstand wie bei Cat-Cow.",
      lead: "Die Position bleibt stabil – Hände unter den Schultern, Knie unter den Hüften.",
    },
    {
      type: "quote",
      seg: " Jetzt zeichne mit deinem Becken kleine Kreise in die Luft. Wirklich kleine Kreise, etwa handgroß. Du kannst dir vorstellen, du hast einen Stift im Steißbein und malst damit langsame Kreise auf eine imaginäre Wand hinter dir. Erst fünf Kreise in eine Richtung, dann fünf in die andere.",
      text: "Stell dir vor, du hast einen Stift im Steißbein und malst langsame Kreise.",
      caption: "Wirklich kleine, handgroße Kreise – erst in die eine Richtung, dann in die andere.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Sehr kleine Kreise, drei bis fünf pro Richtung. Sehr langsam. Standard: Normale Amplitude, fünf bis acht Kreise pro Richtung. Belastend: Größere Amplitude, acht bis zwölf Kreise pro Richtung, plus Acht- oder Liegende-Acht-Bewegungen als Variation.",
      kicker: "ÜK-M4 · Drei Schienen",
      title: "Becken-Kreisen nach Tagesform",
      items: [
        { label: "Reizarm – sehr kleine Kreise, sehr langsam · 3–5x je Richtung" },
        { label: "Standard – normale Amplitude · 5–8x je Richtung" },
        { label: "Belastend – größere Amplitude, plus Achten · 8–12x je Richtung" },
      ],
    },
    {
      type: "content",
      seg: " Warum diese Übung? Sie ist eine kombinierte Mobilisation – die LWS bewegt sich gleichzeitig in mehreren Richtungen, was den Facettengelenken und der Faszie sehr gut tut. Variabilität, erinnerst du dich, ist eines unserer fünf Prinzipien. Diese Übung verkörpert es.",
      kicker: "Was sie bewirkt",
      headline: "Eine kombinierte Mobilisation in mehreren Richtungen.",
      lead: "Sehr gut für Facettengelenke und Faszie. Variabilität – eines unserer fünf Prinzipien – verkörpert.",
    },
  ],
};

// ── Abschnitt 6 – Übung 5: Hüftbeuger-Mobilisation ───────────────────────────

const abschnitt6: SourceSection = {
  title: "Übung 5 – Hüftbeuger-Mobilisation",
  narration:
    "Fünfte Übung: Hüftbeuger-Mobilisation im halben Kniestand. Übungskarte ÜK-M5. Das ist eine der wichtigsten Mobilisationen für chronischen Kreuzschmerz, besonders wenn du viel sitzt. Der wichtigste Hüftbeuger – der Iliopsoas – verläuft direkt vorne an der Lendenwirbelsäule entlang. Wenn er verkürzt ist – und das ist er bei den meisten Schreibtisch-Menschen – zieht er die Lendenwirbelsäule in ein verstärktes Hohlkreuz und reizt die Strukturen dort. Position: Geh in den halben Kniestand. Ein Bein vor dir aufgestellt, der Fuß flach am Boden, das Knie etwa in einem 90-Grad-Winkel. Das andere Knie auf dem Boden hinter dir, der Spann des Fußes flach auf der Matte. Wenn das Knie am Boden weh tut, leg dir ein Polster darunter. Jetzt der Schlüsselmoment: Bevor du dehnst, kipp dein Becken aktiv nach hinten. Stell dir vor, du wirst von einem Faden am Schambein nach oben gezogen. Das Hohlkreuz verschwindet, die LWS wird flacher. Erst danach beginnst du, das hintere Hüftgelenk zu strecken, indem du das vordere Knie etwas weiter nach vorne schiebst. Du solltest die Dehnung vorne in der Hüfte und am Oberschenkel des hinteren Beins spüren – nicht im unteren Rücken. Wenn du sie im unteren Rücken spürst, dann ist das Becken nicht ausreichend gekippt. Korrigiere die Position. Reizarme Schiene: Halte 20 Sekunden pro Seite. Geringer Dehnungsgrad. Standard: Halte 30 Sekunden pro Seite, zwei Durchgänge. Deutliche aber angenehme Dehnung. Belastend: Halte 45 bis 60 Sekunden pro Seite, zwei Durchgänge. Optional zusätzlich: Den gleichseitigen Arm langsam nach oben strecken und leicht zur Gegenseite neigen – das öffnet die seitliche Kette zusätzlich. Häufiger Fehler: Becken nach vorne kippen, weil sich das intensiver anfühlt. Das ist aber genau das Gegenteil von dem, was wir wollen. Die Dehnung des Hüftbeugers funktioniert nur bei aufgerichtetem, nach hinten gekipptem Becken. Sonst dehnst du eigentlich nur deinen unteren Rücken – und das reizt ihn, statt zu helfen.",
  slides: [
    {
      type: "term",
      seg: "Fünfte Übung: Hüftbeuger-Mobilisation im halben Kniestand. Übungskarte ÜK-M5.",
      kicker: "Übung 5 · ÜK-M5",
      term: "Hüftbeuger-Mobilisation",
    },
    {
      type: "content",
      seg: " Das ist eine der wichtigsten Mobilisationen für chronischen Kreuzschmerz, besonders wenn du viel sitzt. Der wichtigste Hüftbeuger – der Iliopsoas – verläuft direkt vorne an der Lendenwirbelsäule entlang. Wenn er verkürzt ist – und das ist er bei den meisten Schreibtisch-Menschen – zieht er die Lendenwirbelsäule in ein verstärktes Hohlkreuz und reizt die Strukturen dort.",
      kicker: "Warum so wichtig",
      headline: "Der Iliopsoas verläuft direkt vorne an der Lendenwirbelsäule entlang.",
      lead: "Verkürzt – wie bei den meisten Schreibtisch-Menschen – zieht er die LWS ins Hohlkreuz und reizt die Strukturen.",
    },
    {
      type: "content",
      seg: " Position: Geh in den halben Kniestand. Ein Bein vor dir aufgestellt, der Fuß flach am Boden, das Knie etwa in einem 90-Grad-Winkel. Das andere Knie auf dem Boden hinter dir, der Spann des Fußes flach auf der Matte. Wenn das Knie am Boden weh tut, leg dir ein Polster darunter.",
      kicker: "Ausgangsposition",
      headline: "Halber Kniestand: vorderes Knie 90 Grad, hinteres Knie am Boden.",
      lead: "Vorderer Fuß flach am Boden, hinterer Fußspann auf der Matte. Bei Bedarf ein Polster unters Knie.",
    },
    {
      type: "statement",
      seg: " Jetzt der Schlüsselmoment: Bevor du dehnst, kipp dein Becken aktiv nach hinten. Stell dir vor, du wirst von einem Faden am Schambein nach oben gezogen. Das Hohlkreuz verschwindet, die LWS wird flacher. Erst danach beginnst du, das hintere Hüftgelenk zu strecken, indem du das vordere Knie etwas weiter nach vorne schiebst.",
      text: "Der Schlüsselmoment: erst das Becken nach hinten kippen, dann dehnen.",
      emphasis: "erst das Becken nach hinten kippen",
    },
    {
      type: "content",
      seg: " Du solltest die Dehnung vorne in der Hüfte und am Oberschenkel des hinteren Beins spüren – nicht im unteren Rücken. Wenn du sie im unteren Rücken spürst, dann ist das Becken nicht ausreichend gekippt. Korrigiere die Position.",
      kicker: "Wo du es spürst",
      headline: "Die Dehnung gehört nach vorne in die Hüfte – nicht in den unteren Rücken.",
      lead: "Spürst du sie im unteren Rücken, ist das Becken nicht genug gekippt. Korrigiere die Position.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Halte 20 Sekunden pro Seite. Geringer Dehnungsgrad. Standard: Halte 30 Sekunden pro Seite, zwei Durchgänge. Deutliche aber angenehme Dehnung. Belastend: Halte 45 bis 60 Sekunden pro Seite, zwei Durchgänge. Optional zusätzlich: Den gleichseitigen Arm langsam nach oben strecken und leicht zur Gegenseite neigen – das öffnet die seitliche Kette zusätzlich.",
      kicker: "ÜK-M5 · Drei Schienen",
      title: "Hüftbeuger-Mobilisation nach Tagesform",
      items: [
        { label: "Reizarm – 20 s pro Seite, geringer Dehnungsgrad" },
        { label: "Standard – 30 s pro Seite, zwei Durchgänge" },
        { label: "Belastend – 45–60 s pro Seite, plus seitliche Öffnung" },
      ],
    },
    {
      type: "content",
      seg: " Häufiger Fehler: Becken nach vorne kippen, weil sich das intensiver anfühlt. Das ist aber genau das Gegenteil von dem, was wir wollen. Die Dehnung des Hüftbeugers funktioniert nur bei aufgerichtetem, nach hinten gekipptem Becken. Sonst dehnst du eigentlich nur deinen unteren Rücken – und das reizt ihn, statt zu helfen.",
      dark: true,
      kicker: "Häufiger Fehler",
      headline: "Becken nach vorne kippen, weil es intensiver wirkt – genau falsch.",
      lead: "Nur bei aufgerichtetem, nach hinten gekipptem Becken dehnst du den Hüftbeuger statt den unteren Rücken.",
    },
  ],
};

// ── Abschnitt 7 – Übung 6: Thorakale Rotation ────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Übung 6 – Thorakale Rotation (Thread the Needle)",
  narration:
    "Sechste Übung: Thorakale Rotation im Vierfüßlerstand. Auch Thread the Needle genannt. Übungskarte ÜK-M6. Diese Übung adressiert ein Thema, das oft übersehen wird: die Brustwirbelsäule. Sie ist normalerweise die rotationsfreudigste Region deines Rückens. Wenn sie steif wird – und das passiert bei Schreibtischarbeitern sehr häufig – muss die LWS die Drehbewegungen kompensieren. Das ist ein klassischer Schmerz-Treiber, der direkt nichts mit dem unteren Rücken zu tun zu haben scheint. Position: Vierfüßlerstand. Hände unter den Schultern, Knie unter den Hüften. Hebe nun einen Arm und führe ihn langsam unter dem Körper hindurch zur anderen Seite – als würdest du einen Faden durch ein Nadelöhr fädeln. Der Oberkörper folgt der Bewegung nach, die Schulter senkt sich Richtung Boden, der Kopf geht mit. Halte kurz – atme – komm zurück. Dann der andere Arm wandert genauso geöffnet zur Decke, der Brustkorb öffnet sich zur Seite. Das ist die zweite Phase. Reizarme Schiene: Nur die untere Phase, nur einen Arm. Sehr kleine Amplitude, drei Wiederholungen pro Seite. Standard: Beide Phasen, fließende Bewegung, fünf bis acht Wiederholungen pro Seite. Belastend: Beide Phasen mit Haltepositionen von zwei bis drei Sekunden in beiden Endpunkten, zehn Wiederholungen pro Seite. Was tut diese Übung? Sie mobilisiert die Brustwirbelsäule in Rotation, gleichzeitig die Faszie der seitlichen Rumpfkette, plus sanft die Schulterblattregion. Drei Effekte für eine Übung. Sehr lohnenswert.",
  slides: [
    {
      type: "term",
      seg: "Sechste Übung: Thorakale Rotation im Vierfüßlerstand. Auch Thread the Needle genannt. Übungskarte ÜK-M6.",
      kicker: "Übung 6 · ÜK-M6",
      term: "Thorakale Rotation",
    },
    {
      type: "content",
      seg: " Diese Übung adressiert ein Thema, das oft übersehen wird: die Brustwirbelsäule. Sie ist normalerweise die rotationsfreudigste Region deines Rückens. Wenn sie steif wird – und das passiert bei Schreibtischarbeitern sehr häufig – muss die LWS die Drehbewegungen kompensieren. Das ist ein klassischer Schmerz-Treiber, der direkt nichts mit dem unteren Rücken zu tun zu haben scheint.",
      kicker: "Das übersehene Thema",
      headline: "Wird die Brustwirbelsäule steif, kompensiert die LWS die Drehbewegungen.",
      lead: "Ein klassischer Schmerz-Treiber, der direkt nichts mit dem unteren Rücken zu tun zu haben scheint.",
    },
    {
      type: "content",
      seg: " Position: Vierfüßlerstand. Hände unter den Schultern, Knie unter den Hüften. Hebe nun einen Arm und führe ihn langsam unter dem Körper hindurch zur anderen Seite – als würdest du einen Faden durch ein Nadelöhr fädeln. Der Oberkörper folgt der Bewegung nach, die Schulter senkt sich Richtung Boden, der Kopf geht mit. Halte kurz – atme – komm zurück.",
      kicker: "Phase 1 · Einfädeln",
      headline: "Einen Arm unter dem Körper hindurchführen – wie ein Faden durchs Nadelöhr.",
      lead: "Der Oberkörper folgt, die Schulter senkt sich Richtung Boden. Halte kurz, atme, komm zurück.",
    },
    {
      type: "content",
      seg: " Dann der andere Arm wandert genauso geöffnet zur Decke, der Brustkorb öffnet sich zur Seite. Das ist die zweite Phase.",
      kicker: "Phase 2 · Öffnen",
      headline: "Der Arm wandert geöffnet zur Decke, der Brustkorb öffnet sich zur Seite.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Nur die untere Phase, nur einen Arm. Sehr kleine Amplitude, drei Wiederholungen pro Seite. Standard: Beide Phasen, fließende Bewegung, fünf bis acht Wiederholungen pro Seite. Belastend: Beide Phasen mit Haltepositionen von zwei bis drei Sekunden in beiden Endpunkten, zehn Wiederholungen pro Seite.",
      kicker: "ÜK-M6 · Drei Schienen",
      title: "Thorakale Rotation nach Tagesform",
      items: [
        { label: "Reizarm – nur Einfädel-Phase, kleine Amplitude · 3x pro Seite" },
        { label: "Standard – beide Phasen, fließend · 5–8x pro Seite" },
        { label: "Belastend – beide Phasen mit 2–3 s Halten · 10x pro Seite" },
      ],
    },
    {
      type: "content",
      seg: " Was tut diese Übung? Sie mobilisiert die Brustwirbelsäule in Rotation, gleichzeitig die Faszie der seitlichen Rumpfkette, plus sanft die Schulterblattregion. Drei Effekte für eine Übung. Sehr lohnenswert.",
      kicker: "Was sie bewirkt",
      headline: "Drei Effekte für eine Übung.",
      lead: "Brustwirbelsäule in Rotation, Faszie der seitlichen Rumpfkette und sanft die Schulterblattregion.",
    },
  ],
};

// ── Abschnitt 8 – Übung 7: Massagerolle / Selbstmassage ──────────────────────

const abschnitt8: SourceSection = {
  title: "Übung 7 – Selbstmassage mit der Faszienrolle",
  narration:
    "Siebte Übung: Selbstmassage mit der Faszienrolle – manchmal auch Blackroll genannt. Übungskarte ÜK-M7. Diese Übung ist optional – sie braucht ein Hilfsmittel. Aber wenn du eine Faszienrolle hast oder dir eine besorgst, ist sie ein unterschätzt wertvolles Werkzeug. Wir rollen heute nicht direkt auf der Wirbelsäule. Wir rollen die Strukturen drumherum, die oft die eigentlichen Schmerzauslöser sind: die Gesäßmuskulatur, die Hüftbeuger, die seitliche Oberschenkelaußenfläche. Gesäßmuskulatur: Setz dich mit einer Pobacke auf die Rolle, das gleichseitige Bein winkelst du an und legst den Fuß auf das andere Knie – wie eine Vierer-Position. Roll langsam vor und zurück. Du suchst dir die druckintensivsten Stellen und verweilst dort 20 bis 30 Sekunden, atmest dabei ruhig weiter. Hüftbeuger und Oberschenkelvorderseite: Leg dich bauchwärts auf die Rolle, sodass sie unter deinen Oberschenkel-Vorderseiten liegt – nicht direkt auf der Leistengegend, das ist zu druckempfindlich. Stütz dich auf den Unterarmen ab und roll langsam, ein Bein nach dem anderen. Oberschenkel-Außenseite, die Iliotibialband-Region: Seitlage. Die Rolle unter der seitlichen Oberschenkelaußenseite. Stütz dich auf dem Unterarm ab. Roll von Hüfte bis Knie langsam mehrmals durch. Diese Region ist oft druckempfindlich – das ist normal. Reizarme Schiene: Sehr sanft, fast nur Auflegen ohne Roll-Bewegung. Pro Region 30 Sekunden. Standard: Normales Rollen pro Region 60 bis 90 Sekunden, an Druckpunkten verweilen. Belastend: Längere Roll-Dauer, intensiverer Druck, optional auf einer härteren Rolle oder einem Ball für Punktarbeit. Wichtig: Wir rollen nicht auf der Wirbelsäule selbst. Wir rollen auch nicht auf akut schmerzenden Stellen. Selbstmassage ist sanft, langsam, atmend. Wenn du den Atem anhältst und das Gesicht verziehst, ist es zu viel.",
  slides: [
    {
      type: "term",
      seg: "Siebte Übung: Selbstmassage mit der Faszienrolle – manchmal auch Blackroll genannt. Übungskarte ÜK-M7.",
      kicker: "Übung 7 · ÜK-M7",
      term: "Selbstmassage mit der Faszienrolle",
    },
    {
      type: "content",
      seg: " Diese Übung ist optional – sie braucht ein Hilfsmittel. Aber wenn du eine Faszienrolle hast oder dir eine besorgst, ist sie ein unterschätzt wertvolles Werkzeug. Wir rollen heute nicht direkt auf der Wirbelsäule. Wir rollen die Strukturen drumherum, die oft die eigentlichen Schmerzauslöser sind: die Gesäßmuskulatur, die Hüftbeuger, die seitliche Oberschenkelaußenfläche.",
      kicker: "Optional · braucht ein Hilfsmittel",
      headline: "Wir rollen die Strukturen drumherum – nicht die Wirbelsäule.",
      lead: "Gesäßmuskulatur, Hüftbeuger, seitliche Oberschenkelaußenfläche – oft die eigentlichen Schmerzauslöser.",
    },
    {
      type: "content",
      seg: " Gesäßmuskulatur: Setz dich mit einer Pobacke auf die Rolle, das gleichseitige Bein winkelst du an und legst den Fuß auf das andere Knie – wie eine Vierer-Position. Roll langsam vor und zurück. Du suchst dir die druckintensivsten Stellen und verweilst dort 20 bis 30 Sekunden, atmest dabei ruhig weiter.",
      kicker: "Region 1 · Gesäß",
      headline: "Eine Pobacke auf die Rolle, Fuß aufs andere Knie – Vierer-Position.",
      lead: "Langsam vor und zurück rollen, an druckintensiven Stellen 20 bis 30 Sekunden verweilen, ruhig atmen.",
    },
    {
      type: "content",
      seg: " Hüftbeuger und Oberschenkelvorderseite: Leg dich bauchwärts auf die Rolle, sodass sie unter deinen Oberschenkel-Vorderseiten liegt – nicht direkt auf der Leistengegend, das ist zu druckempfindlich. Stütz dich auf den Unterarmen ab und roll langsam, ein Bein nach dem anderen.",
      kicker: "Region 2 · Hüftbeuger / Vorderseite",
      headline: "Bauchwärts auf die Rolle, sie liegt unter den Oberschenkel-Vorderseiten.",
      lead: "Nicht auf der Leistengegend. Auf den Unterarmen abstützen, langsam rollen – ein Bein nach dem anderen.",
    },
    {
      type: "content",
      seg: " Oberschenkel-Außenseite, die Iliotibialband-Region: Seitlage. Die Rolle unter der seitlichen Oberschenkelaußenseite. Stütz dich auf dem Unterarm ab. Roll von Hüfte bis Knie langsam mehrmals durch. Diese Region ist oft druckempfindlich – das ist normal.",
      kicker: "Region 3 · Außenseite",
      headline: "Seitlage, Rolle unter der Oberschenkelaußenseite.",
      lead: "Von Hüfte bis Knie langsam mehrmals durchrollen. Druckempfindlich – das ist normal.",
    },
    {
      type: "reveal-list",
      seg: " Reizarme Schiene: Sehr sanft, fast nur Auflegen ohne Roll-Bewegung. Pro Region 30 Sekunden. Standard: Normales Rollen pro Region 60 bis 90 Sekunden, an Druckpunkten verweilen. Belastend: Längere Roll-Dauer, intensiverer Druck, optional auf einer härteren Rolle oder einem Ball für Punktarbeit.",
      kicker: "ÜK-M7 · Drei Schienen",
      title: "Selbstmassage nach Tagesform",
      items: [
        { label: "Reizarm – fast nur Auflegen · 30 s pro Region" },
        { label: "Standard – normales Rollen · 60–90 s pro Region" },
        { label: "Belastend – längere Dauer, intensiverer Druck, Punktarbeit" },
      ],
    },
    {
      type: "statement",
      seg: " Wichtig: Wir rollen nicht auf der Wirbelsäule selbst. Wir rollen auch nicht auf akut schmerzenden Stellen. Selbstmassage ist sanft, langsam, atmend. Wenn du den Atem anhältst und das Gesicht verziehst, ist es zu viel.",
      text: "Nicht auf der Wirbelsäule, nicht auf akut schmerzenden Stellen rollen.",
      emphasis: "nicht auf der Wirbelsäule",
    },
  ],
};

// ── Abschnitt 9 – Zusammenstellung und Frequenz ──────────────────────────────

const abschnitt9: SourceSection = {
  title: "Zusammenstellung & Frequenz",
  narration:
    "So. Sieben Übungen. Was machst du jetzt damit? Du musst nicht jeden Tag alle sieben machen. Im Gegenteil – das wäre eher kontraproduktiv. Mein Vorschlag für die nächsten drei bis sieben Tage: Wähle eine kleine Sequenz von drei bis vier Übungen aus, die dir intuitiv guttun. Mach sie täglich. Zehn bis fünfzehn Minuten reichen. Geh dabei nach Tagesform: an guten Tagen Standard-Schiene, an schlechten Tagen reizarm. An sehr guten Tagen kannst du auch die belastende Schiene testen. Mein konkreter Anfangsvorschlag, wenn du noch unsicher bist welche Übungen passen: Cat-Cow als Einstieg. Pelvic Tilt zum Aktivieren. Knee-to-Chest zum Beruhigen. Hüftbeuger-Mobilisation einmal pro Seite. Das ist eine zehn-bis-zwölf-Minuten-Sequenz, die du ohne weiteres Equipment machen kannst, in der eigenen Wohnung, jeden Tag. In Modul 4 werden wir genau diese Sequenz dann an deine Tagesrituale anknüpfen. Aber für die nächste Woche reicht es, sie überhaupt erst einmal zu machen – wann auch immer du Zeit findest. Erst die Routine, dann die Verfeinerung.",
  slides: [
    {
      type: "statement",
      seg: "So. Sieben Übungen. Was machst du jetzt damit?",
      text: "Sieben Übungen. Was machst du jetzt damit?",
      emphasis: "Sieben Übungen",
    },
    {
      type: "content",
      seg: " Du musst nicht jeden Tag alle sieben machen. Im Gegenteil – das wäre eher kontraproduktiv. Mein Vorschlag für die nächsten drei bis sieben Tage: Wähle eine kleine Sequenz von drei bis vier Übungen aus, die dir intuitiv guttun. Mach sie täglich. Zehn bis fünfzehn Minuten reichen. Geh dabei nach Tagesform: an guten Tagen Standard-Schiene, an schlechten Tagen reizarm. An sehr guten Tagen kannst du auch die belastende Schiene testen.",
      kicker: "Nicht alle, sondern eine kleine Sequenz",
      headline: "Wähle drei bis vier Übungen, die dir intuitiv guttun – täglich.",
      lead: "Zehn bis fünfzehn Minuten reichen. Nach Tagesform: gute Tage Standard, schlechte Tage reizarm.",
    },
    {
      type: "reveal-list",
      seg: " Mein konkreter Anfangsvorschlag, wenn du noch unsicher bist welche Übungen passen: Cat-Cow als Einstieg. Pelvic Tilt zum Aktivieren. Knee-to-Chest zum Beruhigen. Hüftbeuger-Mobilisation einmal pro Seite. Das ist eine zehn-bis-zwölf-Minuten-Sequenz, die du ohne weiteres Equipment machen kannst, in der eigenen Wohnung, jeden Tag.",
      kicker: "Anfangsvorschlag · 10–12 Min",
      title: "Eine Start-Sequenz ohne Equipment",
      items: [
        { label: "Cat-Cow – als Einstieg" },
        { label: "Pelvic Tilt – zum Aktivieren" },
        { label: "Knee-to-Chest – zum Beruhigen" },
        { label: "Hüftbeuger-Mobilisation – einmal pro Seite" },
      ],
    },
    {
      type: "content",
      seg: " In Modul 4 werden wir genau diese Sequenz dann an deine Tagesrituale anknüpfen. Aber für die nächste Woche reicht es, sie überhaupt erst einmal zu machen – wann auch immer du Zeit findest. Erst die Routine, dann die Verfeinerung.",
      kicker: "Erst die Routine",
      headline: "Erst die Routine, dann die Verfeinerung.",
      lead: "Für die nächste Woche reicht es, die Sequenz überhaupt erst einmal zu machen.",
    },
  ],
};

// ── Abschnitt 10 – Workbook und Übergang ─────────────────────────────────────

const abschnitt10: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 2.2: Mobilisations-Tagebuch. Du trägst dort über die nächsten drei Tage ein: Welche Übungen hast du gemacht? In welcher Schiene? Wie hast du dich vorher gefühlt, wie nachher? Diese kurze Beobachtung hilft dir, dein eigenes Muster zu erkennen – welche Übungen dir besonders helfen, welche neutral sind, welche nicht so gut funktionieren. Das wird die Basis für deine spätere Auswahl. In der nächsten Lektion – 2.3 – steigen wir ins Stabilisationstraining ein. Etwas anstrengender als die heutige Lektion, aber genauso wichtig. Du lernst, deine tiefen Stabilisatoren zu wecken und dosiert zu kräftigen. Das ist die Basis dafür, dass dein Rücken in Alltag und Belastung sicherer wird. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 2.2: Mobilisations-Tagebuch. Du trägst dort über die nächsten drei Tage ein: Welche Übungen hast du gemacht? In welcher Schiene? Wie hast du dich vorher gefühlt, wie nachher? Diese kurze Beobachtung hilft dir, dein eigenes Muster zu erkennen – welche Übungen dir besonders helfen, welche neutral sind, welche nicht so gut funktionieren. Das wird die Basis für deine spätere Auswahl.",
      kicker: "Workbook · Übung 2.2",
      headline: "Ein Workbook-Stopp: Mobilisations-Tagebuch über drei Tage.",
      lead: "Welche Übungen, welche Schiene, wie vorher und nachher? So erkennst du dein eigenes Muster.",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 2.3 – steigen wir ins Stabilisationstraining ein. Etwas anstrengender als die heutige Lektion, aber genauso wichtig. Du lernst, deine tiefen Stabilisatoren zu wecken und dosiert zu kräftigen. Das ist die Basis dafür, dass dein Rücken in Alltag und Belastung sicherer wird.",
      kicker: "Als Nächstes · Lektion 2.3",
      headline: "Stabilisationstraining – etwas anstrengender, aber genauso wichtig.",
      lead: "Du weckst deine tiefen Stabilisatoren und kräftigst sie dosiert – die Basis für mehr Sicherheit.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 2.3",
      nextTitle: "Modernes Rumpftraining Teil 1: Stabilisation",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "2.2",
  title: "Schmerzmodulierende Mobilisation",
  subtitle: "Modul 2 – Kurativ handeln · Sieben Mobilisationen & das Drei-Schienen-Prinzip",
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
  ],
};
