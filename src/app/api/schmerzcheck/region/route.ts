/**
 * GET /api/schmerzcheck/region?r=<region>&e=RT1|RT2&u=<token>
 *
 * Ein-Klick-Routing aus der RT1/RT2-Mail (PROJ-25b).
 *
 * Die 77 Leads mit „Mehrere Bereiche gleichzeitig" haben im Check ihre eigene
 * Detailangabe überschrieben — wir wissen nicht, ob der untere Rücken betroffen
 * ist. Die Masterclass ist aber ein LWS-Kurs. Ein Klick hier klärt das.
 *
 * Sicherheit: Die Lead-ID kommt AUSSCHLIESSLICH aus dem signierten Token, nie
 * aus einem Query-Parameter. Damit kann niemand die Region eines fremden Leads
 * setzen — die Spec verlangt genau diesen Test (Abschnitt 9).
 *
 * Mehrfachklick: Der letzte Klick gewinnt (Leute korrigieren sich). Die
 * M-Sequenz startet trotzdem nur einmal — dafür sorgt das Claim-Register.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"

const REGIONS = new Set([
  "unterer_ruecken",
  "nacken_schulter",
  "oberer_ruecken",
  "knie_huefte_fuss",
  "wechselt_staendig",
])

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const region = (url.searchParams.get("r") || "").toLowerCase()
  const emailCode = (url.searchParams.get("e") || "RT1").toUpperCase()
  const token = url.searchParams.get("u")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin

  if (!REGIONS.has(region)) {
    return NextResponse.redirect(new URL("/schmerzcheck", baseUrl), 302)
  }

  // Lead-ID NUR aus dem signierten Token — niemals aus der URL.
  const leadId = verifyLeadToken(token)
  if (!leadId) {
    return NextResponse.redirect(new URL("/schmerzcheck/region?s=expired", baseUrl), 302)
  }

  const supabase = createSupabaseServiceClient()

  try {
    await supabase
      .from("schmerzcheck_leads")
      .update({
        main_region: region,
        main_region_set_at: new Date().toISOString(),
        main_region_source: "rt1_click",
      })
      .eq("id", leadId)

    // Klick als Event protokollieren → Auswertung der Regionsverteilung.
    await supabase.from("schmerzcheck_email_events").insert({
      lead_id: leadId,
      email_code: ["RT1", "RT2"].includes(emailCode) ? emailCode : "RT1",
      event_type: "clicked",
      metadata: { target: "region", region },
    })
  } catch (err) {
    console.error("[GET /api/schmerzcheck/region] fehlgeschlagen:", err)
    // Nicht blockieren — der Nutzer bekommt trotzdem seine Bestätigung.
  }

  return NextResponse.redirect(new URL(`/schmerzcheck/region?s=${region}`, baseUrl), 302)
}
