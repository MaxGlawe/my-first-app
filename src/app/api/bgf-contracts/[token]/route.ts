/**
 * PROJ-18: GET /api/bgf-contracts/[token]
 * Public route — fetch BGF contract by signing token.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()

  const { data: contract, error } = await sc
    .from("bgf_contracts")
    .select("*")
    .eq("signing_token", token)
    .single()

  if (error || !contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  // Check token expiry
  if (contract.token_expires_at && new Date(contract.token_expires_at) < new Date()) {
    if (contract.status === "versendet" || contract.status === "entwurf") {
      await sc
        .from("bgf_contracts")
        .update({ status: "abgelaufen" })
        .eq("id", contract.id)
    }
    return NextResponse.json({ error: "Der Link ist abgelaufen." }, { status: 410 })
  }

  // Check status
  if (contract.status === "unterschrieben") {
    return NextResponse.json({
      error: "Dieser Vertrag wurde bereits unterschrieben.",
      signed_at: contract.signed_at,
    }, { status: 409 })
  }

  if (!["entwurf", "versendet"].includes(contract.status)) {
    return NextResponse.json({
      error: `Vertrag hat den Status "${contract.status}" und kann nicht unterschrieben werden.`,
    }, { status: 400 })
  }

  // Don't expose sensitive fields
  const { signing_token: _t, signer_ip: _ip, signer_user_agent: _ua, ...safeContract } = contract

  return NextResponse.json({ contract: safeContract })
}
