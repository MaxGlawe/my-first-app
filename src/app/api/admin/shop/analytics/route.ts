/**
 * GET /api/admin/shop/analytics
 *
 * Shop-Funnel- & Umsatz-Metriken für den „Shop"-Tab im Admin-Statistik-Dashboard
 * (Staff only — admin / heilpraktiker / physiotherapeut).
 *
 * Liest:
 *   - page_views        (Shop-Pfade: path beginnt mit /kurse oder /decks)
 *   - conversion_events (event_type beginnt mit shop_)
 *   - products          (für Titel/Typ-Auflösung in der Produkt-Tabelle)
 *
 * Aggregation erfolgt in JS (moderate Datenmengen, .limit gesetzt).
 */
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

// ── Typen für die gelesenen Roh-Zeilen ──────────────────────────────────────
interface PageViewRow {
  session_id: string | null
  path: string | null
  device_type: string | null
  utm_source: string | null
}
interface ConversionRow {
  session_id: string | null
  event_type: string | null
  metadata: Record<string, unknown> | null
}
interface ProductRow {
  id: string
  slug: string
  titel: string
  produkt_typ: string
}

const isShopPath = (path: string | null): boolean =>
  !!path && (path.startsWith("/kurse") || path.startsWith("/decks"))

const numOr0 = (v: unknown): number => (typeof v === "number" && isFinite(v) ? v : 0)
const strOr = (v: unknown, fallback: string): string =>
  typeof v === "string" && v.trim() ? v : fallback

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const service = createSupabaseServiceClient()
  const { data: profile } = await service
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!profile || !STAFF.includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // ── Roh-Daten laden ────────────────────────────────────────────────────────
  const { data: pageViewsRaw } = await service
    .from("page_views")
    .select("session_id, path, device_type, utm_source")
    .or("path.like./kurse%,path.like./decks%")
    .limit(50000)

  const { data: convRaw } = await service
    .from("conversion_events")
    .select("session_id, event_type, metadata")
    .like("event_type", "shop_%")
    .limit(50000)

  const { data: productsRaw } = await service
    .from("products")
    .select("id, slug, titel, produkt_typ")
    .limit(1000)

  // Defensive: .or kann je nach Setup zu breit greifen — clientseitig filtern.
  const pageViews: PageViewRow[] = (pageViewsRaw ?? []).filter((p) => isShopPath(p.path))
  const conv: ConversionRow[] = (convRaw ?? []) as ConversionRow[]
  const products: ProductRow[] = (productsRaw ?? []) as ProductRow[]

  const productBySlug = new Map<string, ProductRow>()
  const productById = new Map<string, ProductRow>()
  for (const p of products) {
    productBySlug.set(p.slug, p)
    productById.set(p.id, p)
  }

  // ── Funnel ───────────────────────────────────────────────────────────────
  // Besucher = eindeutige Sessions auf Shop-Pfaden
  const visitorSessions = new Set(
    pageViews.map((p) => p.session_id).filter((s): s is string => !!s)
  )
  const visitors = visitorSessions.size

  const sessionsWith = (eventType: string): Set<string> =>
    new Set(
      conv
        .filter((c) => c.event_type === eventType && c.session_id)
        .map((c) => c.session_id as string)
    )

  const productViewSessions = sessionsWith("shop_product_view")
  const addToCartSessions = sessionsWith("shop_add_to_cart")
  const checkoutSessions = sessionsWith("shop_checkout_start")

  // Käufe: pro shop_purchase-Event (eine Zeile je gekauftem Produkt)
  const purchaseEvents = conv.filter((c) => c.event_type === "shop_purchase")
  const purchases = purchaseEvents.length

  const funnel = {
    visitors,
    productViews: productViewSessions.size,
    addToCart: addToCartSessions.size,
    checkoutStart: checkoutSessions.size,
    purchases,
  }

  // ── Umsatz gesamt + Währung ──────────────────────────────────────────────
  let revenueTotal = 0
  let currency = "EUR"
  for (const e of purchaseEvents) {
    const m = e.metadata ?? {}
    revenueTotal += numOr0(m.amount)
    currency = strOr(m.currency, currency)
  }

  // ── Pro Produkt: Aufrufe (product_view), Käufe, Umsatz ─────────────────────
  interface PerProductAcc {
    slug: string
    titel: string
    produkt_typ: string
    views: number
    purchases: number
    revenue: number
  }
  const perProductMap = new Map<string, PerProductAcc>()

  const ensureProduct = (slug: string): PerProductAcc => {
    let acc = perProductMap.get(slug)
    if (!acc) {
      const p = productBySlug.get(slug)
      acc = {
        slug,
        titel: p?.titel ?? slug,
        produkt_typ: p?.produkt_typ ?? "—",
        views: 0,
        purchases: 0,
        revenue: 0,
      }
      perProductMap.set(slug, acc)
    }
    return acc
  }

  // Aufrufe je Produkt (shop_product_view, slug aus metadata)
  for (const c of conv) {
    if (c.event_type !== "shop_product_view") continue
    const slug = strOr(c.metadata?.slug, "")
    if (!slug) continue
    ensureProduct(slug).views += 1
  }

  // Käufe + Umsatz je Produkt (shop_purchase). slug bevorzugt, sonst über product_id.
  for (const e of purchaseEvents) {
    const m = e.metadata ?? {}
    let slug = strOr(m.slug, "")
    if (!slug) {
      const pid = strOr(m.product_id, "")
      const p = pid ? productById.get(pid) : undefined
      slug = p?.slug ?? ""
    }
    if (!slug) continue
    const acc = ensureProduct(slug)
    acc.purchases += 1
    acc.revenue += numOr0(m.amount)
    // Titel/Typ ggf. aus dem Event nachziehen, falls nicht in products gefunden
    if (acc.titel === acc.slug && typeof m.produkt_typ === "string") {
      acc.produkt_typ = m.produkt_typ
    }
  }

  const perProduct = Array.from(perProductMap.values()).sort(
    (a, b) => b.revenue - a.revenue || b.purchases - a.purchases || b.views - a.views
  )

  // ── Attribution: UTM-Quelle (Besucher) + Käufe nach Quelle ─────────────────
  // Mapping session → UTM-Quelle aus den Page-Views (erste belegte Quelle gewinnt).
  const sessionSource = new Map<string, string>()
  for (const p of pageViews) {
    if (!p.session_id) continue
    if (sessionSource.has(p.session_id)) continue
    sessionSource.set(p.session_id, strOr(p.utm_source, "(direkt)"))
  }

  // Besucher nach Quelle (eindeutige Sessions)
  const visitorsBySource: Record<string, number> = {}
  for (const sid of visitorSessions) {
    const src = sessionSource.get(sid) ?? "(direkt)"
    visitorsBySource[src] = (visitorsBySource[src] ?? 0) + 1
  }

  // Käufe nach Quelle (Käufe sind über die Stripe-session.id getrackt — diese
  // matcht NICHT die Browser-session_id der Page-Views. Daher Käufe nach Quelle
  // nur, wenn ein Match existiert; sonst „(unbekannt)").
  const purchasesBySource: Record<string, number> = {}
  for (const e of purchaseEvents) {
    const sid = e.session_id
    const src = sid && sessionSource.has(sid) ? sessionSource.get(sid)! : "(unbekannt)"
    purchasesBySource[src] = (purchasesBySource[src] ?? 0) + 1
  }

  // Geräte (eindeutige Sessions → erstes belegtes Gerät)
  const sessionDevice = new Map<string, string>()
  for (const p of pageViews) {
    if (!p.session_id) continue
    if (sessionDevice.has(p.session_id)) continue
    sessionDevice.set(p.session_id, strOr(p.device_type, "unbekannt"))
  }
  const byDevice: Record<string, number> = {}
  for (const sid of visitorSessions) {
    const dev = sessionDevice.get(sid) ?? "unbekannt"
    byDevice[dev] = (byDevice[dev] ?? 0) + 1
  }

  return NextResponse.json({
    funnel,
    totals: {
      revenue: Math.round(revenueTotal * 100) / 100,
      currency,
      purchases,
      visitors,
    },
    perProduct,
    attribution: {
      visitorsBySource,
      purchasesBySource,
      byDevice,
    },
  })
}
