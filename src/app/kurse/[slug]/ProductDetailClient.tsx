"use client"

/**
 * PROJ-21: /kurse/[slug] — Client-Teil der öffentlichen Kursseite (Website-Shop)
 *
 * Interaktiver Teil (Fetch, Gast-Checkout-Formular). Die SEO-Metadaten liefert
 * der Server-Wrapper page.tsx via generateMetadata.
 */

import { useEffect, useState, useCallback, type FormEvent } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  BookOpen,
  ShieldCheck,
  Mail,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { TrustRow } from "@/components/shop/TrustRow"
import { AppUpsell } from "@/components/shop/AppUpsell"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  slug: string
  titel: string
  kurzbeschreibung: string | null
  beschreibung: string | null
  hero_bild: string | null
  produkt_typ: "kurs" | "programm" | "masterclass"
  anliegen: string[] | null
  preis: number
  waehrung: string
  abo_inkludiert: boolean
  abo_rabatt_prozent: number | null
  zugriff_status: "im_abo" | "besitz" | "kaufbar"
  effektiver_preis: number
  hat_aktives_abo: boolean
}

interface Lesson {
  day_number: number
  title: string
}

interface LinkedPath {
  content_id: string
  sort_order: number
  path: {
    id: string
    slug: string
    name: string
    subtitle: string | null
    description: string | null
    icon: string | null
    color: string
    duration_days: number
    hero_image: string | null
  } | null
  lessons: Lesson[]
}

