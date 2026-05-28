/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion I.2
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/I.2.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs I.2`). Niemals lessons/I.2.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Aufbau identisch zu I.1 (siehe sources/I.1.source.ts für die ausführliche
 * Erläuterung der Konvention):
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt). EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
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
    "Eine Frage, mit der ich oft anfange, wenn ich Menschen zum ersten Mal in der Praxis sehe: Wie nennst du das eigentlich, was du hast? Was hat dir dein Arzt gesagt? Und dann fallen ganz unterschiedliche Wörter. Der eine sagt: Ich hab Hexenschuss. Die nächste: Mein Bandscheibenvorfall macht mich fertig. Wieder eine andere: Ich hab ISG-Blockade. Der nächste: Mein Doc hat Lumbalgie geschrieben. Wieder andere: Es ist halt Verschleiß, da müssen Sie mit leben. Fünf Menschen, fünf Wörter. Und doch – in den meisten Fällen reden wir hier über dasselbe Phänomen. Nicht identisch, aber sehr verwandt. In dieser Lektion sortieren wir das. Damit du verstehst, was diese Wörter bedeuten, was sie nicht bedeuten – und warum das gleich eine ziemlich gute Nachricht für dich ist.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Chronischer Kreuzschmerz",
      lessonLabel: "Lektion I.2 – Die vielen Namen deines Schmerzes",
    },
    {
      type: "content",
      seg: "Eine Frage, mit der ich oft anfange, wenn ich Menschen zum ersten Mal in der Praxis sehe:",
      kicker: "Eine Frage zum Einstieg",
      headline: "Eine Frage, mit der es oft beginnt.",
    },
    {
      type: "statement",
      seg: " Wie nennst du das eigentlich, was du hast? Was hat dir dein Arzt gesagt?",
      text: "Wie nennst du das eigentlich, was du hast?",
    },
    {
      type: "content",
      seg: " Und dann fallen ganz unterschiedliche Wörter.",
      headline: "Und dann fallen ganz unterschiedliche Wörter.",
    },
    {
      type: "reveal-list",
      seg: " Der eine sagt: Ich hab Hexenschuss. Die nächste: Mein Bandscheibenvorfall macht mich fertig. Wieder eine andere: Ich hab ISG-Blockade. Der nächste: Mein Doc hat Lumbalgie geschrieben. Wieder andere: Es ist halt Verschleiß, da müssen Sie mit leben.",
      kicker: "Fünf Menschen",
      title: "Fünf Wörter",
      items: [
        { label: "„Ich hab Hexenschuss.“" },
        { label: "„Mein Bandscheibenvorfall macht mich fertig.“" },
        { label: "„Ich hab ISG-Blockade.“" },
        { label: "„Mein Doc hat Lumbalgie geschrieben.“" },
        { label: "„Es ist halt Verschleiß.“" },
      ],
    },
    {
      type: "statement",
      seg: " Fünf Menschen, fünf Wörter.",
      text: "Fünf Menschen, fünf Wörter.",
    },
    {
      type: "content",
      seg: " Und doch – in den meisten Fällen reden wir hier über dasselbe Phänomen. Nicht identisch, aber sehr verwandt.",
      headline: "Und doch reden wir meist über dasselbe Phänomen.",
      lead: "Nicht identisch, aber sehr verwandt.",
    },
    {
      type: "content",
      seg: " In dieser Lektion sortieren wir das. Damit du verstehst, was diese Wörter bedeuten, was sie nicht bedeuten – und warum das gleich eine ziemlich gute Nachricht für dich ist.",
      kicker: "Was wir heute tun",
      headline: "Wir sortieren das.",
      lead: "Was die Wörter bedeuten, was nicht – und warum das eine gute Nachricht ist.",
    },
  ],
};

// ── Abschnitt 2 – Die Namen sortieren ───────────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Die Namen sortieren",
  narration:
    "Schauen wir uns die wichtigsten Begriffe der Reihe nach an. Lumbalgie. Das ist ein medizinischer Sammelbegriff. Lumbal heißt: unterer Rücken, also Lendenwirbelsäule. Algie heißt: Schmerz. Lumbalgie heißt also wörtlich übersetzt: Schmerz im unteren Rücken. Mehr nicht. Es sagt nichts darüber aus, woher der Schmerz kommt – nur, dass er da ist und wo er sitzt. Ein Synonym dafür, das du oft hörst, ist Lumbago. Kreuzschmerz. Das ist im Grunde dasselbe wie Lumbalgie, nur auf Deutsch. Das Kreuz ist die Lendenregion. Kreuzschmerz und Lumbalgie meinen dasselbe Symptom: Schmerz im unteren Rücken. In den deutschen Leitlinien – der sogenannten Nationalen Versorgungsleitlinie, falls du das je gegoogelt hast – wird Kreuzschmerz sogar als offizieller Begriff bevorzugt. Hexenschuss. Das ist der volkstümliche Name für eine akute, plötzlich einschießende Kreuzschmerz-Episode. Du bist runtergegangen, um die Socke aufzuheben, und plötzlich – stockt es. Du kannst dich nicht mehr aufrichten. Das ist Hexenschuss. Medizinisch hieße das akute Lumbago. Wichtig zu wissen: Hexenschuss ist in den allermeisten Fällen ungefährlich, auch wenn er sich beängstigend anfühlt. Es ist meist ein muskulärer Reflexkrampf – kein Zeichen dafür, dass etwas zerstört wurde. Bandscheibenvorfall – oder Vorwölbung, Protrusion, Prolaps. Hier wird es spannend, denn das ist der Begriff, der bei vielen am meisten Angst macht. Worum geht es? Die Bandscheiben sind die Polster zwischen den Wirbeln. Wenn das innere Gel einer Bandscheibe sich verschiebt oder einen Riss in der äußeren Faserschicht hat, sprechen wir von Vorwölbung oder Vorfall – je nach Schweregrad. Aber – und das ist die Kernbotschaft hier – ein Bandscheibenvorfall im MRT bedeutet nicht automatisch, dass dieser Vorfall die Ursache deiner Schmerzen ist. Studien zeigen seit Jahren: Wenn man völlig schmerzfreie Menschen ins MRT schiebt, finden sich bei mehr als der Hälfte der über Vierzigjährigen Vorwölbungen oder Vorfälle. Ohne Schmerzen. Bandscheibenbefunde im MRT korrelieren oft sehr schlecht mit Schmerz. Wir kommen darauf in Lektion 1.4 ausführlich zurück. ISG-Blockade, manchmal auch Iliosakralgelenk-Beschwerden genannt. Das ISG ist das Gelenk zwischen Kreuzbein und Beckenschaufel – eine sehr feste, sehr unbewegliche Verbindung. Wenn dort Reizzustände entstehen, können sie Schmerzen ausstrahlen, oft seitlich am unteren Rücken oder ins Gesäß. Blockade ist dabei ein etwas irreführendes Wort – es ist meist keine echte mechanische Blockade, sondern ein Reizzustand. Aber der Begriff hat sich eingebürgert. Lumboischialgie oder Ischias. Das beschreibt einen Kreuzschmerz, der nach unten ausstrahlt – ins Gesäß, ins Bein, manchmal bis in den Fuß. Ursache ist meistens eine Reizung des Ischiasnervs, häufig nah an seiner Wurzel an der Wirbelsäule. Eine wichtige Unterscheidung: Ausstrahlung in den Oberschenkel ist oft fortgeleiteter Schmerz, nicht zwingend Nervenkompression. Echte Nervenwurzelreizung strahlt typischerweise unterhalb des Knies aus, oft mit Kribbeln oder Taubheit. Das ist klinisch relevant – und auch ein Punkt, den wir in der nächsten Lektion noch berühren. Verschleiß, Abnutzung, Degeneration. Das sind keine Diagnosen im engeren Sinn, sondern beschreibende Worte für altersbedingte Veränderungen, die im MRT sichtbar sind. Wirbel werden mit den Jahren etwas anders, Bandscheiben verlieren Wasser, Facettengelenke zeigen Spuren des Lebens. Das Wichtige: Diese Veränderungen sind normal. Sie sind kein Defekt. Eine fünfzigjährige Wirbelsäule sieht anders aus als eine zwanzigjährige – genauso, wie ein fünfzigjähriges Gesicht anders aussieht als ein zwanzigjähriges. Und genau, wie wir keine Schmerzen davon haben, dass unser Gesicht altert, müssen wir auch keine Schmerzen davon haben, dass unsere Wirbelsäule altert.",
  slides: [
    {
      type: "content",
      seg: "Schauen wir uns die wichtigsten Begriffe der Reihe nach an.",
      kicker: "Die Namen sortieren",
      headline: "Schauen wir uns die Begriffe der Reihe nach an.",
    },
    {
      type: "term",
      seg: " Lumbalgie. Das ist ein medizinischer Sammelbegriff.",
      kicker: "Begriff 1",
      term: "Lumbalgie",
    },
    {
      type: "reveal-list",
      seg: " Lumbal heißt: unterer Rücken, also Lendenwirbelsäule. Algie heißt: Schmerz. Lumbalgie heißt also wörtlich übersetzt: Schmerz im unteren Rücken. Mehr nicht.",
      kicker: "Wörtlich übersetzt",
      title: "Lumbal + Algie",
      items: [
        { label: "Lumbal = unterer Rücken" },
        { label: "Algie = Schmerz" },
        { label: "→ Schmerz im unteren Rücken. Mehr nicht." },
      ],
    },
    {
      type: "content",
      seg: " Es sagt nichts darüber aus, woher der Schmerz kommt – nur, dass er da ist und wo er sitzt. Ein Synonym dafür, das du oft hörst, ist Lumbago.",
      headline: "Es sagt nichts darüber aus, woher der Schmerz kommt.",
      lead: "Nur, dass er da ist und wo er sitzt. Synonym: Lumbago.",
    },
    {
      type: "term",
      seg: " Kreuzschmerz. Das ist im Grunde dasselbe wie Lumbalgie, nur auf Deutsch.",
      kicker: "Begriff 2",
      term: "Kreuzschmerz",
    },
    {
      type: "content",
      seg: " Das Kreuz ist die Lendenregion. Kreuzschmerz und Lumbalgie meinen dasselbe Symptom: Schmerz im unteren Rücken.",
      headline: "Kreuzschmerz und Lumbalgie meinen dasselbe Symptom.",
      lead: "Das Kreuz ist die Lendenregion.",
    },
    {
      type: "content",
      seg: " In den deutschen Leitlinien – der sogenannten Nationalen Versorgungsleitlinie, falls du das je gegoogelt hast – wird Kreuzschmerz sogar als offizieller Begriff bevorzugt.",
      kicker: "Nationale Versorgungsleitlinie",
      headline: "Die Leitlinien bevorzugen sogar „Kreuzschmerz“.",
    },
    {
      type: "term",
      seg: " Hexenschuss. Das ist der volkstümliche Name für eine akute, plötzlich einschießende Kreuzschmerz-Episode.",
      kicker: "Begriff 3",
      term: "Hexenschuss",
    },
    {
      type: "content",
      seg: " Du bist runtergegangen, um die Socke aufzuheben, und plötzlich – stockt es. Du kannst dich nicht mehr aufrichten. Das ist Hexenschuss. Medizinisch hieße das akute Lumbago.",
      headline: "Du bückst dich nach der Socke – und plötzlich stockt es.",
      lead: "Medizinisch: akute Lumbago.",
    },
    {
      type: "statement",
      seg: " Wichtig zu wissen: Hexenschuss ist in den allermeisten Fällen ungefährlich, auch wenn er sich beängstigend anfühlt.",
      text: "Hexenschuss ist fast immer ungefährlich – auch wenn er sich nicht so anfühlt.",
    },
    {
      type: "content",
      seg: " Es ist meist ein muskulärer Reflexkrampf – kein Zeichen dafür, dass etwas zerstört wurde.",
      headline: "Meist ein muskulärer Reflexkrampf.",
      lead: "Kein Zeichen dafür, dass etwas zerstört wurde.",
    },
    {
      type: "term",
      seg: " Bandscheibenvorfall – oder Vorwölbung, Protrusion, Prolaps. Hier wird es spannend, denn das ist der Begriff, der bei vielen am meisten Angst macht.",
      kicker: "Begriff 4 · macht oft am meisten Angst",
      term: "Bandscheibenvorfall",
    },
    {
      type: "content",
      seg: " Worum geht es? Die Bandscheiben sind die Polster zwischen den Wirbeln. Wenn das innere Gel einer Bandscheibe sich verschiebt oder einen Riss in der äußeren Faserschicht hat, sprechen wir von Vorwölbung oder Vorfall – je nach Schweregrad.",
      kicker: "Worum geht es?",
      headline: "Die Bandscheiben sind die Polster zwischen den Wirbeln.",
      lead: "Verschiebt sich das innere Gel: Vorwölbung oder Vorfall – je nach Schweregrad.",
    },
    {
      type: "statement",
      seg: " Aber – und das ist die Kernbotschaft hier – ein Bandscheibenvorfall im MRT bedeutet nicht automatisch, dass dieser Vorfall die Ursache deiner Schmerzen ist.",
      text: "Bandscheibenbefund im MRT ≠ Ursache deines Schmerzes.",
    },
    {
      type: "content",
      seg: " Studien zeigen seit Jahren: Wenn man völlig schmerzfreie Menschen ins MRT schiebt, finden sich bei mehr als der Hälfte der über Vierzigjährigen Vorwölbungen oder Vorfälle. Ohne Schmerzen.",
      dark: true,
      kicker: "Was Studien zeigen",
      headline: "Über die Hälfte der über Vierzigjährigen hat Befunde – ohne Schmerzen.",
    },
    {
      type: "content",
      seg: " Bandscheibenbefunde im MRT korrelieren oft sehr schlecht mit Schmerz. Wir kommen darauf in Lektion 1.4 ausführlich zurück.",
      headline: "MRT-Befunde korrelieren oft schlecht mit Schmerz.",
      lead: "Darauf kommen wir in Lektion 1.4 ausführlich zurück.",
    },
    {
      type: "term",
      seg: " ISG-Blockade, manchmal auch Iliosakralgelenk-Beschwerden genannt.",
      kicker: "Begriff 5",
      term: "ISG-Blockade",
    },
    {
      type: "content",
      seg: " Das ISG ist das Gelenk zwischen Kreuzbein und Beckenschaufel – eine sehr feste, sehr unbewegliche Verbindung. Wenn dort Reizzustände entstehen, können sie Schmerzen ausstrahlen, oft seitlich am unteren Rücken oder ins Gesäß.",
      headline: "Das Gelenk zwischen Kreuzbein und Beckenschaufel.",
      lead: "Reizzustände strahlen oft seitlich am unteren Rücken oder ins Gesäß aus.",
    },
    {
      type: "content",
      seg: " Blockade ist dabei ein etwas irreführendes Wort – es ist meist keine echte mechanische Blockade, sondern ein Reizzustand. Aber der Begriff hat sich eingebürgert.",
      headline: "„Blockade“ ist irreführend.",
      lead: "Meist keine echte mechanische Blockade, sondern ein Reizzustand.",
    },
    {
      type: "term",
      seg: " Lumboischialgie oder Ischias. Das beschreibt einen Kreuzschmerz, der nach unten ausstrahlt – ins Gesäß, ins Bein, manchmal bis in den Fuß.",
      kicker: "Begriff 6",
      term: "Ischias",
    },
    {
      type: "content",
      seg: " Ursache ist meistens eine Reizung des Ischiasnervs, häufig nah an seiner Wurzel an der Wirbelsäule. Eine wichtige Unterscheidung: Ausstrahlung in den Oberschenkel ist oft fortgeleiteter Schmerz, nicht zwingend Nervenkompression.",
      headline: "Meist eine Reizung des Ischiasnervs nah an der Wurzel.",
      lead: "Ausstrahlung in den Oberschenkel ist oft fortgeleiteter Schmerz – nicht zwingend Nervenkompression.",
    },
    {
      type: "statement",
      seg: " Echte Nervenwurzelreizung strahlt typischerweise unterhalb des Knies aus, oft mit Kribbeln oder Taubheit. Das ist klinisch relevant – und auch ein Punkt, den wir in der nächsten Lektion noch berühren.",
      text: "Unterhalb des Knies, mit Kribbeln oder Taubheit – das ist klinisch relevant.",
      emphasis: "unterhalb",
    },
    {
      type: "term",
      seg: " Verschleiß, Abnutzung, Degeneration. Das sind keine Diagnosen im engeren Sinn, sondern beschreibende Worte für altersbedingte Veränderungen, die im MRT sichtbar sind.",
      kicker: "Begriff 7",
      term: "Verschleiß",
    },
    {
      type: "content",
      seg: " Wirbel werden mit den Jahren etwas anders, Bandscheiben verlieren Wasser, Facettengelenke zeigen Spuren des Lebens.",
      headline: "Wirbel verändern sich, Bandscheiben verlieren Wasser.",
      lead: "Facettengelenke zeigen Spuren des Lebens.",
    },
    {
      type: "statement",
      seg: " Das Wichtige: Diese Veränderungen sind normal. Sie sind kein Defekt.",
      text: "Diese Veränderungen sind normal. Kein Defekt.",
      emphasis: "normal",
    },
    {
      type: "content",
      seg: " Eine fünfzigjährige Wirbelsäule sieht anders aus als eine zwanzigjährige – genauso, wie ein fünfzigjähriges Gesicht anders aussieht als ein zwanzigjähriges.",
      headline: "Eine 50-jährige Wirbelsäule sieht anders aus als eine 20-jährige.",
      lead: "Genauso wie ein 50-jähriges Gesicht anders aussieht als ein 20-jähriges.",
    },
    {
      type: "quote",
      seg: " Und genau, wie wir keine Schmerzen davon haben, dass unser Gesicht altert, müssen wir auch keine Schmerzen davon haben, dass unsere Wirbelsäule altert.",
      text: "Altern ist normal. Kein Defekt.",
      caption: "So wenig wie ein alterndes Gesicht weh tut.",
    },
  ],
};

// ── Abschnitt 3 – Die gute Nachricht ─────────────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Die gute Nachricht",
  narration:
    "Und jetzt kommt die gute Nachricht. Wenn du dir diese Liste anschaust – Lumbalgie, Hexenschuss, Bandscheibe, ISG, Ischias, Verschleiß – dann steckt dahinter ein klinisches Geheimnis, das in der breiten Öffentlichkeit kaum bekannt ist: In etwa 80 bis 85 Prozent aller Fälle von chronischem Rückenschmerz lässt sich gar keine eindeutige strukturelle Ursache benennen. Das klingt erst einmal frustrierend, wenn du es zum ersten Mal hörst. Was, niemand weiß genau, was bei mir los ist? Aber wenn du eine Sekunde drüber nachdenkst, ist es das Gegenteil von schlechter Nachricht. Wenn der Schmerz nicht eindeutig an einer kaputten Struktur hängt, dann musst du auch keine kaputte Struktur reparieren. Dann ist die Lösung nicht zwangsläufig eine OP, eine Spritze, ein Wundermittel. Dann ist die Lösung viel eher: das gesamte System verstehen, dosiert belasten, bewegen, beruhigen, integrieren. Genau das, was diese Masterclass dir Schritt für Schritt zeigt. Internationale Leitlinien – die deutschen, die britischen, die australischen – sagen seit Jahren dasselbe: Bei unspezifischem chronischem Kreuzschmerz ist Bewegungstherapie kombiniert mit Edukation und Verhaltensänderung das, was nachweislich am besten wirkt. Nicht passive Behandlungen, nicht Bettruhe, nicht Spritzen-Marathons. Aktivität, Verstehen, neue Routinen. Genau das machen wir hier.",
  slides: [
    {
      type: "word",
      seg: "Und jetzt kommt die gute Nachricht.",
      word: "Die gute Nachricht.",
    },
    {
      type: "content",
      seg: " Wenn du dir diese Liste anschaust – Lumbalgie, Hexenschuss, Bandscheibe, ISG, Ischias, Verschleiß – dann steckt dahinter ein klinisches Geheimnis, das in der breiten Öffentlichkeit kaum bekannt ist:",
      kicker: "Ein klinisches Geheimnis",
      headline: "Hinter all diesen Wörtern steckt etwas, das kaum jemand kennt.",
    },
    {
      type: "stats",
      seg: " In etwa 80 bis 85 Prozent aller Fälle von chronischem Rückenschmerz lässt sich gar keine eindeutige strukturelle Ursache benennen.",
      stats: [
        { value: "80–85%", label: "ohne klare strukturelle Ursache" },
        { value: "= ", label: "unspezifischer Kreuzschmerz" },
        { value: "Gute", label: "Nachricht" },
      ],
    },
    {
      type: "content",
      seg: " Das klingt erst einmal frustrierend, wenn du es zum ersten Mal hörst. Was, niemand weiß genau, was bei mir los ist?",
      headline: "Das klingt erst einmal frustrierend.",
      lead: "„Was, niemand weiß genau, was bei mir los ist?“",
    },
    {
      type: "statement",
      seg: " Aber wenn du eine Sekunde drüber nachdenkst, ist es das Gegenteil von schlechter Nachricht.",
      text: "Es ist das Gegenteil von schlechter Nachricht.",
    },
    {
      type: "content",
      seg: " Wenn der Schmerz nicht eindeutig an einer kaputten Struktur hängt, dann musst du auch keine kaputte Struktur reparieren. Dann ist die Lösung nicht zwangsläufig eine OP, eine Spritze, ein Wundermittel.",
      headline: "Keine kaputte Struktur, die repariert werden muss.",
      lead: "Dann ist die Lösung nicht zwangsläufig OP, Spritze oder Wundermittel.",
    },
    {
      type: "reveal-list",
      seg: " Dann ist die Lösung viel eher: das gesamte System verstehen, dosiert belasten, bewegen, beruhigen, integrieren. Genau das, was diese Masterclass dir Schritt für Schritt zeigt.",
      kicker: "Dann ist die Lösung",
      title: "Das gesamte System",
      items: [
        { label: "verstehen" },
        { label: "dosiert belasten" },
        { label: "bewegen" },
        { label: "beruhigen" },
        { label: "integrieren" },
      ],
    },
    {
      type: "content",
      seg: " Internationale Leitlinien – die deutschen, die britischen, die australischen – sagen seit Jahren dasselbe: Bei unspezifischem chronischem Kreuzschmerz ist Bewegungstherapie kombiniert mit Edukation und Verhaltensänderung das, was nachweislich am besten wirkt.",
      kicker: "Internationaler Leitlinien-Konsens",
      headline: "Bewegung + Edukation + Verhaltensänderung wirkt nachweislich am besten.",
    },
    {
      type: "anti-list",
      seg: " Nicht passive Behandlungen, nicht Bettruhe, nicht Spritzen-Marathons.",
      title: "Nachweislich NICHT die Lösung",
      items: [
        { label: "Passive Behandlungen" },
        { label: "Bettruhe" },
        { label: "Spritzen-Marathons" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Aktivität, Verstehen, neue Routinen.",
      kicker: "Was wirkt",
      title: "Aktivität · Verstehen · Routinen",
      items: [
        { label: "Aktivität" },
        { label: "Verstehen" },
        { label: "Neue Routinen" },
      ],
    },
    {
      type: "statement",
      seg: " Genau das machen wir hier.",
      text: "Genau das machen wir hier.",
    },
  ],
};

// ── Abschnitt 4 – Du bist nicht allein ───────────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Du bist nicht allein",
  narration:
    "Eine weitere gute Nachricht, die dir vielleicht hilft, falls du dich gerade allein fühlst mit dieser Geschichte. Rund 85 Prozent aller Erwachsenen in Deutschland erleben mindestens einmal in ihrem Leben Rückenschmerzen. Mindestens. Viele erleben sie wiederholt. Eine signifikante Minderheit erlebt sie chronisch – also länger als drei Monate am Stück oder immer wiederkehrend. Das heißt: Wenn du gerade chronischen Kreuzschmerz hast, gehörst du zu einer sehr großen Gruppe von Menschen. Du bist nicht ungewöhnlich. Du bist kein medizinischer Sonderfall. Du teilst diese Erfahrung mit Millionen anderer Menschen allein in diesem Land. Warum ist das wichtig? Weil chronischer Schmerz oft mit einem Gefühl von Isolation kommt. Du gehst auf eine Party, du verziehst beim Hinsetzen das Gesicht, jemand fragt nach, und du erzählst es ein paarmal, aber dann merkst du: die Leute haben das nicht, sie verstehen das nicht so richtig, du redest immer weniger drüber. Mit der Zeit fühlst du dich abgekapselt von Menschen, die das einfach nicht haben. Aber statistisch gesehen sitzt in jedem Wartezimmer, in jedem Bus, in jeder Familie irgendwer, der genau dasselbe kennt. Du bist nur die einzige Person in deinem direkten Umfeld, mit der du gerade darüber sprichst. Das ist ein Unterschied.",
  slides: [
    {
      type: "content",
      seg: "Eine weitere gute Nachricht, die dir vielleicht hilft, falls du dich gerade allein fühlst mit dieser Geschichte.",
      kicker: "Falls du dich allein fühlst",
      headline: "Noch eine gute Nachricht.",
    },
    {
      type: "stats",
      seg: " Rund 85 Prozent aller Erwachsenen in Deutschland erleben mindestens einmal in ihrem Leben Rückenschmerzen. Mindestens.",
      stats: [
        { value: "85%", label: "der Erwachsenen kennen Rückenschmerz" },
        { value: "mind.", label: "einmal im Leben" },
        { value: "Du", label: "bist nicht allein" },
      ],
    },
    {
      type: "content",
      seg: " Viele erleben sie wiederholt. Eine signifikante Minderheit erlebt sie chronisch – also länger als drei Monate am Stück oder immer wiederkehrend.",
      headline: "Viele wiederholt – eine Minderheit chronisch.",
      lead: "Chronisch: länger als drei Monate am Stück oder immer wiederkehrend.",
    },
    {
      type: "reveal-list",
      seg: " Das heißt: Wenn du gerade chronischen Kreuzschmerz hast, gehörst du zu einer sehr großen Gruppe von Menschen. Du bist nicht ungewöhnlich. Du bist kein medizinischer Sonderfall.",
      kicker: "Das heißt für dich",
      title: "Du gehörst zu einer großen Gruppe",
      items: [
        { label: "Du bist nicht ungewöhnlich" },
        { label: "Du bist kein medizinischer Sonderfall" },
      ],
    },
    {
      type: "statement",
      seg: " Du teilst diese Erfahrung mit Millionen anderer Menschen allein in diesem Land.",
      text: "Du teilst diese Erfahrung mit Millionen – allein in diesem Land.",
    },
    {
      type: "content",
      seg: " Warum ist das wichtig? Weil chronischer Schmerz oft mit einem Gefühl von Isolation kommt.",
      kicker: "Warum das wichtig ist",
      headline: "Chronischer Schmerz kommt oft mit einem Gefühl von Isolation.",
    },
    {
      type: "content",
      seg: " Du gehst auf eine Party, du verziehst beim Hinsetzen das Gesicht, jemand fragt nach, und du erzählst es ein paarmal, aber dann merkst du: die Leute haben das nicht, sie verstehen das nicht so richtig, du redest immer weniger drüber.",
      dark: true,
      headline: "Du erzählst es ein paarmal – dann redest du immer weniger drüber.",
    },
    {
      type: "content",
      seg: " Mit der Zeit fühlst du dich abgekapselt von Menschen, die das einfach nicht haben.",
      dark: true,
      headline: "Mit der Zeit fühlst du dich abgekapselt.",
    },
    {
      type: "content",
      seg: " Aber statistisch gesehen sitzt in jedem Wartezimmer, in jedem Bus, in jeder Familie irgendwer, der genau dasselbe kennt.",
      headline: "In jedem Wartezimmer, Bus, jeder Familie kennt jemand genau dasselbe.",
    },
    {
      type: "statement",
      seg: " Du bist nur die einzige Person in deinem direkten Umfeld, mit der du gerade darüber sprichst. Das ist ein Unterschied.",
      text: "Du bist nur die Einzige, mit der du gerade darüber sprichst.",
    },
  ],
};

// ── Abschnitt 5 – Warum die Vielfalt ein Problem ist ─────────────────────────

const abschnitt5: SourceSection = {
  title: "Warum die Vielfalt ein Problem ist",
  narration:
    "Eine letzte Beobachtung in dieser Lektion, bevor wir weitergehen. Die Vielfalt der Begriffe – Lumbalgie, Hexenschuss, Bandscheibe, ISG, und so weiter – hat einen Nebeneffekt, der oft unterschätzt wird: Sie suggeriert, dass es viele verschiedene Probleme gibt. Und das wiederum suggeriert, dass es viele verschiedene Spezialbehandlungen braucht. Du kennst das vielleicht: Du gehst zum Orthopäden, der sagt Bandscheibe. Du gehst zum Heilpraktiker, der sagt ISG-Blockade. Du gehst zur Massage, die sagt Verspannungen. Du gehst zum Osteopathen, der sagt Beckenschiefstand. Vier verschiedene Erklärungen für möglicherweise dasselbe Problem. Das ist nicht zwingend Inkompetenz. Das ist die Folge eines Systems, das sehr stark in Strukturmodellen denkt – also in der Idee, dass es eine kaputte Struktur geben muss, wenn Schmerz vorhanden ist. Diese Idee hat sich in den letzten zwanzig Jahren in der Schmerzforschung deutlich gewandelt. Aber in der täglichen Praxis ist sie zäh, und sie wird oft an Patienten weitergegeben. Du wirst in dieser Masterclass ein anderes Modell kennenlernen. Ein Modell, das anerkennt, dass Strukturen eine Rolle spielen, aber auch, dass dein Nervensystem, dein Bewegungsverhalten, dein Stresslevel, dein Schlaf, deine Erwartungen und dein Verständnis vom eigenen Körper mindestens genauso wichtig sind. Manchmal wichtiger. Das ist kein esoterischer Quatsch. Das ist der aktuelle Stand der Schmerzwissenschaft. Und es ist – wieder einmal – eine gute Nachricht. Denn auf viele dieser Faktoren hast du Einfluss. Auf eine Bandscheibe hast du keinen direkten Einfluss. Auf dein Verhalten, deine Belastung, dein Verständnis – sehr wohl.",
  slides: [
    {
      type: "content",
      seg: "Eine letzte Beobachtung in dieser Lektion, bevor wir weitergehen.",
      kicker: "Eine letzte Beobachtung",
      headline: "Bevor wir weitergehen – ein letzter Gedanke.",
    },
    {
      type: "content",
      seg: " Die Vielfalt der Begriffe – Lumbalgie, Hexenschuss, Bandscheibe, ISG, und so weiter – hat einen Nebeneffekt, der oft unterschätzt wird: Sie suggeriert, dass es viele verschiedene Probleme gibt. Und das wiederum suggeriert, dass es viele verschiedene Spezialbehandlungen braucht.",
      headline: "Viele Wörter suggerieren viele verschiedene Probleme.",
      lead: "Und damit: viele verschiedene Spezialbehandlungen.",
    },
    {
      type: "reveal-list",
      seg: " Du kennst das vielleicht: Du gehst zum Orthopäden, der sagt Bandscheibe. Du gehst zum Heilpraktiker, der sagt ISG-Blockade. Du gehst zur Massage, die sagt Verspannungen. Du gehst zum Osteopathen, der sagt Beckenschiefstand.",
      kicker: "Vier Türen, vier Antworten",
      title: "Derselbe Patient",
      items: [
        { label: "Orthopäde: „Bandscheibe.“" },
        { label: "Heilpraktiker: „ISG-Blockade.“" },
        { label: "Massage: „Verspannungen.“" },
        { label: "Osteopath: „Beckenschiefstand.“" },
      ],
    },
    {
      type: "statement",
      seg: " Vier verschiedene Erklärungen für möglicherweise dasselbe Problem.",
      text: "Vier Erklärungen für möglicherweise dasselbe Problem.",
    },
    {
      type: "content",
      seg: " Das ist nicht zwingend Inkompetenz. Das ist die Folge eines Systems, das sehr stark in Strukturmodellen denkt – also in der Idee, dass es eine kaputte Struktur geben muss, wenn Schmerz vorhanden ist.",
      kicker: "Das Strukturmodell",
      headline: "Nicht Inkompetenz – ein System, das in Strukturmodellen denkt.",
      lead: "Die Idee: Wenn Schmerz da ist, muss es eine kaputte Struktur geben.",
    },
    {
      type: "content",
      seg: " Diese Idee hat sich in den letzten zwanzig Jahren in der Schmerzforschung deutlich gewandelt. Aber in der täglichen Praxis ist sie zäh, und sie wird oft an Patienten weitergegeben.",
      headline: "Die Schmerzforschung hat sich gewandelt.",
      lead: "Aber in der täglichen Praxis ist die alte Idee zäh.",
    },
    {
      type: "content",
      seg: " Du wirst in dieser Masterclass ein anderes Modell kennenlernen. Ein Modell, das anerkennt, dass Strukturen eine Rolle spielen, aber auch, dass dein Nervensystem, dein Bewegungsverhalten, dein Stresslevel, dein Schlaf, deine Erwartungen und dein Verständnis vom eigenen Körper mindestens genauso wichtig sind. Manchmal wichtiger.",
      kicker: "Das erweiterte Modell",
      headline: "Du wirst ein anderes Modell kennenlernen.",
      lead: "Strukturen zählen – aber Nervensystem, Verhalten, Stress, Schlaf und Verstehen mindestens genauso. Manchmal mehr.",
    },
    {
      type: "reveal-list",
      seg: " Das ist kein esoterischer Quatsch. Das ist der aktuelle Stand der Schmerzwissenschaft. Und es ist – wieder einmal – eine gute Nachricht. Denn auf viele dieser Faktoren hast du Einfluss.",
      kicker: "Worauf du Einfluss hast",
      title: "Mehr als nur Struktur",
      items: [
        { label: "Nervensystem" },
        { label: "Bewegungsverhalten" },
        { label: "Stress" },
        { label: "Schlaf" },
        { label: "Verstehen" },
      ],
    },
    {
      type: "statement",
      seg: " Auf eine Bandscheibe hast du keinen direkten Einfluss. Auf dein Verhalten, deine Belastung, dein Verständnis – sehr wohl.",
      text: "Auf die Bandscheibe hast du keinen Einfluss. Auf dein Verhalten – sehr wohl.",
      emphasis: "Verhalten",
    },
  ],
};

// ── Abschnitt 6 – Übergang ──────────────────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Übergang",
  narration:
    "In der nächsten Lektion machen wir einen wichtigen Selbstcheck. Bei aller Beruhigung, die ich dir jetzt gegeben habe: Es gibt eine kleine, aber wichtige Gruppe von Symptomen, bei denen du nicht hier richtig bist, sondern beim Arzt. Diese filtern wir heraus. Die Lektion ist kurz, aber wichtig. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "In der nächsten Lektion machen wir einen wichtigen Selbstcheck. Bei aller Beruhigung, die ich dir jetzt gegeben habe: Es gibt eine kleine, aber wichtige Gruppe von Symptomen, bei denen du nicht hier richtig bist, sondern beim Arzt.",
      kicker: "Als Nächstes · Lektion I.3",
      headline: "Eine kleine Gruppe von Symptomen gehört zuerst zum Arzt.",
      lead: "Bei aller Beruhigung: Die filtern wir im nächsten Schritt heraus.",
    },
    {
      type: "outro",
      seg: " Diese filtern wir heraus. Die Lektion ist kurz, aber wichtig.",
      nextLabel: "Lektion I.3",
      nextTitle: "Der Red-Flag-Selbstcheck",
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
  id: "I.2",
  title: "Die vielen Namen deines Schmerzes",
  subtitle: "Du bist nicht allein · Namen demystifiziert",
  sections: [
    abschnitt1,
    abschnitt2,
    abschnitt3,
    abschnitt4,
    abschnitt5,
    abschnitt6,
  ],
};
