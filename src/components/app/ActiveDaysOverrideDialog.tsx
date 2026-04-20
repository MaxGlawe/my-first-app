"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const WOCHENTAGE = [
  { key: "mo", label: "Mo" },
  { key: "di", label: "Di" },
  { key: "mi", label: "Mi" },
  { key: "do", label: "Do" },
  { key: "fr", label: "Fr" },
  { key: "sa", label: "Sa" },
  { key: "so", label: "So" },
] as const

interface ActiveDaysOverrideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId: string
  therapistDays: string[] | null | undefined
  currentDays: string[] | null | undefined
  onSuccess: () => void
}

export function ActiveDaysOverrideDialog({
  open,
  onOpenChange,
  assignmentId,
  therapistDays,
  currentDays,
  onSuccess,
}: ActiveDaysOverrideDialogProps) {
  const safeTherapistDays = Array.isArray(therapistDays) ? therapistDays : []
  const safeCurrentDays = Array.isArray(currentDays) ? currentDays : []
  const [selectedDays, setSelectedDays] = useState<string[]>(safeCurrentDays)
  const [isSaving, setIsSaving] = useState(false)

  const requiredCount = safeTherapistDays.length
  const noTherapistDays = requiredCount === 0

  function toggleDay(day: string) {
    if (noTherapistDays) return
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day)
      }
      // Don't allow more days than therapist set
      if (prev.length >= requiredCount) {
        toast.error(`Maximal ${requiredCount} Tage erlaubt.`)
        return prev
      }
      return [...prev, day]
    })
  }

  function handleReset() {
    setSelectedDays([...safeTherapistDays])
  }

  async function handleSave() {
    if (selectedDays.length !== requiredCount) {
      toast.error(`Bitte genau ${requiredCount} Tage auswählen.`)
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/me/assignments/${assignmentId}/active-days`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_days: selectedDays }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? "Trainingstage konnten nicht geändert werden.")
        return
      }

      toast.success(json.message ?? "Trainingstage angepasst.")
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsSaving(false)
    }
  }

  const isChanged =
    [...selectedDays].sort().join(",") !== [...safeCurrentDays].sort().join(",")
  const isOriginal =
    [...selectedDays].sort().join(",") === [...safeTherapistDays].sort().join(",")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Trainingstage anpassen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {noTherapistDays ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  Noch keine Trainingstage festgelegt
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Dein Therapeut hat für diesen Plan noch keine Trainingstage hinterlegt.
                  Bitte kontaktiere ihn per Chat, damit er die Tage ergänzt — dann kannst du sie hier selbst anpassen.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Wähle {requiredCount} Tage pro Woche aus. Die Anzahl der
                Trainingstage bleibt gleich — nur die Verteilung ändert sich.
              </p>

              {/* Day selector */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {WOCHENTAGE.map(({ key, label }) => {
                  const isActive = selectedDays.includes(key)
                  const isTherapistDay = safeTherapistDays.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleDay(key)}
                      className={`min-w-[44px] px-2.5 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                        isActive
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25"
                          : isTherapistDay
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Count indicator */}
              <p className={`text-xs text-center font-medium ${
                selectedDays.length === requiredCount ? "text-emerald-600" : "text-amber-500"
              }`}>
                {selectedDays.length} von {requiredCount} Tagen gewählt
              </p>

              {/* Reset hint */}
              {!isOriginal && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full text-xs text-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Auf Therapeuten-Vorgabe zurücksetzen ({safeTherapistDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")})
                </button>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || noTherapistDays || !isChanged || selectedDays.length !== requiredCount}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
