/**
 * Masterclass „Chronischer Kreuzschmerz" — Lektions-Loader
 * ========================================================
 *
 * Mappt eine lessonId (MD-ID) auf ihre fertigen Laufzeit-Daten aus
 * `src/lib/masterclass/lessons/<id>.ts`. Nur HIER werden gebaute Lektionen
 * registriert — die Registry (`registry.ts`) trägt parallel `available: true`.
 *
 * Neue Lektion freischalten (nach `node scripts/build-masterclass.mjs <id>`):
 *   1. Import unten ergänzen: `import lessonX from "./lessons/<id>";`
 *   2. Eintrag in LESSON_DATA: `"<id>": lessonX,`
 *   3. In registry.ts `available: true` für `<id>` setzen.
 *
 * Statische Imports (kein dynamic import), damit Next.js die Lektionen
 * bundlen/tree-shaken kann und die Seite synchron rendert.
 */

import type { Lesson } from "./types";
import lesson_I_1 from "./lessons/I.1";
import lesson_I_2 from "./lessons/I.2";
import lesson_I_3 from "./lessons/I.3";
import lesson_1_1 from "./lessons/1.1";
import lesson_1_2 from "./lessons/1.2";
import lesson_1_3 from "./lessons/1.3";
import lesson_1_4 from "./lessons/1.4";
import lesson_1_5 from "./lessons/1.5";
import lesson_2_1 from "./lessons/2.1";
import lesson_2_2 from "./lessons/2.2";
import lesson_2_3 from "./lessons/2.3";
import lesson_2_4 from "./lessons/2.4";
import lesson_2_5 from "./lessons/2.5";
import lesson_2_6 from "./lessons/2.6";
import lesson_2_7 from "./lessons/2.7";
import lesson_3_1 from "./lessons/3.1";
import lesson_3_2 from "./lessons/3.2";
import lesson_3_3 from "./lessons/3.3";
import lesson_3_4 from "./lessons/3.4";
import lesson_4_1 from "./lessons/4.1";
import lesson_4_2 from "./lessons/4.2";
import lesson_4_3 from "./lessons/4.3";
import lesson_4_4 from "./lessons/4.4";
import lesson_4_5 from "./lessons/4.5";
import lesson_4_6 from "./lessons/4.6";
import lesson_O_1 from "./lessons/O.1";
import lesson_O_2 from "./lessons/O.2";

/** Registrierte, abspielbare Lektionen (lessonId → Lesson-Daten). */
const LESSON_DATA: Record<string, Lesson> = {
  "I.1": lesson_I_1,
  "I.2": lesson_I_2,
  "I.3": lesson_I_3,
  "1.1": lesson_1_1,
  "1.2": lesson_1_2,
  "1.3": lesson_1_3,
  "1.4": lesson_1_4,
  "1.5": lesson_1_5,
  "2.1": lesson_2_1,
  "2.2": lesson_2_2,
  "2.3": lesson_2_3,
  "2.4": lesson_2_4,
  "2.5": lesson_2_5,
  "2.6": lesson_2_6,
  "2.7": lesson_2_7,
  "3.1": lesson_3_1,
  "3.2": lesson_3_2,
  "3.3": lesson_3_3,
  "3.4": lesson_3_4,
  "4.1": lesson_4_1,
  "4.2": lesson_4_2,
  "4.3": lesson_4_3,
  "4.4": lesson_4_4,
  "4.5": lesson_4_5,
  "4.6": lesson_4_6,
  "O.1": lesson_O_1,
  "O.2": lesson_O_2,
};

/** Lädt die Laufzeit-Daten einer Lektion (oder null, wenn nicht verfügbar). */
export function loadLesson(id: string): Lesson | null {
  return LESSON_DATA[id] ?? null;
}
