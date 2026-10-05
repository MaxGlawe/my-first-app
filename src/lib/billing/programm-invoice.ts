/**
 * PROJ-26/29: Die Bezahlrechnung zum Praxis-OS-Programm.
 *
 * Dies ist der EINE Beleg, der Umsatz ist. Er entsteht mit dem Zahlungseingang
 * und trägt den vollen Programmpreis — auch den Teil, der schon bei der
 * Buchung der Konsultation gezahlt wurde. Beides zusammen ist das Honorar.
 *
 * Was hier NICHT mehr passiert (Stand 27.09.2026):
 *
 *   — Kein Entwurf mehr. Das Geld ist da, der Inhalt steht im Vertrag; es gibt
 *     nichts zu entscheiden. Ein Entwurf, der nie freigegeben wird, ist ein
 *     Umsatz, der nie in den Büchern steht.
 *
 *   — Keine GebüH-Ziffern. Die stehen auf den drei Leistungsnachweisen, die
 *     der Rechnungslauf später erzeugt (`cron/programm-rechnungen`) — je einer
 *     über das, was in dem Monat wirklich stattgefunden hat. Sie sind für die
 *     Versicherung und zählen ausdrücklich NICHT als Umsatz.
 *
 *   — Keine Mail. Über den Verkauf informiert bereits `programm-aktivierung`.
 *
 * Umsatzsteuer: heilkundliche Leistung nach § 4 Nr. 14a UStG — steuerfrei.
 * Die Rechnung trägt deshalb keinen Steuerausweis.
 */

import type { createSupabaseServiceClient } from "@/lib/supabase-service"
import type { Leistung } from "@/types/contract"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
}

