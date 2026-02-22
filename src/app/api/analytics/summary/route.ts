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

  // Check admin role via service client
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()

  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Fetch last 30 days of events
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: events } = await serviceClient
    .from("usage_events")
    .select("event_type, created_at, user_id")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })

  if (!events) {
    return NextResponse.json({ events_by_type: {}, events_by_day: {}, active_users: 0, total_events: 0 })
  }

  // Aggregate by event type
  const eventsByType: Record<string, number> = {}
  const eventsByDay: Record<string, number> = {}
  const uniqueUsers = new Set<string>()

  for (const e of events) {
    // By type
    eventsByType[e.event_type] = (eventsByType[e.event_type] ?? 0) + 1

    // By day
    const day = e.created_at.split("T")[0]
    eventsByDay[day] = (eventsByDay[day] ?? 0) + 1

    // Unique users
    if (e.user_id) uniqueUsers.add(e.user_id)
  }

  // Today's events
  const today = new Date().toISOString().split("T")[0]
  const todayCount = eventsByDay[today] ?? 0

  // Yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().split("T")[0]
  const yesterdayCount = eventsByDay[yesterdayKey] ?? 0

  return NextResponse.json({
    events_by_type: eventsByType,
    events_by_day: eventsByDay,
    active_users: uniqueUsers.size,
    total_events: events.length,
    today_events: todayCount,
    yesterday_events: yesterdayCount,
  })
}
