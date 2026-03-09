/**
 * Validate a promo code (check if valid, return type + value)
 * GET /api/admin/promo-codes/validate?code=WILLKOMMEN
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role === "patient") {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 })
  }

  const code = request.nextUrl.searchParams.get("code")?.toUpperCase().trim()
  if (!code) {
    return NextResponse.json({ error: "Kein Code angegeben." }, { status: 400 })
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: promo } = await serviceClient
    .from("promo_codes")
    .select("id, code, type, value, max_redemptions, current_redemptions, valid_until, is_active")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (!promo) {
    return NextResponse.json({ valid: false, error: "Code nicht gefunden." })
  }

  if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
    return NextResponse.json({ valid: false, error: "Code abgelaufen." })
  }

  if (promo.max_redemptions && promo.current_redemptions >= promo.max_redemptions) {
    return NextResponse.json({ valid: false, error: "Code bereits ausgeschöpft." })
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
  })
}
