"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClinicalSection, ClinicalCard, FormActions, NrsSlider } from "@/components/clinical-ui"
import { toast } from "sonner"
import { Plus, Trash2, Dumbbell, Stethoscope, Calendar, ClipboardList, Activity, MessageSquare } from "lucide-react"
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
    <div className="space-y-6">
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
        <ClinicalSection title="Art der Dokumentation" icon={ClipboardList} accent="emerald">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTyp("training")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                typ === "training"
                  ? "border-blue-400 bg-blue-50/50 shadow-sm"
                  : "border-slate-200/60 hover:border-slate-300"
              }`}
            >
              <div className={`p-2 rounded-xl ${typ === "training" ? "bg-gradient-to-br from-blue-50 to-cyan-50" : "bg-slate-100"}`}>
                <Dumbbell className={`h-5 w-5 ${typ === "training" ? "text-blue-600" : "text-slate-400"}`} />
              </div>
              <div>
                <div className="font-medium text-sm text-slate-800">Prävention / Training</div>
                <div className="text-xs text-slate-500">Übungen, Sätze, Gewichte</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTyp("therapeutisch")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                typ === "therapeutisch"
                  ? "border-emerald-400 bg-emerald-50/50 shadow-sm"
                  : "border-slate-200/60 hover:border-slate-300"
              }`}
            >
              <div className={`p-2 rounded-xl ${typ === "therapeutisch" ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-slate-100"}`}>
                <Stethoscope className={`h-5 w-5 ${typ === "therapeutisch" ? "text-emerald-600" : "text-slate-400"}`} />
              </div>
              <div>
                <div className="font-medium text-sm text-slate-800">Therapeutisch (KG/KGG)</div>
                <div className="text-xs text-slate-500">Maßnahmen, NRS, Befund</div>
              </div>
            </button>
          </div>
        </ClinicalSection>
      )}

      {/* ── Metadata ── */}
      <ClinicalSection title="Sitzungsdaten" icon={Calendar} accent="blue">
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
      </ClinicalSection>

      {/* ── Training Mode Content ── */}
      {typ === "training" && (
        <>
          <ClinicalSection title="Trainingsdetails" icon={Dumbbell} accent="blue">
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
          </ClinicalSection>

          {/* Exercises */}
          <ClinicalSection title="Übungen" icon={ClipboardList} accent="blue">
            <div className="flex items-center justify-end mb-3">
              {!isLocked && (
                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="border-slate-200/60">
                  <Plus className="mr-1 h-4 w-4" />
                  Übung hinzufügen
                </Button>
              )}
            </div>

            {trainingData.uebungen.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                Noch keine Übungen hinzugefügt.
              </p>
            ) : (
              <div className="space-y-3">
                {trainingData.uebungen.map((exercise, idx) => (
                  <ClinicalCard key={idx}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid gap-3 sm:grid-cols-5">
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-slate-500">Übungsname</Label>
                          <Input
                            placeholder="z.B. Kniebeuge"
                            value={exercise.name}
                            onChange={(e) => updateExercise(idx, { name: e.target.value })}
                            disabled={isLocked}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Sätze</Label>
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
                          <Label className="text-xs text-slate-500">Wdh.</Label>
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
                          <Label className="text-xs text-slate-500">Gewicht</Label>
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
                  </ClinicalCard>
                ))}
              </div>
            )}
          </ClinicalSection>

          {/* Training notes */}
          <ClinicalSection title="Anmerkungen & Nächstes Training" icon={MessageSquare} accent="amber">
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
          </ClinicalSection>
        </>
      )}

      {/* ── Therapeutisch Mode Content ── */}
      {typ === "therapeutisch" && (
        <>
          <ClinicalSection title="Therapeutische Maßnahmen" icon={Stethoscope} accent="emerald">
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
          </ClinicalSection>

          <ClinicalSection title="Schmerzskala (NRS)" icon={Activity} accent="red">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label className="text-sm text-slate-600 mb-3 block">NRS vor Behandlung</Label>
                <NrsSlider
                  value={therapeutischData.nrs_before ?? 0}
                  onChange={(v) => updateTherapeutisch("nrs_before", v)}
                  disabled={isLocked}
                  showLabels={false}
                />
              </div>
              <div>
                <Label className="text-sm text-slate-600 mb-3 block">NRS nach Behandlung</Label>
                <NrsSlider
                  value={therapeutischData.nrs_after ?? 0}
                  onChange={(v) => updateTherapeutisch("nrs_after", v)}
                  disabled={isLocked}
                  showLabels={false}
                />
              </div>
            </div>
          </ClinicalSection>

          <ClinicalSection title="Befund & Notizen" icon={ClipboardList} accent="blue">
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
          </ClinicalSection>
        </>
      )}

      {/* ── Action buttons ── */}
      {!isLocked && (
        <FormActions
          backHref={`/os/patients/${patientId}?tab=trainingsdoku`}
          saving={isSubmitting}
          onSaveDraft={onSaveDraft}
          onFinalize={onFinish}
          finalizeLabel="Abschließen"
        />
      )}
    </div>
  )
}
