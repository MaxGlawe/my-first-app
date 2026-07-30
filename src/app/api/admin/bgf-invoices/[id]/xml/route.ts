/**
 * GET /api/admin/bgf-invoices/[id]/xml
 *
 * Liefert das Factur-X/EN-16931-XML einer Rechnung als eigene Datei.
 *
 * Im PDF ist dasselbe XML bereits eingebettet — dort aber unsichtbar, weil
 * Anhänge nur von wenigen Betrachtern angezeigt werden. Dieser Endpunkt macht
 * es prüfbar: zum Gegenlesen, für Validatoren und für Buchhaltungssysteme,
 * die lieber reines XML entgegennehmen als die PDF-Variante.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { buildFacturXXml } from "@/lib/erechnung/factur-x-xml"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data: invoice } = await sc
    .from("bgf_invoices")
    .select("*")
    .eq("id", id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })
  }

  const xml = buildFacturXXml(invoice as never)

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="factur-x_${invoice.invoice_number}.xml"`,
    },
  })
}
