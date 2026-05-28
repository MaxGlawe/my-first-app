/**
 * Masterclass „Chronischer Kreuzschmerz" — geteilte Laufzeit-Typen
 * ================================================================
 *
 * Diese Datei ist die EINE Quelle der Slide-/Abschnitt-/Lektions-Typen. Sie wird
 * geteilt von:
 *   - allen generierten Lektions-Daten (`src/lib/masterclass/lessons/<id>.ts`),
 *   - dem Player (`src/components/masterclass/MasterclassPlayer.tsx`),
 *   - dem Build-Skript (`scripts/build-masterclass.mjs`, nur als Referenz).
 *
 * Früher lagen diese Typen in der I.1-Laufzeitdatei. Sie wurden hierher
 * extrahiert, damit 27 Lektionen + Player + Build dieselbe Definition nutzen.
 */

// ── Slide-Typen (diskriminierte Union) ──────────────────────────────────────

/** Gemeinsame Basis: Erscheinungszeit (Sek., relativ zum Abschnitt-Audio). */
export interface SlideTiming {
  /** Sekunde, ab der die Slide gezeigt wird (Auto-Sync via audio.currentTime). */
  appearTime: number;
}

/** Title-Card: Logo, Masterclass-Titel, Lektions-Untertitel. */
export interface TitleSlide extends SlideTiming {
  type: "title";
  kicker: string;
  lessonLabel: string;
}

/** Ein einzelnes großes Wort, sonst nichts (z.B. „Willkommen.", „Bereit?"). */
export interface WordSlide extends SlideTiming {
  type: "word";
  word: string;
}

/** Abstraktes Stillleben-Visual (CSS/SVG, kein Stockfoto). */
export interface VisualSlide extends SlideTiming {
  type: "visual";
  caption?: string;
}

/**
 * Dichte Inhalts-Slide: Headline (+ optional Kicker/Lead). Workhorse-Typ,
 * der die meisten Sinn-Segmente trägt. `dark` für markante Bruch-Momente.
 */
export interface ContentSlide extends SlideTiming {
  type: "content";
  headline: string;
  kicker?: string;
  lead?: string;
  dark?: boolean;
}

/** Hervorgehobener Kernbegriff (ein großes Wort/Phrase mit kleinem Kicker). */
export interface TermSlide extends SlideTiming {
  type: "term";
  term: string;
  kicker?: string;
  dark?: boolean;
}

/** Wörtliches Zitat / aufgegriffene Phrase, optisch hervorgehoben. */
export interface QuoteSlide extends SlideTiming {
  type: "quote";
  text: string;
  caption?: string;
  dark?: boolean;
}

/** Headline + gestaffelt erscheinende Stichpunkte (ohne Icons). */
export interface RevealListSlide extends SlideTiming {
  type: "reveal-list";
  title: string;
  items: RevealItem[];
  kicker?: string;
  dark?: boolean;
}

/** Modul-Spotlight: Nummer + Titel + (optional) Lead + gestaffelte Begriffe. */
export interface ModuleSlide extends SlideTiming {
  type: "module";
  number: string;
  title: string;
  lead?: string;
  items: RevealItem[];
}

/** „IST"-Liste mit Punkten + dezenten Icons. */
export interface ListSlide extends SlideTiming {
  type: "list";
  title: string;
  items: ListItem[];
}

/** Anti-Slide („NICHT IST"): dunkler Hintergrund, klarer visueller Bruch. */
export interface AntiListSlide extends SlideTiming {
  type: "anti-list";
  title: string;
  items: AntiItem[];
}

/** Großes Statement, eine Zeile, viel Weißraum. `emphasis` hebt ein Wort hervor. */
export interface StatementSlide extends SlideTiming {
  type: "statement";
  text: string;
  emphasis?: string;
}

/** Sprecher-Card: Portrait-Platzhalter + Name + Titel. */
export interface SpeakerSlide extends SlideTiming {
  type: "speaker";
  name: string;
  title: string;
}

/**
 * Mitlaufende Reise-Übersicht: vertikale Linie mit allen Stationen. `highlight`
 * markiert die aktuell genannte Station (Emerald, größer/fett); `detail` zeigt
 * deren Kernpunkte gestaffelt darunter. `caption` ist der Untertitel der
 * hervorgehobenen Station (z.B. „Verstehen").
 */
export interface TimelineSlide extends SlideTiming {
  type: "timeline";
  stations: TimelineStation[];
  /** Label der aktuell hervorgehobenen Station (z.B. „Modul 1" / „Intro"). */
  highlight?: string;
  /** Untertitel der hervorgehobenen Station. */
  caption?: string;
  /** Kernpunkte der hervorgehobenen Station (gestaffelt darunter). */
  detail?: TimelineDetail[];
}

/** Statement mit Kennzahlen. */
export interface StatsSlide extends SlideTiming {
  type: "stats";
  stats: StatItem[];
}

/** Checkliste mit Punkten + Icons; Häkchen erscheinen nacheinander. */
export interface ChecklistSlide extends SlideTiming {
  type: "checklist";
  items: ChecklistItem[];
}

/** Outro-Card: Ausblick auf die nächste Lektion + „Weiter →"-Hinweis. */
export interface OutroSlide extends SlideTiming {
  type: "outro";
  nextLabel: string;
  nextTitle: string;
  hint: string;
}

export type Slide =
  | TitleSlide
  | WordSlide
  | VisualSlide
  | ContentSlide
  | TermSlide
  | QuoteSlide
  | RevealListSlide
  | ModuleSlide
  | ListSlide
  | AntiListSlide
  | StatementSlide
  | SpeakerSlide
  | TimelineSlide
  | StatsSlide
  | ChecklistSlide
  | OutroSlide;

// ── Hilfs-Item-Typen ────────────────────────────────────────────────────────

/** Icon-Schlüssel für dezente Lucide-Icons (im Player gemappt). */
export type IconKey =
  | "toolbox"
  | "understand"
  | "exercise"
  | "integrate"
  | "workbook"
  | "pen"
  | "quiet";

export interface ListItem {
  icon: IconKey;
  label: string;
}

export interface ChecklistItem {
  icon: IconKey;
  label: string;
}

export interface RevealItem {
  label: string;
}

export interface AntiItem {
  label: string;
}

export interface TimelineStation {
  label: string;
  /** Legacy: statisches Highlight. Bevorzugt wird `TimelineSlide.highlight`. */
  highlighted?: boolean;
}

export interface TimelineDetail {
  label: string;
}

export interface StatItem {
  value: string;
  label: string;
}

// ── Abschnitt + Lektion ─────────────────────────────────────────────────────

export interface Section {
  title: string;
  audioSrc: string;
  transkript: string;
  slides: Slide[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  sections: Section[];
}

// ── Helfer (von allen Lektionen geteilt) ─────────────────────────────────────

/** Gesamtanzahl Slides einer Lektion. */
export function totalSlides(lesson: Lesson): number {
  return lesson.sections.reduce((sum, s) => sum + s.slides.length, 0);
}

/**
 * Flache Liste aller Slides mit Rückverweis auf den Abschnitt — praktisch für
 * den globalen Slide-Index im Player.
 */
export interface FlatSlide {
  slide: Slide;
  sectionIndex: number;
  slideInSection: number;
}

export function flatSlides(lesson: Lesson): FlatSlide[] {
  return lesson.sections.flatMap((section, sectionIndex) =>
    section.slides.map((slide, slideInSection) => ({
      slide,
      sectionIndex,
      slideInSection,
    })),
  );
}
