"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Copy, CloudOff, Cloud, Loader2, Calendar, Stethoscope, Activity, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { ClinicalSection, NrsSlider, FormActions } from "@/components/clinical-ui"
import { SoapVerlaufSection } from "./sections/SoapVerlaufSection"
import { MassnahmenDetailSection } from "./sections/MassnahmenDetailSection"
import { PostRomSection } from "./sections/PostRomSection"
import { MASSNAHMEN_KATALOG } from "@/types/behandlung"
import type {
  TreatmentSession,
  BehandlungExtendedData,
  SoapVerlauf,
  MassnahmeDetail,
  PostRomEintrag,
} from "@/types/behandlung"
import { createEmptySoap } from "@/types/behandlung"

// ── Zod Schema ────────────────────────────────────────────────────────────────

const behandlungFormSchema = z.object({
  session_date: z.string().min(1, "Datum ist erforderlich."),
  duration_minutes: z
    .number()
    .int()
    .min(1, "Mindestens 1 Minute.")
    .max(480, "Maximal 480 Minuten.")
    .nullable()
    .optional(),
  measures: z.array(z.string()).min(0),
  measures_freitext: z.string().max(200).optional().or(z.literal("")),
  nrs_before: z.number().int().min(0).max(10),
  nrs_after: z.number().int().min(0).max(10).nullable().optional(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  next_steps: z.string().max(2000).optional().or(z.literal("")),
})

type BehandlungFormValues = z.infer<typeof behandlungFormSchema>

// ── Auto-Save Indicator ────────────────────────────────────────────────────────

type SaveIndicatorState = "idle" | "saving" | "saved" | "error"

function AutoSaveIndicator({ state }: { state: SaveIndicatorState }) {
  if (state === "idle") return null
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Wird gespeichert…
      </span>
    )
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <Cloud className="h-3 w-3" />
        Entwurf gespeichert
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-destructive">
      <CloudOff className="h-3 w-3" />
      Speichern fehlgeschlagen
    </span>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────────

interface BehandlungFormProps {
  patientId: string
  lastSession?: TreatmentSession | null
}

export function BehandlungForm({
  patientId,
  lastSession,
}: BehandlungFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [autoSaveState, setAutoSaveState] = useState<SaveIndicatorState>("idle")

  // Extended data (stored in JSONB `data` column)
  const [extendedData, setExtendedData] = useState<BehandlungExtendedData>({})

  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BehandlungFormValues>({
    resolver: zodResolver(behandlungFormSchema),
    defaultValues: {
      session_date: today,
      duration_minutes: null,
      measures: [],
      measures_freitext: "",
      nrs_before: 5,
      nrs_after: null,
      notes: "",
      next_steps: "",
    },
  })

  const watchedValues = watch()
  const debouncedValues = useDebounce(watchedValues, 30000)

  // ── Extended data updaters ──

  const updateSoap = useCallback((soap: SoapVerlauf) => {
    setExtendedData((prev) => ({ ...prev, soap }))
  }, [])

  const updateMassnahmenDetail = useCallback((details: MassnahmeDetail[]) => {
    setExtendedData((prev) => ({ ...prev, massnahmen_detail: details }))
  }, [])

  const updatePostRom = useCallback((entries: PostRomEintrag[]) => {
    setExtendedData((prev) => ({ ...prev, post_rom: entries }))
  }, [])

  // ── Auto-Save every 30s ────────────────────────────────────────────────────

  const autoSave = useCallback(
    async (values: BehandlungFormValues) => {
      setAutoSaveState("saving")
      try {
        const allMeasures = buildMeasures(values.measures, values.measures_freitext)
        const payload = {
          status: "entwurf",
          session_date: values.session_date,
          duration_minutes: values.duration_minutes ?? null,
          measures: allMeasures,
          nrs_before: values.nrs_before,
          nrs_after: values.nrs_after ?? null,
          notes: values.notes?.trim() ?? "",
          next_steps: values.next_steps?.trim() ?? "",
          data: extendedData,
        }

        const url = draftId
          ? `/api/patients/${patientId}/treatments/${draftId}`
          : `/api/patients/${patientId}/treatments`
        const method = draftId ? "PATCH" : "POST"

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const json = await res.json()
          if (!draftId && json.session?.id) {
            setDraftId(json.session.id)
          }
          setAutoSaveState("saved")
        } else {
          setAutoSaveState("error")
        }
      } catch {
        setAutoSaveState("error")
      }
    },
    [patientId, draftId, extendedData]
  )

  useEffect(() => {
    if (!isDirty) return
    autoSave(debouncedValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValues])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function buildMeasures(selected: string[], freitext?: string): string[] {
    const result = [...selected]
    const ft = freitext?.trim()
    if (ft) result.push(ft)
    return result
  }

  function handleCopyLastSession() {
    if (!lastSession) return
    const standardMeasures = lastSession.measures.filter((m) =>
      MASSNAHMEN_KATALOG.some((k) => k.id === m)
    )
    const freitext = lastSession.measures
      .filter((m) => !MASSNAHMEN_KATALOG.some((k) => k.id === m))
      .join(", ")
    setValue("measures", standardMeasures)
    setValue("measures_freitext", freitext)
    toast.info("Maßnahmen der letzten Behandlung übernommen.")
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function submitForm(
    data: BehandlungFormValues,
    status: "entwurf" | "abgeschlossen"
  ): Promise<string | false> {
    setServerError(null)
    const allMeasures = buildMeasures(data.measures, data.measures_freitext)

    const payload = {
      status,
      session_date: data.session_date,
      duration_minutes: data.duration_minutes ?? null,
      measures: allMeasures,
      nrs_before: data.nrs_before,
      nrs_after: data.nrs_after ?? null,
      notes: data.notes?.trim() ?? "",
      next_steps: data.next_steps?.trim() ?? "",
      data: extendedData,
    }

    try {
      const url = draftId
        ? `/api/patients/${patientId}/treatments/${draftId}`
        : `/api/patients/${patientId}/treatments`
      const method = draftId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Speichern fehlgeschlagen. Bitte versuche es erneut.")
        return false
      }

      return (json.session?.id ?? draftId) as string
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
      return false
    }
  }

  const onSaveDraft = handleSubmit(async (data) => {
    setIsSavingDraft(true)
    try {
      const result = await submitForm(data, "entwurf")
      if (result) {
        toast.success("Behandlung als Entwurf gespeichert.")
        router.push(`/os/patients/${patientId}/behandlung/${result}`)
      }
    } finally {
      setIsSavingDraft(false)
    }
  })

  const onFinish = handleSubmit(async (data) => {
    setIsFinishing(true)
    try {
      const result = await submitForm(data, "abgeschlossen")
      if (result) {
        toast.success("Behandlungsprotokoll abgeschlossen.")
        router.push(`/os/patients/${patientId}/behandlung/${result}`)
      }
    } finally {
      setIsFinishing(false)
    }
  })

  const isSubmitting = isSavingDraft || isFinishing
  const selectedMeasures = watch("measures")

  return (
    <form className="space-y-6" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* ── Quick template ── */}
      {lastSession && (
        <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
          <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Wie letzte Behandlung</p>
            <p className="text-xs text-muted-foreground truncate">
              {lastSession.measures.join(", ") || "Keine Maßnahmen"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLastSession}
            disabled={isSubmitting}
          >
            Übernehmen
          </Button>
        </div>
      )}

      {/* ── Section 1: Basisdaten ── */}
      <ClinicalSection
        title="Basisdaten"
        description="Datum und Dauer der Behandlung"
        icon={Calendar}
        accent="emerald"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session_date">
              Behandlungsdatum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="session_date"
              type="date"
              {...register("session_date")}
              disabled={isSubmitting}
            />
            {errors.session_date && (
              <p className="text-sm text-destructive">{errors.session_date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Behandlungsdauer (Minuten)</Label>
            <div className="flex items-center gap-2">
              <Controller
                name="duration_minutes"
                control={control}
                render={({ field }) => (
                  <Input
                    id="duration_minutes"
                    type="number"
                    min={1}
                    max={480}
                    placeholder="z.B. 45"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                      field.onChange(v === "" ? null : parseInt(v, 10))
                    }}
                    disabled={isSubmitting}
                    className="w-28"
                  />
                )}
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
            {errors.duration_minutes && (
              <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
            )}
          </div>
        </div>
      </ClinicalSection>

      {/* ── Section 2: NRS Beginn ── */}
      <ClinicalSection
        title="Schmerzwert zu Beginn (NRS)"
        description="Numerische Rating-Skala: 0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz"
        icon={Activity}
        accent="amber"
      >
        <Controller
          name="nrs_before"
          control={control}
          render={({ field }) => (
            <NrsSlider
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </ClinicalSection>

      {/* ── Section 3: Maßnahmen ── */}
      <ClinicalSection
        title="Durchgeführte Maßnahmen"
        description="Mehrfachauswahl aus dem Maßnahmen-Katalog"
        icon={Stethoscope}
        accent="emerald"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MASSNAHMEN_KATALOG.map((massnahme) => (
            <div key={massnahme.id} className="flex items-center space-x-2">
              <Controller
                name="measures"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={`massnahme-${massnahme.id}`}
                    checked={field.value.includes(massnahme.id)}
                    onCheckedChange={(checked) => {
                      const current = field.value
                      if (checked) {
                        field.onChange([...current, massnahme.id])
                      } else {
                        field.onChange(current.filter((v) => v !== massnahme.id))
                      }
                    }}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Label
                htmlFor={`massnahme-${massnahme.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {massnahme.label}
              </Label>
            </div>
          ))}
        </div>

        {selectedMeasures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedMeasures.map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">
                {m}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2 mt-3">
          <Label htmlFor="measures_freitext">Weitere Maßnahmen (Freitext)</Label>
          <Input
            id="measures_freitext"
            placeholder="z.B. PNF, Gangschule..."
            {...register("measures_freitext")}
            disabled={isSubmitting}
          />
        </div>
      </ClinicalSection>

      {/* ── Section 3b: Maßnahmen-Details (optional) ── */}
      <MassnahmenDetailSection
        selectedMeasures={selectedMeasures}
        details={extendedData.massnahmen_detail ?? []}
        onChange={updateMassnahmenDetail}
        disabled={isSubmitting}
      />

      {/* ── Section 4: SOAP-Verlaufsdoku ── */}
      <SoapVerlaufSection
        soap={extendedData.soap ?? createEmptySoap()}
        onChange={updateSoap}
        disabled={isSubmitting}
      />

      {/* ── Section 5: Patientenreaktion ── */}
      <ClinicalSection
        title="Patientenreaktion & Besonderheiten"
        description="Beobachtungen, Reaktion des Patienten, besondere Vorkommnisse"
        icon={MessageSquare}
        accent="teal"
      >
        <div className="space-y-4">
          <Textarea
            id="notes"
            rows={3}
            placeholder="z.B. Patient berichtet über deutliche Schmerzreduktion nach MT. Beweglichkeit der HWS in Rotation beidseits verbessert..."
            {...register("notes")}
            disabled={isSubmitting}
            maxLength={5000}
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Schmerzreaktion</Label>
              <Textarea
                rows={2}
                placeholder="Wie reagierte der Patient auf die Behandlung?"
                value={extendedData.schmerzreaktion ?? ""}
                onChange={(e) =>
                  setExtendedData((prev) => ({ ...prev, schmerzreaktion: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Verträglichkeit</Label>
              <Textarea
                rows={2}
                placeholder="Verträglichkeit der Maßnahmen?"
                value={extendedData.vertraeglichkeit ?? ""}
                onChange={(e) =>
                  setExtendedData((prev) => ({ ...prev, vertraeglichkeit: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* ── Section 6: NRS Ende ── */}
      <ClinicalSection
        title="Schmerzwert am Ende (NRS)"
        description="Schmerzwert nach der Behandlung — optional"
        icon={Activity}
        accent="emerald"
      >
        <Controller
          name="nrs_after"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="nrs_after_enabled"
                  checked={field.value !== null && field.value !== undefined}
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? 5 : null)
                  }}
                  disabled={isSubmitting}
                />
                <Label htmlFor="nrs_after_enabled" className="text-sm font-normal cursor-pointer">
                  Endschmerz erfassen
                </Label>
              </div>
              {field.value !== null && field.value !== undefined && (
                <NrsSlider
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}
        />
      </ClinicalSection>

      {/* ── Section 7: Post-ROM ── */}
      <PostRomSection
        entries={extendedData.post_rom ?? []}
        onChange={updatePostRom}
        disabled={isSubmitting}
      />

      {/* ── Section 8: Nächste Schritte ── */}
      <ClinicalSection
        title="Nächste Schritte / Therapieziel"
        description="Planung für die nächste Behandlungseinheit"
        icon={ArrowRight}
        accent="emerald"
      >
        <Textarea
          id="next_steps"
          rows={3}
          placeholder="z.B. Fortsetzung MT LWS + Kräftigung core-Muskulatur. Hausaufgabe: Dehnübungen täglich 10 min..."
          {...register("next_steps")}
          disabled={isSubmitting}
          maxLength={2000}
        />
        {errors.next_steps && (
          <p className="text-sm text-destructive">{errors.next_steps.message}</p>
        )}
      </ClinicalSection>

      {/* ── Actions ── */}
      <div className="flex items-center">
        <AutoSaveIndicator state={autoSaveState} />
      </div>
      <FormActions
        backHref={`/os/patients/${patientId}?tab=behandlungen`}
        saving={isSubmitting}
        onSaveDraft={onSaveDraft}
        onFinalize={onFinish}
        finalizeLabel="Abschließen & bestätigen"
      />
    </form>
  )
}
