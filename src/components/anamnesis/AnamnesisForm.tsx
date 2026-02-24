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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BodySchema } from "./BodySchema"
import type { PainPoint } from "@/types/anamnesis"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ClipboardList,
  Gauge,
  MapPin,
  HeartPulse,
  Pill,
  Ruler,
  Dumbbell,
  FileSearch,
  FlaskConical,
} from "lucide-react"

// Clinical UI
import { ClinicalSection, NrsSlider, FormActions } from "@/components/clinical-ui"

// New deeper sections
import { FamilienamneseSection } from "./sections/FamilienamneseSection"
import { OperationenTraumataSection } from "./sections/OperationenTraumataSection"
import { SozialamneseSection } from "./sections/SozialamneseSection"
import { BisherigeTherapienSection } from "./sections/BisherigeTherapienSection"
import { KontraindikationenSection } from "./sections/KontraindikationenSection"
import { RedFlagsSection } from "./sections/RedFlagsSection"
import { YellowFlagsSection } from "./sections/YellowFlagsSection"
import { AllgemeinzustandSection } from "./sections/AllgemeinzustandSection"

// ── Kataloge ───────────────────────────────────────────────────────────────

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

// ── Zod Schema ──────────────────────────────────────────────────────────────

const anamnesisFormSchema = z.object({
  hauptbeschwerde: z.string().min(1, "Hauptbeschwerde ist erforderlich.").max(2000),
  schmerzdauer: z.string().max(200).optional().or(z.literal("")),
  schmerzcharakter: z.string().max(500).optional().or(z.literal("")),
  nrs: z.number().min(0).max(10),
  vorerkrankungen: z.array(z.string()),
  vorerkrankungenFreitext: z.string().max(1000).optional().or(z.literal("")),
  keineVorerkrankungen: z.boolean(),
  medikamente: z.string().max(2000).optional().or(z.literal("")),
  bewegungsausmass: z.array(
    z.object({
      id: z.string(),
      gelenk: z.string().min(1, "Gelenk angeben"),
      richtung: z.string().min(1, "Richtung angeben"),
      grad: z.string().min(1, "Grad angeben"),
    })
  ),
  kraftgrad: z.array(
    z.object({
      id: z.string(),
      muskelgruppe: z.string().min(1, "Muskelgruppe angeben"),
      grad: z.string().min(1, "Kraftgrad angeben"),
    })
  ),
  differentialdiagnosen: z.string().max(3000).optional().or(z.literal("")),
  erweiterte_tests: z.string().max(3000).optional().or(z.literal("")),

  // New collapsible section fields (loosely validated, stored in JSONB)
  familienanamnese_keine: z.boolean().optional(),
  familienanamnese_erkrankungen: z.array(z.string()).optional(),
  familienanamnese_freitext: z.string().max(1000).optional().or(z.literal("")),
  operationen_traumata: z
    .array(z.object({ id: z.string(), art: z.string(), beschreibung: z.string(), datum: z.string(), region: z.string() }))
    .optional(),
  sozial_beruf: z.string().max(200).optional().or(z.literal("")),
  sozial_arbeitsbelastung: z.string().optional().or(z.literal("")),
  sozial_arbeitsfaehig: z.boolean().nullable().optional(),
  sozial_au_seit: z.string().max(100).optional().or(z.literal("")),
  sozial_lebenssituation: z.string().optional().or(z.literal("")),
  sozial_freizeitaktivitaeten: z.string().max(500).optional().or(z.literal("")),
  bisherige_therapien: z
    .array(z.object({ id: z.string(), art: z.string(), zeitraum: z.string(), ergebnis: z.string(), details: z.string() }))
    .optional(),
  kontra_vorhanden: z.boolean().optional(),
  kontra_items: z.array(z.string()).optional(),
  kontra_freitext: z.string().max(1000).optional().or(z.literal("")),
  // HP-only flags
  red_flags_screened: z.boolean().optional(),
  red_flags_states: z.record(z.string(), z.boolean()).optional(),
  red_flags_notes: z.record(z.string(), z.string()).optional(),
  yellow_flags_screened: z.boolean().optional(),
  yellow_flags_items: z.array(z.string()).optional(),
  yellow_flags_notizen: z.string().max(2000).optional().or(z.literal("")),
  az_eindruck: z.string().optional().or(z.literal("")),
  az_blutdruck: z.string().max(20).optional().or(z.literal("")),
  az_puls: z.string().max(10).optional().or(z.literal("")),
  az_temperatur: z.string().max(10).optional().or(z.literal("")),
  az_gewicht: z.string().max(10).optional().or(z.literal("")),
  az_groesse: z.string().max(10).optional().or(z.literal("")),
  az_sonstiges: z.string().max(2000).optional().or(z.literal("")),
})

