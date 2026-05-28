import type { WorkbookData } from "./types";
import { WORKBOOK_I1 } from "./i1";
import { WORKBOOK_I2 } from "./i2";
import { WORKBOOK_I3 } from "./i3";
import { WORKBOOK_M1_1 } from "./m1-1";
import { WORKBOOK_M1_2 } from "./m1-2";
import { WORKBOOK_M1_3 } from "./m1-3";
import { WORKBOOK_M1_4 } from "./m1-4";
import { WORKBOOK_M1_5 } from "./m1-5";
import { WORKBOOK_M2_1 } from "./m2-1";
import { WORKBOOK_2_2 } from "./m2-2";
import { WORKBOOK_M2_3 } from "./m2-3";
import { WORKBOOK_M2_4 } from "./m2-4";
import { WORKBOOK_M2_5 } from "./m2-5";
import { WORKBOOK_M2_6 } from "./m2-6";
import { WORKBOOK_M2_7 } from "./m2-7";
import { WORKBOOK_M3_1 } from "./m3-1";
import { WORKBOOK_M3_2 } from "./m3-2";
import { WORKBOOK_M3_3 } from "./m3-3";
import { WORKBOOK_M3_4 } from "./m3-4";
import { WORKBOOK_M4_1 } from "./m4-1";
import { WORKBOOK_M4_2 } from "./m4-2";
import { WORKBOOK_M4_3 } from "./m4-3";
import { WORKBOOK_M4_4 } from "./m4-4";
import { WORKBOOK_M4_5 } from "./m4-5";
import { WORKBOOK_M4_6 } from "./m4-6";
import { WORKBOOK_O1 } from "./o1";
import { WORKBOOK_O2 } from "./o2";

/**
 * Workbook-Registry — Single Source of Truth, welche Lektionen ein
 * interaktives Workbook haben. Alle 27 Lektionen der Masterclass
 * „Chronischer Kreuzschmerz" sind als interaktives Workbook hinterlegt.
 */
const WORKBOOKS: Record<string, WorkbookData> = {
  "I.1": WORKBOOK_I1,
  "I.2": WORKBOOK_I2,
  "I.3": WORKBOOK_I3,
  "1.1": WORKBOOK_M1_1,
  "1.2": WORKBOOK_M1_2,
  "1.3": WORKBOOK_M1_3,
  "1.4": WORKBOOK_M1_4,
  "1.5": WORKBOOK_M1_5,
  "2.1": WORKBOOK_M2_1,
  "2.2": WORKBOOK_2_2,
  "2.3": WORKBOOK_M2_3,
  "2.4": WORKBOOK_M2_4,
  "2.5": WORKBOOK_M2_5,
  "2.6": WORKBOOK_M2_6,
  "2.7": WORKBOOK_M2_7,
  "3.1": WORKBOOK_M3_1,
  "3.2": WORKBOOK_M3_2,
  "3.3": WORKBOOK_M3_3,
  "3.4": WORKBOOK_M3_4,
  "4.1": WORKBOOK_M4_1,
  "4.2": WORKBOOK_M4_2,
  "4.3": WORKBOOK_M4_3,
  "4.4": WORKBOOK_M4_4,
  "4.5": WORKBOOK_M4_5,
  "4.6": WORKBOOK_M4_6,
  "O.1": WORKBOOK_O1,
  "O.2": WORKBOOK_O2,
};

/** Workbook-Daten zu einer Lektions-ID (oder undefined, wenn keins existiert). */
export function getWorkbook(lessonId: string): WorkbookData | undefined {
  return WORKBOOKS[lessonId];
}

/** true, wenn für die Lektion ein interaktives Workbook bereitsteht. */
export function hasWorkbook(lessonId: string): boolean {
  return lessonId in WORKBOOKS;
}

/** Alle Lektions-IDs mit Workbook (für generateStaticParams). */
export function workbookLessonIds(): string[] {
  return Object.keys(WORKBOOKS);
}
