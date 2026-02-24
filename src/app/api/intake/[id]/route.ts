/**
 * GET /api/intake/[id] — Get single intake request (staff only)
 * PATCH /api/intake/[id] — Update status, notes, assignment (staff only)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const updateSchema = z.object({
  status: z
    .enum(["neu", "kontaktiert", "termin_gebucht", "patient_erstellt", "abgelehnt"])
    .optional(),
  interne_notizen: z.string().max(5000).optional(),
  zugewiesen_an: z.string().uuid().nullable().optional(),
})

async function checkStaffAuth() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const staffRoles = ["admin", "heilpraktiker", "physiotherapeut"]
  if (!profile || !staffRoles.includes(profile.role)) return null

  return { user, supabase }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkStaffAuth()
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { id } = await params

  const { data, error } = await auth.supabase
    .from("intake_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 })
  }

  return NextResponse.json({ request: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkStaffAuth()
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const { id } = await params

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await request.json())
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Ungültige Eingabe."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {}
  if (body.status !== undefined) updates.status = body.status
  if (body.interne_notizen !== undefined) updates.interne_notizen = body.interne_notizen
  if (body.zugewiesen_an !== undefined) updates.zugewiesen_an = body.zugewiesen_an

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from("intake_requests")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("[PATCH /api/intake/[id]]", error)
    return NextResponse.json({ error: "Aktualisierung fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ request: data })
}
