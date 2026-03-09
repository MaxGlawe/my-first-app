import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"

const schema = z.object({
  pageview_id: z.string().uuid(),
  duration_seconds: z.number().int().min(0).max(86400),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (isRateLimited(`dur:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 })
  }

  let body: z.infer<typeof schema>
  try {
    // sendBeacon may send as text/plain, so handle both
    const text = await request.text()
    body = schema.parse(JSON.parse(text))
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()

  const { error } = await supabase
    .from("page_views")
    .update({ duration_seconds: body.duration_seconds })
    .eq("id", body.pageview_id)

  if (error) {
    console.error("[POST /api/analytics/duration]", error)
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
