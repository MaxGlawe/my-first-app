/**
 * PROJ-17: GET /api/me/daily-insight
 * Returns the daily insight for the current patient.
 * Cache-first: if an insight exists for today, return it.
 * Otherwise, generate one via Claude Haiku using patient context.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import Anthropic from "@anthropic-ai/sdk"

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

export async function GET() {
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
    .select("id, vorname, nachname")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!patient && user.email) {
    const { data: byEmail } = await supabase
      .from("patients")
      .select("id, vorname, nachname")
      .eq("email", user.email)
      .maybeSingle()
    patient = byEmail ?? null
  }

  if (!patient) {
    return NextResponse.json({ insight: null })
  }

  const today = todayStr()

  // Check cache
  const { data: cached } = await supabase
    .from("daily_insights")
    .select("id, content, insight_date")
    .eq("patient_id", patient.id)
    .eq("insight_date", today)
    .maybeSingle()

  if (cached) {
    return NextResponse.json({ insight: cached, generated: false })
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ insight: null })
  }

  // Gather patient context for personalized insight
  const { data: assignments } = await supabase
    .from("patient_assignments")
    .select("hauptproblem, active_days")
    .eq("patient_id", patient.id)
    .eq("status", "aktiv")
    .limit(5)

  const hauptprobleme = [...new Set(
    (assignments ?? [])
      .map((a) => a.hauptproblem as string)
      .filter(Boolean)
  )]

  // Get recent completions for streak context
  const { data: recentCompletions } = await supabase
    .from("assignment_completions")
    .select("completed_date")
    .eq("patient_id", patient.id)
    .order("completed_date", { ascending: false })
    .limit(14)

  const completionDates = (recentCompletions ?? []).map((c) => c.completed_date)

  // Calculate simple streak
  let streak = 0
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - 1) // start from yesterday
  for (let i = 0; i < 14; i++) {
    const dateStr = cursor.toISOString().split("T")[0]
    if (completionDates.includes(dateStr)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  // Check if trained today
  if (completionDates.includes(today)) streak++

  // Get recent pain data
  const { data: painEntries } = await supabase
    .from("pain_diary")
    .select("pain_level, created_at")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(7)

  const painLevels = (painEntries ?? []).map((p) => p.pain_level)
  const avgPain = painLevels.length > 0
    ? Math.round(painLevels.reduce((a: number, b: number) => a + b, 0) / painLevels.length * 10) / 10
    : null

  // Generate insight via Claude Haiku
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const contextParts: string[] = []
    if (patient.vorname) contextParts.push(`Patient: ${patient.vorname}`)
    if (hauptprobleme.length > 0) contextParts.push(`Hauptprobleme: ${hauptprobleme.join(", ")}`)
    contextParts.push(`Aktuelle Trainingsserie: ${streak} Tage`)
    if (avgPain !== null) contextParts.push(`Durchschnittlicher Schmerz (letzte 7 Einträge): ${avgPain}/10`)
    if (completionDates.includes(today)) contextParts.push("Hat heute bereits trainiert.")

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: `Du bist ein motivierender Physiotherapie-Assistent. Erstelle einen kurzen täglichen Tipp (1-3 Sätze) auf Deutsch.
REGELN:
- Schreibe motivierend und freundlich (Du-Form)
- Beziehe dich auf den Kontext des Patienten
- Kein medizinischer Rat, nur Motivation und allgemeine Gesundheitstipps
- Keine Emojis
- Antworte NUR mit dem Tipp-Text, keine Anführungszeichen`,
      messages: [{
        role: "user",
        content: `Erstelle einen täglichen Motivations-Tipp für diesen Patienten:\n${contextParts.join("\n")}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== "text" || !content.text.trim()) {
      return NextResponse.json({ insight: null })
    }

    const insightText = content.text.trim()

    // Cache the insight
    const { data: saved } = await supabase
      .from("daily_insights")
      .insert({
        patient_id: patient.id,
        insight_date: today,
        content: insightText,
      })
      .select("id, content, insight_date")
      .single()

    return NextResponse.json({ insight: saved, generated: true })
  } catch (err) {
    console.error("[GET /api/me/daily-insight] Claude error:", err)
    return NextResponse.json({ insight: null })
  }
}
