"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCourse } from "@/hooks/use-course"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { CourseBuilderHeader, type SaveStatus } from "@/components/courses/CourseBuilderHeader"
import { CourseSettingsPanel } from "@/components/courses/CourseSettingsPanel"
import { LessonsList, type EditableLesson } from "@/components/courses/LessonsList"
import { ExercisePickerDialog } from "@/components/courses/ExercisePickerDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { CourseKategorie, CourseUnlockMode, LessonExercise } from "@/types/course"

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const { course, lessons: initialLessons, isLoading, error } = useCourse(id)
  const isMounted = useRef(false)

  // Local state
  const [name, setName] = useState("")
  const [beschreibung, setBeschreibung] = useState("")
  const [kategorie, setKategorie] = useState<CourseKategorie>("ganzkoerper")
  const [dauerWochen, setDauerWochen] = useState(8)
  const [unlockMode, setUnlockMode] = useState<CourseUnlockMode>("sequentiell")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [lessons, setLessons] = useState<EditableLesson[]>([])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [isPublishing, setIsPublishing] = useState(false)

  // Exercise picker state
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false)
  const [exercisePickerLessonIndex, setExercisePickerLessonIndex] = useState<number>(0)

  // Sync from API data
  useEffect(() => {
    if (!course) return
    setName(course.name)
    setBeschreibung(course.beschreibung ?? "")
    setKategorie(course.kategorie)
    setDauerWochen(course.dauer_wochen)
    setUnlockMode(course.unlock_mode)
    setCoverImageUrl(course.cover_image_url ?? "")
    setLessons(
      initialLessons.map((l) => ({
        id: l.id,
        title: l.title,
        beschreibung: l.beschreibung,
        video_url: l.video_url,
        exercise_unit: l.exercise_unit,
      }))
    )
    // Mark as mounted after initial sync
    setTimeout(() => { isMounted.current = true }, 100)
  }, [course, initialLessons])

  // Mark unsaved on changes
  useEffect(() => {
    if (!isMounted.current) return
    setSaveStatus("unsaved")
  }, [name, beschreibung, kategorie, dauerWochen, unlockMode, coverImageUrl, lessons])

  // Debounced values for auto-save
  const debouncedName = useDebounce(name, 2000)
  const debouncedBeschreibung = useDebounce(beschreibung, 2000)
  const debouncedKategorie = useDebounce(kategorie, 2000)
  const debouncedDauerWochen = useDebounce(dauerWochen, 2000)
  const debouncedUnlockMode = useDebounce(unlockMode, 2000)
  const debouncedCoverImageUrl = useDebounce(coverImageUrl, 2000)
  const debouncedLessons = useDebounce(lessons, 2000)

  // Auto-save metadata
  const saveMetadata = useCallback(async () => {
    if (!id || !isMounted.current) return

    setSaveStatus("saving")
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Neuer Kurs",
          beschreibung: beschreibung.trim() || null,
          kategorie,
          dauer_wochen: dauerWochen,
          unlock_mode: unlockMode,
          cover_image_url: coverImageUrl.trim() || null,
        }),
      })

      if (!res.ok) {
        throw new Error("Metadaten konnten nicht gespeichert werden.")
      }
    } catch {
      setSaveStatus("unsaved")
      return
    }

    // Save lessons
    try {
      const res = await fetch(`/api/courses/${id}/lessons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessons: lessons.map((l) => ({
            title: l.title.trim() || "Unbenannte Lektion",
            beschreibung: l.beschreibung,
            video_url: l.video_url,
            exercise_unit: l.exercise_unit,
          })),
        }),
      })

      if (!res.ok) {
        throw new Error("Lektionen konnten nicht gespeichert werden.")
      }

      setSaveStatus("saved")
    } catch {
      setSaveStatus("unsaved")
      toast({
        title: "Speicherfehler",
        description: "Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }, [id, name, beschreibung, kategorie, dauerWochen, unlockMode, coverImageUrl, lessons, toast])

  // Auto-save trigger
  useEffect(() => {
    if (!isMounted.current) return
    saveMetadata()
  }, [
    debouncedName,
    debouncedBeschreibung,
    debouncedKategorie,
    debouncedDauerWochen,
    debouncedUnlockMode,
    debouncedCoverImageUrl,
    debouncedLessons,
  ])

  const handlePublish = useCallback(async () => {
    if (!id) return

    // Save first
    await saveMetadata()

    setIsPublishing(true)
    try {
      const res = await fetch(`/api/courses/${id}/publish`, { method: "POST" })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Veröffentlichung fehlgeschlagen.")
      }

      const json = await res.json()
      toast({
        title: "Kurs veröffentlicht!",
        description: `Version ${json.version} wurde veröffentlicht.`,
      })

      // Refresh page to get updated course data
      window.location.reload()
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Veröffentlichung fehlgeschlagen.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }, [id, saveMetadata, toast])

  const handleAddExercise = (lessonIndex: number) => {
    setExercisePickerLessonIndex(lessonIndex)
    setExercisePickerOpen(true)
  }

  const handleExerciseSelected = (exercise: LessonExercise) => {
    const updated = [...lessons]
    const lesson = updated[exercisePickerLessonIndex]
    const exercises = [...(lesson.exercise_unit ?? []), exercise]
    updated[exercisePickerLessonIndex] = { ...lesson, exercise_unit: exercises }
    setLessons(updated)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl space-y-4">
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !course) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error ?? "Kurs nicht gefunden."}</p>
            <Link href="/os/courses">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <CourseBuilderHeader
        name={name}
        onNameChange={setName}
        status={course.status}
        version={course.version}
        saveStatus={saveStatus}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        courseId={id}
      />

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content: Lessons */}
          <div className="lg:col-span-2">
            <LessonsList
              lessons={lessons}
              onLessonsChange={setLessons}
              onAddExercise={handleAddExercise}
            />
          </div>

          {/* Sidebar: Settings */}
          <div>
            <CourseSettingsPanel
              beschreibung={beschreibung}
              onBeschreibungChange={setBeschreibung}
              kategorie={kategorie}
              onKategorieChange={setKategorie}
              dauerWochen={dauerWochen}
              onDauerWochenChange={setDauerWochen}
              unlockMode={unlockMode}
              onUnlockModeChange={setUnlockMode}
              coverImageUrl={coverImageUrl}
              onCoverImageUrlChange={setCoverImageUrl}
            />
          </div>
        </div>
      </div>

      <ExercisePickerDialog
        open={exercisePickerOpen}
        onOpenChange={setExercisePickerOpen}
        onSelect={handleExerciseSelected}
      />
    </>
  )
}
