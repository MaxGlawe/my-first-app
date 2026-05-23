/**
 * Signed deck-access tokens (HS256).
 *
 * Accountloser Kauf-Flow für Bewegungskarten (produkt_typ='deck'): Käufer
 * brauchen keinen Praxis-OS-Account. Stattdessen erhalten sie nach dem Kauf
 * eine E-Mail mit einem signierten, dauerhaft gültigen Link zu ihren Karten.
 *
 * Selbstständige HMAC-SHA256-JWT-Implementierung — kein externes Paket,
 * spiegelt `src/lib/lead-jwt.ts` (gleiche node:crypto-Mechanik).
 *
 * Secret: LEAD_LINK_SECRET (server-only, niemals NEXT_PUBLIC_).
 */

import { createHmac, timingSafeEqual } from "crypto"

const PURPOSE = "deck_access"
// Lang gültig — der Link soll dauerhaft funktionieren (5 Jahre).
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365 * 5

interface DeckTokenPayload {
  sub: string // deck slug
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

/** Erzeugt einen signierten Zugriffs-Token für ein Deck (per slug). */
export function signDeckToken(slug: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = base64url(
    JSON.stringify({
      sub: slug,
      purpose: PURPOSE,
      iat: now,
      exp: now + ttlSeconds,
    } satisfies DeckTokenPayload)
  )
  const signingInput = `${header}.${payload}`
  return `${signingInput}.${sign(signingInput, secret)}`
}

/**
 * Verifiziert einen Token. Gibt den Deck-Slug zurück, wenn der Token gültig
 * ist, oder null, wenn er fehlerhaft ist, eine falsche Signatur, den falschen
 * Zweck (purpose) hat oder abgelaufen ist.
 */
export function verifyDeckToken(token: string | null | undefined): string | null {
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
    const decoded = JSON.parse(base64urlDecode(payload).toString("utf8")) as DeckTokenPayload
    if (decoded.purpose !== PURPOSE) return null
    if (typeof decoded.exp !== "number" || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return typeof decoded.sub === "string" ? decoded.sub : null
  } catch {
    return null
  }
}
