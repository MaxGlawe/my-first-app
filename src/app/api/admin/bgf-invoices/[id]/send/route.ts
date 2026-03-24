/**
 * PROJ-18: POST /api/admin/bgf-invoices/[id]/send
 * Send invoice via email with PDF attachment.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { generateBgfInvoicePdf } from "@/lib/pdf/bgf-invoice-pdf"
import { formatZeitraum } from "@/types/bgf-invoice"
import { getStripe } from "@/lib/stripe"

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

  if (invoice.status !== "entwurf") {
    return NextResponse.json({ error: "Rechnung wurde bereits versendet." }, { status: 400 })
  }

  // Generate PDF
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await generateBgfInvoicePdf(invoice as any)
  } catch (err) {
    console.error("[bgf-invoices/send] PDF error:", err)
  }

  const zeitraum = formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)

  await sendEmail({
    to: invoice.kontakt_email,
    subject: `Rechnung ${invoice.invoice_number} — ${invoice.praxis_name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #059669; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Ihre Rechnung</h1>
          <p style="color: #a7f3d0; font-size: 14px; margin: 8px 0 0;">${zeitraum}</p>
        </div>
        <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #334155; font-size: 15px;">Sehr geehrte/r ${invoice.kontakt_name},</p>
          <p style="color: #334155; font-size: 15px;">anbei erhalten Sie die Rechnung für die BGF-Leistungen im Zeitraum <strong>${zeitraum}</strong>.</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; font-size: 14px; color: #475569;">
              <tr><td style="padding: 4px 0;"><strong>Rechnungsnr.:</strong></td><td style="text-align: right;">${invoice.invoice_number}</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Zeitraum:</strong></td><td style="text-align: right;">${zeitraum}</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Betrag:</strong></td><td style="text-align: right;">${Number(invoice.gesamtbetrag).toFixed(2)} €</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Fällig bis:</strong></td><td style="text-align: right;">${new Date(invoice.due_date).toLocaleDateString("de-DE")}</td></tr>
            </table>
          </div>
          <p style="color: #64748b; font-size: 13px;">Die Rechnung finden Sie als PDF im Anhang dieser E-Mail.</p>
          <p style="color: #334155; font-size: 15px;">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          <p style="color: #334155; font-size: 15px;">Mit freundlichen Grüßen<br/><strong>${invoice.praxis_inhaber}</strong></p>
        </div>
        <div style="text-align: center; padding: 16px; background-color: #f1f5f9;">
          <span style="color: #64748b; font-size: 11px;">${invoice.praxis_name} · ${invoice.praxis_address}</span>
        </div>
      </div>
    `,
    attachments: pdfBuffer ? [{ filename: `Rechnung_${invoice.invoice_number}.pdf`, content: pdfBuffer }] : undefined,
  })

  await sc.from("bgf_invoices").update({ status: "versendet", sent_at: new Date().toISOString() }).eq("id", id)

  // Auto-charge via SEPA if set up
  let sepaCharged = false
  try {
    const { data: org } = await sc
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", invoice.organization_id)
      .single()

    if (org?.stripe_customer_id) {
      const stripe = getStripe()
      const methods = await stripe.paymentMethods.list({
        customer: org.stripe_customer_id,
        type: "sepa_debit",
      })

      if (methods.data.length > 0) {
        // Calculate brutto (netto + 19% USt)
        const netto = Number(invoice.gesamtbetrag)
        const brutto = Math.round((netto * 1.19) * 100) // in cents

        await stripe.paymentIntents.create({
          amount: brutto,
          currency: "eur",
          customer: org.stripe_customer_id,
          payment_method: methods.data[0].id,
          off_session: true,
          confirm: true,
          description: `BGF-Rechnung ${invoice.invoice_number} — ${formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)}`,
          metadata: {
            bgf_invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            organization_id: invoice.organization_id,
          },
        })
        sepaCharged = true

        // Auto-mark as paid (SEPA takes 5-14 business days to clear but intent is confirmed)
        await sc.from("bgf_invoices").update({
          status: "bezahlt",
          paid_at: new Date().toISOString(),
          notes: (invoice.notes ? invoice.notes + "\n" : "") + "Automatisch per SEPA-Lastschrift eingezogen.",
        }).eq("id", id)
      }
    }
  } catch (sepaError) {
    console.error("[bgf-invoices/send] SEPA charge error:", sepaError)
    // Non-fatal: invoice was sent, payment just didn't auto-charge
  }

  return NextResponse.json({
    message: sepaCharged
      ? "Rechnung versendet & Lastschrift eingezogen."
      : "Rechnung versendet.",
    sepa_charged: sepaCharged,
  })
}