type AnamnesisFormValues = z.infer<typeof anamnesisFormSchema>

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Main Form ───────────────────────────────────────────────────────────────

interface AnamnesisFormProps {
  patientId: string
  isHeilpraktiker: boolean
}

export function AnamnesisForm({ patientId, isHeilpraktiker }: AnamnesisFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])

  const form = useForm<AnamnesisFormValues>({
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
      familienanamnese_keine: false,
      familienanamnese_erkrankungen: [],
      familienanamnese_freitext: "",
      operationen_traumata: [],
      sozial_beruf: "",
      sozial_arbeitsbelastung: "",
      sozial_arbeitsfaehig: null,
      sozial_au_seit: "",
      sozial_lebenssituation: "",
      sozial_freizeitaktivitaeten: "",
      bisherige_therapien: [],
      kontra_vorhanden: false,
      kontra_items: [],
      kontra_freitext: "",
      red_flags_screened: false,
      red_flags_states: {},
      red_flags_notes: {},
      yellow_flags_screened: false,
      yellow_flags_items: [],
      yellow_flags_notizen: "",
      az_eindruck: "",
      az_blutdruck: "",
      az_puls: "",
      az_temperatur: "",
      az_gewicht: "",
      az_groesse: "",
      az_sonstiges: "",
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form

  const { fields: romFields, append: appendRom, remove: removeRom } = useFieldArray({ control, name: "bewegungsausmass" })
  const { fields: kraftFields, append: appendKraft, remove: removeKraft } = useFieldArray({ control, name: "kraftgrad" })

  const watchedVorerkrankungen = watch("vorerkrankungen")
  const watchedKeineVorerkrankungen = watch("keineVorerkrankungen")

  const toggleVorerkrankung = (krankheit: string, checked: boolean) => {
    const current = watchedVorerkrankungen ?? []
    setValue("vorerkrankungen", checked ? [...current, krankheit] : current.filter((k) => k !== krankheit))
  }

  const handleKeineVorerkrankungen = (checked: boolean) => {
    setValue("keineVorerkrankungen", checked)
    if (checked) { setValue("vorerkrankungen", []); setValue("vorerkrankungenFreitext", "") }
  }

  async function submitForm(data: AnamnesisFormValues, status: "entwurf" | "abgeschlossen") {
    setServerError(null)
    const w = parseFloat(data.az_gewicht ?? ""), h = parseFloat(data.az_groesse ?? "")
    const bmi = w && h && h > 0 ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : null

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
        familienanamnese: {
          relevante_erkrankungen: data.familienanamnese_erkrankungen ?? [],
          freitext: data.familienanamnese_freitext?.trim() ?? "",
          keine_relevanten: data.familienanamnese_keine ?? false,
        },
        operationen_traumata: data.operationen_traumata ?? [],
        sozialanamnese: {
          beruf: data.sozial_beruf?.trim() ?? "",
          arbeitsbelastung: data.sozial_arbeitsbelastung ?? "",
          arbeitsfaehig: data.sozial_arbeitsfaehig ?? null,
          arbeitsunfaehig_seit: data.sozial_au_seit?.trim() ?? "",
          lebenssituation: data.sozial_lebenssituation ?? "",
          freizeitaktivitaeten: data.sozial_freizeitaktivitaeten?.trim() ?? "",
        },
        bisherige_therapien: data.bisherige_therapien ?? [],
        kontraindikationen: {
          vorhanden: data.kontra_vorhanden ?? false,
          items: data.kontra_items ?? [],
          freitext: data.kontra_freitext?.trim() ?? "",
        },
        ...(isHeilpraktiker ? {
          red_flags: {
            checked: data.red_flags_screened ?? false,
            items: Object.entries(data.red_flags_states ?? {}).filter(([, v]) => v).map(([flag]) => ({
              flag, present: true, notiz: (data.red_flags_notes ?? {})[flag] ?? "",
            })),
          },
          yellow_flags: {
            screened: data.yellow_flags_screened ?? false,
            flags: data.yellow_flags_items ?? [],
            notizen: data.yellow_flags_notizen?.trim() ?? "",
          },
          allgemeinzustand: {
            az_eindruck: data.az_eindruck ?? "",
            blutdruck: data.az_blutdruck?.trim() ?? "",
            puls: data.az_puls?.trim() ?? "",
            temperatur: data.az_temperatur?.trim() ?? "",
            gewicht: data.az_gewicht?.trim() ?? "",
            groesse: data.az_groesse?.trim() ?? "",
            bmi_berechnet: bmi,
            sonstiges: data.az_sonstiges?.trim() ?? "",
          },
        } : {}),
      },
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/anamnesis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setServerError(json.error ?? "Speichern fehlgeschlagen."); return false }
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
      if (result) { toast.success("Entwurf gespeichert."); router.push(`/os/patients/${patientId}/anamnesis/${result}`) }
    } finally { setIsSavingDraft(false) }
  })

  const onFinish = handleSubmit(async (data) => {
    setIsFinishing(true)
    try {
      const result = await submitForm(data, "abgeschlossen")
      if (result) { toast.success("Anamnesebogen abgeschlossen."); router.push(`/os/patients/${patientId}/anamnesis/${result}`) }
    } finally { setIsFinishing(false) }
  })

  const isSubmitting = isSavingDraft || isFinishing

  return (
    <form className="space-y-6" noValidate>
      {serverError && (<Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>)}

      {/* ── Hauptbeschwerde ── */}
      <ClinicalSection title="Hauptbeschwerde" description="Was führt den Patienten heute in die Praxis?" icon={ClipboardList}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hauptbeschwerde">Hauptbeschwerde <span className="text-red-500">*</span></Label>
            <Textarea id="hauptbeschwerde" rows={3} placeholder="z.B. Schmerzen in der rechten Schulter seit 3 Wochen, verstärkt bei Abduktion..." {...register("hauptbeschwerde")} />
            {errors.hauptbeschwerde && (<p className="text-sm text-red-500">{errors.hauptbeschwerde.message}</p>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schmerzdauer">Schmerzdauer</Label>
              <Input id="schmerzdauer" placeholder="z.B. seit 3 Wochen" {...register("schmerzdauer")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schmerzcharakter">Schmerzcharakter</Label>
              <Input id="schmerzcharakter" placeholder="z.B. brennend, stechend, dumpf" {...register("schmerzcharakter")} />
            </div>
          </div>
        </div>
      </ClinicalSection>

      {/* ── NRS ── */}
      <ClinicalSection title="Schmerzintensität (NRS)" description="0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz" icon={Gauge}>
        <Controller name="nrs" control={control} render={({ field }) => <NrsSlider value={field.value} onChange={field.onChange} />} />
      </ClinicalSection>

      {/* ── Schmerzlokalisation ── */}
      <ClinicalSection title="Schmerzlokalisation" description="Klicke auf das Körperbild, um Schmerzpunkte zu markieren." icon={MapPin} accent="red">
        <BodySchema value={painPoints} onChange={setPainPoints} />
      </ClinicalSection>

      {/* ── Vorerkrankungen ── */}
      <ClinicalSection title="Vorerkrankungen" description="Relevante Vorerkrankungen des Patienten" icon={HeartPulse}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="keine-vorerkrankungen" checked={watchedKeineVorerkrankungen} onCheckedChange={(c) => handleKeineVorerkrankungen(c === true)} />
            <Label htmlFor="keine-vorerkrankungen" className="cursor-pointer font-medium">Keine bekannten Vorerkrankungen</Label>
          </div>
          {!watchedKeineVorerkrankungen && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VORERKRANKUNGEN_KATALOG.map((krankheit) => (
                  <div key={krankheit} className="flex items-center gap-2">
                    <Checkbox id={`vk-${krankheit}`} checked={(watchedVorerkrankungen ?? []).includes(krankheit)} onCheckedChange={(c) => toggleVorerkrankung(krankheit, c === true)} />
                    <Label htmlFor={`vk-${krankheit}`} className="cursor-pointer text-sm font-normal">{krankheit}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vorerkrankungen-freitext">Weitere (Freitext)</Label>
                <Textarea id="vorerkrankungen-freitext" rows={2} placeholder="Weitere nicht aufgeführte Vorerkrankungen..." {...register("vorerkrankungenFreitext")} />
              </div>
            </>
          )}
        </div>
      </ClinicalSection>

      {/* ── NEW: Familienanamnese ── */}
      <FamilienamneseSection form={form} />

      {/* ── NEW: Operationen & Traumata ── */}
      <OperationenTraumataSection form={form} />

      {/* ── Medikamente ── */}
      <ClinicalSection title="Aktuelle Medikamente" description="Alle aktuell eingenommenen Medikamente inkl. Dosierung" icon={Pill}>
        <Textarea id="medikamente" rows={3} placeholder="z.B. Ibuprofen 400mg bei Bedarf, Metformin 500mg 2x täglich..." {...register("medikamente")} />
      </ClinicalSection>

      {/* ── NEW: Sozial- & Berufsanamnese ── */}
      <SozialamneseSection form={form} />

      {/* ── NEW: Bisherige Therapien ── */}
      <BisherigeTherapienSection form={form} />

      {/* ── NEW: Kontraindikationen ── */}
      <KontraindikationenSection form={form} />

      {/* ── Bewegungsausmaß ── */}
      <ClinicalSection title="Bewegungsausmaß" description="Gemessene Bewegungsumfänge nach der Neutral-Null-Methode" icon={Ruler}>
        <div className="space-y-4">
          {romFields.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-slate-500 px-1">
                <span>Gelenk</span><span>Bewegungsrichtung</span><span>Grad (°)</span><span />
              </div>
              {romFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start">
                  <Controller name={`bewegungsausmass.${index}.gelenk`} control={control} render={({ field: f }) => (
                    <Select onValueChange={f.onChange} value={f.value}><SelectTrigger><SelectValue placeholder="Gelenk..." /></SelectTrigger>
                    <SelectContent>{GELENK_OPTIONS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent></Select>
                  )} />
                  <Controller name={`bewegungsausmass.${index}.richtung`} control={control} render={({ field: f }) => (
                    <Select onValueChange={f.onChange} value={f.value}><SelectTrigger><SelectValue placeholder="Richtung..." /></SelectTrigger>
                    <SelectContent>{RICHTUNG_OPTIONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select>
                  )} />
                  <Input placeholder="z.B. 120" {...register(`bewegungsausmass.${index}.grad`)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRom(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => appendRom({ id: generateId(), gelenk: "", richtung: "", grad: "" })} className="border-slate-200/60">
            <Plus className="mr-2 h-4 w-4" />Messung hinzufügen
          </Button>
        </div>
      </ClinicalSection>

      {/* ── Kraftgrad nach Janda ── */}
      <ClinicalSection title="Kraftgrad nach Janda" description="Manuelle Muskelfunktionsdiagnostik: Grad 0–5" icon={Dumbbell}>
        <div className="space-y-4">
          {kraftFields.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-slate-500 px-1">
                <span>Muskelgruppe</span><span>Kraftgrad (0–5)</span><span />
              </div>
              {kraftFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                  <Controller name={`kraftgrad.${index}.muskelgruppe`} control={control} render={({ field: f }) => (
                    <Select onValueChange={f.onChange} value={f.value}><SelectTrigger><SelectValue placeholder="Muskelgruppe..." /></SelectTrigger>
                    <SelectContent>{MUSKELGRUPPEN_OPTIONS.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
                  )} />
                  <Controller name={`kraftgrad.${index}.grad`} control={control} render={({ field: f }) => (
                    <Select onValueChange={f.onChange} value={f.value}><SelectTrigger><SelectValue placeholder="Grad..." /></SelectTrigger>
                    <SelectContent>{["0","1","2","3","4","5"].map((g) => (<SelectItem key={g} value={g}>Grad {g}</SelectItem>))}</SelectContent></Select>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeKraft(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => appendKraft({ id: generateId(), muskelgruppe: "", grad: "" })} className="border-slate-200/60">
            <Plus className="mr-2 h-4 w-4" />Muskelgruppe hinzufügen
          </Button>
        </div>
      </ClinicalSection>

      {/* ── Heilpraktiker-only ── */}
      {isHeilpraktiker && (
        <>
          <RedFlagsSection form={form} />
          <YellowFlagsSection form={form} />
          <AllgemeinzustandSection form={form} />

          <ClinicalSection title="Differentialdiagnosen" description="Nur sichtbar für Heilpraktiker" icon={FileSearch} accent="purple">
            <Textarea id="differentialdiagnosen" rows={4} placeholder="Mögliche Differentialdiagnosen..." {...register("differentialdiagnosen")} />
          </ClinicalSection>

          <ClinicalSection title="Erweiterte orthopädische Tests" description="Nur sichtbar für Heilpraktiker" icon={FlaskConical} accent="purple">
            <Textarea id="erweiterte-tests" rows={4} placeholder="Durchgeführte Tests, Ergebnisse, Interpretation..." {...register("erweiterte_tests")} />
          </ClinicalSection>
        </>
      )}

      {/* ── Actions ── */}
      <FormActions backHref={`/os/patients/${patientId}`} saving={isSubmitting} onSaveDraft={onSaveDraft} onFinalize={onFinish} />
    </form>
  )
}
