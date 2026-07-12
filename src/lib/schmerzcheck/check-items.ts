/**
 * PROJ-23 / Phase 2: The 15 Schmerzcheck items (spec §5.3).
 *
 * ⚠️ CLINICAL SIGN-OFF REQUIRED: This list reflects the spec defaults
 * (NRS / ODI-/STarT-Back-style / red-flag screening principles). It MUST be
 * reviewed and signed off by the product owner (Max Glawe, sektoraler HP für
 * Physiotherapie) before production. Do not change item content without approval.
 *
 * Pure data module — safe to import on both server and client.
 */

export type CheckItemType = "single_select" | "multi_select" | "nrs_slider" | "likert_4"

export interface CheckOption {
  value: string
  label: string
  /** Selecting this option contributes to a red flag (items 7–9). */
  redFlag?: boolean
  /** Mutually exclusive option (e.g. "Nichts davon") — clears the others. */
  exclusive?: boolean
}

export interface NrsLabel {
  value: number
  label: string
}

export interface CheckItem {
  id: string
  text: string
  helperText?: string
  type: CheckItemType
  options?: CheckOption[]
  range?: [number, number]
  labels?: NrsLabel[]
  required: boolean
  /** Item participates in red-flag logic (see scoring.ts). */
  redFlag?: boolean
}

const NRS_LABELS: NrsLabel[] = [
  { value: 0, label: "Keine" },
  { value: 5, label: "Mittel" },
  { value: 10, label: "Stärkste vorstellbare" },
]

