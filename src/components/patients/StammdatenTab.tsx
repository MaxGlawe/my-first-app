"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KrankenkasseCombobox } from "./KrankenkasseCombobox"
import type { Patient } from "@/types/patient"
import { toast } from "sonner"
import { Pencil, X } from "lucide-react"

const stammdatenSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich.").max(100),
  nachname: z.string().min(1, "Nachname ist erforderlich.").max(100),
  geburtsdatum: z.string().min(1, "Geburtsdatum ist erforderlich."),
  geschlecht: z.enum(["maennlich", "weiblich", "divers", "unbekannt"]),
  telefon: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Keine gültige E-Mail.").optional().or(z.literal("")),
  strasse: z.string().max(200).optional().or(z.literal("")),
  plz: z.string().max(10).optional().or(z.literal("")),
  ort: z.string().max(100).optional().or(z.literal("")),
  krankenkasse: z.string().max(200).optional().or(z.literal("")),
  versichertennummer: z.string().max(50).optional().or(z.literal("")),
  interne_notizen: z.string().max(5000).optional().or(z.literal("")),
})

type StammdatenFormValues = z.infer<typeof stammdatenSchema>

interface StammdatenTabProps {
  patient: Patient
  onRefresh: () => void
  /** Hide internal notes section (e.g. for Praxismanagement) */
  hideInterneNotizen?: boolean
}

function ReadonlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm">{value || <span className="text-muted-foreground">—</span>}</p>
    </div>
  )
}

export function StammdatenTab({ patient, onRefresh, hideInterneNotizen }: StammdatenTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<StammdatenFormValues>({
    resolver: zodResolver(stammdatenSchema),
    defaultValues: {
      vorname: patient.vorname,
      nachname: patient.nachname,
      geburtsdatum: patient.geburtsdatum,
      geschlecht: patient.geschlecht,
      telefon: patient.telefon ?? "",
      email: patient.email ?? "",
      strasse: patient.strasse ?? "",
      plz: patient.plz ?? "",
      ort: patient.ort ?? "",
      krankenkasse: patient.krankenkasse ?? "",
      versichertennummer: patient.versichertennummer ?? "",
      interne_notizen: patient.interne_notizen ?? "",
    },
  })

  const handleEdit = () => {
    setIsEditing(true)
    setServerError(null)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setServerError(null)
  }

  const onSubmit = async (data: StammdatenFormValues) => {
    setIsSaving(true)
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

      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Speichern fehlgeschlagen. Bitte versuche es erneut.")
        return
      }

      toast.success("Stammdaten gespeichert.")
      setIsEditing(false)
      // Sync defaultValues so a subsequent Cancel shows the newly saved state
      reset({
        vorname: payload.vorname,
        nachname: payload.nachname,
        geburtsdatum: payload.geburtsdatum,
        geschlecht: payload.geschlecht,
        telefon: payload.telefon ?? "",
        email: payload.email ?? "",
        strasse: payload.strasse ?? "",
        plz: payload.plz ?? "",
        ort: payload.ort ?? "",
        krankenkasse: payload.krankenkasse ?? "",
        versichertennummer: payload.versichertennummer ?? "",
        interne_notizen: payload.interne_notizen ?? "",
      })
      onRefresh()
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsSaving(false)
    }
  }

  const geschlechtLabel: Record<Patient["geschlecht"], string> = {
    maennlich: "Männlich",
    weiblich: "Weiblich",
    divers: "Divers",
    unbekannt: "Keine Angabe",
  }

  // Read-only view
  if (!isEditing) {
    return (
      <div className="space-y-8">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
        </div>

        {/* Person */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Person</h3>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ReadonlyField label="Vorname" value={patient.vorname} />
            <ReadonlyField label="Nachname" value={patient.nachname} />
            <ReadonlyField
              label="Geburtsdatum"
              value={new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
            />
            <ReadonlyField label="Geschlecht" value={geschlechtLabel[patient.geschlecht]} />
          </div>
        </div>

        {/* Kontakt */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Kontakt</h3>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ReadonlyField label="Telefon" value={patient.telefon} />
            <ReadonlyField label="E-Mail" value={patient.email} />
            <ReadonlyField label="Straße" value={patient.strasse} />
            <ReadonlyField label="PLZ" value={patient.plz} />
            <ReadonlyField label="Ort" value={patient.ort} />
          </div>
        </div>

        {/* Krankenkasse */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Krankenkasse</h3>
            <Separator className="mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ReadonlyField label="Krankenkasse" value={patient.krankenkasse} />
            <ReadonlyField label="Versichertennummer" value={patient.versichertennummer} />
          </div>
        </div>

        {/* Interne Notizen */}
        {!hideInterneNotizen && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Interne Notizen</h3>
              <p className="text-xs text-muted-foreground">Nur für Therapeuten sichtbar</p>
              <Separator className="mt-2" />
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {patient.interne_notizen || (
                <span className="text-muted-foreground">Keine Notizen vorhanden.</span>
              )}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Edit view
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Person */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Person</h3>
          <Separator className="mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-vorname">
              Vorname <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-vorname"
              {...register("vorname")}
            />
            {errors.vorname && (
              <p className="text-sm text-destructive">{errors.vorname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-nachname">
              Nachname <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-nachname"
              {...register("nachname")}
            />
            {errors.nachname && (
              <p className="text-sm text-destructive">{errors.nachname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-geburtsdatum">
              Geburtsdatum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-geburtsdatum"
              type="date"
              {...register("geburtsdatum")}
            />
            {errors.geburtsdatum && (
              <p className="text-sm text-destructive">{errors.geburtsdatum.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-geschlecht">
              Geschlecht <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="geschlecht"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="edit-geschlecht">
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
              <p className="text-sm text-destructive">{errors.geschlecht.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Kontakt</h3>
          <Separator className="mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-telefon">Telefon</Label>
            <Input id="edit-telefon" type="tel" {...register("telefon")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">E-Mail</Label>
            <Input id="edit-email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-strasse">Straße und Hausnummer</Label>
            <Input id="edit-strasse" {...register("strasse")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-plz">PLZ</Label>
            <Input id="edit-plz" maxLength={10} {...register("plz")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-ort">Ort</Label>
            <Input id="edit-ort" {...register("ort")} />
          </div>
        </div>
      </div>

      {/* Krankenkasse */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Krankenkasse</h3>
          <Separator className="mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Krankenkasse</Label>
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
            <Label htmlFor="edit-versichertennummer">Versichertennummer</Label>
            <Input id="edit-versichertennummer" {...register("versichertennummer")} />
          </div>
        </div>
      </div>

      {/* Interne Notizen */}
      {!hideInterneNotizen && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Interne Notizen</h3>
            <p className="text-xs text-muted-foreground">Nur für Therapeuten sichtbar</p>
            <Separator className="mt-2" />
          </div>
          <Textarea
            id="edit-interne-notizen"
            rows={5}
            placeholder="Interne Hinweise, Besonderheiten..."
            {...register("interne_notizen")}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? "Speichern..." : "Änderungen speichern"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="mr-2 h-4 w-4" />
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
