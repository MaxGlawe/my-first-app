/**
 * PROJ-14: DELETE /api/me/push/unsubscribe
 *
 * Removes a Web Push subscription for the currently authenticated patient.
 * Called when the patient revokes push permission or manually unsubscribes.
 * Identified by the subscription endpoint URL (globally unique per browser).
 *
 * Access: Patient only (own subscription)
 * RLS: Enforced at DB level
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Zod schema ────────────────────────────────────────────────────────────────

const UnsubscribeBodySchema = z.object({
  endpoint: z.string().url(),
})

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
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
  const parsed = UnsubscribeBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { endpoint } = parsed.data

  // 3. Resolve patient_id from user_id bridge column
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 500 })
  }

  if (!patient) {
    return NextResponse.json(
      { error: "Kein Patientenprofil gefunden." },
      { status: 404 }
    )
  }

  // 4. Delete the subscription row matching this patient + endpoint
  // RLS ensures the patient can only delete their own subscriptions.
  const { error: deleteError } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("patient_id", patient.id)
    .eq("subscription_json->>endpoint", endpoint)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
