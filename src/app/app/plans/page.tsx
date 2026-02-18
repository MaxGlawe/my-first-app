"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  usePatientApp,
  getActiveAssignments,
  getPastAssignments,
} from "@/hooks/use-patient-app"
import type { PatientAppAssignment } from "@/hooks/use-patient-app"
import {
  ArrowLeft,
  Dumbbell,
  ChevronRight,
  ChevronDown,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
} from "lucide-react"
import { useState } from "react"

const WOCHENTAG_LABELS: Record<string, string> = {
  mo: "Mo",
  di: "Di",
  mi: "Mi",
  do: "Do",
  fr: "Fr",
  sa: "Sa",
  so: "So",
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
  const e = new Date(end).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })
  return `${s} – ${e}`
}

function countExercises(assignment: PatientAppAssignment): number {
  if (!assignment.plan) return (assignment.adhoc_exercises ?? []).length
  return assignment.plan.plan_phases.reduce(
    (t, ph) => t + ph.plan_units.reduce((u, unit) => u + unit.plan_exercises.length, 0),
    0
  )
}

function PlanCard({
  assignment,
  isArchived = false,
}: {
  assignment: PatientAppAssignment
  isArchived?: boolean
}) {
  const compliance = assignment.compliance_7days ?? 0
  const exerciseCount = countExercises(assignment)
  const isTrainingToday = assignment.is_training_today && !isArchived

  const complianceColor =
    compliance >= 80 ? "text-emerald-600" : compliance >= 50 ? "text-amber-600" : "text-red-500"

  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 space-y-4 ${
        isArchived ? "bg-slate-50 border-slate-200 opacity-70" : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              isArchived ? "bg-slate-100" : "bg-emerald-50"
            }`}
          >
            <Dumbbell
              className={`h-5 w-5 ${isArchived ? "text-slate-400" : "text-emerald-600"}`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-800 leading-tight truncate">
              {assignment.plan_name ?? "Training"}
            </p>
            {assignment.plan_beschreibung && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {assignment.plan_beschreibung}
              </p>
            )}
          </div>
        </div>
        {isArchived ? (
          <Badge variant="secondary" className="shrink-0 text-xs">
            Abgelaufen
          </Badge>
        ) : isTrainingToday ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 shrink-0 text-xs">
            Heute
          </Badge>
        ) : null}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5" />
          <span>{exerciseCount} Übungen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{assignment.active_days.map((d) => WOCHENTAG_LABELS[d] ?? d).join(", ")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span className="truncate">{formatDateRange(assignment.start_date, assignment.end_date)}</span>
        </div>
      </div>

      {/* Compliance */}
      {!isArchived && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 font-medium">Compliance (7 Tage)</span>
            <span className={`text-xs font-bold ${complianceColor}`}>{compliance}%</span>
          </div>
          <Progress
            value={compliance}
            className={`h-2 ${compliance >= 80 ? "[&>div]:bg-emerald-500" : compliance >= 50 ? "[&>div]:bg-amber-400" : "[&>div]:bg-red-400"}`}
          />
        </div>
      )}

      {/* Completion stats */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>
          {assignment.completion_count ?? 0} von {assignment.expected_count ?? 0} Einheiten erledigt
        </span>
      </div>

      {/* CTA */}
      {!isArchived && isTrainingToday && !assignment.completed_today && (
        <Link href={`/app/training/${assignment.id}`}>
          <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
            Jetzt trainieren
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </Link>
      )}

      {!isArchived && isTrainingToday && assignment.completed_today && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Heute erledigt
        </div>
      )}

      {!isArchived && !isTrainingToday && assignment.next_training_day && (
        <p className="text-xs text-slate-400">
          Nächste Einheit:{" "}
          {new Date(assignment.next_training_day).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      )}
    </div>
  )
}

export default function PlansPage() {
  const { assignments, isLoading, error } = usePatientApp()
  const [archiveOpen, setArchiveOpen] = useState(false)

  const active = getActiveAssignments(assignments)
  const past = getPastAssignments(assignments)

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
          <h1 className="text-xl font-bold text-slate-800">Meine Pläne</h1>
          <p className="text-xs text-slate-400">{active.length} aktiv</p>
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
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Active plans */}
          <section className="space-y-4">
            {active.length > 0 ? (
              active.map((a) => <PlanCard key={a.id} assignment={a} />)
            ) : (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
                <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-1">Keine aktiven Pläne</p>
                <p className="text-xs text-slate-400">
                  Dein Therapeut hat noch keinen Plan für dich erstellt.
                </p>
              </div>
            )}
          </section>

          {/* Archived plans */}
          {past.length > 0 && (
            <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 gap-2 text-slate-500 rounded-xl"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${archiveOpen ? "rotate-180" : ""}`}
                  />
                  Abgelaufene Pläne ({past.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 mt-4">
                  {past.map((a) => (
                    <PlanCard key={a.id} assignment={a} isArchived />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  )
}
