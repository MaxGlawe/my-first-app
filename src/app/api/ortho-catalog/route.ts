/**
 * PROJ-15: Ortho Test Catalog
 * GET /api/ortho-catalog — All orthopedic special tests, optionally filtered by region
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")

  let query = supabase
    .from("ortho_test_catalog")
    .select("id, region, kategorie, test_name, beschreibung, positiver_befund, klinische_relevanz, sort_order")
    .order("sort_order", { ascending: true })

  if (region) {
    query = query.eq("region", region)
  }

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/ortho-catalog] Error:", error)
    return NextResponse.json({ error: "Katalog konnte nicht geladen werden." }, { status: 500 })
  }

  return NextResponse.json({ tests: data ?? [] })
}
