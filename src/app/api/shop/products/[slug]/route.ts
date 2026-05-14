/**
 * GET /api/shop/products/[slug]
 *
 * Returns product detail with context-aware pricing/status:
 *   - abo_inkludiert + active subscription → status 'im_abo'
 *   - masterclass + active subscription   → discounted price, status 'kaufbar'
 *   - already owned                        → status 'besitz'
 *   - otherwise                            → full price, status 'kaufbar'
 *
 * Also includes linked learning_path metadata and lesson overview.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const sc = createSupabaseServiceClient()

  // ── Fetch product ────────────────────────────────────────────
  const { data: product, error: productError } = await sc
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "aktiv")
    .maybeSingle()

  if (productError) {
    console.error("[GET /api/shop/products/[slug]] DB error:", productError)
    return NextResponse.json({ error: "Produkt konnte nicht geladen werden." }, { status: 500 })
  }

  if (!product) {
    return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 })
  }

  // ── Fetch product contents (linked learning paths) ───────────
  const { data: contents } = await sc
    .from("product_contents")
    .select("content_type, content_id, sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true })

  // For each learning_path content, fetch path metadata + lesson overview
  const linkedPaths: Array<{
    content_id: string
    sort_order: number
    path: Record<string, unknown> | null
    lessons: Array<{ day_number: number; title: string }>
  }> = []

  if (contents) {
    for (const c of contents) {
      if (c.content_type === "learning_path") {
        const { data: path } = await sc
          .from("learning_paths")
          .select("id, slug, name, subtitle, description, icon, color, duration_days, hero_image")
          .eq("id", c.content_id)
          .maybeSingle()

        const { data: lessonRows } = path
          ? await sc
              .from("path_lessons")
              .select("day_number, title")
              .eq("path_id", path.id)
              .order("day_number", { ascending: true })
              .limit(21)
          : { data: null }

        linkedPaths.push({
          content_id: c.content_id,
          sort_order: c.sort_order,
          path: path ?? null,
          lessons: lessonRows ?? [],
        })
      }
    }
  }

  // ── Determine access status for authenticated user ───────────
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let zugriffStatus: "im_abo" | "besitz" | "kaufbar" = "kaufbar"
  let effektiverPreis = product.preis
  let hasActiveSub = false

  if (user) {
    const now = new Date()

    // Check purchase entitlement
    let isBesitz = false
    if (contents && contents.length > 0) {
      const contentIds = contents.map((c) => c.content_id)
      const { data: ents } = await sc
        .from("content_entitlements")
        .select("content_id, valid_until")
        .eq("user_id", user.id)
        .eq("source", "purchase")
        .in("content_id", contentIds)

      if (ents) {
        for (const ent of ents) {
          if (!ent.valid_until || new Date(ent.valid_until) > now) {
            isBesitz = true
            break
          }
        }
      }
    }

    if (isBesitz) {
      zugriffStatus = "besitz"
    } else {
      // Check subscription
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

      if (hasActiveSub && product.abo_inkludiert) {
        zugriffStatus = "im_abo"
      } else if (hasActiveSub && product.produkt_typ === "masterclass" && product.abo_rabatt_prozent) {
        // Discounted price for abo subscribers on masterclasses
        effektiverPreis = Number((product.preis * (1 - product.abo_rabatt_prozent / 100)).toFixed(2))
        zugriffStatus = "kaufbar"
      }
    }
  }

  return NextResponse.json({
    product: {
      ...product,
      zugriff_status: zugriffStatus,
      effektiver_preis: effektiverPreis,
      hat_aktives_abo: hasActiveSub,
    },
    contents: linkedPaths,
  })
}
