/**
 * POST /api/shop/track — leichtgewichtiges Frontend-Tracking für die Salespage.
 *
 * Schreibt in die bestehende `conversion_events`-Tabelle (dieselbe, die schon
 * shop_purchase und schmerzcheck_pdf_download nutzt) — kein neues Schema.
 *
 * Öffentlich und ohne Auth: Die Salespage ist eine öffentliche Seite, und Gäste
 * sollen genauso gezählt werden wie eingeloggte Nutzer. Deshalb strikt begrenzt:
 * feste Whitelist erlaubter Event-Typen, Rate-Limit pro IP, Metadaten gedeckelt.
 * Es landen keine personenbezogenen Daten hier — nur Slug, Scroll-Tiefe, UTM.
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { isRateLimited } from "@/lib/rate-limit"

const ALLOWED_EVENTS = new Set(["salespage_buy_click", "salespage_scroll"])

const schema = z.object({
  eventType: z.string().max(60),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  // Großzügig genug für 4 Scroll-Schwellen + Klicks, eng genug gegen Flooding.
  if (isRateLimited(`shop:track:${ip}`, 40, 60_000)) {
    return NextResponse.json({ ok: true, throttled: true })
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  if (!ALLOWED_EVENTS.has(body.eventType)) {
    return NextResponse.json({ error: "Unbekannter Event-Typ." }, { status: 400 })
  }

  // Metadaten hart begrenzen — hier soll nichts Personenbezogenes reinrutschen.
  const metadata: Record<string, string> = {}
  for (const [k, v] of Object.entries(body.metadata).slice(0, 10)) {
    if (typeof v === "string" || typeof v === "number") {
      metadata[k.slice(0, 40)] = String(v).slice(0, 120)
    }
  }

  try {
    const supabase = createSupabaseServiceClient()
    await supabase.from("conversion_events").insert({
      session_id: `sp_${ip}`,
      event_type: body.eventType,
      path: "/kurse",
      metadata,
    })
  } catch (err) {
    console.error("[POST /api/shop/track] Insert fehlgeschlagen:", err)
    // Nie 500: ein Tracking-Fehler darf den Nutzer nicht stören.
  }

  return NextResponse.json({ ok: true })
}
