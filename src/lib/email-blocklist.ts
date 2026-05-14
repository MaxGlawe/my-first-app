/**
 * Wegwerf-/Test-E-Mail-Domain-Blocklist.
 * Geteilt von öffentlichen, nicht authentifizierten Endpunkten
 * (/api/intake, /api/shop/public-checkout) als Missbrauchsschutz.
 */

const BLOCKED_EMAIL_DOMAINS = new Set([
  // Testing / pentest domains
  "mailnull.com", "maildrop.cc", "mailsac.com", "mailinator.com",
  "guerrillamail.com", "guerrillamail.de", "grr.la", "guerrillamailblock.com",
  "sharklasers.com", "guerrillamail.info", "guerrillamail.net",
  // Disposable email services
  "tempmail.com", "temp-mail.org", "tempmailo.com", "tempail.com",
  "throwaway.email", "throwawaymail.com", "trashmail.com", "trashmail.de",
  "trashmail.net", "trashmail.me", "trash-mail.com",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "10minutemail.com", "10minutemail.net", "10minutemail.de",
  "minutemail.com", "tempinbox.com",
  "dispostable.com", "discard.email", "discardmail.com", "discardmail.de",
  "mailcatch.com", "mailexpire.com", "mailnesia.com",
  "spamgourmet.com", "spamgourmet.net",
  "fakeinbox.com", "fakemail.net",
  "mohmal.com", "mailtemp.info",
  "getairmail.com", "filzmail.com",
  "einrot.com", "einrot.de",
  "getnada.com", "binkmail.com",
  "harakirimail.com", "mailforspam.com",
  "mytemp.email", "tempmail.de", "wegwerfmail.de", "wegwerfmail.net",
  "spoofmail.de", "objectmail.com",
  "mailnull.net", "devnull.email",
  "mailtothis.com", "emkei.cz",
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return true
  return BLOCKED_EMAIL_DOMAINS.has(domain)
}
