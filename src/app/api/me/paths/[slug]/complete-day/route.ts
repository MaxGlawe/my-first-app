/**
 * POST /api/me/paths/[slug]/complete-day
 *
 * Body: { day_number: number, reflection_answer?: string }
 *
 * Marks today's lesson as completed. If this was the last day, the
 * enrollment status flips to "completed".
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const schema = z.object({
  day_number: z.number().int().min(1).max(365),
  reflection_answer: z.string().max(4000).optional().nullable(),
  quiz_score: z.number().int().min(0).max(50).optional().nullable(),
  quiz_total: z.number().int().min(0).max(50).optional().nullable(),
})

async function getPatientId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const sc = createSupabaseServiceClient()
  const { data: byUser } = await sc
    .from("patients").select("id").eq("user_id", user.id).maybeSingle()
  if (byUser) return byUser.id

  if (user.email) {
    const { data: byEmail } = await sc
      .from("patients").select("id").eq("email", user.email).maybeSingle()
    if (byEmail) return byEmail.id
  }
  return null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const patientId = await getPatientId()
  if (!patientId) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const sc = createSupabaseServiceClient()

  // Find path + active enrollment
  const { data: path } = await sc
    .from("learning_paths")
    .select("id, duration_days")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
  if (!path) {
    return NextResponse.json({ error: "Kurs nicht gefunden." }, { status: 404 })
  }

  if (body.day_number < 1 || body.day_number > path.duration_days) {
    return NextResponse.json(
      { error: `Modul ${body.day_number} ist außerhalb des Kurs-Bereichs.` },
      { status: 400 }
    )
  }

  const { data: enrollment } = await sc
    .from("patient_path_enrollments")
    .select("id, status")
    .eq("patient_id", patientId)
    .eq("path_id", path.id)
    .eq("status", "active")
    .maybeSingle()

  if (!enrollment) {
    return NextResponse.json(
      { error: "Du bist nicht für diesen Kurs angemeldet." },
      { status: 400 }
    )
  }

  // Rate-limit: only one new day per Berlin calendar day. Otherwise patients
  // could click through 21 days in 21 minutes and lose the daily-impulse effect.
  // Re-submitting the SAME day (idempotent) is still allowed (e.g. to add a
  // reflection after the fact).
  const todayBerlin = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
  }).format(new Date())

  const { data: existingToday } = await sc
    .from("patient_path_progress")
    .select("day_number, completed_at")
    .eq("enrollment_id", enrollment.id)
    .order("completed_at", { ascending: false })
    .limit(1)

  if (existingToday && existingToday.length > 0) {
    const lastBerlinDate = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Berlin",
    }).format(new Date(existingToday[0].completed_at))

    const isSameDayRecord = existingToday[0].day_number === body.day_number
    if (lastBerlinDate === todayBerlin && !isSameDayRecord) {
      return NextResponse.json(
        {
          error: "Du hast heute bereits einen Tag abgeschlossen. Komm morgen wieder — der nächste Impuls wartet.",
          code: "ALREADY_COMPLETED_TODAY",
        },
        { status: 429 }
      )
    }
  }

  // Upsert today's progress (idempotent — re-submitting the same day is fine)
  const { error: progressErr } = await sc
    .from("patient_path_progress")
    .upsert(
      {
        enrollment_id: enrollment.id,
        day_number: body.day_number,
        completed_at: new Date().toISOString(),
        reflection_answer: body.reflection_answer ?? null,
        quiz_score: body.quiz_score ?? null,
        quiz_total: body.quiz_total ?? null,
      },
      { onConflict: "enrollment_id,day_number" }
    )

  if (progressErr) {
    console.error("[complete-day] progress upsert failed:", progressErr)
    return NextResponse.json({ error: "Fortschritt speichern fehlgeschlagen." }, { status: 500 })
  }

  // If all days are now complete → flip enrollment to "completed"
  let pathCompleted = false
  if (body.day_number >= path.duration_days) {
    const { count } = await sc
      .from("patient_path_progress")
      .select("id", { count: "exact", head: true })
      .eq("enrollment_id", enrollment.id)

    if ((count ?? 0) >= path.duration_days) {
      await sc
        .from("patient_path_enrollments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", enrollment.id)
      pathCompleted = true
    }
  }

  return NextResponse.json({ ok: true, path_completed: pathCompleted })
}
