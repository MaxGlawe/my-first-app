import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"

const schema = z.object({
  session_id: z.string().uuid(),
  event_type: z.string().min(1).max(100),
  path: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (isRateLimited(`cv:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 })
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()

  const { error } = await supabase.from("conversion_events").insert({
    session_id: body.session_id,
    event_type: body.event_type,
    path: body.path,
    metadata: body.metadata,
  })

  if (error) {
    console.error("[POST /api/analytics/conversion]", error)
    return NextResponse.json({ error: "Tracking fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
