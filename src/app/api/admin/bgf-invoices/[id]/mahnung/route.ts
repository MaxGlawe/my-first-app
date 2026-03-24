/**
 * PROJ-18: POST /api/admin/bgf-invoices/[id]/mahnung
 * Send dunning notice (1st or 2nd level).
 * Body: { stufe: 1 | 2 }
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { generateBgfInvoicePdf } from "@/lib/pdf/bgf-invoice-pdf"
import { formatZeitraum } from "@/types/bgf-invoice"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  let body: { stufe?: number }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const stufe = body.stufe
  if (stufe !== 1 && stufe !== 2) {
    return NextResponse.json({ error: "stufe muss 1 oder 2 sein." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()
  const { data: invoice } = await sc.from("bgf_invoices").select("*").eq("id", id).single()
  if (!invoice) return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })

  // Validate status transitions
  if (stufe === 1 && !["versendet", "ueberfaellig"].includes(invoice.status)) {
    return NextResponse.json({ error: "1. Mahnung nur für offene/überfällige Rechnungen." }, { status: 400 })
  }
  if (stufe === 2 && invoice.status !== "gemahnt_1") {
    return NextResponse.json({ error: "2. Mahnung nur nach 1. Mahnung." }, { status: 400 })
  }

  const zeitraum = formatZeitraum(invoice.zeitraum_monat, invoice.zeitraum_jahr)
  const mahngebuehr = stufe === 1 ? 5.00 : 10.00
  const newDueDate = new Date()
  newDueDate.setDate(newDueDate.getDate() + (stufe === 1 ? 14 : 7))

  // Update invoice with Mahngebühr
  const updateData = stufe === 1
    ? { mahngebuehr_1: mahngebuehr, status: "gemahnt_1", mahnung1_sent_at: new Date().toISOString() }
    : { mahngebuehr_2: mahngebuehr, status: "gemahnt_2", mahnung2_sent_at: new Date().toISOString() }

  await sc.from("bgf_invoices").update(updateData).eq("id", id)

  // Reload for PDF generation
  const { data: updatedInvoice } = await sc.from("bgf_invoices").select("*").eq("id", id).single()

  // Generate updated PDF with Mahngebühren
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await generateBgfInvoicePdf(updatedInvoice as any)
  } catch (err) {
    console.error("[bgf-invoices/mahnung] PDF error:", err)
  }

  const totalWithFees = Number(invoice.gesamtbetrag) +
    (stufe >= 1 ? (updatedInvoice?.mahngebuehr_1 ?? mahngebuehr) : 0) +
    (stufe >= 2 ? mahngebuehr : 0)

  if (stufe === 1) {
    await sendEmail({
      to: invoice.kontakt_email,
      subject: `1. Mahnung — Rechnung ${invoice.invoice_number}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea580c; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">1. Mahnung</h1>
          </div>
          <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #334155; font-size: 15px;">Sehr geehrte/r ${invoice.kontakt_name},</p>
            <p style="color: #334155; font-size: 15px;">
              leider konnten wir für die Rechnung <strong>${invoice.invoice_number}</strong> (${zeitraum})
              trotz Fälligkeit am ${new Date(invoice.due_date).toLocaleDateString("de-DE")} keinen Zahlungseingang feststellen.
            </p>
            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; font-size: 14px; color: #9a3412;">
                <tr><td><strong>Rechnungsbetrag:</strong></td><td style="text-align: right;">${Number(invoice.gesamtbetrag).toFixed(2)} €</td></tr>
                <tr><td><strong>Mahngebühr:</strong></td><td style="text-align: right;">${mahngebuehr.toFixed(2)} €</td></tr>
                <tr><td style="border-top: 1px solid #fed7aa; padding-top: 8px;"><strong>Gesamtbetrag:</strong></td><td style="text-align: right; border-top: 1px solid #fed7aa; padding-top: 8px;"><strong>${totalWithFees.toFixed(2)} €</strong></td></tr>
              </table>
            </div>
            <p style="color: #334155; font-size: 15px;">
              Wir bitten Sie, den ausstehenden Betrag bis zum <strong>${newDueDate.toLocaleDateString("de-DE")}</strong> zu überweisen.
            </p>
            <p style="color: #64748b; font-size: 13px;">Verwendungszweck: ${invoice.invoice_number}</p>
            <p style="color: #334155; font-size: 15px; margin-top: 16px;">Mit freundlichen Grüßen<br/><strong>${invoice.praxis_inhaber}</strong></p>
          </div>
          <div style="text-align: center; padding: 16px; background-color: #f1f5f9;">
            <span style="color: #64748b; font-size: 11px;">${invoice.praxis_name} · ${invoice.praxis_address}</span>
          </div>
        </div>
      `,
      attachments: pdfBuffer ? [{ filename: `Mahnung_${invoice.invoice_number}.pdf`, content: pdfBuffer }] : undefined,
    })
  } else {
    await sendEmail({
      to: invoice.kontakt_email,
      subject: `2. Mahnung (letzte Aufforderung) — Rechnung ${invoice.invoice_number}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">2. Mahnung — Letzte Aufforderung</h1>
          </div>
          <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #334155; font-size: 15px;">Sehr geehrte/r ${invoice.kontakt_name},</p>
            <p style="color: #334155; font-size: 15px;">
              trotz unserer vorherigen Mahnung konnten wir für die Rechnung <strong>${invoice.invoice_number}</strong> (${zeitraum})
              noch immer keinen Zahlungseingang feststellen.
            </p>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; font-size: 14px; color: #991b1b;">
                <tr><td><strong>Rechnungsbetrag:</strong></td><td style="text-align: right;">${Number(invoice.gesamtbetrag).toFixed(2)} €</td></tr>
                <tr><td><strong>Mahngebühr 1. Mahnung:</strong></td><td style="text-align: right;">${Number(updatedInvoice?.mahngebuehr_1 ?? 5).toFixed(2)} €</td></tr>
                <tr><td><strong>Mahngebühr 2. Mahnung:</strong></td><td style="text-align: right;">${mahngebuehr.toFixed(2)} €</td></tr>
                <tr><td style="border-top: 1px solid #fecaca; padding-top: 8px;"><strong>Gesamtbetrag:</strong></td><td style="text-align: right; border-top: 1px solid #fecaca; padding-top: 8px;"><strong>${totalWithFees.toFixed(2)} €</strong></td></tr>
              </table>
            </div>
            <p style="color: #dc2626; font-size: 15px; font-weight: bold;">
              Wir fordern Sie letztmalig auf, den ausstehenden Betrag bis zum ${newDueDate.toLocaleDateString("de-DE")} zu überweisen.
            </p>
            <p style="color: #334155; font-size: 15px;">
              Sollte bis zu diesem Datum kein Zahlungseingang vorliegen, behalten wir uns vor, den Vorgang ohne weitere Ankündigung an ein Inkassounternehmen zu übergeben. Die daraus entstehenden zusätzlichen Kosten gehen zu Ihren Lasten.
            </p>
            <p style="color: #64748b; font-size: 13px;">Verwendungszweck: ${invoice.invoice_number}</p>
            <p style="color: #334155; font-size: 15px; margin-top: 16px;">Mit freundlichen Grüßen<br/><strong>${invoice.praxis_inhaber}</strong></p>
          </div>
          <div style="text-align: center; padding: 16px; background-color: #f1f5f9;">
            <span style="color: #64748b; font-size: 11px;">${invoice.praxis_name} · ${invoice.praxis_address}</span>
          </div>
        </div>
      `,
      attachments: pdfBuffer ? [{ filename: `Mahnung_2_${invoice.invoice_number}.pdf`, content: pdfBuffer }] : undefined,
    })
  }

  return NextResponse.json({ message: `${stufe}. Mahnung versendet.` })
}
