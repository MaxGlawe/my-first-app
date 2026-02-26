/**
 * GET /api/me/chat/unread — Patient: ungelesene Nachrichten zählen
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

  // Resolve patient record
  let { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient && user.email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  if (!patient) {
    return NextResponse.json({ unread: 0 })
  }

  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patient.id)
    .neq("sender_id", user.id)
    .is("read_at", null)

  return NextResponse.json({ unread: count ?? 0 })
}
