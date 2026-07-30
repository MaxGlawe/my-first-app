/**
 * GET /api/admin/buchhaltung?von=YYYY-MM-DD&bis=YYYY-MM-DD
 *
 * Führt alle Erlösquellen für einen Zeitraum zusammen — der eine Ort, an dem
 * am Monatsende alles gezogen wird:
 *
 *   1. BGF-Rechnungen   (bgf_invoices)   — regelbesteuert, 19 % USt.
 *   2. Patienten-Rechnungen (invoices)   — Heilbehandlung, § 4 Nr. 14 UStG steuerfrei
 *   3. Shop-Verkäufe    (Stripe)         — liegen NICHT in der Datenbank; für
 *      Käufe wird nur der Zugang (content_entitlements) gespeichert, nie der
 *      Betrag. Die Zahlungen kommen deshalb direkt aus der Stripe-API.
 *
 * Admin-only.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { getStripe } from "@/lib/stripe"

export type BuchhaltungQuelle = "bgf" | "patient" | "shop"

export interface BuchhaltungPosten {
  quelle: BuchhaltungQuelle
  /** Belegnummer bzw. Stripe-Referenz */
  nummer: string
  datum: string
  kunde: string
  /** Netto ohne Umsatzsteuer */
  netto: number
  ust: number
  brutto: number
  /** Mahngebühren (nicht umsatzsteuerbar) — nur BGF */
  mahngebuehren: number
  status: string
  bezahlt: boolean
  /** Link zum Beleg, falls das System einen erzeugt */
  pdf_url: string | null
}

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") return null
  return { user, sc }
}

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

