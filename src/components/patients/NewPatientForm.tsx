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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { KrankenkasseCombobox } from "./KrankenkasseCombobox"
import { AlertTriangle, Mail, Gift, BadgeCheck, XCircle, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

const patientSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich.").max(100),
  nachname: z.string().min(1, "Nachname ist erforderlich.").max(100),
  geburtsdatum: z.string().min(1, "Geburtsdatum ist erforderlich."),
  geschlecht: z.enum(["maennlich", "weiblich", "divers", "unbekannt"], {
    error: "Bitte Geschlecht auswählen.",
  }),
  telefon: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Keine gültige E-Mail-Adresse.").optional().or(z.literal("")),
  strasse: z.string().max(200).optional().or(z.literal("")),
  plz: z.string().max(10).optional().or(z.literal("")),
  ort: z.string().max(100).optional().or(z.literal("")),
  krankenkasse: z.string().max(200).optional().or(z.literal("")),
  versichertennummer: z.string().max(50).optional().or(z.literal("")),
  interne_notizen: z.string().max(5000).optional().or(z.literal("")),
})

type PatientFormValues = z.infer<typeof patientSchema>

interface DuplicateInfo {
  id: string
  vorname: string
  nachname: string
  geburtsdatum: string
}

export function NewPatientForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null)
  const [pendingData, setPendingData] = useState<PatientFormValues | null>(null)
  const [sendInvite, setSendInvite] = useState(false)
  const [activateSubscription, setActivateSubscription] = useState(true)
  const [patientType, setPatientType] = useState<"praxis" | "extern">("praxis")
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly")
  const [promoCode, setPromoCode] = useState("")
  const [promoValid, setPromoValid] = useState<{ valid: boolean; type?: string; value?: number; error?: string } | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      geschlecht: undefined,
    },
  })

  const watchedEmail = watch("email")

  const checkDuplicate = async (
    vorname: string,
    nachname: string,
    geburtsdatum: string
  ): Promise<DuplicateInfo | null> => {
    try {
      const params = new URLSearchParams({ vorname: vorname.trim(), nachname: nachname.trim(), geburtsdatum })
      const res = await fetch(`/api/patients/check-duplicate?${params.toString()}`)
      if (!res.ok) return null
      const json = await res.json()
      return json.duplicate ?? null
    } catch {
      return null
    }
  }

  async function validatePromo(code: string) {
    if (!code.trim()) { setPromoValid(null); return }
    setPromoChecking(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/validate?code=${encodeURIComponent(code)}`)
      setPromoValid(await res.json())
    } catch {
      setPromoValid({ valid: false, error: "Prüfung fehlgeschlagen." })
    } finally {
      setPromoChecking(false)
    }
  }

  function formatPromoValue(type: string, value: number): string {
    if (type === "free_months") return `+${value} Gratis-Monat${value > 1 ? "e" : ""}`
    if (type === "percent_off") return `${value}% Rabatt`
    return `${value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} Rabatt`
  }

  const savePatient = async (data: PatientFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const email = data.email?.trim() || null
      const payload = {
        vorname: data.vorname.trim(),
        nachname: data.nachname.trim(),
        geburtsdatum: data.geburtsdatum,
        geschlecht: data.geschlecht,
        telefon: data.telefon?.trim() || null,
        email,
        strasse: data.strasse?.trim() || null,
        plz: data.plz?.trim() || null,
        ort: data.ort?.trim() || null,
        krankenkasse: data.krankenkasse?.trim() || null,
        versichertennummer: data.versichertennummer?.trim() || null,
        interne_notizen: data.interne_notizen?.trim() || null,
      }

      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Patient konnte nicht gespeichert werden. Bitte versuche es erneut.")
        return
      }

      // Step 2: Send invite + optional subscription activation
      if (sendInvite && email) {
        try {
          const inviteBody: Record<string, unknown> = {}
          if (activateSubscription) {
            inviteBody.plan_type = planType
            inviteBody.patient_type = patientType
            if (promoCode && promoValid?.valid) inviteBody.promo_code = promoCode
          }

          const inviteRes = await fetch(`/api/patients/${json.patient.id}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inviteBody),
          })

          const inviteJson = await inviteRes.json().catch(() => ({}))

          if (inviteRes.ok) {
            toast.success(
              activateSubscription
                ? "Patient angelegt, Einladung gesendet & App-Zugang freigeschaltet."
                : "Patient angelegt und Einladung per E-Mail gesendet."
            )
          } else {
            toast.warning(`Patient angelegt. Einladung fehlgeschlagen: ${inviteJson.error}`)
          }
        } catch {
          toast.warning("Patient angelegt. Einladung konnte nicht gesendet werden.")
        }
      }

      router.push(`/os/patients/${json.patient.id}`)
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: PatientFormValues) => {
    setServerError(null)

    // Check for duplicates first
    const dup = await checkDuplicate(data.vorname, data.nachname, data.geburtsdatum)
    if (dup) {
      setPendingData(data)
      setDuplicate(dup)
      return
    }

    await savePatient(data)
  }

  const handleDuplicateConfirm = async () => {
    if (!pendingData) return
    setDuplicate(null)
    await savePatient(pendingData)
  }

  const handleDuplicateCancel = () => {
    setDuplicate(null)
    setPendingData(null)
  }

  return (
    <>
      {/* Duplicate warning dialog */}
      <AlertDialog open={!!duplicate} onOpenChange={() => handleDuplicateCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Möglicher Duplikat gefunden
            </AlertDialogTitle>
            <AlertDialogDescription>
              Es existiert bereits ein Patient mit demselben Namen und Geburtsdatum:{" "}
              <strong>
                {duplicate?.vorname} {duplicate?.nachname}
              </strong>{" "}
              (geb. {duplicate?.geburtsdatum}).
              <br />
              <br />
              Möchtest du trotzdem einen neuen Patienten anlegen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDuplicateCancel}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm}>
              Trotzdem anlegen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Abschnitt: Person */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Person</h2>
            <p className="text-sm text-muted-foreground">Pflichtangaben zur Identifikation</p>
          </div>
          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vorname">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vorname"
                placeholder="Max"
                aria-describedby={errors.vorname ? "vorname-error" : undefined}
                {...register("vorname")}
              />
              {errors.vorname && (
                <p id="vorname-error" className="text-sm text-destructive">
                  {errors.vorname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nachname">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nachname"
                placeholder="Mustermann"
                aria-describedby={errors.nachname ? "nachname-error" : undefined}
                {...register("nachname")}
              />
              {errors.nachname && (
                <p id="nachname-error" className="text-sm text-destructive">
                  {errors.nachname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geburtsdatum">
                Geburtsdatum <span className="text-destructive">*</span>
              </Label>
              <Input
                id="geburtsdatum"
                type="date"
                aria-describedby={errors.geburtsdatum ? "geburtsdatum-error" : undefined}
                {...register("geburtsdatum")}
              />
              {errors.geburtsdatum && (
                <p id="geburtsdatum-error" className="text-sm text-destructive">
                  {errors.geburtsdatum.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geschlecht">
                Geschlecht <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="geschlecht"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="geschlecht"
                      aria-describedby={errors.geschlecht ? "geschlecht-error" : undefined}
                    >
                      <SelectValue placeholder="Bitte wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maennlich">Männlich</SelectItem>
                      <SelectItem value="weiblich">Weiblich</SelectItem>
                      <SelectItem value="divers">Divers</SelectItem>
                      <SelectItem value="unbekannt">Keine Angabe</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.geschlecht && (
                <p id="geschlecht-error" className="text-sm text-destructive">
                  {errors.geschlecht.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Abschnitt: Kontakt */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Kontakt</h2>
            <p className="text-sm text-muted-foreground">Optional — Erreichbarkeit des Patienten</p>
          </div>
          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                placeholder="+49 89 123456"
                {...register("telefon")}
              />
              {errors.telefon && (
                <p className="text-sm text-destructive">{errors.telefon.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@beispiel.de"
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* App invite checkbox — only visible when email is filled */}
            {watchedEmail && watchedEmail.includes("@") && (
              <div className="sm:col-span-2 space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="send_invite"
                    checked={sendInvite}
                    onCheckedChange={(checked) => setSendInvite(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="grid gap-0.5">
                    <Label htmlFor="send_invite" className="cursor-pointer flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Einladung zur Patienten-App per E-Mail senden
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Der Patient erhält eine E-Mail mit einem Link zur Registrierung.
                    </p>
                  </div>
                </div>

                {/* Subscription activation — only when invite is checked */}
                {sendInvite && (
                  <div className="space-y-3 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="activate_subscription" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Gift className="h-4 w-4 text-emerald-600" />
                        Betreuungspauschale aktivieren
                      </Label>
                      <Switch
                        id="activate_subscription"
                        checked={activateSubscription}
                        onCheckedChange={setActivateSubscription}
                      />
                    </div>

                    {activateSubscription && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Patiententyp</Label>
                          <RadioGroup
                            value={patientType}
                            onValueChange={(v) => setPatientType(v as "praxis" | "extern")}
                            className="space-y-2"
                          >
                            <label
                              htmlFor="np-pt-praxis"
                              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                patientType === "praxis" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <RadioGroupItem value="praxis" id="np-pt-praxis" className="mt-0.5" />
                              <div className="flex-1 space-y-0.5">
                                <p className="text-sm font-medium">Praxis-Patient</p>
                                <p className="text-xs text-muted-foreground">
                                  Bestandspatient — 14 Tage kostenfrei testen, danach Betreuungspauschale.
                                </p>
                              </div>
                            </label>
                            <label
                              htmlFor="np-pt-extern"
                              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                patientType === "extern" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <RadioGroupItem value="extern" id="np-pt-extern" className="mt-0.5" />
                              <div className="flex-1 space-y-0.5">
                                <p className="text-sm font-medium">Neukunde / Warteliste</p>
                                <p className="text-xs text-muted-foreground">
                                  Ist-Analyse (69€) wurde bereits separat berechnet — 1 Monat kostenfrei, danach Betreuungspauschale.
                                </p>
                              </div>
                            </label>
                          </RadioGroup>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Abo-Modell</Label>
                          <Select value={planType} onValueChange={(v) => setPlanType(v as "monthly" | "yearly")}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monatlich — 16,99 €/Monat</SelectItem>
                              <SelectItem value="yearly">Jährlich — 169,99 €/Jahr</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Promo-Code (optional)</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                value={promoCode}
                                onChange={(e) => {
                                  setPromoCode(e.target.value.toUpperCase())
                                  setPromoValid(null)
                                }}
                                placeholder="z.B. WILLKOMMEN"
                                className={`h-9 ${promoValid?.valid === true ? "border-emerald-500" : promoValid?.valid === false ? "border-red-500" : ""}`}
                              />
                              {promoValid?.valid === true && (
                                <BadgeCheck className="absolute right-2.5 top-2.5 h-4 w-4 text-emerald-500" />
                              )}
                              {promoValid?.valid === false && (
                                <XCircle className="absolute right-2.5 top-2.5 h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {promoCode && promoValid !== null && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => { setPromoCode(""); setPromoValid(null) }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9"
                              disabled={!promoCode || promoChecking}
                              onClick={() => validatePromo(promoCode)}
                            >
                              {promoChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Prüfen"}
                            </Button>
                          </div>
                          {promoValid?.valid === true && promoValid.type && promoValid.value && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3" />
                              Code gültig — {formatPromoValue(promoValid.type, promoValid.value)}
                            </p>
                          )}
                          {promoValid?.valid === false && (
                            <p className="text-xs text-red-500">
                              {promoValid.error || "Ungültiger oder abgelaufener Promo-Code."}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="strasse">Straße und Hausnummer</Label>
              <Input
                id="strasse"
                placeholder="Musterstraße 12"
                {...register("strasse")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plz">PLZ</Label>
              <Input
                id="plz"
                placeholder="80331"
                maxLength={10}
                {...register("plz")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ort">Ort</Label>
              <Input
                id="ort"
                placeholder="München"
                {...register("ort")}
              />
            </div>
          </div>
        </div>

        {/* Abschnitt: Krankenkasse */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Krankenkasse</h2>
            <p className="text-sm text-muted-foreground">
              Optional — GKV, PKV oder Selbstzahler
            </p>
          </div>
          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="krankenkasse">Krankenkasse</Label>
              <Controller
                name="krankenkasse"
                control={control}
                render={({ field }) => (
                  <KrankenkasseCombobox
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="versichertennummer">Versichertennummer</Label>
              <Input
                id="versichertennummer"
                placeholder="A123456789"
                {...register("versichertennummer")}
              />
            </div>
          </div>
        </div>

        {/* Abschnitt: Interne Notizen */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Interne Notizen</h2>
            <p className="text-sm text-muted-foreground">
              Nur für Therapeuten sichtbar — nicht für den Patienten
            </p>
          </div>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="interne_notizen">Anmerkungen</Label>
            <Textarea
              id="interne_notizen"
              placeholder="Interne Hinweise, Besonderheiten, Vorkenntnisse..."
              rows={4}
              {...register("interne_notizen")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? "Speichern..."
              : sendInvite && activateSubscription
                ? "Anlegen, Einladen & Freischalten"
                : sendInvite
                  ? "Anlegen & Einladen"
                  : "Patient anlegen"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/os/patients")}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </>
  )
}
