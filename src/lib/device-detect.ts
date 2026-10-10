export function getDeviceType(ua: string): "mobile" | "tablet" | "desktop" {
  if (/Tablet|iPad/i.test(ua)) return "tablet"
  if (/Mobi|Android.*Mobile|iPhone/i.test(ua)) return "mobile"
  return "desktop"
}

/**
 * In-App-Browser: die Webansicht INNERHALB einer App.
 *
 * Wer eine Meta-Anzeige antippt, landet nicht im Systembrowser, sondern in
 * Instagrams bzw. Facebooks eingebauter Ansicht. Die schickt sich als
 * "Chrome" aus — deshalb stand dieser Traffic bisher unter Chrome und war
 * damit unsichtbar. Das ist kein Schoenheitsfehler: In diesen Ansichten
 * fehlen Teile des Speichers, Weiterleitungen brechen, und das Buchungstool
 * auf fremder Domaene kann scheitern, wo es im Systembrowser laeuft. Wenn
 * 218 Anzeigenbesucher kein einziges Ereignis ausloesen, muss man WISSEN,
 * ob sie ueberhaupt in einem funktionsfaehigen Browser waren.
 */
export function getInAppBrowser(ua: string): string | null {
  if (/Instagram/i.test(ua)) return "Instagram"
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook"
  if (/\bLine\//i.test(ua)) return "LINE"
  if (/TikTok|BytedanceWebview|musical_ly/i.test(ua)) return "TikTok"
  if (/WhatsApp/i.test(ua)) return "WhatsApp"
  if (/\bGSA\//i.test(ua)) return "Google-App"
  if (/LinkedInApp/i.test(ua)) return "LinkedIn"
  return null
}

export function getBrowser(ua: string): string {
  // Zuerst: steckt der Besucher in einer App? Sonst verschwindet er unter
  // "Chrome" und die Frage, warum Anzeigen-Traffic nicht konvertiert,
  // bleibt unbeantwortbar.
  const app = getInAppBrowser(ua)
  if (app) return app + " (App)"

  if (/Edg\//i.test(ua)) return "Edge"
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "Opera"
  if (/SamsungBrowser/i.test(ua)) return "Samsung"
  if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) return "Chrome"
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari"
  if (/Firefox\//i.test(ua)) return "Firefox"
  return "Sonstige"
}

export function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|Googlebot|Bingbot|Yandex|DuckDuck|Baidu|facebookexternalhit|Twitterbot|LinkedInBot/i.test(ua)
}
