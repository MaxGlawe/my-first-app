/**
 * GET /api/dev/mail-preview?code=M1  — Vorschau der Kampagnen-Mails.
 *
 * NUR im Dev-Modus. In Produktion gibt die Route 404 zurück — sie ist ein
 * Werkzeug zum Gegenlesen der Texte, kein Feature.
 *
 * Ohne ?code= liefert sie eine Übersichtsseite mit allen Mails nebeneinander.
 */
import { NextRequest, NextResponse } from "next/server"
import {
  renderMasterclassEmail,
  renderBridgeEmail,
  renderReactivationEmail,
  renderRoutingEmail,
  renderRecheckEmail,
  renderWaitlistEmail,
} from "@/lib/schmerzcheck/emails-masterclass"
import {
  renderT1WelcomeEmail,
  renderT2ReportEmail,
  renderT3RedFlagEmail,
  renderDripEmail,
  renderWinbackEmail,
} from "@/lib/schmerzcheck/emails"

// Kampagne an die Bestandsleads + der umgebaute Funnel für NEUE Leads.
const CODES = [
  "RT1", "RT2", "RF1", "N1", "OB1", "K1",
  "M1", "M1R", "M2", "M3", "M4", "B1", "B2", "C1R",
  "T1", "T2", "T3", "D1", "D2", "D3", "D4", "D5", "W1",
  "D1S", "D2S", "D4S", // soft-flag-Varianten: „ärztlich abklären" → KEIN Angebot
] as const
type Code = (typeof CODES)[number]

const LABEL: Record<Code, string> = {
  RT1: "RT1 · Routing-Frage an die 69 · KEIN Angebot",
  RF1: "RF1 · An die 45 zu Unrecht Gestoppten · KEIN Angebot",
  N1: "N1 · Nacken/Schulter (51) · Wert-Mail + Warteliste · KEIN Angebot",
  OB1: "OB1 · Oberer Rücken (22) · Wert-Mail + Warteliste · KEIN Angebot",
  K1: "K1 · Knie/Hüfte/Fuß (6) · Wert-Mail + Warteliste · KEIN Angebot",
  RT2: "RT2 · Routing-Erinnerung (Tag 4) · KEIN Angebot",
  M1: "M1 · Kampagne · „Ich habe mein Angebot überarbeitet“",
  M1R: "M1 für RT1-Klicker · anderer Einstieg („mehrere Baustellen“)",
  M2: "M2 · Kampagne · Was die Begleitung bedeutet",
  M3: "M3 · Kampagne · Einwand „Kann ich das nicht allein?“",
  M4: "M4 · Kampagne · Ruhiger Abschluss",
  B1: "B1 · Red-Flag-Brücke · KEIN Angebot",
  B2: "B2 · Red-Flag-Brücke · KEIN Angebot",
  C1R: "C1R · Reaktivierung des offenen Checks",
  T1: "T1 · Neuer Lead · Double-Opt-in",
  T2: "T2 · Neuer Lead · Report + PDF (jetzt Masterclass-Hinweis)",
  T3: "T3 · Neuer Lead · Red-Flag-Stopp (nie ein Angebot)",
  D1: "D1 · Drip · Schmerz ≠ Schaden",
  D2: "D2 · Drip · Das Muster",
  D3: "D3 · Drip · Was die Begleitung bedeutet",
  D4: "D4 · Drip · „Kann ich das nicht allein?“",
  D5: "D5 · Drip · Drei ehrliche Antworten",
  W1: "W1 · Win-back · letzte Mail",
  D1S: "D1 (soft-flag) · „ärztlich abklären“ → KEIN Angebot",
  D2S: "D2 (soft-flag) · „ärztlich abklären“ → KEIN Angebot",
  D4S: "D4 (soft-flag) · „ärztlich abklären“ → KEIN Angebot",
}

