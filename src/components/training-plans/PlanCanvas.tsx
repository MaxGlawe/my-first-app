"use client"

import { useState, useRef } from "react"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { proSeiteTreffer } from "@/lib/exercise-sides"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// ScrollArea removed — native overflow-y-auto avoids DnD interference
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  AlertTriangle,
  Flame,
  Snowflake,
} from "lucide-react"
import type { PlanPhase, PlanUnit, PlanExercise, PlanExerciseParams, PlanMode, SectionColor } from "@/types/training-plan"
import { SECTION_DEFS } from "@/types/training-plan"
import { nanoid } from "./plan-utils"

// ---- Section styling ----
const SECTION_STYLES: Record<SectionColor, { bg: string; border: string; text: string; iconBg: string; dropHint: string }> = {
  orange: { bg: "bg-orange-50/60", border: "border-orange-200/60", text: "text-orange-700", iconBg: "bg-orange-100 text-orange-600", dropHint: "border-orange-300/50" },
  teal:   { bg: "bg-teal-50/60",   border: "border-teal-200/60",   text: "text-teal-700",   iconBg: "bg-teal-100 text-teal-600",   dropHint: "border-teal-300/50" },
  blue:   { bg: "bg-blue-50/60",   border: "border-blue-200/60",   text: "text-blue-700",   iconBg: "bg-blue-100 text-blue-600",   dropHint: "border-blue-300/50" },
}

function SectionIcon({ color }: { color: SectionColor }) {
  if (color === "orange") return <Flame className="h-4 w-4" />
  if (color === "blue") return <Snowflake className="h-4 w-4" />
  return <Dumbbell className="h-4 w-4" />
}

// ---- Helpers ----

function defaultParams(exercise?: { standard_saetze?: number | null; standard_wiederholungen?: number | null; standard_pause_sekunden?: number | null }): PlanExerciseParams {
  return {
    saetze: exercise?.standard_saetze ?? 3,
    wiederholungen: exercise?.standard_wiederholungen ?? 10,
    dauer_sekunden: null,
    pause_sekunden: exercise?.standard_pause_sekunden ?? 60,
    intensitaet_prozent: null,
    anmerkung: null,
  }
}

// ---- PlanExerciseRow ----
interface PlanExerciseRowProps {
  exercise: PlanExercise
  onParamsChange: (params: Partial<PlanExerciseParams>) => void
  onRemove: () => void
}

