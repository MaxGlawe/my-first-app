/**
 * GET /api/dev/funnel — den Schmerzcheck-Funnel gefahrlos durchspielen.
 *
 * NUR im Dev-Modus (404 in Produktion).
 *
 * WARUM ES DIESE ROUTE GIBT: Der lokale Dev-Server hängt an der PRODUKTIONS-
 * Datenbank und am echten SMTP. Wer einfach das Formular auf /schmerzcheck
 * ausfüllt, legt einen echten Lead an — der landet in Segment C/A und bekommt
 * damit echte Kampagnen-Mails. Genau das soll hier nicht passieren.
 *
 * Diese Route legt einen Test-Lead an und setzt ihn SOFORT auf die Suppression-
 * Liste. Damit ist er in jeder Empfängerliste ausgeschlossen — der Drip-Cron und
 * der Kampagnen-Cron überspringen ihn beide. Zusätzlich bekommt er eine eigene
 * `source` ('dev_walkthrough'), die der Kampagnen-Cron ohnehin ausfiltert.
 * Doppelt abgesichert, weil ein versehentlicher Versand an eine Fantasie-Adresse
 * die Zustellbarkeit der Domain beschädigen würde.
 */
import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"

export const DEV_LEAD_SOURCE = "dev_walkthrough"

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const supabase = createSupabaseServiceClient()

  const stamp = Date.now()
  const email = `testlauf-${stamp}@praxis-os.invalid` // .invalid → existiert per RFC nie
  const emailHash = createHash("sha256").update(email.toLowerCase()).digest("hex")

  const { data: lead, error } = await supabase
    .from("schmerzcheck_leads")
    .insert({
      first_name: "Testlauf",
      email,
      source: DEV_LEAD_SOURCE,
      status: "awaiting_check",
      // Double-Opt-in vorweggenommen, damit der Check sofort startet — im echten
      // Funnel passiert das mit dem Klick auf den Link in der T1-Mail.
      consent_status: "confirmed",
      consent_confirmed_at: new Date().toISOString(),
      utm_source: "dev",
      utm_campaign: "walkthrough",
    })
    .select("id")
    .single()

  if (error || !lead) {
    return new NextResponse(
      `<pre style="padding:30px;font:14px monospace;color:#b91c1c">Test-Lead konnte nicht angelegt werden:\n\n${error?.message}</pre>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }

  // SOFORT stummschalten — vor allem anderen. Ab hier kann dieser Lead in keiner
  // Empfängerliste mehr auftauchen, egal was danach passiert.
  await supabase
    .from("schmerzcheck_unsubscribes")
    .upsert({ email_hash: emailHash, reason: "dev_test" }, { onConflict: "email_hash" })

  const token = createLeadToken(lead.id)
  const t = encodeURIComponent(token)

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Funnel durchspielen</title>
<style>
  body{margin:0;background:#F8F5F0;color:#0f172a;font:16px/1.6 system-ui,sans-serif}
  .wrap{max-width:760px;margin:0 auto;padding:40px 24px 80px}
  h1{font-size:28px;margin:0 0 6px;letter-spacing:-.02em}
  .sub{color:#64748b;margin:0 0 24px}
  .safe{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:12px;padding:14px 18px;font-size:14px;margin-bottom:26px}
  .step{background:#fff;border:1px solid #e7e1d6;border-radius:14px;padding:18px 20px;margin-bottom:12px;display:flex;gap:16px;align-items:flex-start}
  .n{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#2C3E2D;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
  .step h3{margin:2px 0 4px;font-size:16px}
  .step p{margin:0 0 10px;color:#64748b;font-size:14px}
  a.btn{display:inline-block;background:#2C3E2D;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 18px;border-radius:10px}
  a.btn.ghost{background:#fff;color:#2C3E2D;border:1px solid #e7e1d6}
  code{background:#f1ece2;padding:1px 6px;border-radius:5px;font-size:12.5px;word-break:break-all}
  .meta{margin-top:26px;color:#94a3b8;font-size:13px}
</style></head><body><div class="wrap">

<h1>Schmerzcheck-Funnel durchspielen</h1>
<p class="sub">Frischer Test-Lead angelegt — <code>${email}</code></p>

<div class="safe">
  <strong>Dieser Lead kann nicht angemailt werden.</strong> Er steht auf der Suppression-Liste und hat
  eine eigene <code>source</code>. Drip-Cron und Kampagnen-Cron überspringen ihn beide.
  Die Adresse endet auf <code>.invalid</code> — eine Domain, die per Standard nie existiert.
</div>

<div class="step">
  <span class="n">1</span>
  <div>
    <h3>Landingpage</h3>
    <p>Das, was ein Meta-Klick zuerst sieht. <strong>Formular hier nicht absenden</strong> — das legt einen echten Lead an.</p>
    <a class="btn ghost" href="/schmerzcheck" target="_blank">Landingpage ansehen</a>
  </div>
</div>

<div class="step">
  <span class="n">2</span>
  <div>
    <h3>Check starten</h3>
    <p>Im echten Funnel kommt man hier über den Link in der T1-Mail hin (das ist zugleich der Double-Opt-in).</p>
    <a class="btn" href="/check/start?t=${t}" target="_blank">Check starten →</a>
  </div>
</div>

<div class="step">
  <span class="n">3</span>
  <div>
    <h3>Die 15 Fragen</h3>
    <p>Zwei Wege lohnen sich: einmal <strong>ohne</strong> Warnzeichen (führt zum Report + Masterclass-Angebot)
    und einmal <strong>mit</strong> einem Warnzeichen (z.B. „Taubheit im Sattelbereich“) — dann greift der
    Red-Flag-Stopp und es gibt <strong>kein</strong> Angebot. Für den zweiten Durchlauf einfach diese Seite neu laden.</p>
  </div>
</div>

<div class="step">
  <span class="n">4</span>
  <div>
    <h3>Report + Angebot</h3>
    <p>Am Ende landest du automatisch hier. Der Masterclass-Block steht oben, wo früher die Video-Analyse war.</p>
    <a class="btn ghost" href="/check/result?t=${t}" target="_blank">Report direkt öffnen</a>
    <a class="btn ghost" href="/api/check/report.pdf?t=${t}" target="_blank">PDF ansehen</a>
  </div>
</div>

<div class="step">
  <span class="n">5</span>
  <div>
    <h3>Weiter zum Angebot</h3>
    <p>Der CTA im Report führt über den getrackten Redirect auf die Salespage.</p>
    <a class="btn ghost" href="/kurse/chronischer-kreuzschmerz" target="_blank">Salespage</a>
  </div>
</div>

<p class="meta">
  Lead-ID: <code>${lead.id}</code><br>
  Neuen Durchlauf starten: diese Seite einfach neu laden.<br>
  Zurück zur <a href="/api/dev/review">Review-Übersicht</a>.
</p>

</div></body></html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
