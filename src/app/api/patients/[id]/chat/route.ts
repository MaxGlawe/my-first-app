/**
 * PROJ-12: GET  /api/patients/[id]/chat — Therapeut lädt Nachrichten für einen Patienten
 *          POST /api/patients/[id]/chat — Therapeut sendet Nachricht an Patient
 *
 * PROJ-14: POST also triggers a Web Push notification to the patient
 *          (if patient has push subscriptions with chat_enabled = true)
 *
 * Access: Therapist (own patients) + Admin
 * RLS: Enforced at DB level
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendPushToPatient } from "@/lib/push"
import { sendEmail } from "@/lib/email"
import { chatNotificationEmail } from "@/lib/email-templates/chat-notification"

const PAGE_SIZE = 50
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const cursor = req.nextUrl.searchParams.get("cursor")

  let query = supabase
    .from("chat_messages")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1)

  if (cursor) {
    query = query.lt("created_at", cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/patients/[id]/chat] Error:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten." }, { status: 500 })
  }

  const messages = (data ?? []).slice(0, PAGE_SIZE).reverse()
  const hasOlder = (data ?? []).length > PAGE_SIZE
  const nextCursor =
    hasOlder && messages.length > 0 ? messages[0].created_at : null

  return NextResponse.json({ messages, hasOlder, nextCursor })
}

// ── POST ──────────────────────────────────────────────────────────────────────

const SendMessageSchema = z.object({
  content: z.string().max(2000).optional().default(""),
  media_url: z.string().url().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params

  if (!UUID_REGEX.test(patientId)) {
    return NextResponse.json({ error: "Ungültige Patienten-ID." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 })
  }

  const { content, media_url } = parsed.data

  if (!content?.trim() && !media_url) {
    return NextResponse.json({ error: "Nachricht darf nicht leer sein." }, { status: 400 })
  }

  // BUG-6 FIX: Rate limiting — max 30 messages per minute per user (DB-based, serverless-safe)
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
  const { count: recentCount } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id)
    .gte("created_at", oneMinuteAgo)
  if ((recentCount ?? 0) >= 30) {
    return NextResponse.json(
      { error: "Zu viele Nachrichten. Bitte warte einen Moment." },
      { status: 429 }
    )
  }

  const retainUntil = new Date()
  retainUntil.setFullYear(retainUntil.getFullYear() + 2)

  const { data: message, error: insertError } = await supabase
    .from("chat_messages")
    .insert({
      patient_id: patientId,
      sender_id: user.id,
      content: content?.trim() || null,
      media_url: media_url ?? null,
      media_type: media_url ? "image" : null,
      read_at: null,
      retain_until: retainUntil.toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    console.error("[POST /api/patients/[id]/chat] Error:", insertError)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten." }, { status: 500 })
  }

  // PROJ-14: Fire-and-forget push notification to the patient.
  // We do NOT await this — push delivery must never block the chat response.
  // Only sends to subscriptions with chat_enabled = true.
  sendPushToPatient(
    patientId,
    {
      title: "Neue Nachricht",
      body: content?.trim()
        ? content.trim().slice(0, 100)
        : "Dein Therapeut hat dir eine Nachricht geschickt.",
      icon: "/icons/icon-192.png",
      url: "/app/chat",
      tag: "chat-message",
    },
    { chatEnabled: true }
  ).catch((err) => {
    // Push failures are non-critical — log but never crash the chat endpoint
    console.error("[chat] Push notification error:", err)
  })

  // Email notification: send if no email was sent to this patient in the last 3 minutes.
  // Fire-and-forget — must never block the chat response.
  void (async () => {
    try {
      const service = createSupabaseServiceClient()
      const { data: pt } = await service
        .from("patients")
        .select("email, vorname, nachname, last_chat_email_at")
        .eq("id", patientId)
        .single()

      if (!pt?.email) {
        console.log("[chat-email] Skipped: no patient email")
        return
      }

      // Debounce: skip if email was sent within the last 3 minutes
      if (pt.last_chat_email_at) {
        const lastSent = new Date(pt.last_chat_email_at).getTime()
        if (Date.now() - lastSent < 3 * 60 * 1000) {
          console.log("[chat-email] Skipped: debounce (last sent", pt.last_chat_email_at, ")")
          return
        }
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wwwpraxis-os.com"
      const praxisName = process.env.EMAIL_FROM_NAME || "Physiotherapie Glawe"
      const patientName = [pt.vorname, pt.nachname].filter(Boolean).join(" ") || "Patient"

      console.log("[chat-email] Sending to", pt.email)
      const result = await sendEmail({
        to: pt.email,
        subject: "Neue Mitteilung in Ihrer App",
        html: chatNotificationEmail({ patientName, praxisName, appUrl }),
      })

      // Only update timestamp after successful send
      if (result.success) {
        console.log("[chat-email] Sent successfully to", pt.email)
        await service
          .from("patients")
          .update({ last_chat_email_at: new Date().toISOString() })
          .eq("id", patientId)
      } else {
        console.error("[chat-email] Send failed:", result.error)
      }
    } catch (err) {
      console.error("[chat-email] Error:", err)
    }
  })()

  return NextResponse.json({ message }, { status: 201 })
}
