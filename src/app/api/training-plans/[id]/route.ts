/**
 * PROJ-9: Trainingsplan-Builder
 * GET    /api/training-plans/[id]  — Plan vollständig laden
 * PUT    /api/training-plans/[id]  — Plan speichern (vollständige Struktur)
 * DELETE /api/training-plans/[id]  — Plan löschen (soft-delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ---- Zod schemas ----
const paramsSchema = z.object({
  saetze: z.number().int().min(1).max(99),
  wiederholungen: z.number().int().min(1).max(999).nullable().optional(),
  dauer_sekunden: z.number().int().min(1).max(7200).nullable().optional(),
  pause_sekunden: z.number().int().min(0).max(3600),
  intensitaet_prozent: z.number().int().min(0).max(100).nullable().optional(),
  anmerkung: z.string().max(2000).nullable().optional(),
})

const planExerciseSchema = z.object({
  id: z.string(),
  exercise_id: z.string().uuid(),
  order: z.number().int().min(0),
  params: paramsSchema,
  // is_archived_exercise is NOT accepted from client — set server-side by DB trigger (BUG-7)
})

const planUnitSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  order: z.number().int().min(0),
  exercises: z.array(planExerciseSchema),
})

const planPhaseSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  dauer_wochen: z.number().int().min(1).max(52),
  order: z.number().int().min(0),
  units: z.array(planUnitSchema),
})

const putPlanSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  beschreibung: z.string().max(2000).nullable().optional(),
  is_template: z.boolean().optional(),
  phases: z.array(planPhaseSchema),
})

// ---- GET ----
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Load plan
  const { data: plan, error: planError } = await supabase
    .from("training_plans")
    .select("id, created_at, updated_at, name, beschreibung, created_by, is_template, is_archived")
    .eq("id", id)
    .eq("is_archived", false)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 })
  }

  // Load phases
  const { data: phases, error: phasesError } = await supabase
    .from("plan_phases")
    .select("id, name, dauer_wochen, order")
    .eq("plan_id", id)
    .order("order", { ascending: true })

  if (phasesError) {
    return NextResponse.json({ error: "Phasen konnten nicht geladen werden." }, { status: 500 })
  }

  // Load units
  const { data: units, error: unitsError } = await supabase
    .from("plan_units")
    .select("id, phase_id, name, order")
    .eq("plan_id", id)
    .order("order", { ascending: true })

  if (unitsError) {
    return NextResponse.json({ error: "Einheiten konnten nicht geladen werden." }, { status: 500 })
  }

  // Load exercises (joined with exercises table for metadata)
  const { data: exercises, error: exercisesError } = await supabase
    .from("plan_exercises")
    .select(
      `
      id,
      unit_id,
      exercise_id,
      order,
      params,
      is_archived_exercise,
      exercises!left(name, beschreibung, ausfuehrung, media_url, media_type, muskelgruppen)
      `
    )
    .in("unit_id", (units ?? []).map((u) => u.id))
    .order("order", { ascending: true })

  if (exercisesError) {
    return NextResponse.json({ error: "Übungen konnten nicht geladen werden." }, { status: 500 })
  }

  // Assemble full plan structure
  const fullPhases = (phases ?? []).map((phase) => ({
    id: phase.id,
    plan_id: id,
    name: phase.name,
    dauer_wochen: phase.dauer_wochen,
    order: phase.order,
    units: (units ?? [])
      .filter((u) => u.phase_id === phase.id)
      .map((unit) => ({
        id: unit.id,
        plan_id: id,
        phase_id: phase.id,
        name: unit.name,
        order: unit.order,
        exercises: (exercises ?? [])
          .filter((e) => e.unit_id === unit.id)
          .map((e) => {
            const exerciseData = e.exercises as unknown as {
              name: string
              beschreibung?: string | null
              ausfuehrung?: { nummer: number; beschreibung: string }[] | null
              media_url?: string | null
              media_type?: string | null
              muskelgruppen?: string[]
            } | null
            return {
              id: e.id,
              unit_id: e.unit_id,
              exercise_id: e.exercise_id,
              order: e.order,
              params: e.params,
              is_archived_exercise: e.is_archived_exercise,
              exercise_name: exerciseData?.name ?? null,
              exercise_beschreibung: exerciseData?.beschreibung ?? null,
              exercise_ausfuehrung: exerciseData?.ausfuehrung ?? null,
              exercise_media_url: exerciseData?.media_url ?? null,
              exercise_media_type: exerciseData?.media_type ?? null,
              exercise_muskelgruppen: exerciseData?.muskelgruppen ?? [],
            }
          }),
      })),
  }))

  return NextResponse.json({ plan: { ...plan, phases: fullPhases } })
}

// ---- PUT ----
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Verify plan ownership
  const { data: existingPlan, error: planCheckError } = await supabase
    .from("training_plans")
    .select("id, created_by")
    .eq("id", id)
    .eq("is_archived", false)
    .single()

  if (planCheckError || !existingPlan) {
    return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 })
  }

  // Check role for ownership
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  if (existingPlan.created_by !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = putPlanSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, beschreibung, is_template, phases } = parseResult.data

  // BUG-3 FIX: Use atomic RPC function that wraps everything in a single DB transaction.
  // If any insert fails, the entire save rolls back — no partial state or data loss.
  // is_archived_exercise is NOT sent from client; the DB trigger sets it on insert (BUG-7 FIX).
  const phasesForRpc = phases.map((phase, phaseIndex) => ({
    name: phase.name,
    dauer_wochen: phase.dauer_wochen,
    order: phaseIndex,
    units: phase.units.map((unit, unitIndex) => ({
      name: unit.name,
      order: unitIndex,
      exercises: unit.exercises.map((exercise, exerciseIndex) => ({
        exercise_id: exercise.exercise_id,
        order: exerciseIndex,
        params: exercise.params,
      })),
    })),
  }))

  const { error: rpcError } = await supabase.rpc("save_training_plan", {
    p_plan_id: id,
    p_name: name,
    p_beschreibung: beschreibung ?? null,
    p_is_template: is_template ?? false,
    p_phases: phasesForRpc,
  })

  if (rpcError) {
    console.error("[PUT /api/training-plans/[id]] rpc error:", rpcError)
    return NextResponse.json({ error: "Plan konnte nicht gespeichert werden." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ---- DELETE ----
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // BUG-1 FIX: Added .eq("is_archived", false) so deleting an already-archived plan
  // returns 404 instead of succeeding silently.
  const { data: existingPlan, error: planCheckError } = await supabase
    .from("training_plans")
    .select("id, created_by")
    .eq("id", id)
    .eq("is_archived", false)
    .single()

  if (planCheckError || !existingPlan) {
    return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  if (existingPlan.created_by !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Soft-delete
  const { error: deleteError } = await supabase
    .from("training_plans")
    .update({ is_archived: true })
    .eq("id", id)

  if (deleteError) {
    return NextResponse.json({ error: "Plan konnte nicht gelöscht werden." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
