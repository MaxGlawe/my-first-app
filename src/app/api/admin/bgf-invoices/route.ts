/**
 * PROJ-18: BGF Invoices
 * GET  /api/admin/bgf-invoices — List invoices
 * POST /api/admin/bgf-invoices — Create new invoice
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { z } from "zod"
import type { PraxisSettings } from "@/types/billing"
import { berechneMonatsbetrag, paketVertragsLabel } from "@/lib/bgf-pakete"

const createSchema = z.object({
  organization_id: z.string().uuid(),
  zeitraum_monat: z.number().int().min(1).max(12),
  zeitraum_jahr: z.number().int().min(2024).max(2100),
})

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) return null
  return { user, sc }
}

export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const orgId = searchParams.get("organization_id")

  let query = auth.sc.from("bgf_invoices").select("*").order("created_at", { ascending: false }).limit(200)
  if (status) query = query.eq("status", status)
  if (orgId) query = query.eq("organization_id", orgId)

  const { data, error } = await query
  if (error) {
    console.error("[GET /api/admin/bgf-invoices] error:", error)
    return NextResponse.json({ error: "Fehler." }, { status: 500 })
  }

  // Auto-mark overdue invoices
  const now = new Date()
  const updated = (data ?? []).map((inv) => {
    if (inv.status === "versendet" && inv.due_date && new Date(inv.due_date) < now) {
      // Update in background
      auth.sc.from("bgf_invoices").update({ status: "ueberfaellig" }).eq("id", inv.id).then(() => {})
      return { ...inv, status: "ueberfaellig" }
    }
    return inv
  })

  return NextResponse.json({ invoices: updated })
}

export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parseResult = createSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: "Validierungsfehler.", details: parseResult.error.flatten().fieldErrors }, { status: 422 })
  }

  const { organization_id, zeitraum_monat, zeitraum_jahr } = parseResult.data

  // Check for duplicate
  const { data: existing } = await auth.sc
    .from("bgf_invoices")
    .select("id")
    .eq("organization_id", organization_id)
    .eq("zeitraum_monat", zeitraum_monat)
    .eq("zeitraum_jahr", zeitraum_jahr)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "Für diesen Zeitraum existiert bereits eine Rechnung." }, { status: 409 })
  }

  // Load active contract
  const { data: contract } = await auth.sc
    .from("bgf_contracts")
    .select("id, lizenzen, preis_pro_ma_monat, monatlicher_gesamtpreis, contract_type, paket_max_ma, paket_label, zusatz_ma_preis")
    .eq("organization_id", organization_id)
    .eq("status", "unterschrieben")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!contract) {
    return NextResponse.json({ error: "Kein unterschriebener Vertrag für diese Organisation." }, { status: 400 })
  }

  // Load organization
  const { data: org } = await auth.sc.from("organizations").select("*").eq("id", organization_id).single()
  if (!org) return NextResponse.json({ error: "Organisation nicht gefunden." }, { status: 404 })

  // Aktive Mitarbeitende zählen — Grundlage für Nachbesetzungen (§4 Abs. 4)
  const { count: aktiveMa } = await auth.sc
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organization_id)
    .eq("status", "aktiv")

  const abrechnung = berechneMonatsbetrag(
    contract.paket_max_ma,
    Number(contract.monatlicher_gesamtpreis),
    aktiveMa ?? contract.lizenzen,
    contract.zusatz_ma_preis == null ? null : Number(contract.zusatz_ma_preis)
  )

  // Load praxis settings
  const { data: praxisRaw } = await auth.sc.from("praxis_settings").select("*").limit(1).single()
  const praxis: PraxisSettings = praxisRaw ?? {} as PraxisSettings

  // Generate invoice number
  const year = zeitraum_jahr
  const { data: lastInvoice } = await auth.sc
    .from("bgf_invoices")
    .select("invoice_number")
    .like("invoice_number", `RE-BGF-${year}-%`)
    .order("invoice_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  let nextNum = 1
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/RE-BGF-\d{4}-(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }
  const invoiceNumber = `RE-BGF-${year}-${String(nextNum).padStart(4, "0")}`

  const invoiceDate = new Date().toISOString().split("T")[0]
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  const orgAddress = [org.adresse_strasse, org.adresse_plz, org.adresse_ort].filter(Boolean).join(", ")

  const { data: invoice, error: insertError } = await auth.sc
    .from("bgf_invoices")
    .insert({
      invoice_number: invoiceNumber,
      organization_id,
      contract_id: contract.id,
      created_by: auth.user.id,
      zeitraum_monat,
      zeitraum_jahr,
      lizenzen: aktiveMa ?? contract.lizenzen,
      // Paketpreis + ggf. Nachbesetzungen (Altverträge behalten ihren Pro-Kopf-Preis).
      paket_label: contract.paket_max_ma
        ? paketVertragsLabel(abrechnung.abgerechnetesPaketMaxMa)
        : contract.paket_label,
      zusatz_ma_anzahl: abrechnung.zusatzMa,
      zusatz_ma_preis: abrechnung.zusatzMa > 0 ? abrechnung.zusatzPreisProMa : null,
      preis_pro_ma: contract.preis_pro_ma_monat ?? null,
      gesamtbetrag: abrechnung.gesamt,
      org_name: org.name,
      org_address: orgAddress || null,
      kontakt_name: org.kontakt_name,
      kontakt_email: org.kontakt_email,
      praxis_name: praxis.praxis_name || "Praxis",
      praxis_address: `${praxis.strasse || ""}, ${praxis.plz || ""} ${praxis.ort || ""}`,
      praxis_inhaber: praxis.inhaber_name || "Inhaber",
      praxis_steuernr: (praxis as unknown as Record<string, unknown>).steuernummer as string ?? null,
      praxis_iban: (praxis as unknown as Record<string, unknown>).iban as string ?? "",
      praxis_bic: (praxis as unknown as Record<string, unknown>).bic as string ?? null,
      praxis_bank_name: (praxis as unknown as Record<string, unknown>).bank_name as string ?? null,
      status: "entwurf",
      invoice_date: invoiceDate,
      due_date: dueDate.toISOString().split("T")[0],
    })
    .select("*")
    .single()

  if (insertError) {
    console.error("[POST /api/admin/bgf-invoices] error:", insertError)
    return NextResponse.json({ error: "Rechnung konnte nicht erstellt werden." }, { status: 500 })
  }

  return NextResponse.json({ invoice }, { status: 201 })
}
