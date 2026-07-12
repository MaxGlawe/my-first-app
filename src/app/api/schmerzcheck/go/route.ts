/**
 * PROJ-23 / Phase 4: GET /api/schmerzcheck/go?u=<token>&e=<emailCode>&t=<target>
 *
 * Getrackter Klick-Ausgang aus den Mails. Loggt ein `clicked`-Event in
 * schmerzcheck_email_events (attribuiert auf die exakte Mail UND das Ziel) und
 * leitet dann per 302 weiter.
 *
 * Ziele (`t`):
 *   salespage → Masterclass-Verkaufsseite  (neu, Standard der M-Kampagne)
 *   checkout  → direkt in den Kauf-Flow
 *   report    → persönlicher Schmerz-Report
 *   booking   → externer Video-Analyse-Kalender (Altbestand, D1–D5/W1)
 *
 * Ohne `t` gilt der alte Standard (booking), damit bereits verschickte Mails
 * aus der Video-Analyse-Zeit weiterhin funktionieren.
 *
 * Blockiert nie: ein ungültiger Token oder ein Logging-Fehler leitet trotzdem
 * weiter — ein Klick darf nicht an unserer Buchhaltung scheitern.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { buildBookingUrl } from "@/lib/schmerzcheck/recommendations"

// Mails/Touchpoints, denen wir einen Klick zurechnen. REPORT und PDF sind die
// On-Page-CTAs (Report-Seite und PDF), der Rest sind Mail-Codes.
const ALLOWED_CODES = new Set([
  "T2", "D1", "D2", "D3", "D4", "D5", "W1",
  "M1", "M2", "M3", "M4", "B1", "B2", "C1R",
  "REPORT", "PDF",
])

const ALLOWED_TARGETS = new Set(["salespage", "checkout", "report", "booking"])

/** Masterclass-Salespage (öffentlich, mit Gast-Checkout). */
const MASTERCLASS_SLUG = "chronischer-kreuzschmerz"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get("u")
  const rawCode = (url.searchParams.get("e") || "").toUpperCase()
  const emailCode = ALLOWED_CODES.has(rawCode) ? rawCode : "drip"

  const rawTarget = (url.searchParams.get("t") || "").toLowerCase()
  const target = ALLOWED_TARGETS.has(rawTarget) ? rawTarget : "booking"

  // Per-Touchpoint-UTM (z.B. "report", "email"); Standard: email.
  const medium = (url.searchParams.get("m") || "email").slice(0, 30)
  // Archetyp (result_category) beim Klick von der Ergebnisseite — damit sehen
  // wir, welche Ergebnis-Gruppe das Angebot annimmt und welche nicht.
  const archetype = (url.searchParams.get("a") || "").slice(0, 40) || null

  const leadId = verifyLeadToken(token)

  if (leadId) {
    try {
      const supabase = createSupabaseServiceClient()
      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: leadId,
        email_code: emailCode,
        event_type: "clicked",
        metadata: { target, ...(archetype ? { archetype } : {}) },
      })
    } catch (err) {
      console.error("[GET /api/schmerzcheck/go] Klick-Logging fehlgeschlagen:", err)
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin
  const dest = buildDestination({ target, baseUrl, emailCode, medium, token })
  return NextResponse.redirect(dest, 302)
}

function buildDestination(args: {
  target: string
  baseUrl: string
  emailCode: string
  medium: string
  token: string | null
}): string {
  const { target, baseUrl, emailCode, medium, token } = args
  const content = emailCode.toLowerCase()

  // UTM-Kette: Die Salespage reicht diese Parameter bis in die Stripe-Session
  // weiter (metadata.utm_*), der Webhook schreibt sie in conversion_source.
  // Damit ist zum ersten Mal lückenlos sichtbar, welche Mail einen Kauf brachte.
  const withUtm = (path: string): string => {
    const u = new URL(path, baseUrl)
    u.searchParams.set("utm_source", "schmerzcheck")
    u.searchParams.set("utm_medium", medium)
    u.searchParams.set("utm_campaign", "masterclass")
    u.searchParams.set("utm_content", content)
    return u.toString()
  }

  switch (target) {
    case "salespage":
      return withUtm(`/kurse/${MASTERCLASS_SLUG}`)

    case "checkout":
      // Direkt zum Kaufpanel der Salespage (gleiche Seite, Anker).
      return withUtm(`/kurse/${MASTERCLASS_SLUG}`) + "#kaufen"

    case "report": {
      if (!token) return withUtm(`/kurse/${MASTERCLASS_SLUG}`)
      const u = new URL(`/check/result`, baseUrl)
      u.searchParams.set("t", token)
      return u.toString()
    }

    default:
      // Altbestand: externer Video-Analyse-Kalender.
      return buildBookingUrl({ medium, content })
  }
}
