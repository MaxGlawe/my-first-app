/**
 * POST /api/shop/public-checkout
 *
 * Gast-Checkout für den öffentlichen Website-Shop (PROJ-21).
 * Nicht eingeloggte Besucher kaufen einen Kurs. Der eingeschränkte
 * externer_kaeufer-Account wird NICHT hier, sondern nach erfolgreicher Zahlung
 * im Stripe-Webhook angelegt (PROJ-19-Mechanik, Schritt 3).
 *
 * Security:
 *   - Rate-Limiting pro IP + global (analog /api/intake)
 *   - Zod-Validierung aller Eingaben
 *   - Wegwerf-/Test-E-Mail-Blocklist
 * Vorab-Check: existiert bereits ein Account mit dieser E-Mail, der den Kurs
 * besitzt oder im Abo hat → 409 mit Login-Hinweis (kein Doppelkauf).
 *
 * HINWEIS: Wird erst durch die Middleware-Freigabe für anonyme Besucher
 * erreichbar — die wird separat (mit Freigabe) ergänzt.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { isDisposableEmail } from "@/lib/email-blocklist"
import { getStripe } from "@/lib/stripe"

const BodySchema = z.object({
  productSlug: z.string().min(1).max(200),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(200),
  firstName: z.string().min(1, "Bitte gib deinen Vornamen ein.").max(100),
  lastName: z.string().min(1, "Bitte gib deinen Nachnamen ein.").max(100),
})

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

  const sc = createSupabaseServiceClient()

  // ── Produkt laden ───────────────────────────────────────────────────────
  const { data: product, error: productError } = await sc
    .from("products")
    .select("id, slug, titel, preis, waehrung, abo_inkludiert, status")
    .eq("slug", body.productSlug)
    .maybeSingle()

  if (productError) {
    console.error("[POST /api/shop/public-checkout] DB error:", productError)
    return NextResponse.json({ error: "Kurs konnte nicht geladen werden." }, { status: 500 })
  }
  if (!product || product.status !== "aktiv") {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  // ── Inhalte des Produkts (für Besitz-Check) ─────────────────────────────
  const { data: contents } = await sc
    .from("product_contents")
    .select("content_id")
    .eq("product_id", product.id)
  const contentIds = (contents ?? []).map((c) => c.content_id)

  // ── Vorab-Check: gibt es schon einen Account mit dieser E-Mail? ─────────
  const { data: existingProfile } = await sc
    .from("user_profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle()

  if (existingProfile) {
    // Besitzt der Account den Kurs bereits?
    if (contentIds.length > 0) {
      const now = new Date()
      const { data: ents } = await sc
        .from("content_entitlements")
        .select("content_id, valid_until")
        .eq("user_id", existingProfile.id)
        .in("content_id", contentIds)
      const owns = (ents ?? []).some(
        (e) => !e.valid_until || new Date(e.valid_until) > now
      )
      if (owns) {
        return NextResponse.json(
          {
            error:
              "Du besitzt diesen Kurs bereits. Bitte melde dich an, um ihn zu öffnen.",
          },
          { status: 409 }
        )
      }
    }
    // Im Abo enthalten?
    if (product.abo_inkludiert) {
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
        if (sub) {
          return NextResponse.json(
            {
              error:
                "Dieser Kurs ist in deinem Abo bereits enthalten. Bitte melde dich an.",
            },
            { status: 409 }
          )
        }
      }
    }
    // Account existiert, besitzt den Kurs aber nicht →
    // der Kauf wird ihm im Webhook gutgeschrieben (kein Doppel-Account).
  }

  // ── Stripe Checkout Session (Gast — kein user_id) ───────────────────────
  const stripe = getStripe()
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://wwwpraxis-os.com"

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: product.waehrung ?? "eur",
            unit_amount: Math.round(product.preis * 100),
            product_data: { name: product.titel },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/kurse/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/kurse/${product.slug}`,
      metadata: {
        product_id: product.id,
        guest_email: email,
        guest_first_name: body.firstName.trim(),
        guest_last_name: body.lastName.trim(),
      },
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
