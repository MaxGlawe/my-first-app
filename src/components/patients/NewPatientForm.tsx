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
import { Separator } from "@/components/ui/separator"
import { KrankenkasseCombobox } from "./KrankenkasseCombobox"
import { AlertTriangle } from "lucide-react"

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      geschlecht: undefined,
    },
  })

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

  const savePatient = async (data: PatientFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const payload = {
        vorname: data.vorname.trim(),
        nachname: data.nachname.trim(),
        geburtsdatum: data.geburtsdatum,
        geschlecht: data.geschlecht,
        telefon: data.telefon?.trim() || null,
        email: data.email?.trim() || null,
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
            {isLoading ? "Speichern..." : "Patient anlegen"}
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
