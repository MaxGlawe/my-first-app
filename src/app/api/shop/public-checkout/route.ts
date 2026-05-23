/**
 * POST /api/shop/public-checkout
 *
 * Gast-Checkout für den öffentlichen Website-Shop (PROJ-21).
 * Nicht eingeloggte Besucher kaufen einen oder mehrere Kurse. Der eingeschränkte
 * externer_kaeufer-Account wird NICHT hier, sondern nach erfolgreicher Zahlung
 * im Stripe-Webhook angelegt (PROJ-19-Mechanik, Schritt 3).
 *
 * Body (rückwärtskompatibel):
 *   - { productSlug, email, firstName, lastName }   — Einzelkauf (Altverhalten)
 *   - { slugs: string[], email, firstName, lastName } — Mehrartikel-Warenkorb
 *
 * Security:
 *   - Rate-Limiting pro IP + global (analog /api/intake)
 *   - Zod-Validierung aller Eingaben
 *   - Wegwerf-/Test-E-Mail-Blocklist
 * Vorab-Check pro Artikel: existiert bereits ein Account mit dieser E-Mail, der den
 * Kurs besitzt oder im Abo hat → der Artikel wird herausgefiltert (kein Doppelkauf).
 * Bleibt nach dem Filter nichts übrig → 409 mit Login-Hinweis.
 *
 * Metadata:
 *   - { product_ids: "<comma-joined>", guest_email, guest_first_name, guest_last_name }
 *   - { product_id } zusätzlich bei Einzelkauf (Webhook-Kompat)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { isDisposableEmail } from "@/lib/email-blocklist"
import { getStripe } from "@/lib/stripe"

const BodySchema = z
  .object({
    productSlug: z.string().min(1).max(200).optional(),
    slugs: z.array(z.string().min(1).max(200)).min(1).max(50).optional(),
    email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(200),
    firstName: z.string().min(1, "Bitte gib deinen Vornamen ein.").max(100),
    lastName: z.string().min(1, "Bitte gib deinen Nachnamen ein.").max(100),
  })
  .refine((b) => b.productSlug || (b.slugs && b.slugs.length > 0), {
    message: "Es muss mindestens ein Produkt angegeben werden.",
  })

type LoadedProduct = {
  id: string
  slug: string
  titel: string
  preis: number
  waehrung: string | null
  abo_inkludiert: boolean
  status: string
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // ── Rate limiting: 5/IP/Stunde + 50 global/Stunde ───────────────────────
  if (isRateLimited(`public-checkout:${ip}`, 5, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }
  if (isRateLimited("public-checkout:global", 50, 3_600_000)) {
    return NextResponse.json(
      { error: "Derzeit sind zu viele Anfragen eingegangen. Bitte versuche es später." },
      { status: 429 }
    )
  }

  // ── Validierung ─────────────────────────────────────────────────────────
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()

  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Bitte verwende eine reguläre E-Mail-Adresse (keine Wegwerf-Adressen)." },
      { status: 400 }
    )
  }

  // Slug-Liste normalisieren (dedupliziert)
  const requestedSlugs = Array.from(
    new Set(
      [body.productSlug, ...(body.slugs ?? [])].filter(
        (s): s is string => typeof s === "string" && s.length > 0
      )
    )
  )

  const sc = createSupabaseServiceClient()

  // ── Produkte laden ──────────────────────────────────────────────────────
  const { data: products, error: productError } = await sc
    .from("products")
    .select("id, slug, titel, preis, waehrung, abo_inkludiert, status")
    .in("slug", requestedSlugs)

  if (productError) {
    console.error("[POST /api/shop/public-checkout] DB error:", productError)
    return NextResponse.json({ error: "Challenge konnte nicht geladen werden." }, { status: 500 })
  }

  const activeProducts = (products ?? []).filter(
    (p): p is LoadedProduct => p.status === "aktiv"
  )
  if (activeProducts.length === 0) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 })
  }

  // ── Vorab-Check: gibt es schon einen Account mit dieser E-Mail? ─────────
  const { data: existingProfile } = await sc
    .from("user_profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle()

  // Aktives Abo des bestehenden Accounts (einmalig)
  let existingHasActiveSub = false
  if (existingProfile) {
    const { data: patient } = await sc
      .from("patients")
      .select("id")
      .eq("user_id", existingProfile.id)
      .maybeSingle()
    if (patient) {
      const { data: sub } = await sc
        .from("patient_subscriptions")
        .select("id")
        .eq("patient_id", patient.id)
        .in("status", ["trial", "active"])
        .maybeSingle()
      existingHasActiveSub = !!sub
    }
  }

  const now = new Date()

  // ── Pro Produkt: Doppelkauf-Filter, line_items aufbauen ─────────────────
  const lineItems: {
    price_data: {
      currency: string
      unit_amount: number
      product_data: { name: string }
    }
    quantity: number
  }[] = []
  const purchasableProductIds: string[] = []
  let blockedByOwnership = false

  for (const product of activeProducts) {
    if (existingProfile) {
      // Inhalte des Produkts laden (für Besitz-Check)
      const { data: contents } = await sc
        .from("product_contents")
        .select("content_id")
        .eq("product_id", product.id)
      const contentIds = (contents ?? []).map((c) => c.content_id)

      // Besitzt der Account den Kurs bereits?
      if (contentIds.length > 0) {
        const { data: ents } = await sc
          .from("content_entitlements")
          .select("content_id, valid_until")
          .eq("user_id", existingProfile.id)
          .in("content_id", contentIds)
        const owns = (ents ?? []).some(
          (e) => !e.valid_until || new Date(e.valid_until) > now
        )
        if (owns) {
          blockedByOwnership = true
          continue
        }
      }

      // Im Abo enthalten?
      if (product.abo_inkludiert && existingHasActiveSub) {
        blockedByOwnership = true
        continue
      }
      // Account existiert, besitzt den Kurs aber nicht →
      // der Kauf wird ihm im Webhook gutgeschrieben (kein Doppel-Account).
    }

    lineItems.push({
      price_data: {
        currency: product.waehrung ?? "eur",
        unit_amount: Math.round(product.preis * 100),
        product_data: { name: product.titel },
      },
      quantity: 1,
    })
    purchasableProductIds.push(product.id)
  }

  // Nach dem Filter nichts mehr übrig → 409 mit Login-Hinweis
  if (lineItems.length === 0) {
    return NextResponse.json(
      {
        error: blockedByOwnership
          ? "Du hast bereits Zugang zu diesen Inhalten. Bitte melde dich an, um sie zu öffnen."
          : "Keine kaufbaren Artikel gefunden.",
      },
      { status: 409 }
    )
  }

  // ── Stripe Checkout Session (Gast — kein user_id) ───────────────────────
  const stripe = getStripe()
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://wwwpraxis-os.com"

  // cancel_url: bei Einzelkauf zur Produktseite, sonst zur Übersicht
  const cancelUrl =
    purchasableProductIds.length === 1 && activeProducts.length === 1
      ? `${origin}/kurse/${activeProducts[0].slug}`
      : `${origin}/kurse`

  const metadata: Record<string, string> = {
    product_ids: purchasableProductIds.join(","),
    guest_email: email,
    guest_first_name: body.firstName.trim(),
    guest_last_name: body.lastName.trim(),
  }
  if (purchasableProductIds.length === 1) {
    metadata.product_id = purchasableProductIds[0]
  }

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      success_url: `${origin}/kurse/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata,
    })
  } catch (err) {
    console.error("[POST /api/shop/public-checkout] Stripe error:", err)
    return NextResponse.json(
      { error: "Stripe Checkout konnte nicht erstellt werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: session.url })
}
