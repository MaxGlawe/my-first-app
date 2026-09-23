/**
 * PROJ-26 Phase 3 — „Mir geht es schlechter" (Patientenseite).
 *
 * GET  /api/me/verschlechterung  — offene Meldung und die letzten Vorgänge
 * POST /api/me/verschlechterung  — Verschlechterung melden
 *
 * Warum das ein eigener Vorgang ist und nicht einfach eine Chatnachricht:
 * Vertraglich zugesagt ist eine Rückmeldung spätestens am nächsten Werktag
 * und eine kurzfristige zusätzliche Video-Sitzung. Im Chat ist eine
 * Verschlechterung nicht von jeder anderen Nachricht zu unterscheiden — die
 * einzige Zusage mit einer Frist wäre damit die einzige, die niemand
 * nachhalten kann. Als eigener Vorgang taucht sie in der Ampel auf und hat
 * ein Fälligkeitsdatum.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { requireWriteAccess } from "@/lib/app-access"
import { naechsterWerktag } from "@/lib/werktag"

const meldungSchema = z.object({
  beschreibung: z.string().trim().max(2000).optional().nullable(),
})

async function patientFuer(userId: string) {
  const svc = createSupabaseServiceClient()
  const { data } = await svc
    .from("patients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()
  return data?.id ?? null
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const patientId = await patientFuer(user.id)
  if (!patientId) {
    return NextResponse.json({ error: "Kein Patienten-Profil gefunden." }, { status: 404 })
  }

  const svc = createSupabaseServiceClient()
  const { data, error } = await svc
    .from("programm_verschlechterungen")
    .select("id, beschreibung, gemeldet_at, frist_at, erledigt_at, erledigt_notiz")
    .eq("patient_id", patientId)
    .order("gemeldet_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("[me/verschlechterung] GET:", error)
    return NextResponse.json({ error: "Konnte nicht geladen werden." }, { status: 500 })
  }

  const meldungen = data ?? []
  return NextResponse.json({
    offen: meldungen.find((m) => !m.erledigt_at) ?? null,
    meldungen,
  })
}

// ── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const patientId = await patientFuer(user.id)
  if (!patientId) {
    return NextResponse.json({ error: "Kein Patienten-Profil gefunden." }, { status: 404 })
  }

  const svc = createSupabaseServiceClient()

  // Nach Ablauf der Betreuung gibt es keine Zusage mehr, die eingelöst werden
  // könnte — dann wäre eine Meldung ein Versprechen, das niemand mehr hält.
  const blocked = await requireWriteAccess(svc, {
    userId: user.id,
    patientId,
    accountOrigin:
      (user.app_metadata as { account_origin?: string } | null | undefined)?.account_origin ?? null,
  })
  if (blocked) return blocked

  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const parsed = meldungSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler." }, { status: 400 })
  }

  // Eine offene Meldung genügt. Ein zweites Drücken darf keinen zweiten
  // Vorgang erzeugen — sonst steht in der Ampel dreimal dasselbe, und die
  // Frist der ersten Meldung würde durch die jüngere verdeckt.
  const { data: offen } = await svc
    .from("programm_verschlechterungen")
    .select("id, gemeldet_at, frist_at")
    .eq("patient_id", patientId)
    .is("erledigt_at", null)
    .order("gemeldet_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (offen) {
    return NextResponse.json({ meldung: offen, bereitsOffen: true })
  }

  // Laufenden Programm-Vertrag mitschreiben, falls vorhanden — nie Pflicht.
  const { data: vertrag } = await svc
    .from("treatment_contracts")
    .select("id")
    .eq("patient_id", patientId)
    .eq("contract_type", "praxis_os_programm")
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: meldung, error } = await svc
    .from("programm_verschlechterungen")
    .insert({
      patient_id: patientId,
      contract_id: vertrag?.id ?? null,
      beschreibung: parsed.data.beschreibung || null,
      frist_at: naechsterWerktag().toISOString(),
    })
    .select("id, beschreibung, gemeldet_at, frist_at")
    .single()

  if (error || !meldung) {
    console.error("[me/verschlechterung] POST:", error)
    return NextResponse.json({ error: "Meldung konnte nicht gespeichert werden." }, { status: 500 })
  }

  return NextResponse.json({ meldung, bereitsOffen: false }, { status: 201 })
}
