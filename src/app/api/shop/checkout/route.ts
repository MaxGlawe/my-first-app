/**
 * POST /api/shop/checkout
 *
 * Creates a Stripe Checkout Session (mode 'payment') for a one-time course purchase.
 * Uses inline price_data (no Stripe Price ID needed).
 * Metadata { user_id, product_id } is stored on the session for the webhook.
 *
 * Guards:
 *   - Product must exist and be active
 *   - User must not already own the content
 *   - User must not have subscription access (abo_inkludiert = true)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { getStripe } from "@/lib/stripe"

const CheckoutBodySchema = z.object({
  productSlug: z.string().min(1).max(200),
})

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

  const { productSlug } = parsed.data
  const sc = createSupabaseServiceClient()

  // ── Load product ─────────────────────────────────────────────
  const { data: product, error: productError } = await sc
    .from("products")
    .select("id, slug, titel, preis, waehrung, abo_inkludiert, produkt_typ, status")
    .eq("slug", productSlug)
    .maybeSingle()

  if (productError) {
    console.error("[POST /api/shop/checkout] DB error:", productError)
    return NextResponse.json({ error: "Produkt konnte nicht geladen werden." }, { status: 500 })
  }

  if (!product || product.status !== "aktiv") {
    return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 })
  }

  // ── Load product contents ────────────────────────────────────
  const { data: contents } = await sc
    .from("product_contents")
    .select("content_type, content_id")
    .eq("product_id", product.id)

  const contentIds = (contents ?? []).map((c) => c.content_id)

  // ── Guard: not already purchased ────────────────────────────
  if (contentIds.length > 0) {
    const now = new Date()
    const { data: ents } = await sc
      .from("content_entitlements")
      .select("content_id, valid_until")
      .eq("user_id", user.id)
      .eq("source", "purchase")
      .in("content_id", contentIds)

    const alreadyOwned = (ents ?? []).some((ent) => {
      return !ent.valid_until || new Date(ent.valid_until) > now
    })

    if (alreadyOwned) {
      return NextResponse.json(
        { error: "Du besitzt dieses Produkt bereits." },
        { status: 409 }
      )
    }
  }

  // ── Guard: not available via subscription ────────────────────
  if (product.abo_inkludiert) {
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

      if (sub) {
        return NextResponse.json(
          { error: "Dieses Produkt ist in deinem Abo bereits enthalten." },
          { status: 409 }
        )
      }
    }
  }

  // ── Fetch user email ─────────────────────────────────────────
  const { data: profile } = await sc
    .from("user_profiles")
    .select("email, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  const customerEmail = profile?.email ?? user.email ?? undefined

  // ── Determine effective price ────────────────────────────────
  // For subscribers buying masterclasses with a discount
  let unitAmount = Math.round(product.preis * 100) // Stripe uses cents

  if (product.produkt_typ === "masterclass") {
    // Check if subscriber to apply discount
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

      if (sub) {
        // Re-fetch full product for abo_rabatt_prozent
        const { data: fullProduct } = await sc
          .from("products")
          .select("abo_rabatt_prozent")
          .eq("id", product.id)
          .maybeSingle()

        if (fullProduct?.abo_rabatt_prozent) {
          unitAmount = Math.round(unitAmount * (1 - fullProduct.abo_rabatt_prozent / 100))
        }
      }
    }
  }

  // ── Create Stripe Checkout Session ──────────────────────────
  const stripe = getStripe()
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://wwwpraxis-os.com"

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: product.waehrung ?? "eur",
            unit_amount: unitAmount,
            product_data: {
              name: product.titel,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      metadata: {
        user_id: user.id,
        product_id: product.id,
      },
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
