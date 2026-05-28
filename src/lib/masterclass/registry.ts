/**
 * Masterclass „Chronischer Kreuzschmerz" — Lektions-Registry
 * ==========================================================
 *
 * Metadaten aller 27 Lektionen (Track-Listing), gruppiert in 6 Sektionen. Dies
 * ist die Single Source of Truth für die Übersichts-Seite und die dynamische
 * Lektionsseite: welche Lektionen es gibt, ihre Reihenfolge, Modul-Zuordnung,
 * geschätzte Audio-Länge — und ob ihre Laufzeit-Daten bereits vorliegen
 * (`available`).
 *
 * `available: true` NUR für Lektionen, deren `lessons/<id>.ts` existiert und die
 * abspielbar sind. Aktuell sind ALLE 27 Lektionen (I.1 … O.2) gebaut und
 * verfügbar — die Masterclass ist komplett. Würde künftig eine weitere Lektion
 * via `node scripts/build-masterclass.mjs <id>` gebaut, wird hier `available: true`
 * gesetzt und sie in `loadLesson` registriert (siehe `src/lib/masterclass/load.ts`).
 *
 * lessonId = MD-ID (I.1 … I.3, 1.1 … 1.5, 2.1 … 2.7, 3.1 … 3.4, 4.1 … 4.6,
 * O.1 … O.2). Sie bestimmt Quell-, Daten- und Audio-Pfade.
 */

/** Schlüssel einer Sektion (Album-Struktur). */
export type SectionKey =
  | "intro"
  | "modul-1"
  | "modul-2"
  | "modul-3"
  | "modul-4"
  | "outro";

export interface MasterclassSection {
  key: SectionKey;
  /** Anzeigetitel der Sektion (z.B. „Modul 1 – Verstehen"). */
  title: string;
  /** Kurzes Schlagwort (z.B. „Verstehen"). */
  caption: string;
}

export interface LessonMeta {
  /** MD-ID = lessonId (z.B. „I.1", „4.6", „O.2"). */
  id: string;
  /** Anzeige-Nummer (= id, separat gehalten für künftige Abweichungen). */
  nr: string;
  /** Lektions-Titel. */
  title: string;
  /** Sektion, zu der die Lektion gehört. */
  section: SectionKey;
  /** Geschätzte Audio-Länge in Minuten (Schätzung für die Übersicht). */
  audioMinuten: number;
  /** true = Laufzeit-Daten vorhanden und abspielbar; false = „kommt noch". */
  available: boolean;
}

// ── Sektionen (Album-Struktur) ───────────────────────────────────────────────

export const MASTERCLASS_SECTIONS: MasterclassSection[] = [
  { key: "intro", title: "Intro", caption: "Ankommen & Spielregeln" },
  { key: "modul-1", title: "Modul 1 – Verstehen", caption: "Verstehen" },
  { key: "modul-2", title: "Modul 2 – Kurativ handeln", caption: "Kurativ handeln" },
  { key: "modul-3", title: "Modul 3 – Prävention", caption: "Prävention" },
  { key: "modul-4", title: "Modul 4 – Recoping", caption: "Recoping" },
  { key: "outro", title: "Outro", caption: "Übergabe" },
];

// ── Track-Listing (27 Lektionen) ─────────────────────────────────────────────
// Reihenfolge = Abspielreihenfolge. audioMinuten ist eine Schätzung (I.1 ~9 Min
// real; die übrigen sind grobe Planungswerte und werden mit dem Build präzisiert).

