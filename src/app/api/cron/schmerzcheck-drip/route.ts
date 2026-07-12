/**
 * PROJ-23 / Phase 4: GET /api/cron/schmerzcheck-drip
 *
 * Runs ~daily (Supabase pg_cron). Three passes, ONE due step per lead per run:
 *
 *  1) Nurture drip (status=check_completed): D1 +1d, D2 +2d, D3 +3d, D4 +5d,
 *     D5 +7d after completed_at. soft-flag skips D3 + D5 (booking pitches).
 *  2) Check reminder (consent confirmed, status=awaiting_check/check_started):
 *     R1 +1d, R2 +3d after consent_confirmed_at — wins back abandoned checks.
 *     Only confirmed leads (DOI given); pending leads are never re-mailed.
 *
 *  3) Win-back W1 (check_completed, not booked): once, >=9d after completed_at
 *     (well after D5) — re-engages old non-buyers with the new positioning.
 *     soft-flag excluded (no booking pitch).
 *
 * Exclusions: red-flag leads aren't enrolled; unsubscribed/booked are suppressed.
 * Security: CRON_SECRET via `Authorization: Bearer` or `x-cron-secret`.
 *
 * Doppelversand-Schutz (nach dem D1-Vorfall vom 2026-07-10):
 *  - Jede Mail wird VOR dem Versand in schmerzcheck_email_claims reserviert
 *    (atomar, max. 1× pro Lead+Code). Ohne Claim kein Versand.
 *  - Alle Abfragen sind gechunkt + paginiert — kein stilles Abschneiden am
 *    PostgREST-Zeilenlimit mehr.
 *  - Jeder Query-Fehler bricht den Lauf ab (fail closed), statt verschluckt zu
 *    werden und den Lead fälschlich als "noch nie gemailt" erscheinen zu lassen.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"
import { renderDripEmail, renderReminderEmail, renderWinbackEmail } from "@/lib/schmerzcheck/emails"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"
import { claimEmailSend, loadClaimedCodes, releaseEmailClaim, type EmailCode } from "@/lib/schmerzcheck/email-claims"

const DAY = 86_400_000
const OFFSET_DAYS = [1, 2, 3, 5, 7] // D1..D5 after completed_at (verdichtet für mehr Buchungen)
const REMINDER_OFFSET_DAYS = [1, 3] // R1..R2 after consent_confirmed_at
const WINBACK_DELAY_DAYS = 9 // W1 frühestens 9 Tage nach completed_at (= 2 Tage nach D5, kein Back-to-Back)
const MAX_PER_RUN = 100
const CHUNK = 100 // IDs/Hashes pro Abfrage
const PAGE = 1000 // PostgREST-Zeilenlimit

type SC = ReturnType<typeof createSupabaseServiceClient>

type QueryResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

/**
 * Holt ALLE Zeilen einer Abfrage, Seite für Seite. Ohne das schneidet PostgREST
 * still bei 1000 Zeilen ab — genau der Defekt, der zum D1-Doppelversand führte.
 * Wirft bei jedem Query-Fehler (fail closed).
 */
