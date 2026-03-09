import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"
import { generateToken } from "@/lib/tokens"
import { generateVertragText } from "@/lib/contract-templates"
import type { PraxisSettings } from "@/types/billing"
import type { ContractType, Leistung } from "@/types/contract"

const createContractSchema = z.object({
  patient_id: z.string().uuid(),
  contract_type: z.enum(["einzelsitzung", "mini_reha_post_op", "chronik_programm"]),
  leistungen: z.array(z.object({
    beschreibung: z.string().min(1),
    preis: z.number().min(0),
    details: z.string().optional(),
  })).min(1),
  gesamtpreis: z.number().min(0),
  zahlungsweise: z.enum(["einmalig", "pro_sitzung"]),
  dauer_wochen: z.number().int().positive().optional(),
  sitzungen_anzahl: z.number().int().positive().optional(),
  notes: z.string().optional(),
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

export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const patientId = searchParams.get("patient_id")

  let query = auth.serviceClient
    .from("treatment_contracts")
    .select("*, patient:patients(vorname, nachname, email)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (auth.role !== "admin") {
    query = query.eq("created_by", auth.user.id)
  }
  if (status) query = query.eq("status", status)
  if (patientId) query = query.eq("patient_id", patientId)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const body = await request.json()
  const parseResult = createContractSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten() },
      { status: 422 }
    )
  }

  const input = parseResult.data

  // Load patient data for snapshot
  const { data: patient } = await auth.serviceClient
    .from("patients")
    .select("vorname, nachname, email, strasse, plz, ort, geburtsdatum")
    .eq("id", input.patient_id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  if (!patient.email) {
    return NextResponse.json({ error: "Patient hat keine E-Mail-Adresse." }, { status: 422 })
  }

  // Load praxis settings for snapshot
  const { data: praxis } = await auth.serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen nicht konfiguriert." }, { status: 422 })
  }

  // Generate contract number
  const { data: contractNumber } = await auth.serviceClient
    .rpc("generate_contract_number")

  if (!contractNumber) {
    return NextResponse.json({ error: "Fehler bei Vertragsnummer-Generierung." }, { status: 500 })
  }

  const patientName = `${patient.vorname} ${patient.nachname}`
  const patientAddress = patient.strasse
    ? `${patient.strasse}\n${patient.plz || ""} ${patient.ort || ""}`.trim()
    : null

  // Generate contract text
  const vertragText = generateVertragText({
    contractType: input.contract_type as ContractType,
    leistungen: input.leistungen as Leistung[],
    gesamtpreis: input.gesamtpreis,
    zahlungsweise: input.zahlungsweise,
    dauerWochen: input.dauer_wochen,
    sitzungenAnzahl: input.sitzungen_anzahl,
    praxis: praxis as PraxisSettings,
    patientName,
    patientAddress,
    patientGeburtsdatum: patient.geburtsdatum,
  })

  // Generate signing token
  const signingToken = generateToken()
  const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: contract, error } = await auth.serviceClient
    .from("treatment_contracts")
    .insert({
      contract_number: contractNumber,
      patient_id: input.patient_id,
      created_by: auth.user.id,
      contract_type: input.contract_type,
      leistungen: input.leistungen,
      gesamtpreis: input.gesamtpreis,
      zahlungsweise: input.zahlungsweise,
      dauer_wochen: input.dauer_wochen || null,
      sitzungen_anzahl: input.sitzungen_anzahl || null,
      vertrag_text: vertragText,
      praxis_name: praxis.praxis_name,
      praxis_address: `${praxis.strasse}, ${praxis.plz} ${praxis.ort}`,
      praxis_inhaber: praxis.inhaber_name,
      praxis_zulassung: praxis.zulassungsnummer,
      patient_name: patientName,
      patient_address: patientAddress,
      patient_email: patient.email,
      patient_geburtsdatum: patient.geburtsdatum,
      signing_token: signingToken,
      token_expires_at: tokenExpiresAt,
      status: "entwurf",
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[Contracts] Create error:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen." }, { status: 500 })
  }

  return NextResponse.json({ data: contract }, { status: 201 })
}
