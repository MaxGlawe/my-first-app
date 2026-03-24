/**
 * GET /api/bgf/hr-auth
 * Returns the current user's HR admin status.
 * Uses service client to bypass RLS.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ authorized: false }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  const { data: orgAdmin } = await sc
    .from("organization_admins")
    .select("organization_id, rolle")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!orgAdmin) {
    return NextResponse.json({ authorized: false })
  }

  const { data: org } = await sc
    .from("organizations")
    .select("name, vertrag_tier")
    .eq("id", orgAdmin.organization_id)
    .single()

  return NextResponse.json({
    authorized: true,
    organizationId: orgAdmin.organization_id,
    organizationName: org?.name ?? null,
    rolle: orgAdmin.rolle,
    vertragTier: org?.vertrag_tier ?? null,
  })
}
