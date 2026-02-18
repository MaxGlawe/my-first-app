"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  usePatientApp,
  getTodayAssignments,
  getActiveAssignments,
} from "@/hooks/use-patient-app"
import type { PatientAppAssignment } from "@/hooks/use-patient-app"
import {
  Dumbbell,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
} from "lucide-react"

function countExercises(assignment: PatientAppAssignment): number {
  if (!assignment.plan) return (assignment.adhoc_exercises ?? []).length
  return assignment.plan.plan_phases.reduce(
    (t, ph) => t + ph.plan_units.reduce((u, unit) => u + unit.plan_exercises.length, 0),
    0
  )
}

function estimateDuration(assignment: PatientAppAssignment): number {
  if (!assignment.plan) {
    const exs = assignment.adhoc_exercises ?? []
    return (
      exs.reduce((t, ex) => {
        return t + Math.round((ex.saetze * ((ex.dauer_sekunden ?? 30) + ex.pause_sekunden)) / 60)
      }, 0) || exs.length * 3
    )
  }
  let secs = 0
  for (const ph of assignment.plan.plan_phases)
    for (const u of ph.plan_units)
      for (const ex of u.plan_exercises) {
        const p = ex.params
        secs += p.saetze * ((p.dauer_sekunden ?? (p.wiederholungen ? p.wiederholungen * 3 : 30)) + p.pause_sekunden)
      }
  return Math.max(5, Math.round(secs / 60))
}

function AssignmentCard({ assignment }: { assignment: PatientAppAssignment }) {
  const count = countExercises(assignment)
  const duration = estimateDuration(assignment)
  const isDone = assignment.completed_today

  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 transition-colors ${
        isDone ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDone ? "bg-emerald-100" : "bg-emerald-50"
            }`}
          >
            {isDone ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            ) : (
              <Dumbbell className="h-6 w-6 text-emerald-600" />
            )}
          </div>
          <div>
            <p className="text-base font-bold text-slate-800 leading-tight">
              {assignment.plan_name ?? "Training"}
            </p>
            {assignment.notiz && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{assignment.notiz}</p>
            )}
          </div>
        </div>
        {isDone && (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 shrink-0">Erledigt</Badge>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="h-4 w-4" />
          {count} Übung{count !== 1 ? "en" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          ca. {duration} Min.
        </span>
      </div>

      {isDone ? (
        <p className="text-sm text-emerald-600 font-medium">Heute bereits erledigt</p>
      ) : (
        <Link href={`/app/training/${assignment.id}`}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base rounded-xl font-semibold">
            Training starten
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function TrainingPage() {
  const { assignments, isLoading, error } = usePatientApp()

  const todayAssignments = getTodayAssignments(assignments)
  const activeAssignments = getActiveAssignments(assignments)

  // Assignments with training on other days (active but not today)
  const otherAssignments = activeAssignments.filter((a) => !a.is_training_today)

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/dashboard">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Training</h1>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Today's training */}
          {todayAssignments.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Heute
              </h2>
              {todayAssignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </section>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Heute kein Training</p>
              <p className="text-xs text-slate-400">Genieß den Ruhetag!</p>
            </div>
          )}

          {/* Other active plans */}
          {otherAssignments.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Andere aktive Pläne
              </h2>
              {otherAssignments.map((a) => {
                const count = countExercises(a)
                const duration = estimateDuration(a)
                return (
                  <div
                    key={a.id}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 opacity-70"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Dumbbell className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{a.plan_name ?? "Training"}</p>
                        <p className="text-xs text-slate-400">
                          Nächste Einheit:{" "}
                          {a.next_training_day
                            ? new Date(a.next_training_day).toLocaleDateString("de-DE", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>{count} Übungen</span>
                      <span>ca. {duration} Min.</span>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {/* No assignments at all */}
          {assignments.length === 0 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
              <Dumbbell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 mb-1">Kein Trainingsplan</p>
              <p className="text-xs text-slate-400">
                Dein Therapeut hat noch keinen Plan für dich erstellt.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
