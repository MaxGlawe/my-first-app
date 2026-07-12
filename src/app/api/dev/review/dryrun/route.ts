/**
 * GET /api/dev/review/dryrun — zeigt, was der erste Kampagnen-Lauf senden würde.
 *
 * Ruft den echten Cron im Dry-Run-Modus auf (der sendet nichts) und rendert das
 * Ergebnis lesbar. NUR im Dev-Modus.
 */
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const secret = process.env.CRON_SECRET ?? ""

  const res = await fetch(`${origin}/api/cron/masterclass-campaign?dry=1`, {
    headers: { "x-cron-secret": secret },
    cache: "no-store",
  })
  const data = (await res.json()) as {
    pendingTotal?: number
    wouldSend?: number
    bySegment?: Record<string, number>
    byCode?: Record<string, number>
    recipients?: { email: string; code: string; segment: string }[]
    error?: string
  }

  if (!res.ok || data.error) {
    return new NextResponse(
      `<pre style="font:14px/1.6 monospace;padding:30px;color:#b91c1c">Dry-Run fehlgeschlagen:\n\n${JSON.stringify(
        data,
        null,
        2
      )}</pre>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }

  const rows = (data.recipients ?? [])
    .map(
      (r) => `<tr><td><code>${r.code}</code></td><td>${r.segment}</td><td>${r.email}</td></tr>`
    )
    .join("")

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<title>Dry-Run · Masterclass-Kampagne</title>
<style>
  body{margin:0;background:#F8F5F0;color:#0f172a;font:16px/1.6 system-ui,sans-serif}
  .wrap{max-width:820px;margin:0 auto;padding:40px 24px 80px}
  h1{font-size:26px;margin:0 0 6px}
  .sub{color:#64748b;margin:0 0 28px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:28px}
  .stat{background:#fff;border:1px solid #e7e1d6;border-radius:12px;padding:16px 18px}
  .stat b{display:block;font-size:26px;line-height:1.2}
  .stat span{color:#64748b;font-size:13px}
  .ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:12px;padding:14px 18px;margin-bottom:24px;font-size:14.5px}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e7e1d6;border-radius:12px;overflow:hidden}
  th,td{text-align:left;padding:10px 16px;border-bottom:1px solid #f1ece2;font-size:14px}
  th{background:#fbfaf6;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#64748b}
  tr:last-child td{border-bottom:0}
  code{background:#f1ece2;padding:1px 6px;border-radius:5px;font-size:13px}
</style></head><body><div class="wrap">
<h1>Dry-Run — es wurde nichts gesendet</h1>
<p class="sub">Live gegen die echten Leads gerechnet. E-Mail-Adressen sind maskiert.</p>

<div class="stats">
  <div class="stat"><b>${data.pendingTotal ?? 0}</b><span>fällig gesamt</span></div>
  <div class="stat"><b>${data.wouldSend ?? 0}</b><span>im ersten Lauf (Drosselung 30)</span></div>
  <div class="stat"><b>0</b><span>Segment D (ohne Einwilligung)</span></div>
</div>

<div class="ok">
  <strong>Segment D bekommt nichts</strong> — die 210 Leads ohne Double-Opt-in tauchen in keiner
  Empfängerliste auf. Segment B (Red-Flag) startet erst 2 Tage nach dem ersten M1 und bekommt nur
  die Brücken-Mails ohne Angebot.
</div>

<p><strong>Nach Segment:</strong> <code>${JSON.stringify(data.bySegment ?? {})}</code><br>
<strong>Nach Mail:</strong> <code>${JSON.stringify(data.byCode ?? {})}</code></p>

<table>
  <thead><tr><th>Mail</th><th>Segment</th><th>Empfänger</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</div></body></html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
