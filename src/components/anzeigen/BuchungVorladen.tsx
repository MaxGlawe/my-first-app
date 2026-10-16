"use client"

/**
 * Den Buchungskalender vorladen, sobald der Knopf im Bild steht.
 *
 * Der Weg nach dem Klick ist länger, als er aussieht: Erst die Seite
 * `termin-buchen.html` von physiotherapie-glawe.de, dann von DORT aus eine
 * zweite Verbindung zum Widget auf my-first-app-psi-seven.vercel.app. Auf
 * dem Handy im Mobilfunknetz sind das zwei Namensauflösungen und zwei
 * TLS-Handschläge, bevor überhaupt ein Kalender zu sehen ist — und dazwischen
 * steht jemand, der gerade „buchen" gedrückt hat und eine weisse Seite
 * anschaut.
 *
 * Deshalb zwei Dinge, und bewusst in dieser Reihenfolge:
 *
 *   `preconnect` (im Layout, statisch) baut die Verbindungen auf, bevor
 *   irgendwer klickt. Es überträgt keine Seite, nur den Handschlag.
 *
 *   `prefetch` (hier) holt die Seite selbst — aber erst, wenn der Knopf
 *   wirklich im Bild steht und die Seite fertig geladen ist.
 *
 * ── Warum nicht sofort beim Laden ────────────────────────────────────────
 *
 * Weil im Layout schon einmal etwas gemessen und verworfen wurde: Ein
 * `preload` der Schriften machte die Seite LANGSAMER (2,2 s statt 2,0 s bei
 * 1,6 Mbit/s), weil es sich die Leitung mit dem Stylesheet teilte, das das
 * Zeichnen blockiert. Die feste Buchungsleiste ist von der ersten Sekunde an
 * im Bild — ein Vorladen „sobald sichtbar" wäre ohne Bremse also ein
 * Vorladen beim Laden. Also: erst `load`, dann eine Leerlaufphase, dann
 * holen. Bis dahin steht die Seite, und der Klick kommt frühestens, wenn
 * jemand gelesen hat.
 *
 * ── Warum die GENAUE Adresse des Knopfes ─────────────────────────────────
 *
 * Der Zwischenspeicher des Browsers unterscheidet Adressen samt
 * Fragezeichen-Anhang. `…/termin-buchen.html?service=…&cta=hero` und
 * `…&cta=leiste` sind für ihn zwei verschiedene Seiten. Vorgeladen wird
 * deshalb genau das Ziel des Knopfes, der im Bild steht — nicht eine
 * aufgeräumte Fassung ohne Parameter, die beim Klick niemandem hilft.
 */

import { useEffect } from "react"

/** Höchstens so viele Adressen — eine je sichtbarem Knopf, dann Schluss. */
const HOECHSTENS = 2

/** Sekunden Leerlauf nach `load`, bevor geholt wird. */
const RUHE_MS = 1200

type Netz = { saveData?: boolean; effectiveType?: string }

/** Wer wenig Daten will oder im Edge hängt, bekommt kein Vorladen. */
function sparen(): boolean {
  const n = (navigator as Navigator & { connection?: Netz }).connection
  if (!n) return false
  if (n.saveData) return true
  return n.effectiveType === "slow-2g" || n.effectiveType === "2g"
}

export function BuchungVorladen() {
  useEffect(() => {
    if (sparen()) return

    const geholt = new Set<string>()

    const holen = (adresse: string) => {
      if (geholt.has(adresse) || geholt.size >= HOECHSTENS) return
      geholt.add(adresse)
      const link = document.createElement("link")
      link.rel = "prefetch"
      // KEIN `as="document"`.
      //
      // Naheliegend waere es — es ist ja eine Seite, zu der navigiert wird.
      // Die Eigenschaft `link.as` ist aber eine Aufzaehlung mit festen
      // Werten, und „document" steht nicht darin: Der Browser verwirft die
      // Zuweisung stillschweigend, `link.as` bleibt leer. Nachgemessen am
      // 16.10.2026 im Browser — der Abruf passiert trotzdem und mit der
      // richtigen (niedrigen) Prioritaet. Eine Zeile, die nichts tut,
      // waere nur eine Behauptung im Code.
      link.href = adresse
      document.head.appendChild(link)
    }

    let abbrechen: (() => void) | undefined

    const spaeter = (tun: () => void) => {
      const warten = () => {
        const w = window as Window & {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
        }
        if (w.requestIdleCallback) w.requestIdleCallback(tun, { timeout: 4000 })
        else window.setTimeout(tun, 0)
      }
      if (document.readyState === "complete") {
        const uhr = window.setTimeout(warten, RUHE_MS)
        abbrechen = () => window.clearTimeout(uhr)
        return
      }
      const beimLaden = () => {
        const uhr = window.setTimeout(warten, RUHE_MS)
        abbrechen = () => window.clearTimeout(uhr)
      }
      window.addEventListener("load", beimLaden, { once: true })
      abbrechen = () => window.removeEventListener("load", beimLaden)
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue
          const knopf = eintrag.target as HTMLAnchorElement
          beobachter.unobserve(knopf)
          if (knopf.href) spaeter(() => holen(knopf.href))
        }
      },
      // Keine Schwelle: Ein Knopf, von dem die oberste Zeile zu sehen ist,
      // ist sichtbar. `0.5` hätte bei der festen Leiste am unteren Rand
      // mancher Geräte nie ausgelöst.
      { threshold: 0 }
    )

    /**
     * Die Knöpfe stehen in der SEITE, nicht im Layout. Beim ersten Durchlauf
     * können sie noch fehlen — darum ein zweiter Blick im nächsten Bild und
     * danach ein Beobachter, der auf Nachzügler wartet (die feste Leiste
     * erscheint erst, wenn die Einwilligung entschieden ist).
     */
    const einsammeln = () => {
      const knoepfe = document.querySelectorAll<HTMLAnchorElement>("a.js-book[href]")
      knoepfe.forEach((k) => beobachter.observe(k))
      return knoepfe.length
    }

    einsammeln()
    const bild = window.requestAnimationFrame(einsammeln)

    const aufpasser = new MutationObserver(() => {
      if (geholt.size >= HOECHSTENS) {
        aufpasser.disconnect()
        return
      }
      einsammeln()
    })
    aufpasser.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.cancelAnimationFrame(bild)
      beobachter.disconnect()
      aufpasser.disconnect()
      abbrechen?.()
    }
  }, [])

  return null
}
