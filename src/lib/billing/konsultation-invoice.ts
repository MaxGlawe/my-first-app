/**
 * PROJ-29 — Die Rechnung über die Videokonsultation allein.
 *
 * Für den Patienten, der in der Konsultation sagt: „Ich muss noch nachdenken."
 * Er hat eine Leistung erhalten — also bekommt er dafür einen Beleg. Bisher
 * bekam er keinen: Wer kein Programm nahm, hatte nichts in der Hand, auch
 * nichts für seine Versicherung.
 *
 * ═══ DIE DREI ZIFFERN ERGEBEN DEN PREIS ═════════════════════════════════
 *
 *   Ziffer 1      Eingehende Untersuchung      20,50 €
 *   Ziffer A20.1  Aktive Bewegungstherapie     31,00 €
 *   Ziffer 5      Beratung                     17,50 €
 *                                             ─────────
 *                                              69,00 €
 *
 * Kein Ausgleichsposten, keine Pauschale. Ohne den Haken „Übung angeleitet"
 * entfällt A20.1 und es bleiben 38,00 € — denn abgerechnet wird nur, was
 * belegt ist. Dasselbe gilt im Programm, und die Positionen sind wortgleich:
 * Dieselbe Leistung darf auf zwei Belegen nicht verschieden aussehen.
 *
 * ═══ UND WENN ER SICH DOCH ENTSCHEIDET ══════════════════════════════════
 *
 * Dann rechnet `createProgrammBezahlrechnung` diese Rechnung an: Die
 * Bezahlrechnung deckt nur noch den Rest, und die drei Leistungsnachweise
 * lassen die Konsultation aus. Zusammen ergeben beide Belege wieder genau den
 * Programmpreis. Der Anker dafür ist `konsultation_call_id`.
 */

import type { createSupabaseServiceClient } from "@/lib/supabase-service"
import { SATZ, type Position } from "@/lib/abrechnung/programm-rechnung"

type ServiceClient = ReturnType<typeof createSupabaseServiceClient>

function datum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  })
}

