/**
 * PROJ-29 — GET /api/os/kostenvoranschlag/[id]/pdf
 *
 * Rendert den Kostenvoranschlag mit demselben Generator wie Rechnung und
 * Leistungsnachweis. Ein zweiter Generator waere ein zweites Layout, das
 * irgendwann anders aussieht als das erste — und der Patient haette drei
 * Belege von derselben Praxis, die nicht zusammengehoeren.
 *
 * Die Zeile `beleg_art: "kostenvoranschlag"` entscheidet dort ueber Titel,
 * Kopfzeilen und den Kasten unter der Tabelle.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf"
import type { InvoiceWithItems, PraxisSettings } from "@/types/billing"
import type { Position } from "@/lib/abrechnung/programm-rechnung"

export const dynamic = "force-dynamic"

const STAFF = ["admin", "heilpraktiker", "physiotherapeut"]

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
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
  if (!profil || !STAFF.includes(profil.role as string)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data: kv } = await svc
    .from("kostenvoranschlaege")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!kv) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 })

  const { data: praxis } = await svc.from("praxis_settings").select("*").limit(1).maybeSingle()
  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen fehlen." }, { status: 500 })
  }

  const positionen = (kv.positionen ?? []) as Position[]
  const tag = (kv.created_at as string).split("T")[0]

  // Der Generator erwartet die Gestalt einer Rechnung. Was hier nicht passt,
  // wird vom Belegtyp ohnehin ausgeblendet: `treatment_date` steht auf einem
  // Voranschlag nicht auf dem Blatt, `due_date` traegt die Gueltigkeit.
  const beleg: InvoiceWithItems = {
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

  try {
    const pdf = await generateInvoicePdf(beleg, praxis as PraxisSettings)
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Kostenvoranschlag_${kv.nummer}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[kostenvoranschlag/pdf]", err)
    return NextResponse.json({ error: "PDF konnte nicht erstellt werden." }, { status: 500 })
  }
}
