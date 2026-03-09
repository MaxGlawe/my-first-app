import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

/** GET /api/me/invoices — Eigene Rechnungen (Patienten-Ansicht) */
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()

  // Patient-ID über user_id Bridge ermitteln
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ data: [] })
  }

  const { data: invoices, error } = await serviceClient
    .from("invoices")
    .select(`
      id, invoice_number, invoice_date, treatment_date, due_date,
      total, status, paid_at,
      line_items:invoice_line_items (
        id, gebueh_ziffer, beschreibung, anzahl, einzelpreis, gesamtpreis, sort_order
      )
    `)
    .eq("patient_id", patient.id)
    .neq("status", "entwurf")
    .order("invoice_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 })
  }

  // Sort line items
  for (const inv of invoices || []) {
    if (inv.line_items) {
      inv.line_items.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    }
  }

  return NextResponse.json({ data: invoices })
}
