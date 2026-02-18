/**
 * PROJ-7: Buchungstool-Integration
 * GET /api/admin/webhook-events
 *
 * Returns the last 50 webhook events for admin review.
 * This is an immutable audit log — no modification endpoints.
 *
 * Access: Admin only (checked server-side via user_profiles.role).
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
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

  // ---- Admin role check (server-side, not just RLS) ----
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
      { error: "Nur Administratoren können auf das Event-Log zugreifen." },
      { status: 403 }
    )
  }

  // ---- Fetch last 50 webhook events (most recent first) ----
  const { data: events, error: eventsError } = await supabase
    .from("webhook_events")
    .select("id, received_at, event_type, payload, processing_status, error_message")
    .order("received_at", { ascending: false })
    .limit(50)

  if (eventsError) {
    console.error("[GET /api/admin/webhook-events] Supabase error:", eventsError)
    return NextResponse.json(
      { error: "Event-Log konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ events: events ?? [] })
}
