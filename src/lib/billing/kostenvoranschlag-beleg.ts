/**
 * PROJ-29 — Aus einer Zeile `kostenvoranschlaege` wird ein Beleg.
 *
 * An einer Stelle, weil es zwei Abnehmer gibt: die PDF-Route zum Ansehen und
 * die Versand-Route für die Mail. Zweimal dieselbe Umwandlung wäre zweimal die
 * Gelegenheit, dass der Patient ein anderes Blatt sieht als seine Versicherung.
 */

import type { InvoiceWithItems, PraxisSettings } from "@/types/billing"
import type { Position } from "@/lib/abrechnung/programm-rechnung"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KvZeile = Record<string, any>

export function kostenvoranschlagAlsBeleg(
  kv: KvZeile,
  praxis: PraxisSettings
): InvoiceWithItems {
  const positionen = (kv.positionen ?? []) as Position[]
  const tag = String(kv.created_at).split("T")[0]

  // Der Generator erwartet die Gestalt einer Rechnung. Was nicht passt, blendet
  // der Belegtyp aus: `treatment_date` steht auf einem Voranschlag nicht auf
  // dem Blatt, `due_date` traegt dort die Gueltigkeit.
  return {
    id: kv.id as string,
    created_at: kv.created_at as string,
    updated_at: kv.created_at as string,
    invoice_number: kv.nummer as string,
    patient_id: (kv.patient_id as string) ?? "",
    created_by: kv.created_by as string,
    invoice_date: tag,
    treatment_date: tag,
    due_date: (kv.gueltig_bis as string) ?? tag,
    patient_name: kv.empfaenger_name as string,
    patient_address: (kv.empfaenger_anschrift as string) ?? null,
    praxis_name: (kv.praxis_name as string) ?? praxis.praxis_name,
    praxis_address:
      (kv.praxis_adresse as string) ?? `${praxis.strasse}\n${praxis.plz} ${praxis.ort}`,
    praxis_steuernr: (kv.praxis_steuernr as string) ?? praxis.steuernummer ?? null,
    subtotal: Number(kv.summe),
    total: Number(kv.summe),
    diagnose_text: (kv.diagnose as string) ?? null,
    status: "entwurf",
    paid_at: null,
    cancelled_at: null,
    notes: (kv.hinweis as string) ?? null,
    beleg_art: "kostenvoranschlag",
    line_items: positionen.map((p, i) => ({
      id: String(i),
      invoice_id: kv.id as string,
      created_at: kv.created_at as string,
      sort_order: i,
      gebueh_ziffer: p.ziffer,
      beschreibung: p.beschreibung,
      anzahl: p.anzahl,
      einzelpreis: p.einzelpreis,
      gesamtpreis: Math.round(p.anzahl * p.einzelpreis * 100) / 100,
    })),
  } as InvoiceWithItems
}

/** „Intensiv", „Begleitet", „Videokonsultation" — für Betreff und Mailtext. */
export function variantenName(variante: string | null): string {
  if (variante === "konsultation") return "die Videokonsultation"
  if (variante === "begleitet") return "die 90-tägige Fernbetreuung „Begleitet“"
  if (variante === "intensiv") return "die 90-tägige Fernbetreuung „Intensiv“"
  return "die geplante Behandlung"
}
