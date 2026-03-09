/**
 * Admin Payment Plans API (Ratenzahlung)
 *
 * POST: Create a payment plan for a patient
 * GET:  List payment plans (optionally filtered by patient)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const createSchema = z.object({
  patient_id: z.string().uuid(),
  package_id: z.string().uuid().optional(),
  package_name: z.string().min(1).max(200),
  total_amount: z.number().positive(),
  num_installments: z.number().int().min(1).max(12),
  gebuh_items: z.array(
    z.object({
      ziffer: z.string(),
      analog: z.boolean().optional().default(false),
      beschreibung: z.string(),
      einzelpreis: z.number(),
    })
  ),
})

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins haben Zugriff auf diese Funktion." }, { status: 403 })
  }

  const patientId = request.nextUrl.searchParams.get("patient_id")

  let query = serviceClient
    .from("payment_plans")
    .select(`
      *,
      patients!inner(id, vorname, nachname),
      payment_installments(*)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (patientId) {
    query = query.eq("patient_id", patientId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/admin/payment-plans]", error)
    return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Nur Admins haben Zugriff auf diese Funktion." }, { status: 403 })
  }

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 })
  }

  // Verify patient exists
  const { data: patient } = await serviceClient
    .from("patients")
    .select("id")
    .eq("id", body.patient_id)
    .single()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // Calculate installment amounts (no surcharge)
  const installmentAmount = Math.floor(body.total_amount * 100) / 100 / body.num_installments
  const roundedInstallment = Math.floor(installmentAmount * 100) / 100
  const lastInstallment =
    Math.round((body.total_amount - roundedInstallment * (body.num_installments - 1)) * 100) / 100

  // Create payment plan
  const { data: plan, error: planError } = await serviceClient
    .from("payment_plans")
    .insert({
      patient_id: body.patient_id,
      package_id: body.package_id ?? null,
      package_name: body.package_name,
      total_amount: body.total_amount,
      num_installments: body.num_installments,
      installment_amount: roundedInstallment,
      gebuh_items: body.gebuh_items,
      created_by: user.id,
    })
    .select()
    .single()

  if (planError || !plan) {
    console.error("[POST /api/admin/payment-plans]", planError)
    return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 })
  }

  // Create installment records
  const installments = Array.from({ length: body.num_installments }, (_, i) => {
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + i)

    return {
      plan_id: plan.id,
      installment_number: i + 1,
      amount: i === body.num_installments - 1 ? lastInstallment : roundedInstallment,
      due_date: dueDate.toISOString().split("T")[0],
      status: "pending" as const,
    }
  })

  const { error: installError } = await serviceClient
    .from("payment_installments")
    .insert(installments)

  if (installError) {
    console.error("[POST /api/admin/payment-plans] installments:", installError)
    // Clean up plan
    await serviceClient.from("payment_plans").delete().eq("id", plan.id)
    return NextResponse.json({ error: "Raten konnten nicht erstellt werden." }, { status: 500 })
  }

  // Return plan with installments
  const { data: result } = await serviceClient
    .from("payment_plans")
    .select("*, payment_installments(*)")
    .eq("id", plan.id)
    .single()

  return NextResponse.json(result, { status: 201 })
}
