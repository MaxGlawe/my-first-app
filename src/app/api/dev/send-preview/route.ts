/**
 * GET /api/dev/send-preview?to=<email>&set=campaign|funnel|all
 *
 * Schickt die Mail-Strecke ECHT per SMTP an eine Adresse — zum Gegenlesen im
 * eigenen Postfach, so wie ein Empfänger sie sieht: gleicher Renderer, gleiches
 * Inline-Logo, echter PDF-Anhang bei T2.
 *
 * NUR im Dev-Modus (404 in Produktion).
 *
 * WICHTIG — was diese Route bewusst NICHT tut:
 *   - kein Eintrag in schmerzcheck_email_events  → Statistiken bleiben sauber
 *   - kein Claim in schmerzcheck_email_claims    → der Doppelversand-Schutz für
 *     echte Leads wird nicht verbraucht
 *   - kein Lead wird angelegt oder verändert
 *
 * Jede Mail bekommt oben einen Vorschau-Balken (Code, Zielgruppe, Anzahl), damit
 * im Postfach klar ist, was man gerade liest. Der BETREFF bleibt unverändert —
 * er ist das Erste, was ein Empfänger sieht, und muss so beurteilt werden können,
 * wie er ankommt.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"
import { sendSchmerzcheckEmail } from "@/lib/schmerzcheck/mailer"
import { loadAnswers } from "@/lib/schmerzcheck/check-store"
import { buildReportView, type SchmerzResult } from "@/lib/schmerzcheck/report"
import { generateReportPdf } from "@/lib/schmerzcheck/report-pdf"
import {
  renderMasterclassEmail,
  renderBridgeEmail,
  renderReactivationEmail,
  renderRoutingEmail,
} from "@/lib/schmerzcheck/emails-masterclass"
import {
  renderT1WelcomeEmail,
  renderT2ReportEmail,
  renderT3RedFlagEmail,
  renderDripEmail,
  renderWinbackEmail,
} from "@/lib/schmerzcheck/emails"

interface MailDef {
  code: string
  gruppe: string
  ziel: string
  angebot: boolean
}

/** PROJ-25b — die Routing-Frage an die 69 Leads mit unbekannter Region. */
const ROUTING: MailDef[] = [
  { code: "RT1", gruppe: "Routing · 69 Leads mit unbekannter Region", ziel: "Tag 0 · KEIN Angebot", angebot: false },
  { code: "RT2", gruppe: "Routing · Erinnerung an Nicht-Klicker", ziel: "Tag 4 · KEIN Angebot", angebot: false },
  { code: "M1R", gruppe: "Kampagne · M1 für RT1-Klicker", ziel: "anderer Einstieg als das normale M1", angebot: true },
]

const CAMPAIGN: MailDef[] = [
  { code: "M1", gruppe: "Kampagne · Segment A", ziel: "Tag 0", angebot: true },
  { code: "M2", gruppe: "Kampagne · Segment A", ziel: "Tag 3", angebot: true },
  { code: "M3", gruppe: "Kampagne · Segment A", ziel: "Tag 6", angebot: true },
  { code: "M4", gruppe: "Kampagne · Segment A", ziel: "Tag 10", angebot: true },
  { code: "B1", gruppe: "Kampagne · Segment B (Red-Flag)", ziel: "KEIN Angebot", angebot: false },
  { code: "B2", gruppe: "Kampagne · Segment B (Red-Flag)", ziel: "KEIN Angebot", angebot: false },
  { code: "C1R", gruppe: "Kampagne · Segment C", ziel: "Reaktivierung", angebot: false },
]

