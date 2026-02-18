"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Dumbbell } from "lucide-react"
import { UebungsKarte } from "./UebungsKarte"
import type { Exercise } from "@/types/exercise"

interface UebungenGridProps {
  exercises: Exercise[]
  isLoading: boolean
  error: string | null
  onEdit: (exercise: Exercise) => void
  onDuplicate: (exercise: Exercise) => void
  onDelete: (exercise: Exercise) => void
  onFavoriteToggle: (exercise: Exercise) => void
  onViewDetail: (exercise: Exercise) => void
  isCurrentUserAdmin?: boolean
  currentUserId?: string
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden border bg-card">
          <Skeleton className="aspect-video w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function UebungenGrid({
  exercises,
  isLoading,
  error,
  onEdit,
  onDuplicate,
  onDelete,
  onFavoriteToggle,
  onViewDetail,
  isCurrentUserAdmin,
  currentUserId,
}: UebungenGridProps) {
  if (isLoading) {
    return <GridSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Dumbbell className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Keine Übungen gefunden</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Passe die Filter an oder erstelle eine neue Übung mit dem Button oben rechts.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {exercises.map((exercise) => (
        <UebungsKarte
          key={exercise.id}
          exercise={exercise}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onFavoriteToggle={onFavoriteToggle}
          onViewDetail={onViewDetail}
          isCurrentUserAdmin={isCurrentUserAdmin}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
