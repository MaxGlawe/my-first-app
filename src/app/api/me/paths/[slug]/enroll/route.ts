/**
 * POST   /api/me/paths/[slug]/enroll  — Patient meldet sich für den Pfad an
 * DELETE /api/me/paths/[slug]/enroll  — Patient bricht den Pfad ab (status = abandoned)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

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
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const patientId = await getPatientId()
  if (!patientId) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  const sc = createSupabaseServiceClient()

  const { data: path } = await sc
    .from("learning_paths")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!path) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 })
  }

  // Already actively enrolled? Return existing instead of erroring out.
  const { data: active } = await sc
    .from("patient_path_enrollments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("path_id", path.id)
    .eq("status", "active")
    .maybeSingle()
  if (active) {
    return NextResponse.json({ enrollment_id: active.id, status: "active" })
  }

  const { data: inserted, error } = await sc
    .from("patient_path_enrollments")
    .insert({ patient_id: patientId, path_id: path.id, status: "active" })
    .select("id")
    .single()

  if (error) {
    console.error("[POST enroll]", error)
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ enrollment_id: inserted.id, status: "active" })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const patientId = await getPatientId()
  if (!patientId) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  const sc = createSupabaseServiceClient()

  const { data: path } = await sc
    .from("learning_paths")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (!path) {
    return NextResponse.json({ error: "Challenge nicht gefunden." }, { status: 404 })
  }

  const { error } = await sc
    .from("patient_path_enrollments")
    .update({ status: "abandoned", abandoned_at: new Date().toISOString() })
    .eq("patient_id", patientId)
    .eq("path_id", path.id)
    .eq("status", "active")

  if (error) {
    console.error("[DELETE enroll]", error)
    return NextResponse.json({ error: "Abbruch fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
