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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react"
import { MediaUploadField } from "./MediaUploadField"
import {
  MUSKELGRUPPEN,
  SCHWIERIGKEITSGRAD_LABELS,
} from "@/types/exercise"
import type {
  Exercise,
  ExerciseFormValues,
  Schwierigkeitsgrad,
  MediaType,
  AusfuehrungsSchritt,
} from "@/types/exercise"

interface UebungsFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise?: Exercise | null // null = new exercise
  isAdmin?: boolean
  onSave: (values: ExerciseFormValues) => Promise<void>
}

const DEFAULT_FORM: ExerciseFormValues = {
  name: "",
  beschreibung: "",
  ausfuehrung: [{ nummer: 1, beschreibung: "" }],
  muskelgruppen: [],
  schwierigkeitsgrad: "anfaenger",
  media_url: undefined,
  media_type: undefined,
  standard_saetze: undefined,
  standard_wiederholungen: undefined,
  standard_pause_sekunden: undefined,
  is_public: false,
}

function exerciseToForm(exercise: Exercise): ExerciseFormValues {
  return {
    name: exercise.name,
    beschreibung: exercise.beschreibung ?? "",
    ausfuehrung:
      exercise.ausfuehrung && exercise.ausfuehrung.length > 0
        ? exercise.ausfuehrung
        : [{ nummer: 1, beschreibung: "" }],
    muskelgruppen: exercise.muskelgruppen ?? [],
    schwierigkeitsgrad: exercise.schwierigkeitsgrad,
    media_url: exercise.media_url ?? undefined,
    media_type: exercise.media_type ?? undefined,
    standard_saetze: exercise.standard_saetze ?? undefined,
    standard_wiederholungen: exercise.standard_wiederholungen ?? undefined,
    standard_pause_sekunden: exercise.standard_pause_sekunden ?? undefined,
    is_public: exercise.is_public,
  }
}

