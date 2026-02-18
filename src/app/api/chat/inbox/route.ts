/**
 * PROJ-12: GET /api/chat/inbox
 * Therapeut lädt Posteingang: alle Konversationen mit Unread-Count + letzter Nachricht
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

  // Get all patients assigned to this therapist
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

  // Fetch last message + unread count per patient in one query
  // We use a subquery approach via multiple selects
  const conversations = await Promise.all(
    patientIds.map(async (patientId) => {
      const patient = patients.find((p) => p.id === patientId)!

      // Last message
      const { data: lastMsgData } = await supabase
        .from("chat_messages")
        .select("content, media_type, created_at")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // Unread count (messages sent by patient = not the therapist, and unread)
      const { count: unreadCount } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patientId)
        .neq("sender_id", user.id)
        .is("read_at", null)

      const lastMessage = lastMsgData
        ? lastMsgData.content ?? (lastMsgData.media_type === "image" ? "📷 Bild" : null)
        : null

      return {
        patient_id: patientId,
        patient_name: `${patient.vorname} ${patient.nachname}`,
        patient_avatar: patient.avatar_url ?? null,
        last_message: lastMessage,
        last_message_at: lastMsgData?.created_at ?? null,
        unread_count: unreadCount ?? 0,
      }
    })
  )

  // Sort by last_message_at descending (most recent first), then by patient_name
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
