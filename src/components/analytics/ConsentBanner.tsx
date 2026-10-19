"use client"

/**
 * Das Einwilligungsbanner — schmale Leiste statt Panel (seit 13.10.2026).
 *
 * Drei Dinge, die hier nicht verhandelbar sind:
 *
 *   1. GLEICHWERTIGE KNÖPFE. „Akzeptieren" und „Ablehnen" stehen
 *      nebeneinander, gleich groß, gleich auffällig. Ein grau getarntes
 *      „Ablehnen" neben einem leuchtenden „Akzeptieren" ist nach der
 *      Rechtsprechung keine freie Entscheidung — und wäre damit gar keine
 *      Einwilligung.
 *
 *   2. OHNE ENTSCHEIDUNG LÄDT NICHTS. Kein Skript, kein Beacon, kein Cookie.
 *      Das Banner hat kein „X" zum Wegklicken, denn Wegklicken ist weder
 *      Zustimmung noch Ablehnung; es bliebe unklar, was gilt.
 *
 *   3. JEDERZEIT ÄNDERBAR. Der Fußzeilen-Link „Cookie-Einstellungen" öffnet
 *      dieselbe Ansicht erneut — über `window.praxisConsent.open()`.
 *
 * ── Warum schmal, und warum ÜBER der Buchungsleiste ──────────────────────
 *
 * Vorher war es ein Panel über der halben Höhe des Handybildschirms, und
 * die feste Buchungsleiste musste sich dafür ausblenden. Zwei Nachteile:
 * Der Besucher sah vom Angebot nichts mehr, und der wichtigste Knopf der
 * Seite verschwand genau in dem Moment, in dem er ankam.
 *
 * Jetzt sitzt die Leiste DIREKT ÜBER der Buchungsleiste, deren Höhe zur
 * Laufzeit gemessen wird (sie ändert sich mit der Systemschriftgröße, also
 * genügt keine feste Zahl). Die Buchungsleiste bleibt sichtbar.
 *
 * Höhe in `rem`, damit die Leiste mit der Systemschrift mitwächst. Bei
 * normaler Schrift sind das rund 15 % der Fensterhöhe. Reicht ein Fünftel
 * bei sehr großer Systemschrift nicht mehr, wächst die Leiste — und erst
 * ganz zuletzt rollt der TEXT, nie die Knopfzeile: Ein Banner, dessen
 * Ablehnen-Knopf man wegscrollen muss, ist keine freie Entscheidung.
 *
 * Erscheint nicht im Therapeuten-OS, in der Patienten-App und im
 * Sprechzimmer: Dort laufen ausschliesslich notwendige Cookies, es gibt
 * also nichts zu entscheiden.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { consentLesen, consentSchreiben, consentModeUpdate } from "@/lib/consent"
import { useConversionTracker } from "@/hooks/use-conversion-tracker"

const PAPER = "#F8F5F0"
const INK = "#12160f"
const BODY = "#3a4038"
const MUTED = "#6b7365"
const LINE = "#e3ddd1"
const GREEN = "#2C3E2D"

/** Angemeldete Bereiche ohne Marketing-Tags — dort kein Banner. */
const OHNE_BANNER = ["/os", "/app", "/hr", "/sprechzimmer", "/meine-termine"]

