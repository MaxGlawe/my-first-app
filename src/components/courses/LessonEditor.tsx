"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Dumbbell, Video } from "lucide-react"
import type { EditableLesson } from "./LessonsList"
import type { LessonExercise } from "@/types/course"

interface LessonEditorProps {
  lesson: EditableLesson
  lessonIndex: number
  onUpdate: (changes: Partial<EditableLesson>) => void
  onAddExercise: () => void
  onRemoveExercise: (exerciseIndex: number) => void
  onUpdateExercise: (exerciseIndex: number, changes: Partial<LessonExercise>) => void
}

export function LessonEditor({
  lesson,
  lessonIndex,
  onUpdate,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
}: LessonEditorProps) {
  const exercises = lesson.exercise_unit ?? []

  return (
    <div className="border-t p-4 space-y-4 bg-muted/30">
      {/* Description */}
      <div className="space-y-2">
        <Label>Beschreibung</Label>
        <Textarea
          value={lesson.beschreibung ?? ""}
          onChange={(e) => onUpdate({ beschreibung: e.target.value || null })}
          placeholder="Beschreibung der Lektion..."
          rows={4}
          maxLength={50000}
        />
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Video-URL
        </Label>
        <Input
          type="url"
          value={lesson.video_url ?? ""}
          onChange={(e) => onUpdate({ video_url: e.target.value || null })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      {/* Exercises */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Übungen ({exercises.length})
          </Label>
          <Button size="sm" variant="outline" onClick={onAddExercise}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            Übung hinzufügen
          </Button>
        </div>

        {exercises.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">
            Keine Übungen. Füge Übungen aus der Datenbank hinzu.
          </p>
        )}

        {exercises.map((exercise, exIdx) => (
          <div key={exIdx} className="border rounded-md p-3 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {exercise.exercise_name ?? `Übung ${exIdx + 1}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onRemoveExercise(exIdx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Exercise parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Sätze</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={exercise.params.saetze}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val)) {
                      onUpdateExercise(exIdx, {
                        params: { ...exercise.params, saetze: Math.max(1, Math.min(20, val)) },
                      })
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Wdh.</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={exercise.params.wiederholungen ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null
                    onUpdateExercise(exIdx, {
                      params: { ...exercise.params, wiederholungen: val },
                    })
                  }}
                  className="h-8 text-sm"
                  placeholder="-"
                />
              </div>
              <div>
                <Label className="text-xs">Sek.</Label>
                <Input
                  type="number"
                  min={1}
                  max={3600}
                  value={exercise.params.dauer_sekunden ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null
                    onUpdateExercise(exIdx, {
                      params: { ...exercise.params, dauer_sekunden: val },
                    })
                  }}
                  className="h-8 text-sm"
                  placeholder="-"
                />
              </div>
              <div>
                <Label className="text-xs">Pause (s)</Label>
                <Input
                  type="number"
                  min={0}
                  max={600}
                  value={exercise.params.pause_sekunden}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val)) {
                      onUpdateExercise(exIdx, {
                        params: { ...exercise.params, pause_sekunden: Math.max(0, Math.min(600, val)) },
                      })
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <Label className="text-xs">Anmerkung</Label>
              <Input
                value={exercise.params.anmerkung ?? ""}
                onChange={(e) =>
                  onUpdateExercise(exIdx, {
                    params: { ...exercise.params, anmerkung: e.target.value || null },
                  })
                }
                placeholder="Hinweis zur Ausführung..."
                className="h-8 text-sm"
                maxLength={500}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
