/**
 * PROJ-26: Rechnung zum Praxis-OS-Programm.
 *
 * WICHTIG — warum hier bewusst ein ENTWURF entsteht und nichts versendet wird:
 *
 * Das Briefing sieht eine Heilpraktiker-Rechnung mit Untersuchung, Beratung und
 * Behandlung als Einzelpositionen vor. Welche GebüH-Ziffern das im konkreten
 * Fall sind und wie sich der Betrag auf sie verteilt, ist eine fachliche und
 * abrechnungsrechtliche Entscheidung des Behandlers — keine, die Code treffen
 * darf. Erschwerend kommt hinzu: bezahlt wird am Tag 0, erbracht werden die
 * Leistungen über 90 Tage. Positionen für noch nicht erbrachte Behandlungen
 * automatisch auszuweisen wäre schlicht falsch.
 *
 * Deshalb legt diese Funktion die Rechnung als `entwurf` mit den
 * Klartext-Positionen des Vertrages an und benachrichtigt den Behandler. Die
 * GebüH-Ziffern setzt er im bestehenden Rechnungs-Editor
 * (/os/admin/billing/<id>) und versendet von dort.
 *
 * Umsatzsteuer: heilkundliche Leistung nach § 4 Nr. 14a UStG — steuerfrei.
 * Die Rechnung trägt deshalb keinen Steuerausweis.
 */

import type { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendEmail } from "@/lib/email"
import { formatEuro } from "@/lib/programm"
import type { Leistung } from "@/types/contract"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "physiotherapieglawe@gmx.de"

export interface ProgrammInvoiceParams {
  patientId: string
  /** Therapeut, der das Angebot erstellt hat — wird `created_by`. */
  createdBy: string
  contractId: string
  contractNumber: string
  /** Tatsächlich gezahlter Betrag (Restbetrag nach Anrechnung). */
  amount: number
  leistungen: Leistung[]
  /** Idempotenz: dieselbe Stripe-Session erzeugt nie zwei Rechnungen. */
  stripeSessionId: string
}

export async function createProgrammInvoiceDraft(
  supabase: ServiceClient,
  params: ProgrammInvoiceParams
): Promise<{ ok: boolean; invoiceNumber?: string; skipped?: boolean; error?: string }> {
  const noteAnchor = `stripe_session:${params.stripeSessionId}`

  // ── Idempotenz ────────────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("invoices")
    .select("id, invoice_number")
    .eq("notes", noteAnchor)
    .limit(1)

  if (existing?.length) {
    return { ok: true, skipped: true, invoiceNumber: existing[0].invoice_number }
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id, vorname, nachname, email, strasse, plz, ort")
    .eq("id", params.patientId)
    .single()

  if (!patient) return { ok: false, error: "Patient nicht gefunden." }

  const { data: praxis } = await supabase.from("praxis_settings").select("*").limit(1).single()
  if (!praxis) return { ok: false, error: "Praxis-Einstellungen fehlen." }

  const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number")
  if (!invoiceNumber) return { ok: false, error: "Rechnungsnummer konnte nicht erzeugt werden." }

  const today = new Date().toISOString().split("T")[0]
  const due = new Date()
  due.setDate(due.getDate() + 14)

  const patientName = `${patient.vorname} ${patient.nachname}`
  const patientAddress = [patient.strasse, `${patient.plz ?? ""} ${patient.ort ?? ""}`.trim()]
    .filter(Boolean)
    .join("\n")

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber as string,
      patient_id: patient.id,
      created_by: params.createdBy,
      invoice_date: today,
      treatment_date: today,
      due_date: due.toISOString().split("T")[0],
      patient_name: patientName,
      patient_address: patientAddress || null,
      praxis_name: praxis.praxis_name,
      praxis_address: `${praxis.strasse}\n${praxis.plz} ${praxis.ort}`,
      praxis_steuernr: praxis.steuernummer,
      subtotal: params.amount,
      total: params.amount,
      // Der Anker trägt die Idempotenz UND den Bezug zum Vertrag.
      notes: noteAnchor,
      status: "entwurf",
    })
    .select("id")
    .single()

  if (invoiceError || !invoice) {
    console.error("[programm-invoice] Rechnung fehlgeschlagen:", invoiceError?.message)
    return { ok: false, error: invoiceError?.message ?? "Rechnung konnte nicht angelegt werden." }
  }

  // Positionen im Klartext aus dem Vertrag. Nur die kostenpflichtige Position
  // wird berechnet; die bereits beglichene Konsultation erscheint als
  // Null-Position, damit die Anrechnung auf der Rechnung sichtbar bleibt.
  const bezahlte = params.leistungen.filter((l) => l.preis > 0)
  const rows = bezahlte.map((l, i) => ({
    invoice_id: invoice.id,
    sort_order: i,
    gebueh_ziffer: null as string | null,
    beschreibung: l.details ? `${l.beschreibung} (${l.details})` : l.beschreibung,
    anzahl: 1,
    einzelpreis: l.preis,
    gesamtpreis: l.preis,
  }))

  const { error: itemsError } = await supabase.from("invoice_line_items").insert(rows)
  if (itemsError) {
    console.error("[programm-invoice] Positionen fehlgeschlagen:", itemsError.message)
    return { ok: false, error: itemsError.message }
  }

  void notifyTherapist({
    invoiceNumber: invoiceNumber as string,
    invoiceId: invoice.id as string,
    patientName,
    amount: params.amount,
    contractNumber: params.contractNumber,
  }).catch((err) => console.error("[programm-invoice] Benachrichtigung fehlgeschlagen:", err))

  return { ok: true, invoiceNumber: invoiceNumber as string }
}

async function notifyTherapist(args: {
  invoiceNumber: string
  invoiceId: string
  patientName: string
  amount: number
  contractNumber: string
}): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wwwpraxis-os.com"

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Rechnungsentwurf ${args.invoiceNumber} — ${args.patientName}`,
    html: `
      <p style="font-family:sans-serif;font-size:14px">
        Zahlung eingegangen. Die Rechnung liegt als <strong>Entwurf</strong> bereit.
      </p>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td><strong>Patient</strong></td><td>${args.patientName}</td></tr>
        <tr><td><strong>Betrag</strong></td><td>${formatEuro(args.amount)}</td></tr>
        <tr><td><strong>Vertrag</strong></td><td>${args.contractNumber}</td></tr>
      </table>
      <p style="font-family:sans-serif;font-size:14px">
        Noch zu tun: GebüH-Ziffern für Untersuchung, Beratung und Behandlung setzen,
        dann versenden.<br/>
        <a href="${siteUrl}/os/admin/billing/${args.invoiceId}">Rechnung öffnen &rarr;</a>
      </p>
      <p style="font-family:sans-serif;font-size:13px;color:#64748b">
        Die Rechnung wird bewusst nicht automatisch versendet — die Ziffern und ihre
        Aufteilung sind eine fachliche Entscheidung, und die Leistungen werden über
        90 Tage erbracht.
      </p>
    `,
  })
}
