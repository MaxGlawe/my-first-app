/**
 * PATCH /api/admin/client-errors/[id]
 * Mark a single error as resolved (or unresolved).
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const bodySchema = z.object({
  resolved: z.boolean(),
})

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins haben Zugriff." }, { status: 403 })
  }

  let parsed: z.infer<typeof bodySchema>
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const { error } = await serviceClient
    .from("client_errors")
    .update({ resolved_at: parsed.resolved ? new Date().toISOString() : null })
    .eq("id", id)

  if (error) {
    console.error("[PATCH /api/admin/client-errors]", error)
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
