import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf"

/** GET /api/admin/invoices/[id]/pdf — Rechnung als PDF generieren */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Extract invoice ID from path: /api/admin/invoices/[id]/pdf
  const segments = request.nextUrl.pathname.split("/")
  const id = segments[segments.length - 2]
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige Rechnungs-ID." }, { status: 400 })
  }

  // Load invoice with line items
  const { data: invoice, error: invoiceError } = await serviceClient
    .from("invoices")
    .select(`
      *,
      line_items:invoice_line_items (*)
    `)
    .eq("id", id)
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })
  }

  // Sort line items
  if (invoice.line_items) {
    invoice.line_items.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  }

  // Load praxis settings
  const { data: praxis } = await serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen nicht konfiguriert." }, { status: 400 })
  }

  // Generate PDF
  const pdfBytes = await generateInvoicePdf(invoice, praxis)

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Rechnung_${invoice.invoice_number}.pdf"`,
    },
  })
}
