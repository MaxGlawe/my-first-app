/**
 * PROJ-23: Meta Conversions API (server-side event mirroring).
 *
 * Mirrors browser Pixel events server-side so conversions are still counted
 * under iOS 14.5+ / ad-blocker conditions. For events that also fire in the
 * browser (e.g. Lead), send the SAME event_id from both sides so Meta
 * deduplicates them.
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

interface MetaEventInput {
  /** e.g. "Lead", "CompleteRegistration", "Purchase". */
  eventName: string
  email: string
  /** Dedup key — match the browser Pixel's eventID when the event fires both sides. */
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
  /** Purchase value (e.g. 69) — adds custom_data { value, currency }. */
  value?: number
  /** ISO currency (e.g. "EUR") — required when value is set. */
  currency?: string
  /** Defaults to "website". */
  actionSource?: string
}

/**
 * Send one event to the Conversions API. Fails soft (logs + returns false) when
 * unconfigured or on error — never blocks the caller.
 */
export async function sendMetaEvent(input: MetaEventInput): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID
  const token = process.env.META_CAPI_TOKEN

  if (!pixelId || !token) {
    console.warn(`[Meta CAPI] META_PIXEL_ID / META_CAPI_TOKEN not set — skipping ${input.eventName} event`)
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

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: input.actionSource || "website",
    user_data: userData,
  }
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl
  if (typeof input.value === "number") {
    event.custom_data = { value: input.value, currency: input.currency || "EUR" }
  }

  const body: Record<string, unknown> = { data: [event] }
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
      console.error(`[Meta CAPI] ${input.eventName} event failed (${res.status}):`, text)
      return false
    }
    return true
  } catch (err) {
    console.error(`[Meta CAPI] ${input.eventName} event error:`, err instanceof Error ? err.message : err)
    return false
  }
}

type LeadEventInput = Omit<MetaEventInput, "eventName" | "value" | "currency" | "actionSource">

/** Send a `Lead` event (mirrors the browser Pixel `Lead` with shared event_id). */
export async function sendMetaLeadEvent(input: LeadEventInput): Promise<boolean> {
  return sendMetaEvent({ ...input, eventName: "Lead" })
}
