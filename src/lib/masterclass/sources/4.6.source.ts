/**
 * Masterclass „Chronischer Kreuzschmerz" — Source of Truth für Lektion 4.6
 * ========================================================================
 *
 * DIES IST DIE QUELLE. `src/lib/masterclass/lessons/4.6.ts` wird DARAUS generiert
 * (via `node scripts/build-masterclass.mjs 4.6`). Niemals lessons/4.6.ts von Hand
 * editieren — immer hier ändern und das Build-Skript neu laufen lassen.
 *
 * Letzte Lektion von Modul 4 (Recoping) und Abschluss des gesamten Recoping-
 * Werkzeugkastens: Selbst-Monitoring & Fortschrittsmessung. Kernidee — chronischer
 * Schmerz verläuft nicht-linear; wer falsch misst, bekommt die falschen Antworten.
 * Themenblöcke / Slide-Gruppen klar getrennt:
 *   - Eröffnung:                     Abschnitt 1.
 *   - Was du NICHT messen sollst:    Abschnitt 2 (vier Mess-Fallen, Schmerz = Lärm).
 *   - Was du STATTDESSEN misst:      Abschnitt 3 (vier Dimensionen = Signal).
 *   - Das 4-Wochen-Review:           Abschnitt 4 (fünf Fragen, eine Anpassung).
 *   - Signale guter Entwicklung:     Abschnitt 5 (vier positive Signale).
 *   - Warnsignale:                   Abschnitt 6 (drei Warnsignale — HWG / MD-Wortlaut).
 *   - Workbook + Modul-4-Abschluss:  Abschnitt 7 (Übung 4.6, Modul-4-Summary, Übergang Outro).
 *
 * Aufbau identisch zu 4.1 / 4.2 / 4.3 / 4.4 / 4.5:
 *   - `narration`: bereinigter Erzähltext (Blockquote-`>`, `[Pause Xs]`-Marker und
 *     Emphasis-`*` entfernt; Aufzählungspunkte/Beispiele zu Fließtext verdichtet).
 *     EXAKT der Text, der vertont wird + Transkript.
 *   - `slides[]`: Slide-Inhalte/-Typen + `seg` (Sprech-Segment, verbatim-Teilstring
 *     der narration). Die `seg` eines Abschnitts schließen LÜCKENLOS aneinander an
 *     und ergeben aneinandergehängt wieder die ganze `narration`.
 *
 * Nur die echten `🎙 SCRIPT`-Abschnitte (1–7) sind verarbeitet; die
 * `🖼 SLIDE-BRIEFING`-Blöcke und die Meta-Tabelle der MD werden NICHT vertont. Die
 * Workbook-Übung 4.6 selbst (Monatsreview-Vorlage) ist ein separates Werkzeug —
 * hier wird nur die vertonte ANLEITUNG/ERKLÄRUNG dazu produziert.
 *
 * 3.-PERSON-REGEL (angewandt): 4.6 enthält eine Stelle mit persönlichem
 * Ersteller-/Empfehlungs-Ich (kein generischer Guide-„wir"), die auf „Max Glawe"
 * umgeschrieben wurde:
 *   - MD: „Statt täglicher Tracking-Praxis empfehle ich ein monatliches Review."
 *     → „Statt täglicher Tracking-Praxis empfiehlt Max Glawe ein monatliches Review."
 *   Die übrige generische Guide-/Du-Form bleibt unverändert.
 *
 * HWG: Wortlaut der MD wird – außer der 3.-Person-Umschreibung – beibehalten. Das
 *   Selbst-Monitoring ist als Orientierungs-/Selbstführungs-Werkzeug formuliert,
 *   NICHT als medizinisches Heilversprechen. Der MD-Wortlaut zu den Warnsignalen
 *   (ärztliche/physiotherapeutische Re-Evaluation, Hilfe holen) bleibt EXAKT erhalten.
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
    "Willkommen zur letzten Lektion von Modul 4. Diese Lektion schließt das Recoping-Modul ab und macht den Übergang zum Outro. Worum geht es? Um Selbst-Monitoring. Wie merkst du eigentlich, ob du Fortschritte machst? Wie evaluierst du nach Wochen und Monaten, ob das System, das du dir gebaut hast, funktioniert? Diese Frage klingt einfach, ist aber täuschend komplex – weil chronischer Schmerz ein nicht-linearer Verlauf hat. Wer falsch misst, bekommt die falschen Antworten und macht falsche Anpassungen. In dieser Lektion lernst du, was wirklich zählt – und was du nicht messen solltest.",
  slides: [
    {
      type: "title",
      seg: "",
      kicker: "Masterclass · Modul 4 – Recoping",
      lessonLabel: "Lektion 4.6 – Selbst-Monitoring & Fortschrittsmessung",
    },
    {
      type: "content",
      seg: "Willkommen zur letzten Lektion von Modul 4. Diese Lektion schließt das Recoping-Modul ab und macht den Übergang zum Outro.",
      kicker: "Die letzte Lektion von Modul 4",
      headline: "Diese Lektion schließt das Recoping-Modul ab.",
      lead: "Und sie macht den Übergang zum Outro.",
    },
    {
      type: "content",
      seg: " Worum geht es? Um Selbst-Monitoring. Wie merkst du eigentlich, ob du Fortschritte machst? Wie evaluierst du nach Wochen und Monaten, ob das System, das du dir gebaut hast, funktioniert?",
      kicker: "Selbst-Monitoring",
      headline: "Wie merkst du eigentlich, ob du Fortschritte machst?",
      lead: "Wie evaluierst du nach Wochen und Monaten, ob das System, das du dir gebaut hast, funktioniert?",
    },
    {
      type: "content",
      seg: " Diese Frage klingt einfach, ist aber täuschend komplex – weil chronischer Schmerz ein nicht-linearer Verlauf hat. Wer falsch misst, bekommt die falschen Antworten und macht falsche Anpassungen. In dieser Lektion lernst du, was wirklich zählt – und was du nicht messen solltest.",
      dark: true,
      kicker: "Täuschend komplex",
      headline: "Chronischer Schmerz verläuft nicht-linear – wer falsch misst, bekommt falsche Antworten.",
      lead: "Du lernst, was wirklich zählt – und was du nicht messen solltest.",
    },
  ],
};

// ── Abschnitt 2 – Was du nicht messen sollst ─────────────────────────────────

const abschnitt2: SourceSection = {
  title: "Was du nicht messen sollst",
  narration:
    "Beginnen wir mit dem, was du nicht messen sollst. Diese Liste ist wichtiger als die Was-messen-Liste, weil die meisten Menschen genau die falschen Dinge tracken und sich damit selbst frustrieren. Erstens: Die isolierte Tages-Schmerzskala. Wer jeden Tag fragt: Wo war mein Schmerz heute auf null bis zehn?, kriegt ein extrem volatiles Signal. Schmerz schwankt tagesweise stark, das ist normal. Wer das täglich liest, sieht Volatilität statt Trend. Folge: ständige Aufregung über Tages-Schwankungen, vergessen der monatlichen Verbesserung. Eine Tages-Skala kann einmal sinnvoll sein – für die fünf Fragen im Morgens-Check-in zur Schienen-Wahl. Aber nicht als regelmäßiges Trend-Maß. Zweitens: Der Vergleich mit deinem Best-Tag. Diese Woche bin ich nicht so gut wie letzte Woche, als ich kaum Schmerzen hatte. Wenn du dich an deinem besten Tag misst, wirst du fast immer enttäuscht. Schmerz hat eine natürliche Variabilität. Manche Wochen sind besser, manche schlechter, auch wenn der Trend gut ist. Drittens: Der Vergleich mit deinem Vor-Schmerz-Zustand. Ich bin immer noch nicht da, wo ich vor zehn Jahren war. Das ist eine der schmerzhaftesten Vergleichs-Fallen. Vor zehn Jahren warst du jünger, anders, in einer anderen Lebensphase. Dein Ziel ist nicht zurück zu früher – dein Ziel ist gut leben mit dem, was jetzt ist. Frühere Zustände sind nicht das Ziel. Viertens: Schmerz als alleinigen Indikator. Das ist der größte Fehler. Wer nur Schmerz misst, sieht nur einen Bruchteil der wahren Entwicklung. Was zählt, ist viel umfassender – funktionelle Kapazität, Erholungsfähigkeit, mentale Stabilität, Schlaf, Stimmung. Schmerz ist eine Dimension von vielen. Wenn du nur Schmerz misst, kannst du die paradoxe Situation haben: deine Belastbarkeit ist massiv gewachsen, dein Schlaf ist viel besser, deine Stimmung deutlich stabiler – aber dein Schmerz schwankt heute zufällig in einem hohen Bereich. Du würdest sagen: Mir geht es schlecht. Falsch. Dir geht es viel besser. Du misst nur ein Detail.",
  slides: [
    {
      type: "content",
      seg: "Beginnen wir mit dem, was du nicht messen sollst. Diese Liste ist wichtiger als die Was-messen-Liste, weil die meisten Menschen genau die falschen Dinge tracken und sich damit selbst frustrieren.",
      kicker: "Zuerst das Negative",
      headline: "Was du nicht messen sollst – wichtiger als die Was-messen-Liste.",
      lead: "Die meisten Menschen tracken genau die falschen Dinge und frustrieren sich damit selbst.",
    },
    {
      type: "content",
      seg: " Erstens: Die isolierte Tages-Schmerzskala. Wer jeden Tag fragt: Wo war mein Schmerz heute auf null bis zehn?, kriegt ein extrem volatiles Signal. Schmerz schwankt tagesweise stark, das ist normal. Wer das täglich liest, sieht Volatilität statt Trend. Folge: ständige Aufregung über Tages-Schwankungen, vergessen der monatlichen Verbesserung.",
      kicker: "Falle 1 · Tages-Schmerzskala",
      headline: "Die isolierte Tages-Schmerzskala ist ein extrem volatiles Signal.",
      lead: "Schmerz schwankt tagesweise stark – das ist normal. Wer täglich liest, sieht Volatilität statt Trend und regt sich über Schwankungen auf, statt die monatliche Verbesserung zu sehen.",
    },
    {
      type: "content",
      seg: " Eine Tages-Skala kann einmal sinnvoll sein – für die fünf Fragen im Morgens-Check-in zur Schienen-Wahl. Aber nicht als regelmäßiges Trend-Maß.",
      kicker: "Die Ausnahme",
      headline: "Einmal sinnvoll: das Morgens-Check-in zur Schienen-Wahl.",
      lead: "Aber nicht als regelmäßiges Trend-Maß.",
    },
    {
      type: "content",
      seg: " Zweitens: Der Vergleich mit deinem Best-Tag. Diese Woche bin ich nicht so gut wie letzte Woche, als ich kaum Schmerzen hatte. Wenn du dich an deinem besten Tag misst, wirst du fast immer enttäuscht. Schmerz hat eine natürliche Variabilität. Manche Wochen sind besser, manche schlechter, auch wenn der Trend gut ist.",
      kicker: "Falle 2 · der Best-Tag-Vergleich",
      headline: "Wer sich an seinem besten Tag misst, wird fast immer enttäuscht.",
      lead: "Schmerz hat eine natürliche Variabilität. Manche Wochen sind besser, manche schlechter – auch wenn der Trend gut ist.",
    },
    {
      type: "content",
      seg: " Drittens: Der Vergleich mit deinem Vor-Schmerz-Zustand. Ich bin immer noch nicht da, wo ich vor zehn Jahren war. Das ist eine der schmerzhaftesten Vergleichs-Fallen. Vor zehn Jahren warst du jünger, anders, in einer anderen Lebensphase. Dein Ziel ist nicht zurück zu früher – dein Ziel ist gut leben mit dem, was jetzt ist. Frühere Zustände sind nicht das Ziel.",
      kicker: "Falle 3 · der Vor-Schmerz-Vergleich",
      headline: "„Ich bin immer noch nicht da, wo ich vor zehn Jahren war.“",
      lead: "Eine der schmerzhaftesten Fallen. Dein Ziel ist nicht zurück zu früher – dein Ziel ist gut leben mit dem, was jetzt ist.",
    },
    {
      type: "content",
      seg: " Viertens: Schmerz als alleinigen Indikator. Das ist der größte Fehler. Wer nur Schmerz misst, sieht nur einen Bruchteil der wahren Entwicklung. Was zählt, ist viel umfassender – funktionelle Kapazität, Erholungsfähigkeit, mentale Stabilität, Schlaf, Stimmung. Schmerz ist eine Dimension von vielen.",
      dark: true,
      kicker: "Falle 4 · Schmerz allein",
      headline: "Schmerz als alleiniger Indikator – der größte Fehler.",
      lead: "Was zählt, ist viel umfassender: funktionelle Kapazität, Erholungsfähigkeit, mentale Stabilität, Schlaf, Stimmung. Schmerz ist eine Dimension von vielen.",
    },
    {
      type: "content",
      seg: " Wenn du nur Schmerz misst, kannst du die paradoxe Situation haben: deine Belastbarkeit ist massiv gewachsen, dein Schlaf ist viel besser, deine Stimmung deutlich stabiler – aber dein Schmerz schwankt heute zufällig in einem hohen Bereich. Du würdest sagen: Mir geht es schlecht. Falsch. Dir geht es viel besser. Du misst nur ein Detail.",
      kicker: "Die paradoxe Situation",
      headline: "Belastbarkeit, Schlaf, Stimmung viel besser – aber der Schmerz schwankt heute hoch.",
      lead: "Du würdest sagen: Mir geht es schlecht. Falsch. Dir geht es viel besser – du misst nur ein Detail.",
    },
    {
      type: "statement",
      seg: "",
      text: "Schmerz ist eine Dimension von vielen.",
      emphasis: "von vielen",
    },
  ],
};

// ── Abschnitt 3 – Was du stattdessen messen sollst ───────────────────────────

const abschnitt3: SourceSection = {
  title: "Was du stattdessen messen sollst",
  narration:
    "Was misst du stattdessen? Vier Dimensionen, die zusammen ein realistisches Bild geben. Dimension eins: Funktionelle Kapazität. Was kannst du tun, das du vor sechs Monaten nicht oder nur schwer tun konntest? Diese Frage ist viel aussagekräftiger als jede Schmerz-Skala. Beispiele: Ich kann jetzt eine Stunde wandern. Ich kann eine 20-Kilo-Einkaufstüte tragen. Ich kann zwei Stunden Auto fahren ohne Pause. Ich kann ein Wochenende renovieren, ohne nachher liegen zu müssen. Funktion ist das, was du im Leben tun willst. Verbesserte Funktion ist der eigentliche Erfolg deiner Therapie. Dimension zwei: Erholungszeit. Wenn du belastet wurdest – wie schnell erholst du dich? Das ist ein hervorragendes Maß für deine Antifragilität. Vor sechs Monaten hat eine längere Autofahrt zwei Tage Recovery gebraucht. Heute eine halbe Stunde. Das ist Fortschritt. Dimension drei: Flare-Statistik. Wie oft hattest du Flares in den letzten drei, sechs, zwölf Monaten? Wie lange dauerten sie? Wie schwer waren sie? Wenn die Frequenz, Dauer oder Intensität deiner Flares sinkt – das ist ein klares Zeichen für funktionierende Selbstpflege. Das ist messbar, ohne dass du jeden Tag tracken musst. Dimension vier: Compliance und Selbstwirksamkeit. Hast du deine Mikro-Routinen die meisten Tage gemacht? Hast du dein Wochen-System einigermaßen gehalten? Fühlst du dich handlungsfähig gegenüber deinem Schmerz – oder ohnmächtig? Diese Dimension ist subjektiv, aber ein extrem starker Prädiktor für langfristigen Erfolg. Wer diese vier Dimensionen im Blick hat, hat ein realistisches Bild der eigenen Entwicklung. Schmerz allein ist Lärm. Funktion plus Erholung plus Flares plus Selbstwirksamkeit ist Signal.",
  slides: [
    {
      type: "reveal-list",
      seg: "Was misst du stattdessen? Vier Dimensionen, die zusammen ein realistisches Bild geben.",
      kicker: "Stattdessen",
      title: "Vier Dimensionen, die zusammen zählen",
      items: [
        { label: "Funktionelle Kapazität" },
        { label: "Erholungszeit" },
        { label: "Flare-Statistik" },
        { label: "Compliance und Selbstwirksamkeit" },
      ],
    },
    {
      type: "content",
      seg: " Dimension eins: Funktionelle Kapazität. Was kannst du tun, das du vor sechs Monaten nicht oder nur schwer tun konntest? Diese Frage ist viel aussagekräftiger als jede Schmerz-Skala. Beispiele: Ich kann jetzt eine Stunde wandern. Ich kann eine 20-Kilo-Einkaufstüte tragen. Ich kann zwei Stunden Auto fahren ohne Pause. Ich kann ein Wochenende renovieren, ohne nachher liegen zu müssen.",
      kicker: "Dimension 1 · Funktionelle Kapazität",
      headline: "Was kannst du tun, das du vor sechs Monaten nicht oder nur schwer konntest?",
      lead: "Eine Stunde wandern, eine 20-Kilo-Tüte tragen, zwei Stunden Auto fahren ohne Pause, ein Wochenende renovieren ohne nachher liegen zu müssen. Aussagekräftiger als jede Schmerz-Skala.",
    },
    {
      type: "statement",
      seg: " Funktion ist das, was du im Leben tun willst. Verbesserte Funktion ist der eigentliche Erfolg deiner Therapie.",
      text: "Verbesserte Funktion ist der eigentliche Erfolg deiner Therapie.",
      emphasis: "Funktion",
    },
    {
      type: "content",
      seg: " Dimension zwei: Erholungszeit. Wenn du belastet wurdest – wie schnell erholst du dich? Das ist ein hervorragendes Maß für deine Antifragilität. Vor sechs Monaten hat eine längere Autofahrt zwei Tage Recovery gebraucht. Heute eine halbe Stunde. Das ist Fortschritt.",
      kicker: "Dimension 2 · Erholungszeit",
      headline: "Wie schnell erholst du dich nach Belastung?",
      lead: "Ein hervorragendes Maß für deine Antifragilität. Vor sechs Monaten zwei Tage Recovery nach einer langen Autofahrt – heute eine halbe Stunde. Das ist Fortschritt.",
    },
    {
      type: "content",
      seg: " Dimension drei: Flare-Statistik. Wie oft hattest du Flares in den letzten drei, sechs, zwölf Monaten? Wie lange dauerten sie? Wie schwer waren sie? Wenn die Frequenz, Dauer oder Intensität deiner Flares sinkt – das ist ein klares Zeichen für funktionierende Selbstpflege. Das ist messbar, ohne dass du jeden Tag tracken musst.",
      kicker: "Dimension 3 · Flare-Statistik",
      headline: "Frequenz, Dauer und Intensität deiner Flares über die Monate.",
      lead: "Sinkt eine davon, ist das ein klares Zeichen für funktionierende Selbstpflege. Messbar, ohne dass du jeden Tag tracken musst.",
    },
    {
      type: "content",
      seg: " Dimension vier: Compliance und Selbstwirksamkeit. Hast du deine Mikro-Routinen die meisten Tage gemacht? Hast du dein Wochen-System einigermaßen gehalten? Fühlst du dich handlungsfähig gegenüber deinem Schmerz – oder ohnmächtig? Diese Dimension ist subjektiv, aber ein extrem starker Prädiktor für langfristigen Erfolg.",
      kicker: "Dimension 4 · Compliance & Selbstwirksamkeit",
      headline: "Hältst du dein System – und fühlst du dich handlungsfähig?",
      lead: "Mikro-Routinen die meisten Tage, Wochen-System einigermaßen gehalten, handlungsfähig statt ohnmächtig. Subjektiv, aber ein extrem starker Prädiktor für langfristigen Erfolg.",
    },
    {
      type: "statement",
      seg: " Wer diese vier Dimensionen im Blick hat, hat ein realistisches Bild der eigenen Entwicklung. Schmerz allein ist Lärm. Funktion plus Erholung plus Flares plus Selbstwirksamkeit ist Signal.",
      text: "Schmerz allein ist Lärm. Diese vier zusammen sind Signal.",
      emphasis: "Signal",
    },
  ],
};

// ── Abschnitt 4 – Das 4-Wochen-Review ────────────────────────────────────────

const abschnitt4: SourceSection = {
  title: "Das 4-Wochen-Review",
  narration:
    "Statt täglicher Tracking-Praxis empfiehlt Max Glawe ein monatliches Review. Einmal pro Monat – zum Beispiel jeden ersten Sonntag im Monat – nimmst du dir fünfzehn bis zwanzig Minuten Zeit und beantwortest fünf Fragen. Frage eins: Was konnte ich diesen Monat, das ich vor einem Monat noch nicht konnte oder schwerer fand? Sammle konkrete Beispiele aus den letzten vier Wochen. Auch kleine Dinge zählen. Ich konnte zwei Stunden im Garten arbeiten. Ich bin ein paar Mal Treppen genommen, ohne zu zögern. Ich habe das Auto neu gepackt, ohne danach Schmerzen zu haben. Frage zwei: Wie viele Flares hatte ich diesen Monat, und wie schwer waren sie? Nicht jeder Monat hat Flares. Wenn ja: notier die Frequenz und Dauer. Vergleich monatlich. Lass sich Trends erkennen. Frage drei: Wie konsequent habe ich meine Mikro-Routinen gemacht? Geschätzt prozentual. 50 Prozent? 70 Prozent? 90 Prozent? Sei ehrlich. Diese Compliance ist ein Schlüsselindikator. Frage vier: Wie fühle ich mich generell – Energie, Stimmung, Schlaf, Vertrauen? Eine subjektive Selbsteinschätzung. Im Vergleich zu vor einem Monat: besser, gleich, schlechter? Frage fünf: Was will ich im nächsten Monat anpassen? Eine Sache. Nicht fünf. Vielleicht: Eine neue Übung in meine Ritual-Map einbauen. Oder: Box Breathing zur Pflicht machen, nicht nur an stressigen Tagen. Oder: Mit dem höhenverstellbaren Tisch wirklich wechseln, nicht nur im Stehen sitzen lassen. Diese fünf Fragen plus eine Anpassung pro Monat sind das richtige Maß. Genug, um Fortschritt zu sehen. Wenig genug, um nicht zur Tracking-Zwangsneurose zu kippen.",
  slides: [
    {
      type: "content",
      seg: "Statt täglicher Tracking-Praxis empfiehlt Max Glawe ein monatliches Review. Einmal pro Monat – zum Beispiel jeden ersten Sonntag im Monat – nimmst du dir fünfzehn bis zwanzig Minuten Zeit und beantwortest fünf Fragen.",
      kicker: "Das richtige Maß",
      headline: "Kein tägliches Tracking – ein monatliches Review.",
      lead: "Einmal pro Monat, zum Beispiel jeden ersten Sonntag, nimmst du dir fünfzehn bis zwanzig Minuten und beantwortest fünf Fragen.",
    },
    {
      type: "reveal-list",
      seg: " Frage eins: Was konnte ich diesen Monat, das ich vor einem Monat noch nicht konnte oder schwerer fand? Sammle konkrete Beispiele aus den letzten vier Wochen. Auch kleine Dinge zählen. Ich konnte zwei Stunden im Garten arbeiten. Ich bin ein paar Mal Treppen genommen, ohne zu zögern. Ich habe das Auto neu gepackt, ohne danach Schmerzen zu haben. Frage zwei: Wie viele Flares hatte ich diesen Monat, und wie schwer waren sie? Nicht jeder Monat hat Flares. Wenn ja: notier die Frequenz und Dauer. Vergleich monatlich. Lass sich Trends erkennen. Frage drei: Wie konsequent habe ich meine Mikro-Routinen gemacht? Geschätzt prozentual. 50 Prozent? 70 Prozent? 90 Prozent? Sei ehrlich. Diese Compliance ist ein Schlüsselindikator. Frage vier: Wie fühle ich mich generell – Energie, Stimmung, Schlaf, Vertrauen? Eine subjektive Selbsteinschätzung. Im Vergleich zu vor einem Monat: besser, gleich, schlechter? Frage fünf: Was will ich im nächsten Monat anpassen? Eine Sache. Nicht fünf.",
      kicker: "Das Monatsreview · fünf Fragen",
      title: "Die fünf Fragen",
      items: [
        { label: "1 · Was konnte ich diesen Monat, das vor einem Monat schwerer war?" },
        { label: "2 · Wie viele Flares hatte ich – und wie schwer waren sie?" },
        { label: "3 · Wie konsequent habe ich meine Mikro-Routinen gemacht?" },
        { label: "4 · Wie fühle ich mich – Energie, Stimmung, Schlaf, Vertrauen?" },
        { label: "5 · Was will ich im nächsten Monat anpassen? Eine Sache." },
      ],
    },
    {
      type: "content",
      seg: " Vielleicht: Eine neue Übung in meine Ritual-Map einbauen. Oder: Box Breathing zur Pflicht machen, nicht nur an stressigen Tagen. Oder: Mit dem höhenverstellbaren Tisch wirklich wechseln, nicht nur im Stehen sitzen lassen.",
      kicker: "Frage 5 · Beispiele für die eine Anpassung",
      headline: "Eine Anpassung – konkret und klein.",
      lead: "Eine neue Übung in die Ritual-Map. Box Breathing zur Pflicht, nicht nur an stressigen Tagen. Mit dem höhenverstellbaren Tisch wirklich wechseln.",
    },
    {
      type: "statement",
      seg: " Diese fünf Fragen plus eine Anpassung pro Monat sind das richtige Maß. Genug, um Fortschritt zu sehen. Wenig genug, um nicht zur Tracking-Zwangsneurose zu kippen.",
      text: "Eine Anpassung pro Monat. Nicht fünf.",
      emphasis: "Eine Anpassung",
    },
  ],
};

// ── Abschnitt 5 – Signale guter Entwicklung ──────────────────────────────────

const abschnitt5: SourceSection = {
  title: "Signale guter Entwicklung",
  narration:
    "Was sind objektive Signale, dass es in die richtige Richtung geht? Vier Dinge, an denen du dich orientieren kannst. Signal eins: Du machst Dinge im Alltag, die früher schwer oder unmöglich waren. Funktionelle Erweiterung. Signal zwei: Flares werden seltener, kürzer oder weniger intensiv. Selbst wenn sie immer noch passieren – sie reichen weniger weit. Signal drei: Du erholst dich schneller von Belastungs-Spitzen. Wo früher ein Tag Recovery brauchte, brauchst du jetzt ein paar Stunden. Signal vier: Du fühlst dich mental anders mit deinem Schmerz. Weniger Angst, weniger Ohnmacht, mehr Vertrauen ins eigene System. Das ist das wichtigste Signal überhaupt – und das schwierigste in Worte zu fassen. Wenn diese vier Signale auftauchen, läuft dein System. Selbst wenn dein Schmerz an bestimmten Tagen schwankt – diese vier Trends sind das, was zählt.",
  slides: [
    {
      type: "reveal-list",
      seg: "Was sind objektive Signale, dass es in die richtige Richtung geht? Vier Dinge, an denen du dich orientieren kannst. Signal eins: Du machst Dinge im Alltag, die früher schwer oder unmöglich waren. Funktionelle Erweiterung. Signal zwei: Flares werden seltener, kürzer oder weniger intensiv. Selbst wenn sie immer noch passieren – sie reichen weniger weit. Signal drei: Du erholst dich schneller von Belastungs-Spitzen. Wo früher ein Tag Recovery brauchte, brauchst du jetzt ein paar Stunden. Signal vier: Du fühlst dich mental anders mit deinem Schmerz. Weniger Angst, weniger Ohnmacht, mehr Vertrauen ins eigene System. Das ist das wichtigste Signal überhaupt – und das schwierigste in Worte zu fassen.",
      kicker: "Vier Signale guter Entwicklung",
      title: "Daran orientierst du dich",
      items: [
        { label: "Funktion erweitert sich – du machst Dinge, die früher schwer waren" },
        { label: "Flares werden seltener, kürzer oder weniger intensiv" },
        { label: "Du erholst dich schneller von Belastungs-Spitzen" },
        { label: "Du fühlst dich mental anders – weniger Angst, mehr Vertrauen" },
      ],
    },
    {
      type: "content",
      seg: " Wenn diese vier Signale auftauchen, läuft dein System. Selbst wenn dein Schmerz an bestimmten Tagen schwankt – diese vier Trends sind das, was zählt.",
      kicker: "Was es bedeutet",
      headline: "Wenn diese vier Signale auftauchen, läuft dein System.",
      lead: "Selbst wenn dein Schmerz an bestimmten Tagen schwankt – diese vier Trends sind das, was zählt.",
    },
  ],
};

// ── Abschnitt 6 – Warnsignale ────────────────────────────────────────────────

const abschnitt6: SourceSection = {
  title: "Warnsignale",
  narration:
    "Umgekehrt: Wann ist es Zeit, etwas Größeres zu überdenken oder Hilfe zu holen? Warnsignal eins: Du machst seit sechs Monaten dein System konsequent, und keine der vier Verbesserungs-Signale zeigt sich. Funktion gleich, Flares gleich, Erholung gleich, mental gleich. Dann ist es Zeit für ärztliche oder physiotherapeutische Re-Evaluation. Möglicherweise gibt es eine Komponente, die du selbst nicht erfasst. Warnsignal zwei: Du machst dein System, aber es geht abwärts – mehr Flares, schlechtere Funktion, sinkende Stimmung. Das ist nicht normal. Hilfe holen. Warnsignal drei: Du machst dein System nicht – und du erkennst, dass du es alleine nicht hinkriegst. Auch das ist okay zu erkennen. Suche dir Unterstützung – einen Physiotherapeuten vor Ort, eine Schmerzklinik, einen Coach. Selbstwirksamkeit heißt auch: erkennen, wann Begleitung das richtige ist. Selbstmanagement ist nicht Selbstkampf. Es ist Selbstführung mit der gelegentlichen Bereitschaft, Unterstützung zu holen.",
  slides: [
    {
      type: "content",
      seg: "Umgekehrt: Wann ist es Zeit, etwas Größeres zu überdenken oder Hilfe zu holen?",
      kicker: "Die andere Richtung",
      headline: "Wann ist es Zeit, etwas Größeres zu überdenken oder Hilfe zu holen?",
    },
    {
      type: "content",
      seg: " Warnsignal eins: Du machst seit sechs Monaten dein System konsequent, und keine der vier Verbesserungs-Signale zeigt sich. Funktion gleich, Flares gleich, Erholung gleich, mental gleich. Dann ist es Zeit für ärztliche oder physiotherapeutische Re-Evaluation. Möglicherweise gibt es eine Komponente, die du selbst nicht erfasst.",
      kicker: "Warnsignal 1 · keine Bewegung",
      headline: "Sechs Monate konsequent – und keines der vier Signale zeigt sich.",
      lead: "Funktion gleich, Flares gleich, Erholung gleich, mental gleich. Zeit für ärztliche oder physiotherapeutische Re-Evaluation. Möglicherweise gibt es eine Komponente, die du selbst nicht erfasst.",
    },
    {
      type: "content",
      seg: " Warnsignal zwei: Du machst dein System, aber es geht abwärts – mehr Flares, schlechtere Funktion, sinkende Stimmung. Das ist nicht normal. Hilfe holen.",
      dark: true,
      kicker: "Warnsignal 2 · es geht abwärts",
      headline: "Du machst dein System – aber es geht abwärts.",
      lead: "Mehr Flares, schlechtere Funktion, sinkende Stimmung. Das ist nicht normal. Hilfe holen.",
    },
    {
      type: "content",
      seg: " Warnsignal drei: Du machst dein System nicht – und du erkennst, dass du es alleine nicht hinkriegst. Auch das ist okay zu erkennen. Suche dir Unterstützung – einen Physiotherapeuten vor Ort, eine Schmerzklinik, einen Coach. Selbstwirksamkeit heißt auch: erkennen, wann Begleitung das richtige ist.",
      kicker: "Warnsignal 3 · alleine nicht machbar",
      headline: "Du kriegst es alleine nicht hin – auch das ist okay zu erkennen.",
      lead: "Such dir Unterstützung: einen Physiotherapeuten vor Ort, eine Schmerzklinik, einen Coach. Selbstwirksamkeit heißt auch, zu erkennen, wann Begleitung das richtige ist.",
    },
    {
      type: "statement",
      seg: " Selbstmanagement ist nicht Selbstkampf. Es ist Selbstführung mit der gelegentlichen Bereitschaft, Unterstützung zu holen.",
      text: "Selbstmanagement ist nicht Selbstkampf – es ist Selbstführung.",
      emphasis: "Selbstführung",
    },
  ],
};

// ── Abschnitt 7 – Workbook und Modul-4-Abschluss ─────────────────────────────

const abschnitt7: SourceSection = {
  title: "Workbook & Modul-4-Abschluss",
  narration:
    "Im Workbook findest du Übung 4.6: Mein Monatsreview – mit den fünf Fragen und einer Vorlage für zwölf Monate. Du kannst dir das Workbook anlegen und einmal pro Monat hineinschreiben. Über ein Jahr siehst du erstaunlich deutlich, wohin deine Reise geht. Damit ist Modul 4 abgeschlossen. Du hast jetzt: Das Habit-Stacking-Konzept verstanden, in 4.1. Deine persönliche Ritual-Map erstellt, in 4.2. Das Drei-Schienen-System operationalisiert, in 4.3. Schmerzadaptiv intraday navigieren gelernt, in 4.4. Ein Flare-up-Protokoll gebaut, in 4.5. Und ein Selbst-Monitoring-System, in 4.6. Das ist der komplette Recoping-Werkzeugkasten. Du hast jetzt alles, was du brauchst, um in den nächsten Monaten und Jahren mit deinem Rücken selbstständig zu arbeiten. Im Outro – zwei kurze Lektionen, O.1 und O.2 – verdichten wir die wichtigsten Kernbotschaften und machen den emotionalen Abschluss. Bis gleich.",
  slides: [
    {
      type: "content",
      seg: "Im Workbook findest du Übung 4.6: Mein Monatsreview – mit den fünf Fragen und einer Vorlage für zwölf Monate. Du kannst dir das Workbook anlegen und einmal pro Monat hineinschreiben. Über ein Jahr siehst du erstaunlich deutlich, wohin deine Reise geht.",
      kicker: "Workbook · Übung 4.6 – Mein Monatsreview",
      headline: "Mein Monatsreview – fünf Fragen, eine Vorlage für zwölf Monate.",
      lead: "Einmal pro Monat hineinschreiben. Über ein Jahr siehst du erstaunlich deutlich, wohin deine Reise geht.",
    },
    {
      type: "reveal-list",
      seg: " Damit ist Modul 4 abgeschlossen. Du hast jetzt: Das Habit-Stacking-Konzept verstanden, in 4.1. Deine persönliche Ritual-Map erstellt, in 4.2. Das Drei-Schienen-System operationalisiert, in 4.3. Schmerzadaptiv intraday navigieren gelernt, in 4.4. Ein Flare-up-Protokoll gebaut, in 4.5. Und ein Selbst-Monitoring-System, in 4.6.",
      kicker: "Modul 4 abgeschlossen",
      title: "Das nimmst du aus Modul 4 mit",
      items: [
        { label: "Das Habit-Stacking-Konzept verstanden (4.1)" },
        { label: "Deine persönliche Ritual-Map erstellt (4.2)" },
        { label: "Das Drei-Schienen-System operationalisiert (4.3)" },
        { label: "Schmerzadaptiv intraday navigieren gelernt (4.4)" },
        { label: "Ein Flare-up-Protokoll gebaut (4.5)" },
        { label: "Ein Selbst-Monitoring-System (4.6)" },
      ],
    },
    {
      type: "statement",
      seg: " Das ist der komplette Recoping-Werkzeugkasten. Du hast jetzt alles, was du brauchst, um in den nächsten Monaten und Jahren mit deinem Rücken selbstständig zu arbeiten.",
      text: "Du hast jetzt einen kompletten Werkzeugkasten.",
      emphasis: "kompletten Werkzeugkasten",
    },
    {
      type: "content",
      seg: " Im Outro – zwei kurze Lektionen, O.1 und O.2 – verdichten wir die wichtigsten Kernbotschaften und machen den emotionalen Abschluss.",
      kicker: "Als Nächstes · Das Outro",
      headline: "Zwei kurze Lektionen, O.1 und O.2, verdichten die wichtigsten Kernbotschaften.",
      lead: "Im Outro machen wir den emotionalen Abschluss der Masterclass.",
    },
    {
      type: "word",
      seg: " Bis gleich.",
      word: "Bis gleich.",
    },
    {
      type: "outro",
      seg: "",
      nextLabel: "Outro · Lektion O.1",
      nextTitle: "Drei Kernbotschaften",
      hint: "Weiter →",
    },
  ],
};

// ── Lektion ─────────────────────────────────────────────────────────────────

export const lessonSource: SourceLesson = {
  id: "4.6",
  title: "Selbst-Monitoring & Fortschrittsmessung",
  subtitle: "Modul 4 – Recoping · Was zählt, was nicht – das 4-Wochen-Review und der Abschluss des Werkzeugkastens",
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
