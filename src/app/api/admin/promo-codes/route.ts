/**
 * Admin Promo Codes API
 *
 * GET:  List all promo codes
 * POST: Create new promo code
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const createSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(30)
    .transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  description: z.string().max(500).optional(),
  type: z.enum(["free_months", "percent_off", "amount_off"]),
  value: z.number().positive(),
  max_redemptions: z.number().int().positive().optional(),
  valid_until: z.string().datetime().optional(),
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins." }, { status: 403 })
  }

  const { data, error } = await serviceClient
    .from("promo_codes")
    .select(`
      id,
      code,
      type,
      value,
      is_active,
      max_redemptions,
      current_redemptions,
      valid_until,
      created_at,
      promo_code_redemptions(
        id,
        redeemed_at,
        patient_id,
        patients(vorname, nachname)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[GET /api/admin/promo-codes]", error)
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
    return NextResponse.json({ error: "Nur Admins können Promo-Codes erstellen." }, { status: 403 })
  }

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  // Check code uniqueness
  const { data: existing } = await serviceClient
    .from("promo_codes")
    .select("id")
    .eq("code", body.code)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Dieser Code existiert bereits." }, { status: 409 })
  }

  const { data, error } = await serviceClient
    .from("promo_codes")
    .insert({
      code: body.code,
      description: body.description ?? null,
      type: body.type,
      value: body.value,
      max_redemptions: body.max_redemptions ?? null,
      valid_until: body.valid_until ?? null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[POST /api/admin/promo-codes]", error)
    return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
