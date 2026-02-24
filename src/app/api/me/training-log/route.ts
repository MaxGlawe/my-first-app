/**
 * Training Session Logs — Übungs-Level Tracking
 * GET  /api/me/training-log  — Logs abrufen (optional: ?days=30&assignment_id=...)
 * POST /api/me/training-log  — Neues Session-Log speichern
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const exerciseLogSchema = z.object({
  exercise_id: z.string().uuid(),
  sets_done: z.number().int().min(0).max(50),
  reps_done: z.number().int().min(0).max(500).optional(),
  duration_seconds: z.number().int().min(0).max(7200).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  pain_during: z.number().int().min(0).max(10).optional(),
  skipped: z.boolean().optional().default(false),
  skip_reason: z.string().max(200).optional(),
})

const createLogSchema = z.object({
  assignment_id: z.string().uuid(),
  unit_id: z.string().uuid().optional(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).max(36000).optional(),
  overall_difficulty: z.number().int().min(1).max(5).optional(),
  overall_pain: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(2000).optional(),
  exercise_logs: z.array(exerciseLogSchema).max(50).optional().default([]),
})

// ── Helper: get patient_id from auth ─────────────────────────────────────────

async function getPatientId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Nicht autorisiert.", status: 401 }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    // Fallback: try email match
    const { data: patientByEmail } = await supabase
      .from("patients")
      .select("id")
      .eq("email", user.email)
      .single()

    if (!patientByEmail) {
      return { error: "Kein Patient-Profil gefunden.", status: 404 }
    }
    return { patientId: patientByEmail.id }
  }

  return { patientId: patient.id }
}

// ── GET /api/me/training-log ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const result = await getPatientId(supabase)

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { patientId } = result
  const { searchParams } = new URL(request.url)
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10) || 30, 365)
  const assignmentId = searchParams.get("assignment_id")

  const since = new Date()
  since.setDate(since.getDate() - days)

  let query = supabase
    .from("training_session_logs")
    .select("*")
    .eq("patient_id", patientId)
    .gte("started_at", since.toISOString())
    .order("started_at", { ascending: false })
    .limit(200)

  if (assignmentId) {
    query = query.eq("assignment_id", assignmentId)
  }

  const { data: logs, error } = await query

  if (error) {
    console.error("[GET /api/me/training-log] error:", error)
    return NextResponse.json(
      { error: "Logs konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ logs: logs ?? [] })
}

// ── POST /api/me/training-log ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const result = await getPatientId(supabase)

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { patientId } = result

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createLogSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validierungsfehler.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    )
  }

  const data = parseResult.data

  // Verify the assignment belongs to this patient
  const { data: assignment } = await supabase
    .from("patient_assignments")
    .select("id")
    .eq("id", data.assignment_id)
    .eq("patient_id", patientId)
    .single()

  if (!assignment) {
    return NextResponse.json(
      { error: "Trainingsplan nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  const { data: log, error: insertError } = await supabase
    .from("training_session_logs")
    .insert({
      patient_id: patientId,
      assignment_id: data.assignment_id,
      unit_id: data.unit_id ?? null,
      started_at: data.started_at ?? new Date().toISOString(),
      completed_at: data.completed_at ?? null,
      duration_seconds: data.duration_seconds ?? null,
      overall_difficulty: data.overall_difficulty ?? null,
      overall_pain: data.overall_pain ?? null,
      notes: data.notes?.trim() || null,
      exercise_logs: data.exercise_logs,
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/me/training-log] error:", insertError)
    return NextResponse.json(
      { error: "Log konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ log }, { status: 201 })
}
