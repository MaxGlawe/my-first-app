/**
 * PROJ-18: GET /api/bgf/therapeuten
 * Returns all active therapists who can be assigned to BGF organizations.
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  heilpraktiker: "Heilpraktiker",
  physiotherapeut: "Physiotherapeut",
  praeventionstrainer: "Präventionstrainer",
  personal_trainer: "Personal Trainer",
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  const { data: profiles, error } = await sc
    .from("user_profiles")
    .select("id, first_name, last_name, email, role")
    .in("role", ["admin", "heilpraktiker", "physiotherapeut", "praeventionstrainer", "personal_trainer"])
    .eq("status", "aktiv")

  if (error) {
    console.error("[GET /api/bgf/therapeuten] error:", error)
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  const therapeuten = (profiles ?? []).map((p) => ({
    id: p.id,
    name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "Unbekannt",
    email: p.email,
    role: ROLE_LABELS[p.role] ?? p.role,
  }))

  return NextResponse.json({ therapeuten })
}
