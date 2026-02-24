"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Dumbbell, Calendar, Clock, ArrowRight } from "lucide-react"
import type { PatientAppAssignment } from "@/hooks/use-patient-app"

interface HeuteKarteProps {
  todayAssignments: PatientAppAssignment[]
  allAssignments?: PatientAppAssignment[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function countExercises(assignment: PatientAppAssignment): number {
  if (!assignment.plan) {
    return (assignment.adhoc_exercises ?? []).length
  }
  return assignment.plan.plan_phases.reduce((total, phase) => {
    return (
      total +
      phase.plan_units.reduce((uTotal, unit) => {
        return uTotal + unit.plan_exercises.length
      }, 0)
    )
  }, 0)
}

function estimateDurationMinutes(assignment: PatientAppAssignment): number {
  if (!assignment.plan) {
    const exercises = assignment.adhoc_exercises ?? []
    return exercises.reduce((total, ex) => {
      const setsTime = ex.saetze * (ex.dauer_sekunden ?? 30)
      const pauseTime = ex.saetze * ex.pause_sekunden
      return total + Math.round((setsTime + pauseTime) / 60)
    }, 0) || exercises.length * 3
  }

  let totalSeconds = 0
  for (const phase of assignment.plan.plan_phases) {
    for (const unit of phase.plan_units) {
      for (const ex of unit.plan_exercises) {
        const p = ex.params
        const setTime = p.dauer_sekunden ?? (p.wiederholungen ? p.wiederholungen * 3 : 30)
        totalSeconds += p.saetze * (setTime + p.pause_sekunden)
      }
    }
  }
  return Math.max(5, Math.round(totalSeconds / 60))
}

export function HeuteKarte({ todayAssignments, allAssignments = [] }: HeuteKarteProps) {
  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  // No training today — rest day card
  if (todayAssignments.length === 0) {
    const nextDay = allAssignments
      .map((a) => a.next_training_day)
      .filter((d): d is string => !!d)
      .sort()[0] ?? null

    return (
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Heute</p>
            <p className="text-sm font-semibold text-slate-600">{today}</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">Heute kein Training geplant. Genieß die Erholung!</p>
        {nextDay && (
          <p className="text-xs text-slate-400 mt-2">
            Nächstes Training:{" "}
            <span className="font-semibold text-slate-500">
              {formatDate(nextDay)}
            </span>
          </p>
        )}
      </div>
    )
  }

  // All done for today — success card
  const allDone = todayAssignments.every((a) => a.completed_today)
  if (allDone) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">Heute</p>
            <p className="text-sm font-semibold text-emerald-700">Training erledigt!</p>
          </div>
        </div>
        <p className="text-emerald-600 text-sm font-medium">
          Super gemacht! Du hast dein heutiges Training abgeschlossen.
        </p>
      </div>
    )
  }

  // Active training cards
  return (
    <div className="space-y-3">
      {todayAssignments.map((assignment) => {
        const exerciseCount = countExercises(assignment)
        const duration = estimateDurationMinutes(assignment)
        const isDone = assignment.completed_today

        return (
          <div
            key={assignment.id}
            className={`rounded-2xl border overflow-hidden ${
              isDone
                ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/60 shadow-sm"
                : "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 border-transparent text-white shadow-lg shadow-emerald-500/20"
            }`}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone ? "bg-emerald-100" : "bg-white/20 backdrop-blur-sm"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${
                        isDone ? "text-emerald-500" : "text-white/70"
                      }`}
                    >
                      Heute trainieren
                    </p>
                    <p
                      className={`text-base font-bold leading-tight ${
                        isDone ? "text-emerald-700" : "text-white"
                      }`}
                    >
                      {assignment.plan_name ?? "Training"}
                    </p>
                  </div>
                </div>
                {isDone && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 shrink-0">
                    Erledigt
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div
                className={`flex items-center gap-4 text-sm ${
                  isDone ? "text-emerald-600" : "text-white/80"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4" />
                  {exerciseCount} Übung{exerciseCount !== 1 ? "en" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  ca. {duration} Min.
                </span>
              </div>
            </div>

            {/* CTA */}
            {!isDone && (
              <Link href="/app/training" className="block">
                <div className="px-5 pb-5">
                  <div className="flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-white/90 font-semibold h-12 text-base rounded-xl transition-all duration-200 hover:shadow-lg cursor-pointer active:scale-[0.98]">
                    Training starten
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            )}

            {isDone && (
              <div className="px-5 pb-4">
                <p className="text-sm text-emerald-600 font-medium text-center">
                  Super! Komm morgen wieder.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── NoAssignmentState ─────────────────────────────────────────────────────────

export function NoAssignmentState() {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm p-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Dumbbell className="h-7 w-7 text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">
        Noch kein Trainingsplan
      </h3>
      <p className="text-sm text-slate-400">
        Dein Therapeut hat noch keinen Plan für dich erstellt. Du wirst hier benachrichtigt, sobald es losgeht.
      </p>
    </div>
  )
}
