/**
 * PROJ-17: GET /api/patients/[id]/quiz-results
 * Therapist endpoint: Returns quiz attempts and scores for a specific patient.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: patientId } = await context.params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Check staff role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const staffRoles = ["admin", "heilpraktiker", "physiotherapeut", "praeventionstrainer", "personal_trainer"]
  if (!profile || !staffRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Fetch quiz attempts with module info
  const { data: attempts, error: fetchErr } = await supabase
    .from("quiz_attempts")
    .select(`
      id, module_id, answers, score, completed_at,
      education_modules (id, hauptproblem, title, status)
    `)
    .eq("patient_id", patientId)
    .order("completed_at", { ascending: false })

  if (fetchErr) {
    console.error("[GET /api/patients/[id]/quiz-results] Supabase error:", fetchErr)
    return NextResponse.json({ error: "Ergebnisse konnten nicht geladen werden." }, { status: 500 })
  }

  const results = (attempts ?? []).map((a) => ({
    id: a.id,
    module_id: a.module_id,
    score: a.score,
    total: 3,
    completed_at: a.completed_at,
    answers: a.answers,
    module: a.education_modules ?? null,
  }))

  return NextResponse.json({ results })
}
