"use client"

/**
 * Admin: Shop-Bewertungen moderieren.
 *
 * Listet offene Bewertungen (status='pending') und erlaubt Freigeben /
 * Ablehnen je Eintrag. Staff-geschützt: /os/admin/* ist per Middleware
 * Admin-only; die API akzeptiert zusätzlich heilpraktiker/physiotherapeut.
 */

import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Check, X, Inbox, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface PendingReview {
  id: string
  product_id: string
  product_titel: string
  product_slug: string | null
  rating: number
  titel: string | null
  body: string
  autor_name: string | null
  created_at: string
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "h-4 w-4 fill-amber-400 text-amber-400"
              : "h-4 w-4 text-slate-300"
          }
        />
      ))}
    </div>
  )
}

export default function AdminShopReviewsPage() {
  const [reviews, setReviews] = useState<PendingReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    fetch("/api/admin/shop/reviews")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Fehler beim Laden.")
        return r.json()
      })
      .then((json: { reviews: PendingReview[] }) => {
        setReviews(json.reviews)
        setError(null)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const moderate = useCallback(
    async (id: string, action: "approve" | "reject") => {
      setBusyId(id)
      try {
        const res = await fetch("/api/admin/shop/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error ?? "Aktion fehlgeschlagen.")
          return
        }
        setReviews((prev) => prev.filter((r) => r.id !== id))
        toast.success(action === "approve" ? "Bewertung freigegeben." : "Bewertung abgelehnt.")
      } catch {
        toast.error("Netzwerkfehler. Bitte versuche es erneut.")
      } finally {
        setBusyId(null)
      }
    },
    []
  )

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
            Bewertungen moderieren
            {!isLoading && reviews.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                {reviews.length} offen
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Neue Bewertungen verifizierter Käufer erscheinen erst nach deiner Freigabe.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={isLoading}
          className="rounded-xl shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Aktualisieren
        </Button>
      </div>

      {error && (
        <Card className="mt-6 border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && reviews.length === 0 && (
        <Card className="mt-6 flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <Inbox className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-base font-semibold text-slate-800">Keine offenen Bewertungen</p>
          <p className="max-w-sm text-sm text-slate-500">
            Sobald ein verifizierter Käufer ein Produkt bewertet, taucht es hier zur
            Freigabe auf.
          </p>
        </Card>
      )}

      {/* List */}
      {!isLoading && reviews.length > 0 && (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <StarRow rating={r.rating} />
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(r.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-normal">
                  {r.product_titel}
                </Badge>
              </div>

              {r.titel && (
                <p className="mt-3 text-sm font-semibold text-slate-900">{r.titel}</p>
              )}
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {r.body}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                von {r.autor_name?.trim() || "Anonym"}
              </p>

              <div className="mt-4 flex gap-2.5">
                <Button
                  onClick={() => moderate(r.id, "approve")}
                  disabled={busyId === r.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Freigeben
                </Button>
                <Button
                  onClick={() => moderate(r.id, "reject")}
                  disabled={busyId === r.id}
                  variant="outline"
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Ablehnen
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
