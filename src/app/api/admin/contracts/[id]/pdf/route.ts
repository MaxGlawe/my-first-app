import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { generateContractPdf } from "@/lib/pdf/contract-pdf"
import type { TreatmentContract } from "@/types/contract"
import type { PraxisSettings } from "@/types/billing"

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

export async function GET(
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
    .select("*")
    .eq("id", id)
    .single()

  if (!contract) {
    return NextResponse.json({ error: "Vertrag nicht gefunden." }, { status: 404 })
  }

  if (auth.role !== "admin" && contract.created_by !== auth.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const { data: praxis } = await auth.serviceClient
    .from("praxis_settings")
    .select("*")
    .limit(1)
    .single()

  if (!praxis) {
    return NextResponse.json({ error: "Praxis-Einstellungen nicht gefunden." }, { status: 422 })
  }

  const includeSignature = contract.status === "unterschrieben"

  const pdfBuffer = await generateContractPdf(
    contract as unknown as TreatmentContract,
    praxis as PraxisSettings,
    { includeSignature }
  )

  const filename = includeSignature
    ? `Behandlungsvertrag_${contract.contract_number}_signiert.pdf`
    : `Behandlungsvertrag_${contract.contract_number}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
