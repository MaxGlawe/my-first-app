/**
 * PROJ-16: Schmerztagebuch (Patient-Seite)
 * GET  /api/me/pain-diary  — Eigene Einträge (letzte 30 Tage)
 * POST /api/me/pain-diary  — Neuen Eintrag speichern (upsert pro Tag)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const createEntrySchema = z.object({
  pain_level: z.number().int().min(0).max(10),
  wellbeing: z.number().int().min(0).max(10),
  sleep_quality: z.number().int().min(0).max(10).optional().nullable(),
  stress_level: z.number().int().min(0).max(10).optional().nullable(),
  movement_restriction: z.number().int().min(0).max(10).optional().nullable(),
  pain_location: z.array(z.string()).optional().default([]),
  notes: z.string().max(2000).optional().nullable(),
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // defaults to today
})

// ── GET /api/me/pain-diary ──────────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find patient record via user_id bridge
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json(
      { error: "Kein Patienten-Profil gefunden." },
      { status: 404 }
    )
  }

  // Fetch last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sinceDate = thirtyDaysAgo.toISOString().split("T")[0]

  const { data: entries, error } = await supabase
    .from("pain_diary_entries")
    .select("id, entry_date, pain_level, wellbeing, sleep_quality, stress_level, movement_restriction, pain_location, notes, created_at")
    .eq("patient_id", patient.id)
    .gte("entry_date", sinceDate)
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("[GET /api/me/pain-diary] Error:", error)
    return NextResponse.json(
      { error: "Einträge konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  // Also return today's entry separately for quick check-in status
  const today = new Date().toISOString().split("T")[0]
  const todayEntry = entries?.find((e) => e.entry_date === today) ?? null

  return NextResponse.json({ entries: entries ?? [], todayEntry })
}

// ── POST /api/me/pain-diary ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Find patient record
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json(
      { error: "Kein Patienten-Profil gefunden." },
      { status: 404 }
    )
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createEntrySchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const { pain_level, wellbeing, sleep_quality, stress_level, movement_restriction, pain_location, notes, entry_date } = parseResult.data
  const date = entry_date ?? new Date().toISOString().split("T")[0]

  // Upsert: one entry per patient per day
  const { data: entry, error } = await supabase
    .from("pain_diary_entries")
    .upsert(
      {
        patient_id: patient.id,
        entry_date: date,
        pain_level,
        wellbeing,
        sleep_quality: sleep_quality ?? null,
        stress_level: stress_level ?? null,
        movement_restriction: movement_restriction ?? null,
        pain_location: pain_location ?? [],
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id,entry_date" }
    )
    .select("id, entry_date, pain_level, wellbeing, sleep_quality, stress_level, movement_restriction, pain_location, notes, created_at")
    .single()

  if (error) {
    console.error("[POST /api/me/pain-diary] Error:", error)
    return NextResponse.json(
      { error: "Eintrag konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ entry }, { status: 201 })
}
