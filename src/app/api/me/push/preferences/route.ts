/**
 * PROJ-14: GET  /api/me/push/preferences — Fetches saved push preferences for the patient
 *          PATCH /api/me/push/preferences — Updates notification preferences for all active subscriptions
 *
 * GET returns the preferences from the first registered subscription (they are kept in
 * sync across devices by the PATCH endpoint). If no subscriptions exist, returns defaults.
 *
 * PATCH updates reminder_enabled, reminder_time, and chat_enabled on ALL subscriptions
 * of the patient for multi-device consistency.
 *
 * Access: Patient only (own subscriptions)
 * RLS: Enforced at DB level
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Zod schema ────────────────────────────────────────────────────────────────

const PreferencesSchema = z
  .object({
    reminderEnabled: z.boolean().optional(),
    reminderTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Ungültiges Zeitformat. Erwartet HH:MM.")
      .optional(),
    chatEnabled: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.reminderEnabled !== undefined ||
      data.reminderTime !== undefined ||
      data.chatEnabled !== undefined,
    { message: "Mindestens ein Feld muss angegeben werden." }
  )

// ── Shared: resolve patient_id from auth ──────────────────────────────────────

async function resolvePatientId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { user: null, patient: null, authError: true }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (patientError || !patient) return { user, patient: null, authError: false }

  return { user, patient, authError: false }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { user, patient, authError } = await resolvePatientId(supabase)

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 404 })
  }

  // Fetch one subscription to read shared preferences (all devices are kept in sync)
  const { data: sub, error } = await supabase
    .from("push_subscriptions")
    .select("reminder_enabled, reminder_time, chat_enabled")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return saved prefs or defaults if no subscription exists yet
  return NextResponse.json({
    reminderEnabled: sub?.reminder_enabled ?? true,
    reminderTime: sub?.reminder_time ?? "08:00",
    chatEnabled: sub?.chat_enabled ?? true,
  })
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { user, patient, authError } = await resolvePatientId(supabase)

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  if (!patient) {
    return NextResponse.json({ error: "Kein Patientenprofil gefunden." }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = PreferencesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { reminderEnabled, reminderTime, chatEnabled } = parsed.data

  // Build partial update — only update what was provided
  const updates: Record<string, unknown> = {}
  if (reminderEnabled !== undefined) updates.reminder_enabled = reminderEnabled
  if (reminderTime !== undefined) updates.reminder_time = reminderTime
  if (chatEnabled !== undefined) updates.chat_enabled = chatEnabled

  // Apply to ALL subscriptions for this patient (multi-device consistency)
  const { error: updateError } = await supabase
    .from("push_subscriptions")
    .update(updates)
    .eq("patient_id", patient.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
