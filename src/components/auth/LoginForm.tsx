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

const loginSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  errorParam?: string
}

export function LoginForm({ errorParam }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const getErrorMessage = (code?: string): string | null => {
    if (code === "account_disabled")
      return "Dein Konto wurde deaktiviert. Bitte wende dich an deinen Administrator."
    return null
  }

  const paramError = getErrorMessage(errorParam)

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const { supabase } = await import("@/lib/supabase")
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setServerError("E-Mail oder Passwort ist falsch. Bitte versuche es erneut.")
        } else if (error.message.includes("Email not confirmed")) {
          setServerError("Bitte bestätige zuerst deine E-Mail-Adresse.")
        } else if (error.message.includes("Too many requests")) {
          setServerError(
            "Zu viele Anmeldeversuche. Bitte warte 15 Minuten und versuche es erneut."
          )
        } else {
          setServerError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
        }
        return
      }

      if (!authData.session) {
        setServerError("Keine Session erhalten. Bitte versuche es erneut.")
        return
      }

      // Fetch user role for redirect
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      const role = profile?.role

      if (role === "admin") {
        window.location.href = "/os/admin/dashboard"
      } else if (role === "patient") {
        window.location.href = "/app/dashboard"
      } else {
        window.location.href = "/os/dashboard"
      }
    } catch {
      setServerError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Praxis OS</CardTitle>
        <CardDescription>
          Melde dich mit deiner E-Mail-Adresse und deinem Passwort an.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {(paramError || serverError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{paramError || serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@praxis.de"
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
              autoComplete="current-password"
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Anmelden..." : "Anmelden"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <a
          href="/login/reset-password"
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
        >
          Passwort vergessen?
        </a>
      </CardFooter>
    </Card>
  )
}
