/**
 * PROJ-34 / Phase 3: POST /api/me/appointments/[bookingId]/reschedule
 * Body: { date:"YYYY-MM-DD", startTime:"HH:MM", endTime:"HH:MM", therapistId?:string }
 * Bestätigungsmail verschickt das Buchungstool (nicht wir).
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { resolveCurrentPatient } from "@/lib/patient-session"
import { reschedule } from "@/lib/booking-coordination"

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  therapistId: z.string().min(1).max(100).optional(),
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ bookingId: string }> }) {
  const me = await resolveCurrentPatient()
  if (!me) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  if (!me.coordPatientId) return NextResponse.json({ error: "Kein verknüpfter Termin." }, { status: 404 })

  const { bookingId } = await ctx.params
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 }) }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler.", details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const res = await reschedule(bookingId, me.coordPatientId, parsed.data)
  if (!res.ok) {
    // Fehlercodes des Buchungstools an den Client durchreichen (slot_conflict/holiday/…)
    const status = res.status >= 400 ? res.status : 502
    return NextResponse.json({ error: "Umbuchung fehlgeschlagen.", code: res.error }, { status })
  }
  return NextResponse.json(res.data)
}
