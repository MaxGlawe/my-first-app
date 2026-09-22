"use client"

/**
 * PROJ-26: Zugangszustand für die Oberfläche.
 *
 * Der Wert ändert sich innerhalb einer Sitzung praktisch nie (er kippt nur durch
 * eine Zahlung, und die kommt als Vollreload aus dem Stripe-Redirect zurück).
 * Deshalb wird die Abfrage modulweit geteilt — sonst würde jeder Consumer
 * (Banner, Check-in-Gate) einen eigenen Request auslösen.
 */

import { useEffect, useState } from "react"

export interface AccessInfo {
  state: "programm_aktiv" | "erhaltung_aktiv" | "programm_beendet" | "gesperrt" | "bestandspatient"
  canEnter: boolean
  canWrite: boolean
  endsAt: string | null
}

let inflight: Promise<AccessInfo | null> | null = null

function loadAccess(): Promise<AccessInfo | null> {
  if (!inflight) {
    inflight = fetch("/api/me/access")
      .then((res) => (res.ok ? (res.json() as Promise<AccessInfo>) : null))
      .catch(() => null)
  }
  return inflight
}

/** Nach einer Zustandsänderung (z. B. Erhaltungsphase gestartet) verwerfen. */
export function resetAccessCache(): void {
  inflight = null
}

export function useAccessState() {
  const [access, setAccess] = useState<AccessInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true
    loadAccess().then((data) => {
      if (!alive) return
      setAccess(data)
      setIsLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  return {
    access,
    isLoading,
    /** Betreuung gelaufen: Verlauf sichtbar, nichts Neues. */
    readOnly: access?.state === "programm_beendet",
  }
}
