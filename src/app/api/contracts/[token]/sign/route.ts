import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
import { contractConfirmationEmail } from "@/lib/email-templates/contract-confirmation"
import { generateContractPdf } from "@/lib/pdf/contract-pdf"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractType, TreatmentContract } from "@/types/contract"
import type { PraxisSettings } from "@/types/billing"
import { z } from "zod"

const signSchema = z.object({
  signature_png: z.string().min(100), // base64 string
  consent: z.literal(true),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"

  if (isRateLimited(`contract-sign:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: "Zu viele Versuche. Bitte warten Sie eine Stunde." }, { status: 429 })
  }

  if (!token || !/^[a-zA-Z0-9_-]{16,}$/.test(token)) {
    return NextResponse.json({ error: "Ung\u00FCltiger Token." }, { status: 400 })
  }

  const body = await request.json()
  const parseResult = signSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: "Bitte unterschreiben Sie den Vertrag und best\u00E4tigen Sie die Zustimmung." }, { status: 422 })
  }

  const { signature_png, consent } = parseResult.data
  const userAgent = request.headers.get("user-agent") || "unknown"

  const serviceClient = createSupabaseServiceClient()

  // Load contract
  const { data: contract } = await serviceClient
    .from("treatment_contracts")
    .select("*")
    .eq("signing_token", token)
    .single()

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  // Validate status
  if (contract.status === "unterschrieben") {
    return NextResponse.json({ error: "Vertrag wurde bereits unterzeichnet." }, { status: 409 })
  }

  if (contract.status !== "versendet" && contract.status !== "entwurf") {
    return NextResponse.json({ error: "Vertrag kann nicht mehr unterzeichnet werden." }, { status: 422 })
  }

  // Check token expiry
  if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
    await serviceClient
      .from("treatment_contracts")
      .update({ status: "abgelaufen" })
      .eq("id", contract.id)
    return NextResponse.json({ error: "Dieser Link ist abgelaufen." }, { status: 410 })
  }

  const now = new Date()
  const widerrufBis = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  // Update contract with signature
  const { data: signed, error } = await serviceClient
    .from("treatment_contracts")
    .update({
      status: "unterschrieben",
      signed_at: now.toISOString(),
      signature_png,
      signer_ip: ip,
      signer_user_agent: userAgent,
      signer_consent: consent,
      widerruf_bis: widerrufBis.toISOString().split("T")[0],
    })
    .eq("id", contract.id)
    .select()
    .single()

  if (error) {
    console.error("[Contracts] Sign error:", error)
    return NextResponse.json({ error: "Fehler beim Speichern der Unterschrift." }, { status: 500 })
  }

  // Generate signed PDF and send confirmation email (async, don't block response)
  sendSignedPdfEmail(signed, serviceClient).catch((err) => {
    console.error("[Contracts] PDF/Email error:", err)
  })

  return NextResponse.json({
    message: "Vertrag erfolgreich unterzeichnet.",
    signed_at: signed.signed_at,
    widerruf_bis: signed.widerruf_bis,
  })
}

async function sendSignedPdfEmail(
  contract: Record<string, unknown>,
  serviceClient: ReturnType<typeof createSupabaseServiceClient>
) {
  // Load praxis settings
  const { data: praxis } = await serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) return

  // Generate signed PDF
  const pdfBuffer = await generateContractPdf(
    contract as unknown as TreatmentContract,
    praxis as PraxisSettings,
    { includeSignature: true }
  )

  // Upload PDF to storage
  const filename = `${contract.contract_number}_signiert.pdf`
  const storagePath = `signed/${filename}`

  await serviceClient.storage
    .from("contracts")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    })

  // Update contract with PDF path
  await serviceClient
    .from("treatment_contracts")
    .update({ signed_pdf_path: storagePath })
    .eq("id", contract.id)

  // Send confirmation email with PDF attachment
  const typeConfig = CONTRACT_TYPE_CONFIG[contract.contract_type as ContractType]
  const signedAt = new Date(contract.signed_at as string).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

  await sendEmail({
    to: contract.patient_email as string,
    subject: `Vertrag unterzeichnet \u2014 ${contract.praxis_name}`,
    html: contractConfirmationEmail({
      patientName: contract.patient_name as string,
      praxisName: contract.praxis_name as string,
      contractNumber: contract.contract_number as string,
      contractType: typeConfig?.label || (contract.contract_type as string),
      signedAt,
    }),
    attachments: [{
      filename: `Behandlungsvertrag_${contract.contract_number}.pdf`,
      content: Buffer.from(pdfBuffer),
    }],
  })
}
