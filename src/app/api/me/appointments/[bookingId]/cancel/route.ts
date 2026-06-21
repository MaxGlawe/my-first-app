/**
 * PROJ-34 / Phase 3: POST /api/me/appointments/[bookingId]/cancel
 * Storniert den Termin des eingeloggten Patienten. Bestätigungsmail → Buchungstool.
 */
import { NextRequest, NextResponse } from "next/server"
import { resolveCurrentPatient } from "@/lib/patient-session"
import { cancelAppointment } from "@/lib/booking-coordination"

export async function POST(_req: NextRequest, ctx: { params: Promise<{ bookingId: string }> }) {
  const me = await resolveCurrentPatient()
  if (!me) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  if (!me.coordPatientId) return NextResponse.json({ error: "Kein verknüpfter Termin." }, { status: 404 })

  const { bookingId } = await ctx.params
  const res = await cancelAppointment(bookingId, me.coordPatientId)
  if (!res.ok) {
    const status = res.status >= 400 ? res.status : 502
    return NextResponse.json({ error: "Stornierung fehlgeschlagen.", code: res.error }, { status })
  }
  return NextResponse.json(res.data)
}
