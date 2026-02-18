"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { TrainingsplaeneHeader } from "@/components/training-plans/TrainingsplaeneHeader"
import { TrainingsplanGrid } from "@/components/training-plans/TrainingsplanGrid"
import { useTrainingPlans } from "@/hooks/use-training-plans"
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
import type { PlanFilter, TrainingPlanListItem } from "@/types/training-plan"

export default function TrainingsplaenePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [rawSearch, setRawSearch] = useState("")
  const [filter, setFilter] = useState<PlanFilter>("alle")
  const [deletingPlan, setDeletingPlan] = useState<TrainingPlanListItem | null>(null)

  const debouncedSearch = useDebounce(rawSearch, 300)

  const { plans, isLoading, error, refresh } = useTrainingPlans({
    filter,
    search: debouncedSearch,
  })

  const handleNewPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/training-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Neuer Trainingsplan",
          beschreibung: "",
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Plan konnte nicht erstellt werden.")
      }

      const json = await res.json()
      router.push(`/os/training-plans/${json.plan.id}`)
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Plan konnte nicht erstellt werden.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  const handleDuplicate = useCallback(
    async (plan: TrainingPlanListItem) => {
      try {
        const res = await fetch(`/api/training-plans/${plan.id}/duplicate`, { method: "POST" })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? "Duplizieren fehlgeschlagen.")
        }
        refresh()
        toast({
          title: "Plan dupliziert",
          description: `„${plan.name}" wurde kopiert.`,
        })
      } catch (err) {
        toast({
          title: "Fehler",
          description: err instanceof Error ? err.message : "Duplizieren fehlgeschlagen.",
          variant: "destructive",
        })
      }
    },
    [refresh, toast]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingPlan) return
    try {
      const res = await fetch(`/api/training-plans/${deletingPlan.id}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Löschen fehlgeschlagen.")
      }
      refresh()
      toast({
        title: "Plan gelöscht",
        description: `„${deletingPlan.name}" wurde gelöscht.`,
      })
    } catch (err) {
      toast({
        title: "Fehler",
        description: err instanceof Error ? err.message : "Löschen fehlgeschlagen.",
        variant: "destructive",
      })
    } finally {
      setDeletingPlan(null)
    }
  }, [deletingPlan, refresh, toast])

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <TrainingsplaeneHeader
        search={rawSearch}
        onSearchChange={setRawSearch}
        filter={filter}
        onFilterChange={setFilter}
        onNewPlan={handleNewPlan}
      />

      <TrainingsplanGrid
        plans={plans}
        isLoading={isLoading}
        error={error}
        onNewPlan={handleNewPlan}
        onDuplicate={handleDuplicate}
        onDelete={(plan) => setDeletingPlan(plan)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingPlan} onOpenChange={(open) => !open && setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Plan „{deletingPlan?.name}" wirklich löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
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
