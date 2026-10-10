"use client"

/**
 * Was der Besucher auf der Seite wirklich getan hat.
 *
 * Löst `LesetiefeMessen` ab. Gemessen werden drei Dinge, und jedes antwortet
 * auf eine Frage, die die alte Messung offen liess:
 *
 *   lesetiefe_25/50/75/100   Wie weit ist er gekommen?
 *   aktivzeit_15/45/120      Wie lange war er WIRKLICH da?
 *   abschnitt_<id>           Hat er den Preis überhaupt gesehen?
 *
 * Jedes Ereignis genau einmal je Seitenaufruf.
 *
 * ── Warum die Lesetiefe neu gerechnet wird ───────────────────────────────
 *
 * Vorher: `scrollY / (scrollHeight - innerHeight)` — der Anteil der
 * Scrollstrecke. Das ist nicht, was jemand gesehen hat: Bei scrollY = 0 hat
 * er das erste Fenster voll gelesen, die Formel sagt 0 %. Und „100 %" war
 * nur im letzten Pixel zu haben; auf dem Handy ist das praktisch
 * unerreichbar, weil die Adressleiste beim Scrollen ein- und ausfährt und
 * `innerHeight` dabei um 60 bis 100 Pixel springt. In der Messung vom
 * 10.10.2026 feuerten 25/50/75 — und 100 nie.
 *
 * Jetzt: `(scrollY + innerHeight) / scrollHeight` — der Anteil des
 * Dokuments, der schon durch das Fenster gelaufen ist. 100 % heisst „unten
 * angekommen", und zwar robust. So rechnet auch GA4.
 *
 * ── Warum aktive Zeit und nicht Verweildauer ──────────────────────────────
 *
 * `page_views.duration_seconds` misst Anmeldung bis Entladen. Längster Wert
 * im Bestand: 84.977 Sekunden — ein Tab, der über Nacht offen blieb. 29 von
 * 1000 Aufrufen liegen über einer Stunde. Ein Mittelwert daraus ist nicht
 * ungenau, er ist bedeutungslos. Hier läuft die Uhr nur, solange der Tab
 * sichtbar ist UND in den letzten 30 Sekunden etwas passiert ist.
 *
 * Kein Cookie, keine Einwilligung nötig: Es wird nur die ohnehin bestehende
 * Sitzungskennung verwendet, und nichts verlässt das eigene Haus.
 */

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"

const TIEFEN = [25, 50, 75, 100] as const
const AKTIV_SEKUNDEN = [15, 45, 120] as const

/** Nach so langer Untätigkeit zählt die Zeit nicht mehr. */
const LEERLAUF_MS = 30_000
/** Taktlänge der Uhr. Eine Sekunde reicht; feiner wäre nur Rechenlast. */
const TAKT_MS = 1_000
/**
 * Mehr als das darf ein Takt nicht gutschreiben. Schläft der Rechner ein
 * oder drosselt der Browser den Hintergrundtab, kommt der Timer mit einer
 * Lücke von Minuten zurück — die dürfen nicht als Lesezeit gelten.
 */
const TAKT_MAX_MS = 2_000

