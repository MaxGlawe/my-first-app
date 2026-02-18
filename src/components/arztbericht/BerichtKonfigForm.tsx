"use client"

// PROJ-6: KI-Arztbericht-Generator — Konfigurationsformular
// Rollenadaptiv: Zeigt je nach Rolle unterschiedliche Felder.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUserRole } from "@/hooks/use-user-role"
import { useDataAvailability } from "@/hooks/use-reports"
import {
  Loader2,
  Sparkles,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  MapPin,
  MessageSquare,
  Activity,
  FileSearch,
  Stethoscope,
} from "lucide-react"

// ── Zod Schema ─────────────────────────────────────────────────────────────────

const formSchema = z.object({
  date_from: z
    .string()
    .min(1, "Bitte Startdatum wählen.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum im Format YYYY-MM-DD."),
  date_to: z
    .string()
    .min(1, "Bitte Enddatum wählen.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum im Format YYYY-MM-DD."),
  recipient_name: z.string().min(1, "Empfänger-Name ist erforderlich.").max(500),
  recipient_address: z.string().max(1000),
  extra_instructions: z.string().max(2000),
  admin_report_type: z.enum(["arztbericht", "therapiebericht"]).optional(),
})

type FormValues = z.infer<typeof formSchema>

// ── Props ──────────────────────────────────────────────────────────────────────

interface BerichtKonfigFormProps {
  patientId: string
}

// ── Datenverfügbarkeits-Zusammenfassung ────────────────────────────────────────

