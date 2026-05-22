/**
 * PROJ-23: POST /api/leads/schmerzcheck — public lead capture (no auth).
 *
 * Captures a lead from the /schmerzcheck landing page, persists attribution,
 * sends the T1 Double-Opt-in email (Brevo) whose link confirms consent, and
 * mirrors the Meta `Lead` event server-side via the Conversions API.
 *
 * Security (mirrors /api/intake): rate limit + honeypot + submit-timing check
 * + disposable-email blocklist + Zod validation. Writes via the service role.
 */

import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"
import { createLeadToken } from "@/lib/lead-jwt"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"
import { sendMetaLeadEvent } from "@/lib/meta-capi"
import { renderT1WelcomeEmail } from "@/lib/schmerzcheck/emails"

// ── Disposable / testing email domains (compact blocklist) ───────────────
const BLOCKED_EMAIL_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "grr.la", "sharklasers.com",
  "tempmail.com", "temp-mail.org", "throwaway.email", "trashmail.com",
  "yopmail.com", "10minutemail.com", "10minutemail.de", "dispostable.com",
  "getnada.com", "getairmail.com", "wegwerfmail.de", "mailnesia.com",
  "discard.email", "fakeinbox.com", "mohmal.com", "spamgourmet.com",
])

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return true
  return BLOCKED_EMAIL_DOMAINS.has(domain)
}

// ── Schema ───────────────────────────────────────────────────────────────
const leadSchema = z.object({
  firstName: z.string().trim().min(1, "Bitte gib deinen Vornamen ein.").max(100),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  // Attribution (read from URL client-side)
  utm_source: z.string().max(255).nullish(),
  utm_medium: z.string().max(255).nullish(),
  utm_campaign: z.string().max(255).nullish(),
  utm_content: z.string().max(255).nullish(),
  utm_term: z.string().max(255).nullish(),
  fbclid: z.string().max(512).nullish(),
  referrer: z.string().max(1024).nullish(),
  // Dedup id shared with the browser Pixel `Lead` event
  eventId: z.string().max(64).optional(),
  // Honeypot — must stay empty
  website: z.string().max(0, "Bot erkannt.").optional().default(""),
  // Submit-timing guard: form-render timestamp (ms)
  _t: z.number().optional(),
})

const SOURCE = "schmerzcheck_landing"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // Rate limit: 5/IP/hour + 50 global/hour
  if (isRateLimited(`leads:schmerzcheck:${ip}`, 5, 3_600_000)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    )
  }
  if (isRateLimited("leads:schmerzcheck:global", 50, 3_600_000)) {
    return NextResponse.json(
      { error: "Derzeit gehen viele Anfragen ein. Bitte versuche es gleich erneut." },
      { status: 429 }
    )
  }

  let body: z.infer<typeof leadSchema>
  try {
    body = leadSchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Honeypot — silent success so bots learn nothing
  if (body.website) return NextResponse.json({ ok: true })

  // Submit-timing — humans need ≥ 2s (spec §4.5)
  if (body._t && Date.now() - body._t < 2_000) {
    return NextResponse.json({ ok: true })
  }

  if (isDisposableEmail(body.email)) {
    return NextResponse.json(
      { error: "Bitte verwende eine reguläre E-Mail-Adresse (keine Wegwerf-Adresse)." },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServiceClient()
  const email = body.email.toLowerCase()
  const userAgent = request.headers.get("user-agent") ?? null

  // Upsert by (email, source) — no duplicate row; re-send the link on repeat.
  const { data: existing } = await supabase
    .from("schmerzcheck_leads")
    .select("id")
    .eq("email", email)
    .eq("source", SOURCE)
    .maybeSingle()

  let leadId: string
  if (existing) {
    leadId = existing.id
    await supabase
      .from("schmerzcheck_leads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", leadId)
  } else {
    const { data: inserted, error } = await supabase
      .from("schmerzcheck_leads")
      .insert({
        first_name: body.firstName,
        email,
        source: SOURCE,
        status: "awaiting_check",
        consent_status: "pending",
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        utm_content: body.utm_content ?? null,
        utm_term: body.utm_term ?? null,
        fbclid: body.fbclid ?? null,
        referrer: body.referrer ?? null,
        ip_address: ip !== "unknown" ? ip : null,
        user_agent: userAgent,
        consent_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error || !inserted) {
      console.error("[POST /api/leads/schmerzcheck] Insert error:", error)
      return NextResponse.json(
        { error: "Anfrage konnte nicht gespeichert werden. Bitte versuche es erneut." },
        { status: 500 }
      )
    }
    leadId = inserted.id
  }

  // Signed token → Double-Opt-in confirm link (Phase 2: starts the check).
  const token = createLeadToken(leadId)
  // In dev, use the actual host that was hit (e.g. localhost:3004) so the email
  // link points at the running server; in prod use the configured public URL.
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
      : new URL(request.url).origin
  const confirmUrl = `${baseUrl}/api/leads/schmerzcheck/confirm?t=${encodeURIComponent(token)}`

  // T1 welcome / confirm email (fire-and-forget; failure must not block the lead)
  void sendSchmerzcheckEmail({
    to: email,
    toName: body.firstName,
    subject: "Dein Schmerzcheck ist bereit — starte jetzt",
    html: renderT1WelcomeEmail({ firstName: body.firstName, checkUrl: confirmUrl, baseUrl }),
  })
    .then((res) =>
      supabase.from("schmerzcheck_email_events").insert({
        lead_id: leadId,
        email_code: "T1",
        event_type: res.success ? "sent" : "failed",
        metadata: res.success ? { messageId: res.messageId } : { error: res.error },
      })
    )
    .catch((err) => console.error("[POST /api/leads/schmerzcheck] T1 send error:", err))

  // Meta CAPI Lead — server-side mirror (dedup via shared eventId)
  const eventId = body.eventId || randomUUID()
  void sendMetaLeadEvent({
    email,
    eventId,
    eventSourceUrl: `${baseUrl}/schmerzcheck`,
    clientIp: ip !== "unknown" ? ip : null,
    userAgent,
    fbc: request.cookies.get("_fbc")?.value ?? null,
    fbp: request.cookies.get("_fbp")?.value ?? null,
    fbclid: body.fbclid ?? null,
  }).catch(() => {})

  return NextResponse.json({ ok: true, eventId })
}