export function AufmerksamkeitMessen({
  seite,
  abschnitte = [],
}: {
  seite?: string
  /** Element-IDs der Abschnitte, deren Erreichen gemeldet werden soll. */
  abschnitte?: string[]
}) {
  const pfad = usePathname()
  const { trackConversion } = useConversionTracker()

  useEffect(() => {
    const gemeldet = new Set<string>()
    const kennung = seite ?? pfad

    function melden(name: string, zusatz: Record<string, unknown> = {}) {
      if (gemeldet.has(name)) return
      gemeldet.add(name)
      trackConversion(name, { seite: kennung, ...zusatz })
    }

    // ── Lesetiefe ────────────────────────────────────────────────────────
    let tiefe = 0
    let wartetAufBild = false

    function tiefeMessen() {
      wartetAufBild = false
      const gesamt = document.documentElement.scrollHeight
      if (gesamt <= 0) return
      const gesehen = Math.min(gesamt, (window.scrollY || 0) + window.innerHeight)
      const anteil = Math.min(100, Math.round((gesehen / gesamt) * 100))
      if (anteil <= tiefe) return
      tiefe = anteil
      for (const marke of TIEFEN) {
        if (anteil >= marke) melden(`lesetiefe_${marke}`)
      }
    }

    // Gebündelt auf den nächsten Bildaufbau: Scroll-Ereignisse kommen
    // dutzendweise pro Sekunde, gerechnet werden muss einmal pro Bild.
    function tiefeAnstossen() {
      if (wartetAufBild) return
      wartetAufBild = true
      requestAnimationFrame(tiefeMessen)
    }

    // ── Aktive Zeit ──────────────────────────────────────────────────────
    let aktivMs = 0
    let letzteTat = Date.now()
    let letzterTakt = Date.now()

    function takt() {
      const jetzt = Date.now()
      const verstrichen = jetzt - letzterTakt
      letzterTakt = jetzt
      const wach = document.visibilityState === "visible" && jetzt - letzteTat < LEERLAUF_MS
      if (!wach) return
      aktivMs += Math.min(verstrichen, TAKT_MAX_MS)
      for (const marke of AKTIV_SEKUNDEN) {
        if (aktivMs >= marke * 1000) melden(`aktivzeit_${marke}`)
      }
    }

    function tat() {
      letzteTat = Date.now()
    }

    // ── Abschnitte ───────────────────────────────────────────────────────
    //
    // „Erreicht" heisst: der Abschnitt ist in die obersten drei Viertel des
    // Fensters gewandert — also nicht nur am unteren Rand aufgeblitzt.
    //
    // NICHT ueber `threshold: 0.25` (Anteil des ELEMENTS im Fenster): Der
    // Abschnitt „Ablauf" ist auf dem Handy rund 3.000 Pixel hoch, ein
    // Viertel davon sind 750 Pixel mehr, als das Fenster hoch ist — die
    // Schwelle war dort unerreichbar. Im Test vom 10.10.2026 meldeten fuenf
    // von sechs Abschnitten, genau dieser nie. `rootMargin` bezieht die
    // Schwelle stattdessen aufs Fenster und ist damit von der
    // Abschnittshoehe unabhaengig.
    let beobachter: IntersectionObserver | null = null
    if (abschnitte.length > 0 && typeof IntersectionObserver !== "undefined") {
      beobachter = new IntersectionObserver(
        (eintraege) => {
          for (const e of eintraege) {
            if (!e.isIntersecting) continue
            melden(`abschnitt_${e.target.id}`)
            beobachter?.unobserve(e.target)
          }
        },
        { threshold: 0, rootMargin: "0px 0px -25% 0px" }
      )
      for (const id of abschnitte) {
        const el = document.getElementById(id)
        if (el) beobachter.observe(el)
        // Fehlt die ID, wird nichts gemeldet — und im Trichter fehlt eine
        // Stufe statt einer falschen Null. Deshalb der Hinweis in der
        // Entwicklerkonsole, dort fällt es beim Umbenennen auf.
        else if (process.env.NODE_ENV !== "production") {
          console.warn(`[AufmerksamkeitMessen] Abschnitt #${id} nicht gefunden`)
        }
      }
    }

    // ── Anmelden ─────────────────────────────────────────────────────────
    window.addEventListener("scroll", tiefeAnstossen, { passive: true })
    // Die Seitenhöhe ändert sich nach dem ersten Bild noch: Bilder laden,
    // Schriften kommen, ein Akkordeon klappt auf. Ohne diese beiden wäre
    // die Lesetiefe an der Höhe des leeren Gerüsts gemessen.
    window.addEventListener("resize", tiefeAnstossen, { passive: true })
    window.addEventListener("load", tiefeAnstossen)

    for (const art of ["scroll", "keydown", "pointerdown", "touchstart", "wheel"] as const) {
      window.addEventListener(art, tat, { passive: true })
    }
    document.addEventListener("visibilitychange", tat)

    const uhr = window.setInterval(takt, TAKT_MS)

    // Einmal sofort: Wer über einen Ankerlink (`/#preis`) kommt, steht beim
    // ersten Bild schon unten.
    tiefeMessen()

    return () => {
      window.clearInterval(uhr)
      window.removeEventListener("scroll", tiefeAnstossen)
      window.removeEventListener("resize", tiefeAnstossen)
      window.removeEventListener("load", tiefeAnstossen)
      for (const art of ["scroll", "keydown", "pointerdown", "touchstart", "wheel"] as const) {
        window.removeEventListener(art, tat)
      }
      document.removeEventListener("visibilitychange", tat)
      beobachter?.disconnect()
    }
    // `abschnitte` ist eine Literalliste aus dem Aufrufer und ändert sich
    // nicht; sie zu vergleichen würde den Effekt bei jedem Bild neu starten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pfad, seite, trackConversion])

  return null
}
