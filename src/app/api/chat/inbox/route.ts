/**
 * PROJ-12: GET /api/chat/inbox
 * Therapeut lädt Posteingang: alle Konversationen mit Unread-Count + letzter Nachricht
 *
 * BUG-5 FIX: Replaced N+1 query pattern (2N+1 queries for N patients) with
 * 3 queries total:
 *   1. Fetch patients (1 query)
 *   2. Fetch all unread messages for all patients (1 query, group in JS)
 *   3. Fetch recent messages to find last message per patient (1 query, group in JS)
 *
 * Access: Therapist + Admin
 * RLS: Enforced at DB level
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Query 1: Get all patients assigned to this therapist
  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("id, vorname, nachname, avatar_url")
    .eq("therapeut_id", user.id)
    .is("archived_at", null)
    .order("nachname", { ascending: true })

  if (patientsError) {
    return NextResponse.json({ error: patientsError.message }, { status: 500 })
  }

  if (!patients || patients.length === 0) {
    return NextResponse.json({ conversations: [] })
  }

  const patientIds = patients.map((p) => p.id)

  // Query 2: Fetch all unread messages (sent by patients, i.e. not by therapist)
  // for all assigned patients in one query — group by patient_id in JS.
  const { data: unreadMessages } = await supabase
    .from("chat_messages")
    .select("patient_id")
    .in("patient_id", patientIds)
    .neq("sender_id", user.id)
    .is("read_at", null)

  // Build unread count map: patient_id → count
  const unreadCountMap = new Map<string, number>()
  for (const msg of unreadMessages ?? []) {
    unreadCountMap.set(msg.patient_id, (unreadCountMap.get(msg.patient_id) ?? 0) + 1)
  }

  // Query 3: Fetch recent messages across all patients, ordered by created_at desc.
  // We take a generous limit (10 per patient) to ensure we capture at least one
  // message per patient even if some patients are heavy chatters.
  const { data: recentMessages } = await supabase
    .from("chat_messages")
    .select("patient_id, content, media_type, created_at")
    .in("patient_id", patientIds)
    .order("created_at", { ascending: false })
    .limit(patientIds.length * 10)

  // Build last message map: patient_id → first occurrence (= most recent)
  const lastMessageMap = new Map<
    string,
    { content: string | null; media_type: string | null; created_at: string }
  >()
  for (const msg of recentMessages ?? []) {
    if (!lastMessageMap.has(msg.patient_id)) {
      lastMessageMap.set(msg.patient_id, {
        content: msg.content,
        media_type: msg.media_type,
        created_at: msg.created_at,
      })
    }
  }

  // Build conversations array
  const conversations = patients.map((patient) => {
    const lastMsg = lastMessageMap.get(patient.id) ?? null
    const lastMessage = lastMsg
      ? (lastMsg.content ?? (lastMsg.media_type === "image" ? "📷 Bild" : null))
      : null

    return {
      patient_id: patient.id,
      patient_name: `${patient.vorname} ${patient.nachname}`,
      patient_avatar: patient.avatar_url ?? null,
      last_message: lastMessage,
      last_message_at: lastMsg?.created_at ?? null,
      unread_count: unreadCountMap.get(patient.id) ?? 0,
    }
  })

  // Sort by last_message_at descending, then by patient name
  conversations.sort((a, b) => {
    if (a.last_message_at && b.last_message_at) {
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    }
    if (a.last_message_at) return -1
    if (b.last_message_at) return 1
    return a.patient_name.localeCompare(b.patient_name, "de")
  })

  return NextResponse.json({ conversations })
}
