"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, CheckCircle2, Dumbbell, Video, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PatientCourseEnrollment, PatientCourseLesson, LessonExercise } from "@/types/course"

export default function LessonPlayerPage() {
  const { enrollmentId, lessonId } = useParams<{ enrollmentId: string; lessonId: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [enrollment, setEnrollment] = useState<PatientCourseEnrollment | null>(null)
  const [lesson, setLesson] = useState<PatientCourseLesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/me/courses/${enrollmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((json: PatientCourseEnrollment) => {
        if (cancelled) return
        setEnrollment(json)
        const found = json.lessons?.find((l) => l.lesson_id === lessonId)
        setLesson(found ?? null)
      })
      .catch(() => {
        if (!cancelled) setLesson(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [enrollmentId, lessonId])

  const handleComplete = useCallback(async () => {
    setIsCompleting(true)
    try {
      const res = await fetch(`/api/me/courses/${enrollmentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Fehler beim Abschließen.")
      }

      const json = await res.json()

      toast({
        title: json.is_course_completed ? "Kurs abgeschlossen!" : "Lektion abgeschlossen!",
        description: json.is_course_completed
          ? "Herzlichen Glückwunsch, du hast alle Lektionen abgeschlossen!"
          : "Weiter so! Gehe zur nächsten Lektion.",
      })

      // Navigate back to course detail
      router.push(`/app/courses/${enrollmentId}`)
      router.refresh()
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Lektion konnte nicht abgeschlossen werden.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }, [enrollmentId, lessonId, router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-lg">
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-8 text-center">
          <p className="text-sm text-red-600 mb-4">Lektion nicht gefunden.</p>
          <Link href={`/app/courses/${enrollmentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/app/courses/${enrollmentId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-800 truncate">{lesson.title}</h1>
          <p className="text-xs text-slate-400">{enrollment?.course_name}</p>
        </div>
      </div>

      {/* Video */}
      {lesson.video_url && (
        <div className="rounded-2xl overflow-hidden bg-black aspect-video">
          {lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be") ? (
            <iframe
              src={lesson.video_url.replace("watch?v=", "embed/")}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={lesson.video_url}
              controls
              className="w-full h-full"
              playsInline
            >
              <p className="text-white text-center p-4">Video kann nicht abgespielt werden.</p>
            </video>
          )}
        </div>
      )}

      {/* Description */}
      {lesson.beschreibung && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div
            className="prose prose-sm max-w-none text-slate-600"
            dangerouslySetInnerHTML={{ __html: lesson.beschreibung }}
          />
        </div>
      )}

      {/* Exercises */}
      {lesson.exercise_unit && lesson.exercise_unit.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Dumbbell className="h-5 w-5 text-emerald-600" />
            Übungen ({lesson.exercise_unit.length})
          </h2>
          <div className="space-y-3">
            {lesson.exercise_unit.map((exercise, idx) => (
              <ExerciseCard key={idx} exercise={exercise} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Complete button */}
      {!lesson.is_completed && (
        <div className="pb-6">
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
          >
            {isCompleting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            )}
            Lektion abschließen
          </Button>
        </div>
      )}

      {lesson.is_completed && (
        <div className="pb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Lektion abgeschlossen
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ exercise, index }: { exercise: LessonExercise; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
      {exercise.exercise_media_url ? (
        <img
          src={exercise.exercise_media_url}
          alt={exercise.exercise_name ?? ""}
          className="w-14 h-14 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
          <Dumbbell className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">
          {exercise.exercise_name ?? `Übung ${index + 1}`}
        </p>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <span className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5">
            {exercise.params.saetze} Sätze
          </span>
          {exercise.params.wiederholungen && (
            <span className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5">
              {exercise.params.wiederholungen} Wdh.
            </span>
          )}
          {exercise.params.dauer_sekunden && (
            <span className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5">
              {exercise.params.dauer_sekunden}s
            </span>
          )}
          <span className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5">
            {exercise.params.pause_sekunden}s Pause
          </span>
        </div>
        {exercise.params.anmerkung && (
          <p className="text-xs text-slate-500 mt-1.5 italic">{exercise.params.anmerkung}</p>
        )}
      </div>
    </div>
  )
}
