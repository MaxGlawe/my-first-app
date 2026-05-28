/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 3.1
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/3.1.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 3.1`). Niemals lessons/3.1.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Erste Lektion von Modul 3 (Prävention). Der zentrale Mindset-Shift von
 * „Schonung" zu „Belastbarkeit": der Schonungs-Reflex langfristig, Antifragilität
 * (fragil / robust / antifragil), Belastbarkeit als Lebensprinzip & Wachstumszone,
 * „trainiert" im Alltag = Reserven statt Perfektion, drei Phasen nach Modul 2,
 * das Mein-Rücken-fürs-Leben-Mindset, Workbook + Übergang zu 3.2. Keine
 * klassischen Übungen — eine Konzept-/Strategie-Lektion. Aufbau identisch zu 2.6:
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
 * 3.-PERSON-REGEL (angewandt): 3.1 enthält ZWEI Ersteller-/Praxis-Ich-Stellen, die
 * auf „Max Glawe" umgeschrieben wurden:
 *   - MD: „Ein Phänomen, das ich in der Praxis oft beobachte"
 *     → „Ein Phänomen, das Max Glawe in der Praxis oft beobachtet".
 *   - MD: „Eine letzte Idee für diese Lektion, die ich Patienten mitgeben möchte"
 *     → „Eine letzte Idee für diese Lektion, die Max Glawe Patienten mitgeben möchte".
 *   Generische Guide-Form bleibt: „Lass mich ein anderes Modell vorstellen" ist
 *   Guide-Sprache (kein Credential-Ich) und wurde zu „Schauen wir uns ein anderes
 *   Modell an" geglättet, um die erste Person Singular zu vermeiden. Die übrige
 *   Du-/Wir-Anleitungsform bleibt unverändert.
 *
 * HWG: Wortlaut der MD wird – außer der 3.-Person-Umschreibung und der genannten
 *   Glättung – beibehalten. Belastbarkeit/Antifragilität sind als Lebensprinzip
 *   und Orientierung beschrieben, nicht als Heilversprechen. „Use it or lose it"
 *   bleibt als biologisches Prinzip stehen, prozesshaft formuliert.
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
    "Willkommen in Modul 3. Du hast Modul 1 hinter dir – das Verstehen. Du hast Modul 2 hinter dir – das Handeln. In Modul 3 geht es um etwas anderes: das Bleiben. Wie hältst du das, was du dir erarbeitest, langfristig? Prävention heißt in dieser Masterclass nicht: besser keine schlimmen Sachen machen. Prävention heißt: aktiv bauen. Aktiv jenes Leben gestalten, in dem chronischer Rückenschmerz weniger Platz hat. Vier Themen-Felder, die das prägen: dein Mindset zur Belastbarkeit, deine Haltungs-Vorstellungen, deine Lifestyle-Faktoren wie Schlaf und Stress, und deine Alltagsbewegung jenseits gezielter Übungen. Diese Lektion 3.1 ist die Mindset-Lektion. Bevor wir an Schlaf und Haltungen gehen, müssen wir zuerst ein gedankliches Fundament legen.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 3 – Prävention",
      lessonLabel: "Lektion 3.1 – Belastbarkeit statt Schonung",
    },
    {
      type: "content",
      seg: "Willkommen in Modul 3. Du hast Modul 1 hinter dir – das Verstehen. Du hast Modul 2 hinter dir – das Handeln. In Modul 3 geht es um etwas anderes: das Bleiben. Wie hältst du das, was du dir erarbeitest, langfristig?",
      kicker: "Modul 3 – Prävention",
      headline: "Verstehen, Handeln – und jetzt: das Bleiben.",
      lead: "Wie hältst du das, was du dir erarbeitest, langfristig?",
    },
    {
      type: "module",
      seg: " Prävention heißt in dieser Masterclass nicht: besser keine schlimmen Sachen machen. Prävention heißt: aktiv bauen. Aktiv jenes Leben gestalten, in dem chronischer Rückenschmerz weniger Platz hat. Vier Themen-Felder, die das prägen: dein Mindset zur Belastbarkeit, deine Haltungs-Vorstellungen, deine Lifestyle-Faktoren wie Schlaf und Stress, und deine Alltagsbewegung jenseits gezielter Übungen.",
      number: "3",
      title: "Modul 3 – Prävention",
      lead: "Prävention heißt nicht Vermeiden – Prävention heißt aktiv bauen.",
      items: [
        { label: "Mindset zur Belastbarkeit" },
        { label: "Haltungs-Vorstellungen" },
        { label: "Lifestyle-Faktoren – Schlaf & Stress" },
        { label: "Alltagsbewegung jenseits gezielter Übungen" },
      ],
    },
    {
      type: "statement",
      seg: " Diese Lektion 3.1 ist die Mindset-Lektion. Bevor wir an Schlaf und Haltungen gehen, müssen wir zuerst ein gedankliches Fundament legen.",
      text: "Bevor wir an Schlaf und Haltungen gehen, legen wir ein gedankliches Fundament.",
      emphasis: "gedankliches Fundament",
    },
  ],
};

// ── Abschnitt 2 – Der Schonungs-Reflex langfristig ───────────────────────────

const abschnitt2: SourceSection = {
  title: "Der Schonungs-Reflex langfristig",
  narration:
    "Ein Phänomen, das Max Glawe in der Praxis oft beobachtet: Patienten, denen es nach Wochen oder Monaten endlich besser geht, fallen erstaunlich häufig in alte Schonungsmuster zurück. Das funktioniert so: Es geht ihnen besser. Sie machen weniger Übungen, weil sie sie gerade nicht brauchen. Sie sind vorsichtiger bei alltäglichen Belastungen, weil sie bloß keinen Rückschlag riskieren wollen. Sie laden ihre Trainingsroutine schleichend nicht mehr, weil es ja gerade gut läuft. Drei Monate später kommt der nächste Schub – und sie fragen sich, warum. Der Grund ist einfach: Belastbarkeit muss unterhalten werden. Was nicht regelmäßig belastet wird, baut ab. Das gilt für Knochen, Bandscheiben, Muskeln, Sehnen, Nerven, das Belastungs-Vertrauen. Du kannst die hart erarbeitete Belastbarkeit in zwei, drei Monaten durch reine Vorsicht wieder verlieren. Das ist nicht gemein – das ist Biologie. Use it or lose it. Wenn du gut wirst und du behältst dieselbe Routine bei, hältst du dich gut. Wenn du gut wirst und du reduzierst die Routine, weil du sie gerade nicht brauchst, baust du wieder ab. Es gibt keinen Schon-Status mit voller Belastbarkeit. Die Belastbarkeit folgt deiner Belastung. Die ganz wichtige Verschiebung in deinem Mindset: Schonung darf nicht mehr dein Reflex sein. Schonung ist eine Strategie für akute Phasen. Belastbarkeit ist eine Strategie fürs Leben.",
  slides: [
    {
      type: "content",
      seg: "Ein Phänomen, das Max Glawe in der Praxis oft beobachtet: Patienten, denen es nach Wochen oder Monaten endlich besser geht, fallen erstaunlich häufig in alte Schonungsmuster zurück.",
      kicker: "Ein Phänomen aus der Praxis",
      headline: "Wenn es endlich besser geht – fallen viele in alte Schonungsmuster zurück.",
    },
    {
      type: "content",
      seg: " Das funktioniert so: Es geht ihnen besser. Sie machen weniger Übungen, weil sie sie gerade nicht brauchen. Sie sind vorsichtiger bei alltäglichen Belastungen, weil sie bloß keinen Rückschlag riskieren wollen. Sie laden ihre Trainingsroutine schleichend nicht mehr, weil es ja gerade gut läuft. Drei Monate später kommt der nächste Schub – und sie fragen sich, warum.",
      kicker: "Wie es passiert",
      headline: "Weniger Übungen, vorsichtiger, Routine nicht mehr geladen – und dann der nächste Schub.",
      lead: "Alles aus guten Gründen: gerade nicht gebraucht, keinen Rückschlag riskieren, es läuft ja gut. Drei Monate später fragt man sich, warum.",
    },
    {
      type: "content",
      seg: " Der Grund ist einfach: Belastbarkeit muss unterhalten werden. Was nicht regelmäßig belastet wird, baut ab. Das gilt für Knochen, Bandscheiben, Muskeln, Sehnen, Nerven, das Belastungs-Vertrauen. Du kannst die hart erarbeitete Belastbarkeit in zwei, drei Monaten durch reine Vorsicht wieder verlieren.",
      dark: true,
      kicker: "Der Grund",
      headline: "Was nicht regelmäßig belastet wird, baut ab.",
      lead: "Knochen, Bandscheiben, Muskeln, Sehnen, Nerven, das Belastungs-Vertrauen – hart erarbeitete Belastbarkeit kann reine Vorsicht in zwei, drei Monaten wieder kosten.",
    },
    {
      type: "content",
      seg: " Das ist nicht gemein – das ist Biologie. Use it or lose it. Wenn du gut wirst und du behältst dieselbe Routine bei, hältst du dich gut. Wenn du gut wirst und du reduzierst die Routine, weil du sie gerade nicht brauchst, baust du wieder ab. Es gibt keinen Schon-Status mit voller Belastbarkeit. Die Belastbarkeit folgt deiner Belastung.",
      kicker: "Use it or lose it",
      headline: "Es gibt keinen Schon-Status mit voller Belastbarkeit.",
      lead: "Das ist nicht gemein – das ist Biologie. Die Belastbarkeit folgt deiner Belastung.",
    },
    {
      type: "statement",
      seg: " Die ganz wichtige Verschiebung in deinem Mindset: Schonung darf nicht mehr dein Reflex sein. Schonung ist eine Strategie für akute Phasen. Belastbarkeit ist eine Strategie fürs Leben.",
      text: "Schonung ist eine Strategie für akute Phasen. Belastbarkeit ist eine Strategie fürs Leben.",
      emphasis: "fürs Leben",
    },
  ],
};

// ── Abschnitt 3 – Belastbarkeit als Lebensprinzip ────────────────────────────

const abschnitt3: SourceSection = {
  title: "Belastbarkeit als Lebensprinzip",
  narration:
    "Schauen wir uns ein anderes Modell an – eines, das in der Schmerz- und Physio-Therapie immer wichtiger wird: das Modell der Antifragilität. Der Begriff stammt vom Mathematiker Nassim Taleb. Er beschreibt drei Zustände, in denen ein System zu Belastung stehen kann. Fragil: Belastung schadet. Eine Glasvase wird durch Druck kaputt. Vermeide Druck so weit wie möglich. Robust: Belastung ändert nichts. Ein Felsblock bleibt Felsblock, ob mit oder ohne Belastung. Belastung ist neutral. Antifragil: Belastung macht stärker. Ein Muskel wächst durch Belastung. Ein Knochen wird dichter durch Druck. Ein Immunsystem lernt durch Infektionen. Dein Bewegungs- und Schmerzsystem gehört in die dritte Kategorie. Es ist antifragil. Es will Belastung – nicht zu viel, nicht zu wenig, sondern in einer Dosis, mit der es gerade noch fertig wird, plus ein kleines bisschen. Das ist die Wachstumszone. Was bedeutet das für die nächsten Jahre deines Lebens? Es bedeutet: Du sollst dein System fordern. Du sollst Dinge tun, die du gerade so schaffst. Du sollst dich nicht in Komfortzonen einrichten, in denen nichts passiert. Du sollst dich auch nicht in Überforderungszonen drängen, in denen du dich überlastest. Du sollst genau die Wachstumszone finden – die Zone, in der dein Körper wächst. Diese Zone ist nicht statisch. Sie verschiebt sich, je nachdem wo du gerade stehst. Vor einem Jahr war sie für dich vielleicht zehn Minuten spazieren gehen. Heute ist sie vielleicht eine Stunde Walken mit Gepäck. In zwei Jahren ist sie vielleicht einen Halbmarathon laufen oder die Wohnung renovieren ohne Crash. Du verschiebst die Zone, indem du an ihren Rändern arbeitest. Das ist Belastbarkeit als Lebensprinzip: Bewusst die Wachstumszone suchen. Dosiert reinwachsen. Die nächste Zone vor dir haben.",
  slides: [
    {
      type: "term",
      seg: "Schauen wir uns ein anderes Modell an – eines, das in der Schmerz- und Physio-Therapie immer wichtiger wird: das Modell der Antifragilität. Der Begriff stammt vom Mathematiker Nassim Taleb. Er beschreibt drei Zustände, in denen ein System zu Belastung stehen kann.",
      kicker: "Ein Modell · nach Nassim Taleb",
      term: "Antifragilität",
    },
    {
      type: "content",
      seg: " Fragil: Belastung schadet. Eine Glasvase wird durch Druck kaputt. Vermeide Druck so weit wie möglich.",
      kicker: "Zustand 1 · Fragil",
      headline: "Fragil: Belastung schadet.",
      lead: "Eine Glasvase wird durch Druck kaputt. Vermeide Druck so weit wie möglich.",
    },
    {
      type: "content",
      seg: " Robust: Belastung ändert nichts. Ein Felsblock bleibt Felsblock, ob mit oder ohne Belastung. Belastung ist neutral.",
      kicker: "Zustand 2 · Robust",
      headline: "Robust: Belastung ändert nichts.",
      lead: "Ein Felsblock bleibt Felsblock, ob mit oder ohne Belastung. Belastung ist neutral.",
    },
    {
      type: "content",
      seg: " Antifragil: Belastung macht stärker. Ein Muskel wächst durch Belastung. Ein Knochen wird dichter durch Druck. Ein Immunsystem lernt durch Infektionen.",
      kicker: "Zustand 3 · Antifragil",
      headline: "Antifragil: Belastung macht stärker.",
      lead: "Ein Muskel wächst durch Belastung, ein Knochen wird dichter durch Druck, ein Immunsystem lernt durch Infektionen.",
    },
    {
      type: "statement",
      seg: " Dein Bewegungs- und Schmerzsystem gehört in die dritte Kategorie. Es ist antifragil. Es will Belastung – nicht zu viel, nicht zu wenig, sondern in einer Dosis, mit der es gerade noch fertig wird, plus ein kleines bisschen. Das ist die Wachstumszone.",
      text: "Dein Bewegungs- und Schmerzsystem ist antifragil. Es will Belastung.",
      emphasis: "antifragil",
    },
    {
      type: "content",
      seg: " Was bedeutet das für die nächsten Jahre deines Lebens? Es bedeutet: Du sollst dein System fordern. Du sollst Dinge tun, die du gerade so schaffst. Du sollst dich nicht in Komfortzonen einrichten, in denen nichts passiert. Du sollst dich auch nicht in Überforderungszonen drängen, in denen du dich überlastest. Du sollst genau die Wachstumszone finden – die Zone, in der dein Körper wächst.",
      kicker: "Die Wachstumszone",
      headline: "Nicht Komfortzone, nicht Überforderung – die Wachstumszone.",
      lead: "Fordere dein System: tu Dinge, die du gerade so schaffst. Genau dort wächst dein Körper.",
    },
    {
      type: "content",
      seg: " Diese Zone ist nicht statisch. Sie verschiebt sich, je nachdem wo du gerade stehst. Vor einem Jahr war sie für dich vielleicht zehn Minuten spazieren gehen. Heute ist sie vielleicht eine Stunde Walken mit Gepäck. In zwei Jahren ist sie vielleicht einen Halbmarathon laufen oder die Wohnung renovieren ohne Crash. Du verschiebst die Zone, indem du an ihren Rändern arbeitest.",
      kicker: "Die Zone verschiebt sich",
      headline: "Zehn Minuten spazieren – eine Stunde Walken – ein Halbmarathon.",
      lead: "Die Wachstumszone ist nicht statisch. Du verschiebst sie, indem du an ihren Rändern arbeitest.",
    },
    {
      type: "statement",
      seg: " Das ist Belastbarkeit als Lebensprinzip: Bewusst die Wachstumszone suchen. Dosiert reinwachsen. Die nächste Zone vor dir haben.",
      text: "Belastbarkeit als Lebensprinzip: die Wachstumszone suchen, dosiert reinwachsen.",
      emphasis: "Lebensprinzip",
    },
  ],
};

// ── Abschnitt 4 – Was bedeutet „trainiert" im Alltag ─────────────────────────

const abschnitt4: SourceSection = {
  title: "Was „trainiert“ im Alltag bedeutet",
  narration:
    "Wie sieht ein trainierter Rücken im Alltag aus? Werden wir konkret – damit du eine Vorstellung davon hast, wohin wir wollen. Ein trainierter Rücken kann eine 20-Kilo-Einkaufstüte heben und tragen, ohne dass du am nächsten Tag steif aufwachst. Er kann eine längere Autofahrt machen – sagen wir drei Stunden – ohne dass du auf der Raststätte zehn Minuten brauchst, um wieder gerade zu werden. Er kann einen Tag Wandern in den Alpen, ohne dass du danach drei Tage liegen musst. Ein trainierter Rücken kann auch Fehler verzeihen. Du hebst mal etwas zu schnell. Du sitzt mal acht Stunden auf einem schlechten Stuhl, weil du es gerade nicht anders hast. Du schläfst mal in einem fremden Bett. Ein trainierter Rücken nimmt diese Belastungen weg, ohne in einen Crash zu kippen. Er hat Reserven. Er hat Spielraum. Genau das ist der wichtige Punkt. Es geht nicht um Perfektion. Es geht um Reserven. Wer chronisch wenig belastbar ist, hat keine Reserven – jedes kleine Heben, jedes lange Sitzen, jede ungewohnte Belastung wird relativ gesehen zur Großbelastung. Wer belastbar ist, hat Polster. Er kann mal danebengreifen, ohne dass das System kollabiert. Dieses Polster ist die eigentliche Lebensqualität, die wir bauen. Nicht ein perfekter, schmerzfreier Rücken. Sondern ein Rücken mit Reserven, der auch mal ein bisschen Schaden nimmt und sich gut wieder erholt.",
  slides: [
    {
      type: "content",
      seg: "Wie sieht ein trainierter Rücken im Alltag aus? Werden wir konkret – damit du eine Vorstellung davon hast, wohin wir wollen.",
      kicker: "Wohin wir wollen",
      headline: "Wie sieht ein trainierter Rücken im Alltag aus?",
    },
    {
      type: "reveal-list",
      seg: " Ein trainierter Rücken kann eine 20-Kilo-Einkaufstüte heben und tragen, ohne dass du am nächsten Tag steif aufwachst. Er kann eine längere Autofahrt machen – sagen wir drei Stunden – ohne dass du auf der Raststätte zehn Minuten brauchst, um wieder gerade zu werden. Er kann einen Tag Wandern in den Alpen, ohne dass du danach drei Tage liegen musst.",
      kicker: "Ein trainierter Rücken kann …",
      title: "Drei Alltagsszenarien",
      items: [
        { label: "Eine 20-Kilo-Einkaufstüte heben – kein steifes Aufwachen" },
        { label: "Drei Stunden Autofahrt – kein Zehn-Minuten-Geradewerden" },
        { label: "Einen Tag Wandern in den Alpen – kein Drei-Tage-Liegen" },
      ],
    },
    {
      type: "content",
      seg: " Ein trainierter Rücken kann auch Fehler verzeihen. Du hebst mal etwas zu schnell. Du sitzt mal acht Stunden auf einem schlechten Stuhl, weil du es gerade nicht anders hast. Du schläfst mal in einem fremden Bett. Ein trainierter Rücken nimmt diese Belastungen weg, ohne in einen Crash zu kippen. Er hat Reserven. Er hat Spielraum.",
      kicker: "Fehler verzeihen",
      headline: "Ein trainierter Rücken hat Reserven – er kann Fehler verzeihen.",
      lead: "Mal zu schnell gehoben, acht Stunden schlechter Stuhl, ein fremdes Bett: er nimmt das weg, ohne in einen Crash zu kippen.",
    },
    {
      type: "statement",
      seg: " Genau das ist der wichtige Punkt. Es geht nicht um Perfektion. Es geht um Reserven. Wer chronisch wenig belastbar ist, hat keine Reserven – jedes kleine Heben, jedes lange Sitzen, jede ungewohnte Belastung wird relativ gesehen zur Großbelastung. Wer belastbar ist, hat Polster. Er kann mal danebengreifen, ohne dass das System kollabiert.",
      text: "Es geht nicht um Perfektion. Es geht um Reserven.",
      emphasis: "Reserven",
    },
    {
      type: "content",
      seg: " Dieses Polster ist die eigentliche Lebensqualität, die wir bauen. Nicht ein perfekter, schmerzfreier Rücken. Sondern ein Rücken mit Reserven, der auch mal ein bisschen Schaden nimmt und sich gut wieder erholt.",
      kicker: "Die eigentliche Lebensqualität",
      headline: "Nicht ein perfekter Rücken – ein Rücken mit Reserven.",
      lead: "Einer, der auch mal ein bisschen Schaden nimmt und sich gut wieder erholt. Das ist das Polster, das wir bauen.",
    },
  ],
};

// ── Abschnitt 5 – Die drei Phasen nach Modul 2 ───────────────────────────────

const abschnitt5: SourceSection = {
  title: "Die drei Phasen nach Modul 2",
  narration:
    "Wie sieht die Reise nach Modul 2 langfristig aus? Drei Phasen, die du grob erwarten kannst. Phase 1 – Aufbau. Die ersten drei bis sechs Monate. Hier baust du grundlegende Belastbarkeit auf. Du machst regelmäßig Bewegungsroutinen – Mobilisation, Stabilisation, Belastungstoleranz. Du machst sie nicht maximal, aber konsequent. In dieser Phase verändert sich am meisten – sowohl in deiner Belastbarkeit als auch in deinem Vertrauen. Phase 2 – Stabilisierung. Die nächsten sechs bis zwölf Monate. Hier konsolidierst du, was du aufgebaut hast. Du integrierst die Routinen tiefer in deinen Alltag, du erweiterst dein Bewegungs-Repertoire um Dinge, die dir Spaß machen – einen Sport, ein Wanderhobby, einen Klettergarten. Hier wird Bewegung von Therapie zu Lebensbestandteil. Phase 3 – Erhaltung und Weiterentwicklung. Ab Jahr zwei. Du brauchst nicht mehr alle Übungen der Masterclass. Du hast deine Lieblings-Übungen und deine Lieblings-Bewegungsformen gefunden. Du forderst dich weiter, weil du gemerkt hast, dass Forderung zu Wachstum führt. Du machst regelmäßig Bewegung, die anstrengt, und die Freude macht. Wichtig: Diese Phasen sind nicht linear. Du wirst Wochen haben, in denen die Belastbarkeit zurückgeht – durch eine Krankheit, eine Lebensphase, einen Umzug. Das ist normal. Wenn du den Modus der antifragilen Belastung beibehältst, kommen die Reserven schnell zurück.",
  slides: [
    {
      type: "content",
      seg: "Wie sieht die Reise nach Modul 2 langfristig aus? Drei Phasen, die du grob erwarten kannst.",
      kicker: "Die Reise nach Modul 2",
      headline: "Drei Phasen, die du grob erwarten kannst.",
    },
    {
      type: "content",
      seg: " Phase 1 – Aufbau. Die ersten drei bis sechs Monate. Hier baust du grundlegende Belastbarkeit auf. Du machst regelmäßig Bewegungsroutinen – Mobilisation, Stabilisation, Belastungstoleranz. Du machst sie nicht maximal, aber konsequent. In dieser Phase verändert sich am meisten – sowohl in deiner Belastbarkeit als auch in deinem Vertrauen.",
      kicker: "Phase 1 · Aufbau · 0–6 Monate",
      headline: "Grundlegende Belastbarkeit aufbauen – nicht maximal, aber konsequent.",
      lead: "Regelmäßige Routinen: Mobilisation, Stabilisation, Belastungstoleranz. Hier verändert sich am meisten – Belastbarkeit und Vertrauen.",
    },
    {
      type: "content",
      seg: " Phase 2 – Stabilisierung. Die nächsten sechs bis zwölf Monate. Hier konsolidierst du, was du aufgebaut hast. Du integrierst die Routinen tiefer in deinen Alltag, du erweiterst dein Bewegungs-Repertoire um Dinge, die dir Spaß machen – einen Sport, ein Wanderhobby, einen Klettergarten. Hier wird Bewegung von Therapie zu Lebensbestandteil.",
      kicker: "Phase 2 · Stabilisierung · 6–12 Monate",
      headline: "Bewegung wird von Therapie zu Lebensbestandteil.",
      lead: "Routinen tiefer integrieren, das Repertoire um Dinge erweitern, die Spaß machen – ein Sport, ein Wanderhobby, ein Klettergarten.",
    },
    {
      type: "content",
      seg: " Phase 3 – Erhaltung und Weiterentwicklung. Ab Jahr zwei. Du brauchst nicht mehr alle Übungen der Masterclass. Du hast deine Lieblings-Übungen und deine Lieblings-Bewegungsformen gefunden. Du forderst dich weiter, weil du gemerkt hast, dass Forderung zu Wachstum führt. Du machst regelmäßig Bewegung, die anstrengt, und die Freude macht.",
      kicker: "Phase 3 · Erhaltung · ab Jahr zwei",
      headline: "Bewegung, die anstrengt – und die Freude macht.",
      lead: "Du brauchst nicht mehr alle Übungen. Du hast deine Lieblingsformen gefunden und forderst dich weiter, weil Forderung zu Wachstum führt.",
    },
    {
      type: "statement",
      seg: " Wichtig: Diese Phasen sind nicht linear. Du wirst Wochen haben, in denen die Belastbarkeit zurückgeht – durch eine Krankheit, eine Lebensphase, einen Umzug. Das ist normal. Wenn du den Modus der antifragilen Belastung beibehältst, kommen die Reserven schnell zurück.",
      text: "Die Phasen sind nicht linear. Bleibst du im antifragilen Modus, kommen die Reserven schnell zurück.",
      emphasis: "nicht linear",
    },
  ],
};

// ── Abschnitt 6 – Mein-Rücken-fürs-Leben-Mindset ─────────────────────────────

const abschnitt6: SourceSection = {
  title: "Mein-Rücken-fürs-Leben-Mindset",
  narration:
    "Eine letzte Idee für diese Lektion, die Max Glawe Patienten mitgeben möchte. Es gibt einen mentalen Schalter, der bei vielen Menschen mit chronischem Schmerz lange im falschen Modus stand: Ich kümmere mich um meinen Rücken, wenn er Probleme macht. Symptomgetriebene Pflege. Reaktiv. Der neue Modus, der dich von hier an begleiten sollte: Ich kümmere mich um meinen Rücken, weil ich ihn jeden Tag brauche. Proaktiv. Routinemäßig. Selbstverständlich. Das ist ein bisschen wie Zähne putzen. Du putzt nicht erst, wenn du Karies hast. Du putzt jeden Tag, damit du keine Karies bekommst. Du würdest nie auf die Idee kommen, das Zähneputzen für drei Wochen auszusetzen, weil deine Zähne gerade gut sind. Genauso dein Rücken. Nicht therapeutische Maßnahmen, weil ich Probleme habe, sondern Routinen, weil ich gesund bleiben will. Diese kleine Mindset-Verschiebung ist die nachhaltigste Veränderung der ganzen Masterclass.",
  slides: [
    {
      type: "content",
      seg: "Eine letzte Idee für diese Lektion, die Max Glawe Patienten mitgeben möchte. Es gibt einen mentalen Schalter, der bei vielen Menschen mit chronischem Schmerz lange im falschen Modus stand: Ich kümmere mich um meinen Rücken, wenn er Probleme macht. Symptomgetriebene Pflege. Reaktiv.",
      dark: true,
      kicker: "Der alte Modus · reaktiv",
      headline: "„Ich kümmere mich um meinen Rücken, wenn er Probleme macht.“",
      lead: "Ein mentaler Schalter, der lange im falschen Modus stand: symptomgetriebene Pflege. Reaktiv.",
    },
    {
      type: "content",
      seg: " Der neue Modus, der dich von hier an begleiten sollte: Ich kümmere mich um meinen Rücken, weil ich ihn jeden Tag brauche. Proaktiv. Routinemäßig. Selbstverständlich.",
      kicker: "Der neue Modus · proaktiv",
      headline: "„Ich kümmere mich um meinen Rücken, weil ich ihn jeden Tag brauche.“",
      lead: "Proaktiv. Routinemäßig. Selbstverständlich.",
    },
    {
      type: "content",
      seg: " Das ist ein bisschen wie Zähne putzen. Du putzt nicht erst, wenn du Karies hast. Du putzt jeden Tag, damit du keine Karies bekommst. Du würdest nie auf die Idee kommen, das Zähneputzen für drei Wochen auszusetzen, weil deine Zähne gerade gut sind.",
      kicker: "Das Bild · Zähneputzen",
      headline: "Du putzt jeden Tag, damit du keine Karies bekommst – nicht erst, wenn du sie hast.",
      lead: "Du würdest das Zähneputzen nie für drei Wochen aussetzen, weil deine Zähne gerade gut sind.",
    },
    {
      type: "statement",
      seg: " Genauso dein Rücken. Nicht therapeutische Maßnahmen, weil ich Probleme habe, sondern Routinen, weil ich gesund bleiben will. Diese kleine Mindset-Verschiebung ist die nachhaltigste Veränderung der ganzen Masterclass.",
      text: "Rückenpflege wie Zähneputzen: Routine, weil du gesund bleiben willst – nicht Reaktion auf Probleme.",
      emphasis: "Routine, nicht Reaktion",
    },
  ],
};

// ── Abschnitt 7 – Workbook und Übergang ──────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 3.1: Meine Belastbarkeits-Vision. Du beschreibst dort drei Bilder davon, wie dein Leben in zwei Jahren aussehen soll, wenn du belastbar bist. Was kann ich tun, was ich aktuell nicht kann? Welche Aktivität würde mir am meisten Freude machen, wenn ich sie ohne Sorge tun könnte? Wie sähe ein perfekter Sonntag aus, wenn mein Rücken keine Begrenzung mehr wäre? Plus eine kurze Plan-Skizze: Was sind die drei nächsten Schritte – nicht in zwei Jahren, sondern in den nächsten drei Monaten – die dich Richtung dieser Vision bewegen? In der nächsten Lektion – 3.2 – räumen wir mit Haltungs-Mythen auf. Du hast in deinem Leben vermutlich oft gehört, was du falsch machst – krummer Sitz, Hängeschultern, Hohlkreuz. Wir schauen uns an, was davon stimmt und was reine Tradition ohne Evidenz ist. Und was wirklich zählt. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 3.1: Meine Belastbarkeits-Vision. Du beschreibst dort drei Bilder davon, wie dein Leben in zwei Jahren aussehen soll, wenn du belastbar bist. Was kann ich tun, was ich aktuell nicht kann? Welche Aktivität würde mir am meisten Freude machen, wenn ich sie ohne Sorge tun könnte? Wie sähe ein perfekter Sonntag aus, wenn mein Rücken keine Begrenzung mehr wäre?",
      kicker: "Workbook · Übung 3.1",
      headline: "Meine Belastbarkeits-Vision – drei Bilder von deinem Leben in zwei Jahren.",
      lead: "Was kann ich dann tun, was ich heute nicht kann? Welche Aktivität würde mir am meisten Freude machen? Wie sähe ein perfekter Sonntag ohne Begrenzung aus?",
    },
    {
      type: "content",
      seg: " Plus eine kurze Plan-Skizze: Was sind die drei nächsten Schritte – nicht in zwei Jahren, sondern in den nächsten drei Monaten – die dich Richtung dieser Vision bewegen?",
      kicker: "Plus · Plan-Skizze",
      headline: "Drei nächste Schritte – nicht in zwei Jahren, in den nächsten drei Monaten.",
      lead: "Was bewegt dich konkret Richtung dieser Vision?",
    },
    {
      type: "content",
      seg: " In der nächsten Lektion – 3.2 – räumen wir mit Haltungs-Mythen auf. Du hast in deinem Leben vermutlich oft gehört, was du falsch machst – krummer Sitz, Hängeschultern, Hohlkreuz. Wir schauen uns an, was davon stimmt und was reine Tradition ohne Evidenz ist. Und was wirklich zählt.",
      kicker: "Als Nächstes · Lektion 3.2",
      headline: "Haltungs-Mythen entzaubert – krummer Sitz, Hängeschultern, Hohlkreuz.",
      lead: "Was davon stimmt, was reine Tradition ohne Evidenz ist – und was wirklich zählt.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 3.2",
      nextTitle: "Haltungs-Mythen entzaubert",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "3.1",
  title: "Belastbarkeit statt Schonung",
  subtitle: "Modul 3 – Prävention · Der zentrale Mindset-Shift",
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
