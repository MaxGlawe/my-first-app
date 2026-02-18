"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { use } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { BuilderHeader } from "@/components/training-plans/BuilderHeader"
import { LibraryPanel } from "@/components/training-plans/LibraryPanel"
import { PlanCanvas } from "@/components/training-plans/PlanCanvas"
import { PatientenAnsichtSheet } from "@/components/training-plans/PatientenAnsichtSheet"
import { useTrainingPlan } from "@/hooks/use-training-plan"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { nanoid } from "@/components/training-plans/plan-utils"
import type { PlanPhase, PlanUnit, PlanExercise, TrainingPlan, UndoEntry } from "@/types/training-plan"
import type { Exercise } from "@/types/exercise"
import { Dumbbell, Layers } from "lucide-react"

const MAX_UNDO = 10

type SaveStatus = "saved" | "saving" | "unsaved"

interface DragActiveItem {
  type: "library-exercise"
  exercise: Exercise
}

interface BuilderPageProps {
  params: Promise<{ id: string }>
}

export default function TrainingsplanBuilderPage({ params }: BuilderPageProps) {
  const { id } = use(params)
  const { plan, isLoading, error } = useTrainingPlan(id)
  const { toast } = useToast()

  // ---- Local state ----
  const [planName, setPlanName] = useState("")
  const [beschreibung, setBeschreibung] = useState("")
  const [isTemplate, setIsTemplate] = useState(false)
  const [phases, setPhases] = useState<PlanPhase[]>([])

  // Undo stack
  const undoStack = useRef<UndoEntry[]>([])

  // BUG-14 FIX: Refs to capture current values when undo entries are pushed.
  // Using refs (not closure state) ensures pushUndo always captures the latest values
  // even when called from inside setPhases() functional updater.
  const planNameRef = useRef("")
  const beschreibungRef = useRef("")
  const isTemplateRef = useRef(false)
  useEffect(() => { planNameRef.current = planName }, [planName])
  useEffect(() => { beschreibungRef.current = beschreibung }, [beschreibung])
  useEffect(() => { isTemplateRef.current = isTemplate }, [isTemplate])

  // Save status
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")

  // Preview sheet
  const [previewOpen, setPreviewOpen] = useState(false)

  // Drag state
  const [activeItem, setActiveItem] = useState<DragActiveItem | null>(null)

  // ---- Sync from API ----
  useEffect(() => {
    if (!plan) return
    setPlanName(plan.name)
    setBeschreibung(plan.beschreibung ?? "")
    setIsTemplate(plan.is_template)
    setPhases(plan.phases ?? [])
    setSaveStatus("saved")
    undoStack.current = []
  }, [plan])

  // ---- Keyboard shortcut: Ctrl+Z ----
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Undo ----
  // BUG-14 FIX: pushUndo now captures the full plan state (phases + name + beschreibung + isTemplate)
  function pushUndo(prevPhases: PlanPhase[]) {
    undoStack.current = [
      {
        phases: prevPhases,
        name: planNameRef.current,
        beschreibung: beschreibungRef.current,
        isTemplate: isTemplateRef.current,
      },
      ...undoStack.current.slice(0, MAX_UNDO - 1),
    ]
  }

  function handleUndo() {
    const entry = undoStack.current[0]
    if (!entry) return
    undoStack.current = undoStack.current.slice(1)
    setPhases(entry.phases)
    // BUG-14 FIX: restore name/beschreibung/isTemplate too
    setPlanName(entry.name)
    setBeschreibung(entry.beschreibung)
    setIsTemplate(entry.isTemplate)
    setSaveStatus("unsaved")
  }

  // ---- Phases change with undo ----
  const changePhasesWithUndo = useCallback((newPhases: PlanPhase[]) => {
    setPhases((prev) => {
      pushUndo(prev)
      return newPhases
    })
    setSaveStatus("unsaved")
  }, [])

  // ---- Auto-save with 2s debounce ----
  const debouncedPlanName = useDebounce(planName, 2000)
  const debouncedBeschreibung = useDebounce(beschreibung, 2000)
  const debouncedPhases = useDebounce(phases, 2000)
  const debouncedIsTemplate = useDebounce(isTemplate, 2000)

  const isMounted = useRef(false)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    if (!plan) return
    savePlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPlanName, debouncedBeschreibung, debouncedPhases, debouncedIsTemplate])

  async function savePlan() {
    setSaveStatus("saving")
    try {
      const res = await fetch(`/api/training-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planName,
          beschreibung,
          is_template: isTemplate,
          phases,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Speichern fehlgeschlagen.")
      }
      setSaveStatus("saved")
    } catch (err) {
      setSaveStatus("unsaved")
      toast({
        title: "Auto-Save fehlgeschlagen",
        description: err instanceof Error ? err.message : "Plan konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }

  // ---- DnD sensors (touch + pointer) ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const { data } = event.active
    if (data.current?.type === "library-exercise") {
      setActiveItem({ type: "library-exercise", exercise: data.current.exercise })
    }
  }

  function handleDragOver(event: DragOverEvent) {
    // handled in handleDragEnd for simplicity — over events are tracked by droppables
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null)
    const { active, over } = event

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Case 1: Library exercise dropped into a unit drop zone
    if (activeData?.type === "library-exercise" && overData?.type === "unit-dropzone") {
      const exercise: Exercise = activeData.exercise
      const unitId: string = overData.unitId

      const newExercise: PlanExercise = {
        id: nanoid(),
        unit_id: unitId,
        exercise_id: exercise.id,
        order: 0, // will be set by order in array
        is_archived_exercise: false,
        exercise_name: exercise.name,
        exercise_media_url: exercise.media_url,
        exercise_media_type: exercise.media_type ?? undefined,
        exercise_muskelgruppen: exercise.muskelgruppen,
        params: {
          saetze: exercise.standard_saetze ?? 3,
          wiederholungen: exercise.standard_wiederholungen ?? 10,
          dauer_sekunden: null,
          pause_sekunden: exercise.standard_pause_sekunden ?? 60,
          intensitaet_prozent: null,
          anmerkung: null,
        },
      }

      changePhasesWithUndo(
        phases.map((phase) => ({
          ...phase,
          units: phase.units.map((unit) =>
            unit.id === unitId
              ? { ...unit, exercises: [...unit.exercises, newExercise] }
              : unit
          ),
        }))
      )
      return
    }

    // Case 2: Sorting plan exercises within a unit
    if (activeData?.type === "plan-exercise" && overData?.type === "plan-exercise") {
      const activeExercise: PlanExercise = activeData.exercise
      const overExercise: PlanExercise = overData.exercise

      if (activeExercise.unit_id === overExercise.unit_id) {
        // Same unit: reorder
        const unitId = activeExercise.unit_id
        changePhasesWithUndo(
          phases.map((phase) => ({
            ...phase,
            units: phase.units.map((unit) => {
              if (unit.id !== unitId) return unit
              const oldIndex = unit.exercises.findIndex((e) => e.id === activeExercise.id)
              const newIndex = unit.exercises.findIndex((e) => e.id === overExercise.id)
              if (oldIndex === -1 || newIndex === -1) return unit
              return { ...unit, exercises: arrayMove(unit.exercises, oldIndex, newIndex) }
            }),
          }))
        )
      } else {
        // BUG-13 FIX: Cross-unit drag — move exercise from source unit to target unit
        const movedExercise: PlanExercise = { ...activeExercise, unit_id: overExercise.unit_id }
        changePhasesWithUndo(
          phases.map((phase) => ({
            ...phase,
            units: phase.units.map((unit) => {
              if (unit.id === activeExercise.unit_id) {
                // Remove from source unit
                return { ...unit, exercises: unit.exercises.filter((e) => e.id !== activeExercise.id) }
              }
              if (unit.id === overExercise.unit_id) {
                // Insert at the position of the target exercise
                const overIndex = unit.exercises.findIndex((e) => e.id === overExercise.id)
                const insertAt = overIndex >= 0 ? overIndex : unit.exercises.length
                const newExercises = [...unit.exercises]
                newExercises.splice(insertAt, 0, movedExercise)
                return { ...unit, exercises: newExercises }
              }
              return unit
            }),
          }))
        )
      }
    }
  }

  // ---- Loading / Error states ----
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="h-14 border-b px-4 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive font-medium mb-2">
            {error ?? "Plan nicht gefunden."}
          </p>
          <Button variant="outline" onClick={() => (window.location.href = "/os/training-plans")}>
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <BuilderHeader
          planName={planName}
          onNameChange={(name) => {
            setPlanName(name)
            setSaveStatus("unsaved")
          }}
          isTemplate={isTemplate}
          onTemplateToggle={(val) => {
            setIsTemplate(val)
            setSaveStatus("unsaved")
          }}
          saveStatus={saveStatus}
          canUndo={undoStack.current.length > 0}
          onUndo={handleUndo}
          onPreview={() => setPreviewOpen(true)}
        />

        {/* Desktop: split layout */}
        <div className="flex-1 overflow-hidden hidden md:flex">
          <LibraryPanel className="w-80 shrink-0" />
          {/* BUG-6 FIX: pass beschreibung + handler so description field renders */}
          <PlanCanvas
            phases={phases}
            onPhasesChange={changePhasesWithUndo}
            planDescription={beschreibung}
            onDescriptionChange={(desc) => { setBeschreibung(desc); setSaveStatus("unsaved") }}
          />
        </div>

        {/* Mobile: tab layout */}
        <div className="flex-1 overflow-hidden md:hidden">
          <Tabs defaultValue="canvas" className="h-full flex flex-col">
            <TabsList className="rounded-none border-b h-11 shrink-0">
              <TabsTrigger value="canvas" className="flex-1 gap-2">
                <Layers className="h-4 w-4" />
                Plan
              </TabsTrigger>
              <TabsTrigger value="library" className="flex-1 gap-2">
                <Dumbbell className="h-4 w-4" />
                Bibliothek
              </TabsTrigger>
            </TabsList>
            <TabsContent value="canvas" className="flex-1 overflow-hidden m-0">
              <PlanCanvas
                phases={phases}
                onPhasesChange={changePhasesWithUndo}
                planDescription={beschreibung}
                onDescriptionChange={(desc) => { setBeschreibung(desc); setSaveStatus("unsaved") }}
              />
            </TabsContent>
            <TabsContent value="library" className="flex-1 overflow-hidden m-0">
              <LibraryPanel className="h-full" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Drag overlay: ghost of dragged item */}
      <DragOverlay>
        {activeItem?.type === "library-exercise" && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-card shadow-xl opacity-90 w-64">
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium truncate">{activeItem.exercise.name}</p>
          </div>
        )}
      </DragOverlay>

      {/* Patient view sheet */}
      <PatientenAnsichtSheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        planName={planName}
        beschreibung={beschreibung}
        phases={phases}
      />
    </DndContext>
  )
}
