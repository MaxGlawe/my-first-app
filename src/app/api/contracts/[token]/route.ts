import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || !/^[a-zA-Z0-9_-]{16,}$/.test(token)) {
    return NextResponse.json({ error: "Ung\u00FCltiger Token." }, { status: 400 })
  }

  const serviceClient = createSupabaseServiceClient()

  const { data: contract, error } = await serviceClient
    .from("treatment_contracts")
    .select("id, contract_number, contract_type, leistungen, gesamtpreis, zahlungsweise, dauer_wochen, sitzungen_anzahl, vertrag_text, praxis_name, praxis_address, praxis_inhaber, praxis_signature_png, patient_name, status, token_expires_at, signed_at")
    .eq("signing_token", token)
    .single()

  if (error || !contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  // Check if token is expired
  if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
    // Update status to expired if still in 'versendet'
    if (contract.status === "versendet") {
      await serviceClient
        .from("treatment_contracts")
        .update({ status: "abgelaufen" })
        .eq("id", contract.id)
    }
    return NextResponse.json({ error: "Dieser Link ist abgelaufen.", code: "EXPIRED" }, { status: 410 })
  }

  // Check status
  if (contract.status === "unterschrieben") {
    return NextResponse.json({
      error: "Dieser Vertrag wurde bereits unterzeichnet.",
      code: "ALREADY_SIGNED",
      signed_at: contract.signed_at,
    }, { status: 409 })
  }

  if (contract.status === "storniert") {
    return NextResponse.json({ error: "Dieser Vertrag wurde storniert.", code: "CANCELLED" }, { status: 410 })
  }

  if (contract.status === "abgelaufen") {
    return NextResponse.json({ error: "Dieser Link ist abgelaufen.", code: "EXPIRED" }, { status: 410 })
  }

  if (contract.status !== "versendet" && contract.status !== "entwurf") {
    return NextResponse.json({ error: "Vertrag kann nicht mehr unterzeichnet werden." }, { status: 422 })
  }

  // Return contract data (excluding sensitive fields)
  return NextResponse.json({
    data: {
      contract_number: contract.contract_number,
      contract_type: contract.contract_type,
      leistungen: contract.leistungen,
      gesamtpreis: contract.gesamtpreis,
      zahlungsweise: contract.zahlungsweise,
      dauer_wochen: contract.dauer_wochen,
      sitzungen_anzahl: contract.sitzungen_anzahl,
      vertrag_text: contract.vertrag_text,
      praxis_name: contract.praxis_name,
      praxis_address: contract.praxis_address,
      praxis_inhaber: contract.praxis_inhaber,
      praxis_signature_png: contract.praxis_signature_png,
      patient_name: contract.patient_name,
    },
  })
}
