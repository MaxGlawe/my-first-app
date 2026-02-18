/**
 * PROJ-7: Buchungstool-Integration
 * POST /api/webhooks/booking
 *
 * Public endpoint (no session required) — secured via HMAC-SHA256 signature.
 * Receives events from the booking tool and:
 *  - Logs every event to webhook_events (immutable audit trail)
 *  - Processes patient.created  → creates or links patient in Praxis OS
 *  - Processes appointment.*    → upserts appointment in the cache table
 *
 * Security:
 *  - HMAC-SHA256 signature verified via X-Webhook-Signature header
 *  - Secret sourced from: (1) webhook_config DB table, (2) BOOKING_WEBHOOK_SECRET env var
 *  - Idempotency via booking_system_appointment_id UNIQUE constraint
 *  - Uses service role key to bypass RLS (external system, no user session)
 */

import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// ----------------------------------------------------------------
// Rate limiting (DB-based — works across all serverless instances)
// Counts total webhook_events in the last 60 seconds globally.
// ----------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 100

async function isRateLimited(
  supabase: ReturnType<typeof createSupabaseServiceClient>
): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count } = await supabase
    .from("webhook_events")
    .select("id", { count: "exact", head: true })
    .gte("received_at", windowStart)
  return (count ?? 0) >= RATE_LIMIT_MAX
}

// ----------------------------------------------------------------
// Resolve the active webhook secret.
// Priority: (1) DB-stored hash (from rotation), (2) env var BOOKING_WEBHOOK_SECRET.
// Returns { secretOrHash, isHash } so we can compare correctly.
// ----------------------------------------------------------------
async function resolveWebhookSecret(
  supabase: ReturnType<typeof createSupabaseServiceClient>
): Promise<{ value: string; isHash: boolean } | null> {
  // 1. Try DB first (rotated secret stored as SHA-256 hash)
  const { data } = await supabase
    .from("webhook_config")
    .select("value")
    .eq("key", "webhook_secret_hash")
    .maybeSingle()

  if (data?.value) {
    return { value: data.value, isHash: true }
  }

  // 2. Fallback: env var (plaintext secret)
  const envSecret = process.env.BOOKING_WEBHOOK_SECRET
  if (envSecret) {
    return { value: envSecret, isHash: false }
  }

  return null
}

// ----------------------------------------------------------------
// HMAC Signature verification
// The booking tool sends:
//   X-Webhook-Signature: sha256=<hex-digest>
//
// If the stored value is a hash of the secret (after rotation via the UI),
// we verify: HMAC-SHA256(payload, secret) == received_sig
// But we only stored the hash of the secret, not the secret itself.
//
// Resolution: After rotation, the booking tool must use the plaintext secret
// to sign. We stored hash(secret) in DB. We cannot reverify HMAC with only
// the hash.
//
// Therefore the DB stores the plaintext secret in the "value" column
// (not a hash of it). The column is named "webhook_secret_hash" for
// historical reasons but actually stores the plaintext for HMAC use.
// The secret is protected at rest via Supabase RLS (service-role only).
// ----------------------------------------------------------------
async function verifySignature(
  payload: string,
  signatureHeader: string | null,
  supabase: ReturnType<typeof createSupabaseServiceClient>
): Promise<boolean> {
  if (!signatureHeader) return false

  const secretConfig = await resolveWebhookSecret(supabase)
  if (!secretConfig) {
    console.error("[webhook/booking] No webhook secret configured (DB or env).")
    return false
  }

  // Use the secret (plaintext) for HMAC computation
  const secret = secretConfig.value

  // Support both "sha256=..." and plain hex
  const receivedHex = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader

  const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex")

  try {
    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(receivedHex, "hex"),
      Buffer.from(expectedHmac, "hex")
    )
  } catch {
    return false
  }
}


// ----------------------------------------------------------------
// Zod schemas for incoming webhook payloads
// ----------------------------------------------------------------

const patientCreatedSchema = z.object({
  booking_patient_id: z.string().min(1),
  email: z.string().email(),
  vorname: z.string().min(1).max(100).optional(),
  nachname: z.string().min(1).max(100).optional(),
  telefon: z.string().max(30).optional().nullable(),
  geburtsdatum: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  geschlecht: z
    .enum(["maennlich", "weiblich", "divers", "unbekannt"])
    .optional()
    .default("unbekannt"),
})

