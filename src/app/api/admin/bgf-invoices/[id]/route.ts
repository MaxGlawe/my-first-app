/**
 * PROJ-18: GET/PATCH /api/admin/bgf-invoices/[id]
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) return null
  return { user, sc }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { data, error } = await auth.sc.from("bgf_invoices").select("*").eq("id", id).single()
  if (error || !data) return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })

  return NextResponse.json({ invoice: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updated_at: new Date().toISOString() }

  // Mark as paid
  if (body.status === "bezahlt") {
    update.status = "bezahlt"
    update.paid_at = new Date().toISOString()
  }

  if (typeof body.notes === "string") {
    update.notes = body.notes.trim()
  }

  const { data, error } = await auth.sc
    .from("bgf_invoices").update(update).eq("id", id).select("*").single()

  if (error) {
    console.error("[PATCH /api/admin/bgf-invoices/[id]] error:", error)
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  return NextResponse.json({ invoice: data })
}
