/**
 * POST /api/shop/checkout
 *
 * Creates a Stripe Checkout Session (mode 'payment') for one-time course purchases.
 * Uses inline price_data (no Stripe Price ID needed).
 *
 * Body (rückwärtskompatibel):
 *   - { productSlug: string }  — Einzelkauf (Altverhalten)
 *   - { slug: string }         — Einzelkauf (Alias)
 *   - { slugs: string[] }      — Mehrartikel-Warenkorb
 *
 * Metadata:
 *   - { user_id, product_ids: "<comma-joined product ids>" }  (neu, immer gesetzt)
 *   - { user_id, product_id }                                  (zusätzlich bei Einzelkauf, Webhook-Kompat)
 *
 * Guards (pro Artikel):
 *   - Produkt muss existieren und aktiv sein
 *   - User darf den Inhalt nicht bereits besitzen
 *   - Produkt darf nicht über das Abo verfügbar sein (abo_inkludiert = true + aktives Abo)
 * Bereits besessene / im Abo enthaltene Artikel werden herausgefiltert.
 * Bleibt nach dem Filter nichts übrig → 409.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { getStripe, UST_TAX_RATE_ID } from "@/lib/stripe"

const CheckoutBodySchema = z
  .object({
    productSlug: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(200).optional(),
    slugs: z.array(z.string().min(1).max(200)).min(1).max(50).optional(),
  })
  .refine((b) => b.productSlug || b.slug || (b.slugs && b.slugs.length > 0), {
    message: "Es muss mindestens ein Produkt angegeben werden.",
  })

type LoadedProduct = {
  id: string
  slug: string
  titel: string
  preis: number
  waehrung: string | null
  abo_inkludiert: boolean
  abo_rabatt_prozent: number | null
  produkt_typ: string
  status: string
}

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // ── Rate limiting: 10 Checkout-Sessions pro User/Stunde ──────
  if (isRateLimited(`shop-checkout:${user.id}`, 10, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Checkout-Versuche. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }

  // ── Validate body ────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 })
  }

  const parsed = CheckoutBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Slug-Liste normalisieren (dedupliziert, Einzel- + Mehrartikel-Eingabe)
  const requestedSlugs = Array.from(
    new Set(
      [
        parsed.data.productSlug,
        parsed.data.slug,
        ...(parsed.data.slugs ?? []),
      ].filter((s): s is string => typeof s === "string" && s.length > 0)
    )
  )

  const sc = createSupabaseServiceClient()

  // ── Load products ────────────────────────────────────────────
  const { data: products, error: productError } = await sc
    .from("products")
    .select("id, slug, titel, preis, waehrung, abo_inkludiert, abo_rabatt_prozent, produkt_typ, status")
    .in("slug", requestedSlugs)

  if (productError) {
    console.error("[POST /api/shop/checkout] DB error:", productError)
    return NextResponse.json({ error: "Produkte konnten nicht geladen werden." }, { status: 500 })
  }

  const activeProducts = (products ?? []).filter(
    (p): p is LoadedProduct => p.status === "aktiv"
  )

  if (activeProducts.length === 0) {
    return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 })
  }

  // ── Abo-Status des Users einmalig ermitteln (für Abo-Filter + Masterclass-Rabatt) ──
  let hasActiveSub = false
  {
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
  }

  const now = new Date()

  // ── Pro Produkt: Besitz- und Abo-Filter, Preis bestimmen ─────
  const lineItems: {
    price_data: {
      currency: string
      unit_amount: number
      product_data: { name: string }
    }
    quantity: number
    tax_rates: string[]
  }[] = []
  const purchasableProductIds: string[] = []

  for (const product of activeProducts) {
    // Inhalte des Produkts laden (für Besitz-Check)
    const { data: contents } = await sc
      .from("product_contents")
      .select("content_id")
      .eq("product_id", product.id)
    const contentIds = (contents ?? []).map((c) => c.content_id)

    // Guard: bereits gekauft?
    if (contentIds.length > 0) {
      const { data: ents } = await sc
        .from("content_entitlements")
        .select("content_id, valid_until")
        .eq("user_id", user.id)
        .eq("source", "purchase")
        .in("content_id", contentIds)

      const alreadyOwned = (ents ?? []).some(
        (ent) => !ent.valid_until || new Date(ent.valid_until) > now
      )
      if (alreadyOwned) continue // raus aus dem Warenkorb-Checkout
    }

    // Guard: im Abo enthalten?
    if (product.abo_inkludiert && hasActiveSub) continue

    // Effektiver Preis (Masterclass-Abo-Rabatt für Abonnenten)
    let unitAmount = Math.round(product.preis * 100) // Stripe in Cent
    if (
      product.produkt_typ === "masterclass" &&
      hasActiveSub &&
      product.abo_rabatt_prozent
    ) {
      unitAmount = Math.round(unitAmount * (1 - product.abo_rabatt_prozent / 100))
    }

    lineItems.push({
      price_data: {
        currency: product.waehrung ?? "eur",
        unit_amount: unitAmount,
        product_data: { name: product.titel },
      },
      quantity: 1,
      tax_rates: [UST_TAX_RATE_ID],
    })
    purchasableProductIds.push(product.id)
  }

  // Nach dem Filter nichts mehr übrig → klare Meldung
  if (lineItems.length === 0) {
    return NextResponse.json(
      {
        error:
          activeProducts.length === 1
            ? "Du besitzt dieses Produkt bereits oder es ist in deinem Abo enthalten."
            : "Alle Artikel im Warenkorb besitzt du bereits oder sind in deinem Abo enthalten.",
      },
      { status: 409 }
    )
  }

  // ── Fetch user email ─────────────────────────────────────────
  const { data: profile } = await sc
    .from("user_profiles")
    .select("email, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  const customerEmail = profile?.email ?? user.email ?? undefined

  // ── Create Stripe Checkout Session ──────────────────────────
  const stripe = getStripe()
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://wwwpraxis-os.com"

  // Metadata: product_ids (neu, comma-joined) + product_id (Einzelkauf, Webhook-Kompat)
  const metadata: Record<string, string> = {
    user_id: user.id,
    product_ids: purchasableProductIds.join(","),
  }
  if (purchasableProductIds.length === 1) {
    metadata.product_id = purchasableProductIds[0]
  }

  // Deck-only-Käufe sind accountlos → eigene Danke-Seite (kein "anmelden"-Wording)
  const allDecks = activeProducts
    .filter((p) => purchasableProductIds.includes(p.id))
    .every((p) => p.produkt_typ === "deck")
  const successUrl = allDecks
    ? `${origin}/decks/erfolg`
    : `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: `${origin}/shop`,
      invoice_creation: { enabled: true },
      metadata,
    })
  } catch (err) {
    console.error("[POST /api/shop/checkout] Stripe error:", err)
    return NextResponse.json(
      { error: "Stripe Checkout konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: session.url })
}
