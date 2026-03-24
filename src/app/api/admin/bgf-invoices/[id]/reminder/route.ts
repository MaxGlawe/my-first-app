/**
 * PROJ-18: POST /api/admin/bgf-invoices/[id]/reminder
 * Send friendly payment reminder.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { formatZeitraum } from "@/types/bgf-invoice"

export async function POST(
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

  if (!["versendet", "ueberfaellig"].includes(invoice.status)) {
    return NextResponse.json({ error: "Erinnerung nur für offene Rechnungen." }, { status: 400 })
  }

  const zeitraum = formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)

  await sendEmail({
    to: invoice.kontakt_email,
    subject: `Zahlungserinnerung — Rechnung ${invoice.invoice_number}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #d97706; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Freundliche Zahlungserinnerung</h1>
        </div>
        <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #334155; font-size: 15px;">Sehr geehrte/r ${invoice.kontakt_name},</p>
          <p style="color: #334155; font-size: 15px;">
            wir möchten Sie freundlich daran erinnern, dass die Rechnung <strong>${invoice.invoice_number}</strong>
            für den Zeitraum ${zeitraum} in Höhe von <strong>${Number(invoice.gesamtbetrag).toFixed(2)} €</strong>
            am ${new Date(invoice.due_date).toLocaleDateString("de-DE")} fällig war.
          </p>
          <p style="color: #334155; font-size: 15px;">
            Sollte die Zahlung bereits veranlasst sein, betrachten Sie dieses Schreiben bitte als gegenstandslos.
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Verwendungszweck: ${invoice.invoice_number}</p>
          <p style="color: #334155; font-size: 15px; margin-top: 16px;">Mit freundlichen Grüßen<br/><strong>${invoice.praxis_inhaber}</strong></p>
        </div>
        <div style="text-align: center; padding: 16px; background-color: #f1f5f9;">
          <span style="color: #64748b; font-size: 11px;">${invoice.praxis_name} · ${invoice.praxis_address}</span>
        </div>
      </div>
    `,
  })

  await sc.from("bgf_invoices").update({
    reminder_sent_at: new Date().toISOString(),
    status: "ueberfaellig",
  }).eq("id", id)

  return NextResponse.json({ message: "Zahlungserinnerung versendet." })
}
