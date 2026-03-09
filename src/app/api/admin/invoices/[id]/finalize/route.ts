import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") return null
  return { user, serviceClient }
}

/** POST /api/admin/invoices/[id]/finalize — Rechnung finalisieren (entwurf → offen) */
export async function POST(request: NextRequest) {
  const auth = await checkAdmin()
  if (!auth) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const segments = request.nextUrl.pathname.split("/")
  const id = segments[segments.length - 2] // .../[id]/finalize
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Ungültige Rechnungs-ID." }, { status: 400 })
  }

  // Check current status
  const { data: invoice } = await auth.serviceClient
    .from("invoices")
    .select("id, status")
    .eq("id", id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 })
  }

  if (invoice.status !== "entwurf") {
    return NextResponse.json(
      { error: "Nur Entwürfe können finalisiert werden." },
      { status: 400 }
    )
  }

  // Check line items exist
  const { count } = await auth.serviceClient
    .from("invoice_line_items")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", id)

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "Rechnung hat keine Positionen." },
      { status: 400 }
    )
  }

  const { data, error } = await auth.serviceClient
    .from("invoices")
    .update({ status: "offen" })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Fehler beim Finalisieren." }, { status: 500 })
  }

  return NextResponse.json({ data })
}
