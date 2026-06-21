/**
 * PROJ-34 / Phase 2: GET /api/me/appointments/live?scope=upcoming|past|all
 * Live-Termine des eingeloggten Patienten direkt aus der Koordinations-API
 * (Source of Truth). Fällt nicht auf die synchronisierte Kopie zurück —
 * der Aufrufer (Termin-Seite) zeigt bei Fehler einen Hinweis.
 */
import { NextRequest, NextResponse } from "next/server"
import { resolveCurrentPatient } from "@/lib/patient-session"
import { listAppointments, type AppointmentScope } from "@/lib/booking-coordination"

const SCOPES: AppointmentScope[] = ["upcoming", "past", "all"]

export async function GET(req: NextRequest) {
  const me = await resolveCurrentPatient()
  if (!me) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  if (!me.coordPatientId) return NextResponse.json({ linked: false, appointments: [] })

  const raw = req.nextUrl.searchParams.get("scope")
  const scope: AppointmentScope = SCOPES.includes(raw as AppointmentScope) ? (raw as AppointmentScope) : "all"

  const res = await listAppointments(me.coordPatientId, scope)
  if (!res.ok) {
    const status = res.error === "not_configured" ? 503 : 502
    return NextResponse.json({ error: "Termine konnten nicht geladen werden.", code: res.error }, { status })
  }
  return NextResponse.json({ linked: true, appointments: res.data.appointments ?? [] })
}
