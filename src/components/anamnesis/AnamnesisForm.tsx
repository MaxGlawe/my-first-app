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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BodySchema } from "./BodySchema"
import type { PainPoint, RangeOfMotionEntry, StrengthEntry } from "@/types/anamnesis"
import { toast } from "sonner"
import { Plus, Trash2, Save, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// ── Vorerkrankungen Katalog ──────────────────────────────────────────────────

const VORERKRANKUNGEN_KATALOG = [
  "Diabetes mellitus",
  "Arterielle Hypertonie",
  "Herzerkrankung (KHK, Herzinsuffizienz)",
  "Schlaganfall / TIA",
  "COPD / Asthma",
  "Osteoporose",
  "Rheumatoide Arthritis",
  "Gonarthrose / Coxarthrose",
  "Bandscheibenvorfall",
  "Wirbelsäulenstenose",
  "Schilddrüsenerkrankung",
  "Krebserkrankung (aktuell/früher)",
  "Depression / Angsterkrankung",
  "Migräne",
  "Epilepsie",
  "Nierenerkrankung",
  "Lebererkrankung",
  "Autoimmunerkrankung",
  "Schwangerschaft",
]

const GELENK_OPTIONS = [
  "Halswirbelsäule (HWS)",
  "Brustwirbelsäule (BWS)",
  "Lendenwirbelsäule (LWS)",
  "Schulter rechts",
  "Schulter links",
  "Ellenbogen rechts",
  "Ellenbogen links",
  "Handgelenk rechts",
  "Handgelenk links",
  "Hüfte rechts",
  "Hüfte links",
  "Knie rechts",
  "Knie links",
  "Sprunggelenk rechts",
  "Sprunggelenk links",
]

const RICHTUNG_OPTIONS = [
  "Flexion",
  "Extension",
  "Abduktion",
  "Adduktion",
  "Innenrotation",
  "Außenrotation",
  "Lateralflexion rechts",
  "Lateralflexion links",
  "Rotation rechts",
  "Rotation links",
]

const MUSKELGRUPPEN_OPTIONS = [
  "M. deltoideus",
  "M. biceps brachii",
  "M. triceps brachii",
  "M. quadriceps femoris",
  "M. biceps femoris",
  "M. gastrocnemius",
  "M. tibialis anterior",
  "M. gluteus maximus",
  "M. gluteus medius",
  "Rückenstrecker (paravertebral)",
  "Bauchmuskeln",
  "M. trapezius",
  "Rotatorenmanschette",
]

// ── Zod Schema ───────────────────────────────────────────────────────────────

const rangeOfMotionEntrySchema = z.object({
  id: z.string(),
  gelenk: z.string().min(1, "Gelenk angeben"),
  richtung: z.string().min(1, "Richtung angeben"),
  grad: z.string().min(1, "Grad angeben"),
})

const strengthEntrySchema = z.object({
  id: z.string(),
  muskelgruppe: z.string().min(1, "Muskelgruppe angeben"),
  grad: z.string().min(1, "Kraftgrad angeben"),
})

const anamnesisFormSchema = z.object({
  // Hauptbeschwerde
  hauptbeschwerde: z.string().min(1, "Hauptbeschwerde ist erforderlich.").max(2000),
  schmerzdauer: z.string().max(200).optional().or(z.literal("")),
  schmerzcharakter: z.string().max(500).optional().or(z.literal("")),

  // NRS
  nrs: z.number().min(0).max(10),

  // Schmerzlokalisation (handled separately via state)

  // Vorerkrankungen
  vorerkrankungen: z.array(z.string()),
  vorerkrankungenFreitext: z.string().max(1000).optional().or(z.literal("")),
  keineVorerkrankungen: z.boolean(),

  // Medikamente
  medikamente: z.string().max(2000).optional().or(z.literal("")),

  // Bewegungsausmaß
  bewegungsausmass: z.array(rangeOfMotionEntrySchema),

  // Kraftgrad
  kraftgrad: z.array(strengthEntrySchema),

  // HP-Felder
  differentialdiagnosen: z.string().max(3000).optional().or(z.literal("")),
  erweiterte_tests: z.string().max(3000).optional().or(z.literal("")),
})

type AnamnesisFormValues = z.infer<typeof anamnesisFormSchema>

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
}: {
  value: number
  onChange: (v: number) => void
}) {
  const color =
    value <= 3
      ? "text-green-600"
      : value <= 6
      ? "text-amber-600"
      : "text-red-600"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-8">0</span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 cursor-pointer accent-primary"
          aria-label="Schmerzintensität NRS 0 bis 10"
        />
        <span className="text-sm text-muted-foreground w-8 text-right">10</span>
      </div>
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={`text-lg font-bold px-4 py-1 ${color}`}
        >
          {value} / 10
        </Badge>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Kein Schmerz</span>
        <span>Stärkster vorstellbarer Schmerz</span>
      </div>
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────────

interface AnamnesisFormProps {
  patientId: string
  isHeilpraktiker: boolean
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function AnamnesisForm({ patientId, isHeilpraktiker }: AnamnesisFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnamnesisFormValues>({
    resolver: zodResolver(anamnesisFormSchema),
    defaultValues: {
      hauptbeschwerde: "",
      schmerzdauer: "",
      schmerzcharakter: "",
      nrs: 0,
      vorerkrankungen: [],
      vorerkrankungenFreitext: "",
      keineVorerkrankungen: false,
      medikamente: "",
      bewegungsausmass: [],
      kraftgrad: [],
      differentialdiagnosen: "",
      erweiterte_tests: "",
    },
  })

  const { fields: romFields, append: appendRom, remove: removeRom } = useFieldArray({
    control,
    name: "bewegungsausmass",
  })

  const { fields: kraftFields, append: appendKraft, remove: removeKraft } = useFieldArray({
    control,
    name: "kraftgrad",
  })

  const watchedVorerkrankungen = watch("vorerkrankungen")
  const watchedKeineVorerkrankungen = watch("keineVorerkrankungen")
  const watchedNrs = watch("nrs")

  const toggleVorerkrankung = (krankheit: string, checked: boolean) => {
    const current = watchedVorerkrankungen ?? []
    if (checked) {
      setValue("vorerkrankungen", [...current, krankheit])
    } else {
      setValue("vorerkrankungen", current.filter((k) => k !== krankheit))
    }
  }

  const handleKeineVorerkrankungen = (checked: boolean) => {
    setValue("keineVorerkrankungen", checked)
    if (checked) {
      setValue("vorerkrankungen", [])
      setValue("vorerkrankungenFreitext", "")
    }
  }

  async function submitForm(data: AnamnesisFormValues, status: "entwurf" | "abgeschlossen") {
    setServerError(null)

    const payload = {
      status,
      data: {
        hauptbeschwerde: data.hauptbeschwerde.trim(),
        schmerzdauer: data.schmerzdauer?.trim() ?? "",
        schmerzcharakter: data.schmerzcharakter?.trim() ?? "",
        nrs: data.nrs,
        schmerzlokalisation: painPoints,
        vorerkrankungen: data.vorerkrankungen,
        vorerkrankungenFreitext: data.vorerkrankungenFreitext?.trim() ?? "",
        keineVorerkrankungen: data.keineVorerkrankungen,
        medikamente: data.medikamente?.trim() ?? "",
        bewegungsausmass: data.bewegungsausmass,
        kraftgrad: data.kraftgrad,
        differentialdiagnosen: isHeilpraktiker ? (data.differentialdiagnosen?.trim() ?? "") : "",
        erweiterte_tests: isHeilpraktiker ? (data.erweiterte_tests?.trim() ?? "") : "",
      },
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/anamnesis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Speichern fehlgeschlagen. Bitte versuche es erneut.")
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
        toast.success("Entwurf gespeichert.")
        router.push(`/os/patients/${patientId}/anamnesis/${result}`)
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
        toast.success("Anamnesebogen abgeschlossen und gesperrt.")
        router.push(`/os/patients/${patientId}/anamnesis/${result}`)
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

      {/* ── Hauptbeschwerde ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Hauptbeschwerde"
          description="Was führt den Patienten heute in die Praxis?"
        />
        <div className="space-y-2">
          <Label htmlFor="hauptbeschwerde">
            Hauptbeschwerde <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="hauptbeschwerde"
            rows={3}
            placeholder="z.B. Schmerzen in der rechten Schulter seit 3 Wochen, verstärkt bei Abduktion..."
            {...register("hauptbeschwerde")}
          />
          {errors.hauptbeschwerde && (
            <p className="text-sm text-destructive">{errors.hauptbeschwerde.message}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schmerzdauer">Schmerzdauer</Label>
            <Input
              id="schmerzdauer"
              placeholder="z.B. seit 3 Wochen, seit 2 Jahren..."
              {...register("schmerzdauer")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schmerzcharakter">Schmerzcharakter</Label>
            <Input
              id="schmerzcharakter"
              placeholder="z.B. brennend, stechend, dumpf, ziehend..."
              {...register("schmerzcharakter")}
            />
          </div>
        </div>
      </div>

      {/* ── Schmerzintensität NRS ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Schmerzintensität (NRS)"
          description="Numeric Rating Scale: 0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz"
        />
        <Controller
          name="nrs"
          control={control}
          render={({ field }) => (
            <NrsSlider value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {/* ── Schmerzlokalisation ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Schmerzlokalisation"
          description="Klicke auf das Körperbild, um Schmerzpunkte zu markieren."
        />
        <BodySchema value={painPoints} onChange={setPainPoints} />
      </div>

      {/* ── Vorerkrankungen ── */}
      <div className="space-y-4">
        <SectionHeader title="Vorerkrankungen" />

        <div className="flex items-center gap-2">
          <Checkbox
            id="keine-vorerkrankungen"
            checked={watchedKeineVorerkrankungen}
            onCheckedChange={(checked) => handleKeineVorerkrankungen(checked === true)}
          />
          <Label htmlFor="keine-vorerkrankungen" className="cursor-pointer font-medium">
            Keine bekannten Vorerkrankungen
          </Label>
        </div>

        {!watchedKeineVorerkrankungen && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VORERKRANKUNGEN_KATALOG.map((krankheit) => (
                <div key={krankheit} className="flex items-center gap-2">
                  <Checkbox
                    id={`vk-${krankheit}`}
                    checked={(watchedVorerkrankungen ?? []).includes(krankheit)}
                    onCheckedChange={(checked) =>
                      toggleVorerkrankung(krankheit, checked === true)
                    }
                  />
                  <Label htmlFor={`vk-${krankheit}`} className="cursor-pointer text-sm font-normal">
                    {krankheit}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vorerkrankungen-freitext">
                Weitere Vorerkrankungen (Freitext)
              </Label>
              <Textarea
                id="vorerkrankungen-freitext"
                rows={2}
                placeholder="Weitere nicht aufgeführte Vorerkrankungen..."
                {...register("vorerkrankungenFreitext")}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Medikamente ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Aktuelle Medikamente"
          description="Alle aktuell eingenommenen Medikamente inkl. Dosierung"
        />
        <Textarea
          id="medikamente"
          rows={3}
          placeholder="z.B. Ibuprofen 400mg bei Bedarf, Metformin 500mg 2x täglich..."
          {...register("medikamente")}
        />
      </div>

      {/* ── Bewegungsausmaß ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Bewegungsausmaß"
          description="Gemessene Bewegungsumfänge nach der Neutral-Null-Methode"
        />

        {romFields.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Gelenk</span>
              <span>Bewegungsrichtung</span>
              <span>Grad (°)</span>
              <span />
            </div>
            {romFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start">
                <div>
                  <Controller
                    name={`bewegungsausmass.${index}.gelenk`}
                    control={control}
                    render={({ field: f }) => (
                      <Select onValueChange={f.onChange} value={f.value}>
                        <SelectTrigger aria-label="Gelenk">
                          <SelectValue placeholder="Gelenk..." />
                        </SelectTrigger>
                        <SelectContent>
                          {GELENK_OPTIONS.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.bewegungsausmass?.[index]?.gelenk && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.bewegungsausmass[index].gelenk?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Controller
                    name={`bewegungsausmass.${index}.richtung`}
                    control={control}
                    render={({ field: f }) => (
                      <Select onValueChange={f.onChange} value={f.value}>
                        <SelectTrigger aria-label="Bewegungsrichtung">
                          <SelectValue placeholder="Richtung..." />
                        </SelectTrigger>
                        <SelectContent>
                          {RICHTUNG_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.bewegungsausmass?.[index]?.richtung && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.bewegungsausmass[index].richtung?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="z.B. 120"
                    {...register(`bewegungsausmass.${index}.grad`)}
                    aria-label="Grad in Grad"
                  />
                  {errors.bewegungsausmass?.[index]?.grad && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.bewegungsausmass[index].grad?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRom(index)}
                  aria-label="Zeile entfernen"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendRom({ id: generateId(), gelenk: "", richtung: "", grad: "" })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Messung hinzufügen
        </Button>
      </div>

      {/* ── Kraftgrad nach Janda ── */}
      <div className="space-y-4">
        <SectionHeader
          title="Kraftgrad nach Janda"
          description="Manuelle Muskelfunktionsdiagnostik: Grad 0 = keine Aktivität, Grad 5 = normal"
        />

        {kraftFields.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Muskelgruppe</span>
              <span>Kraftgrad (0–5)</span>
              <span />
            </div>
            {kraftFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                <div>
                  <Controller
                    name={`kraftgrad.${index}.muskelgruppe`}
                    control={control}
                    render={({ field: f }) => (
                      <Select onValueChange={f.onChange} value={f.value}>
                        <SelectTrigger aria-label="Muskelgruppe">
                          <SelectValue placeholder="Muskelgruppe..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MUSKELGRUPPEN_OPTIONS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.kraftgrad?.[index]?.muskelgruppe && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.kraftgrad[index].muskelgruppe?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Controller
                    name={`kraftgrad.${index}.grad`}
                    control={control}
                    render={({ field: f }) => (
                      <Select onValueChange={f.onChange} value={f.value}>
                        <SelectTrigger aria-label="Kraftgrad">
                          <SelectValue placeholder="Grad..." />
                        </SelectTrigger>
                        <SelectContent>
                          {["0", "1", "2", "3", "4", "5"].map((g) => (
                            <SelectItem key={g} value={g}>
                              Grad {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.kraftgrad?.[index]?.grad && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.kraftgrad[index].grad?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeKraft(index)}
                  aria-label="Zeile entfernen"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendKraft({ id: generateId(), muskelgruppe: "", grad: "" })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Muskelgruppe hinzufügen
        </Button>
      </div>

      {/* ── Heilpraktiker-Felder ── */}
      {isHeilpraktiker && (
        <>
          <div className="space-y-4">
            <SectionHeader
              title="Differentialdiagnosen"
              description="Nur sichtbar für Heilpraktiker"
            />
            <Textarea
              id="differentialdiagnosen"
              rows={4}
              placeholder="Mögliche Differentialdiagnosen und klinische Überlegungen..."
              {...register("differentialdiagnosen")}
            />
          </div>

          <div className="space-y-4">
            <SectionHeader
              title="Erweiterte orthopädische Tests"
              description="Nur sichtbar für Heilpraktiker"
            />
            <Textarea
              id="erweiterte-tests"
              rows={4}
              placeholder="Durchgeführte Tests, Ergebnisse, Interpretation..."
              {...register("erweiterte_tests")}
            />
          </div>
        </>
      )}

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
        <Button
          type="button"
          onClick={onFinish}
          disabled={isSubmitting}
        >
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
