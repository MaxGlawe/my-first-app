/**
 * Admin Subscription Detail API
 *
 * PATCH: Update subscription (cancel, change plan)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { cancelSubscription } from "@/lib/stripe"

const updateSchema = z.object({
  action: z.enum(["cancel", "reactivate"]),
  reason: z.string().max(500).optional(),
})

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

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

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const { data: sub } = await serviceClient
    .from("patient_subscriptions")
    .select("*")
    .eq("id", id)
    .single()

  if (!sub) {
    return NextResponse.json({ error: "Abo nicht gefunden." }, { status: 404 })
  }

  if (body.action === "cancel") {
    // Cancel in Stripe (at period end)
    if (sub.stripe_subscription_id) {
      try {
        await cancelSubscription(sub.stripe_subscription_id, true)
      } catch (err) {
        console.error("[PATCH subscription] Stripe cancel error:", err)
      }
    }

    const { error } = await serviceClient
      .from("patient_subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: body.reason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Kündigung fehlgeschlagen." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, status: "cancelled" })
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 })
}
