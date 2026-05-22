/**
 * PROJ-23: Meta Conversions API (server-side event mirroring).
 *
 * Mirrors the browser Pixel `Lead` event server-side so conversions are still
 * counted under iOS 14.5+ / ad-blocker conditions. Send the SAME event_id from
 * the browser Pixel and from here so Meta deduplicates them.
 *
 * Config (server-only):
 *   META_PIXEL_ID        (falls back to NEXT_PUBLIC_META_PIXEL_ID)
 *   META_CAPI_TOKEN
 *   META_CAPI_TEST_EVENT_CODE  (only while testing; remove in production)
 */

import { createHash } from "crypto"

const GRAPH_VERSION = "v21.0"

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

/** Normalise + hash an email for Meta user matching (lowercase, trimmed). */
function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase())
}

interface LeadEventInput {
  email: string
  /** Dedup key — must match the browser Pixel's eventID for the same action. */
  eventId: string
  eventSourceUrl?: string
  clientIp?: string | null
  userAgent?: string | null
  /** Meta click id cookie (_fbc) if present. */
  fbc?: string | null
  /** Meta browser id cookie (_fbp) if present. */
  fbp?: string | null
  /** Raw fbclid from the URL — used to synthesise _fbc when the cookie is absent. */
  fbclid?: string | null
}

/**
 * Send a `Lead` event to the Conversions API. Fails soft (logs + returns false)
 * when unconfigured or on error — never blocks the lead-capture response.
 */
export async function sendMetaLeadEvent(input: LeadEventInput): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN

  if (!pixelId || !token) {
    console.warn("[Meta CAPI] META_PIXEL_ID / META_CAPI_TOKEN not set — skipping Lead event")
    return false
  }

  // Synthesise _fbc from fbclid when the cookie is missing (Meta's documented format).
  let fbc = input.fbc || null
  if (!fbc && input.fbclid) {
    fbc = `fb.1.${Date.now()}.${input.fbclid}`
  }

  const userData: Record<string, unknown> = {
    em: [hashEmail(input.email)],
  }
  if (input.clientIp) userData.client_ip_address = input.clientIp
  if (input.userAgent) userData.client_user_agent = input.userAgent
  if (fbc) userData.fbc = fbc
  if (input.fbp) userData.fbp = input.fbp

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.eventSourceUrl,
        user_data: userData,
      },
    ],
  }
  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    )
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[Meta CAPI] Lead event failed (${res.status}):`, text)
      return false
    }
    return true
  } catch (err) {
    console.error("[Meta CAPI] Lead event error:", err instanceof Error ? err.message : err)
    return false
  }
}
