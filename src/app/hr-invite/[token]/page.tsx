"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, CheckCircle2, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react"

export default function HrInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword && password.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordValid || !passwordsMatch) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/bgf/hr-invite/${token}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Fehler beim Setzen des Passworts.")
        setSaving(false)
        return
      }

      setSuccess(true)
      setEmail(data.email)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.")
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-landing-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-landing-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-landing-accent" />
          </div>
          <h1 className="text-2xl font-bold text-landing-fg mb-2">Passwort gesetzt!</h1>
          <p className="text-landing-fg-muted mb-2">
            Ihr Zugang ist eingerichtet. Sie werden zum Login weitergeleitet.
          </p>
          {email && (
            <p className="text-sm text-landing-fg-subtle">
              Anmelden mit: <strong className="text-landing-fg">{email}</strong>
            </p>
          )}
          <div className="mt-6">
            <Button
              onClick={() => router.push("/login")}
              className="bg-landing-accent hover:bg-landing-accent-hover text-white rounded-full px-8"
            >
              Jetzt anmelden
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-landing-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-display font-bold text-xl text-landing-fg">Praxis OS</span>
            <span className="text-xs font-bold text-landing-accent bg-landing-accent/10 px-2 py-0.5 rounded-full">BGF</span>
          </div>
          <h1 className="text-2xl font-bold text-landing-fg mb-2">Willkommen im Gesundheits-Dashboard</h1>
          <p className="text-landing-fg-muted text-sm">
            Legen Sie Ihr Passwort fest um auf das Dashboard Ihres Unternehmens zuzugreifen.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-landing-border bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password">Passwort</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-landing-fg-subtle" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-landing-fg-subtle hover:text-landing-fg"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && !passwordValid && (
                <p className="text-xs text-red-500 mt-1">Mindestens 8 Zeichen erforderlich</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm">Passwort bestätigen</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-landing-fg-subtle" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="pl-10"
                  required
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={saving || !passwordValid || !passwordsMatch}
              className="w-full bg-landing-accent hover:bg-landing-accent-hover text-white h-11 rounded-xl"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Passwort festlegen"
              )}
            </Button>
          </form>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-landing-fg-subtle">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            <span>Verschlüsselt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
