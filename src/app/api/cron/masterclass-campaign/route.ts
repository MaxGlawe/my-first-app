/**
 * GET /api/cron/masterclass-campaign
 *
 * Einmalige Kampagne an die 521 Schmerzcheck-Bestandsleads: Ablösung des
 * Video-Analyse-Pitches durch die Masterclass. Läuft täglich, drei Pässe:
 *
 *   Segment A (178) → M1–M4   Verkaufssequenz, Abstände 0 / +3 / +6 / +10 Tage
 *   Segment B (117) → B1–B2   Brücke, KEIN Angebot. Fragt nur den Stand der
 *                             ärztlichen Abklärung ab. Startet 2 Tage nach dem
 *                             ersten M1 (Kapazität für persönliche Antworten).
 *   Segment C (16)  → C1R     Einmalige Reaktivierung des offenen Checks.
 *   Segment D (210) → NICHTS. Keine Einwilligung, kein Kontakt.
 *
 * SICHERHEITSNETZ (Lehre aus dem D1-Doppelversand vom 10.07.):
 *   - Drosselung: standardmäßig max. 30 Mails pro Lauf (?limit= überschreibbar,
 *     aber nie über HARD_LIMIT ohne ?force=1). Die 157 M1-Empfänger gehen so
 *     über mehrere Tage raus — nebenbei gut für die Zustellbarkeit.
 *   - Sanity-Guard: will ein Lauf mehr als SANITY_MAX Mails senden, bricht er ab
 *     und alarmiert statt zu senden. Ein Bug soll niemals die ganze Liste treffen.
 *   - Jeder Query-Fehler bricht den Lauf ab (fail closed). Ein leeres Ergebnis
 *     wird NIE als "noch nie gesendet" interpretiert.
 *   - Jede Mail claimt vor dem Versand (schmerzcheck_email_claims) → ein Retry
 *     oder ein Doppellauf kann keine Mail zweimal senden.
 *   - assertMailable() prüft unmittelbar vor JEDEM Versand nochmal das Segment.
 *
 * Dry-Run: ?dry=1 → gibt die Empfängerliste zurück und sendet nichts.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"
import { sendEmail } from "@/lib/email"
import {
  renderMasterclassEmail,
  renderBridgeEmail,
  renderReactivationEmail,
  renderRoutingEmail,
} from "@/lib/schmerzcheck/emails-masterclass"
import {
  claimEmailSend,
  releaseEmailClaim,
  loadClaimsWithTime,
  type EmailCode,
} from "@/lib/schmerzcheck/email-claims"
import {
  computeSegment,
  assertMailable,
  isMasterclassEligible,
  needsRegionRouting,
  type SegmentableLead,
} from "@/lib/schmerzcheck/segments"

const DAY = 86_400_000
const M_OFFSET_DAYS = [0, 3, 6, 10] // M1..M4, ab M1-Versand
const B_OFFSET_DAYS = [0, 3] // B1..B2, ab B1-Versand
const B_START_DELAY_DAYS = 2 // B1 frühestens 2 Tage nach dem ersten M1
const RT2_DELAY_DAYS = 4 // RT2 an Nicht-Klicker, 4 Tage nach RT1

const DEFAULT_LIMIT = 30 // Mails pro Lauf (Spec C3: erster Lauf max. 30)
const HARD_LIMIT = 50 // darüber nur mit ?force=1
const SANITY_MAX = 200 // mehr fällige Mails als das → Abbruch + Alarm

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "physiotherapieglawe@gmx.de"
const PAGE = 1000
const CHUNK = 100

type SC = ReturnType<typeof createSupabaseServiceClient>

interface Lead extends SegmentableLead {
  email: string
  first_name: string
  email_hash: string
  main_region_source?: string | null
}

/**
 * Versand-Reihenfolge (Spec Abschnitt 8): RT1 zuerst.
 *
 * Die Drosselung liegt bei 30 Mails pro Lauf. Ohne feste Reihenfolge würden die
 * 77 Routing-Mails und die M-Mails um dieselben Plätze konkurrieren — und die
 * Routing-Frage ist die Voraussetzung dafür, dass die M-Sequenz überhaupt an die
 * richtigen Leute geht. Sie muss zuerst raus.
 */
