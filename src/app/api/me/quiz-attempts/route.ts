/**
 * PROJ-17: POST /api/me/quiz-attempts
 * Patient submits quiz answers. Calculates score, stores attempt.
 * One attempt per patient per module (enforced by UNIQUE constraint).
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const answerSchema = z.object({
  question_id: z.string().uuid(),
  selected_index: z.number().int().min(0).max(3),
})

const bodySchema = z.object({
  module_id: z.string().uuid(),
  answers: z.array(answerSchema).length(3),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find the patient record
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
    return NextResponse.json({ error: "Kein Patient-Profil gefunden." }, { status: 404 })
  }

  // Parse body
  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? (err as z.ZodError).issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { module_id, answers } = body

  // Verify module exists and is freigegeben
  const { data: module } = await supabase
    .from("education_modules")
    .select("id, status")
    .eq("id", module_id)
    .eq("status", "freigegeben")
    .maybeSingle()

  if (!module) {
    return NextResponse.json({ error: "Modul nicht gefunden oder nicht freigegeben." }, { status: 404 })
  }

  // Check if attempt already exists
  const { data: existingAttempt } = await supabase
    .from("quiz_attempts")
    .select("id, score")
    .eq("patient_id", patient.id)
    .eq("module_id", module_id)
    .maybeSingle()

  if (existingAttempt) {
    return NextResponse.json({
      error: "Quiz bereits abgeschlossen.",
      attempt: existingAttempt,
    }, { status: 409 })
  }

  // Fetch correct answers from quizzes
  const questionIds = answers.map((a) => a.question_id)
  const { data: quizzes } = await supabase
    .from("education_quizzes")
    .select("id, correct_index, explanation")
    .in("id", questionIds)

  if (!quizzes || quizzes.length !== 3) {
    return NextResponse.json({ error: "Quiz-Fragen nicht gefunden." }, { status: 400 })
  }

  const correctMap: Record<string, { correct_index: number; explanation: string | null }> = {}
  for (const q of quizzes) {
    correctMap[q.id] = { correct_index: q.correct_index, explanation: q.explanation }
  }

  // Calculate score and build result
  let score = 0
  const results = answers.map((a) => {
    const correct = correctMap[a.question_id]
    const isCorrect = correct ? a.selected_index === correct.correct_index : false
    if (isCorrect) score++
    return {
      question_id: a.question_id,
      selected_index: a.selected_index,
      is_correct: isCorrect,
      correct_index: correct?.correct_index ?? null,
      explanation: correct?.explanation ?? null,
    }
  })

  // Insert attempt
  const { data: attempt, error: insertErr } = await supabase
    .from("quiz_attempts")
    .insert({
      patient_id: patient.id,
      module_id,
      answers: results.map((r) => ({
        question_id: r.question_id,
        selected_index: r.selected_index,
        is_correct: r.is_correct,
      })),
      score,
    })
    .select("id, module_id, score, completed_at")
    .single()

  if (insertErr) {
    console.error("[POST /api/me/quiz-attempts] Insert error:", insertErr)
    return NextResponse.json({ error: "Quiz-Ergebnis konnte nicht gespeichert werden." }, { status: 500 })
  }

  return NextResponse.json({
    attempt,
    results,
    score,
    total: 3,
  })
}
