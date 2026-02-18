/**
 * PROJ-9: Trainingsplan-Builder
 * GET  /api/training-plans  — Liste der Trainingspläne (filter: alle / meine / templates)
 * POST /api/training-plans  — Neuen Plan anlegen
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const createPlanSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich.").max(200).trim(),
  beschreibung: z.string().max(2000).optional().nullable(),
})

// ----------------------------------------------------------------
// GET /api/training-plans
// ----------------------------------------------------------------
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") ?? "alle"
  const search = searchParams.get("search")?.trim() ?? ""

  let query = supabase
    .from("training_plans")
    .select(
      `
      id,
      created_at,
      updated_at,
      name,
      beschreibung,
      created_by,
      is_template,
      is_archived,
      plan_phases!left(id, plan_units!left(id, plan_exercises!left(id)))
      `,
      { count: "exact" }
    )
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
    .limit(100)

  if (filter === "meine") {
    query = query.eq("created_by", user.id)
  } else if (filter === "templates") {
    query = query.eq("is_template", true)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/training-plans] error:", error)
    return NextResponse.json({ error: "Trainingspläne konnten nicht geladen werden." }, { status: 500 })
  }

  // Flatten to list items with summary counts
  const plans = (data ?? []).map((row) => {
    const phases = (row.plan_phases as Array<{ id: string; plan_units: Array<{ id: string; plan_exercises: Array<{ id: string }> }> }>) ?? []
    const uebungen_anzahl = phases.reduce(
      (sum, phase) =>
        sum + phase.plan_units.reduce((uSum, unit) => uSum + unit.plan_exercises.length, 0),
      0
    )
    return {
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      name: row.name,
      beschreibung: row.beschreibung,
      created_by: row.created_by,
      is_template: row.is_template,
      is_archived: row.is_archived,
      uebungen_anzahl,
      phasen_anzahl: phases.length,
    }
  })

  return NextResponse.json({ plans })
}

// ----------------------------------------------------------------
// POST /api/training-plans
// ----------------------------------------------------------------
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createPlanSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, beschreibung } = parseResult.data

  const { data: created, error: insertError } = await supabase
    .from("training_plans")
    .insert({
      name,
      beschreibung: beschreibung ?? null,
      created_by: user.id,
      is_template: false,
      is_archived: false,
    })
    .select("id, name, beschreibung, created_by, is_template, is_archived, created_at, updated_at")
    .single()

  if (insertError) {
    console.error("[POST /api/training-plans] error:", insertError)
    return NextResponse.json({ error: "Plan konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json(
    {
      plan: {
        ...created,
        phases: [],
        uebungen_anzahl: 0,
        phasen_anzahl: 0,
      },
    },
    { status: 201 }
  )
}
