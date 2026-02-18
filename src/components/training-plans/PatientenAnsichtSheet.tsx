"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dumbbell, Clock, BarChart2, MessageSquare, CalendarDays } from "lucide-react"
import type { PlanPhase, PlanUnit, PlanExercise } from "@/types/training-plan"

interface PatientenAnsichtSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  beschreibung?: string | null
  phases: PlanPhase[]
}

function ExercisePreview({ exercise }: { exercise: PlanExercise }) {
  const { params } = exercise

  const paramParts: string[] = []
  if (params.saetze) paramParts.push(`${params.saetze} Sätze`)
  if (params.wiederholungen) paramParts.push(`${params.wiederholungen}× Wdh.`)
  if (params.dauer_sekunden) paramParts.push(`${params.dauer_sekunden}s`)
  if (params.pause_sekunden) paramParts.push(`${params.pause_sekunden}s Pause`)
  if (params.intensitaet_prozent) paramParts.push(`${params.intensitaet_prozent}% Intensität`)

  return (
    <div className="flex gap-3 py-3">
      {exercise.exercise_media_url && exercise.exercise_media_type === "image" ? (
        <img
          src={exercise.exercise_media_url}
          alt={exercise.exercise_name ?? "Übung"}
          className="h-14 w-14 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Dumbbell className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{exercise.exercise_name ?? "Unbekannte Übung"}</p>

        {exercise.exercise_muskelgruppen && exercise.exercise_muskelgruppen.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {exercise.exercise_muskelgruppen.slice(0, 3).map((mg) => (
              <Badge key={mg} variant="secondary" className="text-xs">
                {mg}
              </Badge>
            ))}
          </div>
        )}

        {paramParts.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <BarChart2 className="h-3 w-3" />
            {paramParts.join(" · ")}
          </p>
        )}

        {params.anmerkung && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
            {params.anmerkung}
          </p>
        )}
      </div>
    </div>
  )
}

function UnitPreview({ unit }: { unit: PlanUnit }) {
  if (unit.exercises.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground mb-1">
        <CalendarDays className="h-3.5 w-3.5" />
        {unit.name}
      </h4>
      <div className="divide-y">
        {unit.exercises.map((exercise) => (
          <ExercisePreview key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  )
}

function PhasePreview({ phase }: { phase: PlanPhase }) {
  const hasExercises = phase.units.some((u) => u.exercises.length > 0)
  if (!hasExercises) return null

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Phase header */}
      <div className="bg-muted px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{phase.name}</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {phase.dauer_wochen} Woche{phase.dauer_wochen !== 1 ? "n" : ""}
        </span>
      </div>

      {/* Units */}
      <div className="p-4 space-y-4">
        {phase.units.map((unit, i) => (
          <div key={unit.id}>
            {i > 0 && <Separator className="my-2" />}
            <UnitPreview unit={unit} />
          </div>
        ))}
      </div>
    </div>
  )
}

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0" side="right">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>{planName || "Trainingsplan"}</SheetTitle>
          {beschreibung && (
            <SheetDescription className="text-sm">{beschreibung}</SheetDescription>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" />
              {totalExercises} Übung{totalExercises !== 1 ? "en" : ""}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {phases.length} Phase{phases.length !== 1 ? "n" : ""}
            </span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {phases.length === 0 || totalExercises === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                Der Plan enthält noch keine Übungen.
              </p>
            ) : (
              phases.map((phase) => <PhasePreview key={phase.id} phase={phase} />)
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
