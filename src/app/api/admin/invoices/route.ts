import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

const lineItemSchema = z.object({
  gebueh_ziffer: z.string().nullable().optional(),
  beschreibung: z.string().min(1, "Beschreibung erforderlich"),
  anzahl: z.number().int().min(1),
  einzelpreis: z.number().min(0),
})

const createInvoiceSchema = z.object({
  patient_id: z.string().uuid(),
  treatment_date: z.string(),
  invoice_date: z.string().optional(),
  diagnose_text: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  line_items: z.array(lineItemSchema).min(1, "Mindestens eine Position erforderlich"),
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

/** GET /api/admin/invoices — Liste aller Rechnungen */
export async function GET(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const patientId = searchParams.get("patient_id")

  let query = auth.serviceClient
    .from("invoices")
    .select(`
      *,
      patient:patients!patient_id (vorname, nachname, email)
    `)
    .order("created_at", { ascending: false })
    .limit(200)

  if (status) {
    query = query.eq("status", status)
  }
  if (patientId) {
    query = query.eq("patient_id", patientId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden der Rechnungen." }, { status: 500 })
  }

  return NextResponse.json({ data })
}

/** POST /api/admin/invoices — Neue Rechnung erstellen */
export async function POST(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const body = await request.json()
  const parseResult = createInvoiceSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten() },
      { status: 422 }
    )
  }

  const input = parseResult.data

  // 1. Patient laden
  const { data: patient, error: patientError } = await auth.serviceClient
    .from("patients")
    .select("id, vorname, nachname, strasse, plz, ort")
    .eq("id", input.patient_id)
    .single()

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // 2. Praxis-Daten laden
  const { data: praxis } = await auth.serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) {
    return NextResponse.json(
      { error: "Praxis-Einstellungen nicht konfiguriert. Bitte zuerst einrichten." },
      { status: 400 }
    )
  }

  // 3. Rechnungsnummer generieren
  const { data: invoiceNumberResult } = await auth.serviceClient
    .rpc("generate_invoice_number")

  const invoiceNumber = invoiceNumberResult as string

  // 4. Beträge berechnen
  const lineItems = input.line_items.map((item, index) => ({
    ...item,
    sort_order: index,
    gesamtpreis: Math.round(item.anzahl * item.einzelpreis * 100) / 100,
  }))

  const subtotal = lineItems.reduce((sum, item) => sum + item.gesamtpreis, 0)
  const total = Math.round(subtotal * 100) / 100

  // 5. Invoice-Datum und Fälligkeitsdatum
  const invoiceDate = input.invoice_date || new Date().toISOString().split("T")[0]
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + 14)

  // 6. Patient-Adresse zusammenbauen
  const patientAddress = [patient.strasse, `${patient.plz} ${patient.ort}`]
    .filter(Boolean)
    .join("\n")

  // 7. Rechnung erstellen
  const { data: invoice, error: invoiceError } = await auth.serviceClient
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      patient_id: patient.id,
      created_by: auth.user.id,
      invoice_date: invoiceDate,
      treatment_date: input.treatment_date,
      due_date: dueDate.toISOString().split("T")[0],
      patient_name: `${patient.vorname} ${patient.nachname}`,
      patient_address: patientAddress || null,
      praxis_name: praxis.praxis_name,
      praxis_address: `${praxis.strasse}\n${praxis.plz} ${praxis.ort}`,
      praxis_steuernr: praxis.steuernummer,
      subtotal,
      total,
      diagnose_text: input.diagnose_text || null,
      notes: input.notes || null,
      status: "entwurf",
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Fehler beim Erstellen der Rechnung." }, { status: 500 })
  }

  // 8. Line Items erstellen
  const lineItemRows = lineItems.map((item) => ({
    invoice_id: invoice.id,
    sort_order: item.sort_order,
    gebueh_ziffer: item.gebueh_ziffer || null,
    beschreibung: item.beschreibung,
    anzahl: item.anzahl,
    einzelpreis: item.einzelpreis,
    gesamtpreis: item.gesamtpreis,
  }))

  const { error: lineItemError } = await auth.serviceClient
    .from("invoice_line_items")
    .insert(lineItemRows)

  if (lineItemError) {
    return NextResponse.json({ error: "Fehler beim Erstellen der Positionen." }, { status: 500 })
  }

  return NextResponse.json({ data: invoice }, { status: 201 })
}
