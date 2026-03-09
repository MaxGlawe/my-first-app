/**
 * Escapes HTML special characters to prevent XSS/HTML injection.
 * Use this when interpolating user-supplied values into HTML strings (e.g. email templates).
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
