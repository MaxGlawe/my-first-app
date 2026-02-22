import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data, error } = await serviceClient
    .from("gebueh_catalog")
    .select("*")
    .eq("aktiv", true)
    .order("sort_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden des GebüH-Katalogs." }, { status: 500 })
  }

  return NextResponse.json({ data })
}
