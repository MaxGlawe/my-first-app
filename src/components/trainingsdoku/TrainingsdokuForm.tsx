"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Save, CheckCircle, ArrowLeft, Plus, Trash2, Dumbbell, Stethoscope } from "lucide-react"
import type {
  TrainingDocTyp,
  TrainingModeData,
  TherapeutischModeData,
  TrainingExerciseEntry,
} from "@/types/training-documentation"
import {
  TRAININGSART_OPTIONS,
  MASSNAHMEN_OPTIONS,
  createEmptyTrainingData,
  createEmptyTherapeutischData,
} from "@/types/training-documentation"

interface TrainingsdokuFormProps {
  patientId: string
  existingId?: string
  existingTyp?: TrainingDocTyp
  existingSessionDate?: string
  existingDuration?: number | null
  existingData?: TrainingModeData | TherapeutischModeData
  existingStatus?: string
}

export function TrainingsdokuForm({
  patientId,
  existingId,
  existingTyp,
  existingSessionDate,
  existingDuration,
  existingData,
  existingStatus,
}: TrainingsdokuFormProps) {
  const router = useRouter()
  const isEdit = !!existingId
  const isLocked = existingStatus === "abgeschlossen"

  // ── Mode ──
  const [typ, setTyp] = useState<TrainingDocTyp>(existingTyp ?? "training")

  // ── Metadata ──
  const [sessionDate, setSessionDate] = useState(
    existingSessionDate ?? new Date().toISOString().slice(0, 10)
  )
  const [durationMinutes, setDurationMinutes] = useState<string>(
    existingDuration?.toString() ?? ""
  )

  // ── Mode-specific data ──
  const [trainingData, setTrainingData] = useState<TrainingModeData>(
    existingTyp === "training" && existingData
      ? (existingData as TrainingModeData)
      : createEmptyTrainingData()
  )
  const [therapeutischData, setTherapeutischData] = useState<TherapeutischModeData>(
    existingTyp === "therapeutisch" && existingData
      ? (existingData as TherapeutischModeData)
      : createEmptyTherapeutischData()
  )

  // ── Submission state ──
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const isSubmitting = isSavingDraft || isFinishing

  // ── Training mode helpers ──
  const updateTraining = useCallback(
    <K extends keyof TrainingModeData>(key: K, value: TrainingModeData[K]) => {
      setTrainingData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const addExercise = useCallback(() => {
    setTrainingData((prev) => ({
      ...prev,
      uebungen: [...prev.uebungen, { name: "" }],
    }))
  }, [])

  const updateExercise = useCallback(
    (index: number, updates: Partial<TrainingExerciseEntry>) => {
      setTrainingData((prev) => ({
        ...prev,
        uebungen: prev.uebungen.map((u, i) => (i === index ? { ...u, ...updates } : u)),
      }))
    },
    []
  )

  const removeExercise = useCallback((index: number) => {
    setTrainingData((prev) => ({
      ...prev,
      uebungen: prev.uebungen.filter((_, i) => i !== index),
    }))
  }, [])

  // ── Therapeutisch mode helpers ──
  const updateTherapeutisch = useCallback(
    <K extends keyof TherapeutischModeData>(key: K, value: TherapeutischModeData[K]) => {
      setTherapeutischData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const toggleMassnahme = useCallback((massnahme: string) => {
    setTherapeutischData((prev) => ({
      ...prev,
      massnahmen: prev.massnahmen.includes(massnahme)
        ? prev.massnahmen.filter((m) => m !== massnahme)
        : [...prev.massnahmen, massnahme],
    }))
  }, [])

  // ── Submit ──
  async function submitForm(status: "entwurf" | "abgeschlossen") {
    setServerError(null)

    const payload = {
      typ,
      session_date: sessionDate,
      duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      status,
      data: typ === "training" ? trainingData : therapeutischData,
    }

    try {
      const url = isEdit
        ? `/api/patients/${patientId}/trainingsdoku/${existingId}`
        : `/api/patients/${patientId}/trainingsdoku`
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Speichern fehlgeschlagen.")
        return null
      }

      return json.session?.id as string
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
      return null
    }
  }

  const onSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      const id = await submitForm("entwurf")
      if (id) {
        toast.success("Entwurf gespeichert.")
        router.push(`/os/patients/${patientId}/trainingsdoku/${id}`)
      }
    } finally {
      setIsSavingDraft(false)
    }
  }

  const onFinish = async () => {
    setIsFinishing(true)
    try {
      const id = await submitForm("abgeschlossen")
      if (id) {
        toast.success("Dokumentation abgeschlossen.")
        router.push(`/os/patients/${patientId}/trainingsdoku/${id}`)
      }
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <div className="space-y-8">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {isLocked && (
        <Alert>
          <AlertDescription>
            Diese Dokumentation ist abgeschlossen und kann nicht mehr bearbeitet werden.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Mode Toggle ── */}
      {!isEdit && (
        <section>
          <h2 className="text-lg font-semibold mb-1">Art der Dokumentation</h2>
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTyp("training")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ${
                typ === "training"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <Dumbbell className={`h-6 w-6 ${typ === "training" ? "text-blue-500" : "text-muted-foreground"}`} />
              <div>
                <div className="font-medium text-sm">Prävention / Training</div>
                <div className="text-xs text-muted-foreground">Übungen, Sätze, Gewichte</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTyp("therapeutisch")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ${
                typ === "therapeutisch"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <Stethoscope className={`h-6 w-6 ${typ === "therapeutisch" ? "text-emerald-500" : "text-muted-foreground"}`} />
              <div>
                <div className="font-medium text-sm">Therapeutisch (KG/KGG)</div>
                <div className="text-xs text-muted-foreground">Maßnahmen, NRS, Befund</div>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ── Metadata ── */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Sitzungsdaten</h2>
        <Separator className="mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="session_date">Datum</Label>
            <Input
              id="session_date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              disabled={isLocked}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration">Dauer (Minuten)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={300}
              placeholder="z.B. 60"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              disabled={isLocked}
              className="mt-1"
            />
          </div>
        </div>
      </section>

      {/* ── Training Mode Content ── */}
      {typ === "training" && (
        <>
          <section>
            <h2 className="text-lg font-semibold mb-1">Trainingsdetails</h2>
            <Separator className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="trainingsart">Trainingsart</Label>
                <Select
                  value={trainingData.trainingsart}
                  onValueChange={(v) => updateTraining("trainingsart", v)}
                  disabled={isLocked}
                >
                  <SelectTrigger id="trainingsart" className="mt-1">
                    <SelectValue placeholder="Bitte wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAININGSART_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="schwerpunkt">Schwerpunkt</Label>
                <Input
                  id="schwerpunkt"
                  placeholder="z.B. Rumpfstabilität, Oberkörper..."
                  value={trainingData.schwerpunkt}
                  onChange={(e) => updateTraining("schwerpunkt", e.target.value)}
                  disabled={isLocked}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {/* Exercises */}
          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">Übungen</h2>
              {!isLocked && (
                <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                  <Plus className="mr-1 h-4 w-4" />
                  Übung hinzufügen
                </Button>
              )}
            </div>
            <Separator className="mb-4" />

            {trainingData.uebungen.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Übungen hinzugefügt.
              </p>
            ) : (
              <div className="space-y-3">
                {trainingData.uebungen.map((exercise, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid gap-3 sm:grid-cols-5">
                          <div className="sm:col-span-2">
                            <Label className="text-xs">Übungsname</Label>
                            <Input
                              placeholder="z.B. Kniebeuge"
                              value={exercise.name}
                              onChange={(e) => updateExercise(idx, { name: e.target.value })}
                              disabled={isLocked}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Sätze</Label>
                            <Input
                              type="number"
                              min={1}
                              placeholder="3"
                              value={exercise.saetze ?? ""}
                              onChange={(e) =>
                                updateExercise(idx, {
                                  saetze: e.target.value ? parseInt(e.target.value, 10) : undefined,
                                })
                              }
                              disabled={isLocked}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Wdh.</Label>
                            <Input
                              type="number"
                              min={1}
                              placeholder="12"
                              value={exercise.wiederholungen ?? ""}
                              onChange={(e) =>
                                updateExercise(idx, {
                                  wiederholungen: e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : undefined,
                                })
                              }
                              disabled={isLocked}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Gewicht</Label>
                            <Input
                              placeholder="z.B. 20kg"
                              value={exercise.gewicht ?? ""}
                              onChange={(e) => updateExercise(idx, { gewicht: e.target.value })}
                              disabled={isLocked}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                        </div>
                        {!isLocked && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(idx)}
                            className="text-destructive hover:text-destructive mt-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="mt-2">
                        <Input
                          placeholder="Anmerkung zur Übung (optional)"
                          value={exercise.anmerkung ?? ""}
                          onChange={(e) => updateExercise(idx, { anmerkung: e.target.value })}
                          disabled={isLocked}
                          className="h-8 text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Training notes */}
          <section>
            <h2 className="text-lg font-semibold mb-1">Anmerkungen & Nächstes Training</h2>
            <Separator className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="anmerkung">Allgemeine Anmerkung</Label>
                <Textarea
                  id="anmerkung"
                  placeholder="Beobachtungen, Feedback des Patienten..."
                  value={trainingData.anmerkung}
                  onChange={(e) => updateTraining("anmerkung", e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="naechstes_training">Nächstes Training</Label>
                <Textarea
                  id="naechstes_training"
                  placeholder="Planung für die nächste Sitzung..."
                  value={trainingData.naechstes_training}
                  onChange={(e) => updateTraining("naechstes_training", e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Therapeutisch Mode Content ── */}
      {typ === "therapeutisch" && (
        <>
          <section>
            <h2 className="text-lg font-semibold mb-1">Therapeutische Maßnahmen</h2>
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MASSNAHMEN_OPTIONS.map((massnahme) => (
                <label
                  key={massnahme}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={therapeutischData.massnahmen.includes(massnahme)}
                    onCheckedChange={() => toggleMassnahme(massnahme)}
                    disabled={isLocked}
                  />
                  {massnahme}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Schmerzskala (NRS)</h2>
            <Separator className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nrs_before">NRS vor Behandlung (0-10)</Label>
                <Input
                  id="nrs_before"
                  type="number"
                  min={0}
                  max={10}
                  placeholder="0-10"
                  value={therapeutischData.nrs_before ?? ""}
                  onChange={(e) =>
                    updateTherapeutisch(
                      "nrs_before",
                      e.target.value ? parseInt(e.target.value, 10) : null
                    )
                  }
                  disabled={isLocked}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nrs_after">NRS nach Behandlung (0-10)</Label>
                <Input
                  id="nrs_after"
                  type="number"
                  min={0}
                  max={10}
                  placeholder="0-10"
                  value={therapeutischData.nrs_after ?? ""}
                  onChange={(e) =>
                    updateTherapeutisch(
                      "nrs_after",
                      e.target.value ? parseInt(e.target.value, 10) : null
                    )
                  }
                  disabled={isLocked}
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Befund & Notizen</h2>
            <Separator className="mb-4" />
            <div className="grid gap-4">
              <div>
                <Label htmlFor="befund">Befund</Label>
                <Textarea
                  id="befund"
                  placeholder="Klinischer Befund, Beobachtungen..."
                  value={therapeutischData.befund}
                  onChange={(e) => updateTherapeutisch("befund", e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notizen">Notizen</Label>
                <Textarea
                  id="notizen"
                  placeholder="Zusätzliche Notizen, Patientenfeedback..."
                  value={therapeutischData.notizen}
                  onChange={(e) => updateTherapeutisch("notizen", e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="naechste_schritte">Nächste Schritte</Label>
                <Textarea
                  id="naechste_schritte"
                  placeholder="Empfehlungen, geplante Maßnahmen..."
                  value={therapeutischData.naechste_schritte}
                  onChange={(e) => updateTherapeutisch("naechste_schritte", e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Action buttons ── */}
      {!isLocked && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Link href={`/os/patients/${patientId}?tab=trainingsdoku`}>
            <Button variant="ghost" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSavingDraft ? "Speichert..." : "Als Entwurf speichern"}
            </Button>
            <Button
              type="button"
              onClick={onFinish}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isFinishing ? "Wird abgeschlossen..." : "Abschließen"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
