/**
 * PROJ-18: BGF Service Bookings
 * GET  /api/bgf/bookings — List bookings (filtered by role)
 * POST /api/bgf/bookings — Create booking (HR only)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const bookingSchema = z.object({
  service_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  wunschtermin: z.string().max(200).optional(),
  abteilung: z.string().max(200).optional(),
  anmerkung: z.string().max(2000).optional(),
  teilnehmer_anzahl: z.number().int().min(1).max(500).default(1),
})

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc.from("user_profiles").select("role").eq("id", user.id).single()
  const isStaff = profile && ["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)

  const orgId = new URL(request.url).searchParams.get("organization_id")

  let query = sc
    .from("bgf_service_bookings")
    .select("*, service:bgf_services(name, preis, art, kategorie, dauer_minuten)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (isStaff) {
    // Therapists see all bookings (or filtered by org)
    if (orgId) query = query.eq("organization_id", orgId)
  } else {
    // HR sees only their org's bookings
    const { data: orgAdmin } = await sc
      .from("organization_admins")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle()
    if (!orgAdmin) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
    query = query.eq("organization_id", orgAdmin.organization_id)
  }

  const { data, error } = await query
  if (error) {
    console.error("[GET /api/bgf/bookings] error:", error)
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  return NextResponse.json({ bookings: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = bookingSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors }, { status: 422 })
  }

  const data = parseResult.data
  const sc = createSupabaseServiceClient()

  // Load service + org for email
  const { data: service } = await sc.from("bgf_services").select("name, preis, created_by").eq("id", data.service_id).single()
  const { data: org } = await sc.from("organizations").select("name, kontakt_name, kontakt_email, therapeut_id").eq("id", data.organization_id).single()

  const { data: booking, error } = await sc
    .from("bgf_service_bookings")
    .insert({
      service_id: data.service_id,
      organization_id: data.organization_id,
      angefragt_von: user.id,
      wunschtermin: data.wunschtermin?.trim() || null,
      abteilung: data.abteilung?.trim() || null,
      anmerkung: data.anmerkung?.trim() || null,
      teilnehmer_anzahl: data.teilnehmer_anzahl,
      status: "angefragt",
    })
    .select("*")
    .single()

  if (error) {
    console.error("[POST /api/bgf/bookings] error:", error)
    return NextResponse.json({ error: "Buchung konnte nicht erstellt werden." }, { status: 500 })
  }

  // Notify therapist via email
  if (service && org) {
    const therapeutId = org.therapeut_id ?? service.created_by
    const { data: therapeutProfile } = await sc.from("user_profiles").select("email").eq("id", therapeutId).single()

    if (therapeutProfile?.email) {
      sendEmail({
        to: therapeutProfile.email,
        subject: `Neue Buchungsanfrage: ${service.name} — ${org.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #059669; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Neue Buchungsanfrage</h1>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #334155; font-size: 15px;"><strong>${org.name}</strong> hat eine Dienstleistung angefragt:</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <table style="width: 100%; font-size: 14px; color: #475569;">
                  <tr><td style="padding: 4px 0;"><strong>Leistung:</strong></td><td style="text-align: right;">${service.name}</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Preis:</strong></td><td style="text-align: right;">${Number(service.preis).toFixed(2)} €</td></tr>
                  <tr><td style="padding: 4px 0;"><strong>Ansprechpartner:</strong></td><td style="text-align: right;">${org.kontakt_name}</td></tr>
                  ${data.wunschtermin ? `<tr><td style="padding: 4px 0;"><strong>Wunschtermin:</strong></td><td style="text-align: right;">${data.wunschtermin}</td></tr>` : ""}
                  ${data.abteilung ? `<tr><td style="padding: 4px 0;"><strong>Abteilung:</strong></td><td style="text-align: right;">${data.abteilung}</td></tr>` : ""}
                  ${data.teilnehmer_anzahl > 1 ? `<tr><td style="padding: 4px 0;"><strong>Teilnehmer:</strong></td><td style="text-align: right;">${data.teilnehmer_anzahl}</td></tr>` : ""}
                </table>
              </div>
              ${data.anmerkung ? `<p style="color: #64748b; font-size: 13px;"><strong>Anmerkung:</strong> ${data.anmerkung}</p>` : ""}
              <p style="color: #334155; font-size: 14px; margin-top: 16px;">Bitte bestätigen Sie die Anfrage im BGF-Dashboard.</p>
            </div>
          </div>
        `,
      }).catch((err) => console.error("[bgf/bookings] notification email error:", err))
    }
  }

  return NextResponse.json({ booking }, { status: 201 })
}
