/**
 * Shared token generation utility.
 * Generates a cryptographically secure base64url token.
 */
import { randomBytes } from "crypto"

export function generateToken(): string {
  return randomBytes(24).toString("base64url")
}