const FUNNEL: MailDef[] = [
  { code: "T1", gruppe: "Funnel · neue Leads", ziel: "Double-Opt-in", angebot: false },
  { code: "T2", gruppe: "Funnel · neue Leads", ziel: "Report + PDF", angebot: true },
  { code: "T3", gruppe: "Funnel · neue Leads", ziel: "Red-Flag-Stopp — nie ein Angebot", angebot: false },
  { code: "D1", gruppe: "Funnel · Drip", ziel: "+1 Tag", angebot: true },
  { code: "D2", gruppe: "Funnel · Drip", ziel: "+2 Tage", angebot: true },
  { code: "D3", gruppe: "Funnel · Drip", ziel: "+3 Tage", angebot: true },
  { code: "D4", gruppe: "Funnel · Drip", ziel: "+5 Tage", angebot: true },
  { code: "D5", gruppe: "Funnel · Drip", ziel: "+7 Tage", angebot: true },
  { code: "W1", gruppe: "Funnel · Win-back", ziel: "+9 Tage", angebot: true },
  { code: "D1S", gruppe: "Funnel · soft-flag", ziel: "„ärztlich abklären“ — KEIN Angebot", angebot: false },
  { code: "D2S", gruppe: "Funnel · soft-flag", ziel: "„ärztlich abklären“ — KEIN Angebot", angebot: false },
  { code: "D4S", gruppe: "Funnel · soft-flag", ziel: "„ärztlich abklären“ — KEIN Angebot", angebot: false },
]

/** Vorschau-Balken über der Mail — im Postfach sofort erkennbar. */
function banner(def: MailDef): string {
  const farbe = def.angebot ? "#065f46" : "#b45309"
  return `
  <div style="background:${farbe};color:#fff;padding:12px 20px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;">
    <strong style="font-size:15px;">VORSCHAU · ${def.code}</strong><br/>
    ${def.gruppe} — ${def.ziel}
    ${def.angebot ? "" : ' · <strong>diese Mail darf KEIN Kaufangebot enthalten</strong>'}
  </div>`
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const url = new URL(request.url)
  const to = url.searchParams.get("to")
  const set = (url.searchParams.get("set") || "all").toLowerCase()

  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ error: "?to=<gültige E-Mail> fehlt" }, { status: 400 })
  }

  const defs =
    set === "routing"
      ? ROUTING
      : set === "campaign"
        ? CAMPAIGN
        : set === "funnel"
          ? FUNNEL
          : [...ROUTING, ...CAMPAIGN, ...FUNNEL]

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin
  const supabase = createSupabaseServiceClient()

  // Echten abgeschlossenen Lead nehmen → der Report-Link und das PDF zeigen
  // echte Inhalte statt Platzhalter.
  const { data: result } = await supabase
    .from("schmerzcheck_results")
    .select("*")
    .eq("status", "completed")
    .not("soft_flag", "is", true)
    .limit(1)
    .maybeSingle()

  const leadId = result?.lead_id as string | undefined
  const token = leadId ? createLeadToken(leadId) : "VORSCHAU"
  const reportUrl = `${baseUrl}/check/result?t=${encodeURIComponent(token)}`
  const unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?u=${encodeURIComponent(token)}`

  // PDF für T2 — genau das, was ein echter Empfänger im Anhang bekommt.
  let pdf: Buffer | null = null
  if (leadId) {
    try {
      const answers = await loadAnswers(supabase, leadId)
      const view = buildReportView(result as SchmerzResult, "Max", answers)
      pdf = Buffer.from(generateReportPdf(view, new Date().toLocaleDateString("de-DE"), baseUrl))
    } catch (err) {
      console.error("[send-preview] PDF konnte nicht erzeugt werden:", err)
    }
  }

  const common = { firstName: "Max", token, baseUrl, unsubscribeUrl }
  const gesendet: string[] = []
  const fehler: { code: string; error: string }[] = []

  for (const def of defs) {
    const { subject, html } = render(def.code, common, reportUrl, baseUrl)

    const res = await sendSchmerzcheckEmail({
      to,
      toName: "Max",
      subject,
      html: banner(def) + html,
      // Nur T2 trägt im Echtbetrieb den Report als Anhang.
      attachments: def.code === "T2" && pdf ? [{ filename: "schmerz-report.pdf", content: pdf }] : undefined,
    })

    if (res.success) gesendet.push(def.code)
    else fehler.push({ code: def.code, error: res.error ?? "unbekannt" })

    // Kleine Pause — 19 Mails in einer Sekunde lässt SiteGround gern mal fallen.
    await new Promise((r) => setTimeout(r, 700))
  }

  const html = `<!doctype html><meta charset="utf-8">
  <style>body{font:16px/1.6 system-ui;background:#F8F5F0;color:#0f172a;margin:0}
  .w{max-width:640px;margin:0 auto;padding:40px 24px}
  .ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:12px;padding:16px 20px;margin-bottom:20px}
  .err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:12px;padding:16px 20px;margin-bottom:20px}
  code{background:#f1ece2;padding:2px 7px;border-radius:5px;font-size:13px}</style>
  <div class="w">
  <h1>Mail-Strecke versendet</h1>
  <div class="ok">
    <strong>${gesendet.length} Mails an ${to} raus.</strong><br>
    ${gesendet.map((c) => `<code>${c}</code>`).join(" ")}
  </div>
  ${
    fehler.length
      ? `<div class="err"><strong>${fehler.length} fehlgeschlagen:</strong><br>${fehler
          .map((f) => `<code>${f.code}</code> — ${f.error}`)
          .join("<br>")}</div>`
      : ""
  }
  <p><strong>Es wurden keine Events und keine Claims geschrieben.</strong> Die Statistiken der
  echten Leads sind unberührt, und der Doppelversand-Schutz wurde nicht verbraucht.</p>
  <p>Der PDF-Anhang bei T2 ${pdf ? "ist echt (aus einem abgeschlossenen Check)" : "konnte nicht erzeugt werden"}.</p>
  <p><a href="/api/dev/review">← Zurück zur Review-Übersicht</a></p>
  </div>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}

