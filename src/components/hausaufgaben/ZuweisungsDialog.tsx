"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { PatientAssignment, Wochentag } from "@/types/hausaufgaben"
import type { TrainingPlanListItem } from "@/types/training-plan"

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

  // Form state
  const [planId, setPlanId] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [activeDays, setActiveDays] = useState<Wochentag[]>([])
  const [notiz, setNotiz] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Plans list
  const [plans, setPlans] = useState<TrainingPlanListItem[]>([])
  const [plansLoading, setPlansLoading] = useState(false)

  // DatePicker open state
  const [startPickerOpen, setStartPickerOpen] = useState(false)
  const [endPickerOpen, setEndPickerOpen] = useState(false)

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) return

    if (editAssignment) {
      setPlanId(editAssignment.plan_id ?? "")
      setStartDate(editAssignment.start_date)
      setEndDate(editAssignment.end_date)
      setActiveDays(editAssignment.active_days)
      setNotiz(editAssignment.notiz ?? "")
    } else {
      // Defaults: today → +4 weeks, Mo–Fr
      const today = new Date()
      const fourWeeks = new Date(today)
      fourWeeks.setDate(today.getDate() + 28)
      setPlanId("")
      setStartDate(formatDate(today))
      setEndDate(formatDate(fourWeeks))
      setActiveDays(["mo", "di", "mi", "do", "fr"])
      setNotiz("")
    }
  }, [open, editAssignment])

  // Load training plans
  useEffect(() => {
    if (!open) return
    setPlansLoading(true)
    fetch("/api/training-plans?filter=alle")
      .then((r) => r.json())
      .then((json) => setPlans(json.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false))
  }, [open])

  function toggleDay(day: Wochentag) {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!planId) {
      toast.error("Bitte wähle einen Trainingsplan aus.")
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
      const payload = {
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        active_days: activeDays,
        notiz: notiz.trim() || null,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Zuweisung bearbeiten" : "Neue Hausaufgabe zuweisen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Step 1: Plan auswählen */}
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
                Der Plan kann nach Zuweisung nicht mehr geändert werden. Erstelle eine neue Zuweisung für einen anderen Plan.
              </p>
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
    </Dialog>
  )
}
