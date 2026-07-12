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

/**
 * Mail-Codes, die höchstens einmal pro Lead rausgehen dürfen.
 *
 *   T1–T3   transaktional (Opt-in, Report, Red-Flag-Hinweis)
 *   D1–D5   Drip für Neuleads       R1/R2  Check-Erinnerung      W1  Win-back
 *   M1–M4   Masterclass-Kampagne (Segment A)
 *   B1/B2   Brücke für Red-Flag-Leads (Segment B) — KEIN Kaufangebot.
 *           Heißen bewusst B*, nicht R* wie in der Spec: R1/R2 sind seit Juni
 *           als Check-Erinnerung vergeben und stecken so im Event-Log und im
 *           Claim-Register. Gleicher Code = kaputter Doppelversand-Schutz.
 *   C1R     Reaktivierung (Segment C)
 *   RT1/RT2 Routing-Frage an die 77 Leads mit unbekannter Region (PROJ-25b) —
 *           KEIN Kaufangebot. Codes vorab gegen Event-Log und Claim-Register
 *           geprüft: beide frei (Lehre aus der R1/R2-Kollision).
 */
export type EmailCode =
  | "T1" | "T2" | "T3"
  | "D1" | "D2" | "D3" | "D4" | "D5"
  | "R1" | "R2"
  | "W1"
  | "M1" | "M2" | "M3" | "M4"
  | "B1" | "B2"
  | "C1R"
  | "RT1" | "RT2"

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
  M1: 1, M2: 1, M3: 1, M4: 1,
  B1: 1, B2: 1,
  C1R: 1,
  RT1: 1, RT2: 1,
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
  const withTime = await loadClaimsWithTime(supabase, leadIds)
  const map = new Map<string, Set<string>>()
  for (const [leadId, codes] of withTime) {
    map.set(leadId, new Set(codes.keys()))
  }
  return map
}

/**
 * Wie loadClaimedCodes, liefert aber zusätzlich den Zeitpunkt des ersten
 * Versands je Code. Die Kampagnen-Sequenzen takten ihre Abstände daran
 * (M2 = 3 Tage nach M1) — nicht am Lead-Alter, denn die Bestandsleads sind
 * Wochen alt und würden sonst alle Stufen sofort auf einmal bekommen.
 */
export async function loadClaimsWithTime(
  supabase: ServiceClient,
  leadIds: string[]
): Promise<Map<string, Map<string, Date>>> {
  const map = new Map<string, Map<string, Date>>()
  if (!leadIds.length) return map

  const CHUNK = 100 // Lead-IDs pro Anfrage (hält die URL kurz)
  const PAGE = 1000 // PostgREST-Zeilenlimit

  for (let i = 0; i < leadIds.length; i += CHUNK) {
    const chunk = leadIds.slice(i, i + CHUNK)

    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("schmerzcheck_email_claims")
        .select("lead_id, email_code, first_claimed_at")
        .in("lead_id", chunk)
        .range(from, from + PAGE - 1)

      if (error) {
        throw new Error(`Claim-Abfrage fehlgeschlagen: ${error.message}`)
      }

      for (const row of data ?? []) {
        if (!map.has(row.lead_id)) map.set(row.lead_id, new Map())
        map.get(row.lead_id)!.set(row.email_code, new Date(row.first_claimed_at))
      }

      if (!data || data.length < PAGE) break
    }
  }

  return map
}
