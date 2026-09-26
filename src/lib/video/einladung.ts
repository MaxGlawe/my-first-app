/**
 * PROJ-28 — Die Einladung zum Videotermin, an einer Stelle.
 *
 * Sie wird jetzt von drei Seiten gebraucht: wenn der Behandler einen Termin
 * anlegt, wenn er sie erneut verschickt — und seit dem Buchungs-Webhook auch
 * dann, wenn NIEMAND etwas tut: Der Patient bucht auf der Website, und der
 * Termin samt Einladung entsteht von selbst.
 *
 * Dreimal derselbe Text an drei Stellen wäre dreimal eine Gelegenheit, ihn
 * verschieden werden zu lassen. Die Einladung vom Webhook muss dieselbe sein
 * wie die aus dem OS — für den Patienten gibt es keinen Unterschied.
 */

import { sendEmail } from "@/lib/email"
import { sprechzimmerEinladung } from "@/lib/email-templates/sprechzimmer-einladung"
import { kalendereintrag } from "@/lib/video/termin"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface EinladungsTermin {
  id: string
  gast_token: string
  geplant_at: string
  dauer_minuten: number
  hinweis?: string | null
}

export interface EinladungsEmpfaenger {
  vorname?: string | null
  email?: string | null
}

/**
 * Verschickt die Einladung und vermerkt den Versand am Gespräch.
 *
 * Gibt zurück, was schiefging, statt zu werfen: Eine gescheiterte Mail darf
 * niemals einen Termin verhindern. Ein Termin ohne Mail lässt sich
 * nachschicken; ein verlorener Termin wäre schlimmer.
 */
export async function sendeEinladung(args: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svc: SupabaseClient<any, any, any>
  termin: EinladungsTermin
  patient: EinladungsEmpfaenger
  behandlerName: string
  /** „24h" oder „1h" machen daraus eine Erinnerung statt einer Ersteinladung. */
  erinnerung?: "24h" | "1h"
}): Promise<{ ok: boolean; fehler?: string }> {
  const { svc, termin, patient, behandlerName, erinnerung } = args

  if (!patient.email) {
    return { ok: false, fehler: "Der Patient hat keine E-Mail-Adresse hinterlegt." }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"
  const gastUrl = `${siteUrl}/sprechzimmer/${termin.gast_token}`

  const { data: praxis } = await svc
    .from("praxis_settings")
    .select("praxis_name, email")
    .limit(1)
    .maybeSingle()

  const mail = sprechzimmerEinladung({
    vorname: patient.vorname || "",
    geplantAt: termin.geplant_at,
    dauerMinuten: termin.dauer_minuten,
    beitrittsUrl: gastUrl,
    behandlerName,
    praxisName: praxis?.praxis_name ?? "Physiotherapie Glawe",
    siteUrl,
    hinweis: termin.hinweis ?? null,
    erinnerung,
  })

  const ics = kalendereintrag({
    uid: termin.id,
    geplantAt: termin.geplant_at,
    dauerMinuten: termin.dauer_minuten,
    titel: "Video-Sprechstunde",
    beschreibung: `Zum Sprechzimmer: ${gastUrl}\n\nDer Zugang öffnet sich 5 Minuten vor Beginn.`,
    url: gastUrl,
    organisator: behandlerName,
    organisatorEmail: praxis?.email || process.env.SMTP_USER || "info@wwwpraxis-os.com",
  })

  const res = await sendEmail({
    to: patient.email,
    subject: mail.subject,
    html: mail.html,
    // Als Buffer, so erwartet es sendEmail. utf-8 ist fuer .ics richtig:
    // Umlaute im Titel und im Behandlernamen muessen ankommen.
    attachments: [{ filename: "Videotermin.ics", content: Buffer.from(ics, "utf-8") }],
  })

  if (!res.success) {
    return { ok: false, fehler: res.error ?? "Die Einladung konnte nicht verschickt werden." }
  }

  // Nur die Ersteinladung wird am Gespräch vermerkt — eine Erinnerung ist
  // keine Einladung, und die Übersicht fragt „ist die Einladung raus?".
  if (!erinnerung) {
    await svc
      .from("video_calls")
      .update({ einladung_gesendet_at: new Date().toISOString() })
      .eq("id", termin.id)
  }

  return { ok: true }
}
