/**
 * PROJ-34 / Phase 3: GET /api/me/appointments/[bookingId]/reschedule-slots?month=YYYY-MM[&therapistId=]
 * Freie Umbuchungs-Slots. Patient wird aus der Session aufgelöst; die
 * Eigentumsprüfung (bookingId ↔ patientId) macht zusätzlich die Koordinations-API (403).
 */
import { NextRequest, NextResponse } from "next/server"
import { resolveCurrentPatient } from "@/lib/patient-session"
import { getRescheduleSlots } from "@/lib/booking-coordination"

export async function GET(req: NextRequest, ctx: { params: Promise<{ bookingId: string }> }) {
  const me = await resolveCurrentPatient()
  if (!me) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  if (!me.coordPatientId) return NextResponse.json({ error: "Kein verknüpfter Termin." }, { status: 404 })

  const { bookingId } = await ctx.params
  const month = req.nextUrl.searchParams.get("month") ?? ""
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Ungültiger Monat (erwartet YYYY-MM)." }, { status: 422 })
  }
  const therapistId = req.nextUrl.searchParams.get("therapistId") || undefined

  const res = await getRescheduleSlots(bookingId, me.coordPatientId, month, therapistId)
  if (!res.ok) {
    const status = res.error === "not_owner" ? 403 : res.status >= 400 ? res.status : 502
    return NextResponse.json({ error: "Slots konnten nicht geladen werden.", code: res.error }, { status })
  }
  return NextResponse.json(res.data)
}
