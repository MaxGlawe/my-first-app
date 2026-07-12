/**
 * Tracking der Masterclass-Salespage (Spec B3 / Teil D).
 *
 * Zweck: die Preis-Entscheidung auf Daten stellen statt auf Bauchgefühl.
 * Erst die Kombination aus Scroll-Tiefe und Button-Klick macht unterscheidbar:
 *
 *   frühe Absprünge (25 % Scroll)          → die Seite überzeugt nicht
 *   tiefes Scrollen, kein Button-Klick     → das Angebot überzeugt nicht
 *   Button-Klick, aber kein Kauf           → Hürde am Checkout
 *                                            → zuerst Klarna prominenter, DANN erst Preis senken
 *
 * Ohne diese Unterscheidung würde man beim ersten Ausbleiben von Käufen
 * reflexhaft am Preis drehen — meistens die falsche Stellschraube.
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>

const STORAGE_KEY = "praxisos_utm"

/**
 * Liest die UTM-Parameter aus der URL und merkt sie sich für die Sitzung.
 *
 * Nötig, weil zwischen Klick (Mail → Salespage) und Kauf ein Seitenwechsel und
 * ein Formular liegen: Ohne Zwischenspeicher wäre die Herkunft beim Checkout
 * verloren — und `conversion_source` bliebe leer. Genau daran ist die alte
 * Buchungs-Attribution gescheitert (0 von 521 Leads zuordenbar).
 */
export function captureUtm(): UtmParams {
  if (typeof window === "undefined") return {}

  const params = new URLSearchParams(window.location.search)
  const fresh: UtmParams = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) fresh[key] = value.slice(0, 120)
  }

  try {
    if (Object.keys(fresh).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
      return fresh
    }
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as UtmParams) : {}
  } catch {
    // Private Mode / blockierter Storage — dann eben ohne Attribution.
    return fresh
  }
}

/** Sendet ein Event; blockiert nie den Kauf-Flow. */
async function track(eventType: string, metadata: Record<string, unknown>): Promise<void> {
  try {
    await fetch("/api/shop/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true, // überlebt den Seitenwechsel zu Stripe
      body: JSON.stringify({ eventType, metadata }),
    })
  } catch {
    // Tracking darf niemals einen Kauf verhindern.
  }
}

/** Klick auf „Jetzt kaufen" — VOR dem Sprung zu Stripe. */
export function trackBuyClick(slug: string, utm: UtmParams): void {
  void track("salespage_buy_click", { slug, ...utm })
}

/**
 * Scroll-Tiefe 25/50/75/100 %. Jede Schwelle feuert genau einmal.
 * Gibt eine Aufräum-Funktion zurück (für useEffect).
 */
export function trackScrollDepth(slug: string): () => void {
  if (typeof window === "undefined") return () => {}

  const thresholds = [25, 50, 75, 100]
  const fired = new Set<number>()

  const onScroll = () => {
    const doc = document.documentElement
    const scrollable = doc.scrollHeight - window.innerHeight
    if (scrollable <= 0) return

    const percent = (window.scrollY / scrollable) * 100

    for (const t of thresholds) {
      if (percent >= t && !fired.has(t)) {
        fired.add(t)
        void track("salespage_scroll", { slug, depth: t })
      }
    }

    if (fired.size === thresholds.length) {
      window.removeEventListener("scroll", onScroll)
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  onScroll() // kurze Seiten / Direkteinstieg weit unten

  return () => window.removeEventListener("scroll", onScroll)
}
