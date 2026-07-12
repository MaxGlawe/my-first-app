/**
 * PROJ-12: GET /api/me/chat  — Patient lädt seine Nachrichten
 *          POST /api/me/chat — Patient sendet eine Nachricht
 *
 * Cursor-Pagination: ?cursor=<created_at ISO string> lädt ältere Nachrichten
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { canUseChat } from "@/lib/app-access"

const PAGE_SIZE = 50

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Resolve patient record
  const patient = await resolvePatient(supabase, user.id, user.email ?? undefined)
  if (!patient) {
    return NextResponse.json({ error: "Patientenprofil nicht gefunden." }, { status: 404 })
  }

  const cursor = req.nextUrl.searchParams.get("cursor")

  let query = supabase
    .from("chat_messages")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1) // fetch one extra to detect if there are older messages

  if (cursor) {
    query = query.lt("created_at", cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/me/chat] Error:", error)
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

export async function POST(req: NextRequest) {
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

  const patient = await resolvePatient(supabase, user.id, user.email ?? undefined)
  if (!patient) {
    return NextResponse.json({ error: "Patientenprofil nicht gefunden." }, { status: 404 })
  }

  // Masterclass-Begleitung: nach Ablauf der 92 Tage schließt der Chat. Der
  // Verlauf bleibt lesbar (GET oben ist bewusst ungegatet) — nur neue Nachrichten
  // sind nicht mehr möglich. Serverseitig geprüft, nicht nur im UI.
  const chatAccess = await canUseChat(createSupabaseServiceClient(), user.id, patient.id)
  if (!chatAccess.allowed) {
    return NextResponse.json(
      {
        error:
          "Deine 3-monatige Begleitung ist beendet. Du kannst deinen bisherigen Verlauf weiterhin lesen.",
        reason: chatAccess.reason,
      },
      { status: 403 }
    )
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
      patient_id: patient.id,
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
    console.error("[POST /api/me/chat] Error:", insertError)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten." }, { status: 500 })
  }

  return NextResponse.json({ message }, { status: 201 })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolvePatient(supabase: any, userId: string, email?: string) {
  let { data: patient } = await supabase
    .from("patients")
    .select("id, therapeut_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (!patient && email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id, therapeut_id")
      .eq("email", email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  return patient
}
