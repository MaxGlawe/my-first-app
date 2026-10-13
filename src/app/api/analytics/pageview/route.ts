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
  utm_content: z.string().max(200).nullable().optional(),
  utm_term: z.string().max(200).nullable().optional(),
  // Pfad + Query-String, wie er in der Adresszeile stand. Siehe Migration
  // 20261013000001: Ohne ihn laesst sich nicht unterscheiden, ob eine
  // Anzeige keine Parameter gesetzt hat oder ob sie unterwegs verloren
  // gingen.
  landing_url: z.string().max(2000).nullable().optional(),
  device_type: z.enum(["mobile", "tablet", "desktop"]),
  browser: z.string().max(100),
  session_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (isRateLimited(`pv:${ip}`, 80, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 })
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()

  const datensatz = {
      path: body.path,
      referrer: body.referrer ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_content: body.utm_content ?? null,
      utm_term: body.utm_term ?? null,
      landing_url: body.landing_url ?? null,
      device_type: body.device_type,
      browser: body.browser,
      session_id: body.session_id,
  }

  let { data, error } = await supabase.from("page_views").insert(datensatz).select("id").single()

  // Fehlt eine frisch hinzugekommene Spalte, wird sie weggelassen und der
  // Datensatz trotzdem geschrieben.
  //
  // Grund: Code und Migration gehen getrennt live. Zwischen beiden liegen
  // Minuten, in denen jeder Seitenaufruf an einer Spalte scheitern wuerde,
  // die es noch nicht gibt — und ohne Seitenaufruf verschwindet die ganze
  // Sitzung aus der Auswertung, samt ihrer Ereignisse. Ein fehlendes Feld
  // ist ein Schoenheitsfehler, eine fehlende Sitzung eine falsche Zahl.
  if (error?.code === "PGRST204") {
    console.warn("[POST /api/analytics/pageview] Spalte fehlt, zweiter Versuch ohne:", error.message)
    const { landing_url: _weggelassen, ...ohneNeue } = datensatz
    void _weggelassen
    ;({ data, error } = await supabase.from("page_views").insert(ohneNeue).select("id").single())
  }

  if (error) {
    console.error("[POST /api/analytics/pageview]", error)
    return NextResponse.json({ error: "Tracking fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null })
}
