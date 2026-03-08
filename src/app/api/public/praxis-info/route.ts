/**
 * GET /api/public/praxis-info
 * Public read-only endpoint for Impressum + Datenschutz pages.
 * Returns only non-sensitive praxis fields (no IBAN, no Steuernummer).
 */

import { NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from("praxis_settings")
    .select("praxis_name, inhaber_name, strasse, plz, ort, telefon, email, website, zulassungsnummer")
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({ data })
}
