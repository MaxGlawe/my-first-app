import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { contractSigningEmail } from "@/lib/email-templates/contract-signing"
import { CONTRACT_TYPE_CONFIG } from "@/types/contract"
import type { ContractType } from "@/types/contract"

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return null
  }

  return { user, serviceClient, role: profile.role }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { data: contract } = await auth.serviceClient
    .from("treatment_contracts")
    .select("*")
    .eq("id", id)
    .single()

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  if (auth.role !== "admin" && contract.created_by !== auth.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  if (contract.status !== "entwurf" && contract.status !== "versendet") {
    return NextResponse.json({ error: "Vertrag kann in diesem Status nicht versendet werden." }, { status: 422 })
  }

  if (!contract.patient_email) {
    return NextResponse.json({ error: "Patient hat keine E-Mail-Adresse." }, { status: 422 })
  }

  // Build signing URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const signingUrl = `${siteUrl}/vertrag/${contract.signing_token}`

  // Format expiry date
  const expiresAt = new Date(contract.token_expires_at).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })

  const typeConfig = CONTRACT_TYPE_CONFIG[contract.contract_type as ContractType]
  const gesamtpreis = Number(contract.gesamtpreis).toLocaleString("de-DE", {
    style: "currency", currency: "EUR",
  })

  // Send email
  const emailResult = await sendEmail({
    to: contract.patient_email,
    subject: `Ihr Behandlungsvertrag — ${contract.praxis_name}`,
    html: contractSigningEmail({
      patientName: contract.patient_name,
      praxisName: contract.praxis_name,
      contractType: typeConfig?.label || contract.contract_type,
      gesamtpreis,
      signingUrl,
      expiresAt,
    }),
  })

  if (!emailResult.success) {
    return NextResponse.json({ error: `E-Mail-Versand fehlgeschlagen: ${emailResult.error}` }, { status: 500 })
  }

  // Update contract status
  const { data, error } = await auth.serviceClient
    .from("treatment_contracts")
    .update({
      status: "versendet",
      sent_at: new Date().toISOString(),
      sent_to_email: contract.patient_email,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Vertrag versendet, aber Status-Update fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ data, message: "Vertrag erfolgreich versendet." })
}
