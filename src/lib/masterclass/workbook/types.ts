/**
 * Masterclass-Workbook — Typen
 * ============================
 *
 * Strukturierte Daten für die interaktive Workbook-Seite einer Lektion
 * (`/masterclass/chronischer-kreuzschmerz/workbook/<lessonId>`).
 *
 * Bewusst generisch gehalten, damit die Darstellung für ALLE 27 Lektionen
 * wiederverwendbar ist:
 *  - Der Lese-Teil ist eine Liste aus `ContentBlock` (Absätze, Listen,
 *    Tabellen, Bilder, Vertiefungen, Übungskarten, …).
 *  - Die Übung ist entweder der Red-Flag-Selbstcheck (Spezialfall I.3 mit
 *    Live-Auswertung) ODER eine komponierbare Liste interaktiver
 *    `ExerciseBlock`s (Schritte, Matrizen, Eingaben, Skalen, Notizen …),
 *    mit der sich praktisch jede Workbook-Übung abbilden lässt.
 *
 * HWG: Alle Texte sind 1:1 aus dem Master-Workbook übernommen
 * (Orientierung, keine Diagnose, keine Heilversprechen). Wortlaut nicht
 * verändern. Typografische Anführungszeichen verwenden — niemals ASCII-".
 */

// ════════════════════════════════════════════════════════════════════════
// Red-Flag-Selbstcheck (Spezialfall Lektion I.3, mit Live-Auswertung)
// ════════════════════════════════════════════════════════════════════════

/** Dringlichkeits-Stufe einer Red-Flag-Gruppe → steuert Live-Auswertung. */
export type Urgency = "sofort" | "zeitnah" | "rheuma" | "ok";

/** Ein ankreuzbares Warnsignal-Item innerhalb einer Gruppe. */
export interface CheckItem {
  /** Stabile ID (= MD-Nummer, z.B. „1.1") — auch localStorage-Key-Bestandteil. */
  id: string;
  /** Voller Wortlaut des Symptoms (aus der MD). */
  label: string;
}

/** Eine der fünf Red-Flag-Gruppen im Selbstcheck. */
export interface CheckGroup {
  /** z.B. „Gruppe 1". */
  key: string;
  /** Anzeige-Titel, z.B. „Neurologische Warnsignale". */
  title: string;
  /** Kurzer Untertitel/Klassifikation (z.B. „Tumor, Infektion, Fraktur"). */
  caption?: string;
  /**
   * Dringlichkeit, die EIN Treffer in dieser Gruppe auslöst.
   * - „sofort": jedes Ja → rot
   * - „zeitnah": jedes Ja → amber
   * - „rheuma": erst ab `triggerCount` Ja → amber
   */
  urgency: Exclude<Urgency, "ok">;
  /** Ab wie vielen Ja die Dringlichkeit greift (Default 1; Gruppe 5 = 2). */
  triggerCount?: number;
  /** Optionaler Einleitungssatz unter dem Gruppen-Titel. */
  intro?: string;
  /** Hinweis-Zeile zur Dringlichkeit der Gruppe (⚠️-Text aus der MD). */
  dringlichkeit: string;
  items: CheckItem[];
}

/** Ergebnis-Panel für eine bestimmte Auswertungs-Stufe. */
export interface OutcomePanel {
  level: Urgency;
  /** Überschrift des Panels (Handlungspfad). */
  heading: string;
  /** Fließtext (Handlungspfad-Wortlaut aus der MD). */
  body: string;
}

// ════════════════════════════════════════════════════════════════════════
// Lese-Teil — Inhaltsblöcke
// ════════════════════════════════════════════════════════════════════════

/** Eine beschriftete Zeile innerhalb einer Übungskarte (Position, Bewegung …). */
export interface ExerciseCardField {
  label: string;
  /** Einzeiliger/mehrzeiliger Wert (z.B. die Beschreibung der Bewegung). */
  text?: string;
  /** Alternative: Aufzählung (z.B. die drei Schienen Reizarm/Standard/Belastend). */
  items?: string[];
}

