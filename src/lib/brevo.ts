/**
 * PROJ-23: Brevo email client (transactional + contact/list management).
 *
 * Used for the Schmerzcheck funnel (cold paid traffic), separate from the
 * practice's GMX/Nodemailer transactional mail (`lib/email.ts`). Brevo gives
 * us deliverability, list automation and unsubscribe handling for the drip.
 *
 * Config (server-only):
 *   BREVO_API_KEY
 *   BREVO_TRANSACTIONAL_SENDER_NAME   (default "Max Glawe · Praxis OS")
 *   BREVO_TRANSACTIONAL_SENDER_EMAIL  (default "hallo@praxis-os.com")
 *   BREVO_LIST_DRIP                   (numeric list id, optional in Phase 1)
 */

const BREVO_BASE = "https://api.brevo.com/v3"

function getApiKey(): string | null {
  return process.env.BREVO_API_KEY || null
}

function getSender(): { name: string; email: string } {
  return {
    name: process.env.BREVO_TRANSACTIONAL_SENDER_NAME || "Max Glawe · Praxis OS",
    email: process.env.BREVO_TRANSACTIONAL_SENDER_EMAIL || "hallo@praxis-os.com",
  }
}

interface SendOptions {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  /** Maps to Brevo's preheader-friendly tags / categorisation. */
  tags?: string[]
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/** Send one transactional email via Brevo. Fails soft when unconfigured. */
export async function sendBrevoEmail(opts: SendOptions): Promise<SendResult> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY not set — skipping email send")
    return { success: false, error: "BREVO_API_KEY nicht konfiguriert" }
  }

  try {
    const res = await fetch(`${BREVO_BASE}/smtp/email`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: getSender(),
        to: [{ email: opts.to, name: opts.toName || undefined }],
        subject: opts.subject,
        htmlContent: opts.htmlContent,
        tags: opts.tags,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[Brevo] Send failed (${res.status}):`, text)
      return { success: false, error: `Brevo ${res.status}` }
    }

    const data = (await res.json().catch(() => ({}))) as { messageId?: string }
    return { success: true, messageId: data.messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[Brevo] Send error:", message)
    return { success: false, error: message }
  }
}

interface ContactOptions {
  email: string
  firstName?: string
  /** Extra Brevo contact attributes (e.g. region, severity_bucket). */
  attributes?: Record<string, string | number | boolean>
  /** Brevo list ids to add the contact to (e.g. the drip list). */
  listIds?: number[]
}

/**
 * Create or update a Brevo contact. Used after Double-Opt-in confirmation to
 * enrol the lead into the drip list. Fails soft when unconfigured.
 */
export async function upsertBrevoContact(opts: ContactOptions): Promise<SendResult> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY not set — skipping contact upsert")
    return { success: false, error: "BREVO_API_KEY nicht konfiguriert" }
  }

  try {
    const res = await fetch(`${BREVO_BASE}/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: opts.email,
        updateEnabled: true,
        attributes: {
          ...(opts.firstName ? { VORNAME: opts.firstName } : {}),
          ...opts.attributes,
        },
        listIds: opts.listIds,
      }),
    })

    // Brevo returns 201 (created) or 204 (updated)
    if (!res.ok && res.status !== 204) {
      const text = await res.text().catch(() => "")
      console.error(`[Brevo] Contact upsert failed (${res.status}):`, text)
      return { success: false, error: `Brevo ${res.status}` }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[Brevo] Contact upsert error:", message)
    return { success: false, error: message }
  }
}

/** Drip list id from env, or null when not configured (Phase 1). */
export function getDripListId(): number | null {
  const raw = process.env.BREVO_LIST_DRIP
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}
