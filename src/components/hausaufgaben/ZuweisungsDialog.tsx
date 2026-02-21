"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Loader2, Search, X, Dumbbell, ClipboardList, BookOpen, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { PatientAssignment, Wochentag, AdhocExercise } from "@/types/hausaufgaben"
import type { TrainingPlanListItem } from "@/types/training-plan"
import type { Exercise } from "@/types/exercise"
import type { EducationModule } from "@/types/education"
import { HAUPTPROBLEME } from "@/types/education"
import { EducationPreviewDialog } from "@/components/education/EducationPreviewDialog"

// ── Helpers ───────────────────────────────────────────────────────────────────

const WOCHENTAGE: { key: Wochentag; label: string }[] = [
  { key: "mo", label: "Mo" },
  { key: "di", label: "Di" },
  { key: "mi", label: "Mi" },
  { key: "do", label: "Do" },
  { key: "fr", label: "Fr" },
  { key: "sa", label: "Sa" },
  { key: "so", label: "So" },
]

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function displayDate(str: string): string {
  return parseDate(str).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ZuweisungsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  editAssignment?: PatientAssignment | null
  onSuccess: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ZuweisungsDialog({
  open,
  onOpenChange,
  patientId,
  editAssignment,
  onSuccess,
}: ZuweisungsDialogProps) {
  const isEditing = !!editAssignment

  // Mode: "plan" = assign a training plan; "adhoc" = BUG-1 FIX: individual exercises
  const [mode, setMode] = useState<"plan" | "adhoc">("plan")

  // Plan mode state
  const [planId, setPlanId] = useState<string>("")
  const [plans, setPlans] = useState<TrainingPlanListItem[]>([])
  const [plansLoading, setPlansLoading] = useState(false)

  // Ad-hoc mode state (BUG-1 FIX)
  const [adhocExercises, setAdhocExercises] = useState<AdhocExercise[]>([])
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([])
  const [exerciseSearchLoading, setExerciseSearchLoading] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hauptproblem + Education state (PROJ-17)
  const [hauptproblem, setHauptproblem] = useState<string>("")
  const [customHauptproblem, setCustomHauptproblem] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModule, setGeneratedModule] = useState<EducationModule | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Shared form state
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [activeDays, setActiveDays] = useState<Wochentag[]>([])
  const [notiz, setNotiz] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // DatePicker open state
  const [startPickerOpen, setStartPickerOpen] = useState(false)
  const [endPickerOpen, setEndPickerOpen] = useState(false)

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) return

    if (editAssignment) {
      // Determine mode from existing assignment
      const isAdhoc = !editAssignment.plan_id && (editAssignment.adhoc_exercises?.length ?? 0) > 0
      setMode(isAdhoc ? "adhoc" : "plan")
      setPlanId(editAssignment.plan_id ?? "")
      setAdhocExercises(editAssignment.adhoc_exercises ?? [])
      setStartDate(editAssignment.start_date)
      setEndDate(editAssignment.end_date)
      setActiveDays(editAssignment.active_days)
      setNotiz(editAssignment.notiz ?? "")
      setHauptproblem(editAssignment.hauptproblem ?? "")
      setCustomHauptproblem("")
    } else {
      // Defaults: today → +4 weeks, Mo–Fr
      const today = new Date()
      const fourWeeks = new Date(today)
      fourWeeks.setDate(today.getDate() + 28)
      setMode("plan")
      setPlanId("")
      setAdhocExercises([])
      setExerciseSearch("")
      setExerciseResults([])
      setStartDate(formatDate(today))
      setEndDate(formatDate(fourWeeks))
      setActiveDays(["mo", "di", "mi", "do", "fr"])
      setNotiz("")
      setHauptproblem("")
      setCustomHauptproblem("")
      setGeneratedModule(null)
    }
  }, [open, editAssignment])

  // Load training plans
  useEffect(() => {
    if (!open || mode !== "plan") return
    setPlansLoading(true)
    fetch("/api/training-plans?filter=alle")
      .then((r) => r.json())
      .then((json) => setPlans(json.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false))
  }, [open, mode])

  // BUG-1 FIX: Debounced exercise search
  useEffect(() => {
    if (!open || mode !== "adhoc") return

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

    if (exerciseSearch.trim().length < 2) {
      setExerciseResults([])
      return
    }

    searchDebounceRef.current = setTimeout(async () => {
      setExerciseSearchLoading(true)
      try {
        const res = await fetch(
          `/api/exercises?search=${encodeURIComponent(exerciseSearch.trim())}&limit=8`
        )
        const json = await res.json()
        setExerciseResults(json.exercises ?? [])
      } catch {
        setExerciseResults([])
      } finally {
        setExerciseSearchLoading(false)
      }
    }, 300)

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [open, mode, exerciseSearch])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function toggleDay(day: Wochentag) {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // BUG-1 FIX: Add exercise to ad-hoc list (skip if already added)
  function addAdhocExercise(exercise: Exercise) {
    if (adhocExercises.some((e) => e.exercise_id === exercise.id)) {
      toast.info(`"${exercise.name}" ist bereits in der Liste.`)
      return
    }
    setAdhocExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        saetze: exercise.standard_saetze ?? 3,
        wiederholungen: exercise.standard_wiederholungen ?? 10,
        dauer_sekunden: null,
        pause_sekunden: exercise.standard_pause_sekunden ?? 60,
        anmerkung: null,
      },
    ])
    setExerciseSearch("")
    setExerciseResults([])
  }

  function removeAdhocExercise(index: number) {
    setAdhocExercises((prev) => prev.filter((_, i) => i !== index))
  }

  function updateAdhocExercise(
    index: number,
    field: "saetze" | "wiederholungen",
    value: number | null
  ) {
    setAdhocExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    )
  }

  const resolvedHauptproblem = hauptproblem === "Sonstiges" ? customHauptproblem.trim() : hauptproblem

  async function handleGenerateEducation() {
    if (!resolvedHauptproblem) {
      toast.error("Bitte wähle zuerst ein Hauptproblem aus.")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hauptproblem: resolvedHauptproblem }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Wissensinhalte konnten nicht generiert werden.")
        return
      }
      setGeneratedModule(data.module)
      setPreviewOpen(true)
      if (data.cached) {
        toast.info("Wissensinhalte aus Cache geladen (bereits vorhanden).")
      } else {
        toast.success("Wissensinhalte erfolgreich generiert!")
      }
    } catch {
      toast.error("Fehler bei der KI-Generierung.")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate mode-specific requirements
    if (mode === "plan" && !planId) {
      toast.error("Bitte wähle einen Trainingsplan aus.")
      return
    }
    if (mode === "adhoc" && adhocExercises.length === 0) {
      toast.error("Bitte wähle mindestens eine Übung aus.")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Bitte wähle Start- und Enddatum.")
      return
    }
    if (startDate > endDate) {
      toast.error("Das Startdatum muss vor dem Enddatum liegen.")
      return
    }
    if (activeDays.length === 0) {
      toast.error("Bitte wähle mindestens einen Trainingstag.")
      return
    }

    setIsSaving(true)
    try {
      const payload =
        mode === "plan"
          ? {
              plan_id: planId,
              start_date: startDate,
              end_date: endDate,
              active_days: activeDays,
              notiz: notiz.trim() || null,
              hauptproblem: resolvedHauptproblem || null,
            }
          : {
              plan_id: null,
              adhoc_exercises: adhocExercises,
              start_date: startDate,
              end_date: endDate,
              active_days: activeDays,
              notiz: notiz.trim() || null,
              hauptproblem: resolvedHauptproblem || null,
            }

      const url = isEditing
        ? `/api/patients/${patientId}/assignments/${editAssignment!.id}`
        : `/api/patients/${patientId}/assignments`

      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Zuweisung konnte nicht gespeichert werden.")
        return
      }

      toast.success(isEditing ? "Zuweisung aktualisiert." : "Hausaufgabe zugewiesen.")
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Zuweisung bearbeiten" : "Neue Hausaufgabe zuweisen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">

          {/* BUG-1 FIX: Mode toggle — Plan vs Ad-hoc */}
          {!isEditing && (
            <div className="flex rounded-lg border overflow-hidden">
              <button
                type="button"
                onClick={() => setMode("plan")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  mode === "plan"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Trainingsplan
              </button>
              <button
                type="button"
                onClick={() => setMode("adhoc")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  mode === "adhoc"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Dumbbell className="h-4 w-4" />
                Ad-hoc Übungen
              </button>
            </div>
          )}

          {/* Step 1a: Plan auswählen (Plan mode) */}
          {mode === "plan" && (
            <div className="space-y-2">
              <Label htmlFor="plan-select">Trainingsplan *</Label>
              {plansLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pläne werden geladen...
                </div>
              ) : (
                <Select
                  value={planId}
                  onValueChange={setPlanId}
                  disabled={isEditing}
                >
                  <SelectTrigger id="plan-select">
                    <SelectValue placeholder="Plan auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        Keine Pläne vorhanden
                      </SelectItem>
                    ) : (
                      plans
                        .filter((p) => !p.is_archived)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                            {p.uebungen_anzahl > 0 && (
                              <span className="text-muted-foreground ml-1.5 text-xs">
                                ({p.uebungen_anzahl} Übungen)
                              </span>
                            )}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Der Plan kann nach Zuweisung nicht mehr geändert werden.
                </p>
              )}
            </div>
          )}

          {/* Step 1b: Ad-hoc Übungen auswählen (BUG-1 FIX) */}
          {mode === "adhoc" && (
            <div className="space-y-3">
              <Label>Übungen auswählen *</Label>

              {/* Search input */}
              {!isEditing && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Übung suchen (mind. 2 Zeichen)..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="pl-8"
                    autoComplete="off"
                  />
                  {exerciseSearchLoading && (
                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Search results dropdown */}
              {exerciseResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-44 overflow-y-auto shadow-sm">
                  {exerciseResults.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => addAdhocExercise(ex)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{ex.name}</span>
                      {ex.muskelgruppen.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {ex.muskelgruppen.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected exercises list */}
              {adhocExercises.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {adhocExercises.length} Übung{adhocExercises.length !== 1 ? "en" : ""} ausgewählt
                  </p>
                  {adhocExercises.map((ex, i) => (
                    <div
                      key={ex.exercise_id}
                      className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/30"
                    >
                      <span className="flex-1 text-sm font-medium truncate min-w-0">
                        {ex.exercise_name ?? ex.exercise_id}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">
                          Sätze
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={ex.saetze}
                          onChange={(e) =>
                            updateAdhocExercise(i, "saetze", parseInt(e.target.value) || 1)
                          }
                          className="w-14 h-7 text-sm text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">
                          Wdh
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          value={ex.wiederholungen ?? ""}
                          placeholder="—"
                          onChange={(e) =>
                            updateAdhocExercise(
                              i,
                              "wiederholungen",
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          className="w-14 h-7 text-sm text-center"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeAdhocExercise(i)}
                        aria-label={`Übung "${ex.exercise_name}" entfernen`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  Noch keine Übungen ausgewählt. Suche nach einer Übung und klicke sie an.
                </p>
              )}
            </div>
          )}

          {/* PROJ-17: Hauptproblem Selector + Education */}
          <div className="space-y-2">
            <Label>Hauptproblem (optional)</Label>
            <Select value={hauptproblem} onValueChange={setHauptproblem}>
              <SelectTrigger>
                <SelectValue placeholder="Hauptproblem auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {HAUPTPROBLEME.map((hp) => (
                  <SelectItem key={hp} value={hp}>
                    {hp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hauptproblem === "Sonstiges" && (
              <Input
                placeholder="Hauptproblem eingeben..."
                value={customHauptproblem}
                onChange={(e) => setCustomHauptproblem(e.target.value)}
                maxLength={200}
              />
            )}
            {resolvedHauptproblem && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateEducation}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "KI generiert Wissensinhalte..." : "Wissensinhalte generieren"}
              </Button>
            )}
            {generatedModule && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="w-full text-left rounded-lg border border-teal-200 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-800 px-3 py-2 text-sm flex items-center gap-2 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="flex-1 font-medium text-teal-900 dark:text-teal-100 truncate">
                  {generatedModule.title}
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-400 shrink-0">
                  {generatedModule.status === "freigegeben" ? "Freigegeben" : "Entwurf"}
                </span>
              </button>
            )}
          </div>

          {/* Step 2: Zeitraum */}
          <div className="grid grid-cols-2 gap-3">
            {/* Startdatum */}
            <div className="space-y-2">
              <Label>Startdatum *</Label>
              <Popover open={startPickerOpen} onOpenChange={setStartPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {startDate ? displayDate(startDate) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate ? parseDate(startDate) : undefined}
                    onSelect={(day) => {
                      if (day) {
                        setStartDate(formatDate(day))
                        setStartPickerOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Enddatum */}
            <div className="space-y-2">
              <Label>Enddatum *</Label>
              <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {endDate ? displayDate(endDate) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate ? parseDate(endDate) : undefined}
                    onSelect={(day) => {
                      if (day) {
                        setEndDate(formatDate(day))
                        setEndPickerOpen(false)
                      }
                    }}
                    disabled={(date) =>
                      startDate ? date < parseDate(startDate) : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Step 3: Trainingstage */}
          <div className="space-y-2">
            <Label>Trainingstage *</Label>
            <div className="flex gap-1.5 flex-wrap">
              {WOCHENTAGE.map(({ key, label }) => {
                const isActive = activeDays.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`min-w-[38px] px-2 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted"
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Trainingstag ${label}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {activeDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {activeDays.length}x pro Woche
              </p>
            )}
          </div>

          {/* Notiz */}
          <div className="space-y-2">
            <Label htmlFor="notiz">Notiz an Patient (optional)</Label>
            <Textarea
              id="notiz"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              placeholder="z.B. Auf korrekte Ausführung achten, bei Schmerzen pausieren..."
              maxLength={1000}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {notiz.length}/1000
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Änderungen speichern" : "Zuweisen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* PROJ-17: Education Preview Dialog */}
      {generatedModule && (
        <EducationPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          module={generatedModule}
          onModuleUpdate={setGeneratedModule}
        />
      )}
    </Dialog>
  )
}
