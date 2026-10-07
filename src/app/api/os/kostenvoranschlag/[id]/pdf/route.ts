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
import { kostenvoranschlagAlsBeleg } from "@/lib/billing/kostenvoranschlag-beleg"
import type { PraxisSettings } from "@/types/billing"

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

  const beleg = kostenvoranschlagAlsBeleg(kv, praxis as PraxisSettings)

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