function render(code: Code, baseUrl: string): { subject: string; html: string } {
  const common = {
    firstName: "Sabine",
    token: "VORSCHAU-TOKEN",
    baseUrl,
    unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=VORSCHAU`,
  }
  const reportUrl = `${baseUrl}/check/result?t=VORSCHAU`

  if (/^RT[12]$/.test(code)) {
    return renderRoutingEmail({ ...common, step: Number(code.slice(2)) as 1 | 2 })
  }
  if (code === "RF1") {
    return renderRecheckEmail(common)
  }
  if (code === "N1") return renderWaitlistEmail({ ...common, region: "nacken_schulter" })
  if (code === "OB1") return renderWaitlistEmail({ ...common, region: "oberer_ruecken" })
  if (code === "K1") return renderWaitlistEmail({ ...common, region: "knie_huefte_fuss" })
  if (code === "M1R") {
    return renderMasterclassEmail({ ...common, step: 1, reportUrl, viaRouting: true })
  }
  if (/^M[1-4]$/.test(code)) {
    return renderMasterclassEmail({ ...common, step: Number(code.slice(1)) as 1 | 2 | 3 | 4, reportUrl })
  }
  if (/^B[12]$/.test(code)) {
    return renderBridgeEmail({ ...common, step: Number(code.slice(1)) as 1 | 2 })
  }
  if (code === "C1R") {
    return renderReactivationEmail({ ...common, checkUrl: `${baseUrl}/check/start?t=VORSCHAU` })
  }
  if (code === "T1") {
    return {
      subject: "Dein Schmerzcheck ist bereit — starte jetzt",
      html: renderT1WelcomeEmail({ firstName: common.firstName, checkUrl: reportUrl, baseUrl }),
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

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const url = new URL(request.url)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin
  const code = (url.searchParams.get("code") || "").toUpperCase() as Code

  // Einzelne Mail
  if (CODES.includes(code)) {
    const { subject, html } = render(code, baseUrl)
    const page = `<!doctype html><meta charset="utf-8"><title>${code}</title>
      <div style="font-family:system-ui;background:#0f172a;color:#fff;padding:14px 20px;font-size:14px">
        <strong>${LABEL[code]}</strong><br>
        <span style="opacity:.7">Betreff: ${subject}</span>
      </div>${html}`
    return new NextResponse(page, { headers: { "Content-Type": "text/html; charset=utf-8" } })
  }

  // Übersicht — alle Mails untereinander
  const sections = CODES.map((c) => {
    const { subject } = render(c, baseUrl)
    return `<section>
      <h2>${LABEL[c]}</h2>
      <p class="subj"><span>Betreff</span> ${subject}</p>
      <iframe src="/api/dev/mail-preview?code=${c}" title="${c}"></iframe>
    </section>`
  }).join("")

  const page = `<!doctype html><html lang="de"><head><meta charset="utf-8">
  <title>Mail-Vorschau · alle Schmerzcheck-Mails</title>
  <style>
    body{margin:0;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif}
    header{padding:28px 24px;border-bottom:1px solid #1e293b}
    h1{margin:0;font-size:20px}
    header p{margin:6px 0 0;color:#94a3b8;font-size:14px;max-width:70ch;line-height:1.6}
    section{padding:24px;border-bottom:1px solid #1e293b}
    h2{margin:0 0 4px;font-size:15px;color:#fff}
    .subj{margin:0 0 12px;color:#94a3b8;font-size:13px}
    .subj span{display:inline-block;background:#1e293b;color:#cbd5e1;padding:2px 7px;border-radius:5px;margin-right:6px;font-size:11px}
    iframe{width:100%;max-width:640px;height:820px;border:1px solid #334155;border-radius:10px;background:#fff}
  </style></head><body>
  <header>
    <h1>Alle Schmerzcheck-Mails</h1>
    <p><strong>M1–C1R</strong> = einmalige Kampagne an die 521 Bestandsleads.
    <strong>T1–W1</strong> = der laufende Funnel für NEUE Leads, jetzt ebenfalls auf die
    Masterclass umgestellt (vorher: Video-Analyse für 69 €).<br>
    B1/B2 und T3 enthalten bewusst <strong>kein Kaufangebot</strong>. Die Varianten mit „soft-flag“
    zeigen, was ein Lead mit „ärztlich abklären“ sieht — dort darf ebenfalls kein Angebot stehen.</p>
  </header>
  ${sections}
  </body></html>`

  return new NextResponse(page, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
