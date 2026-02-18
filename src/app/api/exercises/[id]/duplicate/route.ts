/**
 * PROJ-8: Übungsdatenbank-Verwaltung
 * POST /api/exercises/[id]/duplicate
 *
 * Duplicates an exercise (usually a public Praxis-Bibliothek exercise)
 * and creates a personal copy for the current therapist.
 *
 * The copy:
 *   - Belongs to the current user (created_by = auth.uid())
 *   - Is private (is_public = false)
 *   - Has "(Kopie)" appended to the name
 *   - Shares the same media_url (no file copy — media is public and read-only)
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

  // Fetch the source exercise (RLS: only visible exercises)
  const { data: source, error: fetchError } = await supabase
    .from("exercises")
    .select(
      `
      name,
      beschreibung,
      ausfuehrung,
      muskelgruppen,
      schwierigkeitsgrad,
      media_url,
      media_type,
      standard_saetze,
      standard_wiederholungen,
      standard_pause_sekunden
      `
    )
    .eq("id", id)
    .eq("is_archived", false)
    .single()

  if (fetchError || !source) {
    return NextResponse.json(
      { error: "Übung nicht gefunden oder keine Berechtigung." },
      { status: 404 }
    )
  }

  // Build the duplicated exercise payload
  const copyName =
    source.name.length <= 193
      ? `${source.name} (Kopie)`
      : `${source.name.slice(0, 192)}… (Kopie)`

  const payload = {
    name: copyName,
    beschreibung: source.beschreibung,
    ausfuehrung: source.ausfuehrung,
    muskelgruppen: source.muskelgruppen,
    schwierigkeitsgrad: source.schwierigkeitsgrad,
    media_url: source.media_url,
    media_type: source.media_type,
    standard_saetze: source.standard_saetze,
    standard_wiederholungen: source.standard_wiederholungen,
    standard_pause_sekunden: source.standard_pause_sekunden,
    is_public: false,    // Personal copy — always private
    created_by: user.id,
  }

  const { data: created, error: insertError } = await supabase
    .from("exercises")
    .insert(payload)
    .select("id, name, is_public, created_by, created_at, updated_at")
    .single()

  if (insertError) {
    console.error("[POST /api/exercises/[id]/duplicate] Supabase error:", insertError)
    return NextResponse.json(
      { error: "Übung konnte nicht dupliziert werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ exercise: { ...created, is_favorite: false } }, { status: 201 })
}
