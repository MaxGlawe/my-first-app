/**
 * Shop-Bewertungen — Admin-Moderation (Staff only).
 *
 * GET   /api/admin/shop/reviews
 *   Liefert offene Bewertungen (status='pending') mit Produkt-Titel, Autor,
 *   Rating, Text und Datum. Neueste zuerst.
 *
 * PATCH /api/admin/shop/reviews
 *   Body { id, action: 'approve' | 'reject' } → setzt status entsprechend.
 *
 * Staff = admin | heilpraktiker | physiotherapeut (Muster aus
 * /api/admin/schmerzcheck/funnel). Schreibt mit Service-Role.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

async function requireStaff() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 }) }
  }

  const service = createSupabaseServiceClient()
  const { data: profile } = await service
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !STAFF.includes(profile.role)) {
    return { error: NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 }) }
  }
  return { service }
}

// ── GET: offene Bewertungen ─────────────────────────────────────────────────
export async function GET() {
  const auth = await requireStaff()
  if (auth.error) return auth.error
  const service = auth.service

  const { data: reviews, error } = await service
    .from("product_reviews")
    .select("id, product_id, rating, titel, body, autor_name, created_at, products(titel, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(200)

  if (error) {
    console.error("[GET admin reviews] DB error:", error)
    return NextResponse.json({ error: "Bewertungen konnten nicht geladen werden." }, { status: 500 })
  }

  const items = (reviews ?? []).map((r) => {
    // products kann als Objekt oder (bei manchen Join-Formen) als Array kommen
    const prod = Array.isArray(r.products) ? r.products[0] : r.products
    return {
      id: r.id,
      product_id: r.product_id,
      product_titel: (prod as { titel?: string } | null)?.titel ?? "—",
      product_slug: (prod as { slug?: string } | null)?.slug ?? null,
      rating: r.rating,
      titel: r.titel,
      body: r.body,
      autor_name: r.autor_name,
      created_at: r.created_at,
    }
  })

  return NextResponse.json({ reviews: items, count: items.length })
}

// ── PATCH: freigeben / ablehnen ─────────────────────────────────────────────
const patchSchema = z.object({
  id: z.string().uuid("Ungültige ID."),
  action: z.enum(["approve", "reject"]),
})

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff()
  if (auth.error) return auth.error
  const service = auth.service

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 }
    )
  }

  const { id, action } = parsed.data
  const newStatus = action === "approve" ? "approved" : "rejected"

  const { data: updated, error } = await service
    .from("product_reviews")
    .update({ status: newStatus })
    .eq("id", id)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("[PATCH admin reviews] DB error:", error)
    return NextResponse.json({ error: "Aktion fehlgeschlagen." }, { status: 500 })
  }
  if (!updated) {
    return NextResponse.json({ error: "Bewertung nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({ ok: true, id, status: newStatus })
}
