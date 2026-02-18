"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icd10Combobox } from "./Icd10Combobox"
import { toast } from "sonner"
import { Plus, Trash2, Save, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { DiagnoseSicherheitsgrad } from "@/types/diagnose"

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

// ── Sicherheitsgrad Select ─────────────────────────────────────────────────

function SicherheitsgradSelect({
  value,
  onChange,
  disabled,
}: {
  value: DiagnoseSicherheitsgrad
  onChange: (v: DiagnoseSicherheitsgrad) => void
  disabled?: boolean
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as DiagnoseSicherheitsgrad)}
      disabled={disabled}
    >
      <SelectTrigger aria-label="Diagnose-Sicherheitsgrad">
        <SelectValue placeholder="Sicherheitsgrad..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gesichert">Gesichert</SelectItem>
        <SelectItem value="verdacht">Verdachtsdiagnose</SelectItem>
        <SelectItem value="ausschluss">Ausschlussdiagnose</SelectItem>
      </SelectContent>
    </Select>
  )
}

// ── Zod Schema ────────────────────────────────────────────────────────────────

const icd10Schema = z.object({
  code: z.string(),
  bezeichnung: z.string(),
}).nullable()

const diagnoseEintragSchema = z.object({
  icd10: icd10Schema,
  sicherheitsgrad: z.enum(["gesichert", "verdacht", "ausschluss"]),
  freitextDiagnose: z.string().max(500).optional().or(z.literal("")),
  freitextNotiz: z.string().max(1000).optional().or(z.literal("")),
})

const befundFormSchema = z.object({
  klinischer_befund: z
    .string()
    .min(1, "Klinischer Befund ist erforderlich.")
    .max(5000),
  hauptdiagnose: diagnoseEintragSchema,
  nebendiagnosen: z.array(diagnoseEintragSchema).max(5),
  therapieziel: z.string().max(2000).optional().or(z.literal("")),
  prognose: z.string().max(2000).optional().or(z.literal("")),
  therapiedauer_wochen: z
    .number()
    .int()
    .min(1, "Mindestens 1 Woche.")
    .max(520, "Maximal 520 Wochen.")
    .nullable()
    .optional(),
})

type BefundFormValues = z.infer<typeof befundFormSchema>

// ── Main Form ─────────────────────────────────────────────────────────────────

interface BefundFormProps {
  patientId: string
}

