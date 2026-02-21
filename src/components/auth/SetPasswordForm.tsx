"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
      .regex(/[A-Z]/, "Das Passwort muss mindestens einen Großbuchstaben enthalten.")
      .regex(/[0-9]/, "Das Passwort muss mindestens eine Zahl enthalten."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface SetPasswordFormProps {
  token: string
  vorname: string
}

export function SetPasswordForm({ token, vorname }: SetPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const { supabase } = await import("@/lib/supabase")

      // Set the password for the already-authenticated user
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        setServerError("Passwort konnte nicht gesetzt werden. Bitte versuche es erneut.")
        return
      }

      // Finalize registration: create user_profiles, mark invite as registered
      const res = await fetch(`/api/patients/invite/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setServerError(json.error ?? "Registrierung konnte nicht abgeschlossen werden.")
        return
      }

      // Redirect to patient app
      router.push("/app/dashboard")
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Willkommen, {vorname}!
        </CardTitle>
        <CardDescription>
          Setze ein Passwort, um dein Patienten-Konto zu aktivieren.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Mindestens 8 Zeichen, ein Großbuchstabe und eine Zahl.
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Konto wird aktiviert..." : "Konto aktivieren"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
