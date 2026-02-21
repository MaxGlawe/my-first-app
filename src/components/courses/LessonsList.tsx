"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { LessonEditor } from "./LessonEditor"
import type { CourseLesson, LessonExercise } from "@/types/course"

export interface EditableLesson {
  id?: string
  title: string
  beschreibung: string | null
  video_url: string | null
  exercise_unit: LessonExercise[] | null
}

interface LessonsListProps {
  lessons: EditableLesson[]
  onLessonsChange: (lessons: EditableLesson[]) => void
  onAddExercise: (lessonIndex: number) => void
}

export function LessonsList({ lessons, onLessonsChange, onAddExercise }: LessonsListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const addLesson = () => {
    const newLesson: EditableLesson = {
      title: `Lektion ${lessons.length + 1}`,
      beschreibung: null,
      video_url: null,
      exercise_unit: null,
    }
    onLessonsChange([...lessons, newLesson])
    setExpandedIndex(lessons.length)
  }

  const removeLesson = (index: number) => {
    const updated = lessons.filter((_, i) => i !== index)
    onLessonsChange(updated)
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
  }

  const moveLesson = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= lessons.length) return
    const updated = [...lessons]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    onLessonsChange(updated)
    if (expandedIndex === index) setExpandedIndex(newIndex)
    else if (expandedIndex === newIndex) setExpandedIndex(index)
  }

  const updateLesson = (index: number, changes: Partial<EditableLesson>) => {
    const updated = lessons.map((l, i) => (i === index ? { ...l, ...changes } : l))
    onLessonsChange(updated)
  }

  const removeExercise = (lessonIndex: number, exerciseIndex: number) => {
    const lesson = lessons[lessonIndex]
    const exercises = [...(lesson.exercise_unit ?? [])]
    exercises.splice(exerciseIndex, 1)
    updateLesson(lessonIndex, {
      exercise_unit: exercises.length > 0 ? exercises : null,
    })
  }

  const updateExercise = (
    lessonIndex: number,
    exerciseIndex: number,
    changes: Partial<LessonExercise>
  ) => {
    const lesson = lessons[lessonIndex]
    const exercises = [...(lesson.exercise_unit ?? [])]
    exercises[exerciseIndex] = { ...exercises[exerciseIndex], ...changes }
    updateLesson(lessonIndex, { exercise_unit: exercises })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Lektionen ({lessons.length})
        </CardTitle>
        <Button size="sm" onClick={addLesson}>
          <Plus className="mr-2 h-4 w-4" />
          Lektion hinzufügen
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {lessons.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Lektionen. Füge die erste Lektion hinzu.
          </p>
        )}

        {lessons.map((lesson, index) => {
          const isExpanded = expandedIndex === index

          return (
            <div key={index} className="border rounded-lg">
              {/* Lesson header row */}
              <div className="flex items-center gap-2 p-3">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

                <span className="text-sm font-medium text-muted-foreground shrink-0 w-6">
                  {index + 1}.
                </span>

                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <Input
                  value={lesson.title}
                  onChange={(e) => updateLesson(index, { title: e.target.value })}
                  className="h-8 text-sm font-medium flex-1"
                  maxLength={200}
                />

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveLesson(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveLesson(index, "down")}
                    disabled={index === lessons.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeLesson(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <LessonEditor
                  lesson={lesson}
                  lessonIndex={index}
                  onUpdate={(changes) => updateLesson(index, changes)}
                  onAddExercise={() => onAddExercise(index)}
                  onRemoveExercise={(exIdx) => removeExercise(index, exIdx)}
                  onUpdateExercise={(exIdx, changes) =>
                    updateExercise(index, exIdx, changes)
                  }
                />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
