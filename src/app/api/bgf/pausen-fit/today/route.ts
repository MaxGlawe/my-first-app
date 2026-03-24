/**
 * PROJ-18: GET /api/bgf/pausen-fit/today
 * Returns today's Pausen-Fit sessions for the current user.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await sc
    .from("pausen_fit_sessions")
    .select("*")
    .eq("user_id", user.id)
    .gte("geplant_um", `${today}T00:00:00`)
    .lte("geplant_um", `${today}T23:59:59`)
    .order("geplant_um", { ascending: true })
    .limit(10)

  if (error) {
    console.error("[GET /api/bgf/pausen-fit/today] error:", error)
    return NextResponse.json(
      { error: "Sessions konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  const completed = (data ?? []).filter((s) => s.status === "abgeschlossen").length
  const total = data?.length ?? 0

  return NextResponse.json({
    sessions: data ?? [],
    summary: { total, completed, remaining: total - completed },
  })
}
