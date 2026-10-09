/**
 * Einwilligung in Marketing-Cookies — § 25 TDDDG, Art. 6 DSGVO.
 *
 * Zwei Kategorien, mehr nicht:
 *
 *   NOTWENDIG   immer an, nicht abwählbar. Anmeldung, Sitzung, Warenkorb —
 *               alles, ohne das die Seite nicht funktioniert. Dafür braucht
 *               es keine Einwilligung.
 *
 *   MARKETING   Meta-Pixel, später Google Ads. Lädt NUR nach ausdrücklicher
 *               Zustimmung. Ohne Entscheidung wird nichts nachgeladen — kein
 *               Skript, kein Beacon, kein Cookie.
 *
 * Es gibt bewusst keine Kategorie „Statistik": Praxis OS misst serverseitig,
 * ohne Cookies und ohne Dritte. Eine Kategorie anzubieten, hinter der nichts
 * steht, wäre eine Frage ohne Folgen.
 *
 * Vorbild ist `consent.js` auf physiotherapie-glawe.de, damit ein Patient,
 * der zwischen beiden Seiten wechselt, dasselbe Verhalten vorfindet. Der
 * Speicherschlüssel ist bewusst ein anderer: Die Seiten liegen auf
 * verschiedenen Domänen, eine geteilte Entscheidung gäbe es ohnehin nicht,
 * und ein gleicher Name würde Gemeinsamkeit vortäuschen.
 */

export const CONSENT_KEY = "praxisos_consent_v1"

/** Wird auf `window` ausgelöst, sobald sich die Entscheidung ändert. */
export const CONSENT_EVENT = "praxisos-consent-changed"

export interface ConsentState {
  /** Immer `true`. Steht hier, damit die gespeicherte Form vollständig ist. */
  notwendig: true
  marketing: boolean
  /** Wann entschieden wurde — für den Nachweis. */
  ts: string
  /** Fassung der Einwilligung. Ändert sich der Umfang, wird neu gefragt. */
  v: 1
}

export function consentLesen(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const roh = window.localStorage.getItem(CONSENT_KEY)
    if (!roh) return null
    const c = JSON.parse(roh) as ConsentState
    // Eine aeltere Fassung gilt nicht weiter: Wer zu etwas anderem zugestimmt
    // hat, hat zu diesem hier nicht zugestimmt.
    if (c?.v !== 1) return null
    return { ...c, notwendig: true }
  } catch {
    // Privater Modus, gesperrter Speicher: Dann gilt „keine Entscheidung",
    // das Banner erscheint erneut und es laedt nichts. Die sichere Richtung.
    return null
  }
}

/**
 * Beim Widerruf die bereits gesetzten Marketing-Cookies entfernen.
 *
 * Ein Widerruf, der nur das Nachladen verhindert, lässt die Kennung stehen,
 * die beim letzten Besuch gesetzt wurde — und damit bleibt der Besucher
 * wiedererkennbar. `_fbp` läuft 90 Tage.
 *
 * Was NICHT geht: eine bereits geladene fbevents.js aus dem laufenden Tab
 * entfernen. Der Widerruf wirkt deshalb ab dem nächsten Seitenaufruf
 * vollständig, im aktuellen Tab nur, soweit nichts mehr gefeuert wird. Das
 * ist die Grenze jeder Einwilligungslösung im Browser.
 */
function marketingCookiesLoeschen(): void {
  const PRAEFIXE = ["_fbp", "_fbc", "fr"]
  const host = window.location.hostname.replace(/^www\./, "")

  for (const teil of document.cookie.split(";")) {
    const name = teil.split("=")[0]?.trim()
    if (!name || !PRAEFIXE.some((p) => name.startsWith(p))) continue
    // Dieselbe Kennung kann auf drei Geltungsbereichen liegen; welcher es war,
    // laesst sich nicht auslesen. Also alle drei ueberschreiben.
    for (const bereich of ["", `; domain=${host}`, `; domain=.${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${bereich}`
    }
  }
}

export function consentSchreiben(marketing: boolean): ConsentState {
  const vorher = consentLesen()
  const c: ConsentState = {
    notwendig: true,
    marketing,
    ts: new Date().toISOString(),
    v: 1,
  }
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(c))
  } catch {
    /* nicht speicherbar — die Entscheidung gilt dann nur für diesen Besuch */
  }
  // Nur beim Widerruf aufraeumen, nicht bei jeder Speicherung.
  if (vorher?.marketing && !marketing) marketingCookiesLoeschen()

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }))
  return c
}

/** Hat der Besucher Marketing ausdrücklich erlaubt? Im Zweifel: nein. */
export function marketingErlaubt(): boolean {
  return consentLesen()?.marketing === true
}

// ────────────────────────────────────────────────────────────────────────
// Google Consent Mode v2
// ────────────────────────────────────────────────────────────────────────
//
// Google Ads kommt erst noch. Die Signale werden trotzdem jetzt schon
// gesetzt, denn sie muessen VOR dem ersten Tag im Dokument stehen — wer sie
// nachtraegt, wenn der erste Tag schon laeuft, hat genau einmal zu frueh
// gemessen. `denied` ist die Voreinstellung; bei Zustimmung folgt ein
// `update`.
//
// `analytics_storage` bleibt dauerhaft `denied`: Es gibt keine
// Statistik-Kategorie, zu der jemand zustimmen koennte.

type GtagFn = (...args: unknown[]) => void

function gtag(...args: unknown[]): void {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: GtagFn }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(args)
}

/** Das Vorab-`default`. Gehört in den Dokumentkopf, vor jedes andere Tag. */
export const CONSENT_MODE_DEFAULT_SNIPPET = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
`.trim()

/** Nach der Entscheidung: Google die Freigabe mitteilen (oder den Widerruf). */
export function consentModeUpdate(marketing: boolean): void {
  if (typeof window === "undefined") return
  const wert = marketing ? "granted" : "denied"
  gtag("consent", "update", {
    ad_storage: wert,
    ad_user_data: wert,
    ad_personalization: wert,
  })
}
