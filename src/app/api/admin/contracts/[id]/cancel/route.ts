import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

async function checkAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "heilpraktiker", "physiotherapeut"].includes(profile.role)) {
    return null
  }

  return { user, serviceClient, role: profile.role }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })

  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 })
  }

  const { data: contract } = await auth.serviceClient
    .from("treatment_contracts")
    .select("id, status, created_by")
    .eq("id", id)
    .single()

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  if (auth.role !== "admin" && contract.created_by !== auth.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  if (contract.status === "storniert") {
    return NextResponse.json({ error: "Vertrag ist bereits storniert." }, { status: 422 })
  }

  if (contract.status === "unterschrieben") {
    return NextResponse.json({ error: "Unterschriebene Verträge können nicht storniert werden. Nutzen Sie den Widerruf." }, { status: 422 })
  }

  const { data, error } = await auth.serviceClient
    .from("treatment_contracts")
    .update({ status: "storniert" })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Fehler beim Stornieren." }, { status: 500 })
  }

  return NextResponse.json({ data, message: "Vertrag storniert." })
}
