/**
 * PROJ-26 Phase 3 — Verschlechterungsmeldungen (Therapeutenseite).
 *
 * GET   /api/os/verschlechterung?patient_id=…  — Vorgänge eines Patienten
 * PATCH /api/os/verschlechterung               — Vorgang abschliessen
 *
 * Das Abschliessen ist bewusst eine ausdrückliche Handlung und passiert nicht
 * automatisch, etwa beim nächsten Chatbeitrag. Der Vorgang dokumentiert, dass
 * eine vertraglich zugesagte Reaktionsfrist eingehalten wurde — und was
 * daraufhin veranlasst wurde. Ein stillschweigender Abschluss wäre kein
 * Nachweis, sondern nur ein verschwundener Eintrag.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const STAFF_ROLES = ["admin", "heilpraktiker", "physiotherapeut"]

const patchSchema = z.object({
  id: z.string().uuid(),
  notiz: z.string().trim().max(2000).optional().nullable(),
})

async function requireStaff() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !STAFF_ROLES.includes(profile.role)) return null
  return { user, svc }
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const patientId = request.nextUrl.searchParams.get("patient_id")
  if (!patientId) {
    return NextResponse.json({ error: "patient_id fehlt." }, { status: 400 })
  }

  const { data, error } = await auth.svc
    .from("programm_verschlechterungen")
    .select("id, beschreibung, gemeldet_at, frist_at, erledigt_at, erledigt_notiz")
    .eq("patient_id", patientId)
    .order("gemeldet_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[os/verschlechterung] GET:", error)
    return NextResponse.json({ error: "Konnte nicht geladen werden." }, { status: 500 })
  }

  const meldungen = data ?? []
  return NextResponse.json({
    meldungen,
    offen: meldungen.find((m) => !m.erledigt_at) ?? null,
  })
}

// ── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler." }, { status: 400 })
  }

  // Nur offene Vorgänge abschliessen. Ein erneutes PATCH auf einen bereits
  // abgeschlossenen Vorgang darf den ursprünglichen Zeitstempel nicht
  // überschreiben — sonst liesse sich eine versäumte Frist nachträglich
  // glattziehen.
  const { data, error } = await auth.svc
    .from("programm_verschlechterungen")
    .update({
      erledigt_at: new Date().toISOString(),
      erledigt_von: auth.user.id,
      erledigt_notiz: parsed.data.notiz || null,
    })
    .eq("id", parsed.data.id)
    .is("erledigt_at", null)
    .select("id, gemeldet_at, frist_at, erledigt_at, erledigt_notiz")
    .maybeSingle()

  if (error) {
    console.error("[os/verschlechterung] PATCH:", error)
    return NextResponse.json({ error: "Konnte nicht gespeichert werden." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json(
      { error: "Vorgang nicht gefunden oder bereits abgeschlossen." },
      { status: 409 }
    )
  }

  return NextResponse.json({ meldung: data })
}
