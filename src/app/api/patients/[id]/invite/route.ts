/**
 * POST /api/patients/[id]/invite
 * Send or re-send app invite to a patient (therapist action).
 * Optionally activates subscription in the same step → ONE combined email.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateToken } from "@/lib/tokens"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html-escape"
import { getOrCreateCustomer, createSubscription, getSubscriptionPriceId, createCouponForPromo, SUBSCRIPTION_PRICES } from "@/lib/stripe"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  // Verify authentication
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Parse optional subscription params
  let body: { plan_type?: string; promo_code?: string; patient_type?: string } = {}
  try {
    body = await request.json()
  } catch {
    // No body = invite only, no subscription activation
  }

  // Load patient (RLS ensures therapist owns this patient)
  const { data: patient, error: fetchError } = await supabase
    .from("patients")
    .select("id, vorname, nachname, email, user_id, invite_status")
    .eq("id", patientId)
    .single()

  if (fetchError || !patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  if (!patient.email) {
    return NextResponse.json(
      { error: "Patient hat keine E-Mail-Adresse. Bitte zuerst eine E-Mail hinterlegen." },
      { status: 422 }
    )
  }

  if (patient.invite_status === "registered") {
    return NextResponse.json(
      { error: "Patient ist bereits registriert." },
      { status: 409 }
    )
  }

  const serviceClient = createSupabaseServiceClient()

  // If a previous invite created an auth user that never completed registration, delete it
  if (patient.user_id && patient.invite_status === "invited") {
    try {
      await serviceClient.auth.admin.deleteUser(patient.user_id)
    } catch (err) {
      console.warn("[POST /api/patients/[id]/invite] Could not delete old auth user:", err)
    }
  }

  // ── Optional: Activate subscription ──────────────────────────
  let activateSubscription = !!body.plan_type
  let subscriptionInfo = ""

  if (activateSubscription) {
    const planType = body.plan_type === "yearly" ? "yearly" : "monthly" as const
    let promoCodeId: string | null = null
    let extraFreeMonths = 0
    let promoData: { type: string; value: number; code: string } | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let promo: any = null

    // 1. Validate promo code (but DON'T redeem yet)
    if (body.promo_code) {
      const { data: promoRow } = await serviceClient
        .from("promo_codes")
        .select("*")
        .eq("code", body.promo_code.toUpperCase())
        .eq("is_active", true)
        .single()

      if (promoRow) {
        if (promoRow.valid_until && new Date(promoRow.valid_until) < new Date()) {
          return NextResponse.json({ error: "Promo-Code abgelaufen." }, { status: 400 })
        }
        if (promoRow.max_redemptions && promoRow.current_redemptions >= promoRow.max_redemptions) {
          return NextResponse.json({ error: "Promo-Code bereits ausgeschöpft." }, { status: 400 })
        }

        promo = promoRow
        promoCodeId = promo.id
        promoData = { type: promo.type, value: promo.value, code: promo.code }
        if (promo.type === "free_months") {
          extraFreeMonths = Math.round(promo.value)
        }
      }
    }

    // 2. Calculate trial days: base depends on patient type, plus promo bonus
    //    - praxis (Bestandspatient): 14 days base
    //    - extern (Neukunde, hat 69€ Ist-Analyse bereits separat bezahlt): 30 days base
    const patientType = body.patient_type === "extern" ? "extern" : "praxis"
    const baseTrialDays = patientType === "extern" ? 30 : 14
    const trialDays = baseTrialDays + extraFreeMonths * 30
    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + trialDays)

    const trialEndFormatted = trialEnd.toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    })

    // 3. Try Stripe: create customer, create coupon (if promo), create subscription
    let stripeCustomerId: string | null = null
    let stripeSubscriptionId: string | null = null
    try {
      // Check for existing Stripe customer ID in patient_subscriptions
      const { data: existingSub } = await serviceClient
        .from("patient_subscriptions")
        .select("stripe_customer_id")
        .eq("patient_id", patientId)
        .single()

      stripeCustomerId = await getOrCreateCustomer({
        email: patient.email,
        name: `${patient.vorname} ${patient.nachname}`,
        patientId: patient.id,
        existingCustomerId: existingSub?.stripe_customer_id,
      })

      // Create Stripe coupon if promo code was used
      let stripeCouponId: string | null = null
      if (promoData) {
        try {
          stripeCouponId = await createCouponForPromo(promoData)
        } catch (couponErr) {
          console.error("[POST /api/patients/[id]/invite] Stripe coupon error:", couponErr)
        }
      }

      const priceId = getSubscriptionPriceId(planType)
      const stripeSub = await createSubscription({
        customerId: stripeCustomerId,
        priceId,
        trialDays,
        couponId: stripeCouponId,
        metadata: {
          praxis_os_patient_id: patient.id,
          ...(promoData ? { promo_code: promoData.code } : {}),
        },
      })
      stripeSubscriptionId = stripeSub.id

      // 4. Stripe succeeded — now redeem promo code atomically
      if (promo) {
        // Atomic update: only increments if current_redemptions < max_redemptions
        const { data: updatedPromo, error: redeemError } = await serviceClient
          .from("promo_codes")
          .update({ current_redemptions: promo.current_redemptions + 1 })
          .eq("id", promo.id)
          .lt("current_redemptions", promo.max_redemptions || 999999)
          .select("id")
          .single()

        if (redeemError || !updatedPromo) {
          return NextResponse.json({ error: "Promo-Code konnte nicht eingelöst werden." }, { status: 409 })
        }

        await serviceClient.from("promo_code_redemptions").insert({
          promo_code_id: promo.id,
          patient_id: patientId,
        })
      }

      // Insert or update patient_subscriptions
      const { data: existing } = await serviceClient
        .from("patient_subscriptions")
        .select("id")
        .eq("patient_id", patientId)
        .single()

      const subscriptionData = {
        patient_id: patientId,
        plan_type: planType,
        status: "trial" as const,
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
        price_amount: SUBSCRIPTION_PRICES[planType],
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        promo_code_id: promoCodeId,
        extra_free_months: extraFreeMonths,
        activated_by: user.id,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        await serviceClient.from("patient_subscriptions").update(subscriptionData).eq("id", existing.id)
      } else {
        await serviceClient.from("patient_subscriptions").insert(subscriptionData)
      }

      // Build subscription info for email — text depends on patient type
      const trialIntro = patientType === "extern"
        ? "Dein erster Monat ist kostenfrei."
        : "Deine ersten 14 Tage sind kostenfrei."
      subscriptionInfo = `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          <strong>${trialIntro}</strong>
          ${extraFreeMonths > 0 ? ` Plus ${extraFreeMonths} Bonus-Monat${extraFreeMonths > 1 ? "e" : ""} durch deinen Promo-Code.` : ""}
          Die Testphase läuft bis zum ${trialEndFormatted}.
        </p>
      `
    } catch (err) {
      // 5. Stripe failed — don't redeem promo, don't write subscription record,
      //    but still send invite email so patient can register
      console.error("[POST /api/patients/[id]/invite] Stripe error:", err)
      activateSubscription = false
      subscriptionInfo = ""
    }
  }

  // ── Generate invite token ──────────────────────────────────
  const inviteToken = generateToken()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const inviteLink = `${siteUrl}/invite/${inviteToken}`

  // 7. Update patient record BEFORE sending email
  const { error: updateError } = await serviceClient
    .from("patients")
    .update({
      invite_token: inviteToken,
      invite_sent_at: new Date().toISOString(),
      invite_status: "invited",
      user_id: null,
    })
    .eq("id", patient.id)

  if (updateError) {
    console.error("[POST /api/patients/[id]/invite] Update error:", updateError)
    return NextResponse.json(
      { error: "Patient konnte nicht aktualisiert werden. Einladung wurde nicht gesendet." },
      { status: 500 }
    )
  }

  // 8. Send ONE combined email
  const emailSubject = activateSubscription
    ? "Dein App-Zugang ist freigeschaltet"
    : "Deine Einladung zur Praxis OS App"

  const emailResult = await sendEmail({
    to: patient.email,
    subject: emailSubject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">
          Hallo ${escapeHtml(patient.vorname)},
        </h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          ${activateSubscription
            ? "dein Zugang zur <strong>Praxis OS App</strong> wurde freigeschaltet! Erstelle jetzt dein Konto, um loszulegen:"
            : "du wurdest zur <strong>Praxis OS App</strong> eingeladen! Erstelle jetzt dein Konto:"}
        </p>
        <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
          <li>Dein persönlicher Trainingsplan</li>
          <li>Direkter Chat mit deinem Therapeuten</li>
          <li>Schmerztagebuch und Fortschrittskontrolle</li>
          <li>Wissens-Lektionen zu deinem Beschwerdebild</li>
        </ul>
        ${subscriptionInfo}
        <div style="margin: 24px 0;">
          <a href="${inviteLink}"
             style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Konto erstellen & App starten
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />
          <a href="${inviteLink}" style="color: #059669; word-break: break-all;">${inviteLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          Physiotherapie Glawe — Praxis OS<br />
          Diese E-Mail wurde automatisch versendet.
        </p>
      </div>
    `,
  })

  if (!emailResult.success) {
    console.error("[POST /api/patients/[id]/invite] Email failed:", emailResult.error)
    return NextResponse.json(
      { error: "Einladungs-E-Mail konnte nicht gesendet werden." },
      { status: 500 }
    )
  }

  // Push notification (fire-and-forget, only if subscription activated)
  if (activateSubscription) {
    import("@/lib/push").then(({ sendPushToPatient }) => {
      sendPushToPatient(patientId, {
        title: "Dein App-Zugang ist freigeschaltet!",
        body: "Erstelle jetzt dein Konto und starte mit deinem Trainingsplan.",
        url: "/app/dashboard",
        tag: "subscription_activated",
      }).catch(console.error)
    })
  }

  return NextResponse.json({
    success: true,
    message: activateSubscription
      ? "Einladung gesendet & App-Zugang freigeschaltet."
      : "Einladung wurde gesendet.",
  })
}
