"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Lock, CheckCircle2, Loader2, ShieldCheck, Eye, EyeOff,
  Heart, Dumbbell, MessageSquare, ClipboardList,
} from "lucide-react"

interface InviteData {
  email: string
  vorname: string | null
  nachname: string | null
  firma: string | null
}

export default function BgfInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [vorname, setVorname] = useState("")
  const [nachname, setNachname] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load invite data
  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await fetch(`/api/bgf/ma-invite/${token}/register`)
        const data = await res.json()

        if (!res.ok) {
          setLoadError(data.error || "Einladung ungültig.")
          setLoading(false)
          return
        }

        setInvite(data)
        if (data.vorname) setVorname(data.vorname)
        if (data.nachname) setNachname(data.nachname)
        setLoading(false)
      } catch {
        setLoadError("Netzwerkfehler.")
        setLoading(false)
      }
    }
    loadInvite()
  }, [token])

  const passwordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword && password.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordValid || !passwordsMatch) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/bgf/ma-invite/${token}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, vorname: vorname.trim(), nachname: nachname.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen.")
        setSaving(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("Netzwerkfehler.")
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-landing-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-landing-accent" />
      </div>
    )
  }

  // Invalid/expired invite
  if (loadError) {
    return (
      <div className="min-h-screen bg-landing-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-landing-fg mb-2">Einladung ungültig</h1>
          <p className="text-landing-fg-muted">{loadError}</p>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            className="mt-6"
          >
            Zum Login
          </Button>
        </div>
      </div>
    )
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-landing-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-landing-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-landing-accent" />
          </div>
          <h1 className="text-2xl font-bold text-landing-fg mb-2">Willkommen!</h1>
          <p className="text-landing-fg-muted mb-2">
            Ihr Konto ist eingerichtet. Sie werden zum Login weitergeleitet.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="mt-4 bg-landing-accent hover:bg-landing-accent-hover text-white rounded-full px-8"
          >
            Jetzt anmelden
          </Button>
        </div>
      </div>
    )
  }

  // Registration form
  return (
    <div className="min-h-screen bg-landing-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-display font-bold text-xl text-landing-fg">Praxis OS</span>
            <span className="text-xs font-bold text-landing-accent bg-landing-accent/10 px-2 py-0.5 rounded-full">
              Gesundheit
            </span>
          </div>
          {invite?.firma && (
            <p className="text-sm text-landing-accent font-semibold mb-2">{invite.firma}</p>
          )}
          <h1 className="text-2xl font-bold text-landing-fg mb-2">
            Ihr persönliches Gesundheitsprogramm
          </h1>
          <p className="text-landing-fg-muted text-sm">
            Registrieren Sie sich um Ihr individuelles Programm zu starten.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: ClipboardList, label: "Gesundheitsanalyse" },
            { icon: Dumbbell, label: "Tägliche Pausen-Fits" },
            { icon: Heart, label: "Ergonomie-Tipps" },
            { icon: MessageSquare, label: "Therapeuten-Zugang" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 bg-landing-accent/5 rounded-xl px-3 py-2.5 border border-landing-accent/10">
              <b.icon className="h-4 w-4 text-landing-accent flex-shrink-0" />
              <span className="text-xs font-medium text-landing-fg">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-landing-border bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (readonly) */}
            <div>
              <Label>E-Mail</Label>
              <Input value={invite?.email ?? ""} readOnly className="mt-1 bg-landing-bg text-landing-fg-muted" />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="vorname">Vorname *</Label>
                <Input
                  id="vorname"
                  value={vorname}
                  onChange={(e) => setVorname(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nachname">Nachname *</Label>
                <Input
                  id="nachname"
                  value={nachname}
                  onChange={(e) => setNachname(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Passwort *</Label>
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
                <p className="text-xs text-red-500 mt-1">Mindestens 8 Zeichen</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm">Passwort bestätigen *</Label>
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
              disabled={saving || !passwordValid || !passwordsMatch || !vorname.trim() || !nachname.trim()}
              className="w-full bg-landing-accent hover:bg-landing-accent-hover text-white h-11 rounded-xl"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrieren & starten"}
            </Button>
          </form>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-landing-fg-subtle">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            <span>Arbeitgeber sieht keine Gesundheitsdaten</span>
          </div>
        </div>
      </div>
    </div>
  )
}
