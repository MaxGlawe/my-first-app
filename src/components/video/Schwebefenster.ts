"use client"

/**
 * PROJ-28 — Das Gespräch als eigenes Fenster, das über allem schwebt.
 *
 * Der Behandler im ersten echten Call: „Ich kann auch nicht den Call klein
 * machen bei mir und was anderes im Hintergrund machen. Geht schlicht nicht."
 *
 * Die Schublade löst das für alles, was in Praxis OS passiert. Für den Rest —
 * Buchhaltung, ein Blick in einen anderen Patienten, irgendetwas außerhalb —
 * braucht es das Bild losgelöst von der Seite.
 *
 * DOCUMENT PICTURE-IN-PICTURE, nicht das gewöhnliche Bild-im-Bild. Der
 * Unterschied ist der Grund für diese Datei: Das gewöhnliche Verfahren kann
 * nur ein nacktes Videoelement. Dieses hier ist ein echtes kleines Fenster mit
 * eigenem Dokument — also mit Mikrofon- und Auflegen-Knopf. Ein schwebendes
 * Bild, das man weder stummschalten noch beenden kann, wäre im Gespräch
 * gefährlicher als nützlich: Man vergisst, dass es läuft.
 *
 * DAS BILD WIRD NICHT UMGEZOGEN, SONDERN EIN ZWEITES MAL ANGEZAPFT. Ein
 * React-verwaltetes Element in ein fremdes Dokument zu verschieben, endet
 * beim nächsten Rendern im Streit um denselben Knoten. LiveKit-Spuren lassen
 * sich an mehrere Elemente hängen — also bekommt das Fenster sein eigenes
 * Videoelement, und die Seite darunter behält ihres.
 *
 * Verfügbar in Chrome und Edge ab Version 116. Sonst bleibt der Knopf weg,
 * statt einen Fehler zu zeigen: Wer ihn nicht hat, soll ihn nicht vermissen.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { Track } from "livekit-client"

const PAPER = "#F8F5F0"
const GRUND = "#12150f"

interface PiPFenster extends Window {
  document: Document
}

interface PiPApi {
  requestWindow(optionen: { width?: number; height?: number }): Promise<PiPFenster>
  window: PiPFenster | null
}

function api(): PiPApi | null {
  if (typeof window === "undefined") return null
  const kandidat = (window as unknown as { documentPictureInPicture?: PiPApi })
    .documentPictureInPicture
  return kandidat && typeof kandidat.requestWindow === "function" ? kandidat : null
}

export interface SchwebefensterSteuerung {
  /** Kann dieser Browser es? Sonst bleibt der Knopf weg. */
  verfuegbar: boolean
  offen: boolean
  oeffnen: () => Promise<void>
  schliessen: () => void
}

export function useSchwebefenster({
  spur,
  gegenueber,
  mikroAn,
  onMikro,
  onAuflegen,
}: {
  /** Das Bild des Gegenübers. Ohne Spur bleibt das Fenster schwarz — dann lohnt es nicht. */
  spur: Track | undefined
  gegenueber: string
  mikroAn: boolean
  onMikro: () => void
  onAuflegen: () => void
}): SchwebefensterSteuerung {
  const [offen, setOffen] = useState(false)
  const fensterRef = useRef<PiPFenster | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mikroKnopfRef = useRef<HTMLButtonElement | null>(null)

  // Die Handler ändern sich bei jedem Rendern; das Fenster soll deswegen
  // nicht neu gebaut werden. Deshalb über Referenzen statt über den Knopf.
  const handler = useRef({ onMikro, onAuflegen })
  handler.current = { onMikro, onAuflegen }

  const schliessen = useCallback(() => {
    fensterRef.current?.close()
  }, [])

  const oeffnen = useCallback(async () => {
    const pip = api()
    if (!pip || fensterRef.current) return

    const fenster = await pip.requestWindow({ width: 340, height: 300 })
    fensterRef.current = fenster
    setOffen(true)

    const d = fenster.document
    d.body.style.margin = "0"
    d.body.style.backgroundColor = GRUND
    d.body.style.fontFamily =
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
    d.title = `Gespräch mit ${gegenueber}`

    const video = d.createElement("video")
    video.autoplay = true
    video.playsInline = true
    // Stumm: Der Ton läuft weiter über die Seite darunter. Zweimal derselbe
    // Ton wäre ein Echo, und genau daran scheitern solche Fenster sonst.
    video.muted = true
    video.style.cssText =
      "width:100%;height:calc(100% - 56px);object-fit:cover;background:#12150f;display:block"
    d.body.appendChild(video)
    videoRef.current = video

    const leiste = d.createElement("div")
    leiste.style.cssText =
      "height:56px;display:flex;align-items:center;justify-content:center;gap:10px;background:#171c14"
    d.body.appendChild(leiste)

    const knopf = (text: string, farbe: string) => {
      const b = d.createElement("button")
      b.textContent = text
      b.style.cssText =
        `border:0;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;` +
        `cursor:pointer;color:${PAPER};background:${farbe}`
      leiste.appendChild(b)
      return b
    }

    const mikro = knopf(mikroAn ? "Stumm schalten" : "Stumm aus", "rgba(248,245,240,0.10)")
    mikro.onclick = () => handler.current.onMikro()
    mikroKnopfRef.current = mikro

    const auflegen = knopf("Auflegen", "#8c3a2b")
    auflegen.onclick = () => {
      handler.current.onAuflegen()
      fenster.close()
    }

    fenster.addEventListener("pagehide", () => {
      // Spur lösen, sonst hängt sie an einem Element in einem toten Dokument.
      if (videoRef.current) {
        try {
          spur?.detach(videoRef.current)
        } catch {
          /* Das Fenster ist schon weg. */
        }
      }
      fensterRef.current = null
      videoRef.current = null
      mikroKnopfRef.current = null
      setOffen(false)
    })
  }, [gegenueber, mikroAn, spur])

  // Spur anhängen — auch, wenn sie erst nach dem Öffnen eintrifft oder
  // wechselt (Kamera aus und wieder an).
  useEffect(() => {
    const video = videoRef.current
    if (!video || !spur) return
    spur.attach(video)
    return () => {
      try {
        spur.detach(video)
      } catch {
        /* Fenster bereits geschlossen. */
      }
    }
  }, [spur, offen])

  // Beschriftung nachziehen, wenn das Mikrofon von der Seite aus umgeschaltet
  // wurde. Zwei Knöpfe, die dasselbe schalten, müssen dasselbe sagen.
  useEffect(() => {
    if (mikroKnopfRef.current) {
      mikroKnopfRef.current.textContent = mikroAn ? "Stumm schalten" : "Stumm aus"
    }
  }, [mikroAn])

  // Wer die Seite verlässt, lässt kein schwebendes Fenster zurück.
  useEffect(() => {
    return () => {
      fensterRef.current?.close()
    }
  }, [])

  return { verfuegbar: api() !== null, offen, oeffnen, schliessen }
}