const appointmentSchema = z.object({
  booking_appointment_id: z.string().min(1),
  booking_patient_id: z.string().min(1),
  scheduled_at: z.string().datetime({ offset: true }),
  duration_minutes: z.number().int().positive(),
  therapist_name: z.string().max(200).optional().nullable(),
  service_name: z.string().max(200).optional().nullable(),
  status: z.enum(["scheduled", "cancelled", "completed"]).default("scheduled"),
})

const webhookBodySchema = z.object({
  event_type: z.string().min(1).max(100),
  payload: z.record(z.string(), z.unknown()),
})

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

async function logWebhookEvent(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  eventType: string,
  payload: Record<string, unknown>,
  status: "success" | "error" | "duplicate",
  errorMessage?: string
) {
  const { error } = await supabase.from("webhook_events").insert({
    event_type: eventType,
    payload,
    processing_status: status,
    error_message: errorMessage ?? null,
  })

  if (error) {
    console.error("[webhook/booking] Failed to log event:", error)
  }
}

// ----------------------------------------------------------------
// Event handlers
// ----------------------------------------------------------------

async function handlePatientCreated(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  rawPayload: Record<string, unknown>
): Promise<{ status: "success" | "error" | "duplicate"; errorMessage?: string }> {
  const parsed = patientCreatedSchema.safeParse(rawPayload)
  if (!parsed.success) {
    return {
      status: "error",
      errorMessage: `Invalid patient.created payload: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    }
  }

  const data = parsed.data

  // 1. Check for existing patient by email (duplicate detection)
  //    Two separate .eq() queries — avoids raw string interpolation in .or()
  const { data: byPrimaryEmail, error: lookupErr1 } = await supabase
    .from("patients")
    .select("id, booking_system_id")
    .eq("email", data.email)
    .limit(1)
    .maybeSingle()

  if (lookupErr1) {
    console.error("[webhook/booking] patient lookup by email failed:", lookupErr1.message)
    return { status: "error", errorMessage: "Datenbankfehler bei Duplikat-Prüfung." }
  }

  let existing = byPrimaryEmail
  if (!existing) {
    const { data: byBookingEmail, error: lookupErr2 } = await supabase
      .from("patients")
      .select("id, booking_system_id")
      .eq("booking_email", data.email)
      .limit(1)
      .maybeSingle()

    if (lookupErr2) {
      console.error("[webhook/booking] patient lookup by booking_email failed:", lookupErr2.message)
      return { status: "error", errorMessage: "Datenbankfehler bei Duplikat-Prüfung." }
    }
    existing = byBookingEmail
  }

  if (existing) {
    // Patient already exists — link booking_system_id if not yet set
    if (!existing.booking_system_id || existing.booking_system_id !== data.booking_patient_id) {
      const { error: updateError } = await supabase
        .from("patients")
        .update({
          booking_system_id: data.booking_patient_id,
          booking_email: data.email,
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("[webhook/booking] Failed to link booking_system_id:", updateError.message)
        return { status: "error", errorMessage: "booking_system_id konnte nicht verknüpft werden." }
      }

      return { status: "success" }
    }

    // booking_system_id already set to the same value → duplicate
    return { status: "duplicate" }
  }

  // 2. New patient — auto-create with default therapist
  // The default therapist is the first admin in the system.
  // In production this should be configurable via admin settings.
  const { data: defaultTherapist, error: therapistError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle()

  if (therapistError || !defaultTherapist) {
    return {
      status: "error",
      errorMessage:
        "No admin/default therapist found. Cannot auto-create patient from webhook.",
    }
  }

  const newPatient = {
    vorname: data.vorname ?? "Unbekannt",
    nachname: data.nachname ?? "Unbekannt",
    geburtsdatum: data.geburtsdatum ?? "1900-01-01",
    geschlecht: data.geschlecht,
    telefon: data.telefon ?? null,
    email: data.email,
    booking_system_id: data.booking_patient_id,
    booking_email: data.email,
    therapeut_id: defaultTherapist.id,
  }

  const { error: insertError } = await supabase.from("patients").insert(newPatient)

  if (insertError) {
    console.error("[webhook/booking] Failed to create patient:", insertError.message)
    return { status: "error", errorMessage: "Patient konnte nicht angelegt werden." }
  }

  // BUG-3: Admin review note — new patient auto-created, manual duplicate check recommended
  return {
    status: "success",
    errorMessage: `Neuer Patient automatisch angelegt (Buchungstool-ID: ${data.booking_patient_id}). Bitte im Admin-Bereich auf Duplikate prüfen.`,
  }
}

async function handleAppointmentEvent(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  rawPayload: Record<string, unknown>
): Promise<{ status: "success" | "error" | "duplicate"; errorMessage?: string }> {
  const parsed = appointmentSchema.safeParse(rawPayload)
  if (!parsed.success) {
    return {
      status: "error",
      errorMessage: `Invalid appointment payload: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    }
  }

  const data = parsed.data

  // Find patient by booking_system_id
  const { data: patient, error: lookupError } = await supabase
    .from("patients")
    .select("id")
    .eq("booking_system_id", data.booking_patient_id)
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    console.error("[webhook/booking] Patient lookup failed:", lookupError.message)
    return { status: "error", errorMessage: "Patientensuche fehlgeschlagen." }
  }

  if (!patient) {
    return {
      status: "error",
      errorMessage: `Patient with booking_system_id '${data.booking_patient_id}' not found in Praxis OS.`,
    }
  }

  // Upsert appointment (idempotent via booking_system_appointment_id)
  const { error: upsertError } = await supabase
    .from("appointments")
    .upsert(
      {
        patient_id: patient.id,
        booking_system_appointment_id: data.booking_appointment_id,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes,
        therapist_name: data.therapist_name ?? null,
        service_name: data.service_name ?? null,
        status: data.status,
        synced_at: new Date().toISOString(),
      },
      {
        onConflict: "booking_system_appointment_id",
        ignoreDuplicates: false,
      }
    )

  if (upsertError) {
    console.error("[webhook/booking] Appointment upsert failed:", upsertError.message)
    return { status: "error", errorMessage: "Termin konnte nicht gespeichert werden." }
  }

  return { status: "success" }
}

