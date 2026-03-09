/**
 * Traumreise-Kurse — Content für 3 achtwöchige Stressbewältigungskurse
 *
 * Themen: Wald, Meer, Berge
 * Jede Lektion enthält:
 *  - Traumreise-Text (HTML, >200 Zeichen → TraumreisePlayer aktiv)
 *  - 1-2 Entspannungsübungen
 *
 * Progressiver 8-Wochen-Aufbau:
 *  1. Ankunft           — Einfache Visualisierung
 *  2. Sinneswahrnehmung — Fokus auf alle Sinne
 *  3. Körperreise       — Body Scan am Ort
 *  4. Atemübung         — Bewusstes Atmen
 *  5. Muskelentspannung — PME
 *  6. Achtsamkeit       — Gedanken beobachten
 *  7. Innerer Rückzugsort
 *  8. Integration       — Abschluss
 *
 * Lektions-Texte: ~2000-2500 Wörter pro Lektion (15-20 Min TTS)
 * Separate Dateien: traumreise-wald.ts, traumreise-meer.ts, traumreise-berge.ts
 */

import { WALD_LESSONS } from "./traumreise-wald"
import { MEER_LESSONS } from "./traumreise-meer"
import { BERGE_LESSONS } from "./traumreise-berge"

// ── Entspannungsübungen (werden in exercises-Tabelle geseeded) ──────────────

export interface RelaxationExerciseSeed {
  name: string
  beschreibung: string
  ausfuehrung: { nummer: number; beschreibung: string }[]
  muskelgruppen: string[]
  schwierigkeitsgrad: "anfaenger" | "mittel" | "fortgeschritten"
  standard_saetze: number
  standard_wiederholungen: number | null
  standard_dauer_sekunden: number | null
  standard_pause_sekunden: number
}

