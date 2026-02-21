/**
 * PROJ-17: POST /api/me/education/next-lesson
 * Returns the next unfinished lesson for a patient's hauptproblem.
 * If the lesson doesn't exist yet, generates it on-demand via Claude Haiku.
 *
 * Flow:
 * 1. Find patient's hauptproblem from their assignment
 * 2. Find all completed quiz_attempts for this hauptproblem
 * 3. Determine next lesson number
 * 4. If lesson row exists → return it
 * 5. If not → generate from curriculum → insert → return
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import Anthropic from "@anthropic-ai/sdk"

const bodySchema = z.object({
  hauptproblem: z.string().min(2).max(200),
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

  const { hauptproblem } = body

  // Find the master lesson (lesson_number=1) which holds the curriculum
  const { data: masterLesson } = await supabase
    .from("education_modules")
    .select("id, curriculum, total_lessons, status, generated_by")
    .eq("hauptproblem", hauptproblem)
    .eq("lesson_number", 1)
    .eq("status", "freigegeben")
    .maybeSingle()

  if (!masterLesson || !masterLesson.curriculum) {
    return NextResponse.json({
      lesson: null,
      reason: "no_curriculum",
    })
  }

  const curriculum = masterLesson.curriculum as Array<{ number: number; topic: string }>
  const totalLessons = masterLesson.total_lessons

  // Find all lessons for this hauptproblem that the patient has completed
  const { data: allLessons } = await supabase
    .from("education_modules")
    .select("id, lesson_number")
    .eq("hauptproblem", hauptproblem)
    .eq("status", "freigegeben")
    .order("lesson_number", { ascending: true })

  const lessonIds = (allLessons ?? []).map((l) => l.id)

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("module_id")
    .eq("patient_id", patient.id)
    .in("module_id", lessonIds.length > 0 ? lessonIds : ["00000000-0000-0000-0000-000000000000"])

  const completedModuleIds = new Set((attempts ?? []).map((a) => a.module_id))

  // Find next uncompleted lesson
  const completedLessonNumbers = new Set(
    (allLessons ?? [])
      .filter((l) => completedModuleIds.has(l.id))
      .map((l) => l.lesson_number)
  )

  let nextLessonNumber = 1
  for (let i = 1; i <= totalLessons; i++) {
    if (!completedLessonNumbers.has(i)) {
      nextLessonNumber = i
      break
    }
    if (i === totalLessons) {
      // All lessons completed!
      return NextResponse.json({
        lesson: null,
        reason: "all_completed",
        completed: completedLessonNumbers.size,
        total: totalLessons,
      })
    }
  }

  // Check if this lesson already exists
  const { data: existingLesson } = await supabase
    .from("education_modules")
    .select(`
      id, hauptproblem, title, lesson_content, generated_by, status,
      lesson_number, total_lessons, curriculum,
      created_at, updated_at,
      education_quizzes (id, module_id, question_number, question_text, options, correct_index, explanation)
    `)
    .eq("hauptproblem", hauptproblem)
    .eq("lesson_number", nextLessonNumber)
    .eq("status", "freigegeben")
    .maybeSingle()

  if (existingLesson) {
    return NextResponse.json({
      lesson: {
        ...existingLesson,
        quizzes: existingLesson.education_quizzes ?? [],
      },
      lessonNumber: nextLessonNumber,
      totalLessons,
      completed: completedLessonNumbers.size,
    })
  }

  // Lesson doesn't exist yet — generate on-demand
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ lesson: null, reason: "no_api_key" })
  }

  const topic = curriculum.find((c) => c.number === nextLessonNumber)?.topic
  if (!topic) {
    return NextResponse.json({ lesson: null, reason: "no_topic" })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: `Du bist ein erfahrener Physiotherapeut und Gesundheitspädagoge. Erstelle eine einzelne Wissenslektion für Patienten.

REGELN:
- Schreibe auf B1-Deutsch (einfache Sprache)
- Verwende HTML-Tags: <h2>, <p>, <ul>, <li>, <strong>
- Fragen sollen Kernverständnis prüfen
- Motivierend und praxisnah
- Antworte NUR mit validem JSON`,
      messages: [{
        role: "user",
        content: `Erstelle Lektion ${nextLessonNumber} von ${totalLessons} für den Wissenskurs "${hauptproblem}".

Thema dieser Lektion: "${topic}"

Kontext: Dies ist Teil eines 10-teiligen Kurses. Der Patient hat bereits ${completedLessonNumbers.size} Lektionen abgeschlossen.

Erstelle:
1. Eine verständliche Lektion (200-350 Wörter) in HTML zum Thema "${topic}"
2. 3 Multiple-Choice-Fragen (4 Optionen je Frage)

Antworte als JSON:
{
  "title": "Lektion ${nextLessonNumber}: ${topic}",
  "lesson_content": "<h2>${topic}</h2><p>...</p>...",
  "quizzes": [
    { "question_number": 1, "question_text": "...", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "..." },
    { "question_number": 2, "question_text": "...", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "..." },
    { "question_number": 3, "question_text": "...", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "..." }
  ]
}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unerwartetes Antwortformat.")
    }

    let jsonStr = content.text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }
    const generated = JSON.parse(jsonStr) as {
      title: string
      lesson_content: string
      quizzes: Array<{
        question_number: number
        question_text: string
        options: string[]
        correct_index: number
        explanation: string
      }>
    }

    if (!generated.title || !generated.lesson_content || !Array.isArray(generated.quizzes) || generated.quizzes.length !== 3) {
      throw new Error("Ungültige KI-Antwort.")
    }

    // Insert the new lesson — auto-freigegeben since curriculum is approved
    const { data: newLesson, error: insertErr } = await supabase
      .from("education_modules")
      .insert({
        hauptproblem,
        title: generated.title,
        lesson_content: generated.lesson_content,
        generated_by: masterLesson.generated_by,
        status: "freigegeben",
        lesson_number: nextLessonNumber,
        total_lessons: totalLessons,
        curriculum: null, // only stored on master
      })
      .select("id, hauptproblem, title, lesson_content, generated_by, status, lesson_number, total_lessons, curriculum, created_at, updated_at")
      .single()

    if (insertErr || !newLesson) {
      console.error("[POST /api/me/education/next-lesson] Insert error:", insertErr)
      return NextResponse.json({ error: "Lektion konnte nicht gespeichert werden." }, { status: 500 })
    }

    // Insert quizzes
    const quizRows = generated.quizzes.map((q) => ({
      module_id: newLesson.id,
      question_number: q.question_number,
      question_text: q.question_text,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation ?? null,
    }))

    const { data: savedQuizzes } = await supabase
      .from("education_quizzes")
      .insert(quizRows)
      .select("id, module_id, question_number, question_text, options, correct_index, explanation")

    return NextResponse.json({
      lesson: {
        ...newLesson,
        quizzes: savedQuizzes ?? [],
      },
      lessonNumber: nextLessonNumber,
      totalLessons,
      completed: completedLessonNumbers.size,
      generated: true,
    })
  } catch (err) {
    console.error("[POST /api/me/education/next-lesson] Generation error:", err)
    return NextResponse.json({
      lesson: null,
      reason: "generation_failed",
      error: err instanceof Error ? err.message : "Unbekannter Fehler",
    })
  }
}