function datum(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

/**
 * Der Vermerk auf der Bezahlrechnung.
 *
 * Er muss die geteilte Zahlung erklären, sonst sieht der Patient eine Rechnung
 * über 299 €, erinnert sich an 230 € auf seinem Kontoauszug und ruft an.
 *
 * „Bitte nicht überweisen" steht hier bewusst NICHT: Das sagt das PDF schon in
 * einem eigenen, hervorgehobenen Kasten. Zweimal derselbe Satz auf einem Blatt
 * liest sich wie ein Fehler.
 *
 * Der Stripe-Anker hängt hinten dran, damit die alte Idempotenzprüfung
 * weiter greift.
 */
function vermerk(
  p: {
    gesamtpreis: number
    bereitsBeglichen: number
    gezahltJetzt: number
    /** Gesondert gestellte Konsultationsrechnung, falls es sie gibt. */
    konsultationsrechnung?: { nummer: string; betrag: number } | null
  },
  anker: string
): string {
  const heute = datum(new Date())
  const k = p.konsultationsrechnung
  const zeilen = [
    // Drei Faelle, und der Patient muss in jedem wiederfinden, was von seinem
    // Konto abgegangen ist.
    k
      ? `Vollständig beglichen am ${heute}. Die Videokonsultation wurde bereits mit ` +
        `Rechnung ${k.nummer} über ${euro(k.betrag)} gesondert abgerechnet; beide Rechnungen ` +
        `zusammen ergeben ${euro(p.gezahltJetzt + k.betrag)}.`
      : p.bereitsBeglichen > 0
      ? `Vollständig beglichen: ${euro(p.bereitsBeglichen)} bei der Buchung der Videokonsultation, ` +
        `${euro(p.gezahltJetzt)} am ${heute}.`
      : `Vollständig beglichen am ${heute}.`,
    `Die Aufstellung der einzelnen Leistungen nach dem Gebührenverzeichnis für Heilpraktiker ` +
      `folgt in drei monatlichen Leistungsnachweisen zu dieser Rechnung.`,
    anker,
  ]
  return zeilen.join("\n\n")
}

export interface ProgrammInvoiceParams {
  patientId: string
  /** Therapeut, der das Angebot erstellt hat — wird `created_by`. */
  createdBy: string
  contractId: string
  contractNumber: string
  /** Der volle Programmpreis — das ist der Rechnungsbetrag. */
  gesamtpreis: number
  /** Bei der Buchung bereits gezahlt (Konsultation). Nur für den Vermerk. */
  bereitsBeglichen: number
  /** Heute per Stripe eingegangen. Nur für den Vermerk. */
  gezahltJetzt: number
  leistungen: Leistung[]
  /** Idempotenz: dieselbe Stripe-Session erzeugt nie zwei Rechnungen. */
  stripeSessionId: string
}

/** Die gesondert gestellte Konsultationsrechnung dieses Patienten, falls vorhanden. */
async function konsultationsrechnungSuchen(
  supabase: ServiceClient,
  patientId: string
): Promise<{ id: string; nummer: string; betrag: number } | null> {
  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, total, status")
    .eq("patient_id", patientId)
    .not("konsultation_call_id", "is", null)
    .neq("status", "storniert")
    .order("treatment_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  return {
    id: data.id as string,
    nummer: data.invoice_number as string,
    betrag: Number(data.total),
  }
}

export async function createProgrammBezahlrechnung(
  supabase: ServiceClient,
  params: ProgrammInvoiceParams
): Promise<{ ok: boolean; invoiceNumber?: string; skipped?: boolean; error?: string }> {
  const noteAnchor = `stripe_session:${params.stripeSessionId}`

  // ── Idempotenz ────────────────────────────────────────────────────────────
  //
  // Zuerst über den Vertrag: Je Programm gibt es genau EINE Bezahlrechnung,
  // egal wie oft Stripe das Ereignis wiederholt. Das ist robuster als der alte
  // Weg über den Notiz-Anker, weil die Notiz jetzt auch lesbaren Text trägt.
  const { data: schonDa } = await supabase
    .from("invoices")
    .select("id, invoice_number")
    .eq("programm_contract_id", params.contractId)
    .eq("beleg_art", "rechnung")
    .limit(1)

  if (schonDa?.length) {
    return { ok: true, skipped: true, invoiceNumber: schonDa[0].invoice_number }
  }

  // Und weiterhin über den alten Anker — Rechnungen von vor dem 27.09.2026
  // tragen kein `programm_contract_id` und würden sonst ein zweites Mal
  // entstehen, falls Stripe eine alte Session wiederholt.
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
  // Bezahlt ist bezahlt: Ein Fälligkeitsdatum in der Zukunft auf einer schon
  // beglichenen Rechnung liest sich wie eine Zahlungsaufforderung.
  const due = new Date()

  // ── Anrechnung einer gesondert gestellten Konsultationsrechnung ─────────
  //
  // Der Fall „erst nur die Konsultation, spaeter doch das Programm": Dann gibt
  // es bereits eine Rechnung ueber 69 EUR. Diese hier darf dann nur noch den
  // Rest tragen — sonst stuenden 69 + 299 = 368 EUR in den Buechern fuer ein
  // 299-EUR-Programm.
  // Gibt es sie, traegt diese Rechnung nur noch das, was Stripe wirklich
  // eingezogen hat. Nicht „Programmpreis minus Konsultationsrechnung": Hat der
  // Behandler beim Angebot vergessen, die Konsultation anzurechnen, hat der
  // Patient den vollen Preis gezahlt — dann muss der Beleg das auch zeigen.
  // Ein Beleg bildet ab, was geflossen ist, nicht was fliessen sollte.
  const konsultationsrechnung = await konsultationsrechnungSuchen(supabase, patient.id)
  const rechnungsbetrag = konsultationsrechnung ? params.gezahltJetzt : params.gesamtpreis

  if (rechnungsbetrag <= 0) {
    console.error(
      `[programm-invoice] Rechnungsbetrag waere ${rechnungsbetrag} EUR — keine Rechnung angelegt.`
    )
    return { ok: false, error: "Es bleibt kein Betrag zu berechnen." }
  }

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
      subtotal: rechnungsbetrag,
      total: rechnungsbetrag,
      notes: vermerk({ ...params, konsultationsrechnung }, noteAnchor),
      // Das Geld ist eingegangen — alles andere wäre eine Rechnung, die auf
      // eine Zahlung wartet, die es längst gab.
      status: "bezahlt",
      paid_at: new Date().toISOString(),
      beleg_art: "rechnung",
      programm_contract_id: params.contractId,
    })
    .select("id")
    .single()

  if (invoiceError || !invoice) {
    console.error("[programm-invoice] Rechnung fehlgeschlagen:", invoiceError?.message)
    return { ok: false, error: invoiceError?.message ?? "Rechnung konnte nicht angelegt werden." }
  }

  // Positionen im Klartext aus dem Vertrag.
  //
  // Wurde die Konsultation gesondert berechnet, erscheint sie hier als
  // ABZUG — sichtbar, nicht weggerechnet. Der Patient soll den Programmpreis
  // sehen und daneben, was davon schon auf einer anderen Rechnung steht.
  const bezahlte = params.leistungen.filter((l) => l.preis > 0)
  const rows: Array<{
    invoice_id: string
    sort_order: number
    gebueh_ziffer: string | null
    beschreibung: string
    anzahl: number
    einzelpreis: number
    gesamtpreis: number
  }> = bezahlte.map((l, i) => ({
    invoice_id: invoice.id as string,
    sort_order: i,
    gebueh_ziffer: null,
    beschreibung: l.details ? `${l.beschreibung} (${l.details})` : l.beschreibung,
    anzahl: 1,
    einzelpreis: l.preis,
    gesamtpreis: l.preis,
  }))

  if (konsultationsrechnung) {
    // Die Hauptposition traegt den Programmpreis; der Abzug macht sichtbar,
    // dass ein Teil davon schon auf einer anderen Rechnung steht. Beide Zeilen
    // zusammen ergeben den Betrag im Kopf.
    const abzug = Math.round((params.gesamtpreis - rechnungsbetrag) * 100) / 100
    if (abzug !== 0) {
      rows.push({
        invoice_id: invoice.id as string,
        sort_order: rows.length,
        gebueh_ziffer: null,
        beschreibung:
          `Abzüglich gesondert berechneter Videokonsultation ` +
          `(Rechnung ${konsultationsrechnung.nummer})`,
        anzahl: 1,
        einzelpreis: -abzug,
        gesamtpreis: -abzug,
      })
    }
  }

  const { error: itemsError } = await supabase.from("invoice_line_items").insert(rows)
  if (itemsError) {
    console.error("[programm-invoice] Positionen fehlgeschlagen:", itemsError.message)
    return { ok: false, error: itemsError.message }
  }


  return { ok: true, invoiceNumber: invoiceNumber as string }
}
