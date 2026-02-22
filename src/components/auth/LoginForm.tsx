"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail } from "lucide-react"

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
    <div className="w-full max-w-md">
      {/* Glass card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
        {/* Emerald accent line */}
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Willkommen zurück
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Melde dich mit deinen Zugangsdaten an.
            </p>
          </div>

          {/* Error */}
          {(paramError || serverError) && (
            <Alert variant="destructive" className="mb-6 border-red-500/30 bg-red-500/10 text-red-300">
              <AlertDescription>{paramError || serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-300">
                E-Mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@praxis.de"
                  autoComplete="email"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-11"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-300">
                Passwort
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-11"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-base font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>

          {/* Footer link */}
          <div className="text-center mt-6">
            <a
              href="/login/reset-password"
              className="text-sm text-slate-500 hover:text-emerald-400 underline underline-offset-4 transition-colors"
            >
              Passwort vergessen?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
