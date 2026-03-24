/**
 * PROJ-18: GET /api/bgf/team-puls?organization_id=...
 * Returns anonymous team engagement stats for the current week.
 * No individual data exposed — only aggregates.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { requireTierAccess } from "@/lib/bgf-tier-guard"
import { BgfFeature } from "@/lib/bgf-tiers"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const orgId = new URL(request.url).searchParams.get("organization_id")
  if (!orgId) {
    return NextResponse.json({ error: "organization_id fehlt." }, { status: 400 })
  }

  // Tier-Check: Team-Puls requires Pro+
  const access = await requireTierAccess(orgId, BgfFeature.TEAM_PULS)
  if (!access.allowed) return access.response

  const sc = createSupabaseServiceClient()

  // Get total active members in org
  const { data: members, error: membersError } = await sc
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId)
    .eq("status", "aktiv")

  if (membersError || !members) {
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  const totalMembers = members.length
  if (totalMembers === 0) {
    return NextResponse.json({
      active_percent: 0,
      total_members: 0,
      active_members: 0,
      sessions_this_week: 0,
    })
  }

  // Calculate Monday of this week
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const mondayStr = monday.toISOString().split("T")[0]

  // Get this week's completed sessions for all org members
  const memberUserIds = members.map((m) => m.user_id).filter(Boolean) as string[]

  const { data: sessions } = await sc
    .from("pausen_fit_sessions")
    .select("user_id")
    .eq("organization_id", orgId)
    .in("user_id", memberUserIds)
    .eq("status", "abgeschlossen")
    .gte("geplant_um", `${mondayStr}T00:00:00`)

  const sessionsThisWeek = sessions?.length ?? 0

  // Count unique active users (completed at least 1 session this week)
  const activeUserIds = new Set((sessions ?? []).map((s) => s.user_id))
  const activeMembers = activeUserIds.size

  const activePercent = Math.round((activeMembers / totalMembers) * 100)

  return NextResponse.json({
    active_percent: activePercent,
    total_members: totalMembers,
    active_members: activeMembers,
    sessions_this_week: sessionsThisWeek,
  })
}
