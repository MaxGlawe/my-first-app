"use client"

/**
 * PROJ-19: /shop/dashboard
 *
 * Eingeschränktes Dashboard für externe Käufer (Rolle: externer_kaeufer).
 * Zeigt gekaufte Inhalte (Entitlements) und einen Upsell-Bereich für
 * die Voll-App. Wird durch PROJ-20 mit echten Kurskarten befüllt.
 */

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

interface BuyerProfile {
  email: string
  first_name: string
  last_name: string
  created_at: string
}

interface Entitlement {
  id: string
  content_type: "course" | "learning_path"
  content_id: string
  source: string
  valid_from: string
  valid_until: string | null
}

interface BuyerData {
  profile: BuyerProfile | null
  entitlements: Entitlement[]
  role: string
}

// ──────────────────────────────────────────────────
// Upsell feature list
// ──────────────────────────────────────────────────

const UPSELL_FEATURES = [
  {
    icon: "🎯",
    title: "Persönliche Video-Analyse",
    description: "Lass deine Bewegungsqualität von einem Physiotherapeuten analysieren — 20 min, live per Video.",
  },
  {
    icon: "📋",
    title: "Individueller Trainingsplan",
    description: "Kein Schema F. Dein Plan wird auf deinen Körper, deine Ziele und deinen Alltag zugeschnitten.",
  },
  {
    icon: "💬",
    title: "Direkter Chat mit deinem Therapeuten",
    description: "Fragen zu Schmerzen, Übungen oder Fortschritt — dein Therapeut ist erreichbar.",
  },
  {
    icon: "📈",
    title: "Langzeit-Begleitung & Dokumentation",
    description: "Schmerz-Tagebuch, Fortschritts-Tracking, Behandlungs-Dokumentation — alles an einem Ort.",
  },
]

// ──────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────

export default function BuyerDashboardPage() {
  const [data, setData] = useState<BuyerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/me/buyer")
      .then((res) => {
        if (!res.ok) throw new Error("Profil konnte nicht geladen werden.")
        return res.json()
      })
      .then((json: BuyerData) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://wwwpraxis-os.com/online-physiotherapie"

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  const firstName = data?.profile?.first_name ?? "Käufer"
  const entitlements = data?.entitlements ?? []
  const hasContent = entitlements.length > 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">PO</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">Praxis OS</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await fetch("/api/auth/signout", { method: "POST" })
              window.location.href = "/login"
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            Abmelden
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hallo, {firstName}
          </h1>
          <p className="text-slate-500 mt-1">Hier findest du alle deine Inhalte.</p>
        </div>

        {/* Meine Inhalte */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Meine Inhalte
              </CardTitle>
              {hasContent && (
                <Badge variant="secondary" className="text-xs">
                  {entitlements.length} {entitlements.length === 1 ? "Inhalt" : "Inhalte"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!hasContent ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  Noch keine Inhalte
                </p>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  Deine gekauften Kurse und Programme erscheinen hier, sobald dein
                  Kauf verarbeitet wurde.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {entitlements.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-base">
                          {e.content_type === "course" ? "🎓" : "🛤️"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 capitalize">
                          {e.content_type === "course" ? "Kurs" : "Lernpfad"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Seit {new Date(e.valid_from).toLocaleDateString("de-DE")}
                          {e.valid_until
                            ? ` · bis ${new Date(e.valid_until).toLocaleDateString("de-DE")}`
                            : " · lebenslang"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal capitalize">
                      {e.source === "purchase"
                        ? "Kauf"
                        : e.source === "subscription"
                        ? "Abo"
                        : e.source}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upsell: Voll-App */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              Mehr mit der Voll-App
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Starte deine persönliche Therapie-Begleitung — individuell,
              professionell, auf deinen Körper zugeschnitten.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {UPSELL_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="text-xl mb-2">{feature.icon}</div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {feature.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-1">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-blue-200"
                onClick={() => (window.location.href = bookingUrl)}
              >
                Jetzt Video-Analyse buchen (69 €) →
              </Button>
              <p className="text-center text-xs text-slate-400 mt-2">
                20-minütige Video-Analyse · Einmalig · Keine versteckten Kosten
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