/** Inhalts-Block im Lese-Teil (vor der Übung). */
export type ContentBlock =
  | { kind: "lead"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string; eyebrow?: string }
  | { kind: "subheading"; text: string }
  | { kind: "callout"; text: string }
  | { kind: "vertiefung"; title: string; body: string[] }
  | { kind: "vignette"; title: string; body: string[] }
  | { kind: "keyTakeaway"; title?: string; body: string[] }
  | { kind: "bulletList"; title?: string; items: string[] }
  | { kind: "numberedList"; title?: string; items: string[] }
  | { kind: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { kind: "image"; src: string; alt: string; caption?: string }
  /** Strukturierte Übungs-Beschreibung mit optionalem Foto (z.B. ÜK-M1 … ÜK-M7). */
  | {
      kind: "exerciseCard";
      code: string;
      name: string;
      image?: { src: string; alt: string };
      fields: ExerciseCardField[];
    }
  // — Red-Flag-spezifische Blöcke (Lese-Teil von I.3) —
  | {
      kind: "flagGroup";
      n: number;
      title: string;
      intro?: string;
      signals: { code: string; name: string; text: string }[];
      dringlichkeit: string;
      tone: "sofort" | "zeitnah" | "rheuma";
    }
  | { kind: "yellowFlags"; intro: string; rows: { area: string; sign: string }[]; outro: string }
  | { kind: "abklaerung"; steps: { title: string; text: string }[] };

// ════════════════════════════════════════════════════════════════════════
// Interaktive Felder
// ════════════════════════════════════════════════════════════════════════

/** Reflexions-/Notizfeld (Textarea). */
export interface NoteField {
  /** Stabile ID — Teil des localStorage-Keys. */
  id: string;
  /** Beschriftung über dem Feld. */
  label: string;
  /** Optionaler Hilfstext darunter. */
  helper?: string;
  /** Anzahl Zeilen (Höhe). */
  rows?: number;
}

// ════════════════════════════════════════════════════════════════════════
// Übung — Variante A: komponierbare interaktive Blöcke (generisch)
// ════════════════════════════════════════════════════════════════════════

/**
 * Bausteine einer generischen Workbook-Übung. Jeder interaktive Block trägt
 * eine stabile `id`; sein Zustand wird in localStorage gespeichert:
 *  - Häkchen (checklist)      → checks[id]
 *  - Einzel-Auswahl/Matrix    → choices[id]  bzw. choices[`${id}:${rowId}`]
 *  - Textzeilen/Datum/Notiz   → notes[id]    bzw. notes[`${id}.a` | `.b`]
 *  - Skala                    → scales[id]
 */
export type ExerciseBlock =
  /** Schritt-Überschrift („SCHRITT 1 — RELEVANZ-BEWERTUNG"). */
  | { kind: "step"; n: number; title: string }
  /** Erläuternder Absatz innerhalb der Übung. */
  | { kind: "text"; text: string }
  /** Beispiel-/Hinweiszeile (dezent, kursiv). */
  | { kind: "hint"; text: string }
  /** Bewertungs-Matrix: je Zeile genau eine Spalte wählbar (Single-Select). */
  | {
      kind: "ratingMatrix";
      id: string;
      label?: string;
      columns: string[];
      rows: { id: string; label: string }[];
    }
  /** Freitext-Zeilen (z.B. „Meine drei Start-Übungen", Habit-Trigger). */
  | {
      kind: "lines";
      id: string;
      label?: string;
      lines: { id: string; prefix?: string; mid?: string }[];
    }
  /** Einzel-Auswahl (Radio), z.B. die Startschiene. */
  | {
      kind: "singleChoice";
      id: string;
      label?: string;
      options: { id: string; label: string; description?: string }[];
    }
  /** Mehrfach ankreuzbare Liste (optional mit Fortschritt). */
  | {
      kind: "checklist";
      id: string;
      label?: string;
      showProgress?: boolean;
      items: { id: string; label: string }[];
    }
  /** Skala 0–10 (Slider) mit Pol-Beschriftung. */
  | {
      kind: "scale";
      id: string;
      label: string;
      min?: number;
      max?: number;
      minLabel?: string;
      maxLabel?: string;
    }
  /** Reflexions-/Notiz-Textfeld. */
  | { kind: "note"; field: NoteField }
  /** Einzeiliges Datum-/Kurzfeld („Datum des Starts"). */
  | { kind: "date"; id: string; label: string }
  /** Bild innerhalb der Übung. */
  | { kind: "image"; src: string; alt: string; caption?: string };

// ════════════════════════════════════════════════════════════════════════
// Übung — Union (Red-Flag-Selbstcheck ODER generische Blöcke)
// ════════════════════════════════════════════════════════════════════════

/** Spezial-Übung von I.3: Red-Flag-Selbstcheck mit Live-Auswertung. */
export interface RedflagSelfcheckExercise {
  kind: "redflag-selfcheck";
  title: string;
  timing: string;
  anleitung: string[];
  groups: CheckGroup[];
  outcomes: OutcomePanel[];
  /** Reflexionsfelder direkt nach der Auswertung. */
  reflection: NoteField[];
  reflectionNote: string;
}

/** Generische Übung aus komponierbaren interaktiven Blöcken. */
export interface BlocksExercise {
  kind: "blocks";
  title: string;
  timing: string;
  /** „Theorie-Rückbindung" (optionaler Einstieg). */
  theorieRueckbindung?: string[];
  /** „Anleitung" (optional). */
  anleitung?: string[];
  blocks: ExerciseBlock[];
}

export type Exercise = RedflagSelfcheckExercise | BlocksExercise;

// ════════════════════════════════════════════════════════════════════════
// Komplette Workbook-Daten einer Lektion
// ════════════════════════════════════════════════════════════════════════

export interface WorkbookData {
  lessonId: string;
  nr: string;
  sectionLabel: string;
  title: string;
  subtitle: string;
  meta: { audio: string; lese: string; uebung: string };
  /** Lernziele (⭕). */
  objectives: string[];
  /** Lese-Teil (vor der Übung). */
  content: ContentBlock[];
  /** Die Übung (✏️). */
  exercise: Exercise;
  /** „Einordnung" — was der Check leistet / nicht leistet (nur I.3). */
  einordnung?: {
    intro: string;
    nichtLeistet: string[];
    sehrWohlLeistet: string[];
  };
  /** „Eine letzte wichtige Bemerkung" (optional). */
  letzteBemerkung?: { title: string; body: string[] };
  /** 🔁 Zusammenfassung (nummerierte Kernpunkte). */
  zusammenfassung: string[];
  /** 🔗 Querverweise. */
  querverweise: { label: string; text: string }[];
  /** 📝 Großes Notizfeld am Ende. */
  notizfeld: NoteField;
}
