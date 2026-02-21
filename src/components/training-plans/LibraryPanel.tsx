"use client"

import { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Star, GripVertical, Dumbbell, Plus } from "lucide-react"
import { useExercises } from "@/hooks/use-exercises"
import { useDebounce } from "@/hooks/use-debounce"
import { MUSKELGRUPPEN } from "@/types/exercise"
import type { Exercise } from "@/types/exercise"

// ---- Draggable exercise item ----
interface LibraryExerciseItemProps {
  exercise: Exercise
  onAdd?: (exercise: Exercise) => void
}

function LibraryExerciseItem({ exercise, onAdd }: LibraryExerciseItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-exercise-${exercise.id}`,
    data: {
      type: "library-exercise",
      exercise,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors group ${
        isDragging ? "shadow-lg" : ""
      }`}
      aria-label={`Übung ${exercise.name}`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Thumbnail */}
      {exercise.media_url && exercise.media_type === "image" ? (
        <img
          src={exercise.media_url}
          alt={exercise.name}
          className="h-10 w-10 rounded object-cover shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
          <Dumbbell className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{exercise.name}</p>
        {exercise.muskelgruppen.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            {exercise.muskelgruppen.slice(0, 3).join(", ")}
            {exercise.muskelgruppen.length > 3 && ` +${exercise.muskelgruppen.length - 3}`}
          </p>
        )}
      </div>

      {exercise.is_favorite && (
        <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 fill-amber-500" />
      )}

      {/* Add button */}
      {onAdd && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation()
            onAdd(exercise)
          }}
          aria-label={`${exercise.name} zum Plan hinzufügen`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// ---- Main Library Panel ----
export interface LibraryPanelProps {
  className?: string
  onAddExercise?: (exercise: Exercise) => void
}

export function LibraryPanel({ className, onAddExercise }: LibraryPanelProps) {
  const [rawSearch, setRawSearch] = useState("")
  const [muskelgruppe, setMuskelgruppe] = useState("__all__")
  const [favoritenOnly, setFavoritenOnly] = useState(false)

  const debouncedSearch = useDebounce(rawSearch, 300)

  const { exercises, isLoading, error } = useExercises({
    filter: {
      search: debouncedSearch,
      muskelgruppen: muskelgruppe && muskelgruppe !== "__all__" ? [muskelgruppe] : [],
      schwierigkeitsgrad: "",
      quelle: favoritenOnly ? "favoriten" : "alle",
    },
    page: 1,
  })

  return (
    <aside className={`flex flex-col border-r bg-muted/20 ${className ?? ""}`}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Übungsbibliothek</h2>
          <Button
            variant={favoritenOnly ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFavoritenOnly((v) => !v)}
            className="h-7 px-2 gap-1"
            aria-pressed={favoritenOnly}
            aria-label="Nur Favoriten anzeigen"
          >
            <Star className={`h-3.5 w-3.5 ${favoritenOnly ? "fill-amber-500 text-amber-500" : ""}`} />
            <span className="text-xs">Favoriten</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Übung suchen..."
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Muscle group filter */}
        <Select value={muskelgruppe} onValueChange={setMuskelgruppe}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Alle Muskelgruppen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Alle Muskelgruppen</SelectItem>
            {MUSKELGRUPPEN.map((mg) => (
              <SelectItem key={mg} value={mg}>
                {mg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 space-y-1.5">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border bg-card">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}

          {error && (
            <p className="text-sm text-destructive text-center py-4">{error}</p>
          )}

          {!isLoading && !error && exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keine Übungen gefunden
            </p>
          )}

          {!isLoading &&
            !error &&
            exercises.map((exercise) => (
              <LibraryExerciseItem
                key={exercise.id}
                exercise={exercise}
                onAdd={onAddExercise}
              />
            ))}
        </div>
      </div>

      {/* Count + hint */}
      {!isLoading && !error && (
        <div className="p-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {exercises.length} Übung{exercises.length !== 1 ? "en" : ""}
            {onAddExercise && " — Klicke + oder ziehe"}
          </p>
        </div>
      )}
    </aside>
  )
}
