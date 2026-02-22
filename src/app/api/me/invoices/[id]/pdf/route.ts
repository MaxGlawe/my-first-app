import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf"

/** GET /api/me/invoices/[id]/pdf — Patient: eigene Rechnung als PDF */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()

  // Patient ermitteln
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Kein Patient-Profil." }, { status: 403 })
  }

  // Invoice ID aus URL
  const segments = request.nextUrl.pathname.split("/")
  const id = segments[segments.length - 2]
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige Rechnungs-ID." }, { status: 400 })
  }

  // Invoice laden (nur eigene, keine Entwürfe)
  const { data: invoice, error: invoiceError } = await serviceClient
    .from("invoices")
    .select(`
      *,
      line_items:invoice_line_items (*)
    `)
    .eq("id", id)
    .eq("patient_id", patient.id)
    .neq("status", "entwurf")
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })
  }

  if (invoice.line_items) {
    invoice.line_items.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  }

  const { data: praxis } = await serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen fehlen." }, { status: 500 })
  }

  const pdfBytes = await generateInvoicePdf(invoice, praxis)

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Rechnung_${invoice.invoice_number}.pdf"`,
    },
  })
}
