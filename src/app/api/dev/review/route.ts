/**
 * GET /api/dev/review — Review-Übersicht für die Masterclass-Umstellung.
 *
 * Eine Seite, von der aus alles Neue durchklickbar ist: Mails, Ergebnisseite je
 * Ergebnis-Typ, Salespage, Türsteher-Seiten. NUR im Dev-Modus (404 in Produktion).
 *
 * Die Report-Links werden hier live signiert (LEAD_LINK_SECRET), damit sie auf
 * echte Leads zeigen und nicht auf Attrappen — man sieht also genau das, was der
 * Empfänger sehen würde.
 */
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createLeadToken } from "@/lib/lead-jwt"

const CATEGORY_LABEL: Record<string, string> = {
  chronic_severe: "Chronisch, stark",
  chronic_moderate: "Chronisch, moderat",
  acute_severe: "Akut, stark",
  acute_moderate: "Akut, moderat",
  mild: "Mild",
  needs_physician_assessment: "Ärztlich abklären (soft-flag)",
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const origin = new URL(request.url).origin
  const supabase = createSupabaseServiceClient()

  // Je einen echten Lead pro Ergebnis-Typ heraussuchen.
  const { data: results } = await supabase
    .from("schmerzcheck_results")
    .select("lead_id, result_category, soft_flag")
    .eq("status", "completed")
    .limit(500)

  const seen = new Set<string>()
  const reportLinks: { category: string; href: string; soft: boolean }[] = []
  for (const r of results ?? []) {
    const cat = r.result_category as string
    if (!cat || seen.has(cat)) continue
    seen.add(cat)
    reportLinks.push({
      category: cat,
      href: `${origin}/check/result?t=${encodeURIComponent(createLeadToken(r.lead_id))}`,
      soft: r.soft_flag === true || cat === "needs_physician_assessment",
    })
  }

  // Einmalige Kampagne an die Bestandsleads
  const mails = [
    ["M1", "Segment A · „Ich habe mein Angebot überarbeitet“"],
    ["M2", "Segment A · Was die Begleitung bedeutet"],
    ["M3", "Segment A · Einwand „Kann ich das nicht allein?“"],
    ["M4", "Segment A · Ruhiger Abschluss, kein Druck"],
    ["B1", "Segment B · Red-Flag-Brücke — KEIN Angebot"],
    ["B2", "Segment B · Letzte Nachfrage — KEIN Angebot"],
    ["C1R", "Segment C · Reaktivierung des offenen Checks"],
  ]

  // Laufender Funnel für NEUE Leads — jetzt ebenfalls auf die Masterclass umgestellt
  const funnelMails = [
    ["T1", "Double-Opt-in (unverändert)"],
    ["T2", "Report + PDF — Hinweis jetzt Masterclass statt Video-Analyse"],
    ["T3", "Red-Flag-Stopp — nie ein Angebot (unverändert)"],
    ["D1", "Drip +1d · Schmerz ≠ Schaden"],
    ["D2", "Drip +2d · Das Muster"],
    ["D3", "Drip +3d · Was die Begleitung bedeutet"],
    ["D4", "Drip +5d · „Kann ich das nicht allein?“"],
    ["D5", "Drip +7d · Drei ehrliche Antworten"],
    ["W1", "Win-back +9d · letzte Mail"],
    ["D1S", "D1 als soft-flag („ärztlich abklären“) — KEIN Angebot"],
    ["D2S", "D2 als soft-flag — KEIN Angebot"],
    ["D4S", "D4 als soft-flag — KEIN Angebot"],
  ]

  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Review · Masterclass-Umstellung</title>
<style>
  :root{--paper:#F8F5F0;--ink:#0f172a;--muted:#64748b;--line:#e7e1d6;--green:#2C3E2D;--amber:#b45309}
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,-apple-system,sans-serif}
  .wrap{max-width:880px;margin:0 auto;padding:40px 24px 80px}
  h1{font-size:30px;margin:0 0 6px;letter-spacing:-.02em}
  .sub{color:var(--muted);margin:0 0 32px;max-width:62ch}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.16em;color:var(--green);margin:38px 0 14px}
  .card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:6px 0;overflow:hidden}
  a.row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;text-decoration:none;color:var(--ink);border-bottom:1px solid #f1ece2}
  a.row:last-child{border-bottom:0}
  a.row:hover{background:#fbfaf6}
  .t{font-weight:600}
  .d{color:var(--muted);font-size:13.5px;margin-top:2px}
  .arrow{color:var(--green);font-weight:700;flex-shrink:0}
  .tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:8px;vertical-align:middle}
  .tag-safe{background:#ecfdf5;color:#047857}
  .tag-warn{background:#fffbeb;color:var(--amber)}
  .note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;color:#78350f;font-size:14px;margin:14px 0 0}
  ul{margin:10px 0 0;padding-left:20px;color:var(--muted);font-size:14.5px}
  li{margin:5px 0}
  code{background:#f1ece2;padding:1px 6px;border-radius:5px;font-size:13px}
</style></head><body><div class="wrap">

<h1>Review — Masterclass-Umstellung</h1>
<p class="sub">Alles Neue an einem Ort. Es ist noch <strong>nichts versendet</strong> und nichts deployt —
die Kampagne liegt bereit, wartet aber auf deine Freigabe.</p>

<h2>0 · Den Funnel selbst durchspielen</h2>
<div class="card">
  <a class="row" href="/api/dev/funnel" target="_blank">
    <span><span class="t">Funnel-Durchlauf starten</span><span class="tag tag-safe">sicher</span>
    <div class="d">Legt einen Test-Lead an, der garantiert nie angemailt werden kann → Check → Report → Angebot</div></span><span class="arrow">→</span></a>
</div>
<div class="note"><strong>Achtung:</strong> Der Dev-Server hängt an der <strong>Produktions-Datenbank</strong>
und am echten SMTP. Füll das Formular auf <code>/schmerzcheck</code> <strong>nicht</strong> selbst aus —
das legt einen echten Lead an, der in der Kampagne landet und eine echte Mail bekommt.
Nutz stattdessen den Durchlauf oben.</div>

<h2>1 · Kampagne an die 521 Bestandsleads</h2>
<div class="card">
  ${mails
    .map(
      ([code, desc]) => `<a class="row" href="/api/dev/mail-preview?code=${code}" target="_blank">
      <span><span class="t">${code}</span>${
        code.startsWith("B")
          ? '<span class="tag tag-warn">kein Angebot</span>'
          : '<span class="tag tag-safe">Verkauf</span>'
      }<div class="d">${desc}</div></span><span class="arrow">→</span></a>`
    )
    .join("")}
</div>
<div class="note"><strong>Worauf achten:</strong> B1 und B2 dürfen nirgends die Masterclass bewerben —
sie fragen nur nach der ärztlichen Abklärung. Wenn dort ein Kauf-Button auftaucht, ist etwas kaputt.</div>

<h2>2 · Funnel für NEUE Leads — umgestellt auf die Masterclass</h2>
<div class="card">
  ${funnelMails
    .map(
      ([code, desc]) => `<a class="row" href="/api/dev/mail-preview?code=${code}" target="_blank">
      <span><span class="t">${code.replace(/S$/, " (soft-flag)")}</span>${
        code.endsWith("S") || code === "T3" || code === "T1"
          ? '<span class="tag tag-warn">kein Angebot</span>'
          : '<span class="tag tag-safe">Verkauf</span>'
      }<div class="d">${desc}</div></span><span class="arrow">→</span></a>`
    )
    .join("")}
  <a class="row" href="/api/dev/mail-preview" target="_blank">
    <span><span class="t">Alle Mails untereinander</span><div class="d">Zum Durchscrollen am Stück</div></span><span class="arrow">→</span></a>
</div>
<div class="note"><strong>Das war der Teil, der noch fehlte:</strong> D1–D5, T2 und W1 haben bis eben
die Video-Analyse für 69 € beworben. Hätten die Anzeigen wieder angeschaltet, wären neue Leads ins
alte Angebot gelaufen. Die soft-flag-Varianten zeigen, was jemand mit „ärztlich abklären“ sieht —
dort darf ebenfalls kein Angebot stehen.</div>

<h2>3 · Ergebnisseite — je Ergebnis-Typ ein echter Lead</h2>
<div class="card">
  ${reportLinks
    .map(
      (r) => `<a class="row" href="${r.href}" target="_blank">
      <span><span class="t">${CATEGORY_LABEL[r.category] ?? r.category}</span>${
        r.soft ? '<span class="tag tag-warn">kein Angebot</span>' : '<span class="tag tag-safe">Angebot</span>'
      }<div class="d">${r.category}</div></span><span class="arrow">→</span></a>`
    )
    .join("")}
</div>
<div class="note"><strong>Worauf achten:</strong> Der Masterclass-Block ersetzt oben den alten
Video-Analyse-CTA. Beim soft-flag-Typ („ärztlich abklären“) darf <em>kein</em> Angebot erscheinen.
Unten in Sektion 03 ist die Karten-Paywall jetzt auf die Masterclass umgestellt.</div>

<h2>4 · Salespage</h2>
<div class="card">
  <a class="row" href="/kurse/chronischer-kreuzschmerz" target="_blank">
    <span><span class="t">Masterclass-Salespage</span><div class="d">Preisblock, Klarna, Sektion „Deine Begleitung“, FAQ</div></span><span class="arrow">→</span></a>
</div>
<ul>
  <li>Preisblock: <code>399 €</code> mit Anker, direkt darunter gleichwertig „inkl. 3 Monate Begleitung“</li>
  <li>Klarna als eigener Kasten <strong>unter</strong> dem Kaufen-Button: „3 × 133 € — ohne Aufpreis“</li>
  <li>„Das bekommst du“: Begleitung steht jetzt an <strong>Position 1</strong>, nicht mehr am Ende</li>
  <li>Neue Sektion „Deine Begleitung“ mit App-Mockup · neue FAQ mit den 3 Fragen</li>
  <li>Auf dem Handy prüfen — die Zielgruppe kommt fast nur mobil</li>
</ul>

<h2>5 · Der Red-Flag-Türsteher</h2>
<div class="card">
  <a class="row" href="/schmerzcheck/abklaerung?s=cleared" target="_blank">
    <span><span class="t">Antwort „Ja, ich war beim Arzt“</span><div class="d">Lead wandert in Segment A → bekommt ab dann die M-Sequenz</div></span><span class="arrow">→</span></a>
  <a class="row" href="/schmerzcheck/abklaerung?s=not_yet" target="_blank">
    <span><span class="t">Antwort „Noch nicht“</span><div class="d">Kein Angebot. Nur die Bitte, es nachzuholen + Notfall-Hinweise</div></span><span class="arrow">→</span></a>
  <a class="row" href="/schmerzcheck/abklaerung?s=expired" target="_blank">
    <span><span class="t">Link abgelaufen</span><div class="d">Fallback</div></span><span class="arrow">→</span></a>
</div>

<h2>6 · Was der erste Lauf senden würde</h2>
<div class="card">
  <a class="row" href="/api/dev/review/dryrun" target="_blank">
    <span><span class="t">Dry-Run (sendet nichts)</span><div class="d">Empfängerliste + Segmente, live gegen die echten Leads</div></span><span class="arrow">→</span></a>
</div>

</div></body></html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
