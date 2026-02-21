"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Lock, CheckCircle2, PlayCircle } from "lucide-react"
import { KATEGORIE_LABELS } from "@/types/course"
import type { PatientCourseEnrollment, PatientCourseLesson } from "@/types/course"

export default function PatientCourseDetailPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>()
  const [data, setData] = useState<PatientCourseEnrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/me/courses/${enrollmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Kurs konnte nicht geladen werden.")
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setData(json as PatientCourseEnrollment)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [enrollmentId])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="space-y-3 mt-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-lg">
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-8 text-center">
          <p className="text-sm text-red-600 mb-4">{error ?? "Kurs nicht gefunden."}</p>
          <Link href="/app/courses">
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
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Link href="/app/courses">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 truncate">{data.course_name}</h1>
            <p className="text-xs text-slate-400">
              {KATEGORIE_LABELS[data.kategorie]} · {data.dauer_wochen} Wochen
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 font-medium">Fortschritt</span>
            <span className="font-bold text-emerald-600">{data.progress_percent}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${data.progress_percent}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {data.completed_count} von {data.total_count} Lektionen abgeschlossen
          </p>
        </div>
      </div>

      {/* Description */}
      {data.course_beschreibung && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <p className="text-sm text-slate-600">{data.course_beschreibung}</p>
        </div>
      )}

      {/* Lessons list */}
      <div className="space-y-2">
        <h2 className="font-semibold text-slate-700 px-1">Lektionen</h2>
        {data.lessons.map((lesson, index) => (
          <LessonItem
            key={lesson.lesson_id}
            lesson={lesson}
            index={index}
            enrollmentId={enrollmentId}
          />
        ))}
      </div>
    </div>
  )
}

function LessonItem({
  lesson,
  index,
  enrollmentId,
}: {
  lesson: PatientCourseLesson
  index: number
  enrollmentId: string
}) {
  const content = (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
        lesson.is_completed
          ? "bg-emerald-50 border-emerald-200"
          : lesson.is_unlocked
          ? "bg-white border-slate-200 hover:bg-slate-50"
          : "bg-slate-50 border-slate-100 opacity-60"
      }`}
    >
      {/* Number / Status icon */}
      <div className="shrink-0">
        {lesson.is_completed ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : lesson.is_unlocked ? (
          <PlayCircle className="h-6 w-6 text-emerald-600" />
        ) : (
          <Lock className="h-6 w-6 text-slate-300" />
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          lesson.is_completed ? "text-emerald-700" : "text-slate-700"
        }`}>
          {index + 1}. {lesson.title}
        </p>
        {lesson.is_completed && lesson.completed_at && (
          <p className="text-xs text-emerald-500 mt-0.5">
            Abgeschlossen am {new Date(lesson.completed_at).toLocaleDateString("de-DE")}
          </p>
        )}
      </div>
    </div>
  )

  if (!lesson.is_unlocked) return content

  return (
    <Link href={`/app/courses/${enrollmentId}/${lesson.lesson_id}`}>
      {content}
    </Link>
  )
}
