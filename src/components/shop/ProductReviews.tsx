"use client"

/**
 * Produktbewertungen — geteilte Client-Komponente für die Shop-Produktseiten
 * (öffentlich /kurse/[slug] UND eingeloggt /shop/[slug]).
 *
 * - Lädt die freigegebenen Bewertungen + Aggregat über die öffentliche API.
 * - Zeigt die Bewertungs-Liste (Sterne, Titel, Text, Vorname, Datum).
 * - Zeigt ein Bewertungs-Formular NUR für eingeloggte verifizierte Käufer,
 *   die noch nicht bewertet haben. Nach dem Absenden: Hinweis "erscheint nach
 *   Freigabe".
 * - Für Gäste / Nicht-Käufer: dezenter Hinweis statt Formular.
 *
 * <ProductReviewsSummary> rendert kompakt "★ 4.6 · 12 Bewertungen" und nutzt
 * denselben Fetch-Hook, damit Kopf und Sektion konsistent sind.
 */

import { useCallback, useEffect, useState } from "react"
import { Star, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const GREEN = "#2C3E2D"
const SAND = "#C9B79C"
const BODY = "#334155"
const MUTED = "#64748b"
const LINE = "#e7e1d6"

// ── Types ───────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string
  rating: number
  titel: string | null
  body: string | null
  autor_name: string | null
  created_at: string
}

interface ReviewsResponse {
  aggregate: { average: number; count: number }
  reviews: ReviewItem[]
}

// ── Shared fetch hook ───────────────────────────────────────────────────────

function useReviews(slug: string) {
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(() => {
    if (!slug) return
    fetch(`/api/shop/products/${slug}/reviews`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: ReviewsResponse) => setData(json))
      .catch(() => setData({ aggregate: { average: 0, count: 0 }, reviews: [] }))
      .finally(() => setIsLoading(false))
  }, [slug])

  useEffect(() => {
    setIsLoading(true)
    reload()
  }, [reload])

  return { data, isLoading, reload }
}

// ── Stars ───────────────────────────────────────────────────────────────────

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4"
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value)
        return (
          <Star
            key={i}
            className={cls}
            style={filled ? { fill: SAND, color: SAND } : { color: LINE }}
          />
        )
      })}
    </div>
  )
}

// ── Kompakte Zusammenfassung (Sterne-Zeile im Seitenkopf) ────────────────────

