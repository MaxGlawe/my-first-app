"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { KurseHeader } from "@/components/courses/KurseHeader"
import { KursGrid } from "@/components/courses/KursGrid"
import { useCourses } from "@/hooks/use-courses"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { CourseFilter, CourseKategorie, CourseListItem } from "@/types/course"

export default function KursePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [rawSearch, setRawSearch] = useState("")
  const [filter, setFilter] = useState<CourseFilter>("alle")
  const [kategorie, setKategorie] = useState<CourseKategorie | "">("")
  const [archivingCourse, setArchivingCourse] = useState<CourseListItem | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<CourseListItem | null>(null)

  const debouncedSearch = useDebounce(rawSearch, 300)

  const { courses, isLoading, error, refresh } = useCourses({
    filter,
    kategorie: kategorie || undefined,
    search: debouncedSearch,
  })

  const handleNewCourse = useCallback(async () => {
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Neuer Kurs",
          kategorie: "ganzkoerper",
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Kurs konnte nicht erstellt werden.")
      }

      const json = await res.json()
      router.push(`/os/courses/${json.course.id}`)
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Kurs konnte nicht erstellt werden.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  const handleArchiveConfirm = useCallback(async () => {
    if (!archivingCourse) return
    try {
      const res = await fetch(`/api/courses/${archivingCourse.id}/archive`, {
        method: "POST",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Archivieren fehlgeschlagen.")
      }
      refresh()
      toast({
        title: "Kurs archiviert",
        description: `„${archivingCourse.name}" wurde archiviert.`,
      })
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Archivieren fehlgeschlagen.",
        variant: "destructive",
      })
    } finally {
      setArchivingCourse(null)
    }
  }, [archivingCourse, refresh, toast])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingCourse) return
    try {
      const res = await fetch(`/api/courses/${deletingCourse.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Löschen fehlgeschlagen.")
      }
      refresh()
      toast({
        title: "Kurs gelöscht",
        description: `„${deletingCourse.name}" wurde gelöscht.`,
      })
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Löschen fehlgeschlagen.",
        variant: "destructive",
      })
    } finally {
      setDeletingCourse(null)
    }
  }, [deletingCourse, refresh, toast])

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <KurseHeader
        search={rawSearch}
        onSearchChange={setRawSearch}
        filter={filter}
        onFilterChange={setFilter}
        kategorie={kategorie}
        onKategorieChange={setKategorie}
        onNewCourse={handleNewCourse}
      />

      <KursGrid
        courses={courses}
        isLoading={isLoading}
        error={error}
        onNewCourse={handleNewCourse}
        onArchive={(course) => setArchivingCourse(course)}
        onDelete={(course) => setDeletingCourse(course)}
      />

      {/* Archive confirmation */}
      <AlertDialog open={!!archivingCourse} onOpenChange={(open) => !open && setArchivingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kurs archivieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Kurs „{archivingCourse?.name}" wirklich archivieren? Bestehende
              Einschreibungen bleiben erhalten, aber neue Einschreibungen sind nicht mehr möglich.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              Archivieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kurs löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Kurs „{deletingCourse?.name}" wirklich löschen? Diese Aktion kann
              nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
