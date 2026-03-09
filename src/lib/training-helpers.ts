/**
 * Shared types and helpers for training sessions.
 * Used by both the original training page and the new Session Mode.
 */

import type { PatientAppAssignment } from "@/hooks/use-patient-app"

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
  }
}

export interface ExerciseFeedback {
  difficulty?: number
  pain_during?: number
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
          result.push({
            id: pe.id,
            exerciseId: pe.exercise_id,
            name: pe.exercises.name,
            muskelgruppen: pe.exercises.muskelgruppen ?? [],
            beschreibung: pe.exercises.beschreibung ?? null,
            ausfuehrung: pe.exercises.ausfuehrung ?? null,
            media_url: pe.exercises.media_url ?? null,
            media_type: pe.exercises.media_type ?? null,
            params: pe.params as FlatExercise["params"],
          })
        }
      }
    }
  } else {
    for (const ae of assignment.adhoc_exercises ?? []) {
      result.push({
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
    }
  }

  return result
}

// ── Duration Estimation ────────────────────────────────────────────────────────

export function estimateDuration(exercises: FlatExercise[]): number {
  let seconds = 0
  for (const ex of exercises) {
    const perSet = ex.params.dauer_sekunden ?? (ex.params.wiederholungen ?? 10) * 3
    const setsTime = ex.params.saetze * perSet
    const pauseTime = Math.max(0, ex.params.saetze - 1) * ex.params.pause_sekunden
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
