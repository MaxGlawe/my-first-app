/**
 * PROJ-17: POST /api/education/generate
 * Generates a 10-lesson curriculum + first lesson + quiz for a Hauptproblem.
 * Returns cached curriculum if one already exists with status != archiviert.
 * Subsequent lessons (2-10) are generated on-demand via /api/me/education/next-lesson.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import Anthropic from "@anthropic-ai/sdk"

const TOTAL_LESSONS = 10

const bodySchema = z.object({
  hauptproblem: z.string().min(2).max(200),
  regenerate: z.boolean().optional().default(false),
})

const SYSTEM_PROMPT = `Du bist ein erfahrener Physiotherapeut und Gesundheitspädagoge. Erstelle patientengerechte Edukationsinhalte.

REGELN:
- Schreibe auf B1-Deutsch (einfache Sprache, keine Fachbegriffe ohne Erklärung)
- Verwende HTML-Tags: <h2>, <p>, <ul>, <li>, <strong>
- Fragen sollen Kernverständnis prüfen, nicht Detailwissen
- Erklärungen sollen motivierend und praxisnah sein
- Nutze das bereitgestellte Tool, um deine Antwort strukturiert zurückzugeben`

function buildCurriculumPrompt(hauptproblem: string): string {
  return `Erstelle einen 10-teiligen Wissenskurs für das Hauptproblem: "${hauptproblem}"

Der Kurs soll Patienten über ${TOTAL_LESSONS} Trainingstage hinweg aufklären — jeden Tag eine neue Lektion.

Erstelle:
1. Einen Lehrplan mit ${TOTAL_LESSONS} Lektionsthemen (progressiv aufgebaut: von Grundlagen zu Praxis)
2. Die ERSTE Lektion (250-400 Wörter) in HTML
3. 3 Multiple-Choice-Fragen zur ersten Lektion

Typischer Lehrplan-Aufbau:
- Lektion 1-2: Grundverständnis (Was ist es? Was passiert im Körper?)
- Lektion 3-4: Ursachen und Symptome
- Lektion 5-6: Warum Bewegung/Training hilft
- Lektion 7-8: Praktische Tipps für den Alltag
- Lektion 9-10: Langfristige Prävention und Selbstmanagement

Nutze das Tool "save_curriculum", um dein Ergebnis zurückzugeben.`
}

// Tool definition for structured output
const curriculumTool: Anthropic.Tool = {
  name: "save_curriculum",
  description: "Speichert den generierten Lehrplan, die erste Lektion und die Quizfragen.",
  input_schema: {
    type: "object" as const,
    properties: {
      curriculum: {
        type: "array",
        items: {
          type: "object",
          properties: {
            number: { type: "number", description: "Lektionsnummer (1-10)" },
            topic: { type: "string", description: "Thema der Lektion" },
          },
          required: ["number", "topic"],
        },
        description: "Array mit 10 Lektionsthemen",
      },
      title: {
        type: "string",
        description: "Titel der ersten Lektion, z.B. 'Lektion 1: Was ist Rückenschmerz?'",
      },
      lesson_content: {
        type: "string",
        description: "HTML-Inhalt der ersten Lektion (250-400 Wörter). Verwende <h2>, <p>, <ul>, <li>, <strong>.",
      },
      quizzes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question_number: { type: "number" },
            question_text: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              description: "4 Antwortoptionen",
            },
            correct_index: {
              type: "number",
              description: "Index der richtigen Antwort (0-3)",
            },
            explanation: {
              type: "string",
              description: "Kurze Erklärung warum die Antwort richtig ist",
            },
          },
          required: ["question_number", "question_text", "options", "correct_index", "explanation"],
        },
        description: "3 Multiple-Choice-Fragen",
      },
    },
    required: ["curriculum", "title", "lesson_content", "quizzes"],
  },
}

interface GeneratedCurriculumContent {
  curriculum: Array<{ number: number; topic: string }>
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

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Check role — use service client to bypass potential RLS on user_profiles
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service")
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const staffRoles = ["admin", "heilpraktiker", "physiotherapeut", "praeventionstrainer", "personal_trainer"]
  if (!profile || !staffRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Parse body
  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? (err as z.ZodError).issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { hauptproblem, regenerate } = body

  // Check cache: existing lesson 1 (master) for this hauptproblem?
  if (!regenerate) {
    const { data: existing } = await supabase
      .from("education_modules")
      .select(`
        id, hauptproblem, title, lesson_content, generated_by, status,
        lesson_number, total_lessons, curriculum,
        created_at, updated_at,
        education_quizzes (id, module_id, question_number, question_text, options, correct_index, explanation)
      `)
      .eq("hauptproblem", hauptproblem)
      .eq("lesson_number", 1)
      .neq("status", "archiviert")
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        module: {
          ...existing,
          quizzes: existing.education_quizzes ?? [],
        },
        cached: true,
      })
    }
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "KI-Service nicht konfiguriert. Bitte ANTHROPIC_API_KEY setzen." },
      { status: 503 }
    )
  }

  // If regenerating, archive ALL old lessons for this hauptproblem
  if (regenerate) {
    await supabase
      .from("education_modules")
      .update({ status: "archiviert" })
      .eq("hauptproblem", hauptproblem)
      .neq("status", "archiviert")
  }

  // Generate curriculum + first lesson via Claude (using tool_use for guaranteed valid JSON)
  let generated: GeneratedCurriculumContent
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const claudePromise = anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [curriculumTool],
      tool_choice: { type: "tool", name: "save_curriculum" },
      messages: [{ role: "user", content: buildCurriculumPrompt(hauptproblem) }],
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("CLAUDE_TIMEOUT")), 90_000)
    )

    const message = await Promise.race([claudePromise, timeoutPromise])

    // Extract tool_use result
    const toolBlock = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    )

    if (!toolBlock) {
      throw new Error("KI hat kein strukturiertes Ergebnis zurückgegeben.")
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = toolBlock.input as any

    // Dump the raw structure for debugging
    const rawKeys = Object.keys(raw)
    const rawDump: Record<string, string> = {}
    for (const key of rawKeys) {
      const val = raw[key]
      const t = Array.isArray(val) ? `array[${val.length}]` : typeof val
      const preview = typeof val === "string" ? val.slice(0, 200) : JSON.stringify(val)?.slice(0, 200)
      rawDump[key] = `${t}: ${preview}`
    }
    console.log("[POST /api/education/generate] RAW tool input keys:", rawKeys)
    console.log("[POST /api/education/generate] RAW tool input dump:", JSON.stringify(rawDump))

    generated = {
      curriculum: raw.curriculum,
      title: raw.title,
      lesson_content: raw.lesson_content,
      quizzes: raw.quizzes,
    } as GeneratedCurriculumContent

    // Validate & fix structure
    if (!Array.isArray(generated.curriculum) || !Array.isArray(generated.quizzes)) {
      console.error("[POST /api/education/generate] STRUCTURE ISSUE - curriculum isArray:", Array.isArray(generated.curriculum), "quizzes isArray:", Array.isArray(generated.quizzes))
      console.error("[POST /api/education/generate] Full raw input:", JSON.stringify(raw).slice(0, 2000))
      throw new Error(`Ungültige KI-Antwort-Struktur. Siehe Server-Logs.`)
    }

    if (
      generated.curriculum.length < 5 ||
      !generated.title ||
      !generated.lesson_content ||
      generated.quizzes.length < 1
    ) {
      throw new Error(`Ungültige KI-Antwort: curriculum=${generated.curriculum.length}, quizzes=${generated.quizzes.length}, title=${!!generated.title}, content=${!!generated.lesson_content}`)
    }

    // Pad curriculum to 10 if less than 10
    while (generated.curriculum.length < TOTAL_LESSONS) {
      generated.curriculum.push({
        number: generated.curriculum.length + 1,
        topic: `Vertiefung und Wiederholung (Lektion ${generated.curriculum.length + 1})`,
      })
    }

    // Pad quizzes to 3 if less than 3
    while (generated.quizzes.length < 3) {
      generated.quizzes.push({
        question_number: generated.quizzes.length + 1,
        question_text: "Was ist das wichtigste Ergebnis dieser Lektion?",
        options: ["Regelmäßige Bewegung hilft", "Stillhalten ist besser", "Schmerz bedeutet Schaden", "Training ist unwichtig"],
        correct_index: 0,
        explanation: "Regelmäßige, angepasste Bewegung ist ein Schlüssel zur Genesung.",
      })
    }
  } catch (err) {
    console.error("[POST /api/education/generate] Claude error:", err)
    const errMsg = err instanceof Error ? err.message : "Unbekannter Fehler"
    if (errMsg === "CLAUDE_TIMEOUT") {
      return NextResponse.json(
        { error: "KI-Generierung hat zu lange gedauert. Bitte erneut versuchen." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: `KI-Generierung fehlgeschlagen: ${errMsg}` },
      { status: 500 }
    )
  }

  // Insert lesson 1 (master row with curriculum)
  const { data: moduleRow, error: insertErr } = await supabase
    .from("education_modules")
    .insert({
      hauptproblem,
      title: generated.title,
      lesson_content: generated.lesson_content,
      generated_by: user.id,
      status: "entwurf",
      lesson_number: 1,
      total_lessons: TOTAL_LESSONS,
      curriculum: generated.curriculum,
    })
    .select("id, hauptproblem, title, lesson_content, generated_by, status, lesson_number, total_lessons, curriculum, created_at, updated_at")
    .single()

  if (insertErr || !moduleRow) {
    console.error("[POST /api/education/generate] Insert error:", insertErr)
    return NextResponse.json(
      { error: "Modul konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  // Insert quizzes for lesson 1
  const quizRows = generated.quizzes.map((q) => ({
    module_id: moduleRow.id,
    question_number: q.question_number,
    question_text: q.question_text,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation ?? null,
  }))

  const { data: savedQuizzes, error: quizErr } = await supabase
    .from("education_quizzes")
    .insert(quizRows)
    .select("id, module_id, question_number, question_text, options, correct_index, explanation")

  if (quizErr) {
    console.error("[POST /api/education/generate] Quiz insert error:", quizErr)
  }

  return NextResponse.json({
    module: {
      ...moduleRow,
      quizzes: savedQuizzes ?? [],
    },
    cached: false,
  })
}
