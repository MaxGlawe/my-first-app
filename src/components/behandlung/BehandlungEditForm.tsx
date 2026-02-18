"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Save, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MASSNAHMEN_KATALOG } from "@/types/behandlung"
import type { TreatmentSession } from "@/types/behandlung"

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
      <Separator className="mt-2" />
    </div>
  )
}

// ── NRS Slider ────────────────────────────────────────────────────────────────

function NrsSlider({
  value,
  onChange,
  disabled,
  id,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
  id?: string
}) {
  const colorClass =
    value <= 3
      ? "text-green-600"
      : value <= 6
      ? "text-amber-600"
      : "text-red-600"

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="flex-1 accent-primary cursor-pointer disabled:cursor-not-allowed"
          aria-label="NRS Schmerzwert"
        />
        <span className={`text-2xl font-bold tabular-nums w-8 text-center ${colorClass}`}>
          {value}
        </span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-0.5">
        <span>0 — Kein Schmerz</span>
        <span>5 — Mäßig</span>
        <span>10 — Stärkster Schmerz</span>
      </div>
    </div>
  )
}

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
          setServerError(
            json.error ?? "Speichern fehlgeschlagen. Bitte versuche es erneut."
          )
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
    <form className="space-y-10" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* ── Datum & Dauer ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Basisdaten"
          description="Datum und Dauer der Behandlung"
        />
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
              <p className="text-sm text-destructive">
                {errors.session_date.message}
              </p>
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
              <p className="text-sm text-destructive">
                {errors.duration_minutes.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── NRS Beginn ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Schmerzwert zu Beginn (NRS)"
          description="Numerische Rating-Skala: 0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz"
        />
        <Controller
          name="nrs_before"
          control={control}
          render={({ field }) => (
            <NrsSlider
              id="nrs_before"
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </div>

      {/* ── Maßnahmen ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Durchgeführte Maßnahmen"
          description="Mehrfachauswahl aus dem Maßnahmen-Katalog"
        />
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
                        field.onChange(
                          current.filter((v) => v !== massnahme.id)
                        )
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
          <div className="flex flex-wrap gap-1.5">
            {selectedMeasures.map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">
                {m}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="measures_freitext">Weitere Maßnahmen (Freitext)</Label>
          <Input
            id="measures_freitext"
            placeholder="z.B. PNF, Gangschule..."
            {...register("measures_freitext")}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* ── Notizen ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Patientenreaktion & Besonderheiten"
          description="Beobachtungen, Reaktion des Patienten, besondere Vorkommnisse"
        />
        <Textarea
          id="notes"
          rows={4}
          placeholder="z.B. Patient berichtet über deutliche Schmerzreduktion nach MT..."
          {...register("notes")}
          disabled={isSubmitting}
          maxLength={5000}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* ── NRS Ende ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Schmerzwert am Ende (NRS)"
          description="Schmerzwert nach der Behandlung — optional"
        />
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
                <Label
                  htmlFor="nrs_after_enabled"
                  className="text-sm font-normal cursor-pointer"
                >
                  Endschmerz erfassen
                </Label>
              </div>
              {field.value !== null && field.value !== undefined && (
                <NrsSlider
                  id="nrs_after"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}
        />
      </div>

      {/* ── Nächste Schritte ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Nächste Schritte / Therapieziel"
          description="Planung für die nächste Behandlungseinheit"
        />
        <Textarea
          id="next_steps"
          rows={3}
          placeholder="z.B. Fortsetzung MT LWS + Kräftigung core-Muskulatur..."
          {...register("next_steps")}
          disabled={isSubmitting}
          maxLength={2000}
        />
        {errors.next_steps && (
          <p className="text-sm text-destructive">
            {errors.next_steps.message}
          </p>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2 border-t flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSavingDraft ? "Speichern…" : "Als Entwurf speichern"}
        </Button>
        <Button type="button" onClick={onFinish} disabled={isSubmitting}>
          <CheckCircle className="mr-2 h-4 w-4" />
          {isFinishing ? "Abschließen…" : "Abschließen & bestätigen"}
        </Button>
        <Button asChild variant="ghost" disabled={isSubmitting}>
          <Link href={`/os/patients/${patientId}/behandlung/${session.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Abbrechen
          </Link>
        </Button>
      </div>
    </form>
  )
}
