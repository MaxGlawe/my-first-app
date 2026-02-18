"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const registrationSchema = z
  .object({
    firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen lang sein."),
    lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen lang sein."),
    email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
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

type RegistrationFormValues = z.infer<typeof registrationSchema>

interface PatientRegistrationFormProps {
  token: string
}

export function PatientRegistrationForm({ token }: PatientRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  })

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const { supabase } = await import("@/lib/supabase")

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            invite_token: token,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setServerError("Diese E-Mail-Adresse ist bereits registriert.")
        } else {
          setServerError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
        }
        return
      }

      if (!authData.user) {
        setServerError("Registrierung fehlgeschlagen. Bitte versuche es erneut.")
        return
      }

      setSuccess(true)
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Konto erstellt!</CardTitle>
          <CardDescription>
            Willkommen bei Praxis OS! Bitte überprüfe deine E-Mails und bestätige deine Adresse,
            um dich anzumelden.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <a
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
          >
            Zur Anmeldung
          </a>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Konto erstellen</CardTitle>
        <CardDescription>
          Du wurdest eingeladen, der Patienten-App beizutreten. Erstelle jetzt dein Konto.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Max"
                autoComplete="given-name"
                aria-describedby={errors.firstName ? "firstname-error" : undefined}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p id="firstname-error" className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Mustermann"
                autoComplete="family-name"
                aria-describedby={errors.lastName ? "lastname-error" : undefined}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p id="lastname-error" className="text-sm text-destructive">
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
              placeholder="name@example.de"
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Konto wird erstellt..." : "Konto erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