export function ProductReviewsSummary({ slug }: { slug: string }) {
  const { data, isLoading } = useReviews(slug)

  if (isLoading) {
    return (
      <span className="text-sm" style={{ color: MUTED }}>
        Bewertungen werden geladen…
      </span>
    )
  }

  const { average, count } = data?.aggregate ?? { average: 0, count: 0 }

  if (count === 0) {
    return (
      <div className="flex items-center gap-2">
        <Stars value={0} />
        <span className="text-sm" style={{ color: MUTED }}>
          Noch keine Bewertungen
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Stars value={average} />
      <span className="text-sm" style={{ color: BODY }}>
        <span className="font-semibold" style={{ color: INK }}>
          {average.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>{" "}
        · {count} {count === 1 ? "Bewertung" : "Bewertungen"}
      </span>
    </div>
  )
}

// ── Sterne-Picker (Formular) ─────────────────────────────────────────────────

function RatingPicker({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Sterne-Bewertung">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1
        const active = (hover || value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} ${n === 1 ? "Stern" : "Sterne"}`}
            aria-checked={value === n}
            role="radio"
            className="p-0.5 disabled:cursor-not-allowed"
          >
            <Star
              className="h-7 w-7 transition-colors"
              style={active ? { fill: SAND, color: SAND } : { color: LINE }}
            />
          </button>
        )
      })}
    </div>
  )
}

// ── Bewertungs-Formular ──────────────────────────────────────────────────────

function ReviewForm({ slug, onSubmitted }: { slug: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [titel, setTitel] = useState("")
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      toast.error("Bitte vergib eine Sterne-Bewertung.")
      return
    }
    if (body.trim().length < 3) {
      toast.error("Bitte schreib ein paar Worte zu deiner Erfahrung.")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/shop/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, titel: titel.trim() || null, body: body.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Bewertung konnte nicht gespeichert werden.")
        return
      }
      setDone(true)
      onSubmitted()
    } catch {
      toast.error("Netzwerkfehler. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: GREEN, backgroundColor: "rgba(44,62,45,0.05)" }}
      >
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} />
          <div>
            <p className="font-semibold" style={{ color: INK }}>
              Danke für deine Bewertung!
            </p>
            <p className="mt-0.5 text-sm" style={{ color: BODY }}>
              Sie erscheint, sobald sie geprüft und freigegeben wurde.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-5 sm:p-6 space-y-4 shadow-sm"
      style={{ borderColor: LINE }}
    >
      <div>
        <h3
          className="text-base"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          Deine Bewertung
        </h3>
        <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
          Teile deine Erfahrung — sichtbar nach kurzer Prüfung.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" style={{ color: BODY }}>
          Sterne
        </label>
        <RatingPicker value={rating} onChange={setRating} disabled={isSubmitting} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-titel" className="text-sm font-medium" style={{ color: BODY }}>
          Titel <span className="font-normal" style={{ color: MUTED }}>(optional)</span>
        </label>
        <input
          id="review-titel"
          type="text"
          value={titel}
          maxLength={120}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="Kurz auf den Punkt"
          className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-[#2C3E2D]/15 focus:border-[#2C3E2D]/40"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-body" className="text-sm font-medium" style={{ color: BODY }}>
          Deine Erfahrung
        </label>
        <Textarea
          id="review-body"
          value={body}
          maxLength={2000}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Was hat dir geholfen? Wie bist du vorgegangen?"
          className="min-h-[110px] rounded-xl focus-visible:ring-[#2C3E2D]/20"
          style={{ backgroundColor: PAPER, borderColor: LINE, color: INK }}
        />
        <p className="text-right text-xs" style={{ color: MUTED }}>
          {body.length} / 2000
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl font-semibold text-white hover:opacity-90"
        style={{ backgroundColor: GREEN }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird gesendet…
          </>
        ) : (
          "Bewertung absenden"
        )}
      </Button>
    </form>
  )
}

// ── Einzelne Bewertung ────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
      <div className="flex items-center justify-between gap-3">
        <Stars value={review.rating} />
        <span className="text-xs" style={{ color: MUTED }}>
          {new Date(review.created_at).toLocaleDateString("de-DE")}
        </span>
      </div>
      {review.titel && (
        <p className="mt-3 text-sm font-semibold" style={{ color: INK }}>
          {review.titel}
        </p>
      )}
      {review.body && (
        <p
          className="mt-1.5 whitespace-pre-line text-sm leading-relaxed"
          style={{ color: BODY }}
        >
          {review.body}
        </p>
      )}
      <p className="mt-2.5 text-xs font-medium" style={{ color: MUTED }}>
        {review.autor_name?.trim() || "Verifizierter Käufer"}
      </p>
    </div>
  )
}

// ── Haupt-Sektion ─────────────────────────────────────────────────────────────

interface ProductReviewsProps {
  slug: string
  /** Eingeloggt? Steuert den Hinweis "Melde dich an, um zu bewerten". */
  isLoggedIn: boolean
  /**
   * Verifizierter Käufer (Besitz ODER Abo-Zugang)? Nur dann wird das
   * Bewertungs-Formular gezeigt. Wird aus dem Zugriffsstatus der Seite
   * abgeleitet — die API verifiziert serverseitig erneut.
   */
  canReview: boolean
}

export function ProductReviews({ slug, isLoggedIn, canReview }: ProductReviewsProps) {
  const { data, isLoading, reload } = useReviews(slug)
  const reviews = data?.reviews ?? []
  const { average, count } = data?.aggregate ?? { average: 0, count: 0 }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-base"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          Bewertungen
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={average} />
            <span className="text-sm" style={{ color: MUTED }}>
              {average.toLocaleString("de-DE", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{" "}
              · {count}
            </span>
          </div>
        )}
      </div>

      {/* Formular / Hinweis */}
      {canReview ? (
        <ReviewForm slug={slug} onSubmitted={reload} />
      ) : !isLoggedIn ? (
        <div
          className="rounded-2xl border p-4 text-sm"
          style={{ borderColor: LINE, backgroundColor: PAPER, color: MUTED }}
        >
          Du hast dieses Produkt gekauft?{" "}
          <a
            href="/login"
            className="font-medium underline underline-offset-2"
            style={{ color: GREEN }}
          >
            Melde dich an
          </a>
          , um es zu bewerten.
        </div>
      ) : null}

      {/* Liste */}
      {isLoading ? (
        <p className="text-sm" style={{ color: MUTED }}>
          Bewertungen werden geladen…
        </p>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-8 text-center"
          style={{ borderColor: LINE }}
        >
          <div className="flex justify-center">
            <Stars value={0} />
          </div>
          <p className="mt-3 text-sm" style={{ color: MUTED }}>
            Noch keine Bewertungen — sei der oder die Erste.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  )
}
