/**
 * PROJ-23 / Phase 3: 7-Tage-Bewegungs-Roadmap modules per region (spec §6.6).
 *
 * ⚠️ The exact exercise instructions/videos are [TBD by Max]. The `technique`
 * hints and module names are spec defaults; descriptions are intentionally
 * neutral and HWG-safe (orientation, not outcome). Detailed instructions are
 * delivered later ("Anleitung folgt").
 */

export interface MovementModule {
  name: string
  technique: string
  duration: string
  description: string
}

const DESCRIPTIONS = {
  mobilisation: "Lockere, geführte Bewegung, um den Bereich behutsam in Bewegung zu bringen.",
  wahrnehmung: "Bewusst spüren, wie sich Bewegung anfühlt — ruhig und ohne Leistungsdruck.",
  stabilitaet: "Sanfte Aktivierung der tiefen, stabilisierenden Muskulatur.",
}

function trio(t1: string, t2: string, t3: string): MovementModule[] {
  return [
    { name: "Sanfte Mobilisation", technique: t1, duration: "5 Min.", description: DESCRIPTIONS.mobilisation },
    { name: "Aktive Wahrnehmung", technique: t2, duration: "5 Min.", description: DESCRIPTIONS.wahrnehmung },
    { name: "Tiefenstabilität", technique: t3, duration: "5 Min.", description: DESCRIPTIONS.stabilitaet },
  ]
}

const MOVEMENT_MODULES: Record<string, MovementModule[]> = {
  lower_back: trio("Beckenkippen + Cat-Cow", "Atemführung im Stand", "Side-Lying-Aktivierung"),
  neck: trio("Schulterkreisen + Kopfrotation", "Brustkorb-Atmung", "Chin-Tucks"),
  shoulder: trio("Pendelübungen", "Schulterblatt-Kontrolle", "Wand-Slides"),
  knee: trio("Knie-Pendel im Sitzen", "Standwaage mit Wandkontakt", "Quadrizeps-Aktivierung"),
  hip: trio("90/90 Hip Mobility", "Beckenboden-Wahrnehmung", "Glute-Bridges"),
  foot: trio("Sprunggelenk-Kreise", "Fuß-Abrollen im Stand", "Zehen-Greifen / intrinsische Aktivierung"),
}

/** Modules for a region. upper_back / multiple / other fall back to lower_back. */
export function getModulesForRegion(region: string): MovementModule[] {
  return MOVEMENT_MODULES[region] ?? MOVEMENT_MODULES.lower_back
}
