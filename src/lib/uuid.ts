/**
 * randomUUID — robuster Wrapper um crypto.randomUUID().
 *
 * crypto.randomUUID() ist nur im Secure Context (HTTPS oder localhost)
 * verfügbar. Beim Dev-Zugriff über die LAN-IP (z.B. http://192.168.x.x:3000
 * vom Handy aus) ist es undefined → "crypto.randomUUID is not a function".
 *
 * Fallback-Reihenfolge:
 *   1. crypto.randomUUID()            — nativ, schnellst, Secure Context only
 *   2. crypto.getRandomValues()-UUID  — kryptographisch sicher, auch im
 *                                       Non-Secure-Context verfügbar
 *   3. Math.random()-UUID             — letzter Notfall (alte Browser),
 *                                       NICHT kryptographisch sicher
 */
export function randomUUID(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16)
      crypto.getRandomValues(bytes)
      bytes[6] = (bytes[6] & 0x0f) | 0x40 // RFC 4122 version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC 4122 variant 10
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
