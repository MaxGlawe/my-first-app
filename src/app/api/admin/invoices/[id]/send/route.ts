/**
 * PROJ-29 — POST /api/admin/invoices/[id]/send
 *
 * Schickt eine Rechnung oder einen Leistungsnachweis als PDF an den Patienten.
 *
 * Bisher gab es das nicht: Der Abrechnungsdialog konnte herunterladen und
 * finalisieren, aber nicht versenden. Wer einem Patienten seine Rechnung geben
 * wollte, musste das PDF laden und von Hand anhängen.
 *
 * Zwei Dinge passieren beim Versand und sind bewusst getrennt:
 *
 *   — `versendet_at` wird gesetzt. Ohne das lässt sich nicht sagen, ob der
 *     Patient den Beleg hat; `status = 'offen'` heisst nur, dass es kein
 *     Entwurf mehr ist.
 *
 *   — Ein Entwurf wird zu `offen`. Was hinausgegangen ist, ist kein Entwurf
 *     mehr.
 *
 * NICHT auf `bezahlt` gesetzt. Das ist eine Aussage über Geld und bleibt eine
 * bewusste Handlung des Behandlers.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf"
import { sendEmail, kopieAdresse } from "@/lib/email"
import type { InvoiceWithItems, PraxisSettings } from "@/types/billing"

export const dynamic = "force-dynamic"

function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige Rechnungs-ID." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: profil } = await svc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profil?.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data: invoice } = await svc
    .from("invoices")
    .select("*, line_items:invoice_line_items (*)")
    .eq("id", id)
    .single()

  if (!invoice) return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })

  if (invoice.status === "storniert") {
    return NextResponse.json(
      { error: "Eine stornierte Rechnung wird nicht versendet." },
      { status: 400 }
    )
  }
  if (!invoice.line_items?.length) {
    return NextResponse.json({ error: "Die Rechnung hat keine Positionen." }, { status: 400 })
  }

  // ── Empfänger ───────────────────────────────────────────────────────────
  const { data: patient } = await svc
    .from("patients")
    .select("email, vorname")
    .eq("id", invoice.patient_id)
    .maybeSingle()

  if (!patient?.email) {
    return NextResponse.json(
      { error: "Für diesen Patienten ist keine E-Mail-Adresse hinterlegt." },
      { status: 422 }
    )
  }

  const { data: praxis } = await svc.from("praxis_settings").select("*").limit(1).maybeSingle()
  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen fehlen." }, { status: 500 })
  }

  const istNachweis = invoice.beleg_art === "leistungsnachweis"
  const bezeichnung = istNachweis ? "Leistungsnachweis" : "Rechnung"

  let pdf: ArrayBuffer
  try {
    pdf = await generateInvoicePdf(invoice as InvoiceWithItems, praxis as PraxisSettings)
  } catch (err) {
    console.error("[invoices/send] PDF:", err)
    return NextResponse.json({ error: "Das PDF konnte nicht erstellt werden." }, { status: 500 })
  }

  const beglichen = istNachweis || invoice.status === "bezahlt"
  const anrede = patient.vorname ? `Hallo ${patient.vorname},` : "Guten Tag,"

  const html =
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;` +
    `max-width:560px;margin:0 auto;padding:20px;color:#1e293b;">` +
    `<div style="border-bottom:3px solid #10b981;padding-bottom:16px;margin-bottom:24px;">` +
    `<h2 style="margin:0;color:#0f172a;">${praxis.praxis_name}</h2>` +
    `<p style="margin:4px 0 0;color:#64748b;font-size:14px;">${praxis.inhaber_name}</p></div>` +
    `<p>${anrede}</p>` +
    `<p>anbei ${istNachweis ? "der Leistungsnachweis" : "die Rechnung"} ` +
    `<strong>${invoice.invoice_number}</strong> über ` +
    `<strong>${euro(Number(invoice.total))}</strong>.</p>` +
    (beglichen
      ? `<p style="background:#ecfdf5;border:1px solid #10b981;border-radius:8px;padding:12px 14px;` +
        `font-size:14px;"><strong>Dieser Betrag ist bereits beglichen.</strong><br>` +
        `${istNachweis ? "Der Nachweis dient Ihren Unterlagen und der Einreichung bei Ihrer Versicherung." : "Bitte nicht überweisen."}</p>`
      : `<p style="font-size:14px;">Die Zahlungsangaben finden Sie auf dem Beleg.</p>`) +
    `<p style="font-size:14px;color:#475569;">Heilkundliche Leistung, umsatzsteuerfrei nach ` +
    `§ 4 Nr. 14a UStG. Ob und in welcher Höhe Ihre Versicherung erstattet, richtet sich nach ` +
    `Ihrem Tarif.</p>` +
    `<p style="font-size:14px;">Bei Fragen antworten Sie einfach auf diese E-Mail.</p>` +
    `<p style="font-size:14px;">Freundliche Grüße<br>${praxis.inhaber_name}</p></div>`

  const res = await sendEmail({
    to: patient.email,
    // Dieselbe stille Kopie wie beim Kostenvoranschlag. Es ist derselbe
    // Vorgang — ein Beleg verlaesst das Haus —, also derselbe Nachweis.
    bcc: kopieAdresse(praxis.email),
    subject: `Ihr ${bezeichnung} ${invoice.invoice_number} — ${praxis.praxis_name}`,
    html,
    attachments: [
      {
        filename: `${bezeichnung}_${invoice.invoice_number}.pdf`,
        content: Buffer.from(pdf),
      },
    ],
  })

  if (!res.success) {
    return NextResponse.json(
      { error: res.error ?? "Die E-Mail konnte nicht versendet werden." },
      { status: 502 }
    )
  }

  // Erst nach erfolgreichem Versand vermerken — ein `versendet_at` auf einem
  // Beleg, der nie ankam, waere schlimmer als gar keiner.
  await svc
    .from("invoices")
    .update({
      versendet_at: new Date().toISOString(),
      ...(invoice.status === "entwurf" ? { status: "offen" } : {}),
    })
    .eq("id", id)

  return NextResponse.json({ ok: true, an: patient.email })
}
