/**
 * GET /api/schmerzcheck/abklaerung?a=cleared|not_yet&e=B1|B2&u=<token>
 *
 * Der „Türsteher" vor Segment B (Red-Flag-Leads).
 *
 * Diese 117 Menschen wurden im Schmerzcheck gestoppt, weil sie Warnzeichen
 * angegeben haben. Sie bekommen KEIN Kaufangebot — die Masterclass enthält
 * Bewegungskarten und ein Übungsprogramm, und das jemandem mit ungeklärten
 * Warnzeichen zu bewerben, ist genau das, was der Red-Flag-Stopp verhindern soll.
 *
 * Stattdessen fragen die Brücken-Mails B1/B2 nur eines: Warst du beim Arzt?
 *   a=cleared → medical_cleared_at wird gesetzt → Lead wandert in Segment A und
 *               darf ab dann die M-Sequenz (mit Angebot) bekommen.
 *   a=not_yet → wird protokolliert, es folgt KEIN Angebot. Der Lead bekommt nur
 *               noch B2 (falls fällig) und danach nichts mehr.
 *
 * Der Klick ist damit die Bedingung fürs Bewerben, nicht unsere Interpretation —
 * und er ist nachweisbar dokumentiert.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const answer = (url.searchParams.get("a") || "").toLowerCase()
  const emailCode = (url.searchParams.get("e") || "B1").toUpperCase()
  const token = url.searchParams.get("u")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin

  if (answer !== "cleared" && answer !== "not_yet") {
    return NextResponse.redirect(new URL("/schmerzcheck", baseUrl), 302)
  }

  const leadId = verifyLeadToken(token)
  if (!leadId) {
    // Abgelaufener/ungültiger Link — Nutzer nicht ins Leere laufen lassen.
    return NextResponse.redirect(new URL("/schmerzcheck/abklaerung?s=expired", baseUrl), 302)
  }

  const supabase = createSupabaseServiceClient()

  try {
    // Antwort immer protokollieren (auch "noch nicht") — so sehen wir, wer
    // reagiert hat, ohne ihn zu bepitchen.
    await supabase.from("schmerzcheck_email_events").insert({
      lead_id: leadId,
      email_code: ["B1", "B2"].includes(emailCode) ? emailCode : "B1",
      event_type: "clicked",
      metadata: { target: "abklaerung", answer },
    })

    if (answer === "cleared") {
      // Nur setzen, wenn noch nicht gesetzt — der erste Klick zählt.
      await supabase
        .from("schmerzcheck_leads")
        .update({
          medical_cleared_at: new Date().toISOString(),
          medical_cleared_source: emailCode,
        })
        .eq("id", leadId)
        .is("medical_cleared_at", null)
    }
  } catch (err) {
    console.error("[GET /api/schmerzcheck/abklaerung] fehlgeschlagen:", err)
    // Nicht blockieren: der Nutzer bekommt trotzdem seine Bestätigungsseite.
  }

  return NextResponse.redirect(new URL(`/schmerzcheck/abklaerung?s=${answer}`, baseUrl), 302)
}
