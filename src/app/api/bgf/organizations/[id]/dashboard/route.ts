/**
 * PROJ-18: GET /api/bgf/organizations/[id]/dashboard
 *
 * Returns anonymized aggregate KPIs for a company.
 * Now uses DAILY CHECK-IN data for current health metrics (not just onboarding).
 * Includes trend comparison (current period vs previous period).
 * Includes ROI data based on actual contract pricing.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MIN_DEPT_SIZE = 5

async function checkDashboardAccess(orgId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const sc = createSupabaseServiceClient()
  const { data: profile } = await sc
    .from("user_profiles")
    .select("role, bgf_freigeschaltet")
    .eq("id", user.id)
    .single()
  if (!profile) return null

  const isAdmin = profile.role === "admin"

  const { data: orgAdmin } = await sc
    .from("organization_admins")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle()
  const isHr = !!orgAdmin

  const isBgf = profile.bgf_freigeschaltet === true
  let isBgfForOrg = false
  if (isBgf) {
    const { data: org } = await sc
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .eq("therapeut_id", user.id)
      .maybeSingle()
    isBgfForOrg = !!org
  }

  if (!isAdmin && !isHr && !isBgfForOrg) return null
  return { user, sc }
}

function avg(arr: number[]): number | null {
  if (arr.length === 0) return null
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10
}

function trendArrow(current: number | null, previous: number | null, lowerIsBetter: boolean): "up" | "down" | "stable" {
  if (current === null || previous === null) return "stable"
  const diff = current - previous
  if (Math.abs(diff) < 0.3) return "stable"
  if (lowerIsBetter) return diff < 0 ? "up" : "down"
  return diff > 0 ? "up" : "down"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params

  if (!UUID_REGEX.test(orgId)) {
    return NextResponse.json({ error: "Ungültige Organisations-ID." }, { status: 400 })
  }

  const auth = await checkDashboardAccess(orgId)
  if (!auth) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const sc = auth.sc
  const { searchParams } = new URL(request.url)
  const zeitraum = searchParams.get("zeitraum") || "30"
  const tage = Math.min(365, Math.max(7, parseInt(zeitraum)))

  const now = new Date()
  const currentStart = new Date(now)
  currentStart.setDate(currentStart.getDate() - tage)
  const previousStart = new Date(currentStart)
  previousStart.setDate(previousStart.getDate() - tage)

  const currentStartStr = currentStart.toISOString().split("T")[0]
  const previousStartStr = previousStart.toISOString().split("T")[0]
  const todayStr = now.toISOString().split("T")[0]

  // ── 1. Mitglieder ──────────────────────────────────────────────
  const { data: members } = await sc
    .from("organization_members")
    .select("id, status, abteilung, ist_analyse_abgeschlossen, user_id")
    .eq("organization_id", orgId)

  const allMembers = members ?? []
  const totalMembers = allMembers.length
  const activeMembers = allMembers.filter((m) => m.status === "aktiv").length
  const eingeladene = allMembers.filter((m) => m.status === "eingeladen").length
  const analyseAbgeschlossen = allMembers.filter((m) => m.ist_analyse_abgeschlossen).length
  const activeUserIds = allMembers.filter((m) => m.status === "aktiv" && m.user_id).map((m) => m.user_id!)

  // ── 2. Baseline from IST-Analyse (Onboarding values) ──────────
  const { data: analysen } = await sc
    .from("ist_analyse")
    .select("schmerz_aktuell, stress_level, schlaf_qualitaet, risiko_score, beschwerden_regionen")
    .eq("organization_id", orgId)

  const allAnalysen = analysen ?? []
  const baselineSchmerz = avg(allAnalysen.map((a) => a.schmerz_aktuell ?? 0))
  const baselineStress = avg(allAnalysen.map((a) => a.stress_level ?? 0))
  const baselineSchlaf = avg(allAnalysen.map((a) => a.schlaf_qualitaet ?? 0))
  const avgRisiko = avg(allAnalysen.map((a) => a.risiko_score ?? 0))

  // Top Beschwerden
  const beschwerdenCount: Record<string, number> = {}
  for (const a of allAnalysen) {
    for (const region of a.beschwerden_regionen ?? []) {
      beschwerdenCount[region] = (beschwerdenCount[region] || 0) + 1
    }
  }
  const topBeschwerden = Object.entries(beschwerdenCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([region, count]) => ({
      region, count,
      prozent: totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0,
    }))

  // ── 3. CURRENT health from daily check-ins (last N days) ──────
  let currentCheckins: { schmerz_aktuell: number; schlaf_qualitaet: number; stimmung: number }[] = []
  let previousCheckins: { schmerz_aktuell: number; schlaf_qualitaet: number; stimmung: number }[] = []

  if (activeUserIds.length > 0) {
    const { data: currentData } = await sc
      .from("bgf_daily_checkins")
      .select("schmerz_aktuell, schlaf_qualitaet, stimmung")
      .in("user_id", activeUserIds)
      .gte("datum", currentStartStr)
      .lte("datum", todayStr)

    currentCheckins = currentData ?? []

    // Previous period for trend
    const { data: prevData } = await sc
      .from("bgf_daily_checkins")
      .select("schmerz_aktuell, schlaf_qualitaet, stimmung")
      .in("user_id", activeUserIds)
      .gte("datum", previousStartStr)
      .lt("datum", currentStartStr)

    previousCheckins = prevData ?? []
  }

  // Current averages (from check-ins)
  const currentSchmerz = avg(currentCheckins.map((c) => c.schmerz_aktuell ?? 0))
  const currentSchlaf = avg(currentCheckins.map((c) => c.schlaf_qualitaet ?? 0))
  // Stress from stimmung: 5=super(low stress) → 1=schlecht(high stress). Invert: stress = 6 - stimmung
  const currentStress = avg(currentCheckins.map((c) => 6 - (c.stimmung ?? 3)))

  // Previous averages
  const prevSchmerz = avg(previousCheckins.map((c) => c.schmerz_aktuell ?? 0))
  const prevSchlaf = avg(previousCheckins.map((c) => c.schlaf_qualitaet ?? 0))
  const prevStress = avg(previousCheckins.map((c) => 6 - (c.stimmung ?? 3)))

  // Use check-in data if available, fallback to baseline
  const displaySchmerz = currentSchmerz ?? baselineSchmerz
  const displayStress = currentStress ?? baselineStress
  const displaySchlaf = currentSchlaf ?? baselineSchlaf

  // Trends
  const trendSchmerz = trendArrow(currentSchmerz, prevSchmerz ?? baselineSchmerz, true)
  const trendStress = trendArrow(currentStress, prevStress ?? baselineStress, true)
  const trendSchlaf = trendArrow(currentSchlaf, prevSchlaf ?? baselineSchlaf, false)

  // ── 4. Pausen-Fit Stats ────────────────────────────────────────
  let pausenFitStats = { total: 0, completed: 0, teilnahmequote: 0 }
  let prevPausenFit = { total: 0, completed: 0, teilnahmequote: 0 }

  if (activeUserIds.length > 0) {
    const { count: totalSessions } = await sc
      .from("pausen_fit_sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("geplant_um", `${currentStartStr}T00:00:00`)
      .lte("geplant_um", `${todayStr}T23:59:59`)

    const { count: completedSessions } = await sc
      .from("pausen_fit_sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "abgeschlossen")
      .gte("geplant_um", `${currentStartStr}T00:00:00`)
      .lte("geplant_um", `${todayStr}T23:59:59`)

    pausenFitStats = {
      total: totalSessions ?? 0,
      completed: completedSessions ?? 0,
      teilnahmequote: (totalSessions ?? 0) > 0
        ? Math.round(((completedSessions ?? 0) / (totalSessions ?? 0)) * 100) : 0,
    }

    // Previous period
    const { count: prevTotal } = await sc
      .from("pausen_fit_sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("geplant_um", `${previousStartStr}T00:00:00`)
      .lt("geplant_um", `${currentStartStr}T00:00:00`)

    const { count: prevCompleted } = await sc
      .from("pausen_fit_sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "abgeschlossen")
      .gte("geplant_um", `${previousStartStr}T00:00:00`)
      .lt("geplant_um", `${currentStartStr}T00:00:00`)

    prevPausenFit = {
      total: prevTotal ?? 0,
      completed: prevCompleted ?? 0,
      teilnahmequote: (prevTotal ?? 0) > 0
        ? Math.round(((prevCompleted ?? 0) / (prevTotal ?? 0)) * 100) : 0,
    }
  }

  // ── 5. Feedback ────────────────────────────────────────────────
  const { data: feedbackData } = await sc
    .from("pausen_fit_sessions")
    .select("feedback_sterne")
    .eq("organization_id", orgId)
    .eq("status", "abgeschlossen")
    .not("feedback_sterne", "is", null)
    .gte("geplant_um", `${currentStartStr}T00:00:00`)
    .limit(1000)

  const feedbackEntries = feedbackData ?? []
  const avgFeedback = avg(feedbackEntries.map((f) => f.feedback_sterne ?? 0))

  // ── 6. Abteilungen ─────────────────────────────────────────────
  const deptMap: Record<string, { total: number; aktiv: number; analyse: number }> = {}
  for (const m of allMembers) {
    const dept = m.abteilung || "Ohne Abteilung"
    if (!deptMap[dept]) deptMap[dept] = { total: 0, aktiv: 0, analyse: 0 }
    deptMap[dept].total++
    if (m.status === "aktiv") deptMap[dept].aktiv++
    if (m.ist_analyse_abgeschlossen) deptMap[dept].analyse++
  }

  const abteilungsVergleich = Object.entries(deptMap)
    .filter(([, v]) => v.total >= MIN_DEPT_SIZE)
    .map(([name, v]) => ({
      name, total: v.total, aktiv: v.aktiv,
      teilnahmequote: v.total > 0 ? Math.round((v.aktiv / v.total) * 100) : 0,
      analyse_quote: v.total > 0 ? Math.round((v.analyse / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.teilnahmequote - a.teilnahmequote)

  // ── 7. ROI data from actual contract + HR Kennzahlen ────────────
  const { data: contract } = await sc
    .from("bgf_contracts")
    .select("lizenzen, monatlicher_gesamtpreis, paket_max_ma, paket_label")
    .eq("organization_id", orgId)
    .eq("status", "unterschrieben")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Load org for HR data + branche
  const { data: orgData } = await sc
    .from("organizations")
    .select("branche, hr_krankenquote, hr_fehltage_pro_ma, hr_personalkosten_pro_tag")
    .eq("id", orgId)
    .single()

  // Branchenspezifische Defaults
  const branchenDefaults: Record<string, { krankenquote: number; fehltage: number; kosten: number }> = {
    "Handwerk": { krankenquote: 6.2, fehltage: 19, kosten: 350 },
    "Produktion": { krankenquote: 6.5, fehltage: 20, kosten: 320 },
    "Büro": { krankenquote: 4.8, fehltage: 14, kosten: 280 },
    "IT": { krankenquote: 4.2, fehltage: 12, kosten: 380 },
    "Pflege": { krankenquote: 7.1, fehltage: 22, kosten: 300 },
    "Handel": { krankenquote: 5.5, fehltage: 16, kosten: 250 },
    "Logistik": { krankenquote: 6.0, fehltage: 18, kosten: 290 },
    "Gastronomie": { krankenquote: 5.8, fehltage: 17, kosten: 220 },
  }
  const defaults = branchenDefaults[orgData?.branche ?? ""] ?? { krankenquote: 5.5, fehltage: 15, kosten: 300 }

  const hrKrankenquote = orgData?.hr_krankenquote ? Number(orgData.hr_krankenquote) : null
  const hrFehltage = orgData?.hr_fehltage_pro_ma ? Number(orgData.hr_fehltage_pro_ma) : null
  const hrKosten = orgData?.hr_personalkosten_pro_tag ? Number(orgData.hr_personalkosten_pro_tag) : null

  // Paketmodell: es gibt keinen Pro-Kopf-Preis mehr — nur einen abgeleiteten
  // Effektivwert (Monatspreis / abgedeckte Mitarbeitende) für die Anzeige.
  const roiLizenzen = contract ? contract.lizenzen : activeMembers
  const roiMonatlich = contract ? Number(contract.monatlicher_gesamtpreis) : null

  const roi = {
    paket_label: contract?.paket_label ?? null,
    effektiv_pro_ma_monat:
      roiMonatlich !== null && roiLizenzen > 0 ? roiMonatlich / roiLizenzen : null,
    lizenzen: roiLizenzen,
    monatlich_netto: roiMonatlich,
    jaehrlich_netto: roiMonatlich !== null ? roiMonatlich * 12 : null,
    teilnahmequote: pausenFitStats.teilnahmequote,
    active_members: activeMembers,
    // HR Kennzahlen (eigene oder Branchendefault)
    fehltage_pro_ma: hrFehltage ?? defaults.fehltage,
    personalkosten_pro_tag: hrKosten ?? defaults.kosten,
    krankenquote: hrKrankenquote ?? defaults.krankenquote,
    daten_quelle: (hrFehltage || hrKosten || hrKrankenquote) ? "eigene" as const : "branche" as const,
    branche: orgData?.branche ?? null,
  }

  return NextResponse.json({
    zeitraum: tage,
    mitglieder: {
      total: totalMembers,
      aktiv: activeMembers,
      eingeladen: eingeladene,
      ist_analyse_quote: totalMembers > 0
        ? Math.round((analyseAbgeschlossen / totalMembers) * 100) : 0,
    },
    gesundheit: {
      avg_schmerz: displaySchmerz,
      avg_stress: displayStress,
      avg_schlaf: displaySchlaf,
      avg_risiko_score: avgRisiko,
      baseline_schmerz: baselineSchmerz,
      baseline_stress: baselineStress,
      baseline_schlaf: baselineSchlaf,
      trend_schmerz: trendSchmerz,
      trend_stress: trendStress,
      trend_schlaf: trendSchlaf,
      checkin_count: currentCheckins.length,
      top_beschwerden: topBeschwerden,
    },
    pausen_fit: {
      ...pausenFitStats,
      prev_teilnahmequote: prevPausenFit.teilnahmequote,
      trend_teilnahme: pausenFitStats.teilnahmequote > prevPausenFit.teilnahmequote + 3 ? "up"
        : pausenFitStats.teilnahmequote < prevPausenFit.teilnahmequote - 3 ? "down" : "stable",
    },
    feedback: {
      avg_sterne: avgFeedback,
      anzahl_bewertungen: feedbackEntries.length,
    },
    abteilungen: abteilungsVergleich,
    roi,
  })
}
