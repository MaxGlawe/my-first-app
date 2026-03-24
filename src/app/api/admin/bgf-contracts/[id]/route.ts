/**
 * PROJ-18: GET/PATCH /api/admin/bgf-contracts/[id]
 * Single BGF contract operations.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return null
  }

  return { user, sc }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { data, error } = await auth.sc
    .from("bgf_contracts")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({ contract: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // Only allow updating specific fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (typeof body.praxis_signature_png === "string" && body.praxis_signature_png.length > 50) {
    updateData.praxis_signature_png = body.praxis_signature_png
  }
  if (typeof body.notes === "string") {
    updateData.notes = body.notes.trim()
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 })
  }

  updateData.updated_at = new Date().toISOString()

  const { data, error } = await auth.sc
    .from("bgf_contracts")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("[PATCH /api/admin/bgf-contracts/[id]] error:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 })
  }

  return NextResponse.json({ contract: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  // Only drafts can be deleted
  const { data: contract } = await auth.sc
    .from("bgf_contracts")
    .select("id, status")
    .eq("id", id)
    .single()

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  if (contract.status === "unterschrieben") {
    return NextResponse.json(
      { error: "Unterschriebene Verträge können nicht gelöscht werden." },
      { status: 400 }
    )
  }

  const { error } = await auth.sc
    .from("bgf_contracts")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[DELETE /api/admin/bgf-contracts/[id]] error:", error)
    return NextResponse.json({ error: "Fehler beim Löschen." }, { status: 500 })
  }

  return NextResponse.json({ message: "Entwurf gelöscht." })
}
