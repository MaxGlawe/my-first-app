/**
 * PROJ-23: Signed lead-access tokens (HS256).
 *
 * Used for the Double-Opt-in confirm link and (Phase 2) Schmerzcheck access.
 * Self-contained HMAC-SHA256 JWT — no external dependency, mirrors the
 * `crypto`-based signing already used in the booking webhook.
 *
 * Secret: LEAD_LINK_SECRET (server-only, never NEXT_PUBLIC_).
 */

import { createHmac, timingSafeEqual } from "crypto"

const PURPOSE = "schmerzcheck_access"
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

interface LeadTokenPayload {
  sub: string // lead_id
  purpose: string
  iat: number
  exp: number
}

function getSecret(): string {
  const secret = process.env.LEAD_LINK_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      "LEAD_LINK_SECRET is missing or too short (min 32 chars). Set it in the environment."
    )
  }
  return secret
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function base64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4))
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64")
}

function sign(data: string, secret: string): string {
  return base64url(createHmac("sha256", secret).update(data).digest())
}

/** Create a signed access token for a lead. */
export function createLeadToken(leadId: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = base64url(
    JSON.stringify({
      sub: leadId,
      purpose: PURPOSE,
      iat: now,
      exp: now + ttlSeconds,
    } satisfies LeadTokenPayload)
  )
  const signingInput = `${header}.${payload}`
  return `${signingInput}.${sign(signingInput, secret)}`
}

/**
 * Verify a token. Returns the lead id when valid, or null when the token is
 * malformed, has a bad signature, the wrong purpose, or is expired.
 */
export function verifyLeadToken(token: string | null | undefined): string | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  let secret: string
  try {
    secret = getSecret()
  } catch {
    return null
  }

  const expected = sign(`${header}.${payload}`, secret)
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  try {
    const decoded = JSON.parse(base64urlDecode(payload).toString("utf8")) as LeadTokenPayload
    if (decoded.purpose !== PURPOSE) return null
    if (typeof decoded.exp !== "number" || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return typeof decoded.sub === "string" ? decoded.sub : null
  } catch {
    return null
  }
}
