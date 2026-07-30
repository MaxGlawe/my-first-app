import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// ── Validation ──────────────────────────────────────────────────────

const istAnalyseSchema = z.object({
  organization_id: z.string().uuid("Ungültige Organisations-ID."),
  arbeitsplatz_typ: z.enum(
    ["buero", "homeoffice", "lager", "produktion", "handwerk", "pflege", "mischform"],
  ).default("buero"),
  bildschirmarbeit_stunden: z.coerce.number().min(0).max(16).optional().nullable(),
  sitz_stunden_pro_tag: z.coerce.number().min(0).max(16).optional().nullable(),
  heben_tragen: z.boolean().optional().default(false),
  beschwerden_regionen: z.array(z.string()).default([]),
  schmerz_aktuell: z.coerce.number().min(0).max(10).default(0),
  stress_level: z.coerce.number().min(0).max(10).default(3),
  schlaf_qualitaet: z.coerce.number().min(0).max(10).default(7),
  bewegungseinschraenkung: z.coerce.number().min(0).max(10).optional().nullable(),
  bewegung_minuten_pro_woche: z.coerce.number().min(0).max(3000).default(0),
  sport_art: z.string().optional().nullable(),
  vorerkrankungen: z.array(z.string()).default([]),
  medikamente: z.string().optional().nullable(),
  ziele: z.array(z.string()).default([]),
}).passthrough()

// ── Risiko-Score berechnen ──────────────────────────────────────────

function berechneRisikoScore(data: z.infer<typeof istAnalyseSchema>): number {
  let score = 0

  // Schmerz (0-10 → 0-25 Punkte)
  score += (data.schmerz_aktuell / 10) * 25

  // Stress (0-10 → 0-15 Punkte)
  score += (data.stress_level / 10) * 15

  // Schlafqualität invertiert (10=gut=0 Punkte, 0=schlecht=15 Punkte)
  score += ((10 - data.schlaf_qualitaet) / 10) * 15

  // Sitzstunden (0-8h = linear 0-15 Punkte)
  if (data.sitz_stunden_pro_tag) {
    score += Math.min(data.sitz_stunden_pro_tag / 8, 1) * 15
  }

  // Bewegung invertiert (300+ min/Woche = 0 Punkte, 0 = 15 Punkte)
  const bewegungFaktor = Math.max(0, 1 - data.bewegung_minuten_pro_woche / 300)
  score += bewegungFaktor * 15

  // Beschwerden-Regionen (jede Region +2, max 10)
  score += Math.min(data.beschwerden_regionen.length * 2, 10)

  // Vorerkrankungen (+2 pro Stück, max 5)
  score += Math.min((data.vorerkrankungen?.length ?? 0) * 2, 5)

  return Math.round(Math.min(100, Math.max(0, score)))
}

function ermittlePausenFitFokus(data: z.infer<typeof istAnalyseSchema>): string[] {
  const fokus: string[] = []
  const regionen = data.beschwerden_regionen.map((r) => r.toLowerCase())

  if (regionen.some((r) => r.includes("lws") || r.includes("rücken") || r.includes("lumbal"))) {
    fokus.push("lws")
  }
  if (regionen.some((r) => r.includes("hws") || r.includes("nacken") || r.includes("zervikal"))) {
    fokus.push("nacken")
  }
  if (regionen.some((r) => r.includes("schulter"))) {
    fokus.push("schulter")
  }
  if (regionen.some((r) => r.includes("knie"))) {
    fokus.push("knie")
  }
  if (regionen.some((r) => r.includes("hand") || r.includes("arm") || r.includes("ellenbogen"))) {
    fokus.push("hand_arm")
  }

  // Immer Basis-Fokus
  if (data.sitz_stunden_pro_tag && data.sitz_stunden_pro_tag > 4) {
    if (!fokus.includes("lws")) fokus.push("lws")
    fokus.push("hüftbeuger")
  }
  if (data.bildschirmarbeit_stunden && data.bildschirmarbeit_stunden > 4) {
    fokus.push("augen")
  }
  if (data.stress_level >= 6) {
    fokus.push("entspannung")
  }

  return [...new Set(fokus)]
}