export function BefundForm({ patientId }: BefundFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BefundFormValues>({
    resolver: zodResolver(befundFormSchema),
    defaultValues: {
      klinischer_befund: "",
      hauptdiagnose: {
        icd10: null,
        sicherheitsgrad: "gesichert",
        freitextDiagnose: "",
        freitextNotiz: "",
      },
      nebendiagnosen: [],
      therapieziel: "",
      prognose: "",
      therapiedauer_wochen: null,
    },
  })

  const {
    fields: nebendiagnoseFields,
    append: appendNeben,
    remove: removeNeben,
  } = useFieldArray({
    control,
    name: "nebendiagnosen",
  })

  async function submitForm(data: BefundFormValues, status: "entwurf" | "abgeschlossen") {
    setServerError(null)

    const payload = {
      status,
      klinischer_befund: data.klinischer_befund.trim(),
      hauptdiagnose: {
        icd10: data.hauptdiagnose.icd10,
        sicherheitsgrad: data.hauptdiagnose.sicherheitsgrad,
        freitextDiagnose: data.hauptdiagnose.freitextDiagnose?.trim() ?? "",
        freitextNotiz: data.hauptdiagnose.freitextNotiz?.trim() ?? "",
      },
      nebendiagnosen: data.nebendiagnosen.map((n) => ({
        icd10: n.icd10,
        sicherheitsgrad: n.sicherheitsgrad,
        freitextDiagnose: n.freitextDiagnose?.trim() ?? "",
        freitextNotiz: n.freitextNotiz?.trim() ?? "",
      })),
      therapieziel: data.therapieziel?.trim() ?? "",
      prognose: data.prognose?.trim() ?? "",
      therapiedauer_wochen: data.therapiedauer_wochen ?? null,
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/diagnoses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 403) {
          setServerError(
            "Zugriff verweigert. Nur Heilpraktiker dürfen Befunde erstellen."
          )
        } else {
          setServerError(json.error ?? "Speichern fehlgeschlagen. Bitte versuche es erneut.")
        }
        return false
      }

      return json.record?.id as string | undefined
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
        toast.success("Befundbericht als Entwurf gespeichert.")
        router.push(`/os/patients/${patientId}/befund/${result}`)
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
        toast.success("Befundbericht abgeschlossen und gesperrt.")
        router.push(`/os/patients/${patientId}/befund/${result}`)
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

      {/* ── Klinischer Befund ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Klinischer Befund"
          description="Objektive Befunderhebung, Untersuchungsergebnisse und klinische Beobachtungen"
        />
        <div className="space-y-2">
          <Label htmlFor="klinischer_befund">
            Klinischer Befund <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="klinischer_befund"
            rows={5}
            placeholder="z.B. Palpation der LWS: Druckschmerz L4/L5. Lasègue rechts positiv bei 40°. Sensibilitätsstörung lateraler Unterschenkel rechts. Reflexe seitengleich. Kraftgrad M. tibialis anterior rechts Grad 4..."
            {...register("klinischer_befund")}
            aria-describedby="klinischer_befund_error"
          />
          {errors.klinischer_befund && (
            <p id="klinischer_befund_error" className="text-sm text-destructive">
              {errors.klinischer_befund.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Hauptdiagnose ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Hauptdiagnose"
          description="ICD-10-GM Kodierung der Hauptdiagnose"
        />

        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label>ICD-10 Code / Diagnose</Label>
              <Controller
                name="hauptdiagnose.icd10"
                control={control}
                render={({ field }) => (
                  <Icd10Combobox
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    placeholder="Hauptdiagnose suchen..."
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Sicherheitsgrad</Label>
              <Controller
                name="hauptdiagnose.sicherheitsgrad"
                control={control}
                render={({ field }) => (
                  <SicherheitsgradSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          {/* Freitext-Diagnose (optional, wenn kein ICD-Code ausgewählt) */}
          <div className="space-y-2">
            <Label htmlFor="hauptdiagnose_freitext">
              Freitext-Diagnose{" "}
              <span className="text-muted-foreground font-normal text-xs">(wenn kein ICD-Code passend)</span>
            </Label>
            <Input
              id="hauptdiagnose_freitext"
              placeholder="Diagnose in Freitext..."
              {...register("hauptdiagnose.freitextDiagnose")}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hauptdiagnose_notiz">
              Notiz zur Diagnose{" "}
              <span className="text-muted-foreground font-normal text-xs">(Pflicht bei Freitext)</span>
            </Label>
            <Textarea
              id="hauptdiagnose_notiz"
              rows={2}
              placeholder="Begründung, differentialdiagnostische Überlegungen..."
              {...register("hauptdiagnose.freitextNotiz")}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* ── Nebendiagnosen ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Nebendiagnosen"
          description="Weitere relevante Diagnosen (max. 5)"
        />

        {nebendiagnoseFields.length > 0 && (
          <div className="space-y-4">
            {nebendiagnoseFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg bg-muted/10 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Nebendiagnose {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNeben(index)}
                    aria-label={`Nebendiagnose ${index + 1} entfernen`}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label>ICD-10 Code / Diagnose</Label>
                    <Controller
                      name={`nebendiagnosen.${index}.icd10`}
                      control={control}
                      render={({ field: f }) => (
                        <Icd10Combobox
                          value={f.value}
                          onChange={f.onChange}
                          disabled={isSubmitting}
                          placeholder="Nebendiagnose suchen..."
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sicherheitsgrad</Label>
                    <Controller
                      name={`nebendiagnosen.${index}.sicherheitsgrad`}
                      control={control}
                      render={({ field: f }) => (
                        <SicherheitsgradSelect
                          value={f.value}
                          onChange={f.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Freitext-Diagnose</Label>
                  <Input
                    placeholder="Diagnose in Freitext..."
                    {...register(`nebendiagnosen.${index}.freitextDiagnose`)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notiz</Label>
                  <Textarea
                    rows={2}
                    placeholder="Notiz zur Nebendiagnose..."
                    {...register(`nebendiagnosen.${index}.freitextNotiz`)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {nebendiagnoseFields.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendNeben({
                icd10: null,
                sicherheitsgrad: "gesichert",
                freitextDiagnose: "",
                freitextNotiz: "",
              })
            }
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nebendiagnose hinzufügen
          </Button>
        )}
      </div>

      {/* ── Therapieziel ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Therapieziel"
          description="Konkrete, messbare Ziele der Therapie"
        />
        <Textarea
          id="therapieziel"
          rows={3}
          placeholder="z.B. Schmerzreduktion auf NRS ≤ 3, Wiederherstellung voller Schulterbeweglichkeit, Rückkehr zur Arbeit..."
          {...register("therapieziel")}
          disabled={isSubmitting}
        />
      </div>

      {/* ── Prognose ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Prognose"
          description="Erwarteter Therapieverlauf und langfristige Einschätzung"
        />
        <Textarea
          id="prognose"
          rows={3}
          placeholder="z.B. Bei konsequenter Therapie ist eine vollständige Beschwerdefreiheit innerhalb von 8-12 Wochen zu erwarten..."
          {...register("prognose")}
          disabled={isSubmitting}
        />
      </div>

      {/* ── Therapiedauer ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Therapiedauer"
          description="Geplante Gesamtdauer der Therapie in Wochen"
        />
        <div className="flex items-center gap-3">
          <div className="w-36">
            <Controller
              name="therapiedauer_wochen"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  max={520}
                  placeholder="z.B. 8"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === "" ? null : parseInt(v, 10))
                  }}
                  disabled={isSubmitting}
                  aria-label="Therapiedauer in Wochen"
                />
              )}
            />
          </div>
          <span className="text-sm text-muted-foreground">Wochen</span>
        </div>
        {errors.therapiedauer_wochen && (
          <p className="text-sm text-destructive">
            {errors.therapiedauer_wochen.message}
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
          {isSavingDraft ? "Speichern..." : "Als Entwurf speichern"}
        </Button>
        <Button type="button" onClick={onFinish} disabled={isSubmitting}>
          <CheckCircle className="mr-2 h-4 w-4" />
          {isFinishing ? "Abschließen..." : "Abschließen & sperren"}
        </Button>
        <Button asChild variant="ghost" disabled={isSubmitting}>
          <Link href={`/os/patients/${patientId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Abbrechen
          </Link>
        </Button>
      </div>
    </form>
  )
}
