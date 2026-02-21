"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus } from "lucide-react"
import type { LessonExercise } from "@/types/course"

interface Exercise {
  id: string
  name: string
  beschreibung: string | null
  media_url: string | null
  muskelgruppen: string[]
}

interface ExercisePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercise: LessonExercise) => void
}

export function ExercisePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: ExercisePickerDialogProps) {
  const [search, setSearch] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setIsLoading(true)

    const params = new URLSearchParams({ pageSize: "50", quelle: "alle" })
    if (search.trim()) params.set("search", search.trim())

    fetch(`/api/exercises?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setExercises(json.exercises ?? [])
      })
      .catch(() => {
        if (!cancelled) setExercises([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [open, search])

  const handleSelect = (exercise: Exercise) => {
    const lessonExercise: LessonExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      exercise_media_url: exercise.media_url,
      params: {
        saetze: 3,
        wiederholungen: 10,
        dauer_sekunden: null,
        pause_sekunden: 60,
        anmerkung: null,
      },
    }
    onSelect(lessonExercise)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Übung hinzufügen</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Übung suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {isLoading && (
            <div className="space-y-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Übungen gefunden.
            </p>
          )}

          {!isLoading &&
            exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelect(exercise)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                {exercise.media_url ? (
                  <img
                    src={exercise.media_url}
                    alt={exercise.name}
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{exercise.name}</p>
                  {exercise.muskelgruppen.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate">
                      {exercise.muskelgruppen.join(", ")}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
