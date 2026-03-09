import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

const updateContractSchema = z.object({
  leistungen: z.array(z.object({
    beschreibung: z.string().min(1),
    preis: z.number().min(0),
    details: z.string().optional(),
  })).optional(),
  gesamtpreis: z.number().min(0).optional(),
  zahlungsweise: z.enum(["einmalig", "pro_sitzung"]).optional(),
  dauer_wochen: z.number().int().positive().nullable().optional(),
  sitzungen_anzahl: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  praxis_signature_png: z.string().nullable().optional(),
})

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return null
  }

  return { user, serviceClient, role: profile.role }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  let query = auth.serviceClient
    .from("treatment_contracts")
    .select("*, patient:patients(vorname, nachname, email)")
    .eq("id", id)
    .single()

  const { data, error } = await query
  if (error || !data) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  // Non-admin can only see own contracts
  if (auth.role !== "admin" && data.created_by !== auth.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const body = await request.json()
  const parseResult = updateContractSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten() },
      { status: 422 }
    )
  }

  // Check contract exists and is in draft status
  const { data: existing } = await auth.serviceClient
    .from("treatment_contracts")
    .select("id, status, created_by")
    .eq("id", id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  if (auth.role !== "admin" && existing.created_by !== auth.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // praxis_signature_png can be saved in "entwurf" or "versendet" status
  const onlySignature = Object.keys(parseResult.data).every(
    (k) => k === "praxis_signature_png"
  )
  if (existing.status !== "entwurf" && !onlySignature) {
    return NextResponse.json({ error: "Nur Entwürfe können bearbeitet werden." }, { status: 422 })
  }
  if (existing.status !== "entwurf" && existing.status !== "versendet" && onlySignature) {
    return NextResponse.json({ error: "Praxis-Signatur kann in diesem Status nicht geändert werden." }, { status: 422 })
  }

  const { data, error } = await auth.serviceClient
    .from("treatment_contracts")
    .update(parseResult.data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 })
  }

  return NextResponse.json({ data })
}