export function UebungsFormDialog({
  open,
  onOpenChange,
  exercise,
  isAdmin = false,
  onSave,
}: UebungsFormDialogProps) {
  const [form, setForm] = useState<ExerciseFormValues>(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const isEditing = !!exercise

  // Reset form when dialog opens/exercise changes
  useEffect(() => {
    if (open) {
      setForm(exercise ? exerciseToForm(exercise) : DEFAULT_FORM)
      setSaveError(null)
    }
  }, [open, exercise])

  function setField<K extends keyof ExerciseFormValues>(
    key: K,
    value: ExerciseFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // --- Ausführungsschritte ---
  function addStep() {
    setForm((prev) => ({
      ...prev,
      ausfuehrung: [
        ...prev.ausfuehrung,
        { nummer: prev.ausfuehrung.length + 1, beschreibung: "" },
      ],
    }))
  }

  function updateStep(index: number, beschreibung: string) {
    setForm((prev) => ({
      ...prev,
      ausfuehrung: prev.ausfuehrung.map((s, i) =>
        i === index ? { ...s, beschreibung } : s
      ),
    }))
  }

  function removeStep(index: number) {
    setForm((prev) => {
      const updated = prev.ausfuehrung
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, nummer: i + 1 }))
      return { ...prev, ausfuehrung: updated.length > 0 ? updated : [{ nummer: 1, beschreibung: "" }] }
    })
  }

  // --- Muskelgruppen ---
  function toggleMuskelgruppe(gruppe: string) {
    setForm((prev) => {
      const existing = prev.muskelgruppen
      return {
        ...prev,
        muskelgruppen: existing.includes(gruppe)
          ? existing.filter((g) => g !== gruppe)
          : [...existing, gruppe],
      }
    })
  }

  // --- Medien ---
  function handleMediaUpload(url: string, type: MediaType) {
    setField("media_url", url)
    setField("media_type", type)
  }

  function handleMediaClear() {
    setField("media_url", undefined)
    setField("media_type", undefined)
  }

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)

    // Validation
    if (!form.name.trim()) {
      setSaveError("Name ist ein Pflichtfeld.")
      return
    }
    if (form.muskelgruppen.length === 0) {
      setSaveError("Bitte mindestens eine Muskelgruppe auswählen.")
      return
    }

    setIsSaving(true)
    try {
      // Filter out empty steps
      const cleanedSteps = form.ausfuehrung.filter((s) => s.beschreibung.trim())
      await onSave({ ...form, ausfuehrung: cleanedSteps })
      onOpenChange(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? "Übung bearbeiten" : "Neue Übung erstellen"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <form id="exercise-form" onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="ex-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ex-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="z. B. Kniebeuge"
                required
                maxLength={200}
              />
            </div>

            {/* Beschreibung */}
            <div className="space-y-2">
              <Label htmlFor="ex-beschreibung">Beschreibung</Label>
              <Textarea
                id="ex-beschreibung"
                value={form.beschreibung ?? ""}
                onChange={(e) => setField("beschreibung", e.target.value)}
                placeholder="Kurze Beschreibung der Übung und ihres Zwecks..."
                rows={3}
                maxLength={500}
              />
            </div>

            <Separator />

            {/* Ausführungsanweisung */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ausführungsanweisung</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schritt hinzufügen
                </Button>
              </div>

              <div className="space-y-2">
                {form.ausfuehrung.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex items-center gap-1 mt-2.5 shrink-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm font-medium text-muted-foreground w-5 text-right">
                        {step.nummer}.
                      </span>
                    </div>
                    <Input
                      value={step.beschreibung}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder={`Schritt ${step.nummer} beschreiben...`}
                      className="flex-1"
                      aria-label={`Schritt ${step.nummer}`}
                    />
                    {form.ausfuehrung.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeStep(index)}
                        aria-label={`Schritt ${step.nummer} entfernen`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Muskelgruppen */}
            <div className="space-y-3">
              <Label>
                Muskelgruppen <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {MUSKELGRUPPEN.map((gruppe) => (
                  <div key={gruppe} className="flex items-center gap-2">
                    <Checkbox
                      id={`form-mg-${gruppe}`}
                      checked={form.muskelgruppen.includes(gruppe)}
                      onCheckedChange={() => toggleMuskelgruppe(gruppe)}
                    />
                    <Label
                      htmlFor={`form-mg-${gruppe}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {gruppe}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Schwierigkeitsgrad */}
            <div className="space-y-2">
              <Label htmlFor="ex-schwierigkeit">Schwierigkeitsgrad</Label>
              <Select
                value={form.schwierigkeitsgrad}
                onValueChange={(v) => setField("schwierigkeitsgrad", v as Schwierigkeitsgrad)}
              >
                <SelectTrigger id="ex-schwierigkeit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(SCHWIERIGKEITSGRAD_LABELS) as [Schwierigkeitsgrad, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Medien-Upload */}
            <div className="space-y-2">
              <Label>Medien (Bild oder Video)</Label>
              <MediaUploadField
                mediaUrl={form.media_url}
                mediaType={form.media_type}
                onUploadComplete={handleMediaUpload}
                onClear={handleMediaClear}
                exerciseId={exercise?.id}
              />
            </div>

            <Separator />

            {/* Standard-Parameter */}
            <div className="space-y-3">
              <Label>Standard-Parameter (Vorlage für Trainingspläne)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ex-saetze" className="text-xs text-muted-foreground">
                    Sätze
                  </Label>
                  <Input
                    id="ex-saetze"
                    type="number"
                    min={1}
                    max={20}
                    value={form.standard_saetze ?? ""}
                    onChange={(e) =>
                      setField(
                        "standard_saetze",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="z.B. 3"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ex-wdh" className="text-xs text-muted-foreground">
                    Wiederholungen
                  </Label>
                  <Input
                    id="ex-wdh"
                    type="number"
                    min={1}
                    max={100}
                    value={form.standard_wiederholungen ?? ""}
                    onChange={(e) =>
                      setField(
                        "standard_wiederholungen",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="z.B. 12"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ex-pause" className="text-xs text-muted-foreground">
                    Pause (Sek.)
                  </Label>
                  <Input
                    id="ex-pause"
                    type="number"
                    min={0}
                    max={600}
                    value={form.standard_pause_sekunden ?? ""}
                    onChange={(e) =>
                      setField(
                        "standard_pause_sekunden",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="z.B. 60"
                  />
                </div>
              </div>
            </div>

            {/* Admin: Praxis-Bibliothek toggle */}
            {isAdmin && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="ex-public"
                    checked={form.is_public ?? false}
                    onCheckedChange={(checked) =>
                      setField("is_public", checked === true)
                    }
                  />
                  <Label htmlFor="ex-public" className="cursor-pointer">
                    Zur Praxis-Bibliothek hinzufügen
                    <span className="block text-xs text-muted-foreground font-normal">
                      Alle Therapeuten können diese Übung sehen und duplizieren
                    </span>
                  </Label>
                </div>
              </>
            )}

            {/* Save error */}
            {saveError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button form="exercise-form" type="submit" disabled={isSaving}>
            {isSaving ? "Speichern..." : isEditing ? "Änderungen speichern" : "Übung erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
