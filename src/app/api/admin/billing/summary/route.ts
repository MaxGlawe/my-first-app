import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  // Alle Rechnungen laden (ohne Entwürfe)
  const { data: invoices, error } = await serviceClient
    .from("invoices")
    .select("total, status, invoice_date")
    .neq("status", "entwurf")

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 })
  }

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  let total_revenue = 0
  let revenue_this_month = 0
  let outstanding_amount = 0
  let overdue_amount = 0
  let paid_count = 0
  let open_count = 0
  let overdue_count = 0

  for (const inv of invoices || []) {
    const amount = Number(inv.total) || 0

    if (inv.status === "bezahlt") {
      total_revenue += amount
      paid_count++
      if (inv.invoice_date?.startsWith(currentMonth)) {
        revenue_this_month += amount
      }
    } else if (inv.status === "offen") {
      outstanding_amount += amount
      open_count++
    } else if (inv.status === "ueberfaellig") {
      overdue_amount += amount
      overdue_count++
      outstanding_amount += amount
    }
  }

  return NextResponse.json({
    data: {
      total_revenue: Math.round(total_revenue * 100) / 100,
      revenue_this_month: Math.round(revenue_this_month * 100) / 100,
      outstanding_amount: Math.round(outstanding_amount * 100) / 100,
      overdue_amount: Math.round(overdue_amount * 100) / 100,
      invoice_count: (invoices || []).length,
      paid_count,
      open_count,
      overdue_count,
    },
  })
}
