"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GraduationCap, BookOpen, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KATEGORIE_LABELS } from "@/types/course"
import type { CourseKategorie } from "@/types/course"

interface CourseInfo {
  id: string
  name: string
  beschreibung: string | null
  cover_image_url: string | null
  kategorie: CourseKategorie
  dauer_wochen: number
  lesson_count: number
}

export default function CourseJoinPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [course, setCourse] = useState<CourseInfo | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/courses/enroll/${token}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 410) throw new Error("Dieser Einladungslink ist nicht mehr gültig.")
          if (res.status === 404) throw new Error("Kurs nicht gefunden.")
          throw new Error("Fehler beim Laden des Kurses.")
        }
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setCourse(json.course)
        setIsEnrolled(json.is_enrolled)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [token])

  const handleJoin = useCallback(async () => {
    setIsJoining(true)
    try {
      const res = await fetch(`/api/courses/enroll/${token}`, { method: "POST" })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Einschreibung fehlgeschlagen.")
      }

      const json = await res.json()
      toast({
        title: "Erfolgreich eingeschrieben!",
        description: `Du bist jetzt im Kurs „${json.course_name}" eingeschrieben.`,
      })

      // Navigate to courses overview
      router.push("/app/courses")
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Einschreibung fehlgeschlagen.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }, [token, router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-lg">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-lg">
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Link ungültig</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Button variant="outline" onClick={() => router.push("/app/dashboard")}>
            Zum Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="container mx-auto py-12 px-4 max-w-lg">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with icon */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-sm text-emerald-100 mt-1">
            {KATEGORIE_LABELS[course.kategorie]} · {course.dauer_wochen} Wochen
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          {course.beschreibung && (
            <p className="text-sm text-slate-600">{course.beschreibung}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="h-4 w-4" />
            <span>{course.lesson_count} Lektionen</span>
          </div>

          {/* Action */}
          {isEnrolled ? (
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Du bist bereits eingeschrieben
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/app/courses")}
                >
                  Zu meinen Kursen
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              {isJoining ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GraduationCap className="mr-2 h-5 w-5" />
              )}
              Am Kurs teilnehmen
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
