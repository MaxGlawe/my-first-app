/**
 * Admin Subscription Management API
 *
 * POST: Activate subscription for a patient (start trial)
 * GET:  List all subscriptions with patient info
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getOrCreateCustomer, createSubscription, getSubscriptionPriceId, SUBSCRIPTION_PRICES } from "@/lib/stripe"

// ── GET: List all subscriptions ─────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins haben Zugriff auf diese Funktion." }, { status: 403 })
  }

  const { data, error } = await serviceClient
    .from("patient_subscriptions")
    .select(`
      id,
      patient_id,
      plan_type,
      status,
      trial_start,
      trial_end,
      current_period_start,
      current_period_end,
      price_amount,
      stripe_customer_id,
      stripe_subscription_id,
      promo_code_id,
      extra_free_months,
      activated_by,
      created_at,
      updated_at,
      patients!inner(id, vorname, nachname, email)
    `)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("[GET /api/admin/subscriptions]", error)
    return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ── POST: Activate subscription for a patient ───────────────

const activateSchema = z.object({
  patient_id: z.string().uuid(),
  plan_type: z.enum(["monthly", "yearly"]).default("monthly"),
  promo_code: z.string().optional(),
  patient_type: z.enum(["praxis", "extern"]).default("praxis"),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins haben Zugriff auf diese Funktion." }, { status: 403 })
  }

  let body: z.infer<typeof activateSchema>
  try {
    body = activateSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  // Check patient exists
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id, vorname, nachname, email")
    .eq("id", body.patient_id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  if (!patient.email) {
    return NextResponse.json({ error: "Patient hat keine E-Mail-Adresse." }, { status: 400 })
  }

  // Check no active subscription exists
  const { data: existing } = await serviceClient
    .from("patient_subscriptions")
    .select("id, status, stripe_customer_id")
    .eq("patient_id", body.patient_id)
    .single()

  if (existing && ["trial", "active"].includes(existing.status)) {
    return NextResponse.json({ error: "Patient hat bereits ein aktives Abo." }, { status: 409 })
  }

  // Handle promo code
  let promoCodeId: string | null = null
  let extraFreeMonths = 0

  if (body.promo_code) {
    const { data: promo } = await serviceClient
      .from("promo_codes")
      .select("*")
      .eq("code", body.promo_code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (!promo) {
      return NextResponse.json({ error: "Ungültiger Promo-Code." }, { status: 400 })
    }

    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      return NextResponse.json({ error: "Promo-Code abgelaufen." }, { status: 400 })
    }

    if (promo.max_redemptions && promo.current_redemptions >= promo.max_redemptions) {
      return NextResponse.json({ error: "Promo-Code bereits ausgeschöpft." }, { status: 400 })
    }

    promoCodeId = promo.id

    if (promo.type === "free_months") {
      extraFreeMonths = Math.round(promo.value)
    }

    // Record redemption
    await serviceClient.from("promo_code_redemptions").insert({
      promo_code_id: promo.id,
      patient_id: body.patient_id,
    })

    await serviceClient
      .from("promo_codes")
      .update({ current_redemptions: promo.current_redemptions + 1 })
      .eq("id", promo.id)
  }

  // Calculate trial period: base depends on patient type, plus promo bonus
  //   - praxis (Bestandspatient): 14 days base
  //   - extern (Neukunde, hat 69€ Ist-Analyse bereits separat bezahlt): 30 days base
  const baseTrialDays = body.patient_type === "extern" ? 30 : 14
  const trialDays = baseTrialDays + extraFreeMonths * 30

  const now = new Date()
  const trialEnd = new Date(now)
  trialEnd.setDate(trialEnd.getDate() + trialDays)

  // Create Stripe customer + subscription
  let stripeCustomerId: string | null = null
  let stripeSubscriptionId: string | null = null

  try {
    stripeCustomerId = await getOrCreateCustomer({
      email: patient.email,
      name: `${patient.vorname} ${patient.nachname}`,
      patientId: patient.id,
      existingCustomerId: existing?.stripe_customer_id,
    })

    const priceId = getSubscriptionPriceId(body.plan_type)
    const stripeSub = await createSubscription({
      customerId: stripeCustomerId,
      priceId,
      trialDays,
      metadata: {
        praxis_os_patient_id: patient.id,
      },
    })

    stripeSubscriptionId = stripeSub.id
  } catch (err) {
    console.error("[POST /api/admin/subscriptions] Stripe error:", err)
    // Continue without Stripe — subscription tracked locally
    // Stripe can be connected later
  }

  // Upsert subscription record
  const subscriptionData = {
    patient_id: body.patient_id,
    plan_type: body.plan_type,
    status: "trial" as const,
    trial_start: now.toISOString(),
    trial_end: trialEnd.toISOString(),
    current_period_start: now.toISOString(),
    current_period_end: trialEnd.toISOString(),
    price_amount: SUBSCRIPTION_PRICES[body.plan_type],
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    promo_code_id: promoCodeId,
    extra_free_months: extraFreeMonths,
    activated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  let result
  if (existing) {
    // Reactivate
    const { data, error } = await serviceClient
      .from("patient_subscriptions")
      .update(subscriptionData)
      .eq("id", existing.id)
      .select()
      .single()
    result = { data, error }
  } else {
    const { data, error } = await serviceClient
      .from("patient_subscriptions")
      .insert(subscriptionData)
      .select()
      .single()
    result = { data, error }
  }

  if (result.error) {
    console.error("[POST /api/admin/subscriptions]", result.error)
    return NextResponse.json({ error: "Fehler beim Erstellen." }, { status: 500 })
  }

  // ── Send notifications to patient ──────────────────────
  // Fire-and-forget — don't block response on notification delivery
  const trialEndFormatted = trialEnd.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Push + email texts depend on patient type
  const trialIntro = body.patient_type === "extern"
    ? "Dein erster Monat ist kostenfrei."
    : "Deine ersten 14 Tage sind kostenfrei."
  const pushBody = body.patient_type === "extern"
    ? "Dein erster Monat ist kostenlos. Starte jetzt mit deinem Trainingsplan."
    : "Deine ersten 14 Tage sind kostenlos. Starte jetzt mit deinem Trainingsplan."

  // Push notification
  import("@/lib/push").then(({ sendPushToPatient }) => {
    sendPushToPatient(body.patient_id, {
      title: "Dein App-Zugang ist freigeschaltet!",
      body: pushBody,
      url: "/app/dashboard",
      tag: "subscription_activated",
    }).catch(console.error)
  })

  // Email notification
  import("@/lib/email").then(({ sendEmail }) => {
    sendEmail({
      to: patient.email,
      subject: "Dein Praxis OS Zugang ist freigeschaltet",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">
            Hallo ${patient.vorname},
          </h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            dein Zugang zur Praxis OS App wurde freigeschaltet! Ab sofort hast du Zugang zu:
          </p>
          <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
            <li>Deinem persönlichen Trainingsplan</li>
            <li>Direktem Chat mit deinem Therapeuten</li>
            <li>Schmerztagebuch und Fortschrittskontrolle</li>
            <li>Wissens-Lektionen zu deinem Beschwerdebild</li>
          </ul>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            <strong>${trialIntro}</strong>
            ${extraFreeMonths > 0 ? ` Plus ${extraFreeMonths} Bonus-Monat${extraFreeMonths > 1 ? 'e' : ''} durch deinen Promo-Code.` : ''}
            Die Testphase endet am ${trialEndFormatted}.
          </p>
          <div style="margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/app/dashboard"
               style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Jetzt App öffnen
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            Bei Fragen erreichst du uns jederzeit über den Chat in der App oder per E-Mail.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            Physiotherapie Glawe — Praxis OS<br />
            Diese E-Mail wurde automatisch versendet.
          </p>
        </div>
      `,
    }).catch(console.error)
  })

  return NextResponse.json(result.data, { status: 201 })
}