async function paginate<T>(label: string, makeQuery: (from: number, to: number) => QueryResult<T>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await makeQuery(from, from + PAGE - 1)
    if (error) throw new Error(`${label}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
  }
  return rows
}

/** email_hashes currently on the suppression list (unsubscribed / booked). */
async function loadSuppressed(supabase: SC, hashes: string[]): Promise<Set<string>> {
  const found = new Set<string>()
  for (let i = 0; i < hashes.length; i += CHUNK) {
    const chunk = hashes.slice(i, i + CHUNK)
    const rows = await paginate<{ email_hash: string }>("unsubscribes", (from, to) =>
      supabase.from("schmerzcheck_unsubscribes").select("email_hash").in("email_hash", chunk).range(from, to)
    )
    for (const r of rows) found.add(r.email_hash)
  }
  return found
}

interface ResultRow {
  lead_id: string
  completed_at: string | null
  result_category: string | null
  soft_flag: boolean | null
}

/** Abgeschlossene Check-Ergebnisse je Lead — gechunkt + paginiert. */
async function loadResults(supabase: SC, leadIds: string[]): Promise<Map<string, ResultRow>> {
  const map = new Map<string, ResultRow>()
  for (let i = 0; i < leadIds.length; i += CHUNK) {
    const chunk = leadIds.slice(i, i + CHUNK)
    const rows = await paginate<ResultRow>("results", (from, to) =>
      supabase
        .from("schmerzcheck_results")
        .select("lead_id, completed_at, result_category, soft_flag")
        .eq("status", "completed")
        .in("lead_id", chunk)
        .range(from, to)
    )
    for (const r of rows) if (r.completed_at) map.set(r.lead_id, r)
  }
  return map
}

interface LeadRow {
  id: string
  email: string
  first_name: string
  email_hash: string
  /** PROJ-25b: Schwerpunkt der Beschwerden. Nur LWS darf die Masterclass sehen. */
  main_region?: string | null
}

interface SendOutcome {
  sent: boolean
  failed: boolean
}

/**
 * Reserviert → sendet → protokolliert. Ohne Claim geht garantiert nichts raus.
 * Bei SMTP-Fehler wird der Claim zurückgegeben, damit der nächste Lauf es
 * erneut versuchen darf.
 */
async function claimAndSend(
  supabase: SC,
  lead: { id: string; email: string; first_name: string },
  code: EmailCode,
  build: () => { subject: string; html: string }
): Promise<SendOutcome> {
  const granted = await claimEmailSend(supabase, lead.id, code)
  if (!granted) return { sent: false, failed: false } // schon raus → still überspringen

  const { subject, html } = build()
  const res = await sendSchmerzcheckEmail({ to: lead.email, toName: lead.first_name, subject, html })

  if (!res.success) await releaseEmailClaim(supabase, lead.id, code)

  await supabase.from("schmerzcheck_email_events").insert({
    lead_id: lead.id,
    email_code: code,
    event_type: res.success ? "sent" : "failed",
    metadata: res.success ? { messageId: res.messageId } : { error: res.error },
  })

  return { sent: res.success, failed: !res.success }
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 })
  }
  const authHeader = req.headers.get("authorization")
  const cronHeader = req.headers.get("x-cron-secret")
  if (authHeader !== `Bearer ${cronSecret}` && cronHeader !== cronSecret) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
      : new URL(req.url).origin

  const supabase = createSupabaseServiceClient()
  const now = Date.now()

  let processed = 0
  let sent = 0
  let failed = 0
  let skipped = 0 // bereits gesendet (Claim verweigert)

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // PASS 1 — Nurture drip (check completed)
    // ─────────────────────────────────────────────────────────────────────────
    const leads = await paginate<LeadRow>("leads/drip", (from, to) =>
      supabase
        .from("schmerzcheck_leads")
        .select("id, email, first_name, email_hash, main_region")
        .eq("status", "check_completed")
        .eq("consent_status", "confirmed")
        .eq("source", "schmerzcheck_landing")
        .range(from, to)
    )

    if (leads.length) {
      const leadIds = leads.map((l) => l.id)
      const suppressedSet = await loadSuppressed(supabase, leads.map((l) => l.email_hash).filter(Boolean))
      const resultByLead = await loadResults(supabase, leadIds)
      const claimedByLead = await loadClaimedCodes(supabase, leadIds)

      for (const lead of leads) {
        if (sent >= MAX_PER_RUN) break
        if (suppressedSet.has(lead.email_hash)) continue
        const result = resultByLead.get(lead.id)
        if (!result) continue

        // „Kein Angebot" gilt aus ZWEI Gründen — und beide führen denselben Pfad:
        //   1. soft-flag / „ärztlich abklären" → HWG (unverändert)
        //   2. Schwerpunkt ist NICHT der untere Rücken (PROJ-25b) → die
        //      Masterclass ist ein LWS-Kurs; einem Nacken- oder Knie-Patienten
        //      399 € dafür anzubieten, wäre ein Fehlverkauf.
        // Beide bekommen die reinen Nurture-Varianten; D3 und D5 (die Verkaufs-
        // mails) werden komplett übersprungen.
        const softFlag =
          result.soft_flag === true || result.result_category === "needs_physician_assessment"
        const keinLws = lead.main_region !== "unterer_ruecken"
        const keinAngebot = softFlag || keinLws

        const completedAt = new Date(result.completed_at!).getTime()
        const claimed = claimedByLead.get(lead.id) ?? new Set<string>()

        let step: 1 | 2 | 3 | 4 | 5 | null = null
        for (let s = 1; s <= 5; s++) {
          if (claimed.has(`D${s}`)) continue
          if ((s === 3 || s === 5) && keinAngebot) continue // D3/D5 sind reine Verkaufsmails
          if (now < completedAt + OFFSET_DAYS[s - 1] * DAY) break // not due yet
          step = s as 1 | 2 | 3 | 4 | 5
          break
        }
        if (!step) continue

        processed++
        const token = createLeadToken(lead.id)
        const outcome = await claimAndSend(supabase, lead, `D${step}` as EmailCode, () =>
          renderDripEmail({
            step: step as 1 | 2 | 3 | 4 | 5,
            firstName: lead.first_name,
            reportUrl: `${baseUrl}/check/result?t=${encodeURIComponent(token)}`,
            token,
            baseUrl,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`,
            softFlag: keinAngebot,
          })
        )
        if (outcome.sent) sent++
        else if (outcome.failed) failed++
        else skipped++
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASS 2 — Check reminder (confirmed lead, check not finished)
    // ─────────────────────────────────────────────────────────────────────────
    const rLeads = await paginate<LeadRow & { consent_confirmed_at: string | null }>("leads/reminder", (from, to) =>
      supabase
        .from("schmerzcheck_leads")
        .select("id, email, first_name, email_hash, consent_confirmed_at")
        .eq("consent_status", "confirmed")
        .eq("source", "schmerzcheck_landing")
        .in("status", ["awaiting_check", "check_started"])
        .not("consent_confirmed_at", "is", null)
        .range(from, to)
    )

    if (rLeads.length) {
      const rIds = rLeads.map((l) => l.id)
      const rSuppressed = await loadSuppressed(supabase, rLeads.map((l) => l.email_hash).filter(Boolean))
      const rClaimed = await loadClaimedCodes(supabase, rIds)

      for (const lead of rLeads) {
        if (sent >= MAX_PER_RUN) break
        if (rSuppressed.has(lead.email_hash)) continue
        if (!lead.consent_confirmed_at) continue

        const baseTs = new Date(lead.consent_confirmed_at).getTime()
        const claimed = rClaimed.get(lead.id) ?? new Set<string>()

        let rStep: 1 | 2 | null = null
        for (let s = 1; s <= 2; s++) {
          if (claimed.has(`R${s}`)) continue
          if (now < baseTs + REMINDER_OFFSET_DAYS[s - 1] * DAY) break // not due yet
          rStep = s as 1 | 2
          break
        }
        if (!rStep) continue

        processed++
        const token = createLeadToken(lead.id)
        const outcome = await claimAndSend(supabase, lead, `R${rStep}` as EmailCode, () =>
          renderReminderEmail({
            step: rStep as 1 | 2,
            firstName: lead.first_name,
            checkUrl: `${baseUrl}/check/start?t=${encodeURIComponent(token)}`,
            baseUrl,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`,
          })
        )
        if (outcome.sent) sent++
        else if (outcome.failed) failed++
        else skipped++
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASS 3 — Win-back W1 (Drip durch, nicht gebucht → neue Positionierung)
    // Einmalig pro Lead, frühestens WINBACK_DELAY_DAYS nach completed_at (also
    // deutlich nach D5/+7d → nie während eines laufenden Drips). Nur buchungs-
    // berechtigte Leads: soft-flag/„ärztlich abklären" wird ausgeschlossen.
    // ─────────────────────────────────────────────────────────────────────────
    const wLeads = await paginate<LeadRow>("leads/winback", (from, to) =>
      supabase
        .from("schmerzcheck_leads")
        .select("id, email, first_name, email_hash, main_region")
        .eq("status", "check_completed")
        .eq("consent_status", "confirmed")
        .eq("source", "schmerzcheck_landing")
        .is("booked_at", null)
        .range(from, to)
    )

    if (wLeads.length) {
      const wIds = wLeads.map((l) => l.id)
      const wSuppressed = await loadSuppressed(supabase, wLeads.map((l) => l.email_hash).filter(Boolean))
      const wResultByLead = await loadResults(supabase, wIds)
      const wClaimed = await loadClaimedCodes(supabase, wIds)

      for (const lead of wLeads) {
        if (sent >= MAX_PER_RUN) break
        if (wSuppressed.has(lead.email_hash)) continue
        const result = wResultByLead.get(lead.id)
        if (!result) continue

        const soft = result.soft_flag === true || result.result_category === "needs_physician_assessment"
        if (soft) continue // HWG: kein Angebot für soft-flag/Arzt-Empfehlung
        // W1 ist eine reine Verkaufsmail → nur an LWS-Leads (PROJ-25b).
        // Die Masterclass ist ein Kreuzschmerz-Kurs; ein Nacken-Patient bekommt
        // sie nicht angeboten, auch nicht als Win-back.
        if (lead.main_region !== "unterer_ruecken") continue
        if ((wClaimed.get(lead.id) ?? new Set<string>()).has("W1")) continue // W1 schon raus
        const completedAt = new Date(result.completed_at!).getTime()
        if (now < completedAt + WINBACK_DELAY_DAYS * DAY) continue // Cooldown nach Drip

        processed++
        const token = createLeadToken(lead.id)
        const outcome = await claimAndSend(supabase, lead, "W1", () =>
          renderWinbackEmail({
            firstName: lead.first_name,
            reportUrl: `${baseUrl}/check/result?t=${encodeURIComponent(token)}`,
            token,
            baseUrl,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`,
          })
        )
        if (outcome.sent) sent++
        else if (outcome.failed) failed++
        else skipped++
      }
    }
  } catch (err) {
    // Fail closed: lieber ein Lauf ohne Mails als ein Lauf mit doppelten Mails.
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[cron/schmerzcheck-drip] Lauf abgebrochen:", message)
    return NextResponse.json(
      { ok: false, error: "Lauf abgebrochen (fail closed).", detail: message, processed, sent, failed, skipped },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, processed, sent, failed, skipped })
}
