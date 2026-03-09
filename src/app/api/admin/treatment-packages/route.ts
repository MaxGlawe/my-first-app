/**
 * Admin Treatment Packages API (frei konfigurierbar)
 *
 * GET:  List all packages
 * POST: Create new package
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  total_price: z.number().positive(),
  gebuh_items: z.array(
    z.object({
      ziffer: z.string(),
      analog: z.boolean().optional().default(false),
      beschreibung: z.string(),
      einzelpreis: z.number(),
    })
  ),
  sitzungen: z.number().int().positive().optional(),
  dauer_wochen: z.number().int().positive().optional(),
  max_installments: z.number().int().min(1).max(12).default(1),
})

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data, error } = await serviceClient
    .from("treatment_packages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins können Pakete erstellen." }, { status: 403 })
  }

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const { data, error } = await serviceClient
    .from("treatment_packages")
    .insert({
      name: body.name,
      description: body.description ?? null,
      total_price: body.total_price,
      gebuh_items: body.gebuh_items,
      sitzungen: body.sitzungen ?? null,
      dauer_wochen: body.dauer_wochen ?? null,
      max_installments: body.max_installments,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[POST /api/admin/treatment-packages]", error)
    return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
