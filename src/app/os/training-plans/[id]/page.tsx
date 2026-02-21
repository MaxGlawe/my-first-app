"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { use } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
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

  // ---- Click-to-add from library ----
  function handleAddExercise(exercise: Exercise) {
    // Find the first available unit across all phases
    let targetUnitId: string | null = null
    for (const phase of phases) {
      if (phase.units.length > 0) {
        targetUnitId = phase.units[0].id
        break
      }
    }

    // If no unit exists, auto-create a phase + unit
    if (!targetUnitId) {
      const newUnitId = nanoid()
      const phaseId = nanoid()
      const newPhase: PlanPhase = {
        id: phaseId,
        plan_id: id,
        name: "Phase 1",
        dauer_wochen: 4,
        order: 0,
        units: [
          {
            id: newUnitId,
            plan_id: id,
            phase_id: phaseId,
            name: "Einheit 1",
            order: 0,
            exercises: [],
          },
        ],
      }
      targetUnitId = newUnitId

      const newExercise: PlanExercise = {
        id: nanoid(),
        unit_id: targetUnitId,
        exercise_id: exercise.id,
        order: 0,
        is_archived_exercise: false,
        exercise_name: exercise.name,
        exercise_beschreibung: exercise.beschreibung ?? null,
        exercise_ausfuehrung: exercise.ausfuehrung ?? null,
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
      newPhase.units[0].exercises = [newExercise]
      changePhasesWithUndo([...phases, newPhase])
      toast({ title: `"${exercise.name}" hinzugefügt`, description: "Neue Phase & Einheit erstellt." })
      return
    }

    // Add to the first unit
    const newExercise: PlanExercise = {
      id: nanoid(),
      unit_id: targetUnitId,
      exercise_id: exercise.id,
      order: 0,
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

    const finalUnitId = targetUnitId
    changePhasesWithUndo(
      phases.map((phase) => ({
        ...phase,
        units: phase.units.map((unit) =>
          unit.id === finalUnitId
            ? { ...unit, exercises: [...unit.exercises, newExercise] }
            : unit
        ),
      }))
    )
    toast({ title: `"${exercise.name}" hinzugefügt` })
  }

  // ---- Print (Apple Health style) ----
  function handlePrint() {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const totalExercises = phases.reduce(
      (sum, p) => sum + p.units.reduce((uS, u) => uS + u.exercises.length, 0), 0
    )
    const totalUnits = phases.reduce((s, p) => s + p.units.filter((u) => u.exercises.length > 0).length, 0)
    const totalWeeks = phases.reduce((s, p) => s + p.dauer_wochen, 0)

    const exerciseCard = (ex: PlanExercise, idx: number) => {
      const params: string[] = []
      if (ex.params.saetze) params.push(`<span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/></svg>${ex.params.saetze} Sätze</span>`)
      if (ex.params.wiederholungen) params.push(`<span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>${ex.params.wiederholungen} Wdh.</span>`)
      if (ex.params.dauer_sekunden) params.push(`<span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${ex.params.dauer_sekunden}s</span>`)
      if (ex.params.pause_sekunden) params.push(`<span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${ex.params.pause_sekunden}s Pause</span>`)
      if (ex.params.intensitaet_prozent) params.push(`<span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>${ex.params.intensitaet_prozent}%</span>`)

      const muscleHtml = (ex.exercise_muskelgruppen ?? []).slice(0, 3).map(
        (mg) => `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;background:#f0fdfa;color:#0f766e">${mg}</span>`
      ).join("")

      const imgHtml = ex.exercise_media_url && ex.exercise_media_type === "image"
        ? `<img src="${ex.exercise_media_url}" style="width:56px;height:56px;border-radius:12px;object-fit:cover" />`
        : `<div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg></div>`

      return `<div style="display:flex;gap:14px;align-items:flex-start;padding:12px 0;${idx > 0 ? "border-top:1px solid #f1f5f9;" : ""}">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#14b8a6,#059669);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
          <span style="color:white;font-size:12px;font-weight:700">${idx + 1}</span>
        </div>
        ${imgHtml}
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:14px;margin-bottom:3px">${ex.exercise_name ?? "Übung"}</div>
          ${ex.exercise_beschreibung ? `<div style="font-size:12px;color:#64748b;margin-bottom:5px;line-height:1.5">${ex.exercise_beschreibung}</div>` : ""}
          ${muscleHtml ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px">${muscleHtml}</div>` : ""}
          ${params.length > 0 ? `<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#64748b">${params.join("")}</div>` : ""}
          ${ex.params.anmerkung ? `<div style="margin-top:6px;padding:6px 10px;background:#fffbeb;border-radius:8px;font-size:11px;color:#92400e">💬 ${ex.params.anmerkung}</div>` : ""}
          ${(ex.exercise_ausfuehrung && ex.exercise_ausfuehrung.length > 0) ? `<div style="margin-top:8px;background:#f8fafc;border-radius:10px;padding:8px 12px">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0d9488;margin-bottom:4px">Ausführung</div>
            ${ex.exercise_ausfuehrung.map((step) => `<div style="display:flex;gap:6px;font-size:12px;color:#475569;line-height:1.5;margin-bottom:2px"><span style="font-weight:600;color:#0d9488;flex-shrink:0">${step.nummer}.</span><span>${step.beschreibung}</span></div>`).join("")}
          </div>` : ""}
        </div>
      </div>`
    }

    const phasesHtml = phases.map((phase) => {
      const phaseExCount = phase.units.reduce((s, u) => s + u.exercises.length, 0)
      if (phaseExCount === 0) return ""

      const unitsHtml = phase.units.filter((u) => u.exercises.length > 0).map((unit) => `
        <div style="background:white;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin-bottom:12px">
          <div style="padding:12px 16px;display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#4f46e5);display:flex;align-items:center;justify-content:center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div style="font-weight:600;font-size:14px">${unit.name}</div>
              <div style="font-size:11px;color:#9ca3af">${unit.exercises.length} Übung${unit.exercises.length !== 1 ? "en" : ""}</div>
            </div>
          </div>
          <div style="padding:0 16px 12px">
            ${unit.exercises.map((ex, i) => exerciseCard(ex, i)).join("")}
          </div>
        </div>
      `).join("")

      return `<div style="margin-bottom:28px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:40px;height:40px;border-radius:14px;background:linear-gradient(135deg,#14b8a6,#059669);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(20,184,166,0.3)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
          </div>
          <div>
            <div style="font-weight:700;font-size:16px">${phase.name}</div>
            <div style="font-size:12px;color:#9ca3af">${phase.dauer_wochen} Woche${phase.dauer_wochen !== 1 ? "n" : ""} · ${phaseExCount} Übung${phaseExCount !== 1 ? "en" : ""}</div>
          </div>
        </div>
        ${unitsHtml}
      </div>`
    }).join("")

    const statCircle = (val: string | number, label: string, gradient: string) =>
      `<div style="text-align:center">
        <div style="width:56px;height:56px;border-radius:50%;background:${gradient};display:flex;align-items:center;justify-content:center;margin:0 auto 6px">
          <span style="color:white;font-size:20px;font-weight:700">${val}</span>
        </div>
        <div style="font-size:12px;color:#6b7280">${label}</div>
      </div>`

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${planName || "Trainingsplan"}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto; padding: 0; color: #1a1a1a; background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print { body { padding: 0; background: white; } }
</style>
</head><body>
  <!-- Hero -->
  <div style="background:linear-gradient(135deg,#0d9488,#059669,#16a34a);padding:32px 28px 20px;color:white">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;opacity:0.8;margin-bottom:4px">Trainingsplan</div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">${planName || "Mein Trainingsplan"}</h1>
    ${beschreibung ? `<p style="font-size:13px;opacity:0.85;line-height:1.5">${beschreibung}</p>` : ""}
    <div style="font-size:11px;opacity:0.6;margin-top:8px">Erstellt am ${new Date().toLocaleDateString("de-DE")}</div>
  </div>

  <!-- Stats -->
  <div style="padding:0 20px;margin-top:-16px;margin-bottom:20px">
    <div style="background:white;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);padding:20px;display:flex;justify-content:space-around">
      ${statCircle(totalExercises, totalExercises !== 1 ? "Übungen" : "Übung", "linear-gradient(135deg,#14b8a6,#059669)")}
      ${statCircle(totalUnits, totalUnits !== 1 ? "Tage" : "Tag", "linear-gradient(135deg,#3b82f6,#4f46e5)")}
      ${statCircle(totalWeeks, totalWeeks !== 1 ? "Wochen" : "Woche", "linear-gradient(135deg,#a855f7,#7c3aed)")}
    </div>
  </div>

  <!-- Phases -->
  <div style="padding:0 20px 32px">
    ${phasesHtml}
  </div>
</body></html>`)
    printWindow.document.close()
    printWindow.onload = () => { printWindow.print() }
  }

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
        exercise_beschreibung: exercise.beschreibung ?? null,
        exercise_ausfuehrung: exercise.ausfuehrung ?? null,
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
      collisionDetection={closestCenter}
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
          onPrint={handlePrint}
        />

        {/* Desktop: split layout */}
        <div className="flex-1 overflow-hidden hidden md:flex">
          <LibraryPanel className="w-80 shrink-0" onAddExercise={handleAddExercise} />
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
              <LibraryPanel className="h-full" onAddExercise={handleAddExercise} />
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
