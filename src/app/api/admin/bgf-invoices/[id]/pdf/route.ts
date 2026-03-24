/**
 * PROJ-18: GET /api/admin/bgf-invoices/[id]/pdf
 * Generate and return invoice PDF.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateBgfInvoicePdf } from "@/lib/pdf/bgf-invoice-pdf"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()
  const { data: invoice } = await sc.from("bgf_invoices").select("*").eq("id", id).single()
  if (!invoice) return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })

  const pdfBuffer = await generateBgfInvoicePdf(invoice as any)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Rechnung_${invoice.invoice_number}.pdf"`,
    },
  })
}
