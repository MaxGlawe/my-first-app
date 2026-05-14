/**
 * GET /api/me/paths
 *
 * Returns all active learning paths + the current patient's enrollment status.
 * Used by the path-overview screen so the user sees:
 *   - which path they're currently working on (and on which day)
 *   - which paths they've completed (with badge)
 *   - which paths they haven't started yet
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

async function getPatientId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const sc = createSupabaseServiceClient()
  const { data: byUser } = await sc
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()
  if (byUser) return byUser.id

  if (user.email) {
    const { data: byEmail } = await sc
      .from("patients")
      .select("id")
      .eq("email", user.email)
      .maybeSingle()
    if (byEmail) return byEmail.id
  }

  return null
}

export async function GET() {
  const patientId = await getPatientId()
  if (!patientId) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  const sc = createSupabaseServiceClient()

  // All active paths (sorted by display order)
  const { data: paths, error: pathsErr } = await sc
    .from("learning_paths")
    .select("id, slug, name, subtitle, description, icon, color, duration_days, target_audience, sort_order, hero_image")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (pathsErr) {
    console.error("[GET /api/me/paths] paths error:", pathsErr)
    return NextResponse.json({ error: "Kurse konnten nicht geladen werden." }, { status: 500 })
  }

  // Patient's enrollments (all statuses, so we can show "completed" badges)
  const { data: enrollments } = await sc
    .from("patient_path_enrollments")
    .select("id, path_id, status, enrolled_at, completed_at")
    .eq("patient_id", patientId)
    .order("enrolled_at", { ascending: false })

  // Completed-days count per enrollment, fetched in one query and grouped client-side
  const enrollmentIds = (enrollments ?? []).map((e) => e.id)
  let progressByEnrollment: Record<string, number> = {}
  if (enrollmentIds.length > 0) {
    const { data: progressRows } = await sc
      .from("patient_path_progress")
      .select("enrollment_id")
      .in("enrollment_id", enrollmentIds)
    progressByEnrollment = (progressRows ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.enrollment_id] = (acc[row.enrollment_id] ?? 0) + 1
      return acc
    }, {})
  }

  // Stitch enrollment state onto each path
  const result = (paths ?? []).map((p) => {
    // Find the most recent enrollment for this path (active wins over completed wins over abandoned)
    const pathEnrollments = (enrollments ?? []).filter((e) => e.path_id === p.id)
    const active = pathEnrollments.find((e) => e.status === "active")
    const completed = pathEnrollments.find((e) => e.status === "completed")
    const current = active ?? completed ?? null

    const completedDays = current ? progressByEnrollment[current.id] ?? 0 : 0

    return {
      ...p,
      enrollment: current
        ? {
            id: current.id,
            status: current.status,
            enrolled_at: current.enrolled_at,
            completed_at: current.completed_at,
            current_day: Math.min(completedDays + 1, p.duration_days),
            completed_days: completedDays,
          }
        : null,
    }
  })

  return NextResponse.json({ paths: result })
}
