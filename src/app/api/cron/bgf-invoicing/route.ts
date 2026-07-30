/**
 * PROJ-18: GET /api/cron/bgf-invoicing
 *
 * Cron endpoint — runs DAILY at 06:00 UTC.
 * Checks all signed BGF contracts and creates invoices for those
 * whose billing day matches today.
 *
 * Billing day = day of month when the contract was signed (signed_at).
 * Example: Contract signed on March 15 → invoice every 15th.
 * For months with fewer days (e.g., Feb 28): triggers on last day of month.
 *
 * Security: Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { generateBgfInvoicePdf } from "@/lib/pdf/bgf-invoice-pdf"
import { formatZeitraum } from "@/types/bgf-invoice"
import { getStripe } from "@/lib/stripe"
import type { PraxisSettings } from "@/types/billing"
import { berechneMonatsbetrag, paketVertragsLabel } from "@/lib/bgf-pakete"

function getBillingDay(signedAt: string): number {
  const d = new Date(signedAt)
  return d.getDate()
}

function isLastDayOfMonth(date: Date): boolean {
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.getMonth() !== date.getMonth()
}

function isBillingDayToday(billingDay: number): boolean {
  const today = new Date()
  const todayDay = today.getDate()

  // Exact match
  if (todayDay === billingDay) return true

  // If billing day is 29/30/31 and this month doesn't have that many days,
  // trigger on the last day of the month
  if (billingDay > todayDay && isLastDayOfMonth(today)) {
    const daysInMonth = todayDay // today is last day, so todayDay = max days
    return billingDay > daysInMonth
  }

  return false
}

export async function GET(request: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  const cronHeader = request.headers.get("x-cron-secret")

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && cronHeader === cronSecret) ||
    process.env.NODE_ENV === "development"

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()
  const now = new Date()
  const monat = now.getMonth() + 1
  const jahr = now.getFullYear()

  console.log(`[bgf-invoicing] Daily check for ${now.toISOString().split("T")[0]}...`)

  // Load praxis settings
  const { data: praxisRaw } = await sc.from("praxis_settings").select("*").limit(1).single()
  const praxis: PraxisSettings = praxisRaw ?? {} as PraxisSettings

  // Find all signed BGF contracts
  const { data: contracts } = await sc
    .from("bgf_contracts")
    .select("id, organization_id, lizenzen, preis_pro_ma_monat, monatlicher_gesamtpreis, contract_type, paket_max_ma, paket_label, zusatz_ma_preis, signed_at")
    .eq("status", "unterschrieben")

  if (!contracts || contracts.length === 0) {
    console.log("[bgf-invoicing] No active contracts.")
    return NextResponse.json({ message: "Keine aktiven Verträge.", created: 0 })
  }

  // Filter: only contracts whose billing day is today
  const dueContracts = contracts.filter((c) => {
    if (!c.signed_at) return false
    const billingDay = getBillingDay(c.signed_at)
    return isBillingDayToday(billingDay)
  })

  if (dueContracts.length === 0) {
    console.log(`[bgf-invoicing] No contracts due today.`)
    return NextResponse.json({ message: "Heute keine Abrechnungen fällig.", created: 0 })
  }

  console.log(`[bgf-invoicing] ${dueContracts.length} contracts due today.`)

  // Find admin for created_by
  const { data: admin } = await sc.from("user_profiles").select("id").eq("role", "admin").limit(1).single()
  const adminId = admin?.id ?? "00000000-0000-0000-0000-000000000000"

  const results: {
    org_name: string
    invoice_number: string
    amount: number
    sepa: boolean
    status: string
    error?: string
    hinweis?: string
  }[] = []

  for (const contract of dueContracts) {
    try {
      // Load organization
      const { data: org } = await sc
        .from("organizations")
        .select("id, name, kontakt_name, kontakt_email, adresse_strasse, adresse_plz, adresse_ort, stripe_customer_id")
        .eq("id", contract.organization_id)
        .single()

      if (!org) {
        results.push({ org_name: "?", invoice_number: "—", amount: 0, sepa: false, status: "error", error: "Org nicht gefunden" })
        continue
      }

      // Aktive Mitarbeitende zählen — Grundlage für Nachbesetzungen (§4 Abs. 4)
      const { count: aktiveMa } = await sc
        .from("organization_members")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("status", "aktiv")

      const abrechnung = berechneMonatsbetrag(
        contract.paket_max_ma,
        Number(contract.monatlicher_gesamtpreis),
        aktiveMa ?? contract.lizenzen,
        contract.zusatz_ma_preis == null ? null : Number(contract.zusatz_ma_preis)
      )

      // Duplicate check for this month
      const { data: existing } = await sc
        .from("bgf_invoices")
        .select("id")
        .eq("organization_id", org.id)
        .eq("zeitraum_monat", monat)
        .eq("zeitraum_jahr", jahr)
        .maybeSingle()

      if (existing) {
        console.log(`[bgf-invoicing] ${org.name}: Invoice for ${formatZeitraum(monat, jahr)} exists, skipping.`)
        continue
      }

      // Generate invoice number
      const { data: lastInvoice } = await sc
        .from("bgf_invoices")
        .select("invoice_number")
        .like("invoice_number", `RE-BGF-${jahr}-%`)
        .order("invoice_number", { ascending: false })
        .limit(1)
        .maybeSingle()

      let nextNum = 1
      if (lastInvoice?.invoice_number) {
        const match = lastInvoice.invoice_number.match(/RE-BGF-\d{4}-(\d+)/)
        if (match) nextNum = parseInt(match[1]) + 1
      }
      const invoiceNumber = `RE-BGF-${jahr}-${String(nextNum).padStart(4, "0")}`

      const invoiceDate = now.toISOString().split("T")[0]
      const dueDate = new Date(now)
      dueDate.setDate(dueDate.getDate() + 14)
      const orgAddress = [org.adresse_strasse, org.adresse_plz, org.adresse_ort].filter(Boolean).join(", ")
      const zeitraum = formatZeitraum(monat, jahr)

      // Create invoice
      const { data: invoice, error: insertError } = await sc
        .from("bgf_invoices")
        .insert({
          invoice_number: invoiceNumber,
          organization_id: org.id,
          contract_id: contract.id,
          created_by: adminId,
          zeitraum_monat: monat,
          zeitraum_jahr: jahr,
          lizenzen: aktiveMa ?? contract.lizenzen,
          // Paketpreis + ggf. Nachbesetzungen (Altverträge behalten ihren Pro-Kopf-Preis).
          paket_label: contract.paket_max_ma
            ? paketVertragsLabel(abrechnung.abgerechnetesPaketMaxMa)
            : contract.paket_label,
          zusatz_ma_anzahl: abrechnung.zusatzMa,
          zusatz_ma_preis: abrechnung.zusatzMa > 0 ? abrechnung.zusatzPreisProMa : null,
          preis_pro_ma: contract.preis_pro_ma_monat ?? null,
          gesamtbetrag: abrechnung.gesamt,
          org_name: org.name,
          org_address: orgAddress || null,
          kontakt_name: org.kontakt_name,
          kontakt_email: org.kontakt_email,
          praxis_name: praxis.praxis_name || "Praxis",
          praxis_address: `${praxis.strasse || ""}, ${praxis.plz || ""} ${praxis.ort || ""}`,
          praxis_inhaber: praxis.inhaber_name || "Inhaber",
          praxis_steuernr: (praxis as unknown as Record<string, unknown>).steuernummer as string ?? null,
          praxis_iban: (praxis as unknown as Record<string, unknown>).iban as string ?? "",
          praxis_bic: (praxis as unknown as Record<string, unknown>).bic as string ?? null,
          praxis_bank_name: (praxis as unknown as Record<string, unknown>).bank_name as string ?? null,
          status: "entwurf",
          invoice_date: invoiceDate,
          due_date: dueDate.toISOString().split("T")[0],
        })
        .select("*")
        .single()

      if (insertError || !invoice) {
        results.push({ org_name: org.name, invoice_number: invoiceNumber, amount: 0, sepa: false, status: "error", error: insertError?.message })
        continue
      }

      // Generate PDF
      let pdfBuffer: Buffer | null = null
      try {
        pdfBuffer = await generateBgfInvoicePdf(invoice as any)
      } catch (err) {
        console.error(`[bgf-invoicing] PDF error for ${org.name}:`, err)
      }

      // Send email
      try {
        await sendEmail({
          to: org.kontakt_email,
          subject: `Rechnung ${invoiceNumber} — ${praxis.praxis_name || "Praxis"}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #059669; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Ihre Rechnung</h1>
                <p style="color: #a7f3d0; font-size: 14px; margin: 8px 0 0;">${zeitraum}</p>
              </div>
              <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                <p style="color: #334155; font-size: 15px;">Sehr geehrte/r ${org.kontakt_name},</p>
                <p style="color: #334155; font-size: 15px;">anbei Ihre monatliche BGF-Rechnung.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                  <table style="width: 100%; font-size: 14px; color: #475569;">
                    <tr><td style="padding: 4px 0;"><strong>Rechnungsnr.:</strong></td><td style="text-align: right;">${invoiceNumber}</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Zeitraum:</strong></td><td style="text-align: right;">${zeitraum}</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Netto:</strong></td><td style="text-align: right;">${Number(invoice.gesamtbetrag).toFixed(2)} €</td></tr>
                    <tr><td style="padding: 4px 0;"><strong>zzgl. 19% USt.:</strong></td><td style="text-align: right;">${(Number(invoice.gesamtbetrag) * 0.19).toFixed(2)} €</td></tr>
                    <tr><td style="padding: 4px 0; border-top: 1px solid #e2e8f0;"><strong>Brutto:</strong></td><td style="text-align: right; border-top: 1px solid #e2e8f0;"><strong>${(Number(invoice.gesamtbetrag) * 1.19).toFixed(2)} €</strong></td></tr>
                    <tr><td style="padding: 4px 0;"><strong>Fällig bis:</strong></td><td style="text-align: right;">${dueDate.toLocaleDateString("de-DE")}</td></tr>
                  </table>
                </div>
                <p style="color: #64748b; font-size: 13px;">Die Rechnung finden Sie als PDF im Anhang.</p>
              </div>
              <div style="text-align: center; padding: 16px; background-color: #f1f5f9;">
                <span style="color: #64748b; font-size: 11px;">${praxis.praxis_name} · ${praxis.strasse}, ${praxis.plz} ${praxis.ort}</span>
              </div>
            </div>
          `,
          attachments: pdfBuffer ? [{ filename: `Rechnung_${invoiceNumber}.pdf`, content: pdfBuffer }] : undefined,
        })

        await sc.from("bgf_invoices").update({ status: "versendet", sent_at: new Date().toISOString() }).eq("id", invoice.id)
      } catch (emailErr) {
        console.error(`[bgf-invoicing] Email error for ${org.name}:`, emailErr)
        results.push({ org_name: org.name, invoice_number: invoiceNumber, amount: Number(invoice.gesamtbetrag), sepa: false, status: "email_error" })
        continue
      }

      // SEPA auto-charge
      let sepaCharged = false
      if (org.stripe_customer_id) {
        try {
          const stripe = getStripe()
          const methods = await stripe.paymentMethods.list({ customer: org.stripe_customer_id, type: "sepa_debit" })

          if (methods.data.length > 0) {
            const brutto = Math.round(Number(invoice.gesamtbetrag) * 1.19 * 100)
            await stripe.paymentIntents.create({
              amount: brutto,
              currency: "eur",
              customer: org.stripe_customer_id,
              payment_method: methods.data[0].id,
              off_session: true,
              confirm: true,
              description: `BGF-Rechnung ${invoiceNumber} — ${zeitraum}`,
              metadata: { bgf_invoice_id: invoice.id, invoice_number: invoiceNumber, organization_id: org.id },
            })

            await sc.from("bgf_invoices").update({
              status: "bezahlt",
              paid_at: new Date().toISOString(),
              notes: "Automatisch per SEPA-Lastschrift eingezogen.",
            }).eq("id", invoice.id)
            sepaCharged = true
          }
        } catch (sepaErr) {
          console.error(`[bgf-invoicing] SEPA error for ${org.name}:`, sepaErr)
        }
      }

      // Für den Admin sichtbar machen, wenn das Team aus dem Paket gewachsen ist
      const hinweis = abrechnung.ueberListe
        ? `${aktiveMa} MA — über der Preisliste, individuelles Angebot nötig`
        : abrechnung.paketWechsel
          ? `Paketwechsel: ${aktiveMa} MA → ${paketVertragsLabel(abrechnung.abgerechnetesPaketMaxMa)} (Bestpreis)`
          : abrechnung.zusatzMa > 0
            ? `${abrechnung.zusatzMa} Nachbesetzung(en) à ${abrechnung.zusatzPreisProMa.toFixed(2)} €`
            : undefined

      results.push({
        org_name: org.name,
        invoice_number: invoiceNumber,
        amount: Number(invoice.gesamtbetrag),
        sepa: sepaCharged,
        status: sepaCharged ? "bezahlt" : "versendet",
        hinweis,
      })

    } catch (err) {
      console.error(`[bgf-invoicing] Error:`, err)
      results.push({ org_name: "?", invoice_number: "—", amount: 0, sepa: false, status: "error", error: String(err) })
    }
  }

  // Send summary to admin (only if invoices were created)
  if (results.length > 0) {
    const adminEmail = praxis.email || process.env.SMTP_USER
    if (adminEmail) {
      const zeitraum = formatZeitraum(monat, jahr)
      const rows = results.map((r) =>
        `<tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${r.org_name}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${r.invoice_number}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${r.amount.toFixed(2)} €</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${r.sepa ? "SEPA ✓" : "Überweisung"}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #e2e8f0;">${r.status}${r.hinweis ? `<br><span style="color: #64748b; font-size: 12px;">${r.hinweis}</span>` : ""}</td>
        </tr>`
      ).join("")

      await sendEmail({
        to: adminEmail,
        subject: `BGF-Rechnungen: ${results.length} erstellt am ${now.toLocaleDateString("de-DE")}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto;">
            <div style="background-color: #059669; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; margin: 0;">BGF-Rechnungslauf</h1>
              <p style="color: #a7f3d0; font-size: 14px; margin: 4px 0 0;">${now.toLocaleDateString("de-DE")}</p>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #334155; font-size: 15px;"><strong>${results.length}</strong> Rechnungen erstellt · <strong>${results.filter((r) => r.sepa).length}</strong> per Lastschrift</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px;">
                <thead><tr style="background-color: #f8fafc;">
                  <th style="padding: 8px 12px; text-align: left;">Organisation</th>
                  <th style="padding: 8px 12px; text-align: left;">Nr.</th>
                  <th style="padding: 8px 12px; text-align: right;">Betrag</th>
                  <th style="padding: 8px 12px;">Zahlung</th>
                  <th style="padding: 8px 12px;">Status</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        `,
      }).catch(() => {})
    }
  }

  console.log(`[bgf-invoicing] Done. ${results.length} invoices processed.`)
  return NextResponse.json({ message: `${results.length} Rechnungen verarbeitet.`, created: results.length, results })
}
