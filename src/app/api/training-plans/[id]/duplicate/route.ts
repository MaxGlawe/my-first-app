/**
 * PROJ-9: Trainingsplan-Builder
 * POST /api/training-plans/[id]/duplicate — Plan vollständig kopieren
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(
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

  // Load original plan
  const { data: originalPlan, error: planError } = await supabase
    .from("training_plans")
    .select("id, name, beschreibung, is_template")
    .eq("id", id)
    .eq("is_archived", false)
    .single()

  if (planError || !originalPlan) {
    return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 })
  }

  // Create copy
  const { data: newPlan, error: insertPlanError } = await supabase
    .from("training_plans")
    .insert({
      name: `${originalPlan.name} (Kopie)`,
      beschreibung: originalPlan.beschreibung,
      created_by: user.id,
      is_template: false,
      is_archived: false,
    })
    .select("id")
    .single()

  if (insertPlanError || !newPlan) {
    console.error("[POST duplicate] plan insert error:", insertPlanError)
    return NextResponse.json({ error: "Plan konnte nicht dupliziert werden." }, { status: 500 })
  }

  const newPlanId = newPlan.id

  // Load phases
  const { data: phases } = await supabase
    .from("plan_phases")
    .select("id, name, dauer_wochen, order")
    .eq("plan_id", id)
    .order("order", { ascending: true })

  // BUG-8 FIX: Replaced silent `continue` with explicit error returns.
  // Each phase/unit insert failure now returns 500 instead of silently producing an incomplete copy.
  for (const phase of phases ?? []) {
    const { data: newPhase, error: phaseError } = await supabase
      .from("plan_phases")
      .insert({ plan_id: newPlanId, name: phase.name, dauer_wochen: phase.dauer_wochen, order: phase.order })
      .select("id")
      .single()

    if (phaseError || !newPhase) {
      console.error("[POST duplicate] phase insert error:", phaseError)
      return NextResponse.json({ error: "Plan konnte nicht vollständig dupliziert werden." }, { status: 500 })
    }

    // Load units for this phase
    const { data: units, error: unitsError } = await supabase
      .from("plan_units")
      .select("id, name, order")
      .eq("plan_id", id)
      .eq("phase_id", phase.id)
      .order("order", { ascending: true })

    if (unitsError) {
      console.error("[POST duplicate] units load error:", unitsError)
      return NextResponse.json({ error: "Plan konnte nicht vollständig dupliziert werden." }, { status: 500 })
    }

    for (const unit of units ?? []) {
      const { data: newUnit, error: unitError } = await supabase
        .from("plan_units")
        .insert({ plan_id: newPlanId, phase_id: newPhase.id, name: unit.name, order: unit.order })
        .select("id")
        .single()

      if (unitError || !newUnit) {
        console.error("[POST duplicate] unit insert error:", unitError)
        return NextResponse.json({ error: "Plan konnte nicht vollständig dupliziert werden." }, { status: 500 })
      }

      // Load exercises for this unit
      const { data: exercises, error: exercisesLoadError } = await supabase
        .from("plan_exercises")
        .select("exercise_id, order, params, is_archived_exercise")
        .eq("unit_id", unit.id)
        .order("order", { ascending: true })

      if (exercisesLoadError) {
        console.error("[POST duplicate] exercises load error:", exercisesLoadError)
        return NextResponse.json({ error: "Plan konnte nicht vollständig dupliziert werden." }, { status: 500 })
      }

      if (exercises && exercises.length > 0) {
        const { error: exercisesInsertError } = await supabase.from("plan_exercises").insert(
          exercises.map((e) => ({
            unit_id: newUnit.id,
            exercise_id: e.exercise_id,
            order: e.order,
            params: e.params,
            is_archived_exercise: e.is_archived_exercise,
          }))
        )

        if (exercisesInsertError) {
          console.error("[POST duplicate] exercises insert error:", exercisesInsertError)
          return NextResponse.json({ error: "Plan konnte nicht vollständig dupliziert werden." }, { status: 500 })
        }
      }
    }
  }

  return NextResponse.json({ plan: { id: newPlanId } }, { status: 201 })
}