export const CHECK_ITEMS: CheckItem[] = [
  {
    // MEHRFACHAUSWAHL seit 07/2026 (PROJ-25b).
    //
    // Vorher war das eine Einfachauswahl MIT der Option „Mehrere Bereiche
    // gleichzeitig" — und 47 % aller Teilnehmer haben genau die geklickt und
    // damit ihre eigene Detailangabe überschrieben. Bei 77 Leads wissen wir
    // dadurch bis heute nicht, welche Region gemeint war. Für ein Produkt, das
    // „Chronischer Kreuzschmerz" heißt, war das die teuerste Frage im ganzen
    // Check. Die Option ist deshalb ersatzlos gestrichen: Wer mehrere Bereiche
    // hat, wählt sie jetzt einzeln aus.
    id: "region",
    text: "Wo spürst du deine Beschwerden?",
    helperText: "Mehrfachauswahl möglich — wähle alle Bereiche, die dich betreffen.",
    type: "multi_select",
    required: true,
    options: [
      { value: "neck", label: "Nacken" },
      { value: "shoulder", label: "Schulter" },
      { value: "upper_back", label: "Oberer Rücken" },
      { value: "lower_back", label: "Unterer Rücken / LWS" },
      { value: "hip", label: "Hüfte" },
      { value: "knee", label: "Knie" },
      { value: "foot", label: "Fuß" },
      { value: "other", label: "Anderer Bereich" },
    ],
  },
  {
    // Schwerpunkt-Frage. Wird ÜBERSPRUNGEN, wenn oben nur ein Bereich gewählt
    // wurde — dann ist der Schwerpunkt eindeutig und wird automatisch gesetzt
    // (siehe /api/check/answer). Der Check hat keine bedingten Fragen; das
    // Überspringen passiert serverseitig über `skipNext` in der Antwort.
    id: "main_region",
    text: "Wo schränkt es dich im Alltag am meisten ein?",
    helperText: "Ein Bereich — der, der dich am meisten stört.",
    type: "single_select",
    required: true,
    options: [
      { value: "neck", label: "Nacken" },
      { value: "shoulder", label: "Schulter" },
      { value: "upper_back", label: "Oberer Rücken" },
      { value: "lower_back", label: "Unterer Rücken / LWS" },
      { value: "hip", label: "Hüfte" },
      { value: "knee", label: "Knie" },
      { value: "foot", label: "Fuß" },
      { value: "other", label: "Anderer Bereich" },
    ],
  },
  {
    id: "duration",
    text: "Seit wann hast du diese Beschwerden?",
    type: "single_select",
    required: true,
    options: [
      { value: "acute", label: "Weniger als 2 Wochen" },
      { value: "subacute_early", label: "2 bis 6 Wochen" },
      { value: "subacute_late", label: "6 bis 12 Wochen" },
      { value: "chronic", label: "Länger als 3 Monate" },
      { value: "over_year", label: "Länger als 1 Jahr" },
      { value: "recurring", label: "Kommt und geht — schon länger" },
    ],
  },
  {
    id: "onset",
    text: "Wie haben die Beschwerden angefangen?",
    type: "single_select",
    required: true,
    options: [
      { value: "sudden", label: "Plötzlich (z.B. nach einer bestimmten Bewegung)" },
      { value: "gradual", label: "Schleichend, ohne klaren Auslöser" },
      { value: "trauma", label: "Nach einem Sturz oder Unfall" },
      { value: "post_surgery", label: "Nach einer Operation" },
      { value: "unknown", label: "Weiß ich nicht mehr" },
    ],
  },
  {
    id: "pain_current",
    text: "Wie stark sind deine Beschwerden gerade jetzt?",
    helperText: "Skala von 0 (keine Beschwerden) bis 10 (stärkste vorstellbare Beschwerden)",
    type: "nrs_slider",
    range: [0, 10],
    labels: NRS_LABELS,
    required: true,
  },
  {
    id: "pain_worst_week",
    text: "Wie stark waren deine Beschwerden in der letzten Woche am schlimmsten?",
    helperText: "Skala von 0 bis 10",
    type: "nrs_slider",
    range: [0, 10],
    labels: NRS_LABELS,
    required: true,
  },
  {
    id: "pain_pattern",
    text: "Wie verhalten sich deine Beschwerden?",
    type: "single_select",
    required: true,
    options: [
      { value: "constant", label: "Immer gleich vorhanden" },
      { value: "movement", label: "Stärker bei bestimmten Bewegungen" },
      { value: "rest", label: "Stärker in Ruhe oder beim Sitzen" },
      { value: "variable", label: "Wechselhaft, ohne klares Muster" },
      { value: "night", label: "Vor allem nachts" },
    ],
  },
  {
    id: "rf_cauda_equina",
    text: "Hattest du eines der folgenden in den letzten Wochen?",
    helperText: "Mehrfachauswahl möglich — wenn nichts davon zutrifft, wähle \"Nichts davon\".",
    type: "multi_select",
    required: true,
    redFlag: true,
    options: [
      // Präzisiert 07/2026: Das Warnzeichen für eine Cauda-equina-Symptomatik ist
      // die echte Sattel-ANÄSTHESIE (Gefühllosigkeit), nicht Kribbeln. Die alte
      // Formulierung „Taubheit ODER Kribbeln" fing jeden Ischias mit
      // ausstrahlendem Kribbeln ein — 27 Leads flogen allein deswegen raus.
      // Der Vergleich mit der Zahnarzt-Betäubung macht den Unterschied greifbar.
      {
        value: "saddle_numbness",
        label: "Taubheit/Gefühllosigkeit im Genital- oder Sattelbereich (wie beim Zahnarzt betäubt)",
        redFlag: true,
      },
      // Kribbeln ist NICHT stoppend — häufig bei ausstrahlenden Beschwerden.
      // Der Report weist trotzdem darauf hin (siehe report.ts).
      {
        value: "saddle_tingling",
        label: "Nur Kribbeln oder Ameisenlaufen (ohne Gefühllosigkeit)",
      },
      { value: "bladder_bowel", label: "Plötzlicher Verlust der Kontrolle über Blase oder Darm", redFlag: true },
      { value: "severe_progressive_weakness", label: "Stark fortschreitende Lähmung", redFlag: true },
      { value: "none", label: "Nichts davon", exclusive: true },
    ],
  },
  {
    id: "rf_systemic",
    text: "Hast du in den letzten Wochen eines davon bemerkt?",
    helperText: "Mehrfachauswahl möglich",
    type: "multi_select",
    required: true,
    redFlag: true,
    options: [
      { value: "weight_loss", label: "Ungewollter Gewichtsverlust (mehr als 5 kg)", redFlag: true },
      { value: "fever_sweats", label: "Wiederkehrendes Fieber oder Nachtschweiß", redFlag: true },
      // KEIN redFlag mehr (Anpassung 07/2026): Nächtliches Aufwachen ist bei
      // chronischem Rückenschmerz der Normalfall und hatte als alleiniges
      // Stopp-Kriterium keine Trennschärfe — 45 Leads flogen allein deswegen
      // raus. In KOMBINATION mit Gewichtsverlust, Fieber oder Krebsanamnese
      // stoppt es weiterhin, weil diese drei harte Flags bleiben.
      // Siehe scoring.ts → NON_STOPPING_CODES.
      { value: "night_pain_severe", label: "Beschwerden, die dich nachts aufwecken (jede Nacht)" },
      { value: "cancer_history", label: "Bekannte Krebserkrankung (aktuell oder früher)", redFlag: true },
      { value: "none", label: "Nichts davon", exclusive: true },
    ],
  },
  {
    id: "rf_neuro",
    text: "Hast du Schwäche in Armen oder Beinen bemerkt, die schlimmer wird?",
    type: "single_select",
    required: true,
    redFlag: true,
    options: [
      { value: "progressive", label: "Ja, wird zunehmend schlechter", redFlag: true },
      { value: "stable_weakness", label: "Ja, aber bleibt gleich" },
      { value: "occasional", label: "Manchmal, kommt und geht" },
      { value: "none", label: "Nein, keine Schwäche" },
    ],
  },
  {
    id: "sleep_impact",
    text: "Wie sehr beeinflussen die Beschwerden deinen Schlaf?",
    type: "single_select",
    required: true,
    options: [
      { value: "none", label: "Gar nicht" },
      { value: "mild", label: "Etwas, aber ich schlafe weiter" },
      { value: "moderate", label: "Ich wache manchmal auf" },
      { value: "severe", label: "Ich schlafe regelmäßig schlecht deswegen" },
    ],
  },
  {
    id: "function_impact",
    text: "Wie sehr schränken dich die Beschwerden im Alltag ein?",
    type: "single_select",
    required: true,
    options: [
      { value: "none", label: "Gar nicht, ich kann alles machen" },
      { value: "mild", label: "Manche Dinge fallen mir schwerer" },
      { value: "moderate", label: "Viele Alltagsdinge sind beeinträchtigt" },
      { value: "severe", label: "Fast alles ist eingeschränkt" },
    ],
  },
  {
    id: "fear_avoidance",
    text: "Wie sehr stimmst du diesem Satz zu?",
    helperText: "„Ich vermeide bestimmte Bewegungen, weil ich Angst habe, dass es schlimmer wird.",
    type: "likert_4",
    required: true,
    options: [
      { value: "1", label: "Stimme gar nicht zu" },
      { value: "2", label: "Stimme eher nicht zu" },
      { value: "3", label: "Stimme eher zu" },
      { value: "4", label: "Stimme stark zu" },
    ],
  },
  {
    id: "self_efficacy",
    text: "Und diesem Satz?",
    helperText: "„Ich vertraue meinem Körper, dass er mit Belastung umgehen kann.",
    type: "likert_4",
    required: true,
    // Values inverted vs. fear_avoidance so that higher = healthier in both.
    options: [
      { value: "4", label: "Stimme stark zu" },
      { value: "3", label: "Stimme eher zu" },
      { value: "2", label: "Stimme eher nicht zu" },
      { value: "1", label: "Stimme gar nicht zu" },
    ],
  },
  {
    id: "previous_treatment",
    text: "Hast du wegen dieser Beschwerden schon etwas unternommen?",
    helperText: "Mehrfachauswahl möglich",
    type: "multi_select",
    required: true,
    options: [
      { value: "physio", label: "Ja, Physiotherapie" },
      { value: "doctor", label: "Ja, war beim Arzt" },
      { value: "medication", label: "Ja, Schmerzmittel genommen" },
      { value: "imaging", label: "Ja, MRT oder Röntgen" },
      { value: "alternative", label: "Ja, alternative Methoden (z.B. Osteopathie)" },
      { value: "nothing", label: "Nein, noch nichts", exclusive: true },
    ],
  },
  {
    id: "movement_context",
    text: "Wie viel bewegst du dich an einem normalen Werktag?",
    type: "single_select",
    required: true,
    options: [
      { value: "sedentary", label: "Überwiegend sitzend" },
      { value: "mixed", label: "Mischung aus Sitzen und Aktivität" },
      { value: "active", label: "Überwiegend aktiv / auf den Beinen" },
      { value: "athletic", label: "Sportlich aktiv (>3× pro Woche)" },
    ],
  },
]

export const TOTAL_ITEMS = CHECK_ITEMS.length // 15

export function getItemByStep(step: number): CheckItem | undefined {
  return CHECK_ITEMS[step - 1]
}

export function getItemById(id: string): CheckItem | undefined {
  return CHECK_ITEMS.find((i) => i.id === id)
}

/** Estimated remaining minutes from the current step (spec §5.7: 18s/item). */
export function estimateRemainingMinutes(currentStep: number): number {
  return Math.max(1, Math.ceil(((TOTAL_ITEMS - currentStep + 1) * 18) / 60))
}