// ── POST: Ist-Analyse speichern ─────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 })
  }

  // Parse with fallback — accept any shape, fill in defaults
  const raw = body as Record<string, unknown>
  const data = {
    organization_id: String(raw.organization_id ?? ""),
    arbeitsplatz_typ: String(raw.arbeitsplatz_typ ?? "buero") as "buero" | "homeoffice" | "lager" | "produktion" | "handwerk" | "pflege" | "mischform",
    bildschirmarbeit_stunden: Number(raw.bildschirmarbeit_stunden ?? 0) || null,
    sitz_stunden_pro_tag: Number(raw.sitz_stunden_pro_tag ?? 0) || null,
    heben_tragen: raw.heben_tragen === true,
    beschwerden_regionen: Array.isArray(raw.beschwerden_regionen) ? raw.beschwerden_regionen as string[] : [],
    schmerz_aktuell: Number(raw.schmerz_aktuell ?? 0),
    stress_level: Number(raw.stress_level ?? 3),
    schlaf_qualitaet: Number(raw.schlaf_qualitaet ?? 7),
    bewegungseinschraenkung: raw.bewegungseinschraenkung != null ? Number(raw.bewegungseinschraenkung) : null,
    bewegung_minuten_pro_woche: Number(raw.bewegung_minuten_pro_woche ?? 0),
    sport_art: raw.sport_art ? String(raw.sport_art).trim() : null,
    vorerkrankungen: Array.isArray(raw.vorerkrankungen) ? raw.vorerkrankungen as string[] : [],
    medikamente: raw.medikamente ? String(raw.medikamente).trim() : null,
    ziele: Array.isArray(raw.ziele) ? raw.ziele as string[] : [],
  }

  if (!data.organization_id) {
    return NextResponse.json({ error: "organization_id fehlt." }, { status: 400 })
  }

  const serviceClient = createSupabaseServiceClient()

  // Prüfe ob User Mitglied dieser Organisation ist
  const { data: membership } = await serviceClient
    .from("organization_members")
    .select("id, status")
    .eq("organization_id", data.organization_id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return NextResponse.json(
      { error: "Sie sind kein Mitglied dieser Organisation." },
      { status: 403 }
    )
  }

  // Risiko-Score + Fokus berechnen
  const risiko_score = berechneRisikoScore(data)
  const pausen_fit_fokus = ermittlePausenFitFokus(data)

  // KI-Empfehlung generieren
  const fokusText = pausen_fit_fokus.length > 0
    ? `Fokus auf: ${pausen_fit_fokus.join(", ")}.`
    : "Allgemeine Mobilisation und Prävention."
  const ki_empfehlung = risiko_score >= 60
    ? `Erhöhtes Risiko (${risiko_score}/100). ${fokusText} Tägliches Pausen-Fit und regelmäßige Bewegung sind besonders wichtig.`
    : risiko_score >= 30
    ? `Mittleres Risiko (${risiko_score}/100). ${fokusText} Regelmäßige Pausen-Fits helfen, Beschwerden vorzubeugen.`
    : `Niedriges Risiko (${risiko_score}/100). ${fokusText} Weiter so — Pausen-Fits halten Sie fit.`

  // Upsert Ist-Analyse
  const { data: analyse, error: upsertError } = await serviceClient
    .from("ist_analyse")
    .upsert(
      {
        user_id: user.id,
        organization_id: data.organization_id,
        arbeitsplatz_typ: data.arbeitsplatz_typ,
        bildschirmarbeit_stunden: data.bildschirmarbeit_stunden ?? null,
        sitz_stunden_pro_tag: data.sitz_stunden_pro_tag ?? null,
        heben_tragen: data.heben_tragen ?? false,
        beschwerden_regionen: data.beschwerden_regionen,
        schmerz_aktuell: data.schmerz_aktuell,
        stress_level: data.stress_level,
        schlaf_qualitaet: data.schlaf_qualitaet,
        bewegungseinschraenkung: data.bewegungseinschraenkung ?? null,
        bewegung_minuten_pro_woche: data.bewegung_minuten_pro_woche,
        sport_art: data.sport_art?.trim() || null,
        vorerkrankungen: data.vorerkrankungen ?? [],
        medikamente: data.medikamente?.trim() || null,
        ziele: data.ziele,
        risiko_score,
        ki_empfehlung,
        pausen_fit_fokus,
      },
      { onConflict: "user_id,organization_id" }
    )
    .select("id, risiko_score, ki_empfehlung, pausen_fit_fokus, created_at")
    .single()

  if (upsertError) {
    console.error("[POST /api/bgf/ist-analyse] Supabase error:", upsertError)
    return NextResponse.json(
      { error: "Ist-Analyse konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }

  // Mitglied als "Analyse abgeschlossen" markieren + auf aktiv setzen
  await serviceClient
    .from("organization_members")
    .update({
      ist_analyse_abgeschlossen: true,
      status: "aktiv",
    })
    .eq("id", membership.id)

  return NextResponse.json(
    {
      analyse: {
        id: analyse.id,
        risiko_score: analyse.risiko_score,
        ki_empfehlung: analyse.ki_empfehlung,
        pausen_fit_fokus: analyse.pausen_fit_fokus,
      },
    },
    { status: 201 }
  )
}

// ── GET: Eigene Ist-Analyse abrufen ─────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get("organization_id")

  // Use service client to bypass RLS (user ownership verified via auth)
  const sc = createSupabaseServiceClient()

  let query = sc
    .from("ist_analyse")
    .select("*")
    .eq("user_id", user.id)

  if (orgId) {
    query = query.eq("organization_id", orgId)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    console.error("[GET /api/bgf/ist-analyse] Supabase error:", error)
    return NextResponse.json(
      { error: "Ist-Analyse konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  return NextResponse.json({ analysen: data ?? [] })
}
