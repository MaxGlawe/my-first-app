/**
 * Shared types and helpers for training sessions.
 * Used by both the original training page and the new Session Mode.
 */

import type { PatientAppAssignment } from "@/hooks/use-patient-app"
import { istProSeite } from "@/lib/exercise-sides"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FlatExercise {
  id: string
  exerciseId: string
  name: string
  muskelgruppen: string[]
  beschreibung: string | null
  ausfuehrung: Array<{ nummer: number; beschreibung: string }> | null
  media_url: string | null
  media_type: "image" | "video" | null
  params: {
    saetze: number
    wiederholungen?: number | null
    dauer_sekunden?: number | null
    pause_sekunden: number
    anmerkung?: string | null
    /** Explizit im Plan gesetzt — überstimmt die Texterkennung */
    pro_seite?: boolean | null
  }
  /** Stammdatum der Übung — gilt in allen Plänen */
  standardProSeite?: boolean | null
  /**
   * Wird die Übung pro Seite ausgeführt? Vorrang: Plan-Übung →
   * Übungs-Stammdatum → Texterkennung (für ungepflegten Altbestand).
   */
  proSeite: boolean
  /** Sätze je Seite (= params.saetze); Gesamtzahl der Durchgänge ist doppelt */
  saetzeProSeite: number
  /** Durchgänge insgesamt: bei „pro Seite" doppelt so viele wie Sätze */
  saetzeGesamt: number
}

export interface ExerciseFeedback {
  difficulty?: number
  pain_during?: number
}

// ── Seiten-Info anreichern ─────────────────────────────────────────────────────

/**
 * Ergänzt die Seiten-Information. Läuft beim Laden, nicht beim Speichern —
 * dadurch greifen Änderungen an der Erkennung auch für bestehende Pläne.
 */
function mitSeitenInfo(
  ex: Omit<FlatExercise, "proSeite" | "saetzeProSeite" | "saetzeGesamt">
): FlatExercise {
  const proSeite = istProSeite({ ...ex, standardProSeite: ex.standardProSeite })
  const saetzeProSeite = ex.params.saetze
  return {
    ...ex,
    proSeite,
    saetzeProSeite,
    saetzeGesamt: proSeite ? saetzeProSeite * 2 : saetzeProSeite,
  }
}

// ── Exercise Flattening ────────────────────────────────────────────────────────

export function flattenExercises(assignment: PatientAppAssignment): FlatExercise[] {
  const result: FlatExercise[] = []

  if (assignment.plan) {
    const sortedPhases = [...assignment.plan.plan_phases].sort((a, b) => a.order - b.order)
    for (const phase of sortedPhases) {
      const sortedUnits = [...phase.plan_units].sort((a, b) => a.order - b.order)
      for (const unit of sortedUnits) {
        const sortedExercises = [...unit.plan_exercises].sort((a, b) => a.order - b.order)
        for (const pe of sortedExercises) {
          if (!pe.exercises) continue
          const params = pe.params as FlatExercise["params"]
          result.push(
            mitSeitenInfo({
              id: pe.id,
              exerciseId: pe.exercise_id,
              name: pe.exercises.name,
              muskelgruppen: pe.exercises.muskelgruppen ?? [],
              beschreibung: pe.exercises.beschreibung ?? null,
              ausfuehrung: pe.exercises.ausfuehrung ?? null,
              media_url: pe.exercises.media_url ?? null,
              media_type: pe.exercises.media_type ?? null,
              standardProSeite: pe.exercises.standard_pro_seite ?? null,
              params,
            })
          )
        }
      }
    }
  } else {
    for (const ae of assignment.adhoc_exercises ?? []) {
      result.push(
        mitSeitenInfo({
          id: ae.exercise_id,
          exerciseId: ae.exercise_id,
          name: ae.exercise_name ?? "Übung",
          muskelgruppen: ae.muskelgruppen ?? [],
          beschreibung: ae.beschreibung ?? ae.anmerkung ?? null,
          ausfuehrung: ae.ausfuehrung ?? null,
          media_url: ae.media_url ?? null,
          media_type: ae.media_type ?? null,
          params: {
            saetze: ae.saetze,
            wiederholungen: ae.wiederholungen ?? null,
            dauer_sekunden: ae.dauer_sekunden ?? null,
            pause_sekunden: ae.pause_sekunden,
            anmerkung: ae.anmerkung ?? null,
          },
        })
      )
    }
  }

  return result
}

// ── Duration Estimation ────────────────────────────────────────────────────────

export function estimateDuration(exercises: FlatExercise[]): number {
  let seconds = 0
  for (const ex of exercises) {
    const perSet = ex.params.dauer_sekunden ?? (ex.params.wiederholungen ?? 10) * 3
    const setsTime = ex.saetzeGesamt * perSet
    const pauseTime = Math.max(0, ex.saetzeGesamt - 1) * ex.params.pause_sekunden
    seconds += setsTime + pauseTime + 10
  }
  return Math.ceil(seconds / 60)
}

// ── Format Helpers ─────────────────────────────────────────────────────────────

export function formatExerciseParams(ex: FlatExercise): string {
  const parts: string[] = []
  parts.push(`${ex.params.saetze}×`)
  if (ex.params.wiederholungen) {
    parts.push(`${ex.params.wiederholungen} Wdh.`)
  } else if (ex.params.dauer_sekunden) {
    parts.push(`${ex.params.dauer_sekunden}s`)
  }
  return parts.join("")
}
