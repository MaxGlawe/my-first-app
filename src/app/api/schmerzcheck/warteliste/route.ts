/**
 * GET /api/schmerzcheck/warteliste?r=<region>&e=N1|OB1|K1&u=<token>
 *
 * Ein-Klick-Warteliste für die 79 geparkten Leads (PROJ-25c).
 *
 * Nacken (51), oberer Rücken (22), Knie/Hüfte/Fuß (6): Menschen, die den Check
 * komplett gemacht haben, einen Report bekamen und ein echtes chronisches
 * Problem haben — für die es aber kein Produkt gibt. Die Masterclass ist ein
 * LWS-Kurs.
 *
 * Sie bekommen eine Wert-Mail (drei fachliche Punkte, kein Verkauf) und können
 * sich hier vormerken lassen. Das ist KEIN Kauf und KEINE Vorkasse — nur ein
 * Signal.
 *
 * Und es ist zugleich die Vorab-Validierung für die Produktentscheidung: Wenn
 * von 73 Nacken- und BWS-Leads nur drei klicken, lohnt sich die Produktion
 * eines Moduls nicht. Klicken 30, ist die Sache klar. Besser, das VOR der
 * Vertonung von 27 Lektionen zu wissen als danach.
 *
 * Sicherheit: Die Lead-ID kommt ausschließlich aus dem signierten Token.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"

const REGIONEN = new Set(["nacken_schulter", "oberer_ruecken", "knie_huefte_fuss"])

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const region = (url.searchParams.get("r") || "").toLowerCase()
  const emailCode = (url.searchParams.get("e") || "N1").toUpperCase()
  const token = url.searchParams.get("u")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin

  if (!REGIONEN.has(region)) {
    return NextResponse.redirect(new URL("/schmerzcheck", baseUrl), 302)
  }

  const leadId = verifyLeadToken(token)
  if (!leadId) {
    return NextResponse.redirect(new URL("/schmerzcheck/warteliste?s=expired", baseUrl), 302)
  }

  const supabase = createSupabaseServiceClient()

  try {
    // Letzter Klick gewinnt — jemand darf sich umentscheiden.
    await supabase
      .from("schmerzcheck_leads")
      .update({
        waitlist_region: region,
        waitlist_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    await supabase.from("schmerzcheck_email_events").insert({
      lead_id: leadId,
      email_code: ["N1", "OB1", "K1"].includes(emailCode) ? emailCode : "N1",
      event_type: "clicked",
      metadata: { target: "warteliste", region },
    })
  } catch (err) {
    console.error("[GET /api/schmerzcheck/warteliste] fehlgeschlagen:", err)
    // Nicht blockieren — der Nutzer bekommt trotzdem seine Bestätigung.
  }

  return NextResponse.redirect(new URL(`/schmerzcheck/warteliste?s=${region}`, baseUrl), 302)
}
