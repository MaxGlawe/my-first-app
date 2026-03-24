/**
 * PROJ-18: PATCH/DELETE /api/bgf/services/[id]
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()
  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updated_at: new Date().toISOString() }
  if (typeof body.name === "string") update.name = body.name
  if (typeof body.beschreibung === "string") update.beschreibung = body.beschreibung
  if (typeof body.dauer_minuten === "number") update.dauer_minuten = body.dauer_minuten
  if (typeof body.preis === "number") update.preis = body.preis
  if (typeof body.art === "string") update.art = body.art
  if (typeof body.kategorie === "string") update.kategorie = body.kategorie
  if (typeof body.aktiv === "boolean") update.aktiv = body.aktiv

  const { data, error } = await sc.from("bgf_services").update(update).eq("id", id).select("*").single()
  if (error) return NextResponse.json({ error: "Fehler." }, { status: 500 })

  return NextResponse.json({ service: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()
  const { error } = await sc.from("bgf_services").delete().eq("id", id)
  if (error) return NextResponse.json({ error: "Fehler." }, { status: 500 })

  return NextResponse.json({ message: "Gelöscht." })
}
