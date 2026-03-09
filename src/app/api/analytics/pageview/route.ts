import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"

const schema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(2000).nullable().optional(),
  utm_source: z.string().max(200).nullable().optional(),
  utm_medium: z.string().max(200).nullable().optional(),
  utm_campaign: z.string().max(200).nullable().optional(),
  device_type: z.enum(["mobile", "tablet", "desktop"]),
  browser: z.string().max(100),
  session_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (isRateLimited(`pv:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 })
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from("page_views")
    .insert({
      path: body.path,
      referrer: body.referrer ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      device_type: body.device_type,
      browser: body.browser,
      session_id: body.session_id,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[POST /api/analytics/pageview]", error)
    return NextResponse.json({ error: "Tracking fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