export const RELAXATION_EXERCISES: RelaxationExerciseSeed[] = [
  {
    name: "Bauchatmung (Diaphragma)",
    beschreibung:
      "Tiefe Bauchatmung zur Aktivierung des Parasympathikus. Fördert Entspannung und reduziert Stresshormone.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Bequem hinlegen oder hinsetzen, eine Hand auf den Bauch legen." },
      { nummer: 2, beschreibung: "Durch die Nase einatmen — der Bauch hebt sich, die Brust bleibt ruhig." },
      { nummer: 3, beschreibung: "Langsam durch den Mund ausatmen — der Bauch sinkt zurück." },
      { nummer: 4, beschreibung: "Einatmen für 4 Sekunden, ausatmen für 6 Sekunden." },
    ],
    muskelgruppen: ["Zwerchfell", "Core"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 120,
    standard_pause_sekunden: 0,
  },
  {
    name: "4-7-8 Atemtechnik",
    beschreibung:
      "Beruhigende Atemtechnik nach Dr. Andrew Weil. Einatmen für 4, halten für 7, ausatmen für 8 Zähler. Wirkt stark entspannend auf das Nervensystem.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen, Zungenspitze hinter die oberen Schneidezähne legen." },
      { nummer: 2, beschreibung: "Durch die Nase einatmen und dabei bis 4 zählen." },
      { nummer: 3, beschreibung: "Atem anhalten und bis 7 zählen." },
      { nummer: 4, beschreibung: "Durch den Mund ausatmen (mit Geräusch) und bis 8 zählen." },
      { nummer: 5, beschreibung: "8 Zyklen durchführen. Bei Schwindel Pause einlegen." },
    ],
    muskelgruppen: ["Zwerchfell"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: 8,
    standard_dauer_sekunden: null,
    standard_pause_sekunden: 0,
  },
  {
    name: "Progressive Muskelentspannung (Kurzform)",
    beschreibung:
      "Verkürzte Version der Progressiven Muskelrelaxation nach Jacobson. Muskelgruppen werden für 5 Sekunden angespannt und dann bewusst losgelassen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Bequem hinlegen, Augen schließen." },
      { nummer: 2, beschreibung: "Beide Fäuste fest ballen — 5 Sek. halten — loslassen, nachspüren." },
      { nummer: 3, beschreibung: "Schultern zu den Ohren hochziehen — 5 Sek. halten — fallen lassen." },
      { nummer: 4, beschreibung: "Gesicht zusammenkneifen — 5 Sek. halten — entspannen." },
      { nummer: 5, beschreibung: "Bauch anspannen — 5 Sek. halten — loslassen." },
      { nummer: 6, beschreibung: "Beine und Füße anspannen — 5 Sek. halten — entspannen." },
      { nummer: 7, beschreibung: "Zum Abschluss den ganzen Körper nachspüren und die Entspannung genießen." },
    ],
    muskelgruppen: ["Ganzkörper"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 300,
    standard_pause_sekunden: 0,
  },
  {
    name: "Body Scan Meditation",
    beschreibung:
      "Geführte Körperreise: Aufmerksamkeit wandert systematisch durch den ganzen Körper. Fördert Körperbewusstsein und löst unbewusste Verspannungen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Augen schließen, ruhig atmen." },
      { nummer: 2, beschreibung: "Aufmerksamkeit zu den Füßen lenken — Empfindungen wahrnehmen." },
      { nummer: 3, beschreibung: "Langsam aufwärts wandern: Unterschenkel, Knie, Oberschenkel." },
      { nummer: 4, beschreibung: "Weiter zu Becken, Bauch, Brust, Rücken." },
      { nummer: 5, beschreibung: "Dann Hände, Arme, Schultern, Nacken, Gesicht, Kopf." },
      { nummer: 6, beschreibung: "Bei jeder Region: Wahrnehmen, ohne zu bewerten. Loslassen." },
    ],
    muskelgruppen: ["Ganzkörper"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 600,
    standard_pause_sekunden: 0,
  },
  {
    name: "Achtsames Gehen",
    beschreibung:
      "Gehmeditation: Langsames, bewusstes Gehen mit Fokus auf jede Bewegung. Ideal als aktive Entspannungsübung für den Alltag.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht stehen, Gewicht gleichmäßig auf beiden Füßen." },
      { nummer: 2, beschreibung: "Langsam einen Fuß anheben — Bewegung bewusst wahrnehmen." },
      { nummer: 3, beschreibung: "Fuß absetzen, Gewicht verlagern. Jeden Schritt einzeln spüren." },
      { nummer: 4, beschreibung: "Tempo: deutlich langsamer als normal. 5 Minuten am Stück gehen." },
      { nummer: 5, beschreibung: "Gedanken kommen lassen und gehen lassen — Fokus auf die Füße." },
    ],
    muskelgruppen: ["Ganzkörper"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 300,
    standard_pause_sekunden: 0,
  },
  {
    name: "Schulter-Nacken-Entspannung",
    beschreibung:
      "Gezielte Entspannungsübung für den Schulter-Nacken-Bereich. Löst Verspannungen, die durch Stress und Bildschirmarbeit entstehen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen, Schultern bewusst fallen lassen." },
      { nummer: 2, beschreibung: "Kopf langsam zur rechten Seite neigen — 30 Sek. halten." },
      { nummer: 3, beschreibung: "Zurück zur Mitte, dann nach links — 30 Sek. halten." },
      { nummer: 4, beschreibung: "Schultern zu den Ohren hochziehen, 5 Sek. halten, fallen lassen." },
      { nummer: 5, beschreibung: "Langsame Kopfkreise: 5x rechts, 5x links." },
    ],
    muskelgruppen: ["Nacken", "Schulter", "HWS"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 5,
    standard_dauer_sekunden: 30,
    standard_pause_sekunden: 30,
  },
  {
    name: "Rücken-Dehnungsserie",
    beschreibung:
      "Sanfte Dehnungsfolge für den gesamten Rücken. Drei Positionen fließend nacheinander: Kindshaltung, Katze-Kuh, Rumpfrotation.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Kindshaltung: Knieend, Arme nach vorne, Stirn ablegen — 30 Sek." },
      { nummer: 2, beschreibung: "Vierfüßlerstand: Katze (Rücken runden) und Kuh (Rücken strecken) im Wechsel — 5x." },
      { nummer: 3, beschreibung: "Rückenlage: Knie zur Seite kippen lassen, Schultern am Boden — 30 Sek. pro Seite." },
    ],
    muskelgruppen: ["LWS", "Rücken", "HWS"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: 3,
    standard_dauer_sekunden: 30,
    standard_pause_sekunden: 15,
  },
  {
    name: "Atembeobachtung (Achtsamkeit)",
    beschreibung:
      "Einfache Achtsamkeitsmeditation: Den Atem beobachten, ohne ihn zu verändern. Trainiert die Fähigkeit, im Moment zu sein.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Bequem sitzen, Hände auf den Knien, Augen sanft schließen." },
      { nummer: 2, beschreibung: "Den natürlichen Atem beobachten — nicht verändern." },
      { nummer: 3, beschreibung: "Aufmerksamkeit auf die Nasenspitze oder den Bauch richten." },
      { nummer: 4, beschreibung: "Wenn Gedanken kommen: wahrnehmen, loslassen, zurück zum Atem." },
      { nummer: 5, beschreibung: "3 Minuten beginnen, langsam auf 10 Minuten steigern." },
    ],
    muskelgruppen: ["Zwerchfell"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 180,
    standard_pause_sekunden: 0,
  },
  {
    name: "Gedankenreise-Visualisierung",
    beschreibung:
      "Geführte Visualisierung: Einen sicheren, angenehmen Ort in der Vorstellung erschaffen und mit allen Sinnen erleben. Baut innere Ressourcen auf.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Augen schließen, 3 tiefe Atemzüge nehmen." },
      { nummer: 2, beschreibung: "Einen Ort vorstellen, an dem du dich sicher und wohl fühlst." },
      { nummer: 3, beschreibung: "Was siehst du? Farben, Licht, Formen." },
      { nummer: 4, beschreibung: "Was hörst du? Geräusche, Stille, Klänge." },
      { nummer: 5, beschreibung: "Was spürst du? Temperatur, Untergrund, Wind." },
      { nummer: 6, beschreibung: "5 Minuten verweilen. Dann langsam zurückkehren." },
    ],
    muskelgruppen: ["Ganzkörper"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 300,
    standard_pause_sekunden: 0,
  },
  {
    name: "Ganzkörper-Entspannung (Savasana)",
    beschreibung:
      "Tiefenentspannung in Rückenlage, inspiriert von der Yoga-Savasana. Vollständiges Loslassen aller Muskelspannung bei wachem Geist.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Beine leicht geöffnet, Arme neben dem Körper, Handflächen nach oben." },
      { nummer: 2, beschreibung: "Augen schließen. Jeden Körperteil bewusst entspannen: Füße, Beine, Becken, Bauch." },
      { nummer: 3, beschreibung: "Weiter: Brust, Arme, Hände, Schultern, Nacken, Gesicht." },
      { nummer: 4, beschreibung: "Atem fließen lassen. Körper wird schwer und warm." },
      { nummer: 5, beschreibung: "7 Minuten verweilen. Dann Finger und Zehen bewegen, sanft zurückkommen." },
    ],
    muskelgruppen: ["Ganzkörper"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 1,
    standard_wiederholungen: null,
    standard_dauer_sekunden: 420,
    standard_pause_sekunden: 0,
  },
]

