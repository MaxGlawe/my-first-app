/**
 * PROJ-18: PATCH /api/bgf/bookings/[id]
 * Update booking status (therapist: bestätigen/durchgeführt/abrechnen, HR: stornieren)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  let body: { status?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const newStatus = body.status
  if (!newStatus || !["bestaetigt", "durchgefuehrt", "abgerechnet", "storniert"].includes(newStatus)) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { status: newStatus }
  if (newStatus === "bestaetigt") update.bestaetigt_am = new Date().toISOString()
  if (newStatus === "durchgefuehrt") update.durchgefuehrt_am = new Date().toISOString()

  const { data, error } = await sc
    .from("bgf_service_bookings")
    .update(update)
    .eq("id", id)
    .select("*, service:bgf_services(name, preis)")
    .single()

  if (error) return NextResponse.json({ error: "Fehler." }, { status: 500 })

  // Notify HR when booking is confirmed
  if (newStatus === "bestaetigt" && data) {
    const { data: org } = await sc.from("organizations").select("kontakt_name, kontakt_email").eq("id", data.organization_id).single()
    const serviceName = (data.service as { name: string })?.name ?? "Dienstleistung"

    if (org?.kontakt_email) {
      sendEmail({
        to: org.kontakt_email,
        subject: `Buchung bestätigt: ${serviceName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #059669; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Buchung bestätigt!</h1>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #334155; font-size: 15px;">Sehr geehrte/r ${org.kontakt_name},</p>
              <p style="color: #334155; font-size: 15px;">Ihre Buchungsanfrage für <strong>${serviceName}</strong> wurde bestätigt. Ihr Therapeut wird sich bezüglich der Termindetails bei Ihnen melden.</p>
            </div>
          </div>
        `,
      }).catch(() => {})
    }
  }

  return NextResponse.json({ booking: data })
}
