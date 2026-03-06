/**
 * POST /api/os/push-reminder
 * PROJ-17: Therapist-initiated push reminder to a patient.
 *
 * Unlike /api/push/send (which requires CRON_SECRET and is server-to-server),
 * this endpoint is authenticated via Supabase session (therapist must be logged in)
 * and verifies the therapist has access to the patient via RLS.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { sendPushToPatient } from "@/lib/push"

const BodySchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().min(1).max(100).optional().default("Erinnerung von deinem Therapeuten"),
  body: z.string().min(1).max(300).optional().default("Dein Therapeut moechte dich an dein Training erinnern."),
  url: z.string().optional().default("/app/dashboard"),
})

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  // Validate input
  const rawBody = await req.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungueltige Eingabe.", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { patientId, title, body, url } = parsed.data

  // Verify therapist has access to this patient (RLS check)
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, vorname, nachname")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // Send push
  try {
    const result = await sendPushToPatient(patientId, {
      title,
      body,
      url,
      tag: "therapeut-erinnerung",
    })

    if (result.sent === 0) {
      return NextResponse.json({
        ok: false,
        reason: "no_subscription",
        message: "Patient hat keine aktive Push-Subscription. Die App muss auf dem Geraet installiert und Push aktiviert sein.",
      })
    }

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (err) {
    console.error("[push-reminder] Error:", err)
    return NextResponse.json({ error: "Push konnte nicht gesendet werden." }, { status: 500 })
  }
}