export async function GET(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const heute = new Date()
  const von = searchParams.get("von") ??
    new Date(heute.getFullYear(), heute.getMonth(), 1).toISOString().split("T")[0]
  const bis = searchParams.get("bis") ?? heute.toISOString().split("T")[0]

  if (!/^\d{4}-\d{2}-\d{2}$/.test(von) || !/^\d{4}-\d{2}-\d{2}$/.test(bis)) {
    return NextResponse.json({ error: "Ungültiger Zeitraum." }, { status: 400 })
  }

  const posten: BuchhaltungPosten[] = []
  const warnungen: string[] = []

  // ── 1. BGF-Rechnungen ───────────────────────────────────────────────
  const { data: bgfRechnungen, error: bgfError } = await auth.sc
    .from("bgf_invoices")
    .select("id, invoice_number, invoice_date, org_name, gesamtbetrag, mahngebuehr_1, mahngebuehr_2, status, paid_at")
    .gte("invoice_date", von)
    .lte("invoice_date", bis)
    .neq("status", "entwurf")
    .order("invoice_date", { ascending: false })

  if (bgfError) {
    console.error("[buchhaltung] BGF-Rechnungen:", bgfError)
    warnungen.push("BGF-Rechnungen konnten nicht geladen werden.")
  }

  for (const r of bgfRechnungen ?? []) {
    // Mahngebühren sind Verzugsschaden — keine Umsatzsteuer darauf.
    const gebuehren = r2(Number(r.mahngebuehr_1 ?? 0) + Number(r.mahngebuehr_2 ?? 0))
    const netto = r2(Number(r.gesamtbetrag))
    const ust = r2(netto * 0.19)
    posten.push({
      quelle: "bgf",
      nummer: r.invoice_number,
      datum: r.invoice_date,
      kunde: r.org_name,
      netto,
      ust,
      brutto: r2(netto + ust + gebuehren),
      mahngebuehren: gebuehren,
      status: r.status,
      bezahlt: r.status === "bezahlt" || !!r.paid_at,
      pdf_url: `/api/admin/bgf-invoices/${r.id}/pdf`,
    })
  }

  // ── 2. Patienten-Rechnungen ─────────────────────────────────────────
  // Heilbehandlungen sind nach § 4 Nr. 14 UStG umsatzsteuerfrei — deshalb
  // steht hier keine USt., und der Gesamtbetrag ist zugleich der Nettobetrag.
  const { data: patRechnungen, error: patError } = await auth.sc
    .from("invoices")
    .select("id, invoice_number, invoice_date, patient_name, total, status, paid_at")
    .gte("invoice_date", von)
    .lte("invoice_date", bis)
    .neq("status", "entwurf")
    .order("invoice_date", { ascending: false })

  if (patError) {
    console.error("[buchhaltung] Patienten-Rechnungen:", patError)
    warnungen.push("Patienten-Rechnungen konnten nicht geladen werden.")
  }

  for (const r of patRechnungen ?? []) {
    const betrag = r2(Number(r.total))
    posten.push({
      quelle: "patient",
      nummer: r.invoice_number,
      datum: r.invoice_date,
      kunde: r.patient_name,
      netto: betrag,
      ust: 0,
      brutto: betrag,
      mahngebuehren: 0,
      status: r.status,
      bezahlt: r.status === "bezahlt" || !!r.paid_at,
      pdf_url: `/api/admin/invoices/${r.id}/pdf`,
    })
  }

  // ── 3. Shop-Verkäufe aus Stripe ─────────────────────────────────────
  try {
    const stripe = getStripe()
    const vonTs = Math.floor(new Date(von + "T00:00:00").getTime() / 1000)
    const bisTs = Math.floor(new Date(bis + "T23:59:59").getTime() / 1000)

    let startingAfter: string | undefined
    let seiten = 0

    while (seiten < 10) {
      const charges = await stripe.charges.list({
        created: { gte: vonTs, lte: bisTs },
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })

      for (const c of charges.data) {
        if (c.status !== "succeeded" || c.refunded) continue
        const brutto = r2(c.amount / 100)
        // Digitale Produkte an Privatkunden: 19 % im Bruttopreis enthalten
        const netto = r2(brutto / 1.19)
        posten.push({
          quelle: "shop",
          nummer: c.receipt_number ?? c.id,
          datum: new Date(c.created * 1000).toISOString().split("T")[0],
          kunde: c.billing_details?.name ?? c.billing_details?.email ?? "Shop-Kunde",
          netto,
          ust: r2(brutto - netto),
          brutto,
          mahngebuehren: 0,
          status: "bezahlt",
          bezahlt: true,
          // Stripe stellt die Belege selbst bereit
          pdf_url: c.receipt_url ?? null,
        })
      }

      if (!charges.has_more) break
      startingAfter = charges.data[charges.data.length - 1]?.id
      seiten++
    }
  } catch (err) {
    console.error("[buchhaltung] Stripe:", err)
    warnungen.push(
      "Shop-Verkäufe konnten nicht von Stripe geladen werden — die Summen sind unvollständig."
    )
  }

  posten.sort((a, b) => b.datum.localeCompare(a.datum))

  // ── Summen je Quelle + gesamt ───────────────────────────────────────
  const summeVon = (liste: BuchhaltungPosten[]) => ({
    anzahl: liste.length,
    netto: r2(liste.reduce((s, p) => s + p.netto, 0)),
    ust: r2(liste.reduce((s, p) => s + p.ust, 0)),
    mahngebuehren: r2(liste.reduce((s, p) => s + p.mahngebuehren, 0)),
    brutto: r2(liste.reduce((s, p) => s + p.brutto, 0)),
    offen: r2(liste.filter((p) => !p.bezahlt).reduce((s, p) => s + p.brutto, 0)),
  })

  return NextResponse.json({
    zeitraum: { von, bis },
    posten,
    summen: {
      gesamt: summeVon(posten),
      bgf: summeVon(posten.filter((p) => p.quelle === "bgf")),
      patient: summeVon(posten.filter((p) => p.quelle === "patient")),
      shop: summeVon(posten.filter((p) => p.quelle === "shop")),
    },
    warnungen,
  })
}
