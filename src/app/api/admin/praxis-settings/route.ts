import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

const praxisSettingsSchema = z.object({
  praxis_name: z.string().min(1),
  inhaber_name: z.string().min(1),
  strasse: z.string().min(1),
  plz: z.string().min(1),
  ort: z.string().min(1),
  telefon: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().nullable().optional(),
  steuernummer: z.string().nullable().optional(),
  iban: z.string().min(1),
  bic: z.string().nullable().optional(),
  bank_name: z.string().nullable().optional(),
  zulassungsnummer: z.string().nullable().optional(),
})

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") return null
  return { user, serviceClient }
}

export async function GET() {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data, error } = await auth.serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: "Praxis-Einstellungen nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const body = await request.json()
  const parseResult = praxisSettingsSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten() },
      { status: 422 }
    )
  }

  // Get existing row
  const { data: existing } = await auth.serviceClient
    .from("praxis_settings")
    .select("id")
    .limit(1)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Praxis-Einstellungen nicht gefunden." }, { status: 404 })
  }

  const { data, error } = await auth.serviceClient
    .from("praxis_settings")
    .update(parseResult.data)
    .eq("id", existing.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Fehler beim Speichern." }, { status: 500 })
  }

  return NextResponse.json({ data })
}
