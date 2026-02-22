"use client"

import { TrainingsplanKarte } from "./TrainingsplanKarte"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, Plus } from "lucide-react"
import type { TrainingPlanListItem } from "@/types/training-plan"

interface TrainingsplanGridProps {
  plans: TrainingPlanListItem[]
  isLoading: boolean
  error: string | null
  onNewPlan: () => void
  onDuplicate: (plan: TrainingPlanListItem) => void
  onDelete: (plan: TrainingPlanListItem) => void
}

function SkeletonCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </div>
    </Card>
  )
}

export function TrainingsplanGrid({
  plans,
  isLoading,
  error,
  onNewPlan,
  onDuplicate,
  onDelete,
}: TrainingsplanGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-destructive font-medium mb-2">Fehler beim Laden</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (plans.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
        <CardContent className="py-16 text-center">
          <div className="rounded-full bg-emerald-100 p-5 mb-4 mx-auto w-fit">
            <ClipboardList className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Keine Trainingspläne gefunden</h3>
          <p className="text-slate-500 text-sm mb-6">
            Erstelle deinen ersten Trainingsplan und weise ihn Patienten zu.
          </p>
          <Button onClick={onNewPlan} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-sm">
            <Plus className="h-4 w-4" />
            Neuen Plan erstellen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <TrainingsplanKarte
          key={plan.id}
          plan={plan}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