function runde(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Die Positionen einer Konsultation — wortgleich mit denen im
 * Leistungsnachweis des ersten Programmmonats.
 */
export function konsultationsPositionen(args: {
  datum: string
  uebungAngeleitet: boolean
}): Position[] {
  const tag = datum(args.datum)
  const positionen: Position[] = [
    {
      ziffer: "1",
      beschreibung: `Eingehende Untersuchung (per Video) am ${tag}`,
      anzahl: 1,
      einzelpreis: SATZ.untersuchung,
    },
  ]
  if (args.uebungAngeleitet) {
    positionen.push({
      ziffer: "A20.1",
      beschreibung: `Aktive Bewegungstherapie per Video: Anleitung und Korrektur der ersten Übung (analog Ziff. 20.1) am ${tag}`,
      anzahl: 1,
      einzelpreis: SATZ.bewegungstherapie,
    })
  }
  positionen.push({
    ziffer: "5",
    beschreibung: `Beratung (per Video) am ${tag}`,
    anzahl: 1,
    einzelpreis: SATZ.beratung,
  })
  return positionen
}

export interface KonsultationsrechnungErgebnis {
  ok: boolean
  invoiceId?: string
  invoiceNumber?: string
  summe?: number
  /** Es gab sie schon — der Normalfall bei einem täglichen Lauf. */
  schonDa?: boolean
  fehler?: string
}

export async function erstelleKonsultationsrechnung(
  svc: ServiceClient,
  args: {
    callId: string
    patientId: string
    /** Beginn des Gesprächs — Behandlungsdatum der Rechnung. */
    begonnenAt: string
    uebungAngeleitet: boolean
    diagnose: string
    /** Wer sie verantwortet. Ohne Urheber gibt es keine Rechnung. */
    urheber: string
  }
): Promise<KonsultationsrechnungErgebnis> {
  // ── Idempotenz über den eindeutigen Index ───────────────────────────────
  const { data: vorhanden } = await svc
    .from("invoices")
    .select("id, invoice_number, total")
    .eq("konsultation_call_id", args.callId)
    .maybeSingle()

  if (vorhanden) {
    return {
      ok: true,
      schonDa: true,
      invoiceId: vorhanden.id as string,
      invoiceNumber: vorhanden.invoice_number as string,
      summe: Number(vorhanden.total),
    }
  }

  const { data: patient } = await svc
    .from("patients")
    .select("vorname, nachname, strasse, plz, ort")
    .eq("id", args.patientId)
    .maybeSingle()

  const { data: praxis } = await svc
    .from("praxis_settings")
    .select("praxis_name, strasse, plz, ort, steuernummer")
    .limit(1)
    .maybeSingle()

  const positionen = konsultationsPositionen({
    datum: args.begonnenAt,
    uebungAngeleitet: args.uebungAngeleitet,
  })
  const summe = runde(positionen.reduce((s, p) => s + p.anzahl * p.einzelpreis, 0))

  const { data: nummer } = await svc.rpc("generate_invoice_number")
  if (!nummer) return { ok: false, fehler: "Rechnungsnummer konnte nicht erzeugt werden." }

  const heute = new Date()
  const tag = (d: Date) => d.toISOString().split("T")[0]
  const anschrift = [patient?.strasse, [patient?.plz, patient?.ort].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join("\n")

  const { data: angelegt, error } = await svc
    .from("invoices")
    .insert({
      invoice_number: nummer as string,
      patient_id: args.patientId,
      created_by: args.urheber,
      invoice_date: tag(heute),
      treatment_date: args.begonnenAt.split("T")[0],
      // Vierzehn Tage, wie bei jeder anderen Rechnung. Ist das Geld schon da,
      // setzt der Behandler sie vor dem Versand auf „bezahlt" — dann fallen
      // Faelligkeit, Bankdaten und QR-Code vom Beleg weg.
      due_date: tag(new Date(heute.getTime() + 14 * 86_400_000)),
      patient_name: [patient?.vorname, patient?.nachname].filter(Boolean).join(" ") || "Patient",
      patient_address: anschrift || null,
      praxis_name: praxis?.praxis_name ?? "Physiotherapie Glawe",
      praxis_address: `${praxis?.strasse ?? ""}\n${praxis?.plz ?? ""} ${praxis?.ort ?? ""}`.trim(),
      praxis_steuernr: praxis?.steuernummer ?? null,
      subtotal: summe,
      total: summe,
      diagnose_text: args.diagnose,
      // Entwurf, und ausdruecklich NICHT „bezahlt".
      //
      // Ob die 69 EUR schon geflossen sind, weiss das System nicht: Die
      // Konsultation wird im fremden Buchungskalender bezahlt, und die
      // Angebots-API kennt dafuer eigens den Schalter
      // `konsultation_angerechnet` — „startet er direkt im Call, ist die
      // Konsultation im Gesamtpreis enthalten". Es gibt also beide Welten.
      //
      // Deshalb entsteht hier eine echte Rechnung mit Zahlungsangaben. Ist das
      // Geld schon da, setzt der Behandler sie im Abrechnungsdialog auf
      // „bezahlt", bevor er sie verschickt — dann verschwinden Bankdaten und
      // QR-Code vom Beleg.
      status: "entwurf",
      beleg_art: "rechnung",
      konsultation_call_id: args.callId,
      notes:
        `Behandlungsfall seit ${datum(args.begonnenAt)}. ` +
        `Umsatzsteuerfrei gemäß § 4 Nr. 14a UStG.` +
        (args.uebungAngeleitet
          ? ""
          : `\n\nHinweis für die Praxis: Für dieses Gespräch ist kein Haken „Übung angeleitet" ` +
            `gesetzt, deshalb fehlt die Position A20.1 (31,00 €).`),
    })
    .select("id, invoice_number")
    .single()

  if (error || !angelegt) {
    // 23505 = der eindeutige Index: ein paralleler Lauf war schneller.
    if ((error as { code?: string } | null)?.code === "23505") {
      return { ok: true, schonDa: true }
    }
    console.error("[konsultation-invoice] Anlegen:", error?.message)
    return { ok: false, fehler: error?.message ?? "Rechnung konnte nicht angelegt werden." }
  }

  const { error: posError } = await svc.from("invoice_line_items").insert(
    positionen.map((p, i) => ({
      invoice_id: angelegt.id,
      sort_order: i,
      gebueh_ziffer: p.ziffer,
      beschreibung: p.beschreibung,
      anzahl: p.anzahl,
      einzelpreis: p.einzelpreis,
      gesamtpreis: runde(p.anzahl * p.einzelpreis),
    }))
  )
  if (posError) {
    console.error("[konsultation-invoice] Positionen:", posError.message)
    return { ok: false, fehler: posError.message }
  }

  return {
    ok: true,
    invoiceId: angelegt.id as string,
    invoiceNumber: angelegt.invoice_number as string,
    summe,
  }
}