function DataAvailabilitySummary({
  patientId,
  dateFrom,
  dateTo,
  isHeilpraktiker,
}: {
  patientId: string
  dateFrom: string
  dateTo: string
  isHeilpraktiker: boolean
}) {
  const { data, isLoading } = useDataAvailability(patientId, dateFrom, dateTo)

  if (!dateFrom || !dateTo || !data) return null

  const hasEnoughData =
    isHeilpraktiker
      ? data.treatmentCount > 0 || data.befundCount > 0
      : data.treatmentCount > 0

  return (
    <div className={`p-3 rounded-lg border text-sm ${hasEnoughData ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
      <p className={`font-medium mb-2 ${hasEnoughData ? "text-green-800" : "text-amber-800"}`}>
        {isLoading ? "Daten werden geprüft…" : (hasEnoughData ? "Daten im Zeitraum vorhanden" : "Wenig Daten im Zeitraum")}
      </p>
      {!isLoading && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            <span>{data.treatmentCount} Behandlung{data.treatmentCount !== 1 ? "en" : ""}</span>
          </div>
          {isHeilpraktiker && (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileSearch className="h-3.5 w-3.5 text-purple-500" />
                <span>{data.befundCount} Befundbericht{data.befundCount !== 1 ? "e" : ""}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="h-3.5 w-3.5 text-indigo-500" />
                <span>{data.anamnesisCount} Anamnese{data.anamnesisCount !== 1 ? "n" : ""}</span>
              </div>
            </>
          )}
          {!hasEnoughData && (
            <div className="text-amber-700 text-xs mt-2 space-y-0.5">
              <p className="font-medium">Fehlende Daten im Zeitraum:</p>
              {data.treatmentCount === 0 && (
                <p>– Keine Behandlungen dokumentiert → Behandlungsverlauf fehlt</p>
              )}
              {isHeilpraktiker && data.befundCount === 0 && (
                <p>– Keine Befundberichte vorhanden → Diagnoseabschnitt fehlt</p>
              )}
              {isHeilpraktiker && data.anamnesisCount === 0 && (
                <p>– Keine Anamnesedaten vorhanden → Anamneseabschnitt fehlt</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── BerichtKonfigForm ──────────────────────────────────────────────────────────

export function BerichtKonfigForm({ patientId }: BerichtKonfigFormProps) {
  const router = useRouter()
  const { role, isLoading: roleLoading, isHeilpraktiker, isAdmin } = useUserRole()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState("")
  const [error, setError] = useState<string | null>(null)

  const reportLabel =
    isHeilpraktiker || isAdmin ? "Arztbericht" : "Therapiebericht"

  // Default: letzte 3 Monate
  const today = new Date()
  const threeMonthsAgo = new Date(today)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const defaultDateFrom = threeMonthsAgo.toISOString().split("T")[0]
  const defaultDateTo = today.toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_from: defaultDateFrom,
      date_to: defaultDateTo,
      recipient_name: "",
      recipient_address: "",
      extra_instructions: "",
      admin_report_type: "arztbericht",
    },
  })

  const dateFrom = watch("date_from")
  const dateTo = watch("date_to")
  const adminReportType = watch("admin_report_type") ?? "arztbericht"

  const generationSteps = [
    "Patientendaten werden geladen…",
    "Behandlungsverlauf wird analysiert…",
    isHeilpraktiker || isAdmin
      ? "Befunde und Diagnosen werden einbezogen…"
      : "Maßnahmen und NRS-Verlauf werden aufbereitet…",
    "KI-Bericht wird generiert…",
    "Bericht wird gespeichert…",
  ]

  const onSubmit = async (values: FormValues) => {
    // Manual date range validation (since we removed .refine())
    if (new Date(values.date_from) > new Date(values.date_to)) {
      setError("Startdatum muss vor oder gleich dem Enddatum liegen.")
      return
    }
    setIsGenerating(true)
    setError(null)

    // Simuliere Fortschritts-Steps
    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < generationSteps.length - 1) {
        setGenerationStep(generationSteps[stepIndex])
        stepIndex++
      }
    }, 3000)

    setGenerationStep(generationSteps[0])

    try {
      const res = await fetch(`/api/patients/${patientId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_from: values.date_from,
          date_to: values.date_to,
          recipient_name: values.recipient_name,
          recipient_address: values.recipient_address || "",
          extra_instructions: values.extra_instructions || "",
          ...(isAdmin ? { admin_report_type: values.admin_report_type } : {}),
        }),
      })

      clearInterval(stepInterval)

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Bericht konnte nicht generiert werden.")
        setIsGenerating(false)
        setGenerationStep("")
        return
      }

      setGenerationStep("Weiterleitung zum Editor…")
      router.push(`/os/patients/${patientId}/arztbericht/${data.report.id}`)
    } catch {
      clearInterval(stepInterval)
      setError("Ein Netzwerkfehler ist aufgetreten. Bitte erneut versuchen.")
      setIsGenerating(false)
      setGenerationStep("")
    }
  }

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Berichtstyp-Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-teal-100 p-2">
              <FileText className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                {reportLabel} generieren
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isHeilpraktiker || isAdmin
                  ? "KI erstellt einen vollständigen medizinischen Arztbrief mit Anamnese, Befund, ICD-10-Diagnosen und Behandlungsverlauf."
                  : "KI erstellt einen Therapieverlaufsbericht mit Maßnahmen, NRS-Entwicklung und Weiterbehandlungsempfehlung (ohne Diagnoseabschnitt)."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin: Berichtstyp-Auswahl */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Berichtstyp wählen (Admin)
            </CardTitle>
            <CardDescription className="text-xs">
              Als Admin können Sie beide Berichtstypen erstellen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={adminReportType}
              onValueChange={(val) =>
                setValue("admin_report_type", val as "arztbericht" | "therapiebericht")
              }
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="arztbericht" id="type-arzt" />
                <Label htmlFor="type-arzt" className="text-sm cursor-pointer">
                  Arztbericht <span className="text-xs text-muted-foreground">(Heilpraktiker)</span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="therapiebericht" id="type-therapie" />
                <Label htmlFor="type-therapie" className="text-sm cursor-pointer">
                  Therapiebericht <span className="text-xs text-muted-foreground">(Physiotherapeut)</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Zeitraum */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Berichtszeitraum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date_from" className="text-xs font-medium">
                Von
              </Label>
              <Input
                id="date_from"
                type="date"
                {...register("date_from")}
                className="text-sm"
              />
              {errors.date_from && (
                <p className="text-xs text-destructive">{errors.date_from.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_to" className="text-xs font-medium">
                Bis
              </Label>
              <Input
                id="date_to"
                type="date"
                {...register("date_to")}
                className="text-sm"
              />
              {errors.date_to && (
                <p className="text-xs text-destructive">{errors.date_to.message}</p>
              )}
            </div>
          </div>

          {/* Datenverfügbarkeits-Zusammenfassung */}
          {dateFrom && dateTo && (
            <DataAvailabilitySummary
              patientId={patientId}
              dateFrom={dateFrom}
              dateTo={dateTo}
              isHeilpraktiker={isHeilpraktiker || isAdmin}
            />
          )}
        </CardContent>
      </Card>

      {/* Empfänger */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Empfänger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="recipient_name" className="text-xs font-medium">
              Name (Arzt / Klinik) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recipient_name"
              placeholder="z.B. Dr. med. Max Mustermann"
              {...register("recipient_name")}
              className="text-sm"
            />
            {errors.recipient_name && (
              <p className="text-xs text-destructive">{errors.recipient_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recipient_address" className="text-xs font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Adresse (optional)
            </Label>
            <Textarea
              id="recipient_address"
              placeholder="Praxisadresse oder Klinikabteilung"
              rows={2}
              {...register("recipient_address")}
              className="text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rollenspezifische Hinweise an die KI */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            {isHeilpraktiker || isAdmin
              ? "Heilmittelempfehlung (optional)"
              : "Gewünschte Heilmittel / Hinweise (optional)"}
          </CardTitle>
          <CardDescription className="text-xs">
            {isHeilpraktiker || isAdmin
              ? "Optionaler Freitext für die KI — z.B. gewünschte Empfehlungen oder besondere Schwerpunkte des Berichts."
              : "Hinweis an die KI — z.B. gewünschte Heilmittel für die Weiterverordnung (KG, MT, etc.) oder spezifische Behandlungsziele."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="extra_instructions"
            placeholder={
              isHeilpraktiker || isAdmin
                ? "z.B. Bitte eine Empfehlung für Fortsetzung der MT herausarbeiten…"
                : "z.B. Bitte 10 Einheiten KG + 6 Einheiten MT für die nächste Verordnungsphase empfehlen…"
            }
            rows={3}
            {...register("extra_instructions")}
            className="text-sm resize-none"
          />
          {errors.extra_instructions && (
            <p className="text-xs text-destructive mt-1">
              {errors.extra_instructions.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fehleranzeige */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KI-Fortschrittsanzeige */}
      {isGenerating && (
        <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-lg border bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <div className="text-center">
            <p className="text-sm font-medium">KI generiert {reportLabel}…</p>
            <p className="text-xs text-muted-foreground mt-1">{generationStep}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Dies kann bis zu 60 Sekunden dauern.
            </p>
          </div>
        </div>
      )}

      {/* Datenschutz-Hinweis */}
      {!isGenerating && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-500" />
          <span>
            Datenschutz: Patientendaten werden vor der KI-Übertragung pseudonymisiert.
            Die Claude API nutzt keine API-Anfragen für Modelltraining.
          </span>
        </div>
      )}

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird generiert…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {reportLabel} mit KI generieren
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
