/**
 * PROJ-19: GET /api/me/buyer
 *
 * Gibt das Käufer-Profil und die Entitlements des eingeloggten
 * externen Käufers zurück.
 *
 * Zugriff: nur für eingeloggte User mit Rolle "externer_kaeufer".
 * Sicherheit: doppelt gesichert — Middleware blockiert alle anderen
 * Rollen bereits auf Route-Ebene; hier zusätzliche API-Prüfung.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Role check — only externer_kaeufer (and admin for testing).
  // Käufer-Stammdaten liegen in user_profiles (universelle Profil-Tabelle).
  const serviceClient = createSupabaseServiceClient()
  const { data: userProfile } = await serviceClient
    .from("user_profiles")
    .select("role, status, email, first_name, last_name, created_at")
    .eq("id", user.id)
    .single()

  if (!userProfile || !["externer_kaeufer", "admin"].includes(userProfile.role)) {
    return NextResponse.json({ error: "Kein Käufer-Account." }, { status: 403 })
  }

  if (userProfile.status !== "aktiv") {
    return NextResponse.json({ error: "Account deaktiviert." }, { status: 403 })
  }

  // Fetch entitlements — keyed to the login (user_id), nicht am Profiltyp
  const { data: entitlements } = await serviceClient
    .from("content_entitlements")
    .select("id, content_type, content_id, source, valid_from, valid_until")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  return NextResponse.json({
    profile: {
      email: userProfile.email,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      created_at: userProfile.created_at,
    },
    entitlements: entitlements ?? [],
    role: userProfile.role,
  })
}
