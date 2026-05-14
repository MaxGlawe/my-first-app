/**
 * GET   /api/me/hydration — Returns today's count, goal, and last 7 days history
 * PATCH /api/me/hydration — Body { action: "add" | "remove" } — increment/decrement today
 *
 * The Berlin-local date is used for all "today" comparisons so a tap at 23:30
 * CET counts toward today, not tomorrow.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const MAX_GLASSES = 20

function todayBerlin(): string {
  // ISO yyyy-MM-dd in Europe/Berlin (handles DST automatically)
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date())
}

async function getPatientForUser(): Promise<{ id: string; goal: number } | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Patient may be linked by user_id (registered) or only by email (invited).
  // RLS protects the data; we still resolve to the canonical row here.
  const sc = createSupabaseServiceClient()
  const { data: byUser } = await sc
    .from("patients")
    .select("id, hydration_goal_glasses")
    .eq("user_id", user.id)
    .maybeSingle()
  if (byUser) {
    return { id: byUser.id, goal: byUser.hydration_goal_glasses ?? 8 }
  }

  if (user.email) {
    const { data: byEmail } = await sc
      .from("patients")
      .select("id, hydration_goal_glasses")
      .eq("email", user.email)
      .maybeSingle()
    if (byEmail) return { id: byEmail.id, goal: byEmail.hydration_goal_glasses ?? 8 }
  }

  return null
}

export async function GET() {
  const patient = await getPatientForUser()
  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  const sc = createSupabaseServiceClient()
  const today = todayBerlin()

  // Today's row (may not exist yet)
  const { data: todayRow } = await sc
    .from("patient_hydration_daily")
    .select("glasses_count, goal_glasses")
    .eq("patient_id", patient.id)
    .eq("entry_date", today)
    .maybeSingle()

  // Last 7 days history (excluding today) for the dashboard sparkline / streak math
  const { data: history } = await sc
    .from("patient_hydration_daily")
    .select("entry_date, glasses_count, goal_glasses")
    .eq("patient_id", patient.id)
    .order("entry_date", { ascending: false })
    .limit(8)

  return NextResponse.json({
    today,
    glasses: todayRow?.glasses_count ?? 0,
    goal: todayRow?.goal_glasses ?? patient.goal,
    history: history ?? [],
  })
}

export async function PATCH(request: NextRequest) {
  const patient = await getPatientForUser()
  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  let body: { action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  if (body.action !== "add" && body.action !== "remove") {
    return NextResponse.json({ error: "action muss 'add' oder 'remove' sein." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()
  const today = todayBerlin()

  const { data: existing } = await sc
    .from("patient_hydration_daily")
    .select("id, glasses_count, goal_glasses")
    .eq("patient_id", patient.id)
    .eq("entry_date", today)
    .maybeSingle()

  if (!existing) {
    // First glass of the day → insert row
    if (body.action === "remove") {
      return NextResponse.json({ glasses: 0, goal: patient.goal })
    }
    const { data: inserted, error } = await sc
      .from("patient_hydration_daily")
      .insert({
        patient_id: patient.id,
        entry_date: today,
        glasses_count: 1,
        goal_glasses: patient.goal,
      })
      .select("glasses_count, goal_glasses")
      .single()
    if (error) {
      console.error("[PATCH /api/me/hydration] insert failed:", error)
      return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 })
    }
    return NextResponse.json({ glasses: inserted.glasses_count, goal: inserted.goal_glasses })
  }

  // Update existing row
  const newCount =
    body.action === "add"
      ? Math.min(existing.glasses_count + 1, MAX_GLASSES)
      : Math.max(existing.glasses_count - 1, 0)

  const { data: updated, error } = await sc
    .from("patient_hydration_daily")
    .update({ glasses_count: newCount, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select("glasses_count, goal_glasses")
    .single()

  if (error) {
    console.error("[PATCH /api/me/hydration] update failed:", error)
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ glasses: updated.glasses_count, goal: updated.goal_glasses })
}
