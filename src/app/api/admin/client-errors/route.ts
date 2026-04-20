/**
 * Admin API for client-side error log.
 * GET:  list errors (filters: range, resolved, q)
 * PATCH /:id  mark as resolved/unresolved
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht autorisiert.", status: 401 } as const

  const serviceClient = createSupabaseServiceClient()
  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: "Nur Admins haben Zugriff.", status: 403 } as const
  }
  return { serviceClient } as const
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin()
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") ?? "7d" // 24h | 7d | 30d | all
  const resolved = searchParams.get("resolved") ?? "unresolved" // unresolved | all
  const q = searchParams.get("q")?.trim() ?? ""

  let query = gate.serviceClient
    .from("client_errors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)

  if (range !== "all") {
    const hours = range === "24h" ? 24 : range === "30d" ? 24 * 30 : 24 * 7
    const cutoff = new Date(Date.now() - hours * 3600_000).toISOString()
    query = query.gte("created_at", cutoff)
  }

  if (resolved === "unresolved") {
    query = query.is("resolved_at", null)
  }

  if (q) {
    // Search in message, url, user_email — case-insensitive
    query = query.or(
      `message.ilike.%${q}%,url.ilike.%${q}%,user_email.ilike.%${q}%`
    )
  }

  const { data, error } = await query
  if (error) {
    console.error("[GET /api/admin/client-errors]", error)
    return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 })
  }

  return NextResponse.json(data)
}
