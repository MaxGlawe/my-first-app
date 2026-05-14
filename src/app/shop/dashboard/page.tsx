"use client"

/**
 * PROJ-19 / PROJ-20: /shop/dashboard — "Meine Inhalte"
 *
 * Dashboard für externe Käufer (Rolle: externer_kaeufer): gekaufte Inhalte
 * (Entitlements) + Upsell für die Voll-App. Praxis-OS-Stil mit ShopHeader —
 * Logo & "Shop" führen zurück in den Shop.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShopHeader } from "@/components/shop/ShopHeader"
import {
  Package,
  GraduationCap,
  Route as RouteIcon,
  ArrowRight,
  LogOut,
  Target,
  ClipboardList,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Upsell ────────────────────────────────────────────────────────────────────

const UPSELL_FEATURES = [
  {
    icon: <Target className="h-5 w-5 text-emerald-600" />,
    title: "Persönliche Video-Analyse",
    description:
      "Lass deine Bewegungsqualität von einem Physiotherapeuten analysieren — 30 Min., live per Video.",
  },
  {
    icon: <ClipboardList className="h-5 w-5 text-emerald-600" />,
    title: "Individueller Trainingsplan",
    description:
      "Kein Schema F. Dein Plan wird auf deinen Körper, deine Ziele und deinen Alltag zugeschnitten.",
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-emerald-600" />,
    title: "Direkter Chat mit deinem Therapeuten",
    description:
      "Fragen zu Schmerzen, Übungen oder Fortschritt — dein Therapeut ist erreichbar.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
    title: "Langzeit-Begleitung & Dokumentation",
    description:
      "Schmerz-Tagebuch, Fortschritts-Tracking, Behandlungs-Dokumentation — alles an einem Ort.",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

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
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://wwwpraxis-os.com/online-physiotherapie"

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/login"
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopHeader />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopHeader />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="rounded-xl"
          >
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
      <ShopHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Begrüßung */}
        <div className="flex items-start justify-between gap-4 animate-fade-in-up">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em]">
              Meine Inhalte
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
              Hallo, {firstName}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Hier findest du alle deine gekauften Kurse und Programme.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>

        {/* Meine Inhalte */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-fade-in-up animation-delay-150">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Gekaufte Inhalte
            </h2>
            {hasContent && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {entitlements.length}{" "}
                {entitlements.length === 1 ? "Inhalt" : "Inhalte"}
              </span>
            )}
          </div>

          {!hasContent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600 text-sm font-semibold mb-1">
                Noch keine Inhalte
              </p>
              <p className="text-slate-400 text-xs max-w-xs mx-auto mb-4">
                Deine gekauften Kurse erscheinen hier, sobald dein Kauf
                verarbeitet wurde.
              </p>
              <Link
                href="/shop/kurse"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Kurse entdecken
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {entitlements.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      {e.content_type === "course" ? (
                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <RouteIcon className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {e.content_type === "course" ? "Kurs" : "Lernpfad"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Seit{" "}
                        {new Date(e.valid_from).toLocaleDateString("de-DE")}
                        {e.valid_until
                          ? ` · bis ${new Date(e.valid_until).toLocaleDateString("de-DE")}`
                          : " · lebenslang"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 border border-slate-200 bg-white px-2.5 py-1 rounded-full">
                    {e.source === "purchase"
                      ? "Kauf"
                      : e.source === "subscription"
                        ? "Abo"
                        : e.source}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upsell: Voll-App */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-7 text-white relative overflow-hidden animate-fade-in-up animation-delay-300">
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase mb-2">
              Praxis OS · Voll-App
            </p>
            <h2 className="text-lg font-bold text-white mb-1.5">
              Mehr als ein Kurs — deine persönliche Therapie-Begleitung
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Individuell, professionell, auf deinen Körper zugeschnitten.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {UPSELL_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white/[0.06] border border-white/10 rounded-xl p-4"
                >
                  <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center mb-2.5">
                    {feature.icon}
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {feature.title}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <Button
              onClick={() => (window.location.href = bookingUrl)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl h-12"
            >
              Jetzt Video-Analyse buchen (69 €)
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-center text-xs text-slate-400 mt-2.5">
              30-minütige Video-Analyse · Einmalig · Keine versteckten Kosten
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 mt-6 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}
