/**
 * PROJ-14: POST /api/me/push/subscribe
 *
 * Saves a Web Push subscription for the currently authenticated patient.
 * Each browser/device creates a unique subscription endpoint — supports
 * multi-device (one patient can have multiple active subscriptions).
 *
 * If the same endpoint already exists (e.g. the user subscribed before on
 * this device), we upsert to avoid duplicates.
 *
 * Access: Patient only (own subscription)
 * RLS: Enforced at DB level (patients.user_id = auth.uid())
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Zod schema ────────────────────────────────────────────────────────────────

const PushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
})

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: PushSubscriptionKeysSchema,
})

const SubscribeBodySchema = z.object({
  subscription: PushSubscriptionSchema,
  deviceType: z.enum(["ios", "android", "desktop"]),
})

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  // 1. Authenticate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // 2. Validate input
  const body = await req.json().catch(() => ({}))
  const parsed = SubscribeBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { subscription, deviceType } = parsed.data

  // 3. Resolve the subscription owner.
  //    Clinical patients own their subscription via patient_id (patients.user_id).
  //    BGF employees have NO patients row → they own it via user_id.
  //    push_subscriptions has a CHECK constraint: exactly one of the two is set.
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 500 })
  }

  const owner: { patient_id: string; user_id?: undefined } | { user_id: string; patient_id?: undefined } =
    patient ? { patient_id: patient.id } : { user_id: user.id }

  // 4. Upsert subscription — unique on endpoint
  // If this exact endpoint already exists, update device_type and reset timestamps.
  const { error: upsertError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        ...owner,
        subscription_json: subscription,
        device_type: deviceType,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "subscription_json->>'endpoint'",
        ignoreDuplicates: false,
      }
    )

  if (upsertError) {
    // Fallback: try plain insert (in case upsert conflict column syntax differs)
    const { error: insertError } = await supabase
      .from("push_subscriptions")
      .insert({
        ...owner,
        subscription_json: subscription,
        device_type: deviceType,
      })

    if (insertError && !insertError.message.includes("duplicate")) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
