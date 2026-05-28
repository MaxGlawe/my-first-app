/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 2.7
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/2.7.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 2.7`). Niemals lessons/2.7.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Siebte und letzte Lektion von Modul 2 (Kurativ handeln). Schmerz-Coping als
 * eigenständiger, evidenzbasierter Therapie-Baustein: Fear-Avoidance-Modell,
 * Graded Exposure, kognitive Defusion, drei Defusions-Techniken, Einordnung,
 * Workbook + Modul-2-Abschluss. Keine klassischen Übungen — eine Konzept-/
 * Strategie-Lektion. Aufbau identisch zu 2.6:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt; Aufzählungspunkte zu Fließtext verdichtet). EXAKT der
 *     Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–7) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke, die Meta-Tabelle und der „=== MODUL 3 ==="-Trenner
 * der MD werden NICHT vertont.
 *
 * 3.-PERSON-REGEL (geprüft): 2.7 enthält KEINE Ersteller-/Praxis-Ich-Stelle. Der
 * gesamte Text ist generische Guide-/Du-Form („Du lernst…", „Wir durchbrechen…")
 * und bleibt unverändert. Kein Reframe auf „Max Glawe" nötig.
 *
 * HWG: 2.7 ist psychologisches Selbsthilfe-Coping (Graded Exposure, kognitive
 *   Defusion / ACT). Der MD-Wortlaut wird beibehalten — als Strategie/Orientierung
 *   formuliert, KEIN Psychotherapie- oder Heilversprechen. Die ausdrückliche
 *   Abgrenzung der MD bleibt erhalten: die Werkzeuge sind „keine Wundermittel",
 *   ersetzen „nicht: spezielle psychologische Behandlung" bei Depression,
 *   Angststörung oder PTBS — dafür ist spezialisierte Psychotherapie sinnvoll.
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
    "Willkommen zur letzten Lektion von Modul 2. Wir haben Bewegung gelernt, wir haben Atmung gelernt, wir haben Pacing gelernt. Aber es gibt noch eine Kategorie von Werkzeugen, die genauso wichtig ist und in Schmerztherapie oft zu wenig Raum bekommt: mentale Werkzeuge. Mentale Werkzeuge sind keine soft-Ergänzung zu den körperlichen Übungen. Sie sind ein eigenständiger, evidenzbasierter Therapie-Baustein. Forschende sprechen hier von Acceptance and Commitment Therapy, Cognitive Functional Therapy, Pain Management Cognitive Skills. Studien zeigen seit Jahren: Patienten, die mentale Strategien beherrschen, kommen mit chronischem Schmerz deutlich besser zurecht als Patienten, die das nicht haben. In dieser Lektion lernst du zwei Hauptwerkzeuge. Graded Exposure: das schrittweise Wieder-Annähern an Bewegungen, vor denen du Angst hast. Und kognitive Defusion: das Abstand-Nehmen von Schmerz-Gedanken, ohne sie unterdrücken zu müssen.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 2 – Kurativ handeln",
      lessonLabel: "Lektion 2.7 – Schmerz-Coping in der Praxis",
    },
    {
      type: "content",
      seg: "Willkommen zur letzten Lektion von Modul 2. Wir haben Bewegung gelernt, wir haben Atmung gelernt, wir haben Pacing gelernt. Aber es gibt noch eine Kategorie von Werkzeugen, die genauso wichtig ist und in Schmerztherapie oft zu wenig Raum bekommt: mentale Werkzeuge.",
      kicker: "Die letzte Lektion von Modul 2",
      headline: "Eine Kategorie von Werkzeugen, die oft zu wenig Raum bekommt: mentale Werkzeuge.",
      lead: "Bewegung, Atmung, Pacing hast du gelernt. Jetzt kommt die mentale Ebene.",
    },
    {
      type: "content",
      seg: " Mentale Werkzeuge sind keine soft-Ergänzung zu den körperlichen Übungen. Sie sind ein eigenständiger, evidenzbasierter Therapie-Baustein. Forschende sprechen hier von Acceptance and Commitment Therapy, Cognitive Functional Therapy, Pain Management Cognitive Skills. Studien zeigen seit Jahren: Patienten, die mentale Strategien beherrschen, kommen mit chronischem Schmerz deutlich besser zurecht als Patienten, die das nicht haben.",
      kicker: "Kein Soft-Faktor",
      headline: "Ein eigenständiger, evidenzbasierter Therapie-Baustein.",
      lead: "Acceptance and Commitment Therapy, Cognitive Functional Therapy, Pain Management Cognitive Skills – wer mentale Strategien beherrscht, kommt deutlich besser zurecht.",
    },
    {
      type: "reveal-list",
      seg: " In dieser Lektion lernst du zwei Hauptwerkzeuge. Graded Exposure: das schrittweise Wieder-Annähern an Bewegungen, vor denen du Angst hast. Und kognitive Defusion: das Abstand-Nehmen von Schmerz-Gedanken, ohne sie unterdrücken zu müssen.",
      kicker: "Zwei Hauptwerkzeuge",
      title: "Was du in dieser Lektion lernst",
      items: [
        { label: "Graded Exposure – schrittweises Wieder-Annähern an gefürchtete Bewegungen" },
        { label: "Kognitive Defusion – Abstand nehmen von Schmerz-Gedanken, ohne sie zu unterdrücken" },
      ],
    },
  ],
};

// ── Abschnitt 2 – Das Fear-Avoidance-Modell ──────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Das Fear-Avoidance-Modell",
  narration:
    "Bevor wir die Werkzeuge anschauen, kurz das Konzept, auf dem sie aufbauen. Bei chronischem Schmerz entwickelt sich oft ein Muster, das Forschende Fear-Avoidance Model nennen – auf Deutsch Angst-Vermeidungs-Modell. Es funktioniert so: Du erlebst Schmerz. Dein Hirn macht eine Bewertung: Diese Bewegung ist gefährlich. Du entwickelst Angst vor der Bewegung. Du vermeidest die Bewegung. Damit fehlt deinem Nervensystem eine Korrektur-Erfahrung – es bleibt bei der Bewertung gefährlich. Beim nächsten Mal, wenn du der Bewegung doch nicht ausweichen kannst, ist der Schmerz größer und die Angst auch. Mit der Zeit schrumpft dein Bewegungs-Repertoire. Du machst weniger, du machst seltener neue Sachen, du planst um deine Schmerz-Angst herum. Manche Menschen werden über Monate oder Jahre so eingeschränkt, dass sie kaum noch das machen, was sie eigentlich tun wollen. Das ist nicht Schwäche. Das ist ein verständlicher Schutzmechanismus, der bei chronischem Schmerz aber gegen dich arbeitet. Genau diese Schleife durchbrechen wir mit Graded Exposure.",
  slides: [
    {
      type: "content",
      seg: "Bevor wir die Werkzeuge anschauen, kurz das Konzept, auf dem sie aufbauen.",
      kicker: "Das Konzept dahinter",
      headline: "Kurz das Konzept, auf dem die Werkzeuge aufbauen.",
    },
    {
      type: "term",
      seg: " Bei chronischem Schmerz entwickelt sich oft ein Muster, das Forschende Fear-Avoidance Model nennen – auf Deutsch Angst-Vermeidungs-Modell. Es funktioniert so:",
      kicker: "Das Muster",
      term: "Das Angst-Vermeidungs-Modell",
    },
    {
      type: "reveal-list",
      seg: " Du erlebst Schmerz. Dein Hirn macht eine Bewertung: Diese Bewegung ist gefährlich. Du entwickelst Angst vor der Bewegung. Du vermeidest die Bewegung. Damit fehlt deinem Nervensystem eine Korrektur-Erfahrung – es bleibt bei der Bewertung gefährlich. Beim nächsten Mal, wenn du der Bewegung doch nicht ausweichen kannst, ist der Schmerz größer und die Angst auch.",
      kicker: "Der Fear-Avoidance-Zyklus",
      title: "Eine Schleife, die sich selbst verstärkt",
      items: [
        { label: "Du erlebst Schmerz" },
        { label: "Dein Hirn bewertet: diese Bewegung ist gefährlich" },
        { label: "Du entwickelst Angst vor der Bewegung" },
        { label: "Du vermeidest die Bewegung" },
        { label: "Keine Korrektur-Erfahrung – die Bewertung bleibt: gefährlich" },
        { label: "Beim nächsten Mal: mehr Schmerz, mehr Angst" },
      ],
    },
    {
      type: "content",
      seg: " Mit der Zeit schrumpft dein Bewegungs-Repertoire. Du machst weniger, du machst seltener neue Sachen, du planst um deine Schmerz-Angst herum. Manche Menschen werden über Monate oder Jahre so eingeschränkt, dass sie kaum noch das machen, was sie eigentlich tun wollen.",
      dark: true,
      kicker: "Die Folge",
      headline: "Mit der Zeit schrumpft dein Bewegungs-Repertoire.",
      lead: "Du machst weniger, planst um die Schmerz-Angst herum. Manche werden über Jahre so eingeschränkt, dass sie kaum noch das tun, was sie wollen.",
    },
    {
      type: "statement",
      seg: " Das ist nicht Schwäche. Das ist ein verständlicher Schutzmechanismus, der bei chronischem Schmerz aber gegen dich arbeitet. Genau diese Schleife durchbrechen wir mit Graded Exposure.",
      text: "Das ist nicht Schwäche – es ist ein Schutzmechanismus, der gegen dich arbeitet.",
      emphasis: "nicht Schwäche",
    },
  ],
};

// ── Abschnitt 3 – Graded Exposure ────────────────────────────────────────────

const abschnitt3: SourceSection = {
  title: "Graded Exposure",
  narration:
    "Graded Exposure heißt wörtlich übersetzt abgestufte Aussetzung. Klingt klinisch, ist aber im Kern simpel: Du näherst dich der gefürchteten Bewegung in kleinen, dosierten Schritten wieder an, sodass dein Nervensystem neue Lernerfahrungen sammeln kann. Die Methode kommt ursprünglich aus der Angsttherapie. Bei Höhenangst zum Beispiel: Statt jemanden direkt auf einen Aussichtsturm zu stellen, geht man in kleinen Schritten vor – zuerst Bilder von Höhe anschauen, dann auf einen kleinen Hügel, dann auf einen niedrigen Balkon, schließlich auf den Turm. Jeder Schritt wird so lange geübt, bis er nicht mehr ängstigend ist, dann kommt der nächste. Bei Schmerz funktioniert das genauso. Schritt für Schritt näherst du dich Bewegungen, die du seit Monaten vermeidest. Jeder Schritt ist klein genug, dass dein Nervensystem ihn als sicher erleben kann. Mit jeder Wiederholung sinkt die Bedrohungs-Bewertung. Die Sensitivitätsschraube dreht sich runter. Wie machst du das konkret? In vier Schritten. Erstens: Identifiziere eine gefürchtete Bewegung oder Aktivität. Etwas, das du vermeidest, weil du Angst vor Schmerz hast. Beispiele: Etwas vom Boden aufheben. Stundenlang im Auto sitzen. Den Sohn auf den Arm nehmen. Beim Schwimmen kraulen. In einen Park-Bus springen. Zweitens: Brich die Bewegung in kleine Schritte auf. Wenn das Ziel ist, etwas vom Boden aufzuheben, dann sind die Stufen vielleicht: mit Hip Hinge ohne Last vom Boden bis zu den Knien beugen, mit einer leeren Plastikflasche aus halber Höhe vom Tisch heben, mit der leeren Plastikflasche vom Boden heben, mit einer halbvollen Flasche, mit einer vollen Flasche, mit zwei Flaschen, mit einer richtigen Einkaufstasche. Drittens: Beginne auf der niedrigsten Stufe, die machbar ist – aber etwas, was dein Nervensystem als kleine Herausforderung wahrnimmt, ohne in Panik zu geraten. Übe diese Stufe so lange, bis sie sich normal anfühlt – das kann eine Übung pro Tag über eine Woche sein. Wenn die Stufe nicht mehr ängstigt, gehst du zur nächsten. Viertens: Sei gnädig mit dir. Wenn eine Stufe sich nach drei Tagen nicht reduziert, ist die Stufe zu groß. Geh zurück zur vorherigen oder bau eine Zwischenstufe ein. Es gibt keine richtige Geschwindigkeit – es gibt nur deine Geschwindigkeit. Wichtig: Graded Exposure heißt nicht Schmerz aushalten. Es heißt kontrolliert in Bewegungen gehen, die du vermeidest. Wenn eine Stufe richtig stark Schmerz produziert, ist sie zu groß. Geh kleiner. Die Idee ist nicht, dich durchzubeißen – die Idee ist, deinem Nervensystem behutsam neue Erfahrungen zu ermöglichen.",
  slides: [
    {
      type: "content",
      seg: "Graded Exposure heißt wörtlich übersetzt abgestufte Aussetzung. Klingt klinisch, ist aber im Kern simpel: Du näherst dich der gefürchteten Bewegung in kleinen, dosierten Schritten wieder an, sodass dein Nervensystem neue Lernerfahrungen sammeln kann.",
      kicker: "Werkzeug 1 · Graded Exposure",
      headline: "Abgestufte Aussetzung – in kleinen, dosierten Schritten wieder annähern.",
      lead: "So kann dein Nervensystem neue Lernerfahrungen sammeln.",
    },
    {
      type: "content",
      seg: " Die Methode kommt ursprünglich aus der Angsttherapie. Bei Höhenangst zum Beispiel: Statt jemanden direkt auf einen Aussichtsturm zu stellen, geht man in kleinen Schritten vor – zuerst Bilder von Höhe anschauen, dann auf einen kleinen Hügel, dann auf einen niedrigen Balkon, schließlich auf den Turm. Jeder Schritt wird so lange geübt, bis er nicht mehr ängstigend ist, dann kommt der nächste.",
      kicker: "Das Vorbild · Höhenangst",
      headline: "Bilder, Hügel, Balkon, Turm – Schritt für Schritt statt Sprung.",
      lead: "Jeder Schritt wird geübt, bis er nicht mehr ängstigt. Dann kommt der nächste.",
    },
    {
      type: "content",
      seg: " Bei Schmerz funktioniert das genauso. Schritt für Schritt näherst du dich Bewegungen, die du seit Monaten vermeidest. Jeder Schritt ist klein genug, dass dein Nervensystem ihn als sicher erleben kann. Mit jeder Wiederholung sinkt die Bedrohungs-Bewertung. Die Sensitivitätsschraube dreht sich runter.",
      kicker: "Bei Schmerz",
      headline: "Mit jeder Wiederholung sinkt die Bedrohungs-Bewertung.",
      lead: "Jeder Schritt klein genug, dass dein Nervensystem ihn als sicher erlebt. Die Sensitivitätsschraube dreht sich runter.",
    },
    {
      type: "content",
      seg: " Wie machst du das konkret? In vier Schritten. Erstens: Identifiziere eine gefürchtete Bewegung oder Aktivität. Etwas, das du vermeidest, weil du Angst vor Schmerz hast. Beispiele: Etwas vom Boden aufheben. Stundenlang im Auto sitzen. Den Sohn auf den Arm nehmen. Beim Schwimmen kraulen. In einen Park-Bus springen.",
      kicker: "Schritt 1 · Identifizieren",
      headline: "Identifiziere eine Bewegung, die du aus Angst vor Schmerz vermeidest.",
      lead: "Etwas vom Boden aufheben, lange im Auto sitzen, den Sohn auf den Arm nehmen, beim Schwimmen kraulen.",
    },
    {
      type: "reveal-list",
      seg: " Zweitens: Brich die Bewegung in kleine Schritte auf. Wenn das Ziel ist, etwas vom Boden aufzuheben, dann sind die Stufen vielleicht: mit Hip Hinge ohne Last vom Boden bis zu den Knien beugen, mit einer leeren Plastikflasche aus halber Höhe vom Tisch heben, mit der leeren Plastikflasche vom Boden heben, mit einer halbvollen Flasche, mit einer vollen Flasche, mit zwei Flaschen, mit einer richtigen Einkaufstasche.",
      kicker: "Schritt 2 · In Stufen aufteilen",
      title: "Ziel: etwas vom Boden aufheben",
      items: [
        { label: "Hip Hinge ohne Last bis zu den Knien" },
        { label: "Leere Flasche aus halber Höhe vom Tisch" },
        { label: "Leere Flasche vom Boden" },
        { label: "Halbvolle Flasche" },
        { label: "Volle Flasche" },
        { label: "Zwei Flaschen" },
        { label: "Eine richtige Einkaufstasche" },
      ],
    },
    {
      type: "content",
      seg: " Drittens: Beginne auf der niedrigsten Stufe, die machbar ist – aber etwas, was dein Nervensystem als kleine Herausforderung wahrnimmt, ohne in Panik zu geraten. Übe diese Stufe so lange, bis sie sich normal anfühlt – das kann eine Übung pro Tag über eine Woche sein. Wenn die Stufe nicht mehr ängstigt, gehst du zur nächsten.",
      kicker: "Schritt 3 · Starten",
      headline: "Übe eine Stufe so lange, bis sie sich normal anfühlt.",
      lead: "Beginne auf der niedrigsten machbaren Stufe – eine kleine Herausforderung, keine Panik. Wenn sie nicht mehr ängstigt, kommt die nächste.",
    },
    {
      type: "content",
      seg: " Viertens: Sei gnädig mit dir. Wenn eine Stufe sich nach drei Tagen nicht reduziert, ist die Stufe zu groß. Geh zurück zur vorherigen oder bau eine Zwischenstufe ein. Es gibt keine richtige Geschwindigkeit – es gibt nur deine Geschwindigkeit.",
      kicker: "Schritt 4 · Sich Zeit geben",
      headline: "Es gibt keine richtige Geschwindigkeit – nur deine Geschwindigkeit.",
      lead: "Reduziert sich eine Stufe nach drei Tagen nicht, ist sie zu groß. Geh zurück oder bau eine Zwischenstufe ein.",
    },
    {
      type: "statement",
      seg: " Wichtig: Graded Exposure heißt nicht Schmerz aushalten. Es heißt kontrolliert in Bewegungen gehen, die du vermeidest. Wenn eine Stufe richtig stark Schmerz produziert, ist sie zu groß. Geh kleiner. Die Idee ist nicht, dich durchzubeißen – die Idee ist, deinem Nervensystem behutsam neue Erfahrungen zu ermöglichen.",
      text: "Graded Exposure heißt nicht Schmerz aushalten – sondern kontrolliert in Bewegungen gehen, die du vermeidest.",
      emphasis: "nicht Schmerz aushalten",
    },
  ],
};

// ── Abschnitt 4 – Kognitive Defusion ─────────────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Kognitive Defusion",
  narration:
    "Jetzt zum zweiten Hauptwerkzeug: kognitive Defusion. Defusion bedeutet wörtlich Entkopplung oder Trennung. Im therapeutischen Kontext heißt es: Du lernst, Abstand zu nehmen von deinen Gedanken über den Schmerz – ohne sie unterdrücken oder bekämpfen zu müssen. Warum ist das wichtig? Weil chronischer Schmerz nicht nur körperlich ist. Er ist auch gedacht. Wir haben pausenlose Gedanken über unseren Schmerz: Was wenn er nie weggeht? Was mache ich, wenn er morgen schlimmer wird? Warum gerade ich? Habe ich einen Bandscheibenvorfall, der OP-bedürftig wird? Diese Gedanken sind nicht die Schmerzursache – aber sie verstärken das Schmerzerleben deutlich. Die alte Idee war: Solche negativen Gedanken muss man wegmachen, überwinden, durch positive Gedanken ersetzen. Das funktioniert nur teilweise. Gedanken lassen sich oft nicht einfach abschalten. Wer einmal probiert hat, nicht an einen rosa Elefanten zu denken, weiß das. Defusion macht etwas anderes. Sie ändert nicht den Inhalt deiner Gedanken – sie ändert deine Beziehung zu ihnen. Du lernst zu erkennen: Das ist ein Gedanke. Nicht die Realität. Nicht ich. Ein Gedanke. Damit verliert der Gedanke seine Macht, ohne dass du ihn bekämpfen musst. Konkret läuft das so: Statt zu denken, mein Schmerz wird nie weggehen, nimmst du Abstand und denkst: Ich habe gerade den Gedanken, dass mein Schmerz nie weggehen wird. Das klingt nach einer Mini-Änderung, ist aber neurologisch ein deutlicher Unterschied. Du beobachtest den Gedanken, statt mit ihm identifiziert zu sein. Im ersten Fall bist du der Schmerz-Befürchter. Im zweiten Fall beobachtest du den Schmerz-Gedanken. Diese kleine Distanz schafft Spielraum.",
  slides: [
    {
      type: "content",
      seg: "Jetzt zum zweiten Hauptwerkzeug: kognitive Defusion. Defusion bedeutet wörtlich Entkopplung oder Trennung. Im therapeutischen Kontext heißt es: Du lernst, Abstand zu nehmen von deinen Gedanken über den Schmerz – ohne sie unterdrücken oder bekämpfen zu müssen.",
      kicker: "Werkzeug 2 · Kognitive Defusion",
      headline: "Abstand nehmen von deinen Gedanken über den Schmerz.",
      lead: "Defusion heißt Entkopplung – ohne die Gedanken unterdrücken oder bekämpfen zu müssen.",
    },
    {
      type: "content",
      seg: " Warum ist das wichtig? Weil chronischer Schmerz nicht nur körperlich ist. Er ist auch gedacht. Wir haben pausenlose Gedanken über unseren Schmerz: Was wenn er nie weggeht? Was mache ich, wenn er morgen schlimmer wird? Warum gerade ich? Habe ich einen Bandscheibenvorfall, der OP-bedürftig wird? Diese Gedanken sind nicht die Schmerzursache – aber sie verstärken das Schmerzerleben deutlich.",
      kicker: "Warum wichtig",
      headline: "Chronischer Schmerz ist nicht nur körperlich – er ist auch gedacht.",
      lead: "Was wenn er nie weggeht? Warum gerade ich? Diese Gedanken sind nicht die Ursache – aber sie verstärken das Schmerzerleben deutlich.",
    },
    {
      type: "content",
      seg: " Die alte Idee war: Solche negativen Gedanken muss man wegmachen, überwinden, durch positive Gedanken ersetzen. Das funktioniert nur teilweise. Gedanken lassen sich oft nicht einfach abschalten. Wer einmal probiert hat, nicht an einen rosa Elefanten zu denken, weiß das.",
      kicker: "Die alte Idee",
      headline: "Negative Gedanken wegmachen, durch positive ersetzen – funktioniert nur teilweise.",
      lead: "Gedanken lassen sich oft nicht abschalten. Wer probiert hat, nicht an einen rosa Elefanten zu denken, weiß das.",
    },
    {
      type: "statement",
      seg: " Defusion macht etwas anderes. Sie ändert nicht den Inhalt deiner Gedanken – sie ändert deine Beziehung zu ihnen. Du lernst zu erkennen: Das ist ein Gedanke. Nicht die Realität. Nicht ich. Ein Gedanke. Damit verliert der Gedanke seine Macht, ohne dass du ihn bekämpfen musst.",
      text: "Defusion ändert nicht den Inhalt deiner Gedanken – sie ändert deine Beziehung zu ihnen.",
      emphasis: "deine Beziehung zu ihnen",
    },
    {
      type: "content",
      seg: " Konkret läuft das so: Statt zu denken, mein Schmerz wird nie weggehen, nimmst du Abstand und denkst: Ich habe gerade den Gedanken, dass mein Schmerz nie weggehen wird. Das klingt nach einer Mini-Änderung, ist aber neurologisch ein deutlicher Unterschied. Du beobachtest den Gedanken, statt mit ihm identifiziert zu sein.",
      kicker: "Konkret",
      headline: "Aus „Mein Schmerz wird nie weggehen“ wird „Ich habe gerade den Gedanken, dass …“.",
      lead: "Eine Mini-Änderung – neurologisch ein deutlicher Unterschied. Du beobachtest den Gedanken, statt mit ihm identifiziert zu sein.",
    },
    {
      type: "content",
      seg: " Im ersten Fall bist du der Schmerz-Befürchter. Im zweiten Fall beobachtest du den Schmerz-Gedanken. Diese kleine Distanz schafft Spielraum.",
      dark: true,
      kicker: "Der Unterschied",
      headline: "Im ersten Fall bist du der Schmerz-Befürchter. Im zweiten beobachtest du ihn.",
      lead: "Diese kleine Distanz schafft Spielraum.",
    },
  ],
};

// ── Abschnitt 5 – Drei konkrete Defusions-Techniken ──────────────────────────

const abschnitt5: SourceSection = {
  title: "Drei Defusions-Techniken",
  narration:
    "Drei Techniken, die du sofort anwenden kannst. Erste Technik: Ich habe gerade den Gedanken, dass... Wenn ein Schmerz-Gedanke auftaucht, sprich ihn nicht aus oder denk ihn nicht direkt – sondern in dieser Form: Ich habe gerade den Gedanken, dass... und dann der Gedanke. Beispiele: Mein Rücken bricht zusammen wird zu: Ich habe gerade den Gedanken, dass mein Rücken zusammenbricht. Ich kann nicht mehr wird zu: Ich habe gerade den Gedanken, ich kann nicht mehr. Die Schritt-Trennung ist klein, aber sie ermöglicht das Beobachten statt das Identifizieren. Zweite Technik: Naming the thought. Du gibst deinem wiederkehrenden Schmerz-Gedanken einen Namen. Bei jedem Auftreten begrüßt du ihn: Ah, da ist mein Sorge-um-die-Zukunft-Gedanke wieder. Oder: Ah, da ist mein Ich-kann-nichts-mehr-Gedanke. Damit machst du den Gedanken zu einem wiederkehrenden Gast statt zur dominanten Realität. Du bist freundlich-ironisch zu ihm. Dritte Technik: Singen oder fremde Stimme. Wenn ein Schmerz-Gedanke besonders mächtig ist, sing ihn innerlich in einer absurden Melodie. Mein Rücken bricht zusammen, gesungen wie ein Werbe-Jingle. Oder denk ihn mit der Stimme einer Comic-Figur. Klingt albern – ist therapeutisch effektiv. Du nutzt das Absurde, um die Macht des Gedankens zu brechen. Forschende haben das in mehreren Studien validiert. Wichtig: Defusion heißt nicht Schmerz wegmachen. Es heißt Schmerz weniger dominant werden lassen. Du wirst weiter Schmerz haben. Du wirst weiter Schmerz-Gedanken haben. Aber sie werden nicht mehr deinen ganzen Tag bestimmen.",
  slides: [
    {
      type: "content",
      seg: "Drei Techniken, die du sofort anwenden kannst.",
      kicker: "Defusion in der Praxis",
      headline: "Drei Techniken, die du sofort anwenden kannst.",
    },
    {
      type: "content",
      seg: " Erste Technik: Ich habe gerade den Gedanken, dass... Wenn ein Schmerz-Gedanke auftaucht, sprich ihn nicht aus oder denk ihn nicht direkt – sondern in dieser Form: Ich habe gerade den Gedanken, dass... und dann der Gedanke. Beispiele: Mein Rücken bricht zusammen wird zu: Ich habe gerade den Gedanken, dass mein Rücken zusammenbricht. Ich kann nicht mehr wird zu: Ich habe gerade den Gedanken, ich kann nicht mehr. Die Schritt-Trennung ist klein, aber sie ermöglicht das Beobachten statt das Identifizieren.",
      kicker: "Technik 1 · Vorschalten",
      headline: "„Ich habe gerade den Gedanken, dass …“ – und dann der Gedanke.",
      lead: "Aus „Mein Rücken bricht zusammen“ wird „Ich habe gerade den Gedanken, dass mein Rücken zusammenbricht“. Klein – aber sie ermöglicht das Beobachten statt das Identifizieren.",
    },
    {
      type: "content",
      seg: " Zweite Technik: Naming the thought. Du gibst deinem wiederkehrenden Schmerz-Gedanken einen Namen. Bei jedem Auftreten begrüßt du ihn: Ah, da ist mein Sorge-um-die-Zukunft-Gedanke wieder. Oder: Ah, da ist mein Ich-kann-nichts-mehr-Gedanke. Damit machst du den Gedanken zu einem wiederkehrenden Gast statt zur dominanten Realität. Du bist freundlich-ironisch zu ihm.",
      kicker: "Technik 2 · Naming the thought",
      headline: "„Ah, da ist mein Sorge-um-die-Zukunft-Gedanke wieder.“",
      lead: "Du gibst dem wiederkehrenden Gedanken einen Namen – und machst ihn zum wiederkehrenden Gast statt zur dominanten Realität. Freundlich-ironisch.",
    },
    {
      type: "content",
      seg: " Dritte Technik: Singen oder fremde Stimme. Wenn ein Schmerz-Gedanke besonders mächtig ist, sing ihn innerlich in einer absurden Melodie. Mein Rücken bricht zusammen, gesungen wie ein Werbe-Jingle. Oder denk ihn mit der Stimme einer Comic-Figur. Klingt albern – ist therapeutisch effektiv. Du nutzt das Absurde, um die Macht des Gedankens zu brechen. Forschende haben das in mehreren Studien validiert.",
      kicker: "Technik 3 · Singen oder fremde Stimme",
      headline: "Sing den Gedanken innerlich wie einen Werbe-Jingle.",
      lead: "Klingt albern – ist therapeutisch effektiv. Du nutzt das Absurde, um die Macht des Gedankens zu brechen. In mehreren Studien validiert.",
    },
    {
      type: "reveal-list",
      seg: " Wichtig: Defusion heißt nicht Schmerz wegmachen. Es heißt Schmerz weniger dominant werden lassen.",
      kicker: "Drei Techniken im Überblick",
      title: "Dein Defusions-Werkzeugkasten",
      items: [
        { label: "„Ich habe gerade den Gedanken, dass …“" },
        { label: "Naming the thought – dem Gedanken einen Namen geben" },
        { label: "Singen oder fremde Stimme – das Absurde nutzen" },
      ],
    },
    {
      type: "statement",
      seg: " Du wirst weiter Schmerz haben. Du wirst weiter Schmerz-Gedanken haben. Aber sie werden nicht mehr deinen ganzen Tag bestimmen.",
      text: "Defusion macht den Schmerz nicht weg – sie lässt ihn weniger dominant werden.",
      emphasis: "weniger dominant",
    },
  ],
};

// ── Abschnitt 6 – Was die Werkzeuge können und was nicht ──────────────────────

const abschnitt6: SourceSection = {
  title: "Was die Werkzeuge können – und was nicht",
  narration:
    "Eine wichtige Einordnung am Ende. Graded Exposure und Defusion sind keine Wundermittel. Sie löschen keinen Schmerz weg. Sie ersetzen kein Bewegungstraining. Was sie tun ist: Sie geben dir Handlungsspielraum in Momenten, in denen du sonst keinen hättest. Sie sind besonders hilfreich an schlechten Schmerz-Tagen, wenn körperliche Übung schwer ist; in Stress-Phasen, in denen der Schmerz reaktiv hochfährt; bei spezifischen gefürchteten Aktivitäten, vor denen du seit Jahren wegläufst; und in Wartezimmern, im Auto, in der Nacht – wenn körperliche Übungen nicht möglich sind. Sie ersetzen nicht: ärztliche Diagnostik bei Red Flags. Sie ersetzen nicht: körperliche Bewegungstherapie. Sie ersetzen nicht: spezielle psychologische Behandlung, wenn du an einer ausgeprägten Depression, Angststörung oder posttraumatischen Belastung leidest. In diesen Fällen ist eine spezialisierte psychotherapeutische Begleitung sinnvoll – parallel zu dieser Masterclass.",
  slides: [
    {
      type: "content",
      seg: "Eine wichtige Einordnung am Ende. Graded Exposure und Defusion sind keine Wundermittel. Sie löschen keinen Schmerz weg. Sie ersetzen kein Bewegungstraining. Was sie tun ist: Sie geben dir Handlungsspielraum in Momenten, in denen du sonst keinen hättest.",
      kicker: "Eine wichtige Einordnung",
      headline: "Keine Wundermittel – aber Handlungsspielraum, wo du sonst keinen hättest.",
      lead: "Sie löschen keinen Schmerz weg und ersetzen kein Bewegungstraining.",
    },
    {
      type: "reveal-list",
      seg: " Sie sind besonders hilfreich an schlechten Schmerz-Tagen, wenn körperliche Übung schwer ist; in Stress-Phasen, in denen der Schmerz reaktiv hochfährt; bei spezifischen gefürchteten Aktivitäten, vor denen du seit Jahren wegläufst; und in Wartezimmern, im Auto, in der Nacht – wenn körperliche Übungen nicht möglich sind.",
      kicker: "Besonders hilfreich",
      title: "Wann die Werkzeuge tragen",
      items: [
        { label: "An schlechten Schmerz-Tagen, wenn Übung schwer ist" },
        { label: "In Stress-Phasen, in denen der Schmerz reaktiv hochfährt" },
        { label: "Bei gefürchteten Aktivitäten, vor denen du seit Jahren wegläufst" },
        { label: "Im Wartezimmer, im Auto, in der Nacht" },
      ],
    },
    {
      type: "reveal-list",
      seg: " Sie ersetzen nicht: ärztliche Diagnostik bei Red Flags. Sie ersetzen nicht: körperliche Bewegungstherapie. Sie ersetzen nicht: spezielle psychologische Behandlung, wenn du an einer ausgeprägten Depression, Angststörung oder posttraumatischen Belastung leidest. In diesen Fällen ist eine spezialisierte psychotherapeutische Begleitung sinnvoll – parallel zu dieser Masterclass.",
      dark: true,
      kicker: "Was sie NICHT ersetzen",
      title: "Klare Grenzen",
      items: [
        { label: "Ärztliche Diagnostik bei Red Flags" },
        { label: "Körperliche Bewegungstherapie" },
        { label: "Bei Depression, Angststörung, PTBS: spezialisierte Psychotherapie – parallel" },
      ],
    },
  ],
};

// ── Abschnitt 7 – Workbook und Modul-2-Abschluss ─────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Modul-2-Abschluss",
  narration:
    "Im Workbook findest du Übung 2.7: Mein Coping-Werkzeugkasten. Du wählst zwei oder drei der gerade besprochenen Techniken aus und legst dir kleine Wenn-Dann-Anweisungen zurecht: Wenn ich abends im Bett liege und mein Schmerz hochfährt – dann mache ich Box Breathing für drei Minuten und sage mir innerlich: Ich habe den Gedanken, dass... Mehrere solche Pläne machen dich für Schmerz-Spitzen widerstandsfähiger. Damit ist Modul 2 abgeschlossen. Du hast jetzt einen vollständigen Werkzeugkasten: sieben Mobilisationsübungen aus 2.2, sechs Stabilisationsübungen aus 2.3, sieben Belastungstoleranz-Übungen aus 2.4, drei Atemübungen aus 2.5, Pacing-Prinzipien aus 2.6 und mentale Coping-Werkzeuge aus 2.7. In Modul 3 – dem Präventions-Modul – geht es darum, wie du das, was du dir erarbeitest, langfristig hältst. Was sind die Faktoren, die in den nächsten Jahren entscheiden, ob du in Rückfällen lebst oder in einem stabilen, belastbaren Zustand? Wir sprechen über Belastbarkeit als Lebensprinzip, über Haltungs-Mythen, über Schlaf, Stress, Ernährung als Schmerzmodulatoren. Bevor du in Modul 3 startest, mach einen weiteren bewussten Tag Pause – genau wie nach Modul 1. Lass das Gelernte wirken. Probiere ein paar der Übungen einmal aus. Bis dann.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 2.7: Mein Coping-Werkzeugkasten. Du wählst zwei oder drei der gerade besprochenen Techniken aus und legst dir kleine Wenn-Dann-Anweisungen zurecht: Wenn ich abends im Bett liege und mein Schmerz hochfährt – dann mache ich Box Breathing für drei Minuten und sage mir innerlich: Ich habe den Gedanken, dass... Mehrere solche Pläne machen dich für Schmerz-Spitzen widerstandsfähiger.",
      kicker: "Workbook · Übung 2.7",
      headline: "Mein Coping-Werkzeugkasten – kleine Wenn-Dann-Pläne.",
      lead: "Wähle zwei, drei Techniken aus: „Wenn der Schmerz abends hochfährt – dann Box Breathing und: Ich habe den Gedanken, dass …“. Mehrere Pläne machen dich für Schmerz-Spitzen widerstandsfähiger.",
    },
    {
      type: "reveal-list",
      seg: " Damit ist Modul 2 abgeschlossen. Du hast jetzt einen vollständigen Werkzeugkasten: sieben Mobilisationsübungen aus 2.2, sechs Stabilisationsübungen aus 2.3, sieben Belastungstoleranz-Übungen aus 2.4, drei Atemübungen aus 2.5, Pacing-Prinzipien aus 2.6 und mentale Coping-Werkzeuge aus 2.7.",
      kicker: "Modul 2 abgeschlossen",
      title: "Dein vollständiger Werkzeugkasten",
      items: [
        { label: "Sieben Mobilisationsübungen · 2.2" },
        { label: "Sechs Stabilisationsübungen · 2.3" },
        { label: "Sieben Belastungstoleranz-Übungen · 2.4" },
        { label: "Drei Atemübungen · 2.5" },
        { label: "Pacing-Prinzipien · 2.6" },
        { label: "Mentale Coping-Werkzeuge · 2.7" },
      ],
    },
    {
      type: "content",
      seg: " In Modul 3 – dem Präventions-Modul – geht es darum, wie du das, was du dir erarbeitest, langfristig hältst. Was sind die Faktoren, die in den nächsten Jahren entscheiden, ob du in Rückfällen lebst oder in einem stabilen, belastbaren Zustand? Wir sprechen über Belastbarkeit als Lebensprinzip, über Haltungs-Mythen, über Schlaf, Stress, Ernährung als Schmerzmodulatoren.",
      kicker: "Als Nächstes · Modul 3 – Prävention",
      headline: "Wie hältst du langfristig, was du dir erarbeitest?",
      lead: "Die Faktoren, die über Rückfälle oder stabile Belastbarkeit entscheiden: Belastbarkeit als Lebensprinzip, Haltungs-Mythen, Schlaf, Stress, Ernährung.",
    },
    {
      type: "content",
      seg: " Bevor du in Modul 3 startest, mach einen weiteren bewussten Tag Pause – genau wie nach Modul 1. Lass das Gelernte wirken. Probiere ein paar der Übungen einmal aus.",
      kicker: "Eine Empfehlung",
      headline: "Mach einen bewussten Tag Pause, bevor Modul 3 startet.",
      lead: "Genau wie nach Modul 1. Lass das Gelernte wirken, probiere ein paar Übungen einmal aus.",
    },
    {
      type: "word",
      seg: " Bis dann.",
      word: "Bis dann.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 3.1",
      nextTitle: "Belastbarkeit statt Schonung",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "2.7",
  title: "Schmerz-Coping in der Praxis",
  subtitle: "Modul 2 – Kurativ handeln · Graded Exposure & kognitive Defusion",
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
