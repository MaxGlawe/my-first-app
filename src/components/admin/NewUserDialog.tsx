"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle } from "lucide-react"
import type { UserRole } from "./UserListTable"

const newUserSchema = z.object({
  firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen lang sein."),
  lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen lang sein."),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  role: z.enum(["admin", "heilpraktiker", "physiotherapeut", "patient", "praeventionstrainer", "personal_trainer", "praxismanagement"]).refine(
    (val) => val !== undefined,
    { message: "Bitte wähle eine Rolle aus." }
  ),
})

type NewUserFormValues = z.infer<typeof newUserSchema>

interface NewUserDialogProps {
  onUserCreated: () => void
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "heilpraktiker", label: "Heilpraktiker" },
  { value: "physiotherapeut", label: "Physiotherapeut" },
  { value: "praeventionstrainer", label: "Präventionstrainer" },
  { value: "personal_trainer", label: "Personal Trainer" },
  { value: "praxismanagement", label: "Praxismanagement" },
  { value: "patient", label: "Patient" },
]

interface CreatedCredentials {
  email: string
  tempPassword: string
}

export function NewUserDialog({ onUserCreated }: NewUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
  })

  const selectedRole = watch("role")

  const handleClose = () => {
    setOpen(false)
    setServerError(null)
    setInviteLink(null)
    setCredentials(null)
    setCopied(false)
    reset()
  }

  const onSubmit = async (data: NewUserFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const { supabase } = await import("@/lib/supabase")

      // For patients, generate invite link
      if (data.role === "patient") {
        const token = crypto.randomUUID()
        const inviteUrl = `${window.location.origin}/invite/${token}`

        const { error: inviteError } = await supabase.from("invites").insert({
          token,
          email: data.email,
          role: data.role,
          first_name: data.firstName,
          last_name: data.lastName,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })

        if (inviteError) {
          setServerError("Einladungslink konnte nicht erstellt werden.")
          return
        }

        setInviteLink(inviteUrl)
        return
      }

      // For therapists and admins — create user directly (no invite email)
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setServerError(json.error ?? "Nutzer konnte nicht angelegt werden.")
        return
      }

      // Show temp password so admin can share it
      setCredentials({
        email: data.email,
        tempPassword: json.tempPassword,
      })
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyCredentials = () => {
    if (!credentials) return
    const text = `Zugangsdaten für Praxis OS:\nE-Mail: ${credentials.email}\nPasswort: ${credentials.tempPassword}\nAnmelden unter: ${window.location.origin}/login`
    copyToClipboard(text)
  }

  // Show credentials after staff user creation
  if (credentials) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Nutzer anlegen</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nutzer angelegt</DialogTitle>
            <DialogDescription>
              Der Nutzer kann sich sofort anmelden. Teile diese Zugangsdaten.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Nutzer erfolgreich angelegt! Bitte teile die Zugangsdaten direkt mit.
              </AlertDescription>
            </Alert>
            <div className="space-y-3 rounded-lg border p-4 bg-slate-50">
              <div>
                <Label className="text-xs text-slate-500">E-Mail</Label>
                <p className="font-mono text-sm font-medium">{credentials.email}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Temporäres Passwort</Label>
                <p className="font-mono text-sm font-bold text-emerald-700">{credentials.tempPassword}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={copyCredentials}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Zugangsdaten kopieren
                </>
              )}
            </Button>
            <p className="text-xs text-amber-600 font-medium">
              Der Nutzer sollte sein Passwort nach dem ersten Login ändern.
            </p>
            <DialogFooter>
              <Button
                onClick={() => {
                  onUserCreated()
                  handleClose()
                }}
              >
                Fertig
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nutzer anlegen</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Nutzer anlegen</DialogTitle>
          <DialogDescription>
            Lege einen neuen Nutzer an und weise ihm eine Rolle zu.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                Einladungslink für den Patienten wurde erstellt. Teile diesen Link mit dem Patienten.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="text-sm" />
              <Button variant="outline" onClick={() => copyToClipboard(inviteLink)}>
                {copied ? "Kopiert!" : "Kopieren"}
              </Button>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  onUserCreated()
                  handleClose()
                }}
              >
                Fertig
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  placeholder="Max"
                  {...register("firstName")}
                  aria-describedby={errors.firstName ? "fn-error" : undefined}
                />
                {errors.firstName && (
                  <p id="fn-error" className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  placeholder="Mustermann"
                  {...register("lastName")}
                  aria-describedby={errors.lastName ? "ln-error" : undefined}
                />
                {errors.lastName && (
                  <p id="ln-error" className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@praxis.de"
                {...register("email")}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select
                onValueChange={(value) => setValue("role", value as UserRole)}
                value={selectedRole}
              >
                <SelectTrigger id="role" aria-describedby={errors.role ? "role-error" : undefined}>
                  <SelectValue placeholder="Rolle auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p id="role-error" className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
              {selectedRole === "patient" && (
                <p className="text-xs text-muted-foreground">
                  Ein Einladungslink wird erstellt, den du dem Patienten zusenden kannst.
                </p>
              )}
              {selectedRole && selectedRole !== "patient" && (
                <p className="text-xs text-muted-foreground">
                  Der Nutzer kann sich direkt mit den generierten Zugangsdaten anmelden.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Erstelle..." : "Nutzer anlegen"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
