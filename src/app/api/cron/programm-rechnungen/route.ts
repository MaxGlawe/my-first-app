/**
 * PROJ-29 — Der tägliche Rechnungslauf des Programms.
 *
 * GET /api/cron/programm-rechnungen
 *
 * Er tut zwei Dinge, und beide sind Vorarbeit, keine Entscheidung:
 *
 *   1. LEISTUNGSNACHWEISE. Ist ein Programmmonat vorbei, entsteht der
 *      Nachweis dieses Monats — als Entwurf. Versendet wird er erst, wenn der
 *      Behandler ihn freigibt. „Völlig automatisiert" hört an der Stelle auf,
 *      an der ein Dokument entsteht, das man nicht zurückholen kann.
 *
 *      ═══ WARUM NACHWEIS UND NICHT RECHNUNG ═════════════════════════════
 *
 *      Bezahlt wurde einmal, bei Vertragsschluss — dafür gibt es die
 *      Bezahlrechnung aus `billing/programm-invoice`. Das ist der Umsatz.
 *
 *      Trügen diese drei Dokumente ebenfalls Rechnungsnummern, stünden in den
 *      Büchern 598 € für ein 299-€-Programm. Sie sind deshalb
 *      LEISTUNGSNACHWEISE: eigene Nummernfolge (N-2026-0001), Verweis auf die
 *      Rechnung, alle GebüH-Ziffern mit Datum für die Versicherung — und
 *      ausdrücklich keine Zahlungsaufforderung.
 *
 *   2. ERINNERUNGEN. In Woche 6 und in Woche 12 steht je ein Bericht an.
 *      Wird er nicht geschrieben, darf er auch nicht berechnet werden — die
 *      41 € wandern dann in die Programmpauschale. Die Erinnerung ist also
 *      keine Gängelei, sondern der Unterschied zwischen einer Leistung und
 *      einer Pauschale.
 *
 * KEINE RECHNUNG OHNE DIAGNOSE. Sie ist Pflichtangabe. Fehlt sie, entsteht
 * nichts und der Behandler erfährt warum — lieber eine Rechnung später als
 * eine unvollständige.
 *
 * BEIDES LANDET IM OS, NICHT IM POSTFACH. Eine Mail ist eine
 * Benachrichtigung, keine Aufgabe: sie kennt kein „erledigt" und sie sammelt
 * sich. Bei zwanzig Patienten im Programm wären das allein hier sechzig Mails
 * im Quartal. Der Behandler sieht seinen Arbeitsvorrat stattdessen auf dem
 * Dashboard — von jedem Endgerät, an einem Fleck.
 *
 * Der Zeitstempel der Erinnerung wird VOR dem Anlegen gesetzt: Scheitert das
 * Anlegen, gilt sie trotzdem als erledigt. Zwanzig gleiche Aufgaben sind
 * Lärm, eine verpasste ist ärgerlich.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { aufgabeAnlegen } from "@/lib/aufgaben"
import { erstelleKonsultationsrechnung } from "@/lib/billing/konsultation-invoice"
import { VARIANTEN, type ProgrammVariante } from "@/lib/programm"
import { monatsrechnung, vermerk, type Ereignisse } from "@/lib/abrechnung/programm-rechnung"

export const dynamic = "force-dynamic"

/** Ein Programmmonat sind dreissig Tage. */
const MONAT_TAGE = 30

/**
 * Wie lange nach der Konsultation gewartet wird, bevor sie einzeln berechnet
 * wird.
 *
 * Wer im Gespräch zusagt, kauft meist am selben oder am nächsten Tag — für den
 * soll keine Einzelrechnung entstehen, die gleich wieder angerechnet werden
 * müsste. Wer „ich muss noch nachdenken" sagt, soll seinen Beleg trotzdem
 * zeitnah bekommen. Drei Tage sind der Kompromiss; das Angebot gilt 48 Stunden.
 *
 * Entscheidet er sich später doch, wird die Rechnung angerechnet — der Fall
 * ist also nicht schlimm, nur unschön.
 */
