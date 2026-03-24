/**
 * PROJ-18: GET /api/bgf/organizations/[id]/invoices
 * Returns invoices for an organization (HR read-only access).
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()

  // Verify HR admin access
  const { data: orgAdmin } = await sc
    .from("organization_admins")
    .select("id")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle()

  // Also allow praxis admins/therapists
  const { data: profile } = await sc.from("user_profiles").select("role").eq("id", user.id).single()
  const isStaff = profile && ["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)

  if (!orgAdmin && !isStaff) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data, error } = await sc
    .from("bgf_invoices")
    .select("id, invoice_number, zeitraum_monat, zeitraum_jahr, gesamtbetrag, status, invoice_date, due_date, paid_at, sent_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  return NextResponse.json({ invoices: data ?? [] })
}
