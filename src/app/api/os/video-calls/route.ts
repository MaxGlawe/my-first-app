/**
 * PROJ-27 — Sprechzimmer, Therapeutenseite.
 *
 * GET   /api/os/video-calls?patient_id=…  — Gespräche eines Patienten
 * POST  /api/os/video-calls               — Gespräch eröffnen
 * PATCH /api/os/video-calls               — Gespräch beenden
 *
 * Eröffnet wird immer vom Behandler. Der Patient tritt bei, er lädt nicht
 * ein — sonst könnte sich jeder selbst einen Termin geben, und die
 * Eignungsprüfung am Anfang des Programms wäre eine Formalie.
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { sendPushToPatient } from "@/lib/push"
import { videoAnbieter } from "@/lib/video/livekit"
import { ANLASS_TEXT, videoEingerichtet } from "@/lib/video"

const STAFF_ROLES = ["admin", "heilpraktiker", "physiotherapeut"]

const eroeffnenSchema = z.object({
  patient_id: z.string().uuid(),
  anlass: z.enum(["konsultation", "programm_sitzung", "verschlechterung", "sonstiges"]),
  verschlechterung_id: z.string().uuid().optional().nullable(),
  /** Wie lange das Zutrittsfenster offen steht. */
  fenster_minuten: z.number().int().min(15).max(240).default(120),
})

const beendenSchema = z.object({
  id: z.string().uuid(),
  notiz: z.string().trim().max(4000).optional().nullable(),
})

async function requireStaff() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const svc = createSupabaseServiceClient()
  const { data: profile } = await svc
    .from("user_profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single()

  if (!profile || !STAFF_ROLES.includes(profile.role)) return null
  return { user, svc, profile }
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  const patientId = request.nextUrl.searchParams.get("patient_id")
  if (!patientId) {
    return NextResponse.json({ error: "patient_id fehlt." }, { status: 400 })
  }

  const { data, error } = await auth.svc
    .from("video_calls")
    .select(
      "id, room_name, anlass, status, oeffnet_at, schliesst_at, begonnen_at, beendet_at, notiz, created_at"
    )
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[os/video-calls] GET:", error)
    return NextResponse.json({ error: "Konnte nicht geladen werden." }, { status: 500 })
  }

  const calls = data ?? []
  const jetzt = Date.now()

  return NextResponse.json({
    eingerichtet: videoEingerichtet(),
    // „Aktiv" heisst: noch im Zutrittsfenster und nicht abgeschlossen. Genau
    // dieses Gespräch bekommt der Patient angeboten.
    aktiv:
      calls.find(
        (c) =>
          (c.status === "offen" || c.status === "laeuft") &&
          new Date(c.schliesst_at).getTime() > jetzt
      ) ?? null,
    calls,
  })
}

// ── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  if (!videoEingerichtet()) {
    return NextResponse.json(
      { error: "Der Videodienst ist auf diesem Server nicht eingerichtet." },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parsed = eroeffnenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler." }, { status: 400 })
  }
  const { patient_id, anlass, verschlechterung_id, fenster_minuten } = parsed.data

  const { data: patient } = await auth.svc
    .from("patients")
    .select("id, vorname, nachname, user_id")
    .eq("id", patient_id)
    .maybeSingle()

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden." }, { status: 404 })
  }

  // Läuft schon eines? Dann dieses zurückgeben, statt ein zweites zu
  // eröffnen. Zwei offene Räume für denselben Patienten sind die sicherste
  // Art, dass Behandler und Patient in verschiedenen sitzen.
  const { data: offen } = await auth.svc
    .from("video_calls")
    .select("id, room_name, anlass, oeffnet_at, schliesst_at, status")
    .eq("patient_id", patient_id)
    .in("status", ["offen", "laeuft"])
    .gt("schliesst_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (offen) {
    return NextResponse.json({ call: offen, bereitsOffen: true })
  }

  // Laufenden Programm-Vertrag mitschreiben, falls vorhanden — nie Pflicht.
  const { data: vertrag } = await auth.svc
    .from("treatment_contracts")
    .select("id")
    .eq("patient_id", patient_id)
    .eq("contract_type", "praxis_os_programm")
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const schliesst = new Date(Date.now() + fenster_minuten * 60_000)

  const { data: call, error } = await auth.svc
    .from("video_calls")
    .insert({
      patient_id,
      therapist_id: auth.user.id,
      anlass,
      verschlechterung_id: verschlechterung_id ?? null,
      contract_id: vertrag?.id ?? null,
      schliesst_at: schliesst.toISOString(),
    })
    .select("id, room_name, anlass, status, oeffnet_at, schliesst_at")
    .single()

  if (error || !call) {
    console.error("[os/video-calls] POST:", error)
    return NextResponse.json({ error: "Gespräch konnte nicht eröffnet werden." }, { status: 500 })
  }

  // Der Patient erfährt davon — fire and forget. Ein fehlgeschlagener Push
  // darf das Gespräch nicht verhindern; der Behandler kann den Link zur Not
  // in den Chat schicken.
  const text = ANLASS_TEXT[anlass]
  void sendPushToPatient(patient_id, {
    title: "Dein Behandler wartet",
    body: `${text.kurz} — du kannst jetzt beitreten.`,
    url: "/app/sprechzimmer",
    tag: "sprechzimmer",
  }).catch((err) => console.error("[os/video-calls] Push fehlgeschlagen:", err))

  return NextResponse.json({ call, bereitsOffen: false }, { status: 201 })
}

// ── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff()
  if (!auth) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  const parsed = beendenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierungsfehler." }, { status: 400 })
  }

  const { data: call, error } = await auth.svc
    .from("video_calls")
    .update({
      status: "beendet",
      beendet_at: new Date().toISOString(),
      notiz: parsed.data.notiz ?? null,
      // Das Fenster sofort schliessen: Ein beendetes Gespräch darf keine
      // neuen Token mehr hergeben, auch nicht in der verbleibenden Stunde.
      schliesst_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .in("status", ["offen", "laeuft"])
    .select("id, room_name, status, beendet_at")
    .maybeSingle()

  if (error) {
    console.error("[os/video-calls] PATCH:", error)
    return NextResponse.json({ error: "Konnte nicht beendet werden." }, { status: 500 })
  }
  if (!call) {
    return NextResponse.json(
      { error: "Gespräch nicht gefunden oder bereits beendet." },
      { status: 409 }
    )
  }

  // Auch beim Anbieter schliessen — sonst bliebe ein Raum offen, in dem
  // jemand mit einem noch gültigen Token weiter sitzen könnte.
  if (videoEingerichtet()) {
    await videoAnbieter().raumSchliessen(call.room_name)
  }

  return NextResponse.json({ call })
}
