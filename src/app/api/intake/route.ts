/**
 * POST /api/intake — Public intake form submission (no auth required)
 * GET /api/intake — List all intake requests (staff only)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"
import { escapeHtml } from "@/lib/html-escape"

const intakeSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich.").max(100),
  nachname: z.string().min(1, "Nachname ist erforderlich.").max(100),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  telefon: z.string().min(5, "Telefonnummer ist erforderlich.").max(30),
  beschwerde_bereich: z.string().min(1, "Bitte wählen Sie einen Bereich."),
  beschwerde_freitext: z.string().min(10, "Bitte beschreiben Sie Ihre Beschwerden genauer.").max(2000),
  symptom_dauer: z.string().min(1, "Bitte wählen Sie die Dauer."),
  vorherige_behandlung: z.array(z.string()).min(1, "Bitte wählen Sie mindestens eine Option."),
  vorherige_behandlung_details: z.string().max(2000).optional().default(""),
  datenschutz_akzeptiert: z.boolean().refine((v) => v === true, "Pflichtfeld"),
  agb_akzeptiert: z.boolean().refine((v) => v === true, "Pflichtfeld"),
  heilpraktiker_info: z.boolean().refine((v) => v === true, "Pflichtfeld"),
  // Honeypot
  website: z.string().max(0, "Bot erkannt.").optional().default(""),
})

export async function POST(request: NextRequest) {
  // Rate limiting by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(ip, 5, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
      { status: 429 }
    )
  }

  let body: z.infer<typeof intakeSchema>
  try {
    body = intakeSchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Honeypot check
  if (body.website) {
    // Silent success to not reveal bot detection
    return NextResponse.json({ success: true })
  }

  const serviceClient = createSupabaseServiceClient()

  const { data, error } = await serviceClient
    .from("intake_requests")
    .insert({
      vorname: body.vorname,
      nachname: body.nachname,
      email: body.email,
      telefon: body.telefon,
      beschwerde_bereich: body.beschwerde_bereich,
      beschwerde_freitext: body.beschwerde_freitext,
      symptom_dauer: body.symptom_dauer,
      vorherige_behandlung: body.vorherige_behandlung,
      vorherige_behandlung_details: body.vorherige_behandlung_details || null,
      datenschutz_akzeptiert: body.datenschutz_akzeptiert,
      agb_akzeptiert: body.agb_akzeptiert,
      heilpraktiker_info: body.heilpraktiker_info,
      ip_address: ip !== "unknown" ? ip : null,
      user_agent: request.headers.get("user-agent") ?? null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[POST /api/intake] Insert error:", error)
    return NextResponse.json(
      { error: "Anfrage konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  // Send notification email to practice (fire-and-forget)
  const notifyEmail = process.env.SMTP_USER || "physiotherapieglawe@gmx.de"
  sendEmail({
    to: notifyEmail,
    subject: `Neue Anfrage: ${body.vorname} ${body.nachname}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">
          Neue Patientenanfrage
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
          <tr><td style="padding: 8px 0; font-weight: 600; width: 140px;">Name:</td><td>${escapeHtml(body.vorname)} ${escapeHtml(body.nachname)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">E-Mail:</td><td>${escapeHtml(body.email)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Telefon:</td><td>${escapeHtml(body.telefon)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Bereich:</td><td>${escapeHtml(body.beschwerde_bereich)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Dauer:</td><td>${escapeHtml(body.symptom_dauer)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600;">Vorherige Behandlung:</td><td>${body.vorherige_behandlung.map(escapeHtml).join(", ")}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #f1f5f9; border-radius: 8px;">
          <p style="font-weight: 600; margin: 0 0 4px; font-size: 14px; color: #1e293b;">Beschwerden:</p>
          <p style="margin: 0; font-size: 14px; color: #475569; white-space: pre-wrap;">${escapeHtml(body.beschwerde_freitext)}</p>
        </div>
        ${body.vorherige_behandlung_details ? `
        <div style="margin-top: 12px; padding: 12px; background: #f1f5f9; border-radius: 8px;">
          <p style="font-weight: 600; margin: 0 0 4px; font-size: 14px; color: #1e293b;">Details vorherige Behandlung:</p>
          <p style="margin: 0; font-size: 14px; color: #475569; white-space: pre-wrap;">${escapeHtml(body.vorherige_behandlung_details)}</p>
        </div>` : ""}
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"}/os/intake"
             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            In Praxis OS öffnen
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          Praxis OS — Automatische Benachrichtigung
        </p>
      </div>
    `,
  }).catch((err) => console.error("[POST /api/intake] Notification email failed:", err))

  return NextResponse.json({ success: true, id: data.id })
}

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Check role
  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const staffRoles = ["admin", "heilpraktiker", "physiotherapeut"]
  if (!profile || !staffRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data: requests, error } = await supabase
    .from("intake_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[GET /api/intake] Error:", error)
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 })
  }

  return NextResponse.json({ requests: requests ?? [] })
}
