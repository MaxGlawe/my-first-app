/**
 * PROJ-7: Buchungstool-Integration
 * POST /api/admin/webhook-secret/rotate
 *
 * Generates a new cryptographically random webhook secret.
 * - Returns the new secret in plaintext ONCE (admin must copy it to the booking tool).
 * - Stores the plaintext secret in the webhook_config table (service-role-only access,
 *   RLS blocks all user access — the table is effectively a Supabase Vault substitute).
 * - The webhook receiver reads the secret from the DB to verify HMAC signatures.
 *
 * Access: Admin only.
 *
 * Note on security:
 *   The BOOKING_WEBHOOK_SECRET env var is the fallback for initial setup.
 *   After the first rotation via this endpoint, the DB record takes precedence.
 *   The webhook_config table is protected by RLS (USING false on all policies),
 *   meaning only the service role key can read/write it.
 */

import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// Secret length: 32 bytes = 64 hex characters (256-bit entropy)
const SECRET_BYTES = 32

export async function POST() {
  const supabase = await createSupabaseServerClient()

  // ---- Authentication ----
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // ---- Admin role check ----
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Benutzerprofil konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können das Webhook-Secret rotieren." },
      { status: 403 }
    )
  }

  // ---- Generate new secret (256-bit, hex-encoded) ----
  const newSecretPlaintext = randomBytes(SECRET_BYTES).toString("hex")

  // ---- Persist plaintext via service role (bypasses RLS — intended) ----
  // The secret is stored in the webhook_config table which has USING false
  // on all RLS policies. Only the service role key can access it.
  const serviceSupabase = createSupabaseServiceClient()

  const { error: upsertError } = await serviceSupabase
    .from("webhook_config")
    .upsert(
      {
        key: "webhook_secret_hash",   // column named for historical reasons; stores plaintext
        value: newSecretPlaintext,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: "key" }
    )

  if (upsertError) {
    console.error("[POST /api/admin/webhook-secret/rotate] Upsert error:", upsertError)
    return NextResponse.json(
      { error: "Secret konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  // ---- Return secret ONCE in plaintext ----
  // The admin must copy this into the booking tool immediately.
  return NextResponse.json(
    { secret: newSecretPlaintext },
    { status: 200 }
  )
}
