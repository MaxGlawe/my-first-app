"use client"

/**
 * Das Einwilligungsbanner.
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
 * Erscheint nicht im Therapeuten-OS, in der Patienten-App und im
 * Sprechzimmer: Dort laufen ausschliesslich notwendige Cookies, es gibt also
 * nichts zu entscheiden. Ein Banner ohne Gegenstand erzieht nur zum
 * Wegklicken.
 */

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { consentLesen, consentSchreiben, consentModeUpdate } from "@/lib/consent"

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

  if (OHNE_BANNER.some((p) => pfad?.startsWith(p))) return null
  if (!offen) return null

  function entscheiden(marketingErlaubt: boolean) {
    consentSchreiben(marketingErlaubt)
    consentModeUpdate(marketingErlaubt)
    setOffen(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div
        className="mx-auto max-w-2xl rounded-2xl border p-5 shadow-xl"
        style={{ backgroundColor: PAPER, borderColor: LINE }}
      >
        <h2 className="text-[15px] font-semibold" style={{ color: INK }}>
          Cookies und Reichweitenmessung
        </h2>

        <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: BODY }}>
          Notwendige Cookies brauchen wir, damit die Seite funktioniert — sie sind immer aktiv.
          Zusätzlich möchten wir messen, über welche Anzeige Besucher zu uns finden. Dafür würde
          der Meta-Pixel geladen und Daten an Meta übertragen. Das geschieht nur mit deiner
          Zustimmung.
        </p>

        {details && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border p-3" style={{ borderColor: LINE }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: INK }}>
                    Notwendig
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
                    Anmeldung, Sitzung, Spracheinstellung. Ohne sie funktioniert die Seite nicht.
                  </p>
                </div>
                <span className="shrink-0 text-[12.5px] font-semibold" style={{ color: MUTED }}>
                  immer aktiv
                </span>
              </div>
            </div>

            <label
              className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3"
              style={{ borderColor: marketing ? GREEN : LINE }}
            >
              <div>
                <p className="text-[13.5px] font-semibold" style={{ color: INK }}>
                  Marketing
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
                  Meta-Pixel. Misst, welche Anzeige zu einem Besuch geführt hat. Überträgt Daten
                  an Meta Platforms Ireland.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ accentColor: GREEN }}
                aria-label="Marketing erlauben"
              />
            </label>
          </div>
        )}

        {/* Gleichwertig: gleiche Groesse, gleiches Gewicht, gleiche Reihenfolge
            auf jeder Bildschirmbreite. */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => entscheiden(false)}
            className="h-11 flex-1 rounded-xl border text-[14px] font-semibold"
            style={{ borderColor: GREEN, color: GREEN, backgroundColor: "transparent" }}
          >
            Ablehnen
          </button>
          <button
            type="button"
            onClick={() => entscheiden(details ? marketing : true)}
            className="h-11 flex-1 rounded-xl text-[14px] font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {details ? "Auswahl speichern" : "Akzeptieren"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
          {!details && (
            <button
              type="button"
              onClick={() => setDetails(true)}
              className="underline"
              style={{ color: MUTED }}
            >
              Einstellungen anpassen
            </button>
          )}
          <a href="/datenschutz" className="underline" style={{ color: MUTED }}>
            Datenschutz
          </a>
          <a href="/impressum" className="underline" style={{ color: MUTED }}>
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
