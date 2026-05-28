/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 4.5
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/4.5.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 4.5`). Niemals lessons/4.5.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Vorletzte Lektion von Modul 4 (Recoping): das Flare-up-Protokoll. Während 4.4 das
 * intraday-Mitgehen bei schwankendem Schmerz lehrt, geht es hier um den richtigen
 * Schub – einen Flare, der mehrere Tage hält. Das Protokoll hat VIER PHASEN mit
 * klaren Aufgaben und Übergangs-Kriterien. Themenblöcke / Slide-Gruppen klar
 * getrennt:
 *   - Eröffnung:                    Abschnitt 1 (was ein Flare ist, Vier-Phasen-Übersicht).
 *   - Phase 1 · Acute (24–72h):     Abschnitt 2 (Ziele, Werkzeuge, Stoppliste, Übergang).
 *   - Phase 2 · Recovery (3–10 T.): Abschnitt 3 (Mikro-Routinen reizarm, Gehen, Schlaf).
 *   - Phase 3 · Return (5–14 T.):   Abschnitt 4 (drei Stufen, nicht überspringen).
 *   - Phase 4 · Reflect:            Abschnitt 5 (vier Reflexions-Fragen).
 *   - Wann ärztlich abklären:       Abschnitt 6 (drei Warnsituationen — HWG / MD-Wortlaut).
 *   - Workbook + Übergang:          Abschnitt 7 (Übung 4.5, Ausblick 4.6).
 *
 * Aufbau identisch zu 4.1 / 4.2 / 4.3 / 4.4:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt; Aufzählungspunkte/Beispiele zu Fließtext verdichtet).
 *     EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–7) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die Meta-Tabelle der MD werden NICHT vertont. Die
 * Workbook-Übung 4.5 selbst (Vorlage zum Ausfüllen) ist ein separates Werkzeug —
 * hier wird nur die vertonte ANLEITUNG/ERKLÄRUNG dazu produziert.
 *
 * 3.-PERSON-REGEL (angewandt): Der Lektions-/Protokoll-Titel „Mein Flare-up-
 * Protokoll" ist ein PROTOKOLL-NAME und bleibt. Eine Stelle mit persönlichem
 * Ersteller-Ich (kein generischer Guide-„wir") wurde auf „Max Glawe" umgeschrieben:
 *   - MD: „Das Protokoll, das ich heute vorstelle, hat vier Phasen …"
 *     → „Das Protokoll, das Max Glawe hier vorstellt, hat vier Phasen …"
 *   Die generische Guide-/Du-Form bleibt unverändert.
 *
 * HWG: Wortlaut der MD wird – außer der 3.-Person-Umschreibung – beibehalten. Das
 *   Flare-up-Protokoll ist als Selbstmanagement-/Orientierungs-Werkzeug formuliert,
 *   NICHT als medizinisches Heilversprechen. Der MD-Wortlaut zur ärztlichen
 *   Abklärung (Red Flags, Schmerzmittel-Hinweis „Bei Unsicherheit Hausarzt
 *   befragen", „nicht länger als 2–3 Tage", psychische Krise) bleibt EXAKT erhalten.
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
    "Willkommen zu Lektion 4.5. Diese Lektion ist eine, die du hoffentlich selten brauchst – aber wenn du sie brauchst, musst du wissen, was zu tun ist. Heute geht es um den Flare-up. Den Schub. Den Moment, an dem trotz aller Sorgfalt der Schmerz plötzlich deutlich höher ist und mehrere Tage hält. Das passiert auch bei guter Selbstpflege. Manchmal weiß man warum – zu viel Belastung, schlechter Schlaf, Stressphase. Manchmal weiß man es nicht. Beides ist okay. Was nicht okay ist: ohne Plan in einen Flare reinzustolpern. Wer ohne Plan ist, fällt oft in alte Muster: Schonung, Angst, Selbstzweifel, Therapie-Abbruch. Genau das verhindert ein gutes Flare-up-Protokoll. Das Protokoll, das Max Glawe hier vorstellt, hat vier Phasen: Acute, Recovery, Return, Reflect. Jede Phase hat klare Aufgaben und klare Übergangs-Kriterien. Du wirst es im Workbook nachbauen können.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 4 – Recoping",
      lessonLabel: "Lektion 4.5 – Mein Flare-up-Protokoll: Vier Phasen",
    },
    {
      type: "content",
      seg: "Willkommen zu Lektion 4.5. Diese Lektion ist eine, die du hoffentlich selten brauchst – aber wenn du sie brauchst, musst du wissen, was zu tun ist.",
      kicker: "Selten gebraucht – aber wichtig",
      headline: "Eine Lektion, die du hoffentlich selten brauchst.",
      lead: "Aber wenn du sie brauchst, musst du wissen, was zu tun ist.",
    },
    {
      type: "content",
      seg: " Heute geht es um den Flare-up. Den Schub. Den Moment, an dem trotz aller Sorgfalt der Schmerz plötzlich deutlich höher ist und mehrere Tage hält. Das passiert auch bei guter Selbstpflege. Manchmal weiß man warum – zu viel Belastung, schlechter Schlaf, Stressphase. Manchmal weiß man es nicht. Beides ist okay.",
      kicker: "Der Flare-up",
      headline: "Der Schub – der Schmerz ist plötzlich deutlich höher und hält mehrere Tage.",
      lead: "Das passiert auch bei guter Selbstpflege. Manchmal weißt du warum – Belastung, Schlaf, Stress. Manchmal nicht. Beides ist okay.",
    },
    {
      type: "content",
      seg: " Was nicht okay ist: ohne Plan in einen Flare reinzustolpern. Wer ohne Plan ist, fällt oft in alte Muster: Schonung, Angst, Selbstzweifel, Therapie-Abbruch. Genau das verhindert ein gutes Flare-up-Protokoll.",
      dark: true,
      kicker: "Ohne Plan",
      headline: "Ohne Plan fällst du in alte Muster: Schonung, Angst, Selbstzweifel, Abbruch.",
      lead: "Genau das verhindert ein gutes Flare-up-Protokoll.",
    },
    {
      type: "reveal-list",
      seg: " Das Protokoll, das Max Glawe hier vorstellt, hat vier Phasen: Acute, Recovery, Return, Reflect. Jede Phase hat klare Aufgaben und klare Übergangs-Kriterien. Du wirst es im Workbook nachbauen können.",
      kicker: "Das Protokoll · Vier Phasen",
      title: "Acute · Recovery · Return · Reflect",
      items: [
        { label: "Acute – die Eskalation stoppen" },
        { label: "Recovery – kontrolliert zurückkommen" },
        { label: "Return – schrittweise zur Normal-Belastung" },
        { label: "Reflect – aus dem Flare lernen" },
      ],
    },
  ],
};

// ── Abschnitt 2 – Phase 1: Acute (24–72 Stunden) ─────────────────────────────

const abschnitt2: SourceSection = {
  title: "Phase 1 · Acute (24–72 Stunden)",
  narration:
    "Phase 1: Acute. Das sind die ersten 24 bis 72 Stunden eines Flares. Der Schmerz ist hoch, vielleicht in einem Bereich, den du seit Monaten nicht hattest. Was sind die Ziele in dieser Phase? Drei Dinge. Erstens: Die Schmerzeskalation stoppen. Nicht heilen – stoppen. Zweitens: Dein Nervensystem beruhigen. Stress reduzieren. Drittens: Vermeiden, dass aus dem Flare-up eine Chronifizierungs-Verstärkung wird. Was du machst: Bewegung sehr sanft. Du machst keine dedizierten Trainings-Einheiten. Du machst auch nicht deine Belastungs-Schiene. Was du machst: Mikro-Mobilisation – Knee-to-Chest, sanftes Cat-Cow, kleine Pelvic Tilts. Maximal drei- bis viermal am Tag, jeweils zwei bis drei Minuten. Das ist das Volumen. Mehr nicht. Atmung: Box Breathing drei- bis viermal täglich für fünf bis zehn Minuten. Das ist jetzt dein wichtigstes Werkzeug. Es senkt den Stress-Schmerz-Anteil messbar. Lass das nicht ausfallen, auch wenn du keine Lust hast. Wärme kann sehr helfen. Wärmflasche, Wärmepflaster, warmes Bad. Wärme entspannt die muskulären Strukturen und beruhigt das Nervensystem. Vorsicht bei Wärmflaschen direkt auf der Haut, immer ein Tuch dazwischen. Pausenrhythmus: Du darfst mehr ruhen in dieser Phase. Aber nicht stillgelegt. Nicht 24 Stunden im Bett. Stattdessen: alle ein bis zwei Stunden mal aufstehen, kurz gehen, dich strecken. Selbst wenn nur 30 Sekunden – das ist wichtig, um nicht in komplette Schonung zu kippen. Schmerzmittel: Wenn du sonst keine nimmst, ist eine kurze Anwendung von rezeptfreien Schmerzmitteln, Ibuprofen oder Paracetamol, in dieser Phase oft sinnvoll, um aus dem Schmerz-Stress-Kreislauf rauszukommen. Dosierung gemäß Beipackzettel, nicht länger als zwei bis drei Tage. Bei Unsicherheit Hausarzt befragen. Was du nicht machst: Kein Stabilisationstraining. Kein Krafttraining. Keine Joggingrunde. Kein Schwimmen. Kein verkrampftes Üben. Du gibst dem System Sicherheit – nicht weitere Belastung. Übergangs-Kriterium zu Phase 2: Wenn der Schmerz vom Spitzenwert spürbar nachgelassen hat – sagen wir, von acht von zehn auf fünf bis sechs von zehn – und mehr als 24 Stunden nicht weiter eskaliert ist, gehst du in Phase 2.",
  slides: [
    {
      type: "content",
      seg: "Phase 1: Acute. Das sind die ersten 24 bis 72 Stunden eines Flares. Der Schmerz ist hoch, vielleicht in einem Bereich, den du seit Monaten nicht hattest.",
      kicker: "Phase 1 · Acute · 24–72 Stunden",
      headline: "Die ersten 24 bis 72 Stunden eines Flares.",
      lead: "Der Schmerz ist hoch, vielleicht in einem Bereich, den du seit Monaten nicht hattest.",
    },
    {
      type: "reveal-list",
      seg: " Was sind die Ziele in dieser Phase? Drei Dinge. Erstens: Die Schmerzeskalation stoppen. Nicht heilen – stoppen. Zweitens: Dein Nervensystem beruhigen. Stress reduzieren. Drittens: Vermeiden, dass aus dem Flare-up eine Chronifizierungs-Verstärkung wird.",
      kicker: "Phase 1 · die Ziele",
      title: "Drei Dinge in dieser Phase",
      items: [
        { label: "Die Schmerzeskalation stoppen – nicht heilen, stoppen" },
        { label: "Das Nervensystem beruhigen, Stress reduzieren" },
        { label: "Verhindern, dass der Flare die Chronifizierung verstärkt" },
      ],
    },
    {
      type: "content",
      seg: " Was du machst: Bewegung sehr sanft. Du machst keine dedizierten Trainings-Einheiten. Du machst auch nicht deine Belastungs-Schiene. Was du machst: Mikro-Mobilisation – Knee-to-Chest, sanftes Cat-Cow, kleine Pelvic Tilts. Maximal drei- bis viermal am Tag, jeweils zwei bis drei Minuten. Das ist das Volumen. Mehr nicht.",
      kicker: "Phase 1 · Bewegung",
      headline: "Bewegung sehr sanft: nur Mikro-Mobilisation, kein dediziertes Training.",
      lead: "Knee-to-Chest, sanftes Cat-Cow, kleine Pelvic Tilts. Maximal drei- bis viermal am Tag, je zwei bis drei Minuten. Das ist das Volumen. Mehr nicht.",
    },
    {
      type: "content",
      seg: " Atmung: Box Breathing drei- bis viermal täglich für fünf bis zehn Minuten. Das ist jetzt dein wichtigstes Werkzeug. Es senkt den Stress-Schmerz-Anteil messbar. Lass das nicht ausfallen, auch wenn du keine Lust hast.",
      kicker: "Phase 1 · Atmung",
      headline: "Box Breathing ist jetzt dein wichtigstes Werkzeug.",
      lead: "Drei- bis viermal täglich, fünf bis zehn Minuten. Es senkt den Stress-Schmerz-Anteil messbar. Lass das nicht ausfallen, auch wenn du keine Lust hast.",
    },
    {
      type: "content",
      seg: " Wärme kann sehr helfen. Wärmflasche, Wärmepflaster, warmes Bad. Wärme entspannt die muskulären Strukturen und beruhigt das Nervensystem. Vorsicht bei Wärmflaschen direkt auf der Haut, immer ein Tuch dazwischen.",
      kicker: "Phase 1 · Wärme",
      headline: "Wärme entspannt die Muskulatur und beruhigt das Nervensystem.",
      lead: "Wärmflasche, Wärmepflaster, warmes Bad. Vorsicht bei Wärmflaschen direkt auf der Haut – immer ein Tuch dazwischen.",
    },
    {
      type: "content",
      seg: " Pausenrhythmus: Du darfst mehr ruhen in dieser Phase. Aber nicht stillgelegt. Nicht 24 Stunden im Bett. Stattdessen: alle ein bis zwei Stunden mal aufstehen, kurz gehen, dich strecken. Selbst wenn nur 30 Sekunden – das ist wichtig, um nicht in komplette Schonung zu kippen.",
      kicker: "Phase 1 · Pausenrhythmus",
      headline: "Mehr ruhen ist erlaubt – aber nicht stillgelegt.",
      lead: "Nicht 24 Stunden im Bett. Alle ein bis zwei Stunden aufstehen, kurz gehen, strecken. Selbst 30 Sekunden helfen, nicht in komplette Schonung zu kippen.",
    },
    {
      type: "content",
      seg: " Schmerzmittel: Wenn du sonst keine nimmst, ist eine kurze Anwendung von rezeptfreien Schmerzmitteln, Ibuprofen oder Paracetamol, in dieser Phase oft sinnvoll, um aus dem Schmerz-Stress-Kreislauf rauszukommen. Dosierung gemäß Beipackzettel, nicht länger als zwei bis drei Tage. Bei Unsicherheit Hausarzt befragen.",
      kicker: "Phase 1 · Schmerzmittel",
      headline: "Eine kurze Anwendung kann aus dem Schmerz-Stress-Kreislauf helfen.",
      lead: "Rezeptfrei, Ibuprofen oder Paracetamol. Dosierung gemäß Beipackzettel, nicht länger als zwei bis drei Tage. Bei Unsicherheit Hausarzt befragen.",
    },
    {
      type: "anti-list",
      seg: " Was du nicht machst: Kein Stabilisationstraining. Kein Krafttraining. Keine Joggingrunde. Kein Schwimmen. Kein verkrampftes Üben. Du gibst dem System Sicherheit – nicht weitere Belastung.",
      title: "Was du nicht machst – nicht in der Acute-Phase",
      items: [
        { label: "Kein Stabilisationstraining" },
        { label: "Kein Krafttraining" },
        { label: "Keine Joggingrunde" },
        { label: "Kein Schwimmen" },
        { label: "Kein verkrampftes Üben" },
      ],
    },
    {
      type: "content",
      seg: " Übergangs-Kriterium zu Phase 2: Wenn der Schmerz vom Spitzenwert spürbar nachgelassen hat – sagen wir, von acht von zehn auf fünf bis sechs von zehn – und mehr als 24 Stunden nicht weiter eskaliert ist, gehst du in Phase 2.",
      kicker: "Phase 1 → Phase 2 · Übergang",
      headline: "Der Spitzenschmerz hat spürbar nachgelassen und ist 24 Stunden stabil.",
      lead: "Von etwa acht auf fünf bis sechs von zehn, mehr als 24 Stunden ohne weitere Eskalation – dann gehst du in Phase 2.",
    },
  ],
};

// ── Abschnitt 3 – Phase 2: Recovery (3–10 Tage) ──────────────────────────────

const abschnitt3: SourceSection = {
  title: "Phase 2 · Recovery (3–10 Tage)",
  narration:
    "Phase 2: Recovery. Diese Phase dauert in der Regel drei bis zehn Tage. Der akute Spitzenschmerz ist vorbei, aber du bist noch nicht zurück auf deinem Normallevel. Was sind die Ziele dieser Phase? Drei. Erstens: Bewegung kontrolliert wieder einführen, ohne erneut zu reizen. Zweitens: Die täglichen Mikro-Routinen wieder aufnehmen. Drittens: Die Botschaft an dein System verstärken: Bewegung ist möglich. Wir kommen zurück. Was du machst: Bewegung – du gehst zurück zu deinen normalen Mikro-Routinen aus deiner Ritual-Map, aber alle in reizarm. Hip Hinge an der Kaffeemaschine? Ja – aber fünf sanfte, nicht zehn in voller Amplitude. Atmung beim Zähneputzen? Ja, wie immer. Box Breathing abends? Definitiv ja. Du bist zurück im Rhythmus deiner Mikro-Routinen. Aber alles eine Schiene tiefer. Atmung: Box Breathing weiterhin täglich. Das ist eine Konstante über alle Phasen. Gehen: Spaziergänge sind sehr empfehlenswert. Klein anfangen – fünf bis zehn Minuten zweimal täglich, in ruhigem Gehtempo. Aufbauen über die Tage. Gehen ist die sicherste Wiedereinstiegsbewegung – es ist niedrig dosiert, gleichmäßig, gut verträglich. Schlaf: Sehr ernst nehmen. Wenn der Schlaf in dieser Phase nicht stimmt, verzögert sich alles. Wochenpläne mit dedizierten Einheiten: Noch nicht. In dieser Phase gibt es noch keine geplanten Trainings-Einheiten. Du baust die Mikro-Routinen wieder auf, das ist das Wichtige. Übergangs-Kriterium zu Phase 3: Wenn du deine Mikro-Routinen drei Tage lang im reizarmen Modus stabil machst, ohne dass der Schmerz wieder anzieht, und du dich generell nahe deinem Normal-Level fühlst – gehst du in Phase 3.",
  slides: [
    {
      type: "content",
      seg: "Phase 2: Recovery. Diese Phase dauert in der Regel drei bis zehn Tage. Der akute Spitzenschmerz ist vorbei, aber du bist noch nicht zurück auf deinem Normallevel.",
      kicker: "Phase 2 · Recovery · 3–10 Tage",
      headline: "Der akute Spitzenschmerz ist vorbei – aber noch nicht zurück auf Normallevel.",
      lead: "Diese Phase dauert in der Regel drei bis zehn Tage.",
    },
    {
      type: "reveal-list",
      seg: " Was sind die Ziele dieser Phase? Drei. Erstens: Bewegung kontrolliert wieder einführen, ohne erneut zu reizen. Zweitens: Die täglichen Mikro-Routinen wieder aufnehmen. Drittens: Die Botschaft an dein System verstärken: Bewegung ist möglich. Wir kommen zurück.",
      kicker: "Phase 2 · die Ziele",
      title: "Drei Ziele in der Recovery",
      items: [
        { label: "Bewegung kontrolliert wieder einführen, ohne erneut zu reizen" },
        { label: "Die täglichen Mikro-Routinen wieder aufnehmen" },
        { label: "Die Botschaft verstärken: Bewegung ist möglich, wir kommen zurück" },
      ],
    },
    {
      type: "content",
      seg: " Was du machst: Bewegung – du gehst zurück zu deinen normalen Mikro-Routinen aus deiner Ritual-Map, aber alle in reizarm. Hip Hinge an der Kaffeemaschine? Ja – aber fünf sanfte, nicht zehn in voller Amplitude. Atmung beim Zähneputzen? Ja, wie immer. Box Breathing abends? Definitiv ja. Du bist zurück im Rhythmus deiner Mikro-Routinen. Aber alles eine Schiene tiefer.",
      kicker: "Phase 2 · Bewegung",
      headline: "Zurück zu deinen Mikro-Routinen – aber alle in reizarm.",
      lead: "Hip Hinge an der Kaffeemaschine: fünf sanfte statt zehn in voller Amplitude. Atmung beim Zähneputzen wie immer, Box Breathing abends. Im Rhythmus, aber eine Schiene tiefer.",
    },
    {
      type: "content",
      seg: " Atmung: Box Breathing weiterhin täglich. Das ist eine Konstante über alle Phasen.",
      kicker: "Phase 2 · Atmung",
      headline: "Box Breathing weiterhin täglich.",
      lead: "Das ist eine Konstante über alle Phasen.",
    },
    {
      type: "content",
      seg: " Gehen: Spaziergänge sind sehr empfehlenswert. Klein anfangen – fünf bis zehn Minuten zweimal täglich, in ruhigem Gehtempo. Aufbauen über die Tage. Gehen ist die sicherste Wiedereinstiegsbewegung – es ist niedrig dosiert, gleichmäßig, gut verträglich.",
      kicker: "Phase 2 · Gehen",
      headline: "Gehen ist die sicherste Wiedereinstiegsbewegung.",
      lead: "Klein anfangen – fünf bis zehn Minuten zweimal täglich, ruhiges Tempo, über die Tage aufbauen. Niedrig dosiert, gleichmäßig, gut verträglich.",
    },
    {
      type: "content",
      seg: " Schlaf: Sehr ernst nehmen. Wenn der Schlaf in dieser Phase nicht stimmt, verzögert sich alles. Wochenpläne mit dedizierten Einheiten: Noch nicht. In dieser Phase gibt es noch keine geplanten Trainings-Einheiten. Du baust die Mikro-Routinen wieder auf, das ist das Wichtige.",
      kicker: "Phase 2 · Schlaf & Training",
      headline: "Schlaf sehr ernst nehmen – dedizierte Einheiten noch nicht.",
      lead: "Stimmt der Schlaf nicht, verzögert sich alles. Geplante Trainings-Einheiten gibt es noch keine. Das Wichtige ist, die Mikro-Routinen wieder aufzubauen.",
    },
    {
      type: "statement",
      seg: "",
      text: "Bewegung ist möglich. Wir kommen zurück.",
      emphasis: "Wir kommen zurück",
    },
    {
      type: "content",
      seg: " Übergangs-Kriterium zu Phase 3: Wenn du deine Mikro-Routinen drei Tage lang im reizarmen Modus stabil machst, ohne dass der Schmerz wieder anzieht, und du dich generell nahe deinem Normal-Level fühlst – gehst du in Phase 3.",
      kicker: "Phase 2 → Phase 3 · Übergang",
      headline: "Drei Tage Mikro-Routinen stabil in reizarm, nahe deinem Normal-Level.",
      lead: "Wenn der Schmerz dabei nicht wieder anzieht und du dich generell nahe deinem Normal-Level fühlst, gehst du in Phase 3.",
    },
  ],
};

// ── Abschnitt 4 – Phase 3: Return (5–14 Tage) ────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Phase 3 · Return (mehrere Tage)",
  narration:
    "Phase 3: Return. Diese Phase ist die schrittweise Rückkehr zu deiner Normal-Belastung. Sie dauert typischerweise zwischen fünf und vierzehn Tagen – je nachdem, wie schwer der Flare war. Was sind die Ziele? Zwei. Erstens: Schrittweise Rückkehr zu deinem normalen Trainings- und Bewegungsniveau. Zweitens: Vermeiden, zu schnell zu gehen – einer der häufigsten Fehler nach Flares ist, direkt nach Recovery wieder Vollgas zu geben. Das Prinzip: Drei Stufen, jede mehrere Tage. Stufe eins, mehrere Tage: Mikro-Routinen jetzt in Standard-Schiene. Erste kleine dedizierte Einheit pro Woche: zehn bis fünfzehn Minuten Mobilisation. Spaziergänge weiterhin täglich. Krafttraining noch nicht. Stufe zwei, mehrere Tage: Standard-Mikro-Routinen weiter. Zwei dedizierte Einheiten pro Woche: eine Mobilisation, eine sanfte Stabilisation. Längere Spaziergänge. Eventuell schon mal eine belastende Mikro-Übung an guten Tagen. Stufe drei, mehrere Tage: Volle Wochenroutine, alle Schienen verfügbar, aber: noch eine Woche zurückhaltender als vor dem Flare. Erst dann ist normal wieder normal. Diese Stufenfolge ist nicht in Tagen festgenagelt – sie ist gefühlsabhängig. Wenn sich Stufe eins nach drei Tagen stabil anfühlt, gehst du in Stufe zwei. Wenn nicht, bleibst du in Stufe eins. Ein häufiger Fehler in dieser Phase: Sobald es deutlich besser geht, will man zurück zum Vorflarestand springen. Endlich wieder normal. Aber Phase 3 will man nicht überspringen. Wer das tut, hat eine sehr hohe Wahrscheinlichkeit, einen erneuten Flare zu provozieren. Geduld in dieser Phase ist eine Investition. Übergangs-Kriterium zu Phase 4: Wenn du mindestens sieben Tage lang dein normales Wochensystem stabil durchführst, ohne dass etwas wieder hochkommt – bist du raus aus dem Flare. Du gehst in Phase 4.",
  slides: [
    {
      type: "content",
      seg: "Phase 3: Return. Diese Phase ist die schrittweise Rückkehr zu deiner Normal-Belastung. Sie dauert typischerweise zwischen fünf und vierzehn Tagen – je nachdem, wie schwer der Flare war.",
      kicker: "Phase 3 · Return · 5–14 Tage",
      headline: "Die schrittweise Rückkehr zu deiner Normal-Belastung.",
      lead: "Typischerweise zwischen fünf und vierzehn Tagen – je nachdem, wie schwer der Flare war.",
    },
    {
      type: "reveal-list",
      seg: " Was sind die Ziele? Zwei. Erstens: Schrittweise Rückkehr zu deinem normalen Trainings- und Bewegungsniveau. Zweitens: Vermeiden, zu schnell zu gehen – einer der häufigsten Fehler nach Flares ist, direkt nach Recovery wieder Vollgas zu geben.",
      kicker: "Phase 3 · die Ziele",
      title: "Zwei Ziele im Return",
      items: [
        { label: "Schrittweise Rückkehr zum normalen Trainings- und Bewegungsniveau" },
        { label: "Nicht zu schnell gehen – direkt nach Recovery Vollgas ist ein häufiger Fehler" },
      ],
    },
    {
      type: "content",
      seg: " Das Prinzip: Drei Stufen, jede mehrere Tage. Stufe eins, mehrere Tage: Mikro-Routinen jetzt in Standard-Schiene. Erste kleine dedizierte Einheit pro Woche: zehn bis fünfzehn Minuten Mobilisation. Spaziergänge weiterhin täglich. Krafttraining noch nicht.",
      kicker: "Phase 3 · Stufe 1",
      headline: "Stufe 1 – Mikro-Routinen in Standard, eine kleine Einheit pro Woche.",
      lead: "Zehn bis fünfzehn Minuten Mobilisation, Spaziergänge weiterhin täglich. Krafttraining noch nicht.",
    },
    {
      type: "content",
      seg: " Stufe zwei, mehrere Tage: Standard-Mikro-Routinen weiter. Zwei dedizierte Einheiten pro Woche: eine Mobilisation, eine sanfte Stabilisation. Längere Spaziergänge. Eventuell schon mal eine belastende Mikro-Übung an guten Tagen.",
      kicker: "Phase 3 · Stufe 2",
      headline: "Stufe 2 – zwei Einheiten pro Woche, eine sanfte Stabilisation dabei.",
      lead: "Standard-Mikro-Routinen weiter, eine Mobilisation und eine sanfte Stabilisation, längere Spaziergänge. An guten Tagen schon mal eine belastende Mikro-Übung.",
    },
    {
      type: "content",
      seg: " Stufe drei, mehrere Tage: Volle Wochenroutine, alle Schienen verfügbar, aber: noch eine Woche zurückhaltender als vor dem Flare. Erst dann ist normal wieder normal.",
      kicker: "Phase 3 · Stufe 3",
      headline: "Stufe 3 – volle Wochenroutine, aber noch eine Woche zurückhaltender.",
      lead: "Alle Schienen wieder verfügbar. Erst nach dieser zurückhaltenden Woche ist normal wieder normal.",
    },
    {
      type: "content",
      seg: " Diese Stufenfolge ist nicht in Tagen festgenagelt – sie ist gefühlsabhängig. Wenn sich Stufe eins nach drei Tagen stabil anfühlt, gehst du in Stufe zwei. Wenn nicht, bleibst du in Stufe eins.",
      kicker: "Phase 3 · gefühlsabhängig",
      headline: "Die Stufenfolge ist nicht in Tagen festgenagelt – sie ist gefühlsabhängig.",
      lead: "Fühlt sich Stufe eins nach drei Tagen stabil an, gehst du in Stufe zwei. Wenn nicht, bleibst du in Stufe eins.",
    },
    {
      type: "content",
      seg: " Ein häufiger Fehler in dieser Phase: Sobald es deutlich besser geht, will man zurück zum Vorflarestand springen. Endlich wieder normal. Aber Phase 3 will man nicht überspringen. Wer das tut, hat eine sehr hohe Wahrscheinlichkeit, einen erneuten Flare zu provozieren. Geduld in dieser Phase ist eine Investition.",
      dark: true,
      kicker: "Phase 3 · der häufige Fehler",
      headline: "Sobald es besser geht, will man zurück zum Vorflarestand springen.",
      lead: "Aber Phase 3 überspringt man nicht. Wer das tut, provoziert mit hoher Wahrscheinlichkeit einen erneuten Flare. Geduld in dieser Phase ist eine Investition.",
    },
    {
      type: "statement",
      seg: "",
      text: "Phase 3 nicht überspringen. Das ist die häufigste Falle nach Flares.",
      emphasis: "nicht überspringen",
    },
    {
      type: "content",
      seg: " Übergangs-Kriterium zu Phase 4: Wenn du mindestens sieben Tage lang dein normales Wochensystem stabil durchführst, ohne dass etwas wieder hochkommt – bist du raus aus dem Flare. Du gehst in Phase 4.",
      kicker: "Phase 3 → Phase 4 · Übergang",
      headline: "Mindestens sieben Tage normales Wochensystem stabil – dann bist du raus.",
      lead: "Wenn dabei nichts wieder hochkommt, bist du raus aus dem Flare und gehst in Phase 4.",
    },
  ],
};

// ── Abschnitt 5 – Phase 4: Reflect ───────────────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Phase 4 · Reflect",
  narration:
    "Phase 4: Reflect. Eine sehr wichtige, oft vergessene Phase. Du hast den Flare hinter dir. Bevor du den Vorfall vergisst und in Normalbetrieb gehst, mach eine Reflexion. Vier Fragen, die du dir stellst – und im Workbook notierst. Erstens: Was war wahrscheinlich der Auslöser? Stress, Schlafmangel, körperliche Überlastung, eine bestimmte Bewegung – oder eine Kombination? Sei ehrlich, ohne dich selbst zu beschuldigen. Zweitens: Welche Vorboten hatte ich – die ich rückblickend hätte erkennen können? Schaue zurück auf die Tage vor dem Flare. Was war anders? Schlechter Schlaf, mehr Spannung, gereizte Stimmung? Drittens: Hat mein Flare-Protokoll gut funktioniert? Wo musste ich improvisieren? Was würde ich beim nächsten Mal anders machen? Viertens: Was nehme ich für mein zukünftiges System mit? Vielleicht eine zusätzliche Routine, ein Vorbote-Detail das du jetzt klarer siehst, eine Risiko-Situation, die du besser planen willst. Diese Reflexion macht den Unterschied zwischen Flare als isoliertes Ereignis und Flare als Lerngelegenheit. Wer reflektiert, baut Resilienz Schritt für Schritt auf. Wer nur durchstolpert, lernt weniger.",
  slides: [
    {
      type: "content",
      seg: "Phase 4: Reflect. Eine sehr wichtige, oft vergessene Phase. Du hast den Flare hinter dir. Bevor du den Vorfall vergisst und in Normalbetrieb gehst, mach eine Reflexion.",
      kicker: "Phase 4 · Reflect",
      headline: "Bevor du den Flare vergisst und in Normalbetrieb gehst: reflektiere.",
      lead: "Eine sehr wichtige, oft vergessene Phase. Du hast den Flare hinter dir.",
    },
    {
      type: "reveal-list",
      seg: " Vier Fragen, die du dir stellst – und im Workbook notierst. Erstens: Was war wahrscheinlich der Auslöser? Stress, Schlafmangel, körperliche Überlastung, eine bestimmte Bewegung – oder eine Kombination? Sei ehrlich, ohne dich selbst zu beschuldigen. Zweitens: Welche Vorboten hatte ich – die ich rückblickend hätte erkennen können? Schaue zurück auf die Tage vor dem Flare. Was war anders? Schlechter Schlaf, mehr Spannung, gereizte Stimmung? Drittens: Hat mein Flare-Protokoll gut funktioniert? Wo musste ich improvisieren? Was würde ich beim nächsten Mal anders machen? Viertens: Was nehme ich für mein zukünftiges System mit? Vielleicht eine zusätzliche Routine, ein Vorbote-Detail das du jetzt klarer siehst, eine Risiko-Situation, die du besser planen willst.",
      kicker: "Phase 4 · vier Fragen",
      title: "Vier Fragen für deine Reflexion",
      items: [
        { label: "Was war wahrscheinlich der Auslöser? Ehrlich, ohne Selbstvorwurf" },
        { label: "Welche Vorboten hätte ich rückblickend erkennen können?" },
        { label: "Hat mein Protokoll funktioniert? Wo musste ich improvisieren?" },
        { label: "Was nehme ich für mein zukünftiges System mit?" },
      ],
    },
    {
      type: "content",
      seg: " Diese Reflexion macht den Unterschied zwischen Flare als isoliertes Ereignis und Flare als Lerngelegenheit. Wer reflektiert, baut Resilienz Schritt für Schritt auf. Wer nur durchstolpert, lernt weniger.",
      kicker: "Warum das zählt",
      headline: "Reflexion macht aus dem Flare eine Lerngelegenheit.",
      lead: "Wer reflektiert, baut Resilienz Schritt für Schritt auf. Wer nur durchstolpert, lernt weniger.",
    },
    {
      type: "statement",
      seg: "",
      text: "Reflexion macht aus dem Flare eine Lerngelegenheit.",
      emphasis: "Lerngelegenheit",
    },
  ],
};

// ── Abschnitt 6 – Wann ärztlich abklären ─────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Wann ärztlich abklären",
  narration:
    "Eine wichtige Sache zum Schluss: Wann gehört ein Flare in ärztliche Abklärung? Drei Situationen, in denen du nicht allein selbst-managen sollst, sondern professionelle Hilfe holst. Erstens: Wenn neue Red-Flag-Symptome auftauchen – das, was wir in Lektion I.3 besprochen haben. Plötzliche neurologische Ausfälle, Blasen- oder Mastdarm-Probleme, Taubheit in einem Bereich, der vorher normal war – das ist sofortiger ärztlicher Kontakt. Zweitens: Wenn der Flare nach zwei bis drei Wochen nicht abklingt. Die meisten Flares sind nach sieben bis vierzehn Tagen deutlich besser. Wenn das bei dir nicht so ist – wenn nach drei Wochen der Schmerz unverändert oder steigend ist – gehört das in ärztliche Abklärung. Es kann eine zusätzliche Pathologie dahinterstecken oder eine Therapie-Anpassung nötig sein. Drittens: Wenn du psychisch in einer Krise bist – wenn der Flare zu Depression, schweren Ängsten oder Hoffnungslosigkeit führt. Das ist nichts, das du allein selbst-managen musst. Hausarzt, Psychotherapeut, psychiatrische Beratungsstelle – nimm Hilfe an. Selbstmanagement ist nicht Pflicht zur Einsamkeit. Es ist Pflicht zur Selbstwirksamkeit. Und Selbstwirksamkeit bedeutet auch: zu erkennen, wann du Unterstützung brauchst.",
  slides: [
    {
      type: "content",
      seg: "Eine wichtige Sache zum Schluss: Wann gehört ein Flare in ärztliche Abklärung? Drei Situationen, in denen du nicht allein selbst-managen sollst, sondern professionelle Hilfe holst.",
      kicker: "Sicherheit zuerst",
      headline: "Wann gehört ein Flare in ärztliche Abklärung?",
      lead: "Drei Situationen, in denen du nicht allein selbst-managen sollst, sondern professionelle Hilfe holst.",
    },
    {
      type: "content",
      seg: " Erstens: Wenn neue Red-Flag-Symptome auftauchen – das, was wir in Lektion I.3 besprochen haben. Plötzliche neurologische Ausfälle, Blasen- oder Mastdarm-Probleme, Taubheit in einem Bereich, der vorher normal war – das ist sofortiger ärztlicher Kontakt.",
      dark: true,
      kicker: "Warnsituation 1 · Red Flags",
      headline: "Neue Red-Flag-Symptome – sofortiger ärztlicher Kontakt.",
      lead: "Plötzliche neurologische Ausfälle, Blasen- oder Mastdarm-Probleme, Taubheit in einem Bereich, der vorher normal war. Das, was wir in Lektion I.3 besprochen haben.",
    },
    {
      type: "content",
      seg: " Zweitens: Wenn der Flare nach zwei bis drei Wochen nicht abklingt. Die meisten Flares sind nach sieben bis vierzehn Tagen deutlich besser. Wenn das bei dir nicht so ist – wenn nach drei Wochen der Schmerz unverändert oder steigend ist – gehört das in ärztliche Abklärung. Es kann eine zusätzliche Pathologie dahinterstecken oder eine Therapie-Anpassung nötig sein.",
      kicker: "Warnsituation 2 · klingt nicht ab",
      headline: "Wenn der Flare nach zwei bis drei Wochen nicht abklingt.",
      lead: "Die meisten Flares sind nach sieben bis vierzehn Tagen deutlich besser. Bleibt der Schmerz nach drei Wochen unverändert oder steigt – ärztlich abklären.",
    },
    {
      type: "content",
      seg: " Drittens: Wenn du psychisch in einer Krise bist – wenn der Flare zu Depression, schweren Ängsten oder Hoffnungslosigkeit führt. Das ist nichts, das du allein selbst-managen musst. Hausarzt, Psychotherapeut, psychiatrische Beratungsstelle – nimm Hilfe an.",
      kicker: "Warnsituation 3 · psychische Krise",
      headline: "Wenn der Flare zu Depression, schweren Ängsten oder Hoffnungslosigkeit führt.",
      lead: "Das musst du nicht allein selbst-managen. Hausarzt, Psychotherapeut, psychiatrische Beratungsstelle – nimm Hilfe an.",
    },
    {
      type: "statement",
      seg: " Selbstmanagement ist nicht Pflicht zur Einsamkeit. Es ist Pflicht zur Selbstwirksamkeit. Und Selbstwirksamkeit bedeutet auch: zu erkennen, wann du Unterstützung brauchst.",
      text: "Selbstmanagement ist nicht Pflicht zur Einsamkeit – Hilfe holen ist Stärke.",
      emphasis: "Hilfe holen ist Stärke",
    },
  ],
};

// ── Abschnitt 7 – Workbook und Übergang ──────────────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Übergang",
  narration:
    "Im Workbook findest du Übung 4.5: Mein Flare-up-Protokoll. Eine Vorlage mit allen vier Phasen, in der du dein persönliches Protokoll schreibst. Was tust du in Acute? Wie sehen deine Mikro-Routinen in Recovery aus? Welche Stufen passen für Return? Welche Reflexions-Fragen sind dir besonders wichtig? Du hängst dieses Protokoll an einen leicht zugänglichen Ort – vielleicht im Workbook selbst, oder als Notiz im Smartphone, oder ausgedruckt an einem Ort, wo du es schnell findest. Wenn ein Flare kommt, willst du nicht erst suchen müssen. In der letzten Lektion von Modul 4 – 4.6 – geht es um Selbst-Monitoring. Wie misst du eigentlich, ob du Fortschritte machst? Wie erkennst du langfristige Entwicklungen? Was zählt – und was zählt nicht? Bis gleich.",
  slides: [
    {
      type: "reveal-list",
      seg: "Im Workbook findest du Übung 4.5: Mein Flare-up-Protokoll. Eine Vorlage mit allen vier Phasen, in der du dein persönliches Protokoll schreibst. Was tust du in Acute? Wie sehen deine Mikro-Routinen in Recovery aus? Welche Stufen passen für Return? Welche Reflexions-Fragen sind dir besonders wichtig?",
      kicker: "Workbook · Übung 4.5 – Mein Flare-up-Protokoll",
      title: "Dein persönliches Vier-Phasen-Protokoll",
      items: [
        { label: "Was tust du in Acute?" },
        { label: "Wie sehen deine Mikro-Routinen in Recovery aus?" },
        { label: "Welche Stufen passen für Return?" },
        { label: "Welche Reflexions-Fragen sind dir besonders wichtig?" },
      ],
    },
    {
      type: "content",
      seg: " Du hängst dieses Protokoll an einen leicht zugänglichen Ort – vielleicht im Workbook selbst, oder als Notiz im Smartphone, oder ausgedruckt an einem Ort, wo du es schnell findest. Wenn ein Flare kommt, willst du nicht erst suchen müssen.",
      kicker: "Griffbereit halten",
      headline: "Häng dein Protokoll an einen leicht zugänglichen Ort.",
      lead: "Im Workbook, als Notiz im Smartphone, oder ausgedruckt. Wenn ein Flare kommt, willst du nicht erst suchen müssen.",
    },
    {
      type: "content",
      seg: " In der letzten Lektion von Modul 4 – 4.6 – geht es um Selbst-Monitoring. Wie misst du eigentlich, ob du Fortschritte machst? Wie erkennst du langfristige Entwicklungen? Was zählt – und was zählt nicht?",
      kicker: "Als Nächstes · Lektion 4.6",
      headline: "Wie misst du eigentlich, ob du Fortschritte machst?",
      lead: "In der letzten Lektion von Modul 4 geht es um Selbst-Monitoring: Wie erkennst du langfristige Entwicklungen? Was zählt – und was zählt nicht?",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Lektion 4.6",
      nextTitle: "Selbst-Monitoring & Fortschrittsmessung",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "4.5",
  title: "Mein Flare-up-Protokoll: Vier Phasen",
  subtitle: "Modul 4 – Recoping · Acute, Recovery, Return, Reflect – der strukturierte Notfallplan für den Schub",
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