// ----------------------------------------------------------------
// Route Handler
// ----------------------------------------------------------------

export async function POST(request: NextRequest) {
  // ---- Initialize service client ----
  const supabase = createSupabaseServiceClient()

  // ---- Rate limiting (DB-based — works across serverless instances) ----
  if (await isRateLimited(supabase)) {
    return NextResponse.json(
      { error: "Too many requests. Rate limit: 100 events per minute." },
      { status: 429 }
    )
  }

  // ---- Read raw body (needed for HMAC verification before parsing) ----
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: "Failed to read request body." }, { status: 400 })
  }

  // ---- Verify HMAC signature ----
  const signature = request.headers.get("x-webhook-signature")
  const isValid = await verifySignature(rawBody, signature, supabase)
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or missing webhook signature." },
      { status: 401 }
    )
  }

  // ---- Parse JSON ----
  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  // ---- Validate envelope ----
  const envelopeResult = webhookBodySchema.safeParse(body)
  if (!envelopeResult.success) {
    return NextResponse.json(
      {
        error: "Invalid webhook envelope.",
        details: envelopeResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { event_type, payload } = envelopeResult.data

  // ---- Dispatch to event handler ----
  let result: { status: "success" | "error" | "duplicate"; errorMessage?: string }

  try {
    if (event_type === "patient.created") {
      result = await handlePatientCreated(supabase, payload)
    } else if (
      event_type === "appointment.created" ||
      event_type === "appointment.updated" ||
      event_type === "appointment.cancelled"
    ) {
      result = await handleAppointmentEvent(supabase, payload)
    } else {
      // Unknown event type — log and acknowledge (don't fail)
      result = {
        status: "error",
        errorMessage: `Unknown event_type: '${event_type}'`,
      }
    }
  } catch (err) {
    result = {
      status: "error",
      errorMessage: err instanceof Error ? err.message : "Unexpected processing error.",
    }
  }

  // ---- Log event (always, regardless of processing result) ----
  await logWebhookEvent(supabase, event_type, payload, result.status, result.errorMessage)

  // ---- Respond ----
  if (result.status === "error") {
    console.error(`[webhook/booking] Error processing '${event_type}':`, result.errorMessage)
    // Return 200 anyway to prevent booking tool from retrying indefinitely.
    // Real error details are in webhook_events audit log — not exposed in response.
    return NextResponse.json(
      {
        received: true,
        status: "error",
        message: "Verarbeitungsfehler. Details sind im Admin Event-Log verfügbar.",
      },
      { status: 200 }
    )
  }

  return NextResponse.json(
    { received: true, status: result.status },
    { status: 200 }
  )
}
