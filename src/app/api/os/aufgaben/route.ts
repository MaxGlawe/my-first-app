/**
 * PROJ-29 — Der Arbeitsvorrat der Praxis.
 *
 * GET   /api/os/aufgaben            — was offen ist
 * PATCH /api/os/aufgaben            — { id, status: "erledigt" | "offen" }
 *
 * Bewusst ohne Anlegen von Hand: Aufgaben entstehen aus automatischen Läufen.
 * Eine Merkliste zum Selbstbefüllen wäre ein zweites Werkzeug neben dem
 * Kalender und dem Chat — und niemand pflegt drei.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

async function praxis() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  const { data: profil } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profil || !STAFF.includes(profil.role as string)) return null
  return { user, svc }
}

export async function GET(request: NextRequest) {
  const auth = await praxis()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const alle = request.nextUrl.searchParams.get("alle") === "true"

  let query = auth.svc
    .from("os_aufgaben")
    .select("id, typ, titel, beschreibung, link, patient_id, status, created_at, erledigt_at")
    .order("created_at", { ascending: false })
    .limit(alle ? 100 : 25)

  if (!alle) query = query.eq("status", "offen")

  const { data, error } = await query
  if (error) {
    console.error("[os/aufgaben] GET:", error)
    return NextResponse.json({ error: "Aufgaben konnten nicht geladen werden." }, { status: 500 })
  }

  return NextResponse.json({ aufgaben: data ?? [] })
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["offen", "erledigt"]),
})

export async function PATCH(request: NextRequest) {
  const auth = await praxis()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }
  const { id, status } = parsed.data

  // Erledigt und wieder offen sind beide erlaubt: Wer versehentlich abhakt,
  // soll das zurücknehmen können, ohne dass die Aufgabe verloren ist.
  const { error } = await auth.svc
    .from("os_aufgaben")
    .update({
      status,
      erledigt_at: status === "erledigt" ? new Date().toISOString() : null,
      erledigt_von: status === "erledigt" ? auth.user.id : null,
    })
    .eq("id", id)

  if (error) {
    console.error("[os/aufgaben] PATCH:", error)
    return NextResponse.json({ error: "Konnte nicht gespeichert werden." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
