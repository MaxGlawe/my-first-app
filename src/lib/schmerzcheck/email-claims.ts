/**
 * PROJ-23: Doppelversand-Schutz für alle Schmerzcheck-Mails.
 *
 * Jede automatische Mail muss VOR dem Versand einen Anspruch („Claim") auf
 * (lead_id, email_code) erheben. Der Claim läuft über eine atomare Postgres-
 * Funktion und kann pro Paar nur MAX_SENDS-mal gelingen — race-sicher, auch bei
 * parallel laufenden Cron-Läufen oder doppelt abgefeuerten Requests.
 *
 * Grundregel: kann nicht geclaimt werden → NICHT senden (fail closed).
 * Das ist die Lehre aus dem D1-Doppelversand vom 2026-07-10, bei dem eine
 * fehlgeschlagene Dedup-Abfrage 100 Bestandsleads eine Mail erneut schickte.
 */
import type { createSupabaseServiceClient } from "@/lib/supabase-service"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

/** Mail-Codes, die höchstens einmal pro Lead rausgehen dürfen. */
export type EmailCode =
  | "T1" | "T2" | "T3"
  | "D1" | "D2" | "D3" | "D4" | "D5"
  | "R1" | "R2"
  | "W1"

/**
 * Wie oft eine Mail pro Lead maximal rausgehen darf. Bewusst überall 1:
 * "genau einmal, nie wieder". Wenn die T1-Doppel-Opt-in-Mail bei erneutem
 * Absenden des Formulars nochmal rausgehen soll, hier auf 2 setzen — dann
 * bekommt ein Lead sie höchstens zweimal, nie öfter.
 */
const MAX_SENDS: Record<EmailCode, number> = {
  T1: 1, T2: 1, T3: 1,
  D1: 1, D2: 1, D3: 1, D4: 1, D5: 1,
  R1: 1, R2: 1,
  W1: 1,
}

/**
 * Reserviert den Versand einer Mail. TRUE → senden. FALSE → NICHT senden
 * (schon raus, oder der Claim schlug fehl).
 *
 * Ein Fehler der Claim-Funktion wird als FALSE gewertet, nicht als "geht klar":
 * lieber eine Mail zu wenig als eine doppelt.
 */
export async function claimEmailSend(
  supabase: ServiceClient,
  leadId: string,
  code: EmailCode
): Promise<boolean> {
  const { data, error } = await supabase.rpc("claim_schmerzcheck_email", {
    p_lead_id: leadId,
    p_email_code: code,
    p_max_sends: MAX_SENDS[code],
  })

  if (error) {
    console.error(`[Schmerzcheck] Claim für ${code}/${leadId} fehlgeschlagen — kein Versand:`, error.message)
    return false
  }
  return data === true
}

/**
 * Gibt den Claim wieder frei, wenn der Versand tatsächlich fehlschlug (SMTP-
 * Fehler). Nur dann — sonst wäre der Doppelversand-Schutz löchrig.
 */
export async function releaseEmailClaim(
  supabase: ServiceClient,
  leadId: string,
  code: EmailCode
): Promise<void> {
  const { error } = await supabase.rpc("release_schmerzcheck_email_claim", {
    p_lead_id: leadId,
    p_email_code: code,
  })
  if (error) {
    console.error(`[Schmerzcheck] Claim-Release für ${code}/${leadId} fehlgeschlagen:`, error.message)
  }
}

/**
 * Bereits beanspruchte Codes je Lead — für die Auswahl des nächsten fälligen
 * Drip-Schritts. Chunked + paginiert, damit die Abfrage NICHT still am
 * PostgREST-Zeilenlimit (1000) abschneidet.
 *
 * Wirft bei einem Query-Fehler. Der Aufrufer muss den Lauf dann abbrechen —
 * ein leeres Ergebnis darf niemals als "noch nichts gesendet" durchgehen.
 */
export async function loadClaimedCodes(
  supabase: ServiceClient,
  leadIds: string[]
): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>()
  if (!leadIds.length) return map

  const CHUNK = 100 // Lead-IDs pro Anfrage (hält die URL kurz)
  const PAGE = 1000 // PostgREST-Zeilenlimit

  for (let i = 0; i < leadIds.length; i += CHUNK) {
    const chunk = leadIds.slice(i, i + CHUNK)

    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("schmerzcheck_email_claims")
        .select("lead_id, email_code")
        .in("lead_id", chunk)
        .range(from, from + PAGE - 1)

      if (error) {
        throw new Error(`Claim-Abfrage fehlgeschlagen: ${error.message}`)
      }

      for (const row of data ?? []) {
        if (!map.has(row.lead_id)) map.set(row.lead_id, new Set())
        map.get(row.lead_id)!.add(row.email_code)
      }

      if (!data || data.length < PAGE) break
    }
  }

  return map
}
