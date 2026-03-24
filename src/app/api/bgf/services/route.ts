/**
 * PROJ-18: BGF Services Catalog
 * GET  /api/bgf/services — List services (public for HR, full for therapists)
 * POST /api/bgf/services — Create service (therapists only)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(2).max(200),
  beschreibung: z.string().max(2000).optional(),
  dauer_minuten: z.number().int().min(15).max(480),
  preis: z.number().min(0),
  art: z.enum(["vor_ort", "video", "beides"]),
  kategorie: z.enum(["beratung", "workshop", "analyse", "training"]),
})

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()

  // Check role — therapists see all, HR sees only active
  const { data: profile } = await sc.from("user_profiles").select("role").eq("id", user.id).single()
  const isStaff = profile && ["admin", "heilpraktiker", "physiotherapeut", "praeventionstrainer", "personal_trainer"].includes(profile.role)

  let query = sc.from("bgf_services").select("*").order("created_at", { ascending: false })
  if (!isStaff) query = query.eq("aktiv", true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: "Fehler." }, { status: 500 })

  return NextResponse.json({ services: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors }, { status: 422 })
  }

  const { data: service, error } = await sc
    .from("bgf_services")
    .insert({ ...parseResult.data, created_by: user.id })
    .select("*")
    .single()

  if (error) {
    console.error("[POST /api/bgf/services] error:", error)
    return NextResponse.json({ error: "Konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({ service }, { status: 201 })
}
