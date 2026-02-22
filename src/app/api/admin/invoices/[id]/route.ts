import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"

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

function getInvoiceId(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split("/")
  const id = segments[segments.length - 1]
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null
  return id
}

/** GET /api/admin/invoices/[id] — Einzelne Rechnung mit Line Items */
export async function GET(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const id = getInvoiceId(request)
  if (!id) {
    return NextResponse.json({ error: "Ungültige Rechnungs-ID." }, { status: 400 })
  }

  const { data: invoice, error } = await auth.serviceClient
    .from("invoices")
    .select(`
      *,
      patient:patients!patient_id (vorname, nachname, email, telefon),
      line_items:invoice_line_items (*)
    `)
    .eq("id", id)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })
  }

  // Sort line items by sort_order
  if (invoice.line_items) {
    invoice.line_items.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  }

  return NextResponse.json({ data: invoice })
}

const updateInvoiceSchema = z.object({
  status: z.enum(["entwurf", "offen", "bezahlt", "ueberfaellig", "storniert"]).optional(),
  diagnose_text: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  treatment_date: z.string().optional(),
  invoice_date: z.string().optional(),
})

/** PATCH /api/admin/invoices/[id] — Rechnung aktualisieren */
export async function PATCH(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const id = getInvoiceId(request)
  if (!id) {
    return NextResponse.json({ error: "Ungültige Rechnungs-ID." }, { status: 400 })
  }

  const body = await request.json()
  const parseResult = updateInvoiceSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validierungsfehler.", details: parseResult.error.flatten() },
      { status: 422 }
    )
  }

  const updates: Record<string, unknown> = { ...parseResult.data }

  // Status-spezifische Timestamps
  if (updates.status === "bezahlt") {
    updates.paid_at = new Date().toISOString()
  }
  if (updates.status === "storniert") {
    updates.cancelled_at = new Date().toISOString()
  }

  const { data, error } = await auth.serviceClient
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 })
  }

  return NextResponse.json({ data })
}
