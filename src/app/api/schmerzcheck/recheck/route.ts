/**
 * GET /api/schmerzcheck/recheck?e=RF1&u=<token>
 *
 * Wiedereinstieg in den Check für die 45 zu Unrecht Gestoppten (PROJ-25c).
 *
 * Diese Menschen wurden im Juni aus dem Check geworfen, weil sie „Beschwerden,
 * die dich nachts aufwecken" angekreuzt hatten — und NUR deswegen. Nach der
 * entschärften Regel (07/2026) wäre keiner von ihnen gestoppt worden.
 *
 * Diese Route löst das Stopp-Flag und schickt sie zurück in den Check. Ihre
 * alten Antworten bleiben erhalten — sie machen dort weiter, wo sie aufhörten.
 *
 * SICHERHEIT — der wichtigste Teil:
 * Es wird serverseitig NOCHMAL geprüft, ob dieser Lead wirklich nur wegen des
 * Nacht-Kriteriums gestoppt wurde. Jemand mit echter Sattel-Taubheit oder
 * Blasenkontrollverlust darf hier NICHT durch, selbst wenn er den Link
 * irgendwie in die Hände bekäme. Fail closed.
 *
 * Der Check selbst screent danach ganz regulär: Wer nach der neuen Regel stoppt,
 * stoppt wieder (T3-Strecke). Wir heben also keine Sicherheitsprüfung auf — wir
 * korrigieren nur eine, die zu grob eingestellt war.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { verifyLeadToken } from "@/lib/lead-jwt"
import { redFlagGruppe } from "@/lib/schmerzcheck/segments"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get("u")
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin

  const leadId = verifyLeadToken(token)
  if (!leadId) {
    return NextResponse.redirect(new URL("/schmerzcheck/region?s=expired", baseUrl), 302)
  }

  const supabase = createSupabaseServiceClient()

  const { data: lead } = await supabase
    .from("schmerzcheck_leads")
    .select("id, status, consent_status")
    .eq("id", leadId)
    .maybeSingle()

  if (!lead) {
    return NextResponse.redirect(new URL("/schmerzcheck", baseUrl), 302)
  }

  // Schon freigeschaltet (zweiter Klick) → einfach in den Check schicken.
  if (lead.status !== "red_flag_routed") {
    return NextResponse.redirect(
      new URL(`/check/start?t=${encodeURIComponent(token!)}`, baseUrl),
      302
    )
  }

  const { data: result } = await supabase
    .from("schmerzcheck_results")
    .select("red_flag_codes")
    .eq("lead_id", leadId)
    .maybeSingle()

  // ── Die entscheidende Prüfung ────────────────────────────────────────────
  // Nur wer AUSSCHLIESSLICH wegen des Nacht-Kriteriums gestoppt wurde, darf
  // zurück. Bei echten Warnzeichen bleibt der Stopp — kompromisslos.
  const gruppe = redFlagGruppe({
    id: leadId,
    status: lead.status,
    consent_status: lead.consent_status,
    red_flag_codes: (result?.red_flag_codes as string[] | null) ?? null,
  })

  if (gruppe !== "rf1") {
    console.warn(
      `[recheck] Lead ${leadId} hat ECHTE Warnzeichen (${JSON.stringify(result?.red_flag_codes)}) — Wiedereinstieg verweigert`
    )
    return NextResponse.redirect(new URL("/check/red-flag-stop", baseUrl), 302)
  }

  try {
    // Stopp lösen. Der Zeitpunkt wird festgehalten — das ist eine klinisch
    // relevante Zustandsänderung und gehört nachvollziehbar dokumentiert.
    await supabase
      .from("schmerzcheck_leads")
      .update({
        status: "check_started",
        recheck_invited_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    // Das alte red_flag_stopped-Ergebnis entfernen — sonst würde die
    // Ergebnisseite den Lead weiterhin auf die Stopp-Seite schicken.
    await supabase.from("schmerzcheck_results").delete().eq("lead_id", leadId)

    // Die Antwort-Zeile, die den Fehlalarm ausgelöst hat, ist nicht mehr als
    // Red-Flag markiert. Die ANTWORT selbst bleibt unangetastet — wir ändern
    // nicht, was der Mensch angegeben hat, nur unsere Bewertung davon.
    await supabase
      .from("schmerzcheck_responses")
      .update({ is_red_flag: false })
      .eq("lead_id", leadId)
      .eq("item_id", "rf_systemic")

    await supabase.from("schmerzcheck_email_events").insert({
      lead_id: leadId,
      email_code: "RF1",
      event_type: "clicked",
      metadata: { target: "recheck" },
    })
  } catch (err) {
    console.error("[GET /api/schmerzcheck/recheck] fehlgeschlagen:", err)
    // Nicht blockieren — lieber in den Check schicken als ins Leere.
  }

  return NextResponse.redirect(
    new URL(`/check/start?t=${encodeURIComponent(token!)}`, baseUrl),
    302
  )
}
