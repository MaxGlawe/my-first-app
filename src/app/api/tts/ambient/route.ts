/**
 * PROJ-17: Ambient Sounds Listing
 * GET /api/tts/ambient?theme=forest|sea|mountains
 *
 * Returns public URLs for ambient sound files by theme.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const VALID_THEMES = ["forest", "sea", "mountains"] as const
type AmbientTheme = (typeof VALID_THEMES)[number]

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const theme = request.nextUrl.searchParams.get("theme") as
    | AmbientTheme
    | null

  if (!theme || !VALID_THEMES.includes(theme)) {
    return NextResponse.json(
      { error: `Ungültiges Thema. Erlaubt: ${VALID_THEMES.join(", ")}` },
      { status: 400 }
    )
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: files, error } = await serviceClient.storage
    .from("ambient-sounds")
    .list(theme, { limit: 20 })

  if (error) {
    return NextResponse.json(
      { error: "Ambient-Sounds konnten nicht geladen werden." },
      { status: 500 }
    )
  }

  const sounds = (files ?? [])
    .filter((f) => f.name.endsWith(".mp3"))
    .map((f) => ({
      name: f.name,
      url: serviceClient.storage
        .from("ambient-sounds")
        .getPublicUrl(`${theme}/${f.name}`).data.publicUrl,
    }))

  return NextResponse.json({ theme, sounds })
}
