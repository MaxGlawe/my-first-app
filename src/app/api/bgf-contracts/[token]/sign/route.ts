/**
 * PROJ-18: POST /api/bgf-contracts/[token]/sign
 * Public route — sign BGF contract digitally.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { generateBgfContractPdf } from "@/lib/pdf/bgf-contract-pdf"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  let body: { signature_png?: string; consent?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  if (!body.signature_png || body.signature_png.length < 100) {
    return NextResponse.json({ error: "Unterschrift fehlt oder ist ungültig." }, { status: 400 })
  }

  if (body.consent !== true) {
    return NextResponse.json({ error: "Einverständnis erforderlich." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()

  // Load contract
  const { data: contract, error: fetchError } = await sc
    .from("bgf_contracts")
    .select("*")
    .eq("signing_token", token)
    .single()

  if (fetchError || !contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  // Validate status
  if (contract.status === "unterschrieben") {
    return NextResponse.json({ error: "Vertrag wurde bereits unterschrieben." }, { status: 409 })
  }

  if (!["entwurf", "versendet"].includes(contract.status)) {
    return NextResponse.json({ error: "Vertrag kann nicht unterschrieben werden." }, { status: 400 })
  }

  // Check token expiry
  if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
    await sc.from("bgf_contracts").update({ status: "abgelaufen" }).eq("id", contract.id)
    return NextResponse.json({ error: "Der Link ist abgelaufen." }, { status: 410 })
  }

  // Capture signer metadata
  const signerIp = request.headers.get("x-forwarded-for")
    || request.headers.get("x-real-ip")
    || "unknown"
  const signerUa = request.headers.get("user-agent") || "unknown"

  const signedAt = new Date().toISOString()
  const widerrufBis = new Date()
  widerrufBis.setDate(widerrufBis.getDate() + 14)

  // Update contract
  const { data: updated, error: updateError } = await sc
    .from("bgf_contracts")
    .update({
      status: "unterschrieben",
      signed_at: signedAt,
      signature_png: body.signature_png,
      signer_ip: signerIp,
      signer_user_agent: signerUa,
      signer_consent: true,
      widerruf_bis: widerrufBis.toISOString().split("T")[0],
    })
    .eq("id", contract.id)
    .select("id, signed_at, widerruf_bis, contract_number")
    .single()

  if (updateError) {
    console.error("[POST /api/bgf-contracts/[token]/sign] update error:", updateError)
    return NextResponse.json({ error: "Unterschrift konnte nicht gespeichert werden." }, { status: 500 })
  }

  // Async: generate signed PDF + send confirmation email (non-blocking)
  const tierLabels: Record<string, string> = { basic: "Basic", pro: "Professional", enterprise: "Enterprise" }

  // Build signed contract for PDF generation
  const signedContract = {
    ...contract,
    status: "unterschrieben",
    signed_at: signedAt,
    signature_png: body.signature_png,
    signer_ip: signerIp,
  }

  generateBgfContractPdf(signedContract as any, { includeSignature: true })
    .then((pdfBuffer) => {
      return sendEmail({
        to: contract.kontakt_email,
        subject: `BGF-Vertrag ${contract.contract_number} erfolgreich unterschrieben`,
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #059669; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Vertrag erfolgreich unterschrieben!</h1>
        </div>
        <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #334155; font-size: 15px;">
            Sehr geehrte/r ${contract.kontakt_name},
          </p>
          <p style="color: #334155; font-size: 15px;">
            Vielen Dank! Der BGF-Dienstleistungsvertrag für <strong>${contract.org_name}</strong> wurde erfolgreich unterschrieben.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; font-size: 14px; color: #166534;">
              <tr><td><strong>Vertragsnummer:</strong></td><td style="text-align: right;">${contract.contract_number}</td></tr>
              <tr><td><strong>Tarif:</strong></td><td style="text-align: right;">${tierLabels[contract.contract_type] ?? contract.contract_type}</td></tr>
              <tr><td><strong>Unterschrieben am:</strong></td><td style="text-align: right;">${new Date(signedAt).toLocaleDateString("de-DE")}</td></tr>
            </table>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            Sie haben ein vertragliches Rücktrittsrecht innerhalb von 14 Tagen (bis zum ${widerrufBis.toLocaleDateString("de-DE")}).
          </p>
          <p style="color: #334155; font-size: 15px;">
            Wir freuen uns auf die Zusammenarbeit und die Gesundheit Ihrer Mitarbeitenden!
          </p>
        </div>
        <div style="text-align: center; padding: 16px; background-color: #f1f5f9;">
          <span style="color: #64748b; font-size: 11px;">${contract.praxis_name} · ${contract.praxis_address}</span>
        </div>
      </div>
    `,
        attachments: [{ filename: `BGF-Vertrag_${contract.contract_number}_signiert.pdf`, content: pdfBuffer }],
      })
    })
    .catch((err) => console.error("[bgf-contract sign] confirmation email error:", err))

  return NextResponse.json({
    message: "Vertrag erfolgreich unterschrieben.",
    signed_at: updated?.signed_at,
    widerruf_bis: updated?.widerruf_bis,
    contract_number: updated?.contract_number,
  })
}