export function ConsentBanner() {
  const pfad = usePathname()
  const [offen, setOffen] = useState(false)
  const [details, setDetails] = useState(false)
  const [marketing, setMarketing] = useState(false)
  /** Abstand nach unten: Höhe der festen Buchungsleiste, falls es eine gibt. */
  const [sockel, setSockel] = useState(0)
  const { trackConversion } = useConversionTracker()
  /** Nur die automatische Einblendung zählt, nicht das erneute Öffnen. */
  const gemeldet = useRef(false)

  const oeffnen = useCallback(() => {
    const c = consentLesen()
    setMarketing(c?.marketing ?? false)
    setDetails(false)
    setOffen(true)
  }, [])

  useEffect(() => {
    // Erst nach dem Einhängen entscheiden, ob das Banner nötig ist: Auf dem
    // Server gibt es keinen localStorage, und ein serverseitig gerendertes
    // Banner würde bei jedem Besucher kurz aufblitzen, auch bei dem, der
    // längst entschieden hat.
    if (consentLesen() === null) setOffen(true)

    const w = window as unknown as { praxisConsent?: { open: () => void } }
    w.praxisConsent = { open: oeffnen }
    return () => {
      delete w.praxisConsent
    }
  }, [oeffnen])

  const unterdrueckt = OHNE_BANNER.some((p) => pfad?.startsWith(p))
  const sichtbar = offen && !unterdrueckt

  // Die Buchungsleiste ausmessen, statt ihre Höhe zu raten: Sie wächst mit
  // der Systemschrift und mit dem Sicherheitsabstand am unteren Rand des
  // iPhones. Ein fester Wert wäre auf dem einen Gerät zu klein (die Leisten
  // überlappen) und auf dem anderen zu gross (eine Lücke dazwischen).
  //
  // Die Leiste kann AUCH SPÄTER erscheinen. Auf /check gibt es sie erst,
  // wenn die Einschätzung steht — vorher wäre ein Buchungsangebot falsch,
  // weil die Sicherheitsfrage noch nicht beantwortet ist. Die erste
  // Fassung suchte nur beim Einblenden des Banners nach ihr, fand nichts
  // und setzte den Sockel auf 0: Das Banner lag dann über dem
  // Buchungsknopf, und der wichtigste Knopf der Seite war nicht
  // anklickbar. Gefunden am 19.10.2026 beim Durchklicken am Telefon.
  //
  // Deshalb zusätzlich ein Beobachter auf dem Dokument — er hört auf, sobald
  // die Leiste da ist.
  useEffect(() => {
    if (!sichtbar) return

    let beobachter: ResizeObserver | null = null
    let aufraeumen: (() => void) | null = null

    const anhaengen = (leiste: HTMLElement) => {
      const messen = () => setSockel(leiste.getBoundingClientRect().height)
      messen()
      beobachter = new ResizeObserver(messen)
      beobachter.observe(leiste)
      window.addEventListener("resize", messen)
      aufraeumen = () => window.removeEventListener("resize", messen)
    }

    const vorhanden = document.querySelector<HTMLElement>(".sticky-cta")
    if (vorhanden) {
      anhaengen(vorhanden)
    } else {
      setSockel(0)
    }

    const aufpasser = new MutationObserver(() => {
      if (beobachter) return
      const spaeter = document.querySelector<HTMLElement>(".sticky-cta")
      if (spaeter) anhaengen(spaeter)
    })
    aufpasser.observe(document.body, { childList: true, subtree: true })

    return () => {
      aufpasser.disconnect()
      beobachter?.disconnect()
      aufraeumen?.()
    }
  }, [sichtbar])

  // Dass das Banner ERSCHIENEN ist, muss gemessen werden — sonst lässt sich
  // „ohne Auswahl gegangen" nicht von „nie gefragt worden" unterscheiden,
  // und genau diese Gruppe ist die interessante.
  useEffect(() => {
    if (!sichtbar || gemeldet.current) return
    gemeldet.current = true
    trackConversion("consent_gezeigt", { seite: pfad })
  }, [sichtbar, pfad, trackConversion])

  if (unterdrueckt || !offen) return null

  function entscheiden(marketingErlaubt: boolean) {
    consentSchreiben(marketingErlaubt)
    consentModeUpdate(marketingErlaubt)
    trackConversion(marketingErlaubt ? "consent_akzeptiert" : "consent_abgelehnt", { seite: pfad })
    setOffen(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 z-[100]"
      style={{
        // Sitzt auf der Buchungsleiste auf. Ohne Leiste (Startseite, übrige
        // Seiten) liegt sie selbst am unteren Rand, dann zählt nur der
        // Sicherheitsabstand des Geräts.
        bottom: sockel > 0 ? `${sockel}px` : "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className="mx-auto flex max-w-2xl flex-col gap-[0.5rem] border-t px-[0.9rem] py-[0.7rem]"
        style={{
          backgroundColor: PAPER,
          borderColor: LINE,
          // Eine OBERGRENZE, keine Höhe: Die Leiste nimmt sich, was ihr
          // Inhalt braucht, und nicht mehr.
          //
          // Bei normaler Systemschrift sind das rund 15 % der Fensterhöhe,
          // bei 150 % etwa 25 %. Erst bei 200 % reicht ein Fünftel nicht
          // mehr — der Erklärtext allein braucht dann fünf Zeilen. Dann
          // wächst die Leiste, statt den Text abzuschneiden: Ein Banner,
          // dessen Erklärung man nicht lesen kann, ist keine informierte
          // Einwilligung, und ein abgeschnittener Satz sieht aus wie ein
          // Fehler.
          //
          // 45 % ist die harte Grenze. Darüber bliebe von der Seite nichts
          // mehr übrig, und dann rollt doch der Text.
          //
          // Nur eine Obergrenze, KEIN `clamp`: `clamp(18vh, 11rem, 45vh)`
          // hätte 11rem genommen, solange der Wert dazwischen liegt — bei
          // 200 % Schrift also feste 352 px, und der Text wäre wieder
          // abgeschnitten gewesen. Genau so gesehen. `max-height` allein
          // lässt den Inhalt bestimmen und greift erst als Notbremse.
          maxHeight: "45vh",
          // Ohne dies quillt der Inhalt bei grosser Schrift unten heraus und
          // legt sich über die Buchungsleiste. Genau so gesehen bei 200 %.
          overflow: "hidden",
          boxShadow: "0 -6px 24px rgba(15,42,31,0.10)",
        }}
      >
        {/* Nur DIESER Teil rollt, wenn es eng wird. Die Knopfzeile darunter
            bleibt immer stehen. Das data-Attribut ist der Haltegriff für
            die Prüfung „ist der Text wirklich ganz zu lesen". */}
        <div data-consent-text style={{ flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
          <p className="m-0 text-[0.82rem] leading-[1.35]" style={{ color: BODY }}>
            Wir messen mit dem Meta-Pixel, über welche Anzeige du kommst – nur mit deiner
            Zustimmung.
          </p>

          {details && (
            <label
              className="mt-[0.5rem] flex cursor-pointer items-start justify-between gap-2 rounded-lg border p-[0.5rem]"
              style={{ borderColor: marketing ? GREEN : LINE }}
            >
              <span className="text-[0.75rem] leading-[1.3]" style={{ color: MUTED }}>
                <strong style={{ color: INK }}>Marketing:</strong> Meta-Pixel. Überträgt Daten an
                Meta Platforms Ireland. Notwendige Cookies sind immer aktiv.
              </span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-[0.1rem] h-[0.9rem] w-[0.9rem] shrink-0"
                style={{ accentColor: GREEN }}
                aria-label="Marketing erlauben"
              />
            </label>
          )}
        </div>

        {/* Gleichwertig: gleiche Breite, gleiche Höhe, gleiches Gewicht. */}
        <div className="flex shrink-0 gap-[0.5rem]">
          <button
            type="button"
            onClick={() => entscheiden(false)}
            className="h-[2.6rem] flex-1 rounded-lg border text-[0.85rem] font-semibold"
            style={{ borderColor: GREEN, color: GREEN, backgroundColor: "transparent" }}
          >
            Ablehnen
          </button>
          <button
            type="button"
            onClick={() => entscheiden(details ? marketing : true)}
            className="h-[2.6rem] flex-1 rounded-lg text-[0.85rem] font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {details ? "Auswahl speichern" : "Akzeptieren"}
          </button>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-center gap-x-[0.9rem] gap-y-[0.2rem] text-[0.7rem]"
          style={{ color: MUTED }}
        >
          {!details && (
            <button type="button" onClick={() => setDetails(true)} className="underline">
              Einstellungen
            </button>
          )}
          <a href="/datenschutz" className="underline">
            Datenschutz
          </a>
          <a href="/impressum" className="underline">
            Impressum
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Der Fußzeilen-Link. Öffnet das Banner erneut — die Entscheidung bleibt
 * jederzeit änderbar, auch der Widerruf einer erteilten Zustimmung.
 */
export function ConsentEinstellungenLink({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        const w = window as unknown as { praxisConsent?: { open: () => void } }
        w.praxisConsent?.open()
      }}
    >
      Cookie-Einstellungen
    </button>
  )
}
