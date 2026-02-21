"use client"

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dumbbell,
  Clock,
  Flame,
  CalendarDays,
  ChevronRight,
  MessageSquare,
  Target,
  Zap,
  Timer,
  Repeat,
  ListOrdered,
} from "lucide-react"
import type { PlanPhase, PlanUnit, PlanExercise } from "@/types/training-plan"

interface PatientenAnsichtSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  beschreibung?: string | null
  phases: PlanPhase[]
}

// ---- Exercise Card (Apple Health style) ----
function ExerciseCard({ exercise, index }: { exercise: PlanExercise; index: number }) {
  const { params } = exercise

  return (
    <div className="flex gap-3.5 items-start">
      {/* Number badge */}
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-white">{index + 1}</span>
      </div>

      {/* Image or icon */}
      <div className="shrink-0">
        {exercise.exercise_media_url && exercise.exercise_media_type === "image" ? (
          <img
            src={exercise.exercise_media_url}
            alt={exercise.exercise_name ?? "Übung"}
            className="h-16 w-16 rounded-2xl object-cover shadow-sm"
          />
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-sm">
            <Dumbbell className="h-7 w-7 text-slate-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="font-semibold text-[15px] leading-tight">
          {exercise.exercise_name ?? "Übung"}
        </p>

        {/* Muscle groups as colored pills */}
        {exercise.exercise_muskelgruppen && exercise.exercise_muskelgruppen.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {exercise.exercise_muskelgruppen.slice(0, 3).map((mg) => (
              <span
                key={mg}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
              >
                {mg}
              </span>
            ))}
            {exercise.exercise_muskelgruppen.length > 3 && (
              <span className="text-[11px] text-muted-foreground">
                +{exercise.exercise_muskelgruppen.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {exercise.exercise_beschreibung && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {exercise.exercise_beschreibung}
          </p>
        )}

        {/* Params grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {params.saetze > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat className="h-3 w-3 text-teal-500" />
              {params.saetze} Sätze
            </span>
          )}
          {params.wiederholungen && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3 text-blue-500" />
              {params.wiederholungen} Wdh.
            </span>
          )}
          {params.dauer_sekunden && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="h-3 w-3 text-orange-500" />
              {params.dauer_sekunden}s
            </span>
          )}
          {params.pause_sekunden > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-purple-500" />
              {params.pause_sekunden}s Pause
            </span>
          )}
          {params.intensitaet_prozent && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-amber-500" />
              {params.intensitaet_prozent}%
            </span>
          )}
        </div>

        {/* Note */}
        {params.anmerkung && (
          <div className="mt-2 flex items-start gap-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-2.5 py-1.5">
            <MessageSquare className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{params.anmerkung}</p>
          </div>
        )}

        {/* Ausführung steps */}
        {exercise.exercise_ausfuehrung && exercise.exercise_ausfuehrung.length > 0 && (
          <div className="mt-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ListOrdered className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider">Ausführung</span>
            </div>
            <ol className="space-y-1">
              {exercise.exercise_ausfuehrung.map((step) => (
                <li key={step.nummer} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-teal-600 dark:text-teal-400 shrink-0">{step.nummer}.</span>
                  <span>{step.beschreibung}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Unit Section ----
function UnitPreview({ unit }: { unit: PlanUnit }) {
  if (unit.exercises.length === 0) return null

  return (
    <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
      {/* Unit header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{unit.name}</h4>
            <p className="text-[11px] text-muted-foreground">
              {unit.exercises.length} Übung{unit.exercises.length !== 1 ? "en" : ""}
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
      </div>

      {/* Exercises */}
      <div className="px-4 pb-4 space-y-4">
        {unit.exercises.map((exercise, i) => (
          <ExerciseCard key={exercise.id} exercise={exercise} index={i} />
        ))}
      </div>
    </div>
  )
}

// ---- Phase Section ----
function PhasePreview({ phase, phaseIndex }: { phase: PlanPhase; phaseIndex: number }) {
  const hasExercises = phase.units.some((u) => u.exercises.length > 0)
  if (!hasExercises) return null

  const totalPhaseExercises = phase.units.reduce((s, u) => s + u.exercises.length, 0)

  return (
    <div>
      {/* Phase header pill */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">{phase.name}</h3>
          <p className="text-xs text-muted-foreground">
            {phase.dauer_wochen} Woche{phase.dauer_wochen !== 1 ? "n" : ""} · {totalPhaseExercises} Übung{totalPhaseExercises !== 1 ? "en" : ""}
          </p>
        </div>
      </div>

      {/* Units */}
      <div className="space-y-3 ml-1">
        {phase.units.map((unit) => (
          <UnitPreview key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  )
}

// ---- Stat Ring (Apple Health style) ----
function StatRing({
  value,
  label,
  color,
  icon: Icon,
}: {
  value: string | number
  label: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`h-14 w-14 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ---- Main Sheet ----
export function PatientenAnsichtSheet({
  open,
  onOpenChange,
  planName,
  beschreibung,
  phases,
}: PatientenAnsichtSheetProps) {
  const totalExercises = phases.reduce(
    (sum, phase) => sum + phase.units.reduce((uSum, unit) => uSum + unit.exercises.length, 0),
    0
  )
  const totalUnits = phases.reduce((sum, phase) => sum + phase.units.filter((u) => u.exercises.length > 0).length, 0)
  const totalWeeks = phases.reduce((sum, phase) => sum + phase.dauer_wochen, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0" side="right">
        {/* Hero Header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative px-6 pt-14 pb-6">
            <p className="text-teal-100 text-xs font-medium uppercase tracking-wider mb-1">Trainingsplan</p>
            <h2 className="text-white text-2xl font-bold leading-tight mb-2">
              {planName || "Mein Trainingsplan"}
            </h2>
            {beschreibung && (
              <p className="text-teal-100 text-sm leading-relaxed">{beschreibung}</p>
            )}
          </div>

          {/* Stats row overlapping the gradient */}
          <div className="relative px-6 pb-4">
            <div className="bg-card rounded-2xl shadow-lg border p-4 flex justify-around">
              <StatRing
                value={totalExercises}
                label={totalExercises !== 1 ? "Übungen" : "Übung"}
                color="bg-gradient-to-br from-teal-500 to-emerald-600"
                icon={Dumbbell}
              />
              <StatRing
                value={totalUnits}
                label={totalUnits !== 1 ? "Tage" : "Tag"}
                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                icon={CalendarDays}
              />
              <StatRing
                value={totalWeeks}
                label={totalWeeks !== 1 ? "Wochen" : "Woche"}
                color="bg-gradient-to-br from-purple-500 to-violet-600"
                icon={Clock}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-5 pb-8 pt-2 space-y-6">
            {phases.length === 0 || totalExercises === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Der Plan enthält noch keine Übungen.
                </p>
              </div>
            ) : (
              phases.map((phase, i) => (
                <PhasePreview key={phase.id} phase={phase} phaseIndex={i} />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
