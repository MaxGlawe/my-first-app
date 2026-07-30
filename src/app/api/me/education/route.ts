/**
 * PROJ-17: GET /api/me/education
 * Returns all released education lessons for the current patient,
 * grouped by hauptproblem as curriculum progress.
 * Includes quiz completion status per lesson.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find the patient record (user_id bridge, with email fallback)
  let { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient && user.email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  if (!patient) {
    return NextResponse.json({ modules: [], curricula: [] })
  }

  // Get unique hauptprobleme from education_enrollments (decoupled from assignments).
  // Enrollments persist independently — modifying assignments does NOT remove education access.
  // Fallback: also check patient_assignments for backwards compatibility (pre-enrollment data).
  const { data: enrollments } = await supabase
    .from("education_enrollments")
    .select("hauptproblem")
    .eq("patient_id", patient.id)
    .in("status", ["aktiv", "abgeschlossen"])

  const { data: assignments } = await supabase
    .from("patient_assignments")
    .select("hauptproblem")
    .eq("patient_id", patient.id)
    .not("hauptproblem", "is", null)

  const hauptprobleme = [...new Set([
    ...(enrollments ?? []).map((e) => e.hauptproblem),
    ...(assignments ?? []).map((a) => a.hauptproblem as string).filter(Boolean),
  ])]

  if (hauptprobleme.length === 0) {
    return NextResponse.json({ modules: [], curricula: [] })
  }

  // Fetch ALL released lessons for these hauptprobleme (all lesson_numbers)
  const { data: modules, error: fetchErr } = await supabase
    .from("education_modules")
    .select(`
      id, hauptproblem, title, lesson_content, status,
      lesson_number, total_lessons, curriculum,
      created_at, updated_at,
      education_quizzes (id, module_id, question_number, question_text, options, correct_index, explanation)
    `)
    .in("hauptproblem", hauptprobleme)
    .eq("status", "freigegeben")
    .order("lesson_number", { ascending: true })

  if (fetchErr) {
    console.error("[GET /api/me/education] Supabase error:", fetchErr)
    return NextResponse.json({ error: "Module konnten nicht geladen werden." }, { status: 500 })
  }

  if (!modules || modules.length === 0) {
    return NextResponse.json({ modules: [], curricula: [] })
  }

  // ── Freischaltung: eine Lektion vor jedem Training ────────────────────
  //
  // Regel: Lektion N wird gelesen, BEVOR das N-te Training stattfindet.
  // Freigeschaltet sind daher (abgeschlossene Trainings + 1) Lektionen.
  // Damit koppelt Wissen an Handeln — 10 Lektionen brauchen 10 Trainings.
  const { count: trainingsAbgeschlossen } = await supabase
    .from("assignment_completions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patient.id)

  const freigeschalteteLektionen = (trainingsAbgeschlossen ?? 0) + 1

  // Get quiz attempts for this patient
  const moduleIds = modules.map((m) => m.id)
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("module_id, score")
    .eq("patient_id", patient.id)
    .in("module_id", moduleIds)

  const attemptMap: Record<string, number> = {}
  for (const a of attempts ?? []) {
    attemptMap[a.module_id] = a.score
  }

  // Enrich modules with quiz status
  const enrichedModules = modules.map((m) => ({
    id: m.id,
    hauptproblem: m.hauptproblem,
    title: m.title,
    lesson_content: m.lesson_content,
    status: m.status,
    lesson_number: m.lesson_number,
    total_lessons: m.total_lessons,
    curriculum: m.curriculum,
    created_at: m.created_at,
    updated_at: m.updated_at,
    quizzes: m.education_quizzes ?? [],
    quiz_completed: m.id in attemptMap,
    quiz_score: attemptMap[m.id] ?? null,
    /** Lektion darf gelesen werden (Kopplung ans Training) */
    unlocked: m.lesson_number <= freigeschalteteLektionen,
    /** Anzahl Trainings, die für diese Lektion noch fehlen */
    trainings_bis_freischaltung: Math.max(0, m.lesson_number - freigeschalteteLektionen),
  }))

  // Group by hauptproblem for curriculum progress view
  const curricula: Array<{
    hauptproblem: string
    total_lessons: number
    completed_lessons: number
    curriculum: Array<{ number: number; topic: string }>
    lessons: typeof enrichedModules
    unlocked_lessons: number
    trainings_completed: number
    next_open_lesson: { id: string; lesson_number: number; title: string } | null
  }> = []

  for (const hp of hauptprobleme) {
    const lessons = enrichedModules.filter((m) => m.hauptproblem === hp)
    if (lessons.length === 0) continue

    // Get curriculum from master lesson (lesson_number=1)
    const master = lessons.find((l) => l.lesson_number === 1)
    const curriculum = (master?.curriculum as Array<{ number: number; topic: string }>) ?? []
    const totalLessons = master?.total_lessons ?? lessons.length
    const completedLessons = lessons.filter((l) => l.quiz_completed).length
    // Nächste offene, freigeschaltete Lektion — die vor dem nächsten Training
    // gelesen werden soll.
    const naechsteOffene = lessons.find((l) => l.unlocked && !l.quiz_completed) ?? null

    curricula.push({
      hauptproblem: hp,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      curriculum,
      lessons,
      unlocked_lessons: freigeschalteteLektionen,
      trainings_completed: trainingsAbgeschlossen ?? 0,
      next_open_lesson: naechsteOffene
        ? {
            id: naechsteOffene.id,
            lesson_number: naechsteOffene.lesson_number,
            title: naechsteOffene.title,
          }
        : null,
    })
  }

  return NextResponse.json({ modules: enrichedModules, curricula })
}
