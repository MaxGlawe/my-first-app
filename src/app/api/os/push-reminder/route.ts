/**
 * POST /api/os/push-reminder
 * PROJ-17: Therapist-initiated push reminder to a patient.
 *
 * 1. Sends a Web Push notification (if subscription exists)
 * 2. Also sends a persistent chat message so it stays visible in-app
 *
 * Authenticated via Supabase session + RLS check.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { sendPushToPatient } from "@/lib/push"

const REMINDER_MESSAGE =
  "Hallo! Ich moechte dich an dein Training erinnern. " +
  "Regelmaessiges Training ist der Schluessel zu deiner Genesung " +
  "und hilft dir, deine Ziele zu erreichen. " +
  "Selbst eine kurze Einheit macht einen Unterschied - dein Koerper wird es dir danken! " +
  "Melde dich gerne, falls du Fragen hast oder Hilfe brauchst."

const BodySchema = z.object({
  patientId: z.string().uuid(),
  message: z.string().min(1).max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Validate input
  const rawBody = await req.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungueltige Eingabe.", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { patientId, message } = parsed.data
  const chatText = message || REMINDER_MESSAGE

  // Verify therapist has access to this patient (RLS check)
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, vorname, nachname")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // 1. Send persistent chat message (always works, even without push)
  const { error: chatError } = await supabase
    .from("chat_messages")
    .insert({
      patient_id: patientId,
      sender_id: user.id,
      sender_role: "therapeut",
      content: chatText,
    })

  if (chatError) {
    console.error("[push-reminder] Chat insert error:", chatError)
  }

  // 2. Send push notification (best-effort)
  let pushResult = { sent: 0, failed: 0, cleaned: 0 }
  try {
    pushResult = await sendPushToPatient(patientId, {
      title: "Nachricht von deinem Therapeuten",
      body: chatText.length > 100 ? chatText.slice(0, 97) + "..." : chatText,
      url: "/app/chat",
      tag: "therapeut-erinnerung",
    })
  } catch (err) {
    console.error("[push-reminder] Push error:", err)
  }

  return NextResponse.json({
    ok: true,
    chatSent: !chatError,
    pushSent: pushResult.sent > 0,
    pushSubscriptions: pushResult.sent,
    message: pushResult.sent > 0
      ? "Push + Chat-Nachricht gesendet."
      : "Chat-Nachricht gesendet. Push nicht moeglich (App nicht installiert oder Push deaktiviert).",
  })
}