// ── Kurs-/Lektions-Typen ─────────────────────────────────────────────────────

export interface TraumreiseCourseSeed {
  name: string
  beschreibung: string
  kategorie: "sonstiges"
  dauer_wochen: number
  unlock_mode: "sequentiell"
  lessons: TraumreiseLessonSeed[]
}

export interface TraumreiseLessonSeed {
  title: string
  beschreibung: string // HTML, >200 chars
  /** Names of exercises from RELAXATION_EXERCISES to attach */
  exerciseNames: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// KURS-DEFINITIONEN (Export)
// ═══════════════════════════════════════════════════════════════════════════════

export const TRAUMREISE_COURSES: TraumreiseCourseSeed[] = [
  {
    name: "Waldreise — Stressbewältigung",
    beschreibung:
      "Ein achtwöchiger Kurs mit geführten Traumreisen durch den Wald. Jede Woche entdeckst du einen neuen Aspekt der Entspannung — von der Ankunft im Wald über achtsames Wahrnehmen bis hin zu deinem persönlichen Kraftort. Begleitet von Waldgeräuschen und sanfter Sprachführung.",
    kategorie: "sonstiges",
    dauer_wochen: 8,
    unlock_mode: "sequentiell",
    lessons: WALD_LESSONS,
  },
  {
    name: "Meeresreise — Stressbewältigung",
    beschreibung:
      "Ein achtwöchiger Kurs mit geführten Traumreisen ans Meer. Jede Woche erlebst du das Meer auf neue Weise — vom ersten Spüren des Sandes bis hin zu deiner geheimen Bucht. Die Kraft der Wellen und die Weite des Horizonts begleiten dich in die Entspannung.",
    kategorie: "sonstiges",
    dauer_wochen: 8,
    unlock_mode: "sequentiell",
    lessons: MEER_LESSONS,
  },
  {
    name: "Bergreise — Stressbewältigung",
    beschreibung:
      "Ein achtwöchiger Kurs mit geführten Traumreisen in die Berge. Woche für Woche steigst du höher — von der Almwiese über den Bergsee bis zum Gipfel. Entdecke die Stärke der Felsen, die Stille der Höhe und die Geborgenheit einer Berghütte.",
    kategorie: "sonstiges",
    dauer_wochen: 8,
    unlock_mode: "sequentiell",
    lessons: BERGE_LESSONS,
  },
]