interface ProductDetailResponse {
  product: Product
  contents: LinkedPath[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ANLIEGEN_LABELS: Record<string, string> = {
  ruecken: "Rücken",
  schmerz: "Schmerz",
  stress: "Stress",
  faszien: "Faszien",
  beweglichkeit: "Beweglichkeit",
  hydration: "Hydration",
  wohlbefinden: "Wohlbefinden",
  "chronische-beschwerden": "Chronische Beschwerden",
}

const SLUG_GRADIENTS: Record<string, string> = {
  "hydrations-boost": "from-cyan-400 via-sky-400 to-teal-500",
  "ruecken-mobility": "from-emerald-400 via-teal-400 to-cyan-500",
  "schmerz-tagebuch-routine": "from-rose-400 via-pink-400 to-rose-500",
  "faszien-tiefenarbeit": "from-indigo-400 via-violet-400 to-purple-500",
}

function getGradient(slug: string): string {
  return SLUG_GRADIENTS[slug] ?? "from-slate-400 to-slate-500"
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Gast-Checkout-Block ───────────────────────────────────────────────────────

function GuestCtaBlock({ product }: { product: Product }) {
  const { zugriff_status, effektiver_preis, preis, abo_rabatt_prozent } = product
  const isDiscounted = effektiver_preis < preis

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Eingeloggter Besucher mit Zugang (Randfall — Website ist öffentlich)
  if (zugriff_status === "besitz" || zugriff_status === "im_abo") {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="font-semibold text-emerald-900">Du hast bereits Zugang</p>
        </div>
        <p className="text-sm text-emerald-700">
          Dieser Kurs ist in deinem Konto verfügbar.
        </p>
        <Button
          asChild
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11"
        >
          <Link href="/login">Zum Login</Link>
        </Button>
      </div>
    )
  }

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.")
      return
    }
    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/shop/public-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Checkout konnte nicht gestartet werden.")
        return
      }
      if (json.url) window.location.href = json.url
    } catch {
      toast.error("Netzwerkfehler. Bitte versuche es erneut.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
      {/* Preis */}
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-3xl font-bold text-slate-900">
            {effektiver_preis.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
          </span>
          {isDiscounted && (
            <span className="text-lg text-slate-400 line-through">
              {preis.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €
            </span>
          )}
        </div>
        {isDiscounted && abo_rabatt_prozent ? (
          <p className="text-sm text-slate-500">Exklusiver Preis für Abo-Mitglieder</p>
        ) : (
          <p className="text-sm text-slate-500">
            Einmalig · Lebenslanger Zugriff · inkl. MwSt.
          </p>
        )}
      </div>

      {/* Gast-Checkout-Formular */}
      <form onSubmit={handleCheckout} className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Vorname"
            aria-label="Vorname"
            className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nachname"
            aria-label="Nachname"
            className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Deine E-Mail-Adresse"
          aria-label="E-Mail-Adresse"
          className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
        />
        <Button
          type="submit"
          disabled={isCheckingOut}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl h-12 text-base"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird vorbereitet…
            </>
          ) : (
            "Jetzt kaufen"
          )}
        </Button>
      </form>

      {/* Hinweis: Zugang per E-Mail */}
      <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3">
        <Mail className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          Nach dem Kauf bekommst du automatisch deinen Zugang per E-Mail — kein
          Account-Anlegen vorher nötig.
        </p>
      </div>

      {/* Trust */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Sichere Zahlung via Stripe — Kreditkarte, SEPA, Sofort</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Sofortiger Zugang nach Zahlungsbestätigung</span>
        </div>
      </div>
    </div>
  )
}

// ── Lesson list ───────────────────────────────────────────────────────────────

function LessonList({ lessons }: { lessons: Lesson[] }) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW_COUNT = 7
  const shown = expanded ? lessons : lessons.slice(0, PREVIEW_COUNT)
  const hasMore = lessons.length > PREVIEW_COUNT

  return (
    <div className="space-y-2">
      {shown.map((lesson) => (
        <div
          key={lesson.day_number}
          className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100"
        >
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-slate-500">
              {lesson.day_number}
            </span>
          </div>
          <span className="text-sm text-slate-700 leading-snug flex-1">
            {lesson.title}
          </span>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors pt-1 pl-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> Weniger anzeigen
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> Alle {lessons.length} Module anzeigen
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ── Client-Komponente ─────────────────────────────────────────────────────────

export function ProductDetailClient() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""

  const [data, setData] = useState<ProductDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    fetch(`/api/shop/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Kurs konnte nicht geladen werden.")
        return res.json()
      })
      .then((json: ProductDetailResponse) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [slug])

  const renderCta = useCallback(
    (product: Product) => <GuestCtaBlock product={product} />,
    []
  )

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopHeader mode="website" showBack backHref="/kurse" backLabel="Alle Kurse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error / Not found ────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopHeader mode="website" showBack backHref="/kurse" backLabel="Alle Kurse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Kurs nicht gefunden
          </h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {error ?? "Dieser Kurs existiert nicht oder ist nicht mehr verfügbar."}
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/kurse">Zu allen Kursen</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { product, contents } = data
  const primaryPath = contents?.[0]?.path ?? null
  const lessons = contents?.[0]?.lessons ?? []
  const durationDays = primaryPath?.duration_days ?? 21

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader mode="website" showBack backHref="/kurse" backLabel="Alle Kurse" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          {/* ── Links: Inhalt ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero-Bild / Platzhalter */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 animate-fade-in-up">
              {product.hero_bild ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.hero_bild}
                  alt={product.titel}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "w-full h-full bg-gradient-to-br flex items-center justify-center",
                    getGradient(product.slug)
                  )}
                >
                  <span className="text-white/80 text-7xl font-light select-none drop-shadow-sm">
                    {product.titel.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Tags + Titel */}
            <div className="space-y-3">
              {product.anliegen && product.anliegen.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.anliegen.map((a) => (
                    <span
                      key={a}
                      className="text-xs font-medium text-slate-500 border border-slate-200 bg-white px-2.5 py-1 rounded-full"
                    >
                      {ANLIEGEN_LABELS[a] ?? a}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                {product.titel}
              </h1>

              {product.kurzbeschreibung && (
                <p className="text-lg text-slate-500 leading-relaxed">
                  {product.kurzbeschreibung}
                </p>
              )}

              {/* Bewertungs-Platzhalter — echte Bewertungen folgen */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-slate-300" />
                  ))}
                </div>
                <span className="text-sm text-slate-400">Bewertungen folgen</span>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{durationDays} Tage</span>
                </div>
                {lessons.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span>{lessons.length} Module</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Ca. 15–20 Min. täglich</span>
                </div>
              </div>
            </div>

            {/* Trust-Signale */}
            <TrustRow />

            {/* Mobile CTA */}
            <div className="lg:hidden">{renderCta(product)}</div>

            {/* Beschreibung */}
            {product.beschreibung && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-slate-900">
                  Über diesen Kurs
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.beschreibung}
                </p>
              </div>
            )}

            {/* Modul-Übersicht */}
            {lessons.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Kurs-Inhalte — {durationDays} Module
                </h2>
                <LessonList lessons={lessons} />
              </div>
            )}

            {/* Das ist enthalten */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Das ist enthalten
              </h2>
              <ul className="space-y-2.5">
                {[
                  `${durationDays} geführte Module — täglich ca. 15–20 Min.`,
                  "Evidenzbasierte Übungen von Physiotherapeuten entwickelt",
                  "Lernmaterialien & Hintergrundwissen zu jedem Modul",
                  "Quiz nach jedem Modul zur Wissensverankerung",
                  "Abschluss-Zertifikat nach Kursende",
                  "Lebenslanger Zugriff nach Einmalkauf",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Voll-App-Upsell */}
            <AppUpsell />
          </div>

          {/* ── Rechts: Sticky CTA ─────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">{renderCta(product)}</div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 mt-12 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Praxis OS · Alle Preise inkl. MwSt.
          </p>
        </div>
      </footer>
    </div>
  )
}