function render(
  code: string,
  common: { firstName: string; token: string; baseUrl: string; unsubscribeUrl: string },
  reportUrl: string,
  baseUrl: string
): { subject: string; html: string } {
  if (/^RT[12]$/.test(code)) {
    return renderRoutingEmail({ ...common, step: Number(code.slice(2)) as 1 | 2 })
  }
  // M1 in der Variante für RT1-Klicker — anderer Einstieg, weil ihr Report
  // keinen klaren LWS-Befund zeigt.
  if (code === "M1R") {
    return renderMasterclassEmail({ ...common, step: 1, reportUrl, viaRouting: true })
  }
  if (/^M[1-4]$/.test(code)) {
    return renderMasterclassEmail({ ...common, step: Number(code[1]) as 1 | 2 | 3 | 4, reportUrl })
  }
  if (/^B[12]$/.test(code)) {
    return renderBridgeEmail({ ...common, step: Number(code[1]) as 1 | 2 })
  }
  if (code === "C1R") {
    return renderReactivationEmail({
      ...common,
      checkUrl: `${baseUrl}/check/start?t=${encodeURIComponent(common.token)}`,
    })
  }
  if (code === "T1") {
    return {
      subject: "Dein Schmerzcheck ist bereit — starte jetzt",
      html: renderT1WelcomeEmail({
        firstName: common.firstName,
        checkUrl: `${baseUrl}/check/start?t=${encodeURIComponent(common.token)}`,
        baseUrl,
      }),
    }
  }
  if (code === "T2") {
    return {
      subject: "Dein persönlicher Schmerz-Report — von Max Glawe",
      html: renderT2ReportEmail({ ...common, reportUrl, softFlag: false }),
    }
  }
  if (code === "T3") {
    return {
      subject: "Dein Schmerzcheck — wichtiger Hinweis",
      html: renderT3RedFlagEmail({ firstName: common.firstName, baseUrl }),
    }
  }
  if (code === "W1") {
    return renderWinbackEmail({ ...common, reportUrl })
  }

  // D1–D5, regulär und als soft-flag-Variante (Suffix S)
  const softFlag = code.endsWith("S")
  const step = Number(code[1]) as 1 | 2 | 3 | 4 | 5
  return renderDripEmail({ ...common, step, reportUrl, softFlag })
}
