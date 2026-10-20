/**
 * Die sechs Fragen des Schmerzchecks.
 *
 * Reine Daten, kein React: Die Fragen werden an drei Stellen gebraucht —
 * in der Karte auf der Seite, beim Zusammenbauen der Einschätzung und in
 * der Klartext-Zusammenfassung für das Buchungsformular. Drei Listen
 * daraus zu machen hiesse, dass die dritte irgendwann eine andere Frage
 * stellt als die erste beantwortet hat.
 *
 * ── Warum die Antworten Texte sind und keine Kennziffern ────────────────
 *
 * Weil sie genau so beim Menschen ankommen sollen: im Buchungsformular
 * steht „Nacken & Schultern", nicht `ort=2`. Eine Kennziffer müsste an
 * jeder Stelle wieder übersetzt werden, und spätestens die dritte
 * Übersetzung ist veraltet. Der Preis dafür: Wer einen Antworttext ändert,
 * ändert auch den Schlüssel in der Einschätzung — deshalb liegen beide in
 * dieser Datei nebeneinander, und die Prüfung in `ergebnis.ts` schlägt
 * fehl, wenn einer ohne den anderen wandert.
 */

export const FRAGEN = [
  {
    schluessel: "ort",
    /** Was in der Zusammenfassung fürs Buchungsformular davor steht. */
    etikett: "Bereich",
    frage: "Wo machen dir Beschwerden gerade zu schaffen?",
    antworten: [
      "Unterer Rücken",
      "Nacken & Schultern",
      "Knie",
      "Hüfte",
      "Schulter oder Arm",
      "Woanders",
    ],
    /** Zwei Spalten: kurze Antworten, sonst steht die Liste ewig. */
    zweispaltig: true,
  },
  {
    schluessel: "dauer",
    etikett: "Seit",
    frage: "Seit wann ungefähr?",
    antworten: [
      "Seit ein paar Tagen",
      "2 bis 6 Wochen",
      "6 Wochen bis 3 Monate",
      "Länger als 3 Monate",
    ],
  },
  {
    schluessel: "alltag",
    etikett: "Alltag",
    frage: "Wie sehr bremst es dich im Alltag?",
    antworten: [
      "Kaum, eher nervig",
      "Spürbar, ich passe manches an",
      "Deutlich, einiges geht nicht mehr",
      "Stark, es bestimmt meinen Tag",
    ],
  },
  {
    schluessel: "huerde",
    etikett: "Hürde",
    frage: "Was hält dich bisher am meisten davon ab, etwas dagegen zu tun?",
    antworten: [
      "Ich bekomme keinen Termin",
      "Feste Termine passen nicht in meinen Alltag",
      "Allein üben klappt bei mir nicht",
      "Ich weiß nicht, was das Richtige ist",
    ],
  },
  {
    schluessel: "zeit",
    etikett: "Beste Zeit",
    frage: "Wann hättest du am ehesten 10 Minuten für dich?",
    antworten: ["Morgens", "Mittags", "Abends", "Ganz unterschiedlich"],
    zweispaltig: true,
  },
  {
    schluessel: "flags",
    etikett: "Sicherheitsfrage",
    frage: "Trifft eines davon auf dich zu?",
    hinweis:
      "Diese Frage ist wichtig, damit eine Betreuung von zu Hause sicher ist. Gemeint sind seltene Warnzeichen — bei den meisten trifft nichts davon zu.",
    /**
     * Die Liste steht vollständig VOR den Antwortknöpfen — niemand soll mit
     * „Nein" antworten, ohne gelesen zu haben, wozu.
     *
     * ── Geschärft am 20.10.2026 ──────────────────────────────────────────
     *
     * Die erste Fassung fing zu breit: 13 von 26 Menschen, die bis hierher
     * kamen, gaben ein Warnzeichen an — die Hälfte. „Beschwerden nach einem
     * Sturz oder Unfall" trifft auf jeden zu, der einmal ausgerutscht ist,
     * und „Probleme beim Wasserlassen" auch auf eine Blasenschwäche, die
     * mit dem Rücken nichts zu tun hat.
     *
     * Ein Stopp, der die Hälfte trifft, schützt niemanden mehr — er wird
     * zur Formalität, über die man hinwegliest. Deshalb jetzt enger
     * formuliert: NEU aufgetreten, ZUSAMMEN mit den Beschwerden, SCHWER.
     * Die fünf Warnzeichen selbst bleiben dieselben; nur wer sie wirklich
     * hat, soll „ja" antworten.
     */
    liste: [
      "Neu aufgetretene Taubheit oder Lähmung in Armen oder Beinen",
      "Neu aufgetretene Probleme beim Wasserlassen oder Stuhlgang — bis hin zu verlorener Kontrolle",
      "Fieber oder starkes Krankheitsgefühl zusammen mit den Beschwerden",
      "Ein schwerer Sturz oder Unfall in den letzten Wochen (zum Beispiel Treppensturz oder Autounfall)",
      "Starke Schmerzen, die auch nachts in Ruhe nicht nachlassen",
    ],
    antworten: ["Nein, nichts davon", "Ja, mindestens eins"],
  },
] as const

export type Frage = (typeof FRAGEN)[number]
export type FrageSchluessel = Frage["schluessel"]

/** Die Antwort, die den Sicherheits-Stopp auslöst. */
export const FLAGGE_JA = "Ja, mindestens eins"

/** Was bisher angetippt wurde. Unvollständig, solange der Check läuft. */
export type Antworten = Partial<Record<FrageSchluessel, string>>

/**
 * Die Klartext-Zusammenfassung für das Buchungsformular.
 *
 * Die Sicherheitsfrage steht BEWUSST nicht darin: Wer dort „ja" antwortet,
 * kommt gar nicht zur Buchung — und eine Angabe über mögliche Warnzeichen
 * hätte in einem Terminformular nichts zu suchen.
 */
export function zusammenfassung(antworten: Antworten): string {
  const teile = FRAGEN.filter((f) => f.schluessel !== "flags")
    .map((f) => {
      const wert = antworten[f.schluessel]
      return wert ? `${f.etikett}: ${wert}` : null
    })
    .filter((t): t is string => t !== null)
  return teile.length > 0 ? `Schmerzcheck: ${teile.join(" · ")}` : ""
}
