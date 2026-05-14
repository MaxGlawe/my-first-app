/**
 * GET /api/shop/products
 *
 * Returns all active products, optionally filtered by ?anliegen=ruecken.
 * For authenticated users: enriches each product with ownership status
 * (besitz: true/false and abo_access: true/false) without N+1 queries.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const anliegenFilter = searchParams.get("anliegen")

  const sc = createSupabaseServiceClient()

  // ── Fetch active products ──────────────────────────────────
  let query = sc
    .from("products")
    .select("id, slug, titel, kurzbeschreibung, hero_bild, produkt_typ, anliegen, preis, waehrung, abo_inkludiert, abo_rabatt_prozent, sortierung")
    .eq("status", "aktiv")
    .order("sortierung", { ascending: true })

  if (anliegenFilter) {
    // Filter: array column contains the anliegen value
    query = query.contains("anliegen", [anliegenFilter])
  }

  const { data: products, error } = await query.limit(100)

  if (error) {
    console.error("[GET /api/shop/products] DB error:", error)
    return NextResponse.json({ error: "Produkte konnten nicht geladen werden." }, { status: 500 })
  }

  if (!products || products.length === 0) {
    return NextResponse.json({ products: [] })
  }

  // ── Ownership check (optional — only if user is logged in) ──
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Anonymous: return products without access info
    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        besitz: false,
        abo_access: false,
        kaufbar: true,
      })),
    })
  }

  const productIds = products.map((p) => p.id)

  // ── Single query: all entitlements for this user for these products ──
  // We look up content_entitlements via product_contents join
  const { data: contentRows } = await sc
    .from("product_contents")
    .select("product_id, content_type, content_id")
    .in("product_id", productIds)

  const now = new Date()

  // Build a Set of product IDs the user has purchased
  const purchasedProductIds = new Set<string>()
  if (contentRows && contentRows.length > 0) {
    // Fetch all purchase entitlements for this user
    const contentIds = contentRows.map((r) => r.content_id)
    const { data: entitlements } = await sc
      .from("content_entitlements")
      .select("content_type, content_id, source, valid_until")
      .eq("user_id", user.id)
      .eq("source", "purchase")
      .in("content_id", contentIds)

    if (entitlements) {
      for (const ent of entitlements) {
        // Check validity
        const valid = !ent.valid_until || new Date(ent.valid_until) > now
        if (!valid) continue
        // Map back to product_id
        const matchingContent = contentRows.filter(
          (r) => r.content_id === ent.content_id && r.content_type === ent.content_type
        )
        for (const mc of matchingContent) {
          purchasedProductIds.add(mc.product_id)
        }
      }
    }
  }

  // ── Check for active subscription ───────────────────────────
  let hasActiveSub = false
  const { data: patient } = await sc
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (patient) {
    const { data: sub } = await sc
      .from("patient_subscriptions")
      .select("id")
      .eq("patient_id", patient.id)
      .in("status", ["trial", "active"])
      .maybeSingle()
    hasActiveSub = !!sub
  }

  // ── Annotate each product ────────────────────────────────────
  const enriched = products.map((p) => {
    const besitz = purchasedProductIds.has(p.id)
    const aboAccess = hasActiveSub && p.abo_inkludiert
    const kaufbar = !besitz && !aboAccess

    let effektiverPreis = p.preis
    if (!besitz && !aboAccess && hasActiveSub && p.produkt_typ === "masterclass" && p.abo_rabatt_prozent) {
      effektiverPreis = Number((p.preis * (1 - p.abo_rabatt_prozent / 100)).toFixed(2))
    }

    return {
      ...p,
      besitz,
      abo_access: aboAccess,
      kaufbar,
      effektiver_preis: effektiverPreis,
    }
  })

  return NextResponse.json({ products: enriched })
}
