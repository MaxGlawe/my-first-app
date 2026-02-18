"use client"

import { useState, useCallback, useEffect } from "react"
import { UebungenHeader } from "@/components/exercises/UebungenHeader"
import { UebungenGrid } from "@/components/exercises/UebungenGrid"
import { UebungsFormDialog } from "@/components/exercises/UebungsFormDialog"
import { UebungsDetailSheet } from "@/components/exercises/UebungsDetailSheet"
import { useExercises } from "@/hooks/use-exercises"
import { useDebounce } from "@/hooks/use-debounce"
import { useUserRole } from "@/hooks/use-user-role"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Exercise, ExerciseFilter, ExerciseFormValues } from "@/types/exercise"

const PAGE_SIZE = 24

const DEFAULT_FILTER: ExerciseFilter = {
  search: "",
  muskelgruppen: [],
  schwierigkeitsgrad: "",
  quelle: "alle",
}

export default function ExercisesPage() {
  const { isAdmin } = useUserRole()
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  const [rawFilter, setRawFilter] = useState<ExerciseFilter>(DEFAULT_FILTER)
  const [page, setPage] = useState(1)

  // Dialog / Sheet state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  const { toast } = useToast()

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(rawFilter.search, 300)
  const debouncedFilter: ExerciseFilter = {
    ...rawFilter,
    search: debouncedSearch,
  }

  const { exercises, totalCount, isLoading, error, refresh } = useExercises({
    filter: debouncedFilter,
    page,
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleFilterChange = useCallback((filter: ExerciseFilter) => {
    setRawFilter(filter)
    setPage(1)
  }, [])

  // --- CRUD handlers ---

  function handleNewExercise() {
    setEditingExercise(null)
    setFormDialogOpen(true)
  }

  function handleEdit(exercise: Exercise) {
    setDetailSheetOpen(false)
    setEditingExercise(exercise)
    setFormDialogOpen(true)
  }

  async function handleDuplicate(exercise: Exercise) {
    try {
      const res = await fetch(`/api/exercises/${exercise.id}/duplicate`, {
        method: "POST",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Duplizieren fehlgeschlagen.")
      }
      refresh()
      toast({
        title: "Übung dupliziert",
        description: `„${exercise.name}" wurde als eigene Kopie gespeichert.`,
      })
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Duplizieren fehlgeschlagen.",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(exercise: Exercise) {
    try {
      const res = await fetch(`/api/exercises/${exercise.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Löschen fehlgeschlagen.")
      }
      refresh()
      // Close detail sheet if we just deleted that exercise
      if (detailExercise?.id === exercise.id) {
        setDetailSheetOpen(false)
      }
      toast({
        title: "Übung gelöscht",
        description: `„${exercise.name}" wurde gelöscht.`,
      })
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Löschen fehlgeschlagen.",
        variant: "destructive",
      })
    }
  }

  async function handleFavoriteToggle(exercise: Exercise) {
    try {
      const res = await fetch(`/api/exercises/${exercise.id}/favorite`, {
        method: "POST",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Favorit konnte nicht gesetzt werden.")
      }
      refresh()
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Favorit konnte nicht gesetzt werden.",
        variant: "destructive",
      })
    }
  }

  async function handleSave(values: ExerciseFormValues) {
    const isEditing = !!editingExercise
    const url = isEditing
      ? `/api/exercises/${editingExercise!.id}`
      : "/api/exercises"
    const method = isEditing ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? "Speichern fehlgeschlagen.")
    }

    refresh()
    toast({
      title: isEditing ? "Übung aktualisiert" : "Übung erstellt",
      description: `„${values.name}" wurde erfolgreich ${isEditing ? "aktualisiert" : "erstellt"}.`,
    })
  }

  function handleViewDetail(exercise: Exercise) {
    setDetailExercise(exercise)
    setDetailSheetOpen(true)
  }

  const canEditExercise = useCallback(
    (exercise: Exercise) =>
      !exercise.is_public || isAdmin || exercise.created_by === userId,
    [isAdmin, userId]
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <UebungenHeader
        filter={rawFilter}
        onFilterChange={handleFilterChange}
        onNewExercise={handleNewExercise}
      />

      <UebungenGrid
        exercises={exercises}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onFavoriteToggle={handleFavoriteToggle}
        onViewDetail={handleViewDetail}
        isCurrentUserAdmin={isAdmin}
        currentUserId={userId}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage((p) => p - 1)
                  }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage((p) => p + 1)
                  }}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          {totalCount === 0
            ? "Keine Übungen gefunden"
            : `${totalCount} Übung${totalCount !== 1 ? "en" : ""} gefunden`}
        </p>
      )}

      {/* Form dialog (create / edit) */}
      <UebungsFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        exercise={editingExercise}
        isAdmin={isAdmin}
        onSave={handleSave}
      />

      {/* Detail sheet */}
      <UebungsDetailSheet
        exercise={detailExercise}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onFavoriteToggle={handleFavoriteToggle}
        canEdit={detailExercise ? canEditExercise(detailExercise) : false}
      />
    </div>
  )
}
