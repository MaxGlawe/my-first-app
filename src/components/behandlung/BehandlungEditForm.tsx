"use client"

import { useState, useCallback } from "react"
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
import { toast } from "sonner"
import { Calendar, Stethoscope, Activity, MessageSquare, ArrowRight } from "lucide-react"
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

const behandlungEditSchema = z.object({
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

type BehandlungEditValues = z.infer<typeof behandlungEditSchema>

// ── Main Form ─────────────────────────────────────────────────────────────────

interface BehandlungEditFormProps {
  session: TreatmentSession
  patientId: string
}

export function BehandlungEditForm({
  session,
  patientId,
}: BehandlungEditFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  // Load existing extended data from session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingExtended = ((session as any).data ?? {}) as BehandlungExtendedData
  const [extendedData, setExtendedData] = useState<BehandlungExtendedData>(existingExtended)

  // Separate standard measures from freitext
  const standardMeasures = session.measures.filter((m) =>
    MASSNAHMEN_KATALOG.some((k) => k.id === m)
  )
  const freitextMeasures = session.measures
    .filter((m) => !MASSNAHMEN_KATALOG.some((k) => k.id === m))
    .join(", ")

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BehandlungEditValues>({
    resolver: zodResolver(behandlungEditSchema),
    defaultValues: {
      session_date: session.session_date,
      duration_minutes: session.duration_minutes ?? null,
      measures: standardMeasures,
      measures_freitext: freitextMeasures,
      nrs_before: session.nrs_before,
      nrs_after: session.nrs_after ?? null,
      notes: session.notes ?? "",
      next_steps: session.next_steps ?? "",
    },
  })

  const selectedMeasures = watch("measures")

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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function buildMeasures(selected: string[], freitext?: string): string[] {
    const result = [...selected]
    const ft = freitext?.trim()
    if (ft) result.push(ft)
    return result
  }

  async function submitForm(
    data: BehandlungEditValues,
    status: "entwurf" | "abgeschlossen"
  ): Promise<boolean> {
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
      const res = await fetch(
        `/api/patients/${patientId}/treatments/${session.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 403) {
          setServerError(
            "Bearbeitung nicht möglich: Bearbeitungsfrist abgelaufen oder keine Berechtigung."
          )
        } else {
          setServerError(json.error ?? "Speichern fehlgeschlagen. Bitte versuche es erneut.")
        }
        return false
      }

      return true
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
      return false
    }
  }

  const onSaveDraft = handleSubmit(async (data) => {
    setIsSavingDraft(true)
    try {
      const ok = await submitForm(data, "entwurf")
      if (ok) {
        toast.success("Änderungen als Entwurf gespeichert.")
        router.push(`/os/patients/${patientId}/behandlung/${session.id}`)
      }
    } finally {
      setIsSavingDraft(false)
    }
  })

  const onFinish = handleSubmit(async (data) => {
    setIsFinishing(true)
    try {
      const ok = await submitForm(data, "abgeschlossen")
      if (ok) {
        toast.success("Behandlungsprotokoll abgeschlossen.")
        router.push(`/os/patients/${patientId}/behandlung/${session.id}`)
      }
    } finally {
      setIsFinishing(false)
    }
  })

  const isSubmitting = isSavingDraft || isFinishing

  return (
    <form className="space-y-6" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* ── Basisdaten ── */}
      <ClinicalSection title="Basisdaten" description="Datum und Dauer" icon={Calendar} accent="emerald">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session_date">
              Behandlungsdatum <span className="text-destructive">*</span>
            </Label>
            <Input id="session_date" type="date" {...register("session_date")} disabled={isSubmitting} />
            {errors.session_date && <p className="text-sm text-destructive">{errors.session_date.message}</p>}
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
                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                    disabled={isSubmitting}
                    className="w-28"
                  />
                )}
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* ── NRS Beginn ── */}
      <ClinicalSection title="Schmerzwert zu Beginn (NRS)" icon={Activity} accent="amber">
        <Controller
          name="nrs_before"
          control={control}
          render={({ field }) => <NrsSlider value={field.value} onChange={field.onChange} disabled={isSubmitting} />}
        />
      </ClinicalSection>

      {/* ── Maßnahmen ── */}
      <ClinicalSection title="Durchgeführte Maßnahmen" icon={Stethoscope} accent="emerald">
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
                      if (checked) field.onChange([...field.value, massnahme.id])
                      else field.onChange(field.value.filter((v) => v !== massnahme.id))
                    }}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Label htmlFor={`massnahme-${massnahme.id}`} className="text-sm font-normal cursor-pointer">
                {massnahme.label}
              </Label>
            </div>
          ))}
        </div>
        {selectedMeasures.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedMeasures.map((m) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
          </div>
        )}
        <div className="space-y-2 mt-3">
          <Label htmlFor="measures_freitext">Weitere Maßnahmen (Freitext)</Label>
          <Input id="measures_freitext" placeholder="z.B. PNF, Gangschule..." {...register("measures_freitext")} disabled={isSubmitting} />
        </div>
      </ClinicalSection>

      {/* ── Maßnahmen-Details ── */}
      <MassnahmenDetailSection
        selectedMeasures={selectedMeasures}
        details={extendedData.massnahmen_detail ?? []}
        onChange={updateMassnahmenDetail}
        disabled={isSubmitting}
      />

      {/* ── SOAP ── */}
      <SoapVerlaufSection
        soap={extendedData.soap ?? createEmptySoap()}
        onChange={updateSoap}
        disabled={isSubmitting}
      />

      {/* ── Patientenreaktion ── */}
      <ClinicalSection title="Patientenreaktion & Besonderheiten" icon={MessageSquare} accent="teal">
        <div className="space-y-4">
          <Textarea id="notes" rows={3} placeholder="Beobachtungen..." {...register("notes")} disabled={isSubmitting} maxLength={5000} />
          {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Schmerzreaktion</Label>
              <Textarea rows={2} placeholder="Wie reagierte der Patient?" value={extendedData.schmerzreaktion ?? ""} onChange={(e) => setExtendedData((prev) => ({ ...prev, schmerzreaktion: e.target.value }))} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Verträglichkeit</Label>
              <Textarea rows={2} placeholder="Verträglichkeit der Maßnahmen?" value={extendedData.vertraeglichkeit ?? ""} onChange={(e) => setExtendedData((prev) => ({ ...prev, vertraeglichkeit: e.target.value }))} disabled={isSubmitting} />
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* ── NRS Ende ── */}
      <ClinicalSection title="Schmerzwert am Ende (NRS)" icon={Activity} accent="emerald">
        <Controller
          name="nrs_after"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox id="nrs_after_enabled" checked={field.value !== null && field.value !== undefined} onCheckedChange={(checked) => field.onChange(checked ? 5 : null)} disabled={isSubmitting} />
                <Label htmlFor="nrs_after_enabled" className="text-sm font-normal cursor-pointer">Endschmerz erfassen</Label>
              </div>
              {field.value !== null && field.value !== undefined && (
                <NrsSlider value={field.value} onChange={field.onChange} disabled={isSubmitting} />
              )}
            </div>
          )}
        />
      </ClinicalSection>

      {/* ── Post-ROM ── */}
      <PostRomSection entries={extendedData.post_rom ?? []} onChange={updatePostRom} disabled={isSubmitting} />

      {/* ── Nächste Schritte ── */}
      <ClinicalSection title="Nächste Schritte / Therapieziel" icon={ArrowRight} accent="emerald">
        <Textarea id="next_steps" rows={3} placeholder="z.B. Fortsetzung MT LWS..." {...register("next_steps")} disabled={isSubmitting} maxLength={2000} />
        {errors.next_steps && <p className="text-sm text-destructive">{errors.next_steps.message}</p>}
      </ClinicalSection>

      {/* ── Actions ── */}
      <FormActions
        backHref={`/os/patients/${patientId}/behandlung/${session.id}`}
        saving={isSubmitting}
        onSaveDraft={onSaveDraft}
        onFinalize={onFinish}
        finalizeLabel="Abschließen & bestätigen"
      />
    </form>
  )
}