function PlanExerciseRow({ exercise, onParamsChange, onRemove }: PlanExerciseRowProps) {
  // Erkennung nur als Vorschlag: greift, solange nichts explizit gesetzt ist.
  const proSeiteErkannt = proSeiteTreffer({
    name: exercise.exercise_name ?? null,
    beschreibung: exercise.exercise_beschreibung ?? null,
    ausfuehrung: exercise.exercise_ausfuehrung ?? null,
    params: { anmerkung: exercise.params.anmerkung },
  })
  const proSeiteEffektiv = exercise.params.pro_seite ?? !!proSeiteErkannt
  const [noteOpen, setNoteOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
    data: { type: "plan-exercise", exercise },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-3 ${exercise.is_archived_exercise ? "border-amber-400/60" : ""}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="text-muted-foreground/50 hover:text-muted-foreground mt-1 cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Thumbnail */}
        {exercise.exercise_media_url && exercise.exercise_media_type === "image" ? (
          <img
            src={exercise.exercise_media_url}
            alt={exercise.exercise_name ?? "Übung"}
            className="h-10 w-10 rounded object-cover shrink-0"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Name + archived badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">
              {exercise.exercise_name ?? "Unbekannte Übung"}
            </span>
            {exercise.is_archived_exercise && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="border-amber-400 text-amber-600 text-xs gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Archiviert
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Diese Übung wurde aus der Datenbank gelöscht, ist im Plan aber noch vorhanden.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Parameter row */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Sätze */}
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Sätze</span>
              <Input
                type="number"
                value={exercise.params.saetze}
                onChange={(e) => onParamsChange({ saetze: Number(e.target.value) || 1 })}
                className="h-7 w-14 text-xs px-2"
                min={1}
                max={20}
              />
            </label>

            {/* Wdh. oder Sek. */}
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Wdh.</span>
              <Input
                type="number"
                value={exercise.params.wiederholungen ?? ""}
                onChange={(e) =>
                  onParamsChange({ wiederholungen: e.target.value ? Number(e.target.value) : null })
                }
                className="h-7 w-14 text-xs px-2"
                min={1}
                placeholder="–"
              />
            </label>

            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Sek.</span>
              <Input
                type="number"
                value={exercise.params.dauer_sekunden ?? ""}
                onChange={(e) =>
                  onParamsChange({ dauer_sekunden: e.target.value ? Number(e.target.value) : null })
                }
                className="h-7 w-14 text-xs px-2"
                min={1}
                placeholder="–"
              />
            </label>

            {/* Pause */}
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Pause&nbsp;s</span>
              <Input
                type="number"
                value={exercise.params.pause_sekunden}
                onChange={(e) => onParamsChange({ pause_sekunden: Number(e.target.value) || 0 })}
                className="h-7 w-14 text-xs px-2"
                min={0}
              />
            </label>

            {/* Intensität */}
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Intensität&nbsp;%</span>
              <Input
                type="number"
                value={exercise.params.intensitaet_prozent ?? ""}
                onChange={(e) =>
                  onParamsChange({
                    intensitaet_prozent: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="h-7 w-14 text-xs px-2"
                min={0}
                max={100}
                placeholder="–"
              />
            </label>
          </div>

          {/* Pro Seite — Vorauswahl aus der Texterkennung, hier überstimmbar */}
          <label className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={proSeiteEffektiv}
              onChange={(e) => onParamsChange({ pro_seite: e.target.checked })}
              className="h-3.5 w-3.5 accent-emerald-600"
            />
            <span>
              pro Seite
              {exercise.params.pro_seite == null && proSeiteErkannt && (
                <span className="ml-1 text-emerald-600">(erkannt: „{proSeiteErkannt}")</span>
              )}
            </span>
          </label>

          {/* Anmerkung toggle */}
          <Collapsible open={noteOpen} onOpenChange={setNoteOpen}>
            <CollapsibleTrigger asChild>
              <button className="mt-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                {noteOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Anmerkung
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Textarea
                value={exercise.params.anmerkung ?? ""}
                onChange={(e) => onParamsChange({ anmerkung: e.target.value || null })}
                placeholder="Hinweise für den Patienten..."
                className="mt-1.5 text-xs min-h-[60px] resize-none"
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Remove */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
          aria-label="Übung entfernen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ---- UnitSection ----
interface UnitSectionProps {
  unit: PlanUnit
  onUnitNameChange: (name: string) => void
  onExerciseParamsChange: (exerciseId: string, params: Partial<PlanExerciseParams>) => void
  onExerciseRemove: (exerciseId: string) => void
  onUnitRemove: () => void
}

function UnitSection({
  unit,
  onUnitNameChange,
  onExerciseParamsChange,
  onExerciseRemove,
  onUnitRemove,
}: UnitSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `unit-dropzone-${unit.id}`,
    data: { type: "unit-dropzone", unitId: unit.id },
  })

  const sortableItems = unit.exercises.map((e) => e.id)

  return (
    <div className="rounded-lg border bg-background">
      {/* Unit header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Input
          value={unit.name}
          onChange={(e) => onUnitNameChange(e.target.value)}
          className="h-7 text-sm font-medium border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
          placeholder="Trainingstag benennen..."
          aria-label="Trainingstag-Name"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onUnitRemove}
          aria-label="Trainingstag entfernen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Drop zone + exercises */}
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`p-3 space-y-2 min-h-[80px] transition-colors rounded-b-lg ${
            isOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""
          }`}
        >
          {unit.exercises.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Übung hier ablegen oder per + hinzufügen
            </div>
          ) : (
            <>
              {unit.exercises.map((exercise) => (
                <PlanExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onParamsChange={(params) => onExerciseParamsChange(exercise.id, params)}
                  onRemove={() => onExerciseRemove(exercise.id)}
                />
              ))}
              <div className="flex items-center justify-center h-10 text-xs text-muted-foreground/60 border border-dashed rounded-lg hover:text-muted-foreground hover:border-primary/30 transition-colors">
                Weitere Übungen hierher ziehen oder per + hinzufügen
              </div>
            </>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ---- PhaseSection ----
interface PhaseSectionProps {
  phase: PlanPhase
  onPhaseNameChange: (name: string) => void
  onPhaseDurationChange: (weeks: number) => void
  onPhaseRemove: () => void
  onAddUnit: () => void
  onUnitNameChange: (unitId: string, name: string) => void
  onUnitRemove: (unitId: string) => void
  onExerciseParamsChange: (unitId: string, exerciseId: string, params: Partial<PlanExerciseParams>) => void
  onExerciseRemove: (unitId: string, exerciseId: string) => void
}

function PhaseSection({
  phase,
  onPhaseNameChange,
  onPhaseDurationChange,
  onPhaseRemove,
  onAddUnit,
  onUnitNameChange,
  onUnitRemove,
  onExerciseParamsChange,
  onExerciseRemove,
}: PhaseSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border bg-muted/30">
      {/* Phase header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={open ? "Phase einklappen" : "Phase ausklappen"}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <Input
          value={phase.name}
          onChange={(e) => onPhaseNameChange(e.target.value)}
          className="h-8 font-semibold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
          placeholder="Phasenname (z.B. Mobilisation)..."
          aria-label="Phasenname"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <Input
            type="number"
            value={phase.dauer_wochen}
            onChange={(e) => onPhaseDurationChange(Number(e.target.value) || 1)}
            className="h-7 w-14 text-xs"
            min={1}
            aria-label="Dauer in Wochen"
          />
          <span className="text-xs text-muted-foreground">Wo.</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onPhaseRemove}
          aria-label="Phase entfernen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Units */}
      {open && (
        <div className="p-4 space-y-3">
          {phase.units.map((unit) => (
            <UnitSection
              key={unit.id}
              unit={unit}
              onUnitNameChange={(name) => onUnitNameChange(unit.id, name)}
              onExerciseParamsChange={(exerciseId, params) =>
                onExerciseParamsChange(unit.id, exerciseId, params)
              }
              onExerciseRemove={(exerciseId) => onExerciseRemove(unit.id, exerciseId)}
              onUnitRemove={() => onUnitRemove(unit.id)}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={onAddUnit}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="h-3.5 w-3.5" />
            Trainingstag hinzufügen
          </Button>
        </div>
      )}
    </div>
  )
}

// ---- SectionPanel (sections mode) ----
interface SectionPanelProps {
  phase: PlanPhase
  sectionIndex: number
  onExerciseParamsChange: (exerciseId: string, params: Partial<PlanExerciseParams>) => void
  onExerciseRemove: (exerciseId: string) => void
  onFocus?: () => void
}

function SectionPanel({ phase, sectionIndex, onExerciseParamsChange, onExerciseRemove, onFocus }: SectionPanelProps) {
  const [open, setOpen] = useState(true)
  const def = SECTION_DEFS[sectionIndex] ?? SECTION_DEFS[1]
  const styles = SECTION_STYLES[def.color]

  // In sections mode, each section has exactly one unit (auto-created)
  const unit = phase.units[0]
  if (!unit) return null

  // Droppable covers the ENTIRE section card (header + content), so drops work even when collapsed
  const { setNodeRef, isOver } = useDroppable({
    id: `unit-dropzone-${unit.id}`,
    data: { type: "unit-dropzone", unitId: unit.id },
  })

  const sortableItems = unit.exercises.map((e) => e.id)

  return (
    <div
      ref={setNodeRef}
      data-section-unit-id={unit.id}
      className={`rounded-xl border ${styles.border} ${styles.bg} transition-colors ${
        isOver ? "ring-2 ring-primary/30 ring-offset-1" : ""
      }`}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-inherit">
        <button
          onClick={() => {
            const next = !open
            setOpen(next)
            if (next && onFocus) onFocus()
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className={`h-8 w-8 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <SectionIcon color={def.color} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`font-semibold ${styles.text}`}>{def.name}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {unit.exercises.length} {unit.exercises.length === 1 ? "Übung" : "Übungen"}
          </span>
        </div>
      </div>

      {/* Exercises */}
      {open && (
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          <div className="p-4 space-y-2 min-h-[80px]">
            {unit.exercises.length === 0 ? (
              <div className={`flex items-center justify-center h-16 text-sm text-muted-foreground border-2 border-dashed ${styles.dropHint} rounded-lg`}>
                Übung hier ablegen oder per + hinzufügen
              </div>
            ) : (
              <>
                {unit.exercises.map((exercise) => (
                  <PlanExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onParamsChange={(params) => onExerciseParamsChange(exercise.id, params)}
                    onRemove={() => onExerciseRemove(exercise.id)}
                  />
                ))}
                <div className={`flex items-center justify-center h-10 text-xs text-muted-foreground/60 border border-dashed ${styles.dropHint} rounded-lg`}>
                  Weitere Übungen hierher ziehen
                </div>
              </>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

// ---- PlanCanvas ----
export interface PlanCanvasProps {
  phases: PlanPhase[]
  onPhasesChange: (phases: PlanPhase[]) => void
  planDescription: string
  onDescriptionChange: (desc: string) => void
  planMode: PlanMode
  onSectionFocus?: (sectionIndex: number) => void
}

export function PlanCanvas({ phases, onPhasesChange, planDescription, onDescriptionChange, planMode, onSectionFocus }: PlanCanvasProps) {
  function addPhase() {
    const newPhase: PlanPhase = {
      id: nanoid(),
      plan_id: "",
      name: `Phase ${phases.length + 1}`,
      dauer_wochen: 2,
      order: phases.length,
      units: [],
    }
    onPhasesChange([...phases, newPhase])
  }

  function removePhase(phaseId: string) {
    onPhasesChange(phases.filter((p) => p.id !== phaseId))
  }

  function updatePhase(phaseId: string, updates: Partial<PlanPhase>) {
    onPhasesChange(phases.map((p) => (p.id === phaseId ? { ...p, ...updates } : p)))
  }

  function addUnit(phaseId: string) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase) return
    const newUnit: PlanUnit = {
      id: nanoid(),
      plan_id: "",
      phase_id: phaseId,
      name: `Tag ${phase.units.length + 1}`,
      order: phase.units.length,
      exercises: [],
    }
    updatePhase(phaseId, { units: [...phase.units, newUnit] })
  }

  function removeUnit(phaseId: string, unitId: string) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase) return
    updatePhase(phaseId, { units: phase.units.filter((u) => u.id !== unitId) })
  }

  function updateUnit(phaseId: string, unitId: string, updates: Partial<PlanUnit>) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase) return
    updatePhase(phaseId, {
      units: phase.units.map((u) => (u.id === unitId ? { ...u, ...updates } : u)),
    })
  }

  function updateExerciseParams(
    phaseId: string,
    unitId: string,
    exerciseId: string,
    params: Partial<PlanExerciseParams>
  ) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase) return
    const unit = phase.units.find((u) => u.id === unitId)
    if (!unit) return
    const updatedExercises = unit.exercises.map((e) =>
      e.id === exerciseId ? { ...e, params: { ...e.params, ...params } } : e
    )
    updateUnit(phaseId, unitId, { exercises: updatedExercises })
  }

  function removeExercise(phaseId: string, unitId: string, exerciseId: string) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase) return
    const unit = phase.units.find((u) => u.id === unitId)
    if (!unit) return
    updateUnit(phaseId, unitId, {
      exercises: unit.exercises.filter((e) => e.id !== exerciseId),
    })
  }

  // ---- Sections mode helpers ----
  function updateSectionExerciseParams(phaseId: string, exerciseId: string, params: Partial<PlanExerciseParams>) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase || !phase.units[0]) return
    const unitId = phase.units[0].id
    updateExerciseParams(phaseId, unitId, exerciseId, params)
  }

  function removeSectionExercise(phaseId: string, exerciseId: string) {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase || !phase.units[0]) return
    removeExercise(phaseId, phase.units[0].id, exerciseId)
  }

  // ---- Sections mode rendering ----
  if (planMode === "sections") {
    return (
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6 space-y-4 max-w-3xl mx-auto">
          <Textarea
            value={planDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Plan-Beschreibung hinzufügen (optional)..."
            className="resize-none text-sm text-muted-foreground bg-muted/30 border-muted"
            rows={2}
            maxLength={2000}
            aria-label="Plan-Beschreibung"
          />

          {phases.map((phase, idx) => (
            <SectionPanel
              key={phase.id}
              phase={phase}
              sectionIndex={idx}
              onExerciseParamsChange={(exerciseId, params) =>
                updateSectionExerciseParams(phase.id, exerciseId, params)
              }
              onExerciseRemove={(exerciseId) =>
                removeSectionExercise(phase.id, exerciseId)
              }
              onFocus={() => onSectionFocus?.(idx)}
            />
          ))}
        </div>
      </div>
    )
  }

  // ---- Phases mode rendering (existing) ----
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <Textarea
          value={planDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Plan-Beschreibung hinzufügen (optional)..."
          className="resize-none text-sm text-muted-foreground bg-muted/30 border-muted"
          rows={2}
          maxLength={2000}
          aria-label="Plan-Beschreibung"
        />

        {phases.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium mb-1">Plan ist leer</p>
            <p className="text-sm">Füge eine Phase hinzu und ziehe Übungen aus der Bibliothek.</p>
          </div>
        )}

        {phases.map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            onPhaseNameChange={(name) => updatePhase(phase.id, { name })}
            onPhaseDurationChange={(dauer_wochen) => updatePhase(phase.id, { dauer_wochen })}
            onPhaseRemove={() => removePhase(phase.id)}
            onAddUnit={() => addUnit(phase.id)}
            onUnitNameChange={(unitId, name) => updateUnit(phase.id, unitId, { name })}
            onUnitRemove={(unitId) => removeUnit(phase.id, unitId)}
            onExerciseParamsChange={(unitId, exerciseId, params) =>
              updateExerciseParams(phase.id, unitId, exerciseId, params)
            }
            onExerciseRemove={(unitId, exerciseId) =>
              removeExercise(phase.id, unitId, exerciseId)
            }
          />
        ))}

        <Button
          variant="outline"
          onClick={addPhase}
          className="w-full gap-2 border-dashed h-12"
        >
          <Plus className="h-4 w-4" />
          Phase hinzufügen
        </Button>
      </div>
    </div>
  )
}