export const MASTERCLASS_LESSONS: LessonMeta[] = [
  // Intro (I.1–I.3)
  { id: "I.1", nr: "I.1", title: "Willkommen & Versprechen", section: "intro", audioMinuten: 9, available: true },
  { id: "I.2", nr: "I.2", title: "Die vielen Namen deines Schmerzes", section: "intro", audioMinuten: 9, available: true },
  { id: "I.3", nr: "I.3", title: "Der Red-Flag-Selbstcheck", section: "intro", audioMinuten: 7, available: true },

  // Modul 1 – Verstehen (1.1–1.5)
  { id: "1.1", nr: "1.1", title: "Anatomie LWS Teil 1", section: "modul-1", audioMinuten: 12, available: true },
  { id: "1.2", nr: "1.2", title: "Anatomie LWS Teil 2", section: "modul-1", audioMinuten: 13, available: true },
  { id: "1.3", nr: "1.3", title: "Was „chronisch“ wirklich bedeutet", section: "modul-1", audioMinuten: 12, available: true },
  { id: "1.4", nr: "1.4", title: "Das MRT-Paradox", section: "modul-1", audioMinuten: 10, available: true },
  { id: "1.5", nr: "1.5", title: "Dein Schmerzsystem als Alarmanlage", section: "modul-1", audioMinuten: 15, available: true },

  // Modul 2 – Kurativ handeln (2.1–2.7)
  { id: "2.1", nr: "2.1", title: "Bewegungsphilosophie", section: "modul-2", audioMinuten: 10, available: true },
  { id: "2.2", nr: "2.2", title: "Schmerzmodulierende Mobilisation", section: "modul-2", audioMinuten: 15, available: true },
  { id: "2.3", nr: "2.3", title: "Rumpftraining 1: Stabilisation", section: "modul-2", audioMinuten: 14, available: true },
  { id: "2.4", nr: "2.4", title: "Rumpftraining 2: Belastungstoleranz", section: "modul-2", audioMinuten: 14, available: true },
  { id: "2.5", nr: "2.5", title: "Atemmechanik & Beckenboden", section: "modul-2", audioMinuten: 10, available: true },
  { id: "2.6", nr: "2.6", title: "Belastungsdosierung & Pacing", section: "modul-2", audioMinuten: 9, available: true },
  { id: "2.7", nr: "2.7", title: "Schmerz-Coping", section: "modul-2", audioMinuten: 10, available: true },

  // Modul 3 – Prävention (3.1–3.4)
  { id: "3.1", nr: "3.1", title: "Belastbarkeit statt Schonung", section: "modul-3", audioMinuten: 8, available: true },
  { id: "3.2", nr: "3.2", title: "Haltungs-Mythen entzaubert", section: "modul-3", audioMinuten: 7, available: true },
  { id: "3.3", nr: "3.3", title: "Schlaf, Stress, Ernährung", section: "modul-3", audioMinuten: 11, available: true },
  { id: "3.4", nr: "3.4", title: "Bewegung im Alltag", section: "modul-3", audioMinuten: 7, available: true },

  // Modul 4 – Recoping (4.1–4.6)
  { id: "4.1", nr: "4.1", title: "Habit-Stacking", section: "modul-4", audioMinuten: 9, available: true },
  { id: "4.2", nr: "4.2", title: "Deine Ritual-Map", section: "modul-4", audioMinuten: 10, available: true },
  { id: "4.3", nr: "4.3", title: "Übungs-Katalog: Drei Schienen", section: "modul-4", audioMinuten: 7, available: true },
  { id: "4.4", nr: "4.4", title: "Schmerzadaptiv wählen", section: "modul-4", audioMinuten: 9, available: true },
  { id: "4.5", nr: "4.5", title: "Flare-up-Protokoll", section: "modul-4", audioMinuten: 10, available: true },
  { id: "4.6", nr: "4.6", title: "Selbst-Monitoring", section: "modul-4", audioMinuten: 9, available: true },

  // Outro (O.1–O.2)
  { id: "O.1", nr: "O.1", title: "Drei Kernbotschaften", section: "outro", audioMinuten: 6, available: true },
  { id: "O.2", nr: "O.2", title: "Die Übergabe", section: "outro", audioMinuten: 6, available: true },
];

// ── Helfer ────────────────────────────────────────────────────────────────────

/** Findet die Metadaten einer Lektion per id (oder undefined). */
export function getLessonMeta(id: string): LessonMeta | undefined {
  return MASTERCLASS_LESSONS.find((l) => l.id === id);
}

/** Liefert alle Lektionen einer Sektion (in Reihenfolge). */
export function getLessonsBySection(section: SectionKey): LessonMeta[] {
  return MASTERCLASS_LESSONS.filter((l) => l.section === section);
}

/** true, wenn die Lektion existiert UND abspielbar ist. */
export function isLessonAvailable(id: string): boolean {
  return !!getLessonMeta(id)?.available;
}

/**
 * Nächste VERFÜGBARE Lektion nach `id` (für „Weiter →"). undefined, wenn es
 * keine weitere verfügbare Lektion gibt.
 */
export function getNextAvailableLesson(id: string): LessonMeta | undefined {
  const idx = MASTERCLASS_LESSONS.findIndex((l) => l.id === id);
  if (idx < 0) return undefined;
  return MASTERCLASS_LESSONS.slice(idx + 1).find((l) => l.available);
}

/** Anzahl verfügbarer Lektionen (für Übersichts-Badge). */
export function availableLessonCount(): number {
  return MASTERCLASS_LESSONS.filter((l) => l.available).length;
}
