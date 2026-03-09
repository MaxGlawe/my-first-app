import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const bodySchema = z.object({
  event_type: z.string().min(1).max(100),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const { error } = await supabase.from("usage_events").insert({
    user_id: user.id,
    event_type: body.event_type,
    metadata: body.metadata,
  })

  if (error) {
    console.error("[POST /api/analytics/track]", error)
    return NextResponse.json({ error: "Tracking fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