const KARENZ_KONSULTATION_TAGE = 3

function autorisiert(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return (
    request.headers.get("x-cron-secret") === secret ||
    request.headers.get("authorization") === `Bearer ${secret}`
  )
}

function tageSeit(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function iso(d: Date): string {
  return d.toISOString().split("T")[0]
}

export async function GET(request: NextRequest) {
  if (!autorisiert(request)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const svc = createSupabaseServiceClient()
  const ergebnis = {
    entwuerfe: 0,
    erinnerungen: 0,
    konsultationsrechnungen: 0,
    uebersprungen: [] as string[],
    fehler: 0,
  }

  // ══ Pass 1: Konsultationen ohne Programm ════════════════════════════════
  //
  // Wer in der Konsultation sagt „ich muss noch nachdenken", hat 69 € bezahlt
  // und eine Leistung erhalten — und bekam dafür bisher keinen Beleg. Auch
  // nichts für seine Versicherung.
  await konsultationsrechnungen(svc, ergebnis)

  const { data: vertraege } = await svc
    .from("treatment_contracts")
    .select("id, patient_id, created_by, created_at, paid_at, programm_variante, bericht_erinnerung_woche6_at, bericht_erinnerung_woche12_at")
    .eq("contract_type", "praxis_os_programm")
    .not("paid_at", "is", null)
    .limit(200)

  const { data: praxis } = await svc
    .from("praxis_settings")
    .select("praxis_name, strasse, plz, ort, steuernummer, email")
    .limit(1)
    .maybeSingle()

  for (const vertrag of vertraege ?? []) {
    try {
      const tage = tageSeit(vertrag.paid_at as string)
      const variante = ((vertrag.programm_variante as ProgrammVariante) ?? "begleitet")

      // ── Berichts-Erinnerungen ───────────────────────────────────────────
      for (const [woche, feld, was] of [
        [6, "bericht_erinnerung_woche6_at", "Verlaufsbericht"],
        [12, "bericht_erinnerung_woche12_at", "Abschlussbericht"],
      ] as const) {
        if (tage < woche * 7) continue
        if (vertrag[feld]) continue

        await svc
          .from("treatment_contracts")
          .update({ [feld]: new Date().toISOString() })
          .eq("id", vertrag.id)

        const { data: pat } = await svc
          .from("patients")
          .select("vorname, nachname")
          .eq("id", vertrag.patient_id)
          .maybeSingle()

        const name = [pat?.vorname, pat?.nachname].filter(Boolean).join(" ") || "Patient"

        // Kein `refId`: Woche 6 und Woche 12 tragen denselben Typ, und der
        // eindeutige Index liegt auf (typ, ref_id) — die zweite Erinnerung
        // würde verschluckt. Gegen Doppelte schützt hier der Zeitstempel am
        // Vertrag, der eine Zeile weiter oben gesetzt wurde.
        await aufgabeAnlegen(svc, {
          typ: "bericht_faellig",
          titel: `${was} schreiben: ${name}`,
          beschreibung:
            `Woche ${woche} des Programms. Ohne geschriebenen Bericht darf die Ziffer 11.2 ` +
            `(20,50 €) nicht auf die Rechnung — der Betrag wird dann als Programmpauschale ausgewiesen.`,
          link: `/os/patients/${vertrag.patient_id}/arztbericht/new`,
          patientId: vertrag.patient_id as string,
        })
        ergebnis.erinnerungen++
      }

      // ── Fällige Monatsrechnung ──────────────────────────────────────────
      const faellig = Math.min(3, Math.floor(tage / MONAT_TAGE)) as 0 | 1 | 2 | 3
      if (faellig < 1) continue

      // Beides steckt in derselben Abfrage: die Bezahlrechnung (der Bezug,
      // den jeder Nachweis trägt) und die bereits erstellten Nachweise.
      const { data: bestehende } = await svc
        .from("invoices")
        .select("id, invoice_number, invoice_date, programm_monat, total, beleg_art")
        .eq("programm_contract_id", vertrag.id)

      const nachweise = (bestehende ?? []).filter((r) => r.beleg_art === "leistungsnachweis")
      const bezahlrechnung = (bestehende ?? []).find((r) => r.beleg_art === "rechnung")

      const schonDa = new Set(nachweise.map((r) => r.programm_monat))
      const monat = ([1, 2, 3] as const).find((m) => m <= faellig && !schonDa.has(m))
      if (!monat) continue

      // ── Diagnose: ohne sie keine Rechnung ───────────────────────────────
      const { data: gespraeche } = await svc
        .from("video_calls")
        .select("id, anlass, begonnen_at, uebung_angeleitet, diagnose")
        .eq("patient_id", vertrag.patient_id)
        .not("begonnen_at", "is", null)
        .order("begonnen_at", { ascending: true })

      const alle = gespraeche ?? []
      const diagnose = alle.find((c) => c.diagnose)?.diagnose as string | undefined

      if (!diagnose) {
        // Nicht nur ins Log: Ohne Diagnose entsteht hier nie eine Rechnung,
        // und ein Lauf, der jeden Morgen still überspringt, fällt niemandem
        // auf. `refId` = der Vertrag, also genau ein Hinweis je Patient.
        await aufgabeAnlegen(svc, {
          typ: "hinweis",
          titel: "Diagnose fehlt — keine Rechnung möglich",
          beschreibung:
            "Für dieses Programm ist keine Diagnose hinterlegt. Die Diagnose ist Pflichtangabe " +
            "auf der Rechnung; bis sie im Gespräch oder am Patienten erfasst ist, entstehen keine " +
            "Monatsrechnungen.",
          link: `/os/patients/${vertrag.patient_id}`,
          patientId: vertrag.patient_id as string,
          refId: vertrag.id as string,
        })
        ergebnis.uebersprungen.push(`${vertrag.id.slice(0, 8)}: keine Diagnose hinterlegt`)
        continue
      }

      // ── Die Konsultation, um die es geht ────────────────────────────────
      //
      // Nicht einfach die erste überhaupt: Ein Patient, der nach einem Jahr
      // wiederkommt, hat zwei. Gemeint ist die, aus der dieses Angebot
      // entstand — also die letzte vor dem Vertrag.
      const bisVertrag = new Date((vertrag.created_at as string) ?? (vertrag.paid_at as string))
      const konsultationen = alle.filter(
        (c) => c.anlass === "konsultation" && new Date(c.begonnen_at as string) <= bisVertrag
      )
      const konsultation =
        konsultationen[konsultationen.length - 1] ?? alle.find((c) => c.anlass === "konsultation")

      // ── Zeitfenster dieses Monats ───────────────────────────────────────
      //
      // ACHTUNG, hier steckte ein stiller Fehler: Monat 1 begann bei `paid_at`
      // — und die Konsultation liegt IMMER davor, sie ist ja der Anlass für
      // das Angebot. Sie fiel damit durch den Filter, und die drei tragenden
      // Ziffern (1, A20.1, 5 = 69 €) erschienen auf keinem Nachweis. Die Summe
      // blieb richtig, weil der Ausgleichsposten sie schluckte — die Leistung
      // war nur nicht mehr benannt. Genau das, was der Patient bei seiner
      // Versicherung einreichen will.
      //
      // Monat 1 beginnt deshalb beim Behandlungsfall, nicht beim Geldeingang.
      const bezahltAm = new Date(vertrag.paid_at as string)
      const fallBeginn =
        konsultation?.begonnen_at && new Date(konsultation.begonnen_at as string) < bezahltAm
          ? new Date(konsultation.begonnen_at as string)
          : bezahltAm

      const start =
        monat === 1
          ? fallBeginn
          : new Date(bezahltAm.getTime() + (monat - 1) * MONAT_TAGE * 86_400_000)
      const ende = new Date(bezahltAm.getTime() + monat * MONAT_TAGE * 86_400_000)
      const imFenster = (d: string | null) =>
        !!d && new Date(d) >= start && new Date(d) < ende
      const { data: plaene } = await svc
        .from("patient_assignments")
        .select("created_at")
        .eq("patient_id", vertrag.patient_id)
        .order("created_at", { ascending: true })
      const { data: berichte } = await svc
        .from("medical_reports")
        .select("created_at")
        .eq("patient_id", vertrag.patient_id)
        .order("created_at", { ascending: true })

      const ereignisse: Ereignisse = {
        konsultation:
          monat === 1 && konsultation && imFenster(konsultation.begonnen_at as string)
            ? {
                datum: konsultation.begonnen_at as string,
                uebungAngeleitet: Boolean(konsultation.uebung_angeleitet),
              }
            : null,
        sitzungen: alle
          .filter((c) => c.id !== konsultation?.id && imFenster(c.begonnen_at as string))
          .map((c) => ({
            datum: c.begonnen_at as string,
            uebungAngeleitet: Boolean(c.uebung_angeleitet),
          })),
        plaene: (plaene ?? [])
          .filter((p) => imFenster(p.created_at as string))
          .map((p, i) => ({
            datum: p.created_at as string,
            // Der erste Plan ueberhaupt ist die Erstellung, jeder weitere eine
            // Ueberarbeitung — unabhaengig davon, in welchen Monat er faellt.
            erste: monat === 1 && i === 0,
          })),
        berichte: (berichte ?? [])
          .filter((b) => imFenster(b.created_at as string))
          .map((b) => ({ datum: b.created_at as string, abschluss: monat === 3 })),
      }

      // Nur die Nachweise zählen mit: Die Bezahlrechnung trägt den vollen
      // Programmpreis, sie hier mitzuzählen würde jeden Nachweis auf null
      // rechnen.
      const bereitsBerechnet = nachweise.reduce((s, r) => s + Number(r.total ?? 0), 0)

      // ── Wurde die Konsultation schon einzeln berechnet? ─────────────────
      //
      // Der Fall „erst nur die Konsultation, später doch das Programm": Dann
      // existiert bereits eine Rechnung über 69 €, und die Bezahlrechnung
      // deckt nur den Rest. Die Nachweise müssen dasselbe tun — sonst stünde
      // dieselbe Leistung auf zwei Belegen, und der Patient könnte sie zweimal
      // bei seiner Versicherung einreichen.
      const { data: kRechnung } = await svc
        .from("invoices")
        .select("total")
        .eq("patient_id", vertrag.patient_id)
        .not("konsultation_call_id", "is", null)
        .neq("status", "storniert")
        .limit(1)
        .maybeSingle()

      const konsultationExtern = kRechnung ? Number(kRechnung.total) : 0

      const rechnung = monatsrechnung({
        variante,
        monat,
        ereignisse,
        bereitsBerechnet,
        konsultationExtern,
      })

      // ── Anlegen ─────────────────────────────────────────────────────────
      const { data: nummer } = await svc.rpc("generate_nachweis_number")

      // `created_by` ist Pflicht und zeigt auf einen echten Benutzer. Der Lauf
      // hat keinen — also der, der den Vertrag ausgestellt hat, ersatzweise
      // der erste Admin. Eine Rechnung ohne Urheber gibt es nicht.
      let urheber = vertrag.created_by as string | null
      if (!urheber) {
        const { data: admin } = await svc
          .from("user_profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1)
          .maybeSingle()
        urheber = (admin?.id as string) ?? null
      }
      if (!urheber) {
        ergebnis.uebersprungen.push(`${vertrag.id.slice(0, 8)}: kein Urheber fuer die Rechnung`)
        continue
      }
      const { data: pat } = await svc
        .from("patients")
        .select("vorname, nachname, strasse, plz, ort")
        .eq("id", vertrag.patient_id)
        .maybeSingle()

      const heute = new Date()
      const anschrift = [pat?.strasse, [pat?.plz, pat?.ort].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join("\n")

      const { data: angelegt, error } = await svc
        .from("invoices")
        .insert({
          invoice_number: nummer as string,
          patient_id: vertrag.patient_id,
          created_by: urheber,
          invoice_date: iso(heute),
          treatment_date: iso(ende < heute ? ende : heute),
          // Ein Faelligkeitsdatum in der Zukunft liest sich auf einem bereits
          // beglichenen Beleg wie eine Zahlungsaufforderung. Die Spalte ist
          // NOT NULL, also der Ausstellungstag.
          due_date: iso(heute),
          patient_name: [pat?.vorname, pat?.nachname].filter(Boolean).join(" ") || "Patient",
          patient_address: anschrift || null,
          praxis_name: praxis?.praxis_name ?? "Physiotherapie Glawe",
          praxis_address: `${praxis?.strasse ?? ""}\n${praxis?.plz ?? ""} ${praxis?.ort ?? ""}`.trim(),
          praxis_steuernr: praxis?.steuernummer ?? null,
          subtotal: rechnung.summe,
          total: rechnung.summe,
          diagnose_text: diagnose,
          status: "entwurf",
          notes: vermerk({
            konsultationAm: (konsultation?.begonnen_at as string) ?? null,
            bezahltAm: vertrag.paid_at as string,
            rechnungsnummer: (bezahlrechnung?.invoice_number as string) ?? null,
            rechnungsdatum: (bezahlrechnung?.invoice_date as string) ?? null,
            rechnungsbetrag: bezahlrechnung ? Number(bezahlrechnung.total) : null,
          }),
          beleg_art: "leistungsnachweis",
          bezug_invoice_id: (bezahlrechnung?.id as string) ?? null,
          programm_contract_id: vertrag.id,
          programm_monat: monat,
        })
        .select("id, invoice_number")
        .single()

      if (error || !angelegt) {
        console.error("[cron/programm-rechnungen] Anlegen:", error?.message)
        ergebnis.fehler++
        continue
      }

      await svc.from("invoice_line_items").insert(
        rechnung.positionen.map((p, i) => ({
          invoice_id: angelegt.id,
          sort_order: i,
          gebueh_ziffer: p.ziffer,
          beschreibung: p.beschreibung,
          anzahl: p.anzahl,
          einzelpreis: p.einzelpreis,
          gesamtpreis: Math.round(p.anzahl * p.einzelpreis * 100) / 100,
        }))
      )

      // ── Der Behandler erfährt davon ─────────────────────────────────────
      const name = [pat?.vorname, pat?.nachname].filter(Boolean).join(" ") || "Patient"
      const euro = (n: number) => `${n.toFixed(2).replace(".", ",")} €`

      await aufgabeAnlegen(svc, {
        typ: "rechnung_freigeben",
        titel: `Leistungsnachweis freigeben: ${name}, Monat ${monat}`,
        beschreibung:
          `${angelegt.invoice_number} · ${euro(rechnung.summe)} · ` +
          `${rechnung.positionen.length} ${rechnung.positionen.length === 1 ? "Position" : "Positionen"}.` +
          (rechnung.ohneNachweis > 0
            ? ` ${rechnung.ohneNachweis} Gespräch(e) ohne den Haken „Übung angeleitet" — die Bewegungstherapie konnte dafür nicht berechnet werden.`
            : "") +
          (rechnung.ueberschuss > 0
            ? ` Es wurde mehr erbracht als im Programmpreis vorgesehen (${euro(rechnung.ueberschuss)} darüber).`
            : ""),
        link: `/os/admin/billing/${angelegt.id}`,
        patientId: vertrag.patient_id as string,
        // Die Rechnung selbst: eine Aufgabe je Entwurf, für immer.
        refId: angelegt.id as string,
      })

      ergebnis.entwuerfe++
    } catch (err) {
      console.error("[cron/programm-rechnungen]", err)
      ergebnis.fehler++
    }
  }

  console.log("[cron/programm-rechnungen]", JSON.stringify(ergebnis))
  return NextResponse.json({ ok: true, ...ergebnis })
}

/**
 * Konsultationen, zu denen kein Programm kam — jede bekommt ihre eigene
 * Rechnung.
 *
 * Übersprungen wird, wer danach ein Programm gekauft hat: Dort steckt die
 * Konsultation bereits in der Bezahlrechnung. Wer sich ERST SPÄTER entscheidet,
 * behält seine Rechnung; sie wird dann angerechnet statt storniert.
 */
async function konsultationsrechnungen(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svc: any,
  ergebnis: { konsultationsrechnungen: number; uebersprungen: string[]; fehler: number }
): Promise<void> {
  const grenze = new Date(Date.now() - KARENZ_KONSULTATION_TAGE * 86_400_000).toISOString()

  const { data: gespraeche } = await svc
    .from("video_calls")
    .select("id, patient_id, therapist_id, begonnen_at, uebung_angeleitet, diagnose")
    .eq("anlass", "konsultation")
    .not("begonnen_at", "is", null)
    .lt("begonnen_at", grenze)
    .order("begonnen_at", { ascending: false })
    .limit(100)

  for (const call of gespraeche ?? []) {
    try {
      // Ohne Diagnose keine Rechnung — dieselbe Regel wie beim Programm.
      if (!call.diagnose) {
        await aufgabeAnlegen(svc, {
          typ: "hinweis",
          titel: "Diagnose fehlt — Konsultation nicht abrechenbar",
          beschreibung:
            "Für diese Videokonsultation ist keine Diagnose hinterlegt. Die Diagnose ist " +
            "Pflichtangabe auf der Rechnung; bis sie erfasst ist, entsteht kein Beleg für " +
            "den Patienten.",
          link: `/os/patients/${call.patient_id}`,
          patientId: call.patient_id as string,
          refId: call.id as string,
        })
        continue
      }

      // Kam danach ein bezahltes Programm, steckt die Konsultation dort drin.
      const { data: vertrag } = await svc
        .from("treatment_contracts")
        .select("id, paid_at")
        .eq("patient_id", call.patient_id)
        .eq("contract_type", "praxis_os_programm")
        .not("paid_at", "is", null)
        .gte("paid_at", call.begonnen_at as string)
        .limit(1)
        .maybeSingle()

      if (vertrag) continue

      const res = await erstelleKonsultationsrechnung(svc, {
        callId: call.id as string,
        patientId: call.patient_id as string,
        begonnenAt: call.begonnen_at as string,
        uebungAngeleitet: Boolean(call.uebung_angeleitet),
        diagnose: call.diagnose as string,
        urheber: call.therapist_id as string,
      })

      if (!res.ok) {
        ergebnis.uebersprungen.push(`Konsultation ${String(call.id).slice(0, 8)}: ${res.fehler}`)
        ergebnis.fehler++
        continue
      }
      if (res.schonDa || !res.invoiceId) continue

      const { data: pat } = await svc
        .from("patients")
        .select("vorname, nachname")
        .eq("id", call.patient_id)
        .maybeSingle()
      const name = [pat?.vorname, pat?.nachname].filter(Boolean).join(" ") || "Patient"
      const betrag = (res.summe ?? 0).toFixed(2).replace(".", ",")

      await aufgabeAnlegen(svc, {
        typ: "rechnung_freigeben",
        titel: `Konsultationsrechnung versenden: ${name}`,
        beschreibung:
          `${res.invoiceNumber} · ${betrag} € · Videokonsultation ohne anschließendes Programm. ` +
          `Prüfen, freigeben und per Mail an den Patienten schicken.` +
          (Boolean(call.uebung_angeleitet)
            ? ""
            : ` Hinweis: kein Haken „Übung angeleitet" — die Bewegungstherapie (31,00 €) fehlt.`),
        link: `/os/admin/billing/${res.invoiceId}`,
        patientId: call.patient_id as string,
        refId: res.invoiceId,
      })

      ergebnis.konsultationsrechnungen++
    } catch (err) {
      console.error("[cron/programm-rechnungen] Konsultation:", err)
      ergebnis.fehler++
    }
  }
}
