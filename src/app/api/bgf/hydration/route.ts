/**
 * PROJ-18: PATCH /api/bgf/hydration
 * Increment or decrement today's water glass count.
 *
 * Body: { action: "add" | "remove" }
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: { action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const action = body.action
  if (action !== "add" && action !== "remove") {
    return NextResponse.json({ error: "action muss 'add' oder 'remove' sein." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()
  const today = new Date().toISOString().split("T")[0]

  // Get today's check-in
  const { data: checkin } = await sc
    .from("bgf_daily_checkins")
    .select("id, wasser_glaeser")
    .eq("user_id", user.id)
    .eq("datum", today)
    .maybeSingle()

  if (!checkin) {
    return NextResponse.json(
      { error: "Bitte zuerst den täglichen Check-In machen." },
      { status: 400 }
    )
  }

  const newCount = action === "add"
    ? Math.min((checkin.wasser_glaeser ?? 0) + 1, 20)
    : Math.max((checkin.wasser_glaeser ?? 0) - 1, 0)

  const { data: updated, error: updateError } = await sc
    .from("bgf_daily_checkins")
    .update({ wasser_glaeser: newCount })
    .eq("id", checkin.id)
    .select("id, wasser_glaeser")
    .single()

  if (updateError) {
    console.error("[PATCH /api/bgf/hydration] error:", updateError)
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 })
  }

  return NextResponse.json({ wasser_glaeser: updated.wasser_glaeser })
}
