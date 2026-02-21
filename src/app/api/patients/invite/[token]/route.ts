/**
 * GET /api/patients/invite/[token]
 * Public endpoint — returns minimal patient data for the registration form.
 * No authentication required (patient has not logged in yet).
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Ungültiger Token." }, { status: 400 })
  }

  const serviceClient = createSupabaseServiceClient()

  const { data: patient, error } = await serviceClient
    .from("patients")
    .select("vorname, nachname, email, invite_status")
    .eq("invite_token", token)
    .single()

  if (error || !patient) {
    return NextResponse.json(
      { error: "Einladung nicht gefunden oder ungültig." },
      { status: 404 }
    )
  }

  if (patient.invite_status === "registered") {
    return NextResponse.json(
      { error: "Diese Einladung wurde bereits verwendet." },
      { status: 410 }
    )
  }

  return NextResponse.json({
    vorname: patient.vorname,
    nachname: patient.nachname,
    email: patient.email,
  })
}
