/**
 * GET /api/bgf/my-membership
 * Returns the current user's BGF membership status.
 * Uses service client to bypass RLS.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ isMember: false }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  const { data: member } = await sc
    .from("organization_members")
    .select("organization_id, status, ist_analyse_abgeschlossen")
    .eq("user_id", user.id)
    .in("status", ["aktiv", "eingeladen"])
    .limit(1)
    .maybeSingle()

  if (!member) {
    return NextResponse.json({ isMember: false })
  }

  // Fetch org tier for feature gating
  const { data: org } = await sc
    .from("organizations")
    .select("vertrag_tier")
    .eq("id", member.organization_id)
    .single()

  return NextResponse.json({
    isMember: true,
    organizationId: member.organization_id,
    istAnalyseAbgeschlossen: member.ist_analyse_abgeschlossen ?? false,
    memberStatus: member.status,
    vertragTier: org?.vertrag_tier ?? null,
  })
}
