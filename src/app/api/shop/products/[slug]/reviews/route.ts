/**
 * Shop-Produktbewertungen — öffentliche API.
 *
 * GET  /api/shop/products/[slug]/reviews
 *   Öffentlich (kein Login nötig). Liefert die freigegebenen Bewertungen
 *   (status='approved') eines Produkts + Aggregat { average, count }.
 *   Neueste zuerst, limitiert.
 *
 * POST /api/shop/products/[slug]/reviews
 *   Nur eingeloggte VERIFIZIERTE KÄUFER (hasContentAccess auf einen
 *   product_content) ohne bereits vorhandene Bewertung. Body { rating,
 *   titel?, body } (Zod). Schreibt mit status='pending' (Moderation),
 *   autor_name aus user_profiles.first_name. Idempotent gegen Doppel-
 *   bewertung (unique constraint → 409).
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { hasContentAccess } from "@/lib/content-access"
import { isRateLimited } from "@/lib/rate-limit"

const REVIEW_LIMIT = 50

// ── GET: freigegebene Bewertungen + Aggregat ────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const sc = createSupabaseServiceClient()

  const { data: product, error: productError } = await sc
    .from("products")
    .select("id")
    .eq("slug", slug)
    .eq("status", "aktiv")
    .maybeSingle()

  if (productError) {
    console.error("[GET reviews] product lookup error:", productError)
    return NextResponse.json({ error: "Bewertungen konnten nicht geladen werden." }, { status: 500 })
  }
  if (!product) {
    return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 })
  }

  const { data: reviews, error: reviewsError } = await sc
    .from("product_reviews")
    .select("id, rating, titel, body, autor_name, created_at")
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(REVIEW_LIMIT)

  if (reviewsError) {
    console.error("[GET reviews] reviews query error:", reviewsError)
    return NextResponse.json({ error: "Bewertungen konnten nicht geladen werden." }, { status: 500 })
  }

  const rows = reviews ?? []
  const count = rows.length
  const average =
    count > 0 ? Number((rows.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 0

  return NextResponse.json({
    aggregate: { average, count },
    reviews: rows,
  })
}

// ── POST: neue Bewertung (nur verifizierte Käufer) ──────────────────────────
const reviewSchema = z.object({
  rating: z.number().int().min(1, "Bitte gib eine Bewertung ab.").max(5),
  titel: z.string().trim().max(120).optional().nullable(),
  body: z
    .string()
    .trim()
    .min(3, "Deine Bewertung ist zu kurz.")
    .max(2000, "Deine Bewertung ist zu lang (max. 2000 Zeichen)."),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // ── Auth ──────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Bitte melde dich an, um zu bewerten." }, { status: 401 })
  }

  // ── Rate-Limit (pro Nutzer) ───────────────────────────────
  if (isRateLimited(`review:${user.id}`, 10, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }

  // ── Body validieren ───────────────────────────────────────
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 })
  }
  const parsed = reviewSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 }
    )
  }
  const { rating, titel, body } = parsed.data

  const sc = createSupabaseServiceClient()

  // ── Produkt + zugehörige Inhalte laden ────────────────────
  const { data: product } = await sc
    .from("products")
    .select("id")
    .eq("slug", slug)
    .eq("status", "aktiv")
    .maybeSingle()

  if (!product) {
    return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 })
  }

  // ── Verifizierter Käufer? ─────────────────────────────────
  // Käufer = hat Zugriff (Kauf ODER Abo) auf MINDESTENS einen Inhalt des
  // Produkts. Konsistent mit /api/shop/products (besitz/abo_access).
  const { data: contents } = await sc
    .from("product_contents")
    .select("content_type, content_id")
    .eq("product_id", product.id)

  let istKaeufer = false
  for (const c of contents ?? []) {
    if (await hasContentAccess(user.id, c.content_type, c.content_id)) {
      istKaeufer = true
      break
    }
  }

  if (!istKaeufer) {
    return NextResponse.json(
      { error: "Nur verifizierte Käufer dieses Produkts können es bewerten." },
      { status: 403 }
    )
  }

  // ── Doppelbewertung früh abfangen (freundliche Meldung) ───
  const { data: existing } = await sc
    .from("product_reviews")
    .select("id")
    .eq("product_id", product.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "Du hast dieses Produkt bereits bewertet." },
      { status: 409 }
    )
  }

  // ── Anzeigename (Vorname) holen ───────────────────────────
  const { data: profile } = await sc
    .from("user_profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle()

  const autorName = profile?.first_name?.trim() || null

  // ── Insert (status='pending') ─────────────────────────────
  const { error: insertError } = await sc.from("product_reviews").insert({
    product_id: product.id,
    user_id: user.id,
    rating,
    titel: titel?.trim() || null,
    body,
    autor_name: autorName,
    status: "pending",
  })

  if (insertError) {
    // Unique-Constraint (Race condition) → freundliche 409
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Du hast dieses Produkt bereits bewertet." },
        { status: 409 }
      )
    }
    console.error("[POST reviews] insert error:", insertError)
    return NextResponse.json(
      { error: "Bewertung konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Danke! Deine Bewertung wird nach Prüfung sichtbar.",
  })
}
