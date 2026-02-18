/**
 * PROJ-8: Übungsdatenbank-Verwaltung
 * POST /api/exercises/[id]/favorite
 *
 * Toggles the favorite status of an exercise for the current user.
 *   - If the exercise is already a favorite → removes it (unfavorite)
 *   - If not yet a favorite → adds it
 *
 * Returns: { is_favorite: boolean }
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige Übungs-ID." }, { status: 400 })
  }

  // Verify the exercise exists and is accessible (RLS on exercises)
  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .select("id")
    .eq("id", id)
    .eq("is_archived", false)
    .single()

  if (exerciseError || !exercise) {
    return NextResponse.json(
      { error: "Übung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Check current favorite status
  const { data: existing, error: checkError } = await supabase
    .from("exercise_favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("exercise_id", id)
    .maybeSingle()

  if (checkError) {
    console.error("[POST /api/exercises/[id]/favorite] Check error:", checkError)
    return NextResponse.json(
      { error: "Favoritenstatus konnte nicht geprüft werden." },
      { status: 500 }
    )
  }

  if (existing) {
    // Already a favorite → remove it
    const { error: deleteError } = await supabase
      .from("exercise_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("exercise_id", id)

    if (deleteError) {
      console.error("[POST /api/exercises/[id]/favorite] Delete error:", deleteError)
      return NextResponse.json(
        { error: "Favorit konnte nicht entfernt werden." },
        { status: 500 }
      )
    }

    return NextResponse.json({ is_favorite: false })
  } else {
    // Not yet a favorite → add it
    const { error: insertError } = await supabase
      .from("exercise_favorites")
      .insert({ user_id: user.id, exercise_id: id })

    if (insertError) {
      console.error("[POST /api/exercises/[id]/favorite] Insert error:", insertError)
      return NextResponse.json(
        { error: "Favorit konnte nicht gesetzt werden." },
        { status: 500 }
      )
    }

    return NextResponse.json({ is_favorite: true })
  }
}