const CODE_PRIORITY: Record<string, number> = {
  RT1: 0,
  RT2: 1,
  M1: 2, M2: 2, M3: 2, M4: 2,
  C1R: 3,
  B1: 4, B2: 4,
}

/** Eine fällige Mail. */
interface Pending {
  lead: Lead
  code: EmailCode
  segment: string
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Serverkonfiguration fehlt." }, { status: 500 })
  }
  const auth = req.headers.get("authorization")
  const header = req.headers.get("x-cron-secret")
  if (auth !== `Bearer ${cronSecret}` && header !== cronSecret) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const url = new URL(req.url)
  const dryRun = url.searchParams.get("dry") === "1"
  const force = url.searchParams.get("force") === "1"
  const requested = Number(url.searchParams.get("limit")) || DEFAULT_LIMIT
  const limit = force ? requested : Math.min(requested, HARD_LIMIT)

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL || url.origin
      : url.origin

  const supabase = createSupabaseServiceClient()

  try {
    const pending = await collectPending(supabase)

    // ── Sanity-Guard ───────────────────────────────────────────────────────
    if (pending.length > SANITY_MAX) {
      await alertMax(
        `Kampagnen-Cron abgebrochen: ${pending.length} fällige Mails (Grenze ${SANITY_MAX}). ` +
          `Es wurde NICHTS gesendet. Bitte prüfen, ob die Empfängerliste stimmt.`
      )
      return NextResponse.json(
        {
          ok: false,
          aborted: "sanity_guard",
          pending: pending.length,
          limit: SANITY_MAX,
          message: "Zu viele fällige Mails — Lauf abgebrochen, nichts gesendet.",
        },
        { status: 500 }
      )
    }

    const batch = pending.slice(0, limit)

    // ── Dry-Run: Empfängerliste ausgeben, nichts senden ────────────────────
    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        pendingTotal: pending.length,
        wouldSend: batch.length,
        bySegment: countBy(batch, (p) => p.segment),
        byCode: countBy(batch, (p) => p.code),
        recipients: batch.map((p) => ({
          email: maskEmail(p.lead.email),
          code: p.code,
          segment: p.segment,
        })),
      })
    }

    // ── Versand ────────────────────────────────────────────────────────────
    let sent = 0
    let failed = 0
    let skipped = 0

    for (const item of batch) {
      // Zweite Verteidigungslinie: wirft, wenn Segment D oder wenn Segment B
      // etwas anderes als B1/B2 bekommen soll. Unabhängig davon, wie der Lead
      // in die Liste geraten ist.
      assertMailable(item.lead, item.code)

      const granted = await claimEmailSend(supabase, item.lead.id, item.code)
      if (!granted) {
        skipped++
        continue
      }

      const token = createLeadToken(item.lead.id)
      const { subject, html } = buildMail(item, token, baseUrl)

      const res = await sendSchmerzcheckEmail({
        to: item.lead.email,
        toName: item.lead.first_name,
        subject,
        html,
      })

      if (!res.success) await releaseEmailClaim(supabase, item.lead.id, item.code)

      await supabase.from("schmerzcheck_email_events").insert({
        lead_id: item.lead.id,
        email_code: item.code,
        event_type: res.success ? "sent" : "failed",
        metadata: res.success ? { messageId: res.messageId } : { error: res.error },
      })

      if (res.success) sent++
      else failed++
    }

    return NextResponse.json({
      ok: true,
      pendingTotal: pending.length,
      sent,
      failed,
      skipped,
      remaining: Math.max(0, pending.length - batch.length),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[cron/masterclass-campaign] Lauf abgebrochen:", message)
    await alertMax(`Kampagnen-Cron abgebrochen (fail closed): ${message}`)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// ── Fällige Mails sammeln ───────────────────────────────────────────────────

async function collectPending(supabase: SC): Promise<Pending[]> {
  // Nur Leads MIT Double-Opt-in laden. Segment D wird damit schon im Query
  // ausgeschlossen — assertMailable() prüft es später trotzdem nochmal.
  //
  // `source` filtert Test-Leads aus (/api/dev/funnel legt sie mit einer eigenen
  // source an). Die stehen zwar ohnehin auf der Suppression-Liste, aber eine
  // Mail an eine Fantasie-Adresse würde der Zustellbarkeit der Domain schaden —
  // das ist es wert, zweimal abgesichert zu sein.
  const leads = await paginate<Lead>("leads", (from, to) =>
    supabase
      .from("schmerzcheck_leads")
      .select(
        "id, email, first_name, email_hash, status, consent_status, medical_cleared_at, main_region"
      )
      .eq("consent_status", "confirmed")
      .eq("source", "schmerzcheck_landing")
      .range(from, to)
  )
  if (!leads.length) return []

  const suppressed = await loadSuppressed(
    supabase,
    leads.map((l) => l.email_hash).filter(Boolean)
  )
  const claims = await loadClaimsWithTime(
    supabase,
    leads.map((l) => l.id)
  )

  // B-Sequenz startet erst 2 Tage nach dem ersten M1 — so bleibt Kapazität,
  // die persönlichen Antworten der Red-Flag-Leads zu beantworten.
  const firstM1 = earliestClaim(claims, "M1")
  const bridgeOpen = firstM1 !== null && Date.now() >= firstM1 + B_START_DELAY_DAYS * DAY

  const now = Date.now()
  const pending: Pending[] = []

  for (const lead of leads) {
    if (suppressed.has(lead.email_hash)) continue

    const segment = computeSegment(lead)
    const sentCodes = claims.get(lead.id) ?? new Map<string, Date>()

    if (segment === "D") continue

    if (segment === "A") {
      // ── Region unbekannt? → erst fragen, nicht verkaufen ──────────────────
      // Die 77 aus „Mehrere Bereiche" haben ihre Detailangabe im Check
      // überschrieben. Die Masterclass ist ein LWS-Kurs — ohne Kenntnis der
      // Region wäre jedes Angebot ein Blindschuss.
      if (needsRegionRouting(lead)) {
        if (!sentCodes.has("RT1")) {
          pending.push({ lead, code: "RT1", segment })
          continue
        }
        // RT2: eine einzige Erinnerung an Nicht-Klicker, dann Schluss.
        const rt1At = sentCodes.get("RT1")!.getTime()
        if (!sentCodes.has("RT2") && now >= rt1At + RT2_DELAY_DAYS * DAY) {
          pending.push({ lead, code: "RT2", segment })
        }
        continue // ohne Region KEINE M-Mail — fail closed
      }

      // ── Region bekannt, aber kein LWS? → geparkt ──────────────────────────
      // Nacken, Schulter, Knie: kein Angebot. Sie bekommen später ein Produkt,
      // das zu ihnen passt — aber nicht diesen Kurs.
      if (!isMasterclassEligible(lead)) continue

      const step = nextStep(sentCodes, "M", M_OFFSET_DAYS, now)
      if (step) pending.push({ lead, code: `M${step}` as EmailCode, segment })
      continue
    }

    if (segment === "B") {
      if (!bridgeOpen) continue
      const step = nextStep(sentCodes, "B", B_OFFSET_DAYS, now)
      if (step) pending.push({ lead, code: `B${step}` as EmailCode, segment })
      continue
    }

    if (segment === "C") {
      if (!sentCodes.has("C1R")) pending.push({ lead, code: "C1R", segment })
    }
  }

  // RT1 zuerst — siehe CODE_PRIORITY.
  pending.sort((a, b) => (CODE_PRIORITY[a.code] ?? 9) - (CODE_PRIORITY[b.code] ?? 9))

  return pending
}

/**
 * Nächste fällige Stufe einer Sequenz. Die Abstände zählen ab dem Versand der
 * ERSTEN Stufe, nicht ab dem Lead-Alter — die Bestandsleads sind Wochen alt und
 * bekämen sonst alle Stufen auf einen Schlag.
 */
function nextStep(
  sent: Map<string, Date>,
  prefix: string,
  offsets: number[],
  now: number
): number | null {
  const firstSent = sent.get(`${prefix}1`)?.getTime()

  for (let s = 1; s <= offsets.length; s++) {
    if (sent.has(`${prefix}${s}`)) continue

    // Stufe 1 ist sofort fällig; alle weiteren hängen an Stufe 1.
    if (s === 1) return 1
    if (!firstSent) return null // Stufe 1 fehlt → nichts nachziehen
    if (now < firstSent + offsets[s - 1] * DAY) return null // noch nicht dran

    return s
  }
  return null
}

function earliestClaim(claims: Map<string, Map<string, Date>>, code: string): number | null {
  let earliest: number | null = null
  for (const codes of claims.values()) {
    const at = codes.get(code)?.getTime()
    if (at !== undefined && (earliest === null || at < earliest)) earliest = at
  }
  return earliest
}

function buildMail(item: Pending, token: string, baseUrl: string): { subject: string; html: string } {
  const unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`
  const common = { firstName: item.lead.first_name, token, baseUrl, unsubscribeUrl }

  if (/^RT[12]$/.test(item.code)) {
    return renderRoutingEmail({ ...common, step: Number(item.code.slice(2)) as 1 | 2 })
  }

  if (/^M[1-4]$/.test(item.code)) {
    const step = Number(item.code.slice(1)) as 1 | 2 | 3 | 4
    // Nur Leads mit abgeschlossenem Check haben einen Report. Ärztlich
    // abgeklärte Red-Flag-Leads sind zwar Segment A, haben aber keinen.
    const hasReport = item.lead.status === "check_completed"
    return renderMasterclassEmail({
      ...common,
      step,
      reportUrl: hasReport ? `${baseUrl}/check/result?t=${encodeURIComponent(token)}` : null,
      // Kam der Lead über die Routing-Mail herein, braucht M1 einen anderen
      // Einstieg — sein Report zeigt keinen klaren LWS-Befund.
      viaRouting: item.lead.main_region_source === "rt1_click",
    })
  }

  if (/^B[12]$/.test(item.code)) {
    const step = Number(item.code.slice(1)) as 1 | 2
    return renderBridgeEmail({ ...common, step })
  }

  return renderReactivationEmail({
    ...common,
    checkUrl: `${baseUrl}/check/start?t=${encodeURIComponent(token)}`,
  })
}

// ── Helfer ──────────────────────────────────────────────────────────────────

type QueryResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

/** Holt ALLE Zeilen, Seite für Seite. Wirft bei jedem Fehler (fail closed). */
async function paginate<T>(label: string, make: (from: number, to: number) => QueryResult<T>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await make(from, from + PAGE - 1)
    if (error) throw new Error(`${label}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
  }
  return rows
}

async function loadSuppressed(supabase: SC, hashes: string[]): Promise<Set<string>> {
  const found = new Set<string>()
  for (let i = 0; i < hashes.length; i += CHUNK) {
    const chunk = hashes.slice(i, i + CHUNK)
    const rows = await paginate<{ email_hash: string }>("unsubscribes", (from, to) =>
      supabase
        .from("schmerzcheck_unsubscribes")
        .select("email_hash")
        .in("email_hash", chunk)
        .range(from, to)
    )
    for (const r of rows) found.add(r.email_hash)
  }
  return found
}

function countBy<T>(items: T[], key: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const i of items) {
    const k = key(i)
    out[k] = (out[k] || 0) + 1
  }
  return out
}

/** Für den Dry-Run: Adressen nicht im Klartext ins Log/JSON schreiben. */
function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!domain) return "***"
  const head = user.slice(0, 2)
  return `${head}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`
}

async function alertMax(message: string): Promise<void> {
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: "⚠️ Masterclass-Kampagne: Lauf abgebrochen",
      html: `<p style="font-family:sans-serif;font-size:15px;line-height:1.6">${message}</p>`,
    })
  } catch (err) {
    console.error("[cron/masterclass-campaign] Alarm-Mail fehlgeschlagen:", err)
  }
}
