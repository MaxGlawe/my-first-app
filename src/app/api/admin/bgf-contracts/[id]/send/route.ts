/**
 * PROJ-18: POST /api/admin/bgf-contracts/[id]/send
 * Send BGF contract signing link via email to the HR contact.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { generateBgfContractPdf } from "@/lib/pdf/bgf-contract-pdf"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = createSupabaseServiceClient()

  // Load contract
  const { data: contract, error: fetchError } = await sc
    .from("bgf_contracts")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  if (contract.status !== "entwurf") {
    return NextResponse.json(
      { error: `Vertrag kann im Status "${contract.status}" nicht versendet werden.` },
      { status: 400 }
    )
  }

  if (!contract.praxis_signature_png) {
    return NextResponse.json(
      { error: "Bitte zuerst die Praxis-Unterschrift hinzufügen." },
      { status: 400 }
    )
  }

  // Build signing URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const signingUrl = `${siteUrl}/bgf-vertrag/${contract.signing_token}`

  const tierLabels: Record<string, string> = { basic: "Basic", pro: "Professional", enterprise: "Enterprise" }
  const tierLabel = tierLabels[contract.contract_type] ?? contract.contract_type

  // Send email
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #059669; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0;">BGF-Dienstleistungsvertrag</h1>
        <p style="color: #a7f3d0; font-size: 14px; margin: 8px 0 0;">Ihr Vertrag steht zur Unterschrift bereit</p>
      </div>

      <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Sehr geehrte/r ${contract.kontakt_name},
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          ${contract.praxis_name} hat einen BGF-Dienstleistungsvertrag für <strong>${contract.org_name}</strong> erstellt.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; font-size: 14px; color: #475569;">
            <tr><td style="padding: 4px 0;"><strong>Vertragsnummer:</strong></td><td style="text-align: right;">${contract.contract_number}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Tarif:</strong></td><td style="text-align: right;">${tierLabel}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Lizenzen:</strong></td><td style="text-align: right;">${contract.lizenzen} Mitarbeiter</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Monatlich:</strong></td><td style="text-align: right;">${Number(contract.monatlicher_gesamtpreis).toFixed(2)} €</td></tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${signingUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; mso-padding-alt: 0;">
            Vertrag ansehen &amp; unterschreiben
          </a>
        </div>

        <p style="color: #334155; font-size: 12px; text-align: center; background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 24px;">
          Dieser Link ist 14 Tage gültig. Falls der Button nicht funktioniert:<br/>
          <a href="${signingUrl}" style="color: #047857; font-weight: bold; text-decoration: underline;">${signingUrl}</a>
        </p>
      </div>

      <div style="text-align: center; padding: 16px; background: #f1f5f9;">
        <span style="color: #64748b; font-size: 11px;">${contract.praxis_name} · ${contract.praxis_address}</span>
      </div>
    </div>
  `

  // Generate PDF attachment
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await generateBgfContractPdf(contract as any, { includeSignature: false })
  } catch (pdfError) {
    console.error("[POST /api/admin/bgf-contracts/[id]/send] PDF error:", pdfError)
    // Non-fatal: send email without PDF
  }

  try {
    await sendEmail({
      to: contract.kontakt_email,
      subject: `BGF-Vertrag ${contract.contract_number} — ${contract.praxis_name}`,
      html: htmlBody,
      attachments: pdfBuffer
        ? [{ filename: `BGF-Vertrag_${contract.contract_number}.pdf`, content: pdfBuffer }]
        : undefined,
    })
  } catch (emailError) {
    console.error("[POST /api/admin/bgf-contracts/[id]/send] email error:", emailError)
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden." }, { status: 500 })
  }

  // Update status
  const { data: updated, error: updateError } = await sc
    .from("bgf_contracts")
    .update({
      status: "versendet",
      sent_at: new Date().toISOString(),
      sent_to_email: contract.kontakt_email,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (updateError) {
    console.error("[POST /api/admin/bgf-contracts/[id]/send] update error:", updateError)
  }

  return NextResponse.json({ contract: updated ?? contract, message: "Vertrag wurde versendet." })
}
