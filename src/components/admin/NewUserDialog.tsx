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

export function NewUserDialog({ onUserCreated }: NewUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

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
    reset()
  }

  const onSubmit = async (data: NewUserFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const { supabase } = await import("@/lib/supabase")

      // For patients, generate invite link via edge function
      if (data.role === "patient") {
        // Generate a secure invite token
        const token = crypto.randomUUID()
        const inviteUrl = `${window.location.origin}/invite/${token}`

        // Store invite in DB
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

      // For therapists and admins, invite via server-side API (needs service role key)
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
        setServerError(json.error ?? "Nutzer konnte nicht eingeladen werden.")
        return
      }

      onUserCreated()
      handleClose()
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
    }
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
              <Button variant="outline" onClick={copyInviteLink}>
                Kopieren
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
                  Eine Einladungs-E-Mail wird an {watch("email") || "die E-Mail-Adresse"} gesendet.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Einladen..." : "Nutzer einladen"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
