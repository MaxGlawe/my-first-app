"use client"

/**
 * PROJ-27 — Sprechzimmer ueber den Gast-Link.
 *
 * OEFFENTLICH, ohne Anmeldung. Diese Seite ist der Weg, auf dem der Patient
 * bei der Videokonsultation hineinkommt — zu diesem Zeitpunkt hat er noch
 * gar kein Praxis-OS-Konto, er bekommt es erst beim Kauf danach.
 *
 * Der erste Entwurf verlangte eine Anmeldung und haette damit ausgerechnet
 * das wichtigste Gespraech unmoeglich gemacht. Aufgefallen ist das im
 * Praxistest am 23.09.2026.
 */

import { useParams } from "next/navigation"
import { Sprechzimmer } from "@/components/video/Sprechzimmer"

export default function GastSprechzimmerPage() {
  const params = useParams<{ token: string }>()
  const token = params?.token

  if (!token) return null

  return (
    <div style={{ backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <Sprechzimmer
        gastToken={token}
        anlassText="Videogespräch"
        gegenueber="dein Behandler"
        zurueckHref="/"
      />
    </div>
  )
}
