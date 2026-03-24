/**
 * Auto-Invoice Generation for Subscription Payments
 *
 * Creates a Heilpraktiker invoice (GebüH) when a Stripe subscription payment succeeds.
 * Pure Heilpraktiker language — no app/software mention for insurance reimbursement.
 */

import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf"
import { sendEmail } from "@/lib/email"
import type { InvoiceWithItems, PraxisSettings } from "@/types/billing"

interface SubscriptionPaymentInfo {
  stripeCustomerId: string
  amountPaid: number          // in EUR (e.g. 14.99)
  periodStart: string         // ISO date
  periodEnd: string           // ISO date
  stripeInvoiceId: string     // for idempotency
}

/**
 * Creates a Heilpraktiker invoice for a subscription payment,
 * generates a PDF, and emails it to the patient.
 */
export async function createSubscriptionInvoice(info: SubscriptionPaymentInfo) {
  const supabase = createSupabaseServiceClient()

  // ── 1. Idempotency: check if we already created an invoice for this Stripe invoice ──
  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("notes", `stripe_invoice:${info.stripeInvoiceId}`)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log(`[Auto-Invoice] Already created for Stripe invoice ${info.stripeInvoiceId}, skipping.`)
    return
  }

  // ── 2. Find patient via stripe_customer_id ──
  const { data: subscription } = await supabase
    .from("patient_subscriptions")
    .select("patient_id, plan_type, price_amount, gebuh_ziffer, activated_by")
    .eq("stripe_customer_id", info.stripeCustomerId)
    .single()

  if (!subscription) {
    console.error(`[Auto-Invoice] No subscription found for customer ${info.stripeCustomerId}`)
    return
  }

  // ── 3. Load patient details ──
  const { data: patient } = await supabase
    .from("patients")
    .select("id, vorname, nachname, email, strasse, plz, ort")
    .eq("id", subscription.patient_id)
    .single()

  if (!patient) {
    console.error(`[Auto-Invoice] Patient ${subscription.patient_id} not found`)
    return
  }

  // ── 4. Load praxis settings ──
  const { data: praxis } = await supabase
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) {
    console.error("[Auto-Invoice] Praxis settings not configured")
    return
  }

  // ── 5. Generate invoice number ──
  const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number")
  if (!invoiceNumber) {
    console.error("[Auto-Invoice] Failed to generate invoice number")
    return
  }

  // ── 6. Build invoice data ──
  // Single date (today) as treatment date — no date range, looks like a normal consultation
  const invoiceDate = new Date().toISOString().split("T")[0]
  const treatmentDate = invoiceDate
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  const patientName = `${patient.vorname} ${patient.nachname}`
  const patientAddress = [patient.strasse, `${patient.plz} ${patient.ort}`]
    .filter(Boolean)
    .join("\n")

  // ── 6b. Determine created_by (admin user who activated the subscription) ──
  let createdBy = subscription.activated_by
  if (!createdBy) {
    // Fallback: first admin user
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single()
    createdBy = admin?.id ?? null
  }
  if (!createdBy) {
    console.error("[Auto-Invoice] No admin user found for created_by")
    return
  }

  // GebüH Ziffer from subscription (default "4" for Eingehende Beratung)
  const gebuehZiffer = subscription.gebuh_ziffer || "4"
  const amount = info.amountPaid

  // Exact GebüH text — no date range, no app mention
  const beschreibung = "Eingehende Beratung"

  // ── 7. Create invoice record ──
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber as string,
      patient_id: patient.id,
      created_by: createdBy,
      invoice_date: invoiceDate,
      treatment_date: treatmentDate,
      due_date: dueDate.toISOString().split("T")[0],
      patient_name: patientName,
      patient_address: patientAddress || null,
      praxis_name: praxis.praxis_name,
      praxis_address: `${praxis.strasse}\n${praxis.plz} ${praxis.ort}`,
      praxis_steuernr: praxis.steuernummer,
      subtotal: amount,
      total: amount,
      diagnose_text: null,
      notes: `stripe_invoice:${info.stripeInvoiceId}`,
      status: "bezahlt",
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    console.error("[Auto-Invoice] Failed to create invoice:", invoiceError)
    return
  }

  // ── 8. Create line item ──
  const { error: lineItemError } = await supabase
    .from("invoice_line_items")
    .insert({
      invoice_id: invoice.id,
      sort_order: 0,
      gebueh_ziffer: gebuehZiffer,
      beschreibung,
      anzahl: 1,
      einzelpreis: amount,
      gesamtpreis: amount,
    })

  if (lineItemError) {
    console.error("[Auto-Invoice] Failed to create line item:", lineItemError)
    return
  }

  // ── 9. Mark as paid ──
  await supabase
    .from("invoices")
    .update({ paid_at: new Date().toISOString() })
    .eq("id", invoice.id)

  console.log(`[Auto-Invoice] Created invoice ${invoiceNumber} for patient ${patientName}`)

  // ── 10. Generate PDF and send email ──
  try {
    // Build the full invoice object for PDF generation
    const invoiceWithItems: InvoiceWithItems = {
      ...invoice,
      line_items: [{
        id: "",
        invoice_id: invoice.id,
        sort_order: 0,
        gebueh_ziffer: gebuehZiffer,
        beschreibung,
        anzahl: 1,
        einzelpreis: amount,
        gesamtpreis: amount,
        created_at: new Date().toISOString(),
      }],
    }

    const pdfBuffer = await generateInvoicePdf(
      invoiceWithItems,
      praxis as PraxisSettings
    )

    // Only send email if patient has an email address
    if (patient.email) {
      const result = await sendEmail({
        to: patient.email,
        subject: `Ihre Rechnung ${invoiceNumber} — ${praxis.praxis_name}`,
        html: buildInvoiceEmailHtml(patientName, invoiceNumber as string, praxis, amount, treatmentDate),
        attachments: [{
          filename: `Rechnung_${invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer),
        }],
      })

      if (result.success) {
        console.log(`[Auto-Invoice] Email sent to ${patient.email}`)
      } else {
        console.error(`[Auto-Invoice] Email failed:`, result.error)
      }
    } else {
      console.warn(`[Auto-Invoice] Patient ${patientName} has no email, skipping email send`)
    }
  } catch (err) {
    // PDF/email failure should not break the webhook response
    console.error("[Auto-Invoice] PDF/Email error:", err)
  }
}

// ── Helpers ──

function fmtDateDE(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function buildInvoiceEmailHtml(
  patientName: string,
  invoiceNumber: string,
  praxis: { praxis_name: string; inhaber_name: string; telefon: string | null; email: string | null },
  amount: number,
  dateStr: string,
): string {
  const amountStr = amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
  const dateFormatted = fmtDateDE(dateStr)

  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="border-bottom: 3px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #0f172a;">${praxis.praxis_name}</h2>
    <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">${praxis.inhaber_name}</p>
  </div>

  <p>Sehr geehrte/r ${patientName},</p>

  <p>anbei erhalten Sie Ihre Rechnung <strong>${invoiceNumber}</strong> vom ${dateFormatted}.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f1f5f9;">
      <td style="padding: 10px 12px; font-size: 14px; color: #64748b;">Rechnungsnummer</td>
      <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: right;">${invoiceNumber}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; font-size: 14px; color: #64748b;">Behandlungsdatum</td>
      <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: right;">${dateFormatted}</td>
    </tr>
    <tr style="background: #f1f5f9;">
      <td style="padding: 10px 12px; font-size: 14px; color: #64748b;">Leistung</td>
      <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: right;">Eingehende Beratung (Zi. 4)</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; font-size: 14px; color: #64748b;">Betrag</td>
      <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: right;">${amountStr}</td>
    </tr>
    <tr style="background: #f1f5f9;">
      <td style="padding: 10px 12px; font-size: 14px; color: #64748b;">Status</td>
      <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; text-align: right; color: #10b981;">Bezahlt</td>
    </tr>
  </table>

  <p style="font-size: 14px; color: #64748b;">
    Die Rechnung ist als PDF beigefügt. Diese Rechnung ist nach dem Gebührenverzeichnis
    für Heilpraktiker (GebüH) erstellt und kann bei Ihrer Versicherung zur Erstattung
    eingereicht werden.
  </p>

  <p style="font-size: 14px; color: #64748b;">
    Bei Fragen stehen wir Ihnen gerne zur Verfügung${praxis.telefon ? ` unter Tel. ${praxis.telefon}` : ""}${praxis.email ? ` oder per E-Mail an ${praxis.email}` : ""}.
  </p>

  <p style="margin-top: 24px;">Mit freundlichen Grüßen,<br><strong>${praxis.inhaber_name}</strong><br>${praxis.praxis_name}</p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
    Heilpraktiker gem. §1 HeilprG · Umsatzsteuerbefreit gem. §4 Nr. 14 UStG
  </div>
</body>
</html>`
}
