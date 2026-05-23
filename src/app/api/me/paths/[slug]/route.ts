/**
 * GET /api/me/paths/[slug]
 *
 * Returns full path data: metadata + all 21 lessons + current enrollment state +
 * which days the patient has already completed.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { hasContentAccess } from "@/lib/content-access"

interface PatientRef {
  id: string
  name: string
}

async function getPatient(): Promise<PatientRef | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const sc = createSupabaseServiceClient()
  const toRef = (row: { id: string; vorname: string | null; nachname: string | null }): PatientRef => ({
    id: row.id,
    name: [row.vorname, row.nachname].filter(Boolean).join(" ").trim(),
  })

  const { data: byUser } = await sc
    .from("patients").select("id, vorname, nachname").eq("user_id", user.id).maybeSingle()
  if (byUser) return toRef(byUser)

  if (user.email) {
    const { data: byEmail } = await sc
      .from("patients").select("id, vorname, nachname").eq("email", user.email).maybeSingle()
    if (byEmail) return toRef(byEmail)
  }
  return null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // ── Auth: require login ──────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const patient = await getPatient()
  const sc = createSupabaseServiceClient()

  const { data: path } = await sc
    .from("learning_paths")
    .select("id, slug, name, subtitle, description, icon, color, duration_days, target_audience, intro_content, hero_image")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!path) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 })
  }

  // ── Access check: purchase entitlement OR active abo ─────────
  const access = await hasContentAccess(user.id, "learning_path", path.id)

  if (!access) {
    // Find the product slug for the "Kaufen"-Button
    const { data: productContent } = await sc
      .from("product_contents")
      .select("products!inner(slug)")
      .eq("content_type", "learning_path")
      .eq("content_id", path.id)
      .maybeSingle()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productSlug = (productContent?.products as any)?.slug ?? null

    return NextResponse.json(
      {
        path: {
          id: path.id,
          slug: path.slug,
          name: path.name,
          subtitle: path.subtitle,
          icon: path.icon,
          color: path.color,
          duration_days: path.duration_days,
          hero_image: path.hero_image,
        },
        gesperrt: true,
        product_slug: productSlug,
        enrollment: null,
        lessons: [],
      },
      { status: 200 }
    )
  }

  // ── Kurs-Konsumierung erfordert ein Patienten-Konto ──────────
  // Externe Käufer können Kurse kaufen (PROJ-20), aber das Konsumieren —
  // Module, Fortschritt, Quiz, Zertifikat — hängt an der patienten-basierten
  // Kurs-Engine (patient_path_enrollments / _progress). Externe-Käufer-
  // Konsumierung ist bewusst ein eigenes, noch zu spezifizierendes Feature
  // (Entscheidung "Option B", 2026-05-14). Externe Käufer erreichen diese
  // Route ohnehin nicht — die Middleware sperrt sie auf /shop/*.
  if (!patient) {
    return NextResponse.json(
      { error: "Diese Challenge erfordert aktuell ein Patienten-Konto." },
      { status: 403 }
    )
  }

  const patientId = patient.id

  // All lessons for the path (ordered by day), with their quiz questions
  const { data: lessonRows } = await sc
    .from("path_lessons")
    .select(
      "day_number, title, content, task, reflection_question, path_lesson_quizzes(id, question, options, correct_index, explanation, sort_order)"
    )
    .eq("path_id", path.id)
    .order("day_number", { ascending: true })

  const lessons = (lessonRows ?? []).map((l) => ({
    day_number: l.day_number,
    title: l.title,
    content: l.content,
    task: l.task,
    reflection_question: l.reflection_question,
    quizzes: ((l.path_lesson_quizzes ?? []) as Array<{
      id: string
      question: string
      options: string[]
      correct_index: number
      explanation: string | null
      sort_order: number
    }>)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
      })),
  }))

  // Most recent enrollment of the patient for this path
  const { data: enrollments } = await sc
    .from("patient_path_enrollments")
    .select("id, status, enrolled_at, completed_at, abandoned_at")
    .eq("patient_id", patientId)
    .eq("path_id", path.id)
    .order("enrolled_at", { ascending: false })

  const active = enrollments?.find((e) => e.status === "active") ?? null
  const completed = enrollments?.find((e) => e.status === "completed") ?? null
  const current = active ?? completed

  let progress: Array<{ day_number: number; completed_at: string; reflection_answer: string | null }> = []
  if (current) {
    const { data: progressRows } = await sc
      .from("patient_path_progress")
      .select("day_number, completed_at, reflection_answer")
      .eq("enrollment_id", current.id)
      .order("day_number", { ascending: true })
    progress = progressRows ?? []
  }

  const completedDays = progress.map((p) => p.day_number)
  const currentDay = current ? Math.min(completedDays.length + 1, path.duration_days) : 1

  // Compute next-available timestamp: midnight of the day AFTER the last
  // completed day, in Europe/Berlin. If no day completed yet, available now.
  let nextAvailableAt: string | null = null
  if (progress.length > 0) {
    const lastCompletedAt = new Date(progress[progress.length - 1].completed_at)
    const berlinDateStr = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Berlin",
    }).format(lastCompletedAt) // "YYYY-MM-DD"
    // Tomorrow midnight (Berlin) — we approximate by adding a day to the Berlin
    // date and treating it as the user's local boundary. Good enough for UX.
    const [y, m, d] = berlinDateStr.split("-").map(Number)
    const tomorrow = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0))
    // The constructed Date is UTC midnight of the NEXT Berlin-day — close enough
    // to display "available DD.MM."; the API authority still enforces precisely.
    nextAvailableAt = tomorrow.toISOString()
  }

  return NextResponse.json({
    path,
    patient_name: patient.name,
    lessons,
    enrollment: current
      ? {
          id: current.id,
          status: current.status,
          enrolled_at: current.enrolled_at,
          completed_at: current.completed_at,
          current_day: currentDay,
          completed_days: completedDays,
          progress,
          next_available_at: nextAvailableAt,
        }
      : null,
  })
}
